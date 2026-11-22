<?php

namespace Database\Factories;

use App\Domain\Plans\EntitlementKeys;
use App\Models\PlanEntitlement;
use App\Models\PlanVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PlanEntitlement> */
class PlanEntitlementFactory extends Factory
{
    protected $model = PlanEntitlement::class;

    public function definition(): array
    {
        return [
            'plan_version_id' => PlanVersion::factory(),
            'key' => EntitlementKeys::CLASSROOMS_MAX,
            'value' => 1,
        ];
    }
}
