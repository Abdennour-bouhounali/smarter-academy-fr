<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\NotebookNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le carnet de l'élève : une note se prend à tout moment, se range par leçon,
 * se modifie, et se marque « traitée » sans jamais disparaître.
 */
class NotebookFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private Lesson $lesson;

    private Lesson $otherLesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);

        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Fonction affine', 'status' => 'available', 'order' => 0,
        ]);
        $this->otherLesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'ensembles-et-intervalles-2nde',
            'title' => 'Ensembles et intervalles', 'status' => 'available', 'order' => 1,
        ]);

        $this->student = User::factory()->create(['role' => 'student']);
    }

    private function note(array $attributes = []): NotebookNote
    {
        return NotebookNote::create(array_merge([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'content' => 'Une remarque.',
        ], $attributes));
    }

    /**
     * La note n'est liée ni à une question ni à une erreur : l'élève note ce
     * qu'il veut, quand il veut. C'est la moitié serveur de « on peut noter à
     * tout moment » — l'autre moitié est l'emplacement du bouton.
     */
    public function test_une_note_se_prend_sans_exercice_ni_type_d_erreur(): void
    {
        $response = $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'Penser à vérifier le signe de a.',
            'lessonCode' => 'fonction-affine-2nde',
        ]);

        $response->assertCreated()
            ->assertJsonPath('note.content', 'Penser à vérifier le signe de a.')
            ->assertJsonPath('note.lessonCode', 'fonction-affine-2nde')
            ->assertJsonPath('note.mistakeType', null)
            ->assertJsonPath('note.exerciseId', null)
            ->assertJsonPath('note.isCompleted', false);
    }

    public function test_les_notes_se_filtrent_par_lecon(): void
    {
        $this->note(['content' => 'Note affine A']);
        $this->note(['content' => 'Note affine B']);
        $this->note(['lesson_id' => $this->otherLesson->id, 'content' => 'Note intervalles']);

        $this->actingAs($this->student)
            ->getJson('/api/v1/practice/notes?lessonCode=fonction-affine-2nde')
            ->assertOk()
            ->assertJsonCount(2, 'notes');

        $this->actingAs($this->student)
            ->getJson('/api/v1/practice/notes')
            ->assertOk()
            ->assertJsonCount(3, 'notes');
    }

    public function test_marquer_traitee_pose_une_date_et_se_retire(): void
    {
        $note = $this->note();

        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonPath('note.isCompleted', true);

        $this->assertNotNull($note->fresh()->completed_at);

        // Une note traitée n'est PAS supprimée : le carnet reste un historique.
        $this->assertDatabaseHas('notebook_notes', ['id' => $note->id]);

        // Et le geste se défait — on peut remettre une note à revoir.
        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", ['completed' => false])
            ->assertOk()
            ->assertJsonPath('note.isCompleted', false);

        $this->assertNull($note->fresh()->completed_at);
    }

    public function test_les_notes_a_revoir_remontent_avant_les_traitees(): void
    {
        // La traitée est la PLUS RÉCENTE : sans la règle d'état, elle sortirait
        // première (tri par date décroissante).
        $done = $this->note(['content' => 'Traitée']);
        $todo = $this->note(['content' => 'À revoir']);
        $done->update(['completed_at' => now()]);

        $codes = $this->actingAs($this->student)
            ->getJson('/api/v1/practice/notes')
            ->assertOk()
            ->json('notes.*.content');

        $this->assertSame(['À revoir', 'Traitée'], $codes);
        $this->assertSame($todo->id, NotebookNote::where('content', 'À revoir')->value('id'));
    }

    public function test_le_contenu_se_modifie(): void
    {
        $note = $this->note(['content' => 'Version initiale']);

        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", ['content' => 'Version corrigée'])
            ->assertOk()
            ->assertJsonPath('note.content', 'Version corrigée');

        $this->assertSame('Version corrigée', $note->fresh()->content);
    }

    /**
     * Une note vide n'écrase jamais une note existante. Laravel rejette la
     * chaîne blanche en validation (422) avant même d'atteindre le service,
     * qui porte la même règle en second rideau — les deux disent non, et
     * c'est ce qui compte ici : le contenu d'origine survit.
     */
    public function test_une_note_vide_est_refusee(): void
    {
        $note = $this->note();

        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", ['content' => '   '])
            ->assertStatus(422);

        $this->assertSame('Une remarque.', $note->fresh()->content);
    }

    /**
     * La note d'autrui est « introuvable », jamais « interdite » : on ne
     * révèle pas son existence, y compris pour la marquer traitée.
     */
    public function test_la_note_d_un_autre_eleve_est_introuvable(): void
    {
        $other = User::factory()->create(['role' => 'student']);
        $note = NotebookNote::create([
            'user_id' => $other->id,
            'lesson_id' => $this->lesson->id,
            'content' => 'La note de quelqu’un d’autre.',
        ]);

        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", ['completed' => true])
            ->assertStatus(404);

        $this->actingAs($this->student)
            ->deleteJson("/api/v1/practice/notes/{$note->id}")
            ->assertStatus(404);

        $this->assertNull($note->fresh()->completed_at);

        // Et elle n'apparaît pas dans le carnet du demandeur.
        $this->actingAs($this->student)
            ->getJson('/api/v1/practice/notes')
            ->assertOk()
            ->assertJsonCount(0, 'notes');
    }

    /* ── Le contexte d'une note : figé à la création, vérifié par le serveur ── */

    private function lessonWithStructure(): Lesson
    {
        $lesson = Lesson::create([
            'chapter_id' => $this->lesson->chapter_id, 'code' => 'qasim-mushtarak-akbar',
            'title' => 'القاسم المشترك الأكبر', 'status' => 'available', 'order' => 2,
        ]);
        LearningPoint::create(['lesson_id' => $lesson->id, 'code' => '4am_qasim-mushtarak-akbar_P1', 'title' => 'P1', 'order' => 1]);
        LessonModule::create([
            'lesson_id' => $lesson->id, 'code' => 'qasim-mushtarak-akbar:02', 'number' => 2, 'slug' => 'maarif',
            'title' => 'معارف', 'publication_status' => 'published',
        ]);
        // Un point d'une AUTRE leçon, pour les tentatives de mélange.
        LearningPoint::create(['lesson_id' => $this->otherLesson->id, 'code' => 'seconde_ensembles_P1', 'title' => 'Autre', 'order' => 1]);

        return $lesson;
    }

    public function test_une_note_de_module_garde_sa_lecon_son_module_et_son_point(): void
    {
        $lesson = $this->lessonWithStructure();

        $response = $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'Ce que je retiens du module 2.',
            'lessonCode' => 'qasim-mushtarak-akbar',
            'moduleNumber' => 2,
            'learningPointCode' => '4am_qasim-mushtarak-akbar_P1',
        ]);

        $response->assertCreated()
            ->assertJsonPath('note.lessonCode', 'qasim-mushtarak-akbar')
            ->assertJsonPath('note.lessonTitle', 'القاسم المشترك الأكبر')
            ->assertJsonPath('note.moduleNumber', 2)
            ->assertJsonPath('note.moduleTitle', 'معارف')
            ->assertJsonPath('note.moduleSlug', 'maarif')
            ->assertJsonPath('note.learningPointCode', '4am_qasim-mushtarak-akbar_P1')
            ->assertJsonPath('note.learningPointTitle', 'P1')
            ->assertJsonPath('note.exerciseId', null);

        $this->assertDatabaseHas('notebook_notes', ['lesson_id' => $lesson->id, 'module_number' => 2]);

        // Et la liste porte les mêmes titres, sans une requête par note.
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes')
            ->assertOk()
            ->assertJsonPath('notes.0.moduleTitle', 'معارف');
    }

    /**
     * Une note d'exercice : la leçon, le point, l'exercice ET la question —
     * le contexte le plus précis n'efface pas le plus large.
     */
    public function test_une_note_d_exercice_est_verifiee_contre_le_contenu(): void
    {
        $this->lessonWithStructure();

        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'J’ai comparé les listes trop vite.',
            'lessonCode' => 'qasim-mushtarak-akbar',
            'learningPointCode' => '4am_qasim-mushtarak-akbar_P1',
            'exerciseId' => 'ex-4am-qasim-mushtarak-akbar-l1-001',
            'questionId' => 'q1',
            'mistakeType' => 'lecture',
        ])->assertCreated()
            ->assertJsonPath('note.exerciseId', 'ex-4am-qasim-mushtarak-akbar-l1-001')
            ->assertJsonPath('note.questionId', 'q1')
            ->assertJsonPath('note.learningPointCode', '4am_qasim-mushtarak-akbar_P1');

        // Une question qui n'existe pas dans cet exercice.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'lessonCode' => 'qasim-mushtarak-akbar',
            'exerciseId' => 'ex-4am-qasim-mushtarak-akbar-l1-001', 'questionId' => 'q9',
        ])->assertStatus(422);

        // Un exercice d'une autre leçon.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'lessonCode' => 'ensembles-et-intervalles-2nde',
            'exerciseId' => 'ex-4am-qasim-mushtarak-akbar-l1-001',
        ])->assertStatus(422);
    }

    /**
     * Les identifiants envoyés par le client ne sont jamais crus sur parole :
     * un point ou un module qui n'appartient pas à la leçon est refusé, et
     * rien n'est enregistré à moitié.
     */
    public function test_un_contexte_incoherent_est_refuse(): void
    {
        $this->lessonWithStructure();

        // Point d'une autre leçon.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'lessonCode' => 'qasim-mushtarak-akbar', 'learningPointCode' => 'seconde_ensembles_P1',
        ])->assertStatus(422);

        // Module inexistant dans la leçon.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'lessonCode' => 'qasim-mushtarak-akbar', 'moduleNumber' => 9,
        ])->assertStatus(422);

        // Module sans leçon, question sans exercice, leçon inconnue.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', ['content' => 'x', 'moduleNumber' => 2])->assertStatus(422);
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', ['content' => 'x', 'lessonCode' => 'qasim-mushtarak-akbar', 'questionId' => 'q1'])->assertStatus(422);
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', ['content' => 'x', 'lessonCode' => 'nexiste-pas'])->assertStatus(422);

        $this->assertSame(0, NotebookNote::count());
    }

    /** Un point seul suffit : sa leçon est déduite du point, jamais inventée. */
    public function test_un_point_seul_rattache_la_note_a_sa_lecon(): void
    {
        $lesson = $this->lessonWithStructure();

        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'learningPointCode' => '4am_qasim-mushtarak-akbar_P1',
        ])->assertCreated()->assertJsonPath('note.lessonCode', 'qasim-mushtarak-akbar');

        $this->assertDatabaseHas('notebook_notes', ['lesson_id' => $lesson->id]);
    }

    /**
     * Le contexte appartient à la CRÉATION : une modification ne le touche
     * pas, même si le client envoie d'autres codes.
     */
    public function test_modifier_une_note_ne_change_jamais_son_contexte(): void
    {
        $lesson = $this->lessonWithStructure();
        $note = $this->note(['lesson_id' => $lesson->id, 'module_number' => 2]);

        $this->actingAs($this->student)
            ->patchJson("/api/v1/practice/notes/{$note->id}", [
                'content' => 'Retravaillée depuis le module 3',
                'lessonCode' => 'ensembles-et-intervalles-2nde', 'moduleNumber' => 3, 'learningPointCode' => 'seconde_ensembles_P1',
            ])
            ->assertOk()
            ->assertJsonPath('note.moduleNumber', 2)
            ->assertJsonPath('note.lessonCode', 'qasim-mushtarak-akbar');

        $fresh = $note->fresh();
        $this->assertSame($lesson->id, $fresh->lesson_id);
        $this->assertSame(2, $fresh->module_number);
        $this->assertNull($fresh->learning_point_id);
    }

    /* ── « Mon cahier » : recherche, vues, tri, pagination, révision, actions groupées ── */

    private function cahier(): void
    {
        $this->note(['content' => '<p>Je confonds encore <strong>PGCD</strong> et PPCM.</p>', 'content_text' => 'Je confonds encore PGCD et PPCM.', 'mistake_type' => 'methode', 'note_type' => 'erreur', 'exercise_id' => 'ex-1', 'next_review_at' => now()]);
        $this->note(['content' => 'Pourquoi 6 ?', 'content_text' => 'Pourquoi 6 ?', 'note_type' => 'question', 'next_review_at' => now()]);
        $this->note(['content' => 'Astuce : lister les diviseurs', 'content_text' => 'Astuce : lister les diviseurs', 'note_type' => 'astuce', 'is_pinned' => true]);
        $this->note(['content' => 'Vieille note archivée', 'content_text' => 'Vieille note archivée', 'archived_at' => now()]);
        $this->note(['lesson_id' => $this->otherLesson->id, 'content' => 'Intervalles ouverts', 'content_text' => 'Intervalles ouverts']);
    }

    public function test_le_cahier_compte_ses_vues_et_les_filtre(): void
    {
        $this->cahier();
        $res = $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&page=1')->assertOk();

        $res->assertJsonPath('meta.total', 4) // l'archivée n'y est pas
            ->assertJsonPath('counts.all', 4)
            ->assertJsonPath('counts.review', 2)
            ->assertJsonPath('counts.errors', 1)
            ->assertJsonPath('counts.questions', 1)
            ->assertJsonPath('counts.pinned', 1)
            ->assertJsonPath('counts.archived', 1);
        // L'importante en tête, quelle que soit la date.
        $this->assertSame('astuce', $res->json('notes.0.noteType'));
        // Les leçons représentées, avec leur compte.
        $facets = collect($res->json('facets.lessons'))->keyBy('lessonCode');
        $this->assertSame(3, $facets['fonction-affine-2nde']['count']);
        $this->assertSame(1, $facets['ensembles-et-intervalles-2nde']['count']);

        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=errors')->assertOk()->assertJsonCount(1, 'notes')->assertJsonPath('notes.0.isErreur', true);
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=questions')->assertOk()->assertJsonCount(1, 'notes');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=review')->assertOk()->assertJsonCount(2, 'notes');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=archived')->assertOk()->assertJsonCount(1, 'notes')->assertJsonPath('notes.0.isArchived', true);
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&origin=exercise')->assertOk()->assertJsonCount(1, 'notes')->assertJsonPath('notes.0.origin', 'exercise');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&type=astuce')->assertOk()->assertJsonCount(1, 'notes');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&lessonCode=ensembles-et-intervalles-2nde')->assertOk()->assertJsonCount(1, 'notes');
        // Le domaine, par la relation de la leçon.
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&chapterCode=fonctions')->assertOk()->assertJsonPath('meta.total', 4);
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&gradeCode=seconde')->assertOk()->assertJsonPath('meta.total', 4);
    }

    public function test_la_recherche_porte_sur_le_texte_nu_le_titre_et_les_titres_de_lecon(): void
    {
        $this->cahier();
        $this->note(['title' => 'Méthode d’Euclide', 'content' => 'x', 'content_text' => 'x']);

        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?q=PGCD')->assertOk()->assertJsonCount(1, 'notes');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?q=Euclide')->assertOk()->assertJsonCount(1, 'notes');
        // Le titre de la leçon compte aussi…
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?q=Intervalles')->assertOk()->assertJsonCount(1, 'notes');
        // …mais pas les balises : « strong » est dans le HTML, pas dans le texte.
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?q=strong')->assertOk()->assertJsonCount(0, 'notes');
        // Les jokers du LIKE sont des caractères.
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?q=%25')->assertOk()->assertJsonCount(0, 'notes');
    }

    public function test_la_pagination_et_les_tris(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $n = $this->note(['content' => "Note $i", 'content_text' => "Note $i"]);
            $n->forceFill(['created_at' => now()->subDays(10 - $i)])->save();
        }
        $p1 = $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&page=1&perPage=2')->assertOk();
        $p1->assertJsonCount(2, 'notes')->assertJsonPath('meta.total', 5)->assertJsonPath('meta.hasMore', true);
        $this->assertSame('Note 5', $p1->json('notes.0.excerpt'));
        $p3 = $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&page=3&perPage=2')->assertOk();
        $p3->assertJsonCount(1, 'notes')->assertJsonPath('meta.hasMore', false);

        $oldest = $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all&sort=oldest')->assertOk();
        $this->assertSame('Note 1', $oldest->json('notes.0.excerpt'));
    }

    public function test_titre_type_importance_archive_et_file_de_revision_se_modifient(): void
    {
        $note = $this->note();
        $this->assertNull($note->next_review_at);

        $this->actingAs($this->student)->patchJson("/api/v1/practice/notes/{$note->id}", [
            'title' => '  Ma règle  ', 'noteType' => 'question', 'pinned' => true, 'review' => true,
        ])->assertOk()
            ->assertJsonPath('note.title', 'Ma règle')
            ->assertJsonPath('note.noteType', 'question')
            ->assertJsonPath('note.isPinned', true)
            ->assertJsonPath('note.isToReview', true);

        $this->actingAs($this->student)->patchJson("/api/v1/practice/notes/{$note->id}", ['archived' => true])
            ->assertOk()->assertJsonPath('note.isArchived', true);
        // Archivée : hors du cahier, mais pas supprimée.
        $this->assertDatabaseHas('notebook_notes', ['id' => $note->id]);
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes?view=all')->assertOk()->assertJsonCount(0, 'notes');
        $this->actingAs($this->student)->getJson('/api/v1/practice/notes')->assertOk()->assertJsonCount(0, 'notes');

        $this->actingAs($this->student)->patchJson("/api/v1/practice/notes/{$note->id}", ['noteType' => 'inconnu'])->assertStatus(422);
    }

    public function test_une_note_nait_a_revoir_et_la_creation_accepte_titre_et_type(): void
    {
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => '<p>Pourquoi <em>6</em> ?</p>', 'title' => 'Ma question', 'noteType' => 'question', 'lessonCode' => 'fonction-affine-2nde',
        ])->assertCreated()
            ->assertJsonPath('note.title', 'Ma question')
            ->assertJsonPath('note.noteType', 'question')
            ->assertJsonPath('note.isToReview', true)
            ->assertJsonPath('note.excerpt', 'Pourquoi 6 ?');

        // Une note d'exercice avec un type d'erreur est une erreur, sans le dire.
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes', [
            'content' => 'x', 'lessonCode' => 'fonction-affine-2nde', 'mistakeType' => 'signe',
        ])->assertCreated()->assertJsonPath('note.noteType', 'erreur')->assertJsonPath('note.isErreur', true);
    }

    public function test_une_revision_active_espace_ou_sort_de_la_file(): void
    {
        $note = $this->note(['next_review_at' => now()]);

        $again = $this->actingAs($this->student)->postJson("/api/v1/practice/notes/{$note->id}/review", ['outcome' => 'again'])->assertOk();
        $again->assertJsonPath('note.reviewCount', 1)->assertJsonPath('note.isToReview', true)->assertJsonPath('note.isCompleted', false);
        $this->assertTrue($note->fresh()->next_review_at->greaterThan(now()->addHours(20)));

        $known = $this->actingAs($this->student)->postJson("/api/v1/practice/notes/{$note->id}/review", ['outcome' => 'known'])->assertOk();
        $known->assertJsonPath('note.reviewCount', 2)->assertJsonPath('note.isToReview', false)->assertJsonPath('note.isCompleted', true);

        $this->actingAs($this->student)->postJson("/api/v1/practice/notes/{$note->id}/review", ['outcome' => 'peut-etre'])->assertStatus(422);
    }

    public function test_les_actions_groupees_ne_touchent_que_mes_notes(): void
    {
        $mine = [$this->note()->id, $this->note()->id];
        $other = User::factory()->create(['role' => 'student']);
        $theirs = NotebookNote::create(['user_id' => $other->id, 'lesson_id' => $this->lesson->id, 'content' => 'x']);

        $this->actingAs($this->student)->postJson('/api/v1/practice/notes/bulk', ['ids' => [...$mine, $theirs->id], 'action' => 'archive'])
            ->assertOk()->assertJsonPath('count', 2)->assertJsonPath('counts.archived', 2);
        $this->assertNull($theirs->fresh()->archived_at);

        $this->actingAs($this->student)->postJson('/api/v1/practice/notes/bulk', ['ids' => $mine, 'action' => 'unarchive'])->assertOk()->assertJsonPath('count', 2);
        $this->actingAs($this->student)->postJson('/api/v1/practice/notes/bulk', ['ids' => [...$mine, $theirs->id], 'action' => 'delete'])->assertOk()->assertJsonPath('count', 2);
        $this->assertDatabaseHas('notebook_notes', ['id' => $theirs->id]);
        $this->assertDatabaseMissing('notebook_notes', ['id' => $mine[0]]);
    }

    public function test_une_note_se_lit_seule_et_celle_d_autrui_est_introuvable(): void
    {
        $note = $this->note(['title' => 'Seule']);
        $this->actingAs($this->student)->getJson("/api/v1/practice/notes/{$note->id}")->assertOk()->assertJsonPath('note.title', 'Seule');

        $other = User::factory()->create(['role' => 'student']);
        $theirs = NotebookNote::create(['user_id' => $other->id, 'content' => 'x']);
        $this->actingAs($this->student)->getJson("/api/v1/practice/notes/{$theirs->id}")->assertStatus(404);
        $this->actingAs($this->student)->postJson("/api/v1/practice/notes/{$theirs->id}/review", ['outcome' => 'known'])->assertStatus(404);
    }
}
