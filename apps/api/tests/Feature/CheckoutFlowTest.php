<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\CheckoutSession;
use App\Domain\Billing\PaymentProvider;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\PortalSession;
use App\Domain\Billing\ProviderEventFormatException;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Billing\TranslatedEvent;
use App\Models\Entitlement;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * L'entrée en paiement — et ce qu'elle n'ouvre PAS.
 *
 * L'invariant que ce fichier défend, phrase par phrase :
 *
 *     ouvrir une session de paiement n'accorde AUCUN accès
 *
 * Ni la session, ni le retour de navigateur, ni une ligne `payments` ne
 * touchent aux droits. Seul le webhook signé le fait, et il est testé
 * ailleurs (ProviderWebhookIdempotencyTest).
 */
class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        // Un fournisseur d'essai : toute la chaîne se teste sans SDK ni
        // réseau, ce qui est précisément ce que la frontière neutre permet.
        config([
            'billing.provider' => 'fake_checkout',
            'billing.mode' => 'test',
            'billing.plans' => [
                'annual' => [
                    'key' => 'annual', 'name' => 'Premium annuel',
                    'description' => 'Tout le programme.',
                    'price_id' => 'price_annuel_test',
                    'amount_cents' => 3500, 'currency' => 'EUR',
                    'interval' => 'year', 'active' => true,
                ],
                'inactive' => [
                    'key' => 'inactive', 'name' => 'Offre retirée',
                    'price_id' => 'price_x', 'amount_cents' => 100,
                    'currency' => 'EUR', 'interval' => 'month', 'active' => false,
                ],
                'unconfigured' => [
                    'key' => 'unconfigured', 'name' => 'Offre sans tarif',
                    // Le cas d'un environnement où la variable Stripe manque.
                    'price_id' => null,
                    'amount_cents' => 100, 'currency' => 'EUR',
                    'interval' => 'month', 'active' => true,
                ],
            ],
            'billing.return_urls.success' => 'https://exemple.test/retour?statut=succes',
            'billing.return_urls.cancel' => 'https://exemple.test/retour?statut=annule',
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

    private function subscribe(User $user, string $status = 'active', ?Carbon $endsAt = null): Subscription
    {
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout',
            providerSubscriptionId: 'sub_'.$user->id,
            providerCustomerId: 'cus_'.$user->id,
            providerStatus: $status,
            providerPriceId: 'price_annuel_test',
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: $endsAt ?? Carbon::now()->addMonth(),
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $user->id,
        ));

        return Subscription::where('external_reference', 'sub_'.$user->id)->firstOrFail();
    }

    // ── Le cas nominal ──────────────────────────────────────────────────

    public function test_a_student_can_open_a_checkout_session(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('plan', 'annual');

        $this->assertStringStartsWith('https://', $response->json('checkoutUrl'));

        // LE point : rien n'a été ouvert. Ni abonnement, ni droit, ni paiement.
        $this->assertSame(0, Subscription::count(), 'Une session de paiement ne crée aucun abonnement local.');
        $this->assertSame(0, Entitlement::count(), 'Une session de paiement n\'accorde AUCUN droit.');
        $this->assertSame(0, Payment::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_the_session_carries_the_server_side_price_and_user(): void
    {
        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);

        $call = $this->provider()->lastCall;

        // Le tarif vient du CATALOGUE SERVEUR.
        $this->assertSame('price_annuel_test', $call['priceId']);
        // Le pont vers le compte local : l'identifiant de l'élève AUTHENTIFIÉ.
        $this->assertSame((string) $this->student->id, $call['clientReferenceId']);
        // Les URL de retour sont imposées par le serveur.
        $this->assertSame('https://exemple.test/retour?statut=succes', $call['successUrl']);
        $this->assertSame('https://exemple.test/retour?statut=annule', $call['cancelUrl']);
    }

    public function test_the_plan_list_never_exposes_provider_price_ids(): void
    {
        Sanctum::actingAs($this->student);

        $body = $this->getJson('/api/v1/billing/plans')->assertOk()->getContent();

        // Un identifiant de tarif n'apprend rien à un élève, et le publier
        // invite à essayer de le remplacer.
        $this->assertStringNotContainsString('price_annuel_test', $body);
        $this->assertStringNotContainsString('price_id', $body);
    }

    public function test_the_plan_list_marks_an_unconfigured_plan_as_not_purchasable(): void
    {
        Sanctum::actingAs($this->student);

        $plans = collect($this->getJson('/api/v1/billing/plans')->assertOk()->json('plans'));

        $this->assertTrue($plans->firstWhere('key', 'annual')['purchasable']);
        // Proposée, mais sans tarif configuré : affichée « indisponible »
        // plutôt qu'un bouton qui échouerait au clic.
        $this->assertFalse($plans->firstWhere('key', 'unconfigured')['purchasable']);
        // Une offre retirée de la vente n'est pas listée du tout.
        $this->assertNull($plans->firstWhere('key', 'inactive'));
    }

    // ── L'authentification ──────────────────────────────────────────────

    public function test_a_guest_cannot_open_a_checkout(): void
    {
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(401);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_a_suspended_account_cannot_open_a_checkout(): void
    {
        $this->student->update(['account_status' => User::STATUS_SUSPENDED]);
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(403);

        $this->assertNull($this->provider()->lastCall);
    }

    // ── La falsification ────────────────────────────────────────────────

    public function test_a_client_cannot_submit_its_own_price_id(): void
    {
        Sanctum::actingAs($this->student);

        // Un client rusé envoie un tarif à lui — un abonnement à 0 € est un
        // `price_...` comme un autre.
        $this->postJson('/api/v1/billing/checkout', [
            'plan' => 'annual',
            'price_id' => 'price_gratuit_du_pirate',
            'priceId' => 'price_gratuit_du_pirate',
        ])->assertStatus(201);

        // Le champ n'est même pas lu : le tarif reste celui du catalogue.
        $this->assertSame('price_annuel_test', $this->provider()->lastCall['priceId']);
    }

    public function test_a_client_cannot_tamper_with_amount_or_currency(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', [
            'plan' => 'annual',
            'amount' => 1, 'amount_cents' => 1, 'currency' => 'XAF',
        ])->assertStatus(201);

        // Aucun de ces champs n'atteint le fournisseur : c'est Stripe qui
        // facture, d'après SON tarif, désigné par notre catalogue.
        $call = $this->provider()->lastCall;
        $this->assertSame('price_annuel_test', $call['priceId']);
        $this->assertArrayNotHasKey('amount', $call);
        $this->assertArrayNotHasKey('currency', $call);
    }

    public function test_a_client_cannot_open_a_checkout_for_another_user(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', [
            'plan' => 'annual',
            'user_id' => $victim->id,
            'userId' => $victim->id,
        ])->assertStatus(201);

        // L'élève vient du JETON, jamais du corps.
        $this->assertSame(
            (string) $this->student->id,
            $this->provider()->lastCall['clientReferenceId'],
            'Un client a pu ouvrir un paiement au nom de quelqu\'un d\'autre.'
        );
    }

    public function test_an_unknown_plan_is_refused(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'gratuit_a_vie'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('plan');

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_an_inactive_plan_is_refused(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'inactive'])
            ->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_a_plan_without_a_configured_price_is_refused(): void
    {
        Sanctum::actingAs($this->student);

        // Un environnement mal configuré refuse proprement, au lieu
        // d'appeler le fournisseur avec un tarif nul.
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'unconfigured'])
            ->assertStatus(422);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_a_missing_plan_is_refused(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('plan');
    }

    public function test_a_checkout_never_creates_an_entitlement_whatever_the_client_sends(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', [
            'plan' => 'annual',
            'premium' => true,
            'entitlement' => 'subscription',
            'subscription_status' => 'active',
            'status' => 'active',
        ])->assertStatus(201);

        $this->assertSame(0, Entitlement::count());
        $this->assertSame(0, Subscription::count());
        $this->assertFalse($this->hasPremium());
    }

    // ── Le double achat ─────────────────────────────────────────────────

    public function test_an_active_subscriber_is_told_he_is_already_subscribed(): void
    {
        $this->subscribe($this->student);
        $this->assertTrue($this->hasPremium());

        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Vous êtes déjà abonné.');

        $this->assertNull($this->provider()->lastCall, 'Le fournisseur ne doit même pas être appelé.');
    }

    public function test_a_cancelled_subscription_still_running_blocks_a_second_purchase(): void
    {
        // Résilié, mais la période payée court encore : racheter maintenant
        // ferait payer deux fois les mêmes jours.
        $this->subscribe($this->student, 'active', Carbon::now()->addDays(20));
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout',
            providerSubscriptionId: 'sub_'.$this->student->id,
            providerCustomerId: 'cus_'.$this->student->id,
            providerStatus: 'active',
            providerPriceId: null,
            currentPeriodStart: Carbon::now()->subDay(),
            currentPeriodEnd: Carbon::now()->addDays(20),
            cancelAtPeriodEnd: true,
            occurredAt: Carbon::now()->addSecond(),
            clientReferenceId: (string) $this->student->id,
        ));

        $this->assertSame(Subscription::STATUS_CANCELLED, Subscription::first()->status);

        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertNull($this->provider()->lastCall);
    }

    public function test_an_expired_subscriber_can_subscribe_again(): void
    {
        $this->subscribe($this->student, 'unpaid');
        $this->assertFalse($this->hasPremium());

        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(201);

        $this->assertNotNull($this->provider()->lastCall);
    }

    public function test_a_student_with_only_an_admin_override_may_still_subscribe(): void
    {
        // La dérogation est un geste commercial temporaire, pas un abonnement.
        // Lui refuser l'achat parce qu'on lui a offert un mois serait absurde,
        // et lui fabriquer un abonnement au motif qu'il a accès le serait plus
        // encore.
        Entitlement::create([
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
            'status' => Entitlement::STATUS_ACTIVE,
            'starts_at' => Carbon::now()->subDay(),
            'expires_at' => Carbon::now()->addDays(10),
            'source' => 'admin',
        ]);

        $this->assertTrue($this->hasPremium());

        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);

        // Et la dérogation n'a pas été touchée.
        $this->assertSame(1, Entitlement::where('type', Entitlement::TYPE_ADMIN_OVERRIDE)->count());
        $this->assertSame(0, Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->count());
    }

    public function test_a_checkout_never_modifies_an_admin_override(): void
    {
        $override = Entitlement::create([
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
            'status' => Entitlement::STATUS_ACTIVE,
            'starts_at' => Carbon::now()->subDay(),
            'expires_at' => Carbon::now()->addDays(10),
            'source' => 'admin', 'reason' => 'geste commercial',
        ]);

        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);

        $fresh = $override->fresh();
        $this->assertSame(Entitlement::STATUS_ACTIVE, $fresh->status);
        $this->assertSame('geste commercial', $fresh->reason);
        $this->assertNull($fresh->revoked_at);
    }

    // ── L'idempotence ───────────────────────────────────────────────────

    public function test_a_double_click_reuses_the_same_idempotency_key(): void
    {
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);
        $first = $this->provider()->lastCall['idempotencyKey'];

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);
        $second = $this->provider()->lastCall['idempotencyKey'];

        // Même clé → le fournisseur rend LA MÊME session au lieu d'en créer
        // une seconde. L'idempotence est celle de Stripe ; en réinventer une
        // en base dupliquerait une garantie qui existe déjà.
        $this->assertSame($first, $second);
        $this->assertNotEmpty($first);
    }

    public function test_two_students_never_share_an_idempotency_key(): void
    {
        $other = User::factory()->create(['role' => User::ROLE_STUDENT]);

        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);
        $mine = $this->provider()->lastCall['idempotencyKey'];

        Sanctum::actingAs($other);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);
        $theirs = $this->provider()->lastCall['idempotencyKey'];

        // Sinon un élève récupérerait la session de paiement d'un autre.
        $this->assertNotSame($mine, $theirs);
    }

    // ── Le client du fournisseur ────────────────────────────────────────

    public function test_an_existing_provider_customer_is_reused(): void
    {
        $this->subscribe($this->student, 'unpaid'); // laisse un provider_customer_id
        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);

        // Sinon chaque paiement fabriquerait une fiche client de plus, et
        // l'historique de facturation se disperserait.
        $this->assertSame('cus_'.$this->student->id, $this->provider()->lastCall['customerId']);
        $this->assertNull($this->provider()->lastCall['customerEmail']);
    }

    public function test_a_first_time_buyer_has_no_customer_but_an_email(): void
    {
        Sanctum::actingAs($this->student);
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);

        $this->assertNull($this->provider()->lastCall['customerId']);
        $this->assertSame($this->student->email, $this->provider()->lastCall['customerEmail']);
    }

    // ── La panne du fournisseur ─────────────────────────────────────────

    public function test_a_provider_failure_is_reported_without_leaking_its_message(): void
    {
        $this->provider()->failWith('Stripe: invalid api key sk_live_secret_xyz');

        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(503)
            ->assertJsonPath('success', false);

        // Le message du fournisseur peut porter de l'interne — jamais rendu.
        $this->assertStringNotContainsString('sk_live', $response->getContent());
        $this->assertStringNotContainsString('invalid api key', $response->getContent());

        $this->assertSame(0, Subscription::count());
        $this->assertSame(0, Entitlement::count());
    }

    public function test_a_malformed_provider_response_is_a_failure_not_an_access(): void
    {
        $this->provider()->returnUrl('');

        Sanctum::actingAs($this->student);

        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])
            ->assertStatus(503);

        $this->assertFalse($this->hasPremium());
    }

    // ── La chaîne complète ──────────────────────────────────────────────

    public function test_only_the_webhook_opens_access_after_a_checkout(): void
    {
        Sanctum::actingAs($this->student);

        // 1. L'élève ouvre un paiement.
        $this->postJson('/api/v1/billing/checkout', ['plan' => 'annual'])->assertStatus(201);
        $this->assertFalse($this->hasPremium(), 'Ouvrir un paiement n\'ouvre aucun accès.');

        // 2. Il « revient » sur l'URL de succès : toujours rien. Le retour de
        //    navigateur n'est pas une preuve de paiement.
        $this->getJson('/api/v1/me/access')
            ->assertOk()
            ->assertJsonPath('access.premiumAccess', false);

        // 3. LE WEBHOOK arrive — c'est lui, et lui seul, qui ouvre.
        app(ProviderSubscriptionAdapter::class)->apply(new ProviderSubscriptionState(
            provider: 'fake_checkout',
            providerSubscriptionId: 'sub_reel',
            providerCustomerId: 'cus_reel',
            providerStatus: 'active',
            providerPriceId: 'price_annuel_test',
            currentPeriodStart: Carbon::now(),
            currentPeriodEnd: Carbon::now()->addYear(),
            occurredAt: Carbon::now(),
            clientReferenceId: (string) $this->student->id,
        ));

        $this->assertTrue($this->hasPremium());
        $this->assertSame(1, Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->count());
    }

    public function test_a_payment_row_alone_still_grants_nothing(): void
    {
        // La règle de la phase 5 survit à la phase 6.
        Payment::create([
            'user_id' => $this->student->id,
            'amount_cents' => 3500, 'currency' => 'EUR',
            'status' => Payment::STATUS_SUCCEEDED,
            'provider' => 'fake_checkout', 'external_reference' => 'in_1',
            'paid_at' => Carbon::now(),
        ]);

        $this->assertFalse($this->hasPremium(), 'Un paiement n\'ouvre jamais l\'accès par lui-même.');
    }
}

/**
 * Un fournisseur d'essai qui enregistre ce qu'on lui demande.
 *
 * Il rend la vérification directe : au lieu de deviner ce qui a été envoyé à
 * Stripe, on le LIT. C'est ce qui permet d'affirmer qu'un tarif client n'est
 * jamais transmis — on voit exactement ce qui part.
 */
class FakeCheckoutProvider implements PaymentProvider
{
    /** @var array<string, mixed>|null */
    public ?array $lastCall = null;

    private ?string $failure = null;

    private string $url = 'https://paiement.exemple.test/session/abc';

    public function failWith(string $message): void
    {
        $this->failure = $message;
    }

    public function returnUrl(string $url): void
    {
        $this->url = $url;
    }

    public function name(): string
    {
        return 'fake_checkout';
    }

    public function verifySignature(string $payload, ?string $signature): bool
    {
        return $signature === 'valide';
    }

    public function translate(string $payload): TranslatedEvent
    {
        $body = json_decode($payload, true);

        if (! is_array($body) || ! isset($body['id'])) {
            throw new ProviderEventFormatException('illisible');
        }

        return new TranslatedEvent(
            provider: 'fake_checkout',
            eventId: $body['id'],
            type: $body['type'] ?? 'unknown',
        );
    }

    public function createCheckoutSession(
        string $priceId,
        string $clientReferenceId,
        string $successUrl,
        string $cancelUrl,
        ?string $customerId = null,
        ?string $customerEmail = null,
        ?string $idempotencyKey = null,
    ): CheckoutSession {
        $this->lastCall = compact(
            'priceId', 'clientReferenceId', 'successUrl', 'cancelUrl',
            'customerId', 'customerEmail', 'idempotencyKey',
        );

        if ($this->failure !== null) {
            throw new CheckoutFailedException($this->failure);
        }

        if ($this->url === '') {
            throw new CheckoutFailedException('Session sans URL.');
        }

        return new CheckoutSession(id: 'cs_test_123', url: $this->url, customerId: $customerId);
    }

    // ── Phase 7 : le cycle de vie après l'achat ─────────────────────────
    //
    // Enregistrés comme le reste : ce qu'on veut pouvoir affirmer, c'est
    // QUEL identifiant est parti au fournisseur — c'est là que se joue
    // l'appartenance.

    public function createPortalSession(string $customerId, string $returnUrl): PortalSession
    {
        $this->lastCall = compact('customerId', 'returnUrl');

        if ($this->failure !== null) {
            throw new CheckoutFailedException($this->failure);
        }

        return new PortalSession(url: 'https://portail.exemple.test/session/xyz');
    }

    public function cancelAtPeriodEnd(string $providerSubscriptionId): ProviderSubscriptionState
    {
        $this->lastCall = compact('providerSubscriptionId') + ['operation' => 'cancel'];

        if ($this->failure !== null) {
            throw new CheckoutFailedException($this->failure);
        }

        return $this->stateFor($providerSubscriptionId, cancelAtPeriodEnd: true);
    }

    public function resumeSubscription(string $providerSubscriptionId): ProviderSubscriptionState
    {
        $this->lastCall = compact('providerSubscriptionId') + ['operation' => 'resume'];

        if ($this->failure !== null) {
            throw new CheckoutFailedException($this->failure);
        }

        return $this->stateFor($providerSubscriptionId, cancelAtPeriodEnd: false);
    }

    private function stateFor(string $id, bool $cancelAtPeriodEnd): ProviderSubscriptionState
    {
        return new ProviderSubscriptionState(
            provider: $this->name(),
            providerSubscriptionId: $id,
            providerCustomerId: null,
            providerStatus: 'active',
            providerPriceId: null,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: $cancelAtPeriodEnd,
            occurredAt: null,
            deleted: false,
        );
    }
}
