<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Ce qu'un élève ne peut PAS faire.
 *
 * La règle qui domine toute cette couche :
 *
 *     l'accès premium ne dérive JAMAIS que d'un droit valide
 *
 * Ni d'un retour de paiement, ni d'une ligne `payments`, ni d'un identifiant
 * de client fournisseur, ni d'une affirmation du frontend. Le client n'est
 * jamais l'autorité.
 *
 * Beaucoup de ces tests vérifient une ABSENCE — qu'aucune route n'existe pour
 * faire la chose. C'est volontaire : la meilleure protection contre un point
 * d'entrée dangereux est qu'il n'y en ait pas, et un test qui constate le 404
 * ou le 405 empêche qu'on en ajoute un par mégarde.
 */
class BillingSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private User $other;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->other = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function hasPremium(?User $user = null): bool
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class)->satisfies(($user ?? $this->student)->fresh(), AccessTier::PREMIUM);
    }

    /** Une leçon du registre, avec sa hiérarchie minimale. */
    private function lesson(string $code, string $tier, string $publication): Lesson
    {
        $grade = Grade::firstOrCreate(['code' => '2nde'], ['name' => '2nde', 'level' => 'lycee']);
        $chapter = Chapter::firstOrCreate(
            ['grade_id' => $grade->id, 'code' => 'fonctions'],
            ['title' => 'Fonctions', 'order' => 0],
        );

        return Lesson::create([
            'chapter_id' => $chapter->id,
            'code' => $code,
            'title' => 'Leçon',
            'status' => 'available',
            'order' => 0,
            'tier' => $tier,
            'publication_status' => $publication,
        ]);
    }

    /** Une sauvegarde de progression VALIDE : on veut atteindre la décision
     *  d'accès, pas s'arrêter à la validation de forme. */
    private function progressPayload(): array
    {
        return [
            'completedModules' => ['1'],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => Carbon::now()->toIso8601String(),
        ];
    }

    /** Un abonnement actif chez le fournisseur, pour un élève donné. */
    private function subscribe(User $user, string $reference = 'sub_1'): Subscription
    {
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'test',
            providerSubscriptionId: $reference,
            providerCustomerId: 'cus_'.$user->id,
            providerStatus: 'active',
            providerPriceId: null,
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: Carbon::now()->addMonth(),
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $user->id,
        ));

        return Subscription::where('external_reference', $reference)->firstOrFail();
    }

    // ── La forge côté client ────────────────────────────────────────────

    public function test_a_student_cannot_declare_a_payment_successful(): void
    {
        Sanctum::actingAs($this->student);

        // Aucune de ces routes n'existe, et c'est LA protection.
        foreach ([
            '/api/v1/payments',
            '/api/v1/payments/success',
            '/api/v1/checkout/success',
            '/api/v1/subscriptions',
            '/api/v1/me/subscription',
        ] as $route) {
            $response = $this->postJson($route, [
                'status' => 'succeeded',
                'amount_cents' => 3500,
                'subscription_id' => 'sub_forge',
            ]);

            $this->assertContains(
                $response->status(),
                [404, 405],
                "La route {$route} répond {$response->status()} : un élève ne doit disposer d'AUCUN point d'entrée vers la facturation."
            );
        }

        $this->assertSame(0, Payment::count());
        $this->assertSame(0, Subscription::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_a_student_cannot_create_an_entitlement(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/me/access', ['type' => Entitlement::TYPE_SUBSCRIPTION])
            ->assertStatus(405);

        $this->assertSame(0, Entitlement::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_a_student_cannot_grant_himself_an_admin_override(): void
    {
        Sanctum::actingAs($this->student);

        // La route existe, mais elle est derrière `can:admin`.
        $this->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
            'reason' => 'je me sers',
        ])->assertStatus(403);

        $this->assertSame(0, Entitlement::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_the_access_summary_is_read_only(): void
    {
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/me/access')->assertOk();

        foreach (['putJson', 'patchJson', 'deleteJson'] as $verb) {
            $this->{$verb}('/api/v1/me/access', ['premiumAccess' => true])->assertStatus(405);
        }

        $this->assertFalse($this->hasPremium());
    }

    // ── Le cloisonnement entre élèves ───────────────────────────────────

    public function test_a_student_never_sees_another_students_billing(): void
    {
        $this->subscribe($this->other, 'sub_other');

        Sanctum::actingAs($this->student);

        // L'élève n'a AUCUNE route vers l'abonnement d'autrui : ni la sienne
        // (qui n'existe pas), ni celle de l'administration.
        $this->getJson("/api/v1/admin/students/{$this->other->id}/entitlements")
            ->assertStatus(403);

        $this->getJson('/api/v1/admin/subscriptions')->assertStatus(403);
        $this->getJson('/api/v1/admin/payments')->assertStatus(403);
    }

    public function test_the_access_summary_only_ever_describes_its_own_caller(): void
    {
        $this->subscribe($this->other, 'sub_other');

        Sanctum::actingAs($this->student);

        // L'abonnement de l'autre élève ne fuit pas dans MON résumé, et aucun
        // paramètre ne permet de demander celui de quelqu'un d'autre.
        $response = $this->getJson('/api/v1/me/access?user_id='.$this->other->id)->assertOk();

        $response->assertJsonPath('access.premiumAccess', false);
        $response->assertJsonPath('access.subscriptionActive', false);
    }

    public function test_the_access_summary_never_exposes_provider_references(): void
    {
        $this->subscribe($this->student);

        Sanctum::actingAs($this->student);
        $body = $this->getJson('/api/v1/me/access')->assertOk()->getContent();

        // Un élève n'a pas besoin de la référence externe de son abonnement
        // pour savoir qu'il est actif.
        foreach (['sub_1', 'cus_', 'external_reference', 'provider_customer_id'] as $leak) {
            $this->assertStringNotContainsString($leak, $body);
        }
    }

    // ── Le contenu reste protégé ────────────────────────────────────────

    public function test_a_direct_premium_url_stays_closed_without_an_entitlement(): void
    {
        $this->lesson('lecon-payante', AccessTier::PREMIUM, Lesson::PUB_PUBLISHED);

        Sanctum::actingAs($this->student);

        // La progression est le point d'entrée en ÉCRITURE : c'est lui qui
        // doit refuser, pas seulement l'affichage.
        // 422 et non 403 : c'est la convention déjà établie de cette route
        // (voir LessonProgressController). Ce qui compte ici est le REFUS.
        $this->putJson('/api/v1/lessons/lecon-payante/progress', $this->progressPayload())
            ->assertStatus(422);

        $this->assertDatabaseCount('student_lesson_progress', 0);
    }

    public function test_publication_still_wins_over_a_valid_subscription(): void
    {
        $this->lesson('lecon-masquee', AccessTier::PREMIUM, Lesson::PUB_DRAFT);

        $this->subscribe($this->student);
        $this->assertTrue($this->hasPremium());

        Sanctum::actingAs($this->student);

        // Payer n'ouvre pas ce qui n'est pas publié. Un contenu masqué l'est
        // parce qu'il est faux ou en relecture — le montrer à quelqu'un qui a
        // payé serait pire, pas mieux.
        $this->putJson('/api/v1/lessons/lecon-masquee/progress', $this->progressPayload())
            ->assertStatus(422);

        $this->assertDatabaseCount('student_lesson_progress', 0);
    }

    // ── L'administration ────────────────────────────────────────────────

    public function test_an_admin_cannot_fabricate_a_subscription_entitlement(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        Sanctum::actingAs($admin);

        // L'administration ne connaît QUE la dérogation. Même en demandant
        // explicitement un droit d'abonnement, elle obtient une dérogation —
        // qui porte son nom et se voit dans un audit.
        $this->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
            'type' => Entitlement::TYPE_SUBSCRIPTION,
            'reason' => 'geste commercial',
        ])->assertStatus(201);

        $this->assertSame(0, Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->count());
        $this->assertSame(1, Entitlement::where('type', Entitlement::TYPE_ADMIN_OVERRIDE)->count());
        // Aucun abonnement n'a été inventé : il n'y a rien à réconcilier côté
        // comptabilité.
        $this->assertSame(0, Subscription::count());
    }

    public function test_an_admin_override_is_independent_of_any_subscription(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/override", [
            'reason' => 'test interne',
        ])->assertStatus(201);

        $this->assertTrue($this->hasPremium(), 'La dérogation ouvre seule, sans abonnement.');

        // Et la synchronisation d'abonnement n'y touche pas.
        $this->postJson("/api/v1/admin/students/{$this->student->id}/entitlements/sync")->assertOk();

        $this->assertTrue($this->hasPremium());
        $this->assertSame(1, Entitlement::where('type', Entitlement::TYPE_ADMIN_OVERRIDE)->count());
    }

    // ── La panne du fournisseur ─────────────────────────────────────────

    public function test_content_authorization_never_depends_on_the_provider(): void
    {
        $this->subscribe($this->student);

        $this->lesson('lecon-payante-2', AccessTier::PREMIUM, Lesson::PUB_PUBLISHED);

        // Le secret est retiré : plus aucun webhook ne serait accepté, le
        // fournisseur est de fait « injoignable ».
        config(['services.stripe.webhook_secret' => null, 'services.stripe.secret' => null]);

        Sanctum::actingAs($this->student);

        // L'accès continue de fonctionner : le droit est en base, et rien
        // dans le chemin d'autorisation n'appelle le fournisseur.
        $this->putJson('/api/v1/lessons/lecon-payante-2/progress', $this->progressPayload())
            ->assertOk();

        $this->assertTrue($this->hasPremium());
    }
}
