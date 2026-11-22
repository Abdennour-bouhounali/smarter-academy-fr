<?php

namespace Tests\Feature;

use App\Domain\Madar\DefenseScoring;
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
 * « دفاع الكوكب » dans la salle « مدار » : la carte de la semaine commune à
 * la classe, la vague et le score bornés par la durée, le record et les
 * tourelles, un classement PAR JEU, un jeu fermé par l'enseignant — avec les
 * mêmes cœurs que l'orbite.
 */
class MadarDefenseTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private Classroom $classroom;

    /** @var User[] */
    private array $students;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        $this->students = [$this->student(['first_name' => 'Amine', 'last_name' => 'Benali']), $this->student(['first_name' => 'Sara', 'last_name' => 'Haddad'])];
        $this->enrol($this->classroom, $this->students);
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

    private function defend(User $student, int $seconds, int $score, int $wave, int $kills = 0)
    {
        $id = $this->as($student, 'POST', '/madar/runs', ['game' => 'defense'])->assertCreated()->assertJsonPath('run.game', 'defense')->json('run.id');
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds($seconds));
        $res = $this->as($student, 'POST', "/madar/runs/{$id}/finish", ['score' => $score, 'stars' => $kills, 'wave' => $wave]);
        Carbon::setTestNow($now->copy()->addSeconds($seconds + 1));

        return $res;
    }

    public function test_the_week_map_is_the_same_for_the_whole_class(): void
    {
        $a = $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->json('run.seed');
        $b = $this->as($this->students[1], 'POST', '/madar/runs', ['game' => 'defense'])->json('run.seed');
        $again = $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->json('run.seed');
        $this->assertSame($a, $b, 'même carte pour toute la classe');
        $this->assertSame($a, $again);

        Carbon::setTestNow(now()->addWeek());
        $this->assertNotSame($a, $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->json('run.seed'), 'une nouvelle carte chaque semaine');
    }

    public function test_the_first_ship_and_the_laser_are_always_open(): void
    {
        $state = $this->as($this->students[0], 'GET', '/madar')->assertOk();
        $this->assertTrue(collect($state->json('ships'))->firstWhere('id', 'sahm')['unlocked']);
        $this->assertTrue(collect($state->json('defense.turrets'))->firstWhere('id', 'laser')['unlocked']);
        $this->assertFalse(collect($state->json('defense.turrets'))->firstWhere('id', 'rail')['unlocked']);
    }

    public function test_a_defense_run_costs_a_heart_like_any_run(): void
    {
        $this->as($this->students[0], 'GET', '/madar')->assertJsonPath('hearts', 3);
        $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->assertCreated()->assertJsonPath('hearts', 2);
        $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'chess'])->assertStatus(404);
    }

    public function test_a_plausible_result_sets_the_defense_record_and_unlocks_turrets(): void
    {
        $scoring = new DefenseScoring(config('madar.defense'));
        $seconds = (int) ceil($scoring->waveStart(5));
        $res = $this->defend($this->students[0], $seconds, 900, 4, 40)->assertOk()
            ->assertJsonPath('run.game', 'defense')
            ->assertJsonPath('run.wave', 4)
            ->assertJsonPath('run.flagged', false)
            ->assertJsonPath('best', 900)
            ->assertJsonPath('bestWave', 4)
            ->assertJsonPath('newBest', true);
        $this->assertContains('frost', $res->json('unlockedTurrets'), 'tenir 4 vagues ouvre la tourelle de givre');

        $state = $this->as($this->students[0], 'GET', '/madar')->assertOk()
            ->assertJsonPath('defense.best', 900)->assertJsonPath('defense.bestWave', 4)->assertJsonPath('best', 0);
        $frost = collect($state->json('defense.turrets'))->firstWhere('id', 'frost');
        $this->assertTrue($frost['unlocked']);
    }

    public function test_an_impossible_wave_or_score_is_clamped_and_flagged(): void
    {
        $scoring = new DefenseScoring(config('madar.defense'));
        $this->defend($this->students[0], 30, 200, 50)->assertOk()
            ->assertJsonPath('run.wave', $scoring->maxWave(30_000))->assertJsonPath('run.flagged', true);
        $this->defend($this->students[0], 30, 999_999, 1)->assertOk()
            ->assertJsonPath('run.score', $scoring->maxPlausible(30_000))->assertJsonPath('run.flagged', true);
    }

    public function test_each_game_has_its_own_week_leaderboard(): void
    {
        $this->defend($this->students[1], 60, 700, 3);
        $state = $this->as($this->students[0], 'GET', '/madar')->assertOk();
        $this->assertSame(0, $state->json('competition.participants'), 'l\'orbite ne voit pas la défense');
        $this->assertSame(1, $state->json('defense.competition.participants'));
        $this->assertSame('Sara H.', $state->json('defense.competition.top.0.name'));
        $this->assertSame(3, $state->json('defense.competition.top.0.wave'));

        $teacher = $this->tokenOf($this->classroom->teacher);
        $this->withToken($teacher)->json('GET', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/results?game=defense")->assertOk()
            ->assertJsonPath('game', 'defense')->assertJsonPath('summary.players', 1)->assertJsonPath('students.0.weekWave', 3);
        $this->withToken($teacher)->json('GET', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/display?game=defense")->assertOk()
            ->assertJsonPath('game', 'defense')->assertJsonPath('top.0.best', 700);
    }

    public function test_the_teacher_can_close_one_game_only(): void
    {
        $teacher = $this->tokenOf($this->classroom->teacher);
        $this->withToken($teacher)->json('PATCH', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/settings", ['disabledGames' => ['defense']])
            ->assertOk()->assertJsonPath('settings.disabledGames', ['defense']);
        $this->withToken($teacher)->json('PATCH', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/settings", ['disabledGames' => ['poker']])
            ->assertStatus(422)->assertJsonPath('reason', 'unknown_game');

        $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->assertStatus(422)->assertJsonPath('reason', 'game_disabled');
        $this->as($this->students[0], 'POST', '/madar/runs')->assertCreated();
        $games = collect($this->as($this->students[0], 'GET', '/madar')->json('games'))->keyBy('id');
        $this->assertFalse($games['defense']['enabled']);
        $this->assertTrue($games['orbit']['enabled']);
    }

    public function test_the_emergency_shield_is_a_revive(): void
    {
        MadarProfile::query()->delete();
        $id = $this->as($this->students[0], 'POST', '/madar/runs', ['game' => 'defense'])->json('run.id');
        $this->as($this->students[0], 'POST', "/madar/runs/{$id}/revive")->assertOk()->assertJsonPath('revives', 1)->assertJsonPath('hearts', 1);
        $this->assertSame(MadarRun::GAME_DEFENSE, MadarRun::where('uuid', $id)->value('game'));
    }
}
