<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Admin\ActivityLogger;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * L'activation MANUELLE : après règlement hors plateforme, l'administrateur
 * active l'offre sur le compte, et ses limites sont effectives aussitôt.
 */
class SubscriptionActivationTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_l_admin_active_une_offre_enseignant_et_les_limites_montent_aussitot(): void
    {
        Carbon::setTestNow('2026-09-26 10:00:00');
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $admin = $this->admin();
        $request = SubscriptionRequest::factory()->create(['user_id' => $teacher->id, 'requested_plan_id' => $pro->id]);

        $this->withToken($this->tokenOf($admin))
            ->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $pro->id, 'note' => 'Payé en espèces'])
            ->assertCreated()
            ->assertJsonPath('subscription.status', 'active')
            ->assertJsonPath('subscription.acquisitionSource', 'manual_admin_activation')
            ->assertJsonPath('subscription.planVersion', 1)
            ->assertJsonPath('entitlements.plan.slug', 'teacher-pro')
            ->assertJsonPath('entitlements.plan.source', 'subscription')
            ->assertJsonPath('entitlements.classes.maximum', 5);

        $subscription = Subscription::firstOrFail();
        $this->assertSame($admin->id, $subscription->granted_by);
        $this->assertSame('manual', $subscription->provider);
        $this->assertSame('2027-09-26', $subscription->ends_at->toDateString());
        $this->assertDatabaseHas('subscription_requests', ['id' => $request->id, 'status' => 'fulfilled', 'subscription_id' => $subscription->id]);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::SUBSCRIPTION_ACTIVATED, 'user_id' => $admin->id]);
        // Le droit d'accès payant de l'enseignant découle de la synchronisation existante.
        $this->assertDatabaseHas('entitlements', ['user_id' => $teacher->id, 'type' => 'subscription', 'status' => 'active']);

        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')
            ->assertJsonPath('entitlements.classes.maximum', 5)
            ->assertJsonPath('entitlements.plan.endsAt', '2027-09-26T10:00:00+00:00');

        Carbon::setTestNow();
    }

    public function test_l_admin_active_une_offre_eleve_et_le_palier_payant_s_ouvre(): void
    {
        $plan = $this->studentPlan();
        $student = $this->student();

        $this->assertFalse(app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM));

        $this->withToken($this->tokenOf($this->admin()))
            ->postJson("/api/v1/admin/students/{$student->id}/subscriptions", ['planId' => $plan->id])
            ->assertCreated();

        $this->forgetAll();
        $this->assertTrue(app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM));
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/me/access')->assertJsonPath('access.subscriptionActive', true);
    }

    public function test_offre_par_defaut_archivee_ou_du_mauvais_type_refusees(): void
    {
        $free = $this->defaultTeacherPlan();
        $archived = $this->paidTeacherPlan([], ['slug' => 'old', 'status' => Plan::STATUS_ARCHIVED]);
        $studentPlan = $this->studentPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($this->admin());

        foreach ([$free, $archived, $studentPlan] as $plan) {
            $this->withToken($token)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id])->assertStatus(422);
        }
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_une_version_figee_reste_celle_de_l_abonnement(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $admin = $this->admin();
        $adminToken = $this->tokenOf($admin);

        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $pro->id])->assertCreated();

        // L'admin fait évoluer l'offre : nouvelle version à 10 classes, publiée.
        $versionId = $this->withToken($adminToken)->postJson("/api/v1/admin/plans/{$pro->id}/versions")->assertCreated()->json('version.id');
        $this->withToken($adminToken)->patchJson("/api/v1/admin/plan-versions/{$versionId}", ['entitlements' => ['classrooms.max' => 10]])->assertOk();
        $this->withToken($adminToken)->postJson("/api/v1/admin/plan-versions/{$versionId}/publish")->assertOk();

        // L'abonné existant garde ses 5 classes ; un nouvel abonné en aura 10.
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')->assertJsonPath('entitlements.classes.maximum', 5);

        $other = $this->teacher();
        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$other->id}/subscriptions", ['planId' => $pro->id])->assertCreated()
            ->assertJsonPath('subscription.planVersion', 2)
            ->assertJsonPath('entitlements.classes.maximum', 10);
    }

    public function test_seul_un_admin_active(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();

        $this->withToken($this->tokenOf($teacher))->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $pro->id])->assertStatus(403);
        $this->withToken($this->tokenOf($this->student()))->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $pro->id])->assertStatus(403);
        $this->assertDatabaseCount('subscriptions', 0);
    }
}
