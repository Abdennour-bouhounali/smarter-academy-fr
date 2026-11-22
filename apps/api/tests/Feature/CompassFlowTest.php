<?php

namespace Tests\Feature;

use App\Domain\Practice\ExerciseRepository;
use App\Models\Chapter;
use App\Models\CompassAnswer;
use App\Models\CompassItemState;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * « بوصلتي » (P1) — la jauge de départ côté serveur. Contrat : docs/architecture/YEAR_COMPASS.md.
 * Verrouille : 4AM seulement, questions SANS clé, correction serveur, bandes recalculées par le
 * serveur, jamais de preuve de maîtrise, une jauge complète tous les 7 jours, une session à soi.
 */
class CompassFlowTest extends TestCase
{
    use RefreshDatabase;

    private const ITEM = '4am.m1.r06'; // الجذر التربيعي — banque niveaux 1 et 2

    protected function setUp(): void
    {
        parent::setUp();
        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen', 'order' => 0]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'jidhr-tarbii', 'title' => 'الجذر التربيعي', 'status' => 'available',
            'duration_minutes' => 45, 'tier' => 'free', 'order' => 0]);
    }

    private function student(string $grade = '4am'): array
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => $grade]);

        return [$user, $user->createToken('t')->plainTextToken];
    }

    private function api(string $token)
    {
        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    private function start(string $token)
    {
        return $this->api($token)->postJson('/api/v1/compass/sessions', [
            'targets' => [self::ITEM], 'pointerLesson' => 'jidhr-tarbii', 'pointerSource' => 'student', 'schoolYear' => '2026/2027',
        ]);
    }

    /** La bonne réponse, lue dans le contenu (le test a le droit, le client jamais). */
    private function correctAnswerFor(array $pending): array
    {
        $row = CompassAnswer::findOrFail($pending['id']);
        $q = app(ExerciseRepository::class)->findQuestion($row->lesson_code, $row->exercise_id, $row->question_id);
        if ($q['answerType'] === 'choice') {
            foreach ($q['choices'] as $c) {
                if (! empty($c['isCorrect'])) {
                    return ['choiceId' => $c['id']];
                }
            }
        }

        return ['value' => (string) $q['expectedAnswer']];
    }

    private function ask(string $token, string $uuid, int $level): array
    {
        return $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/questions", ['itemId' => self::ITEM, 'level' => $level])
            ->assertOk()->json('question');
    }

    private function bandOf($response): ?string
    {
        return $response->json('result.bands')[self::ITEM] ?? null;
    }

    public function test_only_4am_students_can_start(): void
    {
        [, $token] = $this->student('3am');
        $this->api($token)->getJson('/api/v1/compass')->assertOk()->assertJsonPath('compass.enabled', false);
        $this->start($token)->assertStatus(403)->assertJsonPath('code', 'compass_grade_unavailable');
    }

    public function test_a_full_check_is_served_without_key_graded_on_the_server_and_banded(): void
    {
        [$user, $token] = $this->student();
        $state = $this->api($token)->getJson('/api/v1/compass')->assertOk()->json('compass');
        $this->assertTrue($state['enabled']);
        $this->assertSame([1, 2], $state['availability'][self::ITEM]);

        $uuid = $this->start($token)->assertOk()->json('compass.active.uuid');
        $this->assertNotNull($uuid);

        $q1 = $this->ask($token, $uuid, 1);
        $json = json_encode($q1);
        foreach (['expectedAnswer', 'isCorrect', 'misconceptionSignatures', 'solution', 'hints', 'feedback'] as $secret) {
            $this->assertStringNotContainsString($secret, $json, "la question publique ne doit pas contenir « $secret »");
        }
        // redemander rend la MÊME question tant qu'elle attend sa réponse (pas de relance)
        $this->assertSame($q1['id'], $this->ask($token, $uuid, 2)['id']);

        $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/answers", ['answerId' => $q1['id'], 'answer' => $this->correctAnswerFor($q1)])
            ->assertOk()->assertJsonPath('result.correct', true)->assertJsonMissingPath('result.correctAnswer');
        // une réponse déjà donnée ne se rejoue pas
        $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/answers", ['answerId' => $q1['id'], 'answer' => ['value' => '0']])
            ->assertStatus(409);

        $q2 = $this->ask($token, $uuid, 2);
        $this->assertNotSame($q1['id'], $q2['id']);
        $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/answers", ['answerId' => $q2['id'], 'answer' => $this->correctAnswerFor($q2)])
            ->assertOk()->assertJsonPath('result.correct', true);

        $this->assertSame('solid', $this->bandOf($this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/finish")->assertOk()));
        $this->assertSame('solid', CompassItemState::where('user_id', $user->id)->where('item_id', self::ITEM)->value('band'));

        // jamais une preuve de maîtrise
        $this->assertSame(0, DB::table('learning_evidence')->count());

        // une jauge complète au plus tous les 7 jours
        $this->start($token)->assertStatus(409)->assertJsonPath('code', 'compass_retake_too_early');
        $this->travel(8)->days();
        $this->start($token)->assertOk();
    }

    public function test_a_wrong_or_unsure_answer_is_never_correct_and_reveals_nothing(): void
    {
        [, $token] = $this->student();
        $uuid = $this->start($token)->json('compass.active.uuid');
        $q = $this->ask($token, $uuid, 1);
        $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/answers", ['answerId' => $q['id'], 'answer' => $this->correctAnswerFor($q), 'unsure' => true])
            ->assertOk()->assertJsonPath('result.correct', false)->assertJsonPath('result.unsure', true);
        $q2 = $this->ask($token, $uuid, 1);
        $this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/answers", ['answerId' => $q2['id'], 'answer' => null])
            ->assertOk()->assertJsonPath('result.correct', false);
        $this->assertSame('start', $this->bandOf($this->api($token)->postJson("/api/v1/compass/sessions/{$uuid}/finish")->assertOk()));
    }

    public function test_a_session_belongs_to_its_student(): void
    {
        [, $token] = $this->student();
        [, $other] = $this->student();
        $uuid = $this->start($token)->json('compass.active.uuid');
        $this->app['auth']->forgetGuards(); // Sanctum garde sinon le premier élève
        $this->api($other)->postJson("/api/v1/compass/sessions/{$uuid}/questions", ['itemId' => self::ITEM, 'level' => 1])
            ->assertStatus(404);
    }

    public function test_the_pointer_is_saved_and_checked(): void
    {
        [, $token] = $this->student();
        $this->api($token)->putJson('/api/v1/compass/pointer', ['mode' => 'lesson', 'lesson' => 'jidhr-tarbii'])
            ->assertOk()->assertJsonPath('compass.profile.lesson', 'jidhr-tarbii');
        $this->api($token)->putJson('/api/v1/compass/pointer', ['mode' => 'lesson', 'lesson' => 'nope'])
            ->assertStatus(422)->assertJsonPath('code', 'compass_unknown_lesson');
        $this->api($token)->putJson('/api/v1/compass/pointer', ['mode' => 'not_following'])
            ->assertOk()->assertJsonPath('compass.profile.mode', 'not_following')->assertJsonPath('compass.profile.lesson', null);
    }
}
