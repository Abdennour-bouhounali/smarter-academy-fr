<?php

namespace App\Domain\Billing\Stripe;

use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\CheckoutSession;
use App\Domain\Billing\PaymentProvider;
use App\Domain\Billing\TranslatedEvent;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

/**
 * Stripe — le SEUL fichier de l'application qui importe le SDK.
 *
 * Sa surface est délibérément minuscule : authentifier un corps, le traduire,
 * et ouvrir une session de paiement.
 *
 * Le SEUL appel réseau vers Stripe est `createCheckoutSession`, déclenché par
 * un clic explicite de l'élève. Aucun chemin d'AUTORISATION n'appelle Stripe :
 * le fournisseur est une source de facturation asynchrone, jamais une
 * dépendance d'exécution. Ouvrir une leçon ne doit pas pouvoir échouer parce
 * que Stripe est en panne.
 *
 * ── Le secret ────────────────────────────────────────────────────────────
 * Lu depuis la configuration, donc l'environnement. Jamais en base, jamais
 * dans le code, jamais renvoyé par une API, jamais écrit dans un journal.
 *
 * ── L'absence de secret FERME ────────────────────────────────────────────
 * Sans secret configuré, `verifySignature` renvoie faux — pas vrai. Un
 * environnement mal configuré rejette donc tous les webhooks au lieu de tous
 * les accepter. C'est le sens sûr : le défaut d'une vérification manquante
 * doit être le refus, jamais la confiance.
 */
class StripePaymentProvider implements PaymentProvider
{
    public const NAME = 'stripe';

    public function __construct(
        private StripeEventTranslator $translator,
        private ?string $webhookSecret = null,
        /**
         * La clé d'API — utilisée UNIQUEMENT pour ouvrir une session de
         * paiement, jamais sur un chemin d'autorisation. Absente,
         * `createCheckoutSession` refuse proprement : mieux vaut un bouton
         * qui répond « indisponible » qu'un appel qui part sans identité.
         */
        private ?string $apiKey = null,
        /**
         * Tolérance d'horodatage, en secondes. Une signature valide mais
         * ancienne est refusée : sans cette borne, un corps signé intercepté
         * resterait rejouable indéfiniment.
         */
        private int $tolerance = 300,
    ) {}

    public function name(): string
    {
        return self::NAME;
    }

    public function verifySignature(string $payload, ?string $signature): bool
    {
        if ($this->webhookSecret === null || $this->webhookSecret === '' || $signature === null) {
            // Journalisé une fois, sans secret ni corps : une configuration
            // manquante doit se voir, sinon on cherche la panne côté Stripe.
            Log::warning('Webhook Stripe refusé : secret ou signature absents.');

            return false;
        }

        try {
            // La vérification vient du SDK : c'est de la cryptographie à temps
            // constant, on ne la réécrit pas. Elle compare l'empreinte du corps
            // BRUT — d'où l'exigence de ne jamais re-sérialiser.
            Webhook::constructEvent($payload, $signature, $this->webhookSecret, $this->tolerance);

            return true;
        } catch (SignatureVerificationException|\UnexpectedValueException) {
            return false;
        }
    }

    public function translate(string $payload): TranslatedEvent
    {
        return $this->translator->translate($payload);
    }

    /**
     * Ouvre une session de paiement Stripe.
     *
     * LE seul appel sortant de l'application vers Stripe, et il n'a lieu que
     * sur un clic d'élève. Rien dans le chemin d'ouverture d'une leçon ne
     * passe par ici.
     *
     * Le mode `subscription` : Stripe crée et facture l'abonnement, puis
     * émet les évènements que la phase 5 sait déjà traiter. L'application
     * n'a aucun calendrier de facturation à tenir.
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
        if ($this->apiKey === null || $this->apiKey === '') {
            throw new CheckoutFailedException('Aucune clé d\'API Stripe configurée.');
        }

        $params = [
            'mode' => 'subscription',
            // La quantité est imposée : un abonnement, pas dix. Sans cela,
            // rien n'empêcherait une session de facturer plusieurs fois.
            'line_items' => [['price' => $priceId, 'quantity' => 1]],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            // LE PONT vers le compte local. Posé par notre serveur, relu par
            // le webhook (voir ProviderSubscriptionAdapter::resolveUser).
            'client_reference_id' => $clientReferenceId,
        ];

        // Réutiliser le client existant, sinon pré-remplir l'adresse. Les
        // deux à la fois est refusé par Stripe.
        if ($customerId !== null) {
            $params['customer'] = $customerId;
        } elseif ($customerEmail !== null) {
            $params['customer_email'] = $customerEmail;
        }

        try {
            $session = $this->client()->checkout->sessions->create(
                $params,
                // L'idempotence est celle de Stripe : la même clé rejouée
                // rend LA MÊME session au lieu d'en créer une seconde. Aucun
                // mécanisme local n'est nécessaire, et en inventer un
                // dupliquerait une garantie qui existe déjà.
                $idempotencyKey !== null ? ['idempotency_key' => $idempotencyKey] : [],
            );
        } catch (ApiErrorException $e) {
            // Le message de Stripe reste ici ; l'appelant le journalise et
            // rend à l'élève un message neutre.
            throw new CheckoutFailedException($e->getMessage(), previous: $e);
        }

        if (! is_string($session->url) || $session->url === '') {
            // Stripe a répondu sans URL de redirection : la réponse est
            // inexploitable, et rediriger vers une chaîne vide enverrait
            // l'élève nulle part.
            throw new CheckoutFailedException('Session de paiement sans URL de redirection.');
        }

        return new CheckoutSession(
            id: (string) $session->id,
            url: $session->url,
            customerId: is_string($session->customer) ? $session->customer : null,
        );
    }

    /**
     * Le client Stripe, construit à la demande.
     *
     * Pas en propriété : une instance créée au démarrage ferait porter à
     * chaque requête HTTP le coût d'un objet dont la quasi-totalité n'a
     * jamais besoin.
     */
    private function client(): StripeClient
    {
        return new StripeClient($this->apiKey);
    }
}
