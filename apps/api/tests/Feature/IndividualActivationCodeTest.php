<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\SubscriptionRequest;
use App\Notifications\ActivationCodeIssuedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La vente INDIVIDUELLE par code : l'administrateur envoie UN code unique
 * lié à l'offre depuis la fiche du compte.
 */
class IndividualActivationCodeTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_l_admin_envoie_un_code_a_un_enseignant_qui_l_active(): void
    {
        Notification::fake();
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $admin = $this->admin();
        $request = SubscriptionRequest::factory()->create(['user_id' => $teacher->id, 'requested_plan_id' => $pro->id]);

        $response = $this->withToken($this->tokenOf($admin))
            ->postJson("/api/v1/admin/teachers/{$teacher->id}/activation-codes", ['planId' => $pro->id, 'accessDays' => 365])
            ->assertCreated()
            ->assertJsonPath('codesShownOnce', true)
            ->assertJsonPath('sentTo', $teacher->email)
            ->assertJsonPath('batch.quantity', 1)
            ->assertJsonPath('batch.recipientUserId', $teacher->id);

        Notification::assertSentTo($teacher, ActivationCodeIssuedNotification::class);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::ACTIVATION_CODE_ISSUED, 'user_id' => $admin->id]);

        $code = $response->json('code.code');
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/activation-codes/redeem', ['code' => $code])->assertOk();

        $this->assertDatabaseHas('subscriptions', ['user_id' => $teacher->id, 'plan' => 'teacher-pro', 'acquisition_source' => 'activation_code']);
        $this->assertDatabaseHas('subscription_requests', ['id' => $request->id, 'status' => 'fulfilled']);
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')->assertJsonPath('entitlements.classes.maximum', 5);

        // La fiche liste le code envoyé, activé.
        $this->withToken($this->tokenOf($admin))->getJson("/api/v1/admin/teachers/{$teacher->id}/subscription")
            ->assertOk()->assertJsonPath('issuedCodes.0.status', 'activated');
    }

    public function test_l_admin_envoie_un_code_a_un_eleve(): void
    {
        Notification::fake();
        $plan = $this->studentPlan();
        $student = $this->student();

        $code = $this->withToken($this->tokenOf($this->admin()))
            ->postJson("/api/v1/admin/students/{$student->id}/activation-codes", ['planId' => $plan->id])
            ->assertCreated()->json('code.code');

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/activation-codes/redeem', ['code' => $code])->assertOk()
            ->assertJsonPath('access.subscriptionActive', true);
    }

    public function test_le_mauvais_type_d_offre_est_refuse(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $student = $this->student();

        $this->withToken($this->tokenOf($this->admin()))
            ->postJson("/api/v1/admin/students/{$student->id}/activation-codes", ['planId' => $pro->id])
            ->assertStatus(422);
        $this->assertDatabaseCount('activation_codes', 0);
    }

    public function test_seul_un_admin_envoie_des_codes(): void
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();

        $this->withToken($this->tokenOf($teacher))->postJson("/api/v1/admin/teachers/{$teacher->id}/activation-codes", ['planId' => $pro->id])->assertStatus(403);
        $this->withToken($this->tokenOf($this->student()))->postJson("/api/v1/admin/teachers/{$teacher->id}/activation-codes", ['planId' => $pro->id])->assertStatus(403);
        $this->assertDatabaseCount('activation_codes', 0);
    }
}
