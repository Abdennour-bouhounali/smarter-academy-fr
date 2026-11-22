<?php

namespace Tests\Feature;

use App\Domain\Madar\MadarScoring;
use App\Models\LearningEvidence;
use App\Models\MadarProfile;
use App\Models\MadarRefuel;
use App\Models\MadarRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « مدار » d'un élève INDÉPENDANT, de bout en bout, sur le vrai contenu 4AM :
 * cœurs quotidiens, parties, borne du score, reprises, محطة التزوّد (question
 * sans clé, cœur contre réponse juste, preuve d'apprentissage), vaisseaux.
 */
class MadarFlowTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private User $student;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->student = $this->student(['first_name' => 'Amine', 'last_name' => 'Benali']);
        $this->token = $this->tokenOf($this->student);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function api(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->token)->json($method, "/api/v1{$uri}", $body);
    }

    private function hearts(): int
    {
        return (int) MadarProfile::where('user_id', $this->student->id)->value('hearts');
    }

    private function setHearts(int $n): void
    {
        $this->api('GET', '/madar')->assertOk();
        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => $n]);
    }

    private function play(int $seconds, int $score, int $stars = 0)
    {
        $id = $this->api('POST', '/madar/runs')->assertCreated()->json('run.id');
        Carbon::setTestNow(now()->addSeconds($seconds));

        return $this->api('POST', "/madar/runs/{$id}/finish", ['score' => $score, 'stars' => $stars]);
    }

    private function refuelQuestion(): MadarRefuel
    {
        $id = $this->api('POST', '/madar/refuel')->assertOk()->json('refuel.id');

        return MadarRefuel::where('uuid', $id)->with('lesson')->firstOrFail();
    }

    public function test_the_first_visit_grants_the_daily_hearts_once(): void
    {
        $this->api('GET', '/madar')->assertOk()
            ->assertJsonPath('available', true)
            ->assertJsonPath('hearts', 3)
            ->assertJsonPath('maxHearts', 5)
            ->assertJsonPath('scope.type', 'student')
            ->assertJsonPath('competition', null)
            ->assertJsonPath('ship', 'sahm');

        $this->play(10, 50)->assertOk();
        $this->api('GET', '/madar')->assertJsonPath('hearts', 2);

        // Le lendemain : remonté À 3, jamais au-delà, jamais cumulé.
        Carbon::setTestNow(now()->addDay());
        $this->api('GET', '/madar')->assertJsonPath('hearts', 3);
        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 5]);
        Carbon::setTestNow(now()->addDay());
        $this->api('GET', '/madar')->assertJsonPath('hearts', 5);
    }

    public function test_a_run_costs_a_heart_and_needs_one(): void
    {
        $this->setHearts(1);
        $this->api('POST', '/madar/runs')->assertCreated()->assertJsonPath('hearts', 0)->assertJsonStructure(['run' => ['id', 'seed']]);
        $this->api('POST', '/madar/runs')->assertStatus(422)->assertJsonPath('reason', 'no_hearts');
        $this->assertSame(1, MadarRun::count());
    }

    public function test_a_new_run_abandons_the_open_one(): void
    {
        $first = $this->api('POST', '/madar/runs')->json('run.id');
        $this->api('POST', '/madar/runs')->assertCreated();

        $this->assertSame('abandoned', MadarRun::where('uuid', $first)->value('status'));
        $this->api('POST', "/madar/runs/{$first}/finish", ['score' => 10, 'stars' => 0])->assertStatus(409)->assertJsonPath('reason', 'run_closed');
    }

    public function test_the_daily_run_cap_is_enforced(): void
    {
        config(['madar.runs.daily_cap' => 2]);
        $this->setHearts(5);
        $this->play(5, 10)->assertOk();
        $this->play(5, 10)->assertOk();
        $this->api('POST', '/madar/runs')->assertStatus(422)->assertJsonPath('reason', 'daily_cap');
        $this->assertSame(3, $this->hearts(), 'une partie refusée ne coûte rien');
    }

    public function test_a_plausible_score_is_kept_and_sets_the_record(): void
    {
        $res = $this->play(60, 900, 12)->assertOk()
            ->assertJsonPath('run.score', 900)
            ->assertJsonPath('run.flagged', false)
            ->assertJsonPath('best', 900)
            ->assertJsonPath('newBest', true)
            ->assertJsonPath('weekBest', 900);
        $this->assertSame(60_000, $res->json('run.durationMs'));
        // 800 franchis : le « صقر » se débloque en VOLANT, pas en finissant une leçon.
        $this->assertContains('saqr', $res->json('unlocked'));

        $this->play(30, 400)->assertJsonPath('best', 900)->assertJsonPath('newBest', false)->assertJsonPath('weekBest', 900);
    }

    public function test_an_impossible_score_is_clamped_to_the_bound_and_flagged(): void
    {
        $bound = (new MadarScoring(config('madar.physics')))->maxPlausible(5_000);
        $this->play(5, 1_000_000)->assertOk()
            ->assertJsonPath('run.score', $bound)
            ->assertJsonPath('run.flagged', true);
        $this->assertSame(1_000_000, MadarRun::first()->claimed_score);
    }

    public function test_finishing_twice_returns_the_first_result(): void
    {
        $id = $this->api('POST', '/madar/runs')->json('run.id');
        Carbon::setTestNow(now()->addSeconds(40));
        $this->api('POST', "/madar/runs/{$id}/finish", ['score' => 300, 'stars' => 3])->assertOk()->assertJsonPath('duplicate', false);
        $this->api('POST', "/madar/runs/{$id}/finish", ['score' => 9000, 'stars' => 3])->assertOk()
            ->assertJsonPath('duplicate', true)->assertJsonPath('run.score', 300);
        $this->assertSame(1, (int) MadarProfile::where('user_id', $this->student->id)->value('runs_count'));
    }

    public function test_a_revive_costs_a_heart_and_is_limited(): void
    {
        $this->setHearts(5);
        $id = $this->api('POST', '/madar/runs')->json('run.id');
        $this->api('POST', "/madar/runs/{$id}/revive")->assertOk()->assertJsonPath('revives', 1)->assertJsonPath('hearts', 3);
        $this->api('POST', "/madar/runs/{$id}/revive")->assertOk()->assertJsonPath('revives', 2);
        $this->api('POST', "/madar/runs/{$id}/revive")->assertStatus(422)->assertJsonPath('reason', 'revive_limit');
        $this->assertSame(2, $this->hearts());
    }

    public function test_the_refuel_question_carries_no_answer_key_and_stays_the_same(): void
    {
        $this->setHearts(0);
        $res = $this->api('POST', '/madar/refuel')->assertOk()->assertJsonPath('hearts', 0);
        $payload = json_encode($res->json('refuel'));
        foreach (['expectedAnswer', 'isCorrect', 'misconceptionSignatures', 'hints', 'feedback', 'misconceptionId'] as $secret) {
            $this->assertStringNotContainsString($secret, $payload);
        }
        $this->assertNotNull($res->json('refuel.content.question.statement'));
        // La raison du choix, que l'élève lit en bas de la carte.
        $this->assertContains($res->json('refuel.reason'), ['retrieval', 'recent_mistake', 'reinforce', 'recently_learned', 'review', 'warmup']);
        $this->assertSame($res->json('refuel.id'), $this->api('POST', '/madar/refuel')->json('refuel.id'), 'un rechargement ne change pas la question');
    }

    public function test_a_right_answer_refuels_a_heart_and_records_evidence(): void
    {
        $this->setHearts(0);
        $q = $this->refuelQuestion();
        // Un temps de réflexion réaliste : ni « trop rapide », ni hors délai.
        Carbon::setTestNow(now()->addSeconds(20));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])
            ->assertOk()
            ->assertJsonPath('result.isCorrect', true)
            ->assertJsonPath('result.heartsAwarded', 1)
            ->assertJsonPath('hearts', 1)
            ->assertJsonPath('refuel.correct', 1);

        $evidence = LearningEvidence::where('user_id', $this->student->id)->latest('id')->first();
        $this->assertNotNull($evidence, 'la réponse est une preuve d\'apprentissage ordinaire');
        $this->assertSame('madar:'.$q->uuid, $evidence->source_id);

        // Le jeu peut reprendre : le cœur gagné paie la partie.
        $this->api('POST', '/madar/runs')->assertCreated()->assertJsonPath('hearts', 0);
    }

    public function test_a_wrong_answer_gives_nothing_but_the_correction(): void
    {
        $this->setHearts(0);
        $q = $this->refuelQuestion();
        $res = $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])
            ->assertOk()
            ->assertJsonPath('result.isCorrect', false)
            ->assertJsonPath('result.heartsAwarded', 0)
            ->assertJsonPath('hearts', 0);
        $this->assertArrayHasKey('correctChoiceIds', $res->json('result.reveal'));

        // Une nouvelle question vient ensuite — pas la même.
        $this->assertNotSame($q->uuid, $this->api('POST', '/madar/refuel')->json('refuel.id'));
    }

    public function test_a_replayed_answer_is_idempotent_and_a_changed_one_is_refused(): void
    {
        $this->setHearts(0);
        $q = $this->refuelQuestion();
        $right = $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id);
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $right])->assertOk();
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $right])->assertOk()->assertJsonPath('duplicate', true)->assertJsonPath('hearts', 1);
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])
            ->assertStatus(409)->assertJsonPath('reason', 'already_answered');
        $this->assertSame(1, $this->hearts(), 'un seul cœur par question');
    }

    public function test_the_station_is_closed_when_hearts_are_full(): void
    {
        $this->setHearts(5);
        $this->api('POST', '/madar/refuel')->assertStatus(422)->assertJsonPath('reason', 'hearts_full');
    }

    public function test_refuel_does_not_serve_an_item_served_in_the_last_days(): void
    {
        $this->setHearts(0);
        $served = [];
        for ($i = 0; $i < 4; $i++) {
            $q = $this->refuelQuestion();
            $served[] = $q->item_key;
            $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])->assertOk();
        }
        $this->assertCount(4, array_unique($served));
    }

    public function test_a_locked_ship_cannot_be_chosen_and_an_unlocked_one_can(): void
    {
        $this->api('PATCH', '/madar/ship', ['ship' => 'saqr'])->assertStatus(422)->assertJsonPath('reason', 'ship_locked');
        $this->api('PATCH', '/madar/ship', ['ship' => 'nope'])->assertStatus(422);
        $this->play(60, 900)->assertOk();
        $this->api('PATCH', '/madar/ship', ['ship' => 'saqr'])->assertOk()->assertJsonPath('ship', 'saqr');
        $this->api('GET', '/madar')->assertJsonPath('ship', 'saqr');
    }

    public function test_another_students_run_and_question_are_not_found(): void
    {
        $id = $this->api('POST', '/madar/runs')->json('run.id');
        $other = $this->student();
        $this->withToken($this->tokenOf($other))->json('POST', "/api/v1/madar/runs/{$id}/finish", ['score' => 1, 'stars' => 0])->assertNotFound();
    }

    public function test_a_teacher_cannot_play(): void
    {
        $teacher = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $this->withToken($this->tokenOf($teacher))->json('GET', '/api/v1/madar')->assertForbidden();
    }

    public function test_the_game_can_be_switched_off_globally(): void
    {
        config(['madar.enabled' => false]);
        $this->api('GET', '/madar')->assertOk()->assertJsonPath('available', false)->assertJsonPath('reason', 'disabled');
        $this->api('POST', '/madar/runs')->assertStatus(422)->assertJsonPath('reason', 'disabled');
    }
}
