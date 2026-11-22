<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * « إجابات تلاميذي » : sous chaque exercice, l'enseignant voit lesquels de
 * SES élèves l'ont fait, puis les réponses de l'un d'eux. Périmètre : les
 * membres ACTIFS de ses classes non archivées ; jamais l'email ; lecture
 * seule.
 */
class TeacherPracticeResponsesTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private Lesson $lesson;

    private Classroom $classroom;

    protected function setUp(): void
    {
        parent::setUp();
        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'ميدان', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'qasim-adad-tabii', 'title' => 'قاسم', 'status' => 'available', 'order' => 0,
        ]);
        $this->teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $this->classroom = Classroom::factory()->ownedBy($this->teacher)->create(['name' => '4م 2']);
    }

    private function member(?Classroom $classroom = null, string $status = ClassroomMembership::STATUS_ACTIVE): User
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4am', 'first_name' => 'أمين', 'last_name' => 'سعدي']);
        ClassroomMembership::factory()->in($classroom ?? $this->classroom)->of($student)->create(['status' => $status]);

        return $student;
    }

    /** Une tentative soumise de cet élève, sur cet exercice. */
    private function answer(User $student, string $exercise, string $question, array $answer, string $outcome, int $attempt = 1, ?string $lessonCode = null): void
    {
        $lessonId = $lessonCode ? Lesson::where('code', $lessonCode)->value('id') : $this->lesson->id;
        $session = DB::table('practice_sessions')->insertGetId([
            'session_id' => (string) Str::uuid(), 'user_id' => $student->id, 'lesson_id' => $lessonId, 'level' => 1,
            'status' => 'open', 'started_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        $ex = DB::table('exercise_attempts')->insertGetId([
            'practice_session_id' => $session, 'exercise_id' => $exercise, 'level' => 1, 'status' => 'in_progress',
            'started_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('question_attempts')->insert([
            'exercise_attempt_id' => $ex, 'user_id' => $student->id, 'question_id' => $question,
            'attempt_uuid' => (string) Str::uuid(), 'submitted_answer' => json_encode($answer), 'normalized_answer' => $answer['value'] ?? ($answer['choiceId'] ?? null),
            'outcome' => $outcome, 'hints_used' => 1, 'attempt_number' => $attempt,
            'started_at' => now(), 'submitted_at' => now()->addSeconds($attempt), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function teacherGet(string $uri, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->teacher, 'sanctum')->getJson($uri);
    }

    public function test_liste_les_eleves_de_ses_classes_avec_leur_resume(): void
    {
        $a = $this->member();
        $b = $this->member();
        $this->member(); // n'a rien fait : absent de la liste
        $this->answer($a, 'ex-1', 'q1', ['value' => '14'], 'correct');
        $this->answer($a, 'ex-1', 'q2', ['choiceId' => 'B'], 'incorrect');
        $this->answer($b, 'ex-1', 'q1', ['value' => '15'], 'incorrect', 1);
        $this->answer($b, 'ex-1', 'q1', ['value' => '14'], 'correct', 2);
        $this->answer($a, 'ex-2', 'q1', ['value' => '1'], 'correct'); // autre exercice

        $response = $this->teacherGet('/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students')
            ->assertOk()->assertJsonPath('total', 2);

        $rows = collect($response->json('students'))->keyBy('id');
        $this->assertSame(2, $rows[$a->id]['questionsAnswered']);
        $this->assertSame(1, $rows[$a->id]['questionsCorrect']);
        // La DERNIÈRE tentative fait foi : b a fini par réussir q1.
        $this->assertSame(1, $rows[$b->id]['questionsAnswered']);
        $this->assertSame(1, $rows[$b->id]['questionsCorrect']);
        $this->assertSame('4م 2', $rows[$a->id]['classrooms'][0]['name']);
        $this->assertSame('أمين', $rows[$a->id]['firstName']);
        $this->assertArrayNotHasKey('email', $rows[$a->id], 'jamais l’email d’un élève');
    }

    public function test_les_reponses_d_un_eleve_question_par_question(): void
    {
        $a = $this->member();
        $this->answer($a, 'ex-1', 'q1', ['value' => '15'], 'incorrect', 1);
        $this->answer($a, 'ex-1', 'q1', ['value' => '14'], 'correct', 2);
        $this->answer($a, 'ex-1', 'q2', ['choiceId' => 'B'], 'partially_correct');

        $response = $this->teacherGet("/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students/{$a->id}")
            ->assertOk()
            ->assertJsonPath('student.id', $a->id)
            ->assertJsonMissingPath('student.email');

        $questions = collect($response->json('questions'))->keyBy('questionId');
        $this->assertCount(2, $questions['q1']['attempts']);
        $this->assertSame(['value' => '15'], $questions['q1']['attempts'][0]['answer']);
        $this->assertSame('incorrect', $questions['q1']['attempts'][0]['outcome']);
        $this->assertSame('correct', $questions['q1']['attempts'][1]['outcome']);
        $this->assertSame(['choiceId' => 'B'], $questions['q2']['attempts'][0]['answer']);
        $this->assertSame(1, $questions['q2']['attempts'][0]['hintsUsed']);
    }

    public function test_hors_perimetre_rien_ne_sort(): void
    {
        // Un élève d'une AUTRE enseignante, un élève qui a quitté, un élève
        // d'une classe archivée : jamais listés, jamais ouvrables.
        $other = Classroom::factory()->create();
        $foreign = $this->member($other);
        $left = $this->member(null, ClassroomMembership::STATUS_LEFT);
        $archived = Classroom::factory()->ownedBy($this->teacher)->archived()->create();
        $old = $this->member($archived);
        foreach ([$foreign, $left, $old] as $s) {
            $this->answer($s, 'ex-1', 'q1', ['value' => '14'], 'correct');
        }

        $this->teacherGet('/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students')
            ->assertOk()->assertJsonPath('total', 0)->assertJsonPath('students', []);
        foreach ([$foreign, $left, $old] as $s) {
            $this->teacherGet("/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students/{$s->id}")->assertNotFound();
        }
    }

    public function test_un_exercice_homonyme_d_une_autre_lecon_ne_compte_pas(): void
    {
        Lesson::create(['chapter_id' => $this->lesson->chapter_id, 'code' => 'autre', 'title' => 'x', 'status' => 'available', 'order' => 1]);
        $a = $this->member();
        $this->answer($a, 'ex-1', 'q1', ['value' => '1'], 'correct', 1, 'autre');

        $this->teacherGet('/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_reserve_aux_enseignants(): void
    {
        foreach ([User::factory()->create(['role' => User::ROLE_STUDENT]), User::factory()->create(['role' => User::ROLE_ADMIN])] as $user) {
            $this->teacherGet('/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students', $user)->assertStatus(403);
        }
    }

    public function test_lire_n_ecrit_rien(): void
    {
        $a = $this->member();
        $this->answer($a, 'ex-1', 'q1', ['value' => '14'], 'correct');
        $before = [DB::table('practice_sessions')->count(), DB::table('question_attempts')->count()];

        $this->teacherGet('/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students')->assertOk();
        $this->teacherGet("/api/v1/teacher/practice/qasim-adad-tabii/exercises/ex-1/students/{$a->id}")->assertOk();

        $this->assertSame($before, [DB::table('practice_sessions')->count(), DB::table('question_attempts')->count()]);
    }
}
