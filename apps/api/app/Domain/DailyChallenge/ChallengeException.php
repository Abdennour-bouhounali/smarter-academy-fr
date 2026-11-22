<?php

namespace App\Domain\DailyChallenge;

use DomainException;

/**
 * Les refus du défi quotidien — des raisons FERMÉES que le client traduit en
 * arabe (jamais le message français). HTTP : 422, sauf `expired` et
 * `already_answered` (409).
 */
class ChallengeException extends DomainException
{
    public const DISABLED = 'disabled';

    public const REST_DAY = 'rest_day';

    public const WINDOW_CLOSED = 'window_closed';

    public const NOTHING_TO_REVIEW = 'nothing_to_review';

    public const NOT_FOUND = 'not_found';

    public const EXPIRED = 'expired';

    public const FINISHED = 'finished';

    public const ALREADY_ANSWERED = 'already_answered';

    public const OUT_OF_ORDER = 'out_of_order';

    public const NOT_OPENED = 'not_opened';

    public function __construct(public readonly string $reason, string $message = '')
    {
        parent::__construct($message !== '' ? $message : $reason);
    }

    public function status(): int
    {
        return match ($this->reason) {
            self::EXPIRED, self::ALREADY_ANSWERED, self::FINISHED => 409,
            self::NOT_FOUND => 404,
            default => 422,
        };
    }
}
