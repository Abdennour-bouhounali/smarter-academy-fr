<?php

namespace Tests\Feature;

use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Models\FeatureAccessPolicy;
use App\Models\ThinkingLabProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;
use Tests\Support\CommercialFixtures;
use Tests\Support\ThinkingLabFixtures;
use Tests\TestCase;

/**
 * « مختبر التفكير » — la porte, de bout en bout (THINKING_LAB.md §6).
 *
 * Acceptation de la phase 1 (plan §18) : un élève fait 1 → 2 → 3 tentatives sur #318, la
 * relecture reste fermée, puis s'ouvre 24 h après la première tentative (le temps est
 * VOYAGÉ, jamais attendu). Puis les règles de la tentative honnête, les clés, l'échelle
 * (places ouvertes, reporter), la tranche primaire sans attente, le jumeau, le plafond, l'accès.
 */
class ThinkingLabFlowTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;
    use ThinkingLabFixtures;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-02 09:00:00');
        $this->useThinkingLabFixture();
        $this->student = $this->student();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(User $user, string $method, string $uri, array $body = []): TestResponse
    {
        return $this->withToken($this->tokenOf($user))->json($method, "/api/v1/thinking-lab{$uri}", $body);
    }

    private function attempt(string $id, string $answer, ?string $draft = null, ?User $user = null): TestResponse
    {
        return $this->as($user ?? $this->student, 'POST', "/challenges/{$id}/attempts", ['answer' => $answer, 'draft' => $draft]);
    }

    private function later(int $minutes): void
    {
        Carbon::setTestNow(now()->addMinutes($minutes));
    }

    /** Débloque #318 sur l'échelle : une tentative honnête sur chacun des numéros précédents. */
    private function reach318(?User $user = null): void
    {
        $this->attempt('tl-first', '1', null, $user)->assertOk();
        $this->attempt('tl-second', '1', null, $user)->assertOk();
    }

    public function test_acceptance_three_attempts_then_one_day_then_the_replay(): void
    {
        $this->reach318();
        $this->as($this->student, 'GET', '/challenges/four-arcs-area/replay')->assertStatus(403)->assertJsonPath('reason', 'gate_closed');

        $r = $this->attempt('four-arcs-area', 'x^2(1-pi/4)')->assertOk();
        $r->assertJsonPath('attempt.counted', true)->assertJsonPath('attempt.correct', false)
            ->assertJsonPath('attempt.reply.kind', 'mistake')
            ->assertJsonPath('challenge.state.attemptsCounted', 1)
            ->assertJsonPath('challenge.state.keysUnlocked', 1);
        $this->later(3);
        $this->attempt('four-arcs-area', '(π/2−1)x²', 'جرّبت مساحة العدسة بدل الركن')->assertJsonPath('challenge.state.attemptsCounted', 2);
        $this->later(3);
        $r = $this->attempt('four-arcs-area', 'x²/3', 'ثلث المربّع تقريبًا حسب الرسم');
        $r->assertJsonPath('challenge.state.attemptsCounted', 3)
            ->assertJsonPath('challenge.state.canReplay', false)
            ->assertJsonPath('challenge.state.unlockAt', '2026-11-03T09:00:00+00:00');

        $this->as($this->student, 'GET', '/challenges/four-arcs-area/replay')->assertStatus(403);
        Carbon::setTestNow('2026-11-03 08:59:59');
        $this->as($this->student, 'GET', '/challenges/four-arcs-area/replay')->assertStatus(403);

        Carbon::setTestNow('2026-11-03 09:00:00');
        $replay = $this->as($this->student, 'GET', '/challenges/four-arcs-area/replay')->assertOk();
        $replay->assertJsonPath('replay.outcome', 'learned')->assertJsonPath('replay.solvedAlone', false);
        $this->assertGreaterThanOrEqual(6, count($replay->json('replay.replay')));
        $this->assertSame('learned', ThinkingLabProgress::where('challenge_id', 'four-arcs-area')->value('state'));

        // Porte franchie : plus de tentative ni de clé.
        $this->attempt('four-arcs-area', 'x^2*(1+pi/3-sqrt(3))')->assertStatus(409)->assertJsonPath('reason', 'closed');
    }

    public function test_a_correct_answer_solves_alone_in_any_equivalent_writing(): void
    {
        $this->reach318();
        $this->attempt('four-arcs-area', '(3+π−3√3)x²/3')->assertOk()
            ->assertJsonPath('attempt.correct', true)
            ->assertJsonPath('attempt.outcome', 'equivalent_correct')
            ->assertJsonPath('challenge.state.status', 'solved')
            ->assertJsonPath('challenge.state.outcome', 'alone')
            ->assertJsonPath('challenge.state.canReplay', true);
        $this->as($this->student, 'GET', '/challenges/four-arcs-area/replay')->assertOk()->assertJsonPath('replay.solvedAlone', true);
    }

    public function test_honest_attempt_rules(): void
    {
        $this->attempt('tl-first', '2048')->assertJsonPath('attempt.counted', true)->assertJsonPath('attempt.reply.kind', 'mistake');

        // illisible : jamais compté, jamais une erreur
        $this->attempt('tl-first', 'abc')->assertJsonPath('attempt.counted', false)->assertJsonPath('attempt.reason', 'syntax')->assertJsonPath('attempt.reply', null);
        // trop tôt (moins de 120 s)
        $this->later(1);
        $this->attempt('tl-first', '17', 'شيء آخر جرّبته هنا')->assertJsonPath('attempt.reason', 'too_soon');
        // la même réponse, même écrite autrement
        $this->later(5);
        $this->attempt('tl-first', '4096/2', 'نفس الجواب بكتابة أخرى')->assertJsonPath('attempt.reason', 'repeat');
        // sans phrase dans le brouillon (dès la 2ᵉ)
        $this->attempt('tl-first', '17', 'لا')->assertJsonPath('attempt.reason', 'no_draft');
        $this->attempt('tl-first', '17', 'جمعت بدل أن أضرب هذه المرّة')->assertJsonPath('attempt.counted', true)
            ->assertJsonPath('challenge.state.attemptsCounted', 2);

        // Une réponse juste n'attend jamais.
        $this->attempt('tl-first', '4096')->assertJsonPath('attempt.correct', true)->assertJsonPath('challenge.state.outcome', 'alone');
    }

    public function test_a_repeated_expression_is_recognised_by_equivalence(): void
    {
        $this->reach318();
        $this->attempt('four-arcs-area', 'x^2/2')->assertJsonPath('attempt.counted', true);
        $this->later(3);
        $this->attempt('four-arcs-area', '0.5x²', 'كتبتها بالعشري')->assertJsonPath('attempt.reason', 'repeat');
    }

    public function test_keys_open_one_per_counted_attempt_and_in_order(): void
    {
        $this->reach318();
        $this->as($this->student, 'POST', '/challenges/four-arcs-area/keys/1')->assertStatus(403)->assertJsonPath('reason', 'key_locked');
        $this->attempt('four-arcs-area', 'x^2/2');
        $this->as($this->student, 'POST', '/challenges/four-arcs-area/keys/2')->assertStatus(403);
        $r = $this->as($this->student, 'POST', '/challenges/four-arcs-area/keys/1')->assertOk();
        $r->assertJsonPath('challenge.keys.0.state', 'open')->assertJsonPath('challenge.keys.1.state', 'locked')->assertJsonPath('challenge.keys.1.text', null);
        $this->assertNotNull($r->json('challenge.keys.0.text'));

        // Résolu après une clé : issue « keys ».
        $this->attempt('four-arcs-area', 'x^2*(1+pi/3-sqrt(3))')->assertJsonPath('challenge.state.outcome', 'keys');
    }

    public function test_the_ladder_opens_the_next_number_after_one_honest_attempt(): void
    {
        $home = $this->as($this->student, 'GET', '')->assertOk();
        $this->assertSame(['open', 'locked', 'locked', 'locked'], array_column($home->json('trail'), 'status'));
        $this->as($this->student, 'GET', '/challenges/tl-second')->assertStatus(403)->assertJsonPath('reason', 'locked');
        $this->attempt('tl-second', '1')->assertStatus(403);

        $this->attempt('tl-first', 'abc'); // illisible : ne fait pas avancer
        $this->assertSame('locked', $this->as($this->student, 'GET', '')->json('trail.1.status'));
        $this->attempt('tl-first', '1');
        $home = $this->as($this->student, 'GET', '');
        $this->assertSame(['trying', 'open', 'locked', 'locked'], array_column($home->json('trail'), 'status'));
        $home->assertJsonPath('next.id', 'tl-second');
        $this->as($this->student, 'GET', '/n/150')->assertOk()->assertJsonPath('id', 'tl-second');
        $this->as($this->student, 'GET', '/n/999')->assertNotFound();
    }

    public function test_open_places_are_limited_and_postpone_frees_one(): void
    {
        config(['thinking_lab.max_open' => 2]);
        $this->reach318();
        $this->attempt('four-arcs-area', 'x^2')->assertStatus(409)->assertJsonPath('reason', 'too_many_open')->assertJsonPath('maxOpen', 2);
        $this->as($this->student, 'POST', '/challenges/tl-first/postpone')->assertOk();
        $this->attempt('four-arcs-area', 'x^2/2')->assertOk();
        $this->assertSame('postponed', collect($this->as($this->student, 'GET', '')->json('open'))->firstWhere('id', 'tl-first')['state']['status']);
        // Reprendre un défi reporté demande une place libre.
        $this->attempt('tl-first', '7', 'محاولة جديدة بعد التأجيل')->assertStatus(409);
    }

    public function test_the_primary_band_opens_the_replay_after_three_attempts_without_waiting(): void
    {
        $this->attempt('tl-first', '1');
        $this->later(3);
        $this->attempt('tl-first', '2', 'جرّبت عددًا آخر هذه المرّة');
        $this->later(3);
        $this->attempt('tl-first', '3', 'وجرّبت عددًا ثالثًا أيضًا')->assertJsonPath('challenge.state.canReplay', true)->assertJsonPath('challenge.state.thinkHours', 0);
        $this->as($this->student, 'GET', '/challenges/tl-first/replay')->assertOk()->assertJsonPath('replay.outcome', 'learned');
    }

    public function test_solving_the_twin_alone_after_learning_credits_the_original(): void
    {
        $this->attempt('tl-first', '1');
        $this->later(3);
        $this->attempt('tl-first', '2', 'جرّبت عددًا آخر هذه المرّة');
        $this->later(3);
        $this->attempt('tl-first', '3', 'وجرّبت عددًا ثالثًا أيضًا');
        $replay = $this->as($this->student, 'GET', '/challenges/tl-first/replay')->assertOk();
        $replay->assertJsonPath('replay.twin.id', 'tl-twin')->assertJsonPath('replay.twin.status', 'open');

        $this->attempt('tl-twin', '33')->assertJsonPath('challenge.state.outcome', 'alone');
        $this->assertSame('twin', ThinkingLabProgress::where('challenge_id', 'tl-first')->value('outcome'));
    }

    public function test_ceiling_and_parts_are_checkable_only_once_the_gate_is_passed(): void
    {
        $this->attempt('tl-first', '1');
        $this->as($this->student, 'POST', '/challenges/tl-first/extra', ['kind' => 'ceiling', 'answer' => '8192'])->assertStatus(403);
        $this->attempt('tl-first', '4096');
        $this->as($this->student, 'POST', '/challenges/tl-first/extra', ['kind' => 'ceiling', 'answer' => '1'])->assertOk()->assertJsonPath('correct', false);
        $this->as($this->student, 'POST', '/challenges/tl-first/extra', ['kind' => 'ceiling', 'answer' => '8192'])->assertOk()->assertJsonPath('correct', true);
        $this->as($this->student, 'POST', '/challenges/tl-first/extra', ['kind' => 'part', 'index' => 0, 'answer' => '12'])->assertOk()->assertJsonPath('correct', true);
        $replay = $this->as($this->student, 'GET', '/challenges/tl-first/replay')->assertOk();
        $replay->assertJsonPath('replay.ceiling.solved', true)->assertJsonPath('replay.parts.0.solved', true);
    }

    public function test_only_students_and_only_while_the_feature_is_open(): void
    {
        $this->as($this->teacher(), 'GET', '')->assertForbidden();

        FeatureAccessPolicy::updateOrCreate(['feature_key' => FeatureRegistry::THINKING_LAB_LADDER], [
            'is_enabled' => false, 'free_allowed' => true, 'premium_allowed' => true, 'free_quota' => null, 'premium_quota' => null, 'quota_period' => 'month',
        ]);
        app(FeatureAccessService::class)->forget();
        $this->as($this->student, 'GET', '')->assertForbidden();
    }

    public function test_each_student_keeps_their_own_progress(): void
    {
        $other = $this->student();
        $this->attempt('tl-first', '4096');
        $this->as($other, 'GET', '')->assertJsonPath('trail.0.status', 'open');
        $this->as($other, 'GET', '/challenges/tl-first/replay')->assertStatus(403);
    }
}
