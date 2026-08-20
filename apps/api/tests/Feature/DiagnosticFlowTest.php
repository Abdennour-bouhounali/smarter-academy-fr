<?php

namespace Tests\Feature;

use App\Domain\Diagnostic\Grades\SixiemeDiagnosticProvider;
use App\Models\DiagnosticResponse;
use App\Models\DiagnosticSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class DiagnosticFlowTest extends TestCase
{
    use RefreshDatabase;

    private function studentToken(array $attributes = []): array
    {
        $user = User::factory()->create(array_merge(['role' => 'student', 'grade' => '6e'], $attributes));
        $token = $user->createToken('student-token')->plainTextToken;

        return [$user, $token];
    }

    public function test_a_student_can_start_a_diagnostic_and_receives_a_first_question(): void
    {
        [, $token] = $this->studentToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('session.status', 'in_progress')
            ->assertJsonPath('session.grade', '6e')
            ->assertJsonStructure(['session' => ['id'], 'question' => ['id', 'representation', 'prompt']]);

        $this->assertDatabaseHas('diagnostic_sessions', ['user_id' => $this->currentUserId($token), 'grade' => '6e', 'status' => 'in_progress']);
    }

    public function test_an_almost_instant_answer_never_produces_a_negative_response_time(): void
    {
        // Regression: computing elapsed time via Carbon's diffInMilliseconds()
        // could return a small negative float for a near-instant answer
        // (sub-second column precision vs. the live clock), which then
        // failed to insert into an unsignedInteger column — only ever
        // observed against real MySQL, not the SQLite this test runs on,
        // which is exactly why this asserts the invariant explicitly rather
        // than relying on reproducing the original failure.
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');
        $answer = $this->correctAnswerFor($questions[$question['id']]);

        $response = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", ['questionId' => $question['id'], 'answer' => $answer]);

        $response->assertStatus(200);
        $stored = DiagnosticResponse::where('session_id', $sessionId)->first();
        $this->assertNotNull($stored->response_time_ms);
        $this->assertGreaterThanOrEqual(0, $stored->response_time_ms);
    }

    public function test_starting_twice_resumes_the_same_session_instead_of_creating_a_second_one(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");

        $first = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $second = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);

        $this->assertSame($first->json('session.id'), $second->json('session.id'));
        $this->assertSame($first->json('question.id'), $second->json('question.id'));
        $this->assertDatabaseCount('diagnostic_sessions', 1);
    }

    public function test_diagnostic_is_rejected_for_a_grade_with_no_provider_yet(): void
    {
        [, $token] = $this->studentToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/diagnostic/sessions', ['grade' => '5e']);

        $response->assertStatus(422)->assertJsonValidationErrors('grade');
    }

    public function test_an_unauthenticated_visitor_cannot_start_a_diagnostic(): void
    {
        $response = $this->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);

        $response->assertStatus(401);
    }

    public function test_a_student_cannot_submit_a_response_to_another_students_session(): void
    {
        // Seeded directly rather than via a real HTTP request as the owner:
        // Sanctum's RequestGuard caches the resolved user for the guard
        // instance's lifetime, and Laravel's test client reuses one
        // application/guard instance across calls within a method (see the
        // identical caveat documented in AuthenticationFlowTest's logout
        // test) — so authenticating as two different users in one test
        // method would pass for the wrong reason even if scoping were broken.
        $owner = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $session = DiagnosticSession::create([
            'user_id' => $owner->id,
            'grade' => '6e',
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        [, $intruderToken] = $this->studentToken(['email' => 'intruder@example.com']);

        $response = $this->withHeader('Authorization', "Bearer {$intruderToken}")
            ->postJson("/api/v1/diagnostic/sessions/{$session->id}/responses", [
                'questionId' => 'anything',
                'answer' => ['value' => 1],
            ]);

        $response->assertStatus(404);
    }

    public function test_the_current_endpoint_returns_null_when_no_session_exists_yet(): void
    {
        [, $token] = $this->studentToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/diagnostic/sessions/current?grade=6e');

        $response->assertStatus(200)->assertJsonPath('session', null);
    }

    public function test_the_current_endpoint_repeatedly_returns_the_same_pending_question(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");

        $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $first = $auth->getJson('/api/v1/diagnostic/sessions/current?grade=6e');
        $second = $auth->getJson('/api/v1/diagnostic/sessions/current?grade=6e');

        $this->assertSame($first->json('question.id'), $second->json('question.id'));
    }

    public function test_submitting_a_stale_question_id_is_rejected(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');

        $response = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", [
            'questionId' => 'not-the-current-question',
            'answer' => ['value' => 1],
        ]);

        $response->assertStatus(409);
    }

    public function test_resubmitting_the_same_response_is_idempotent_and_does_not_double_count_evidence(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');
        $answer = $this->correctAnswerFor($questions[$question['id']]);

        $first = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", ['questionId' => $question['id'], 'answer' => $answer]);
        $replay = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", ['questionId' => $question['id'], 'answer' => $answer]);

        $first->assertStatus(200);
        $replay->assertStatus(200);
        $this->assertSame($first->json('isCorrect'), $replay->json('isCorrect'));
        $this->assertSame($first->json('nextQuestion.id'), $replay->json('nextQuestion.id'));
        $this->assertDatabaseCount('diagnostic_responses', 1);

        $skillId = $questions[$question['id']]['skillId'];
        $this->assertDatabaseHas('diagnostic_skill_assessments', ['session_id' => $sessionId, 'skill_id' => $skillId, 'attempts' => 1]);
    }

    public function test_a_consistently_correct_student_completes_with_a_rich_mastered_profile_and_no_gaps(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');

        [$questionCount, $profile] = $this->driveToCompletion($auth, $sessionId, $question, $questions, alwaysCorrect: true);

        $this->assertNotNull($profile, 'Diagnostic did not complete within a safe iteration bound.');
        // A real regression guard, not just "under the hard ceiling": a
        // consistently-correct student must finish meaningfully faster than
        // the 24-question max (§5/§31 Student A — "few questions"). Without
        // the confidence-cascade boost actually reaching every tier, this
        // used to hit all 24; with it, a full run of the real 6e content
        // resolves all 13 skills in 15.
        $this->assertLessThanOrEqual(18, $questionCount);
        $this->assertSame(13, count($profile['strengths']), 'Every skill should resolve as mastered for an all-correct run.');
        $this->assertCount(0, $profile['gaps']);
        $this->assertCount(0, $profile['reinforce']);
        $this->assertDatabaseHas('diagnostic_sessions', ['id' => $sessionId, 'status' => 'completed']);

        $session = DiagnosticSession::find($sessionId);
        $this->assertNotNull($session->completed_at);
        $this->assertNotNull($session->profile_summary);
    }

    public function test_a_consistently_incorrect_student_completes_a_much_shorter_diagnostic_dominated_by_gaps(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');

        [$questionCount, $profile] = $this->driveToCompletion($auth, $sessionId, $question, $questions, alwaysCorrect: false);

        $this->assertNotNull($profile);
        $this->assertGreaterThan(0, count($profile['gaps']));
        $this->assertCount(0, $profile['strengths']);
        $this->assertNotNull($profile['recommendation']['skillId']);

        // The whole point of inferred-skip: a foundationally-struggling
        // student's diagnostic must not run anywhere near the full 13-skill,
        // ~50-question bank — most skills are skipped, not tested.
        $this->assertLessThan(16, $questionCount);
    }

    public function test_a_completed_diagnostic_rejects_further_responses(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');

        $this->driveToCompletion($auth, $sessionId, $question, $questions, alwaysCorrect: false);

        $response = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", [
            'questionId' => 'anything',
            'answer' => ['value' => 1],
        ]);

        $response->assertStatus(409);
    }

    public function test_starting_again_after_completion_begins_a_fresh_session(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");
        $questions = (new SixiemeDiagnosticProvider)->questions();

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $firstSessionId = $start->json('session.id');
        $question = $start->json('question');
        $this->driveToCompletion($auth, $firstSessionId, $question, $questions, alwaysCorrect: false);

        $restart = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);

        $this->assertNotSame($firstSessionId, $restart->json('session.id'));
        $this->assertSame('in_progress', $restart->json('session.status'));
    }

    public function test_a_correct_answer_choosing_a_known_distractor_is_recorded_without_leaking_the_misconception_to_the_client(): void
    {
        [, $token] = $this->studentToken();
        $auth = $this->withHeader('Authorization', "Bearer {$token}");

        $start = $auth->postJson('/api/v1/diagnostic/sessions', ['grade' => '6e']);
        $sessionId = $start->json('session.id');
        $question = $start->json('question');

        $response = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", [
            'questionId' => $question['id'],
            'answer' => ['value' => -999999], // clearly wrong for any numeric/choice question in the bank
        ]);

        $response->assertStatus(200)->assertJsonMissingPath('misconceptionId');
        $this->assertArrayNotHasKey('misconceptionId', $response->json());
    }

    /**
     * @return array{0: int, 1: ?array} [totalQuestionsAsked, finalProfile]
     */
    private function driveToCompletion($auth, int $sessionId, array $question, array $questions, bool $alwaysCorrect): array
    {
        $count = 0;
        $profile = null;

        while ($count < 30) {
            $count++;
            $definition = $questions[$question['id']];
            $answer = $alwaysCorrect
                ? $this->correctAnswerFor($definition)
                : $this->incorrectAnswerFor($definition);

            $response = $auth->postJson("/api/v1/diagnostic/sessions/{$sessionId}/responses", [
                'questionId' => $question['id'],
                'answer' => $answer,
            ]);
            $response->assertStatus(200);

            if ($response->json('completed')) {
                $profile = $response->json('profile');
                break;
            }

            $question = $response->json('nextQuestion');
        }

        return [$count, $profile];
    }

    private function correctAnswerFor(array $question): array
    {
        return match ($question['representation']) {
            'choice' => ['choiceId' => $question['correct']['choiceId']],
            'numeric', 'numberline' => ['value' => $question['correct']['value']],
            'fraction' => ['numerator' => $question['correct']['numerator'], 'denominator' => $question['correct']['denominator']],
            'ordering' => ['sequence' => $question['correct']['sequence']],
            'classification' => ['assignments' => $question['correct']['assignments']],
        };
    }

    private function incorrectAnswerFor(array $question): array
    {
        return match ($question['representation']) {
            'choice' => ['choiceId' => collect($question['choices'])->firstWhere('id', '!=', $question['correct']['choiceId'])['id']],
            'numeric', 'numberline' => ['value' => $question['correct']['value'] + 100000],
            'fraction' => ['numerator' => $question['correct']['numerator'] + 97, 'denominator' => $question['correct']['denominator'] + 1],
            'ordering' => ['sequence' => array_reverse($question['correct']['sequence'])],
            'classification' => ['assignments' => array_map(
                fn ($v) => $v === 'useful' ? 'not_useful' : 'useful',
                $question['correct']['assignments']
            )],
        };
    }

    private function currentUserId(string $token): int
    {
        $accessToken = PersonalAccessToken::findToken($token);

        return $accessToken->tokenable_id;
    }
}
