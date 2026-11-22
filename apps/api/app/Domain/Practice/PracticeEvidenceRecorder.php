<?php

namespace App\Domain\Practice;

use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\ProgressEngine;
use App\Domain\Settings\StudentSettingsService;
use App\Models\AnswerReview;
use App\Models\PracticeSession;
use App\Models\QuestionAttempt;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Le seul endroit où la pratique touche à la maîtrise.
 *
 * Il n'écrit jamais student_learning_point_progress lui-même : il appelle
 * ProgressEngine, comme le test final. C'est ce qui fait converger les deux
 * sources sur une seule évaluation — non par discipline, mais parce qu'il n'y
 * a pas d'autre porte.
 *
 * Frontière de confiance (Mastery V2, phase 4) : l'issue est calculée par le
 * SERVEUR (AnswerEvaluator, port exact de packages/core/practice) à partir de
 * la réponse brute et du contenu. Ce que le client déclare n'est qu'une
 * prévision pour son affichage ; un désaccord est journalisé et la vérité
 * est celle du serveur. Le repli `mastery.server_evaluation=false` reprend
 * l'issue du client en le disant (`evaluated_by = client`).
 *
 * Deux enregistrements, deux concepts : question_attempts est le journal de
 * la SÉANCE ; learning_evidence est la preuve IMMUABLE de maîtrise. Ils
 * partagent attempt_uuid pour que l'idempotence soit la même des deux côtés.
 */
class PracticeEvidenceRecorder
{
    public function __construct(
        private ProgressEngine $progress,
        private ExerciseRepository $exercises,
        private AnswerEvaluator $evaluator,
        private StudentSettingsService $settings,
    ) {}

    /** L'issue en attente d'une réponse que l'enseignant doit juger (« تصحيح الأستاذ »). */
    public const REVIEW_PENDING = 'review:pending';

    /** Qui a jugé : l'élève lui-même (auto-évaluation) ou l'enseignant. */
    public const EVALUATED_BY_SELF = 'self';

    public const EVALUATED_BY_TEACHER = 'teacher';

    /**
     * @param  array{outcome?: ?string, answer?: array|null, normalizedAnswer?: ?string, misconceptionId?: ?string}  $payload
     * @return array{attempt: QuestionAttempt, duplicate: bool, recorded: bool, evaluation: array<string, mixed>}
     */
    public function record(
        User $user,
        PracticeSession $session,
        QuestionAttempt $attempt,
        string $exerciseId,
        array $payload,
    ): array {
        if ($attempt->user_id !== $user->id) {
            throw new DomainException('Tentative invalide.');
        }

        $lessonCode = $session->lesson->code;
        $question = $this->exercises->findQuestion($lessonCode, $exerciseId, $attempt->question_id);
        if ($question === null) {
            throw new DomainException('Question inconnue.');
        }

        // La tentative a déjà sa réponse. Deux cas, et ils ne se confondent pas :
        //
        //  - le MÊME envoi rejoué (connexion coupée, double appui) : idempotent,
        //    on renvoie le verdict enregistré ;
        //  - « أعِد المحاولة » : une AUTRE réponse sur la même tentative. Elle
        //    est JUGÉE — l'élève doit lire le verdict de ce qu'il vient de
        //    répondre — mais rien n'est enregistré : la preuve de maîtrise ne
        //    retient que la première issue (EXERCISE_CONTRACT.md § 0).
        //
        // Renvoyer le verdict enregistré pour une réponse différente faisait
        // refuser la bonne réponse après une première erreur : aucun choix
        // n'était plus jamais accepté (constaté le 2026-09-24 sur
        // qasim-adad-tabii l3-001 q2).
        // Une démonstration écrite (« بيّن أن ») ou des « مراحل الحساب » restent
        // un texte d'élève, pas un livre.
        foreach (['text', 'work'] as $key) {
            $value = $payload['answer'][$key] ?? null;
            if ($value !== null && (! is_string($value) || mb_strlen($value) > 5000)) {
                throw new DomainException('Texte trop long (5000 caractères au plus).');
            }
        }

        // Le second temps d'une auto-évaluation : une « بيّن أن », ou une étape
        // répondue en PHOTO seulement (`imageOnly`, rien d'évaluable à la machine).
        $storedAnswer = is_array($attempt->submitted_answer) ? $attempt->submitted_answer : [];
        if ($attempt->submitted_at !== null && (($question['answerType'] ?? null) === 'selfCheck' || ($storedAnswer['imageOnly'] ?? false) === true)) {
            return $this->recordSelfMark($user, $attempt, $session, $question, $payload);
        }

        if ($attempt->submitted_at !== null) {
            $sameAnswer = ($payload['answer'] ?? null) == $attempt->submitted_answer;
            $evaluation = $sameAnswer || ! array_key_exists('answer', $payload)
                ? [
                    'outcome' => $attempt->outcome,
                    'misconceptionId' => $attempt->misconception_id,
                    'normalized' => $attempt->normalized_answer,
                    'isCorrect' => in_array($attempt->outcome, Outcome::successValues(), true),
                    'feedbackKey' => null,
                ]
                : $this->evaluator->evaluate($payload['answer'], $question);

            return ['attempt' => $attempt, 'duplicate' => true, 'recorded' => false, 'evaluation' => $evaluation];
        }

        // Les learning points viennent du CONTENU (et du registre, dans
        // ProgressEngine), jamais du corps de la requête : un client ne
        // choisit pas quelles compétences il crédite.
        $refs = array_values(array_map(
            fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
            $question['learningPoints'] ?? [],
        ));
        if ($refs === []) {
            throw new DomainException('Cette question ne déclare aucun point d\'apprentissage.');
        }

        // RÉPONSES EN PHOTO et CORRECTION PAR L'ENSEIGNANT (2026-10-06). Les
        // photos jointes sont lues en BASE, jamais dans la requête : la liste
        // enregistrée avec la réponse est celle du serveur.
        $payload['answer'] = $this->withServerImages($payload['answer'] ?? null, $attempt);
        $route = $this->route($user, $session, $exerciseId, $question, $payload['answer']);
        if ($route['imageOnly']) {
            $payload['answer']['imageOnly'] = true;
        }

        if ($route['pending'] !== null) {
            return $this->recordPending($attempt, $session, $payload['answer'], $route);
        }

        [$evaluation, $evaluatedBy, $clientOutcome] = $this->evaluate($payload, $question, $attempt);
        $outcome = Outcome::fromString($evaluation['outcome']);

        DB::transaction(function () use ($attempt, $payload, $outcome, $evaluation, $evaluatedBy, $clientOutcome, $user, $lessonCode, $refs, $session, $exerciseId, $question, $route) {
            // Réponse saisie jugée par le serveur, MAIS l'élève est en « تصحيح
            // الأستاذ » et l'étape a des photos ou une rédaction exigée :
            // l'enseignant y portera un avis (sans changer l'issue).
            if ($route['feedback']) {
                AnswerReview::firstOrCreate(
                    ['question_attempt_id' => $attempt->id],
                    ['student_id' => $user->id, 'kind' => AnswerReview::KIND_FEEDBACK, 'status' => AnswerReview::PENDING],
                );
            }
            $attempt->update([
                'submitted_answer' => $payload['answer'] ?? null,
                'normalized_answer' => $evaluation['normalized'] !== '' ? $evaluation['normalized'] : ($payload['normalizedAnswer'] ?? null),
                'outcome' => $outcome->value,
                'evaluated_by' => $evaluatedBy,
                'client_outcome' => $clientOutcome !== null && $clientOutcome !== $outcome->value ? $clientOutcome : null,
                'misconception_id' => $evaluation['misconceptionId'] ?? ($payload['misconceptionId'] ?? null),
                'submitted_at' => now(),
            ]);

            // Une étape auto-évaluée (`selfCheck`) ou déclarée `counted: false`
            // (étape d'un exercice de BEM qui relève d'une autre leçon) est
            // jugée et enregistrée comme tentative, mais n'est JAMAIS une
            // preuve de maîtrise : l'élève s'y note lui-même, ou elle exerce
            // une compétence que cette leçon n'enseigne pas.
            if (AnswerEvaluator::countsForMastery($question)) {
                $this->progress->recordEvidence($user, $lessonCode, [
                    'questionCode' => "{$exerciseId}:{$attempt->question_id}",
                    'exerciseCode' => $exerciseId,
                    'questionId' => $attempt->question_id,
                    // La même clé d'idempotence des deux côtés : une preuve et sa
                    // tentative ne peuvent pas diverger sur un rejeu.
                    'attemptId' => $attempt->attempt_uuid,
                    'outcome' => $outcome->value,
                    'learningPointRefs' => $refs,
                    'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
                    'level' => $session->level,
                    'difficulty' => isset($question['difficulty']) ? (int) $question['difficulty'] : (int) $session->level,
                    'templateKey' => $question['templateId'] ?? null,
                    'hintsUsed' => $attempt->hints_used,
                    'evaluatedBy' => $evaluatedBy,
                    'misconceptionId' => $evaluation['misconceptionId'] ?? ($payload['misconceptionId'] ?? null),
                    'sourceId' => $session->session_id,
                    'answer' => $payload['answer'] ?? null,
                ]);
            }

            $session->increment('questions_answered');
            if ($outcome->isSuccess()) {
                $session->increment('correct_count');
            }
        });

        return ['attempt' => $attempt->fresh(), 'duplicate' => false, 'recorded' => true, 'evaluation' => $evaluation];
    }

    /**
     * Auto-évaluation, second temps — une « بيّن أن » ou une réponse en photo
     * seulement : la copie est déjà enregistrée (issue `abandoned` en attente) ;
     * l'élève, corrigé type sous les yeux, se note. Le texte est VERROUILLÉ : un
     * envoi dont le texte diffère est refusé. Une seule note est retenue ; un
     * rejeu renvoie le verdict enregistré. Aucune preuve de maîtrise, aucune
     * médaille (`evaluated_by = self`).
     *
     * Une copie qui attend l'ENSEIGNANT (`review:pending`) ne se note pas —
     * sauf si l'élève est redevenu autonome (il a quitté la classe, ou
     * l'enseignant l'a repassé en « مستقل ») : la demande est alors retirée.
     *
     * @param  array<string, mixed>  $question
     * @param  array<string, mixed>  $payload
     * @return array{attempt: QuestionAttempt, duplicate: bool, recorded: bool, evaluation: array<string, mixed>}
     */
    private function recordSelfMark(User $user, QuestionAttempt $attempt, PracticeSession $session, array $question, array $payload): array
    {
        $stored = is_array($attempt->submitted_answer) ? $attempt->submitted_answer : [];
        $answer = is_array($payload['answer'] ?? null) ? $payload['answer'] : [];
        if (($answer['text'] ?? null) !== ($stored['text'] ?? null)) {
            throw new DomainException('La démonstration enregistrée ne se modifie plus.');
        }

        $awaitingTeacher = $attempt->normalized_answer === self::REVIEW_PENDING;
        $pending = ! array_key_exists('selfMark', $stored)
            && ($awaitingTeacher || $attempt->normalized_answer === 'self:pending');
        if (! $pending || ! array_key_exists('selfMark', $answer)) {
            return ['attempt' => $attempt, 'duplicate' => true, 'recorded' => false, 'evaluation' => $this->storedEvaluation($attempt)];
        }
        if ($awaitingTeacher && $this->settings->practiceValidation($user) === StudentSettingsService::VALIDATION_TEACHER) {
            throw new DomainException('review_pending');
        }

        // La copie enregistrée reste celle du serveur (photos, temps, rédaction) ;
        // seule la note de l'élève s'y ajoute.
        $marked = $stored + ['selfMark' => null];
        $marked['selfMark'] = $answer['selfMark'];
        $evaluation = $this->evaluator->evaluate($marked, ['answerType' => 'selfCheck'] + $question);
        $outcome = Outcome::fromString($evaluation['outcome']);
        DB::transaction(function () use ($attempt, $marked, $evaluation, $outcome, $session, $awaitingTeacher) {
            if ($awaitingTeacher) {
                AnswerReview::where('question_attempt_id', $attempt->id)->where('status', AnswerReview::PENDING)
                    ->update(['status' => AnswerReview::WITHDRAWN]);
            }
            $attempt->update([
                'submitted_answer' => $marked,
                'normalized_answer' => $evaluation['normalized'],
                'outcome' => $outcome->value,
                'evaluated_by' => self::EVALUATED_BY_SELF,
            ]);
            if ($outcome->isSuccess()) {
                $session->increment('correct_count');
            }
        });

        return ['attempt' => $attempt->fresh(), 'duplicate' => false, 'recorded' => true, 'evaluation' => $evaluation];
    }

    /**
     * La décision de l'ENSEIGNANT sur une copie en attente (`review:pending`,
     * AnswerReviewService::decide) : elle devient l'issue de la tentative,
     * et une PREUVE de maîtrise `evaluated_by = teacher` — même pour une
     * « بيّن أن » (décision du propriétaire, 2026-10-06), jamais pour une étape
     * `counted: false`. La médaille se déduit ensuite des faits enregistrés
     * (Medals), temps réellement passé compris. Appelé dans la transaction
     * de la correction.
     */
    public function recordTeacherVerdict(QuestionAttempt $attempt, string $verdict): void
    {
        if ($attempt->normalized_answer !== self::REVIEW_PENDING) {
            throw new DomainException('Cette réponse n\'attend pas de correction.');
        }
        $exerciseAttempt = $attempt->exerciseAttempt;
        $session = $exerciseAttempt->practiceSession;
        $lessonCode = $session->lesson->code;
        $exerciseId = $exerciseAttempt->exercise_id;
        $question = $this->exercises->findQuestion($lessonCode, $exerciseId, $attempt->question_id);
        if ($question === null) {
            throw new DomainException('Question inconnue.');
        }

        $outcome = $verdict === 'correct' ? Outcome::fromString(AnswerEvaluator::CORRECT) : Outcome::fromString(AnswerEvaluator::INCORRECT);
        $attempt->update([
            'outcome' => $outcome->value,
            'normalized_answer' => "teacher:{$verdict}",
            'evaluated_by' => self::EVALUATED_BY_TEACHER,
        ]);
        if ($outcome->isSuccess()) {
            $session->increment('correct_count');
        }

        $refs = array_values(array_map(
            fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
            $question['learningPoints'] ?? [],
        ));
        if (($question['counted'] ?? true) === false || $refs === []) {
            return;
        }
        $this->progress->recordEvidence($attempt->user, $lessonCode, [
            'questionCode' => "{$exerciseId}:{$attempt->question_id}",
            'exerciseCode' => $exerciseId,
            'questionId' => $attempt->question_id,
            'attemptId' => $attempt->attempt_uuid,
            'outcome' => $outcome->value,
            'learningPointRefs' => $refs,
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'level' => $session->level,
            'difficulty' => isset($question['difficulty']) ? (int) $question['difficulty'] : (int) $session->level,
            'templateKey' => $question['templateId'] ?? null,
            'hintsUsed' => $attempt->hints_used,
            'evaluatedBy' => EvidenceEvent::EVALUATED_BY_TEACHER,
            'sourceId' => $session->session_id,
            'answer' => $attempt->submitted_answer,
        ]);
    }

    /** Le verdict déjà enregistré, rendu tel quel (rejeu). */
    private function storedEvaluation(QuestionAttempt $attempt): array
    {
        return [
            'outcome' => $attempt->outcome,
            'misconceptionId' => $attempt->misconception_id,
            'normalized' => $attempt->normalized_answer,
            'isCorrect' => in_array($attempt->outcome, Outcome::successValues(), true),
            'feedbackKey' => null,
        ];
    }

    /**
     * La réponse envoyée, avec la liste des photos LUE EN BASE (une liste
     * envoyée par le client est ignorée). `imageOnly` est aussi une clé du
     * serveur : retirée de la requête, recalculée par route().
     */
    private function withServerImages(mixed $answer, QuestionAttempt $attempt): mixed
    {
        $images = $attempt->images()->pluck('uuid')->all();
        if (! is_array($answer)) {
            return $images === [] ? $answer : ['images' => $images];
        }
        unset($answer['images'], $answer['imageOnly']);
        if ($images !== []) {
            $answer['images'] = $images;
        }

        return $answer;
    }

    /**
     * Où va une première réponse d'étape d'examen :
     *
     *  - `imageOnly` : des photos, et rien d'évaluable à la machine (champ vide
     *    ou illisible ; démonstration sans texte) ;
     *  - `pending = review` : « تصحيح الأستاذ » ET (démonstration OU photo
     *    seulement) — la décision de l'enseignant SERA l'issue ;
     *  - `pending = self` : autonome, photo seulement — l'élève se note
     *    (comme une « بيّن أن ») ;
     *  - `feedback` : « تصحيح الأستاذ », réponse saisie jugée par le serveur,
     *    mais l'étape a des photos ou une rédaction exigée — l'enseignant y
     *    portera un avis.
     *
     * @return array{imageOnly: bool, pending: ?string, feedback: bool}
     */
    private function route(User $user, PracticeSession $session, string $exerciseId, array $question, mixed $answer): array
    {
        $none = ['imageOnly' => false, 'pending' => null, 'feedback' => false];
        $exam = ($this->exercises->find($session->lesson->code, $exerciseId)['metadata']['exam'] ?? null) !== null;
        if (! $exam) {
            return $none;
        }

        $hasImages = is_array($answer) && ! empty($answer['images']);
        $selfCheck = ($question['answerType'] ?? null) === 'selfCheck';
        $imageOnly = $hasImages && ($selfCheck
            ? trim((string) ($answer['text'] ?? '')) === ''
            : (self::nothingPicked($answer, $question)
                || $this->evaluator->evaluate($answer, $question)['outcome'] === AnswerEvaluator::SYNTAX_ERROR));

        $teacher = $this->settings->practiceValidation($user) === StudentSettingsService::VALIDATION_TEACHER;
        if ($teacher && ($selfCheck || $imageOnly)) {
            return ['imageOnly' => $imageOnly, 'pending' => 'review', 'feedback' => false];
        }
        if ($imageOnly) {
            return ['imageOnly' => true, 'pending' => 'self', 'feedback' => false];
        }
        $feedback = $teacher && ($hasImages || ($question['work'] ?? null) === 'required');

        return ['imageOnly' => false, 'pending' => null, 'feedback' => $feedback];
    }

    /**
     * Une étape à choix (« هل … ؟ برّر » → نعم / لا) sans AUCUNE case cochée : l'évaluateur
     * la dit fausse, mais pour une copie en photo c'est « rien d'évaluable à la machine »,
     * comme un champ numérique vide (déploiement BEM, 2026-10-06 : sinon la photo seule
     * recevait « ليس بعد » et le corrigé type avant l'enseignant).
     */
    private static function nothingPicked(mixed $answer, array $question): bool
    {
        return match ($question['answerType'] ?? null) {
            'choice' => ($answer['choiceId'] ?? null) === null || $answer['choiceId'] === '',
            'multiChoice' => empty($answer['choiceIds'] ?? null),
            default => false,
        };
    }

    /**
     * Enregistre une copie EN ATTENTE — de l'enseignant (`review:pending`, une
     * demande de correction est créée) ou de la note de l'élève
     * (`self:pending`). Issue `abandoned` : ni preuve de maîtrise, ni médaille,
     * tant que personne n'a jugé.
     *
     * @return array{attempt: QuestionAttempt, duplicate: bool, recorded: bool, evaluation: array<string, mixed>}
     */
    private function recordPending(QuestionAttempt $attempt, PracticeSession $session, mixed $answer, array $route): array
    {
        $normalized = $route['pending'] === 'review' ? self::REVIEW_PENDING : 'self:pending';
        DB::transaction(function () use ($attempt, $session, $answer, $normalized, $route) {
            $attempt->update([
                'submitted_answer' => $answer,
                'normalized_answer' => $normalized,
                'outcome' => AnswerEvaluator::ABANDONED,
                'evaluated_by' => null,
                'submitted_at' => now(),
            ]);
            if ($route['pending'] === 'review') {
                AnswerReview::firstOrCreate(
                    ['question_attempt_id' => $attempt->id],
                    ['student_id' => $attempt->user_id, 'kind' => AnswerReview::KIND_VERDICT, 'status' => AnswerReview::PENDING],
                );
            }
            $session->increment('questions_answered');
        });

        return ['attempt' => $attempt->fresh(), 'duplicate' => false, 'recorded' => true, 'evaluation' => [
            'outcome' => AnswerEvaluator::ABANDONED,
            'misconceptionId' => null,
            'normalized' => $normalized,
            'isCorrect' => false,
            'feedbackKey' => 'pending',
        ]];
    }

    /**
     * L'issue : celle du serveur quand il peut juger, sinon celle du client,
     * dite comme telle. En mode serveur, la déclaration du client est
     * comparée et un désaccord journalisé (période d'observation, §31.4).
     *
     * @return array{0: array<string, mixed>, 1: string, 2: ?string} [évaluation, evaluated_by, issue déclarée par le client]
     */
    private function evaluate(array $payload, array $question, QuestionAttempt $attempt): array
    {
        $clientOutcome = isset($payload['outcome']) && $payload['outcome'] !== '' ? (string) $payload['outcome'] : null;
        if ($clientOutcome !== null && Outcome::tryFrom($clientOutcome) === null) {
            throw new DomainException('Issue de réponse inconnue.');
        }

        $serverMode = (bool) config('mastery.server_evaluation', true);
        $answer = array_key_exists('answer', $payload) ? $payload['answer'] : null;

        if ($serverMode) {
            $evaluation = $this->evaluator->evaluate($answer, $question);
            if ($clientOutcome !== null && $clientOutcome !== $evaluation['outcome']) {
                Log::channel(config('mastery.log_channel', 'mastery'))->warning('evidence.disagreement', [
                    'attempt_uuid' => $attempt->attempt_uuid,
                    'question_id' => $attempt->question_id,
                    'client' => $clientOutcome,
                    'server' => $evaluation['outcome'],
                ]);
            }

            return [$evaluation, EvidenceEvent::EVALUATED_BY_SERVER, $clientOutcome];
        }

        if ($clientOutcome === null) {
            throw new DomainException('Issue de réponse requise.');
        }

        return [[
            'outcome' => $clientOutcome,
            'misconceptionId' => $payload['misconceptionId'] ?? null,
            'normalized' => (string) ($payload['normalizedAnswer'] ?? ''),
            'isCorrect' => in_array($clientOutcome, Outcome::successValues(), true),
            'feedbackKey' => null,
        ], EvidenceEvent::EVALUATED_BY_CLIENT, $clientOutcome];
    }
}
