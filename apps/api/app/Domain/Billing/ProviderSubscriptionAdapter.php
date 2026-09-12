<?php

namespace App\Domain\Billing;

use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * état du fournisseur → abonnement LOCAL. Puis le synchroniseur fait le reste.
 *
 *     ProviderSubscriptionState        (neutre, venu d'un traducteur)
 *              ↓   ce service
 *     subscriptions                    (notre vocabulaire, notre autorité)
 *              ↓   SubscriptionEntitlementSynchronizer  (INCHANGÉ)
 *     entitlements
 *              ↓   EntitlementService → ContentAccess
 *     l'élève
 *
 * Ce service est le SEUL endroit où le vocabulaire d'un fournisseur est
 * traduit dans le nôtre. Le concentrer ici est ce qui permet de vérifier la
 * table de correspondance d'un seul coup d'œil, plutôt que de la reconstituer
 * en suivant des `if` dispersés.
 *
 * ── Ce qu'il ne fait PAS ─────────────────────────────────────────────────
 * Il n'écrit aucun droit. Jamais. Il met `subscriptions` à jour puis appelle
 * le synchroniseur existant — lequel est déjà idempotent, déjà testé, et déjà
 * l'unique porte vers `entitlements`. Dupliquer sa logique ici créerait un
 * second mécanisme d'accès qui finirait par diverger du premier. La garde
 * PaymentProviderBoundaryTest le vérifie.
 */
class ProviderSubscriptionAdapter
{
    public function __construct(
        private SubscriptionEntitlementSynchronizer $synchronizer,
        private PlanCatalog $plans,
        private PaymentProviderRegistry $providers,
    ) {}

    /**
     * LA table de correspondance : statut du fournisseur → statut local.
     *
     * Le vocabulaire d'arrivée est celui qui existe déjà
     * (Subscription::STATUSES) ; aucun statut n'est inventé.
     *
     * Le cas qui mérite une explication est `past_due` → `active`. Ce n'est
     * PAS un délai de grâce inventé : c'est la conséquence de deux règles déjà
     * écrites ailleurs. D'abord, la couche d'accès ne lit jamais `payments` —
     * un échec de paiement ne peut donc rien fermer par lui-même. Ensuite,
     * `ends_at` est recopié dans le droit, si bien que l'accès se ferme TOUT
     * SEUL à la fin de la période payée, sans qu'aucune tâche n'ait à passer.
     * Un élève dont la carte vient d'expirer garde donc ce qu'il a déjà payé,
     * et pas un jour de plus. Si le fournisseur finit par renoncer, il émettra
     * `unpaid` ou `canceled`, et l'accès se ferme à ce moment-là.
     *
     * `trialing` → `active` pour la même raison : un essai est un accès
     * accordé et daté, et sa date de fin est portée par `ends_at`.
     */
    private const STATUS_MAP = [
        // Rien n'est payé. Ouvrir ici serait l'erreur exacte que toute cette
        // architecture existe pour éviter.
        'incomplete' => Subscription::STATUS_PENDING,
        'incomplete_expired' => Subscription::STATUS_EXPIRED,
        'trialing' => Subscription::STATUS_ACTIVE,
        'active' => Subscription::STATUS_ACTIVE,
        'past_due' => Subscription::STATUS_ACTIVE,
        // Le fournisseur a épuisé ses relances : la période due est consommée.
        'unpaid' => Subscription::STATUS_EXPIRED,
        // `canceled` est ambigu et se tranche sur les DATES, pas sur le mot —
        // voir localStatusFor().
        'canceled' => Subscription::STATUS_CANCELLED,
        'paused' => Subscription::STATUS_PENDING,
    ];

    /**
     * Applique un état de fournisseur à l'abonnement local, puis synchronise
     * le droit.
     *
     * @return array{subscription: ?Subscription, action: string, reason: ?string}
     */
    public function apply(ProviderSubscriptionState $state): array
    {
        $existing = $this->findLocal($state);

        // ── L'évènement est-il PÉRIMÉ ? ──────────────────────────────────
        // Les évènements n'arrivent pas dans l'ordre. Sans ce test, un
        // `subscription.updated` retardé pourrait réécrire par-dessus un
        // `subscription.deleted` déjà appliqué — et ROUVRIR un accès révoqué.
        // On compare à l'horloge du fournisseur, seule horloge commune aux
        // deux évènements.
        if ($existing !== null && $this->isStale($existing, $state)) {
            return ['subscription' => $existing, 'action' => 'ignored', 'reason' => 'stale'];
        }

        $user = $this->resolveUser($state, $existing);

        // Aucun élève identifiable : on n'invente pas de rattachement. Sans
        // propriétaire, un abonnement n'ouvrirait rien de toute façon, et
        // deviner ici ouvrirait un accès au mauvais compte.
        if ($user === null) {
            return ['subscription' => null, 'action' => 'unresolved', 'reason' => 'unknown_customer'];
        }

        // La session rattache l'élève mais ne porte ni tarif ni période : on
        // relit l'état complet chez le fournisseur avant d'écrire.
        $state = $this->completeFromProvider($state, $existing);

        $attributes = $this->localAttributesFor($state, $user, $existing);

        $subscription = DB::transaction(function () use ($existing, $attributes, $state, $user) {
            if ($existing !== null) {
                // Le propriétaire ne change jamais : un abonnement réattribué
                // doit produire une nouvelle ligne, pas déplacer l'ancienne —
                // même règle que dans le synchroniseur, et pour la même
                // raison (l'accès du premier élève a bel et bien eu lieu).
                unset($attributes['user_id']);
                $existing->update($attributes);

                return $existing->refresh();
            }

            return Subscription::create($attributes + [
                'user_id' => $user->id,
                'provider' => $state->provider,
                'external_reference' => $state->providerSubscriptionId,
            ]);
        });

        // LA seule porte vers les droits. Déjà idempotent, déjà testé.
        $result = $this->synchronizer->sync($subscription);

        return [
            'subscription' => $subscription,
            'action' => $result['action'],
            'reason' => null,
        ];
    }

    /**
     * Enregistre un paiement — trace comptable, AUCUN effet sur l'accès.
     *
     * Aucun appel au synchroniseur ici, et c'est délibéré : ni un paiement
     * réussi ni un paiement échoué ne change un droit. Seul l'abonnement le
     * fait, et le fournisseur émettra un évènement d'abonnement séparé s'il
     * juge que l'état a changé.
     */
    public function recordPayment(ProviderPaymentState $state): ?Payment
    {
        $subscription = $state->providerSubscriptionId === null
            ? null
            : Subscription::where('provider', $state->provider)
                ->where('external_reference', $state->providerSubscriptionId)
                ->first();

        // Un paiement sans abonnement local ni client connu n'est rattachable
        // à personne. On ne fabrique pas d'utilisateur pour l'accueillir.
        $userId = $subscription?->user_id ?? $this->userIdFromCustomer($state->provider, $state->providerCustomerId);

        if ($userId === null) {
            return null;
        }

        // `updateOrCreate` sur l'identité du fournisseur : c'est ce qui rend
        // une double livraison d'`invoice.paid` inoffensive. L'unicité en base
        // (provider, external_reference) le garantit même sous concurrence.
        return Payment::updateOrCreate(
            [
                'provider' => $state->provider,
                'external_reference' => $state->providerPaymentId,
            ],
            [
                'user_id' => $userId,
                'subscription_id' => $subscription?->id,
                'amount_cents' => $state->amountCents,
                'currency' => $state->currency,
                'status' => $state->status,
                'provider_invoice_id' => $state->providerInvoiceId,
                'failure_code' => $state->failureCode,
                'paid_at' => $state->paidAt,
            ],
        );
    }

    /**
     * L'abonnement local correspondant, s'il existe.
     *
     * Retrouvé par l'identité DU FOURNISSEUR — jamais par l'utilisateur : un
     * élève peut avoir plusieurs abonnements (un renouvellement anticipé
     * recouvre la fin du précédent), et choisir « le sien » écraserait le
     * mauvais.
     */
    private function findLocal(ProviderSubscriptionState $state): ?Subscription
    {
        return Subscription::where('provider', $state->provider)
            ->where('external_reference', $state->providerSubscriptionId)
            ->first();
    }

    /**
     * Cet évènement est-il plus ANCIEN que l'état déjà appliqué ?
     *
     * Comparaison stricte : un évènement portant exactement le même instant
     * que le dernier appliqué est traité. Il peut légitimement s'agir de deux
     * changements dans la même seconde, et le traitement est idempotent de
     * toute façon — refuser l'égalité perdrait de l'information sans rien
     * protéger.
     */
    private function isStale(Subscription $existing, ProviderSubscriptionState $state): bool
    {
        if ($state->occurredAt === null || $existing->provider_synced_at === null) {
            return false;
        }

        return $existing->provider_synced_at->greaterThan($state->occurredAt);
    }

    /**
     * À QUI appartient cet abonnement ?
     *
     * Trois chemins, tous côté serveur, aucun ne fait confiance au client :
     *
     *   1. l'abonnement local existe déjà → son propriétaire, point final ;
     *   2. un autre abonnement porte déjà ce client fournisseur ;
     *   3. le `client_reference_id` que NOTRE serveur a posé en créant la
     *      session de paiement.
     *
     * Ce qui n'est JAMAIS une source : le corps de la requête. Un webhook est
     * authentifié par sa signature, mais le champ `client_reference_id` qu'il
     * transporte a été fixé par nous au moment de la création de la session —
     * c'est cette origine serveur qui le rend digne de confiance, pas le fait
     * qu'il arrive dans un message signé.
     */
    private function resolveUser(ProviderSubscriptionState $state, ?Subscription $existing): ?User
    {
        if ($existing !== null) {
            return $existing->user;
        }

        if ($state->providerCustomerId !== null) {
            $byCustomer = Subscription::where('provider', $state->provider)
                ->where('provider_customer_id', $state->providerCustomerId)
                ->first();

            if ($byCustomer !== null) {
                return $byCustomer->user;
            }
        }

        if ($state->clientReferenceId !== null) {
            // Strictement numérique : la référence est un identifiant
            // d'utilisateur produit par notre serveur. Tout le reste est
            // rejeté sans être interprété.
            if (ctype_digit($state->clientReferenceId)) {
                return User::find((int) $state->clientReferenceId);
            }
        }

        return null;
    }

    private function userIdFromCustomer(string $provider, ?string $customerId): ?int
    {
        if ($customerId === null) {
            return null;
        }

        return Subscription::where('provider', $provider)
            ->where('provider_customer_id', $customerId)
            ->value('user_id');
    }

    /**
     * Complète un état PARTIEL en relisant le fournisseur.
     *
     * ── Le défaut que ceci corrige ───────────────────────────────────────
     * Stripe émet, dans cet ordre réel (phase 6.5, confirmé en production) :
     *
     *     invoice.paid
     *     customer.subscription.created   ← tarif + période, AUCUN élève
     *     checkout.session.completed      ← l'élève, NI tarif NI période
     *
     * Au premier, `resolveUser` échoue (le client n'est rattaché à personne)
     * et l'évènement repart en `unresolved` sans rien écrire. À la seconde,
     * l'élève est enfin connu — mais la session ne transporte pas le tarif,
     * et `provider_events` ne conserve qu'une EMPREINTE du corps (choix
     * délibéré : un corps de webhook porte des données personnelles). L'état
     * du premier évènement n'est donc plus relisible localement.
     *
     * Résultat avant correctif : l'abonnement naissait `plan = free`,
     * `ends_at = null` — un droit premium SANS TERME, qui ne se réparait que
     * si un `customer.subscription.updated` passait par hasard plus tard.
     *
     * ── Pourquoi relire plutôt que stocker le corps ──────────────────────
     * Stocker les corps de webhook annulerait une décision de confidentialité
     * déjà prise et testée. Relire chez le fournisseur ne crée AUCUNE seconde
     * autorité : le résultat repasse par le même traducteur puis par le même
     * adaptateur. C'est la lecture qui est déplacée, pas la décision.
     *
     * ── Ce que cette méthode ne fait jamais ──────────────────────────────
     * Elle ne s'exécute que si l'état reçu est réellement incomplet, et elle
     * ne remplace QUE les champs absents. Un état complet n'appelle rien (pas
     * d'appel réseau sur le chemin normal). Une panne du fournisseur laisse
     * l'état tel quel : l'évènement s'écrira partiellement puis restera
     * corrigible, plutôt que d'échouer et de tout perdre.
     *
     * Une SUPPRESSION n'est jamais complétée : elle est terminale, et relire
     * un abonnement supprimé ramènerait sa période d'origine — donc un accès
     * rouvert après la disparition de l'abonnement.
     */
    private function completeFromProvider(
        ProviderSubscriptionState $state,
        ?Subscription $existing,
    ): ProviderSubscriptionState {
        if ($state->deleted) {
            return $state;
        }

        $missingPrice = $state->providerPriceId === null && $existing?->provider_price_id === null;
        $missingPeriod = $state->currentPeriodEnd === null && $existing?->current_period_end === null;

        if (! $missingPrice && ! $missingPeriod) {
            return $state;
        }

        if (! $this->providers->has($state->provider)) {
            return $state;
        }

        try {
            $fresh = $this->providers->get($state->provider)->fetchSubscription($state->providerSubscriptionId);
        } catch (CheckoutFailedException) {
            // Fournisseur indisponible : on n'échoue pas l'évènement pour
            // autant. L'abonnement s'écrit avec ce qu'on sait, et un
            // évènement ultérieur (ou une resynchronisation) le complètera.
            return $state;
        }

        if ($fresh === null || $fresh->providerSubscriptionId !== $state->providerSubscriptionId) {
            return $state;
        }

        // Le client relu doit désigner le MÊME client : sans cela, une
        // réponse portant un autre client pourrait déplacer le rattachement.
        if (
            $state->providerCustomerId !== null
            && $fresh->providerCustomerId !== null
            && $fresh->providerCustomerId !== $state->providerCustomerId
        ) {
            return $state;
        }

        // On ne prend du fournisseur QUE ce qui manque. Le statut, la date de
        // l'évènement et le `client_reference_id` restent ceux de l'évènement
        // reçu : c'est lui qui fait foi sur « quand » et « qui », et la
        // protection anti-péremption (`occurredAt`) doit rester intacte.
        return new ProviderSubscriptionState(
            provider: $state->provider,
            providerSubscriptionId: $state->providerSubscriptionId,
            providerCustomerId: $state->providerCustomerId ?? $fresh->providerCustomerId,
            providerStatus: $state->providerStatus,
            providerPriceId: $state->providerPriceId ?? $fresh->providerPriceId,
            currentPeriodStart: $state->currentPeriodStart ?? $fresh->currentPeriodStart,
            currentPeriodEnd: $state->currentPeriodEnd ?? $fresh->currentPeriodEnd,
            cancelAtPeriodEnd: $state->cancelAtPeriodEnd,
            occurredAt: $state->occurredAt,
            deleted: $state->deleted,
            clientReferenceId: $state->clientReferenceId,
        );
    }

    /**
     * L'état local, dérivé de l'état du fournisseur.
     *
     * @return array<string, mixed>
     */
    private function localAttributesFor(
        ProviderSubscriptionState $state,
        User $user,
        ?Subscription $existing = null,
    ): array {
        $status = $this->localStatusFor($state);
        $endsAt = $this->endsAtFor($state, $status);

        // La clé d'offre, déduite du tarif du fournisseur. Sans cela,
        // `plan` gardait sa valeur par défaut (`free`) sur un abonnement
        // payant — défaut relevé en phase 6.5 contre l'API réelle.
        // Un tarif inconnu (offre retirée du catalogue) laisse le plan tel
        // quel plutôt que d'inventer une valeur.
        $planKey = $this->plans->keyForPriceId($state->providerPriceId);

        $attributes = [
            'user_id' => $user->id,
            'status' => $status,
            'started_at' => $state->currentPeriodStart,
            'ends_at' => $endsAt,
            'cancelled_at' => $state->cancelAtPeriodEnd || $status === Subscription::STATUS_CANCELLED
                ? ($state->occurredAt ?? Carbon::now())
                : null,
            'provider' => $state->provider,
            'provider_customer_id' => $state->providerCustomerId,
            'provider_status' => $state->providerStatus,
            'provider_price_id' => $state->providerPriceId,
            'current_period_end' => $state->currentPeriodEnd,
            'cancel_at_period_end' => $state->cancelAtPeriodEnd,
            'provider_synced_at' => $state->occurredAt ?? Carbon::now(),
        ];

        // ── Une ABSENCE n'est pas une donnée ─────────────────────────────
        //
        // `checkout.session.completed` ne transporte NI tarif NI période :
        // le traducteur y met `null` à dessein, parce que la session ne les
        // connaît pas. Mais Stripe émet `customer.subscription.created`
        // AVANT la session (forme réelle, phase 6.5) : quand cet évènement
        // arrive, le client n'est pas encore rattaché, donc il ne crée rien.
        //
        // Écrire les `null` de la session par-dessus revenait donc à effacer
        // la seule lecture fiable du tarif et de la période. L'abonnement
        // restait `plan = free`, `ends_at = null` — un droit premium SANS
        // TERME, exactement la barrière temporelle que la phase 6.5 avait
        // rétablie. Constaté en production sur 6 évènements.
        //
        // Même règle que `plan` juste en dessous : on n'écrase une valeur
        // connue que par une autre valeur connue. Un champ absent laisse
        // l'existant intact plutôt que de le détruire.
        foreach (['provider_price_id', 'current_period_end'] as $field) {
            if ($attributes[$field] === null && $existing?->{$field} !== null) {
                unset($attributes[$field]);
            }
        }

        // `ends_at` dérive de la période : s'il n'y a plus de période à
        // écrire, il ne faut pas non plus effacer le terme déjà connu. Un
        // statut terminal (expiré/résilié) garde en revanche la main, sinon
        // une suppression ne fermerait jamais l'accès.
        if (
            $endsAt === null
            && $existing?->ends_at !== null
            && ! in_array($status, [Subscription::STATUS_EXPIRED, Subscription::STATUS_CANCELLED], true)
        ) {
            unset($attributes['ends_at']);
        }

        // `plan` n'est écrit QUE si le tarif est reconnu. Un tarif inconnu —
        // une offre retirée du catalogue, un abonnement hérité — laisse la
        // valeur existante intacte : écraser par null perdrait l'information
        // déjà en base, et écrire une valeur inventée serait pire.
        if ($planKey !== null) {
            $attributes['plan'] = $planKey;
        }

        return $attributes;
    }

    /**
     * Le statut local.
     *
     * Le seul cas qui ne se lit pas dans la table est `active` +
     * `cancel_at_period_end` : le fournisseur dit encore « actif », mais
     * l'abonnement est en réalité résilié pour la fin de la période. On le
     * porte en `cancelled`, ce que le synchroniseur sait déjà honorer jusqu'à
     * `ends_at`. L'élève garde donc exactement ce qu'il a payé.
     */
    private function localStatusFor(ProviderSubscriptionState $state): string
    {
        $mapped = self::STATUS_MAP[$state->providerStatus] ?? null;

        if ($mapped === null) {
            // Statut inconnu du fournisseur : on ne devine pas, et surtout on
            // n'ouvre pas. `pending` n'accorde aucun droit — c'est le défaut
            // sûr, dans le sens qui ferme.
            return Subscription::STATUS_PENDING;
        }

        if ($mapped === Subscription::STATUS_CANCELLED) {
            // Une SUPPRESSION est terminale : l'abonnement n'existe plus chez
            // le fournisseur, il n'y a aucune période à honorer. L'objet
            // supprimé transporte souvent encore sa fin de période d'origine,
            // et la lire comme « résilié, avec du temps restant » laisserait
            // l'accès ouvert après la disparition de l'abonnement.
            if ($state->deleted) {
                return Subscription::STATUS_EXPIRED;
            }

            // « Résilié » sans période restante = terminé pour de bon. Le
            // synchroniseur refuserait de toute façon d'ouvrir un `cancelled`
            // sans `ends_at` ; on le dit explicitement plutôt que de s'en
            // remettre à un effet de bord.
            $end = $state->currentPeriodEnd;

            return ($end !== null && $end->isFuture())
                ? Subscription::STATUS_CANCELLED
                : Subscription::STATUS_EXPIRED;
        }

        if ($mapped === Subscription::STATUS_ACTIVE && $state->cancelAtPeriodEnd) {
            return Subscription::STATUS_CANCELLED;
        }

        return $mapped;
    }

    /**
     * La borne locale.
     *
     * Un abonnement expiré se termine MAINTENANT au plus tard : sans cela, un
     * `unpaid` conservant une fin de période future laisserait le droit
     * ouvert, puisque le droit ne regarde que les dates.
     */
    private function endsAtFor(ProviderSubscriptionState $state, string $status): ?Carbon
    {
        if ($status === Subscription::STATUS_EXPIRED) {
            $now = $state->occurredAt ?? Carbon::now();
            $end = $state->currentPeriodEnd;

            return ($end !== null && $end->lessThan($now)) ? $end : $now;
        }

        return $state->currentPeriodEnd;
    }
}
