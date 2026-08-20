<?php

namespace App\Domain\Diagnostic\Support;

/**
 * Turns a stream of correct/incorrect evidence for one skill into a
 * confidence estimate (0..1) and a 3-band status — deliberately not a
 * literal IRT/Bayesian model (that would be unauditable and unnecessary for
 * a first version), but not binary "correct=mastered" either. The intuition
 * it encodes:
 *
 *   - Answering a HARD question correctly is stronger evidence of mastery
 *     than answering an EASY one correctly, so it moves confidence up more.
 *   - Missing an EASY question is stronger evidence of a real gap than
 *     missing a HARD one, so it moves confidence down more.
 *
 * Every method is a pure function — no persistence, no randomness — so the
 * whole model is unit-testable and auditable without a database, and the
 * exact thresholds/weights below are the complete, documented spec of "how
 * mastery is decided" (see docs/architecture/DIAGNOSTIC_6E.md).
 */
class MasteryModel
{
    public const MASTERED_THRESHOLD = 0.70;

    public const GAP_THRESHOLD = 0.40;

    public const STARTING_CONFIDENCE = 0.5;

    /** Seeded when every prerequisite is already strongly mastered — see startingConfidence(). */
    public const BOOSTED_STARTING_CONFIDENCE = 0.6;

    public const LEARNING_RATE = 0.22;

    /** Hard ceiling on questions spent per skill — guarantees the engine terminates. */
    public const MAX_ATTEMPTS_PER_SKILL = 4;

    /**
     * One threshold, two uses that need to agree for the "confident
     * cascade" to actually cascade across tiers:
     *   1. hasSufficientEvidence() — a single response resolves a skill
     *      only if confidence clears this bar (stronger than the normal
     *      0.70/0.40, since one data point is easier to reach by luck than
     *      two — see below).
     *   2. startingConfidence() — a prerequisite only counts as "strongly
     *      mastered" (worth boosting its dependent's starting confidence)
     *      once ITS OWN confidence cleared this same bar.
     * If (2)'s bar were higher than what (1) can actually produce, a
     * boosted skill's own 1-shot resolution could never itself clear the
     * bar to boost ITS dependents — the cascade would only ever reach one
     * tier deep. Using the same constant for both is what lets a
     * consistently-correct student's confidence cascade through all 4
     * tiers instead of stopping after tier 1.
     *
     * 0.78, not a rounder 0.80: chosen so it's reachable by a boosted
     * single attempt but provably not by an unboosted one, given the real
     * 6e question bank's actual difficulty range (most skills only reach
     * difficulty 3, not every skill has a 4). Correct at difficulty 3 from
     * the boosted seed (0.6) lands at ≈0.7815 — just over 0.78, and that
     * result is itself ≥0.78, so it re-qualifies as "strongly mastered" for
     * the next tier. The highest an UNBOOSTED skill (seed 0.5) can reach in
     * one attempt, even at the hardest available difficulty (4), is 0.72 —
     * safely under 0.78, so a fresh skill can never 1-shot-resolve from a
     * single lucky guess regardless of question difficulty.
     */
    public const DECISIVE_CONFIDENCE = 0.78;

    public const DECISIVE_GAP_CONFIDENCE = 0.20;

    /**
     * @param  float  $confidence  Current confidence, 0..1.
     * @param  int  $difficulty  1..4, the difficulty of the question just answered.
     */
    public static function updateConfidence(float $confidence, bool $isCorrect, int $difficulty): float
    {
        $difficultyWeight = max(1, min(4, $difficulty)) / 4; // 0.25 .. 1.0

        $delta = $isCorrect
            ? self::LEARNING_RATE * (0.3 + 0.7 * $difficultyWeight)
            : -self::LEARNING_RATE * (0.3 + 0.7 * (1 - $difficultyWeight));

        return round(max(0.0, min(1.0, $confidence + $delta)), 3);
    }

    /**
     * 🟢 mastered / 🟠 reinforce / 🔴 gap — the three states a parent or
     * student sees; `confidence` itself stays an internal number.
     */
    public static function statusFor(float $confidence): string
    {
        if ($confidence >= self::MASTERED_THRESHOLD) {
            return 'mastered';
        }
        if ($confidence < self::GAP_THRESHOLD) {
            return 'gap';
        }

        return 'reinforce';
    }

    /**
     * Whether the engine should stop probing this skill and move on —
     * either because the evidence is already clear-cut, or because the
     * per-skill question budget is exhausted (the loop-termination guarantee).
     *
     * A single response CAN resolve a skill, but only if it's decisive
     * (≥0.80 or ≤0.20) — stronger evidence than the normal 0.70/0.40 bar,
     * since one data point is easier to get by luck (a good guess on an
     * MCQ) than two. This is what lets a confidently-seeded skill (strong
     * prerequisites, answered correctly at the boosted starting difficulty
     * — see AdaptiveSelector::targetDifficulty()) resolve in one question
     * instead of always paying a flat 2-question minimum regardless of how
     * clear-cut the first answer was — without that, a student who answers
     * every question correctly never finishes faster than a middling one,
     * contradicting §5/§31 Student A ("few questions... advanced starting
     * point"). Two-or-more-attempt resolution keeps the normal thresholds.
     */
    public static function hasSufficientEvidence(float $confidence, int $attempts): bool
    {
        if ($attempts >= self::MAX_ATTEMPTS_PER_SKILL) {
            return true;
        }
        if ($attempts === 0) {
            return false;
        }
        if ($attempts === 1) {
            return $confidence >= self::DECISIVE_CONFIDENCE || $confidence <= self::DECISIVE_GAP_CONFIDENCE;
        }

        return $confidence >= self::MASTERED_THRESHOLD || $confidence < self::GAP_THRESHOLD;
    }

    /**
     * A skill whose prerequisites are all strongly established starts from
     * a friendlier baseline — this is what lets a strong student resolve a
     * dependent skill in a single confirming question instead of two,
     * without ever skipping the check entirely (§5/§15 of the brief: don't
     * blindly restart from zero once evidence already points somewhere).
     *
     * @param  array<array{confidence: float}>  $prerequisiteAssessments
     */
    public static function startingConfidence(array $prerequisiteAssessments): float
    {
        if ($prerequisiteAssessments === []) {
            return self::STARTING_CONFIDENCE;
        }

        foreach ($prerequisiteAssessments as $assessment) {
            if (($assessment['confidence'] ?? 0.0) < self::DECISIVE_CONFIDENCE) {
                return self::STARTING_CONFIDENCE;
            }
        }

        return self::BOOSTED_STARTING_CONFIDENCE;
    }

    /**
     * The per-skill difficulty staircase: step up on correct, down on
     * incorrect, with a bigger jump when the current confidence is already
     * decisive — so a clearly-strong or clearly-weak student reaches a
     * stable answer in fewer questions rather than crawling one level at a time.
     */
    public static function nextDifficulty(int $currentDifficulty, bool $wasCorrect, float $confidenceAfter): int
    {
        if ($wasCorrect) {
            $step = $confidenceAfter >= 0.75 ? 2 : 1;

            return min(4, $currentDifficulty + $step);
        }

        $step = $confidenceAfter < 0.25 ? 2 : 1;

        return max(1, $currentDifficulty - $step);
    }
}
