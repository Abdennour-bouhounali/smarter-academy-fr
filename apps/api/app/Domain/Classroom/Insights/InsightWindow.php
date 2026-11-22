<?php

namespace App\Domain\Classroom\Insights;

use Illuminate\Support\Carbon;

/**
 * « Récemment », pour un professeur : N jours pleins, comptés dans le fuseau
 * de l'école (config('app.school_timezone')), rendus en UTC pour les requêtes.
 *
 * Minuit à Paris est 23 h ou 22 h UTC la veille : une fenêtre découpée en UTC
 * rangerait la première heure du jour dans le mauvais jour. Le stockage reste
 * en UTC ; seul le découpage est local.
 */
final class InsightWindow
{
    public function __construct(
        public readonly int $days,
        public readonly Carbon $from,
        public readonly Carbon $now,
    ) {}

    public static function recent(?int $days = null, ?Carbon $now = null): self
    {
        $days ??= (int) config('teacher_insights.window_days', 14);
        $now = ($now ?? Carbon::now())->copy()->utc();
        $from = $now->copy()->setTimezone(self::timezone())->startOfDay()->subDays($days - 1)->utc();

        return new self($days, $from, $now);
    }

    public static function timezone(): string
    {
        return (string) config('app.school_timezone');
    }

    /**
     * Les fins de semaine (du lundi au dimanche, la semaine de l'école), de
     * la plus ancienne à la plus récente, la dernière étant « maintenant ».
     * En UTC.
     *
     * @return Carbon[]
     */
    public static function weekEnds(int $weeks, ?Carbon $now = null): array
    {
        $now = ($now ?? Carbon::now())->copy()->utc();
        $local = $now->copy()->setTimezone(self::timezone());
        $weekStart = $local->copy()->startOfDay();
        while ($weekStart->dayOfWeek !== Carbon::MONDAY) {
            $weekStart->subDay();
        }

        $ends = [];
        for ($i = $weeks - 1; $i >= 1; $i--) {
            $ends[] = $weekStart->copy()->subWeeks($i - 1)->subSecond()->utc();
        }
        $ends[] = $now;

        return $ends;
    }

    /** @return array{days: int, from: string, to: string, timezone: string} */
    public function toArray(): array
    {
        return [
            'days' => $this->days,
            'from' => $this->from->toIso8601String(),
            'to' => $this->now->toIso8601String(),
            'timezone' => self::timezone(),
        ];
    }
}
