<?php

namespace App\Domain\Progress\Replay;

use App\Domain\Content\AssessmentItemRepository;
use App\Domain\Progress\Engine\EngineContext;
use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Engine\MasteryEngine;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\EvidenceClassifier;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\PriorFacts;
use App\Domain\Progress\TransitionRecorder;
use App\Models\LearningEvidence;
use App\Models\LearningPointStateTransition;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\LazyCollection;

/**
 * Rejoue la preuve immuable et reconstruit l'état canonique.
 *
 *   preuve ordonnée → classification (en mémoire) → moteur vN → état
 *
 * Même preuve + même version ⇒ même état : c'est l'invariant que
 * ReplayTest verrouille, et ce qui rend une politique CHANGEABLE — on ajoute
 * une version, on rejoue, on compare, on bascule ou on revient.
 *
 * L'unité de rejeu est le couple (élève, learning point) : O(preuves du
 * couple). Le rejeu de tout un périmètre parcourt les couples par lots ;
 * c'est une opération hors ligne, la seule autorisée à balayer la preuve.
 */
class ReplayService
{
    public function __construct(
        private EngineRegistry $engines,
        private AssessmentItemRepository $items,
    ) {}

    /**
     * L'état reconstruit d'un couple, sous une version donnée (courante par défaut).
     *
     * `$onStep`, s'il est fourni, reçoit chaque pas : (ligne de preuve, état
     * avant, état après). C'est ainsi que la reconstruction de l'histoire
     * (smarter:mastery:transitions-backfill) réutilise CE rejeu au lieu d'en
     * écrire un second.
     *
     * @param  (callable(object, MasteryState, MasteryState): void)|null  $onStep
     */
    public function replay(int $userId, int $learningPointId, ?MasteryEngine $engine = null, ?callable $onStep = null): MasteryState
    {
        $engine ??= $this->engines->current();
        $context = new EngineContext($this->items->availableItemsForLearningPoint($learningPointId));

        $state = $engine->initialState();
        /** @var array<string, array{rows: int, nonInert: int, success: bool}> $itemFacts */
        $itemFacts = [];
        /** @var array<string, array{nonInert: int, success: bool}> $templateFacts */
        $templateFacts = [];

        foreach ($this->orderedEvidence($userId, $learningPointId) as $row) {
            $outcome = Outcome::fromLegacy($row->outcome, (bool) $row->is_correct);
            $itemKey = $row->item_key ?? EvidenceClassifier::identityFromQuestionCode(
                $row->assessment_type ?? EvidenceEvent::SOURCE_ASSESSMENT, $row->lesson_code, $row->question_code,
            )['itemKey'];
            $templateKey = $row->template_key;

            $item = $itemFacts[$itemKey] ?? ['rows' => 0, 'nonInert' => 0, 'success' => false];
            $template = $templateKey !== null
                ? ($templateFacts[$templateKey] ?? ['nonInert' => 0, 'success' => false])
                : ['nonInert' => $item['nonInert'], 'success' => $item['success']];

            $facts = new PriorFacts(
                rowsOnItem: $item['rows'],
                nonInertOnItem: $item['nonInert'],
                successOnItem: $item['success'],
                nonInertOnTemplate: $template['nonInert'],
                successOnTemplate: $template['success'],
            );
            $kind = EvidenceClassifier::classifyFrom($facts)['demonstrationKind'];

            $event = new EvidenceEvent(
                outcome: $outcome,
                isCorrect: (bool) $row->is_correct,
                source: $row->assessment_type ?? EvidenceEvent::SOURCE_ASSESSMENT,
                role: $row->role ?? EvidenceEvent::ROLE_PRIMARY,
                difficulty: $row->difficulty !== null ? (int) $row->difficulty : ($row->level !== null ? (int) $row->level : null),
                level: $row->level !== null ? (int) $row->level : null,
                hintsUsed: (int) ($row->hints_used ?? 0),
                demonstrationKind: $kind,
                evaluatedBy: $row->evaluated_by ?? EvidenceEvent::EVALUATED_BY_CLIENT_LEGACY,
                priorNonInertOnItem: $facts->nonInertOnItem > 0,
                priorSuccessOnItem: $facts->successOnItem,
                priorSuccessOnTemplate: $facts->successOnTemplate,
                submittedAt: $row->submitted_at !== null ? Carbon::parse($row->submitted_at)->toIso8601String() : null,
            );

            $previous = $state;
            $state = $engine->apply($state, $event, $context);
            if ($onStep !== null) {
                $onStep($row, $previous, $state);
            }

            // Les faits avancent APRÈS la preuve : la suivante les verra.
            $item['rows']++;
            if (! $outcome->isInert()) {
                $item['nonInert']++;
                $item['success'] = $item['success'] || $outcome->isSuccess();
                if ($templateKey !== null) {
                    $template['nonInert']++;
                    $template['success'] = $template['success'] || $outcome->isSuccess();
                    $templateFacts[$templateKey] = $template;
                }
            }
            $itemFacts[$itemKey] = $item;
        }

        return $state;
    }

    /**
     * Le rejeu ÉCRIT l'état d'un couple. Renvoie [avant, après] pour le diff.
     *
     * @return array{before: ?array, after: array, changed: bool}
     */
    public function recompute(int $userId, int $learningPointId, ?MasteryEngine $engine = null, bool $dryRun = false): array
    {
        $engine ??= $this->engines->current();
        $row = StudentLearningPointProgress::query()
            ->where('user_id', $userId)->where('learning_point_id', $learningPointId)->first();
        $next = $this->replay($userId, $learningPointId, $engine);

        $before = $row ? self::snapshot(MasteryState::fromRow($row), (int) $row->engine_version) : null;
        $after = self::snapshot($next, $engine->version());
        $changed = $before === null
            || $before['status'] !== $after['status']
            || abs($before['confidence'] - $after['confidence']) >= 0.0005
            || $before['engineVersion'] !== $after['engineVersion'];

        if (! $dryRun) {
            $previous = $row ? MasteryState::fromRow($row) : null;
            $row ??= new StudentLearningPointProgress(['user_id' => $userId, 'learning_point_id' => $learningPointId]);
            $row->fill($next->toColumns() + ['engine_version' => $engine->version(), 'recomputed_at' => now()])->save();
            // Un rejeu qui change l'état est une ligne d'histoire « recalcul »,
            // datée d'aujourd'hui : l'élève n'a rien appris à cet instant.
            TransitionRecorder::record($userId, $learningPointId, $previous, $next, $engine->version(),
                LearningPointStateTransition::ORIGIN_REPLAY, now());
        }

        return ['before' => $before, 'after' => $after, 'changed' => $changed];
    }

    /**
     * Le rejeu correspond-il à l'agrégat enregistré ? La confiance est
     * comparée à 0,001 près : c'est la précision à laquelle le moteur
     * arrondit, pas une tolérance de confort. Compare dans la version que la
     * ligne DÉCLARE.
     */
    public function matchesStored(int $userId, int $learningPointId): bool
    {
        $stored = StudentLearningPointProgress::query()
            ->where('user_id', $userId)->where('learning_point_id', $learningPointId)->first();
        if ($stored === null) {
            return false;
        }

        $engine = $this->engines->version((int) $stored->engine_version);
        $replayed = $this->replay($userId, $learningPointId, $engine);

        return abs((float) $stored->confidence - $replayed->confidence) < 0.0005
            && $stored->status === $replayed->status
            && (int) $stored->attempts === $replayed->attempts
            && (int) $stored->correct_count === $replayed->correctCount
            && ($engine->version() === 1 || (
                (int) $stored->distinct_items_success === $replayed->distinctItemsSuccess
                && (int) $stored->assessment_success_count === $replayed->assessmentSuccessCount
                && ($stored->status_reason ?? MasteryState::REASON_THRESHOLD) === $replayed->statusReason
            ));
    }

    /**
     * Les couples (élève, point) qui ont de la preuve, dans un périmètre.
     *
     * @param  array{user?: int, learningPoint?: int, lesson?: int}  $scope
     * @return LazyCollection<int, object{user_id: int, learning_point_id: int}>
     */
    public function pairs(array $scope = []): LazyCollection
    {
        return DB::table('learning_evidence as e')
            ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'e.id')
            ->when(isset($scope['user']), fn ($q) => $q->where('e.user_id', $scope['user']))
            ->when(isset($scope['learningPoint']), fn ($q) => $q->where('p.learning_point_id', $scope['learningPoint']))
            ->when(isset($scope['lesson']), fn ($q) => $q->where('e.lesson_id', $scope['lesson']))
            ->select('e.user_id', 'p.learning_point_id')
            ->distinct()
            ->orderBy('e.user_id')->orderBy('p.learning_point_id')
            ->lazy(500);
    }

    /** @return array<string, mixed> */
    public static function snapshot(MasteryState $state, int $engineVersion): array
    {
        return [
            'status' => $state->status,
            'statusReason' => $state->statusReason,
            'confidence' => $state->confidence,
            'attempts' => $state->attempts,
            'distinctItemsSuccess' => $state->distinctItemsSuccess,
            'engineVersion' => $engineVersion,
        ];
    }

    /**
     * La preuve d'un couple, dans l'ordre d'arrivée, avec le rôle du point et
     * le code de la leçon (pour reconstituer l'identité des lignes non
     * complétées).
     *
     * @return Collection<int, object>
     */
    private function orderedEvidence(int $userId, int $learningPointId): Collection
    {
        return LearningEvidence::query()
            ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'learning_evidence.id')
            ->join('lessons', 'lessons.id', '=', 'learning_evidence.lesson_id')
            ->where('learning_evidence.user_id', $userId)
            ->where('p.learning_point_id', $learningPointId)
            ->orderBy('learning_evidence.submitted_at')
            ->orderBy('learning_evidence.id')
            ->get([
                'learning_evidence.id', 'learning_evidence.question_code', 'learning_evidence.item_key',
                'learning_evidence.template_key', 'learning_evidence.is_correct', 'learning_evidence.outcome',
                'learning_evidence.assessment_type', 'learning_evidence.level', 'learning_evidence.difficulty',
                'learning_evidence.hints_used', 'learning_evidence.evaluated_by', 'learning_evidence.submitted_at',
                'p.role', 'lessons.code as lesson_code',
            ]);
    }

    /** Le code d'une leçon par son id — pour les commandes. */
    public static function lessonId(string $code): ?int
    {
        return Lesson::where('code', $code)->value('id');
    }
}
