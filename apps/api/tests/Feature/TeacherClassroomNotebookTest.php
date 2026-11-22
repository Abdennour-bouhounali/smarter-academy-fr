<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\ClassroomMembership;
use App\Models\NotebookNote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * LE CAHIER D'UN ÉLÈVE, LU PAR SON ENSEIGNANT.
 *
 * Cette lecture a été ouverte le 2026-09-24, en renversant une règle
 * antérieure (« personne d'autre que l'élève ne lit le cahier »). Ce qui
 * borne la nouvelle règle est ici, et nulle part ailleurs :
 *
 *   · l'enseignant lit le cahier des élèves DE SES classes, et d'eux seuls ;
 *   · dans le périmètre des leçons EFFECTIVES de la classe ;
 *   · en LECTURE SEULE.
 *
 * Chaque refus est vérifié depuis l'API, pas depuis le service : c'est
 * l'URL qu'un curieux manipulerait.
 */
class TeacherClassroomNotebookTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_l_enseignant_lit_le_cahier_d_un_eleve_de_sa_classe(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => $lessons[0]->id,
            'title' => 'je confonds', 'content' => '<p>j’oublie le signe</p>', 'content_text' => 'j’oublie le signe',
            'note_type' => 'erreur', 'mistake_type' => 'signe',
        ]);

        $body = $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook")
            ->assertOk()->json();

        $this->assertTrue($body['readOnly']);
        $this->assertCount(1, $body['notes']);
        $this->assertSame('je confonds', $body['notes'][0]['title']);
        // Ce que l'enseignant vient chercher : l'erreur, telle que l'élève l'a nommée.
        $this->assertTrue($body['notes'][0]['isErreur']);
        $this->assertSame('signe', $body['notes'][0]['mistakeType']);
        $this->assertSame($lessons[0]->code, $body['notes'][0]['lessonCode']);
        $this->assertSame($student->id, $body['student']['id']);
    }

    public function test_une_note_se_lit_seule(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();
        $note = NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => $lessons[0]->id,
            'content' => '<p>x</p>', 'content_text' => 'x',
        ]);

        $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook/{$note->id}")
            ->assertOk()
            ->assertJsonPath('note.id', $note->id)
            ->assertJsonPath('readOnly', true);
    }

    // ── LES REFUS ────────────────────────────────────────────────────────

    public function test_le_cahier_d_un_eleve_d_une_AUTRE_classe_est_refuse(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $mine = Classroom::factory()->create();
        $theirs = Classroom::factory()->create();
        $stranger = $this->student();
        ClassroomMembership::factory()->in($theirs)->of($stranger)->create();
        NotebookNote::create([
            'user_id' => $stranger->id, 'lesson_id' => $lessons[0]->id,
            'content' => '<p>secret</p>', 'content_text' => 'secret',
        ]);

        // Par MA classe : l'élève n'en est pas membre → 404.
        $this->withToken($this->tokenOf($mine->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$mine->id}/students/{$stranger->id}/notebook")
            ->assertNotFound();

        // Par LEUR classe : elle ne m'appartient pas → 403 (ClassroomPolicy).
        $this->withToken($this->tokenOf($mine->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$theirs->id}/students/{$stranger->id}/notebook")
            ->assertForbidden();
    }

    public function test_un_eleve_ne_peut_pas_lire_le_cahier_d_un_autre_par_cette_porte(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $curious = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();
        ClassroomMembership::factory()->in($classroom)->of($curious)->create();

        // Le rôle ne passe pas la porte (can:teacher) — même dans SA classe.
        $this->withToken($this->tokenOf($curious))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook")
            ->assertForbidden();
    }

    public function test_un_visiteur_est_refuse(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        $this->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook")
            ->assertUnauthorized();
    }

    // ── LE PÉRIMÈTRE ─────────────────────────────────────────────────────

    public function test_une_note_hors_du_perimetre_de_la_classe_reste_privee(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        // L'enseignant a MASQUÉ la seconde leçon pour sa classe : ce que
        // l'élève y a écrit ne le regarde plus.
        // `classroom_id` / `lesson_id` ne sont pas `fillable` (même garde que
        // Classroom et ClassroomMembership) : on les pose explicitement,
        // comme le fait ClassroomLessonService.
        $hiddenRow = new ClassroomLesson(['status' => ClassroomLesson::STATUS_HIDDEN, 'created_by' => $classroom->teacher_id]);
        $hiddenRow->classroom_id = $classroom->id;
        $hiddenRow->lesson_id = $lessons[1]->id;
        $hiddenRow->save();
        $visible = NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => $lessons[0]->id,
            'content' => '<p>vue</p>', 'content_text' => 'vue',
        ]);
        $hidden = NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => $lessons[1]->id,
            'content' => '<p>masquee</p>', 'content_text' => 'masquee',
        ]);
        // Une note prise HORS de toute leçon n'est rattachée à aucun قسم.
        $orphan = NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => null,
            'content' => '<p>orpheline</p>', 'content_text' => 'orpheline',
        ]);

        $body = $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook")
            ->assertOk()->json();

        $this->assertSame([$visible->id], array_column($body['notes'], 'id'));
        $this->assertSame(1, $body['counts']['all']);
        $this->assertStringNotContainsString('masquee', json_encode($body));
        $this->assertStringNotContainsString('orpheline', json_encode($body));

        // Et elles ne s'ouvrent pas non plus une par une.
        foreach ([$hidden->id, $orphan->id] as $id) {
            $this->withToken($this->tokenOf($classroom->teacher))
                ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook/{$id}")
                ->assertNotFound();
        }
    }

    public function test_la_note_d_un_AUTRE_eleve_ne_s_ouvre_pas_par_l_identifiant_d_un_eleve_legitime(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $mine = $this->student();
        $other = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($mine)->create();
        ClassroomMembership::factory()->in($classroom)->of($other)->create();
        $othersNote = NotebookNote::create([
            'user_id' => $other->id, 'lesson_id' => $lessons[0]->id,
            'content' => '<p>a lui</p>', 'content_text' => 'a lui',
        ]);

        // L'élève est bien dans la classe, la note est bien dans le
        // périmètre — mais elle n'est pas à LUI.
        $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$mine->id}/notebook/{$othersNote->id}")
            ->assertNotFound();
    }

    // ── LA LECTURE SEULE ─────────────────────────────────────────────────

    public function test_aucune_ecriture_n_est_exposee_et_celle_de_l_eleve_reste_refusee(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();
        $note = NotebookNote::create([
            'user_id' => $student->id, 'lesson_id' => $lessons[0]->id,
            'content' => '<p>à moi</p>', 'content_text' => 'à moi',
        ]);
        $token = $this->tokenOf($classroom->teacher);

        // Il n'existe AUCUNE route d'écriture sous .../notebook.
        $this->withToken($token)
            ->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/notebook/{$note->id}", ['content' => '<p>corrigé</p>'])
            ->assertStatus(405);

        // Et la porte de l'élève ne s'ouvre pas davantage : le cahier d'un
        // autre compte y est « introuvable », enseignant ou non.
        $this->withToken($token)->patchJson("/api/v1/practice/notes/{$note->id}", ['content' => '<p>corrigé</p>'])->assertNotFound();
        $this->withToken($token)->deleteJson("/api/v1/practice/notes/{$note->id}")->assertNotFound();
        $this->withToken($token)->getJson("/api/v1/practice/notes/{$note->id}")->assertNotFound();

        $this->assertDatabaseHas('notebook_notes', ['id' => $note->id, 'content' => '<p>à moi</p>']);
    }
}
