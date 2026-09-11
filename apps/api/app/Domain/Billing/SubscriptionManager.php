<?php

namespace App\Domain\Billing;

use App\Domain\Access\EntitlementService;
use App\Models\Subscription;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\Log;

/**
 * Le cycle de vie de l'abonnement APRÈS l'achat — phase 7.
 *
 * Trois gestes d'élève : ouvrir le portail hébergé, résilier en fin de
 * période, revenir sur cette résiliation. Plus une lecture : « où en est mon
 * abonnement ? ».
 *
 * ── Ce service n'accorde et ne retire AUCUN droit ────────────────────────
 * C'est la règle qui tient toute l'architecture depuis la phase 5, et la
 * phase 7 ne l'assouplit pas. Résilier n'écrit pas dans `entitlements` ;
 * cela exprime une intention CHEZ LE FOURNISSEUR, et c'est le webhook signé
 * qui la rend vraie localement :
 *
 *     élève → ce service → fournisseur → webhook SIGNÉ → adaptateur
 *                                            → subscriptions → entitlements
 *
 * La conséquence pratique est importante : un élève qui résilie GARDE son
 * accès jusqu'à la fin de la période payée. Il a payé ces jours-là.
 *
 * ── L'appartenance est résolue, jamais reçue ─────────────────────────────
 * Aucune méthode ne prend d'identifiant d'abonnement, de client, ou
 * d'utilisateur. Tout part de l'élève AUTHENTIFIÉ et descend vers sa propre
 * ligne. C'est structurel : il n'existe pas de paramètre par lequel un élève
 * pourrait désigner l'abonnement d'un autre.
 */
class SubscriptionManager
{
    public function __construct(
        private PaymentProviderRegistry $providers,
        private EntitlementService $entitlements,
        private PlanCatalog $plans,
    ) {}

    /**
     * L'abonnement que ce service peut PILOTER chez le fournisseur.
     *
     * Un abonnement local sans référence externe (une dérogation, un import
     * historique) n'est pilotable par personne : il n'existe pas chez le
     * fournisseur. On ne le confond pas avec « pas d'abonnement ».
     */
    private function manageable(User $user): ?Subscription
    {
        return $user->subscriptions()
            ->whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_CANCELLED, Subscription::STATUS_PENDING])
            ->whereNotNull('provider')
            ->whereNotNull('external_reference')
            ->orderByDesc('id')
            ->first();
    }

    /**
     * L'abonnement le plus pertinent à MONTRER, pilotable ou non.
     *
     * Distinct de `manageable()` : un abonnement expiré ne se pilote plus,
     * mais l'élève doit pouvoir lire « votre abonnement est terminé » plutôt
     * qu'un écran qui prétend qu'il n'a jamais rien acheté.
     */
    private function displayable(User $user): ?Subscription
    {
        // L'ordre de priorité est appliqué en PHP, pas en SQL : `FIELD()`
        // est propre à MySQL et ferait échouer la suite sur sqlite.
        $priority = [
            Subscription::STATUS_ACTIVE => 0,
            Subscription::STATUS_CANCELLED => 1,
            Subscription::STATUS_PENDING => 2,
            Subscription::STATUS_EXPIRED => 3,
        ];

        return $user->subscriptions()
            ->where('plan', '!=', 'free')
            ->orderByDesc('id')
            ->get()
            ->sortBy(fn (Subscription $s) => $priority[$s->status] ?? 9)
            ->first();
    }

    /**
     * L'état de facturation, tel que l'élève a le droit de le voir.
     *
     * Volontairement PAUVRE : de quoi afficher une page, jamais de quoi
     * reconstituer un objet du fournisseur. Aucun identifiant de client, de
     * tarif ou d'abonnement externe ne sort d'ici — ils n'apprendraient rien
     * à un élève et invitent à essayer de les remplacer.
     *
     * Les DATES viennent du serveur. Le navigateur n'en déduit rien : il
     * affiche `accessActive`, il ne le calcule pas.
     *
     * @return array<string, mixed>
     */
    public function state(User $user): array
    {
        $access = $this->entitlements->summarize($user);
        $subscription = $this->displayable($user);
        $manageable = $this->manageable($user);

        $plan = $subscription !== null ? $this->plans->find($subscription->plan) : null;

        return [
            // L'autorité sur l'accès reste le droit, pas l'abonnement : une
            // dérogation d'administration ouvre sans qu'aucun abonnement
            // n'existe, et la page doit le dire honnêtement.
            'accessActive' => $access['premiumAccess'],
            'adminOverrideActive' => $access['adminOverrideActive'],
            'subscriptionActive' => $access['subscriptionActive'],
            'expiresAt' => $access['expiresAt'],

            'subscription' => $subscription === null ? null : [
                'status' => $subscription->status,
                'plan' => $subscription->plan,
                'planName' => $plan['name'] ?? null,
                'amountCents' => $plan['amount_cents'] ?? null,
                'currency' => $plan['currency'] ?? null,
                'interval' => $plan['interval'] ?? null,
                'startedAt' => optional($subscription->started_at)->toIso8601String(),
                'endsAt' => optional($subscription->ends_at)->toIso8601String(),
                'currentPeriodEnd' => optional($subscription->current_period_end)->toIso8601String(),
                'cancelAtPeriodEnd' => (bool) $subscription->cancel_at_period_end,
            ],

            // Ce que l'interface a le droit de PROPOSER. Calculé ici pour que
            // le bouton et la règle serveur ne puissent pas diverger — un
            // bouton affiché à tort produit une erreur incompréhensible.
            'canManage' => $manageable !== null && $manageable->provider_customer_id !== null,
            // Résiliable / reprenable se jugent sur « la période court-elle
            // encore ? », pas sur le mot `status`. Un abonnement dont la
            // résiliation est programmée porte localement le statut
            // `cancelled` (convention de l'adaptateur, phase 5) tout en
            // restant parfaitement actif jusqu'à son terme — s'en remettre au
            // statut cacherait le bouton « Continuer » à ceux qui en ont
            // précisément besoin.
            'canCancel' => $manageable !== null
                && $this->runningNow($manageable)
                && ! $manageable->cancel_at_period_end,
            'canResume' => $manageable !== null
                && $this->runningNow($manageable)
                && (bool) $manageable->cancel_at_period_end,
        ];
    }

    /**
     * Ouvre le portail client hébergé.
     *
     * Le client chez le fournisseur est LU sur l'abonnement local de l'élève
     * authentifié. Aucun identifiant ne vient de la requête : c'est ce qui
     * rend impossible d'ouvrir le portail de quelqu'un d'autre.
     *
     * @throws DomainException si l'élève n'a aucun abonnement pilotable.
     * @throws CheckoutFailedException si le fournisseur refuse.
     */
    public function openPortal(User $user): string
    {
        $subscription = $this->manageable($user);

        if ($subscription === null || $subscription->provider_customer_id === null) {
            throw new DomainException("Aucun abonnement à gérer pour ce compte.");
        }

        $session = $this->providers->get($subscription->provider)->createPortalSession(
            $subscription->provider_customer_id,
            config('billing.return_urls.portal'),
        );

        Log::info('Portail de facturation ouvert.', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'provider' => $subscription->provider,
        ]);

        return $session->url;
    }

    /**
     * Résilie à la FIN DE LA PÉRIODE PAYÉE.
     *
     * L'accès n'est pas retiré : l'élève a payé jusqu'à une date, il la garde.
     * Seuls des champs DESCRIPTIFS sont mis à jour localement pour que la page
     * reflète immédiatement l'intention ; `status` et `ends_at` — les deux
     * seuls champs dont dépend l'accès — ne sont pas touchés ici. Le webhook
     * reste l'autorité.
     *
     * @return array<string, mixed> l'état de facturation après l'opération
     *
     * @throws DomainException si rien n'est résiliable.
     * @throws CheckoutFailedException si le fournisseur refuse.
     */
    public function cancel(User $user): array
    {
        $subscription = $this->requireManageable($user);

        if (! $this->runningNow($subscription)) {
            throw new DomainException("Cet abonnement n'est plus actif.");
        }

        // Déjà résilié : ne pas rappeler le fournisseur. L'opération est
        // idempotente pour l'élève — un double clic ou un rafraîchissement
        // rend le même état au lieu d'une erreur.
        if ($subscription->cancel_at_period_end) {
            return $this->state($user);
        }

        $state = $this->providers->get($subscription->provider)
            ->cancelAtPeriodEnd($subscription->external_reference);

        $this->reflectIntent($subscription, $state);

        Log::info('Résiliation programmée en fin de période.', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);

        return $this->state($user->fresh());
    }

    /**
     * Annule une résiliation programmée.
     *
     * @return array<string, mixed> l'état de facturation après l'opération
     *
     * @throws DomainException si aucune résiliation n'est en cours.
     * @throws CheckoutFailedException si le fournisseur refuse.
     */
    public function resume(User $user): array
    {
        $subscription = $this->requireManageable($user);

        if (! $this->runningNow($subscription)) {
            throw new DomainException("Cet abonnement n'est plus actif.");
        }

        if (! $subscription->cancel_at_period_end) {
            return $this->state($user);
        }

        $state = $this->providers->get($subscription->provider)
            ->resumeSubscription($subscription->external_reference);

        $this->reflectIntent($subscription, $state);

        Log::info('Résiliation annulée : l\'abonnement continue.', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);

        return $this->state($user->fresh());
    }

    /**
     * La période payée court-elle ENCORE ?
     *
     * `active` et `cancelled` sont tous deux « en cours » tant que la date de
     * fin n'est pas passée : la convention de l'adaptateur veut qu'un
     * abonnement dont la résiliation est programmée porte le statut
     * `cancelled` sans cesser d'ouvrir l'accès. C'est la date qui tranche,
     * comme partout ailleurs dans cette architecture.
     */
    private function runningNow(Subscription $subscription): bool
    {
        if (! in_array($subscription->status, [Subscription::STATUS_ACTIVE, Subscription::STATUS_CANCELLED], true)) {
            return false;
        }

        return $subscription->ends_at === null || $subscription->ends_at->isFuture();
    }

    /**
     * @throws DomainException
     */
    private function requireManageable(User $user): Subscription
    {
        $subscription = $this->manageable($user);

        if ($subscription === null) {
            throw new DomainException("Aucun abonnement à gérer pour ce compte.");
        }

        return $subscription;
    }

    /**
     * Recopie l'INTENTION renvoyée par le fournisseur — et rien de plus.
     *
     * Les champs touchés ici sont descriptifs : ils alimentent l'affichage.
     * `status`, `started_at` et `ends_at` restent hors d'atteinte, parce que
     * ce sont EUX qui décident de l'accès et qu'ils n'ont qu'une seule
     * source légitime : le webhook signé.
     *
     * Sans cette recopie, l'élève cliquerait « Annuler mon abonnement » et ne
     * verrait rien changer jusqu'à l'arrivée du webhook.
     */
    private function reflectIntent(Subscription $subscription, ProviderSubscriptionState $state): void
    {
        $subscription->forceFill([
            'cancel_at_period_end' => $state->cancelAtPeriodEnd,
            'provider_status' => $state->providerStatus,
        ])->save();
    }
}
