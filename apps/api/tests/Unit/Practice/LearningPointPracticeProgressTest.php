<?php

namespace Tests\Unit\Practice;

use App\Domain\Practice\LearningPointPracticeProgress;
use PHPUnit\Framework\TestCase;

/**
 * Le compteur « تمارين / أسئلة » d'un point d'apprentissage : des questions
 * RÉELLES (4 + 6 + 3 = 13, jamais 3 × un nombre fixe), les exercices et les
 * questions comptés séparément.
 */
class LearningPointPracticeProgressTest extends TestCase
{
    private static function exercise(int $questions, string $lp = 'P1', ?string $otherLp = null): array
    {
        $qs = [];
        for ($i = 1; $i <= $questions; $i++) {
            $code = ($otherLp !== null && $i === $questions) ? $otherLp : $lp;
            $qs[] = ['id' => "q{$i}", 'learningPoints' => [['code' => $code, 'role' => 'primary'], ['code' => 'PX', 'role' => 'secondary']]];
        }

        return ['questions' => $qs];
    }

    public function test_scenario_a_three_exercises_of_4_6_3_questions_total_13(): void
    {
        $bank = ['A' => self::exercise(4), 'B' => self::exercise(6), 'C' => self::exercise(3)];

        // C : rien de fait.
        $this->assertSame(
            ['P1' => ['exercises' => 3, 'exercisesCompleted' => 0, 'questions' => 13, 'questionsAnswered' => 0]],
            LearningPointPracticeProgress::tally($bank, [], []),
        );

        // D : un exercice terminé (A, 4 questions) + 4 questions de B répondues.
        $answered = ['A#q1', 'A#q2', 'A#q3', 'A#q4', 'B#q1', 'B#q2', 'B#q3', 'B#q4'];
        $this->assertSame(
            ['exercises' => 3, 'exercisesCompleted' => 1, 'questions' => 13, 'questionsAnswered' => 8],
            LearningPointPracticeProgress::tally($bank, ['A'], $answered)['P1'],
        );

        // E : tout terminé.
        $all = [];
        foreach ($bank as $id => $ex) {
            foreach ($ex['questions'] as $q) {
                $all[] = "{$id}#{$q['id']}";
            }
        }
        $this->assertSame(
            ['exercises' => 3, 'exercisesCompleted' => 3, 'questions' => 13, 'questionsAnswered' => 13],
            LearningPointPracticeProgress::tally($bank, ['A', 'B', 'C'], $all)['P1'],
        );
    }

    public function test_scenario_b_five_exercises_with_different_question_counts(): void
    {
        $bank = [];
        foreach ([1, 2, 3, 4, 5] as $i => $n) {
            $bank["E{$i}"] = self::exercise($n);
        }
        $row = LearningPointPracticeProgress::tally($bank, ['E0', 'E4'], ['E4#q1', 'E4#q5'])['P1'];
        $this->assertSame(5, $row['exercises']);
        $this->assertSame(15, $row['questions']);
        $this->assertSame(2, $row['exercisesCompleted']);
        $this->assertSame(2, $row['questionsAnswered']);
    }

    public function test_secondary_points_do_not_own_exercises_and_mixed_exercises_count_for_each_primary(): void
    {
        $bank = ['A' => self::exercise(3, 'P1', 'P2'), 'B' => self::exercise(2, 'P1')];
        $out = LearningPointPracticeProgress::tally($bank, [], ['A#q3']);
        $this->assertArrayNotHasKey('PX', $out);
        $this->assertSame(['exercises' => 2, 'exercisesCompleted' => 0, 'questions' => 5, 'questionsAnswered' => 1], $out['P1']);
        $this->assertSame(['exercises' => 1, 'exercisesCompleted' => 0, 'questions' => 3, 'questionsAnswered' => 1], $out['P2']);
    }
}
