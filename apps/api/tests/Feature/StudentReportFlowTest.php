<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * La chaîne complète : un RELECTEUR (ambassadeur « سفير » ou administrateur)
 * signale un problème en UN envoi → le serveur reconstruit le contexte tout
 * seul → l'administrateur le voit, l'ouvre, le résout → la décision est
 * journalisée. Depuis 2026-10-05, l'élève et l'enseignant ordinaire ne
 * signalent plus (403 not_a_reviewer).
 */
class StudentReportFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $ambassador;

    private User $student;

    private User $admin;

    private Lesson $lesson;

    private LessonModule $module;

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
            'lesson_id' => $this->lesson->id, 'code' => '03', 'number' => 3,
            'title' => 'Comparer des fractions', 'stage' => 'discovery',
        ]);

        $this->ambassador = $this->makeAmbassador();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function makeAmbassador(): User
    {
        $user = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $user->forceFill(['is_ambassador' => true])->save();

        return $user;
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    /** UN envoi : le contexte et les détails ensemble. */
    private function report(array $payload, ?User $as = null): TestResponse
    {
        // Message obligatoire : un texte par défaut, sauf si le test en fournit un.
        $payload += ['note' => 'Le problème est décrit ici.'];

        return $this->actingAs($as ?? $this->ambassador, 'sanctum')->postJson('/api/v1/reports', $payload);
    }

    /**
     * Le relecteur n'envoie que des CODES. Le serveur retrouve seul la leçon et le
     * module.
     */
    public function test_le_serveur_reconstruit_le_contexte_a_partir_des_codes(): void
    {
        $this->report([
            'source' => 'module',
            'lessonCode' => 'fractions',
            'grade' => '6e',
            'moduleNumber' => 3,
            'step' => 'etape-2',
            'route' => '/courses/college/6e/nombres_calculs/fractions/comparer',
            'category' => 'answer_correction_problem',
            'note' => 'La correction dit 3/4 mais je trouve 2/4.',
        ])->assertStatus(201)->assertJsonPath('success', true)->assertJsonPath('report.hasScreenshot', false);

        $report = StudentReport::first();

        $this->assertSame($this->ambassador->id, $report->user_id);
        $this->assertSame($this->lesson->id, $report->lesson_id, 'la leçon doit être résolue côté serveur');
        $this->assertSame($this->module->id, $report->lesson_module_id, 'le module doit être résolu côté serveur');
        $this->assertSame('etape-2', $report->step);
        $this->assertSame('answer_correction_problem', $report->category);
        $this->assertSame(StudentReport::STATUS_NEW, $report->status);
        $this->assertNotNull($report->details_completed_at, 'un signalement est toujours complet à la création');
        $this->assertNotEmpty($report->fingerprint);
    }

    public function test_l_administrateur_peut_aussi_signaler(): void
    {
        $this->report(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'typo'], $this->admin)
            ->assertStatus(201);
        $this->assertSame($this->admin->id, StudentReport::first()->user_id);
    }

    public function test_eleve_enseignant_et_visiteur_ne_signalent_plus(): void
    {
        $payload = ['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'typo'];

        $this->report($payload, $this->student)->assertStatus(403)->assertJsonPath('reason', 'not_a_reviewer');
        $this->report($payload, User::factory()->create(['role' => User::ROLE_TEACHER]))
            ->assertStatus(403)->assertJsonPath('reason', 'not_a_reviewer');
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/v1/reports', $payload)->assertStatus(401);

        $this->assertSame(0, StudentReport::count());
    }

    public function test_un_ambassadeur_retire_ne_signale_plus(): void
    {
        $this->ambassador->forceFill(['is_ambassador' => false])->save();
        $this->report(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'typo'], $this->ambassador->fresh())
            ->assertStatus(403);
    }

    /** Le message est obligatoire (2026-10-08) : sans lui, rien n'est créé. */
    public function test_un_signalement_sans_note_est_refuse(): void
    {
        $this->report(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'category' => 'display_problem', 'note' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('note');
        $this->assertSame(0, StudentReport::count());
    }

    public function test_la_categorie_est_obligatoire_et_fermee(): void
    {
        $this->report(['source' => 'lesson', 'lessonCode' => 'fractions'])
            ->assertStatus(422)->assertJsonValidationErrors('category');
        $this->report(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'je_fais_ce_que_je_veux'])
            ->assertStatus(422)->assertJsonValidationErrors('category');
        $this->assertSame(0, StudentReport::count());
    }

    /** Un client qui poste un lesson_id n'obtient rien. */
    public function test_un_identifiant_envoye_par_le_client_est_ignore(): void
    {
        $autre = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'autre-lecon',
            'title' => 'Autre', 'status' => 'available', 'order' => 1,
        ]);

        $this->report([
            'source' => 'lesson',
            'lessonCode' => 'fractions',
            'lesson_id' => $autre->id,
            'user_id' => $this->admin->id,
            'status' => StudentReport::STATUS_RESOLVED,
            'priority' => 'critical',
            'screenshot_path' => '../../.env',
            'category' => 'typo',
        ])->assertStatus(201);

        $report = StudentReport::first();
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertSame($this->ambassador->id, $report->user_id);
        $this->assertSame(StudentReport::STATUS_NEW, $report->status);
        $this->assertSame('low', $report->priority, 'une coquille entre en priorité basse, pas critique');
        $this->assertNull($report->screenshot_path, 'un chemin de fichier ne vient jamais du client');
    }

    /** Le contexte machine n'est gardé que pour les pannes. */
    public function test_le_contexte_technique_n_est_garde_que_pour_un_probleme_technique(): void
    {
        $payload = [
            'source' => 'module', 'lessonCode' => 'fractions',
            'browser' => 'Firefox 130', 'os' => 'Linux', 'screen' => '1920x1080',
        ];

        $this->report($payload + ['moduleNumber' => 1, 'category' => 'manipulation_not_working'])->assertStatus(201);
        $this->report($payload + ['moduleNumber' => 2, 'category' => 'typo'])->assertStatus(201);

        $this->assertSame('Firefox 130', StudentReport::where('category', 'manipulation_not_working')->first()->browser);
        $this->assertNull(StudentReport::where('category', 'typo')->first()->browser);
    }

    /** §17 : le même problème signalé par plusieurs relecteurs forme UN groupe. */
    public function test_les_signalements_identiques_se_regroupent(): void
    {
        foreach (range(1, 5) as $i) {
            $this->report([
                'source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'questionId' => 'q4',
                'category' => 'math_error', 'note' => "Message différent numéro {$i}",
            ], $this->makeAmbassador())->assertStatus(201);
        }

        $this->report([
            'source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'questionId' => 'q4', 'category' => 'typo',
        ])->assertStatus(201);

        $this->assertSame(1, StudentReport::distinct('fingerprint')->where('category', 'math_error')->count('fingerprint'));

        $first = StudentReport::where('category', 'math_error')->first();
        $this->asAdmin()->getJson("/api/v1/admin/reports/{$first->id}")->assertStatus(200)
            ->assertJsonPath('report.related.total', 5);
    }

    /** Deux envois = deux signalements : il n'y a plus de brouillon réutilisé. */
    public function test_chaque_envoi_cree_un_signalement(): void
    {
        $payload = ['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3, 'category' => 'math_error'];
        $this->report($payload)->assertStatus(201);
        $this->report($payload)->assertStatus(201);
        $this->assertSame(2, StudentReport::count());
    }

    public function test_l_admin_voit_ouvre_annote_et_resout(): void
    {
        $id = $this->report([
            'source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3,
            'category' => 'math_error', 'note' => 'Le schéma ne correspond pas à l\'énoncé.',
        ])->assertStatus(201)->json('report.id');

        $this->asAdmin()->getJson('/api/v1/admin/reports')
            ->assertStatus(200)
            ->assertJsonPath('counts.new', 1)
            ->assertJsonPath('counts.withScreenshot', 0)
            ->assertJsonPath('reports.data.0.lessonCode', 'fractions')
            ->assertJsonPath('reports.data.0.hasScreenshot', false);

        $this->asAdmin()->getJson("/api/v1/admin/reports/{$id}")
            ->assertStatus(200)
            ->assertJsonPath('report.context.moduleTitle', 'Comparer des fractions')
            ->assertJsonPath('report.student.email', $this->ambassador->email)
            ->assertJsonPath('report.student.role', User::ROLE_TEACHER)
            ->assertJsonPath('report.student.isAmbassador', true);

        $this->asAdmin()->postJson("/api/v1/admin/reports/{$id}/notes", [
            'body' => 'Vérifié : le schéma est bien faux, corrigé en contenu.',
        ])->assertStatus(201);

        $this->asAdmin()->patchJson("/api/v1/admin/reports/{$id}", [
            'status' => StudentReport::STATUS_RESOLVED, 'priority' => 'high',
        ])->assertStatus(200)->assertJsonPath('report.status', StudentReport::STATUS_RESOLVED);

        $report = StudentReport::find($id);
        $this->assertNotNull($report->resolved_at);
        $this->assertSame($this->admin->id, $report->resolved_by);

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id, 'action' => 'report.updated', 'entity_id' => (string) $id,
        ]);
    }

    /** Les notes internes ne sortent d'aucun point d'entrée non-admin. */
    public function test_un_ambassadeur_ne_lit_pas_l_administration_des_signalements(): void
    {
        $id = $this->report(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other'])->json('report.id');
        $this->asAdmin()->postJson("/api/v1/admin/reports/{$id}/notes", ['body' => 'Note interne confidentielle'])->assertStatus(201);

        $this->actingAs($this->ambassador, 'sanctum')->getJson("/api/v1/admin/reports/{$id}")->assertStatus(403);
        $this->actingAs($this->ambassador, 'sanctum')->getJson('/api/v1/admin/reports')->assertStatus(403);
    }

    /** L'ancienne complétion en deux temps n'existe plus. */
    public function test_la_route_de_completion_n_existe_plus(): void
    {
        $id = $this->report(['source' => 'lesson', 'lessonCode' => 'fractions', 'category' => 'other'])->json('report.id');
        $status = $this->actingAs($this->ambassador, 'sanctum')->patchJson("/api/v1/reports/{$id}", ['category' => 'typo'])->status();
        $this->assertContains($status, [404, 405]);
        $this->assertSame('other', StudentReport::find($id)->category);
    }
}
