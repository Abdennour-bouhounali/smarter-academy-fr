<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Models\ActivationCode;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La vente en NOMBRE : un lot lié à une offre, X codes, X activations —
 * chacune un abonnement sur la version figée. Le lot élève sans offre reste
 * exactement ce qu'il était.
 */
class ActivationCodeBulkPlanTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_un_lot_lie_a_une_offre_enseignant_produit_x_codes_distincts_qui_activent_chacun_un_abonnement(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $admin = $this->admin();

        $response = $this->withToken($this->tokenOf($admin))->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'Lycée Ibn Khaldoun', 'quantity' => 5, 'planVersionId' => $pro->currentVersion->id, 'accessDays' => 200,
        ])->assertCreated()->assertJsonPath('batch.plan.slug', 'teacher-pro');

        $codes = collect($response->json('codes'))->pluck('code');
        $this->assertCount(5, $codes->unique());

        $teacher = $this->teacher();
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]])
            ->assertOk()->assertJsonPath('access.subscriptionActive', true);

        $subscription = Subscription::where('user_id', $teacher->id)->firstOrFail();
        $this->assertSame('activation_code', $subscription->acquisition_source);
        $this->assertSame($pro->currentVersion->id, $subscription->plan_version_id);
        $this->assertSame(now()->addDays(200)->toDateString(), $subscription->ends_at->toDateString());

        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')->assertJsonPath('entitlements.classes.maximum', 5);

        // Le même code, deux fois : refusé. Un autre enseignant, un autre code : un autre siège.
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]])
            ->assertStatus(422)->assertJsonPath('reason', 'already_activated');
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[1]])->assertOk();
        $this->assertSame(2, Subscription::count());
        $this->assertSame(3, ActivationCode::where('status', 'available')->count());
    }

    public function test_un_code_d_offre_enseignant_est_refuse_a_un_eleve_sans_etre_consomme(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $codes = $this->withToken($this->tokenOf($this->admin()))->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'x', 'quantity' => 1, 'planVersionId' => $pro->currentVersion->id,
        ])->json('codes');

        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]['code']])
            ->assertStatus(422)->assertJsonPath('reason', 'plan_mismatch');
        $this->assertDatabaseHas('activation_codes', ['id' => $codes[0]['id'], 'status' => 'available']);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_un_lot_eleve_lie_a_une_offre_eleve_cree_un_abonnement_et_ouvre_le_palier(): void
    {
        $plan = $this->studentPlan();
        $codes = $this->withToken($this->tokenOf($this->admin()))->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'École primaire', 'quantity' => 2, 'planVersionId' => $plan->currentVersion->id,
        ])->json('codes');
        $student = $this->student();

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]['code']])->assertOk();
        $this->assertDatabaseHas('subscriptions', ['user_id' => $student->id, 'plan' => 'student-premium', 'acquisition_source' => 'activation_code']);
        $this->forgetAll();
        $this->assertTrue(app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM));
    }

    public function test_un_lot_eleve_sans_offre_suit_le_chemin_classique_inchange(): void
    {
        $codes = $this->withToken($this->tokenOf($this->admin()))->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'Cartes Alger', 'quantity' => 1, 'accessDays' => 365,
        ])->json('codes');
        $student = $this->student();

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]['code']])
            ->assertOk()->assertJsonPath('access.activationCodeActive', true);
        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseHas('entitlements', ['user_id' => $student->id, 'type' => 'activation_code']);
    }

    public function test_revoquer_un_code_d_offre_ferme_l_abonnement_et_l_acces(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $admin = $this->admin();
        $codes = $this->withToken($this->tokenOf($admin))->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'x', 'quantity' => 1, 'planVersionId' => $pro->currentVersion->id,
        ])->json('codes');
        $teacher = $this->teacher();
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]['code']])->assertOk();
        $this->forgetAll();
        // Le DROIT né du code (la ligne synchronisée) est ouvert. L'accès au
        // contenu, lui, vient du rôle enseignant (TeacherLearningAccessTest)
        // et ne dépend pas de cette ligne.
        $this->assertTrue(app(EntitlementService::class)->summarize($teacher)['subscriptionActive']);

        $this->withToken($this->tokenOf($admin))->postJson("/api/v1/admin/activation-codes/{$codes[0]['id']}/revoke", ['reason' => 'Carte volée'])->assertOk();

        $this->forgetAll();
        $this->assertFalse(app(EntitlementService::class)->summarize($teacher)['subscriptionActive']);
        $this->assertSame('cancelled', Subscription::where('user_id', $teacher->id)->first()->status);
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')->assertJsonPath('entitlements.plan.slug', 'teacher-free');
    }

    public function test_une_offre_archivee_ou_en_brouillon_ne_se_lie_pas_a_un_lot(): void
    {
        $this->defaultTeacherPlan();
        $archived = $this->paidTeacherPlan([], ['slug' => 'old', 'status' => 'archived']);
        $token = $this->tokenOf($this->admin());

        $this->withToken($token)->postJson('/api/v1/admin/activation-codes/batches', [
            'label' => 'x', 'quantity' => 1, 'planVersionId' => $archived->currentVersion->id,
        ])->assertStatus(422);
        $this->assertDatabaseCount('activation_code_batches', 0);
    }
}
