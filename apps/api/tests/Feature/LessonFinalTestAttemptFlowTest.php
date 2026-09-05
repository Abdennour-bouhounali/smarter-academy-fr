<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonFinalTestAttemptFlowTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => '6ème', 'level' => 'college', 'order' => 0]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'nombres-entiers',
            'title' => 'Nombres entiers', 'status' => 'available',
            'duration_minutes' => 129, 'tier' => 'free', 'order' => 0,
        ]);
    }

    private function studentToken(): array
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $token = $user->createToken('student-token')->plainTextToken;

        return [$user, $token];
    }

    private function putAttempt(string $token, array $overrides = [], string $lessonCode = 'nombres-entiers')
    {
        return $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/lessons/{$lessonCode}/final-test-attempt", array_merge([
                'score' => 5,
                'totalQuestions' => 7,
                'answers' => [
                    ['questionCode' => 'q1', 'picked' => 1, 'isCorrect' => true, 'correctAnswer' => 1],
                ],
                'submittedAt' => '2026-08-20T10:00:00Z',
            ], $overrides));
    }

    public function test_guests_get_401(): void
    {
        $this->putJson('/api/v1/lessons/nombres-entiers/final-test-attempt', [])->assertStatus(401);
        $this->getJson('/api/v1/lessons/nombres-entiers/final-test-attempt')->assertStatus(401);
        $this->deleteJson('/api/v1/lessons/nombres-entiers/final-test-attempt')->assertStatus(401);
    }

    public function test_unknown_lesson_is_404_on_every_verb(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");

        $this->putAttempt($token, [], 'does-not-exist')->assertStatus(404);
        $auth->getJson('/api/v1/lessons/does-not-exist/final-test-attempt')->assertStatus(404);
        $auth->deleteJson('/api/v1/lessons/does-not-exist/final-test-attempt')->assertStatus(404);
    }

    public function test_show_returns_null_when_never_attempted(): void
    {
        [, $token] = $this->studentToken();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/lessons/nombres-entiers/final-test-attempt')
            ->assertStatus(200)
            ->assertExactJson(['attempt' => null]);
    }

    public function test_put_creates_and_show_returns_it(): void
    {
        [$user, $token] = $this->studentToken();

        $put = $this->putAttempt($token);
        $put->assertStatus(200)->assertJsonPath('attempt.score', 5)->assertJsonPath('attempt.totalQuestions', 7);

        $this->assertDatabaseHas('lesson_final_test_attempts', [
            'user_id' => $user->id,
            'lesson_id' => $this->lesson->id,
            'score' => 5,
            'total_questions' => 7,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/lessons/nombres-entiers/final-test-attempt')
            ->assertStatus(200)
            ->assertJsonPath('attempt.score', 5)
            ->assertJsonPath('attempt.answers.0.questionCode', 'q1');
    }

    public function test_a_second_put_overwrites_the_first_no_history_kept(): void
    {
        [$user, $token] = $this->studentToken();

        $this->putAttempt($token, ['score' => 3, 'submittedAt' => '2026-08-20T09:00:00Z']);
        $this->putAttempt($token, ['score' => 7, 'submittedAt' => '2026-08-20T11:00:00Z']);

        $this->assertDatabaseCount('lesson_final_test_attempts', 1);
        $this->assertDatabaseHas('lesson_final_test_attempts', [
            'user_id' => $user->id,
            'lesson_id' => $this->lesson->id,
            'score' => 7,
        ]);
    }

    public function test_delete_clears_the_attempt_redo(): void
    {
        [, $token] = $this->studentToken();

        $this->putAttempt($token);
        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/v1/lessons/nombres-entiers/final-test-attempt')
            ->assertStatus(200);

        $this->assertDatabaseCount('lesson_final_test_attempts', 0);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/lessons/nombres-entiers/final-test-attempt')
            ->assertStatus(200)
            ->assertExactJson(['attempt' => null]);
    }

    public function test_attempts_are_isolated_per_user(): void
    {
        [, $tokenA] = $this->studentToken();
        [, $tokenB] = $this->studentToken();

        $this->putAttempt($tokenA, ['score' => 7]);

        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->getJson('/api/v1/lessons/nombres-entiers/final-test-attempt')
            ->assertStatus(200)
            ->assertExactJson(['attempt' => null]);
    }

    public function test_malformed_payload_is_422(): void
    {
        [, $token] = $this->studentToken();

        $this->putAttempt($token, ['score' => -1])->assertStatus(422);
        $this->putAttempt($token, ['totalQuestions' => 0])->assertStatus(422);
        $this->putAttempt($token, ['answers' => 'not-an-array'])->assertStatus(422);
        $this->putAttempt($token, ['submittedAt' => 'not-a-date'])->assertStatus(422);
    }
}
