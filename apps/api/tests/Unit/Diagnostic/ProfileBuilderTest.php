<?php

namespace Tests\Unit\Diagnostic;

use App\Domain\Diagnostic\Contracts\GradeDiagnosticProvider;
use App\Domain\Diagnostic\Support\ProfileBuilder;
use PHPUnit\Framework\TestCase;

/**
 * The three student journeys named in the brief (§31), against a small
 * synthetic 5-skill graph:
 *
 *   base1 (tier0) ──▶ mid1 (tier1) ──┐
 *                                     ├──▶ top1 (tier2)
 *   base2 (tier0) ──▶ mid2 (tier1) ──┘
 */
class ProfileBuilderTest extends TestCase
{
    private const SKILLS = [
        'base1' => ['label' => 'Base 1', 'tier' => 0, 'importance' => 'critical', 'prerequisites' => []],
        'base2' => ['label' => 'Base 2', 'tier' => 0, 'importance' => 'standard', 'prerequisites' => []],
        'mid1' => ['label' => 'Mid 1', 'tier' => 1, 'importance' => 'standard', 'prerequisites' => ['base1']],
        'mid2' => ['label' => 'Mid 2', 'tier' => 1, 'importance' => 'standard', 'prerequisites' => ['base2']],
        'top1' => ['label' => 'Top 1', 'tier' => 2, 'importance' => 'standard', 'prerequisites' => ['mid1', 'mid2']],
    ];

    private function provider(): GradeDiagnosticProvider
    {
        $skills = self::SKILLS;

        return new class($skills) implements GradeDiagnosticProvider
        {
            public function __construct(private array $skills) {}

            public function grade(): string
            {
                return 'test';
            }

            public function skills(): array
            {
                return $this->skills;
            }

            public function questions(): array
            {
                return [];
            }

            public function startingPointFor(string $skillId): array
            {
                return ['lessonId' => $skillId, 'lessonPath' => "/lessons/{$skillId}", 'moduleNumber' => 1, 'moduleTitle' => 'Module 1'];
            }
        };
    }

    private function mastered(): array
    {
        return ['status' => 'mastered', 'confidence' => 0.85, 'attempts' => 2];
    }

    public function test_student_a_strong_everything_mastered_falls_back_to_the_capstone_recommendation(): void
    {
        $assessments = [
            'base1' => $this->mastered(), 'base2' => $this->mastered(),
            'mid1' => $this->mastered(), 'mid2' => $this->mastered(),
            'top1' => $this->mastered(),
        ];

        $profile = ProfileBuilder::build(self::SKILLS, $assessments, $this->provider());

        $this->assertCount(5, $profile['strengths']);
        $this->assertCount(0, $profile['reinforce']);
        $this->assertCount(0, $profile['gaps']);
        $this->assertNull($profile['recommendation']['skillId']);
        $this->assertSame('resolution-problemes', $profile['recommendation']['startingPoint']['lessonId']);
    }

    public function test_student_b_mixed_one_weak_skill_gets_a_targeted_recommendation(): void
    {
        $assessments = [
            'base1' => $this->mastered(), 'base2' => $this->mastered(),
            'mid1' => ['status' => 'reinforce', 'confidence' => 0.55, 'attempts' => 3],
            'mid2' => $this->mastered(),
            'top1' => $this->mastered(),
        ];

        $profile = ProfileBuilder::build(self::SKILLS, $assessments, $this->provider());

        $this->assertCount(4, $profile['strengths']);
        $this->assertCount(1, $profile['reinforce']);
        $this->assertCount(0, $profile['gaps']);
        $this->assertSame('mid1', $profile['recommendation']['skillId']);
        $this->assertSame('mid1', $profile['recommendation']['startingPoint']['lessonId']);
    }

    public function test_student_c_foundational_gap_propagates_downstream_and_points_at_the_root(): void
    {
        $assessments = [
            'base1' => ['status' => 'gap', 'confidence' => 0.2, 'attempts' => 3],
            'base2' => $this->mastered(),
            // mid1 and top1 were never directly tested — the engine should
            // have skipped them because base1 (mid1's prerequisite) was a
            // confirmed gap. The profile must still classify them, by
            // inference, as gaps — not silently omit them.
            'mid2' => $this->mastered(),
        ];

        $profile = ProfileBuilder::build(self::SKILLS, $assessments, $this->provider());

        $gapIds = array_column($profile['gaps'], 'skillId');
        $this->assertContains('base1', $gapIds);
        $this->assertContains('mid1', $gapIds);
        $this->assertContains('top1', $gapIds);
        $this->assertNotContains('base2', $gapIds);
        $this->assertNotContains('mid2', $gapIds);

        // The recommendation must point at the ROOT cause (base1, tier 0),
        // not a downstream symptom (mid1/top1) — this is the "personalized
        // starting point, not curriculum position" requirement (§15).
        $this->assertSame('base1', $profile['recommendation']['skillId']);

        // Directly-tested gaps are flagged as such; inferred ones are not,
        // since the student never actually saw a question for them.
        $baseEntry = collect($profile['gaps'])->firstWhere('skillId', 'base1');
        $mid1Entry = collect($profile['gaps'])->firstWhere('skillId', 'mid1');
        $this->assertTrue($baseEntry['wasDirectlyAssessed']);
        $this->assertFalse($mid1Entry['wasDirectlyAssessed']);
    }

    public function test_skills_never_tested_and_not_downstream_of_a_gap_are_excluded_not_guessed(): void
    {
        // Only base1 was ever assessed. Nothing else should appear anywhere
        // in the profile — an untested, non-inferable skill is not a claim.
        $assessments = ['base1' => $this->mastered()];

        $profile = ProfileBuilder::build(self::SKILLS, $assessments, $this->provider());

        $allIds = array_merge(
            array_column($profile['strengths'], 'skillId'),
            array_column($profile['reinforce'], 'skillId'),
            array_column($profile['gaps'], 'skillId'),
        );

        $this->assertSame(['base1'], $allIds);
    }
}
