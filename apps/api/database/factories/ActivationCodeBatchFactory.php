<?php

namespace Database\Factories;

use App\Models\ActivationCodeBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Usine de TEST uniquement. Aucun seeder ne crée de codes d'activation : des
 * codes semés seraient des cartes que personne n'a achetées, donc un accès
 * payant offert par inadvertance — exactement ce que EntitlementFactory
 * explique déjà pour les droits.
 *
 * @extends Factory<ActivationCodeBatch>
 */
class ActivationCodeBatchFactory extends Factory
{
    protected $model = ActivationCodeBatch::class;

    public function definition(): array
    {
        return [
            'label' => 'Lot de test',
            'quantity' => 1,
            'access_days' => null,
            'access_ends_at' => null,
            'redeem_by' => null,
            'created_by' => User::factory()->state(['role' => User::ROLE_ADMIN]),
        ];
    }

    /** Un accès à durée glissante : N jours à compter de la saisie. */
    public function lasting(int $days): static
    {
        return $this->state(['access_days' => $days, 'access_ends_at' => null]);
    }

    /** Un accès à date fixe : « jusqu'à la fin de l'année scolaire ». */
    public function until(\Illuminate\Support\Carbon $date): static
    {
        return $this->state(['access_ends_at' => $date, 'access_days' => null]);
    }
}
