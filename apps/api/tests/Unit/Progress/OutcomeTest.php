<?php

namespace Tests\Unit\Progress;

use App\Domain\Progress\Outcome;
use App\Domain\Progress\Support\OutcomeStats;
use DomainException;
use PHPUnit\Framework\TestCase;

/**
 * La taxonomie des issues, verrouillée sur la fixture partagée avec le JS
 * (packages/core/practice/fixtures/outcomes.json).
 */
class OutcomeTest extends TestCase
{
    private static function fixture(): array
    {
        $path = __DIR__.'/../../../../../packages/core/practice/fixtures/outcomes.json';

        return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    }

    public function test_the_enum_has_exactly_the_fixture_outcomes(): void
    {
        $expected = self::fixture()['outcomes'];
        sort($expected);
        $actual = Outcome::values();
        sort($actual);

        $this->assertSame($expected, $actual);
    }

    public function test_semantics_match_the_fixture(): void
    {
        foreach (self::fixture()['semantics'] as $value => $s) {
            $o = Outcome::from($value);
            $this->assertSame($s['success'], $o->isSuccess(), $value);
            $this->assertSame($s['partial'], $o->isPartial(), $value);
            $this->assertSame($s['failure'], $o->isFailure(), $value);
            $this->assertSame($s['inert'], $o->isInert(), $value);
            $this->assertSame($s['positive'], $o->isPositive(), $value);
            $this->assertSame($s['inSuccessRate'], $o->countsInSuccessRate(), $value);
        }
    }

    public function test_success_rate_cases_match_the_fixture(): void
    {
        foreach (self::fixture()['successRate']['cases'] as $case) {
            $stats = OutcomeStats::fromOutcomes($case['outcomes']);
            $this->assertSame($case['rate'], $stats['successRate'], json_encode($case['outcomes']));
        }
    }

    public function test_from_counts_and_from_outcomes_agree(): void
    {
        $list = ['correct', 'correct', 'equivalent_correct', 'partially_correct', 'incorrect', 'syntax_error', 'abandoned'];
        $counts = array_count_values($list);

        $this->assertSame(OutcomeStats::fromOutcomes($list), OutcomeStats::fromCounts($counts));
        $this->assertSame(3, OutcomeStats::fromCounts($counts)['successes']);
        $this->assertSame(2, OutcomeStats::fromCounts($counts)['inert']);
        $this->assertSame(60.0, OutcomeStats::fromCounts($counts)['successRate']);
    }

    public function test_an_unknown_outcome_is_a_contract_error_never_a_silent_failure(): void
    {
        $this->expectException(DomainException::class);
        Outcome::fromString('wrong');
    }

    public function test_legacy_rows_are_read_as_written(): void
    {
        $this->assertSame(Outcome::Correct, Outcome::fromLegacy(null, true));
        $this->assertSame(Outcome::Incorrect, Outcome::fromLegacy(null, false));
        $this->assertSame(Outcome::PartiallyCorrect, Outcome::fromLegacy('partially_correct', false));
    }
}
