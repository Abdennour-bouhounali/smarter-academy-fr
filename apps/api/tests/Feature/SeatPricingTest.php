<?php

namespace Tests\Feature;

use App\Domain\Plans\TeacherPricingService;
use App\Models\PlanVersion;
use App\Models\Subscription;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * LE PRIX PAR ÉLÈVE — le palier vient du nombre, le prix du palier, le
 * total du produit. Rien n'est un nombre en dur : tout vient de la grille
 * semée par le test, et le client n'est jamais cru.
 */
class SeatPricingTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function pricing(): TeacherPricingService
    {
        return app(TeacherPricingService::class);
    }

    public function test_le_palier_vient_du_nombre_d_eleves_et_le_total_du_produit(): void
    {
        $version = $this->seatTeacherPlan()->currentVersion;

        foreach ([
            [5, '1–5', 0, 0],
            [6, '6–20', 100000, 600000],
            [20, '6–20', 100000, 2000000],
            [21, '21–30', 80000, 1680000],
            [25, '21–30', 80000, 2000000],
            [30, '21–30', 80000, 2400000],
            [31, '31–50', 70000, 2170000],
            [101, '101+', 50000, 5050000],
            [250, '101+', 50000, 12500000],
        ] as [$seats, $label, $unit, $total]) {
            $quote = $this->pricing()->quote($version, $seats);
            $this->assertSame($label, $quote['tier']['label'], "palier pour {$seats}");
            $this->assertSame($unit, $quote['unitPriceCents'], "prix unitaire pour {$seats}");
            $this->assertSame($total, $quote['totalCents'], "total pour {$seats}");
            $this->assertSame('DZD', $quote['currency']);
        }
        $this->assertTrue($this->pricing()->quote($version, 5)['free']);
        $this->assertFalse($this->pricing()->quote($version, 6)['free']);
    }

    public function test_un_nombre_hors_grille_est_refuse(): void
    {
        $version = $this->seatTeacherPlan([[1, 5, 0], [6, 30, 100000]])->currentVersion;

        $this->assertSame(3000000, $this->pricing()->quote($version, 30)['totalCents']);
        $this->expectException(DomainException::class);
        $this->pricing()->quote($version, 31);
    }

    public function test_la_grille_est_validee_avant_d_etre_ecrite(): void
    {
        $this->freeSeatsPlan();
        $plan = $this->seatTeacherPlan();
        $adminToken = $this->tokenOf($this->admin());

        // Une nouvelle version en brouillon, seule modifiable.
        $draftId = $this->withToken($adminToken)->postJson("/api/v1/admin/plans/{$plan->id}/versions")->assertCreated()->json('version.id');
        $put = fn (array $tiers) => $this->withToken($adminToken)->putJson("/api/v1/admin/plan-versions/{$draftId}/pricing", ['pricingTiers' => $tiers]);

        // Chevauchement.
        $put([['minStudents' => 1, 'maxStudents' => 20, 'pricePerStudentCents' => 0], ['minStudents' => 15, 'maxStudents' => 30, 'pricePerStudentCents' => 80000]])
            ->assertStatus(422)->assertJsonFragment(['message' => 'Les paliers « 1–20 » et « 15–30 » se chevauchent.']);
        // Trou.
        $r = $put([['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0], ['minStudents' => 7, 'maxStudents' => 20, 'pricePerStudentCents' => 100000]]);
        $r->assertStatus(422);
        $this->assertStringContainsString('Aucun palier ne couvre 6 élève(s).', $r->json('message'));
        // Bornes inversées.
        $put([['minStudents' => 10, 'maxStudents' => 5, 'pricePerStudentCents' => 0]])->assertStatus(422);
        // Prix négatif.
        $put([['minStudents' => 1, 'maxStudents' => null, 'pricePerStudentCents' => -1]])->assertStatus(422);
        // Minimum nul.
        $put([['minStudents' => 0, 'maxStudents' => 5, 'pricePerStudentCents' => 0]])->assertStatus(422);
        // Deux paliers identiques.
        $put([['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0], ['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0]])->assertStatus(422);
        // Un palier sans borne suivi d'un autre.
        $put([['minStudents' => 1, 'maxStudents' => null, 'pricePerStudentCents' => 0], ['minStudents' => 6, 'maxStudents' => 20, 'pricePerStudentCents' => 100000]])->assertStatus(422);

        // Un palier INACTIF ne compte pas dans la continuité, et une grille saine passe.
        $ok = $put([
            ['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0],
            ['minStudents' => 6, 'maxStudents' => 15, 'pricePerStudentCents' => 120000],
            ['minStudents' => 6, 'maxStudents' => 20, 'pricePerStudentCents' => 100000, 'isActive' => false],
            ['minStudents' => 16, 'maxStudents' => null, 'pricePerStudentCents' => 90000],
        ])->assertOk();
        $this->assertCount(4, $ok->json('version.pricingTiers'));
        $this->assertTrue($ok->json('version.seatBased'));
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'plan_pricing.updated']);

        // Une version FIGÉE (la courante, référencée) refuse la grille.
        $this->withToken($adminToken)->putJson("/api/v1/admin/plan-versions/{$plan->currentVersion->id}/pricing", ['pricingTiers' => [['minStudents' => 1, 'maxStudents' => null, 'pricePerStudentCents' => 0]]])
            ->assertStatus(422);
    }

    public function test_les_prix_sont_versionnes_et_l_abonne_garde_les_siens(): void
    {
        $this->freeSeatsPlan();
        $plan = $this->seatTeacherPlan();
        $admin = $this->admin();
        $teacher = $this->teacher();
        $adminToken = $this->tokenOf($admin);

        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 20])
            ->assertCreated()->assertJsonPath('subscription.studentSeatLimit', 20)->assertJsonPath('subscription.seatUnitPriceCents', 100000)->assertJsonPath('subscription.seatTotalCents', 2000000);
        $v1 = $plan->currentVersion->id;

        // Nouvelle version : 6–20 passe à 1 200 DA. Publiée.
        $draftId = $this->withToken($adminToken)->postJson("/api/v1/admin/plans/{$plan->id}/versions")->json('version.id');
        $this->withToken($adminToken)->putJson("/api/v1/admin/plan-versions/{$draftId}/pricing", ['pricingTiers' => [
            ['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0],
            ['minStudents' => 6, 'maxStudents' => 20, 'pricePerStudentCents' => 120000],
            ['minStudents' => 21, 'maxStudents' => null, 'pricePerStudentCents' => 90000],
        ]])->assertOk();
        $this->withToken($adminToken)->postJson("/api/v1/admin/plan-versions/{$draftId}/publish")->assertOk();

        // L'abonné existant : même version, même capacité, même prix.
        $sub = Subscription::where('user_id', $teacher->id)->firstOrFail();
        $this->assertSame($v1, $sub->plan_version_id);
        $this->assertSame(20, $sub->student_seat_limit);
        $this->assertSame(100000, $sub->seat_unit_price_cents);
        $this->assertSame('superseded', PlanVersion::find($v1)->status);
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')->assertOk()
            ->assertJsonPath('entitlements.students.maximum', 20)->assertJsonPath('entitlements.plan.version', 1);

        // Un nouveau devis et une nouvelle activation lisent la NOUVELLE grille.
        $this->withToken($this->tokenOf($teacher))->getJson("/api/v1/teacher/plans/{$plan->id}/quote?seats=20")->assertOk()
            ->assertJsonPath('quote.unitPriceCents', 120000)->assertJsonPath('quote.totalCents', 2400000);
        $other = $this->teacher();
        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$other->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 20])
            ->assertCreated()->assertJsonPath('subscription.seatUnitPriceCents', 120000)->assertJsonPath('subscription.planVersion', 2);
    }

    public function test_le_client_n_est_jamais_cru_sur_le_prix(): void
    {
        $this->freeSeatsPlan();
        $plan = $this->seatTeacherPlan();
        $teacher = $this->teacher();

        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/teacher/subscription-requests', [
            'planId' => $plan->id, 'studentSeats' => 25, 'price' => 1, 'calculatedTotalCents' => 1, 'unitPriceCents' => 1,
        ])->assertCreated()
            ->assertJsonPath('request.requestedStudentSeats', 25)
            ->assertJsonPath('request.unitPriceCents', 80000)
            ->assertJsonPath('request.calculatedTotalCents', 2000000)
            ->assertJsonPath('request.seatTierLabel', '21–30');
        $this->assertDatabaseHas('subscription_requests', ['user_id' => $teacher->id, 'requested_student_seats' => 25, 'calculated_total_cents' => 2000000]);
    }

    public function test_l_apercu_de_l_administration_et_le_devis_de_l_enseignant(): void
    {
        $this->freeSeatsPlan();
        $plan = $this->seatTeacherPlan();
        $version = $plan->currentVersion;

        $this->withToken($this->tokenOf($this->admin()))->getJson("/api/v1/admin/plan-versions/{$version->id}/pricing/quote?seats=25")->assertOk()
            ->assertJsonPath('quote.tier.label', '21–30')->assertJsonPath('quote.unitPriceCents', 80000)->assertJsonPath('quote.totalCents', 2000000);
        $this->withToken($this->tokenOf($this->admin()))->getJson("/api/v1/admin/plan-versions/{$version->id}/pricing/quote?seats=0")->assertStatus(422);
        $this->withToken($this->tokenOf($this->admin()))->getJson("/api/v1/admin/plan-versions/{$version->id}/pricing")->assertOk()
            ->assertJsonPath('seatBased', true)->assertJsonCount(6, 'pricingTiers');

        $teacherToken = $this->tokenOf($this->teacher());
        $this->withToken($teacherToken)->getJson("/api/v1/teacher/plans/{$plan->id}/quote?seats=21")->assertOk()->assertJsonPath('quote.totalCents', 1680000);
        $this->withToken($teacherToken)->getJson("/api/v1/teacher/plans/{$plan->id}/quote?seats=20")->assertOk()->assertJsonPath('quote.totalCents', 2000000);
        $this->withToken($teacherToken)->getJson('/api/v1/teacher/plans')->assertOk()
            ->assertJsonPath('freeSeats', 5)->assertJsonPath('plans.0.seatBased', true)->assertJsonCount(6, 'plans.0.pricingTiers');

        // Un enseignant ne touche pas à la grille.
        $this->withToken($teacherToken)->putJson("/api/v1/admin/plan-versions/{$version->id}/pricing", ['pricingTiers' => []])->assertStatus(403);
    }
}
