<?php

namespace App\Domain\Diagnostic\Support;

/**
 * Server-side answer correctness — the diagnostic's trust boundary. The
 * client renders a question and submits a raw structured answer; whether
 * that answer is correct (and which misconception, if any, it reveals) is
 * decided here, never trusted from the client.
 *
 * This intentionally does NOT reuse packages/core's JS validators — not
 * because they're wrong, but because they run in the browser and this is
 * exactly the kind of decision §26 says can't be trusted from the client.
 * The lesson-practice validators stay exactly as they are; this is a
 * separate, minimal, PHP-side re-implementation restricted to answer shapes
 * simple enough to check correctly in a few lines (exact match, numeric
 * tolerance, fraction cross-multiplication, sequence/set comparison) —
 * deliberately not porting the compute-engine algebraic comparator, which
 * is why the diagnostic's question bank never asks for free-form algebra.
 *
 * Every check* method is pure: given the same inputs, always the same
 * output, no I/O, fully unit-testable without a database.
 */
class AnswerChecker
{
    /**
     * @param  string  $representation  One of: choice, numeric, fraction, ordering, classification, numberline.
     * @param  array  $answer  The raw structured payload the client submitted.
     * @param  array  $question  The question definition (from a grade's question bank) — must contain
     *                           at least `correct`, and may contain `misconceptions`.
     * @return array{isCorrect: bool, misconceptionId: ?string}
     */
    public static function check(string $representation, array $answer, array $question): array
    {
        return match ($representation) {
            'choice' => self::checkChoice($answer, $question),
            'numeric' => self::checkNumeric($answer, $question),
            'fraction' => self::checkFraction($answer, $question),
            'ordering' => self::checkOrdering($answer, $question),
            'classification' => self::checkClassification($answer, $question),
            'numberline' => self::checkNumberLine($answer, $question),
            default => ['isCorrect' => false, 'misconceptionId' => null],
        };
    }

    private static function checkChoice(array $answer, array $question): array
    {
        $given = (string) ($answer['choiceId'] ?? '');
        $correct = (string) ($question['correct']['choiceId'] ?? '');

        if ($given === $correct) {
            return ['isCorrect' => true, 'misconceptionId' => null];
        }

        $misconceptionId = $question['misconceptions'][$given] ?? null;

        return ['isCorrect' => false, 'misconceptionId' => $misconceptionId];
    }

    private static function checkNumeric(array $answer, array $question): array
    {
        $given = self::toFloat($answer['value'] ?? null);
        $correct = (float) ($question['correct']['value'] ?? 0);
        $tolerance = (float) ($question['correct']['tolerance'] ?? 0.01);

        if ($given === null) {
            return ['isCorrect' => false, 'misconceptionId' => null];
        }

        if (abs($given - $correct) < $tolerance) {
            return ['isCorrect' => true, 'misconceptionId' => null];
        }

        foreach ($question['misconceptions'] ?? [] as $signature) {
            $signatureValue = self::toFloat($signature['value'] ?? null);
            if ($signatureValue !== null && abs($given - $signatureValue) < $tolerance) {
                return ['isCorrect' => false, 'misconceptionId' => $signature['id']];
            }
        }

        return ['isCorrect' => false, 'misconceptionId' => null];
    }

    /**
     * Fraction equivalence via cross-multiplication (a/b == c/d ⟺ a*d == c*b)
     * — exact, no floating-point comparison, and handles a student-submitted
     * denominator of 0 as simply incorrect rather than a division error.
     */
    private static function checkFraction(array $answer, array $question): array
    {
        $givenNum = self::toInt($answer['numerator'] ?? null);
        $givenDen = self::toInt($answer['denominator'] ?? null);
        $correctNum = (int) ($question['correct']['numerator'] ?? 0);
        $correctDen = (int) ($question['correct']['denominator'] ?? 1);

        if ($givenNum === null || $givenDen === null || $givenDen === 0) {
            return ['isCorrect' => false, 'misconceptionId' => null];
        }

        if ($givenNum * $correctDen === $correctNum * $givenDen) {
            return ['isCorrect' => true, 'misconceptionId' => null];
        }

        // "Bigger denominator = bigger fraction" — the numerator/denominator
        // are swapped relative to the correct answer (e.g. answering 4/1
        // instead of 1/4, or matching a distractor built the same way).
        if ($givenNum === $correctDen && $givenDen === $correctNum && $correctNum !== $correctDen) {
            return ['isCorrect' => false, 'misconceptionId' => 'numerateur-denominateur-inverses'];
        }

        foreach ($question['misconceptions'] ?? [] as $signature) {
            $sigNum = self::toInt($signature['numerator'] ?? null);
            $sigDen = self::toInt($signature['denominator'] ?? null);
            if ($sigNum !== null && $sigDen !== null && $givenNum === $sigNum && $givenDen === $sigDen) {
                return ['isCorrect' => false, 'misconceptionId' => $signature['id']];
            }
        }

        return ['isCorrect' => false, 'misconceptionId' => null];
    }

    private static function checkOrdering(array $answer, array $question): array
    {
        $given = array_values($answer['sequence'] ?? []);
        $correct = array_values($question['correct']['sequence'] ?? []);

        if ($given === $correct) {
            return ['isCorrect' => true, 'misconceptionId' => null];
        }

        if ($given === array_reverse($correct)) {
            return ['isCorrect' => false, 'misconceptionId' => 'sens-inverse'];
        }

        return ['isCorrect' => false, 'misconceptionId' => null];
    }

    private static function checkClassification(array $answer, array $question): array
    {
        $given = $answer['assignments'] ?? [];
        $correct = $question['correct']['assignments'] ?? [];

        ksort($given);
        ksort($correct);

        return ['isCorrect' => $given == $correct, 'misconceptionId' => null];
    }

    private static function checkNumberLine(array $answer, array $question): array
    {
        // Same tolerance-based check as a plain numeric answer — the number
        // line is a different INPUT modality, not a different correctness rule.
        return self::checkNumeric($answer, $question);
    }

    private static function toFloat(mixed $value): ?float
    {
        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }
        if (is_string($value) && $value !== '') {
            $normalized = str_replace(',', '.', trim($value));
            if (is_numeric($normalized)) {
                return (float) $normalized;
            }
        }

        return null;
    }

    private static function toInt(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }
        if (is_string($value) && $value !== '' && ctype_digit(ltrim($value, '-'))) {
            return (int) $value;
        }
        if (is_float($value) && floor($value) === $value) {
            return (int) $value;
        }

        return null;
    }
}
