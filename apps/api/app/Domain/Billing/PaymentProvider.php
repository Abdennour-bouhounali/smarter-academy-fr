<?php

namespace App\Domain\Billing;

/**
 * Le contrat d'un fournisseur de paiement — volontairement MINUSCULE.
 *
 * Trois capacités : authentifier un webhook, le traduire, et ouvrir une
 * session de paiement. Tout le reste — portail client, remboursement,
 * changement d'offre — n'est pas déclaré ici tant que rien ne l'appelle.
 *
 * C'est un choix, pas un oubli. Une interface qui déclare des méthodes que
 * personne n'implémente vraiment produit soit des `throw new
 * NotImplemented`, soit des implémentations factices qu'on finit par croire
 * réelles. Le contrat a grandi d'une méthode en phase 6, quand
 * l'encaissement est arrivé — et d'une seule.
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
}
