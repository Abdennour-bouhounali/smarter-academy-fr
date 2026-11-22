<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\Lesson;
use App\Models\NotebookNote;
use App\Models\StudentLessonProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * L'ENSEIGNANT APPREND COMME UN ÉLÈVE — même contenu, sans la progression.
 *
 * Il lit tout le contenu PUBLIÉ (gratuit et payant : le rôle ouvre), même
 * une leçon qu'il a masquée pour sa propre classe (la visibilité règle ce
 * que SES élèves voient) ; il ne lit pas le non-publié ; et RIEN de ce qu'il
 * fait n'écrit une progression, une preuve ou un test final — ni chez lui,
 * ni chez personne. Son cahier et son مختبر sont à lui seul.
 */
class TeacherLearningAccessTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function publishedPremiumLesson(): Lesson
    {
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons->first();
        $lesson->update(['tier' => 'premium', 'publication_status' => Lesson::PUB_PUBLISHED]);

        return $lesson->fresh();
    }

    public function test_l_enseignant_lit_le_contenu_publie_meme_payant_et_meme_sans_classe(): void
    {
        $this->freeSeatsPlan();
        $lesson = $this->publishedPremiumLesson();
        $teacher = $this->teacher();
        $this->assertSame(0, Classroom::ownedBy($teacher)->count());

        $token = $this->tokenOf($teacher);
        $this->withToken($token)->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.locked', [])->assertJsonPath('closed.hiddenByClass', [])->assertJsonPath('closed.lessons', []);
        $this->withToken($token)->getJson("/api/v1/lessons/{$lesson->code}/structure")->assertOk();
        $this->withToken($token)->getJson("/api/v1/lessons/{$lesson->code}/exercises")->assertOk();
        $this->withToken($token)->getJson('/api/v1/me/access')->assertOk()->assertJsonPath('access.premiumAccess', true);
    }

    public function test_masquer_une_lecon_pour_sa_classe_ne_la_ferme_pas_a_l_enseignant(): void
    {
        $this->freeSeatsPlan();
        $lesson = $this->publishedPremiumLesson();
        $teacher = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($teacher)->create(['grade' => '4am']);
        $hidden = new ClassroomLesson(['status' => ClassroomLesson::STATUS_HIDDEN, 'created_by' => $teacher->id]);
        $hidden->classroom_id = $classroom->id;
        $hidden->lesson_id = $lesson->id;
        $hidden->save();

        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.hiddenByClass', [])->assertJsonPath('closed.lessons', []);
        $this->withToken($this->tokenOf($teacher))->getJson("/api/v1/lessons/{$lesson->code}/structure")->assertOk();

        // Pour SON élève, la leçon est bien masquée.
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.hiddenByClass.0', $lesson->code);
    }

    public function test_le_non_publie_reste_ferme_a_l_enseignant(): void
    {
        $this->freeSeatsPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons->first();
        $lesson->update(['publication_status' => Lesson::PUB_DRAFT]);

        $this->withToken($this->tokenOf($this->teacher()))->getJson('/api/v1/content/availability')->assertOk()
            ->assertJsonPath('closed.lessons.0', $lesson->code);
    }

    public function test_l_enseignant_n_ecrit_aucune_progression_preuve_ni_test_final(): void
    {
        $this->freeSeatsPlan();
        $lesson = $this->publishedPremiumLesson();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->putJson("/api/v1/lessons/{$lesson->code}/progress", [
            'completedModules' => ['1'], 'currentModule' => 1, 'status' => 'in_progress', 'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(403)->assertJsonPath('reason', 'not_a_learner');
        $this->withToken($token)->postJson("/api/v1/lessons/{$lesson->code}/evidence", [
            'questionCode' => 'q1', 'attemptId' => 'a1', 'isCorrect' => true, 'learningPointCodes' => ['lp-1'],
        ])->assertStatus(403)->assertJsonPath('reason', 'not_a_learner');
        $this->withToken($token)->putJson("/api/v1/lessons/{$lesson->code}/final-test-attempt", [
            'score' => 3, 'totalQuestions' => 5, 'answers' => [], 'submittedAt' => now()->toIso8601String(),
        ])->assertStatus(403);
        $this->withToken($token)->deleteJson("/api/v1/lessons/{$lesson->code}/final-test-attempt")->assertStatus(403);

        $this->assertDatabaseCount('student_lesson_progress', 0);
        $this->assertDatabaseCount('learning_evidence', 0);
        $this->assertSame(0, StudentLessonProgress::count());

        // Lire reste possible : la progression (vide) et la tentative (nulle).
        $this->withToken($token)->getJson('/api/v1/students/me/lesson-progress')->assertOk()->assertJsonPath('progress', []);
        $this->withToken($token)->getJson("/api/v1/lessons/{$lesson->code}/final-test-attempt")->assertOk();

        // L'élève, lui, écrit toujours.
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->putJson("/api/v1/lessons/{$lesson->code}/progress", [
            'completedModules' => [], 'currentModule' => 1, 'status' => 'in_progress', 'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(422); // payant sans droit : refusé par ContentAccess, pas par le rôle
        $lesson->update(['tier' => 'free']);
        $this->withToken($this->tokenOf($student))->putJson("/api/v1/lessons/{$lesson->code}/progress", [
            'completedModules' => [], 'currentModule' => 1, 'status' => 'in_progress', 'lastActivityAt' => now()->toIso8601String(),
        ])->assertOk();
        $this->assertDatabaseHas('student_lesson_progress', ['user_id' => $student->id]);
    }

    public function test_le_cahier_de_l_enseignant_est_a_lui_seul(): void
    {
        $this->freeSeatsPlan();
        $teacher = $this->teacher();
        $other = $this->teacher();
        $student = $this->student();
        $token = $this->tokenOf($teacher);

        $created = $this->withToken($token)->postJson('/api/v1/practice/notes', ['content' => 'طريقة حساب PGCD'])
            ->assertCreated()->json('note');
        $this->withToken($token)->getJson("/api/v1/practice/notes/{$created['id']}")->assertOk()->assertJsonPath('note.content', 'طريقة حساب PGCD');
        $this->withToken($token)->patchJson("/api/v1/practice/notes/{$created['id']}", ['content' => 'طريقة حساب PGCD — مراجعة'])->assertOk();
        $this->withToken($token)->getJson('/api/v1/practice/notes')->assertOk()->assertJsonCount(1, 'notes');

        // Ni un autre enseignant, ni un élève ne la voient.
        $this->withToken($this->tokenOf($other))->getJson("/api/v1/practice/notes/{$created['id']}")->assertStatus(404);
        $this->withToken($this->tokenOf($other))->getJson('/api/v1/practice/notes')->assertOk()->assertJsonCount(0, 'notes');
        $this->withToken($this->tokenOf($student))->getJson("/api/v1/practice/notes/{$created['id']}")->assertStatus(404);

        // Et l'enseignant ne voit pas la note d'un élève PAR CETTE PORTE.
        // Depuis le 2026-09-24 il peut lire le cahier d'un élève de SA classe,
        // mais par une route dédiée, en lecture seule et bornée aux leçons du
        // قسم (TeacherClassroomNotebookTest) : /practice/notes reste le cahier
        // du compte authentifié, et rien d'autre.
        $studentNote = NotebookNote::create(['user_id' => $student->id, 'content' => 'ملاحظة تلميذ', 'content_text' => 'ملاحظة تلميذ', 'note_type' => 'note']);
        $this->withToken($token)->getJson("/api/v1/practice/notes/{$studentNote->id}")->assertStatus(404);
        $this->withToken($token)->patchJson("/api/v1/practice/notes/{$studentNote->id}", ['content' => 'x'])->assertStatus(404);
    }

    public function test_le_mokhtabar_de_l_enseignant_est_a_lui_seul(): void
    {
        $this->freeSeatsPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $doc = $this->withToken($token)->postJson('/api/v1/math-lab/documents', ['tool' => 'whiteboard', 'title' => 'تحضير', 'schemaVersion' => 1, 'data' => ['elements' => []]])
            ->assertCreated()->json('document');
        $this->withToken($token)->getJson('/api/v1/math-lab/documents')->assertOk()->assertJsonCount(1, 'documents');
        $this->withToken($token)->getJson("/api/v1/math-lab/documents/{$doc['id']}")->assertOk();

        $this->withToken($this->tokenOf($this->student()))->getJson("/api/v1/math-lab/documents/{$doc['id']}")->assertStatus(404);
        $this->withToken($this->tokenOf($this->teacher()))->getJson("/api/v1/math-lab/documents/{$doc['id']}")->assertStatus(404);
        $this->assertDatabaseHas('math_lab_documents', ['id' => $doc['id'], 'user_id' => $teacher->id]);
    }
}
