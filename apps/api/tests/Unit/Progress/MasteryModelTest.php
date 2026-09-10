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

    /**
     * LE critère d'acceptation de l'extension : un appel à trois arguments —
     * celui du test final — doit produire EXACTEMENT le nombre que produisait
     * la formule d'avant le moteur de pratique. La formule historique est
     * réécrite ici en toutes lettres, pour que le test échoue si le socle
     * bouge, et pas seulement si les nouveaux facteurs bougent.
     */
    public function test_legacy_defaults_reproduce_the_historical_formula(): void
    {
        foreach ([0.0, 0.2, 0.5, 0.699, 0.7, 0.95, 1.0] as $confidence) {
            foreach ([true, false] as $isCorrect) {
                foreach ([1, 2, 3, 4] as $difficulty) {
                    $weight = max(1, min(4, $difficulty)) / 4;
                    $delta = $isCorrect
                        ? MasteryModel::LEARNING_RATE * (0.3 + 0.7 * $weight)
                        : -MasteryModel::LEARNING_RATE * (0.3 + 0.7 * (1 - $weight));
                    $legacy = round(max(0.0, min(1.0, $confidence + $delta)), 3);

                    $this->assertSame(
                        $legacy,
                        MasteryModel::updateConfidence($confidence, $isCorrect, $difficulty),
                        "c={$confidence} correct=".($isCorrect ? '1' : '0')." d={$difficulty}"
                    );
                }
            }
        }
    }

    public function test_a_hint_never_turns_a_success_into_a_loss(): void
    {
        // Cible §12 : « using a hint is not itself a failure ». Réussir après
        // trois indices reste une progression — modeste, jamais négative.
        foreach ([1, 2, 3] as $hints) {
            $after = MasteryModel::updateConfidence(0.5, true, 3, $hints, MasteryModel::SOURCE_PRACTICE);
            $this->assertGreaterThan(0.5, $after, "réussite avec {$hints} indice(s)");
        }
    }

    public function test_hints_never_make_a_failure_worse(): void
    {
        // La décote d'indice ne s'applique qu'aux réussites : avoir demandé de
        // l'aide ne doit pas alourdir la sanction d'un échec.
        $withoutHints = MasteryModel::updateConfidence(0.5, false, 3, 0, MasteryModel::SOURCE_PRACTICE);
        $withHints = MasteryModel::updateConfidence(0.5, false, 3, 3, MasteryModel::SOURCE_PRACTICE);

        $this->assertSame($withoutHints, $withHints);
    }

    public function test_a_secondary_learning_point_moves_less_than_a_primary_one(): void
    {
        $primary = MasteryModel::updateConfidence(0.5, true, 3, 0, MasteryModel::SOURCE_PRACTICE, 'primary');
        $secondary = MasteryModel::updateConfidence(0.5, true, 3, 0, MasteryModel::SOURCE_PRACTICE, 'secondary');

        $this->assertGreaterThan(0.5, $secondary);
        $this->assertLessThan($primary, $secondary);
    }

    public function test_a_partial_answer_counts_for_less_than_a_full_one(): void
    {
        $full = MasteryModel::updateConfidence(0.5, true, 3, 0, MasteryModel::SOURCE_PRACTICE, 'primary', 'correct');
        $partial = MasteryModel::updateConfidence(0.5, true, 3, 0, MasteryModel::SOURCE_PRACTICE, 'primary', 'partially_correct');

        $this->assertGreaterThan(0.5, $partial);
        $this->assertLessThan($full, $partial);
    }

    public function test_a_harder_success_is_worth_more_than_an_easier_one(): void
    {
        // La difficulté doit compter : quinze exercices faciles ne valent pas
        // une réussite de niveau 5.
        $easy = MasteryModel::updateConfidence(0.5, true, 1);
        $hard = MasteryModel::updateConfidence(0.5, true, 4);

        $this->assertLessThan($hard, $easy);
    }
}
