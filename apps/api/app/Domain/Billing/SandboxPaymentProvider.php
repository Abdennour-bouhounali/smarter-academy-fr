<?php

namespace App\Domain\Billing;

/**
 * Un fournisseur de BAC À SABLE — pour vérifier le parcours sans contacter
 * personne.
 *
 * À quoi il sert : éprouver au navigateur la chaîne complète (page des tarifs,
 * bouton, redirection, page de retour) sans clé d'API, sans réseau, et sans le
 * moindre euro. C'est ce que la frontière neutre rend possible : l'application
 * ne sait pas quel fournisseur est branché.
 *
 * ── Ce qu'il n'est PAS ───────────────────────────────────────────────────
 * Il n'ouvre aucun accès, exactement comme le vrai : sa « page de paiement »
 * est une URL qui ramène sur le retour d'annulation. L'accès ne s'ouvre que
 * par un webhook signé, et ce fournisseur en refuse toutes les signatures —
 * il n'est donc pas une porte dérobée.
 *
 * ── Il ne s'active jamais tout seul ──────────────────────────────────────
 * Il faut le demander explicitement (BILLING_PROVIDER=sandbox), et
 * AppServiceProvider refuse de l'enregistrer hors d'un environnement local.
 * Un déploiement de production qui hériterait de cette variable ne
 * l'obtiendrait pas.
 */
class SandboxPaymentProvider implements PaymentProvider
{
    public const NAME = 'sandbox';

    public function name(): string
    {
        return self::NAME;
    }

    /**
     * Aucune signature n'est acceptée.
     *
     * Volontaire, et c'est ce qui empêche ce fournisseur de devenir un moyen
     * d'ouvrir un accès : il sait rendre une URL de paiement, jamais accorder
     * un droit.
     */
    public function verifySignature(string $payload, ?string $signature): bool
    {
        return false;
    }

    public function translate(string $payload): TranslatedEvent
    {
        throw new ProviderEventFormatException('Le bac à sable ne traite aucun évènement.');
    }

    /**
     * Une fausse page de paiement : l'URL d'annulation.
     *
     * Le parcours réel s'arrête donc sur « Paiement annulé », ce qui est
     * honnête — rien n'a été payé. Pour éprouver l'activation, on envoie un
     * webhook signé séparément, exactement comme le ferait le vrai
     * fournisseur.
     */
    public function createCheckoutSession(
        string $priceId,
        string $clientReferenceId,
        string $successUrl,
        string $cancelUrl,
        ?string $customerId = null,
        ?string $customerEmail = null,
        ?string $idempotencyKey = null,
    ): CheckoutSession {
        return new CheckoutSession(
            id: 'cs_sandbox_'.substr(hash('sha256', $clientReferenceId.$priceId), 0, 16),
            url: $cancelUrl,
            customerId: $customerId,
        );
    }
}
