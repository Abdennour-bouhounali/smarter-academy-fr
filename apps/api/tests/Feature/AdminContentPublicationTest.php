<?php

namespace Tests\Feature;

use App\Models\AdminActivityLog;
use App\Models\Chapter;
use App\Models\ExerciseAttempt;
use App\Models\Grade;
use App\Models\LearningPoint;
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

        // Un module se masque avec sa leçon (2026-11-11 : pas d'état propre).
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
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

        // La cascade journalise aussi les modules : on lit la ligne de la LEÇON.
        $log = AdminActivityLog::where('action', 'lesson.status_changed')->latest('id')->first();
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

    // ------------------------------------------------- CASCADE leçon → modules

    /**
     * Changer l'état d'une leçon le donne à tous ses modules en registre
     * (2026-10-07). Les modules retirés et les exercices ne bougent pas.
     */
    public function test_l_etat_d_une_lecon_cascade_sur_ses_modules(): void
    {
        $second = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '03', 'number' => 3, 'title' => 'Comparer',
            'publication_status' => LessonModule::PUB_DRAFT,
        ]);
        $retired = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '04', 'number' => 4, 'title' => 'Ancien',
            'publication_status' => LessonModule::PUB_PUBLISHED, 'retired_at' => now(),
        ]);

        foreach ([Lesson::PUB_HIDDEN, Lesson::PUB_DRAFT, Lesson::PUB_ARCHIVED, Lesson::PUB_PUBLISHED] as $state) {
            $this->asAdmin()
                ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => $state])
                ->assertStatus(200)
                ->assertJsonPath('publicationStatus', $state);

            $this->assertSame($state, $this->lesson->fresh()->publication_status, "leçon {$state}");
            $this->assertSame($state, $this->module->fresh()->publication_status, "module 2 → {$state}");
            $this->assertSame($state, $second->fresh()->publication_status, "module 3 → {$state}");
            $this->assertSame($state, $this->exercise->fresh()->publication_status, "exercice → {$state}");
        }

        $this->assertSame(LessonModule::PUB_PUBLISHED, $retired->fresh()->publication_status, 'un module retiré ne suit pas');
        // « Je publie la leçon, tout est publié » (2026-11-11) : les exercices suivent aussi.
        $this->assertSame(PracticeExercise::PUB_PUBLISHED, $this->exercise->fresh()->publication_status, 'les exercices suivent la leçon');
    }

    public function test_la_cascade_rend_les_modules_changes_et_les_journalise(): void
    {
        $response = $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
            ->assertStatus(200)
            ->assertJsonPath('modules.applied', [$this->module->id])
            ->assertJsonPath('modules.skipped', []);

        $this->assertDatabaseHas('admin_activity_logs', [
            'action' => 'module.status_changed',
            'entity_type' => 'module',
            'entity_id' => (string) $this->module->id,
        ]);
        $log = AdminActivityLog::where('action', 'module.status_changed')->latest('id')->first();
        $this->assertSame($this->lesson->id, $log->after['cascadeFromLesson']);
    }

    /** Un module n'a pas d'état propre (2026-11-11) : le changer seul est refusé. */
    public function test_un_module_ne_se_change_pas_seul(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
            ->assertStatus(200);
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/module/{$this->module->id}/status", ['status' => LessonModule::PUB_DRAFT])
            ->assertStatus(404);

        $this->assertSame(Lesson::PUB_HIDDEN, $this->lesson->fresh()->publication_status);
        $this->assertSame(LessonModule::PUB_HIDDEN, $this->module->fresh()->publication_status);
    }

    /** Publier la leçon publie TOUS ses modules, même un module qui échoue aux contrôles. */
    public function test_publier_une_lecon_publie_tous_ses_modules(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->module->update(['publication_status' => LessonModule::PUB_HIDDEN]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => '6e_fractions_P1', 'title' => 'P1', 'order' => 1, 'retired_at' => now(),
        ]);
        $broken = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '03', 'number' => 3, 'title' => 'Cassé',
            'publication_status' => LessonModule::PUB_HIDDEN, 'teaches_learning_point_codes' => ['6e_fractions_P1'],
        ]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_PUBLISHED])
            ->assertStatus(200)
            ->assertJsonPath('modules.applied', [$this->module->id, $broken->id])
            ->assertJsonPath('modules.skipped', []);

        $this->assertSame(LessonModule::PUB_PUBLISHED, $this->module->fresh()->publication_status);
        $this->assertSame(LessonModule::PUB_PUBLISHED, $broken->fresh()->publication_status);
    }

    public function test_une_lecon_dont_aucun_module_n_est_publiable_reste_refusee(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => '6e_fractions_P1', 'title' => 'P1', 'order' => 1, 'retired_at' => now(),
        ]);
        $this->module->update([
            'publication_status' => LessonModule::PUB_HIDDEN, 'teaches_learning_point_codes' => ['6e_fractions_P1'],
        ]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_PUBLISHED])
            ->assertStatus(422);

        // Rien n'a bougé : ni la leçon, ni le module.
        $this->assertSame(Lesson::PUB_HIDDEN, $this->lesson->fresh()->publication_status);
        $this->assertSame(LessonModule::PUB_HIDDEN, $this->module->fresh()->publication_status);
    }

    // ------------------------------------------------- BANQUE D'EXERCICES d'une leçon

    /**
     * Un geste pour toute la banque d'exercices d'une leçon (2026-10-07) ;
     * chaque exercice reste ensuite modifiable seul.
     */
    public function test_l_etat_de_la_banque_d_exercices_s_applique_a_tous_ses_exercices(): void
    {
        $second = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-frac-002', 'level' => 2,
            'publication_status' => PracticeExercise::PUB_DRAFT,
        ]);
        $retired = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-frac-old', 'level' => 1,
            'publication_status' => PracticeExercise::PUB_DRAFT, 'retired_at' => now(),
        ]);
        $this->exercise->update(['publication_status' => PracticeExercise::PUB_DRAFT]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/exercises-status", ['status' => PracticeExercise::PUB_PUBLISHED])
            ->assertStatus(200)
            ->assertJsonCount(2, 'applied')
            ->assertJsonCount(0, 'failed');

        $this->assertSame(PracticeExercise::PUB_PUBLISHED, $this->exercise->fresh()->publication_status);
        $this->assertSame(PracticeExercise::PUB_PUBLISHED, $second->fresh()->publication_status);
        $this->assertSame(PracticeExercise::PUB_DRAFT, $retired->fresh()->publication_status, 'un exercice retiré ne suit pas');
        $this->assertSame(2, AdminActivityLog::where('action', 'exercise.status_changed')->count());

        // Puis UN exercice masqué seul : la banque ne bouge pas.
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/exercise/{$second->id}/status", ['status' => PracticeExercise::PUB_HIDDEN])
            ->assertStatus(200);
        $this->assertSame(PracticeExercise::PUB_HIDDEN, $second->fresh()->publication_status);
        $this->assertSame(PracticeExercise::PUB_PUBLISHED, $this->exercise->fresh()->publication_status);
    }

    /** La page « التمارين » est organisée par leçon : la liste porte la banque par état. */
    public function test_la_liste_des_lecons_compte_les_exercices_par_etat(): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-frac-002', 'level' => 1,
            'publication_status' => PracticeExercise::PUB_DRAFT,
        ]);
        $this->exercise->update(['publication_status' => PracticeExercise::PUB_PUBLISHED]);

        $this->asAdmin()->getJson('/api/v1/admin/content/lessons?scope=all')
            ->assertStatus(200)
            ->assertJsonPath('lessons.data.0.exerciseStatusCounts', [
                'published' => 1, 'hidden' => 0, 'draft' => 1, 'archived' => 0,
            ]);
    }

    public function test_la_banque_d_exercices_ne_touche_ni_la_lecon_ni_ses_modules(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/exercises-status", ['status' => PracticeExercise::PUB_HIDDEN])
            ->assertStatus(200)
            ->assertJsonPath('applied', [$this->exercise->id]);

        $this->assertSame(Lesson::PUB_PUBLISHED, $this->lesson->fresh()->publication_status);
        $this->assertSame(LessonModule::PUB_PUBLISHED, $this->module->fresh()->publication_status);

        // L'état de la LEÇON, lui, s'applique à tout (2026-11-11 : « je publie
        // la leçon, tout est publié ») — exercices compris.
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_DRAFT])
            ->assertStatus(200)
            ->assertJsonPath('exercises.applied', [$this->exercise->id]);
        $this->assertSame(PracticeExercise::PUB_DRAFT, $this->exercise->fresh()->publication_status);
    }

    public function test_la_banque_d_exercices_refuse_un_etat_inconnu_et_les_non_admins(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/exercises-status", ['status' => 'secret'])
            ->assertStatus(422);

        $this->actingAs($this->student, 'sanctum')
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/exercises-status", ['status' => PracticeExercise::PUB_HIDDEN])
            ->assertStatus(403);

        $this->assertSame(PracticeExercise::PUB_PUBLISHED, $this->exercise->fresh()->publication_status);
    }
}
