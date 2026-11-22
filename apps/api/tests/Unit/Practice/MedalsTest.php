<?php

namespace Tests\Unit\Practice;

use App\Domain\Practice\Medals;
use PHPUnit\Framework\TestCase;

/** La règle des médailles = celle du client : même fixture (medals.fixture.json). */
class MedalsTest extends TestCase
{
    public function test_the_server_rule_matches_the_shared_fixture(): void
    {
        $path = __DIR__.'/../../../../web/src/features/practice/exam/medals.fixture.json';
        $cases = json_decode(file_get_contents($path), true);
        $this->assertGreaterThanOrEqual(10, count($cases));
        foreach ($cases as $case) {
            $in = $case['in'];
            $this->assertSame($case['medal'], Medals::medalFor(
                $in['outcome'], $in['answerType'] ?? null, (int) ($in['hintsUsed'] ?? 0),
                isset($in['seconds']) ? (float) $in['seconds'] : null,
                isset($in['limit']) ? (float) $in['limit'] : null,
                $in['evaluatedBy'] ?? null,
            ), $case['name']);
        }
    }
}
