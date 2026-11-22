<?php

namespace Tests\Support;

use App\Domain\Access\Features\FeatureAccessService;
use App\Models\FeatureAccessPolicy;

/**
 * « الوصول والحدود » dans les tests.
 *
 * `openAllFeatures()` : pour une suite qui éprouve AUTRE CHOSE que l'accès
 * (la persistance d'un instrument, le contexte d'une note) — tout ouvert,
 * sans limite, pour les deux paliers. Les valeurs initiales de la migration
 * restent éprouvées par FeatureAccessTest, pas par ces suites.
 *
 * `setPolicy()` : poser une ligne précise, puis oublier la mémoire du service.
 */
trait FeatureAccessFixtures
{
    protected function openAllFeatures(): void
    {
        FeatureAccessPolicy::query()->update([
            'is_enabled' => true,
            'free_allowed' => true,
            'premium_allowed' => true,
            'free_quota' => null,
            'premium_quota' => null,
        ]);
        app(FeatureAccessService::class)->forget();
    }

    /** @param  array<string, mixed>  $values  colonnes de feature_access_policies */
    protected function setPolicy(string $key, array $values): void
    {
        FeatureAccessPolicy::query()->updateOrCreate(['feature_key' => $key], $values);
        app(FeatureAccessService::class)->forget();
    }
}
