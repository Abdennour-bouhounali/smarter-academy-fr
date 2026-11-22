<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\PlanVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanVersion> */
class PlanVersionFactory extends Factory
{
    protected $model = PlanVersion::class;

    public function definition(): array
    {
        return [
            'plan_id' => Plan::factory(),
            'version' => 1,
            'status' => PlanVersion::STATUS_CURRENT,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => PlanVersion::STATUS_DRAFT, 'published_at' => null]);
    }
}
