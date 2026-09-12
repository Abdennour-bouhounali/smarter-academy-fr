<?php

namespace App\Domain\Identity;

use App\Models\User;

/**
 * Ce que la résolution d'une identité Google a produit.
 *
 * Trois issues seulement, et elles sont volontairement distinctes : un appel
 * qui rend « voici l'utilisateur » sans dire COMMENT il a été obtenu rend
 * impossible d'exiger un consentement pour un compte neuf, et seulement pour
 * lui.
 */
final class GoogleLinkOutcome
{
    private function __construct(
        public readonly string $kind,
        public readonly ?User $user,
        public readonly GoogleIdentity $identity,
    ) {}

    /** L'identité Google est déjà liée à un compte : c'est une connexion. */
    public const SIGNED_IN = 'signed_in';

    /** Un compte local existe et vient d'être lié à cette identité Google. */
    public const LINKED = 'linked';

    /** Aucun compte : il faut le CONSENTEMENT avant de créer quoi que ce soit. */
    public const NEEDS_CONSENT = 'needs_consent';

    public static function signedIn(User $user, GoogleIdentity $identity): self
    {
        return new self(self::SIGNED_IN, $user, $identity);
    }

    public static function linked(User $user, GoogleIdentity $identity): self
    {
        return new self(self::LINKED, $user, $identity);
    }

    public static function needsConsent(GoogleIdentity $identity): self
    {
        return new self(self::NEEDS_CONSENT, null, $identity);
    }

    public function isAuthenticated(): bool
    {
        return $this->user !== null;
    }
}
