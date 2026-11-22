<?php

namespace Tests\Feature;

use App\Domain\Madar\OddScoring;
use App\Domain\Madar\SniperScoring;
use App\Models\Classroom;
use App\Models\MadarProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « الدخيل », le deuxième jeu de mathématiques : gratuit, sans reprise, dans la
 * famille « رياضيات » ; les mêmes 50 niveaux que « قنّاص القيم » mais une
 * position PROPRE à ce jeu ; le score et la position bornés par la durée
 * (une énigme ≥ min_puzzle_ms, une position de plus au plus par manche).
 */
class MadarOddTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private Classroom $classroom;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        $this->student = $this->student(['first_name' => 'Amine', 'grade' => '3am']);
        $this->enrol($this->classroom, [$this->student]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($this->student))->json($method, "/api/v1{$uri}", $body);
    }

    private function play(int $seconds, array $finish, array $start = [])
    {
        $id = $this->as('POST', '/madar/runs', ['game' => 'odd'] + $start)->assertCreated()->assertJsonPath('run.game', 'odd')->json('run.id');
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds($seconds));
        $res = $this->as('POST', "/madar/runs/{$id}/finish", $finish);
        Carbon::setTestNow($now->copy()->addSeconds($seconds + 1));

        return $res;
    }

    public function test_it_is_a_free_math_game_with_its_own_level(): void
    {
        $games = collect($this->as('GET', '/madar')->assertOk()->json('games'))->keyBy('id');
        $this->assertSame('math', $games['odd']['category']);
        $this->assertTrue($games['odd']['free']);
        $this->as('GET', '/madar')->assertJsonPath('odd.level', 12)->assertJsonPath('odd.entryLevel', 12);

        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 0]);
        $id = $this->as('POST', '/madar/runs', ['game' => 'odd'])->assertCreated()->assertJsonPath('hearts', 0)->json('run.id');
        $this->as('POST', "/madar/runs/{$id}/revive")->assertStatus(422)->assertJsonPath('reason', 'revive_limit');
    }

    public function test_the_position_is_saved_per_game_and_bounded(): void
    {
        $levels = new SniperScoring(config('madar.sniper'));
        $odd = new OddScoring(config('madar.odd'), $levels);
        $start = $levels->positionOf(12);

        // 60 s : au plus ⌊61 / 5⌋ = 12 manches ; on en annonce 3 parfaites.
        $this->play(60, ['score' => 300, 'stars' => 15, 'wave' => 3, 'position' => $start + 3, 'peak' => $start + 3])->assertOk()
            ->assertJsonPath('run.flagged', false)->assertJsonPath('level.change', 'up')->assertJsonPath('level.to.position', $start + 3);
        $this->as('GET', '/madar')->assertJsonPath('odd.position', $start + 3)->assertJsonPath('sniper.position', $start);

        // Trop d'énigmes pour la durée, un score impossible : ramenés et signalés.
        $this->play(10, ['score' => 999_999, 'stars' => 999, 'wave' => 9, 'position' => $start + 12])->assertOk()
            ->assertJsonPath('run.flagged', true)
            ->assertJsonPath('run.wave', $odd->maxRounds(10_000))
            ->assertJsonPath('run.score', $odd->maxPlausible(10_000, $start + 3))
            ->assertJsonPath('level.to.position', $start + 3 + $odd->maxRounds(10_000));
    }

    public function test_mental_arithmetic_is_a_third_free_math_game_with_its_own_entry(): void
    {
        $levels = new SniperScoring(config('madar.sniper'));
        $mental = new OddScoring(config('madar.mental'), $levels);
        $this->as('GET', '/madar')->assertJsonPath('mental.entryLevel', 11)->assertJsonPath('mental.level', 11)->assertJsonPath('odd.level', 12);
        $this->assertSame('math', collect($this->as('GET', '/madar')->json('games'))->firstWhere('id', 'mental')['category']);

        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 0]);
        $id = $this->as('POST', '/madar/runs', ['game' => 'mental', 'level' => 1])->assertCreated()->assertJsonPath('run.position', 0)->json('run.id');
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds(20));
        $this->as('POST', "/madar/runs/{$id}/finish", ['score' => 999_999, 'stars' => 10, 'wave' => 2, 'position' => 2, 'peak' => 2])->assertOk()
            ->assertJsonPath('run.flagged', true)
            ->assertJsonPath('run.score', $mental->maxPlausible(20_000, 0))
            ->assertJsonPath('level.to.position', 2);
        $this->assertGreaterThan((new OddScoring(config('madar.odd'), $levels))->maxPlausible(20_000, 0), $mental->maxPlausible(20_000, 0), 'plus de problèmes et un bonus de vitesse');
        $this->as('POST', '/madar/runs', ['game' => 'mental', 'level' => 21])->assertStatus(422)->assertJsonPath('reason', 'level_locked');
    }

    public function test_the_teacher_sees_it_and_can_close_it(): void
    {
        $this->play(30, ['score' => 120, 'stars' => 6, 'wave' => 1, 'position' => 34, 'peak' => 34]);
        $teacher = $this->tokenOf($this->classroom->teacher);
        $this->withToken($teacher)->json('GET', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/results?game=odd")->assertOk()
            ->assertJsonPath('game', 'odd')->assertJsonPath('students.0.allTimeBest', 120)->assertJsonPath('students.0.mathLevel.level', 12);
        $this->withToken($teacher)->json('PUT', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/students/{$this->student->id}/games", ['disabledGames' => ['odd']])->assertOk();
        $this->as('POST', '/madar/runs', ['game' => 'odd'])->assertStatus(422)->assertJsonPath('reason', 'game_disabled_for_student');
    }
}
