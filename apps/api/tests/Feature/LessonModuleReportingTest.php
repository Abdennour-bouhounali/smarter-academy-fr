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
 * Signaler depuis le sommaire d'une leçon et depuis un module.
 *
 * Le parcours a DEUX temps, et c'est le cœur du test : le clic pose un signal
 * exploitable avant toute saisie, l'envoi le complète. Un formulaire abandonné
 * doit laisser une trace — c'est justement l'information qu'on perdait.
 */
class LessonModuleReportingTest extends TestCase
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
            'chapter_id' => $chapter->id, 'code' => 'fractions', 'title' => 'Fractions',
            'status' => 'available', 'order' => 0, 'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '03', 'number' => 3,
            'title' => 'Comparer des fractions', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function signal(array $context, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->student, 'sanctum')->postJson('/api/v1/reports', $context);
    }

    private function complete(int $id, array $details, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->student, 'sanctum')->patchJson("/api/v1/reports/{$id}", $details);
    }

    // ------------------------------------------------------- SIGNAL IMMÉDIAT

    /**
     * LE point du dispositif : le signalement existe dès le clic, sans
     * catégorie. « Un élève a buté ici » est déjà exploitable.
     */
    public function test_le_clic_cree_le_signalement_avant_toute_saisie(): void
    {
        $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions', 'grade' => '6e'])
            ->assertStatus(201)
            ->assertJsonPath('report.submitted', false)
            ->assertJsonPath('report.category', null);

        $report = StudentReport::first();
        $this->assertNotNull($report, 'le signal doit exister sans attendre le formulaire');
        $this->assertNull($report->category, 'aucune catégorie inventée');
        $this->assertNull($report->details_completed_at);
        $this->assertSame(StudentReport::STATUS_NEW, $report->status);
        $this->assertSame($this->student->id, $report->user_id);
    }

    /** Fermer sans rien écrire ne supprime pas le signal (§14). */
    public function test_un_formulaire_abandonne_laisse_sa_trace(): void
    {
        $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])
            ->assertStatus(201);

        // L'élève referme : aucun appel de complétion n'arrive jamais.
        $this->assertSame(1, StudentReport::count());
        $this->assertFalse(StudentReport::first()->hasDetails());
    }

    // ------------------------------------------------------------- CONTEXTE

    public function test_un_signalement_de_lecon_identifie_la_lecon_sans_module(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions', 'grade' => '6e'])
            ->json('report.id');
        $this->complete($id, ['category' => 'math_error', 'note' => 'Un calcul faux dans le sommaire.'])
            ->assertStatus(200);

        $report = StudentReport::find($id);
        $this->assertSame(StudentReport::SOURCE_LESSON, $report->source);
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertNull($report->lesson_module_id);
        $this->assertNull($report->module_number);
        $this->assertSame('math_error', $report->category);
    }

    public function test_un_signalement_de_module_identifie_lecon_e_t_module(): void
    {
        $id = $this->signal([
            'source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e', 'moduleNumber' => 3,
        ])->json('report.id');
        $this->complete($id, ['category' => 'manipulation_not_working', 'note' => 'Le glisser ne marche pas.'])
            ->assertStatus(200);

        $report = StudentReport::find($id);
        $this->assertSame(StudentReport::SOURCE_MODULE, $report->source);
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertSame($this->module->id, $report->lesson_module_id, 'le module doit être résolu côté serveur');
        $this->assertSame(3, $report->module_number);
    }

    /** Un signalement de module sans module n'a nulle part où pointer. */
    public function test_un_signalement_de_module_exige_le_module(): void
    {
        $this->signal(['source' => 'module', 'lessonCode' => 'fractions'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_une_source_inconnue_est_refusee(): void
    {
        $this->signal(['source' => 'depuis_la_lune', 'lessonCode' => 'fractions'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('source');
    }

    /**
     * IDOR : le module est cherché PAR (leçon, numéro), jamais par un id
     * posté. Un numéro qui n'existe pas dans CETTE leçon ne se rattache donc
     * à rien — même si ce numéro existe ailleurs.
     */
    public function test_un_module_d_une_autre_lecon_n_est_jamais_rattache(): void
    {
        $autre = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'autre-lecon',
            'title' => 'Autre', 'status' => 'available', 'order' => 1,
        ]);
        $moduleAilleurs = LessonModule::create([
            'lesson_id' => $autre->id, 'code' => '09', 'number' => 9, 'title' => 'Ailleurs',
        ]);

        $id = $this->signal([
            'source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e',
            'moduleNumber' => 9,
            'lesson_module_id' => $moduleAilleurs->id,
        ])->json('report.id');

        $report = StudentReport::find($id);
        $this->assertSame($this->lesson->id, $report->lesson_id);
        $this->assertNull(
            $report->lesson_module_id,
            'le module 9 n\'existe pas dans fractions : rien ne doit être rattaché'
        );
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
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');

        $this->complete($id, ['category' => $category])->assertStatus(200);
        $this->assertSame($category, StudentReport::find($id)->category);
    }

    /**
     * §21 : l'ancien vocabulaire reste accepté. Le supprimer casserait tout
     * client pas encore rechargé, et rendrait illisibles les signalements
     * déjà en base.
     */
    public function test_les_anciennes_categories_restent_acceptees(): void
    {
        foreach (StudentReport::LEGACY_CATEGORIES as $legacy) {
            $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
            $this->complete($id, ['category' => $legacy])->assertStatus(200);
        }

        $this->assertSame(count(StudentReport::LEGACY_CATEGORIES), StudentReport::whereNotNull('category')->count());
    }

    /** « Autre » n'oblige pas à écrire : un signalement sans mot reste utile. */
    public function test_autre_sans_texte_est_accepte(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');

        $this->complete($id, ['category' => 'other'])->assertStatus(200);
        $this->assertNull(StudentReport::find($id)->note);
    }

    public function test_un_texte_trop_long_est_refuse(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');

        $this->complete($id, ['category' => 'other', 'note' => str_repeat('a', 2001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('note');
    }

    // ---------------------------------------------------------- PROPRIÉTÉ

    public function test_un_eleve_ne_complete_pas_le_signalement_d_un_autre(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
        $intrus = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->complete($id, ['category' => 'typo'], $intrus)
            ->assertStatus(422)
            // Indiscernable d'un signalement inexistant : ne pas révéler qu'il existe.
            ->assertJsonPath('message', 'Signalement introuvable.');

        $this->assertNull(StudentReport::find($id)->category);
    }

    public function test_un_signalement_deja_envoye_ne_se_reecrit_pas(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
        $this->complete($id, ['category' => 'math_error'])->assertStatus(200);

        $this->complete($id, ['category' => 'typo'])->assertStatus(422);
        $this->assertSame('math_error', StudentReport::find($id)->category);
    }

    public function test_un_visiteur_ne_signale_rien(): void
    {
        $this->postJson('/api/v1/reports', ['source' => 'lesson', 'lessonCode' => 'fractions'])
            ->assertStatus(401);
    }

    // -------------------------------------------------------- DÉDUPLICATION

    /** Ouvrir et refermer cinq fois ne fabrique pas cinq signalements (§15). */
    public function test_les_ouvertures_repetees_reutilisent_le_meme_signal(): void
    {
        $ids = [];
        foreach (range(1, 5) as $ignored) {
            $ids[] = $this->signal([
                'source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3,
            ])->json('report.id');
        }

        $this->assertCount(1, array_unique($ids));
        $this->assertSame(1, StudentReport::count());
    }

    /**
     * ...mais deux problèmes DIFFÉRENTS sur le même module restent deux
     * signalements. La dédup ne doit pas faire taire un second constat.
     */
    public function test_un_second_probleme_apres_envoi_cree_un_nouveau_signalement(): void
    {
        $first = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])->json('report.id');
        $this->complete($first, ['category' => 'math_error'])->assertStatus(200);

        $second = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])->json('report.id');
        $this->complete($second, ['category' => 'manipulation_not_working'])->assertStatus(200);

        $this->assertNotSame($first, $second);
        $this->assertSame(2, StudentReport::count());
    }

    /** Deux modules distincts ne partagent jamais un signal. */
    public function test_deux_modules_donnent_deux_signalements(): void
    {
        LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '04', 'number' => 4, 'title' => 'Suite',
        ]);

        $a = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])->json('report.id');
        $b = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 4])->json('report.id');

        $this->assertNotSame($a, $b);
        $this->assertSame(2, StudentReport::count());
    }

    /**
     * Le cas que le durcissement vise : le POST initial échoue (réseau), le
     * client repose le signal à l'envoi, et il ne doit en résulter QU'UN
     * signalement.
     *
     * C'est déjà garanti par la déduplication : reposer le même contexte
     * pendant que le signal est encore incomplet retrouve la même ligne. Ce
     * test l'énonce depuis le point de vue du client qui réessaie, parce que
     * c'est ce chemin-là qui doit rester vrai.
     */
    public function test_reposer_le_signal_apres_un_echec_ne_cree_pas_de_doublon(): void
    {
        // Premier POST : supposons sa réponse perdue en route. La ligne
        // existe pourtant bien côté serveur.
        $first = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3]);
        $first->assertStatus(201);

        // Le client, qui se croit sans identifiant, repose le signal à l'envoi.
        $retry = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3]);
        $retry->assertStatus(201);

        $this->assertSame(
            $first->json('report.id'),
            $retry->json('report.id'),
            'la nouvelle tentative doit retrouver le MÊME signalement'
        );
        $this->assertSame(1, StudentReport::count());

        // Et la complétion aboutit sur cette unique ligne.
        $this->complete($retry->json('report.id'), ['category' => 'math_error', 'note' => 'Rejoué.'])
            ->assertStatus(200);

        $this->assertSame(1, StudentReport::count());
        $this->assertSame('math_error', StudentReport::first()->category);
    }

    // ---------------------------------------------------------------- ADMIN

    public function test_l_admin_voit_l_origine_et_le_contexte_exact(): void
    {
        $lessonReport = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions', 'grade' => '6e'])->json('report.id');
        $this->complete($lessonReport, ['category' => 'typo', 'note' => 'Coquille dans le sommaire.']);

        $moduleReport = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'grade' => '6e', 'moduleNumber' => 3])->json('report.id');
        $this->complete($moduleReport, ['category' => 'manipulation_not_working', 'note' => 'Rien ne bouge.']);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports')
            ->assertStatus(200)
            ->assertJsonPath('counts.all', 2);

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

    /**
     * Les signaux sans description sont VISIBLES par défaut — mais étiquetés.
     *
     * Ils étaient masqués au départ. Un signal caché derrière une case à
     * cocher est un signal que personne ne regarde, alors que « douze élèves
     * ont ouvert la fenêtre ici sans rien écrire » est justement ce qu'on
     * veut voir. Ce qui compte, c'est de ne pas les confondre avec un
     * signalement abouti : d'où `detailsCompleted`.
     */
    public function test_les_signaux_incomplets_sont_listes_et_distingues(): void
    {
        $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3]);
        $complete = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
        $this->complete($complete, ['category' => 'typo']);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports')
            ->assertStatus(200)
            ->assertJsonCount(2, 'reports.data')
            ->assertJsonPath('counts.incomplete', 1);

        $flags = collect($response->json('reports.data'))->pluck('detailsCompleted')->sort()->values();
        $this->assertEquals([false, true], $flags->all(), 'les deux états doivent être distinguables');
    }

    public function test_l_admin_isole_les_signaux_seuls_ou_les_signalements_decrits(): void
    {
        $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3]);
        $complete = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
        $this->complete($complete, ['category' => 'typo']);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?completion=incomplete')
            ->assertStatus(200)
            ->assertJsonCount(1, 'reports.data')
            ->assertJsonPath('reports.data.0.detailsCompleted', false);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?completion=complete')
            ->assertStatus(200)
            ->assertJsonCount(1, 'reports.data')
            ->assertJsonPath('reports.data.0.detailsCompleted', true);
    }

    /**
     * Le filtre de complétude ne doit pas annuler les autres : un
     * administrateur combine « signaux seuls » et « sur ce module ».
     */
    public function test_le_filtre_de_completude_se_combine_aux_autres(): void
    {
        $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3]);
        $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions']);

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/reports?completion=incomplete&source=module')
            ->assertStatus(200)
            ->assertJsonCount(1, 'reports.data')
            ->assertJsonPath('reports.data.0.source', 'module');
    }

    /**
     * Une source inventée ne franchit pas la validation, quelle qu'elle soit.
     * La liste est fermée côté serveur : le client ne peut pas se déclarer
     * dans un contexte interne.
     */
    public function test_aucune_source_hors_liste_n_est_acceptee(): void
    {
        foreach (['admin', 'arbitrary', 'another_internal_context', '', 'LESSON'] as $forged) {
            $this->signal(['source' => $forged, 'lessonCode' => 'fractions'])
                ->assertStatus(422);
        }

        $this->assertSame(0, StudentReport::count(), 'aucune ligne ne doit être créée');
    }

    public function test_l_admin_filtre_par_origine(): void
    {
        $a = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');
        $this->complete($a, ['category' => 'typo']);
        $b = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])->json('report.id');
        $this->complete($b, ['category' => 'display_problem']);

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?source=module')
            ->assertStatus(200)
            ->assertJsonCount(1, 'reports.data')
            ->assertJsonPath('reports.data.0.source', 'module');
    }

    public function test_un_eleve_n_accede_pas_a_l_administration_des_signalements(): void
    {
        $id = $this->signal(['source' => 'lesson', 'lessonCode' => 'fractions'])->json('report.id');

        $this->actingAs($this->student, 'sanctum')->getJson('/api/v1/admin/reports')->assertStatus(403);
        $this->actingAs($this->student, 'sanctum')->getJson("/api/v1/admin/reports/{$id}")->assertStatus(403);
    }

    // ----------------------------------------------- AUCUN EFFET DE BORD

    /**
     * §13 : signaler n'est pas apprendre. Aucune progression, aucune preuve,
     * aucune maîtrise ne doit bouger.
     */
    public function test_signaler_ne_touche_a_aucune_donnee_d_apprentissage(): void
    {
        $id = $this->signal(['source' => 'module', 'lessonCode' => 'fractions', 'moduleNumber' => 3])->json('report.id');
        $this->complete($id, ['category' => 'math_error', 'note' => 'Faux.']);

        $this->assertDatabaseCount('student_lesson_progress', 0);
        $this->assertDatabaseCount('learning_evidence', 0);
        $this->assertDatabaseCount('student_learning_point_progress', 0);
        $this->assertDatabaseCount('exercise_attempts', 0);
    }
}
