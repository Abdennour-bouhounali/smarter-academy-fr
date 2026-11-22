<?php

namespace Tests\Feature;

use App\Domain\Progress\Engine\EngineRegistry;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\ProgressEngine;
use App\Domain\Progress\Replay\ReplayService;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\MasteryReplay;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

/**
 * Le rejeu (Mastery V2, phases 2 et 5) : déterministe, égal à l'état
 * enregistré, versionné, réversible — et la preuve reste immuable.
 */
class MasteryReplayTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LearningPoint $p1;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2]);

        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        $this->lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'tayin-pgcd', 'title' => 'PGCD', 'status' => 'available', 'order' => 0]);
        $this->p1 = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_tayin-pgcd_P1', 'title' => 'P1', 'order' => 1]);
        $this->student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
    }

    private function record(string $attemptId, string $questionId, string $outcome, string $type = ProgressEngine::SOURCE_ASSESSMENT, ?string $exercise = null, ?int $level = null): void
    {
        app(ProgressEngine::class)->recordEvidence($this->student, 'tayin-pgcd', [
            'attemptId' => $attemptId,
            'exerciseCode' => $exercise,
            'questionId' => $questionId,
            'assessmentType' => $type,
            'outcome' => $outcome,
            'learningPointCodes' => ['4am_tayin-pgcd_P1'],
            'level' => $level,
            'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
        ]);
    }

    private function row(): StudentLearningPointProgress
    {
        return StudentLearningPointProgress::where('user_id', $this->student->id)->where('learning_point_id', $this->p1->id)->firstOrFail();
    }

    public function test_stored_state_equals_replayed_state_and_replay_is_deterministic(): void
    {
        $this->record('a1', 'E1', 'correct');
        $this->record('a2', 'E2', 'incorrect');
        $this->record('a3', 'E1', 'correct');                         // repeat_after_success
        $this->record('a4', 'q1', 'partially_correct', ProgressEngine::SOURCE_PRACTICE, 'ex-l2-001', 2);
        $this->record('a5', 'q1', 'syntax_error', ProgressEngine::SOURCE_PRACTICE, 'ex-l2-001', 2);
        $this->record('a6', 'q2', 'correct', ProgressEngine::SOURCE_PRACTICE, 'ex-l4-001', 4);

        $replay = app(ReplayService::class);
        $this->assertTrue($replay->matchesStored($this->student->id, $this->p1->id));

        $once = $replay->replay($this->student->id, $this->p1->id);
        $twice = $replay->replay($this->student->id, $this->p1->id);
        $this->assertEquals($once, $twice, 'même preuve, même version ⇒ même état');

        $row = $this->row();
        $this->assertSame(2, (int) $row->engine_version);
        $this->assertSame(5, (int) $row->attempts, 'la preuve inerte ne compte pas');
        // E1 (première réussite) et q2 : deux items distincts réussis. La
        // reprise d'E1 n'en ajoute pas, le partiel sur q1 n'est pas une réussite.
        $this->assertSame(2, (int) $row->distinct_items_success);
    }

    public function test_the_demonstration_kind_is_stored_on_each_evidence_row(): void
    {
        $this->record('a1', 'E1', 'incorrect');
        $this->record('a2', 'E1', 'correct');
        $this->record('a3', 'E1', 'correct');

        $kinds = LearningEvidence::where('user_id', $this->student->id)->orderBy('id')->pluck('demonstration_kind', 'attempt_id')->all();
        $this->assertSame([
            'a1' => EvidenceEvent::KIND_FIRST,
            'a2' => EvidenceEvent::KIND_RETRY_AFTER_FAILURE,
            'a3' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS,
        ], $kinds);
        $this->assertSame([1, 2, 3], LearningEvidence::where('user_id', $this->student->id)->orderBy('id')->pluck('attempt_number')->map(fn ($n) => (int) $n)->all());
    }

    public function test_rollback_to_v1_reproduces_the_historical_formula_and_forward_to_v2_restores_the_state(): void
    {
        $this->record('a1', 'E1', 'correct');
        $this->record('a2', 'E2', 'correct');
        $v2 = ReplayService::snapshot(MasteryState::fromRow($this->row()), 2);

        $engines = app(EngineRegistry::class);
        $replay = app(ReplayService::class);

        $back = $replay->recompute($this->student->id, $this->p1->id, $engines->version(1));
        $this->assertSame(1, $back['after']['engineVersion']);
        $this->assertSame(0.786, $back['after']['confidence'], '0,5 → 0,643 → 0,786 : l\'arithmétique V1, à l\'identique');
        $this->assertSame('mastered', $back['after']['status'], 'la V1 n\'exigeait aucune preuve minimale');
        $this->assertSame(1, (int) $this->row()->engine_version);
        $this->assertTrue($replay->matchesStored($this->student->id, $this->p1->id), 'la ligne V1 se rejoue en V1');

        $forward = $replay->recompute($this->student->id, $this->p1->id, $engines->version(2));
        $this->assertSame($v2, $forward['after']);
    }

    public function test_a_row_written_by_another_engine_version_is_replayed_on_the_next_write(): void
    {
        $this->record('a1', 'E1', 'correct');
        StudentLearningPointProgress::where('id', $this->row()->id)->update(['engine_version' => 1, 'distinct_items_success' => 0]);

        $this->record('a2', 'E2', 'correct');

        $row = $this->row();
        $this->assertSame(2, (int) $row->engine_version);
        $this->assertSame(2, (int) $row->distinct_items_success, 'l\'état a été reconstruit, pas incrémenté à partir d\'une ligne d\'une autre version');
        $this->assertTrue(app(ReplayService::class)->matchesStored($this->student->id, $this->p1->id));
    }

    public function test_the_replay_command_records_a_journal_row_and_a_dry_run_writes_nothing(): void
    {
        $this->record('a1', 'E1', 'correct');
        $before = $this->row()->toArray();

        $this->artisan('smarter:mastery:replay', ['--all' => true, '--dry-run' => true, '--engine' => 1])->assertSuccessful();

        $this->assertEquals($before, $this->row()->toArray(), 'un dry-run ne touche pas l\'état');
        $run = MasteryReplay::latest('id')->first();
        $this->assertTrue($run->dry_run);
        $this->assertSame(MasteryReplay::STATUS_COMPLETED, $run->status);
        $this->assertSame(1, (int) $run->pairs_total);
        $this->assertSame(1, (int) $run->pairs_changed, 'V2 → V1 change la ligne (version)');

        $this->artisan('smarter:mastery:replay', ['--user' => $this->student->id, '--engine' => 1])->assertSuccessful();
        $this->assertSame(1, (int) $this->row()->engine_version);
    }

    public function test_evidence_is_append_only(): void
    {
        $this->record('a1', 'E1', 'correct');
        $evidence = LearningEvidence::first();

        $this->expectException(LogicException::class);
        $evidence->update(['is_correct' => false]);
    }

    public function test_the_backfill_completes_legacy_rows_deterministically(): void
    {
        // Une preuve « d'avant » : pas d'item_key, pas d'issue, pas de difficulté.
        $legacy = LearningEvidence::create([
            'user_id' => $this->student->id, 'lesson_id' => $this->lesson->id,
            'question_code' => 'E1', 'attempt_id' => 'old-1', 'is_correct' => true,
            'assessment_type' => 'assessment', 'submitted_at' => now()->subDay(),
        ]);
        $legacy->learningPoints()->attach([$this->p1->id => ['role' => 'primary']]);

        $this->artisan('smarter:evidence:backfill', ['--dry-run' => true])->assertSuccessful();
        $this->assertNull($legacy->fresh()->item_key);

        $this->artisan('smarter:evidence:backfill')->assertSuccessful();
        $fresh = $legacy->fresh();
        $this->assertSame('final_test:tayin-pgcd:final:E1', $fresh->item_key);
        $this->assertSame('correct', $fresh->outcome);
        $this->assertSame(3, (int) $fresh->difficulty);
        $this->assertSame(1, (int) $fresh->attempt_number);
        $this->assertSame(EvidenceEvent::KIND_FIRST, $fresh->demonstration_kind);
        $this->assertSame(EvidenceEvent::EVALUATED_BY_CLIENT_LEGACY, $fresh->evaluated_by);

        // Idempotent : rien à compléter la seconde fois.
        $this->artisan('smarter:evidence:backfill')->expectsOutputToContain('0 preuve(s) complétée(s)')->assertSuccessful();
    }
}
