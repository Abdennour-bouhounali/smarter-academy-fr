<?php

namespace App\Domain\Billing;

/**
 * Une session de paiement ouverte chez le fournisseur — en types neutres.
 *
 * Ce que l'application en garde est délibérément minuscule : de quoi
 * rediriger l'élève, et de quoi retrouver la session dans un journal. Rien
 * d'autre ne traverse cette frontière — ni objet de SDK, ni montant, ni état
 * de paiement.
 *
 * ── Ce que cet objet NE PROUVE PAS ───────────────────────────────────────
 * Son existence ne dit rien d'un paiement. Une session est une INTENTION :
 * l'élève s'apprête à payer. Ce qui fait foi, c'est le webhook signé qui
 * arrivera ensuite. Aucun code ne doit ouvrir un accès parce qu'une session
 * a été créée.
 */
final class CheckoutSession
{
    public function __construct(
        /** L'identifiant de la session chez le fournisseur (`cs_...`). */
        public readonly string $id,

        /**
         * L'URL de la page de paiement HÉBERGÉE par le fournisseur.
         *
         * C'est tout ce que le frontend reçoit : il redirige, et le numéro de
         * carte n'atteint jamais notre domaine. C'est ce qui garde la
         * plateforme hors du périmètre de conformité des données de carte.
         */
        public readonly string $url,

        /** Le client chez le fournisseur, s'il en existe déjà un. */
        public readonly ?string $customerId = null,
    ) {}
}
