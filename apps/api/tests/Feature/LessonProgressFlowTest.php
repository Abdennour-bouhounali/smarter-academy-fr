<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonProgressFlowTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => '6ème', 'level' => 'college', 'order' => 0]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions-1',
            'title' => 'Fractions — Partie 1', 'status' => 'available',
            'duration_minutes' => 45, 'tier' => 'premium', 'order' => 0,
        ]);
    }

    private function studentToken(): array
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $token = $user->createToken('student-token')->plainTextToken;

        return [$user, $token];
    }

    private function putProgress(string $token, array $overrides = [], string $lessonCode = 'fractions-1')
    {
        return $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/lessons/{$lessonCode}/progress", array_merge([
                'completedModules' => ['1'],
                'currentModule' => 2,
                'status' => 'in_progress',
                'lastActivityAt' => '2026-08-18T10:00:00Z',
            ], $overrides));
    }

    public function test_guests_get_401(): void
    {
        $this->putJson('/api/v1/lessons/fractions-1/progress', [])->assertStatus(401);
        $this->getJson('/api/v1/students/me/lesson-progress')->assertStatus(401);
    }

    public function test_unknown_lesson_is_404(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, [], 'does-not-exist')->assertStatus(404);
    }

    public function test_first_put_creates_the_row_and_returns_it(): void
    {
        [$user, $token] = $this->studentToken();

        $response = $this->putProgress($token);

        $response->assertStatus(200)->assertJsonPath('progress.currentModule', 2);
        $this->assertDatabaseHas('student_lesson_progress', [
            'user_id' => $user->id,
            'lesson_id' => $this->lesson->id,
            'status' => 'in_progress',
            'current_module' => 2,
        ]);
    }

    public function test_completed_modules_merge_as_a_union_across_devices(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, ['completedModules' => ['1', '2'], 'lastActivityAt' => '2026-08-18T10:00:00Z']);
        // Device B flushes an older snapshot with a disjoint completion.
        $response = $this->putProgress($token, [
            'completedModules' => ['3'],
            'currentModule' => 3,
            'lastActivityAt' => '2026-08-18T09:00:00Z',
        ]);

        $merged = $response->json('progress.completedModules');
        sort($merged);
        $this->assertSame(['1', '2', '3'], $merged);
    }

    public function test_a_stale_snapshot_cannot_move_the_current_module_backwards(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, ['currentModule' => 5, 'lastActivityAt' => '2026-08-18T10:00:00Z']);
        $response = $this->putProgress($token, ['currentModule' => 1, 'lastActivityAt' => '2026-08-18T08:00:00Z']);

        $response->assertJsonPath('progress.currentModule', 5);
        // A newer snapshot does move it.
        $this->putProgress($token, ['currentModule' => 6, 'lastActivityAt' => '2026-08-18T11:00:00Z'])
            ->assertJsonPath('progress.currentModule', 6);
    }

    public function test_status_never_downgrades_and_completed_at_is_set_once(): void
    {
        [, $token] = $this->studentToken();

        $first = $this->putProgress($token, ['status' => 'completed', 'lastActivityAt' => '2026-08-18T10:00:00Z']);
        $completedAt = $first->json('progress.completedAt');
        $this->assertNotNull($completedAt);

        $later = $this->putProgress($token, ['status' => 'in_progress', 'lastActivityAt' => '2026-08-18T11:00:00Z']);

        $later->assertJsonPath('progress.status', 'completed');
        $this->assertSame($completedAt, $later->json('progress.completedAt'));
    }

    public function test_mastery_path_completion_is_recorded_and_immutable(): void
    {
        [, $token] = $this->studentToken();

        // "Je pense déjà maîtriser": the always-open final evaluation
        // demonstrated mastery — no modules were completed.
        $response = $this->putProgress($token, [
            'completedModules' => [],
            'currentModule' => null,
            'status' => 'completed',
            'completionMode' => 'mastery',
            'lastActivityAt' => '2026-08-18T10:00:00Z',
        ]);

        $response->assertJsonPath('progress.completionMode', 'mastery');

        // A later ordinary snapshot cannot rewrite how the lesson was completed.
        $this->putProgress($token, ['lastActivityAt' => '2026-08-18T11:00:00Z'])
            ->assertJsonPath('progress.completionMode', 'mastery');
    }

    public function test_path_completion_defaults_completion_mode_to_path(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, ['status' => 'completed'])
            ->assertJsonPath('progress.completionMode', 'path');
    }

    public function test_invalid_completion_mode_is_422(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, ['status' => 'completed', 'completionMode' => 'guessed'])
            ->assertStatus(422);
    }

    public function test_replaying_the_same_snapshot_is_idempotent(): void
    {
        [$user, $token] = $this->studentToken();

        $this->putProgress($token);
        $this->putProgress($token);

        $this->assertDatabaseCount('student_lesson_progress', 1);
        $row = $user->fresh();
        $this->assertSame(1, \App\Models\StudentLessonProgress::where('user_id', $row->id)->count());
        $this->assertSame(['1'], \App\Models\StudentLessonProgress::where('user_id', $row->id)->first()->completed_modules);
    }

    public function test_index_returns_only_the_authenticated_users_rows_keyed_by_lesson_code(): void
    {
        [, $tokenA] = $this->studentToken();
        [, $tokenB] = $this->studentToken();

        $this->putProgress($tokenA);

        // The guard caches the resolved user within one test — reset it so
        // the next request authenticates as B, not the remembered A.
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->getJson('/api/v1/students/me/lesson-progress')
            ->assertStatus(200)
            ->assertExactJson(['progress' => []]);

        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/v1/students/me/lesson-progress')
            ->assertStatus(200)
            ->assertJsonPath('progress.fractions-1.currentModule', 2);
    }

    public function test_malformed_payload_is_422(): void
    {
        [, $token] = $this->studentToken();

        $this->putProgress($token, ['status' => 'abandoned'])->assertStatus(422);
        $this->putProgress($token, ['completedModules' => 'not-an-array'])->assertStatus(422);
        $this->putProgress($token, ['lastActivityAt' => 'not-a-date'])->assertStatus(422);
    }
}
