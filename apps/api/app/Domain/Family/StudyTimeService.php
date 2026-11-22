<?php

namespace App\Domain\Family;

use App\Models\StudyTimeDay;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Le TEMPS RÉEL d'étude (PARENT_SPACE.md §3).
 *
 * Le client mesure (features/studyTime/studyClock.js) : actif = page visible,
 * fenêtre au premier plan, un geste depuis moins d'une minute ; inactif = page
 * visible sans geste ; ailleurs = page cachée ou fenêtre quittée. Il envoie ses
 * compteurs par battements. Le serveur ne croit pas un battement sur parole :
 * un battement ne couvre jamais plus de temps qu'il ne s'en est écoulé depuis
 * le précédent (+ une marge), ni plus de `heartbeat_max_seconds`, et chaque
 * compteur d'une journée est plafonné.
 */
class StudyTimeService
{
    private const SLACK_SECONDS = 15;

    /**
     * @param  array<int, array{surface: string, active: int, idle: int, away: int, leaves: int}>  $segments
     * @return array{recorded: int}
     */
    public function record(User $student, array $segments): array
    {
        $budget = $this->budget($student);
        $claimed = array_sum(array_map(fn ($s) => $s['active'] + $s['idle'] + $s['away'], $segments));
        $ratio = $claimed > $budget && $claimed > 0 ? $budget / $claimed : 1.0;

        $day = FamilyClock::today();
        $cap = (int) config('family.day_max_seconds', 16 * 3600);
        $recorded = 0;

        DB::transaction(function () use ($student, $segments, $ratio, $day, $cap, &$recorded) {
            foreach ($this->merge($segments) as $surface => $s) {
                $row = StudyTimeDay::query()
                    ->where('user_id', $student->id)->where('day', $day)->where('surface', $surface)
                    ->lockForUpdate()->first()
                    ?? new StudyTimeDay(['user_id' => $student->id, 'day' => $day, 'surface' => $surface]);

                foreach (['active', 'idle', 'away'] as $k) {
                    $add = (int) floor($s[$k] * $ratio);
                    $col = "{$k}_seconds";
                    $before = (int) $row->{$col};
                    $row->{$col} = min($cap, $before + $add);
                    $recorded += $row->{$col} - $before;
                }
                $row->leave_count = min(1000, (int) $row->leave_count + min(30, $s['leaves']));
                $row->save();
            }
        });

        return ['recorded' => $recorded];
    }

    /** Le temps qu'un battement peut couvrir : l'écoulé depuis le précédent, borné. */
    private function budget(User $student): int
    {
        $max = (int) config('family.heartbeat_max_seconds', 180);
        $key = "study-time:last:{$student->id}";
        $now = time();
        $last = Cache::get($key);
        Cache::put($key, $now, now()->addHours(2));

        if ($last === null) {
            return $max;
        }

        return max(0, min($max, $now - (int) $last + self::SLACK_SECONDS));
    }

    /** @return array<string, array{active: int, idle: int, away: int, leaves: int}> */
    private function merge(array $segments): array
    {
        $out = [];
        foreach ($segments as $s) {
            $k = $s['surface'];
            $out[$k] ??= ['active' => 0, 'idle' => 0, 'away' => 0, 'leaves' => 0];
            foreach (['active', 'idle', 'away', 'leaves'] as $f) {
                $out[$k][$f] += (int) $s[$f];
            }
        }

        return $out;
    }
}
