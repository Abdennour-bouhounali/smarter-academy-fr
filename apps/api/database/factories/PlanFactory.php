<?php

namespace Database\Factories;

use App\Domain\Plans\EntitlementKeys;
use App\Models\Plan;
use App\Models\PlanEntitlement;
use App\Models\PlanPrice;
use App\Models\PlanPricingTier;
use App\Models\PlanVersion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Usine de TEST. Le seeder (PlanSeeder) porte les offres réelles ; ici on
 * fabrique une offre PUBLIÉE avec une version courante, prête à être
 * résolue, activée ou liée à un lot.
 *
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'slug' => 'plan-'.Str::lower(Str::random(8)),
            'name' => 'Offre de test',
            'description' => null,
            'type' => Plan::TYPE_TEACHER,
            'status' => Plan::STATUS_ACTIVE,
            'display_order' => 0,
            'is_public' => true,
            'is_default' => false,
            'allows_requests' => true,
        ];
    }

    public function student(): static
    {
        return $this->state(['type' => Plan::TYPE_STUDENT]);
    }

    public function teacher(): static
    {
        return $this->state(['type' => Plan::TYPE_TEACHER]);
    }

    public function default(): static
    {
        return $this->state(['is_default' => true, 'is_public' => false, 'allows_requests' => false]);
    }

    public function archived(): static
    {
        return $this->state(['status' => Plan::STATUS_ARCHIVED]);
    }

    public function hidden(): static
    {
        return $this->state(['status' => Plan::STATUS_HIDDEN, 'is_public' => false]);
    }

    public function draft(): static
    {
        return $this->state(['status' => Plan::STATUS_DRAFT, 'is_public' => false]);
    }

    /**
     * Une version COURANTE portant ces limites/fonctionnalités et ce prix,
     * et — pour une offre par sièges — cette grille [min, max|null, centimes].
     *
     * @param  array<string, mixed>  $entitlements
     * @param  array<int, array{0: int, 1: ?int, 2: int}>  $tiers
     */
    public function withCurrentVersion(array $entitlements = [], array $price = [], array $tiers = []): static
    {
        return $this->afterCreating(function (Plan $plan) use ($entitlements, $price, $tiers) {
            $version = PlanVersion::create([
                'plan_id' => $plan->id,
                'version' => 1,
                'status' => PlanVersion::STATUS_CURRENT,
                'published_at' => now(),
            ]);

            foreach ($entitlements as $key => $value) {
                PlanEntitlement::create([
                    'plan_version_id' => $version->id,
                    'key' => $key,
                    'value' => EntitlementKeys::normalize($key, $value),
                ]);
            }

            PlanPrice::create(array_merge([
                'plan_version_id' => $version->id,
                'currency' => 'DZD',
                'amount_cents' => 0,
                'billing_interval' => PlanPrice::INTERVAL_YEAR,
                'duration_days' => 365,
            ], $price));

            foreach ($tiers as $i => [$min, $max, $cents]) {
                PlanPricingTier::create([
                    'plan_version_id' => $version->id,
                    'min_students' => $min,
                    'max_students' => $max,
                    'price_per_student_cents' => $cents,
                    'currency' => 'DZD',
                    'sort_order' => $i,
                    'is_active' => true,
                ]);
            }
        });
    }
}
