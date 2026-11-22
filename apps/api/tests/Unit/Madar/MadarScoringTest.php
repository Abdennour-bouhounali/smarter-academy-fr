<?php

namespace Tests\Unit\Madar;

use App\Domain\Madar\MadarScoring;
use PHPUnit\Framework\TestCase;

/**
 * La borne du score de « مدار » : elle croît avec la durée, suit le plafond
 * de vitesse, ne ramène jamais un score possible et arrête un score absurde.
 * Constantes = config/madar.php (miroir du moteur client).
 */
class MadarScoringTest extends TestCase
{
    private function scoring(): MadarScoring
    {
        return new MadarScoring((require __DIR__.'/../../../config/madar.php')['physics']);
    }

    public function test_distance_accelerates_then_follows_the_speed_cap(): void
    {
        $s = $this->scoring();
        $this->assertSame(0.0, $s->maxDistanceRad(0));
        // 10 s : ω0·T + a·T²/2 = 12.5 + 0.9
        $this->assertEqualsWithDelta(13.4, $s->maxDistanceRad(10_000), 1e-9);
        // Bien après le plafond : la pente est ωmax.
        $this->assertEqualsWithDelta(3.6 * 100, $s->maxDistanceRad(400_000) - $s->maxDistanceRad(300_000), 1e-6);
    }

    public function test_the_bound_is_monotonic(): void
    {
        $s = $this->scoring();
        $previous = -1;
        foreach ([0, 1_000, 10_000, 60_000, 130_000, 600_000, 1_800_000] as $ms) {
            $this->assertGreaterThan($previous, $s->maxPlausible($ms));
            $previous = $s->maxPlausible($ms);
        }
    }

    public function test_settle_keeps_a_possible_score_and_clamps_an_impossible_one(): void
    {
        $s = $this->scoring();
        $this->assertSame(['score' => 900, 'flagged' => false], $s->settle(900, 60_000));
        $this->assertSame(['score' => 0, 'flagged' => false], $s->settle(-5, 60_000));
        $clamped = $s->settle(10_000_000, 60_000);
        $this->assertTrue($clamped['flagged']);
        $this->assertSame($s->maxPlausible(60_000), $clamped['score']);
    }

    public function test_a_perfect_minute_is_within_the_bound(): void
    {
        // Une minute parfaite : chaque radian à son maximum de points.
        $s = $this->scoring();
        $perfect = (int) floor($s->maxDistanceRad(60_000) * $s->maxPointsPerRad());
        $this->assertFalse($s->settle($perfect, 60_000)['flagged']);
    }
}
