<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Subscription;
use App\Notifications\ActivationCodeIssuedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * LE FLUX COMMERCIAL PAR SIÈGES — demande (n'ouvre rien) → activation
 * manuelle avec un nombre d'élèves, ou code portant sa capacité. Le prix
 * et la capacité sont figés sur l'abonnement.
 */
class SeatSubscriptionFlowTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_une_demande_de_sieges_reste_en_attente_sans_acces(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 25])->assertCreated()
            ->assertJsonPath('request.status', 'pending')->assertJsonPath('request.requestedStudentSeats', 25)
            ->assertJsonPath('request.calculatedTotalCents', 2000000)->assertJsonPath('request.currency', 'DZD')
            ->assertJsonPath('entitlements.students.maximum', 5);
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_les_refus_de_demande_portent_un_motif(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_required');
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 5])
            ->assertStatus(422)->assertJsonPath('reason', 'covered_by_default');
        // Une offre dont la grille s'arrête à 30 ne vend pas 31.
        $bounded = $this->seatTeacherPlan([[1, 5, 0], [6, 30, 100000]], [], ['slug' => 'teacher-bounded']);
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $bounded->id, 'studentSeats' => 31])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_not_covered');

        // Sous l'usage : 30 sièges activés, 8 élèves assis, demander 6 est refusé.
        $admin = $this->admin();
        $this->withToken($this->tokenOf($admin))->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 30])->assertCreated();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        for ($i = 0; $i < 8; $i++) {
            $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        }
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 6])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_below_usage');
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 40])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 50])
            ->assertStatus(422)->assertJsonPath('reason', 'already_pending');
    }

    public function test_l_activation_manuelle_porte_la_capacite_et_le_prix(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $admin = $this->admin();
        $teacher = $this->teacher();
        $teacherToken = $this->tokenOf($teacher);
        $adminToken = $this->tokenOf($admin);

        $requestId = $this->withToken($teacherToken)->postJson('/api/v1/teacher/subscription-requests', ['planId' => $plan->id, 'studentSeats' => 25])->json('request.id');

        // Sans nombre : refus. Avec : l'abonnement porte les termes, la demande est honorée.
        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id])->assertStatus(422);
        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 25, 'note' => 'Virement reçu'])->assertCreated()
            ->assertJsonPath('subscription.studentSeatLimit', 25)->assertJsonPath('subscription.seatUnitPriceCents', 80000)
            ->assertJsonPath('subscription.seatTotalCents', 2000000)->assertJsonPath('subscription.seatTierLabel', '21–30')
            ->assertJsonPath('subscription.acquisitionSource', 'manual_admin_activation')
            ->assertJsonPath('entitlements.students.maximum', 25)->assertJsonPath('entitlements.classes.maximum', null)
            ->assertJsonPath('entitlements.plan.studentSeatLimit', 25);
        $this->assertDatabaseHas('subscription_requests', ['id' => $requestId, 'status' => 'fulfilled']);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'subscription.activated']);

        $this->forgetAll();
        $this->withToken($teacherToken)->getJson('/api/v1/teacher/capacity')->assertOk()->assertJsonPath('capacity.limit', 25);

        // Montée : 25 → 30 par changement d'offre, sur la même offre.
        $subId = Subscription::where('user_id', $teacher->id)->value('id');
        $this->withToken($adminToken)->postJson("/api/v1/admin/subscriptions/{$subId}/change-plan", ['planId' => $plan->id, 'studentSeats' => 30])->assertOk()
            ->assertJsonPath('subscription.studentSeatLimit', 30)->assertJsonPath('entitlements.students.maximum', 30);
        $this->assertSame('cancelled', Subscription::find($subId)->status);
    }

    public function test_l_activation_sous_l_usage_est_refusee(): void
    {
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $admin = $this->admin();
        $teacher = $this->teacher();
        $adminToken = $this->tokenOf($admin);

        $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 30])->assertCreated();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        for ($i = 0; $i < 25; $i++) {
            $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        }

        $r = $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$teacher->id}/subscriptions", ['planId' => $plan->id, 'studentSeats' => 20]);
        $r->assertStatus(422);
        $this->assertStringContainsString('encadre déjà 25', $r->json('message'));
        // L'abonnement de 30 est intact.
        $this->assertSame(30, Subscription::where('user_id', $teacher->id)->where('status', 'active')->value('student_seat_limit'));
    }

    public function test_un_code_porte_sa_capacite_quelle_que_soit_la_grille_du_jour(): void
    {
        Notification::fake();
        $this->freeSeatsPlan(5);
        $plan = $this->seatTeacherPlan();
        $admin = $this->admin();
        $adminToken = $this->tokenOf($admin);
        $versionId = $plan->currentVersion->id;

        // Sans capacité : refus. Avec : un lot « 2 codes × 30 élèves ».
        $this->withToken($adminToken)->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'École', 'quantity' => 2, 'planVersionId' => $versionId])->assertStatus(422);
        $batch = $this->withToken($adminToken)->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'École', 'quantity' => 2, 'planVersionId' => $versionId, 'studentSeats' => 30])
            ->assertCreated()->assertJsonPath('batch.studentSeatLimit', 30);
        $codes = collect($batch->json('codes'))->pluck('code')->all();
        $this->assertCount(2, array_unique($codes));

        // Entre-temps la grille change (nouvelle version publiée, 21–30 à 900 DA).
        $draftId = $this->withToken($adminToken)->postJson("/api/v1/admin/plans/{$plan->id}/versions")->json('version.id');
        $this->withToken($adminToken)->putJson("/api/v1/admin/plan-versions/{$draftId}/pricing", ['pricingTiers' => [
            ['minStudents' => 1, 'maxStudents' => 5, 'pricePerStudentCents' => 0],
            ['minStudents' => 6, 'maxStudents' => null, 'pricePerStudentCents' => 90000],
        ]])->assertOk();
        $this->withToken($adminToken)->postJson("/api/v1/admin/plan-versions/{$draftId}/publish")->assertOk();

        // La saisie ouvre 30 sièges sur la version DU LOT, au prix de cette version.
        $teacher = $this->teacher();
        $this->withToken($this->tokenOf($teacher))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]])->assertOk();
        $sub = Subscription::where('user_id', $teacher->id)->firstOrFail();
        $this->assertSame(30, $sub->student_seat_limit);
        $this->assertSame($versionId, $sub->plan_version_id);
        $this->assertSame(80000, $sub->seat_unit_price_cents);
        $this->assertSame('activation_code', $sub->acquisition_source);
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/capacity')->assertOk()->assertJsonPath('capacity.limit', 30);

        // Le même code ne sert pas deux fois ; le second sert un autre enseignant.
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[0]])->assertStatus(422);
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/activation-codes/redeem', ['code' => $codes[1]])->assertOk();

        // Le code INDIVIDUEL envoyé depuis la fiche porte aussi sa capacité.
        $third = $this->teacher();
        $issued = $this->withToken($adminToken)->postJson("/api/v1/admin/teachers/{$third->id}/activation-codes", ['planId' => $plan->id, 'studentSeats' => 12])->assertCreated();
        Notification::assertSentTo($third, ActivationCodeIssuedNotification::class);
        $this->withToken($this->tokenOf($third))->postJson('/api/v1/activation-codes/redeem', ['code' => $issued->json('code.code')])->assertOk();
        $this->assertSame(12, Subscription::where('user_id', $third->id)->value('student_seat_limit'));
        // Sur la version courante (v2) : 12 élèves à 900 DA.
        $this->assertSame(90000, Subscription::where('user_id', $third->id)->value('seat_unit_price_cents'));
    }

    public function test_un_lot_eleve_classique_reste_inchange(): void
    {
        $this->studentPlan();
        $admin = $this->admin();
        $adminToken = $this->tokenOf($admin);

        // Un lot sans offre refuse un nombre de sièges ; un lot élève lié à une offre classique n'en a pas besoin.
        $this->withToken($adminToken)->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'Cartes', 'quantity' => 1, 'studentSeats' => 10])->assertStatus(422);
        $this->withToken($adminToken)->postJson('/api/v1/admin/activation-codes/batches', ['label' => 'Cartes', 'quantity' => 1])->assertCreated()->assertJsonPath('batch.studentSeatLimit', null);
    }
}
