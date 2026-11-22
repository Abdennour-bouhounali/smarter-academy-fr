<?php

namespace App\Domain\Family;

use DomainException;

/**
 * Un refus de l'espace parent, avec un motif stable que le client traduit
 * (student.json › parents.errors.*, parent.json › errors.*).
 */
class FamilyException extends DomainException
{
    public const CONSENT_REQUIRED = 'consent_required';

    public const INVALID_CODE = 'invalid_code';

    public const EXPIRED_CODE = 'expired_code';

    public const ALREADY_LINKED = 'already_linked';

    public const TOO_MANY_CHILDREN = 'too_many_children';

    public const TOO_MANY_PARENTS = 'too_many_parents';

    // « رابط الوليّ » (lien sans compte).
    public const LINK_INVALID = 'link_invalid';

    public const LINK_REVOKED = 'link_revoked';

    public const PIN_REQUIRED = 'pin_required';

    public const PIN_WRONG = 'pin_wrong';

    public const PIN_LOCKED = 'pin_locked';

    public const PIN_ALREADY_SET = 'pin_already_set';

    public function __construct(public readonly string $reason, string $message, public readonly int $status = 422)
    {
        parent::__construct($message);
    }
}
