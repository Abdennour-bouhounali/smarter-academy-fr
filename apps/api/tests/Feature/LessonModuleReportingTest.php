<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Signaler depuis le sommaire d'une leçon et depuis un module — par un
 * RELECTEUR (ambassadeur), en UN envoi. Le clic n'envoie plus rien : aucune
 * ligne n'existe avant « إرسال ».
 */
class LessonModuleReportingTest extends TestCase
{
    use RefreshDatabase;

    private User $ambassador;

    private User $admin;

    private Lesson $lesson;

    private LessonModule $module;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => 'Sixième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions', 'title' => 'Fractions',
            'status' => 'available', 'order' => 0, 'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '03', 'number' => 3,
            'title' => 'Comparer des fractions', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);

        $this->ambassador = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $this->ambassador->forceFill(['is_ambassador' => true])->save();
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function send(array $payload, ?User $as = null)
    {
        // Message obligatoire : un texte par défaut, sauf si le test en fournit un.
        $payload += ['note' => 'Le problème est décrit ici.'];

        return $this->actingAs($as ?? $this->ambassador, 'sanctum')->postJson('/api/v1/reports', $payload);
    }

    // ------------------------------------------------------------ CONTEXTE

    public function test_un_signalement_de_lecon_identifie_la_lecon_sans_module(): void
    {
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'grade' => '6e', 'category' => 'typo'])->assertStatus(201);

        $report = StudentReport::first();
        $this->assertSame('lesson', $report->source);
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertNull($report->lesson_module_id);
    }

    public function test_un_signalement_de_module_identifie_lecon_et_module(): void
    {
        $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e', 'moduleNumber' => 3, 'category' => 'math_error'])
            ->assertStatus(201);

        $report = StudentReport::first();
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertSame($this->module->id, $report->lesson_module_id);
    }

    public function test_un_signalement_de_module_exige_le_module(): void
    {
        $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'category' => 'typo'])->assertStatus(422);
        $this->assertSame(0, StudentReport::count());
    }

    /** IDOR : le module est cherché PAR (leçon, numéro), jamais par un id posté. */
    public function test_un_module_d_une_autre_lecon_n_est_jamais_rattache(): void
    {
        $autre = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'autre-lecon',
            'title' => 'Autre', 'status' => 'available', 'order' => 1,
        ]);
        $moduleAilleurs = LessonModule::create([
            'lesson_id' => $autre->id, 'code' => '09', 'number' => 9, 'title' => 'Ailleurs',
        ]);

        $id = $this->send([
            'source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e',
            'moduleNumber' => 9, 'lesson_module_id' => $moduleAilleurs->id, 'category' => 'typo',
        ])->assertStatus(201)->json('report.id');

        $report = StudentReport::find($id);
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertNull($report->lesson_module_id);
    }

    public function test_aucune_source_hors_liste_n_est_acceptee(): void
    {
        foreach (['admin', 'arbitrary', 'another_internal_context', '', 'LESSON'] as $forged) {
            $this->send(['source' => $forged, 'lessonCode' => 'fractions', 'category' => 'typo'])->assertStatus(422);
        }
        $this->assertSame(0, StudentReport::count());
    }

    // ------------------------------------------------------------ CATÉGORIES

    /** @return array<string, array{string}> */
    public static function offeredCategories(): array
    {
        return [
            'erreur mathématique' => ['math_error'],
            'manipulation cassée' => ['manipulation_not_working'],
            'question peu claire' => ['unclear_question'],
            'réponse/correction' => ['answer_correction_problem'],
            'affichage' => ['display_problem'],
            'faute de texte' => ['typo'],
            'autre' => ['other'],
        ];
    }

    #[DataProvider('offeredCategories')]
    public function test_chaque_categorie_proposee_est_acceptee(string $category): void
    {
        $id = $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => $category])
            ->assertStatus(201)->json('report.id');
        $this->assertSame($category, StudentReport::find($id)->category);
    }

    /**
     * Les anciennes catégories ne se CRÉENT plus : l'ancien client à deux
     * temps n'existe plus, et les seuls signalements en base ont été effacés.
     */
    public function test_les_anciennes_categories_ne_se_creent_plus(): void
    {
        foreach (StudentReport::LEGACY_CATEGORIES as $legacy) {
            $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => $legacy])->assertStatus(422);
        }
        $this->assertSame(0, StudentReport::count());
    }

    public function test_le_message_est_obligatoire(): void
    {
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other', 'note' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('note');
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other', 'note' => 'ab'])
            ->assertStatus(422)->assertJsonValidationErrors('note');
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other', 'note' => 'Faux.'])
            ->assertStatus(201);
    }

    public function test_un_texte_trop_long_est_refuse(): void
    {
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other', 'note' => str_repeat('a', 2001)])
            ->assertStatus(422)->assertJsonValidationErrors('note');
    }

    // ---------------------------------------------------------------- ADMIN

    public function test_l_admin_voit_l_origine_et_le_contexte_exact(): void
    {
        $lessonReport = $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'grade' => '6e', 'category' => 'typo', 'note' => 'Coquille.'])->json('report.id');
        $moduleReport = $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e', 'moduleNumber' => 3, 'category' => 'manipulation_not_working'])->json('report.id');

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports')
            ->assertStatus(200)->assertJsonPath('counts.all', 2);

        $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/admin/reports/{$lessonReport}")
            ->assertStatus(200)
            ->assertJsonPath('report.source', 'lesson')
            ->assertJsonPath('report.context.isLessonLevel', true)
            ->assertJsonPath('report.context.lessonTitle', 'Fractions');

        $this->actingAs($this->admin, 'sanctum')->getJson("/api/v1/admin/reports/{$moduleReport}")
            ->assertStatus(200)
            ->assertJsonPath('report.source', 'module')
            ->assertJsonPath('report.context.isLessonLevel', false)
            ->assertJsonPath('report.context.moduleTitle', 'Comparer des fractions');
    }

    public function test_l_admin_filtre_par_origine_et_combine_les_filtres(): void
    {
        $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'typo']);
        $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'category' => 'display_problem']);
        $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'category' => 'typo']);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?source=module')
            ->assertStatus(200)->assertJsonCount(2, 'reports.data');
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?source=module&category=typo')
            ->assertStatus(200)->assertJsonCount(1, 'reports.data')
            ->assertJsonPath('reports.data.0.source', 'module');
    }

    public function test_un_relecteur_non_admin_n_accede_pas_a_l_administration(): void
    {
        $id = $this->send(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'typo'])->json('report.id');

        $this->actingAs($this->ambassador, 'sanctum')->getJson('/api/v1/admin/reports')->assertStatus(403);
        $this->actingAs($this->ambassador, 'sanctum')->getJson("/api/v1/admin/reports/{$id}")->assertStatus(403);
        $this->actingAs($this->ambassador, 'sanctum')->getJson("/api/v1/admin/reports/{$id}/screenshot")->assertStatus(403);
    }

    // ----------------------------------------------- AUCUN EFFET DE BORD

    public function test_signaler_ne_touche_a_aucune_donnee_d_apprentissage(): void
    {
        $this->send(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'category' => 'math_error', 'note' => 'Faux.'])
            ->assertStatus(201);

        $this->assertDatabaseCount('student_lesson_progress', 0);
        $this->assertDatabaseCount('learning_evidence', 0);
        $this->assertDatabaseCount('student_learning_point_progress', 0);
        $this->assertDatabaseCount('exercise_attempts', 0);
    }
}
