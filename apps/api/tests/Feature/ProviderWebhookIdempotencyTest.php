<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\CheckoutSession;
use App\Domain\Billing\PaymentProvider;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\ProviderEventFormatException;
use App\Domain\Billing\ProviderPaymentState;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Billing\TranslatedEvent;
use App\Models\Entitlement;
use App\Models\Payment;
use App\Models\ProviderEvent;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Le webhook, éprouvé SANS aucun SDK ni réseau.
 *
 * Tout passe par un faux fournisseur : c'est précisément ce que la frontière
 * neutre rend possible, et c'est la preuve qu'elle tient. Si ces tests
 * exigeaient Stripe, c'est que Stripe aurait fui hors de son dossier.
 *
 * Les invariants vérifiés ici sont ceux qui coûtent cher à rater :
 *
 *   - un corps non signé n'écrit RIEN ;
 *   - une double livraison ne produit qu'un effet ;
 *   - un évènement PÉRIMÉ ne rouvre jamais un accès révoqué ;
 *   - un paiement n'ouvre ni ne ferme jamais un accès.
 */
class ProviderWebhookIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        // Un faux fournisseur, enregistré à la place du vrai. Sa signature est
        // une chaîne fixe : on teste la MÉCANIQUE du refus, pas la
        // cryptographie de Stripe (qui est testée par Stripe).
        app(PaymentProviderRegistry::class)->register(new FakePaymentProvider);
    }

    /** Poste un corps au webhook, comme le ferait un fournisseur. */
    private function deliver(array $body, string $signature = FakePaymentProvider::GOOD_SIGNATURE)
    {
        return $this->call(
            'POST',
            '/api/v1/webhooks/fake',
            [],
            [],
            [],
            ['HTTP_X-Provider-Signature' => $signature, 'CONTENT_TYPE' => 'application/json'],
            json_encode($body),
        );
    }

    /** Le corps d'un évènement d'abonnement. */
    private function subscriptionEvent(array $overrides = []): array
    {
        return array_merge([
            'id' => 'evt_'.uniqid(),
            'type' => 'customer.subscription.updated',
            'subscription_id' => 'sub_123',
            'customer_id' => 'cus_123',
            'status' => 'active',
            'period_start' => Carbon::now()->subDay()->timestamp,
            'period_end' => Carbon::now()->addMonth()->timestamp,
            'cancel_at_period_end' => false,
            'occurred_at' => Carbon::now()->timestamp,
            'client_reference_id' => (string) $this->student->id,
        ], $overrides);
    }

    private function entitlements(): EntitlementService
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    private function hasPremium(): bool
    {
        return $this->entitlements()->satisfies($this->student->fresh(), AccessTier::PREMIUM);
    }

    // ── Le cas nominal ──────────────────────────────────────────────────

    public function test_a_new_event_creates_the_subscription_and_opens_access(): void
    {
        $this->assertFalse($this->hasPremium());

        $this->deliver($this->subscriptionEvent())->assertOk();

        $subscription = Subscription::where('external_reference', 'sub_123')->first();
        $this->assertNotNull($subscription);
        $this->assertSame(Subscription::STATUS_ACTIVE, $subscription->status);
        $this->assertSame($this->student->id, $subscription->user_id);
        // Le statut du fournisseur est CONSERVÉ à côté du nôtre, pas à sa place.
        $this->assertSame('active', $subscription->provider_status);

        $this->assertDatabaseHas('entitlements', [
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_SUBSCRIPTION,
            'status' => Entitlement::STATUS_ACTIVE,
        ]);

        $this->assertTrue($this->hasPremium());

        $this->assertDatabaseHas('provider_events', [
            'provider' => 'fake',
            'status' => ProviderEvent::STATUS_PROCESSED,
        ]);
    }

    // ── L'idempotence ───────────────────────────────────────────────────

    public function test_the_same_event_delivered_twice_changes_nothing(): void
    {
        $event = $this->subscriptionEvent();

        $this->deliver($event)->assertOk();
        $this->deliver($event)->assertOk()->assertJsonPath('outcome', 'duplicate');

        // UN abonnement, UN droit, UN évènement. C'est toute la garantie.
        $this->assertSame(1, Subscription::count());
        $this->assertSame(1, Entitlement::count());
        $this->assertSame(1, ProviderEvent::count());

        // Le doublon n'est pas un échec : le compteur de tentatives ne bouge pas.
        $this->assertSame(0, ProviderEvent::first()->attempts);
    }

    public function test_two_different_events_on_the_same_subscription_keep_one_entitlement(): void
    {
        $this->deliver($this->subscriptionEvent())->assertOk();
        $this->deliver($this->subscriptionEvent([
            'occurred_at' => Carbon::now()->addMinute()->timestamp,
            'period_end' => Carbon::now()->addMonths(2)->timestamp,
        ]))->assertOk();

        $this->assertSame(1, Subscription::count());
        // Le droit est MIS À JOUR, pas dupliqué : c'est la référence stable
        // `subscription:<id>` du synchroniseur qui le garantit.
        $this->assertSame(1, Entitlement::count());
        $this->assertSame(2, ProviderEvent::count());
    }

    // ── Le désordre ─────────────────────────────────────────────────────

    public function test_a_stale_event_never_reopens_a_revoked_access(): void
    {
        $deletedAt = Carbon::now();

        // 1. L'abonnement est supprimé chez le fournisseur → accès fermé.
        $this->deliver($this->subscriptionEvent([
            'type' => 'customer.subscription.deleted',
            'status' => 'canceled',
            'period_end' => $deletedAt->timestamp,
            'occurred_at' => $deletedAt->timestamp,
        ]))->assertOk();

        $this->assertFalse($this->hasPremium(), 'La suppression doit fermer l\'accès.');

        // 2. Un « updated » ANCIEN arrive en retard. Il dit « active » et
        //    porte une fin de période lointaine : appliqué, il rouvrirait
        //    l'accès. Il doit être ignoré.
        $response = $this->deliver($this->subscriptionEvent([
            'status' => 'active',
            'period_end' => Carbon::now()->addMonth()->timestamp,
            'occurred_at' => $deletedAt->copy()->subHour()->timestamp,
        ]));

        $response->assertOk()->assertJsonPath('outcome', 'ignored');

        $this->assertFalse(
            $this->hasPremium(),
            'Un évènement périmé a rouvert un accès révoqué — c\'est la faille que occurred_at existe pour empêcher.'
        );

        $this->assertSame(Subscription::STATUS_EXPIRED, Subscription::first()->status);
        $this->assertDatabaseHas('provider_events', [
            'status' => ProviderEvent::STATUS_IGNORED,
            'failure_reason' => 'stale',
        ]);
    }

    // ── La signature ────────────────────────────────────────────────────

    public function test_an_invalid_signature_writes_absolutely_nothing(): void
    {
        $this->deliver($this->subscriptionEvent(), 'signature-forgee')
            ->assertStatus(400)
            ->assertJsonPath('error', 'invalid_signature');

        // Aucune trace : ni abonnement, ni droit, ni même l'évènement. Sinon
        // n'importe qui remplirait la table en postant des corps arbitraires.
        $this->assertSame(0, Subscription::count());
        $this->assertSame(0, Entitlement::count());
        $this->assertSame(0, ProviderEvent::count());
    }

    public function test_a_modified_body_is_rejected(): void
    {
        // Le faux fournisseur refuse tout corps contenant ce marqueur : il
        // simule une empreinte qui ne correspond plus au corps reçu.
        $this->deliver($this->subscriptionEvent(['tampered' => true]))
            ->assertStatus(400);

        $this->assertSame(0, ProviderEvent::count());
    }

    public function test_a_malformed_body_is_rejected_without_retry(): void
    {
        // Signé mais sans identifiant : rejouer ne le rendra pas lisible, donc
        // 400 (pas 500, qui demanderait une nouvelle livraison).
        $this->deliver(['type' => 'customer.subscription.updated'])
            ->assertStatus(400)
            ->assertJsonPath('error', 'malformed_event');

        $this->assertSame(0, ProviderEvent::count());
    }

    // ── Les types hors périmètre ────────────────────────────────────────

    public function test_an_unknown_event_type_is_recorded_but_ignored(): void
    {
        $this->deliver([
            'id' => 'evt_inconnu',
            'type' => 'customer.discount.created',
            'occurred_at' => Carbon::now()->timestamp,
        ])->assertOk()->assertJsonPath('outcome', 'ignored');

        $this->assertDatabaseHas('provider_events', [
            'event_id' => 'evt_inconnu',
            'status' => ProviderEvent::STATUS_IGNORED,
            'failure_reason' => 'unhandled_type',
        ]);

        $this->assertSame(0, Subscription::count());
    }

    // ── Les paiements ───────────────────────────────────────────────────

    public function test_a_paid_invoice_is_recorded_without_touching_access(): void
    {
        // Un abonnement expiré : l'élève n'a pas accès.
        $this->deliver($this->subscriptionEvent([
            'status' => 'canceled',
            'period_end' => Carbon::now()->subDay()->timestamp,
        ]))->assertOk();

        $this->assertFalse($this->hasPremium());

        // Une facture payée arrive. Elle laisse une trace comptable et RIEN
        // d'autre : un paiement n'ouvre jamais l'accès par lui-même.
        $this->deliver([
            'id' => 'evt_facture',
            'type' => 'invoice.paid',
            'payment_id' => 'in_123',
            'subscription_id' => 'sub_123',
            'amount_cents' => 3500,
            'occurred_at' => Carbon::now()->timestamp,
        ])->assertOk();

        $this->assertDatabaseHas('payments', [
            'external_reference' => 'in_123',
            'status' => Payment::STATUS_SUCCEEDED,
            'amount_cents' => 3500,
        ]);

        $this->assertFalse(
            $this->hasPremium(),
            'Un paiement a ouvert l\'accès. Seul l\'abonnement le fait — un remboursement sépare les deux faits.'
        );
    }

    public function test_a_failed_invoice_never_closes_access(): void
    {
        $this->deliver($this->subscriptionEvent())->assertOk();
        $this->assertTrue($this->hasPremium());

        $this->deliver([
            'id' => 'evt_echec',
            'type' => 'invoice.payment_failed',
            'payment_id' => 'in_echec',
            'subscription_id' => 'sub_123',
            'amount_cents' => 3500,
            'failure_code' => 'card_declined',
            'occurred_at' => Carbon::now()->timestamp,
        ])->assertOk();

        $this->assertDatabaseHas('payments', [
            'external_reference' => 'in_echec',
            'status' => Payment::STATUS_FAILED,
            'failure_code' => 'card_declined',
        ]);

        // L'accès reste ouvert jusqu'au terme DÉJÀ PAYÉ. La couche d'accès ne
        // lit pas les paiements ; c'est le fournisseur qui décidera, plus tard,
        // de faire expirer l'abonnement.
        $this->assertTrue($this->hasPremium());
    }

    public function test_the_same_invoice_delivered_twice_creates_one_payment(): void
    {
        $invoice = [
            'id' => 'evt_f1',
            'type' => 'invoice.paid',
            'payment_id' => 'in_unique',
            // La facture désigne son abonnement : c'est par lui que le
            // paiement retrouve son propriétaire. Sans lui, il n'est
            // rattachable à personne et n'est pas enregistré — voir
            // test_a_payment_for_an_unknown_customer_is_not_recorded.
            'subscription_id' => 'sub_123',
            'amount_cents' => 3500,
            'occurred_at' => Carbon::now()->timestamp,
        ];

        $this->deliver($this->subscriptionEvent())->assertOk();
        $this->deliver($invoice)->assertOk();
        // Même facture, évènement différent : l'idempotence du PAIEMENT tient
        // à l'unicité (provider, external_reference), pas à celle de l'évènement.
        $this->deliver(array_merge($invoice, ['id' => 'evt_f2']))->assertOk();

        $this->assertSame(1, Payment::count());
    }

    public function test_a_payment_for_an_unknown_customer_is_not_recorded(): void
    {
        // Ni abonnement local, ni client connu : le paiement n'appartient à
        // personne. On ne fabrique pas d'utilisateur pour l'accueillir, et on
        // ne le rattache surtout pas au hasard.
        $this->deliver([
            'id' => 'evt_orphelin',
            'type' => 'invoice.paid',
            'payment_id' => 'in_orphelin',
            'amount_cents' => 3500,
            'occurred_at' => Carbon::now()->timestamp,
        ])->assertOk();

        $this->assertSame(0, Payment::count());
    }

    // ── Le client non rattachable ───────────────────────────────────────

    public function test_an_event_for_an_unknown_customer_grants_nothing(): void
    {
        $this->deliver($this->subscriptionEvent(['client_reference_id' => null]))
            ->assertOk()
            ->assertJsonPath('outcome', 'ignored');

        $this->assertSame(0, Subscription::count());

        // Marqué ÉCHOUÉ et non « ignoré », depuis la phase 6.5 : Stripe émet
        // `customer.subscription.created` AVANT la session qui rattache le
        // client. Un évènement non rattachable doit rester REJOUABLE — le
        // clore le perdrait, et la chaîne ne tiendrait plus qu'à un seul
        // évènement. Rien n'est ouvert pour autant : sans élève identifiable,
        // aucun accès n'est accordé (assertion ci-dessus).
        $this->assertDatabaseHas('provider_events', [
            'status' => ProviderEvent::STATUS_FAILED,
            'failure_reason' => 'unknown_customer',
        ]);
    }

    public function test_a_client_reference_is_never_trusted_blindly(): void
    {
        // Une référence qui n'est pas un identifiant numérique de notre base
        // n'est pas interprétée — surtout pas comme un e-mail ou un nom.
        $this->deliver($this->subscriptionEvent(['client_reference_id' => 'admin@example.com']))
            ->assertOk()
            ->assertJsonPath('outcome', 'ignored');

        $this->assertSame(0, Subscription::count());
    }

    // ── Le rejeu d'un échec ─────────────────────────────────────────────

    public function test_an_unknown_provider_is_a_404(): void
    {
        $this->call(
            'POST',
            '/api/v1/webhooks/inconnu',
            [], [], [],
            ['HTTP_X-Provider-Signature' => FakePaymentProvider::GOOD_SIGNATURE],
            json_encode($this->subscriptionEvent()),
        )->assertStatus(404);

        $this->assertSame(0, ProviderEvent::count());
    }

    // ── Le webhook n'exige NI session NI jeton ──────────────────────────

    public function test_the_webhook_needs_no_authentication_but_the_signature(): void
    {
        // Aucun jeton Sanctum, aucune session, aucun CSRF — et ça passe.
        // C'est le piège `statefulApi()` : sans le retrait explicite des
        // intergiciels de session, cette requête serait rejetée avant
        // d'atteindre la vérification de signature.
        $this->deliver($this->subscriptionEvent())->assertOk();
    }
}

/**
 * Un fournisseur factice — la preuve que la frontière neutre tient.
 *
 * Il parle le même contrat que Stripe sans rien lui emprunter. Sa présence
 * dans ce fichier de test, et non dans app/, est volontaire : ce n'est pas du
 * code de production.
 */
class FakePaymentProvider implements PaymentProvider
{
    public const GOOD_SIGNATURE = 'signature-valide';

    public function name(): string
    {
        return 'fake';
    }

    public function verifySignature(string $payload, ?string $signature): bool
    {
        // Un corps « altéré » échoue même avec la bonne signature : c'est ce
        // que fait une vraie empreinte quand le corps a changé.
        if (str_contains($payload, '"tampered"')) {
            return false;
        }

        return $signature === self::GOOD_SIGNATURE;
    }

    public function translate(string $payload): TranslatedEvent
    {
        $body = json_decode($payload, true);

        if (! is_array($body) || ! isset($body['id'])) {
            throw new ProviderEventFormatException('corps illisible');
        }

        $type = $body['type'] ?? 'unknown';
        $occurredAt = isset($body['occurred_at'])
            ? Carbon::createFromTimestampUTC((int) $body['occurred_at'])
            : null;

        $subscription = null;
        $payment = null;

        if (str_starts_with($type, 'customer.subscription.')) {
            $subscription = new ProviderSubscriptionState(
                provider: 'fake',
                providerSubscriptionId: $body['subscription_id'],
                providerCustomerId: $body['customer_id'] ?? null,
                providerStatus: $body['status'] ?? 'active',
                providerPriceId: null,
                currentPeriodStart: isset($body['period_start'])
                    ? Carbon::createFromTimestampUTC((int) $body['period_start']) : null,
                currentPeriodEnd: isset($body['period_end'])
                    ? Carbon::createFromTimestampUTC((int) $body['period_end']) : null,
                cancelAtPeriodEnd: (bool) ($body['cancel_at_period_end'] ?? false),
                occurredAt: $occurredAt,
                clientReferenceId: $body['client_reference_id'] ?? null,
            );
        }

        if (in_array($type, ['invoice.paid', 'invoice.payment_failed'], true)) {
            $payment = new ProviderPaymentState(
                provider: 'fake',
                providerPaymentId: $body['payment_id'],
                status: $type === 'invoice.paid' ? Payment::STATUS_SUCCEEDED : Payment::STATUS_FAILED,
                amountCents: (int) ($body['amount_cents'] ?? 0),
                providerSubscriptionId: $body['subscription_id'] ?? null,
                paidAt: $type === 'invoice.paid' ? $occurredAt : null,
                failureCode: $body['failure_code'] ?? null,
                occurredAt: $occurredAt,
            );
        }

        return new TranslatedEvent(
            provider: 'fake',
            eventId: $body['id'],
            type: $type,
            occurredAt: $occurredAt,
            subscription: $subscription,
            payment: $payment,
            providerObjectId: $body['subscription_id'] ?? null,
        );
    }

    /**
     * Ce fournisseur d'essai ne sert QUE la chaîne de webhooks : ouvrir un
     * paiement n'a rien à voir avec ce que ce fichier vérifie. Le refuser
     * explicitement vaut mieux que rendre une fausse session, qui laisserait
     * croire qu'un encaissement a été testé ici.
     */
    public function createCheckoutSession(
        string $priceId,
        string $clientReferenceId,
        string $successUrl,
        string $cancelUrl,
        ?string $customerId = null,
        ?string $customerEmail = null,
        ?string $idempotencyKey = null,
    ): CheckoutSession {
        throw new CheckoutFailedException('Ce fournisseur d\'essai n\'encaisse pas.');
    }
}
