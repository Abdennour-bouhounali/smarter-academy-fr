<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SubscriptionRequest> */
class SubscriptionRequestFactory extends Factory
{
    protected $model = SubscriptionRequest::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_TEACHER]),
            'requested_plan_id' => Plan::factory()->teacher()->withCurrentVersion(),
            'status' => SubscriptionRequest::STATUS_PENDING,
            'requested_at' => now(),
        ];
    }
}
