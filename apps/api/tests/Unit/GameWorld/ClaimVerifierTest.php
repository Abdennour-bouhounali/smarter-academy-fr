<?php

namespace Tests\Unit\GameWorld;

use App\Domain\GameWorld\ClaimVerifier;
use PHPUnit\Framework\TestCase;

/** Le juge du monde de jeu, sans base de données : la fixture partagée avec le navigateur (evidence.test.js). */
class ClaimVerifierTest extends TestCase
{
    public function test_it_gives_the_verdict_of_the_shared_fixture(): void
    {
        $fixture = json_decode(file_get_contents(__DIR__.'/../../Fixtures/game-claims.json'), true);
        $this->assertGreaterThan(30, count($fixture['cases']));
        foreach ($fixture['cases'] as $case) {
            $this->assertSame($case['ok'], ClaimVerifier::verify($case['claim']), json_encode($case['claim']));
        }
    }

    public function test_it_refuses_what_is_not_a_natural_number(): void
    {
        $this->assertFalse(ClaimVerifier::verify(['kind' => 'division', 'a' => '756', 'b' => 36, 'q' => 21, 'r' => 0, 'fits' => true]));
        $this->assertFalse(ClaimVerifier::verify(['kind' => 'division', 'a' => 756, 'b' => 36, 'q' => 21.0, 'r' => 0, 'fits' => true]));
        $this->assertFalse(ClaimVerifier::verify(['kind' => 'division', 'a' => 756, 'b' => 36, 'q' => 21, 'r' => 0, 'fits' => 1]));
        $this->assertFalse(ClaimVerifier::verify(['kind' => 'containers', 'a' => 10 ** 9, 'b' => 3, 'count' => 1]));
        $this->assertFalse(ClaimVerifier::verify([]));
    }

    public function test_a_common_divisor_other_than_one_refuses_one(): void
    {
        // without the option, 1 is a common divisor of any two numbers; with `notOne: true` it is no witness
        $this->assertTrue(ClaimVerifier::verify(['kind' => 'commonDivisor', 'a' => 85, 'b' => 119, 'd' => 1]));
        $this->assertFalse(ClaimVerifier::verify(['kind' => 'commonDivisor', 'a' => 85, 'b' => 119, 'd' => 1, 'notOne' => true]));
        $this->assertTrue(ClaimVerifier::verify(['kind' => 'commonDivisor', 'a' => 85, 'b' => 119, 'd' => 17, 'notOne' => true]));
        // only the boolean true asks for it, as in the browser (`=== true`)
        $this->assertTrue(ClaimVerifier::verify(['kind' => 'commonDivisor', 'a' => 85, 'b' => 119, 'd' => 1, 'notOne' => 1]));
    }

    public function test_a_fraction_with_an_operation_is_computed_here_not_taken_from_the_browser(): void
    {
        $c = ['kind' => 'fraction', 'op' => '+', 'x' => 5, 'y' => 12, 'z' => 1, 'w' => 12, 'p' => 1, 'q' => 2];
        $this->assertTrue(ClaimVerifier::verify([...$c, 'a' => 6, 'b' => 12]));
        $this->assertTrue(ClaimVerifier::verify([...$c, 'a' => 3, 'b' => 6]));
        // a wrong result sent by the browser, with p/q equal to it: true without `op`, false with it
        $this->assertTrue(ClaimVerifier::verify(['kind' => 'fraction', 'a' => 7, 'b' => 12, 'p' => 7, 'q' => 12]));
        $this->assertFalse(ClaimVerifier::verify([...$c, 'a' => 7, 'b' => 12, 'p' => 7, 'q' => 12]));
        // an op that is not one of the three strings, or present and null, is never right (as in the browser)
        $this->assertFalse(ClaimVerifier::verify([...$c, 'a' => 6, 'b' => 12, 'op' => ['+']]));
        $this->assertFalse(ClaimVerifier::verify([...$c, 'a' => 6, 'b' => 12, 'op' => null]));
        $this->assertFalse(ClaimVerifier::verify([...$c, 'a' => 6, 'b' => 12, 'x' => '5']));
    }

    public function test_the_same_division_is_the_same_item(): void
    {
        $this->assertSame('division-756x36', ClaimVerifier::itemId(['kind' => 'division', 'a' => 756, 'b' => 36, 'q' => 21, 'r' => 0]));
        $this->assertSame('division-756x36', ClaimVerifier::itemId(['kind' => 'division', 'a' => 756, 'b' => 36, 'q' => 20, 'r' => 36]));
    }
}
