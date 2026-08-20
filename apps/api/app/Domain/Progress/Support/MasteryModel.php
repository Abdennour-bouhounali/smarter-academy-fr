<?php

namespace App\Domain\Progress\Support;

/**
 * Confidence model for lesson-assessment evidence — deliberately a SEPARATE,
 * parallel class from Diagnostic\Support\MasteryModel, not an import of it:
 * the Diagnostic module is self-contained by design (nothing outside reaches
 * in, nothing inside reaches out), and this module honors the same boundary
 * in reverse. The numeric thresholds are intentionally the same values so
 * 'mastered'/'reinforce'/'gap' means one consistent thing app-wide; if the
 * two models ever need to diverge (lesson evidence has different dynamics
 * than a one-shot diagnostic), they can, independently.
 *
 * Every method is a pure function — unit-testable without a database, and
 * these constants are the complete documented spec of how lesson mastery is
 * decided.
 */
class MasteryModel
{
    public const MASTERED_THRESHOLD = 0.70;

    public const GAP_THRESHOLD = 0.40;

    public const STARTING_CONFIDENCE = 0.5;

    public const LEARNING_RATE = 0.22;

    /**
     * Lesson questions don't carry a 1..4 difficulty rating (unlike the
     * diagnostic's question bank), so every evidence event weighs as a fixed
     * mid-difficulty data point. A documented simplification, not a silent
     * guess — if lesson questions gain difficulty metadata later, thread it
     * through ProgressEngine instead of widening this constant's job.
     */
    public const DEFAULT_DIFFICULTY = 2;

    public static function updateConfidence(float $confidence, bool $isCorrect, int $difficulty = self::DEFAULT_DIFFICULTY): float
    {
        $difficultyWeight = max(1, min(4, $difficulty)) / 4; // 0.25 .. 1.0

        $delta = $isCorrect
            ? self::LEARNING_RATE * (0.3 + 0.7 * $difficultyWeight)
            : -self::LEARNING_RATE * (0.3 + 0.7 * (1 - $difficultyWeight));

        return round(max(0.0, min(1.0, $confidence + $delta)), 3);
    }

    /**
     * 'mastered' | 'reinforce' | 'gap' — same three bands (and the same
     * numbers) as the diagnostic, so a profile mixing both sources reads
     * consistently. 'unassessed' is the row default before any evidence.
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
}
