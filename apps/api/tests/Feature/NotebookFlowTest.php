<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
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
}
