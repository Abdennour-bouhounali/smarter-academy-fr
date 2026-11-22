<?php

namespace Tests\Feature;

use App\Models\ThinkingLabAttempt;
use App\Models\ThinkingLabProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\Support\ThinkingLabFixtures;
use Tests\TestCase;

/**
 * « معاينة الأستاذ » (THINKING_LAB.md §8bis) : un enseignant lit tout, teste une réponse, et
 * n'écrit RIEN. Un élève n'entre pas dans ces routes.
 */
class TeacherThinkingLabTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;
    use ThinkingLabFixtures;

    protected function setUp(): void
    {
        parent::setUp();
        $this->useThinkingLabFixture();
    }

    private function asTeacher(string $method, string $uri, array $body = [])
    {
        return $this->withToken($this->tokenOf($this->teacher()))->json($method, "/api/v1/teacher/thinking-lab{$uri}", $body);
    }

    public function test_the_teacher_sees_the_whole_ladder_without_any_lock(): void
    {
        $list = $this->asTeacher('GET', '/challenges')->assertOk()->json('challenges');
        $this->assertSame([5, 150, 318, 333], array_column($list, 'number'));
        $this->assertSame('primary', $list[0]['band']);
    }

    public function test_the_teacher_reads_the_answer_keys_and_replay_before_any_attempt(): void
    {
        $c = $this->asTeacher('GET', '/challenges/tl-first')->assertOk()->json('challenge');
        $this->assertSame('4096', $c['answer']['value']);
        $this->assertSame('8192', $c['ceiling']['answer']['value']);
        $this->assertSame('SECRET-KEY-3-TL_FIRST', $c['keys'][2]['text']);
        $this->assertSame('SECRET-REPLAY-1-TL_FIRST', $c['replay'][0]['think']);
        $this->assertSame('2048', $c['mistakes'][0]['value']);
        $this->assertSame('tl-twin', $c['twin']['id']);

        $real = $this->asTeacher('GET', '/challenges/four-arcs-area')->assertOk()->json('challenge');
        $this->assertSame('x^2*(1+pi/3-sqrt(3))', $real['answer']['value']);
        $this->assertCount(3, $real['mistakes']);
    }

    public function test_the_teacher_can_walk_through_the_students_numbers(): void
    {
        $c = $this->asTeacher('GET', '/challenges/tl-first')->json('challenge');
        $this->assertSame(1, $c['tuple']['count']);
        $this->assertSame(404, $this->asTeacher('GET', '/challenges/nope')->status());
    }

    public function test_checking_an_answer_uses_the_students_judge_and_writes_nothing(): void
    {
        $this->asTeacher('POST', '/challenges/four-arcs-area/check', ['answer' => '(3+π−3√3)x²/3'])->assertOk()->assertJsonPath('correct', true);
        $this->asTeacher('POST', '/challenges/four-arcs-area/check', ['answer' => 'x^2(1-pi/4)'])->assertOk()
            ->assertJsonPath('correct', false)->assertJsonPath('reply', 'هذه مساحة ركن واحد خارج ربع الدائرة، لا المنطقة التي في الوسط.');
        $this->asTeacher('POST', '/challenges/tl-first/check', ['answer' => '8192', 'kind' => 'ceiling'])->assertOk()->assertJsonPath('correct', true);
        $this->asTeacher('POST', '/challenges/tl-first/check', ['answer' => '12', 'kind' => 'part', 'index' => 0])->assertOk()->assertJsonPath('correct', true);
        $this->asTeacher('POST', '/challenges/tl-first/check', ['answer' => 'abc'])->assertOk()->assertJsonPath('outcome', 'syntax_error');

        $this->assertSame(0, ThinkingLabProgress::count(), 'aucune progression écrite');
        $this->assertSame(0, ThinkingLabAttempt::count(), 'aucune tentative écrite');
    }

    public function test_a_student_cannot_enter_the_teacher_preview(): void
    {
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->json('GET', '/api/v1/teacher/thinking-lab/challenges')->assertForbidden();
        $this->withToken($this->tokenOf($student))->json('GET', '/api/v1/teacher/thinking-lab/challenges/tl-first')->assertForbidden();
    }

    public function test_a_teacher_still_cannot_use_the_students_ladder(): void
    {
        $this->withToken($this->tokenOf($this->teacher()))->json('GET', '/api/v1/thinking-lab')->assertForbidden();
    }
}
