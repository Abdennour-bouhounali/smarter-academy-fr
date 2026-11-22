<?php

namespace App\Domain\Progress;

use App\Domain\Content\AssessmentItemRepository;
use App\Domain\Progress\Engine\EngineContext;
use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Replay\ReplayService;
use App\Models\AssessmentItem;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\LearningPointStateTransition;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * LA porte par laquelle une preuve entre et la maîtrise avance. Il n'y en a
 * pas d'autre : le test final (LearningEvidenceController), la pratique
 * (PracticeEvidenceRecorder) et le jeu de démonstration passent tous ici.
 *
 * Ce que le serveur possède et vérifie :
 *   - l'élève : le jeton, jamais un champ du corps ;
 *   - la leçon : par son code, et par les learning points qui doivent TOUS
 *     lui appartenir ;
 *   - les learning points et leurs rôles : le REGISTRE (assessment_items)
 *     quand l'item y est ; les codes fournis par l'appelant ne servent que
 *     pour un item que le registre ne connaît pas encore (transition), et un
 *     désaccord est journalisé ;
 *   - la difficulté, le gabarit : le registre, sinon le contenu (niveau) ;
 *   - le numéro de tentative et la NATURE de la démonstration
 *     (EvidenceClassifier) ;
 *   - la mise à jour de l'état, par le moteur de la version courante.
 *
 * Ce que le serveur NE recalcule pas ici : l'issue. Elle est décidée en amont
 * par l'évaluateur serveur (pratique, test final avec clé) et arrive déjà
 * canonique ; `evaluated_by` dit qui l'a décidée.
 *
 * Idempotent par attempt_id. Une preuve inerte (syntax_error, abandoned) est
 * enregistrée mais ne touche pas l'état.
 */
class ProgressEngine
{
    public const SOURCE_ASSESSMENT = EvidenceEvent::SOURCE_ASSESSMENT;

    public const SOURCE_PRACTICE = EvidenceEvent::SOURCE_PRACTICE;

    /**
     * Les seules sources autorisées à faire bouger la maîtrise. Toute autre
     * valeur — en particulier 'discovery' et 'practice', les questions de
     * module — est refusée en 422.
     */
    public const ALLOWED_ASSESSMENT_TYPES = [self::SOURCE_ASSESSMENT, self::SOURCE_PRACTICE];

    public function __construct(
        private EngineRegistry $engines,
        private EvidenceClassifier $classifier,
        private AssessmentItemRepository $items,
        private ReplayService $replay,
    ) {}

    /**
     * @param  array{
     *     attemptId: string,
     *     questionCode?: string, exerciseCode?: ?string, questionId?: string,
     *     assessmentType?: string,
     *     outcome?: string, isCorrect?: bool,
     *     learningPointCodes?: string[], learningPointRefs?: array<int, array{code: string, role?: string}>,
     *     answer?: array|null, level?: ?int, hintsUsed?: int, misconceptionId?: ?string, sourceId?: ?string,
     *     difficulty?: ?int, templateKey?: ?string, evaluatedBy?: string, submittedAt?: string|Carbon|null
     * }  $payload
     * @return array{evidence: LearningEvidence, duplicate: bool, outcome: Outcome}
     */
    public function recordEvidence(User $user, string $lessonCode, array $payload): array
    {
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

            return [
                'evidence' => $existing,
                'duplicate' => true,
                'outcome' => Outcome::fromLegacy($existing->outcome, (bool) $existing->is_correct),
            ];
        }

        // ── Identité de l'item ───────────────────────────────────────────
        $identity = $this->identity($type, $lessonCode, $payload);
        $item = $this->items->findByKey($identity['itemKey']);

        // ── Learning points et rôles : le registre d'abord ───────────────
        $declared = $this->normalizeLearningPointRoles($payload);
        if ($item !== null) {
            $roles = $item->roles();
            if ($declared !== [] && $this->rolesDiffer($declared, $roles)) {
                Log::channel(config('mastery.log_channel', 'mastery'))->warning('evidence.lp_disagreement', [
                    'item_key' => $identity['itemKey'], 'declared' => $declared, 'registry' => $roles, 'user_id' => $user->id,
                ]);
            }
        } else {
            $roles = $declared;
        }
        [$lesson, $points] = $this->resolveLesson($lessonCode, array_keys($roles));

        // ── Issue canonique ──────────────────────────────────────────────
        $outcome = $this->outcomeOf($payload);

        // ── Contexte résolu côté serveur ─────────────────────────────────
        $level = isset($payload['level']) ? (int) $payload['level'] : null;
        $difficulty = $item?->difficulty
            ?? (isset($payload['difficulty']) ? (int) $payload['difficulty'] : null)
            ?? $level;
        $templateKey = $item?->template_key ?? ($payload['templateKey'] ?? null);
        $evaluatedBy = $payload['evaluatedBy'] ?? EvidenceEvent::EVALUATED_BY_CLIENT;
        $submittedAt = isset($payload['submittedAt']) ? Carbon::parse($payload['submittedAt']) : now();

        $facts = $this->classifier->factsFromDatabase($user->id, $identity['itemKey'], $templateKey);
        $classification = EvidenceClassifier::classifyFrom($facts);

        // Une mesure, pas une sanction : le poids de `repeat_after_success`
        // est déjà la réponse du moteur. On veut seulement le VOIR.
        if ($classification['attemptNumber'] > (int) config('mastery.suspicious_repetition_per_hour', 10)
            && LearningEvidence::where('user_id', $user->id)->where('item_key', $identity['itemKey'])
                ->where('submitted_at', '>=', now()->subHour())->count() >= (int) config('mastery.suspicious_repetition_per_hour', 10)) {
            Log::channel(config('mastery.log_channel', 'mastery'))->info('evidence.suspicious_repetition', [
                'user_id' => $user->id, 'item_key' => $identity['itemKey'], 'attempt_number' => $classification['attemptNumber'],
            ]);
        }

        $evidence = DB::transaction(function () use (
            $user, $lesson, $payload, $points, $type, $roles, $outcome, $identity,
            $level, $difficulty, $templateKey, $evaluatedBy, $submittedAt, $facts, $classification,
        ) {
            $evidence = LearningEvidence::create([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'question_code' => $identity['questionCode'],
                'item_key' => $identity['itemKey'],
                'template_key' => $templateKey,
                'attempt_id' => $payload['attemptId'],
                'is_correct' => $outcome->isSuccess(),
                'outcome' => $outcome->value,
                'assessment_type' => $type,
                'answer' => $payload['answer'] ?? null,
                'submitted_at' => $submittedAt,
                'level' => $level,
                'difficulty' => $difficulty,
                'hints_used' => (int) ($payload['hintsUsed'] ?? 0),
                'attempt_number' => $classification['attemptNumber'],
                'demonstration_kind' => $classification['demonstrationKind'],
                'evaluated_by' => $evaluatedBy,
                'misconception_id' => $payload['misconceptionId'] ?? null,
                'source_id' => $payload['sourceId'] ?? null,
            ]);

            $evidence->learningPoints()->attach(
                $points->mapWithKeys(fn ($point) => [
                    $point->id => ['role' => $roles[$point->code] ?? EvidenceEvent::ROLE_PRIMARY],
                ])->all()
            );

            // Une saisie illisible ou un abandon ne disent rien des
            // mathématiques : la preuve est gardée, l'état ne bouge pas.
            if ($outcome->isInert()) {
                return $evidence;
            }

            foreach ($points as $point) {
                $event = new EvidenceEvent(
                    outcome: $outcome,
                    isCorrect: $outcome->isSuccess(),
                    source: $type,
                    role: $roles[$point->code] ?? EvidenceEvent::ROLE_PRIMARY,
                    difficulty: $difficulty,
                    level: $level,
                    hintsUsed: (int) ($payload['hintsUsed'] ?? 0),
                    demonstrationKind: $classification['demonstrationKind'],
                    evaluatedBy: $evaluatedBy,
                    priorNonInertOnItem: $facts->nonInertOnItem > 0,
                    priorSuccessOnItem: $facts->successOnItem,
                    priorSuccessOnTemplate: $facts->successOnTemplate,
                    submittedAt: $submittedAt->toIso8601String(),
                );
                $this->advance($user, $point, $event, $evidence->id);
            }

            return $evidence;
        });

        return ['evidence' => $evidence, 'duplicate' => false, 'outcome' => $outcome];
    }

    /**
     * Fait avancer l'état d'UN couple (élève, point) d'UNE preuve.
     *
     * Si la ligne a été écrite par une autre version du moteur, elle est
     * d'abord REJOUÉE intégralement dans la version courante (la preuve qui
     * vient d'être insérée comprise) : l'état reste, à tout instant, la
     * fonction de la preuve et de la version qu'il déclare.
     *
     * Chaque changement laisse sa ligne d'histoire (TransitionRecorder), dans
     * la même transaction que la preuve : l'état courant et son histoire ne
     * peuvent pas diverger.
     */
    private function advance(User $user, LearningPoint $point, EvidenceEvent $event, int $evidenceId): void
    {
        $engine = $this->engines->current();
        $progress = StudentLearningPointProgress::firstOrNew([
            'user_id' => $user->id,
            'learning_point_id' => $point->id,
        ]);
        $before = $progress->exists ? MasteryState::fromRow($progress) : null;

        if ($progress->exists && (int) $progress->engine_version !== $engine->version()) {
            $next = $this->replay->replay($user->id, $point->id, $engine);
            $progress->fill($next->toColumns() + ['engine_version' => $engine->version(), 'recomputed_at' => now()])->save();
            TransitionRecorder::record($user->id, $point->id, $before, $next, $engine->version(),
                LearningPointStateTransition::ORIGIN_REPLAY, $event->submittedAt, $evidenceId);

            return;
        }

        $state = $before ?? $engine->initialState();
        $context = new EngineContext($this->items->availableItemsForLearningPoint($point->id));
        $next = $engine->apply($state->copy(), $event, $context);

        $progress->fill($next->toColumns() + ['engine_version' => $engine->version()])->save();
        TransitionRecorder::record($user->id, $point->id, $before, $next, $engine->version(),
            LearningPointStateTransition::ORIGIN_LIVE, $event->submittedAt, $evidenceId);
    }

    // ── Résolution ───────────────────────────────────────────────────────────

    /**
     * @return array{sourceKind: string, exerciseCode: ?string, questionId: string, itemKey: string, questionCode: string}
     */
    private function identity(string $type, string $lessonCode, array $payload): array
    {
        if (isset($payload['questionId'])) {
            $sourceKind = EvidenceClassifier::sourceKindOf($type);
            $exerciseCode = $payload['exerciseCode'] ?? null;
            $questionId = (string) $payload['questionId'];

            return [
                'sourceKind' => $sourceKind,
                'exerciseCode' => $exerciseCode,
                'questionId' => $questionId,
                'itemKey' => EvidenceClassifier::itemKey($sourceKind, $lessonCode, $exerciseCode, $questionId),
                'questionCode' => $payload['questionCode'] ?? ($exerciseCode !== null ? "{$exerciseCode}:{$questionId}" : $questionId),
            ];
        }

        if (! isset($payload['questionCode']) || $payload['questionCode'] === '') {
            throw new DomainException('Identifiant de question requis.');
        }

        return EvidenceClassifier::identityFromQuestionCode($type, $lessonCode, (string) $payload['questionCode'])
            + ['questionCode' => (string) $payload['questionCode']];
    }

    private function outcomeOf(array $payload): Outcome
    {
        if (isset($payload['outcome']) && $payload['outcome'] !== '') {
            return Outcome::fromString((string) $payload['outcome']);
        }
        if (array_key_exists('isCorrect', $payload) && $payload['isCorrect'] !== null) {
            return Outcome::fromLegacy(null, (bool) $payload['isCorrect']);
        }

        throw new DomainException('Issue de réponse requise.');
    }

    /**
     * `learningPointCodes: string[]` ou `learningPointRefs: [{code, role}]`
     * → une carte code → rôle. Un code sans rôle déclaré est principal.
     *
     * @return array<string, string>
     */
    private function normalizeLearningPointRoles(array $payload): array
    {
        $roles = [];

        foreach ($payload['learningPointCodes'] ?? [] as $code) {
            $roles[$code] = EvidenceEvent::ROLE_PRIMARY;
        }

        foreach ($payload['learningPointRefs'] ?? [] as $ref) {
            $code = is_array($ref) ? ($ref['code'] ?? null) : null;
            if ($code !== null) {
                $roles[$code] = ($ref['role'] ?? 'primary') === 'secondary' ? EvidenceEvent::ROLE_SECONDARY : EvidenceEvent::ROLE_PRIMARY;
            }
        }

        return $roles;
    }

    private function rolesDiffer(array $a, array $b): bool
    {
        ksort($a);
        ksort($b);

        return $a !== $b;
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

    /** L'item du registre pour une identité, s'il existe — exposé pour les contrôleurs. */
    public function itemFor(string $type, string $lessonCode, string $questionCode): ?AssessmentItem
    {
        $identity = EvidenceClassifier::identityFromQuestionCode($type, $lessonCode, $questionCode);

        return $this->items->findByKey($identity['itemKey']);
    }
}
