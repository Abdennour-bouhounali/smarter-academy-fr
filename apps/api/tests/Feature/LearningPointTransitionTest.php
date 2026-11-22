<?php

namespace Tests\Feature;

use App\Domain\Progress\ProgressEngine;
use App\Domain\Progress\Replay\ReplayService;
use App\Models\LearningPointStateTransition;
use App\Models\StudentLearningPointProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * L'HISTOIRE de l'état canonique (learning_point_state_transitions) : une
 * ligne par changement réel, écrite dans la transaction de la preuve,
 * cohérente avec l'état courant, reconstructible depuis la preuve.
 */
class LearningPointTransitionTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    public function test_each_state_change_leaves_one_line_and_the_last_line_is_the_current_state(): void
    {
        config(['mastery.engine_version' => 2]);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);
        $student = $this->student();

        $this->answer($student, $lesson, $point, 'incorrect', 1, Carbon::parse('2026-09-01 10:00'));
        $this->answer($student, $lesson, $point, 'correct', 4, Carbon::parse('2026-09-10 10:00'));
        $this->answer($student, $lesson, $point, 'correct', 4, Carbon::parse('2026-09-20 10:00'));

        $rows = LearningPointStateTransition::orderBy('occurred_at')->get();
        $this->assertCount(3, $rows);
        $this->assertNull($rows[0]->status_before);
        $this->assertSame('gap', $rows[0]->status_after);
        $this->assertSame('live', $rows[0]->origin);
        $this->assertSame('2026-09-01', $rows[0]->occurred_at->toDateString());
        // Chaque ligne part de là où la précédente s'est arrêtée.
        $this->assertSame($rows[0]->status_after, $rows[1]->status_before);
        $this->assertEqualsWithDelta($rows[1]->confidence_after, $rows[2]->confidence_before, 0.0001);

        $state = StudentLearningPointProgress::first();
        $this->assertSame($state->status, $rows[2]->status_after);
        $this->assertEqualsWithDelta((float) $state->confidence, $rows[2]->confidence_after, 0.0001);
    }

    public function test_a_duplicate_attempt_or_an_inert_answer_writes_no_history(): void
    {
        config(['mastery.engine_version' => 2]);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);
        $student = $this->student();

        $this->answer($student, $lesson, $point, 'correct', 3);
        $this->answer($student, $lesson, $point, 'abandoned', 3);
        $this->assertSame(1, LearningPointStateTransition::count());

        // Le même attempt_id rejoué : idempotent, aucune ligne de plus.
        $engine = app(ProgressEngine::class);
        $payload = ['attemptId' => 'dup-1', 'exerciseCode' => 'ex-l3-900', 'questionId' => 'q1', 'assessmentType' => 'practice_exercise',
            'outcome' => 'correct', 'learningPointRefs' => [['code' => $point->code, 'role' => 'primary']], 'level' => 3, 'difficulty' => 3, 'evaluatedBy' => 'server'];
        $engine->recordEvidence($student, $lesson->code, $payload);
        $engine->recordEvidence($student, $lesson->code, $payload);
        $this->assertSame(2, LearningPointStateTransition::count());
    }

    public function test_history_is_rebuilt_from_evidence_and_the_rebuild_is_idempotent(): void
    {
        config(['mastery.engine_version' => 2]);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);
        $student = $this->student();
        $this->answer($student, $lesson, $point, 'incorrect', 1, Carbon::parse('2026-09-01'));
        $this->answer($student, $lesson, $point, 'correct', 4, Carbon::parse('2026-09-05'));
        $live = LearningPointStateTransition::orderBy('id')->get(['status_before', 'status_after', 'confidence_after'])->toArray();

        // Comme si la preuve précédait l'histoire : on l'efface, on la reconstruit.
        DB::table('learning_point_state_transitions')->delete();
        $this->artisan('smarter:mastery:transitions-backfill', ['--all' => true])->assertSuccessful();
        $rebuilt = LearningPointStateTransition::orderBy('id')->get();
        $this->assertSame($live, $rebuilt->map->only(['status_before', 'status_after', 'confidence_after'])->all());
        $this->assertSame(['backfill'], $rebuilt->pluck('origin')->unique()->values()->all());

        $this->artisan('smarter:mastery:transitions-backfill', ['--all' => true])->assertSuccessful();
        $this->assertSame(2, LearningPointStateTransition::count());
        $this->artisan('smarter:mastery:transitions-backfill', ['--all' => true, '--rebuild' => true])->assertSuccessful();
        $this->assertSame(2, LearningPointStateTransition::count());
    }

    public function test_a_replay_that_changes_the_state_is_recorded_as_a_recalculation(): void
    {
        config(['mastery.engine_version' => 2]);
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $point = $this->point($lesson, 1);
        $student = $this->student();
        $this->answer($student, $lesson, $point, 'correct', 4);
        StudentLearningPointProgress::query()->update(['confidence' => 0.1, 'status' => 'gap']);

        app(ReplayService::class)->recompute($student->id, $point->id);
        $last = LearningPointStateTransition::orderByDesc('id')->first();
        $this->assertSame('replay', $last->origin);
        $this->assertSame('gap', $last->status_before);
    }
}
