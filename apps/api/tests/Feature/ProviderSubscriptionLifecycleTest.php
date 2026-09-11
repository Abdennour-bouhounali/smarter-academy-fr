<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Billing\ProviderSubscriptionAdapter;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Models\Entitlement;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * état du fournisseur → statut local → droit → accès.
 *
 * La table de correspondance, vérifiée cas par cas. Ce fichier est la
 * VÉRITÉ EXÉCUTABLE de ce que le document d'audit décrit en prose : si l'un
 * des deux doit être cru, c'est celui-ci.
 *
 * Le cas qui mérite le plus d'attention est `past_due`, et il a une section à
 * lui : c'est une règle DÉDUITE de l'architecture existante, pas une règle
 * inventée pour l'occasion. Voir test_past_due_*.
 */
class ProviderSubscriptionLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function adapter(): ProviderSubscriptionAdapter
    {
        return app(ProviderSubscriptionAdapter::class);
    }

    /** Applique un état de fournisseur, comme le ferait un webhook. */
    private function apply(string $providerStatus, array $overrides = []): array
    {
        $state = new ProviderSubscriptionState(
            provider: 'test',
            providerSubscriptionId: $overrides['id'] ?? 'sub_1',
            providerCustomerId: 'cus_1',
            providerStatus: $providerStatus,
            providerPriceId: 'price_1',
            currentPeriodStart: $overrides['start'] ?? Carbon::now()->subDays(3),
            currentPeriodEnd: array_key_exists('end', $overrides)
                ? $overrides['end']
                : Carbon::now()->addMonth(),
            cancelAtPeriodEnd: $overrides['cancelAtPeriodEnd'] ?? false,
            occurredAt: $overrides['occurredAt'] ?? Carbon::now(),
            deleted: $overrides['deleted'] ?? false,
            clientReferenceId: (string) $this->student->id,
        );

        return $this->adapter()->apply($state);
    }

    private function hasPremium(): bool
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class)->satisfies($this->student->fresh(), AccessTier::PREMIUM);
    }

    private function localStatus(): string
    {
        return Subscription::first()->status;
    }

    // ── Les statuts qui N'OUVRENT PAS ───────────────────────────────────

    public function test_incomplete_grants_nothing(): void
    {
        $this->apply('incomplete');

        $this->assertSame(Subscription::STATUS_PENDING, $this->localStatus());
        $this->assertFalse($this->hasPremium(), 'Rien n\'est payé : ouvrir ici serait l\'erreur que toute l\'architecture évite.');
        $this->assertSame(0, Entitlement::count());
    }

    public function test_incomplete_expired_grants_nothing(): void
    {
        $this->apply('incomplete_expired');

        $this->assertSame(Subscription::STATUS_EXPIRED, $this->localStatus());
        $this->assertFalse($this->hasPremium());
    }

    public function test_an_unknown_provider_status_closes_rather_than_opens(): void
    {
        // Un statut que le fournisseur inventerait demain. Le défaut sûr est
        // celui qui FERME : on n'ouvre jamais sur une valeur qu'on ne comprend
        // pas.
        $this->apply('une_nouveaute_inattendue');

        $this->assertSame(Subscription::STATUS_PENDING, $this->localStatus());
        $this->assertFalse($this->hasPremium());
    }

    // ── Les statuts qui OUVRENT ─────────────────────────────────────────

    public function test_active_opens_access(): void
    {
        $this->apply('active');

        $this->assertSame(Subscription::STATUS_ACTIVE, $this->localStatus());
        $this->assertTrue($this->hasPremium());
    }

    public function test_trialing_opens_access_until_the_trial_ends(): void
    {
        // Un essai est un accès accordé et daté : sa fin est portée par ends_at.
        $this->apply('trialing', ['end' => Carbon::now()->addDays(7)]);

        $this->assertSame(Subscription::STATUS_ACTIVE, $this->localStatus());
        $this->assertTrue($this->hasPremium());

        $this->travelTo(Carbon::now()->addDays(8));
        $this->assertFalse($this->hasPremium(), 'L\'essai doit se fermer tout seul, par le temps.');
    }

    // ── past_due : la règle DÉDUITE ─────────────────────────────────────

    /**
     * L'échec de paiement ne ferme rien par lui-même.
     *
     * Ce n'est pas un délai de grâce inventé. C'est la conséquence de deux
     * règles déjà écrites AVANT cette phase :
     *
     *   1. la couche d'accès ne lit jamais `payments` ;
     *   2. `ends_at` est recopié dans le droit, donc le temps ferme seul.
     *
     * L'élève garde donc ce qu'il a payé, et pas un jour de plus.
     */
    public function test_past_due_keeps_access_until_the_paid_period_ends(): void
    {
        $end = Carbon::now()->addDays(10);
        $this->apply('past_due', ['end' => $end]);

        $this->assertSame(Subscription::STATUS_ACTIVE, $this->localStatus());
        $this->assertTrue($this->hasPremium(), 'La période déjà payée reste due à l\'élève.');

        // Le statut du fournisseur est CONSERVÉ pour le diagnostic — mais il
        // n'est pas celui qui décide.
        $this->assertSame('past_due', Subscription::first()->provider_status);
    }

    public function test_past_due_access_closes_by_itself_at_the_end_of_the_paid_period(): void
    {
        $this->apply('past_due', ['end' => Carbon::now()->addDays(10)]);
        $this->assertTrue($this->hasPremium());

        // AUCUNE synchronisation ne tourne ici. C'est le temps qui ferme, et
        // c'est ce qui rend la règle sûre : elle ne dépend d'aucune tâche.
        $this->travelTo(Carbon::now()->addDays(11));

        $this->assertFalse($this->hasPremium(), 'Le droit doit expirer seul, sans qu\'aucune tâche ne repasse.');
    }

    public function test_unpaid_revokes_immediately(): void
    {
        $this->apply('active');
        $this->assertTrue($this->hasPremium());

        // Le fournisseur a épuisé ses relances : la période due est consommée.
        $this->apply('unpaid', ['occurredAt' => Carbon::now()->addSecond()]);

        $this->assertSame(Subscription::STATUS_EXPIRED, $this->localStatus());
        $this->assertFalse($this->hasPremium());
    }

    /**
     * Un abonnement expiré qui conserverait une fin de période future
     * laisserait le droit OUVERT — puisque le droit ne regarde que les dates.
     * La borne est donc ramenée à maintenant.
     */
    public function test_unpaid_closes_even_with_a_future_period_end(): void
    {
        $this->apply('unpaid', ['end' => Carbon::now()->addMonth()]);

        $this->assertFalse($this->hasPremium());
        $this->assertTrue(Subscription::first()->ends_at->lessThanOrEqualTo(Carbon::now()->addSecond()));
    }

    // ── La résiliation ──────────────────────────────────────────────────

    public function test_cancellation_scheduled_for_period_end_keeps_access(): void
    {
        // Stripe dit encore « active », mais l'abonnement est résilié pour la
        // fin de la période. Résilier n'est PAS se faire rembourser.
        $this->apply('active', [
            'cancelAtPeriodEnd' => true,
            'end' => Carbon::now()->addDays(20),
        ]);

        $this->assertSame(Subscription::STATUS_CANCELLED, $this->localStatus());
        $this->assertTrue($this->hasPremium(), 'La période déjà payée doit rester ouverte.');
        $this->assertTrue(Subscription::first()->cancel_at_period_end);
    }

    public function test_a_scheduled_cancellation_closes_at_the_term_and_not_before(): void
    {
        $this->apply('active', [
            'cancelAtPeriodEnd' => true,
            'end' => Carbon::now()->addDays(20),
        ]);

        $this->travelTo(Carbon::now()->addDays(19));
        $this->assertTrue($this->hasPremium());

        $this->travelTo(Carbon::now()->addDays(2));
        $this->assertFalse($this->hasPremium());
    }

    public function test_an_immediate_cancellation_closes_now(): void
    {
        $this->apply('active');
        $this->assertTrue($this->hasPremium());

        // Résilié sans période restante : terminé pour de bon.
        $this->apply('canceled', [
            'end' => Carbon::now()->subDay(),
            'occurredAt' => Carbon::now()->addSecond(),
        ]);

        $this->assertSame(Subscription::STATUS_EXPIRED, $this->localStatus());
        $this->assertFalse($this->hasPremium());
    }

    public function test_a_cancellation_without_any_period_closes_now(): void
    {
        $this->apply('canceled', ['end' => null]);

        $this->assertSame(Subscription::STATUS_EXPIRED, $this->localStatus());
        $this->assertFalse($this->hasPremium());
    }

    /**
     * RÉGRESSION — trouvée au navigateur, pas en test unitaire.
     *
     * Un abonnement SUPPRIMÉ chez le fournisseur transporte souvent encore sa
     * fin de période d'origine. Lue comme « résilié, avec du temps restant »,
     * elle laissait l'accès ouvert APRÈS la disparition de l'abonnement — le
     * temps finissait par fermer, mais l'élève gardait un accès que plus rien
     * ne justifiait. Une suppression est terminale.
     */
    public function test_a_deleted_subscription_closes_immediately_even_with_a_future_period(): void
    {
        $this->apply('active');
        $this->assertTrue($this->hasPremium());

        $this->apply('canceled', [
            'deleted' => true,
            // Le piège : une fin de période encore à venir.
            'end' => Carbon::now()->addMonth(),
            'occurredAt' => Carbon::now()->addSecond(),
        ]);

        $this->assertSame(Subscription::STATUS_EXPIRED, $this->localStatus());
        $this->assertFalse(
            $this->hasPremium(),
            'Un abonnement supprimé chez le fournisseur ne doit laisser aucune période à honorer.'
        );
    }

    // ── La réactivation ─────────────────────────────────────────────────

    public function test_reactivation_restores_the_same_entitlement(): void
    {
        $this->apply('active');
        $entitlementId = Entitlement::first()->id;

        // Expiration…
        $this->apply('unpaid', ['occurredAt' => Carbon::now()->addSecond()]);
        $this->assertFalse($this->hasPremium());
        $this->assertSame(Entitlement::STATUS_REVOKED, Entitlement::find($entitlementId)->status);

        // … puis le paiement est rattrapé.
        $this->apply('active', [
            'end' => Carbon::now()->addMonth(),
            'occurredAt' => Carbon::now()->addSeconds(2),
        ]);

        $this->assertTrue($this->hasPremium());

        // LE MÊME droit est rouvert, pas un second : c'est la référence stable
        // `subscription:<id>` du synchroniseur qui le garantit. Un second droit
        // serait un droit que plus rien ne révoquerait.
        $this->assertSame(1, Entitlement::count());
        $this->assertSame($entitlementId, Entitlement::first()->id);
        $this->assertSame(Entitlement::STATUS_ACTIVE, Entitlement::first()->status);
    }

    public function test_cancelling_then_resuming_reopens_without_duplicating(): void
    {
        $this->apply('active', ['cancelAtPeriodEnd' => true, 'end' => Carbon::now()->addDays(10)]);
        $this->assertSame(Subscription::STATUS_CANCELLED, $this->localStatus());

        // L'élève annule sa résiliation.
        $this->apply('active', [
            'cancelAtPeriodEnd' => false,
            'end' => Carbon::now()->addMonth(),
            'occurredAt' => Carbon::now()->addSecond(),
        ]);

        $this->assertSame(Subscription::STATUS_ACTIVE, $this->localStatus());
        $this->assertFalse(Subscription::first()->cancel_at_period_end);
        $this->assertTrue($this->hasPremium());
        $this->assertSame(1, Entitlement::count());
    }

    // ── L'identité ──────────────────────────────────────────────────────

    public function test_two_provider_subscriptions_produce_two_local_rows(): void
    {
        $this->apply('active', ['id' => 'sub_A']);
        $this->apply('active', ['id' => 'sub_B']);

        // Un renouvellement anticipé peut recouvrir la fin du précédent : les
        // abonnements doivent pouvoir se chevaucher.
        $this->assertSame(2, Subscription::count());
        $this->assertSame(2, Entitlement::count());
    }

    public function test_the_subscription_owner_never_changes(): void
    {
        $this->apply('active');
        $other = User::factory()->create(['role' => User::ROLE_STUDENT]);

        // Un évènement prétendant réattribuer l'abonnement à un autre compte.
        $this->adapter()->apply(new ProviderSubscriptionState(
            provider: 'test',
            providerSubscriptionId: 'sub_1',
            providerCustomerId: 'cus_1',
            providerStatus: 'active',
            providerPriceId: null,
            currentPeriodStart: Carbon::now(),
            currentPeriodEnd: Carbon::now()->addMonth(),
            occurredAt: Carbon::now()->addSecond(),
            clientReferenceId: (string) $other->id,
        ));

        $this->assertSame(
            $this->student->id,
            Subscription::first()->user_id,
            'Le propriétaire d\'un abonnement ne se déplace jamais : l\'accès du premier élève a eu lieu.'
        );
    }

    // ── Le compte suspendu domine tout ──────────────────────────────────

    public function test_a_suspended_account_loses_access_despite_an_active_subscription(): void
    {
        $this->apply('active');
        $this->assertTrue($this->hasPremium());

        $this->student->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->assertFalse(
            $this->hasPremium(),
            'Suspendre quelqu\'un qui a payé doit le suspendre pour de bon.'
        );
    }
}
