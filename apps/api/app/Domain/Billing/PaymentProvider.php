<?php

namespace App\Domain\Billing;

/**
 * Le contrat d'un fournisseur de paiement — volontairement MINUSCULE.
 *
 * Six capacités : authentifier un webhook, le traduire, ouvrir une session de
 * paiement, ouvrir le portail client, résilier en fin de période, et annuler
 * cette résiliation. Le reste — remboursement, changement d'offre, avoirs —
 * n'est pas déclaré ici tant que rien ne l'appelle.
 *
 * C'est un choix, pas un oubli. Une interface qui déclare des méthodes que
 * personne n'implémente vraiment produit soit des `throw new
 * NotImplemented`, soit des implémentations factices qu'on finit par croire
 * réelles. Le contrat a grandi d'une méthode en phase 6 (l'encaissement),
 * puis de trois en phase 7 (le cycle de vie après l'achat) — à chaque fois
 * parce qu'un parcours réel les appelait, jamais par anticipation.
 *
 * ── Ce que cette interface ne renvoie JAMAIS ─────────────────────────────
 * Aucun type de SDK. Les valeurs de retour sont des objets de ce namespace
 * (TranslatedEvent, ProviderSubscriptionState), et c'est ce qui permet à tout
 * le reste de l'application d'ignorer quel fournisseur est branché.
 */
interface PaymentProvider
{
    /** Le nom court du fournisseur — 'stripe'. Sert de clé partout. */
    public function name(): string;

    /**
     * Ce corps vient-il VRAIMENT du fournisseur ?
     *
     * C'est la seule authentification d'un webhook : pas de session, pas de
     * jeton, pas d'utilisateur. La signature, et rien d'autre.
     *
     * $payload est le corps BRUT. Pas un tableau décodé, pas du JSON
     * re-sérialisé : la signature porte sur les octets exacts reçus, et
     * n'importe quelle reconstruction — même produisant un JSON équivalent —
     * la fera échouer.
     *
     * @param  string  $payload  le corps brut de la requête
     * @param  string|null  $signature  l'en-tête de signature
     */
    public function verifySignature(string $payload, ?string $signature): bool;

    /**
     * Traduit le corps brut en évènement NEUTRE.
     *
     * Renvoie un TranslatedEvent dans tous les cas où l'évènement est
     * identifiable — y compris pour un type qui ne nous concerne pas, auquel
     * cas l'évènement sera simplement non « actionable » et enregistré comme
     * ignoré.
     *
     * @throws \App\Domain\Billing\ProviderEventFormatException si le corps est
     *         inexploitable (pas de JSON, pas d'identifiant d'évènement).
     */
    public function translate(string $payload): TranslatedEvent;

    /**
     * Ouvre une session de paiement chez le fournisseur.
     *
     * C'est le SEUL appel sortant de toute l'application vers le fournisseur,
     * et il n'a lieu que sur un clic explicite de l'élève. Aucun chemin
     * d'autorisation ne passe par ici : ouvrir une leçon ne doit jamais
     * dépendre de la disponibilité d'un service tiers.
     *
     * Les paramètres viennent TOUS du serveur. En particulier `$priceId`
     * provient du catalogue (PlanCatalog), jamais d'une requête cliente, et
     * `$clientReferenceId` est l'identifiant de l'élève authentifié — c'est
     * le pont que le webhook empruntera ensuite pour retrouver le compte.
     *
     * @param  string  $priceId  le tarif, résolu côté serveur
     * @param  string  $clientReferenceId  l'identifiant de l'élève, posé par nous
     * @param  string|null  $customerId  un client déjà connu, pour éviter un doublon
     * @param  string|null  $idempotencyKey  pour qu'un double clic ne crée qu'une session
     *
     * @throws \App\Domain\Billing\CheckoutFailedException si le fournisseur refuse.
     */
    public function createCheckoutSession(
        string $priceId,
        string $clientReferenceId,
        string $successUrl,
        string $cancelUrl,
        ?string $customerId = null,
        ?string $customerEmail = null,
        ?string $idempotencyKey = null,
    ): CheckoutSession;

    /**
     * Ouvre le PORTAIL CLIENT hébergé par le fournisseur.
     *
     * C'est la réponse de la phase 7 à « je veux gérer mon abonnement » :
     * moyens de paiement, factures, historique. Tout cela vit déjà chez le
     * fournisseur, et le recopier chez nous dupliquerait une source de vérité
     * — avec la dérive que cela finit toujours par produire.
     *
     * `$customerId` vient de l'abonnement LOCAL de l'élève authentifié, jamais
     * d'une requête cliente : c'est ce qui empêche d'ouvrir le portail de
     * quelqu'un d'autre. `$returnUrl` est imposée par le serveur.
     *
     * N'ACCORDE AUCUN DROIT. Ce que l'élève fait dans le portail revient par
     * webhook signé, comme le reste.
     *
     * @throws \App\Domain\Billing\CheckoutFailedException si le fournisseur refuse.
     */
    public function createPortalSession(string $customerId, string $returnUrl): PortalSession;

    /**
     * Programme la résiliation à la FIN DE LA PÉRIODE PAYÉE.
     *
     * Pas une résiliation immédiate : l'élève a payé jusqu'à une date, il
     * garde son accès jusque-là. Le fournisseur reste l'autorité — cet appel
     * exprime une intention, et c'est le webhook qui la rend vraie localement.
     *
     * Renvoie l'état du fournisseur APRÈS l'opération, pour que l'appelant
     * puisse refléter l'intention sans attendre le webhook. Cet état ne
     * décide jamais d'un accès : il ne touche que des champs descriptifs.
     *
     * @throws \App\Domain\Billing\CheckoutFailedException si le fournisseur refuse.
     */
    public function cancelAtPeriodEnd(string $providerSubscriptionId): ProviderSubscriptionState;

    /**
     * Annule une résiliation programmée — « je continue, finalement ».
     *
     * N'a de sens que sur un abonnement encore actif dont la résiliation est
     * programmée. Sur un abonnement déjà terminé chez le fournisseur, l'appel
     * échoue : on ne ressuscite pas un abonnement mort, on en reprend un.
     *
     * @throws \App\Domain\Billing\CheckoutFailedException si le fournisseur refuse.
     */
    public function resumeSubscription(string $providerSubscriptionId): ProviderSubscriptionState;
}
