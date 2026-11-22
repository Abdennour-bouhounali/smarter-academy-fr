<?php

namespace Tests\Feature;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\MasteryReplay;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Exploitation de Mastery V2 : rejeux demandés par l'administration,
 * vérification nocturne, recommandations et explication côté élève.
 */
class MasteryOperationsTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LearningPoint $p1;

    private LearningPoint $p2;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2]);

        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        $this->lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'tayin-pgcd', 'title' => 'PGCD', 'status' => 'available', 'order' => 0]);
        $this->p1 = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_tayin-pgcd_P1', 'title' => 'P1', 'order' => 1]);
        $this->p2 = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_tayin-pgcd_P2', 'title' => 'P2', 'order' => 2]);
        LessonModule::create(['lesson_id' => $this->lesson->id, 'code' => '2', 'number' => 2, 'title' => 'معارف', 'stage' => 'formalization', 'teaches_learning_point_codes' => ['4am_tayin-pgcd_P1']]);
        $this->student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
    }

    private function answer(string $attemptId, string $lp, string $exercise, string $outcome, int $level): void
    {
        app(ProgressEngine::class)->recordEvidence($this->student, 'tayin-pgcd', [
            'attemptId' => $attemptId, 'exerciseCode' => $exercise, 'questionId' => 'q1',
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'outcome' => $outcome,
            'learningPointRefs' => [['code' => $lp, 'role' => 'primary']], 'level' => $level,
            'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
        ]);
    }

    public function test_an_admin_replay_runs_as_a_job_and_records_its_diff(): void
    {
        $this->answer('a1', $this->p1->code, 'ex-1', 'correct', 3);
        $admin = User::factory()->create(['role' => 'admin']);

        $r = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/mastery/replays', [
            'engineVersion' => 1, 'scope' => 'lesson', 'scopeId' => 'tayin-pgcd', 'dryRun' => true,
        ])->assertStatus(202);

        // QUEUE_CONNECTION=sync en test : le job a déjà tourné.
        $ticket = MasteryReplay::findOrFail($r->json('replay.id'));
        $this->assertSame(MasteryReplay::STATUS_COMPLETED, $ticket->status);
        $this->assertSame(1, (int) $ticket->pairs_total);
        $this->assertSame(2, (int) StudentLearningPointProgress::first()->engine_version, 'dry-run : rien écrit');

        $this->actingAs($admin, 'sanctum')->getJson("/api/v1/admin/mastery/replays/{$ticket->id}")
            ->assertOk()->assertJsonPath('replay.status', 'completed');
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/mastery/replays', [
            'engineVersion' => 2, 'scope' => 'lesson', 'scopeId' => 'n-existe-pas',
        ])->assertStatus(422);
        $this->actingAs($this->student, 'sanctum')->getJson('/api/v1/admin/mastery/replays')->assertForbidden();
    }

    public function test_the_nightly_verify_passes_on_consistent_state_and_fails_on_a_tampered_row(): void
    {
        $this->answer('a1', $this->p1->code, 'ex-1', 'correct', 3);
        $this->artisan('smarter:mastery:verify', ['--sample' => 10])->assertSuccessful();

        StudentLearningPointProgress::query()->update(['confidence' => 0.99]);
        $this->artisan('smarter:mastery:verify', ['--sample' => 10])->assertFailed();
    }

    public function test_recommendations_follow_the_canonical_state_and_never_block(): void
    {
        // P1 en gap (échec facile), P2 jamais vu.
        $this->answer('a1', $this->p1->code, 'ex-1', 'incorrect', 1);

        $r = $this->actingAs($this->student, 'sanctum')->getJson('/api/v1/students/me/lessons/tayin-pgcd/recommendations')->assertOk();
        $recs = collect($r->json('recommendations'))->keyBy('learningPoint.code');

        $this->assertSame('reteach', $recs[$this->p1->code]['kind']);
        $this->assertSame([['number' => 2, 'title' => 'معارف']], $recs[$this->p1->code]['modules']);
        $this->assertSame('start', $recs[$this->p2->code]['kind']);
        $this->assertSame($this->p1->code, $r->json('recommendations.0.learningPoint.code'), 'le plus urgent d\'abord');
    }

    public function test_the_student_explanation_is_derived_from_state_and_recent_evidence(): void
    {
        $this->answer('a1', $this->p1->code, 'ex-1', 'correct', 5);
        $this->answer('a2', $this->p1->code, 'ex-1', 'correct', 5);

        $e = $this->actingAs($this->student, 'sanctum')->getJson("/api/v1/students/me/learning-points/{$this->p1->code}/explanation")->assertOk();
        $this->assertSame(1, $e->json('explanation.evidence.distinctItemsSuccess'));
        $this->assertSame(['repeat_after_success', 'first'], array_column($e->json('explanation.recent'), 'kind'));
        $this->assertSame('reinforce', $e->json('explanation.status'));

        // Le profil filtré par leçon porte les champs V2.
        $p = $this->actingAs($this->student, 'sanctum')->getJson('/api/v1/students/me/learning-profile?lesson=tayin-pgcd')->assertOk();
        $row = $p->json('profile.currentMastery.0.lessons.0.learningPoints.0');
        $this->assertSame(1, $row['distinctItemsSuccess']);
        $this->assertSame(2, $row['engineVersion']);
        $this->assertSame('fresh', $row['freshness']);
        $this->assertArrayHasKey('statusReason', $row);

        $this->actingAs($this->student, 'sanctum')->getJson('/api/v1/students/me/learning-profile?lesson=autre')->assertOk()
            ->assertJsonPath('profile.currentMastery', []);
    }
}
