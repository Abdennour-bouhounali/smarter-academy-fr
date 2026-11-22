<?php

namespace Tests\Feature;

use App\Domain\Madar\ExplorerLevels;
use App\Models\Classroom;
use App\Models\MadarLevelProgress;
use App\Models\MadarProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « المستكشف » — le jeu de plates-formes de « فضاء الألعاب » : une partie =
 * un niveau, le niveau 1 ouvert, un niveau réussi ouvre le suivant, trois
 * étoiles calculées par le serveur, un score borné par le maximum du niveau,
 * un « terminé » trop rapide refusé, un classement à part.
 */
class MadarExplorerTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private User $student;

    private Classroom $classroom;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        $this->student = $this->student(['first_name' => 'Amine', 'last_name' => 'Benali']);
        $this->enrol($this->classroom, [$this->student]);
        $this->api('GET', '/madar')->assertOk();
        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 5]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function api(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($this->student))->json($method, "/api/v1{$uri}", $body);
    }

    private function levels(): ExplorerLevels
    {
        return app(ExplorerLevels::class);
    }

    /** Joue un niveau : `seconds` de durée réelle, puis la clôture annoncée. */
    private function playLevel(int $level, int $seconds, int $score, int $crystals, bool $completed, int $revives = 0)
    {
        $id = $this->api('POST', '/madar/runs', ['game' => 'explorer', 'level' => $level])->assertCreated()->assertJsonPath('run.level', $level)->json('run.id');
        for ($i = 0; $i < $revives; $i++) {
            $this->api('POST', "/madar/runs/{$id}/revive")->assertOk();
        }
        $now = now();
        Carbon::setTestNow($now->copy()->addSeconds($seconds));
        $res = $this->api('POST', "/madar/runs/{$id}/finish", ['score' => $score, 'stars' => $crystals, 'completed' => $completed]);
        Carbon::setTestNow($now->copy()->addSeconds($seconds + 1));

        return $res;
    }

    public function test_only_the_first_level_is_open_at_the_start(): void
    {
        $levels = collect($this->api('GET', '/madar')->assertOk()->json('explorer.levels'));
        $this->assertCount(12, $levels);
        $this->assertTrue($levels[0]['unlocked']);
        $this->assertFalse($levels[1]['unlocked']);
        $this->api('POST', '/madar/runs', ['game' => 'explorer', 'level' => 2])->assertStatus(422)->assertJsonPath('reason', 'level_locked');
        $this->api('POST', '/madar/runs', ['game' => 'explorer', 'level' => 99])->assertStatus(404);
    }

    public function test_completing_a_level_unlocks_the_next_and_earns_three_stars(): void
    {
        $all = $this->levels()->totalCrystals(1);
        $res = $this->playLevel(1, 40, 1500, $all, true)->assertOk()
            ->assertJsonPath('run.completed', true)
            ->assertJsonPath('level.stars', 3)
            ->assertJsonPath('level.nextUnlocked', true)
            ->assertJsonPath('level.next', 2)
            ->assertJsonPath('newBest', true);
        $this->assertSame(1500, $res->json('run.score'));

        $state = $this->api('GET', '/madar')->assertOk();
        $this->assertTrue($state->json('explorer.levels.1.unlocked'));
        $this->assertSame(3, $state->json('explorer.totalStars'));
        $this->api('POST', '/madar/runs', ['game' => 'explorer', 'level' => 2])->assertCreated();
    }

    public function test_stars_need_all_crystals_and_no_revive(): void
    {
        $this->playLevel(1, 40, 900, 3, true, revives: 1)->assertOk()->assertJsonPath('level.stars', 1);
        $this->playLevel(1, 40, 900, $this->levels()->totalCrystals(1), true, revives: 1)->assertOk()->assertJsonPath('level.stars', 2)->assertJsonPath('level.newStars', 1);
        $this->assertSame(2, MadarLevelProgress::where('user_id', $this->student->id)->where('level', 1)->value('stars'));
        $this->assertSame(2, MadarLevelProgress::where('user_id', $this->student->id)->where('level', 1)->value('attempts'));
    }

    public function test_a_failed_level_unlocks_nothing(): void
    {
        $this->playLevel(1, 20, 200, 4, false)->assertOk()->assertJsonPath('run.completed', false)->assertJsonPath('level.stars', 0)->assertJsonPath('level.nextUnlocked', false);
        $this->assertFalse($this->api('GET', '/madar')->json('explorer.levels.1.unlocked'));
    }

    public function test_a_level_finished_impossibly_fast_does_not_count(): void
    {
        $this->playLevel(1, 2, 1000, 5, true)->assertOk()
            ->assertJsonPath('run.completed', false)->assertJsonPath('run.flagged', true)->assertJsonPath('level.nextUnlocked', false);
    }

    public function test_the_score_is_bounded_by_the_level_maximum(): void
    {
        $max = $this->levels()->maxScore(1) + 50;
        $this->playLevel(1, 40, 999_999, 999, true)->assertOk()
            ->assertJsonPath('run.score', $max)->assertJsonPath('run.flagged', true)
            ->assertJsonPath('level.crystals', $this->levels()->totalCrystals(1));
    }

    public function test_explorer_has_its_own_leaderboard_and_teacher_view(): void
    {
        $this->playLevel(1, 40, 1200, $this->levels()->totalCrystals(1), true);
        $state = $this->api('GET', '/madar')->assertOk();
        $this->assertSame(1, $state->json('explorer.competition.participants'));
        $this->assertSame(0, $state->json('competition.participants'));

        $this->withToken($this->tokenOf($this->classroom->teacher))
            ->json('GET', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/results?game=explorer")->assertOk()
            ->assertJsonPath('game', 'explorer')
            ->assertJsonPath('students.0.levelStars', 3)
            ->assertJsonPath('students.0.levelsCompleted', 1)
            ->assertJsonPath('students.0.allTimeBest', 1200);
    }

    public function test_the_shared_level_file_is_valid(): void
    {
        $levels = $this->levels();
        $this->assertSame(12, $levels->count());
        foreach (range(1, 12) as $n) {
            $s = $levels->summary($n);
            $this->assertGreaterThan($s['startX'], $s['goalX'], "niveau {$n}");
            $this->assertGreaterThan(0, $levels->minDurationMs($n));
            $this->assertGreaterThan(1000, $levels->maxScore($n));
        }
    }
}
