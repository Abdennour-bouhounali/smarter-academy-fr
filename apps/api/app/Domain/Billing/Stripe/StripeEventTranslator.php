<?php

namespace App\Domain\Billing\Stripe;

use App\Domain\Billing\ProviderEventFormatException;
use App\Domain\Billing\ProviderPaymentState;
use App\Domain\Billing\ProviderSubscriptionState;
use App\Domain\Billing\TranslatedEvent;
use App\Models\Payment;
use Illuminate\Support\Carbon;

/**
 * évènement Stripe → types NEUTRES. Le mur, et son seul passage.
 *
 * Tout ce que ce fichier sait de Stripe s'arrête à ses frontières : il reçoit
 * un tableau décodé depuis le corps du webhook, et rend des objets du
 * namespace Billing. Personne d'autre dans l'application ne connaît le nom
 * d'un champ Stripe.
 *
 * ── Pourquoi un tableau et pas les objets du SDK ─────────────────────────
 * Le SDK sert à VÉRIFIER la signature (c'est de la cryptographie, on ne la
 * réécrit pas). Pour la lecture des champs, un tableau est préférable :
 * l'hydratation en objets typés échoue sur un champ inattendu, et la forme
 * des évènements évolue d'une version d'API à l'autre. Lire des clés permet
 * d'ignorer ce qu'on ne connaît pas au lieu de rejeter la livraison entière.
 *
 * ── Les évènements retenus ───────────────────────────────────────────────
 * Six, pas un de plus. Tout le reste devient un évènement non « actionable »,
 * enregistré puis marqué ignoré — voir TranslatedEvent.
 */
class StripeEventTranslator
{
    public const HANDLED = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.paid',
        'invoice.payment_failed',
    ];

    public function translate(string $payload): TranslatedEvent
    {
        $event = json_decode($payload, true);

        if (! is_array($event) || ! isset($event['id']) || ! is_string($event['id'])) {
            throw new ProviderEventFormatException('Corps de webhook Stripe illisible ou sans identifiant.');
        }

        $type = (string) ($event['type'] ?? 'unknown');
        $object = $event['data']['object'] ?? [];
        $occurredAt = isset($event['created']) ? Carbon::createFromTimestampUTC((int) $event['created']) : null;

        // Un type hors périmètre produit quand même un évènement : il sera
        // enregistré pour la traçabilité, puis marqué ignoré. On ne jette
        // rien en silence.
        if (! in_array($type, self::HANDLED, true)) {
            return new TranslatedEvent(
                provider: StripePaymentProvider::NAME,
                eventId: $event['id'],
                type: $type,
                occurredAt: $occurredAt,
                providerObjectId: is_array($object) ? ($object['id'] ?? null) : null,
            );
        }

        return new TranslatedEvent(
            provider: StripePaymentProvider::NAME,
            eventId: $event['id'],
            type: $type,
            occurredAt: $occurredAt,
            subscription: $this->subscriptionFrom($type, $object, $occurredAt),
            payment: $this->paymentFrom($type, $object, $occurredAt),
            providerObjectId: is_array($object) ? ($object['id'] ?? null) : null,
        );
    }

    /**
     * L'état d'abonnement porté par cet évènement, s'il en porte un.
     */
    private function subscriptionFrom(string $type, array $object, ?Carbon $occurredAt): ?ProviderSubscriptionState
    {
        if (str_starts_with($type, 'customer.subscription.')) {
            return $this->fromSubscriptionObject($type, $object, $occurredAt);
        }

        if ($type === 'checkout.session.completed') {
            return $this->fromCheckoutSession($object, $occurredAt);
        }

        // `invoice.paid` prolonge une période, mais l'évènement d'abonnement
        // correspondant arrive séparément et porte l'état complet. On ne
        // déduit donc rien d'une facture : deux sources pour le même fait
        // finiraient par se contredire.
        return null;
    }

    /**
     * Traduit un objet d'abonnement RENVOYÉ PAR UN APPEL d'API.
     *
     * Même traduction que pour un webhook, volontairement : une réponse
     * d'API et un évènement décrivent le même objet, et deux lectures
     * différentes du même corps finiraient par diverger — c'est exactement
     * ainsi que le défaut D1 (la période déplacée sur les lignes) avait
     * survécu à toute une suite de tests.
     *
     * L'appelant reste responsable de ne rien en déduire sur l'accès : le
     * webhook signé demeure l'autorité.
     */
    public function fromApiSubscription(array $object, ?Carbon $occurredAt = null): ?ProviderSubscriptionState
    {
        return $this->fromSubscriptionObject('customer.subscription.updated', $object, $occurredAt);
    }

    private function fromSubscriptionObject(string $type, array $object, ?Carbon $occurredAt): ?ProviderSubscriptionState
    {
        $id = $object['id'] ?? null;

        if (! is_string($id)) {
            return null;
        }

        // Une suppression est définitive, quel que soit le statut transporté.
        // Le forcer ici évite de dépendre d'un champ que Stripe peut laisser
        // à `active` dans l'objet supprimé.
        $status = $type === 'customer.subscription.deleted'
            ? 'canceled'
            : (string) ($object['status'] ?? 'incomplete');

        $cancelAtPeriodEnd = (bool) ($object['cancel_at_period_end'] ?? false);
        $deleted = $type === 'customer.subscription.deleted';

        // Une suppression n'est PAS une résiliation programmée : il ne reste
        // aucune période à honorer.
        if ($deleted) {
            $cancelAtPeriodEnd = false;
        }

        return new ProviderSubscriptionState(
            provider: StripePaymentProvider::NAME,
            providerSubscriptionId: $id,
            providerCustomerId: $this->stringOrNull($object['customer'] ?? null),
            providerStatus: $status,
            providerPriceId: $this->priceIdFrom($object),
            currentPeriodStart: $this->periodField($object, 'current_period_start'),
            // Une suppression immédiate ne laisse aucune période : sans cela,
            // une fin de période future maintiendrait l'accès ouvert alors que
            // l'abonnement n'existe plus.
            currentPeriodEnd: $type === 'customer.subscription.deleted'
                ? ($this->timestamp($object['ended_at'] ?? null) ?? $occurredAt)
                : $this->periodField($object, 'current_period_end'),
            cancelAtPeriodEnd: $cancelAtPeriodEnd,
            occurredAt: $occurredAt,
            deleted: $deleted,
        );
    }

    /**
     * La session de paiement : le tout premier évènement d'un abonnement.
     *
     * C'est le seul moment où l'élève n'est encore rattaché à aucun client
     * Stripe — d'où le `client_reference_id`, que NOTRE serveur aura posé en
     * créant la session (phase 6). Le webhook reste l'autorité : c'est lui
     * qui crée l'abonnement local, pas le retour de navigateur.
     */
    private function fromCheckoutSession(array $object, ?Carbon $occurredAt): ?ProviderSubscriptionState
    {
        if (($object['mode'] ?? null) !== 'subscription') {
            return null;
        }

        $subscriptionId = $this->stringOrNull($object['subscription'] ?? null);

        if ($subscriptionId === null) {
            return null;
        }

        // Une session « complétée » mais impayée n'ouvre rien. Le statut local
        // restera `pending`, donc aucun droit.
        $paid = ($object['payment_status'] ?? null) === 'paid';

        return new ProviderSubscriptionState(
            provider: StripePaymentProvider::NAME,
            providerSubscriptionId: $subscriptionId,
            providerCustomerId: $this->stringOrNull($object['customer'] ?? null),
            providerStatus: $paid ? 'active' : 'incomplete',
            providerPriceId: null,
            currentPeriodStart: $occurredAt,
            // La session ne porte pas de période : l'évènement d'abonnement
            // qui suit l'apportera. Laisser null vaut mieux qu'inventer une
            // date de fin, qui deviendrait la borne du droit.
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            occurredAt: $occurredAt,
            clientReferenceId: $this->stringOrNull($object['client_reference_id'] ?? null),
        );
    }

    /**
     * La trace comptable. N'ouvre ni ne ferme jamais un accès.
     */
    private function paymentFrom(string $type, array $object, ?Carbon $occurredAt): ?ProviderPaymentState
    {
        if (! in_array($type, ['invoice.paid', 'invoice.payment_failed'], true)) {
            return null;
        }

        $id = $object['id'] ?? null;

        if (! is_string($id)) {
            return null;
        }

        $succeeded = $type === 'invoice.paid';

        return new ProviderPaymentState(
            provider: StripePaymentProvider::NAME,
            providerPaymentId: $id,
            status: $succeeded ? Payment::STATUS_SUCCEEDED : Payment::STATUS_FAILED,
            amountCents: (int) ($succeeded
                ? ($object['amount_paid'] ?? $object['total'] ?? 0)
                : ($object['amount_due'] ?? $object['total'] ?? 0)),
            currency: strtoupper((string) ($object['currency'] ?? 'eur')),
            providerInvoiceId: $id,
            providerCustomerId: $this->stringOrNull($object['customer'] ?? null),
            providerSubscriptionId: $this->stringOrNull($object['subscription'] ?? null),
            paidAt: $succeeded ? ($this->timestamp($object['status_transitions']['paid_at'] ?? null) ?? $occurredAt) : null,
            // Un CODE, jamais le message : un message de fournisseur finirait
            // affiché à un élève ou recopié dans un journal.
            failureCode: $succeeded ? null : $this->stringOrNull($object['last_finalization_error']['code'] ?? null),
            occurredAt: $occurredAt,
        );
    }

    /** Stripe rend soit une chaîne d'identifiant, soit l'objet développé. */
    private function stringOrNull(mixed $value): ?string
    {
        if (is_string($value)) {
            return $value;
        }

        if (is_array($value) && isset($value['id']) && is_string($value['id'])) {
            return $value['id'];
        }

        return null;
    }

    private function priceIdFrom(array $object): ?string
    {
        $item = $object['items']['data'][0] ?? null;

        if (! is_array($item)) {
            return null;
        }

        return $this->stringOrNull($item['price'] ?? null);
    }

    /**
     * La période de facturation — cherchée aux DEUX endroits où Stripe la met.
     *
     * Découvert contre l'API réelle (phase 6.5) : depuis la version 2025 de
     * l'API, `current_period_start` / `current_period_end` ne vivent plus à la
     * racine de l'abonnement mais sur chaque LIGNE (`items.data[].`). La racine
     * vaut alors NULL.
     *
     * Ce que coûtait l'oubli : `ends_at` restait nul, donc le droit devenait
     * SANS TERME. Un abonnement résilié n'expirait plus jamais de lui-même —
     * c'est la barrière temporelle de toute l'architecture qui sautait. Aucun
     * test ne pouvait l'attraper : les fixtures posaient le champ à la racine,
     * comme l'ancienne API.
     *
     * On lit donc la racine D'ABORD (anciennes versions d'API, et évènements
     * plus anciens rejoués), puis la première ligne. Les deux formes restent
     * acceptées : un webhook d'il y a six mois doit continuer d'être traité.
     */
    private function periodField(array $object, string $field): ?Carbon
    {
        $root = $this->timestamp($object[$field] ?? null);

        if ($root !== null) {
            return $root;
        }

        return $this->timestamp($object['items']['data'][0][$field] ?? null);
    }

    private function timestamp(mixed $value): ?Carbon
    {
        return is_numeric($value) ? Carbon::createFromTimestampUTC((int) $value) : null;
    }
}
