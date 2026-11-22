<?php

namespace Tests\Feature;

use App\Domain\Billing\PlanCatalog;
use App\Models\Plan;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Une formule à 0 € est une formule dont le propriétaire n'a pas encore fixé
 * le prix (PlanSeeder::PRICE_TO_BE_DECIDED_BY_OWNER) : elle ne se demande
 * pas et ne s'achète pas, même paiement ouvert (la suite tourne paiement
 * ouvert, phpunit.xml).
 */
class UnpricedPlanTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_une_formule_par_eleves_sans_prix_ne_se_demande_pas(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan([[1, 5, 0], [6, 30, PlanSeeder::PRICE_TO_BE_DECIDED_BY_OWNER]]);

        $this->withToken($this->tokenOf($this->teacher()))
            ->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 25])
            ->assertStatus(422)->assertJsonPath('reason', 'not_priced');
        $this->assertDatabaseCount('subscription_requests', 0);
    }

    public function test_les_formules_semees_sans_prix_ne_se_demandent_pas(): void
    {
        $this->seed(PlanSeeder::class);
        $seats = Plan::where('slug', 'teacher-seats')->firstOrFail();

        $this->withToken($this->tokenOf($this->teacher()))
            ->postJson('/api/v1/teacher/subscription-requests', ['planId' => $seats->id, 'studentSeats' => 25])
            ->assertStatus(422)->assertJsonPath('reason', 'not_priced');
        $this->assertDatabaseCount('subscription_requests', 0);
    }

    public function test_une_offre_a_zero_n_est_pas_achetable_en_ligne(): void
    {
        config(['billing.plans.annual.price_id' => 'price_test', 'billing.plans.annual.amount_cents' => 0]);
        $this->assertFalse(app(PlanCatalog::class)->purchasable('annual'));

        config(['billing.plans.annual.amount_cents' => 3500]);
        $this->assertTrue(app(PlanCatalog::class)->purchasable('annual'));
    }
}
