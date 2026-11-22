<?php

namespace App\Domain\Access\ActivationCodes;

use DomainException;

/**
 * Un refus de saisie, AVEC son motif — même principe qu'AccessDecision.
 *
 * Le motif voyage jusqu'à l'interface parce que les cinq cas appellent cinq
 * conduites différentes chez l'élève : retaper, contacter le vendeur,
 * attendre, ou ne rien faire du tout. Un seul message « code refusé » les
 * laisserait tous les cinq à la même impasse.
 *
 * Le vocabulaire est CLOS : le contrôleur le rend tel quel dans `reason`, et
 * le frontend en fait des messages arabes. Y ajouter un cas, c'est ajouter une
 * traduction — ce qu'une chaîne libre n'aurait pas rendu visible.
 *
 * ── Ce qui n'est délibérément PAS distingué ──────────────────────────────
 * `invalid` couvre à la fois « ce code n'existe pas » et « ce n'est pas la
 * forme d'un code ». Les séparer indiquerait à qui tâtonne qu'il a trouvé la
 * bonne forme, ce qui est exactement le renseignement qu'une attaque cherche.
 */
class ActivationCodeException extends DomainException
{
    /** Inconnu, ou mal formé. Les deux se confondent exprès. */
    public const INVALID = 'invalid';

    /** Déjà saisi — par cet élève ou par un autre, on ne le dit pas. */
    public const ALREADY_ACTIVATED = 'already_activated';

    /** La date limite de saisie est passée. */
    public const EXPIRED = 'expired';

    /** Retiré par l'administration. */
    public const REVOKED = 'revoked';

    /** Le code active une offre d'un autre type de compte (enseignant ↔ élève). */
    public const PLAN_MISMATCH = 'plan_mismatch';

    public const REASONS = [
        self::INVALID,
        self::ALREADY_ACTIVATED,
        self::EXPIRED,
        self::REVOKED,
        self::PLAN_MISMATCH,
    ];

    private function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }

    public static function invalid(): self
    {
        return new self(
            self::INVALID,
            'Ce code est invalide. Vérifiez votre saisie.'
        );
    }

    public static function alreadyActivated(): self
    {
        return new self(
            self::ALREADY_ACTIVATED,
            'Ce code a déjà été utilisé.'
        );
    }

    public static function expired(): self
    {
        return new self(
            self::EXPIRED,
            'Ce code a expiré.'
        );
    }

    public static function revoked(): self
    {
        return new self(
            self::REVOKED,
            'Ce code n\'est plus valide.'
        );
    }

    public static function planMismatch(): self
    {
        return new self(
            self::PLAN_MISMATCH,
            'Ce code ne correspond pas à votre type de compte.'
        );
    }
}
