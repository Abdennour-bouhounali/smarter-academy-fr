<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Models\Entitlement;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Le cycle de vie de l'abonnement APRÈS l'achat — phase 7.
 *
 * L'invariant que ce fichier défend :
 *
 *     gérer son abonnement ne déplace JAMAIS la frontière de l'accès
 *
 * Résilier n'écrit aucun droit. Reprendre non plus. Ouvrir le portail non
 * plus. Ces gestes expriment une intention CHEZ LE FOURNISSEUR, et seul le
 * webhook signé la rend vraie localement — c'est la règle de la phase 5, et
 * la phase 7 ne l'assouplit pas.
 *
 * La conséquence la plus visible pour l'élève : résilier ne lui retire rien
 * tout de suite. Il a payé jusqu'à une date, il la garde.
 */
class SubscriptionLifecycleApiTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        config([
            'billing.provider' => 'fake_checkout',
            'billing.mode' => 'test',
            'billing.plans' => [
                'annual' => [
                    'key' => 'annual', 'name' => 'Premium annuel',
                    'price_id' => 'price_annuel_test',
                    'amount_cents' => 3500, 'currency' => 'EUR',
                    'interval' => 'year', 'active' => true,
                ],
            ],
            'billing.return_urls.portal' => 'https://exemple.test/abonnement',
        ]);

        app(PaymentProviderRegistry::class)->register(new FakeCheckoutProvider);
    }

    private function provider(): FakeCheckoutProvider
    {
        return app(PaymentProviderRegistry::class)->get('fake_checkout');
    }

    private function hasPremium(?User $user = null): bool
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class)->satisfies(($user ?? $this->student)->fresh(), AccessTier::PREMIUM);
    }

    /** Un abonnement né d'un webhook, comme dans la vraie vie. */
    private function subscribe(
        ?User $user = null,
        string $status = 'active',
        ?Carbon $endsAt = null,
        bool $cancelAtPeriodEnd = false,
    ): Subscription {
        $user ??= $this->student;

        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout',
            providerSubscriptionId: 'sub_'.$user->id,
            providerCustomerId: 'cus_'.$user->id,
            providerStatus: $status,
            providerPriceId: 'price_annuel_test',
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: $endsAt ?? Carbon::now()->addMonth(),
            cancelAtPeriodEnd: $cancelAtPeriodEnd,
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $user->id,
        ));

        return Subscription::where('external_reference', 'sub_'.$user->id)->firstOrFail();
    }

    // ── La lecture d'état : la matrice ──────────────────────────────────

    public function test_a_student_without_a_subscription_sees_an_empty_state(): void
    {
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('billing.subscription', null)
            ->assertJsonPath('billing.accessActive', false)
            ->assertJsonPath('billing.canCancel', false)
            ->assertJsonPath('billing.canResume', false)
            ->assertJsonPath('billing.canManage', false);
    }

    public function test_an_active_subscription_is_reported_with_its_term(): void
    {
        $subscription = $this->subscribe();
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('billing.accessActive', true)
            ->assertJsonPath('billing.subscription.status', Subscription::STATUS_ACTIVE)
            ->assertJsonPath('billing.subscription.plan', 'annual')
            ->assertJsonPath('billing.subscription.planName', 'Premium annuel')
            ->assertJsonPath('billing.subscription.amountCents', 3500)
            ->assertJsonPath('billing.subscription.currency', 'EUR')
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', false)
            // Résiliable, et rien à reprendre.
            ->assertJsonPath('billing.canCancel', true)
            ->assertJsonPath('billing.canResume', false)
            ->assertJsonPath('billing.canManage', true);

        $this->assertNotNull($subscription->ends_at);
    }

    public function test_a_subscription_scheduled_to_cancel_offers_resume_not_cancel(): void
    {
        $this->subscribe(cancelAtPeriodEnd: true);
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            // L'accès est TOUJOURS ouvert : la période payée court encore.
            ->assertJsonPath('billing.accessActive', true)
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', true)
            ->assertJsonPath('billing.canCancel', false)
            ->assertJsonPath('billing.canResume', true);
    }

    public function test_an_expired_subscription_is_shown_without_access(): void
    {
        $this->subscribe(status: 'canceled', endsAt: Carbon::now()->subDay());
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('billing.accessActive', false)
            // L'abonnement reste VISIBLE : l'élève doit lire « terminé »,
            // pas un écran qui prétend qu'il n'a jamais rien acheté.
            ->assertJsonPath('billing.subscription.status', Subscription::STATUS_EXPIRED)
            ->assertJsonPath('billing.canCancel', false)
            ->assertJsonPath('billing.canResume', false);
    }

    public function test_an_admin_override_is_reported_without_inventing_a_subscription(): void
    {
        Entitlement::create([
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
            'tier' => AccessTier::PREMIUM,
            'starts_at' => Carbon::now()->subDay(),
            'expires_at' => Carbon::now()->addMonth(),
            'status' => Entitlement::STATUS_ACTIVE,
            'source' => 'admin',
            'reference' => 'override:1',
        ]);

        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('billing.accessActive', true)
            ->assertJsonPath('billing.adminOverrideActive', true)
            // Aucun abonnement n'est inventé pour justifier l'accès.
            ->assertJsonPath('billing.subscription', null)
            ->assertJsonPath('billing.canCancel', false);
    }

    public function test_a_pending_subscription_grants_nothing_and_cancels_nothing(): void
    {
        $this->subscribe(status: 'incomplete');
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')
            ->assertOk()
            ->assertJsonPath('billing.accessActive', false)
            ->assertJsonPath('billing.canCancel', false);
    }

    public function test_the_state_never_exposes_provider_identifiers(): void
    {
        $this->subscribe();
        Sanctum::actingAs($this->student);

        $body = $this->getJson('/api/v1/billing/subscription')->assertOk()->getContent();

        // Ni le client, ni l'abonnement, ni le tarif chez le fournisseur :
        // ils n'apprennent rien à un élève et invitent à les remplacer.
        $this->assertStringNotContainsString('cus_', $body);
        $this->assertStringNotContainsString('sub_', $body);
        $this->assertStringNotContainsString('price_annuel_test', $body);
    }

    // ── La résiliation ──────────────────────────────────────────────────

    public function test_cancelling_keeps_access_until_the_paid_period_ends(): void
    {
        $subscription = $this->subscribe();
        $this->assertTrue($this->hasPremium());

        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/cancel')
            ->assertOk()
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', true)
            ->assertJsonPath('billing.accessActive', true);

        // LE point de la phase 7 : l'accès n'est pas retiré. L'élève a payé
        // ces jours-là.
        $this->assertTrue($this->hasPremium(), 'Résilier a retiré un accès déjà payé.');

        // Le fournisseur a bien reçu l'ordre, sur SON identifiant.
        $this->assertSame('cancel', $this->provider()->lastCall['operation']);
        $this->assertSame('sub_'.$this->student->id, $this->provider()->lastCall['providerSubscriptionId']);

        // Et les deux champs dont dépend l'accès n'ont PAS bougé : seul le
        // webhook a le droit d'y toucher.
        $subscription->refresh();
        $this->assertSame(Subscription::STATUS_ACTIVE, $subscription->status);
        $this->assertTrue($subscription->cancel_at_period_end);
    }

    public function test_cancelling_twice_is_idempotent(): void
    {
        $this->subscribe();
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/cancel')->assertOk();
        $this->provider()->lastCall = null;

        // Un double clic, ou un rafraîchissement de page.
        $this->postJson('/api/v1/billing/subscription/cancel')
            ->assertOk()
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', true);

        // Le fournisseur n'est PAS rappelé : l'état est déjà celui demandé.
        $this->assertNull($this->provider()->lastCall, 'Une seconde résiliation a rappelé le fournisseur.');
        $this->assertTrue($this->hasPremium());
    }

    public function test_cancelling_without_a_subscription_is_refused(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/cancel')->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_cancelling_never_creates_or_revokes_an_entitlement(): void
    {
        $this->subscribe();
        $before = Entitlement::count();

        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/subscription/cancel')->assertOk();

        $this->assertSame($before, Entitlement::count(), 'La résiliation a écrit dans les droits.');
        $this->assertSame(
            Entitlement::STATUS_ACTIVE,
            Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->firstOrFail()->status
        );
    }

    // ── La reprise ──────────────────────────────────────────────────────

    public function test_resuming_clears_the_scheduled_cancellation(): void
    {
        $this->subscribe(cancelAtPeriodEnd: true);
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/resume')
            ->assertOk()
            ->assertJsonPath('billing.subscription.cancelAtPeriodEnd', false)
            ->assertJsonPath('billing.canCancel', true)
            ->assertJsonPath('billing.canResume', false);

        $this->assertSame('resume', $this->provider()->lastCall['operation']);
        $this->assertTrue($this->hasPremium());
    }

    public function test_resuming_an_expired_subscription_is_refused(): void
    {
        $this->subscribe(status: 'canceled', endsAt: Carbon::now()->subDay());
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/resume')->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
        $this->assertFalse($this->hasPremium());
    }

    // ── Le portail ──────────────────────────────────────────────────────

    public function test_the_portal_is_opened_for_the_students_own_customer(): void
    {
        $this->subscribe();
        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/v1/billing/portal')->assertOk();

        $this->assertStringStartsWith('https://', $response->json('portalUrl'));

        // Le client transmis est celui de SON abonnement, et l'URL de retour
        // vient du serveur.
        $this->assertSame('cus_'.$this->student->id, $this->provider()->lastCall['customerId']);
        $this->assertSame('https://exemple.test/abonnement', $this->provider()->lastCall['returnUrl']);
    }

    public function test_the_portal_is_refused_without_a_provider_customer(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/portal')->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_the_portal_never_grants_access(): void
    {
        $this->subscribe(status: 'canceled', endsAt: Carbon::now()->subDay());
        Sanctum::actingAs($this->student);

        // Le portail refuse ici (plus d'abonnement pilotable), mais la
        // vérification qui compte est la suivante : rien n'a été ouvert.
        $this->postJson('/api/v1/billing/portal');

        $this->assertFalse($this->hasPremium());
    }

    // ── L'appartenance : ce que la phase 7 ne doit pas casser ───────────

    /**
     * L'IDOR n'est pas défendue par un contrôle, mais par une ABSENCE : il
     * n'existe aucun paramètre par lequel désigner l'abonnement d'autrui.
     * Ces tests le vérifient en essayant quand même.
     */
    public function test_a_student_cannot_cancel_another_students_subscription(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $victimSubscription = $this->subscribe($victim);

        $attacker = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Sanctum::actingAs($attacker);

        // L'attaquant désigne explicitement la victime, de toutes les façons
        // qu'une API pourrait naïvement accepter.
        $this->postJson('/api/v1/billing/subscription/cancel', [
            'user_id' => $victim->id,
            'subscription_id' => $victimSubscription->id,
            'external_reference' => $victimSubscription->external_reference,
            'customer_id' => 'cus_'.$victim->id,
        ])->assertStatus(422);

        // Rien n'est parti au fournisseur, et la victime est intacte.
        $this->assertNull($this->provider()->lastCall);
        $this->assertFalse($victimSubscription->refresh()->cancel_at_period_end);
        $this->assertTrue($this->hasPremium($victim));
    }

    public function test_a_student_cannot_open_another_students_portal(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->subscribe($victim);

        $attacker = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Sanctum::actingAs($attacker);

        $this->postJson('/api/v1/billing/portal', [
            'customer_id' => 'cus_'.$victim->id,
            'customerId' => 'cus_'.$victim->id,
            'user_id' => $victim->id,
        ])->assertStatus(422);

        // Le champ n'est même pas lu : aucun appel n'est parti.
        $this->assertNull($this->provider()->lastCall);
    }

    public function test_a_student_cannot_resume_another_students_subscription(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $victimSubscription = $this->subscribe($victim, cancelAtPeriodEnd: true);

        $attacker = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Sanctum::actingAs($attacker);

        $this->postJson('/api/v1/billing/subscription/resume', [
            'subscription_id' => $victimSubscription->id,
            'user_id' => $victim->id,
        ])->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
        $this->assertTrue($victimSubscription->refresh()->cancel_at_period_end);
    }

    /**
     * Deux élèves abonnés : chacun ne pilote que le sien.
     *
     * Le cas le plus insidieux — l'attaquant a un abonnement légitime, donc
     * l'appel RÉUSSIT. Ce qu'on vérifie, c'est qu'il a agi sur SA ligne.
     */
    public function test_a_subscribed_student_cancelling_only_touches_their_own(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $victimSubscription = $this->subscribe($victim);

        $mine = $this->subscribe();
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/cancel', [
            'subscription_id' => $victimSubscription->id,
            'external_reference' => $victimSubscription->external_reference,
        ])->assertOk();

        // C'est SON abonnement qui est parti au fournisseur.
        $this->assertSame('sub_'.$this->student->id, $this->provider()->lastCall['providerSubscriptionId']);
        $this->assertTrue($mine->refresh()->cancel_at_period_end);
        // La victime n'a pas bougé.
        $this->assertFalse($victimSubscription->refresh()->cancel_at_period_end);
    }

    // ── L'authentification ──────────────────────────────────────────────

    public function test_a_guest_is_refused_on_every_billing_route(): void
    {
        $this->getJson('/api/v1/billing/subscription')->assertStatus(401);
        $this->postJson('/api/v1/billing/portal')->assertStatus(401);
        $this->postJson('/api/v1/billing/subscription/cancel')->assertStatus(401);
        $this->postJson('/api/v1/billing/subscription/resume')->assertStatus(401);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_a_suspended_account_is_refused_on_every_billing_route(): void
    {
        $this->subscribe();
        $this->student->update(['account_status' => User::STATUS_SUSPENDED]);
        Sanctum::actingAs($this->student);

        $this->getJson('/api/v1/billing/subscription')->assertStatus(403);
        $this->postJson('/api/v1/billing/portal')->assertStatus(403);
        $this->postJson('/api/v1/billing/subscription/cancel')->assertStatus(403);
        $this->postJson('/api/v1/billing/subscription/resume')->assertStatus(403);

        $this->assertNull($this->provider()->lastCall);
    }

    // ── La panne du fournisseur ─────────────────────────────────────────

    public function test_a_provider_failure_is_reported_without_leaking_its_message(): void
    {
        $this->subscribe();
        $this->provider()->failWith('Stripe: invalid api key sk_live_secret_xyz');

        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/v1/billing/subscription/cancel')->assertStatus(503);

        $this->assertStringNotContainsString('sk_live', $response->getContent());
        $this->assertStringNotContainsString('invalid api key', $response->getContent());

        // Une panne ne laisse AUCUNE trace locale : l'intention n'a pas eu
        // lieu chez le fournisseur, elle ne doit pas être affichée comme
        // acquise.
        $this->assertFalse(Subscription::firstOrFail()->cancel_at_period_end);
        $this->assertTrue($this->hasPremium());
    }

    public function test_a_portal_failure_does_not_change_any_state(): void
    {
        $this->subscribe();
        $this->provider()->failWith('panne');

        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/portal')->assertStatus(503);

        $this->assertTrue($this->hasPremium());
        $this->assertFalse(Subscription::firstOrFail()->cancel_at_period_end);
    }

    // ── Le webhook reste l'autorité ─────────────────────────────────────

    /**
     * Après une résiliation programmée, c'est le webhook de FIN qui ferme
     * l'accès — pas l'appel de l'élève.
     */
    public function test_the_webhook_closes_the_access_not_the_cancel_call(): void
    {
        $this->subscribe();
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/subscription/cancel')->assertOk();
        $this->assertTrue($this->hasPremium(), 'L\'accès devait rester ouvert jusqu\'au terme.');

        // La période s'achève : le fournisseur émet la suppression.
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout',
            providerSubscriptionId: 'sub_'.$this->student->id,
            providerCustomerId: 'cus_'.$this->student->id,
            providerStatus: 'canceled',
            providerPriceId: 'price_annuel_test',
            currentPeriodStart: Carbon::now()->subMonth(),
            currentPeriodEnd: Carbon::now(),
            occurredAt: Carbon::now()->addSecond(),
            deleted: true,
            clientReferenceId: (string) $this->student->id,
        ));

        // MAINTENANT l'accès se ferme.
        $this->assertFalse($this->hasPremium(), 'Le webhook de suppression n\'a pas fermé l\'accès.');
    }
}
