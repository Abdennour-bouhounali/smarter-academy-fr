<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\DailyChallenge;
use App\Models\DailyChallengeAttempt;
use App\Models\DailyChallengeQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * Le défi d'un قسم : mêmes questions pour tous, réglages de l'enseignant,
 * compétition et Top 3 indépendants, confidentialité, classement déterministe,
 * tableau de bord et écran d'affichage — et la configuration administrateur.
 */
class DailyChallengeClassTest extends TestCase
{
    use CommercialFixtures;
    use DailyChallengeFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private Classroom $classroom;

    private string $teacherToken;

    /** @var User[] */
    private array $students = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->onChallengeDay();
        $this->challengeCurriculum();
        $this->defaultTeacherPlan();
        $this->classroom = Classroom::factory()->create();
        $this->teacherToken = $this->tokenOf($this->classroom->teacher);

        $lesson = $this->dcLessons['qasim-adad-tabii'];
        foreach (['Amine', 'Yasmine', 'Mohamed', 'Sara'] as $name) {
            $s = $this->student(['first_name' => $name, 'last_name' => 'Kaci', 'email' => strtolower($name).'@example.dz']);
            $this->answers($s, $lesson, $this->dcPoints['4am_qasim-adad-tabii_P1'], 'correct', 2, 3, now()->subDays(10));
            $this->answers($s, $lesson, $this->dcPoints['4am_qasim-adad-tabii_P2'], 'incorrect', 2, 2, now()->subDays(2));
            $this->students[$name] = $s;
        }
        $this->enrol($this->classroom, array_values($this->students));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(User $user)
    {
        return $this->withToken($this->tokenOf($user));
    }

    private function settings(array $values)
    {
        return $this->withToken($this->teacherToken)
            ->patchJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/settings", $values);
    }

    /** Joue le défi du jour : `$correct` bonnes réponses, chacune après `$seconds`. */
    private function play(User $s, int $correct, int $seconds = 10): array
    {
        $uuid = $this->as($s)->postJson('/api/v1/daily-challenge/start')->assertOk()->json('attempt.id');
        $attempt = DailyChallengeAttempt::where('uuid', $uuid)->first();
        $last = null;
        $start = now()->copy();
        for ($p = 1; $p <= $attempt->question_count; $p++) {
            $this->as($s)->postJson("/api/v1/daily-challenge/attempts/{$uuid}/next")->assertOk();
            Carbon::setTestNow(now()->addSeconds($seconds));
            $q = DailyChallengeQuestion::where('daily_challenge_id', $attempt->daily_challenge_id)->where('position', $p)->with('lesson')->first();
            $answer = $p <= $correct ? $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id) : $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id);
            $last = $this->as($s)->postJson("/api/v1/daily-challenge/attempts/{$uuid}/answers", ['position' => $p, 'answer' => $answer])->assertCreated();
        }
        Carbon::setTestNow($start->addMinute());

        return $last->json();
    }

    public function test_the_whole_class_gets_the_same_questions(): void
    {
        foreach ($this->students as $s) {
            $this->as($s)->getJson('/api/v1/daily-challenge')->assertOk()->assertJsonPath('scope.type', 'classroom')
                ->assertJsonPath('scope.classroom.id', $this->classroom->id);
        }
        $this->assertSame(1, DailyChallenge::count(), 'un seul défi pour la classe ce jour-là');
        $this->assertSame(5, DailyChallengeQuestion::count());
    }

    public function test_competition_on_top3_off_teacher_sees_ranking_students_do_not(): void
    {
        $this->settings(['competitionEnabled' => true, 'showTop3' => false])->assertOk();
        $this->play($this->students['Amine'], 5);
        $this->play($this->students['Yasmine'], 3);

        $today = $this->as($this->students['Yasmine'])->getJson('/api/v1/daily-challenge')->assertOk();
        $today->assertJsonPath('competition.enabled', true)->assertJsonPath('competition.top3', null)
            ->assertJsonPath('competition.myRank.rank', 2);
        $this->assertStringNotContainsString('Amine', $today->getContent(), 'aucun nom d\'un autre élève');

        $results = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->assertOk();
        $this->assertSame([$this->students['Amine']->id, $this->students['Yasmine']->id], array_slice(array_column(array_column($results->json('ranking'), 'student'), 'id'), 0, 2));
    }

    public function test_competition_on_top3_on_students_see_only_name_rank_score(): void
    {
        $this->settings(['competitionEnabled' => true, 'showTop3' => true])->assertOk();
        $this->play($this->students['Amine'], 5);
        $this->play($this->students['Yasmine'], 4);
        $this->play($this->students['Mohamed'], 3);
        $completion = $this->play($this->students['Sara'], 1);

        $completion['completion']['competition']['showTop3'] ?? $this->fail('Top 3 attendu');
        $top = $completion['completion']['competition']['top3'];
        $this->assertSame(['Amine K.', 'Yasmine K.', 'Mohamed K.'], array_column($top, 'displayName'));
        $this->assertSame(['rank', 'displayName', 'score', 'isMe'], array_keys($top[0]), 'rien d\'autre que rang, nom, score');
        $this->assertSame(4, $completion['completion']['competition']['myRank']['rank']);
        $json = json_encode($completion);
        $this->assertStringNotContainsString('@example.dz', $json);
        $this->assertStringNotContainsString('responseTime', json_encode($top));
    }

    public function test_competition_off_hides_every_ranking(): void
    {
        $this->settings(['competitionEnabled' => false, 'showTop3' => true])->assertOk();
        $done = $this->play($this->students['Amine'], 5);
        $this->assertFalse($done['completion']['competition']['enabled']);
        $this->assertNull($done['completion']['competition']['top3']);
        $this->assertNull($done['completion']['competition']['myRank']);
        $this->assertNull($done['completion']['attempt']['rankAfter'], 'pas de mouvement de rang quand le rang n\'est pas montrable');

        $results = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->assertOk();
        $this->assertNull($results->json('ranking'));
        $this->assertSame(1, $results->json('summary.completed'), 'l\'enseignant garde les résultats');
    }

    public function test_rank_movement_is_reported_only_when_real(): void
    {
        $this->settings(['competitionEnabled' => true])->assertOk();
        $this->play($this->students['Amine'], 2);
        $first = $this->play($this->students['Yasmine'], 1);
        $this->assertSame(2, $first['completion']['attempt']['rankAfter']);

        // Le lendemain, Yasmine passe devant.
        $this->onChallengeDay('2026-09-23');
        $second = $this->play($this->students['Yasmine'], 5);
        $this->assertSame(2, $second['completion']['attempt']['rankBefore']);
        $this->assertSame(1, $second['completion']['attempt']['rankAfter']);
    }

    public function test_a_disabled_class_challenge_falls_back_to_a_personal_one_without_class_data(): void
    {
        $this->settings(['enabled' => false])->assertOk();
        $this->as($this->students['Amine'])->getJson('/api/v1/daily-challenge')->assertOk()
            ->assertJsonPath('scope.type', 'student')->assertJsonPath('competition', null);
        $this->assertSame(0, DailyChallenge::where('scope_type', 'classroom')->count());
    }

    public function test_a_student_who_left_disappears_from_rankings_and_aggregates(): void
    {
        $this->settings(['competitionEnabled' => true, 'showTop3' => true])->assertOk();
        $this->play($this->students['Amine'], 5);
        $this->play($this->students['Yasmine'], 3);
        ClassroomMembership::where('student_id', $this->students['Amine']->id)->update(['status' => 'left']);

        $results = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->assertOk();
        $ids = array_column(array_column($results->json('ranking'), 'student'), 'id');
        $this->assertNotContains($this->students['Amine']->id, $ids);
        $this->assertSame(3, $results->json('members'));
        $this->assertSame(1, $results->json('summary.completed'));

        $top = $this->as($this->students['Yasmine'])->getJson('/api/v1/daily-challenge')->json('competition.top3');
        $this->assertSame(['Yasmine K.'], array_column($top, 'displayName'));
    }

    public function test_teacher_dashboard_analyses_questions_and_learning_points_without_emails(): void
    {
        $this->settings(['competitionEnabled' => true])->assertOk();
        $this->play($this->students['Amine'], 5, 8);
        $this->play($this->students['Yasmine'], 2, 20);
        $this->play($this->students['Mohamed'], 2, 30);

        $r = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->assertOk();
        $r->assertJsonPath('summary.completed', 3)->assertJsonPath('members', 4);
        $this->assertEquals(0.6, $r->json('summary.accuracy'));
        $q = collect($r->json('questions'));
        $this->assertEquals(1, $q->firstWhere('position', 1)['correctRate']);
        $this->assertTrue($q->firstWhere('position', 5)['flagged'], '1/3 juste : signalée');
        $flaggedPoint = collect($r->json('learningPoints'))->firstWhere('flagged', true);
        $this->assertNotNull($flaggedPoint);
        $this->assertNotEmpty($flaggedPoint['strugglingStudentIds']);
        $this->assertStringNotContainsString('@example.dz', $r->getContent());
        $this->assertStringNotContainsString('"email"', $r->getContent());

        $display = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/display")->assertOk();
        $this->assertSame('Amine K.', $display->json('todayTop.0.displayName'));
        $this->assertStringNotContainsString('Kaci', $display->getContent(), 'l\'affichage ne projette que prénom + initiale');
        $this->assertStringNotContainsString('responseTime', $display->getContent());
    }

    public function test_equal_scores_are_ranked_deterministically(): void
    {
        $this->settings(['competitionEnabled' => true])->assertOk();
        // Mêmes justesses ; Yasmine plus rapide → devant, malgré un même total écrasé à la main.
        $this->play($this->students['Amine'], 3, 50);
        $this->play($this->students['Yasmine'], 3, 50);
        DB::table('daily_challenge_standings')->update(['cumulative_score' => 500, 'total_correct' => 3]);
        DB::table('daily_challenge_standings')->where('user_id', $this->students['Yasmine']->id)->update(['total_response_ms' => 100000]);

        $ranking = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->json('ranking');
        $this->assertSame($this->students['Yasmine']->id, $ranking[0]['student']['id']);
        $again = $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->json('ranking');
        $this->assertSame(array_column($ranking, 'userId'), array_column($again, 'userId'), 'le même classement à chaque lecture');
    }

    public function test_settings_are_validated_and_scoped_to_the_class(): void
    {
        $this->settings(['questionCount' => 4])->assertStatus(422);
        $this->settings(['availableFrom' => '18:00', 'availableUntil' => '08:00'])->assertStatus(422);
        $this->settings(['lessonCodes' => ['lesson-of-another-grade']])->assertStatus(422);
        $this->settings(['questionCount' => 3, 'difficulty' => 'easy', 'lessonCodes' => ['qasim-adad-tabii']])->assertOk()
            ->assertJsonPath('settings.questionCount', 3)->assertJsonPath('settings.difficulty', 'easy');

        $this->as($this->students['Amine'])->getJson('/api/v1/daily-challenge')->assertJsonPath('challenge.questionCount', 3);
        $this->assertSame(0, DailyChallengeQuestion::where('lesson_id', $this->dcLessons['bahth-pgcd']->id)->count());
    }

    public function test_only_the_owner_teacher_reaches_the_class_challenge(): void
    {
        $base = "/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge";
        $other = Classroom::factory()->create();
        $this->withToken($this->tokenOf($other->teacher))->getJson("{$base}/results")->assertForbidden();
        $this->withToken($this->tokenOf($other->teacher))->patchJson("{$base}/settings", ['showTop3' => true])->assertForbidden();
        $this->as($this->students['Amine'])->getJson("{$base}/results")->assertForbidden();
        $this->as($this->students['Amine'])->getJson("{$base}/display")->assertForbidden();
    }

    public function test_admin_configures_scoring_and_past_challenges_keep_their_snapshot(): void
    {
        $this->play($this->students['Amine'], 5);
        $before = DailyChallengeAttempt::first()->total_score;

        $admin = $this->admin();
        $this->withToken($this->tokenOf($admin))->getJson('/api/v1/admin/daily-challenge/config')->assertOk()
            ->assertJsonFragment(['key' => 'scoring.base_points']);
        $this->withToken($this->tokenOf($admin))->putJson('/api/v1/admin/daily-challenge/config', ['values' => ['scoring.base_points' => 'lots']])->assertStatus(422);
        $this->withToken($this->tokenOf($admin))->putJson('/api/v1/admin/daily-challenge/config', ['values' => ['unknown.key' => 1]])->assertStatus(422);
        $this->withToken($this->tokenOf($admin))->putJson('/api/v1/admin/daily-challenge/config', ['values' => [
            'scoring.speed_tiers' => [['max_seconds' => 10, 'bonus' => 5], ['max_seconds' => 20, 'bonus' => 9]],
        ]])->assertStatus(422);
        $this->withToken($this->tokenOf($admin))->putJson('/api/v1/admin/daily-challenge/config', ['values' => ['scoring.base_points' => 200, 'challenge.default_question_count' => 3]])->assertOk();

        $this->assertSame($before, DailyChallengeAttempt::first()->fresh()->total_score, 'un barème changé ne réécrit pas hier');
        $this->onChallengeDay('2026-09-23');
        $done = $this->play($this->students['Yasmine'], 1, 200);
        $this->assertSame(200, $done['attempt']['score']['base']);

        $this->as($this->students['Amine'])->getJson('/api/v1/admin/daily-challenge/config')->assertForbidden();
        $this->withToken($this->teacherToken)->putJson('/api/v1/admin/daily-challenge/config', ['values' => []])->assertForbidden();
    }

    public function test_the_dashboard_and_student_screen_cost_the_same_queries_for_4_or_16_students(): void
    {
        $this->settings(['competitionEnabled' => true, 'showTop3' => true])->assertOk();
        $this->play($this->students['Amine'], 3);
        $count = function () {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->withToken($this->teacherToken)->getJson("/api/v1/teacher/classrooms/{$this->classroom->id}/daily-challenge/results")->assertOk();
            $teacher = count(DB::getQueryLog());
            DB::flushQueryLog();
            $this->as($this->students['Amine'])->getJson('/api/v1/daily-challenge')->assertOk();
            $student = count(DB::getQueryLog());
            DB::disableQueryLog();

            return [$teacher, $student];
        };
        $small = $count();

        $more = [];
        for ($i = 0; $i < 12; $i++) {
            $more[] = $this->student(['first_name' => "S{$i}"]);
        }
        $this->enrol($this->classroom, $more);
        $this->play($more[0], 4);
        $this->play($more[1], 2);

        $this->assertSame($small, $count(), 'aucune requête par élève');
    }
}
