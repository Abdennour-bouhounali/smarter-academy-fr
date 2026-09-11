<?php

namespace App\Domain\Billing;

use Illuminate\Support\Carbon;

/**
 * Un évènement de fournisseur, traduit — l'enveloppe neutre que le
 * contrôleur de webhook manipule.
 *
 * Elle porte l'identité de l'évènement (pour l'idempotence), son horodatage
 * (pour l'ordre), et ce qu'il faut en faire : un état d'abonnement, un état
 * de paiement, ou rien du tout.
 *
 * « Rien du tout » est un cas de PREMIÈRE CLASSE, pas un échec : la grande
 * majorité des évènements d'un fournisseur ne nous concerne pas. On les
 * enregistre pour la traçabilité et on les marque `ignored`. Les traiter
 * comme des erreurs remplirait le journal d'alertes sans objet, et la
 * véritable panne s'y noierait.
 */
final class TranslatedEvent
{
    public function __construct(
        public readonly string $provider,

        /** L'identité DU FOURNISSEUR (`evt_...`) — la clé d'idempotence. */
        public readonly string $eventId,

        public readonly string $type,

        public readonly ?Carbon $occurredAt = null,

        /** L'état d'abonnement porté par cet évènement, s'il en porte un. */
        public readonly ?ProviderSubscriptionState $subscription = null,

        /** L'état de paiement porté par cet évènement, s'il en porte un. */
        public readonly ?ProviderPaymentState $payment = null,

        /** L'objet visé chez le fournisseur, pour le diagnostic. */
        public readonly ?string $providerObjectId = null,
    ) {}

    /**
     * Cet évènement demande-t-il un traitement ?
     *
     * Un évènement sans état d'abonnement NI état de paiement est un
     * évènement auquel nous n'avons rien à faire.
     */
    public function isActionable(): bool
    {
        return $this->subscription !== null || $this->payment !== null;
    }
}
