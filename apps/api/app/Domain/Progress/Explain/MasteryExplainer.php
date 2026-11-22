<?php

namespace App\Domain\Progress\Explain;

use App\Domain\Content\AssessmentItemRepository;
use App\Domain\Progress\Engine\EngineContext;
use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Engine\EngineV2;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\Support\Freshness;
use App\Models\AssessmentItem;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\StudentLearningPointProgress;

/**
 * « Pourquoi cet élève est-il considéré comme maîtrisant ce point ? »
 *
 * Assemblé À LA DEMANDE depuis l'état canonique (ses compteurs), les N
 * dernières preuves et les titres du registre. Rien n'est stocké en double :
 * supprimer cette classe ne perd aucune donnée.
 */
class MasteryExplainer
{
    public function __construct(
        private EngineRegistry $engines,
        private AssessmentItemRepository $items,
    ) {}

    /** @return array<string, mixed> */
    public function explain(int $userId, LearningPoint $point): array
    {
        $row = StudentLearningPointProgress::query()
            ->where('user_id', $userId)->where('learning_point_id', $point->id)->first();

        $state = $row ? MasteryState::fromRow($row) : null;
        $engine = $this->engines->version($row ? (int) $row->engine_version : (int) config('mastery.engine_version'));
        $context = new EngineContext($this->items->availableItemsForLearningPoint($point->id));
        $needed = $engine instanceof EngineV2 ? $engine->requiredDistinctItems($context) : null;

        $recent = $this->recentEvidence($userId, $point->id);
        $withHints = $recent->filter(fn ($e) => (int) $e->hints_used > 0 && (bool) $e->is_correct)->count();
        $practiceSuccesses = $recent->filter(fn ($e) => (bool) $e->is_correct && $e->assessment_type === 'practice_exercise')->count();

        return [
            'learningPoint' => ['code' => $point->code, 'title' => $point->title],
            'status' => $state?->status ?? MasteryState::STATUS_UNASSESSED,
            'statusReason' => $state?->statusReason,
            'confidence' => $state?->confidence,
            'engineVersion' => $engine->version(),
            'freshness' => Freshness::of($state?->lastEvidenceAt),
            'evidence' => $state === null ? null : [
                'attempts' => $state->attempts,
                'successes' => $state->correctCount,
                'partials' => $state->partialCount,
                'failures' => $state->failureCount,
                'distinctItemsSuccess' => $state->distinctItemsSuccess,
                'distinctItemsAttempted' => $state->distinctItemsAttempted,
                'distinctTemplatesSuccess' => $state->distinctTemplatesSuccess,
                'needed' => $needed,
                'availableItems' => $context->availableItemsForLearningPoint,
                'assessmentSuccesses' => $state->assessmentSuccessCount,
                // Sur les preuves récentes seulement : le total exact vivrait
                // dans un compteur de plus, et personne ne l'a demandé.
                'recentPracticeSuccesses' => $practiceSuccesses,
                'recentSuccessesWithHints' => $withHints,
                'maxDifficultySuccess' => $state->maxDifficultySuccess,
                'lastEvidenceAt' => $state->lastEvidenceAt,
                'lastSuccessAt' => $state->lastSuccessAt,
                'lastFailureAt' => $state->lastFailureAt,
            ],
            'recent' => $recent->map(fn ($e) => [
                'at' => $e->submitted_at?->toIso8601String(),
                'source' => $e->assessment_type === 'practice_exercise' ? 'practice' : 'final_test',
                'level' => $e->level,
                'difficulty' => $e->difficulty,
                'outcome' => Outcome::fromLegacy($e->outcome, (bool) $e->is_correct)->value,
                'kind' => $e->demonstration_kind,
                'hints' => (int) $e->hints_used,
                'role' => $e->role,
                'itemKey' => $e->item_key,
                'itemTitle' => $this->titleOf($e->item_key),
            ])->values()->all(),
        ];
    }

    /** @return \Illuminate\Support\Collection<int, LearningEvidence> */
    private function recentEvidence(int $userId, int $learningPointId)
    {
        return LearningEvidence::query()
            ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'learning_evidence.id')
            ->where('learning_evidence.user_id', $userId)
            ->where('p.learning_point_id', $learningPointId)
            ->orderByDesc('learning_evidence.submitted_at')
            ->orderByDesc('learning_evidence.id')
            ->limit((int) config('mastery.explanation_recent_limit', 20))
            ->get(['learning_evidence.*', 'p.role']);
    }

    private function titleOf(?string $itemKey): ?string
    {
        if ($itemKey === null) {
            return null;
        }
        $item = $this->items->findByKey($itemKey);

        return $item instanceof AssessmentItem ? $item->title : null;
    }
}
