<?php

namespace App\Domain\Progress\Support;

use Illuminate\Support\Carbon;

/**
 * La FRAÎCHEUR d'un état — dérivée à la lecture, jamais stockée, sans effet
 * sur la confiance (D7). « Maîtrisé il y a trois mois » reste maîtrisé ; on
 * le dit, on ne le dégrade pas.
 */
final class Freshness
{
    public const FRESH = 'fresh';

    public const AGING = 'aging';

    public const STALE = 'stale';

    public static function of(Carbon|string|null $lastEvidenceAt, ?Carbon $now = null): string
    {
        if ($lastEvidenceAt === null) {
            return self::STALE;
        }
        $now ??= Carbon::now();
        $at = $lastEvidenceAt instanceof Carbon ? $lastEvidenceAt : Carbon::parse($lastEvidenceAt);
        $days = $at->diffInDays($now);

        if ($days <= (int) config('mastery.freshness.fresh_days', 21)) {
            return self::FRESH;
        }
        if ($days <= (int) config('mastery.freshness.stale_days', 60)) {
            return self::AGING;
        }

        return self::STALE;
    }

    /** Le seuil « périmé » comme date, pour les requêtes agrégées. */
    public static function staleCutoff(?Carbon $now = null): Carbon
    {
        return ($now ?? Carbon::now())->copy()->subDays((int) config('mastery.freshness.stale_days', 60));
    }
}
