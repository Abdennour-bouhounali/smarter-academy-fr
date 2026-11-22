<?php

namespace Database\Factories;

use App\Models\PlanPricingTier;
use App\Models\PlanVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanPricingTier> */
class PlanPricingTierFactory extends Factory
{
    protected $model = PlanPricingTier::class;

    public function definition(): array
    {
        return [
            'plan_version_id' => PlanVersion::factory(),
            'min_students' => 1,
            'max_students' => null,
            'price_per_student_cents' => 100000,
            'currency' => 'DZD',
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
