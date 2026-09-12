<?php

namespace App\Domain\Identity;

use RuntimeException;

/**
 * Une identité Google que l'on REFUSE de transformer en session.
 *
 * Chaque cas est un refus de sécurité, pas une panne. Le message rendu à
 * l'élève reste volontairement peu bavard : dire « ce compte est déjà lié à
 * un autre compte Google » à quelqu'un qui tâtonne lui apprendrait quelque
 * chose sur un compte qui n'est pas le sien.
 */
class GoogleIdentityRejected extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $reason,
    ) {
        parent::__construct($message);
    }

    /** Google n'atteste pas la possession de l'adresse. */
    public static function unverifiedEmail(): self
    {
        return new self(
            "Votre adresse e-mail n'est pas vérifiée chez Google. Vérifiez-la, puis réessayez.",
            'email_not_verified',
        );
    }

    /** Le compte local est déjà lié à une autre identité Google. */
    public static function alreadyLinkedToAnotherIdentity(): self
    {
        return new self(
            'Ce compte ne peut pas être lié à ce compte Google. Connectez-vous avec votre e-mail et votre mot de passe.',
            'already_linked',
        );
    }

    /** État impossible : une identité sans compte. */
    public static function orphanIdentity(): self
    {
        return new self(
            'Connexion impossible pour le moment. Contactez-nous si le problème persiste.',
            'orphan_identity',
        );
    }

    /** Google n'a pas rendu d'identité exploitable (panne, refus, réponse tronquée). */
    public static function providerFailure(): self
    {
        return new self(
            "La connexion avec Google n'a pas abouti. Réessayez.",
            'provider_failure',
        );
    }
}
