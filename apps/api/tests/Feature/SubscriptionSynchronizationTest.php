<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Models\Entitlement;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * abonnement → droit d'accès.
 *
 * Deux invariants dominent ce fichier :
 *
 *   1. L'abonnement fait autorité, JAMAIS le paiement.
 *   2. La synchronisation est de l'entretien, pas un rempart : un droit
 *      expire tout seul même si elle n'a pas tourné.
 */
class SubscriptionSynchronizationTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
    }

    private function sync(): SubscriptionEntitlementSynchronizer
    {
        return app(SubscriptionEntitlementSynchronizer::class);
    }

    private function entitlements(): EntitlementService
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    private function subscription(array $attributes = []): Subscription
    {
        return Subscription::create(array_merge([
            'user_id' => $this->student->id,
            'plan' => 'mensuel',
            'status' => Subscription::STATUS_ACTIVE,
            'started_at' => Carbon::now()->subDay(),
            'ends_at' => Carbon::now()->addMonth(),
        ], $attributes));
    }

    public function test_active_subscription_creates_an_entitlement_that_grants_access(): void
    {
        $subscription = $this->subscription();

        $result = $this->sync()->sync($subscription);

        $this->assertSame('created', $result['action']);
        $this->assertDatabaseHas('entitlements', [
            'user_id' => $this->student->id,
            'type' => Entitlement::TYPE_SUBSCRIPTION,
            'status' => Entitlement::STATUS_ACTIVE,
            'reference' => 'subscription:'.$subscription->id,
        ]);

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    /**
     * L'IDEMPOTENCE : dix passages, un seul droit.
     *
     * Sans elle, une tâche d'entretien horaire fabriquerait un droit par
     * heure, et « pourquoi cet élève a-t-il accès ? » deviendrait illisible.
     */
    public function test_synchronizing_repeatedly_never_duplicates(): void
    {
        $subscription = $this->subscription();

        $actions = [];
        for ($i = 0; $i < 10; $i++) {
            $actions[] = $this->sync()->sync($subscription)['action'];
        }

        $this->assertSame('created', $actions[0]);
        // Les neuf suivants ne touchent à rien : la comparaison des dates se
        // fait par instant, donc aucune écriture inutile.
        $this->assertSame(array_fill(0, 9, 'unchanged'), array_slice($actions, 1));
        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)->count());
    }

    /** Un changement de période MET À JOUR le droit, sans en créer un second. */
    public function test_renewal_updates_the_same_entitlement(): void
    {
        $subscription = $this->subscription();
        $this->sync()->sync($subscription);

        $subscription->update(['ends_at' => Carbon::now()->addYear()]);
        $result = $this->sync()->sync($subscription);

        $this->assertSame('updated', $result['action']);
        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)->count());
        $this->assertTrue(
            Entitlement::first()->expires_at->isSameDay(Carbon::now()->addYear())
        );
    }

    /** Un abonnement FUTUR produit un droit, mais pas encore d'accès. */
    public function test_future_subscription_creates_an_inactive_entitlement(): void
    {
        $subscription = $this->subscription([
            'started_at' => Carbon::now()->addWeek(),
            'ends_at' => Carbon::now()->addMonth(),
        ]);

        $this->sync()->sync($subscription);

        // La ligne existe — c'est ce qui permet à l'accès de s'ouvrir tout
        // seul le jour venu, sans qu'aucune tâche ait à repasser.
        $this->assertDatabaseCount('entitlements', 1);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Le jour venu, sans nouvelle synchronisation.
        Carbon::setTestNow(Carbon::now()->addWeek()->addDay());
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
        Carbon::setTestNow();
    }

    /**
     * L'expiration ne dépend PAS de la synchronisation.
     *
     * C'est l'invariant le plus important du fichier : si l'accès n'était
     * juste qu'après un passage de la tâche, une tâche en panne rendrait du
     * contenu payant gratuit, silencieusement.
     */
    public function test_expiry_applies_without_any_synchronization(): void
    {
        $subscription = $this->subscription(['ends_at' => Carbon::now()->addDay()]);
        $this->sync()->sync($subscription);

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Deux jours passent. Personne ne synchronise quoi que ce soit.
        Carbon::setTestNow(Carbon::now()->addDays(2));

        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
        // La ligne est toujours « active » en base : c'est le TEMPS qui ferme.
        $this->assertDatabaseHas('entitlements', ['status' => Entitlement::STATUS_ACTIVE]);

        Carbon::setTestNow();
    }

    public function test_expired_status_revokes_the_entitlement(): void
    {
        $subscription = $this->subscription();
        $this->sync()->sync($subscription);

        $subscription->update(['status' => Subscription::STATUS_EXPIRED]);
        $result = $this->sync()->sync($subscription);

        $this->assertSame('revoked', $result['action']);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
        // Révoqué, jamais supprimé : l'historique reste.
        $this->assertDatabaseCount('entitlements', 1);
        $this->assertDatabaseHas('entitlements', ['status' => Entitlement::STATUS_REVOKED]);
    }

    /**
     * Résilier n'est pas se faire rembourser : la période déjà payée reste
     * due à l'élève, jusqu'à sa date de fin.
     */
    public function test_cancelled_keeps_access_until_the_paid_period_ends(): void
    {
        $subscription = $this->subscription(['ends_at' => Carbon::now()->addMonth()]);
        $this->sync()->sync($subscription);

        $subscription->update([
            'status' => Subscription::STATUS_CANCELLED,
            'cancelled_at' => Carbon::now(),
        ]);
        $this->sync()->sync($subscription);

        $this->assertTrue(
            $this->entitlements()->satisfies($this->student, AccessTier::PREMIUM),
            'La période payée doit être honorée.'
        );

        // Puis la date de fin passe : l'accès tombe, sans synchronisation.
        Carbon::setTestNow(Carbon::now()->addMonths(2));
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
        Carbon::setTestNow();
    }

    /** Résilié SANS date de fin : rien à honorer, donc rien à ouvrir. */
    public function test_cancelled_without_end_date_grants_nothing(): void
    {
        $subscription = $this->subscription(['status' => Subscription::STATUS_CANCELLED, 'ends_at' => null]);

        $result = $this->sync()->sync($subscription);

        $this->assertSame('none', $result['action']);
        $this->assertDatabaseCount('entitlements', 0);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    /** `pending` n'ouvre rien : ce serait donner l'accès avant le paiement. */
    /**
     * RÉGRESSION (phase 6.5, trouvée contre la VRAIE API Stripe).
     *
     * Un abonnement ACTIF dont la date de début est légèrement dans le futur
     * — horloges désynchronisées entre le fournisseur et nous — laissait le
     * droit « pas encore commencé », et l'élève qui venait de payer restait
     * dehors.
     *
     * La date de FIN, elle, reste intouchée : c'est elle qui ferme l'accès.
     */
    public function test_an_active_subscription_opens_even_if_its_start_looks_future(): void
    {
        $subscription = $this->subscription([
            'status' => Subscription::STATUS_ACTIVE,
            // Le fournisseur date le début quelques minutes en avance.
            'started_at' => Carbon::now()->addMinutes(5),
            'ends_at' => Carbon::now()->addMonth(),
        ]);

        $this->sync()->sync($subscription);

        $this->assertTrue(
            $this->entitlements()->satisfies($this->student->fresh(), AccessTier::PREMIUM),
            'Un abonnement actif et payé doit ouvrir, même si l\'horloge du fournisseur avance.'
        );

        // La borne de FIN n'a pas bougé : elle reste celle de l'abonnement.
        $entitlement = Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)->firstOrFail();
        $this->assertTrue($entitlement->expires_at->equalTo($subscription->ends_at));
    }

    /**
     * L'exception qui confirme la règle : un abonnement qui n'est pas encore
     * actif garde sa date future. La distinction se fait sur le STATUT,
     * jamais sur l'horloge.
     */
    public function test_a_pending_subscription_keeps_its_future_start(): void
    {
        $this->sync()->sync($this->subscription([
            'status' => Subscription::STATUS_PENDING,
            'started_at' => Carbon::now()->addWeek(),
        ]));

        // `pending` n'ouvre aucun droit du tout — rien n'est créé.
        $this->assertFalse($this->entitlements()->satisfies($this->student->fresh(), AccessTier::PREMIUM));
    }

    public function test_pending_grants_nothing(): void
    {
        $this->sync()->sync($this->subscription(['status' => Subscription::STATUS_PENDING]));

        $this->assertDatabaseCount('entitlements', 0);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    /** `free` ne crée JAMAIS de ligne : le gratuit est une règle. */
    public function test_free_subscription_creates_no_entitlement_row(): void
    {
        $this->sync()->sync($this->subscription(['status' => Subscription::STATUS_FREE]));

        $this->assertDatabaseCount('entitlements', 0);
        // Et l'accès gratuit fonctionne quand même, sans ligne.
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::FREE));
    }

    /**
     * L'INVARIANT COMMERCIAL : un paiement n'est pas un accès.
     *
     * Un paiement réussi dont l'abonnement a expiré n'ouvre rien. C'est
     * exactement le cas qu'une implémentation naïve (« il a payé, donc il a
     * accès ») rendrait faux, et qu'un remboursement rend courant.
     */
    public function test_a_successful_payment_never_grants_access_by_itself(): void
    {
        $subscription = $this->subscription(['status' => Subscription::STATUS_EXPIRED]);

        Payment::create([
            'user_id' => $this->student->id,
            'subscription_id' => $subscription->id,
            'amount_cents' => 4900,
            'currency' => 'EUR',
            'status' => 'succeeded',
            'paid_at' => Carbon::now()->subDay(),
        ]);

        $this->sync()->sync($subscription);

        $this->assertDatabaseCount('payments', 1);
        $this->assertFalse(
            $this->entitlements()->satisfies($this->student, AccessTier::PREMIUM),
            'Un paiement réussi ne doit jamais suffire.'
        );
    }

    /** Le cycle complet : none → active → cancelled → expiré. */
    public function test_full_lifecycle(): void
    {
        $subscription = $this->subscription(['status' => Subscription::STATUS_PENDING]);
        $this->sync()->sync($subscription);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $subscription->update(['status' => Subscription::STATUS_ACTIVE]);
        $this->sync()->sync($subscription);
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $subscription->update(['status' => Subscription::STATUS_CANCELLED]);
        $this->sync()->sync($subscription);
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        $subscription->update(['status' => Subscription::STATUS_EXPIRED]);
        $this->sync()->sync($subscription);
        $this->assertFalse($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Une seule ligne aura servi pour tout le cycle.
        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)->count());
    }

    /**
     * Deux abonnements distincts portent des références DISTINCTES, donc des
     * droits distincts — ils ne se confondent jamais.
     *
     * Un abonnement expiré ne produit AUCUNE ligne s'il n'en avait pas déjà
     * une : il n'y a rien à révoquer. C'est voulu — fabriquer un droit mort
     * pour le révoquer aussitôt remplirait la table de bruit.
     */
    public function test_two_subscriptions_never_share_an_entitlement(): void
    {
        $expired = $this->subscription(['status' => Subscription::STATUS_EXPIRED]);
        $active = $this->subscription();

        $this->assertNotSame(
            SubscriptionEntitlementSynchronizer::referenceFor($expired),
            SubscriptionEntitlementSynchronizer::referenceFor($active),
        );

        $this->sync()->syncUser($this->student);

        // Seul l'abonnement actif a produit une ligne.
        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)->count());
        $this->assertDatabaseHas('entitlements', [
            'reference' => SubscriptionEntitlementSynchronizer::referenceFor($active),
        ]);
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // Et quand les DEUX ont une ligne, elles restent séparées : le
        // premier abonnement redevient actif puis expire à son tour.
        $expired->update(['status' => Subscription::STATUS_ACTIVE]);
        $this->sync()->sync($expired);
        $this->assertSame(2, Entitlement::where('user_id', $this->student->id)->count());

        $expired->update(['status' => Subscription::STATUS_EXPIRED]);
        $this->sync()->sync($expired);

        $this->assertSame(1, Entitlement::where('user_id', $this->student->id)
            ->where('status', Entitlement::STATUS_ACTIVE)->count());
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    /** La synchronisation ne touche JAMAIS à une dérogation. */
    public function test_synchronization_never_touches_admin_overrides(): void
    {
        $override = Entitlement::factory()->adminOverride()->create(['user_id' => $this->student->id]);
        $subscription = $this->subscription(['status' => Subscription::STATUS_EXPIRED]);

        $this->sync()->sync($subscription);

        $this->assertDatabaseHas('entitlements', [
            'id' => $override->id,
            'status' => Entitlement::STATUS_ACTIVE,
        ]);
        // La dérogation ouvre encore, même abonnement expiré.
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    public function test_sync_all_reports_a_tally(): void
    {
        $this->subscription();
        $this->subscription(['status' => Subscription::STATUS_EXPIRED]);

        $tally = $this->sync()->syncAll();

        $this->assertSame(1, $tally['created']);
        $this->assertSame(1, $tally['none']);
    }

    /** La commande d'entretien tourne et ne casse rien. */
    public function test_artisan_command_synchronizes(): void
    {
        $this->subscription();

        $this->artisan('smarter:sync-entitlements')->assertSuccessful();

        $this->assertDatabaseCount('entitlements', 1);
        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));
    }

    public function test_dry_run_writes_nothing(): void
    {
        $this->subscription();

        $this->artisan('smarter:sync-entitlements --dry-run')->assertSuccessful();

        $this->assertDatabaseCount('entitlements', 0);
    }
}
