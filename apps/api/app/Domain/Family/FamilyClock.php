<?php

namespace App\Domain\Family;

use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * Le jour et la semaine de l'espace parent, comptés à Alger. La semaine
 * commence le DIMANCHE, comme la semaine scolaire algérienne.
 */
class FamilyClock
{
    public static function timezone(): string
    {
        return (string) config('family.timezone', 'Africa/Algiers');
    }

    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::instance(Carbon::now())->setTimezone(self::timezone());
    }

    public static function today(): string
    {
        return self::now()->toDateString();
    }

    /** Le dimanche (Alger, 00:00) de la semaine qui précède de `$weeksBack` la semaine en cours. */
    public static function weekStart(int $weeksBack = 0, ?CarbonImmutable $now = null): CarbonImmutable
    {
        $local = ($now ?? self::now())->setTimezone(self::timezone())->startOfDay();

        return $local->subDays($local->dayOfWeek)->subWeeks($weeksBack);
    }
}
