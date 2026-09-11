<?php

namespace App\Domain\Billing;

/**
 * Une session de portail client ouverte chez le fournisseur.
 *
 * Volontairement réduite à une URL : le portail est une page HÉBERGÉE. Moyens
 * de paiement, factures, historique — tout y vit chez le fournisseur, et rien
 * n'a besoin d'être recopié chez nous pour être montré à l'élève.
 *
 * ── Ce que cet objet N'ACCORDE PAS ───────────────────────────────────────
 * Aucun droit. Un élève peut revenir du portail après avoir résilié, changé
 * de carte, ou n'avoir rien fait du tout : dans les trois cas l'état local ne
 * bouge qu'au webhook signé. Le retour du portail est une navigation, pas une
 * autorisation — exactement comme l'URL de succès du paiement.
 */
final class PortalSession
{
    public function __construct(
        /**
         * L'URL du portail HÉBERGÉ par le fournisseur.
         *
         * C'est tout ce que le frontend reçoit. Il redirige ; aucune donnée
         * de carte n'atteint jamais notre domaine.
         */
        public readonly string $url,
    ) {}
}
