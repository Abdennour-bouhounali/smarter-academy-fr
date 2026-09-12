<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\CheckoutSession;
use App\Domain\Billing\PaymentProvider;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\PortalSession;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Billing\Stripe\StripeEventTranslator;
use App\Domain\Billing\TranslatedEvent;
use App\Models\Entitlement;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * LA course d'ordonnancement de Stripe — le défaut de production de la phase 7.
 *
 * Stripe émet, dans cet ordre RÉEL (observé en 6.5, reconfirmé en production) :
 *
 *     invoice.paid
 *     customer.subscription.created    ← le tarif et la période, AUCUN élève
 *     checkout.session.completed       ← l'élève, NI tarif NI période
 *
 * Le premier ne peut rien écrire (le client n'est rattaché à personne), la
 * seconde écrit un abonnement SANS tarif ni période. Résultat constaté sur
 * 6 évènements en production :
 *
 *     plan     = free
 *     ends_at  = null      → un droit premium SANS TERME
 *
 * Ce que ces tests verrouillent : l'état final est correct QUEL QUE SOIT
 * l'ordre d'arrivée.
 *
 * Pourquoi un faux fournisseur : les corps de webhook ne sont pas conservés
 * (`provider_events` ne garde qu'une empreinte — donnée personnelle), donc la
 * seule source restante est une RELECTURE chez le fournisseur. Le double
 * compte ses appels : on vérifie aussi qu'on ne relit PAS quand c'est inutile.
 */
class StripeSubscriptionCreatedOrderingTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private FakeStripeReader $provider;

    private Carbon $periodEnd;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->periodEnd = Carbon::now()->addYear()->startOfSecond();

        config(['billing.plans' => [
            'annual' => [
                'key' => 'annual', 'name' => 'Premium annuel',
                'price_id' => 'price_annuel_test',
                'amount_cents' => 3500, 'currency' => 'EUR',
                'interval' => 'year', 'active' => true,
            ],
        ]]);

        // Le faux fournisseur REMPLACE stripe dans le registre : il répond ce
        // que l'API de Stripe répondrait, sans réseau.
        $this->provider = new FakeStripeReader($this->periodEnd);

        $registry = app(PaymentProviderRegistry::class);
        $registry->register($this->provider);
    }

    private function translator(): StripeEventTranslator
    {
        return new StripeEventTranslator;
    }

    private function adapter(): ProviderSubscriptionAdapter
    {
        return app(ProviderSubscriptionAdapter::class);
    }

    private function hasPremium(): bool
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM);
    }

    /** `customer.subscription.created` : tarif + période, aucun élève. */
    private function createdEvent(string $id = 'evt_created', string $sub = 'sub_course', string $cus = 'cus_course'): TranslatedEvent
    {
        return $this->translator()->translate(json_encode([
            'id' => $id,
            'type' => 'customer.subscription.created',
            'created' => Carbon::now()->timestamp,
            'data' => ['object' => [
                'id' => $sub, 'customer' => $cus, 'status' => 'active',
                // LA FORME RÉELLE 2025 : la période vit sur la LIGNE.
                'items' => ['data' => [[
                    'current_period_start' => Carbon::now()->timestamp,
                    'current_period_end' => $this->periodEnd->timestamp,
                    'price' => ['id' => 'price_annuel_test'],
                ]]],
            ]],
        ]));
    }

    /** `checkout.session.completed` : l'élève, mais ni tarif ni période. */
    private function sessionEvent(?string $reference = null, string $id = 'evt_session', string $sub = 'sub_course', string $cus = 'cus_course'): TranslatedEvent
    {
        return $this->translator()->translate(json_encode([
            'id' => $id,
            'type' => 'checkout.session.completed',
            'created' => Carbon::now()->addSecond()->timestamp,
            'data' => ['object' => [
                'id' => 'cs_'.$id, 'mode' => 'subscription',
                'subscription' => $sub, 'customer' => $cus,
                'payment_status' => 'paid',
                'client_reference_id' => $reference ?? (string) $this->student->id,
            ]],
        ]));
    }

    /**
     * Vérifie l'état final complet — base ET accès effectif.
     *
     * S'arrêter à la base laisserait passer un droit correct en apparence
     * mais inopérant : c'est exactement ce qui avait manqué la première fois.
     */
    private function assertFullyMaterialized(string $expectedSubId = 'sub_course', string $expectedCus = 'cus_course'): void
    {
        $this->assertSame(1, Subscription::count(), 'Un seul abonnement doit exister.');

        $sub = Subscription::first();
        $this->assertSame('stripe', $sub->provider);
        $this->assertSame($expectedSubId, $sub->external_reference);
        $this->assertSame($this->student->id, $sub->user_id);
        $this->assertSame($expectedCus, $sub->provider_customer_id);
        $this->assertSame('annual', $sub->plan, 'Le plan doit être résolu depuis le tarif Stripe.');
        $this->assertSame('active', $sub->provider_status);
        $this->assertSame('price_annuel_test', $sub->provider_price_id);
        $this->assertNotNull($sub->current_period_end, 'La période doit être connue.');
        $this->assertNotNull($sub->ends_at, 'Un droit sans terme est le défaut à empêcher.');
        $this->assertSame($this->periodEnd->timestamp, $sub->ends_at->timestamp);

        $this->assertSame(1, Entitlement::count(), 'Un seul droit, jamais un doublon.');
        $ent = Entitlement::first();
        $this->assertSame(Entitlement::TYPE_SUBSCRIPTION, $ent->type);
        $this->assertSame(Entitlement::STATUS_ACTIVE, $ent->status);
        $this->assertSame('subscription:'.$sub->id, $ent->reference);
        $this->assertNotNull($ent->expires_at, 'Le droit doit expirer avec la période payée.');
        $this->assertSame($this->periodEnd->timestamp, $ent->expires_at->timestamp);

        $this->assertTrue($this->hasPremium(), "L'accès premium doit être réellement ouvert.");
    }

    // ── Variante B : l'ordre RÉEL, celui qui cassait ────────────────────

    public function test_created_before_session_still_produces_a_complete_subscription(): void
    {
        // 1. L'abonnement arrive d'abord : rien ne peut être écrit.
        $created = $this->adapter()->apply($this->createdEvent()->subscription);

        $this->assertSame('unresolved', $created['action']);
        $this->assertSame('unknown_customer', $created['reason']);
        $this->assertSame(0, Subscription::count(), 'Sans élève, aucun abonnement.');
        $this->assertFalse($this->hasPremium());

        // 2. La session rattache l'élève — sans tarif ni période.
        $this->adapter()->apply($this->sessionEvent()->subscription);

        // 3. L'état final doit malgré tout être COMPLET.
        $this->assertFullyMaterialized();
    }

    public function test_the_premium_lesson_really_opens_after_the_race(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        // Pas seulement la base : la couche d'accès elle-même.
        $this->assertTrue(
            app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM),
            "Le contenu premium doit être accessible par le chemin d'accès normal."
        );
    }

    // ── Variante A : l'ordre « normal » ne doit pas régresser ───────────

    public function test_session_before_created_also_produces_a_complete_subscription(): void
    {
        $this->adapter()->apply($this->sessionEvent()->subscription);
        $this->adapter()->apply($this->createdEvent()->subscription);

        $this->assertFullyMaterialized();
    }

    // ── Variante D : doublon ────────────────────────────────────────────

    public function test_the_created_event_delivered_twice_changes_nothing(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        $sub = Subscription::first();
        $before = [$sub->plan, (string) $sub->ends_at, $sub->id];

        // La MÊME création, rejouée.
        $this->adapter()->apply($this->createdEvent()->subscription);

        $sub = Subscription::first()->refresh();
        $this->assertSame($before, [$sub->plan, (string) $sub->ends_at, $sub->id]);
        $this->assertSame(1, Subscription::count());
        $this->assertSame(1, Entitlement::count());
        $this->assertFullyMaterialized();
    }

    // ── Variante E : une création PÉRIMÉE n'écrase pas un état plus récent ──

    public function test_a_stale_created_never_overwrites_a_newer_state(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);
        $this->assertFullyMaterialized();

        // Une création ANCIENNE, arrivée en retard, portant un autre tarif.
        $stale = $this->translator()->translate(json_encode([
            'id' => 'evt_stale',
            'type' => 'customer.subscription.created',
            'created' => Carbon::now()->subDay()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_course', 'customer' => 'cus_course', 'status' => 'active',
                'items' => ['data' => [[
                    'current_period_end' => Carbon::now()->subHour()->timestamp,
                    'price' => ['id' => 'price_inconnu'],
                ]]],
            ]],
        ]));

        $result = $this->adapter()->apply($stale->subscription);

        $this->assertSame('ignored', $result['action']);
        $this->assertSame('stale', $result['reason']);
        $this->assertFullyMaterialized();
    }

    // ── La relecture ne se déclenche QUE si elle est nécessaire ─────────

    public function test_a_complete_event_never_calls_the_provider(): void
    {
        // Une création complète suivie d'une session : au moment où la session
        // arrive, la ligne connaît déjà tarif et période.
        $this->adapter()->apply($this->sessionEvent()->subscription);
        $callsAfterSession = $this->provider->fetchCalls;

        $this->adapter()->apply($this->createdEvent()->subscription);

        $this->assertSame(
            $callsAfterSession,
            $this->provider->fetchCalls,
            "Un évènement complet ne doit provoquer aucun appel réseau."
        );
    }

    public function test_a_provider_outage_never_loses_the_subscription(): void
    {
        $this->provider->failing = true;

        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        // L'abonnement existe, rattaché au bon élève : rien n'est perdu.
        $this->assertSame(1, Subscription::count());
        $sub = Subscription::first();
        $this->assertSame($this->student->id, $sub->user_id);

        // Le tarif et la période manquent encore : la panne les a empêchés.
        $this->assertNull($sub->provider_price_id);

        // Panne passée, un évènement PLUS RÉCENT complète l'état. Il doit
        // être postérieur : la protection anti-péremption rejette (à juste
        // titre) un évènement plus ancien que la dernière synchronisation.
        $this->provider->failing = false;

        $later = $this->translator()->translate(json_encode([
            'id' => 'evt_retry',
            'type' => 'customer.subscription.updated',
            'created' => Carbon::now()->addMinute()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_course', 'customer' => 'cus_course', 'status' => 'active',
                'items' => ['data' => [[
                    'current_period_start' => Carbon::now()->timestamp,
                    'current_period_end' => $this->periodEnd->timestamp,
                    'price' => ['id' => 'price_annuel_test'],
                ]]],
            ]],
        ]));

        $this->adapter()->apply($later->subscription);

        $this->assertFullyMaterialized();
    }

    // ── Sécurité : la course ne doit ouvrir aucun accès de travers ──────

    public function test_a_forged_client_reference_never_binds_another_student(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent(reference: (string) $victim->id)->subscription);

        // L'abonnement appartient à la référence portée par la SESSION, que
        // notre serveur a posée — jamais à l'élève de test par défaut.
        $sub = Subscription::first();
        $this->assertSame($victim->id, $sub->user_id);
        $this->assertFalse($this->hasPremium(), "L'élève d'origine ne doit RIEN recevoir.");
    }

    public function test_a_non_numeric_client_reference_is_never_interpreted(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $result = $this->adapter()->apply($this->sessionEvent(reference: "1 OR 1=1")->subscription);

        $this->assertSame('unresolved', $result['action']);
        $this->assertSame(0, Subscription::count());
        $this->assertSame(0, Entitlement::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_an_unknown_user_id_opens_nothing(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $result = $this->adapter()->apply($this->sessionEvent(reference: '999999')->subscription);

        $this->assertSame('unresolved', $result['action']);
        $this->assertSame(0, Subscription::count());
        $this->assertFalse($this->hasPremium());
    }

    public function test_a_mismatched_customer_in_the_reread_is_refused(): void
    {
        // Le fournisseur répond avec un AUTRE client que celui de l'évènement.
        $this->provider->customerOverride = 'cus_quelqun_dautre';

        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        $sub = Subscription::first();
        // Le rattachement reste celui de l'évènement signé.
        $this->assertSame('cus_course', $sub->provider_customer_id);
        // Et la relecture suspecte n'a rien apporté.
        $this->assertNull($sub->provider_price_id);
    }

    // ── La résiliation ne doit pas régresser ────────────────────────────

    public function test_deletion_still_closes_the_access_after_the_race(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);
        $this->assertFullyMaterialized();

        $deleted = $this->translator()->translate(json_encode([
            'id' => 'evt_deleted',
            'type' => 'customer.subscription.deleted',
            'created' => Carbon::now()->addMinute()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_course', 'customer' => 'cus_course', 'status' => 'canceled',
                'ended_at' => Carbon::now()->addMinute()->timestamp,
                'items' => ['data' => [[
                    'current_period_end' => $this->periodEnd->timestamp,
                    'price' => ['id' => 'price_annuel_test'],
                ]]],
            ]],
        ]));

        $this->adapter()->apply($deleted->subscription);

        $sub = Subscription::first()->refresh();
        $this->assertSame('canceled', $sub->provider_status);
        $this->assertSame(Subscription::STATUS_EXPIRED, $sub->status);
        $this->assertFalse($this->hasPremium(), "Une suppression doit fermer l'accès.");

        // Le droit est révoqué, pas ressuscité, et jamais dupliqué.
        $this->assertSame(1, Entitlement::count());
        $this->assertSame(Entitlement::STATUS_REVOKED, Entitlement::first()->status);
    }

    public function test_a_late_created_never_resurrects_a_deleted_subscription(): void
    {
        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        $deleted = $this->translator()->translate(json_encode([
            'id' => 'evt_del2',
            'type' => 'customer.subscription.deleted',
            'created' => Carbon::now()->addMinute()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_course', 'customer' => 'cus_course', 'status' => 'canceled',
                'ended_at' => Carbon::now()->addMinute()->timestamp,
            ]],
        ]));
        $this->adapter()->apply($deleted->subscription);
        $this->assertFalse($this->hasPremium());

        // La création d'origine, rejouée APRÈS la suppression.
        $this->adapter()->apply($this->createdEvent()->subscription);

        $this->assertFalse($this->hasPremium(), "Un évènement périmé ne rouvre jamais un accès.");
    }

    // ── Le tarif inconnu garde son comportement ─────────────────────────

    public function test_an_unknown_price_never_invents_a_plan(): void
    {
        $this->provider->priceOverride = 'price_pas_au_catalogue';

        $this->adapter()->apply($this->createdEvent()->subscription);
        $this->adapter()->apply($this->sessionEvent()->subscription);

        $sub = Subscription::first();
        // `free` est la valeur par défaut de la colonne : elle n'a pas été
        // remplacée par une valeur inventée.
        $this->assertSame('free', $sub->plan);
    }
}

/**
 * Le fournisseur, tel que l'adaptateur a le droit de le lire.
 *
 * Ne fait QUE ce que la course exige : répondre à une relecture. Tout le
 * reste refuse bruyamment, pour qu'un test qui s'en servirait par accident
 * échoue au lieu de passer pour de mauvaises raisons.
 */
class FakeStripeReader implements PaymentProvider
{
    public int $fetchCalls = 0;

    public bool $failing = false;

    public ?string $customerOverride = null;

    public ?string $priceOverride = null;

    public function __construct(private Carbon $periodEnd) {}

    public function name(): string
    {
        return 'stripe';
    }

    public function verifySignature(string $payload, ?string $signature): bool
    {
        return true;
    }

    public function translate(string $payload): TranslatedEvent
    {
        return (new StripeEventTranslator)->translate($payload);
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
        throw new CheckoutFailedException('Non utilisé par ce test.');
    }

    public function createPortalSession(string $customerId, string $returnUrl): PortalSession
    {
        throw new CheckoutFailedException('Non utilisé par ce test.');
    }

    public function cancelAtPeriodEnd(string $providerSubscriptionId): ProviderSubscriptionState
    {
        throw new CheckoutFailedException('Non utilisé par ce test.');
    }

    public function resumeSubscription(string $providerSubscriptionId): ProviderSubscriptionState
    {
        throw new CheckoutFailedException('Non utilisé par ce test.');
    }

    public function fetchSubscription(string $providerSubscriptionId): ?ProviderSubscriptionState
    {
        $this->fetchCalls++;

        if ($this->failing) {
            throw new CheckoutFailedException('Fournisseur indisponible.');
        }

        return new ProviderSubscriptionState(
            provider: 'stripe',
            providerSubscriptionId: $providerSubscriptionId,
            providerCustomerId: $this->customerOverride ?? 'cus_course',
            providerStatus: 'active',
            providerPriceId: $this->priceOverride ?? 'price_annuel_test',
            currentPeriodStart: Carbon::now(),
            currentPeriodEnd: $this->periodEnd,
            cancelAtPeriodEnd: false,
            occurredAt: Carbon::now(),
        );
    }
}
