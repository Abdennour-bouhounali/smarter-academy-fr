<?php

namespace Tests\Feature;

use App\Domain\GameWorld\ClaimVerifier;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les preuves du monde de jeu (GameEvidenceController) : le serveur recalcule
 * le verdict à partir des nombres, et ne croit jamais le navigateur.
 */
class GameEvidenceTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();
        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'أنساب الأعداد', 'order' => 0]);
        $this->lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'qasim-adad-tabii', 'title' => 'قاسم عدد طبيعي', 'status' => 'available', 'order' => 0]);
        foreach ([1, 2, 3, 4] as $i) {
            LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => "4am_qasim-adad-tabii_P{$i}", 'title' => "P{$i}", 'order' => $i]);
        }
        $other = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'autre', 'title' => 'Autre', 'status' => 'available', 'order' => 1]);
        LearningPoint::create(['lesson_id' => $other->id, 'code' => '4am_autre_P1', 'title' => 'P1', 'order' => 1]);
    }

    private function student(string $role = 'student'): array
    {
        $user = User::factory()->create(['role' => $role, 'grade' => '4am']);

        return [$user, $user->createToken('t')->plainTextToken];
    }

    private function send(string $token, array $overrides = [], string $lesson = 'qasim-adad-tabii')
    {
        return $this->withHeader('Authorization', "Bearer {$token}")->postJson("/api/v1/lessons/{$lesson}/game-evidence", array_merge([
            'attemptId' => 'gw-0001',
            'learningPoint' => '4am_qasim-adad-tabii_P1',
            'context' => 'trainer',
            'claim' => ['kind' => 'division', 'a' => 756, 'b' => 36, 'q' => 21, 'r' => 0, 'fits' => true],
        ], $overrides));
    }

    public function test_the_two_verifiers_share_one_fixture(): void
    {
        $fixture = json_decode(file_get_contents(base_path('tests/Fixtures/game-claims.json')), true);
        $this->assertGreaterThan(30, count($fixture['cases']));
        foreach ($fixture['cases'] as $case) {
            $this->assertSame($case['ok'], ClaimVerifier::verify($case['claim']), json_encode($case['claim']));
        }
    }

    public function test_a_right_first_try_becomes_evidence_on_its_learning_point(): void
    {
        [$user, $token] = $this->student();

        $this->send($token)->assertStatus(201)->assertJsonPath('outcome', 'correct');

        $this->assertDatabaseHas('learning_evidence', ['user_id' => $user->id, 'lesson_id' => $this->lesson->id, 'question_code' => 'gameworld:division-756x36', 'is_correct' => true]);
        $this->assertDatabaseHas('student_learning_point_progress', ['user_id' => $user->id, 'attempts' => 1]);
    }

    public function test_the_server_recomputes_the_verdict_and_never_trusts_the_browser(): void
    {
        [$user, $token] = $this->student();

        // a wrong division, sent with a flag that claims it is right: the flag is ignored
        $this->send($token, ['isCorrect' => true, 'claim' => ['kind' => 'division', 'a' => 756, 'b' => 32, 'q' => 22, 'r' => 52, 'fits' => false]])
            ->assertStatus(201)->assertJsonPath('outcome', 'incorrect');

        $this->assertDatabaseHas('learning_evidence', ['user_id' => $user->id, 'question_code' => 'gameworld:division-756x32', 'is_correct' => false]);
    }

    public function test_the_same_attempt_counts_once(): void
    {
        [, $token] = $this->student();

        $this->send($token)->assertStatus(201);
        $this->send($token)->assertStatus(200)->assertJsonPath('duplicate', true);
        $this->assertDatabaseCount('learning_evidence', 1);
    }

    public function test_it_refuses_an_unknown_claim_a_foreign_learning_point_and_an_unknown_lesson(): void
    {
        [, $token] = $this->student();

        $this->send($token, ['claim' => ['kind' => 'truth', 'a' => 1, 'b' => 1]])->assertStatus(422);
        $this->send($token, ['attemptId' => 'gw-0002', 'learningPoint' => '4am_autre_P1'])->assertStatus(422);
        $this->send($token, ['attemptId' => 'gw-0003'], 'lecon-inconnue')->assertStatus(404);
        $this->assertDatabaseCount('learning_evidence', 0);
    }

    public function test_a_teacher_writes_no_evidence(): void
    {
        [, $teacher] = $this->student('teacher');

        $this->send($teacher)->assertStatus(403);
        $this->assertDatabaseCount('learning_evidence', 0);
    }

    public function test_a_visitor_writes_no_evidence(): void
    {
        $this->postJson('/api/v1/lessons/qasim-adad-tabii/game-evidence', [])->assertStatus(401);
    }

    public function test_a_game_alone_never_declares_a_learning_point_mastered(): void
    {
        [$user, $token] = $this->student();

        foreach (range(1, 12) as $i) {
            $this->send($token, ['attemptId' => "gw-m{$i}", 'context' => 'case', 'claim' => ['kind' => 'division', 'a' => 36 * $i, 'b' => 36, 'q' => $i, 'r' => 0, 'fits' => true]])->assertStatus(201);
        }

        $status = \DB::table('student_learning_point_progress')->where('user_id', $user->id)->value('status');
        $this->assertNotSame('mastered', $status, 'mastery needs the test (إختبار أولي), never the game alone');
    }
}
