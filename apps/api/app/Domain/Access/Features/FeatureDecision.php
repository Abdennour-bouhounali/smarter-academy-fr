<?php

namespace App\Domain\Access\Features;

/**
 * Une décision sur une fonctionnalité, AVEC son motif et, s'il y a lieu,
 * l'état du quota — ce que le client affiche, jamais ce qui l'autorise.
 *
 * Motifs (vocabulaire clos, que le client traduit) :
 *   ok                 permis
 *   feature_disabled   coupée pour tout le monde par l'administration
 *   premium_required   fermée au palier gratuit, ouverte au premium
 *   not_available      fermée au palier de l'utilisateur (et pas seulement
 *                      faute de premium)
 *   quota_exceeded     permis, mais la période est consommée
 */
final class FeatureDecision
{
    public const OK = 'ok';

    public const DISABLED = 'feature_disabled';

    public const PREMIUM_REQUIRED = 'premium_required';

    public const NOT_AVAILABLE = 'not_available';

    public const QUOTA_EXCEEDED = 'quota_exceeded';

    /**
     * @param  array{usageType: string, used: int, limit: ?int, remaining: ?int, unlimited: bool, period: string, resetsAt: ?string}|null  $quota
     */
    public function __construct(
        public readonly string $feature,
        public readonly bool $allowed,
        public readonly string $reason,
        public readonly string $tier,
        public readonly ?array $quota = null,
    ) {}

    /** Permis ET il reste au moins une unité (ou pas de quota). */
    public function canConsume(): bool
    {
        return $this->allowed && ($this->quota === null || $this->quota['unlimited'] || $this->quota['remaining'] > 0);
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'feature' => $this->feature,
            'allowed' => $this->allowed,
            'reason' => $this->reason,
            'tier' => $this->tier,
            'quota' => $this->quota,
        ];
    }
}
