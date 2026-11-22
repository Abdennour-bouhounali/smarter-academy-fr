<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\Classroom;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Suspendre, reprendre, annuler, prolonger, changer d'offre — et surtout :
 * retomber sur l'offre gratuite sans rien perdre.
 */
class SubscriptionLifecycleTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function activated(): array
    {
        $this->defaultTeacherPlan();
        $pro = $this->paidTeacherPlan();
        $teacher = $this->teacher();
        $admin = $this->admin();
        $subscription = app(SubscriptionActivationService::class)->activate($admin, $teacher, $pro);
        $this->forgetAll();

        return [$teacher, $admin, $pro, $subscription];
    }

    public function test_suspendre_ferme_les_limites_et_le_palier_et_reprendre_les_rouvre(): void
    {
        [$teacher, $admin, , $subscription] = $this->activated();
        $token = $this->tokenOf($admin);
        // Le PALIER : la ligne de droit synchronisée depuis l'abonnement. Le
        // contenu, lui, reste lisible par le rôle enseignant quoi qu'il
        // arrive à l'abonnement (TeacherLearningAccessTest) — ce qui se
        // ferme et se rouvre ici, c'est le droit, et les limites de l'offre.
        $summary = fn () => app(EntitlementService::class)->summarize($teacher);
        $this->assertTrue($summary()['subscriptionActive']);
        $this->assertTrue(app(EntitlementService::class)->satisfies($teacher, AccessTier::PREMIUM));

        $this->withToken($token)->postJson("/api/v1/admin/subscriptions/{$subscription->id}/suspend", ['reason' => 'Impayé'])
            ->assertOk()->assertJsonPath('subscription.status', 'suspended')->assertJsonPath('entitlements.plan.slug', 'teacher-free');
        $this->forgetAll();
        $this->assertFalse($summary()['subscriptionActive']);

        $this->withToken($token)->postJson("/api/v1/admin/subscriptions/{$subscription->id}/resume")
            ->assertOk()->assertJsonPath('subscription.status', 'active')->assertJsonPath('entitlements.plan.slug', 'teacher-pro');
        $this->forgetAll();
        $this->assertTrue($summary()['subscriptionActive']);
    }

    public function test_l_expiration_retombe_sur_le_gratuit_sans_supprimer_les_classes(): void
    {
        Carbon::setTestNow('2026-09-26 10:00:00');
        [$teacher, , , $subscription] = $this->activated();
        $this->grade4am(0);
        $token = $this->tokenOf($teacher);

        foreach (['A', 'B', 'C'] as $name) {
            $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => "4AM {$name}", 'grade' => '4am'])->assertCreated();
        }

        Carbon::setTestNow('2027-10-01 10:00:00');
        $this->forgetAll();
        // Le jeton Sanctum a lui aussi expiré depuis : on en tire un neuf. Ce
        // qu'on observe, c'est l'abonnement, pas la session.
        $token = $this->tokenOf($teacher);

        $entitlements = $this->withToken($token)->getJson('/api/v1/teacher/entitlements')->assertOk()->json('entitlements');
        $this->assertSame('teacher-free', $entitlements['plan']['slug']);
        $this->assertSame(3, $entitlements['classes']['current']);
        $this->assertSame(1, $entitlements['classes']['maximum']);
        $this->assertTrue($entitlements['classes']['overLimit']);
        $this->assertFalse($entitlements['classes']['canCreate']);

        $this->assertSame(3, Classroom::ownedBy($teacher)->count());
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => '4AM D', 'grade' => '4am'])->assertStatus(422)->assertJsonPath('reason', 'limit_reached');
        // Les classes existantes restent consultables.
        $this->withToken($token)->getJson('/api/v1/teacher/classrooms')->assertOk()->assertJsonCount(3, 'classrooms');
        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id]);

        Carbon::setTestNow();
    }

    public function test_annuler_ferme_maintenant_et_prolonger_ranime(): void
    {
        [$teacher, $admin, , $subscription] = $this->activated();
        $token = $this->tokenOf($admin);

        $this->withToken($token)->postJson("/api/v1/admin/subscriptions/{$subscription->id}/cancel", ['reason' => 'Remboursé'])
            ->assertOk()->assertJsonPath('subscription.status', 'cancelled')->assertJsonPath('entitlements.plan.slug', 'teacher-free');

        $this->withToken($token)->postJson("/api/v1/admin/subscriptions/{$subscription->id}/extend", ['endsAt' => now()->addMonths(3)->toIso8601String()])
            ->assertOk()->assertJsonPath('subscription.status', 'active')->assertJsonPath('entitlements.plan.slug', 'teacher-pro');
        $this->withToken($token)->postJson("/api/v1/admin/subscriptions/{$subscription->id}/extend", ['endsAt' => now()->subDay()->toIso8601String()])->assertStatus(422);
    }

    public function test_changer_d_offre_ferme_l_ancien_et_en_cree_un_nouveau(): void
    {
        [$teacher, $admin, , $subscription] = $this->activated();
        $basic = $this->paidTeacherPlan(['classrooms.max' => 3], ['slug' => 'teacher-basic', 'name' => 'Basic']);

        $this->withToken($this->tokenOf($admin))->postJson("/api/v1/admin/subscriptions/{$subscription->id}/change-plan", ['planId' => $basic->id])
            ->assertOk()->assertJsonPath('subscription.plan', 'teacher-basic')->assertJsonPath('entitlements.classes.maximum', 3);

        $this->assertSame('cancelled', $subscription->fresh()->status);
        $this->assertSame(2, Subscription::where('user_id', $teacher->id)->count());
        $this->assertSame(1, Subscription::where('user_id', $teacher->id)->get()->filter->isRunning()->count());
    }

    public function test_un_abonnement_de_fournisseur_ne_se_pilote_pas_ici(): void
    {
        $subscription = Subscription::factory()->create(['provider' => 'stripe', 'external_reference' => 'sub_1']);

        $this->withToken($this->tokenOf($this->admin()))
            ->postJson("/api/v1/admin/subscriptions/{$subscription->id}/suspend")
            ->assertStatus(422);
        $this->assertSame('active', $subscription->fresh()->status);
    }

    public function test_le_statut_de_compte_et_l_abonnement_sont_deux_choses(): void
    {
        [$teacher, $admin] = $this->activated();

        $this->withToken($this->tokenOf($admin))->patchJson("/api/v1/admin/teachers/{$teacher->id}/status", ['status' => 'suspended'])->assertOk();
        $this->assertSame('active', $teacher->subscriptions()->first()->status);
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/dashboard')->assertStatus(403);
    }
}
