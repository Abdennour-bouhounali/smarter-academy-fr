<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\EntitlementKeys as K;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Le modèle commercial se configure depuis le panneau — sans déploiement.
 */
class PlanAdminTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_creer_regler_publier_activer_une_offre(): void
    {
        $admin = $this->admin();
        $token = $this->tokenOf($admin);

        $keys = $this->withToken($token)->getJson('/api/v1/admin/entitlements/keys')->assertOk()->json('keys');
        $this->assertContains(K::CLASSROOMS_MAX, array_column($keys, 'key'));

        $plan = $this->withToken($token)->postJson('/api/v1/admin/plans', [
            'name' => 'Enseignant — Établissement', 'type' => 'teacher', 'isPublic' => true,
            'entitlements' => [K::CLASSROOMS_MAX => 20, K::LESSONS_VISIBILITY => true, K::CONTENT_ALLOWED_GRADES => ['4am']],
            'price' => ['amountCents' => 5000000, 'currency' => 'dzd', 'billingInterval' => 'year'],
        ])->assertCreated()->json('plan');

        $this->assertSame('draft', $plan['status']);
        $this->assertSame('enseignant-etablissement', $plan['slug']);
        $this->assertNull($plan['currentVersion']);
        $version = $plan['versions'][0];
        $this->assertSame('draft', $version['status']);
        $this->assertSame(20, $version['entitlements'][K::CLASSROOMS_MAX]);
        $this->assertSame('DZD', $version['price']['currency']);

        // Activer sans version publiée : refus. Publier, puis activer.
        $this->withToken($token)->patchJson("/api/v1/admin/plans/{$plan['id']}/status", ['status' => 'active'])->assertStatus(422);
        $this->withToken($token)->postJson("/api/v1/admin/plan-versions/{$version['id']}/publish")->assertOk()->assertJsonPath('version.status', 'current');
        $this->withToken($token)->patchJson("/api/v1/admin/plans/{$plan['id']}/status", ['status' => 'active'])->assertOk()->assertJsonPath('plan.status', 'active');

        // Un enseignant la voit désormais dans ses offres.
        $this->defaultTeacherPlan();
        $this->withToken($this->tokenOf($this->teacher()))->getJson('/api/v1/teacher/plans')->assertOk()
            ->assertJsonFragment(['slug' => 'enseignant-etablissement']);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::PLAN_VERSION_PUBLISHED, 'user_id' => $admin->id]);
    }

    public function test_une_cle_inconnue_est_refusee_a_l_ecriture(): void
    {
        $token = $this->tokenOf($this->admin());
        $this->withToken($token)->postJson('/api/v1/admin/plans', ['name' => 'X', 'type' => 'teacher', 'entitlements' => ['classes.max' => 1]])->assertStatus(422);
        $this->assertDatabaseCount('plans', 0);
    }

    public function test_une_version_referencee_est_figee_et_l_edition_passe_par_une_nouvelle_version(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $admin = $this->admin();
        $token = $this->tokenOf($admin);
        app(SubscriptionActivationService::class)->activate($admin, $this->teacher(), $pro);

        $current = $pro->currentVersion;
        $this->withToken($token)->patchJson("/api/v1/admin/plan-versions/{$current->id}", ['entitlements' => [K::CLASSROOMS_MAX => 99]])->assertStatus(422);
        $this->assertSame(5, $current->fresh()->entitlementMap()[K::CLASSROOMS_MAX]);

        $draft = $this->withToken($token)->postJson("/api/v1/admin/plans/{$pro->id}/versions", ['notes' => 'v2'])->assertCreated()->json('version');
        $this->assertSame(2, $draft['version']);
        $this->assertSame(5, $draft['entitlements'][K::CLASSROOMS_MAX]); // copiée de la courante
        $this->withToken($token)->postJson("/api/v1/admin/plans/{$pro->id}/versions")->assertStatus(422); // un seul brouillon
        $this->withToken($token)->patchJson("/api/v1/admin/plan-versions/{$draft['id']}", ['entitlements' => [K::CLASSROOMS_MAX => 10]])->assertOk();
        $this->withToken($token)->postJson("/api/v1/admin/plan-versions/{$draft['id']}/publish")->assertOk();

        $this->assertSame('superseded', $current->fresh()->status);
        $show = $this->withToken($token)->getJson("/api/v1/admin/plans/{$pro->id}")->assertOk()->json();
        $this->assertSame(2, $show['plan']['currentVersion']);
        $this->assertCount(1, $show['subscribers']);
        $this->assertSame(1, $show['subscribers'][0]['planVersion']);
    }

    public function test_dupliquer_archiver_et_l_offre_par_defaut_est_unique(): void
    {
        $free = $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $token = $this->tokenOf($this->admin());

        $copy = $this->withToken($token)->postJson("/api/v1/admin/plans/{$pro->id}/duplicate", ['name' => 'Pro 2027'])->assertCreated()->json('plan');
        $this->assertSame('draft', $copy['status']);
        $this->assertSame('teacher-pro-copie', $copy['slug']);
        $this->assertSame(5, $copy['versions'][0]['entitlements'][K::CLASSROOMS_MAX]);

        $this->withToken($token)->patchJson("/api/v1/admin/plans/{$free->id}/status", ['status' => 'archived'])->assertStatus(422); // l'offre par défaut
        $this->withToken($token)->patchJson("/api/v1/admin/plans/{$pro->id}", ['isDefault' => true])->assertOk()->assertJsonPath('plan.isDefault', true);
        $this->assertFalse($free->fresh()->is_default);

        $this->withToken($token)->patchJson("/api/v1/admin/plans/{$free->id}/status", ['status' => 'archived'])->assertOk();
        $this->assertDatabaseHas('plans', ['id' => $free->id, 'status' => Plan::STATUS_ARCHIVED]);
        $this->withToken($this->tokenOf($this->teacher()))->getJson('/api/v1/teacher/plans')->assertOk()->assertJsonMissing(['slug' => 'teacher-free']);
    }

    public function test_seul_un_admin_configure_les_offres(): void
    {
        $this->defaultTeacherPlan();
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/admin/plans', ['name' => 'X', 'type' => 'teacher'])->assertStatus(403);
        $this->withToken($this->tokenOf($this->student()))->getJson('/api/v1/admin/plans')->assertStatus(403);
    }
}
