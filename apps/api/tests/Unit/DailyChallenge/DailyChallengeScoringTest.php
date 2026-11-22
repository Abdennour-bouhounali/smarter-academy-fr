<?php

namespace Tests\Unit\DailyChallenge;

use App\Domain\DailyChallenge\ChallengeCalendar;
use App\Domain\DailyChallenge\DailyChallengeLeaderboard;
use App\Domain\DailyChallenge\DailyChallengeScoringService;
use PHPUnit\Framework\TestCase;

/**
 * Le barème du défi — pur. « La justesse domine » est vérifié par la
 * propriété, pas par un exemple : pour chaque nombre de questions autorisé,
 * k+1 bonnes réponses lentes battent k bonnes réponses instantanées.
 */
class DailyChallengeScoringTest extends TestCase
{
    private DailyChallengeScoringService $s;

    private array $scoring;

    protected function setUp(): void
    {
        $this->s = new DailyChallengeScoringService;
        $this->scoring = (require __DIR__.'/../../../config/daily_challenge.php')['scoring'];
    }

    public function test_a_wrong_answer_scores_zero_however_fast(): void
    {
        foreach (['incorrect', 'syntax_error', 'abandoned'] as $outcome) {
            $this->assertSame(['base' => 0, 'speed' => 0, 'total' => 0], $this->s->calculateQuestionScore($outcome, 2000, 5, $this->scoring));
        }
    }

    public function test_a_fast_wrong_answer_never_beats_a_slow_correct_one(): void
    {
        $fastWrong = $this->s->calculateQuestionScore('incorrect', 1600, 5, $this->scoring)['total'];
        $slowCorrect = $this->s->calculateQuestionScore('correct', 600_000, 5, $this->scoring)['total'];
        $this->assertSame(0, $fastWrong);
        $this->assertSame(100, $slowCorrect, 'une réponse juste, même très lente, garde toute sa base');
    }

    public function test_speed_is_tiered_bounded_and_monotonic(): void
    {
        $previous = PHP_INT_MAX;
        foreach ([2000, 9000, 15000, 25000, 40000, 55000, 80000, 120000] as $ms) {
            $bonus = $this->s->speedBonus($ms, 3, $this->scoring);
            $this->assertLessThanOrEqual($previous, $bonus, "plus lent ne rapporte jamais plus ({$ms} ms)");
            $this->assertLessThanOrEqual($this->scoring['max_speed_bonus'], $bonus);
            $previous = $bonus;
        }
        $this->assertSame(30, $this->s->speedBonus(5000, 3, $this->scoring));
        $this->assertSame(0, $this->s->speedBonus(120000, 3, $this->scoring));
    }

    public function test_a_correct_answer_in_30_seconds_scores_less_than_in_10_but_both_strongly(): void
    {
        $t10 = $this->s->calculateQuestionScore('correct', 10000, 5, $this->scoring)['total'];
        $t30 = $this->s->calculateQuestionScore('correct', 30000, 5, $this->scoring)['total'];
        $this->assertGreaterThan($t30, $t10);
        $this->assertGreaterThanOrEqual(100, $t30);
    }

    public function test_an_implausibly_fast_answer_earns_no_speed_bonus(): void
    {
        $this->assertSame(0, $this->s->speedBonus(400, 5, $this->scoring));
    }

    public function test_one_more_correct_answer_always_beats_any_speed(): void
    {
        foreach ([3, 5, 7, 10] as $n) {
            for ($k = 0; $k < $n; $k++) {
                $fast = 0;
                for ($i = 0; $i < $k; $i++) {
                    $fast += $this->s->calculateQuestionScore('correct', 2000, $n, $this->scoring)['total'];
                }
                $slow = 0;
                for ($i = 0; $i < $k + 1; $i++) {
                    $slow += $this->s->calculateQuestionScore('correct', 999_000, $n, $this->scoring)['total'];
                }
                $this->assertGreaterThan($fast, $slow, "n={$n}, {$k} rapides contre ".($k + 1).' lentes');
            }
        }
    }

    public function test_partial_answers_earn_a_fraction_without_speed(): void
    {
        $this->assertSame(['base' => 40, 'speed' => 0, 'total' => 40], $this->s->calculateQuestionScore('partially_correct', 3000, 5, $this->scoring));
    }

    public function test_continuity_bonus_grows_then_caps_and_needs_a_correct_answer(): void
    {
        $this->assertSame(10, $this->s->calculateContinuityBonus(1, 3, $this->scoring));
        $this->assertSame(12, $this->s->calculateContinuityBonus(2, 3, $this->scoring));
        $this->assertSame(30, $this->s->calculateContinuityBonus(50, 3, $this->scoring));
        $this->assertSame(0, $this->s->calculateContinuityBonus(5, 0, $this->scoring), 'pas de bonus pour une présence sans aucune bonne réponse');
    }

    public function test_missed_days_decay_is_capped_and_never_negative(): void
    {
        $this->assertSame(15, $this->s->calculateMissedDayAdjustment(1, $this->scoring));
        $this->assertSame(45, $this->s->calculateMissedDayAdjustment(30, $this->scoring), 'une longue absence coûte au plus 3 jours');
        $this->assertSame(0, $this->s->calculateCumulativeScore(20, 0, 45), 'le cumul ne descend jamais sous zéro');
        $this->assertSame(8455, $this->s->calculateCumulativeScore(8000, 500, 45), 'une absence ne détruit pas des mois de travail');
        $disabled = $this->scoring;
        $disabled['missed_day_penalty']['enabled'] = false;
        $this->assertSame(0, $this->s->calculateMissedDayAdjustment(5, $disabled));
    }

    public function test_daily_score_can_be_capped(): void
    {
        $capped = $this->scoring;
        $capped['max_daily_score'] = 250;
        $score = $this->s->calculateChallengeScore([['base' => 100, 'speed' => 20], ['base' => 100, 'speed' => 20]], 30, $capped);
        $this->assertSame(250, $score['total']);
    }

    public function test_calendar_skips_rest_days_for_streaks_and_penalties(): void
    {
        // 2026-09-25 est un vendredi : jour chômé par défaut.
        $cal = new ChallengeCalendar('Africa/Algiers', [1, 2, 3, 4, 6, 7]);
        $this->assertFalse($cal->isChallengeDay('2026-09-25'));
        $this->assertSame('2026-09-24', $cal->previousChallengeDay('2026-09-26'));
        $this->assertSame(0, $cal->challengeDaysBetween('2026-09-24', '2026-09-26'), 'le vendredi ne compte pas comme manqué');
        $this->assertSame(2, $cal->challengeDaysBetween('2026-09-21', '2026-09-24'));

        $played = ['2026-09-23' => true, '2026-09-24' => true, '2026-09-22' => true];
        $this->assertSame(3, $cal->streakEndingBefore('2026-09-26', $played), 'la série traverse le vendredi');
        $this->assertSame(0, $cal->streakEndingBefore('2026-09-28', $played), 'un jour manqué casse la série');
    }

    public function test_tie_breaking_is_total_and_documented(): void
    {
        $row = fn ($id, $score, $correct, $avg, $at) => ['userId' => $id, 'score' => $score, 'totalCorrect' => $correct, 'averageResponseMs' => $avg, 'scoreReachedAt' => $at];
        $rows = [
            $row(5, 900, 9, 12000, '2026-09-24 10:00:00.000'),
            $row(4, 900, 9, 12000, '2026-09-24 09:00:00.000'), // plus tôt
            $row(3, 900, 9, 10000, '2026-09-24 11:00:00.000'), // plus rapide
            $row(2, 900, 10, 30000, '2026-09-24 12:00:00.000'), // plus juste
            $row(1, 950, 1, 90000, '2026-09-24 12:00:00.000'), // meilleur score
            $row(6, 900, 9, 12000, '2026-09-24 09:00:00.000'), // égalité parfaite avec 4 : l'identifiant
        ];
        usort($rows, [DailyChallengeLeaderboard::class, 'compare']);
        $this->assertSame([1, 2, 3, 4, 6, 5], array_column($rows, 'userId'));
    }
}
