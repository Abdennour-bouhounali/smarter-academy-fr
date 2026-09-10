<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * La chaîne complète : un élève signale un problème → le serveur reconstruit
 * le contexte tout seul → l'administrateur le voit, l'ouvre, le résout → la
 * décision est journalisée.
 *
 * C'est le test qui dit si le panneau d'administration sert à quelque chose.
 */
class StudentReportFlowTest extends TestCase
{
    use RefreshDatabase;

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

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    /**
     * `actingAs` plutôt qu'un en-tête Bearer : Laravel MÉMORISE l'utilisateur
     * résolu pour toute la durée du cas de test, si bien qu'après un premier
     * appel authentifié en élève, reposer l'en-tête avec le jeton de l'admin
     * continue de résoudre l'élève — et la porte can:admin répond 403 sur un
     * jeton pourtant valide. `actingAs` réinitialise l'utilisateur courant à
     * chaque appel, ce dont ce test a besoin puisqu'il alterne les deux rôles.
     *
     * La suite couvre par ailleurs le chemin par vrai jeton dans
     * AdminAuthorizationTest, où chaque cas n'utilise qu'un seul rôle.
     */
    private function asStudent(): self
    {
        return $this->actingAs($this->student, 'sanctum');
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    /**
     * L'élève n'envoie que des CODES. Le serveur retrouve seul la leçon et le
     * module, et c'est ce qui garantit qu'un signalement pointe vers le bon
     * contenu même si l'élève n'a rien identifié.
     */
    public function test_le_serveur_reconstruit_le_contexte_a_partir_des_codes(): void
    {
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'wrong_answer',
            'note' => 'La correction dit 3/4 mais je trouve 2/4.',
            'lessonCode' => 'fractions',
            'grade' => '6e',
            'moduleNumber' => 3,
            'step' => 'etape-2',
            'route' => '/courses/college/6e/nombres_calculs/fractions/comparer',
        ])->assertStatus(201)->assertJsonPath('success', true);

        $report = StudentReport::first();

        $this->assertSame($this->student->id, $report->user_id);
        $this->assertSame($this->lesson->id, $report->lesson_id, 'la leçon doit être résolue côté serveur');
        $this->assertSame($this->module->id, $report->lesson_module_id, 'le module doit être résolu côté serveur');
        $this->assertSame('etape-2', $report->step);
        $this->assertSame(StudentReport::STATUS_NEW, $report->status);
        $this->assertNotEmpty($report->fingerprint);
    }

    /** La note est facultative : exiger un texte ferait taire les élèves. */
    public function test_un_signalement_sans_note_est_accepte(): void
    {
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'display_problem',
            'lessonCode' => 'fractions',
            'moduleNumber' => 3,
        ])->assertStatus(201);

        $this->assertNull(StudentReport::first()->note);
    }

    public function test_une_categorie_inconnue_est_refusee(): void
    {
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'je_fais_ce_que_je_veux',
            'lessonCode' => 'fractions',
        ])->assertStatus(422)->assertJsonValidationErrors('category');
    }

    /**
     * Un client qui poste un lesson_id n'obtient rien : le champ n'est pas
     * validé, donc jamais lu. Le contexte vient des codes, point.
     */
    public function test_un_identifiant_envoye_par_le_client_est_ignore(): void
    {
        $autre = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'autre-lecon',
            'title' => 'Autre', 'status' => 'available', 'order' => 1,
        ]);

        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'typo',
            'lessonCode' => 'fractions',
            'lesson_id' => $autre->id,
            'user_id' => $this->admin->id,
            'status' => StudentReport::STATUS_RESOLVED,
            'priority' => 'critical',
        ])->assertStatus(201);

        $report = StudentReport::first();
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertSame($this->student->id, $report->user_id);
        $this->assertSame(StudentReport::STATUS_NEW, $report->status);
        $this->assertSame('low', $report->priority, 'une coquille entre en priorité basse, pas critique');
    }

    /** Le contexte machine n'est gardé que pour les pannes. */
    public function test_le_contexte_technique_n_est_garde_que_pour_un_probleme_technique(): void
    {
        $payload = [
            'lessonCode' => 'fractions',
            'browser' => 'Firefox 130',
            'os' => 'Linux',
            'screen' => '1920x1080',
        ];

        $this->asStudent()->postJson('/api/v1/reports', $payload + ['category' => 'technical_problem'])->assertStatus(201);
        $this->asStudent()->postJson('/api/v1/reports', $payload + ['category' => 'typo'])->assertStatus(201);

        $technical = StudentReport::where('category', 'technical_problem')->first();
        $typo = StudentReport::where('category', 'typo')->first();

        $this->assertSame('Firefox 130', $technical->browser);
        $this->assertNull($typo->browser, 'une coquille n\'a pas besoin du navigateur de l\'élève');
    }

    /**
     * §17 : vingt-cinq élèves qui butent sur la même question forment UN
     * problème. Le regroupement est déterministe, sans classification floue.
     */
    public function test_les_signalements_identiques_se_regroupent(): void
    {
        foreach (range(1, 5) as $i) {
            $peer = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
            $this->withHeader('Authorization', 'Bearer '.$peer->createToken('s')->plainTextToken)
                ->postJson('/api/v1/reports', [
                    'category' => 'wrong_answer',
                    'lessonCode' => 'fractions',
                    'moduleNumber' => 3,
                    'questionId' => 'q4',
                    'note' => "Message différent numéro {$i}",
                ])->assertStatus(201);
        }

        // Un problème différent sur la même leçon ne doit PAS rejoindre le groupe.
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'typo',
            'lessonCode' => 'fractions',
            'moduleNumber' => 3,
            'questionId' => 'q4',
        ])->assertStatus(201);

        $this->assertSame(1, StudentReport::distinct('fingerprint')->where('category', 'wrong_answer')->count('fingerprint'));

        $first = StudentReport::where('category', 'wrong_answer')->first();
        $detail = $this->asAdmin()->getJson("/api/v1/admin/reports/{$first->id}")->assertStatus(200);
        $detail->assertJsonPath('report.related.total', 5);
    }

    /**
     * Le parcours complet côté administration : voir, ouvrir, annoter,
     * résoudre — et laisser une trace.
     */
    public function test_l_admin_voit_ouvre_annote_et_resout(): void
    {
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'content_error',
            'note' => 'Le schéma ne correspond pas à l\'énoncé.',
            'lessonCode' => 'fractions',
            'moduleNumber' => 3,
        ])->assertStatus(201);

        $id = StudentReport::first()->id;

        $this->asAdmin()->getJson('/api/v1/admin/reports')
            ->assertStatus(200)
            ->assertJsonPath('counts.new', 1)
            ->assertJsonPath('reports.data.0.lessonCode', 'fractions');

        $this->asAdmin()->getJson("/api/v1/admin/reports/{$id}")
            ->assertStatus(200)
            ->assertJsonPath('report.context.moduleTitle', 'Comparer des fractions')
            ->assertJsonPath('report.student.email', $this->student->email);

        $this->asAdmin()->postJson("/api/v1/admin/reports/{$id}/notes", [
            'body' => 'Vérifié : le schéma est bien faux, corrigé en contenu.',
        ])->assertStatus(201);

        $this->asAdmin()->patchJson("/api/v1/admin/reports/{$id}", [
            'status' => StudentReport::STATUS_RESOLVED,
            'priority' => 'high',
        ])->assertStatus(200)->assertJsonPath('report.status', StudentReport::STATUS_RESOLVED);

        $report = StudentReport::find($id);
        $this->assertNotNull($report->resolved_at);
        $this->assertSame($this->admin->id, $report->resolved_by);

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => 'report.updated',
            'entity_id' => (string) $id,
        ]);
    }

    /** Les notes internes ne sortent d'aucun point d'entrée élève. */
    public function test_un_eleve_ne_voit_jamais_les_notes_internes(): void
    {
        $this->asStudent()->postJson('/api/v1/reports', [
            'category' => 'other', 'lessonCode' => 'fractions',
        ])->assertStatus(201);

        $id = StudentReport::first()->id;
        $this->asAdmin()->postJson("/api/v1/admin/reports/{$id}/notes", ['body' => 'Note interne confidentielle'])
            ->assertStatus(201);

        // Il n'existe aucune route élève qui lise un signalement — et celle
        // de l'administration lui est fermée.
        $this->asStudent()->getJson("/api/v1/admin/reports/{$id}")->assertStatus(403);
    }
}
