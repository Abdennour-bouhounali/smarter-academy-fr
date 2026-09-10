<?php

namespace Tests\Feature;

use App\Models\AdminActivityLog;
use App\Models\Chapter;
use App\Models\ExerciseAttempt;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\PracticeSession;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * La publication : elle change côté serveur, elle se journalise, et elle ne
 * détruit JAMAIS d'historique d'apprentissage.
 */
class AdminContentPublicationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Lesson $lesson;

    private LessonModule $module;

    private PracticeExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => 'Sixième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions',
            'title' => 'Fractions', 'status' => 'available', 'order' => 0,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '02', 'number' => 2, 'title' => 'Partager',
        ]);
        $this->exercise = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-frac-001', 'level' => 1,
        ]);

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_l_admin_publie_masque_et_archive_une_lecon(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
            ->assertStatus(200)
            ->assertJsonPath('publicationStatus', Lesson::PUB_HIDDEN);

        $this->assertSame(Lesson::PUB_HIDDEN, $this->lesson->fresh()->publication_status);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_ARCHIVED])
            ->assertStatus(200);

        $this->assertNotNull($this->lesson->fresh()->archived_at);

        // Restaurer est un chemin normal : masquer n'est pas définitif.
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_PUBLISHED])
            ->assertStatus(200);

        $restored = $this->lesson->fresh();
        $this->assertSame(Lesson::PUB_PUBLISHED, $restored->publication_status);
        $this->assertNull($restored->archived_at);
    }

    public function test_un_etat_de_publication_inconnu_est_refuse(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => 'secret'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    /**
     * LE point de la spec §12 : masquer un module ne touche pas à la
     * progression. Le contenu se retire, l'historique reste.
     */
    public function test_masquer_un_module_ne_detruit_aucune_progression(): void
    {
        StudentLessonProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'status' => StudentLessonProgress::STATUS_IN_PROGRESS,
            'current_module' => 2,
            'completed_modules' => ['01', '02'],
            'last_activity_at' => now(),
        ]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/module/{$this->module->id}/status", ['status' => LessonModule::PUB_HIDDEN])
            ->assertStatus(200);

        $progress = StudentLessonProgress::where('user_id', $this->student->id)->first();
        $this->assertNotNull($progress, 'la progression doit survivre au masquage');
        $this->assertSame(['01', '02'], $progress->completed_modules);
        $this->assertSame(LessonModule::PUB_HIDDEN, $this->module->fresh()->publication_status);
    }

    public function test_masquer_un_exercice_ne_detruit_aucune_tentative(): void
    {
        $session = PracticeSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'level' => 1,
            'started_at' => now(),
        ]);
        ExerciseAttempt::create([
            'practice_session_id' => $session->id,
            'exercise_id' => 'ex-frac-001',
            'level' => 1,
            'started_at' => now(),
        ]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/exercise/{$this->exercise->id}/status", ['status' => PracticeExercise::PUB_HIDDEN])
            ->assertStatus(200);

        $this->assertDatabaseCount('exercise_attempts', 1);
        $this->assertDatabaseHas('exercise_attempts', ['exercise_id' => 'ex-frac-001']);
    }

    public function test_tout_changement_de_publication_est_journalise(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
            ->assertStatus(200);

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => 'lesson.status_changed',
            'entity_type' => 'lesson',
            'entity_id' => (string) $this->lesson->id,
        ]);

        $log = AdminActivityLog::latest()->first();
        $this->assertSame(Lesson::PUB_PUBLISHED, $log->before['publication_status']);
        $this->assertSame(Lesson::PUB_HIDDEN, $log->after['publication_status']);
    }

    public function test_la_liste_des_lecons_compte_modules_exercices_et_signalements(): void
    {
        $response = $this->asAdmin()->getJson('/api/v1/admin/content/lessons')->assertStatus(200);

        $response->assertJsonPath('lessons.data.0.code', 'fractions')
            ->assertJsonPath('lessons.data.0.modulesCount', 1)
            ->assertJsonPath('lessons.data.0.exercisesCount', 1);
    }

    public function test_le_detail_d_une_lecon_expose_ses_modules_et_exercices(): void
    {
        $this->asAdmin()->getJson('/api/v1/admin/content/lessons/fractions')
            ->assertStatus(200)
            ->assertJsonPath('lesson.modules.0.code', '02')
            ->assertJsonPath('lesson.exercises.0.exerciseCode', 'ex-frac-001');
    }
}
