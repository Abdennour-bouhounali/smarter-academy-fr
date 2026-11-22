<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\MadarProfile;
use App\Models\MadarRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « نافس أستاذك » : l'enseignant joue dans CHACUNE de ses classes ; son
 * score compte dans le classement de cette classe (avec son nom et
 * `isTeacher`), son record se lit classe par classe, il ne dépense aucun
 * cœur, et ne joue pas dans la classe d'un autre.
 */
class MadarTeacherPlayTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private User $teacherUser;

    private Classroom $a;

    private Classroom $b;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->a = Classroom::factory()->create(['grade' => '4am', 'name' => 'A']);
        $this->teacherUser = $this->a->teacher;
        $this->teacherUser->update(['first_name' => 'Nadia', 'last_name' => 'Kaci']);
        $this->b = Classroom::factory()->create(['grade' => '4am', 'name' => 'B', 'teacher_id' => $this->teacherUser->id]);
        $this->student = $this->student(['first_name' => 'Amine', 'last_name' => 'Benali']);
        $this->enrol($this->a, [$this->student]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function teacher(string $method, Classroom $c, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($this->teacherUser))->json($method, "/api/v1/teacher/classrooms/{$c->id}/madar/play{$uri}", $body);
    }

    private function teacherRun(Classroom $c, int $score, string $game = 'orbit')
    {
        $id = $this->teacher('POST', $c, '/runs', ['game' => $game])->assertCreated()->json('run.id');
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds(300));
        $res = $this->teacher('POST', $c, "/runs/{$id}/finish", ['score' => $score, 'stars' => 0]);
        Carbon::setTestNow($now->copy()->addSeconds(301));

        return $res;
    }

    public function test_the_teacher_has_a_score_per_class_and_appears_in_its_ranking(): void
    {
        $this->teacherRun($this->a, 2154)->assertOk()->assertJsonPath('best', 2154)->assertJsonPath('rank.after', 1);
        $this->teacherRun($this->b, 2568)->assertOk()->assertJsonPath('best', 2568);

        $this->teacher('GET', $this->a, '')->assertOk()->assertJsonPath('teacher', true)->assertJsonPath('best', 2154)->assertJsonPath('weekBest', 2154);
        $this->teacher('GET', $this->b, '')->assertOk()->assertJsonPath('best', 2568);

        // Les élèves de la classe A voient leur enseignant(e) en tête, avec son nom.
        $board = $this->withToken($this->tokenOf($this->student))->json('GET', '/api/v1/madar')->assertOk()->json('competition');
        $this->assertSame('Nadia K.', $board['top'][0]['name']);
        $this->assertTrue($board['top'][0]['isTeacher']);

        // Le tableau de l'enseignant : sa place, mais pas un « joueur » de la classe.
        $res = $this->withToken($this->tokenOf($this->teacherUser))->json('GET', "/api/v1/teacher/classrooms/{$this->a->id}/madar/results")->assertOk();
        $res->assertJsonPath('teacher.rank', 1)->assertJsonPath('teacher.best', 2154)->assertJsonPath('summary.players', 0);
    }

    public function test_the_teacher_plays_free_even_a_game_closed_to_the_class(): void
    {
        $this->withToken($this->tokenOf($this->teacherUser))->json('PATCH', "/api/v1/teacher/classrooms/{$this->a->id}/madar/settings", ['disabledGames' => ['defense']])->assertOk();
        $this->teacher('POST', $this->a, '/runs', ['game' => 'defense'])->assertCreated();
        $id = $this->teacher('POST', $this->a, '/runs', ['game' => 'orbit'])->assertCreated()->json('run.id');
        $this->teacher('POST', $this->a, "/runs/{$id}/revive")->assertOk()->assertJsonPath('revives', 1);
        $this->assertSame(3, (int) MadarProfile::where('user_id', $this->teacherUser->id)->value('hearts'), 'aucun cœur dépensé');
        $games = collect($this->teacher('GET', $this->a, '')->json('games'))->keyBy('id');
        $this->assertTrue($games['orbit']['free']);
        $this->assertTrue($games['defense']['enabled']);
        $this->teacher('GET', $this->a, '')->assertJsonPath('sniper.unlockedUpTo', 50);
    }

    public function test_a_run_finishes_only_in_its_class_and_never_in_another_teachers_class(): void
    {
        $id = $this->teacher('POST', $this->a, '/runs', ['game' => 'orbit'])->json('run.id');
        $this->teacher('POST', $this->b, "/runs/{$id}/finish", ['score' => 10, 'stars' => 0])->assertStatus(404);
        $this->assertSame($this->a->id, (int) MadarRun::where('uuid', $id)->value('classroom_id'));

        $other = Classroom::factory()->create();
        $this->withToken($this->tokenOf($this->teacherUser))->json('GET', "/api/v1/teacher/classrooms/{$other->id}/madar/play")->assertForbidden();
        $this->withToken($this->tokenOf($this->student))->json('GET', "/api/v1/teacher/classrooms/{$this->a->id}/madar/play")->assertForbidden();
    }
}
