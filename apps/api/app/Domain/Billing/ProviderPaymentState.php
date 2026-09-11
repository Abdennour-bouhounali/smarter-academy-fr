<?php

namespace App\Domain\Billing;

use Illuminate\Support\Carbon;

/**
 * Un paiement, en types neutres. Même rôle que ProviderSubscriptionState,
 * pour la trace comptable.
 *
 * Rappel de ce que cet objet NE FAIT PAS : il n'ouvre aucun accès. Une ligne
 * `payments` est une trace, jamais une autorisation — un remboursement sépare
 * « payé » de « autorisé ». Seul l'abonnement ouvre un droit.
 */
final class ProviderPaymentState
{
    public function __construct(
        public readonly string $provider,

        /** L'identité du paiement chez le fournisseur. Sert d'idempotence. */
        public readonly string $providerPaymentId,

        /** succeeded | failed — déjà normalisé par le traducteur. */
        public readonly string $status,

        /** En CENTIMES. Un total d'argent ne se calcule pas en flottant. */
        public readonly int $amountCents,

        public readonly string $currency = 'EUR',

        public readonly ?string $providerInvoiceId = null,

        public readonly ?string $providerCustomerId = null,

        /** L'abonnement concerné, chez le fournisseur. */
        public readonly ?string $providerSubscriptionId = null,

        public readonly ?Carbon $paidAt = null,

        /** Un CODE court (`card_declined`), jamais un message brut. */
        public readonly ?string $failureCode = null,

        public readonly ?Carbon $occurredAt = null,
    ) {}
}
