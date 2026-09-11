<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Billing\Stripe\StripeEventTranslator;
use App\Models\Entitlement;
use App\Models\ProviderEvent;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Les défauts que SEULES les données réelles de Stripe ont révélés.
 *
 * Chacun de ces tests correspond à un bug trouvé en phase 6.5, en faisant un
 * vrai paiement de test. Tous étaient invisibles aux fixtures : celles-ci
 * reproduisaient l'ancienne forme de l'API, donc elles confirmaient un code
 * qui ne marchait pas.
 *
 * Les corps utilisés ici sont copiés de la FORME RÉELLE observée, pas de ce
 * que la documentation laisse supposer.
 */
class StripeRealPayloadRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        config(['billing.plans' => [
            'annual' => [
                'key' => 'annual', 'name' => 'Premium annuel',
                'price_id' => 'price_reel_annuel',
                'amount_cents' => 3500, 'currency' => 'EUR',
                'interval' => 'year', 'active' => true,
            ],
        ]]);
    }

    private function translator(): StripeEventTranslator
    {
        return new StripeEventTranslator;
    }

    /**
     * Rattache l'état à l'élève de test.
     *
     * ProviderSubscriptionState est immuable (readonly) : on le recompose au
     * lieu de le muter. Dans la vraie vie, ce rattachement vient du
     * `client_reference_id` que notre serveur a posé sur la session.
     */
    private function forStudent(ProviderSubscriptionState $s): ProviderSubscriptionState
    {
        return new ProviderSubscriptionState(
            provider: $s->provider,
            providerSubscriptionId: $s->providerSubscriptionId,
            providerCustomerId: $s->providerCustomerId,
            providerStatus: $s->providerStatus,
            providerPriceId: $s->providerPriceId,
            currentPeriodStart: $s->currentPeriodStart,
            currentPeriodEnd: $s->currentPeriodEnd,
            cancelAtPeriodEnd: $s->cancelAtPeriodEnd,
            occurredAt: $s->occurredAt,
            deleted: $s->deleted,
            clientReferenceId: (string) $this->student->id,
        );
    }

    private function hasPremium(): bool
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM);
    }

    // ── D1 : la période vit sur les LIGNES, plus à la racine ────────────

    /**
     * Le défaut le plus grave des trois.
     *
     * Depuis l'API 2025, `current_period_end` est NULL à la racine de
     * l'abonnement et vit sur `items.data[0]`. En le manquant, `ends_at`
     * restait nul → le droit devenait SANS TERME → un abonnement résilié
     * n'expirait plus jamais tout seul.
     */
    public function test_the_billing_period_is_read_from_the_items_when_the_root_is_null(): void
    {
        $start = Carbon::now()->subDay();
        $end = Carbon::now()->addYear();

        $translated = $this->translator()->translate(json_encode([
            'id' => 'evt_reel',
            'type' => 'customer.subscription.created',
            'created' => Carbon::now()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_reel',
                'customer' => 'cus_reel',
                'status' => 'active',
                // LA FORME RÉELLE : la racine ne porte plus rien.
                'current_period_start' => null,
                'current_period_end' => null,
                'items' => ['data' => [[
                    'current_period_start' => $start->timestamp,
                    'current_period_end' => $end->timestamp,
                    'price' => ['id' => 'price_reel_annuel'],
                ]]],
            ]],
        ]));

        $state = $translated->subscription;

        $this->assertNotNull($state->currentPeriodEnd, 'La fin de période a été perdue : le droit serait SANS TERME.');
        $this->assertSame($end->timestamp, $state->currentPeriodEnd->timestamp);
        $this->assertSame($start->timestamp, $state->currentPeriodStart->timestamp);
    }

    public function test_the_old_root_level_form_keeps_working(): void
    {
        // Un webhook plus ancien, rejoué, doit continuer d'être traité : on
        // lit la racine D'ABORD, les lignes ensuite.
        $end = Carbon::now()->addMonth();

        $state = $this->translator()->translate(json_encode([
            'id' => 'evt_ancien',
            'type' => 'customer.subscription.updated',
            'created' => Carbon::now()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_ancien', 'customer' => 'cus_x', 'status' => 'active',
                'current_period_end' => $end->timestamp,
            ]],
        ]))->subscription;

        $this->assertSame($end->timestamp, $state->currentPeriodEnd->timestamp);
    }

    public function test_a_subscription_without_a_period_never_grants_an_endless_right(): void
    {
        // La conséquence concrète du défaut : sans terme, un droit ne meurt
        // jamais. On vérifie que la période traverse bien toute la chaîne.
        $end = Carbon::now()->addDays(30);

        $event = $this->translator()->translate(json_encode([
                'id' => 'evt_chaine',
                'type' => 'customer.subscription.created',
                'created' => Carbon::now()->timestamp,
                'data' => ['object' => [
                    'id' => 'sub_chaine', 'customer' => 'cus_chaine', 'status' => 'active',
                    'items' => ['data' => [[
                        'current_period_start' => Carbon::now()->subHour()->timestamp,
                        'current_period_end' => $end->timestamp,
                        'price' => ['id' => 'price_reel_annuel'],
                    ]]],
                ]],
        ]));

        app(ProviderSubscriptionAdapter::class)->apply($this->forStudent($event->subscription));

        $entitlement = Entitlement::firstOrFail();

        $this->assertNotNull($entitlement->expires_at, 'Le droit est SANS TERME : il n\'expirera jamais.');
        $this->assertSame($end->timestamp, $entitlement->expires_at->timestamp);
    }

    // ── D2 : le plan n'était jamais renseigné ───────────────────────────

    public function test_the_plan_key_is_resolved_from_the_provider_price(): void
    {
        $event = $this->translator()->translate(json_encode([
                'id' => 'evt_plan',
                'type' => 'customer.subscription.created',
                'created' => Carbon::now()->timestamp,
                'data' => ['object' => [
                    'id' => 'sub_plan', 'customer' => 'cus_plan', 'status' => 'active',
                    'items' => ['data' => [[
                        'current_period_end' => Carbon::now()->addYear()->timestamp,
                        'price' => ['id' => 'price_reel_annuel'],
                    ]]],
                ]],
        ]));

        app(ProviderSubscriptionAdapter::class)->apply($this->forStudent($event->subscription));

        // Sans cette correction, l'administration affichait « free » pour un
        // abonnement payant.
        $this->assertSame('annual', Subscription::firstOrFail()->plan);
    }

    public function test_an_unknown_price_leaves_the_existing_plan_untouched(): void
    {
        // Une offre retirée du catalogue : on ne devine pas, et on n'écrase
        // pas non plus ce qui est déjà en base.
        $event = $this->translator()->translate(json_encode([
                'id' => 'evt_inconnu',
                'type' => 'customer.subscription.created',
                'created' => Carbon::now()->timestamp,
                'data' => ['object' => [
                    'id' => 'sub_inconnu', 'customer' => 'cus_i', 'status' => 'active',
                    'items' => ['data' => [[
                        'current_period_end' => Carbon::now()->addYear()->timestamp,
                        'price' => ['id' => 'price_disparu'],
                    ]]],
                ]],
        ]));

        app(ProviderSubscriptionAdapter::class)->apply($this->forStudent($event->subscription));

        // La valeur par défaut de la colonne, pas une invention.
        $this->assertSame('free', Subscription::firstOrFail()->plan);
    }

    // ── D3 : l'ordre réel des évènements ────────────────────────────────

    /**
     * Stripe émet `customer.subscription.created` AVANT
     * `checkout.session.completed`. Au premier, l'élève est introuvable.
     *
     * L'évènement doit rester REJOUABLE plutôt que d'être clos : sinon il est
     * perdu, et la chaîne ne tient plus qu'à un seul évènement.
     */
    public function test_an_event_arriving_before_the_customer_is_linked_stays_replayable(): void
    {
        $before = $this->translator()->translate(json_encode([
            'id' => 'evt_avant',
            'type' => 'customer.subscription.created',
            'created' => Carbon::now()->timestamp,
            'data' => ['object' => [
                'id' => 'sub_ordre', 'customer' => 'cus_ordre', 'status' => 'active',
                'items' => ['data' => [[
                    'current_period_end' => Carbon::now()->addYear()->timestamp,
                    'price' => ['id' => 'price_reel_annuel'],
                ]]],
            ]],
        ]));

        $result = app(ProviderSubscriptionAdapter::class)->apply($before->subscription);

        $this->assertSame('unresolved', $result['action']);
        $this->assertSame('unknown_customer', $result['reason']);

        // Aucun accès n'est ouvert — la garde tient.
        $this->assertFalse($this->hasPremium());
        $this->assertSame(0, Subscription::count());
    }

    public function test_the_session_links_the_customer_and_the_chain_converges(): void
    {
        // 1. L'abonnement arrive en premier : non rattachable.
        $event = $this->translator()->translate(json_encode([
                'id' => 'evt_1',
                'type' => 'customer.subscription.created',
                'created' => Carbon::now()->timestamp,
                'data' => ['object' => [
                    'id' => 'sub_conv', 'customer' => 'cus_conv', 'status' => 'active',
                    'items' => ['data' => [[
                        'current_period_end' => Carbon::now()->addYear()->timestamp,
                        'price' => ['id' => 'price_reel_annuel'],
                    ]]],
                ]],
        ]));

        app(ProviderSubscriptionAdapter::class)->apply($event->subscription);

        $this->assertFalse($this->hasPremium());

        // 2. La session arrive ENSUITE et porte le `client_reference_id`.
        $event2 = $this->translator()->translate(json_encode([
                'id' => 'evt_2',
                'type' => 'checkout.session.completed',
                'created' => Carbon::now()->addSecond()->timestamp,
                'data' => ['object' => [
                    'id' => 'cs_conv', 'mode' => 'subscription',
                    'subscription' => 'sub_conv', 'customer' => 'cus_conv',
                    'payment_status' => 'paid',
                    'client_reference_id' => (string) $this->student->id,
                ]],
        ]));

        app(ProviderSubscriptionAdapter::class)->apply($event2->subscription);

        // La chaîne converge : l'accès s'ouvre.
        $this->assertTrue($this->hasPremium());
        $this->assertSame(1, Subscription::count());
        $this->assertSame(1, Entitlement::count());
    }

    // ── Post-audit phase 7 : les invariants que les correctifs PROMETTENT ──

    /**
     * D4 ne doit jamais servir à PROLONGER un droit.
     *
     * Le rattrapage d'horloge ne touche que la date de DÉBUT. Si un jour il
     * touchait la fin, la fenêtre de 300 s deviendrait un levier pour repousser
     * l'échéance à chaque synchronisation.
     */
    public function test_the_clock_skew_clamp_never_moves_the_end_date(): void
    {
        $end = Carbon::now()->addMonth();

        $subscription = Subscription::create([
            'user_id' => $this->student->id,
            'plan' => 'annual',
            'status' => Subscription::STATUS_ACTIVE,
            'started_at' => Carbon::now()->addMinutes(2),   // dans la fenêtre
            'ends_at' => $end,
        ]);

        $sync = app(\App\Domain\Access\SubscriptionEntitlementSynchronizer::class);

        // Plusieurs passages : si la fin bougeait, elle dériverait ici.
        $sync->sync($subscription);
        $sync->sync($subscription->fresh());
        $sync->sync($subscription->fresh());

        $entitlement = Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->firstOrFail();

        $this->assertSame(
            $end->timestamp,
            $entitlement->expires_at->timestamp,
            'La fenêtre de rattrapage a déplacé la date de FIN : le droit se prolonge tout seul.'
        );
    }

    /**
     * D4 : au-delà de la fenêtre, une date future est une PLANIFICATION.
     *
     * La borne doit rester une borne. Un abonnement actif daté loin devant ne
     * doit pas ouvrir l'accès immédiatement sous prétexte qu'il est actif.
     */
    public function test_a_far_future_start_is_respected_on_an_active_subscription(): void
    {
        $subscription = Subscription::create([
            'user_id' => $this->student->id,
            'plan' => 'annual',
            'status' => Subscription::STATUS_ACTIVE,
            'started_at' => Carbon::now()->addHour(),        // très au-delà de 300 s
            'ends_at' => Carbon::now()->addMonth(),
        ]);

        app(\App\Domain\Access\SubscriptionEntitlementSynchronizer::class)->sync($subscription);

        $this->assertFalse(
            $this->hasPremium(),
            'Une date de début lointaine a été écrasée : la planification ne tient plus.'
        );
    }

    /**
     * D3 : un `client_reference_id` falsifié ne désigne JAMAIS un autre compte.
     *
     * C'est la surface d'IDOR que l'ordre des évènements a mise en lumière :
     * si le rattachement se devinait, un évènement fabriqué ouvrirait l'accès
     * au mauvais élève.
     */
    public function test_a_foreign_client_reference_never_binds_the_subscription_to_another_student(): void
    {
        $victim = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $event = $this->translator()->translate(json_encode([
            'id' => 'evt_idor',
            'type' => 'checkout.session.completed',
            'created' => Carbon::now()->timestamp,
            'data' => ['object' => [
                'id' => 'cs_idor', 'mode' => 'subscription',
                'subscription' => 'sub_idor', 'customer' => 'cus_idor',
                'payment_status' => 'paid',
                // Un identifiant NON numérique : rejeté sans être interprété.
                'client_reference_id' => (string) $victim->id . '; --',
            ]],
        ]));

        $result = app(ProviderSubscriptionAdapter::class)->apply($event->subscription);

        $this->assertSame('unresolved', $result['action']);

        app(EntitlementService::class)->forget();
        $this->assertFalse(
            app(EntitlementService::class)->satisfies($victim->fresh(), AccessTier::PREMIUM),
            'Un identifiant falsifié a ouvert l\'accès à un autre compte.'
        );
        $this->assertSame(0, Subscription::count());
    }
}
