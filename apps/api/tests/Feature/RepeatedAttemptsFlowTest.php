<?php

namespace Tests\Feature;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\ProgressEngine;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les scénarios d'acceptation anti-farming (§29 du prompt d'implémentation),
 * de bout en bout : par la porte de production, jusqu'à la ligne d'état.
 */
class RepeatedAttemptsFlowTest extends TestCase
{
    use RefreshDatabase;

    private LearningPoint $p1;

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2]);

        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        $lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'tayin-pgcd', 'title' => 'PGCD', 'status' => 'available', 'order' => 0]);
        $this->p1 = LearningPoint::create(['lesson_id' => $lesson->id, 'code' => '4am_tayin-pgcd_P1', 'title' => 'P1', 'order' => 1]);
    }

    private function practice(User $u, string $attemptId, string $exercise, string $question, string $outcome = 'correct', int $level = 1): void
    {
        app(ProgressEngine::class)->recordEvidence($u, 'tayin-pgcd', [
            'attemptId' => $attemptId, 'exerciseCode' => $exercise, 'questionId' => $question,
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'outcome' => $outcome,
            'learningPointRefs' => [['code' => '4am_tayin-pgcd_P1', 'role' => 'primary']],
            'level' => $level, 'difficulty' => $level, 'hintsUsed' => 0, 'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
        ]);
    }

    private function state(User $u): StudentLearningPointProgress
    {
        return StudentLearningPointProgress::where('user_id', $u->id)->where('learning_point_id', $this->p1->id)->firstOrFail();
    }

    public function test_the_same_question_ten_times_is_not_ten_distinct_questions(): void
    {
        $farmer = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $learner = User::factory()->create(['role' => 'student', 'grade' => '4am']);

        for ($i = 1; $i <= 10; $i++) {
            $this->practice($farmer, "f{$i}", 'ex-l1-001', 'q1');
            $this->practice($learner, "l{$i}", "ex-l1-00{$i}", 'q1');
        }

        $f = $this->state($farmer);
        $l = $this->state($learner);

        $this->assertSame(1, (int) $f->distinct_items_success);
        $this->assertSame(10, (int) $l->distinct_items_success);
        $this->assertLessThan((float) $l->confidence, (float) $f->confidence);
        // Dix fois la même question de niveau 1 : une seule démonstration
        // pleine, neuf reprises à 0,1 — la confiance n'atteint même pas le
        // seuil, et si elle l'atteignait, un seul item distinct ne suffirait pas.
        $this->assertSame(MasteryState::STATUS_REINFORCE, $f->status);
        $this->assertContains($f->status_reason, [MasteryState::REASON_THRESHOLD, MasteryState::REASON_INSUFFICIENT_EVIDENCE]);
        $this->assertLessThan(0.70, (float) $f->confidence);
        // Dix items distincts de niveau 1 : la confiance est là, mais aucune
        // preuve d'évaluation ni d'item difficile (D2).
        $this->assertSame(MasteryState::REASON_NEEDS_ASSESSMENT, $l->status_reason);
    }

    public function test_three_distinct_successes_beat_one_question_three_times(): void
    {
        $same = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $three = User::factory()->create(['role' => 'student', 'grade' => '4am']);

        foreach ([1, 2, 3] as $i) {
            $this->practice($same, "s{$i}", 'ex-l3-001', 'q1', 'correct', 3);
            $this->practice($three, "t{$i}", "ex-l3-00{$i}", 'q1', 'correct', 3);
        }

        $this->assertGreaterThan((float) $this->state($same)->confidence + 0.15, (float) $this->state($three)->confidence);
        $this->assertSame(3, (int) $this->state($three)->distinct_items_success);
        $this->assertSame(1, (int) $this->state($same)->distinct_items_success);
    }

    public function test_recovering_a_failed_question_counts_but_less_than_a_new_one(): void
    {
        $u = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $this->practice($u, 'a1', 'ex-l2-001', 'q1', 'incorrect', 2);
        $afterFail = (float) $this->state($u)->confidence;
        $this->practice($u, 'a2', 'ex-l2-001', 'q1', 'correct', 2);
        $afterRetry = (float) $this->state($u)->confidence;

        $v = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $this->practice($v, 'b1', 'ex-l2-001', 'q1', 'incorrect', 2);
        $this->practice($v, 'b2', 'ex-l2-002', 'q1', 'correct', 2);
        $afterNew = (float) $this->state($v)->confidence;

        $this->assertGreaterThan($afterFail, $afterRetry, 'reprendre et réussir compte');
        $this->assertGreaterThan($afterRetry, $afterNew, 'moins qu\'un item nouveau');
    }

    public function test_completion_and_mastery_are_independent(): void
    {
        // Un élève peut être `mastered` sans aucune ligne de progression de
        // leçon, et une leçon peut être `completed` sans état de maîtrise :
        // deux tables, deux questions. (La table de progression n'est pas
        // touchée par le moteur ; on vérifie qu'aucune ligne n'apparaît.)
        $u = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        foreach ([1, 2, 3] as $i) {
            $this->practice($u, "m{$i}", "ex-l5-00{$i}", 'q1', 'correct', 5);
        }
        $this->assertSame(MasteryState::STATUS_MASTERED, $this->state($u)->status);
        $this->assertDatabaseMissing('student_lesson_progress', ['user_id' => $u->id]);
    }
}
