<?php

namespace Tests\Unit\Classroom;

use App\Domain\Classroom\Insights\AttentionSignals;
use App\Domain\Classroom\Insights\ClassroomFacts;
use App\Domain\Classroom\Insights\InsightWindow;
use App\Domain\Classroom\Insights\RecentChanges;
use App\Domain\Classroom\Insights\StudentSnapshot;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Les règles de « تستحقّ نظرة » sur des FAITS synthétiques — sans base :
 * chaque règle, son cas négatif, et l'absence de doublon.
 */
class AttentionSignalsTest extends TestCase
{
    private function facts(array $states = [], array $recent = [], array $moves = [], array $lastActivity = [], array $prereq = [], int $students = 4): ClassroomFacts
    {
        $now = Carbon::parse('2026-09-25 10:00:00', 'UTC');
        $ids = range(1, $students);
        $identities = [];
        foreach ($ids as $id) {
            $identities[$id] = ['id' => $id, 'firstName' => "S{$id}", 'lastName' => 'X'];
        }
        $points = [];
        foreach ([10, 20, 30] as $order => $pid) {
            $points[$pid] = ['id' => $pid, 'code' => "P{$pid}", 'title' => "Point {$pid}", 'order' => $order, 'lessonId' => 1, 'lessonCode' => 'L', 'lessonTitle' => 'Leçon'];
        }
        $full = [];
        foreach ($states as $sid => $byPoint) {
            foreach ($byPoint as $pid => $status) {
                $full[$sid][$pid] = ['status' => $status, 'reason' => 'threshold', 'confidence' => 0.3, 'attempts' => 3, 'failureCount' => 2,
                    'distinctItemsSuccess' => 0, 'lastEvidenceAt' => $now->toIso8601String(), 'lastSuccessAt' => null];
            }
        }
        $activity = [];
        foreach ($ids as $id) {
            $activity[$id] = array_key_exists($id, $lastActivity) ? $lastActivity[$id] : $now->copy()->subDay()->toIso8601String();
        }

        return new ClassroomFacts(InsightWindow::recent(14, $now), $identities, [1], $points, $full, $recent, $moves, $activity, $prereq);
    }

    private function recent(int $answered, int $failures, int $successes = 0): array
    {
        return ['answered' => $answered, 'successes' => $successes, 'partials' => 0, 'failures' => $failures, 'successRate' => null, 'items' => $answered, 'lastAt' => '2026-09-24T10:00:00+00:00'];
    }

    public function test_a_shared_gap_is_one_class_signal_and_its_students_get_no_duplicate(): void
    {
        $facts = $this->facts(
            states: [1 => [10 => 'gap'], 2 => [10 => 'gap'], 3 => [10 => 'mastered']],
            recent: [1 => [10 => $this->recent(4, 4)], 2 => [10 => $this->recent(3, 3)]],
        );
        $signals = AttentionSignals::compute($facts)['signals'];
        $learning = array_values(array_filter($signals, fn ($s) => $s['category'] === 'learning'));

        $this->assertCount(1, $learning);
        $this->assertSame('class_difficulty', $learning[0]['type']);
        $this->assertSame('P10', $learning[0]['learningPoint']['code']);
        $this->assertSame([1, 2], array_column($learning[0]['students'], 'id'));
        $this->assertSame(2, $learning[0]['indicator']['gap']);
        // La preuve de chaque élève est portée par le signal.
        $this->assertSame(4, $learning[0]['students'][0]['recent']['failures']);
        $this->assertContains('class_reinforcement', $learning[0]['actions']);
    }

    public function test_an_isolated_gap_needs_repeated_failures_to_become_a_signal(): void
    {
        $once = AttentionSignals::compute($this->facts(states: [1 => [10 => 'gap']], recent: [1 => [10 => $this->recent(1, 1)]]))['signals'];
        $this->assertSame([], array_values(array_filter($once, fn ($s) => $s['category'] === 'learning')));

        $repeated = AttentionSignals::compute($this->facts(states: [1 => [10 => 'gap']], recent: [1 => [10 => $this->recent(4, 3)]]))['signals'];
        $this->assertSame('repeated_difficulty', $repeated[0]['type']);
        $this->assertSame([1], array_column($repeated[0]['students'], 'id'));
    }

    public function test_unassessed_and_insufficient_evidence_are_never_difficulties(): void
    {
        $signals = AttentionSignals::compute($this->facts(states: [1 => [10 => 'reinforce']], recent: [1 => [10 => $this->recent(2, 0, 2)]]))['signals'];
        $this->assertSame([], array_values(array_filter($signals, fn ($s) => $s['category'] === 'learning')));
    }

    public function test_a_decline_is_read_from_window_start_to_now_and_a_recalculation_is_not_interpreted(): void
    {
        $declined = AttentionSignals::compute($this->facts(
            states: [1 => [20 => 'reinforce']],
            moves: [1 => [20 => ['startStatus' => 'mastered', 'moves' => 1, 'recalculated' => false, 'lastAt' => '2026-09-24T10:00:00+00:00', 'lastStatus' => 'reinforce']]],
        ))['signals'];
        $this->assertSame('declined', $declined[0]['type']);
        $this->assertSame('mastered', $declined[0]['students'][0]['statusAtWindowStart']);

        $recalc = AttentionSignals::compute($this->facts(
            states: [1 => [20 => 'reinforce']],
            moves: [1 => [20 => ['startStatus' => 'mastered', 'moves' => 1, 'recalculated' => true, 'lastAt' => null, 'lastStatus' => 'reinforce']]],
        ))['signals'];
        $this->assertSame([], array_values(array_filter($recalc, fn ($s) => $s['category'] === 'learning')));
    }

    public function test_activity_without_progress_is_stalled(): void
    {
        $signals = AttentionSignals::compute($this->facts(
            states: [1 => [30 => 'reinforce']],
            recent: [1 => [30 => $this->recent(6, 2, 4)]],
            moves: [1 => [30 => ['startStatus' => 'reinforce', 'moves' => 6, 'recalculated' => false, 'lastAt' => null, 'lastStatus' => 'reinforce']]],
        ))['signals'];
        $this->assertSame('stalled', $signals[0]['type']);
    }

    public function test_inactivity_is_engagement_not_learning(): void
    {
        $signals = AttentionSignals::compute($this->facts(lastActivity: [3 => null, 4 => '2026-08-01T10:00:00+00:00']))['signals'];
        $this->assertCount(1, $signals);
        $this->assertSame('no_recent_activity', $signals[0]['type']);
        $this->assertSame('engagement', $signals[0]['category']);
        $this->assertSame(1, $signals[0]['indicator']['neverStarted']);
        $this->assertSame([3, 4], array_column($signals[0]['students'], 'id'));
    }

    public function test_a_weak_prerequisite_is_offered_as_a_lead(): void
    {
        $signals = AttentionSignals::compute($this->facts(
            states: [1 => [20 => 'gap', 10 => 'gap'], 2 => [20 => 'gap', 10 => 'mastered']],
            prereq: [20 => [10]],
        ))['signals'];
        $this->assertSame('class_difficulty', $signals[0]['type']);
        $this->assertSame([['code' => 'P10', 'title' => 'Point 10', 'lessonCode' => 'L', 'lessonTitle' => 'Leçon', 'studentsInGap' => 1]], $signals[0]['prerequisites']);
        $this->assertContains('review_prerequisite', $signals[0]['actions']);
    }

    public function test_the_student_snapshot_and_changes_read_the_same_facts(): void
    {
        $facts = $this->facts(
            states: [1 => [10 => 'mastered', 20 => 'gap', 30 => 'reinforce']],
            recent: [1 => [20 => $this->recent(3, 3)]],
            moves: [1 => [10 => ['startStatus' => 'reinforce', 'moves' => 2, 'recalculated' => false, 'lastAt' => '2026-09-24T10:00:00+00:00', 'lastStatus' => 'mastered'],
                20 => ['startStatus' => null, 'moves' => 1, 'recalculated' => false, 'lastAt' => '2026-09-23T10:00:00+00:00', 'lastStatus' => 'gap']]],
        );

        $snap = StudentSnapshot::compute($facts, 1);
        $this->assertSame(['mastered' => 1, 'reinforce' => 1, 'gap' => 1, 'unassessed' => 0], $snap['learning']['counts']);
        $this->assertSame(['P10'], array_column($snap['learning']['strengths'], 'code'));
        $this->assertSame(['P20', 'P30'], array_column($snap['learning']['difficulties'], 'code'));
        $this->assertSame('improving', $snap['evolution']['trend']);
        $this->assertSame(1, $snap['evolution']['improved']);
        $this->assertSame(1, $snap['evolution']['firstAssessed']);
        $this->assertSame('P20', $snap['activity']['currentLearningPoint']['code']);

        $changes = RecentChanges::compute($facts);
        $this->assertSame(1, $changes['improved']);
        $this->assertSame(1, $changes['firstAssessed']);
        $this->assertSame(0, $changes['declined']);
    }
}
