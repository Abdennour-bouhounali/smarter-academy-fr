<?php

namespace Tests\Unit\Madar;

use App\Domain\Madar\DefenseScoring;
use PHPUnit\Framework\TestCase;

/**
 * La borne de « دفاع الكوكب » : un calendrier de vagues FIXE, donc la durée
 * réelle borne la vague atteinte et le score. Constantes = config/madar.php
 * › defense (miroir du moteur client).
 */
class DefenseScoringTest extends TestCase
{
    private function scoring(): DefenseScoring
    {
        return new DefenseScoring((require __DIR__.'/../../../config/madar.php')['defense']);
    }

    public function test_the_schedule_is_fixed_and_increasing(): void
    {
        $s = $this->scoring();
        $this->assertSame(4.0, $s->waveStart(1));
        // vague 1 : 11 s d'apparition + 5 s de respiration
        $this->assertSame(20.0, $s->waveStart(2));
        $this->assertGreaterThan($s->waveStart(9), $s->waveStart(10));
        $this->assertSame(8, $s->enemiesIn(1));
        $this->assertSame(40, $s->enemiesIn(100));
    }

    public function test_the_wave_reached_is_bounded_by_time(): void
    {
        $s = $this->scoring();
        $this->assertSame(0, $s->maxWave(3_000));
        $this->assertSame(1, $s->maxWave(4_000));
        $this->assertSame(2, $s->maxWave(20_000));
    }

    public function test_settle_keeps_a_possible_result_and_clamps_an_impossible_one(): void
    {
        $s = $this->scoring();
        $ok = $s->settle(300, 2, 30_000);
        $this->assertSame(['score' => 300, 'wave' => 2, 'flagged' => false], $ok);

        $wave = $s->settle(100, 9, 30_000);
        $this->assertTrue($wave['flagged']);
        $this->assertSame(2, $wave['wave']);

        $score = $s->settle(1_000_000, 2, 30_000);
        $this->assertTrue($score['flagged']);
        $this->assertSame($s->maxPlausible(30_000), $score['score']);
    }

    public function test_the_bound_counts_completed_waves_and_bosses(): void
    {
        $s = $this->scoring();
        // À l'instant où commence la vague 6, les vagues 1–5 sont terminées (dont un boss).
        $t = (int) ($s->waveStart(6) * 1000);
        $kills = 0;
        for ($k = 1; $k <= 6; $k++) {
            $kills += $s->enemiesIn($k) * 15;
        }
        $this->assertSame($kills + 150 + 100 * (1 + 2 + 3 + 4 + 5), $s->perfectScore($t));
    }
}
