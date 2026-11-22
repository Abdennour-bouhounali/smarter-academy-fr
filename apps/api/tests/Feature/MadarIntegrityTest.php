<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\MadarHeartAdjustment;
use App\Models\MadarProfile;
use App\Models\MadarRefuel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * L'intégrité de la « محطة التزوّد » (MADAR_GAME.md §5bis) : le délai selon
 * la difficulté (réglable par l'enseignant pour la classe et par question),
 * la page quittée, la réponse trop rapide, la maîtrise protégée, les signaux
 * « تستحق نظرة » et les cœurs donnés / retirés par l'enseignant.
 */
class MadarIntegrityTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private Classroom $classroom;

    private User $student;

    private string $token;

    private string $teacherToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->classroom = Classroom::factory()->create(['grade' => '4am']);
        $this->teacherToken = $this->tokenOf($this->classroom->teacher);
        $this->student = $this->student(['first_name' => 'Amine', 'last_name' => 'Benali']);
        $this->token = $this->tokenOf($this->student);
        $this->enrol($this->classroom, [$this->student]);
        $this->api('GET', '/madar')->assertOk();
        MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 0]);
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

    private function teacher(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->teacherToken)->json($method, "/api/v1/teacher/classrooms/{$this->classroom->id}/madar{$uri}", $body);
    }

    private function serve(): MadarRefuel
    {
        $id = $this->api('POST', '/madar/refuel')->assertOk()->json('refuel.id');

        return MadarRefuel::where('uuid', $id)->with('lesson')->firstOrFail();
    }

    private function right(MadarRefuel $q): array
    {
        return $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id);
    }

    private function hearts(): int
    {
        return (int) MadarProfile::where('user_id', $this->student->id)->value('hearts');
    }

    public function test_the_time_limit_follows_the_difficulty_and_is_frozen_at_serving(): void
    {
        $res = $this->api('POST', '/madar/refuel')->assertOk();
        $q = MadarRefuel::where('uuid', $res->json('refuel.id'))->first();
        $expected = config('madar.refuel.time_limits')[$q->difficulty] ?? 90;
        $res->assertJsonPath('refuel.timeLimitS', $expected);
        $this->assertNotNull($res->json('refuel.servedAt'));
        $this->assertNotNull($res->json('refuel.serverNow'));
        $this->assertSame($expected, $q->time_limit_s);
    }

    public function test_an_answer_after_the_limit_earns_nothing_and_proves_nothing(): void
    {
        $q = $this->serve();
        Carbon::setTestNow(now()->addSeconds($q->time_limit_s + 10));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk()
            ->assertJsonPath('result.isCorrect', true)
            ->assertJsonPath('result.heartsAwarded', 0)
            ->assertJsonPath('result.flag', 'timeout');
        $this->assertSame(0, $this->hearts());
        $this->assertSame(0, LearningEvidence::where('source_id', 'madar:'.$q->uuid)->count(), 'hors délai : pas de preuve');
    }

    public function test_the_network_grace_still_counts(): void
    {
        $q = $this->serve();
        Carbon::setTestNow(now()->addSeconds($q->time_limit_s + 2));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk()
            ->assertJsonPath('result.heartsAwarded', 1)->assertJsonPath('result.flag', null);
    }

    public function test_an_open_question_past_its_limit_is_closed_and_replaced(): void
    {
        $q = $this->serve();
        Carbon::setTestNow(now()->addSeconds($q->time_limit_s + 60));
        $next = $this->api('POST', '/madar/refuel')->assertOk()->json('refuel.id');
        $this->assertNotSame($q->uuid, $next, 'partir chercher la réponse puis revenir ne rend pas la même question');
        $q->refresh();
        $this->assertSame('timeout', $q->flag);
        $this->assertNotNull($q->answered_at);
        $this->assertSame(0, $q->hearts_awarded);
    }

    public function test_leaving_the_page_forfeits_the_heart_and_the_evidence(): void
    {
        $q = $this->serve();
        $this->api('POST', "/madar/refuel/{$q->uuid}/left", ['awayMs' => 600])->assertOk()->assertJsonPath('left', false);
        $this->api('POST', "/madar/refuel/{$q->uuid}/left", ['awayMs' => 8000])->assertOk()->assertJsonPath('left', true);
        Carbon::setTestNow(now()->addSeconds(20));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk()
            ->assertJsonPath('result.isCorrect', true)
            ->assertJsonPath('result.heartsAwarded', 0)
            ->assertJsonPath('result.flag', 'left');
        $this->assertSame(0, LearningEvidence::where('source_id', 'madar:'.$q->uuid)->count());
        $this->assertSame(1, $q->fresh()->left_count);
    }

    public function test_a_reload_after_leaving_keeps_the_question_marked(): void
    {
        $q = $this->serve();
        $this->api('POST', "/madar/refuel/{$q->uuid}/left", ['awayMs' => 5000])->assertOk();
        $this->api('POST', '/madar/refuel')->assertOk()->assertJsonPath('refuel.id', $q->uuid)->assertJsonPath('refuel.left', true);
    }

    public function test_the_client_can_report_leaving_with_the_answer(): void
    {
        $q = $this->serve();
        Carbon::setTestNow(now()->addSeconds(20));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q), 'left' => true])->assertOk()
            ->assertJsonPath('result.heartsAwarded', 0)->assertJsonPath('result.flag', 'left');
    }

    public function test_a_too_fast_right_answer_earns_the_heart_but_not_the_evidence(): void
    {
        $q = $this->serve();
        $q->update(['difficulty' => 4]);
        Carbon::setTestNow(now()->addSeconds(2));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk()
            ->assertJsonPath('result.heartsAwarded', 1)
            ->assertJsonPath('result.flag', null);
        $this->assertSame('fast', $q->fresh()->flag, 'le signal ne regarde que l\'enseignant');
        $this->assertFalse($q->fresh()->evidence_recorded);
        $this->assertSame(0, LearningEvidence::where('source_id', 'madar:'.$q->uuid)->count());
    }

    public function test_a_normal_right_answer_earns_and_proves(): void
    {
        $q = $this->serve();
        Carbon::setTestNow(now()->addSeconds(25));
        $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk()->assertJsonPath('result.heartsAwarded', 1);
        $this->assertTrue($q->fresh()->evidence_recorded);
        $this->assertSame(1, LearningEvidence::where('source_id', 'madar:'.$q->uuid)->count());
    }

    public function test_the_teacher_sets_time_limits_per_difficulty_and_per_question(): void
    {
        $limits = ['1' => 30, '2' => 30, '3' => 30, '4' => 30, '5' => 30];
        $this->teacher('PATCH', '/settings', ['timeLimits' => $limits])->assertOk()->assertJsonPath('settings.timeLimits.3', 30);
        $this->teacher('PATCH', '/settings', ['timeLimits' => ['3' => 5]])->assertStatus(422)->assertJsonPath('reason', 'time_limit_range');
        $this->teacher('PATCH', '/settings', ['timeLimits' => ['9' => 60]])->assertStatus(422)->assertJsonPath('reason', 'time_limit_difficulty');

        $q = $this->serve();
        $this->assertSame(30, $q->time_limit_s);

        // La question elle-même : 200 s pour CETTE classe, puis retour au réglage de sa difficulté.
        $this->teacher('PUT', '/time-limits', ['itemKey' => $q->item_key, 'seconds' => 200])->assertOk();
        $item = collect($this->teacher('GET', '/items')->assertOk()->json('items'))->firstWhere('itemKey', $q->item_key);
        $this->assertSame(200, $item['timeLimit']);
        $this->assertTrue($item['customized']);
        $this->assertSame(1, $item['served']);
        $this->assertNotEmpty($item['statement']);
        $this->assertStringNotContainsString('expectedAnswer', json_encode($item));

        $this->teacher('PUT', '/time-limits', ['itemKey' => $q->item_key, 'seconds' => 1000])->assertStatus(422);
        $this->teacher('PUT', '/time-limits', ['itemKey' => 'practice:nope:x:q1', 'seconds' => 60])->assertStatus(422)->assertJsonPath('reason', 'item_not_found');

        // Une question déjà servie garde son délai ; la prochaine sert du même item prend le nouveau.
        $this->assertSame(30, $q->fresh()->time_limit_s);
        $this->assertSame(200, app(\App\Domain\Madar\MadarConfig::class)->timeLimitFor($this->classroom, $q->item_key, $q->difficulty));
        $this->teacher('PUT', '/time-limits', ['itemKey' => $q->item_key, 'seconds' => null])->assertOk();
        app(\App\Domain\Madar\MadarConfig::class)->forget();
        $this->assertSame(30, app(\App\Domain\Madar\MadarConfig::class)->timeLimitFor($this->classroom, $q->item_key, $q->difficulty));
    }

    public function test_the_teacher_gives_and_removes_hearts_with_a_reason(): void
    {
        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => 2, 'reason' => 'effort', 'note' => 'حلّ التمرين على السبّورة'])
            ->assertCreated()->assertJsonPath('hearts', 2)->assertJsonPath('adjustment.applied', 2);
        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => 5, 'reason' => 'effort'])
            ->assertCreated()->assertJsonPath('hearts', 5)->assertJsonPath('adjustment.applied', 3);

        // L'élève le voit UNE fois, motif compris.
        $seen = $this->api('GET', '/madar')->assertOk()->assertJsonPath('hearts', 5)->json('adjustments');
        $this->assertCount(2, $seen);
        $this->assertSame('effort', $seen[0]['reason']);
        $this->assertSame('حلّ التمرين على السبّورة', $seen[0]['note']);
        $this->api('GET', '/madar')->assertJsonPath('adjustments', []);

        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => -5, 'reason' => 'cheating'])
            ->assertCreated()->assertJsonPath('hearts', 0)->assertJsonPath('adjustment.applied', -5);
        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => -2, 'reason' => 'cheating'])
            ->assertCreated()->assertJsonPath('hearts', 0)->assertJsonPath('adjustment.applied', 0);

        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => 6, 'reason' => 'effort'])->assertStatus(422)->assertJsonPath('reason', 'adjustment_range');
        $this->teacher('POST', '/hearts', ['studentId' => $this->student->id, 'delta' => 1, 'reason' => 'gift'])->assertStatus(422)->assertJsonPath('reason', 'adjustment_reason');
        $outsider = $this->student();
        $this->teacher('POST', '/hearts', ['studentId' => $outsider->id, 'delta' => 1, 'reason' => 'effort'])->assertStatus(422)->assertJsonPath('reason', 'student_not_in_class');

        $this->assertSame(4, MadarHeartAdjustment::count());
        $this->teacher('GET', '/results')->assertOk()->assertJsonPath('adjustments.0.reason', 'cheating')->assertJsonPath('adjustments.0.student.firstName', 'Amine');
    }

    public function test_another_teacher_cannot_adjust_hearts(): void
    {
        $other = Classroom::factory()->create();
        $this->withToken($this->tokenOf($other->teacher))
            ->json('POST', "/api/v1/teacher/classrooms/{$this->classroom->id}/madar/hearts", ['studentId' => $this->student->id, 'delta' => 3, 'reason' => 'effort'])
            ->assertForbidden();
        $this->assertSame(0, $this->hearts());
    }

    public function test_repeated_timeouts_and_leaves_are_signalled_to_the_teacher(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $q = $this->serve();
            $this->api('POST', "/madar/refuel/{$q->uuid}/left", ['awayMs' => 9000])->assertOk();
            Carbon::setTestNow(now()->addSeconds(10));
            $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])->assertOk();
        }
        $row = $this->teacher('GET', '/results')->assertOk()->assertJsonPath('summary.alerts', 1)->json('students.0');
        $this->assertSame(3, $row['leaves']);
        $this->assertContains('leaves', $row['alerts']);
    }

    public function test_a_game_accuracy_far_above_practice_is_signalled(): void
    {
        $points = [];
        for ($i = 0; $i < 6; $i++) {
            MadarProfile::where('user_id', $this->student->id)->update(['hearts' => 0]);
            $q = $this->serve();
            Carbon::setTestNow(now()->addSeconds(30));
            $this->api('POST', "/madar/refuel/{$q->uuid}/answer", ['answer' => $this->right($q)])->assertOk();
            $points[$q->learning_point_id] = $q->lesson;
        }
        // En pratique, sur les mêmes كفاءات : presque tout faux.
        foreach ($points as $lpId => $lesson) {
            $this->answers($this->student, $lesson, LearningPoint::find($lpId), 'incorrect', 4);
        }

        $row = $this->teacher('GET', '/results')->assertOk()->json('students.0');
        $this->assertTrue($row['gap']['flagged']);
        $this->assertSame(1.0, (float) $row['gap']['refuel']);
        $this->assertContains('gap', $row['alerts']);
    }
}
