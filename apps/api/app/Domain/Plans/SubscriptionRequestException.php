<?php

namespace App\Domain\Plans;

use DomainException;

/**
 * Un refus de demande d'offre qui porte un MOTIF lisible par la machine :
 * le client choisit son texte à partir du motif.
 */
class SubscriptionRequestException extends DomainException
{
    public const SEATS_REQUIRED = 'seats_required';

    public const SEATS_NOT_COVERED = 'seats_not_covered';

    public const COVERED_BY_DEFAULT = 'covered_by_default';

    public const SEATS_BELOW_USAGE = 'seats_below_usage';

    public const NOT_REQUESTABLE = 'not_requestable';

    public const ALREADY_PENDING = 'already_pending';

    /** La formule n'a pas encore de prix (0) : elle ne se demande pas, ne s'achète pas. */
    public const NOT_PRICED = 'not_priced';

    public function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }
}
