<?php

namespace Tests\Unit\Classroom;

use App\Domain\Classroom\Insights\LearningTrend;
use Tests\TestCase;

class LearningTrendTest extends TestCase
{
    public function test_unassessed_is_not_a_low_level(): void
    {
        // « non évalué » → « ثغرة » : une première évaluation, pas un recul.
        $this->assertSame(LearningTrend::FIRST_ASSESSED, LearningTrend::direction('unassessed', 'gap'));
        $this->assertSame(LearningTrend::FIRST_ASSESSED, LearningTrend::direction(null, 'mastered'));
        $this->assertSame(LearningTrend::NOT_ASSESSED, LearningTrend::direction(null, 'unassessed'));
    }

    public function test_directions_follow_the_engine_order(): void
    {
        $this->assertSame(LearningTrend::IMPROVED, LearningTrend::direction('gap', 'reinforce'));
        $this->assertSame(LearningTrend::IMPROVED, LearningTrend::direction('reinforce', 'mastered'));
        $this->assertSame(LearningTrend::DECLINED, LearningTrend::direction('mastered', 'gap'));
        $this->assertSame(LearningTrend::UNCHANGED, LearningTrend::direction('reinforce', 'reinforce'));
    }

    public function test_difficulty_scope_counts_students_not_averages(): void
    {
        $this->assertSame(LearningTrend::SCOPE_NONE, LearningTrend::difficultyScope(0, 10));
        $this->assertSame(LearningTrend::SCOPE_ISOLATED, LearningTrend::difficultyScope(1, 10));
        $this->assertSame(LearningTrend::SCOPE_SMALL_GROUP, LearningTrend::difficultyScope(2, 10));
        $this->assertSame(LearningTrend::SCOPE_CLASS_WIDE, LearningTrend::difficultyScope(6, 10));
        // Deux élèves en ثغرة sur deux évalués : trop peu d'évalués pour dire « toute la classe ».
        $this->assertSame(LearningTrend::SCOPE_SMALL_GROUP, LearningTrend::difficultyScope(2, 2));
    }
}
