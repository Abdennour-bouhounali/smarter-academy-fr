<?php

namespace App\Domain\Billing;

use Illuminate\Support\Carbon;

/**
 * Ce qu'un fournisseur raconte d'un abonnement — en types NEUTRES.
 *
 * C'est la pièce qui rend toute l'architecture agnostique : au-delà de cette
 * frontière, plus personne ne sait que Stripe existe. Un traducteur
 * spécifique (Stripe/StripeEventTranslator) produit cet objet ; tout le reste
 * de l'application ne manipule que lui.
 *
 * Il ne contient AUCUN type de SDK, et n'en contiendra jamais : le jour où un
 * second fournisseur arrive, il écrit son propre traducteur vers cette même
 * classe, et rien d'autre ne bouge.
 *
 * ── Ce que cet objet n'est PAS ────────────────────────────────────────────
 * Ce n'est pas une décision. `status` est le statut BRUT du fournisseur
 * (`past_due`, `trialing`…), pas le nôtre. Sa traduction vers le vocabulaire
 * local est le travail de ProviderSubscriptionAdapter, et elle est faite à un
 * seul endroit pour qu'elle reste vérifiable.
 */
final class ProviderSubscriptionState
{
    public function __construct(
        /** Le nom du fournisseur — 'stripe'. */
        public readonly string $provider,

        /** L'abonnement CHEZ le fournisseur (`sub_...`). L'identité stable. */
        public readonly string $providerSubscriptionId,

        /** Le client chez le fournisseur (`cus_...`) — c'est par lui qu'on retrouve l'élève. */
        public readonly ?string $providerCustomerId,

        /** Le statut BRUT du fournisseur. Traduit ailleurs, jamais ici. */
        public readonly ?string $providerStatus,

        /** Le tarif chez le fournisseur (`price_...`). */
        public readonly ?string $providerPriceId,

        public readonly ?Carbon $currentPeriodStart,

        public readonly ?Carbon $currentPeriodEnd,

        /**
         * « Ça s'arrête à la fin de la période payée. »
         *
         * Distinct d'une résiliation immédiate, et c'est toute la différence :
         * l'élève garde ce qu'il a payé. Confondre les deux couperait l'accès
         * le jour du clic sur « résilier ».
         */
        public readonly bool $cancelAtPeriodEnd = false,

        /** L'instant où le fournisseur a constaté cet état. Sert à ordonner. */
        public readonly ?Carbon $occurredAt = null,

        /**
         * L'abonnement a été SUPPRIMÉ chez le fournisseur.
         *
         * Distinct d'une résiliation : une résiliation laisse une période
         * payée à honorer, une suppression n'en laisse aucune. Sans ce
         * drapeau, une suppression portant une fin de période encore à venir
         * (l'objet supprimé transporte souvent la date d'origine) serait lue
         * comme « résilié, avec du temps restant », et l'accès survivrait à
         * un abonnement qui n'existe plus.
         */
        public readonly bool $deleted = false,

        /**
         * Le jeton que NOTRE serveur a posé en créant la session de paiement.
         * Sert à retrouver l'élève au tout premier évènement, avant qu'aucun
         * `provider_customer_id` ne soit encore rattaché à un compte.
         *
         * Il est produit par nous, jamais par le client — c'est ce qui le rend
         * digne de confiance (voir ProviderSubscriptionAdapter::resolveUser).
         */
        public readonly ?string $clientReferenceId = null,
    ) {}
}
