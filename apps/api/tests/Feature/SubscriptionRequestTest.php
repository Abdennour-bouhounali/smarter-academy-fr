<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\Plan;
use App\Models\SubscriptionRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Une DEMANDE n'active jamais rien : elle attend une décision humaine, et
 * l'offre gratuite reste effective pendant ce temps.
 */
class SubscriptionRequestTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_demander_une_offre_ne_cree_aucun_abonnement(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id, 'note' => 'Je paie en espèces'])
            ->assertCreated()
            ->assertJsonPath('request.status', 'pending')
            ->assertJsonPath('entitlements.plan.slug', 'teacher-free')
            ->assertJsonPath('entitlements.classes.maximum', 1)
            ->assertJsonPath('entitlements.request.planSlug', 'teacher-pro');

        $this->assertDatabaseCount('subscriptions', 0);
        $this->assertDatabaseCount('entitlements', 0);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::SUBSCRIPTION_REQUEST_CREATED, 'user_id' => $teacher->id]);
    }

    public function test_une_seule_demande_en_attente(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $token = $this->tokenOf($this->teacher());

        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id])->assertStatus(422);
        $this->assertDatabaseCount('subscription_requests', 1);
    }

    public function test_les_offres_non_demandables_sont_refusees(): void
    {
        $free = $this->defaultTeacherPlan();
        $hidden = $this->paidTeacherPlan([], ['slug' => 'hidden', 'status' => Plan::STATUS_HIDDEN, 'is_public' => false]);
        $archived = $this->paidTeacherPlan([], ['slug' => 'archived', 'status' => Plan::STATUS_ARCHIVED]);
        $noRequests = $this->paidTeacherPlan([], ['slug' => 'no-req', 'allows_requests' => false]);
        $studentPlan = $this->studentPlan();
        $token = $this->tokenOf($this->teacher());

        foreach ([$free, $hidden, $archived, $noRequests, $studentPlan] as $plan) {
            $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id])
                ->assertStatus(422, "plan {$plan->slug}");
        }
        $this->assertDatabaseCount('subscription_requests', 0);
    }

    public function test_annuler_puis_redemander(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $token = $this->tokenOf($this->teacher());

        $id = $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id])->json('request.id');
        $this->withToken($token)->postJson("/api/v1/teacher/subscription-requests/{$id}/cancel")->assertOk()->assertJsonPath('request.status', 'cancelled');
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id])->assertCreated();
    }

    public function test_un_autre_compte_ne_peut_pas_annuler_ma_demande(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $mine = $this->teacher();
        $request = SubscriptionRequest::factory()->create(['user_id' => $mine->id, 'requested_plan_id' => $pro->id]);

        $this->withToken($this->tokenOf($this->teacher()))
            ->postJson("/api/v1/teacher/subscription-requests/{$request->id}/cancel")
            ->assertStatus(404);
        $this->assertSame('pending', $request->fresh()->status);
    }

    public function test_le_refus_garde_la_demande_et_son_motif_et_l_offre_gratuite_reste(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $admin = $this->admin();
        $request = SubscriptionRequest::factory()->create(['user_id' => $teacher->id, 'requested_plan_id' => $pro->id]);

        $this->withToken($this->tokenOf($admin))
            ->postJson("/api/v1/admin/subscription-requests/{$request->id}/reject", ['reason' => 'Paiement non reçu'])
            ->assertOk()
            ->assertJsonPath('request.status', 'rejected')
            ->assertJsonPath('request.rejectionReason', 'Paiement non reçu');

        $this->assertDatabaseHas('subscription_requests', ['id' => $request->id, 'status' => 'rejected', 'reviewed_by' => $admin->id]);
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')
            ->assertJsonPath('entitlements.plan.slug', 'teacher-free')
            ->assertJsonPath('entitlements.request', null);

        // Une nouvelle demande reste possible.
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/teacher/subscription-requests', ['planId' => $pro->id])->assertCreated();
    }

    public function test_un_eleve_demande_une_offre_eleve_par_les_memes_routes(): void
    {
        $plan = $this->studentPlan();
        $token = $this->tokenOf($this->student());

        $this->withToken($token)->getJson('/api/v1/me/plans')->assertOk()->assertJsonPath('plans.0.slug', 'student-premium');
        $this->withToken($token)->postJson('/api/v1/me/subscription-requests', ['planId' => $plan->id])->assertCreated();
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_seul_un_admin_refuse(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $request = SubscriptionRequest::factory()->create(['requested_plan_id' => $pro->id]);

        $this->withToken($this->tokenOf($this->teacher()))->postJson("/api/v1/admin/subscription-requests/{$request->id}/reject", ['reason' => 'x'])->assertStatus(403);
        $this->withToken($this->tokenOf($this->student()))->postJson("/api/v1/admin/subscription-requests/{$request->id}/reject", ['reason' => 'x'])->assertStatus(403);
    }
}
