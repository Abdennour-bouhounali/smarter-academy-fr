<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « متابعة القسم » d'une leçon (CLASS_SESSION.md §2bis) : pour UNE classe et UNE leçon, chaque élève actif avec son état
 * sur chaque كفاءة et ce qu'il a fait de chaque exercice. Lecture seule, réservée à l'enseignant de la classe.
 */
class LessonTrackingTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    /** Une réponse soumise de cet élève à une question d'un exercice de la leçon. */
    private function practised(User $student, Lesson $lesson, string $exercise, string $question, string $outcome, int $attempt = 1): void
    {
        $session = DB::table('practice_sessions')->insertGetId([
            'session_id' => (string) Str::uuid(), 'user_id' => $student->id, 'lesson_id' => $lesson->id, 'level' => 1,
            'status' => 'open', 'started_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        $ex = DB::table('exercise_attempts')->insertGetId([
            'practice_session_id' => $session, 'exercise_id' => $exercise, 'level' => 1, 'status' => 'in_progress',
            'started_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('question_attempts')->insert([
            'exercise_attempt_id' => $ex, 'user_id' => $student->id, 'question_id' => $question,
            'attempt_uuid' => (string) Str::uuid(), 'submitted_answer' => json_encode(['value' => '1']), 'normalized_answer' => '1',
            'outcome' => $outcome, 'hints_used' => 0, 'attempt_number' => $attempt,
            'started_at' => now(), 'submitted_at' => now()->addSeconds($attempt), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function test_each_student_with_his_state_on_every_point_and_what_he_did_on_each_exercise(): void
    {
        config(['mastery.engine_version' => 2]);
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $p1 = $this->point($lesson, 1);
        $this->point($lesson, 2);
        $classroom = Classroom::factory()->create();
        $token = $this->tokenOf($classroom->teacher);
        $amine = $this->student(['first_name' => 'Amine']);
        $badr = $this->student(['first_name' => 'Badr']);
        $silent = $this->student(['first_name' => 'Chahd']);
        $this->enrol($classroom, [$amine, $badr, $silent]);
        $outsider = $this->student(['first_name' => 'Dounia']); // not in the class: never listed

        $this->answers($amine, $lesson, $p1, 'correct', 3, 5);
        // Amine: ex-1, q1 right at once, q2 right at the second try. Badr: ex-1 q1 missed. The outsider worked too.
        $this->practised($amine, $lesson, 'ex-1', 'q1', 'correct');
        $this->practised($amine, $lesson, 'ex-1', 'q2', 'incorrect', 1);
        $this->practised($amine, $lesson, 'ex-1', 'q2', 'correct', 2);
        $this->practised($amine, $lesson, 'ex-2', 'q1', 'incorrect');
        $this->practised($badr, $lesson, 'ex-1', 'q1', 'incorrect');
        $this->practised($outsider, $lesson, 'ex-1', 'q1', 'correct');
        $before = [DB::table('question_attempts')->count(), DB::table('learning_evidence')->count()];

        $res = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/lesson-tracking/{$lesson->code}")->assertOk();

        $this->assertSame($lesson->code, $res->json('lesson.code'));
        $this->assertCount(2, $res->json('learningPoints'));
        $this->assertSame($p1->code, $res->json('learningPoints.0.code'));
        $students = collect($res->json('students'))->keyBy('id');
        $this->assertSame([$amine->id, $badr->id, $silent->id], $students->keys()->sort()->values()->all());
        $this->assertArrayNotHasKey($outsider->id, $students->all());
        $this->assertSame('Amine', $students[$amine->id]['firstName']);
        $this->assertArrayNotHasKey('email', $students[$amine->id]);

        $this->assertArrayHasKey($p1->code, $students[$amine->id]['points']);
        $this->assertSame([], $students[$silent->id]['points']);
        $ex = collect($students[$amine->id]['exercises'])->keyBy('exerciseId');
        $this->assertSame(['exerciseId' => 'ex-1', 'answered' => 2, 'correct' => 2, 'firstTry' => 1], array_intersect_key($ex['ex-1'], array_flip(['exerciseId', 'answered', 'correct', 'firstTry'])));
        $this->assertSame(['answered' => 1, 'correct' => 0, 'firstTry' => 0], array_intersect_key($ex['ex-2'], array_flip(['answered', 'correct', 'firstTry'])));
        $this->assertSame(0, $students[$badr->id]['exercises'][0]['correct']);
        $this->assertSame([], $students[$silent->id]['exercises']);
        $this->assertNull($students[$silent->id]['lastActivityAt']);
        $this->assertNotNull($students[$amine->id]['lastActivityAt']);
        // read-only: nothing was written
        $this->assertSame($before, [DB::table('question_attempts')->count(), DB::table('learning_evidence')->count()]);
    }

    public function test_only_the_teacher_of_the_class_reads_it_and_only_for_a_lesson_of_the_class(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $uri = "/api/v1/teacher/classrooms/{$classroom->id}/lesson-tracking/{$lessons[0]->code}";

        $this->getJson($uri)->assertUnauthorized();
        $this->withToken($this->tokenOf($this->teacher()))->getJson($uri)->assertForbidden(); // another teacher: not his class
        $this->withToken($this->tokenOf($this->student()))->getJson($uri)->assertForbidden();
        $this->withToken($this->tokenOf($classroom->teacher))->getJson("/api/v1/teacher/classrooms/{$classroom->id}/lesson-tracking/no-such-lesson")->assertStatus(422);
    }
}
