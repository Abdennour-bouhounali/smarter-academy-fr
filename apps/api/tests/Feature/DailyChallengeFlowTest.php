<?php

namespace Tests\Feature;

use App\Domain\DailyChallenge\DailyChallengeService;
use App\Domain\Progress\Engine\MasteryState;
use App\Models\DailyChallenge;
use App\Models\DailyChallengeAttempt;
use App\Models\DailyChallengeQuestion;
use App\Models\DailyChallengeStanding;
use App\Models\LearningEvidence;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\DailyChallengeFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * Le défi quotidien d'un élève INDÉPENDANT, de bout en bout, sur le vrai
 * contenu 4AM : génération stable, chronométrage serveur, idempotence,
 * expiration, score, série, preuve d'apprentissage.
 */
class DailyChallengeFlowTest extends TestCase
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

        // Ce que l'élève a déjà travaillé : quatre points de la première leçon,
        // maîtrisés (items difficiles, D2) il y a 40 jours — la fraîcheur décline.
        $lesson = $this->dcLessons['qasim-adad-tabii'];
        foreach (['P1', 'P2', 'P3', 'P4'] as $p) {
            $this->answers($this->student, $lesson, $this->dcPoints["4am_qasim-adad-tabii_{$p}"], 'correct', 4, 5, now()->subDays(40));
        }
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

    private function questionAt(string $uuid, int $position): DailyChallengeQuestion
    {
        $attempt = DailyChallengeAttempt::where('uuid', $uuid)->firstOrFail();

        return DailyChallengeQuestion::where('daily_challenge_id', $attempt->daily_challenge_id)->where('position', $position)->with('lesson')->firstOrFail();
    }

    private function answerRight(string $uuid, int $position, int $afterSeconds = 8)
    {
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next")->assertOk();
        Carbon::setTestNow(now()->addSeconds($afterSeconds));
        $q = $this->questionAt($uuid, $position);

        return $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", [
            'position' => $position, 'answer' => $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id),
        ]);
    }

    /**
     * Les fiches BEM ont ajouté des étapes « بيّن أن » auto-évaluées
     * (`selfCheck`) et des étapes `counted: false` : le défi n'en sert
     * aucune — elles seraient notées sur la parole de l'élève.
     */
    public function test_the_challenge_serves_only_questions_that_count_for_mastery(): void
    {
        $this->api('GET', '/daily-challenge')->assertOk();

        $served = DailyChallengeQuestion::with('lesson')->get();
        $this->assertNotEmpty($served);
        foreach ($served as $q) {
            $content = app(\App\Domain\Practice\ExerciseRepository::class)->findQuestion($q->lesson->code, $q->exercise_code, $q->question_id);
            $this->assertTrue(\App\Domain\Practice\Support\AnswerEvaluator::countsForMastery($content), "{$q->item_key} ne compte pas pour la maîtrise");
        }
    }

    public function test_the_challenge_is_generated_once_and_is_stable(): void
    {
        $first = $this->api('GET', '/daily-challenge')->assertOk();
        $first->assertJsonPath('available', true)->assertJsonPath('scope.type', 'student')
            ->assertJsonPath('challenge.questionCount', 5)->assertJsonPath('competition', null);

        $ids = DailyChallengeQuestion::orderBy('position')->pluck('item_key')->all();
        $this->api('GET', '/daily-challenge')->assertOk();
        $this->assertSame(1, DailyChallenge::count(), 'un rechargement ne régénère pas le défi');
        $this->assertSame($ids, DailyChallengeQuestion::orderBy('position')->pluck('item_key')->all());

        // Couverture : les quatre points appris d'abord, puis on reprend (Q5 → un point déjà vu).
        $points = DailyChallengeQuestion::orderBy('position')->pluck('learning_point_id')->all();
        $this->assertCount(4, array_unique(array_slice($points, 0, 4)), 'une question par point tant qu\'il y en a');
        // Récupération, pas nouveauté : aucune question de la leçon jamais travaillée.
        $this->assertSame(0, DailyChallengeQuestion::where('lesson_id', $this->dcLessons['bahth-pgcd']->id)->count());
        // Les points maîtrisés il y a 40 jours sont des candidats de récupération.
        $this->assertContains('retrieval', DailyChallengeQuestion::pluck('reason')->all());
    }

    public function test_a_second_tab_and_a_refresh_resume_the_same_attempt_and_timer(): void
    {
        $a = $this->api('POST', '/daily-challenge/start')->assertOk()->json('attempt.id');
        $b = $this->api('POST', '/daily-challenge/start')->assertOk()->json('attempt.id');
        $this->assertSame($a, $b);
        $this->assertSame(1, DailyChallengeAttempt::count());

        $open = $this->api('POST', "/daily-challenge/attempts/{$a}/next")->assertOk();
        Carbon::setTestNow(now()->addSeconds(20));
        $again = $this->api('POST', "/daily-challenge/attempts/{$a}/next")->assertOk();
        $this->assertSame($open->json('question.startedAt'), $again->json('question.startedAt'), 'recharger ne remet pas le chronomètre à zéro');
        $this->assertSame(1, $again->json('question.position'));
    }

    public function test_the_served_question_carries_no_answer_key(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $payload = json_encode($this->api('POST', "/daily-challenge/attempts/{$uuid}/next")->json('question'));
        foreach (['expectedAnswer', 'isCorrect', 'misconceptionSignatures', 'hints', 'feedback', 'misconceptionId'] as $secret) {
            $this->assertStringNotContainsString($secret, $payload);
        }
    }

    public function test_server_timing_scores_a_correct_answer_and_records_evidence(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $r = $this->answerRight($uuid, 1, 8)->assertCreated();

        $r->assertJsonPath('answer.outcome', 'correct')
            ->assertJsonPath('answer.score.base', 100)
            ->assertJsonPath('answer.responseTimeMs', 8000);
        $this->assertGreaterThan(0, $r->json('answer.score.speed'));
        $this->assertNotEmpty($r->json('answer.reveal'));

        $evidence = LearningEvidence::where('source_id', DailyChallengeService::evidenceSourceId(DailyChallengeAttempt::first()))->first();
        $this->assertNotNull($evidence, 'la réponse de défi est une preuve d\'apprentissage');
        $this->assertSame('practice_exercise', $evidence->assessment_type);
        $this->assertSame($this->questionAt($uuid, 1)->item_key, $evidence->item_key, 'l\'item du registre, pas un item inventé');
        $this->assertSame('server', $evidence->evaluated_by);
    }

    public function test_a_client_cannot_send_its_own_score_time_or_correctness(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next");
        Carbon::setTestNow(now()->addSeconds(40));
        $q = $this->questionAt($uuid, 1);
        $r = $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", [
            'position' => 1, 'answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id),
            'isCorrect' => true, 'score' => 999, 'responseTimeMs' => 1, 'outcome' => 'correct',
        ])->assertCreated();
        $r->assertJsonPath('answer.outcome', 'incorrect')->assertJsonPath('answer.score.total', 0)->assertJsonPath('answer.responseTimeMs', 40000);
    }

    public function test_duplicate_submission_is_idempotent_and_answers_cannot_change(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $this->answerRight($uuid, 1)->assertCreated();
        $q = $this->questionAt($uuid, 1);
        $right = $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id);

        $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", ['position' => 1, 'answer' => $right])
            ->assertOk()->assertJsonPath('duplicate', true);
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", ['position' => 1, 'answer' => $this->wrongAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])
            ->assertStatus(409)->assertJsonPath('reason', 'already_answered');
        $this->assertSame(1, LearningEvidence::where('source_id', 'like', 'daily_challenge:%')->count(), 'un rejeu n\'écrit pas une seconde preuve');
    }

    public function test_questions_are_served_in_order_and_cannot_be_peeked(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", ['position' => 2, 'answer' => ['choiceId' => 'A']])
            ->assertStatus(422)->assertJsonPath('reason', 'not_opened');
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next")->assertJsonPath('question.position', 1);
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next")->assertJsonPath('question.position', 1);
    }

    public function test_an_expired_attempt_refuses_answers_and_closes(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $this->answerRight($uuid, 1)->assertCreated();
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next");
        Carbon::setTestNow(now()->addMinutes(31));
        $q = $this->questionAt($uuid, 2);

        $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", ['position' => 2, 'answer' => $this->rightAnswer($q->lesson->code, $q->exercise_code, $q->question_id)])
            ->assertStatus(409)->assertJsonPath('reason', 'expired');
        $attempt = DailyChallengeAttempt::first();
        $this->assertSame('expired', $attempt->status);
        $this->assertSame(1, $attempt->correct_count);
        $this->assertSame(1, $attempt->streak_after, 'une réponse donnée suffit à compter la journée');
    }

    public function test_completing_the_challenge_scores_streak_history_and_review(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        for ($p = 1; $p <= 5; $p++) {
            $last = $this->answerRight($uuid, $p, 8);
        }
        $last->assertJsonPath('attempt.status', 'completed')->assertJsonPath('attempt.correctCount', 5)
            ->assertJsonPath('attempt.streakAfter', 1)->assertJsonPath('attempt.score.streak', 10)
            ->assertJsonPath('completion.streak.current', 1);
        $total = $last->json('attempt.score.total');
        $this->assertSame(500 + $last->json('attempt.score.speed') + 10, $total);
        $this->assertSame($total, (int) DailyChallengeStanding::first()->cumulative_score);

        // Pas de rejeu pour des points.
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/next")->assertStatus(409);
        $this->api('POST', '/daily-challenge/start')->assertOk()->assertJsonPath('attempt.status', 'completed');

        $review = $this->api('GET', "/daily-challenge/attempts/{$uuid}/review")->assertOk();
        $this->assertCount(5, $review->json('questions'));
        $this->assertTrue($review->json('questions.0.isCorrect'));
        $this->assertNotNull($review->json('questions.0.learningPoint.code'));

        $history = $this->api('GET', '/daily-challenge/history')->assertOk();
        $this->assertSame('completed', $history->json('days.0.status'));
        $this->assertSame($total, $history->json('cumulativeScore'));
    }

    public function test_one_correct_challenge_answer_never_masters_a_point_by_itself(): void
    {
        $fresh = $this->student();
        $this->token = $this->tokenOf($fresh);
        $lesson = $this->dcLessons['qasim-adad-tabii'];
        $this->answer($fresh, $lesson, $this->dcPoints['4am_qasim-adad-tabii_P1'], 'incorrect', 1);

        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $this->answerRight($uuid, 1)->assertCreated();

        $state = StudentLearningPointProgress::where('user_id', $fresh->id)->get();
        $this->assertTrue($state->every(fn ($s) => $s->status !== MasteryState::STATUS_MASTERED), 'le seuil de maîtrise reste celui du moteur');
    }

    public function test_a_missed_day_breaks_the_streak_and_costs_a_bounded_penalty(): void
    {
        // Mardi 22 : 5/5.
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        for ($p = 1; $p <= 5; $p++) {
            $this->answerRight($uuid, $p);
        }
        $day1 = (int) DailyChallengeStanding::first()->cumulative_score;

        // Mercredi 23 manqué ; jeudi 24.
        $this->onChallengeDay('2026-09-24');
        $today = $this->api('GET', '/daily-challenge')->assertOk();
        $this->assertSame($day1 - 15, $today->json('cumulativeScore'), 'la pénalité se voit le jour même');
        $this->assertSame(0, $today->json('streak.current'));
        $this->assertSame('missed', collect($today->json('streak.days'))->firstWhere('date', '2026-09-23')['state']);

        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $last = null;
        for ($p = 1; $p <= 5; $p++) {
            $last = $this->answerRight($uuid, $p);
        }
        $last->assertJsonPath('attempt.streakBefore', 0)->assertJsonPath('attempt.streakAfter', 1)->assertJsonPath('attempt.score.penalty', 15);
        $this->assertSame($day1 - 15 + $last->json('attempt.score.total'), (int) DailyChallengeStanding::first()->cumulative_score);

        // Vendredi 25 (chômé) puis samedi 26 : la série traverse le vendredi.
        $this->onChallengeDay('2026-09-26');
        $this->api('GET', '/daily-challenge')->assertJsonPath('streak.current', 1);
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        for ($p = 1; $p <= 5; $p++) {
            $last = $this->answerRight($uuid, $p);
        }
        $last->assertJsonPath('attempt.streakAfter', 2)->assertJsonPath('attempt.score.penalty', 0);
    }

    public function test_a_rest_day_and_a_closed_window_refuse_to_start(): void
    {
        $this->onChallengeDay('2026-09-25');
        $this->api('GET', '/daily-challenge')->assertOk()->assertJsonPath('available', false)->assertJsonPath('reason', 'rest_day');
        $this->api('POST', '/daily-challenge/start')->assertStatus(422)->assertJsonPath('reason', 'rest_day');

        $this->onChallengeDay('2026-09-22', '04:30:00');
        $this->api('GET', '/daily-challenge')->assertJsonPath('reason', 'window_closed');
        $this->api('POST', '/daily-challenge/start')->assertStatus(422)->assertJsonPath('reason', 'window_closed');
    }

    public function test_a_student_with_nothing_learned_warms_up_on_the_first_lessons(): void
    {
        $new = $this->student();
        $this->token = $this->tokenOf($new);
        $r = $this->api('GET', '/daily-challenge')->assertOk();
        $this->assertTrue($r->json('available'));
        $this->assertSame(['warmup'], DailyChallengeQuestion::whereHas('challenge', fn ($q) => $q->where('scope_id', $new->id))->pluck('reason')->unique()->values()->all());
    }

    public function test_another_students_attempt_is_invisible(): void
    {
        $uuid = $this->api('POST', '/daily-challenge/start')->json('attempt.id');
        $other = $this->student();
        $this->token = $this->tokenOf($other);
        $this->api('GET', "/daily-challenge/attempts/{$uuid}")->assertNotFound();
        $this->api('POST', "/daily-challenge/attempts/{$uuid}/answers", ['position' => 1, 'answer' => ['choiceId' => 'A']])->assertNotFound();
        $this->api('GET', "/daily-challenge/attempts/{$uuid}/review")->assertNotFound();
    }

    public function test_teachers_and_guests_cannot_play(): void
    {
        $this->token = $this->tokenOf($this->teacher());
        $this->api('GET', '/daily-challenge')->assertForbidden();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/daily-challenge')->assertUnauthorized();
    }
}
