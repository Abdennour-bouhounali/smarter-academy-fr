<?php

namespace App\Domain\DailyChallenge;

use App\Models\Classroom;
use App\Models\DailyChallengeClassSetting;
use App\Models\DailyChallengePolicy;
use App\Models\User;
use DomainException;
use Illuminate\Support\Arr;

/**
 * LA configuration du défi quotidien — le seul lecteur de
 * config/daily_challenge.php.
 *
 *   défauts        config/daily_challenge.php         (le dépôt)
 *   ↓ surchargés par
 *   administrateur daily_challenge_policies `global`  (écran « التحدّي اليومي »)
 *   ↓ précisés par
 *   enseignant     daily_challenge_class_settings     (une classe)
 *
 * Aucun contrôleur, aucun composant ne lit un barème ailleurs. Chaque défi
 * FIGE le résultat (`snapshot`) : changer le barème demain ne réécrit pas le
 * score d'hier.
 *
 * Singleton, mémo par requête.
 */
class DailyChallengeConfig
{
    /** Les clés que l'administrateur peut surcharger, et leur validation. */
    private const EDITABLE = [
        'challenge.enabled' => 'bool',
        'challenge.default_question_count' => 'int:1:20',
        'challenge.allowed_question_counts' => 'intlist:1:20',
        'challenge.attempt_window_minutes' => 'int:5:240',
        'challenge.available_from' => 'time',
        'challenge.available_until' => 'time',
        'challenge.challenge_weekdays' => 'intlist:1:7',
        'challenge.estimated_seconds_per_question' => 'int:10:600',
        'scoring.base_points' => 'int:1:1000',
        'scoring.partial_ratio' => 'float:0:1',
        'scoring.speed_tiers' => 'tiers',
        'scoring.max_speed_bonus' => 'int:0:1000',
        'scoring.min_plausible_ms' => 'int:0:60000',
        'scoring.streak_bonus.per_day' => 'int:0:1000',
        'scoring.streak_bonus.growth' => 'int:0:1000',
        'scoring.streak_bonus.max' => 'int:0:5000',
        'scoring.streak_bonus.min_correct' => 'int:0:20',
        'scoring.missed_day_penalty.enabled' => 'bool',
        'scoring.missed_day_penalty.per_day' => 'int:0:1000',
        'scoring.missed_day_penalty.max_days_per_gap' => 'int:0:60',
        'scoring.max_daily_score' => 'nullint:1:100000',
        'competition.class_challenge_enabled_by_default' => 'bool',
        'competition.class_competition_enabled_by_default' => 'bool',
        'competition.show_top3_by_default' => 'bool',
        'competition.show_results_to_class_by_default' => 'bool',
        'competition.show_own_rank_to_students' => 'bool',
    ];

    private ?array $global = null;

    /** @var array<int, array<string, mixed>> */
    private array $classCache = [];

    /** La configuration globale effective (défauts + surcharges admin). */
    public function global(): array
    {
        if ($this->global !== null) {
            return $this->global;
        }

        $config = config('daily_challenge');
        $overrides = DailyChallengePolicy::where('key', DailyChallengePolicy::GLOBAL_KEY)->value('values');
        $overrides = is_array($overrides) ? $overrides : (is_string($overrides) ? (json_decode($overrides, true) ?: []) : []);
        foreach (Arr::dot($overrides) as $key => $value) {
            // Une liste (paliers, jours) est une valeur entière, pas des feuilles.
            $root = $this->editableRoot($key);
            if ($root !== null) {
                Arr::set($config, $root, Arr::get($overrides, $root));
            }
        }

        return $this->global = $config;
    }

    /** Une valeur globale par clé pointée. */
    public function get(string $key, mixed $default = null): mixed
    {
        return Arr::get($this->global(), $key, $default);
    }

    /**
     * Les réglages de la classe, complétés par les défauts globaux.
     *
     * @return array{enabled: bool, competitionEnabled: bool, showTop3: bool, showResultsToClass: bool, questionCount: int, difficulty: ?string, lessonCodes: string[], learningPointCodes: string[], availableFrom: string, availableUntil: string, customized: bool}
     */
    public function forClassroom(Classroom $classroom): array
    {
        if (isset($this->classCache[$classroom->id])) {
            return $this->classCache[$classroom->id];
        }

        $row = DailyChallengeClassSetting::where('classroom_id', $classroom->id)->first();
        $g = $this->global();

        return $this->classCache[$classroom->id] = [
            'enabled' => $row?->enabled ?? (bool) $g['competition']['class_challenge_enabled_by_default'],
            'competitionEnabled' => $row?->competition_enabled ?? (bool) $g['competition']['class_competition_enabled_by_default'],
            'showTop3' => $row?->show_top3 ?? (bool) $g['competition']['show_top3_by_default'],
            'showResultsToClass' => $row?->show_results_to_class ?? (bool) $g['competition']['show_results_to_class_by_default'],
            'questionCount' => $this->clampCount($row?->question_count),
            'difficulty' => $row?->difficulty,
            'lessonCodes' => array_values($row?->lesson_codes ?? []),
            'learningPointCodes' => array_values($row?->learning_point_codes ?? []),
            'availableFrom' => $row?->available_from ?? $g['challenge']['available_from'],
            'availableUntil' => $row?->available_until ?? $g['challenge']['available_until'],
            'customized' => $row !== null,
        ];
    }

    /** Le nombre de questions ramené à une valeur autorisée. */
    public function clampCount(?int $count): int
    {
        $allowed = $this->get('challenge.allowed_question_counts', [5]);
        $default = (int) $this->get('challenge.default_question_count', 5);

        return $count !== null && in_array($count, $allowed, true) ? $count : $default;
    }

    /**
     * Ce qu'un défi fige au moment de sa génération.
     *
     * @param  array<string, mixed>|null  $class  forClassroom(), null pour un élève indépendant
     */
    public function snapshot(?array $class, int $questionCount): array
    {
        $g = $this->global();

        return [
            'questionCount' => $questionCount,
            'attemptWindowMinutes' => (int) $g['challenge']['attempt_window_minutes'],
            'timezone' => $g['challenge']['timezone'],
            'challengeWeekdays' => array_values($g['challenge']['challenge_weekdays']),
            'scoring' => $g['scoring'],
            'difficulty' => $class['difficulty'] ?? null,
            'lessonCodes' => $class['lessonCodes'] ?? [],
            'learningPointCodes' => $class['learningPointCodes'] ?? [],
        ];
    }

    public function timezone(): string
    {
        return (string) $this->get('challenge.timezone', 'Africa/Algiers');
    }

    // ── Administration ───────────────────────────────────────────────────────

    /** Ce que l'écran d'administration affiche : valeurs, défauts, surcharges. */
    public function adminView(): array
    {
        $defaults = config('daily_challenge');
        $effective = $this->global();
        $fields = [];
        foreach (self::EDITABLE as $key => $rule) {
            $fields[] = [
                'key' => $key,
                'type' => explode(':', $rule)[0],
                'value' => Arr::get($effective, $key),
                'default' => Arr::get($defaults, $key),
            ];
        }

        return [
            'fields' => $fields,
            'tieBreaking' => $effective['competition']['tie_breaking'],
            'timezone' => $effective['challenge']['timezone'],
            'updatedAt' => DailyChallengePolicy::where('key', DailyChallengePolicy::GLOBAL_KEY)->value('updated_at'),
        ];
    }

    /**
     * Enregistre des surcharges administrateur. Une clé inconnue ou une
     * valeur invalide refuse TOUT l'envoi (rien à moitié).
     *
     * @param  array<string, mixed>  $values  clé pointée → valeur ; null = revenir au défaut
     */
    public function updateGlobal(User $admin, array $values): array
    {
        $row = DailyChallengePolicy::firstOrNew(['key' => DailyChallengePolicy::GLOBAL_KEY]);
        $stored = is_array($row->values) ? $row->values : [];

        foreach ($values as $key => $value) {
            if (! array_key_exists($key, self::EDITABLE)) {
                throw new DomainException("Clé inconnue : {$key}");
            }
            if ($value === null && self::EDITABLE[$key] !== 'nullint:1:100000') {
                Arr::forget($stored, $key);

                continue;
            }
            Arr::set($stored, $key, $this->validate($key, self::EDITABLE[$key], $value));
        }

        // Cohérence d'ensemble, sur la configuration qui en résulterait.
        $merged = config('daily_challenge');
        foreach (self::EDITABLE as $key => $rule) {
            if (Arr::has($stored, $key)) {
                Arr::set($merged, $key, Arr::get($stored, $key));
            }
        }
        if (! in_array((int) $merged['challenge']['default_question_count'], array_map('intval', $merged['challenge']['allowed_question_counts']), true)) {
            throw new DomainException('Le nombre de questions par défaut doit faire partie des nombres autorisés.');
        }
        if ($merged['challenge']['available_from'] >= $merged['challenge']['available_until']) {
            throw new DomainException('La fenêtre quotidienne est vide.');
        }
        if ($merged['challenge']['challenge_weekdays'] === []) {
            throw new DomainException('Il faut au moins un jour de défi.');
        }

        $row->values = $stored;
        $row->updated_by = $admin->id;
        $row->save();

        $this->forget();

        return $this->adminView();
    }

    public function forget(): void
    {
        $this->global = null;
        $this->classCache = [];
    }

    private function editableRoot(string $dotKey): ?string
    {
        foreach (array_keys(self::EDITABLE) as $key) {
            if ($dotKey === $key || str_starts_with($dotKey, $key.'.')) {
                return $key;
            }
        }

        return null;
    }

    private function validate(string $key, string $rule, mixed $value): mixed
    {
        $parts = explode(':', $rule);
        $fail = fn () => throw new DomainException("Valeur invalide pour {$key}.");

        switch ($parts[0]) {
            case 'bool':
                return is_bool($value) ? $value : $fail();
            case 'int':
            case 'nullint':
                if ($value === null && $parts[0] === 'nullint') {
                    return null;
                }
                if (! is_int($value) && ! (is_string($value) && ctype_digit($value))) {
                    $fail();
                }
                $v = (int) $value;

                return $v >= (int) $parts[1] && $v <= (int) $parts[2] ? $v : $fail();
            case 'float':
                if (! is_numeric($value)) {
                    $fail();
                }
                $v = (float) $value;

                return $v >= (float) $parts[1] && $v <= (float) $parts[2] ? $v : $fail();
            case 'time':
                return is_string($value) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value) ? $value : $fail();
            case 'intlist':
                if (! is_array($value) || $value === []) {
                    $fail();
                }
                $list = [];
                foreach ($value as $v) {
                    if (! is_int($v) || $v < (int) $parts[1] || $v > (int) $parts[2]) {
                        $fail();
                    }
                    $list[] = $v;
                }
                $list = array_values(array_unique($list));
                sort($list);

                return $list;
            case 'tiers':
                if (! is_array($value) || count($value) > 12) {
                    $fail();
                }
                $tiers = [];
                $previous = 0;
                foreach (array_values($value) as $tier) {
                    $max = $tier['max_seconds'] ?? null;
                    $bonus = $tier['bonus'] ?? null;
                    if (! is_int($max) || ! is_int($bonus) || $max <= $previous || $bonus < 0 || $bonus > 1000) {
                        $fail();
                    }
                    $tiers[] = ['max_seconds' => $max, 'bonus' => $bonus];
                    $previous = $max;
                }
                // Plus lent ne rapporte jamais plus : les bonus décroissent.
                for ($i = 1; $i < count($tiers); $i++) {
                    if ($tiers[$i]['bonus'] > $tiers[$i - 1]['bonus']) {
                        throw new DomainException('Les bonus de vitesse doivent décroître avec le temps.');
                    }
                }

                return $tiers;
        }

        return $fail();
    }
}
