<?php

namespace App\Domain\Family;

use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * Le jour et la semaine de l'espace parent, comptés dans le fuseau de
 * l'école. La semaine commence le LUNDI, comme la semaine scolaire.
 */
class FamilyClock
{
    public static function timezone(): string
    {
        return (string) config('app.school_timezone');
    }

    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::instance(Carbon::now())->setTimezone(self::timezone());
    }

    public static function today(): string
    {
        return self::now()->toDateString();
    }

    /** Le lundi (00:00, fuseau de l'école) de la semaine qui précède de `$weeksBack` la semaine en cours. */
    public static function weekStart(int $weeksBack = 0, ?CarbonImmutable $now = null): CarbonImmutable
    {
        $local = ($now ?? self::now())->setTimezone(self::timezone())->startOfDay();

        return $local->startOfWeek(CarbonImmutable::MONDAY)->subWeeks($weeksBack);
    }
}
