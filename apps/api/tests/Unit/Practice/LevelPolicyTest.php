<?php

namespace Tests\Unit\Practice;

use App\Domain\Practice\Support\LevelPolicy;
use PHPUnit\Framework\TestCase;

/**
 * Le motif d'un niveau fermé est un CODE, jamais une phrase : c'est le client
 * qui l'écrit en arabe. Une phrase française s'affichait sous chaque niveau.
 */
class LevelPolicyTest extends TestCase
{
    public function test_a_locked_level_carries_a_code_not_a_sentence(): void
    {
        $levels = LevelPolicy::levels([1 => 2, 2 => 2, 3 => 2], [1 => 0]);

        $this->assertTrue($levels[0]['unlocked']);
        $this->assertNull($levels[0]['reason']);
        foreach ([1, 2] as $i) {
            $this->assertFalse($levels[$i]['unlocked']);
            $this->assertSame(LevelPolicy::REASON_PREVIOUS_LEVEL, $levels[$i]['reason']);
            $this->assertMatchesRegularExpression('/^[a-z_]+$/', $levels[$i]['reason']);
        }
    }

    public function test_finishing_an_exercise_opens_the_next_level_without_reason(): void
    {
        $levels = LevelPolicy::levels([1 => 2, 2 => 2], [1 => 1]);

        $this->assertTrue($levels[1]['unlocked']);
        $this->assertNull($levels[1]['reason']);
    }
}
