<?php

namespace Database\Factories;

use App\Models\PlanPrice;
use App\Models\PlanVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanPrice> */
class PlanPriceFactory extends Factory
{
    protected $model = PlanPrice::class;

    public function definition(): array
    {
        return [
            'plan_version_id' => PlanVersion::factory(),
            'currency' => 'DZD',
            'amount_cents' => 500000,
            'billing_interval' => PlanPrice::INTERVAL_YEAR,
            'interval_count' => 1,
            'duration_days' => 365,
            'status' => PlanPrice::STATUS_ACTIVE,
        ];
    }
}
