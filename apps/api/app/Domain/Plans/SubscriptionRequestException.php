<?php

namespace App\Domain\Plans;

use DomainException;

/**
 * Un refus de demande d'offre qui porte un MOTIF lisible par la machine :
 * le client rend l'arabe à partir du motif, jamais du message français.
 */
class SubscriptionRequestException extends DomainException
{
    public const SEATS_REQUIRED = 'seats_required';

    public const SEATS_NOT_COVERED = 'seats_not_covered';

    public const COVERED_BY_DEFAULT = 'covered_by_default';

    public const SEATS_BELOW_USAGE = 'seats_below_usage';

    public const NOT_REQUESTABLE = 'not_requestable';

    public const ALREADY_PENDING = 'already_pending';

    public function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }
}
