<?php

namespace App\Domain\Madar;

use RuntimeException;

/**
 * Un refus de « مدار », avec un MOTIF clos que le client traduit en arabe
 * (`madar.json › reasons.*`). Le serveur parle en codes, jamais en phrases.
 */
class MadarException extends RuntimeException
{
    public const DISABLED = 'disabled';

    public const DISABLED_BY_TEACHER = 'disabled_by_teacher';

    public const NO_HEARTS = 'no_hearts';

    public const DAILY_CAP = 'daily_cap';

    public const REVIVE_LIMIT = 'revive_limit';

    public const RUN_CLOSED = 'run_closed';

    public const HEARTS_FULL = 'hearts_full';

    public const NOTHING_TO_REFUEL = 'nothing_to_refuel';

    public const ALREADY_ANSWERED = 'already_answered';

    public const SHIP_LOCKED = 'ship_locked';

    public const NOT_FOUND = 'not_found';

    /** L'enseignant a fermé CE jeu pour sa classe (les autres restent ouverts). */
    public const GAME_DISABLED = 'game_disabled';

    /** L'enseignant a fermé CE jeu pour CET élève (la classe peut y jouer). */
    public const GAME_DISABLED_FOR_STUDENT = 'game_disabled_for_student';

    /** « المستكشف » : ce niveau ne s'ouvre qu'une fois le précédent réussi. */
    public const LEVEL_LOCKED = 'level_locked';

    public function __construct(public readonly string $reason)
    {
        parent::__construct($reason);
    }

    public function status(): int
    {
        return match ($this->reason) {
            self::NOT_FOUND => 404,
            self::RUN_CLOSED, self::ALREADY_ANSWERED => 409,
            default => 422,
        };
    }
}
