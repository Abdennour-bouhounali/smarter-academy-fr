<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Support\MasteryModel;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The one thing LearningEvidenceController talks to. Validates every
 * relationship server-side (the student comes from the Sanctum token, the
 * lesson from its code, and every learning point must belong to THAT lesson
 * — frontend-supplied ids are never trusted), then records the evidence and
 * rolls the per-(student, learning point) mastery forward.
 *
 * Trust boundary (deliberate asymmetry from the diagnostic): lesson question
 * content lives in JSX, so the server CANNOT recompute correctness the way
 * AnswerChecker does for the diagnostic's PHP-owned questions. is_correct is
 * client-reported; what the server owns is the relationship validation and
 * the mastery bookkeeping.
 */
class ProgressEngine
{
    public const SOURCE_ASSESSMENT = 'assessment';

    public const SOURCE_PRACTICE = 'practice_exercise';

    /**
     * Les seules sources autorisées à faire bouger la maîtrise. Toute autre
     * valeur — en particulier 'discovery' et 'practice', les questions de
     * module — est refusée en 422.
     */
    public const ALLOWED_ASSESSMENT_TYPES = [self::SOURCE_ASSESSMENT, self::SOURCE_PRACTICE];

    /**
     * Niveau de pratique 1..5 → difficulté 1..4 du modèle de maîtrise. Une
     * seule table de correspondance, à un seul endroit.
     */
    private const LEVEL_TO_DIFFICULTY = [1 => 1, 2 => 2, 3 => 2, 4 => 3, 5 => 4];

    /**
     * Issues qui ne portent aucune information mathématique : ne pas savoir
     * écrire un nombre, ou renoncer, n'est pas se tromper. Elles laissent la
     * confiance — et le compteur de tentatives — intacts.
     */
    private const INERT_OUTCOMES = ['syntax_error', 'abandoned'];

    /**
     * Idempotent by attemptId: a retried submission (dropped connection, the
     * offline queue flushing twice) returns the stored result instead of
     * double-counting evidence.
     *
     * Takes the lesson CODE, not a Lesson row: lesson codes repeat across
     * grades ('resolution-problemes' exists for both 6e and 3e), so the
     * actual lesson is disambiguated through the submitted learning-point
     * codes — globally unique, grade-embedded — and then required to match
     * the code the client claimed. See resolveLesson().
     *
     * @param  array{questionCode: string, attemptId: string, isCorrect: bool, learningPointCodes: string[], assessmentType?: string, answer?: array|null}  $payload
     * @return array{evidence: LearningEvidence, duplicate: bool}
     */
    public function recordEvidence(User $user, string $lessonCode, array $payload): array
    {
        // Seules les sources d'ÉVALUATION produisent de la maîtrise. Les
        // questions de module — 'discovery', 'practice' — n'y arrivent jamais,
        // même si un client mal configuré essaie (défense en profondeur
        // derrière le contrôle de type du frontend).
        //
        // 'practice_exercise' rejoint la liste : le moteur d'exercices est une
        // seconde source d'évaluation légitime, pas une question de module.
        // Le nom compte — 'practice' tout court DOIT rester refusé : c'est le
        // type des questions d'entraînement d'une leçon, et
        // LearningEvidenceFlowTest l'exige explicitement.
        $type = $payload['assessmentType'] ?? self::SOURCE_ASSESSMENT;
        if (! in_array($type, self::ALLOWED_ASSESSMENT_TYPES, true)) {
            throw new DomainException('Seules les questions d\'évaluation génèrent une preuve d\'apprentissage.');
        }

        $existing = LearningEvidence::where('attempt_id', $payload['attemptId'])->first();
        if ($existing) {
            if ($existing->user_id !== $user->id) {
                // Another student's attempt id — treat as invalid rather than
                // leaking that the id exists.
                throw new DomainException('Tentative invalide.');
            }

            return ['evidence' => $existing, 'duplicate' => true];
        }

        // Deux écritures acceptées : la liste plate de codes (le test final et
        // ses 132 leçons, inchangés) et la liste de références portant un rôle
        // (le moteur de pratique). Normalisées ici en une seule carte
        // code → rôle, pour que resolveLesson() n'ait pas à changer — quatre
        // cas de test en dépendent.
        $roles = $this->normalizeLearningPointRoles($payload);
        [$lesson, $points] = $this->resolveLesson($lessonCode, array_keys($roles));

        $context = [
            'difficulty' => isset($payload['level'])
                ? (self::LEVEL_TO_DIFFICULTY[$payload['level']] ?? MasteryModel::DEFAULT_DIFFICULTY)
                : MasteryModel::DEFAULT_DIFFICULTY,
            'hintsUsed' => (int) ($payload['hintsUsed'] ?? 0),
            'source' => $type,
            'outcome' => $payload['outcome'] ?? null,
        ];

        $evidence = DB::transaction(function () use ($user, $lesson, $payload, $points, $type, $roles, $context) {
            $evidence = LearningEvidence::create([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'question_code' => $payload['questionCode'],
                'attempt_id' => $payload['attemptId'],
                'is_correct' => $payload['isCorrect'],
                'assessment_type' => $type,
                'answer' => $payload['answer'] ?? null,
                'submitted_at' => now(),
                // Contexte de pratique. Tout reste à sa valeur d'origine pour
                // le test final, qui n'en fournit aucun.
                'outcome' => $payload['outcome'] ?? null,
                'level' => $payload['level'] ?? null,
                'hints_used' => (int) ($payload['hintsUsed'] ?? 0),
                'misconception_id' => $payload['misconceptionId'] ?? null,
                'source_id' => $payload['sourceId'] ?? null,
            ]);

            $evidence->learningPoints()->attach(
                $points->mapWithKeys(fn ($point) => [
                    $point->id => ['role' => $roles[$point->code] ?? 'primary'],
                ])->all()
            );

            foreach ($points as $point) {
                $this->updateProgress($user, $point->id, $payload['isCorrect'], [
                    ...$context,
                    'role' => $roles[$point->code] ?? 'primary',
                ]);
            }

            return $evidence;
        });

        return ['evidence' => $evidence, 'duplicate' => false];
    }

    /**
     * `learningPointCodes: string[]` (test final) ou
     * `learningPointRefs: [{code, role}]` (pratique) → une carte code → rôle.
     * Un code sans rôle déclaré est principal, ce qui laisse le comportement
     * historique intact.
     *
     * @return array<string, string>
     */
    private function normalizeLearningPointRoles(array $payload): array
    {
        $roles = [];

        foreach ($payload['learningPointCodes'] ?? [] as $code) {
            $roles[$code] = 'primary';
        }

        foreach ($payload['learningPointRefs'] ?? [] as $ref) {
            $code = is_array($ref) ? ($ref['code'] ?? null) : null;
            if ($code !== null) {
                $roles[$code] = ($ref['role'] ?? 'primary') === 'secondary' ? 'secondary' : 'primary';
            }
        }

        return $roles;
    }

    /**
     * Resolves the learning points GLOBALLY by their (unique) codes, then
     * derives the lesson from them: all points must belong to one single
     * lesson, and that lesson's code must be the one the client claimed. A
     * nonexistent, retired, or cross-lesson code rejects the whole
     * submission, listing the offending codes.
     *
     * @param  string[]  $codes
     * @return array{0: Lesson, 1: Collection<int, LearningPoint>}
     */
    private function resolveLesson(string $lessonCode, array $codes): array
    {
        if ($codes === []) {
            throw new DomainException('Au moins un point d\'apprentissage est requis.');
        }

        $points = LearningPoint::whereNull('retired_at')
            ->whereIn('code', $codes)
            ->with('lesson')
            ->get();

        $missing = array_values(array_diff($codes, $points->pluck('code')->all()));
        if ($missing !== []) {
            throw new DomainException(
                'Points d\'apprentissage invalides : '.implode(', ', $missing)
            );
        }

        $lessons = $points->pluck('lesson')->unique('id');
        if ($lessons->count() !== 1) {
            throw new DomainException('Les points d\'apprentissage doivent appartenir à une seule leçon.');
        }

        /** @var Lesson $lesson */
        $lesson = $lessons->first();
        if ($lesson->code !== $lessonCode) {
            throw new DomainException(
                'Points d\'apprentissage invalides pour cette leçon : '.implode(', ', $codes)
            );
        }

        return [$lesson, $points];
    }

    /**
     * @param  array{difficulty?: int, hintsUsed?: int, source?: string, role?: string, outcome?: ?string}  $context
     *                                                                                                                Vide pour le test final : chaque valeur retombe alors sur son défaut,
     *                                                                                                                et l'arithmétique est identique à celle d'avant le moteur de pratique.
     */
    private function updateProgress(User $user, int $learningPointId, bool $isCorrect, array $context = []): void
    {
        // Une saisie illisible ou un abandon ne disent rien des mathématiques :
        // ni tentative comptée, ni confiance déplacée. La preuve, elle, est
        // bien enregistrée — l'historique garde la trace de ce qui s'est passé.
        if (in_array($context['outcome'] ?? null, self::INERT_OUTCOMES, true)) {
            return;
        }

        $progress = StudentLearningPointProgress::firstOrNew([
            'user_id' => $user->id,
            'learning_point_id' => $learningPointId,
        ]);

        $currentConfidence = $progress->exists
            ? (float) $progress->confidence
            : MasteryModel::STARTING_CONFIDENCE;

        $newConfidence = MasteryModel::updateConfidence(
            $currentConfidence,
            $isCorrect,
            $context['difficulty'] ?? MasteryModel::DEFAULT_DIFFICULTY,
            $context['hintsUsed'] ?? 0,
            $context['source'] ?? MasteryModel::SOURCE_ASSESSMENT,
            $context['role'] ?? 'primary',
            $context['outcome'] ?? null,
        );

        $progress->fill([
            'confidence' => $newConfidence,
            'status' => MasteryModel::statusFor($newConfidence),
            'attempts' => ($progress->attempts ?? 0) + 1,
            'correct_count' => ($progress->correct_count ?? 0) + ($isCorrect ? 1 : 0),
            'last_evidence_at' => now(),
        ])->save();
    }
}
