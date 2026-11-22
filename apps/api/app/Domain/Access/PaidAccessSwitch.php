<?php

namespace App\Domain\Access;

/**
 * « La plateforme vend-elle en ce moment ? » — vu de la couche d'accès, sans rien savoir de la facturation.
 *
 * Fermé (false) : le palier payant n'enferme personne (EntitlementService rend `payments_closed`). L'implémentation
 * est l'interrupteur de l'administrateur (PaymentGate), liée dans AppServiceProvider : la couche d'accès ne dépend
 * que de cette question, jamais d'un fournisseur ni d'un service d'encaissement (voir le test de frontière de la facturation).
 */
interface PaidAccessSwitch
{
    public function isOpen(): bool;
}
