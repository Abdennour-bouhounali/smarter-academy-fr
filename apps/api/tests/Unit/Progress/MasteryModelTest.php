<?php

namespace Tests\Unit\Progress;

use App\Domain\Progress\Support\MasteryModel;
use PHPUnit\Framework\TestCase;

class MasteryModelTest extends TestCase
{
    public function test_correct_evidence_moves_confidence_up_and_incorrect_moves_it_down(): void
    {
        $this->assertGreaterThan(0.5, MasteryModel::updateConfidence(0.5, true));
        $this->assertLessThan(0.5, MasteryModel::updateConfidence(0.5, false));
    }

    public function test_confidence_is_clamped_to_zero_and_one(): void
    {
        $this->assertSame(1.0, MasteryModel::updateConfidence(0.98, true, 4));
        $this->assertSame(0.0, MasteryModel::updateConfidence(0.02, false, 1));
    }

    public function test_status_bands_match_the_diagnostics_vocabulary(): void
    {
        // Same thresholds as Diagnostic\Support\MasteryModel by design —
        // 'mastered' must mean the same thing whichever system produced it.
        $this->assertSame('mastered', MasteryModel::statusFor(0.70));
        $this->assertSame('reinforce', MasteryModel::statusFor(0.55));
        $this->assertSame('gap', MasteryModel::statusFor(0.39));
    }

    public function test_thresholds_stay_in_lockstep_with_the_diagnostic_model(): void
    {
        // Regression guard: if either model's thresholds change without the
        // other, a mixed profile would use one word for two different bars.
        $this->assertSame(\App\Domain\Diagnostic\Support\MasteryModel::MASTERED_THRESHOLD, MasteryModel::MASTERED_THRESHOLD);
        $this->assertSame(\App\Domain\Diagnostic\Support\MasteryModel::GAP_THRESHOLD, MasteryModel::GAP_THRESHOLD);
        $this->assertSame(\App\Domain\Diagnostic\Support\MasteryModel::STARTING_CONFIDENCE, MasteryModel::STARTING_CONFIDENCE);
    }

    public function test_default_difficulty_is_used_when_none_is_given(): void
    {
        $this->assertSame(
            MasteryModel::updateConfidence(0.5, true, MasteryModel::DEFAULT_DIFFICULTY),
            MasteryModel::updateConfidence(0.5, true)
        );
    }

    public function test_repeated_correct_evidence_reaches_mastered(): void
    {
        $confidence = MasteryModel::STARTING_CONFIDENCE;
        for ($i = 0; $i < 3; $i++) {
            $confidence = MasteryModel::updateConfidence($confidence, true);
        }

        $this->assertSame('mastered', MasteryModel::statusFor($confidence));
    }

    public function test_repeated_incorrect_evidence_reaches_gap(): void
    {
        $confidence = MasteryModel::STARTING_CONFIDENCE;
        for ($i = 0; $i < 3; $i++) {
            $confidence = MasteryModel::updateConfidence($confidence, false);
        }

        $this->assertSame('gap', MasteryModel::statusFor($confidence));
    }
}
