<?php

namespace App\Domain\Billing;

use RuntimeException;

/**
 * Le fournisseur n'a pas pu ouvrir la session de paiement.
 *
 * Panne réseau, tarif inconnu chez lui, clé d'API invalide. Distinct d'un
 * refus de NOTRE part (offre inconnue, élève déjà abonné), qui est une
 * décision métier et se traduit par un 422 explicite.
 *
 * Le message du fournisseur n'est jamais recopié tel quel vers l'élève : il
 * peut contenir de l'interne, et « réessayez dans un instant » est de toute
 * façon la seule chose actionnable.
 */
class CheckoutFailedException extends RuntimeException {}
