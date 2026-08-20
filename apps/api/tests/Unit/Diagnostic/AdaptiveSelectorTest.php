<?php

namespace Tests\Unit\Diagnostic;

use App\Domain\Diagnostic\Support\AdaptiveSelector;
use PHPUnit\Framework\TestCase;

/**
 * Exercises the algorithm against a small synthetic 4-skill graph rather
 * than the real 6e content — the point is to verify the STRATEGY (tier
 * ordering, gap-prerequisite skipping, misconception verification,
 * difficulty targeting, the question-count ceiling), independent of any
 * particular grade's content. The 6e bank itself is exercised end-to-end
 * by tests/Feature/DiagnosticFlowTest.php.
 *
 *   skillA (tier 0) ──▶ skillC (tier 1)
 *   skillB (tier 0) ──▶ skillD (tier 1)
 */
class AdaptiveSelectorTest extends TestCase
{
    private const SKILLS = [
        'skillA' => ['tier' => 0, 'importance' => 'critical', 'prerequisites' => []],
        'skillB' => ['tier' => 0, 'importance' => 'standard', 'prerequisites' => []],
        'skillC' => ['tier' => 1, 'importance' => 'standard', 'prerequisites' => ['skillA']],
        'skillD' => ['tier' => 1, 'importance' => 'standard', 'prerequisites' => ['skillB']],
    ];

    private const QUESTIONS = [
        'qA1' => ['skillId' => 'skillA', 'difficulty' => 2],
        'qA2' => ['skillId' => 'skillA', 'difficulty' => 4],
        'qB1' => ['skillId' => 'skillB', 'difficulty' => 2],
        'qB2' => ['skillId' => 'skillB', 'difficulty' => 1],
        'qC1' => ['skillId' => 'skillC', 'difficulty' => 2],
        'qC2' => ['skillId' => 'skillC', 'difficulty' => 2, 'verifies' => 'some-misconception'],
        'qD1' => ['skillId' => 'skillD', 'difficulty' => 2],
    ];

    private function unassessed(): array
    {
        $out = [];
        foreach (self::SKILLS as $id => $_) {
            $out[$id] = ['status' => 'unassessed', 'confidence' => 0.5, 'attempts' => 0, 'lastDifficulty' => null, 'lastCorrect' => null, 'lastMisconceptionId' => null];
        }

        return $out;
    }

    public function test_starts_with_a_tier_zero_skill_never_a_dependent_one(): void
    {
        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $this->unassessed(), [], 0);

        $this->assertContains($picked['skillId'], ['skillA', 'skillB']);
    }

    public function test_critical_importance_breaks_ties_within_the_same_tier(): void
    {
        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $this->unassessed(), [], 0);

        $this->assertSame('skillA', $picked['skillId']); // critical beats standard at tier 0
    }

    public function test_a_confirmed_gap_prerequisite_blocks_its_dependent_skill(): void
    {
        $assessments = $this->unassessed();
        $assessments['skillA'] = ['status' => 'gap', 'confidence' => 0.2, 'attempts' => 2, 'lastDifficulty' => 1, 'lastCorrect' => false, 'lastMisconceptionId' => null];
        $assessments['skillB'] = ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null];

        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $assessments, ['qA1', 'qA2', 'qB1', 'qB2'], 4);

        // skillC depends on the now-confirmed-gap skillA, so it must be
        // skipped in favour of skillD (whose prerequisite, skillB, is fine).
        $this->assertSame('skillD', $picked['skillId']);
    }

    public function test_returns_null_once_every_skill_is_resolved(): void
    {
        $assessments = [
            'skillA' => ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null],
            'skillB' => ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null],
            'skillC' => ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null],
            'skillD' => ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null],
        ];

        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $assessments, [], 8);

        $this->assertNull($picked);
    }

    public function test_never_exceeds_the_maximum_question_ceiling(): void
    {
        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $this->unassessed(), [], AdaptiveSelector::MAX_QUESTIONS);

        $this->assertNull($picked);
    }

    public function test_never_repeats_an_already_asked_question(): void
    {
        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $this->unassessed(), ['qA1'], 1);

        $this->assertSame('skillA', $picked['skillId']);
        $this->assertSame('qA2', $picked['questionId']); // the only remaining skillA question
    }

    public function test_prefers_a_verification_question_after_a_misconception_was_flagged(): void
    {
        $assessments = $this->unassessed();
        $assessments['skillA'] = ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null];
        $assessments['skillC'] = ['status' => 'reinforce', 'confidence' => 0.5, 'attempts' => 1, 'lastDifficulty' => 2, 'lastCorrect' => false, 'lastMisconceptionId' => 'some-misconception'];

        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $assessments, ['qA1', 'qA2', 'qC1'], 3);

        $this->assertSame('skillC', $picked['skillId']);
        $this->assertSame('qC2', $picked['questionId']); // the one tagged verifies => 'some-misconception'
    }

    public function test_picks_the_question_closest_to_the_target_difficulty(): void
    {
        // skillA just answered correctly at difficulty 2 with resulting confidence 0.72 —
        // decisively confident, so the staircase should jump to a harder question (qA2, difficulty 4).
        $assessments = $this->unassessed();
        $assessments['skillA'] = ['status' => 'mastered', 'confidence' => 0.72, 'attempts' => 1, 'lastDifficulty' => 2, 'lastCorrect' => true, 'lastMisconceptionId' => null];

        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $assessments, ['qA1'], 1);

        $this->assertSame('qA2', $picked['questionId']);
    }

    public function test_a_gap_blocks_skills_two_tiers_downstream_even_though_the_middle_skill_was_never_tested(): void
    {
        // skillA (tier0, gap) -> skillC (tier1, never tested, therefore no
        // row) -> skillE (tier2). skillE's only prerequisite is skillC,
        // which has no assessment at all — a naive one-level check would
        // wrongly consider skillE eligible.
        $skills = self::SKILLS + [
            'skillE' => ['tier' => 2, 'importance' => 'standard', 'prerequisites' => ['skillC']],
        ];
        $questions = self::QUESTIONS + [
            'qE1' => ['skillId' => 'skillE', 'difficulty' => 2],
        ];

        $assessments = $this->unassessed();
        $assessments['skillE'] = ['status' => 'unassessed', 'confidence' => 0.5, 'attempts' => 0, 'lastDifficulty' => null, 'lastCorrect' => null, 'lastMisconceptionId' => null];
        $assessments['skillA'] = ['status' => 'gap', 'confidence' => 0.15, 'attempts' => 2, 'lastDifficulty' => 1, 'lastCorrect' => false, 'lastMisconceptionId' => null];
        $assessments['skillB'] = ['status' => 'mastered', 'confidence' => 0.9, 'attempts' => 2, 'lastDifficulty' => 4, 'lastCorrect' => true, 'lastMisconceptionId' => null];

        $picked = AdaptiveSelector::selectNext($skills, $questions, $assessments, ['qA1', 'qA2', 'qB1', 'qB2'], 4);

        // skillC is blocked (direct gap prerequisite), so skillE must be
        // blocked too — the only skill left eligible is skillD.
        $this->assertSame('skillD', $picked['skillId']);
    }

    public function test_skill_with_exhausted_bank_is_skipped_in_favour_of_the_next_eligible_skill(): void
    {
        $assessments = $this->unassessed();
        // skillA still "open" (not yet resolved) but every one of its questions has been asked.
        $assessments['skillA'] = ['status' => 'reinforce', 'confidence' => 0.55, 'attempts' => 2, 'lastDifficulty' => 2, 'lastCorrect' => true, 'lastMisconceptionId' => null];

        $picked = AdaptiveSelector::selectNext(self::SKILLS, self::QUESTIONS, $assessments, ['qA1', 'qA2'], 2);

        $this->assertSame('skillB', $picked['skillId']);
    }
}
