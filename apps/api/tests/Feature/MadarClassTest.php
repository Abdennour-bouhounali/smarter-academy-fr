<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\MadarClassSetting;
use App\Models\MadarProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « مدار » dans un قسم : le classement de la semaine (membres actifs, prénom +
 * initiale), les réglages de l'enseignant (fermer le jeu, cœurs quotidiens,
 * limite, leçons), la semaine de la classe et l'écran du tableau.
 */
class MadarClassTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private Classroom $classroom;

    private string $teacherToken;

    /** @var array<string, User> */
    private array $students = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        $this->teacherToken = $this->tokenOf($this->classroom->teacher);
        foreach (['a' => ['Amine', 'Benali'], 'b' => ['Sara', 'Haddad'], 'c' => ['Yacine', 'Mansouri']] as $k => [$first, $last]) {
            $this->students[$k] = $this->student(['first_name' => $first, 'last_name' => $last]);
        }
        $this->enrol($this->classroom, array_values($this->students));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(User $user, string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($user))->json($method, "/api/v1{$uri}", $body);
    }

    private function teacher(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->teacherToken)->json($method, "/api/v1/teacher/classrooms/{$this->classroom->id}{$uri}", $body);
    }

    private function playFor(User $student, int $seconds, int $score)
    {
        $id = $this->as($student, 'POST', '/madar/runs')->assertCreated()->json('run.id');
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds($seconds));
        $res = $this->as($student, 'POST', "/madar/runs/{$id}/finish", ['score' => $score, 'stars' => 0]);
        Carbon::setTestNow($now->copy()->addSeconds($seconds + 1));

        return $res;
    }

    public function test_the_week_leaderboard_shows_first_names_and_initials_only(): void
    {
        $this->playFor($this->students['a'], 60, 700);
        $this->playFor($this->students['b'], 60, 900);
        $this->playFor($this->students['a'], 60, 500);

        $view = $this->as($this->students['a'], 'GET', '/madar')->assertOk()
            ->assertJsonPath('scope.type', 'classroom')
            ->assertJsonPath('competition.participants', 2)
            ->assertJsonPath('competition.me.rank', 2)
            ->assertJsonPath('competition.me.best', 700)
            ->assertJsonPath('competition.top.0.name', 'Sara H.')
            ->assertJsonPath('competition.top.0.best', 900)
            ->assertJsonPath('competition.top.1.isMe', true);
        $this->assertStringNotContainsString('Haddad', json_encode($view->json()));
        $this->assertStringNotContainsString('@', json_encode($view->json('competition')));
    }

    public function test_finishing_reports_a_real_rank_movement(): void
    {
        $this->playFor($this->students['b'], 60, 900);
        $this->playFor($this->students['a'], 60, 300)->assertJsonPath('rank.before', null)->assertJsonPath('rank.after', 2);
        $this->playFor($this->students['a'], 80, 1200)->assertJsonPath('rank.before', 2)->assertJsonPath('rank.after', 1);
    }

    public function test_a_new_week_starts_from_zero(): void
    {
        $this->playFor($this->students['a'], 60, 900);
        Carbon::setTestNow(now()->addWeek());
        $this->as($this->students['a'], 'GET', '/madar')->assertJsonPath('competition.participants', 0)
            ->assertJsonPath('weekBest', 0)->assertJsonPath('best', 900);
    }

    public function test_a_student_who_left_disappears_from_the_ranking(): void
    {
        $this->playFor($this->students['b'], 60, 900);
        ClassroomMembership::where('classroom_id', $this->classroom->id)->where('student_id', $this->students['b']->id)->update(['status' => 'left', 'left_at' => now()]);
        $this->teacher('GET', '/madar/results')->assertOk()->assertJsonPath('summary.players', 0);
    }

    public function test_the_teacher_can_close_the_game_for_the_class(): void
    {
        $this->teacher('PATCH', '/madar/settings', ['enabled' => false])->assertOk()->assertJsonPath('settings.enabled', false);
        $this->as($this->students['a'], 'GET', '/madar')->assertJsonPath('available', false)->assertJsonPath('reason', 'disabled_by_teacher');
        $this->as($this->students['a'], 'POST', '/madar/runs')->assertStatus(422)->assertJsonPath('reason', 'disabled_by_teacher');
        $this->as($this->students['a'], 'POST', '/madar/refuel')->assertStatus(422)->assertJsonPath('reason', 'disabled_by_teacher');
    }

    public function test_competition_off_hides_the_ranking_from_students(): void
    {
        $this->teacher('PATCH', '/madar/settings', ['competitionEnabled' => false])->assertOk();
        $this->playFor($this->students['a'], 60, 500)->assertJsonPath('rank', null);
        $this->as($this->students['a'], 'GET', '/madar')->assertJsonPath('competition', null);
    }

    public function test_the_teacher_sets_the_daily_hearts_and_the_run_cap(): void
    {
        $this->teacher('PATCH', '/madar/settings', ['dailyFreeHearts' => 1, 'dailyRunCap' => 5])->assertOk()
            ->assertJsonPath('settings.dailyFreeHearts', 1)->assertJsonPath('settings.dailyRunCap', 5);
        $this->as($this->students['c'], 'GET', '/madar')->assertJsonPath('hearts', 1)->assertJsonPath('dailyRunCap', 5);

        $this->teacher('PATCH', '/madar/settings', ['dailyFreeHearts' => 9])->assertStatus(422)->assertJsonPath('reason', 'daily_free_hearts');
        $this->teacher('PATCH', '/madar/settings', ['dailyRunCap' => 1])->assertStatus(422);
    }

    public function test_refuel_lessons_are_scoped_by_the_teacher(): void
    {
        $this->teacher('PATCH', '/madar/settings', ['lessonCodes' => ['bahth-pgcd']])->assertOk()->assertJsonPath('settings.lessonCodes', ['bahth-pgcd']);
        $this->teacher('PATCH', '/madar/settings', ['lessonCodes' => ['not-a-lesson']])->assertStatus(422)->assertJsonPath('reason', 'lesson_out_of_scope');

        $student = $this->students['a'];
        $this->as($student, 'GET', '/madar')->assertOk();
        MadarProfile::where('user_id', $student->id)->update(['hearts' => 0]);
        $this->as($student, 'POST', '/madar/refuel')->assertOk()->assertJsonPath('refuel.lesson.code', 'bahth-pgcd');
    }

    public function test_the_teacher_sees_the_week_of_each_student(): void
    {
        $this->playFor($this->students['a'], 60, 700);
        $this->as($this->students['b'], 'GET', '/madar');
        MadarProfile::where('user_id', $this->students['b']->id)->update(['hearts' => 0]);
        $q = $this->as($this->students['b'], 'POST', '/madar/refuel')->json('refuel.id');
        $row = \App\Models\MadarRefuel::where('uuid', $q)->with('lesson')->first();
        $this->as($this->students['b'], 'POST', "/madar/refuel/{$q}/answer", ['answer' => $this->rightAnswer($row->lesson->code, $row->exercise_code, $row->question_id)])->assertOk();

        $res = $this->teacher('GET', '/madar/results')->assertOk()
            ->assertJsonPath('members', 3)
            ->assertJsonPath('summary.players', 1)
            ->assertJsonPath('summary.refuelAnswered', 1)
            ->assertJsonPath('summary.refuelCorrect', 1)
            ->assertJsonPath('students.0.student.firstName', 'Amine')
            ->assertJsonPath('students.0.rank', 1)
            ->assertJsonPath('students.0.weekBest', 700);
        $sara = collect($res->json('students'))->firstWhere('student.firstName', 'Sara');
        $this->assertSame(1, $sara['refuelCorrect']);
        $this->assertStringNotContainsString('email', json_encode($res->json()));
    }

    public function test_the_display_shows_no_last_names(): void
    {
        $this->playFor($this->students['a'], 60, 700);
        $res = $this->teacher('GET', '/madar/display')->assertOk()->assertJsonPath('top.0.name', 'Amine B.')->assertJsonPath('members', 3);
        $this->assertStringNotContainsString('Benali', json_encode($res->json()));
    }

    public function test_only_the_owner_reads_or_writes(): void
    {
        $other = Classroom::factory()->create();
        $this->withToken($this->tokenOf($other->teacher))->json('GET', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/results")->assertForbidden();
        $this->withToken($this->tokenOf($other->teacher))->json('PATCH', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/settings", ['enabled' => false])->assertForbidden();
        $this->assertSame(0, MadarClassSetting::count());
        $this->as($this->students['a'], 'GET', "/teacher/classrooms/{$this->classroom->id}/madar/results")->assertForbidden();
    }
}
