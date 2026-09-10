<?php

namespace Tests\Feature;

use App\Domain\Admin\ContentService;
use App\Domain\Curriculum\ContentRegistryImporter;
use App\Domain\Progress\StudentActivity;
use App\Models\AdminActivityLog;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentReport;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Le durcissement : amorçage, publication sûre, politique du brouillon,
 * transactions, activité, isolation des signalements.
 */
class HardeningRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => 'Sixième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions', 'title' => 'Fractions',
            'status' => 'available', 'order' => 0, 'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    // ------------------------------------------------------- AMORÇAGE ADMIN

    /**
     * En production, un identifiant écrit dans le dépôt est un identifiant
     * public. L'amorçage doit refuser de s'exécuter plutôt que de créer un
     * admin dont tout le monde connaît le mot de passe.
     */
    public function test_l_amorcage_refuse_de_creer_un_admin_sans_mot_de_passe_en_production(): void
    {
        config(['app.env' => 'production']);
        app()['env'] = 'production';
        putenv('ADMIN_PASSWORD');
        $_ENV['ADMIN_PASSWORD'] = '';
        $_SERVER['ADMIN_PASSWORD'] = '';

        $this->expectException(\RuntimeException::class);

        (new AdminUserSeeder)->run();
    }

    public function test_l_amorcage_ne_reecrit_jamais_le_mot_de_passe_d_un_admin_existant(): void
    {
        $existing = User::factory()->create([
            'email' => 'admin@gmail.com', 'role' => User::ROLE_ADMIN, 'password' => 'ChoisiParLAdmin@2026',
        ]);

        (new AdminUserSeeder)->run();

        $this->assertTrue(
            Hash::check('ChoisiParLAdmin@2026', $existing->fresh()->password),
            'un redéploiement ne doit pas annuler un changement de mot de passe'
        );
        $this->assertSame(1, User::where('email', 'admin@gmail.com')->count());
    }

    // ----------------------------------------------------- PUBLICATION SÛRE

    public function test_on_ne_publie_pas_un_module_retire_du_registre(): void
    {
        $module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'M',
            'publication_status' => LessonModule::PUB_DRAFT, 'retired_at' => now(),
        ]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessageMatches('/retiré du registre/');

        app(ContentService::class)->changeStatus($this->admin, 'module', $module->id, LessonModule::PUB_PUBLISHED);
    }

    public function test_on_ne_publie_pas_un_module_qui_enseigne_un_point_inconnu(): void
    {
        $module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'M',
            'publication_status' => LessonModule::PUB_DRAFT,
            'teaches_learning_point_codes' => ['6e_fractions_INEXISTANT'],
        ]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessageMatches('/inconnu/');

        app(ContentService::class)->changeStatus($this->admin, 'module', $module->id, LessonModule::PUB_PUBLISHED);
    }

    public function test_on_ne_publie_pas_une_lecon_dont_aucun_module_n_est_publie(): void
    {
        LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'M',
            'publication_status' => LessonModule::PUB_DRAFT,
        ]);
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessageMatches('/leçon vide/');

        app(ContentService::class)->changeStatus($this->admin, 'lesson', $this->lesson->id, Lesson::PUB_PUBLISHED);
    }

    /** MASQUER reste toujours possible : refuser de retirer un contenu cassé serait l'inverse du but. */
    public function test_masquer_un_contenu_invalide_reste_possible(): void
    {
        $module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'M',
            'publication_status' => LessonModule::PUB_PUBLISHED,
            'teaches_learning_point_codes' => ['INEXISTANT'],
        ]);

        $result = app(ContentService::class)
            ->changeStatus($this->admin, 'module', $module->id, LessonModule::PUB_HIDDEN);

        $this->assertTrue($result['changed']);
    }

    // ------------------------------------------- POLITIQUE DU BROUILLON

    /**
     * Un contenu découvert par la synchro naît en brouillon : publier doit
     * rester un geste, pas un effet de bord du déploiement.
     */
    public function test_un_contenu_nouvellement_decouvert_nait_en_brouillon(): void
    {
        app(ContentRegistryImporter::class)->import([
            'lessons' => [[
                'code' => 'fractions', 'grade' => '6e',
                'modules' => [[
                    'code' => '01', 'number' => 1, 'slug' => 'm1', 'title' => 'Nouveau',
                    'description' => null, 'stage' => 'discovery', 'estimatedMin' => 5,
                    'difficulty' => 1, 'teachesLearningPointCodes' => null,
                ]],
            ]],
            'exercises' => [[
                'lessonCode' => 'fractions', 'exerciseCode' => 'ex-neuf',
                'level' => 1, 'title' => 'Neuf', 'questionCount' => 2,
            ]],
        ]);

        $this->assertSame(LessonModule::PUB_DRAFT, LessonModule::first()->publication_status);
        $this->assertSame(PracticeExercise::PUB_DRAFT, PracticeExercise::first()->publication_status);
    }

    /** ...mais la règle ne rétroagit pas sur le contenu déjà publié. */
    public function test_la_politique_du_brouillon_ne_retroagit_pas(): void
    {
        $module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'Ancien',
            'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);

        app(ContentRegistryImporter::class)->import([
            'lessons' => [[
                'code' => 'fractions', 'grade' => '6e',
                'modules' => [[
                    'code' => '01', 'number' => 1, 'slug' => 'm1', 'title' => 'Titre réécrit',
                    'description' => null, 'stage' => 'discovery', 'estimatedMin' => 5,
                    'difficulty' => 1, 'teachesLearningPointCodes' => null,
                ]],
            ]],
            'exercises' => [],
        ]);

        $fresh = $module->fresh();
        $this->assertSame('Titre réécrit', $fresh->title);
        $this->assertSame(LessonModule::PUB_PUBLISHED, $fresh->publication_status);
    }

    // ----------------------------------------------------- TRANSACTIONS

    /**
     * Un journal qui affirme une publication qui n'a pas eu lieu est pire
     * qu'un journal absent : c'est un audit qui ment.
     */
    public function test_une_publication_refusee_ne_laisse_aucune_trace_dans_le_journal(): void
    {
        $module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1, 'title' => 'M',
            'publication_status' => LessonModule::PUB_DRAFT,
            'teaches_learning_point_codes' => ['INEXISTANT'],
        ]);

        try {
            app(ContentService::class)->changeStatus($this->admin, 'module', $module->id, LessonModule::PUB_PUBLISHED);
        } catch (DomainException) {
            // attendu
        }

        $this->assertSame(0, AdminActivityLog::count());
        $this->assertSame(LessonModule::PUB_DRAFT, $module->fresh()->publication_status);
    }

    // -------------------------------------------------------- ACTIVITÉ

    public function test_l_activite_se_pose_et_s_amortit(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'last_activity_at' => null]);

        StudentActivity::touch($student);
        $first = $student->fresh()->last_activity_at;
        $this->assertNotNull($first, 'un geste d\'apprentissage pose la trace');

        // Réécriture immédiate : amortie, la valeur ne bouge pas.
        $this->travel(1)->minutes();
        StudentActivity::touch($student->fresh());
        $this->assertEquals(
            $first->timestamp,
            $student->fresh()->last_activity_at->timestamp,
            'une seconde écriture dans la fenêtre ne doit rien changer'
        );

        // Au-delà de la fenêtre, la trace suit.
        $this->travel(10)->minutes();
        StudentActivity::touch($student->fresh());
        $this->assertGreaterThan($first->timestamp, $student->fresh()->last_activity_at->timestamp);
    }

    public function test_repondre_a_une_question_marque_l_eleve_actif(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'last_activity_at' => now()->subMonth()]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => '6e_fractions_P1', 'title' => 'P1', 'order' => 1,
        ]);

        $this->actingAs($student, 'sanctum')->postJson('/api/v1/lessons/fractions/evidence', [
            'questionCode' => 'q1',
            'attemptId' => (string) Str::uuid(),
            'isCorrect' => true,
            'learningPointCodes' => ['6e_fractions_P1'],
        ])->assertStatus(201);

        $this->assertTrue($student->fresh()->last_activity_at->isToday());
    }

    // ------------------------------------------ ISOLATION DES SIGNALEMENTS

    public function test_un_eleve_ne_voit_pas_le_signalement_d_un_autre(): void
    {
        $mine = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $other = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $report = StudentReport::factory()->create(['user_id' => $other->id]);

        // Il n'existe AUCUNE route élève pour lire un signalement ; la seule
        // route est celle de l'administration, et elle lui est fermée.
        $this->actingAs($mine, 'sanctum')
            ->getJson("/api/v1/admin/reports/{$report->id}")
            ->assertStatus(403);
    }

    /** Le contexte vient des CODES : un identifiant posté n'est jamais lu. */
    public function test_un_eleve_ne_peut_pas_designer_le_contenu_d_une_autre_lecon(): void
    {
        $autre = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'autre-lecon',
            'title' => 'Autre', 'status' => 'available', 'order' => 1,
        ]);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $signal = $this->actingAs($student, 'sanctum')->postJson('/api/v1/reports', [
            'source' => 'lesson',
            'lessonCode' => 'fractions',
            'lesson_id' => $autre->id,
            'lesson_module_id' => 999,
            'question_attempt_id' => 999,
            'fingerprint' => 'forge',
            'user_id' => $this->admin->id,
        ])->assertStatus(201);

        $this->actingAs($student, 'sanctum')
            ->patchJson('/api/v1/reports/'.$signal->json('report.id'), ['category' => 'typo'])
            ->assertStatus(200);

        $report = StudentReport::first();
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertSame($student->id, $report->user_id);
        $this->assertNull($report->lesson_module_id);
        $this->assertNull($report->question_attempt_id);
        $this->assertNotSame('forge', $report->fingerprint);
    }
}
