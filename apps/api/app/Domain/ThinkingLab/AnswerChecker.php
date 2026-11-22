<?php

namespace App\Domain\ThinkingLab;

use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Practice\Support\Rational;
use DomainException;

/**
 * Le JUGE d'une réponse de défi, côté serveur — miroir de packages/core/thinkingLab/checkAnswer.js,
 * verrouillé par content/thinking-lab/_fixtures/answers.json (AnswerCheckerFixtureTest).
 *
 *   integer | rational | choice → délègue à AnswerEvaluator (la pratique) ;
 *   number                      → rationnel (sinon expression sans variable) + tolérance ;
 *   expression                  → ExpressionEvaluator (équivalence aux points tirés).
 *
 * Rend {outcome, correct, normalized, mistakeIndex}. Une saisie vide ou illisible est une
 * `syntax_error`, jamais un `incorrect`. Une réponse ATTENDUE illisible lève (contenu).
 */
final class AnswerChecker
{
    public const CHECKS = ['integer', 'number', 'rational', 'expression', 'choice'];

    public function __construct(private AnswerEvaluator $evaluator = new AnswerEvaluator) {}

    private static function verdict(string $outcome, string $normalized = '', ?int $mistake = null): array
    {
        return [
            'outcome' => $outcome,
            'correct' => AnswerEvaluator::isSuccessOutcome($outcome),
            'normalized' => $normalized,
            'mistakeIndex' => $mistake,
        ];
    }

    /** @return array{vars: list<string>, samples: int, relTol: float, absTol: float, domain: array, seed: int} */
    public static function expressionOptions(array $spec): array
    {
        return [
            'vars' => $spec['vars'] ?? [],
            'samples' => (int) ($spec['samples'] ?? ExpressionEvaluator::DEFAULTS['samples']),
            'relTol' => (float) ($spec['relTol'] ?? ExpressionEvaluator::DEFAULTS['relTol']),
            'absTol' => (float) ($spec['absTol'] ?? ExpressionEvaluator::DEFAULTS['absTol']),
            'domain' => $spec['domain'] ?? [],
            'seed' => (int) ($spec['seed'] ?? ExpressionEvaluator::DEFAULTS['seed']),
        ];
    }

    public static function mistakeExpression(array $mistake): string
    {
        $value = self::str($mistake['value']);

        return isset($mistake['scaleWith']) ? "({$value})*({$mistake['scaleWith']})" : $value;
    }

    private static function str(mixed $v): string
    {
        return is_float($v) ? Rational::jsNumberToString($v) : (string) $v;
    }

    private const SAFE = 9007199254740991;

    private static function exactOf(int|float $n, int|float $d): ?Rational
    {
        return abs($n) <= self::SAFE && abs($d) <= self::SAFE ? Rational::of((int) $n, (int) $d) : null;
    }

    /** Miroir de `exactAst` (JS) : + − × ÷, puissance entière ; null si inexacte. */
    private static function exactAst(array $node): ?Rational
    {
        switch ($node['t']) {
            case 'num':
                return Rational::parse($node['v']);
            case 'neg':
                $a = self::exactAst($node['a']);

                return $a ? Rational::of(-$a->n, $a->d) : null;
            case 'bin':
                $a = self::exactAst($node['a']);
                $b = self::exactAst($node['b']);
                if (! $a || ! $b) {
                    return null;
                }
                switch ($node['op']) {
                    case '+': return $a->add($b);
                    case '-': return $a->subtract($b);
                    case '*': return self::exactOf((float) $a->n * $b->n, (float) $a->d * $b->d);
                    case '/': return $b->n === 0 ? null : self::exactOf((float) $a->n * $b->d, (float) $a->d * $b->n);
                    case '^':
                        if ($b->d !== 1 || abs($b->n) > 64 || ($a->n === 0 && $b->n < 0)) {
                            return null;
                        }
                        $r = Rational::of(1, 1);
                        for ($i = 0; $i < abs($b->n) && $r; $i++) {
                            $r = self::exactOf((float) $r->n * $a->n, (float) $r->d * $a->d);
                        }

                        return $r && $b->n < 0 ? self::exactOf($r->d, $r->n) : $r;
                    default: return null;
                }
            default:
                return null;
        }
    }

    /** Miroir de `exactValue` (JS) : la valeur exacte d'une réponse ATTENDUE integer/rational. */
    public static function exactValue(string $raw): ?Rational
    {
        $direct = Rational::parse($raw);
        if ($direct !== null) {
            return $direct;
        }
        $parsed = ExpressionEvaluator::parse($raw, []);

        return $parsed['ok'] ? self::exactAst($parsed['ast']) : null;
    }

    private static function numericValue(mixed $raw, array $scope = [], array $vars = []): ?float
    {
        if ($vars === []) {
            $r = Rational::parse($raw);
            if ($r !== null) {
                return $r->n / $r->d;
            }
        }
        $parsed = ExpressionEvaluator::parse($raw, $vars);
        if (! $parsed['ok']) {
            return null;
        }
        $v = ExpressionEvaluator::evaluate($parsed['ast'], $scope);

        return is_nan($v) ? null : $v;
    }

    private static function matchesRange(array $mistake, mixed $raw, array $spec): bool
    {
        $vars = ($spec['check'] ?? null) === 'expression' ? ($spec['vars'] ?? []) : [];
        $v = self::numericValue($raw, $mistake['at'] ?? [], $vars);
        if ($v === null) {
            return false;
        }
        [$lo, $hi] = $mistake['outside'];

        return $v <= $lo || $v >= $hi;
    }

    private static function findMistake(array $spec, mixed $raw, array $mistakes, callable $sameValue): ?int
    {
        foreach ($mistakes as $i => $m) {
            if (! isset($m['outside']) && $sameValue($m)) {
                return $i;
            }
        }
        foreach ($mistakes as $i => $m) {
            if (isset($m['outside']) && self::matchesRange($m, $raw, $spec)) {
                return $i;
            }
        }

        return null;
    }

    private function checkPractice(array $spec, mixed $raw, array $mistakes): array
    {
        $question = ['id' => $spec['id'] ?? 'thinking-lab', 'misconceptionSignatures' => []];
        if ($spec['check'] === 'choice') {
            $question['answerType'] = 'choice';
            $question['choices'] = array_map(static fn ($c) => ['id' => $c['id'], 'isCorrect' => $c['id'] === $spec['value']], $spec['choices'] ?? []);
            $answer = ['choiceId' => is_array($raw) ? ($raw['choiceId'] ?? null) : $raw];
        } else {
            $question['answerType'] = 'rational';
            $question['expectedAnswer'] = self::exactValue(self::str($spec['value']))?->toString() ?? self::str($spec['value']);
            if (! empty($spec['tolerance'])) {
                $question['evaluationPolicy'] = ['tolerance' => (string) $spec['tolerance']];
            }
            $answer = ['value' => $raw];
        }
        $r = $this->evaluator->evaluate($answer, $question);
        if ($r['outcome'] === AnswerEvaluator::SYNTAX_ERROR || AnswerEvaluator::isSuccessOutcome($r['outcome'])) {
            return self::verdict($r['outcome'], $r['normalized']);
        }
        $sameValue = $spec['check'] === 'choice'
            ? static fn ($m) => self::str($m['value']) === (string) $answer['choiceId']
            : static function ($m) use ($raw) {
                $a = self::exactValue(self::str($m['value']));
                $b = Rational::parse($raw);

                return $a !== null && $b !== null && $a->equals($b);
            };

        return self::verdict(AnswerEvaluator::INCORRECT, $r['normalized'], self::findMistake($spec, $raw, $mistakes, $sameValue));
    }

    private function checkNumber(array $spec, mixed $raw, array $mistakes): array
    {
        $expected = self::numericValue($spec['value']);
        if ($expected === null) {
            throw new DomainException('answer.value illisible : '.self::str($spec['value']));
        }
        // `percent: true` : la réponse est un pourcentage, « −4 % » se lit −4 (pas −0,04).
        if (! empty($spec['percent']) && is_string($raw)) {
            $raw = preg_replace('/\s*[%٪]\s*$/u', '', $raw);
        }
        $given = self::numericValue($raw);
        if ($given === null) {
            return self::verdict(AnswerEvaluator::SYNTAX_ERROR, (string) ($raw ?? ''));
        }
        $relTol = (float) ($spec['relTol'] ?? ExpressionEvaluator::DEFAULTS['relTol']);
        $absTol = (float) ($spec['absTol'] ?? ExpressionEvaluator::DEFAULTS['absTol']);
        $normalized = Rational::jsNumberToString($given);
        if (ExpressionEvaluator::closeEnough($given, $expected, $relTol, $absTol)) {
            return self::verdict(AnswerEvaluator::CORRECT, $normalized);
        }
        $sameValue = static function ($m) use ($given, $relTol, $absTol) {
            $v = self::numericValue($m['value']);

            return $v !== null && ExpressionEvaluator::closeEnough($given, $v, $relTol, $absTol);
        };

        return self::verdict(AnswerEvaluator::INCORRECT, $normalized, self::findMistake($spec, $raw, $mistakes, $sameValue));
    }

    private function checkExpression(array $spec, mixed $raw, array $mistakes): array
    {
        $opts = self::expressionOptions($spec);
        $value = self::str($spec['value']);
        $expected = ExpressionEvaluator::parse($value, $opts['vars']);
        if (! $expected['ok']) {
            throw new DomainException("answer.value illisible ({$expected['error']}) : {$value}");
        }
        $r = ExpressionEvaluator::equivalent($raw, $value, $opts);
        if ($r['reason'] === 'syntax') {
            return self::verdict(AnswerEvaluator::SYNTAX_ERROR, (string) ($raw ?? ''));
        }
        if ($r['equivalent']) {
            return self::verdict($r['normalized'] === $expected['normalized'] ? AnswerEvaluator::CORRECT : AnswerEvaluator::EQUIVALENT_CORRECT, $r['normalized']);
        }
        $sameValue = static fn ($m) => ExpressionEvaluator::equivalent($raw, self::mistakeExpression($m), $opts)['equivalent'];

        return self::verdict(AnswerEvaluator::INCORRECT, $r['normalized'], self::findMistake($spec, $raw, $mistakes, $sameValue));
    }

    /**
     * @param  array  $spec  le `answer` du défi (params déjà remplis)
     * @param  mixed  $raw  la saisie (chaîne, ou {choiceId})
     * @param  list<array>  $mistakes
     * @return array{outcome: string, correct: bool, normalized: string, mistakeIndex: ?int}
     */
    public function check(array $spec, mixed $raw, array $mistakes = []): array
    {
        if ($raw === null || (is_string($raw) && trim($raw) === '')) {
            return self::verdict(AnswerEvaluator::SYNTAX_ERROR, '');
        }

        return match ($spec['check'] ?? null) {
            'integer', 'rational', 'choice' => $this->checkPractice($spec, $raw, $mistakes),
            'number' => $this->checkNumber($spec, $raw, $mistakes),
            'expression' => $this->checkExpression($spec, $raw, $mistakes),
            default => throw new DomainException('answer.check inconnu : '.json_encode($spec['check'] ?? null)),
        };
    }
}
