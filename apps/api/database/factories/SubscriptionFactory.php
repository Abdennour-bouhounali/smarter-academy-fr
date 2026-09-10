<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_STUDENT]),
            'plan' => 'premium',
            'status' => Subscription::STATUS_ACTIVE,
            'started_at' => now()->subMonth(),
            'ends_at' => now()->addMonth(),
            'provider' => 'manual',
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => Subscription::STATUS_EXPIRED,
            'started_at' => now()->subYear(),
            'ends_at' => now()->subMonth(),
        ]);
    }
}
