<?php

namespace App\Domain\Madar;

use App\Models\Classroom;
use App\Models\MadarClassSetting;
use App\Models\MadarItemTimeLimit;
use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * La SEULE lecture de la configuration de « مدار » : les défauts de
 * config/madar.php, affinés par la classe (madar_class_settings).
 */
class MadarConfig
{
    /** @var array<int, array<string, mixed>> */
    private array $classCache = [];

    public function get(string $key, mixed $default = null): mixed
    {
        return config("madar.{$key}", $default);
    }

    public function enabled(): bool
    {
        return (bool) $this->get('enabled', true);
    }

    public function maxHearts(): int
    {
        return max(1, (int) $this->get('hearts.max', 5));
    }

    /** @return array<string, float|int> config('madar.defense') */
    public function defense(): array
    {
        return (array) $this->get('defense', []);
    }

    /** @return array<string, mixed> config('madar.odd') */
    public function odd(): array
    {
        return (array) $this->get('odd', []);
    }

    /** @return array<string, float|int> config('madar.sniper') */
    public function sniper(): array
    {
        return (array) $this->get('sniper', []);
    }

    /** @return array<string, float|int> */
    public function physics(): array
    {
        return (array) $this->get('physics', []);
    }

    public function now(?Carbon $now = null): CarbonImmutable
    {
        return CarbonImmutable::instance($now ?? Carbon::now())->setTimezone((string) $this->get('timezone', 'Africa/Algiers'));
    }

    /** Le jour (Alger) — celui des cœurs quotidiens et de la limite de parties. */
    public function today(): string
    {
        return $this->now()->format('Y-m-d');
    }

    /** Le dimanche (Alger) de la semaine d'une date : la saison du classement. */
    public function weekStart(?string $date = null): string
    {
        $tz = (string) $this->get('timezone', 'Africa/Algiers');
        $day = $date !== null ? CarbonImmutable::parse($date, $tz) : $this->now();

        return $day->startOfWeek(CarbonImmutable::SUNDAY)->format('Y-m-d');
    }

    /**
     * Les réglages effectifs d'une classe (ou d'un élève indépendant : null).
     *
     * @return array{enabled: bool, disabledGames: string[], competitionEnabled: bool, dailyFreeHearts: int, dailyRunCap: int, lessonCodes: string[], timeLimits: array<string, int>, customized: bool}
     */
    public function forClassroom(?Classroom $classroom): array
    {
        $defaults = [
            'enabled' => true,
            'disabledGames' => [],
            'competitionEnabled' => false,
            'dailyFreeHearts' => (int) $this->get('hearts.daily_free', 3),
            'dailyRunCap' => (int) $this->get('runs.daily_cap', 30),
            'lessonCodes' => [],
            'timeLimits' => $this->defaultTimeLimits(),
            'customized' => false,
        ];
        if ($classroom === null) {
            return $defaults;
        }
        if (isset($this->classCache[$classroom->id])) {
            return $this->classCache[$classroom->id];
        }

        $row = MadarClassSetting::where('classroom_id', $classroom->id)->first();

        return $this->classCache[$classroom->id] = [
            'enabled' => $row?->enabled ?? true,
            'disabledGames' => array_values($row?->disabled_games ?? []),
            'competitionEnabled' => $row?->competition_enabled ?? true,
            'dailyFreeHearts' => min($this->maxHearts(), $row?->daily_free_hearts ?? $defaults['dailyFreeHearts']),
            'dailyRunCap' => $row?->daily_run_cap ?? $defaults['dailyRunCap'],
            'lessonCodes' => array_values($row?->lesson_codes ?? []),
            'timeLimits' => $this->mergeTimeLimits($row?->time_limits),
            'customized' => $row !== null,
        ];
    }

    /** @return array<string, int> secondes par difficulté « 1 » … « 5 » */
    public function defaultTimeLimits(): array
    {
        $out = [];
        foreach ((array) $this->get('refuel.time_limits', []) as $d => $s) {
            $out[(string) $d] = (int) $s;
        }

        return $out;
    }

    /** @return array<string, int> */
    private function mergeTimeLimits(?array $class): array
    {
        $limits = $this->defaultTimeLimits();
        foreach ($class ?? [] as $d => $s) {
            if (isset($limits[(string) $d]) && is_numeric($s)) {
                $limits[(string) $d] = $this->clampLimit((int) $s);
            }
        }

        return $limits;
    }

    public function clampLimit(int $seconds): int
    {
        [$min, $max] = $this->get('refuel.time_limit_range', [15, 600]);

        return max((int) $min, min((int) $max, $seconds));
    }

    /**
     * Le délai d'une question : celui que l'enseignant a posé pour CET item
     * dans sa classe, sinon celui de la classe pour sa difficulté, sinon le
     * défaut de la difficulté.
     */
    public function timeLimitFor(?Classroom $classroom, string $itemKey, ?int $difficulty): int
    {
        if ($classroom !== null) {
            $override = MadarItemTimeLimit::where('classroom_id', $classroom->id)->where('item_key', $itemKey)->value('seconds');
            if ($override !== null) {
                return $this->clampLimit((int) $override);
            }
        }
        $limits = $this->forClassroom($classroom)['timeLimits'];

        return (int) ($limits[(string) $difficulty] ?? $this->get('refuel.default_time_limit', 90));
    }

    public function forget(): void
    {
        $this->classCache = [];
    }
}
