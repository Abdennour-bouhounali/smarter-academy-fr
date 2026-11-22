<?php

namespace App\Domain\Madar;

/**
 * La borne d'un score de « دفاع الكوكب » (pure).
 *
 * Le calendrier des vagues est FIXE : la vague 1 part à `first_wave_at`, la
 * vague k+1 après la fenêtre d'apparition de k plus une respiration. Personne
 * ne peut l'accélérer. Donc, pour une durée réelle T (posée par le serveur) :
 *
 *   vague atteinte ≤ max { k : début(k) ≤ T }
 *   score ≤ Σ vagues TERMINÉES (début(k+1) ≤ T)  wave_points × k
 *         + Σ vagues COMMENCÉES (début(k) ≤ T)   n_k × max_enemy_points (+ boss)
 *
 * puis × tolérance + marge. Au-delà : ramené à la borne, partie signalée.
 */
class DefenseScoring
{
    /** @param  array<string, float|int>  $c  config('madar.defense') */
    public function __construct(private array $c) {}

    public function spawnWindow(int $k): float
    {
        return min((float) $this->c['spawn_max'], (float) $this->c['spawn_base'] + (float) $this->c['spawn_per_wave'] * $k);
    }

    /** L'instant (s) où commence la vague k (1, 2, …). */
    public function waveStart(int $k): float
    {
        $t = (float) $this->c['first_wave_at'];
        for ($j = 1; $j < $k; $j++) {
            $t += $this->spawnWindow($j) + (float) $this->c['breather'];
        }

        return $t;
    }

    public function enemiesIn(int $k): int
    {
        return (int) min((int) $this->c['enemies_cap'], (int) $this->c['enemies_base'] + (int) $this->c['enemies_per_wave'] * $k);
    }

    public function maxWave(int $durationMs): int
    {
        $t = max(0, $durationMs) / 1000;
        $k = 0;
        while ($k < 1000 && $this->waveStart($k + 1) <= $t) {
            $k++;
        }

        return $k;
    }

    public function perfectScore(int $durationMs): int
    {
        $t = max(0, $durationMs) / 1000;
        $score = 0;
        for ($k = 1; $k <= 1000 && $this->waveStart($k) <= $t; $k++) {
            $score += $this->enemiesIn($k) * (int) $this->c['max_enemy_points'];
            if ($k % (int) $this->c['boss_every'] === 0) {
                $score += (int) $this->c['boss_points'];
            }
            if ($this->waveStart($k + 1) <= $t) {
                $score += (int) $this->c['wave_points'] * $k;
            }
        }

        return $score;
    }

    public function maxPlausible(int $durationMs): int
    {
        return (int) ceil($this->perfectScore($durationMs) * (float) ($this->c['tolerance'] ?? 1.1)) + (int) ($this->c['slack'] ?? 100);
    }

    /** @return array{score: int, wave: int, flagged: bool} */
    public function settle(int $claimed, int $claimedWave, int $durationMs): array
    {
        $bound = $this->maxPlausible($durationMs);
        $maxWave = $this->maxWave($durationMs);
        $claimed = max(0, $claimed);
        $claimedWave = max(0, $claimedWave);

        return [
            'score' => min($claimed, $bound),
            'wave' => min($claimedWave, $maxWave),
            'flagged' => $claimed > $bound || $claimedWave > $maxWave,
        ];
    }
}
