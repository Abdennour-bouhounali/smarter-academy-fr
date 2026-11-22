<?php

namespace App\Domain\Progress\Support;

use App\Domain\Progress\Outcome;
use Illuminate\Contracts\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * LA définition du taux de réussite — une seule, pour le dossier, la classe,
 * l'administration et le bilan de pratique.
 *
 *   taux = réussites / (réussites + partiels + échecs)
 *
 *   réussites = correct + equivalent_correct
 *   partiels  = partially_correct
 *   échecs    = incorrect
 *   inertes   = syntax_error + abandoned — visibles, hors dénominateur
 *
 * `null`, et non 0, quand rien n'a été répondu : « aucune donnée » et « 0 % de
 * réussite » ne disent pas la même chose.
 */
final class OutcomeStats
{
    /**
     * Ajoute à la requête les cinq agrégats (successes, partials, failures,
     * inert, answered) sur la colonne d'issue donnée. La requête reste libre
     * de ses jointures, de son `where` et de son `groupBy`.
     */
    public static function selectInto(EloquentBuilder|QueryBuilder $query, string $column = 'question_attempts.outcome'): EloquentBuilder|QueryBuilder
    {
        $s = Outcome::successValues();

        return $query
            ->selectRaw("SUM(CASE WHEN {$column} IN (?, ?) THEN 1 ELSE 0 END) as successes", $s)
            ->selectRaw("SUM(CASE WHEN {$column} = ? THEN 1 ELSE 0 END) as partials", [Outcome::PartiallyCorrect->value])
            ->selectRaw("SUM(CASE WHEN {$column} = ? THEN 1 ELSE 0 END) as failures", [Outcome::Incorrect->value])
            ->selectRaw("SUM(CASE WHEN {$column} IN (?, ?) THEN 1 ELSE 0 END) as inert", [Outcome::SyntaxError->value, Outcome::Abandoned->value])
            ->selectRaw("SUM(CASE WHEN {$column} IS NOT NULL THEN 1 ELSE 0 END) as answered");
    }

    /** Le taux, en pourcentage arrondi à une décimale ; `null` sans dénominateur. */
    public static function rate(int $successes, int $partials, int $failures): ?float
    {
        $denominator = $successes + $partials + $failures;

        return $denominator > 0 ? round($successes / $denominator * 100, 1) : null;
    }

    /**
     * @param  object|array|null  $row  une ligne produite par selectInto()
     * @return array{successes: int, partials: int, failures: int, inert: int, answered: int, successRate: ?float}
     */
    public static function fromRow(object|array|null $row): array
    {
        $get = fn (string $k) => (int) (is_array($row) ? ($row[$k] ?? 0) : ($row?->{$k} ?? 0));
        $s = $get('successes');
        $p = $get('partials');
        $f = $get('failures');

        return [
            'successes' => $s,
            'partials' => $p,
            'failures' => $f,
            'inert' => $get('inert'),
            'answered' => $get('answered'),
            'successRate' => self::rate($s, $p, $f),
        ];
    }

    /**
     * Depuis une carte issue → nombre (un `GROUP BY outcome` déjà agrégé).
     *
     * @param  array<string, int|string>  $countsByOutcome
     * @return array{successes: int, partials: int, failures: int, inert: int, answered: int, successRate: ?float}
     */
    public static function fromCounts(array $countsByOutcome): array
    {
        $counts = ['successes' => 0, 'partials' => 0, 'failures' => 0, 'inert' => 0, 'answered' => 0];
        foreach ($countsByOutcome as $raw => $n) {
            $outcome = Outcome::tryFrom((string) $raw);
            if ($outcome === null) {
                continue;
            }
            $n = (int) $n;
            $counts['answered'] += $n;
            match (true) {
                $outcome->isSuccess() => $counts['successes'] += $n,
                $outcome->isPartial() => $counts['partials'] += $n,
                $outcome->isFailure() => $counts['failures'] += $n,
                default => $counts['inert'] += $n,
            };
        }

        return $counts + ['successRate' => self::rate($counts['successes'], $counts['partials'], $counts['failures'])];
    }

    /**
     * La même chose depuis une liste d'issues déjà en mémoire (bilan de séance).
     *
     * @param  iterable<?string>  $outcomes
     * @return array{successes: int, partials: int, failures: int, inert: int, answered: int, successRate: ?float}
     */
    public static function fromOutcomes(iterable $outcomes): array
    {
        $counts = ['successes' => 0, 'partials' => 0, 'failures' => 0, 'inert' => 0, 'answered' => 0];
        foreach ($outcomes as $raw) {
            if ($raw === null || $raw === '') {
                continue;
            }
            $outcome = Outcome::tryFrom((string) $raw);
            if ($outcome === null) {
                continue;
            }
            $counts['answered']++;
            match (true) {
                $outcome->isSuccess() => $counts['successes']++,
                $outcome->isPartial() => $counts['partials']++,
                $outcome->isFailure() => $counts['failures']++,
                default => $counts['inert']++,
            };
        }

        return $counts + ['successRate' => self::rate($counts['successes'], $counts['partials'], $counts['failures'])];
    }
}
