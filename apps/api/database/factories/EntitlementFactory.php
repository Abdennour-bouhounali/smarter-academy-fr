<?php

namespace Database\Factories;

use App\Models\Entitlement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * Usine de DÉVELOPPEMENT ET DE TEST uniquement.
 *
 * Aucun seeder ne crée de droit d'accès : le gratuit fonctionne sans aucune
 * ligne (c'est une règle, pas une donnée), et semer des abonnements donnerait
 * un accès payant que personne n'a acheté — en production ce serait un trou,
 * en développement une illusion qui masquerait justement les refus qu'on veut
 * pouvoir observer (spec §49).
 *
 * @extends Factory<Entitlement>
 */
class EntitlementFactory extends Factory
{
    protected $model = Entitlement::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => Entitlement::TYPE_SUBSCRIPTION,
            'status' => Entitlement::STATUS_ACTIVE,
            'starts_at' => Carbon::now()->subDay(),
            'expires_at' => null,
            'source' => 'test',
        ];
    }

    public function subscription(): static
    {
        return $this->state(['type' => Entitlement::TYPE_SUBSCRIPTION]);
    }

    public function adminOverride(): static
    {
        return $this->state(['type' => Entitlement::TYPE_ADMIN_OVERRIDE, 'source' => 'admin']);
    }

    /** Terminé : la fin est DANS LE PASSÉ, statut encore « active ». */
    public function expired(): static
    {
        return $this->state([
            'starts_at' => Carbon::now()->subMonth(),
            'expires_at' => Carbon::now()->subDay(),
        ]);
    }

    /** Pas encore commencé. */
    public function future(): static
    {
        return $this->state([
            'starts_at' => Carbon::now()->addDay(),
            'expires_at' => Carbon::now()->addMonth(),
        ]);
    }

    public function revoked(): static
    {
        return $this->state([
            'status' => Entitlement::STATUS_REVOKED,
            'revoked_at' => Carbon::now()->subHour(),
        ]);
    }
}
