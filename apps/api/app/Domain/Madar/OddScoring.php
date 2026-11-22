<?php

namespace App\Domain\Madar;

/**
 * La borne d'une partie de « الدخيل » (pure).
 *
 * Une énigme = 4 ou 5 cartes, toutes égales sauf UNE. Après chaque choix, le
 * jeu montre la réponse pendant `reveal_ms` : une énigme ne se résout pas plus
 * vite que `min_puzzle_ms`. Le niveau s'adapte par manche de `puzzles_per_round`
 * énigmes et monte d'AU PLUS une position par manche. Pour une durée réelle T
 * et une position de départ s0 :
 *
 *   énigmes        ≤ ⌊T / min_puzzle_ms⌋ + 1
 *   manches        ≤ ⌊énigmes / puzzles_per_round⌋
 *   niveau énigme i ≤ niveau(s0 + ⌊i / puzzles_per_round⌋)
 *   score ≤ Σ énigmes points(niveau) × multiplicateur max + Σ manches bonus(niveau)
 *
 * puis × tolérance + marge. Les positions (niveaux, entrée par année, points)
 * sont celles de SniperScoring : les jeux de mathématiques partagent leurs 50
 * positions. MIROIR de apps/web/src/features/madar/odd/bound.js — et, avec
 * config('madar.mental') (énigme = problème, `speed_factor`), de mental/bound.js.
 */
class OddScoring
{
    /**
     * @param  array<string, mixed>  $c  config('madar.odd')
     */
    public function __construct(private array $c, private SniperScoring $levels) {}

    public function maxPuzzles(int $durationMs): int
    {
        return intdiv(max(0, $durationMs), max(1, (int) $this->c['min_puzzle_ms'])) + 1;
    }

    public function maxRounds(int $durationMs): int
    {
        return intdiv($this->maxPuzzles($durationMs), max(1, (int) $this->c['puzzles_per_round']));
    }

    public function perfectScore(int $durationMs, int $start = 0): int
    {
        $per = max(1, (int) $this->c['puzzles_per_round']);
        $max = (int) $this->c['max_multiplier'];
        $score = 0;
        $n = $this->maxPuzzles($durationMs);
        for ($i = 0; $i < $n; $i++) {
            $level = $this->levels->levelOf($start + intdiv($i, $per));
            // « الحساب الذهني » ajoute un bonus de vitesse d'au plus `speed_factor` × points.
            $score += $this->levels->perHit($level) * ($max + (int) ($this->c['speed_factor'] ?? 0));
            if (($i + 1) % $per === 0) {
                $score += (int) $this->c['bonus_factor'] * $this->levels->perHit($level);
            }
        }

        return $score;
    }

    public function maxPlausible(int $durationMs, int $start = 0): int
    {
        return (int) ceil($this->perfectScore($durationMs, $start) * (float) ($this->c['tolerance'] ?? 1.1)) + (int) ($this->c['slack'] ?? 100);
    }

    /**
     * @return array{score: int, wave: int, position: int, peak: int, flagged: bool}
     *               `wave` = les manches terminées ; `position` / `peak` = d'arrivée / la plus haute
     */
    public function settle(int $claimed, int $claimedRounds, int $durationMs, int $start = 0, ?int $claimedPosition = null, ?int $claimedPeak = null): array
    {
        $bound = $this->maxPlausible($durationMs, $start);
        $maxRounds = $this->maxRounds($durationMs);
        $claimed = max(0, $claimed);
        $rounds = min(max(0, $claimedRounds), $maxRounds);
        $high = $this->levels->clampPosition($start + $rounds);
        $low = $this->levels->clampPosition($start - $this->levels->warmupDrop() - (int) $this->c['max_drop_per_round'] * $rounds);
        $position = $claimedPosition ?? $start;
        $peak = max($claimedPeak ?? $start, $position, $start);
        $clampedPosition = max($low, min($high, $position));
        $clampedPeak = max($clampedPosition, min($high, $peak));

        return [
            'score' => min($claimed, $bound),
            'wave' => $rounds,
            'position' => $clampedPosition,
            'peak' => $clampedPeak,
            'flagged' => $claimed > $bound || $claimedRounds > $maxRounds || $position !== $clampedPosition || $peak !== $clampedPeak,
        ];
    }
}
