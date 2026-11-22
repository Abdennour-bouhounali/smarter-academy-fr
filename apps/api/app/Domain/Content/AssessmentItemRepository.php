<?php

namespace App\Domain\Content;

use App\Models\AssessmentItem;
use Illuminate\Support\Facades\Cache;

/**
 * Lecture du registre d'items (assessment_items) — mémoïsée par requête, et
 * le seul endroit qui COMPTE les items d'un learning point pour le moteur.
 *
 * Le moteur ne compte rien lui-même : il reçoit `availableItemsForLearningPoint`
 * par EngineContext. Le compte est un COUNT indexé sur le pivot, mis en cache
 * pour la durée configurée, et purgé par l'import du registre.
 */
class AssessmentItemRepository
{
    /** @var array<string, ?AssessmentItem> */
    private array $byKey = [];

    /** @var array<int, ?int> */
    private array $counts = [];

    public function findByKey(string $itemKey): ?AssessmentItem
    {
        if (! array_key_exists($itemKey, $this->byKey)) {
            $this->byKey[$itemKey] = AssessmentItem::query()->where('item_key', $itemKey)->first();
        }

        return $this->byKey[$itemKey];
    }

    /**
     * Combien d'items PUBLIÉS et non retirés ont ce learning point pour point
     * principal. `null` quand le registre est vide : « inconnu », pas « zéro »
     * — le moteur applique alors sa règle sans borne.
     */
    public function availableItemsForLearningPoint(int $learningPointId): ?int
    {
        if (array_key_exists($learningPointId, $this->counts)) {
            return $this->counts[$learningPointId];
        }

        $ttl = (int) config('mastery.available_items_cache_ttl', 3600);

        return $this->counts[$learningPointId] = Cache::remember(
            self::cacheKey($learningPointId),
            $ttl,
            function () use ($learningPointId) {
                if (! AssessmentItem::query()->exists()) {
                    return null;
                }

                return AssessmentItem::query()
                    ->active()
                    ->visibleToStudents()
                    ->join('assessment_item_learning_point as ailp', 'ailp.assessment_item_id', '=', 'assessment_items.id')
                    ->where('ailp.learning_point_id', $learningPointId)
                    ->where('ailp.role', 'primary')
                    ->count();
            },
        );
    }

    /** Purge — appelée par l'importateur du registre après chaque import. */
    public static function forgetCounts(iterable $learningPointIds): void
    {
        foreach ($learningPointIds as $id) {
            Cache::forget(self::cacheKey((int) $id));
        }
    }

    public static function cacheKey(int $learningPointId): string
    {
        return "mastery:available_items:lp:{$learningPointId}";
    }

    public function registryIsEmpty(): bool
    {
        return ! AssessmentItem::query()->exists();
    }
}
