<?php

namespace App\Domain\Madar;

/**
 * La borne d'un score de « مدار » (pure).
 *
 * Le jeu tourne chez l'élève ; le serveur ne rejoue pas la partie. Il sait
 * en revanche combien de temps elle a duré (début et fin posés par lui), et
 * les constantes du moteur disent le MEILLEUR score qu'une partie parfaite
 * peut faire dans ce temps : vitesse angulaire qui croît puis plafonne, un
 * point par radian parcouru, une étoile au plus tous les `star_min_gap_rad`
 * au multiplicateur maximal, un « قريب! » au plus par obstacle.
 *
 *   distance(T) = ω0·T + a·T²/2            tant que ω n'a pas plafonné
 *               = distance(Tc) + ωmax·(T − Tc)  ensuite
 *   borne(T)    = ⌈distance(T) × max_par_radian × tolérance⌉ + marge
 *
 * Un score annoncé au-delà est ramené à la borne et la partie signalée
 * (`flagged`) — visible par l'enseignant.
 */
class MadarScoring
{
    /** @param  array<string, float|int>  $physics  config('madar.physics') */
    public function __construct(private array $physics) {}

    /** Radians qu'une partie de cette durée peut parcourir au plus. */
    public function maxDistanceRad(int $durationMs): float
    {
        $t = max(0, $durationMs) / 1000;
        $w0 = (float) $this->physics['omega_start'];
        $a = (float) $this->physics['omega_accel'];
        $wMax = (float) $this->physics['omega_max'];
        $tCap = $a > 0 ? max(0, ($wMax - $w0) / $a) : 0;

        if ($t <= $tCap) {
            return $w0 * $t + $a * $t * $t / 2;
        }

        return $w0 * $tCap + $a * $tCap * $tCap / 2 + $wMax * ($t - $tCap);
    }

    /** Le plus de points qu'un radian puisse rapporter. */
    public function maxPointsPerRad(): float
    {
        $p = $this->physics;

        return (float) $p['points_per_rad']
            + (float) $p['star_points'] * (float) $p['max_multiplier'] / (float) $p['star_min_gap_rad']
            + (float) $p['near_miss_points'] / (float) $p['obstacle_min_gap_rad'];
    }

    public function maxPlausible(int $durationMs): int
    {
        return (int) ceil($this->maxDistanceRad($durationMs) * $this->maxPointsPerRad() * (float) ($this->physics['tolerance'] ?? 1.25))
            + (int) ($this->physics['slack'] ?? 200);
    }

    /**
     * @return array{score: int, flagged: bool}
     */
    public function settle(int $claimed, int $durationMs): array
    {
        $bound = $this->maxPlausible($durationMs);
        $claimed = max(0, $claimed);

        return ['score' => min($claimed, $bound), 'flagged' => $claimed > $bound];
    }
}
