<?php

namespace Tests\Unit\Diagnostic;

use App\Domain\Diagnostic\Support\AnswerChecker;
use PHPUnit\Framework\TestCase;

class AnswerCheckerTest extends TestCase
{
    public function test_choice_correct_match(): void
    {
        $result = AnswerChecker::check('choice', ['choiceId' => 'a'], ['correct' => ['choiceId' => 'a']]);

        $this->assertTrue($result['isCorrect']);
        $this->assertNull($result['misconceptionId']);
    }

    public function test_choice_incorrect_with_mapped_misconception(): void
    {
        $question = ['correct' => ['choiceId' => 'a'], 'misconceptions' => ['b' => 'plus-grand-denominateur-plus-grande-fraction']];

        $result = AnswerChecker::check('choice', ['choiceId' => 'b'], $question);

        $this->assertFalse($result['isCorrect']);
        $this->assertSame('plus-grand-denominateur-plus-grande-fraction', $result['misconceptionId']);
    }

    public function test_choice_incorrect_with_unmapped_distractor_has_no_misconception(): void
    {
        $question = ['correct' => ['choiceId' => 'a'], 'misconceptions' => ['b' => 'some-misconception']];

        $result = AnswerChecker::check('choice', ['choiceId' => 'c'], $question);

        $this->assertFalse($result['isCorrect']);
        $this->assertNull($result['misconceptionId']);
    }

    public function test_numeric_exact_match(): void
    {
        $result = AnswerChecker::check('numeric', ['value' => 350], ['correct' => ['value' => 350, 'tolerance' => 0.5]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_numeric_within_tolerance(): void
    {
        $result = AnswerChecker::check('numeric', ['value' => '3,71'], ['correct' => ['value' => 3.7, 'tolerance' => 0.02]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_numeric_outside_tolerance_is_incorrect(): void
    {
        $result = AnswerChecker::check('numeric', ['value' => 5], ['correct' => ['value' => 3.7, 'tolerance' => 0.01]]);

        $this->assertFalse($result['isCorrect']);
    }

    public function test_numeric_detects_known_misconception_value(): void
    {
        $question = [
            'correct' => ['value' => 3.7, 'tolerance' => 0.01],
            'misconceptions' => [['value' => 0.37, 'id' => 'virgule-mal-placee']],
        ];

        $result = AnswerChecker::check('numeric', ['value' => 0.37], $question);

        $this->assertFalse($result['isCorrect']);
        $this->assertSame('virgule-mal-placee', $result['misconceptionId']);
    }

    public function test_numeric_non_numeric_input_never_throws(): void
    {
        $result = AnswerChecker::check('numeric', ['value' => 'abc'], ['correct' => ['value' => 5, 'tolerance' => 0.01]]);

        $this->assertFalse($result['isCorrect']);
        $this->assertNull($result['misconceptionId']);
    }

    public function test_fraction_exact_match(): void
    {
        $result = AnswerChecker::check('fraction', ['numerator' => 5, 'denominator' => 6], ['correct' => ['numerator' => 5, 'denominator' => 6]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_fraction_equivalent_but_unreduced_is_correct(): void
    {
        // 2/4 is mathematically equal to 1/2 — cross-multiplication must accept it.
        $result = AnswerChecker::check('fraction', ['numerator' => 2, 'denominator' => 4], ['correct' => ['numerator' => 1, 'denominator' => 2]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_fraction_zero_denominator_is_incorrect_not_a_crash(): void
    {
        $result = AnswerChecker::check('fraction', ['numerator' => 3, 'denominator' => 0], ['correct' => ['numerator' => 3, 'denominator' => 4]]);

        $this->assertFalse($result['isCorrect']);
    }

    public function test_fraction_numerator_denominator_swap_is_a_known_misconception(): void
    {
        $result = AnswerChecker::check('fraction', ['numerator' => 4, 'denominator' => 3], ['correct' => ['numerator' => 3, 'denominator' => 4]]);

        $this->assertFalse($result['isCorrect']);
        $this->assertSame('numerateur-denominateur-inverses', $result['misconceptionId']);
    }

    public function test_ordering_correct_sequence(): void
    {
        $result = AnswerChecker::check('ordering', ['sequence' => ['a', 'b', 'c']], ['correct' => ['sequence' => ['a', 'b', 'c']]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_ordering_reversed_sequence_is_a_known_misconception(): void
    {
        $result = AnswerChecker::check('ordering', ['sequence' => ['c', 'b', 'a']], ['correct' => ['sequence' => ['a', 'b', 'c']]]);

        $this->assertFalse($result['isCorrect']);
        $this->assertSame('sens-inverse', $result['misconceptionId']);
    }

    public function test_ordering_arbitrary_wrong_sequence_has_no_misconception(): void
    {
        $result = AnswerChecker::check('ordering', ['sequence' => ['b', 'a', 'c']], ['correct' => ['sequence' => ['a', 'b', 'c']]]);

        $this->assertFalse($result['isCorrect']);
        $this->assertNull($result['misconceptionId']);
    }

    public function test_classification_correct_assignments(): void
    {
        $question = ['correct' => ['assignments' => ['x' => 'useful', 'y' => 'not_useful']]];

        $result = AnswerChecker::check('classification', ['assignments' => ['y' => 'not_useful', 'x' => 'useful']], $question);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_classification_incorrect_assignment(): void
    {
        $question = ['correct' => ['assignments' => ['x' => 'useful', 'y' => 'not_useful']]];

        $result = AnswerChecker::check('classification', ['assignments' => ['x' => 'not_useful', 'y' => 'not_useful']], $question);

        $this->assertFalse($result['isCorrect']);
    }

    public function test_numberline_uses_numeric_tolerance_rule(): void
    {
        $result = AnswerChecker::check('numberline', ['value' => 341], ['correct' => ['value' => 340, 'tolerance' => 30]]);

        $this->assertTrue($result['isCorrect']);
    }

    public function test_unknown_representation_is_safely_incorrect(): void
    {
        $result = AnswerChecker::check('mystery-type', ['value' => 1], ['correct' => ['value' => 1]]);

        $this->assertFalse($result['isCorrect']);
        $this->assertNull($result['misconceptionId']);
    }
}
