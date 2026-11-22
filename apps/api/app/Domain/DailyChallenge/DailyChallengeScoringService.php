<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Progress\Outcome;

/**
 * Le BARÈME du défi quotidien — fonctions pures d'une configuration figée
 * (le `scoring` du config_snapshot du défi). Aucune requête, aucune horloge :
 * mêmes entrées, même score.
 *
 * La règle qui gouverne tout : LA JUSTESSE DOMINE.
 *
 *   - une réponse fausse vaut 0, jamais un nombre négatif ;
 *   - une réponse juste vaut `base_points`, plus un bonus de vitesse ;
 *   - le bonus de vitesse est PAR PALIERS et plafonné — jamais 100 / secondes ;
 *   - et, sur une journée entière, la somme des bonus de vitesse ne peut
 *     JAMAIS égaler une bonne réponse de plus : pour n questions, les paliers
 *     sont réduits d'un facteur tel que (n − 1) × bonus_max < base_points.
 *     Donc 5/5 lentement bat toujours 4/5 à toute vitesse.
 *
 * Le temps de réponse arrive du SERVEUR (started_at → submitted_at).
 */
class DailyChallengeScoringService
{
    /**
     * @param  array<string, mixed>  $scoring
     * @return array{base: int, speed: int, total: int}
     */
    public function calculateQuestionScore(string $outcome, ?int $responseTimeMs, int $questionCount, array $scoring): array
    {
        $o = Outcome::tryFrom($outcome);
        if ($o === null || ! $o->isPositive()) {
            return ['base' => 0, 'speed' => 0, 'total' => 0];
        }

        $basePoints = (int) $scoring['base_points'];
        if ($o->isPartial()) {
            $base = (int) floor($basePoints * (float) $scoring['partial_ratio']);

            return ['base' => $base, 'speed' => 0, 'total' => $base];
        }

        $speed = $this->speedBonus($responseTimeMs, $questionCount, $scoring);

        return ['base' => $basePoints, 'speed' => $speed, 'total' => $basePoints + $speed];
    }

    /** Le bonus de vitesse d'une réponse JUSTE. */
    public function speedBonus(?int $responseTimeMs, int $questionCount, array $scoring): int
    {
        if ($responseTimeMs === null || $responseTimeMs < (int) ($scoring['min_plausible_ms'] ?? 0)) {
            return 0;
        }

        $raw = 0;
        foreach ($scoring['speed_tiers'] ?? [] as $tier) {
            if ($responseTimeMs <= (int) $tier['max_seconds'] * 1000) {
                $raw = (int) $tier['bonus'];
                break;
            }
        }
        $raw = min($raw, (int) $scoring['max_speed_bonus']);

        return (int) floor($raw * $this->speedScale($questionCount, $scoring));
    }

    /**
     * Le facteur qui garantit « une bonne réponse de plus bat toute vitesse »
     * pour un défi de n questions : (n − 1) × bonus_max × facteur < base.
     */
    public function speedScale(int $questionCount, array $scoring): float
    {
        $maxBonus = min((int) $scoring['max_speed_bonus'], $this->maxTierBonus($scoring));
        if ($maxBonus <= 0 || $questionCount <= 1) {
            return 1.0;
        }
        $budget = ((int) $scoring['base_points'] - 1) / (($questionCount - 1) * $maxBonus);

        return min(1.0, $budget);
    }

    /** Le plus gros bonus effectivement versé pour n questions (affichage « + possible »). */
    public function maxSpeedBonusFor(int $questionCount, array $scoring): int
    {
        $maxBonus = min((int) $scoring['max_speed_bonus'], $this->maxTierBonus($scoring));

        return (int) floor($maxBonus * $this->speedScale($questionCount, $scoring));
    }

    /**
     * Le score d'une journée : questions + bonus de série, plafonné.
     *
     * @param  array<int, array{base: int, speed: int}>  $questionScores
     * @return array{base: int, speed: int, streak: int, total: int}
     */
    public function calculateChallengeScore(array $questionScores, int $streakBonus, array $scoring): array
    {
        $base = array_sum(array_column($questionScores, 'base'));
        $speed = array_sum(array_column($questionScores, 'speed'));
        $total = $base + $speed + $streakBonus;

        $cap = $scoring['max_daily_score'] ?? null;
        if ($cap !== null) {
            $total = min($total, (int) $cap);
        }

        return ['base' => $base, 'speed' => $speed, 'streak' => $streakBonus, 'total' => $total];
    }

    /**
     * Le bonus de régularité d'une journée où la série atteint $streak.
     * Versé seulement avec assez de bonnes réponses : on récompense la
     * régularité d'un travail, pas une présence au hasard.
     */
    public function calculateContinuityBonus(int $streak, int $correctCount, array $scoring): int
    {
        $s = $scoring['streak_bonus'];
        if ($streak < 1 || $correctCount < (int) $s['min_correct']) {
            return 0;
        }

        return min((int) $s['max'], (int) $s['per_day'] + (int) $s['growth'] * ($streak - 1));
    }

    /**
     * Ce que coûtent $missedDays jours de défi manqués d'UNE absence.
     * Décroissance contrôlée : au plus `max_days_per_gap` jours comptés.
     */
    public function calculateMissedDayAdjustment(int $missedDays, array $scoring): int
    {
        $p = $scoring['missed_day_penalty'];
        if (! ($p['enabled'] ?? false) || $missedDays <= 0) {
            return 0;
        }

        return min($missedDays, (int) $p['max_days_per_gap']) * (int) $p['per_day'];
    }

    /** Le cumul après une journée : jamais sous zéro. */
    public function calculateCumulativeScore(int $previous, int $dailyScore, int $penalty): int
    {
        return max(0, $previous - $penalty) + $dailyScore;
    }

    /** Le maximum atteignable d'un défi (affiché « + possible »). */
    public function maxPossible(int $questionCount, int $streak, array $scoring): int
    {
        $perQuestion = (int) $scoring['base_points'] + $this->maxSpeedBonusFor($questionCount, $scoring);
        $total = $perQuestion * $questionCount + $this->calculateContinuityBonus($streak, $questionCount, $scoring);
        $cap = $scoring['max_daily_score'] ?? null;

        return $cap !== null ? min($total, (int) $cap) : $total;
    }

    private function maxTierBonus(array $scoring): int
    {
        $max = 0;
        foreach ($scoring['speed_tiers'] ?? [] as $tier) {
            $max = max($max, (int) $tier['bonus']);
        }

        return $max;
    }
}
