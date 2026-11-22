<?php

namespace App\Domain\DailyChallenge;

use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * Le CALENDRIER du défi : quel jour sommes-nous (à Alger, pas en UTC),
 * quels jours sont des jours de défi, combien en a-t-on manqué.
 *
 * Un jour hors de `challenge_weekdays` (le vendredi par défaut) n'existe pas
 * pour la série : il ne la casse pas et ne coûte rien.
 *
 * Pur : l'instant « maintenant » est passé en argument ou lu une fois.
 */
final class ChallengeCalendar
{
    /** @param  int[]  $weekdays  ISO-8601, 1 = lundi … 7 = dimanche */
    public function __construct(private string $timezone, private array $weekdays) {}

    public static function fromConfig(DailyChallengeConfig $config): self
    {
        return new self($config->timezone(), array_map('intval', $config->get('challenge.challenge_weekdays', [1, 2, 3, 4, 5, 6, 7])));
    }

    /** @param  array<string, mixed>  $snapshot  config_snapshot d'un défi */
    public static function fromSnapshot(array $snapshot): self
    {
        return new self($snapshot['timezone'] ?? 'Africa/Algiers', array_map('intval', $snapshot['challengeWeekdays'] ?? [1, 2, 3, 4, 5, 6, 7]));
    }

    public function now(?Carbon $now = null): CarbonImmutable
    {
        return CarbonImmutable::instance($now ?? Carbon::now())->setTimezone($this->timezone);
    }

    /** La date du défi « d'aujourd'hui », Y-m-d, heure locale. */
    public function today(?Carbon $now = null): string
    {
        return $this->now($now)->format('Y-m-d');
    }

    public function isChallengeDay(string $date): bool
    {
        return in_array(CarbonImmutable::parse($date, $this->timezone)->dayOfWeekIso, $this->weekdays, true);
    }

    /** Le dernier jour de défi STRICTEMENT avant $date (au plus 14 jours en arrière). */
    public function previousChallengeDay(string $date): ?string
    {
        $d = CarbonImmutable::parse($date, $this->timezone);
        for ($i = 1; $i <= 14; $i++) {
            $candidate = $d->subDays($i)->format('Y-m-d');
            if ($this->isChallengeDay($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /** Le nombre de jours de défi STRICTEMENT entre $from et $to. */
    public function challengeDaysBetween(string $from, string $to): int
    {
        $a = CarbonImmutable::parse($from, $this->timezone)->startOfDay();
        $b = CarbonImmutable::parse($to, $this->timezone)->startOfDay();
        if ($b->lessThanOrEqualTo($a)) {
            return 0;
        }
        $count = 0;
        // Borné : au-delà d'une année, le nombre exact ne change plus rien
        // (la pénalité est plafonnée par absence).
        for ($d = $a->addDay(), $n = 0; $d->lessThan($b) && $n < 366; $d = $d->addDay(), $n++) {
            if (in_array($d->dayOfWeekIso, $this->weekdays, true)) {
                $count++;
            }
        }

        return $count;
    }

    /** La fenêtre quotidienne est-elle ouverte à cet instant ? */
    public function windowOpen(string $from, string $until, ?Carbon $now = null): bool
    {
        $hm = $this->now($now)->format('H:i');

        return $hm >= $from && $hm <= $until;
    }

    /**
     * La série qui ARRIVE à $date : combien de jours de défi consécutifs
     * juste avant $date ont été joués.
     *
     * @param  array<string, true>  $playedDates  dates jouées (Y-m-d)
     */
    public function streakEndingBefore(string $date, array $playedDates): int
    {
        $streak = 0;
        $cursor = $this->previousChallengeDay($date);
        while ($cursor !== null && isset($playedDates[$cursor]) && $streak < 1000) {
            $streak++;
            $cursor = $this->previousChallengeDay($cursor);
        }

        return $streak;
    }

    /**
     * Les $n derniers jours calendaires jusqu'à $date incluse, pour la frise.
     *
     * @return array<int, array{date: string, weekday: int, challengeDay: bool}>
     */
    public function lastDays(string $date, int $n): array
    {
        $end = CarbonImmutable::parse($date, $this->timezone);
        $out = [];
        for ($i = $n - 1; $i >= 0; $i--) {
            $d = $end->subDays($i);
            $out[] = ['date' => $d->format('Y-m-d'), 'weekday' => $d->dayOfWeekIso, 'challengeDay' => in_array($d->dayOfWeekIso, $this->weekdays, true)];
        }

        return $out;
    }
}
