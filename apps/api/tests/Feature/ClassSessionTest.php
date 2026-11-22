<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassSession;
use App\Models\ClassTest;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « حصّة القسم » (CLASS_SESSION.md) : le plan de la classe, le test d'une leçon (défaut du dépôt + copie de l'enseignant +
 * réinitialisation), les séances terminées. Ce que ces tests protègent :
 *  - seul l'enseignant de la classe lit et écrit ;
 *  - le test par défaut n'est jamais écrasé ;
 *  - une séance ne nomme que des élèves actifs de la classe, et rejouer son envoi ne double rien ;
 *  - RIEN ici n'est une preuve d'apprentissage.
 */
class ClassSessionTest extends TestCase
{
    use CommercialFixtures, LearningFixtures, RefreshDatabase;

    private const LESSON = 'qasim-adad-tabii';

    private Classroom $classroom;

    /** @var list<User> */
    private array $students = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->grade4am(1)['lessons'][0]->update(['code' => self::LESSON]);
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        foreach ([['Omar', 'Benali'], ['Meriem', 'Haddad'], ['Yacine', 'Mansouri']] as [$first, $last]) {
            $this->students[] = $this->student(['first_name' => $first, 'last_name' => $last]);
        }
        $this->enrol($this->classroom, $this->students);
    }

    private function as(User $user, string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($user))->json($method, "/api/v1/teacher{$uri}", $body);
    }

    /** A request of the teacher who OWNS the class. */
    private function own(string $method, string $uri, array $body = [])
    {
        return $this->as($this->classroom->teacher, $method, $uri, $body);
    }

    private function sessionBody(array $over = []): array
    {
        return array_merge([
            'uuid' => (string) Str::uuid(), 'lessonCode' => self::LESSON, 'moment' => 'start', 'startedAt' => 1_800_000_000_000, 'finishedAt' => 1_800_000_300_000,
            'absent' => [$this->students[2]->id],
            'answers' => [
                ['questionId' => 's1', 'item' => '1am.m3.r01', 'studentId' => $this->students[0]->id, 'teamId' => 'row-0', 'correct' => true, 'pickedBy' => 'order', 'ms' => 9000],
                ['questionId' => 's2', 'item' => '1am.m3.r01', 'studentId' => $this->students[1]->id, 'teamId' => 'row-0', 'correct' => false, 'pickedBy' => 'teacher', 'ms' => 14000],
            ],
            'summary' => ['right' => 99, 'total' => 99, 'percent' => 100, 'revise' => ['1am.m3.r01'], 'teams' => [['id' => 'row-0', 'name' => 'الخوارزمي', 'right' => 1, 'total' => 2]]],
        ], $over);
    }

    public function test_only_the_teacher_of_the_class_reads_and_writes(): void
    {
        $this->json('GET', '/api/v1/teacher/class-tests/'.self::LESSON)->assertUnauthorized(); // before any token is used
        $other = $this->teacher();
        $this->as($other, 'GET', "/classrooms/{$this->classroom->id}/seating")->assertForbidden();
        $this->as($other, 'PUT', "/classrooms/{$this->classroom->id}/seating", ['seats' => []])->assertForbidden();
        $this->as($other, 'POST', "/classrooms/{$this->classroom->id}/class-sessions", $this->sessionBody())->assertForbidden();
        $this->as($other, 'GET', "/classrooms/{$this->classroom->id}/class-sessions")->assertForbidden();
        $this->as($this->students[0], 'GET', '/class-tests/'.self::LESSON)->assertForbidden();
        $this->assertSame(0, ClassSession::count());
    }

    public function test_the_seating_keeps_only_active_students_of_the_class_and_any_number_of_teams(): void
    {
        $this->own('GET', "/classrooms/{$this->classroom->id}/seating")->assertOk()->assertJsonPath('seating', null);
        $stranger = $this->student();
        [$a, $b, $c] = $this->students;
        $res = $this->own('PUT', "/classrooms/{$this->classroom->id}/seating", [
            'cols' => 4,
            'seats' => [
                ['student' => $a->id, 'r' => 0, 'c' => 0, 'team' => 't1'], ['student' => $b->id, 'r' => 0, 'c' => 1, 'team' => 't2'], ['student' => $c->id, 'r' => 1, 'c' => 0, 'team' => 't5'],
                ['student' => $stranger->id, 'r' => 1, 'c' => 1], ['student' => $a->id, 'r' => 2, 'c' => 2],
            ],
            'teams' => [['id' => 't1', 'name' => 'الخوارزمي'], ['id' => 't2', 'name' => 'ابن الهيثم'], ['id' => 't3', 'name' => 'الكاشي'], ['id' => 't4', 'name' => 'البيروني'], ['id' => 't5', 'name' => 'عمر الخيّام']],
            'genders' => [$a->id => 'm', $b->id => 'f', $stranger->id => 'f', $c->id => 'x'],
        ])->assertOk();
        $this->assertCount(3, $res->json('seating.seats')); // the stranger and the second seat of the same student are dropped
        $this->assertCount(5, $res->json('seating.teams')); // five teams: as many as the teacher wants
        $this->assertSame(['m', 'f'], array_values($res->json('seating.genders')));
        $this->own('GET', "/classrooms/{$this->classroom->id}/seating")->assertJsonPath('seating.cols', 4)->assertJsonPath('seating.seats.2.team', 't5');
        $this->assertDatabaseCount('class_seatings', 1);
    }

    public function test_the_default_test_is_served_and_the_teachers_copy_never_overwrites_it(): void
    {
        $res = $this->own('GET', '/class-tests/'.self::LESSON)->assertOk()->assertJsonPath('mine', null);
        $default = $res->json('default');
        $this->assertGreaterThanOrEqual(6, count($default['start']));
        $this->assertNotEmpty($default['end']);
        $this->assertNotEmpty($default['pool']);

        $own = ['id' => 't-1', 'kind' => 'truefalse', 'text' => 'سؤال من الأستاذ: 4 قاسم للعدد 20.', 'answer' => true, 'source' => 'teacher', 'check' => ['evil' => true]];
        $saved = $this->own('PUT', '/class-tests/'.self::LESSON, ['start' => [$default['start'][0], $own], 'end' => [$default['end'][0]]])->assertOk();
        $this->assertCount(2, $saved->json('mine.start'));
        $this->assertSame('teacher', $saved->json('mine.start.1.source'));
        $this->assertArrayNotHasKey('check', $saved->json('mine.start.1')); // a copy keeps only what a question is made of
        $this->assertSame($default, $saved->json('default')); // the default is untouched
        $this->assertSame(1, ClassTest::count());

        // another teacher still gets the default, not this copy
        $this->as($this->teacher(), 'GET', '/class-tests/'.self::LESSON)->assertOk()->assertJsonPath('mine', null);

        $this->own('DELETE', '/class-tests/'.self::LESSON)->assertOk()->assertJsonPath('mine', null);
        $this->assertSame(0, ClassTest::count());
    }

    public function test_a_malformed_question_is_refused_and_an_unknown_lesson_is_404(): void
    {
        $bad = [
            ['id' => 'x', 'kind' => 'choice', 'text' => 'سؤال', 'options' => ['أ'], 'answer' => 0], // one option
            ['id' => 'x', 'kind' => 'choice', 'text' => 'سؤال', 'options' => ['أ', 'ب'], 'answer' => 5], // the answer is not an option
            ['id' => 'x', 'kind' => 'truefalse', 'text' => 'سؤال', 'answer' => 'yes'],
            ['id' => 'x', 'kind' => 'number', 'text' => '', 'answer' => 3],
            ['id' => 'x', 'kind' => 'essay', 'text' => 'سؤال', 'answer' => 3],
        ];
        foreach ($bad as $q) {
            $this->own('PUT', '/class-tests/'.self::LESSON, ['start' => [$q], 'end' => []])->assertStatus(422);
        }
        $this->own('PUT', '/class-tests/'.self::LESSON, ['start' => [], 'end' => []])->assertStatus(422)->assertJsonPath('reason', 'empty_test');
        $this->own('GET', '/class-tests/no-such-lesson')->assertNotFound();
        $this->assertSame(0, ClassTest::count());
    }

    public function test_a_finished_session_is_stored_once_with_its_answers_and_a_recomputed_result(): void
    {
        $body = $this->sessionBody();
        $res = $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $body)->assertCreated();
        $this->assertSame(['right' => 1, 'total' => 2, 'percent' => 50], array_intersect_key($res->json('session.summary'), array_flip(['right', 'total', 'percent']))); // 99 / 99 was not believed
        $this->assertSame(['1am.m3.r01'], $res->json('session.summary.revise'));
        $this->assertSame([['item' => '1am.m3.r01', 'right' => 1, 'total' => 2]], $res->json('session.summary.items')); // per الكفاءة, recomputed too
        $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $body)->assertOk(); // sent again after a lost connection
        $this->assertSame(1, ClassSession::count());
        $this->assertDatabaseCount('class_session_answers', 2);
        $this->assertDatabaseHas('class_session_answers', ['student_id' => $this->students[1]->id, 'correct' => false, 'picked_by' => 'teacher', 'position' => 2]);

        $list = $this->own('GET', "/classrooms/{$this->classroom->id}/class-sessions?lessonCode=".self::LESSON)->assertOk();
        $this->assertCount(1, $list->json('sessions'));
        $this->assertSame(1, $list->json('turns.'.$this->students[0]->id)); // who has spoken: for the fair turn
        $this->assertSame([$this->students[2]->id], ClassSession::first()->absent);
    }

    public function test_a_session_never_names_a_student_who_is_not_in_the_class(): void
    {
        $stranger = $this->student();
        $body = $this->sessionBody();
        $body['answers'][0]['studentId'] = $stranger->id;
        $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $body)->assertStatus(422)->assertJsonPath('reason', 'not_a_member');
        $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $this->sessionBody(['moment' => 'middle']))->assertStatus(422);
        $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $this->sessionBody(['lessonCode' => 'no-such-lesson']))->assertNotFound();
        $this->assertSame(0, ClassSession::count());
    }

    /** « ملفّ الدرس » : la leçon mène à UN document de la سبّورة du مختبر, celui de l'enseignant — jamais celui d'un autre. */
    public function test_the_lesson_file_is_the_teachers_own_whiteboard_document_of_the_lesson(): void
    {
        ['lessons' => $lessons] = $this->grade4am(1);
        $me = $this->teacher();
        $other = $this->teacher();
        $uri = "/api/v1/teacher/lesson-files/{$lessons[0]->code}";
        $doc = fn (User $owner, string $tool = 'whiteboard') => DB::table('math_lab_documents')->insertGetId(['user_id' => $owner->id, 'tool' => $tool, 'title' => 'ملفّ الدرس', 'schema_version' => 1, 'data' => '{}', 'created_at' => now(), 'updated_at' => now()]);

        $this->getJson($uri)->assertUnauthorized();
        $this->withToken($this->tokenOf($this->student()))->getJson($uri)->assertForbidden();
        $this->withToken($this->tokenOf($me))->getJson($uri)->assertOk()->assertJsonPath('file.documentId', null);

        $mine = $doc($me);
        $this->withToken($this->tokenOf($me))->putJson($uri, ['documentId' => $mine])->assertOk()->assertJsonPath('file.documentId', $mine);
        $this->withToken($this->tokenOf($me))->putJson($uri, ['documentId' => $doc($other)])->assertStatus(422); // another teacher's document
        $this->withToken($this->tokenOf($me))->putJson($uri, ['documentId' => $doc($me, 'function-grapher')])->assertStatus(422); // not a whiteboard
        $this->withToken($this->tokenOf($me))->getJson($uri)->assertJsonPath('file.documentId', $mine);
        $this->withToken($this->tokenOf($other))->getJson($uri)->assertJsonPath('file.documentId', null);
        $this->assertSame(1, DB::table('teacher_lesson_files')->count()); // one file per teacher and lesson
        // the lesson file is not a work of the lab: « أعمالي » lists the teacher's other documents only
        $other2 = $doc($me);
        $listed = collect($this->withToken($this->tokenOf($me))->getJson('/api/v1/math-lab/documents')->assertOk()->json('documents'))->pluck('id')->all();
        $this->assertContains($other2, $listed);
        $this->assertNotContains($mine, $listed);

        DB::table('math_lab_documents')->where('id', $mine)->delete(); // deleted in the lab: the lesson is free again
        $this->withToken($this->tokenOf($me))->getJson($uri)->assertJsonPath('file.documentId', null);
        $this->withToken($this->tokenOf($me))->getJson('/api/v1/teacher/lesson-files/no-such-lesson')->assertNotFound();
    }

    public function test_a_class_session_is_never_learning_evidence(): void
    {
        $this->own('POST', "/classrooms/{$this->classroom->id}/class-sessions", $this->sessionBody())->assertCreated();
        $this->assertSame(0, DB::table('learning_evidence')->count());
        $this->assertSame(0, DB::table('student_learning_point_progress')->count());
    }
}
