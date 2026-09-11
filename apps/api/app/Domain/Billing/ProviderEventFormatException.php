<?php

namespace App\Domain\Billing;

use RuntimeException;

/**
 * Le corps reçu est signé, mais inexploitable : pas de JSON valide, ou aucun
 * identifiant d'évènement.
 *
 * Distinct d'une signature invalide (qui est une attaque possible) et d'un
 * échec de traitement (qui est rejouable) : ici, rejouer ne servirait à rien,
 * le corps ne deviendra pas lisible. Le contrôleur répond donc 400 sans
 * demander de nouvelle livraison.
 */
class ProviderEventFormatException extends RuntimeException {}
