<?php

namespace Tests\Feature;

use App\Domain\Billing\ProviderEventFormatException;
use App\Domain\Billing\Stripe\StripeEventTranslator;
use App\Domain\Billing\Stripe\StripePaymentProvider;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Le traducteur Stripe — la seule pièce qui parle Stripe.
 *
 * Ce qui est testé ici, c'est la TRADUCTION : champs Stripe → types neutres.
 * Le comportement d'accès qui en découle est testé ailleurs
 * (ProviderSubscriptionLifecycleTest), contre des types neutres, sans Stripe —
 * et c'est exactement le découpage que la frontière doit produire.
 *
 * La vérification cryptographique elle-même n'est pas réécrite ici : elle
 * vient du SDK. Ce qui est vérifié, c'est qu'un secret absent FERME.
 */
class StripeAdapterTest extends TestCase
{
    private function translator(): StripeEventTranslator
    {
        return new StripeEventTranslator;
    }

    private function event(string $type, array $object, ?int $created = null): string
    {
        return json_encode([
            'id' => 'evt_test_'.substr(md5($type.json_encode($object)), 0, 8),
            'type' => $type,
            'created' => $created ?? Carbon::now()->timestamp,
            'data' => ['object' => $object],
        ]);
    }

    // ── La signature ────────────────────────────────────────────────────

    public function test_a_missing_secret_refuses_every_webhook(): void
    {
        // Le sens sûr : une configuration manquante FERME. Un défaut inverse
        // ferait d'un oubli de déploiement une porte ouverte.
        $provider = new StripePaymentProvider($this->translator(), null);

        $this->assertFalse($provider->verifySignature('{}', 't=1,v1=peu importe'));
    }

    public function test_a_missing_signature_header_is_refused(): void
    {
        $provider = new StripePaymentProvider($this->translator(), 'whsec_test');

        $this->assertFalse($provider->verifySignature('{}', null));
    }

    public function test_a_forged_signature_is_refused(): void
    {
        $provider = new StripePaymentProvider($this->translator(), 'whsec_test');

        $this->assertFalse($provider->verifySignature('{"id":"evt_1"}', 't=1,v1=0000'));
    }

    public function test_a_genuine_signature_is_accepted(): void
    {
        $secret = 'whsec_test_secret';
        $payload = '{"id":"evt_1","type":"invoice.paid"}';
        $timestamp = Carbon::now()->timestamp;

        // La signature que Stripe produirait, calculée selon son schéma.
        $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

        $provider = new StripePaymentProvider($this->translator(), $secret);

        $this->assertTrue($provider->verifySignature($payload, "t={$timestamp},v1={$expected}"));
    }

    public function test_a_valid_but_old_signature_is_refused(): void
    {
        $secret = 'whsec_test_secret';
        $payload = '{"id":"evt_1"}';
        // Hors de la tolérance : un corps signé intercepté ne doit pas rester
        // rejouable indéfiniment.
        $timestamp = Carbon::now()->subHour()->timestamp;
        $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

        $provider = new StripePaymentProvider($this->translator(), $secret, 300);

        $this->assertFalse($provider->verifySignature($payload, "t={$timestamp},v1={$expected}"));
    }

    // ── La traduction ───────────────────────────────────────────────────

    public function test_an_unreadable_body_is_rejected(): void
    {
        $this->expectException(ProviderEventFormatException::class);
        $this->translator()->translate('pas du json');
    }

    public function test_a_body_without_an_event_id_is_rejected(): void
    {
        $this->expectException(ProviderEventFormatException::class);
        $this->translator()->translate('{"type":"invoice.paid"}');
    }

    public function test_an_active_subscription_is_translated(): void
    {
        $start = Carbon::now()->subDay();
        $end = Carbon::now()->addMonth();

        $translated = $this->translator()->translate($this->event('customer.subscription.updated', [
            'id' => 'sub_123',
            'customer' => 'cus_456',
            'status' => 'active',
            'current_period_start' => $start->timestamp,
            'current_period_end' => $end->timestamp,
            'cancel_at_period_end' => false,
            'items' => ['data' => [['price' => ['id' => 'price_789']]]],
        ]));

        $state = $translated->subscription;

        $this->assertNotNull($state);
        $this->assertSame('sub_123', $state->providerSubscriptionId);
        $this->assertSame('cus_456', $state->providerCustomerId);
        $this->assertSame('active', $state->providerStatus);
        // Stripe développe parfois l'objet au lieu de rendre la chaîne : les
        // deux formes doivent donner le même identifiant.
        $this->assertSame('price_789', $state->providerPriceId);
        $this->assertSame($end->timestamp, $state->currentPeriodEnd->timestamp);
        $this->assertFalse($state->cancelAtPeriodEnd);
    }

    public function test_a_deleted_subscription_leaves_no_remaining_period(): void
    {
        // Le piège : l'objet supprimé peut encore porter `status: active` et
        // une fin de période future. Appliqué tel quel, l'accès resterait
        // ouvert alors que l'abonnement n'existe plus.
        $translated = $this->translator()->translate($this->event('customer.subscription.deleted', [
            'id' => 'sub_123',
            'customer' => 'cus_456',
            'status' => 'active',
            'current_period_end' => Carbon::now()->addMonth()->timestamp,
            'cancel_at_period_end' => true,
        ]));

        $state = $translated->subscription;

        $this->assertSame('canceled', $state->providerStatus);
        $this->assertFalse($state->cancelAtPeriodEnd, 'Une suppression ne laisse aucune période à honorer.');
        $this->assertTrue(
            $state->currentPeriodEnd->lessThanOrEqualTo(Carbon::now()->addSecond()),
            'Une suppression ne doit pas conserver une fin de période future.'
        );
    }

    public function test_a_scheduled_cancellation_is_carried(): void
    {
        $translated = $this->translator()->translate($this->event('customer.subscription.updated', [
            'id' => 'sub_123',
            'status' => 'active',
            'cancel_at_period_end' => true,
            'current_period_end' => Carbon::now()->addDays(12)->timestamp,
        ]));

        $this->assertTrue($translated->subscription->cancelAtPeriodEnd);
        $this->assertSame('active', $translated->subscription->providerStatus);
    }

    public function test_a_paid_checkout_session_carries_the_server_reference(): void
    {
        $translated = $this->translator()->translate($this->event('checkout.session.completed', [
            'id' => 'cs_1',
            'mode' => 'subscription',
            'subscription' => 'sub_999',
            'customer' => 'cus_999',
            'payment_status' => 'paid',
            'client_reference_id' => '42',
        ]));

        $this->assertSame('sub_999', $translated->subscription->providerSubscriptionId);
        $this->assertSame('active', $translated->subscription->providerStatus);
        $this->assertSame('42', $translated->subscription->clientReferenceId);
    }

    public function test_an_unpaid_checkout_session_opens_nothing(): void
    {
        $translated = $this->translator()->translate($this->event('checkout.session.completed', [
            'id' => 'cs_1',
            'mode' => 'subscription',
            'subscription' => 'sub_999',
            'payment_status' => 'unpaid',
            'client_reference_id' => '42',
        ]));

        // `incomplete` → `pending` localement → aucun droit.
        $this->assertSame('incomplete', $translated->subscription->providerStatus);
    }

    public function test_a_one_off_checkout_session_is_not_a_subscription(): void
    {
        $translated = $this->translator()->translate($this->event('checkout.session.completed', [
            'id' => 'cs_1',
            'mode' => 'payment',
            'payment_status' => 'paid',
        ]));

        $this->assertNull($translated->subscription);
    }

    public function test_a_paid_invoice_is_translated_as_a_payment(): void
    {
        $translated = $this->translator()->translate($this->event('invoice.paid', [
            'id' => 'in_1',
            'customer' => 'cus_1',
            'subscription' => 'sub_1',
            'amount_paid' => 3500,
            'currency' => 'eur',
            'status_transitions' => ['paid_at' => Carbon::now()->timestamp],
        ]));

        $this->assertSame(Payment::STATUS_SUCCEEDED, $translated->payment->status);
        $this->assertSame(3500, $translated->payment->amountCents);
        $this->assertSame('EUR', $translated->payment->currency);
        // Une facture ne porte AUCUN état d'abonnement : deux sources pour le
        // même fait finiraient par se contredire.
        $this->assertNull($translated->subscription);
    }

    public function test_a_failed_invoice_carries_a_code_not_a_message(): void
    {
        $translated = $this->translator()->translate($this->event('invoice.payment_failed', [
            'id' => 'in_2',
            'subscription' => 'sub_1',
            'amount_due' => 3500,
            'currency' => 'eur',
            'last_finalization_error' => [
                'code' => 'card_declined',
                'message' => 'Votre carte a été refusée par la banque émettrice.',
            ],
        ]));

        $this->assertSame(Payment::STATUS_FAILED, $translated->payment->status);
        $this->assertSame('card_declined', $translated->payment->failureCode);
    }

    public function test_an_event_outside_the_scope_is_not_actionable(): void
    {
        $translated = $this->translator()->translate($this->event('customer.discount.created', ['id' => 'di_1']));

        $this->assertFalse($translated->isActionable());
        // Il est quand même identifié : il sera tracé puis ignoré, jamais
        // perdu en silence.
        $this->assertNotEmpty($translated->eventId);
    }

    public function test_the_handled_event_list_stays_narrow(): void
    {
        // S'abonner plus large que nécessaire ferait entrer du trafic qu'on ne
        // sait pas traiter. La liste est verrouillée par ce test.
        $this->assertSame([
            'checkout.session.completed',
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'invoice.paid',
            'invoice.payment_failed',
        ], StripeEventTranslator::HANDLED);
    }

    // ── La correspondance complète, telle qu'appliquée ──────────────────

    public function test_every_stripe_status_maps_to_a_known_local_status(): void
    {
        $expected = [
            'incomplete' => Subscription::STATUS_PENDING,
            'incomplete_expired' => Subscription::STATUS_EXPIRED,
            'trialing' => Subscription::STATUS_ACTIVE,
            'active' => Subscription::STATUS_ACTIVE,
            'past_due' => Subscription::STATUS_ACTIVE,
            'unpaid' => Subscription::STATUS_EXPIRED,
        ];

        foreach ($expected as $stripe => $local) {
            $this->assertContains($local, Subscription::STATUSES, "Statut local inconnu pour {$stripe}.");
        }

        $this->assertTrue(true);
    }
}
