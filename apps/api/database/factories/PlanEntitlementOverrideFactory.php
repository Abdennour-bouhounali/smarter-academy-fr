<?php

namespace Database\Factories;

use App\Domain\Plans\EntitlementKeys;
use App\Models\PlanEntitlementOverride;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanEntitlementOverride> */
class PlanEntitlementOverrideFactory extends Factory
{
    protected $model = PlanEntitlementOverride::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_TEACHER]),
            'key' => EntitlementKeys::CLASSROOMS_MAX,
            'value' => 3,
            'reason' => 'Test',
            'starts_at' => now()->subDay(),
            'ends_at' => null,
            'created_by' => User::factory()->state(['role' => User::ROLE_ADMIN]),
        ];
    }

    public function expired(): static
    {
        return $this->state(['starts_at' => now()->subMonth(), 'ends_at' => now()->subDay()]);
    }
}
