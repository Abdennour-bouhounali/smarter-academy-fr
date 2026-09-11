<?php

namespace App\Domain\Billing;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Models\Subscription;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\Log;

/**
 * Ouvrir une session de paiement — et rien d'autre.
 *
 * Ce service est un POINT D'ENTRÉE DE PAIEMENT, pas un système de contrôle
 * d'accès. Il n'écrit aucun droit, ne crée aucun abonnement local, ne touche
 * jamais `entitlements`. Tout ce qu'il produit, c'est une URL vers une page
 * hébergée par le fournisseur.
 *
 *     élève → ce service → session chez le fournisseur → (il paie)
 *                                                            ↓
 *                                      webhook signé → phase 5 → droit → accès
 *
 * L'accès s'ouvre au bout de CETTE chaîne-là, jamais ici. Créer une session
 * n'est pas payer, et revenir sur l'URL de succès n'est pas payer non plus.
 *
 * ── Ce que le client peut décider ────────────────────────────────────────
 * Une clé d'offre. C'est tout. Le montant, la devise, la durée, le tarif chez
 * le fournisseur, l'identité de l'élève : tout vient du serveur. Un client qui
 * enverrait `amount: 0` ou un `price_...` de son choix n'obtiendrait rien —
 * ces champs ne sont même pas lus.
 */
class CheckoutService
{
    public function __construct(
        private PlanCatalog $plans,
        private PaymentProviderRegistry $providers,
        private EntitlementService $entitlements,
    ) {}

    /**
     * Ouvre une session de paiement pour CET élève et CETTE offre.
     *
     * @return array{url: string, sessionId: string, plan: string}
     *
     * @throws DomainException si l'offre n'existe pas, n'est pas achetable, ou
     *                         si l'élève ne doit pas s'abonner maintenant.
     * @throws CheckoutFailedException si le fournisseur refuse.
     */
    public function start(User $user, string $planKey): array
    {
        // ── 1. L'offre existe-t-elle, et est-elle vendable ? ─────────────
        // Le catalogue est l'autorité. Une clé inconnue est refusée sans
        // même être journalisée telle quelle : c'est une entrée cliente.
        if (! $this->plans->purchasable($planKey)) {
            throw new DomainException("Cette offre n'est pas disponible.");
        }

        $plan = $this->plans->find($planKey);

        // ── 2. Cet élève doit-il vraiment s'abonner ? ────────────────────
        $this->assertCanSubscribe($user);

        $provider = $this->providers->get(config('billing.provider', 'stripe'));

        // Réutiliser le client déjà connu du fournisseur, s'il y en a un :
        // sinon chaque paiement fabriquerait un client de plus, et
        // l'historique de facturation d'un même élève se disperserait entre
        // plusieurs fiches.
        $customerId = $this->existingCustomerId($user);

        try {
            $session = $provider->createCheckoutSession(
                // Le tarif vient du CATALOGUE. Jamais de la requête.
                priceId: $plan['price_id'],
                // Le pont vers le compte local : c'est NOTRE serveur qui pose
                // cette valeur, et c'est ce qui la rend digne de confiance
                // quand le webhook la relira (voir ProviderSubscriptionAdapter).
                clientReferenceId: (string) $user->id,
                successUrl: config('billing.return_urls.success'),
                cancelUrl: config('billing.return_urls.cancel'),
                customerId: $customerId,
                // Évite à l'élève de ressaisir son adresse. Non autoritaire :
                // l'identité vient de `clientReferenceId`.
                customerEmail: $customerId === null ? $user->email : null,
                // Un double clic ne doit pas produire deux abonnements. La
                // clé est stable pour un même élève et une même offre sur une
                // courte fenêtre — voir idempotencyKeyFor().
                idempotencyKey: $this->idempotencyKeyFor($user, $planKey),
            );
        } catch (CheckoutFailedException $e) {
            // Le message du fournisseur reste dans le journal, jamais dans la
            // réponse : il peut porter de l'interne, et l'élève n'en ferait
            // rien.
            Log::error('Ouverture de session de paiement refusée par le fournisseur.', [
                'user_id' => $user->id,
                'plan' => $planKey,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }

        Log::info('Session de paiement ouverte.', [
            'user_id' => $user->id,
            'plan' => $planKey,
            'session_id' => $session->id,
        ]);

        // AUCUNE écriture locale. Pas d'abonnement `pending`, pas de droit.
        // Une session ouverte est une intention, pas un fait comptable : si
        // l'élève ferme l'onglet, il ne doit rester aucune trace laissant
        // croire qu'il a commencé à payer.
        return [
            'url' => $session->url,
            'sessionId' => $session->id,
            'plan' => $planKey,
        ];
    }

    /**
     * Cet élève peut-il ouvrir un paiement maintenant ?
     *
     * Le cas intéressant est le troisième : un élève qui a déjà un accès
     * premium par DÉROGATION peut tout de même s'abonner. Sa dérogation est
     * un geste commercial temporaire, pas un abonnement ; lui refuser l'achat
     * parce qu'on lui a offert l'accès un mois serait absurde. On ne fabrique
     * donc pas d'abonnement au motif qu'il a accès, et on ne bloque pas
     * l'achat au même motif.
     *
     * @throws DomainException
     */
    private function assertCanSubscribe(User $user): void
    {
        $subscriptions = $user->subscriptions()->get();

        // Déjà abonné, et l'abonnement court toujours : ne pas en vendre un
        // second. L'élève paierait deux fois la même chose.
        $active = $subscriptions->first(fn (Subscription $s) => in_array($s->status, [
            Subscription::STATUS_ACTIVE,
        ], true) && ($s->ends_at === null || $s->ends_at->isFuture()));

        if ($active !== null) {
            throw new DomainException('Vous êtes déjà abonné.');
        }

        // Résilié mais pas encore terminé : la période payée court encore.
        // Racheter maintenant ferait payer deux fois les mêmes jours. L'élève
        // pourra reprendre un abonnement à l'échéance.
        $stillRunning = $subscriptions->first(
            fn (Subscription $s) => $s->status === Subscription::STATUS_CANCELLED
                && $s->ends_at !== null
                && $s->ends_at->isFuture()
        );

        if ($stillRunning !== null) {
            throw new DomainException(
                'Votre abonnement reste actif jusqu\'au '
                .$stillRunning->ends_at->locale('fr')->isoFormat('D MMMM YYYY')
                .'. Vous pourrez vous réabonner à cette date.'
            );
        }

        // `pending` : un paiement a été entamé sans aboutir. On laisse
        // repasser — une session abandonnée ne doit pas enfermer l'élève
        // dehors, et Stripe abandonne de lui-même les sessions non finies.
        // L'idempotence (côté fournisseur) évite les doublons rapprochés.
    }

    /**
     * Le client déjà connu du fournisseur pour cet élève, s'il existe.
     *
     * Lu depuis `subscriptions.provider_customer_id`, posé par la phase 5 :
     * aucune table de clients n'est introduite. L'association existe déjà,
     * il suffit de la relire.
     */
    private function existingCustomerId(User $user): ?string
    {
        return $user->subscriptions()
            ->whereNotNull('provider_customer_id')
            ->orderByDesc('id')
            ->value('provider_customer_id');
    }

    /**
     * La clé d'idempotence d'un paiement.
     *
     * Le problème résolu : l'élève double-clique, ou le réseau rejoue la
     * requête. Deux sessions de paiement, c'est un risque de deux
     * abonnements.
     *
     * La clé est dérivée de l'élève, de l'offre, et d'une FENÊTRE DE TEMPS —
     * pas d'un horodatage exact, qui changerait à chaque milliseconde et ne
     * dédoublonnerait rien. Dix minutes : assez large pour couvrir un
     * double clic et un rejeu réseau, assez courte pour qu'un élève qui
     * revient une heure plus tard obtienne bien une nouvelle session.
     *
     * Elle inclut l'identifiant de l'élève, ce qui rend impossible qu'un
     * client réutilise la session d'un autre : deux élèves ne partagent
     * jamais une clé.
     */
    private function idempotencyKeyFor(User $user, string $planKey): string
    {
        $window = (int) floor(time() / 600);

        return 'checkout_'.hash('sha256', "{$user->id}|{$planKey}|{$window}");
    }

    /**
     * L'état de facturation de cet élève, pour l'interface.
     *
     * Sert à décider ce que montre la page des tarifs : un bouton, ou un
     * état. Ne renvoie AUCUN identifiant du fournisseur — un élève n'a pas
     * besoin de connaître sa référence d'abonnement, et la publier invite à
     * s'en servir.
     *
     * @return array<string, mixed>
     */
    public function statusFor(?User $user): array
    {
        $access = $this->entitlements->summarize($user);

        if ($user === null) {
            return [
                'canSubscribe' => false,
                'reason' => 'authentication_required',
                'access' => $access,
            ];
        }

        try {
            $this->assertCanSubscribe($user);

            return ['canSubscribe' => true, 'reason' => null, 'access' => $access];
        } catch (DomainException $e) {
            return [
                'canSubscribe' => false,
                'reason' => 'already_subscribed',
                'message' => $e->getMessage(),
                'access' => $access,
            ];
        }
    }

    /** Le palier requis pour le contenu payant — exposé pour les tests. */
    public const PREMIUM_TIER = AccessTier::PREMIUM;
}
