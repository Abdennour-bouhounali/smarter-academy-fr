<?php

namespace App\Domain\Madar;

/**
 * La borne d'une partie de « قنّاص القيم » (pure), et ses positions.
 *
 * Le calendrier est FIXE : la manche k commence à un instant connu, ses
 * `cards_per_round` cartes tombent à intervalle connu ; personne ne peut
 * l'accélérer. Le niveau s'adapte, mais monte d'AU PLUS une position par
 * manche. Pour une durée réelle T et une position de départ s0 :
 *
 *   manche atteinte  ≤ max { k : début(k) ≤ T }
 *   niveau manche k  ≤ niveau(s0 + k)
 *   score ≤ Σ cartes apparues  points(niveau) × multiplicateur max
 *         + Σ manches commencées bonus(niveau)
 *
 * puis × tolérance + marge. La position d'arrivée annoncée est ramenée dans
 * [s0 − échauffement − 3 × manches, s0 + manches] (s0 = la position de l'élève ;
 * l'échauffement descend sous s0 sans jamais le dépasser). Au-delà : ramené, signalé.
 * MIROIR de apps/web/src/features/madar/sniper/bound.js et adapt.js.
 */
class SniperScoring
{
    /** @param  array<string, mixed>  $c  config('madar.sniper') */
    public function __construct(private array $c) {}

    public function positions(): int
    {
        return (int) $this->c['levels'] * (int) $this->c['sub_levels'];
    }

    public function clampPosition(int $p): int
    {
        return max(0, min($this->positions() - 1, $p));
    }

    /** Le niveau (1…50) d'une position (0…149). */
    public function levelOf(int $position): int
    {
        return intdiv($this->clampPosition($position), (int) $this->c['sub_levels']) + 1;
    }

    /** Le sous-niveau (1…3) d'une position. */
    public function subOf(int $position): int
    {
        return ($this->clampPosition($position) % (int) $this->c['sub_levels']) + 1;
    }

    public function positionOf(int $level, int $sub = 1): int
    {
        return $this->clampPosition(($level - 1) * (int) $this->c['sub_levels'] + ($sub - 1));
    }

    /** Le niveau d'entrée d'une année (« 4am » → 32) ; 1 par défaut. */
    public function entryLevel(?string $grade): int
    {
        return (int) (((array) $this->c['entry'])[strtolower((string) $grade)] ?? 1);
    }

    public function warmupDrop(): int
    {
        return (int) ($this->c['warmup_drop'] ?? 0);
    }

    public function perHit(int $level): int
    {
        return (int) $this->c['points_base'] + (int) $this->c['points_step'] * ($level - 1);
    }

    public function gap(int $k): float
    {
        return max((float) $this->c['gap_min'], (float) $this->c['gap_start'] - (float) $this->c['gap_step'] * $k);
    }

    public function fall(int $k): float
    {
        return max((float) $this->c['fall_min'], (float) $this->c['fall_start'] - (float) $this->c['fall_step'] * $k);
    }

    /** L'instant (s) où commence la manche k. */
    public function roundStart(int $k): float
    {
        $t = (float) $this->c['first_at'];
        $n = (int) $this->c['cards_per_round'];
        for ($j = 0; $j < $k; $j++) {
            $t += ($n - 1) * $this->gap($j) + $this->fall($j) + (float) $this->c['breather'];
        }

        return $t;
    }

    /** Le nombre de manches commencées en T ms. */
    public function maxRound(int $durationMs): int
    {
        $t = max(0, $durationMs) / 1000;
        $k = 0;
        while ($k < 1000 && $this->roundStart($k) <= $t) {
            $k++;
        }

        return $k;
    }

    public function perfectScore(int $durationMs, int $start = 0): int
    {
        $t = max(0, $durationMs) / 1000;
        $n = (int) $this->c['cards_per_round'];
        $max = (int) $this->c['max_multiplier'];
        $score = 0;
        for ($k = 0; $k < 1000 && ($begin = $this->roundStart($k)) <= $t; $k++) {
            $level = $this->levelOf($start + $k);
            for ($j = 0; $j < $n && $begin + $j * $this->gap($k) <= $t; $j++) {
                $score += $this->perHit($level) * $max;
            }
            $score += (int) $this->c['bonus_factor'] * $this->perHit($level);
        }

        return $score;
    }

    public function maxPlausible(int $durationMs, int $start = 0): int
    {
        return (int) ceil($this->perfectScore($durationMs, $start) * (float) ($this->c['tolerance'] ?? 1.1)) + (int) ($this->c['slack'] ?? 100);
    }

    /**
     * @return array{score: int, wave: int, position: int, peak: int, flagged: bool}
     *               `wave` = la manche atteinte ; `position` / `peak` = d'arrivée / la plus haute
     */
    public function settle(int $claimed, int $claimedRound, int $durationMs, int $start = 0, ?int $claimedPosition = null, ?int $claimedPeak = null): array
    {
        $bound = $this->maxPlausible($durationMs, $start);
        $maxRound = $this->maxRound($durationMs);
        $claimed = max(0, $claimed);
        $round = min(max(0, $claimedRound), $maxRound);
        // Les positions bougent à la CLÔTURE d'une manche : au plus `round` clôtures.
        $high = $this->clampPosition($start + $round);
        // L'échauffement commence `warmup_drop` positions plus bas (sniper/adapt.js).
        $low = $this->clampPosition($start - $this->warmupDrop() - (int) $this->c['max_drop_per_round'] * $round);
        $position = $claimedPosition ?? $start;
        $peak = max($claimedPeak ?? $start, $position, $start);
        $clampedPosition = max($low, min($high, $position));
        $clampedPeak = max($clampedPosition, min($high, $peak));

        return [
            'score' => min($claimed, $bound),
            'wave' => $round,
            'position' => $clampedPosition,
            'peak' => $clampedPeak,
            'flagged' => $claimed > $bound || $claimedRound > $maxRound || $position !== $clampedPosition || $peak !== $clampedPeak,
        ];
    }
}
