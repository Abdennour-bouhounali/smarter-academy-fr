<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Http\Controllers\PracticeSessionController;
use App\Models\ExerciseAttempt;
use App\Models\PracticeSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * GET /lessons/{code}/practice/overview sur le VRAI contenu 4AM
 * (`qasim-adad-tabii`) — et l'incident du 2026-09-25 : en production, le
 * pipeline ne livrait pas content/practice/, PracticeCapability lisait une
 * liste vide, et CHAQUE aperçu répondait 422 « La pratique n'est pas encore
 * disponible » pendant que le frontend (qui embarque active.json au build)
 * proposait la pratique.
 */
class PracticeOverviewTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private User $student;

    private string $tmp;

    protected function setUp(): void
    {
        parent::setUp();
        PracticeCapability::forget();
        // Toute l'unité, comme en production : le docteur vérifie chaque leçon active.
        $this->challengeCurriculum(json_decode(file_get_contents(base_path('../../content/practice/active.json')), true));
        $this->student = $this->student();
        $this->tmp = sys_get_temp_dir().'/practice-overview-'.Str::random(8);
        mkdir($this->tmp);
    }

    protected function tearDown(): void
    {
        array_map('unlink', glob($this->tmp.'/*') ?: []);
        @rmdir($this->tmp);
        PracticeCapability::forget();
        parent::tearDown();
    }

    private function overview(string $code = 'qasim-adad-tabii')
    {
        return $this->withToken($this->tokenOf($this->student))->getJson("/api/v1/lessons/{$code}/practice/overview");
    }

    public function test_the_affected_lesson_answers_200_with_its_levels_and_points_for_a_new_student(): void
    {
        $r = $this->overview()->assertOk()->assertJsonPath('success', true)->assertJsonPath('lesson.code', 'qasim-adad-tabii');

        // Les niveaux viennent de l'index livré (content/practice/index.generated.json).
        $index = json_decode(file_get_contents(base_path('../../content/practice/index.generated.json')), true)['qasim-adad-tabii'];
        $this->assertSame(array_map('count', array_values($index)), array_column($r->json('levels'), 'exerciseCount'));
        $this->assertSame([0, 0, 0, 0, 0], array_column($r->json('levels'), 'completedCount'), 'aucun historique : rien de terminé');
        $this->assertTrue($r->json('levels.0.unlocked'));

        // Tous les points de la leçon, « non évalués » tant qu'aucune preuve n'existe.
        $this->assertNotEmpty($r->json('learningPoints'));
        $this->assertSame(['unassessed'], array_values(array_unique(array_column($r->json('learningPoints'), 'status'))));
        $r->assertJsonPath('openSession', null);
    }

    public function test_history_is_reflected_in_levels_and_mastery(): void
    {
        $session = PracticeSession::create([
            'session_id' => (string) Str::uuid(), 'user_id' => $this->student->id,
            'lesson_id' => $this->dcLessons['qasim-adad-tabii']->id, 'level' => 1, 'status' => 'open', 'started_at' => now(),
        ]);
        ExerciseAttempt::create([
            'practice_session_id' => $session->id, 'exercise_id' => 'ex-4am-qasim-adad-tabii-l1-001',
            'level' => 1, 'status' => 'completed', 'started_at' => now(), 'completed_at' => now(),
        ]);
        $this->answer($this->student, $this->dcLessons['qasim-adad-tabii'], $this->dcPoints['4am_qasim-adad-tabii_P1'], 'correct');

        $r = $this->overview()->assertOk();
        $this->assertSame(1, $r->json('levels.0.completedCount'));
        $p1 = collect($r->json('learningPoints'))->firstWhere('code', '4am_qasim-adad-tabii_P1');
        $this->assertNotSame('unassessed', $p1['status']);
        $r->assertJsonPath('openSession.sessionId', $session->session_id);
    }

    public function test_unknown_lesson_is_404_and_guest_is_401(): void
    {
        $this->overview('lecon-inexistante')->assertNotFound();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/lessons/qasim-adad-tabii/practice/overview')->assertUnauthorized();
    }

    public function test_a_lesson_without_practice_is_refused_with_its_own_code(): void
    {
        file_put_contents($this->tmp.'/active.json', json_encode(['bahth-pgcd']));
        config(['practice.active_lessons_path' => $this->tmp.'/active.json']);

        $this->overview()->assertStatus(422)->assertJsonPath('code', PracticeSessionController::PRACTICE_UNAVAILABLE);
        $this->withToken($this->tokenOf($this->student))
            ->postJson('/api/v1/lessons/qasim-adad-tabii/practice/sessions', ['sessionId' => (string) Str::uuid(), 'level' => 1])
            ->assertStatus(422)->assertJsonPath('code', PracticeSessionController::PRACTICE_UNAVAILABLE);
    }

    public function test_a_lesson_closed_to_the_student_is_refused_with_its_own_code(): void
    {
        $this->dcLessons['qasim-adad-tabii']->update(['tier' => 'premium']);

        $this->overview()->assertStatus(422)->assertJsonPath('code', PracticeSessionController::LESSON_UNAVAILABLE);
    }

    public function test_a_missing_active_list_is_not_cached_so_the_fix_takes_effect_immediately(): void
    {
        // Le déploiement d'avant : le fichier n'existe pas sur le serveur.
        config(['practice.active_lessons_path' => $this->tmp.'/active.json']);
        $this->overview()->assertStatus(422)->assertJsonPath('code', PracticeSessionController::PRACTICE_UNAVAILABLE);

        // Le déploiement d'après : le fichier arrive — sans vider aucun cache.
        copy(base_path('../../content/practice/active.json'), $this->tmp.'/active.json');
        $this->overview()->assertOk();
    }

    public function test_the_doctor_fails_on_missing_or_stale_content_and_passes_on_the_deployed_one(): void
    {
        $active = hash_file('sha256', base_path('../../content/practice/active.json'));
        $index = hash_file('sha256', base_path('../../content/practice/index.generated.json'));

        $this->assertSame(0, Artisan::call('smarter:practice-doctor', ['--expect-active' => $active, '--expect-index' => $index]));
        $this->assertSame(1, Artisan::call('smarter:practice-doctor', ['--expect-active' => str_repeat('0', 64)]), 'contenu périmé');

        config(['practice.active_lessons_path' => $this->tmp.'/absent.json']);
        PracticeCapability::forget();
        $this->assertSame(1, Artisan::call('smarter:practice-doctor'), 'contenu absent');
    }
}
