<?php

namespace App\Domain\Identity;

/**
 * L'identité rendue par Google, réduite à ce dont on a besoin.
 *
 * Un objet plutôt qu'un tableau : le point d'entrée OAuth est le seul endroit
 * du code où des données d'un tiers deviennent une identité, et il vaut mieux
 * que ce passage soit typé.
 *
 * `emailVerified` est repris tel quel de Google et n'est JAMAIS supposé vrai.
 * Google peut rendre un compte dont l'adresse n'est pas prouvée ; traiter une
 * telle adresse comme vérifiée reviendrait à laisser n'importe qui déclarer
 * l'adresse d'autrui. Voir GoogleAccountLinker, qui refuse dans ce cas.
 */
final class GoogleIdentity
{
    public function __construct(
        public readonly string $providerUserId,
        public readonly string $email,
        public readonly bool $emailVerified,
        public readonly ?string $firstName = null,
        public readonly ?string $lastName = null,
    ) {}
}
