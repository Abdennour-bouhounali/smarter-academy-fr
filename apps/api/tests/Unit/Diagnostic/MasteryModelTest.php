<?php

namespace Tests\Unit\Diagnostic;

use App\Domain\Diagnostic\Support\MasteryModel;
use PHPUnit\Framework\TestCase;

class MasteryModelTest extends TestCase
{
    public function test_correct_on_hard_question_moves_confidence_up_more_than_correct_on_easy(): void
    {
        $afterHard = MasteryModel::updateConfidence(0.5, true, 4);
        $afterEasy = MasteryModel::updateConfidence(0.5, true, 1);

        $this->assertGreaterThan($afterEasy - 0.5, $afterHard - 0.5);
    }

    public function test_incorrect_on_easy_question_moves_confidence_down_more_than_incorrect_on_hard(): void
    {
        $afterEasyMiss = MasteryModel::updateConfidence(0.5, false, 1);
        $afterHardMiss = MasteryModel::updateConfidence(0.5, false, 4);

        $this->assertGreaterThan(0.5 - $afterHardMiss, 0.5 - $afterEasyMiss);
    }

    public function test_confidence_is_clamped_to_zero_and_one(): void
    {
        $this->assertSame(1.0, MasteryModel::updateConfidence(0.95, true, 4));
        $this->assertSame(0.0, MasteryModel::updateConfidence(0.05, false, 1));
    }

    public function test_status_bands(): void
    {
        $this->assertSame('mastered', MasteryModel::statusFor(0.70));
        $this->assertSame('mastered', MasteryModel::statusFor(0.9));
        $this->assertSame('reinforce', MasteryModel::statusFor(0.55));
        $this->assertSame('gap', MasteryModel::statusFor(0.39));
        $this->assertSame('gap', MasteryModel::statusFor(0.0));
    }

    public function test_zero_attempts_is_never_sufficient_regardless_of_confidence(): void
    {
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.95, 0));
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.02, 0));
    }

    public function test_a_single_non_decisive_attempt_is_not_sufficient_evidence(): void
    {
        // 0.72 clears the normal 0.70 "mastered" bar but not the stricter
        // single-attempt bar (0.80) — one data point needs to be more
        // extreme than two to be trusted, since it's easier to reach by a
        // lucky/unlucky guess.
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.72, 1));
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.35, 1));
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.5, 1));
    }

    public function test_a_single_decisive_attempt_is_sufficient_evidence(): void
    {
        // This is what lets a confidently-seeded skill (strong
        // prerequisites, answered correctly at the boosted starting
        // difficulty) resolve in one question instead of a flat two-question
        // minimum — see AdaptiveSelector::targetDifficulty().
        $this->assertTrue(MasteryModel::hasSufficientEvidence(0.82, 1));
        $this->assertTrue(MasteryModel::hasSufficientEvidence(0.15, 1));
    }

    public function test_sufficient_evidence_once_confidence_is_decisive_after_two_attempts(): void
    {
        $this->assertTrue(MasteryModel::hasSufficientEvidence(0.71, 2)); // clears the normal bar, doesn't need the stricter one
        $this->assertTrue(MasteryModel::hasSufficientEvidence(0.10, 2));
        $this->assertFalse(MasteryModel::hasSufficientEvidence(0.5, 2)); // ambiguous "reinforce" zone, needs more evidence
    }

    public function test_max_attempts_always_forces_a_stop_even_if_ambiguous(): void
    {
        $this->assertTrue(MasteryModel::hasSufficientEvidence(0.5, MasteryModel::MAX_ATTEMPTS_PER_SKILL));
    }

    public function test_starting_confidence_defaults_when_no_prerequisites(): void
    {
        $this->assertSame(MasteryModel::STARTING_CONFIDENCE, MasteryModel::startingConfidence([]));
    }

    public function test_starting_confidence_is_boosted_when_all_prerequisites_strongly_mastered(): void
    {
        $prereqs = [['confidence' => 0.9], ['confidence' => 0.95]];

        $this->assertSame(MasteryModel::BOOSTED_STARTING_CONFIDENCE, MasteryModel::startingConfidence($prereqs));
    }

    public function test_starting_confidence_stays_default_if_any_prerequisite_is_not_strongly_mastered(): void
    {
        $prereqs = [['confidence' => 0.9], ['confidence' => 0.6]];

        $this->assertSame(MasteryModel::STARTING_CONFIDENCE, MasteryModel::startingConfidence($prereqs));
    }

    public function test_a_realistic_two_correct_answer_resolution_actually_reaches_the_boost_threshold(): void
    {
        // Regression: the boost bar must be reachable by a genuinely common
        // path, not just a theoretical one. A fresh skill answered correctly
        // twice in a row (medium difficulty, then the escalated difficulty
        // the staircase picks next) is exactly what a consistently-correct
        // student produces for every tier-0 skill — if this doesn't clear
        // DECISIVE_CONFIDENCE, the boost silently never fires in practice
        // and a strong student never finishes faster than anyone else.
        $confidence = MasteryModel::STARTING_CONFIDENCE;
        $difficulty = 2; // the fixed, unboosted first-question target

        $confidence = MasteryModel::updateConfidence($confidence, true, $difficulty);
        $difficulty = MasteryModel::nextDifficulty($difficulty, true, $confidence);
        $confidence = MasteryModel::updateConfidence($confidence, true, $difficulty);

        $this->assertGreaterThanOrEqual(MasteryModel::DECISIVE_CONFIDENCE, $confidence);
        $this->assertSame(MasteryModel::BOOSTED_STARTING_CONFIDENCE, MasteryModel::startingConfidence([['confidence' => $confidence]]));
    }

    public function test_a_boosted_skills_own_single_attempt_resolution_clears_the_bar_to_boost_its_own_dependents(): void
    {
        // The cascade property: a boosted seed (0.6) answered correctly at
        // the boosted starting difficulty (3, see AdaptiveSelector) must
        // itself land at or above DECISIVE_CONFIDENCE — otherwise the boost
        // reaches tier 1 and silently stops, never propagating to tier 2/3.
        $resolved = MasteryModel::updateConfidence(MasteryModel::BOOSTED_STARTING_CONFIDENCE, true, 3);

        $this->assertGreaterThanOrEqual(MasteryModel::DECISIVE_CONFIDENCE, $resolved);
        $this->assertTrue(MasteryModel::hasSufficientEvidence($resolved, 1));
        $this->assertSame(MasteryModel::BOOSTED_STARTING_CONFIDENCE, MasteryModel::startingConfidence([['confidence' => $resolved]]));
    }

    public function test_next_difficulty_increases_on_correct_and_decreases_on_incorrect(): void
    {
        $this->assertGreaterThan(2, MasteryModel::nextDifficulty(2, true, 0.6));
        $this->assertLessThan(2, MasteryModel::nextDifficulty(2, false, 0.4));
    }

    public function test_next_difficulty_jumps_further_when_confidence_is_already_decisive(): void
    {
        $confidentJump = MasteryModel::nextDifficulty(2, true, 0.9) - 2;
        $modestJump = MasteryModel::nextDifficulty(2, true, 0.6) - 2;

        $this->assertGreaterThan($modestJump, $confidentJump);
    }

    public function test_next_difficulty_is_clamped_between_one_and_four(): void
    {
        $this->assertSame(4, MasteryModel::nextDifficulty(4, true, 0.95));
        $this->assertSame(1, MasteryModel::nextDifficulty(1, false, 0.05));
    }
}
