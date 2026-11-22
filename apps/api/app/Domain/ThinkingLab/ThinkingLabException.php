<?php

namespace App\Domain\ThinkingLab;

use DomainException;

/**
 * Les refus du « مختبر التفكير » — des raisons FERMÉES que le client traduit en arabe
 * (même principe que DailyChallenge\ChallengeException).
 */
class ThinkingLabException extends DomainException
{
    public const NOT_FOUND = 'not_found';

    /** Le défi n'est pas encore atteint sur l'échelle. */
    public const LOCKED = 'locked';

    /** Déjà 3 défis ouverts : en résoudre un, ou en reporter un. */
    public const TOO_MANY_OPEN = 'too_many_open';

    /** La porte est franchie (résolu ou appris) : plus de tentative ni de clé. */
    public const CLOSED = 'closed';

    /** La relecture n'est pas encore ouverte. */
    public const GATE_CLOSED = 'gate_closed';

    /** Cette clé n'est pas encore débloquée (une clé par tentative comptée). */
    public const KEY_LOCKED = 'key_locked';

    public const NOT_STARTED = 'not_started';

    public function __construct(public readonly string $reason, public readonly array $context = [])
    {
        parent::__construct($reason);
    }

    public function status(): int
    {
        return match ($this->reason) {
            self::NOT_FOUND => 404,
            self::LOCKED, self::GATE_CLOSED, self::KEY_LOCKED => 403,
            self::TOO_MANY_OPEN, self::CLOSED => 409,
            default => 422,
        };
    }
}
