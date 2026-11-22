<?php

namespace App\Domain\ThinkingLab;

use App\Domain\Practice\Support\Rational;
use DomainException;

/**
 * « مختبر التفكير » — lecture et équivalence d'EXPRESSIONS, côté serveur.
 *
 * Portage de packages/core/thinkingLab/expression.js : même grammaire, mêmes
 * codes d'erreur, même écriture canonique, même générateur de points. Les deux
 * consomment content/thinking-lab/_fixtures/expressions.json (Vitest et
 * tests/Unit/ThinkingLab/ExpressionEvaluatorFixtureTest.php) ; quand PHP
 * diverge, on corrige PHP. Jamais d'`eval`.
 *
 * Grammaire (docs/architecture/THINKING_LAB.md §4) :
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/') unary | <produit implicite> power)*
 *   unary   := ('-' | '+') unary | power
 *   power   := primary ('^' unary)?
 *   primary := nombre | constante | variable | '(' expr ')' | '|' expr '|'
 *            | fonction '(' expr ')' | fonction unary
 *
 * Un nœud est un tableau : ['t' => 'num'|'const'|'var', 'v' => …],
 * ['t' => 'neg', 'a' => …], ['t' => 'fn', 'f' => …, 'a' => …],
 * ['t' => 'bin', 'op' => …, 'a' => …, 'b' => …]. Une valeur indéfinie est NAN.
 */
final class ExpressionEvaluator
{
    public const MAX_LENGTH = 300;

    public const MAX_DEPTH = 60;

    public const FUNCTIONS = ['sqrt', 'sin', 'cos', 'tan', 'ln', 'exp', 'abs'];

    /** Du plus long au plus court : « exp » avant « e ». */
    private const WORDS = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'abs', 'ln', 'pi'];

    public const DEFAULT_DOMAIN = ['min' => -4, 'max' => 4];

    public const DEFAULTS = ['samples' => 6, 'relTol' => 1e-6, 'absTol' => 1e-9, 'seed' => 20261030];

    private const EXCLUDE_RADIUS = 1e-3;

    private const SUPERSCRIPTS = ['⁰' => '0', '¹' => '1', '²' => '2', '³' => '3', '⁴' => '4', '⁵' => '5', '⁶' => '6', '⁷' => '7', '⁸' => '8', '⁹' => '9'];

    /** @var list<array{t: string, v: string}> */
    private array $tokens = [];

    private int $pos = 0;

    private int $depth = 0;

    private int $absDepth = 0;

    /** Miroir de `normalizeInput` (JS). */
    public static function normalizeInput(mixed $raw): string
    {
        $s = (string) ($raw ?? '');
        $s = Rational::latinDigits($s);
        $s = preg_replace('/['.Rational::JS_WS.'\x{2009}]/u', '', $s);
        $s = preg_replace('/\\\\left|\\\\right|\\\\,|\\\\!/u', '', $s);
        $s = preg_replace('/\\\\cdot|\\\\times/u', '*', $s);
        $s = preg_replace('/\\\\div/u', '/', $s);
        $s = preg_replace('/\\\\(sqrt|pi|sin|cos|tan|ln|exp)/u', '$1', $s);
        $s = str_replace("\u{066B}", '.', $s);
        // MathLive écrit « ÷ » en ascii-math « -: » : à lire AVANT les tirets.
        $s = str_replace('-:', '/', $s);
        $s = preg_replace('/[\x{2212}\x{2012}\x{2013}\x{2014}\x{2015}]/u', '-', $s);
        $s = preg_replace('/[×·⋅∙]/u', '*', $s);
        $s = preg_replace('/[÷∕]/u', '/', $s);
        $s = str_replace('**', '^', $s);
        $s = str_replace('π', 'pi', $s);
        $s = str_replace('√', 'sqrt', $s);
        $s = preg_replace('/[{[]/u', '(', $s);
        $s = preg_replace('/[}\]]/u', ')', $s);
        $s = preg_replace_callback(
            '/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/u',
            static fn ($m) => '^'.strtr($m[0], self::SUPERSCRIPTS),
            $s,
        );

        return preg_replace('/(\d),(?=\d)/', '$1.', $s);
    }

    /**
     * @param  list<string>  $vars
     * @return array{ok: true, ast: array, normalized: string}|array{ok: false, error: string}
     */
    public static function parse(mixed $raw, array $vars = []): array
    {
        $s = self::normalizeInput($raw);
        if ($s === '') {
            return ['ok' => false, 'error' => 'empty'];
        }
        if (mb_strlen($s) > self::MAX_LENGTH) {
            return ['ok' => false, 'error' => 'too_long'];
        }
        try {
            $parser = new self;
            $parser->tokens = self::tokenize($s, $vars);
            $ast = $parser->parseRoot();

            return ['ok' => true, 'ast' => $ast, 'normalized' => self::print($ast)];
        } catch (ExpressionSyntaxError $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    private static function canonicalLiteral(string $text): string
    {
        $parts = explode('.', $text, 2);
        $int = preg_replace('/^0+(?=\d)/', '', $parts[0]);
        if ($int === '') {
            $int = '0';
        }
        $frac = rtrim($parts[1] ?? '', '0');

        return $frac === '' ? $int : "{$int}.{$frac}";
    }

    /** @return list<array{t: string, v: string}> */
    private static function tokenize(string $s, array $vars): array
    {
        $chars = mb_str_split($s);
        $n = count($chars);
        $tokens = [];
        $i = 0;
        while ($i < $n) {
            $c = $chars[$i];
            if (preg_match('/^[0-9.]$/', $c)) {
                $j = $i;
                while ($j < $n && preg_match('/^[0-9.]$/', $chars[$j])) {
                    $j++;
                }
                $text = implode('', array_slice($chars, $i, $j - $i));
                if (substr_count($text, '.') > 1 || $text === '.') {
                    throw new ExpressionSyntaxError('bad_number');
                }
                $tokens[] = ['t' => 'num', 'v' => self::canonicalLiteral($text)];
                $i = $j;

                continue;
            }
            if (preg_match('/^[a-zA-Z]$/', $c)) {
                $rest = implode('', array_slice($chars, $i, 4));
                foreach (self::WORDS as $word) {
                    if (str_starts_with($rest, $word)) {
                        $tokens[] = in_array($word, self::FUNCTIONS, true) ? ['t' => 'fn', 'v' => $word] : ['t' => 'const', 'v' => $word];
                        $i += strlen($word);

                        continue 2;
                    }
                }
                if (in_array($c, $vars, true)) {
                    $tokens[] = ['t' => 'var', 'v' => $c];
                } elseif ($c === 'e') {
                    $tokens[] = ['t' => 'const', 'v' => 'e'];
                } else {
                    throw new ExpressionSyntaxError('unknown_symbol');
                }
                $i++;

                continue;
            }
            if (str_contains('+-*/^()|', $c)) {
                $tokens[] = ['t' => 'op', 'v' => $c];
                $i++;

                continue;
            }
            throw new ExpressionSyntaxError('unknown_symbol');
        }

        return $tokens;
    }

    private function peek(): ?array
    {
        return $this->tokens[$this->pos] ?? null;
    }

    private static function isOp(?array $tok, string $v): bool
    {
        return $tok !== null && $tok['t'] === 'op' && $tok['v'] === $v;
    }

    private function enter(): void
    {
        $this->depth++;
        if ($this->depth > self::MAX_DEPTH) {
            throw new ExpressionSyntaxError('too_deep');
        }
    }

    private function leave(): void
    {
        $this->depth--;
    }

    private function startsOperand(?array $tok): bool
    {
        if ($tok === null) {
            return false;
        }
        if ($tok['t'] !== 'op') {
            return true;
        }
        if ($tok['v'] === '(') {
            return true;
        }

        return $tok['v'] === '|' && $this->absDepth === 0;
    }

    private function parseRoot(): array
    {
        $root = $this->expr();
        if ($this->pos < count($this->tokens)) {
            throw new ExpressionSyntaxError(self::isOp($this->tokens[$this->pos], ')') ? 'unbalanced' : 'unexpected_token');
        }

        return $root;
    }

    private function expr(): array
    {
        $this->enter();
        $node = $this->term();
        while (self::isOp($this->peek(), '+') || self::isOp($this->peek(), '-')) {
            $op = $this->tokens[$this->pos++]['v'];
            $node = ['t' => 'bin', 'op' => $op, 'a' => $node, 'b' => $this->term()];
        }
        $this->leave();

        return $node;
    }

    private function term(): array
    {
        $this->enter();
        $node = $this->unary();
        for (; ;) {
            $tok = $this->peek();
            if (self::isOp($tok, '*') || self::isOp($tok, '/')) {
                $this->pos++;
                $node = ['t' => 'bin', 'op' => $tok['v'], 'a' => $node, 'b' => $this->unary()];
            } elseif ($this->startsOperand($tok)) {
                $node = ['t' => 'bin', 'op' => '*', 'a' => $node, 'b' => $this->power()];
            } else {
                break;
            }
        }
        $this->leave();

        return $node;
    }

    private function unary(): array
    {
        $this->enter();
        if (self::isOp($this->peek(), '-')) {
            $this->pos++;
            $node = ['t' => 'neg', 'a' => $this->unary()];
        } elseif (self::isOp($this->peek(), '+')) {
            $this->pos++;
            $node = $this->unary();
        } else {
            $node = $this->power();
        }
        $this->leave();

        return $node;
    }

    private function power(): array
    {
        $this->enter();
        $node = $this->primary();
        if (self::isOp($this->peek(), '^')) {
            $this->pos++;
            $node = ['t' => 'bin', 'op' => '^', 'a' => $node, 'b' => $this->unary()];
        }
        $this->leave();

        return $node;
    }

    private function primary(): array
    {
        $this->enter();
        $tok = $this->tokens[$this->pos++] ?? null;
        if ($tok === null) {
            throw new ExpressionSyntaxError('unexpected_token');
        }
        if (in_array($tok['t'], ['num', 'const', 'var'], true)) {
            $node = ['t' => $tok['t'], 'v' => $tok['v']];
        } elseif ($tok['t'] === 'fn') {
            if (self::isOp($this->peek(), '(')) {
                $this->pos++;
                $inner = $this->expr();
                if (! self::isOp($this->tokens[$this->pos++] ?? null, ')')) {
                    throw new ExpressionSyntaxError('unbalanced');
                }
                $node = ['t' => 'fn', 'f' => $tok['v'], 'a' => $inner];
            } else {
                $node = ['t' => 'fn', 'f' => $tok['v'], 'a' => $this->unary()];
            }
        } elseif (self::isOp($tok, '(')) {
            $node = $this->expr();
            if (! self::isOp($this->tokens[$this->pos++] ?? null, ')')) {
                throw new ExpressionSyntaxError('unbalanced');
            }
        } elseif (self::isOp($tok, '|')) {
            $this->absDepth++;
            $inner = $this->expr();
            $this->absDepth--;
            if (! self::isOp($this->tokens[$this->pos++] ?? null, '|')) {
                throw new ExpressionSyntaxError('unbalanced');
            }
            $node = ['t' => 'fn', 'f' => 'abs', 'a' => $inner];
        } elseif (self::isOp($tok, ')')) {
            throw new ExpressionSyntaxError('unbalanced');
        } else {
            throw new ExpressionSyntaxError('unexpected_token');
        }
        $this->leave();

        return $node;
    }

    /** Écriture canonique entièrement parenthésée (miroir de `printAst`). */
    public static function print(array $node): string
    {
        return match ($node['t']) {
            'num', 'const', 'var' => $node['v'],
            'neg' => '(-'.self::print($node['a']).')',
            'fn' => $node['f'].'('.self::print($node['a']).')',
            default => '('.self::print($node['a']).$node['op'].self::print($node['b']).')',
        };
    }

    private static function finite(float $v): float
    {
        return is_finite($v) ? $v : NAN;
    }

    /** @param  array<string, int|float>  $scope */
    public static function evaluate(array $node, array $scope = []): float
    {
        switch ($node['t']) {
            case 'num':
                return self::finite((float) $node['v']);
            case 'const':
                return $node['v'] === 'pi' ? M_PI : M_E;
            case 'var':
                return array_key_exists($node['v'], $scope) ? (float) $scope[$node['v']] : NAN;
            case 'neg':
                return -self::evaluate($node['a'], $scope);
            case 'fn':
                $a = self::evaluate($node['a'], $scope);
                if (is_nan($a)) {
                    return NAN;
                }

                return match ($node['f']) {
                    'sqrt' => $a < 0 ? NAN : sqrt($a),
                    'ln' => $a <= 0 ? NAN : log($a),
                    'exp' => self::finite(exp($a)),
                    'sin' => sin($a),
                    'cos' => cos($a),
                    'tan' => self::finite(tan($a)),
                    'abs' => abs($a),
                    default => NAN,
                };
            default:
                $a = self::evaluate($node['a'], $scope);
                $b = self::evaluate($node['b'], $scope);
                if (is_nan($a) || is_nan($b)) {
                    return NAN;
                }

                return match ($node['op']) {
                    '+' => self::finite($a + $b),
                    '-' => self::finite($a - $b),
                    '*' => self::finite($a * $b),
                    '/' => $b == 0 ? NAN : self::finite($a / $b),
                    '^' => ($a < 0 && floor($b) != $b) || ($a == 0 && $b < 0) ? NAN : self::finite($a ** $b),
                    default => NAN,
                };
        }
    }

    /** Générateur de Park–Miller, miroir exact de `createSampler`. */
    public static function sampler(int|float $seed = self::DEFAULTS['seed']): \Closure
    {
        $state = ((int) abs($seed)) % 2147483647;
        if ($state <= 0) {
            $state += 2147483646;
        }

        return static function () use (&$state): float {
            $state = ($state * 48271) % 2147483647;

            return $state / 2147483647;
        };
    }

    /**
     * @param  list<string>  $vars
     * @return list<array<string, float>>
     */
    public static function samplePoints(array $vars, int $samples, array $domain, int|float $seed): array
    {
        $next = self::sampler($seed);
        $points = [];
        for ($draw = 0; $draw < $samples * 8; $draw++) {
            $point = [];
            $excluded = false;
            foreach ($vars as $v) {
                $d = $domain[$v] ?? self::DEFAULT_DOMAIN;
                $x = $d['min'] + ($d['max'] - $d['min']) * $next();
                foreach ($d['exclude'] ?? [] as $g) {
                    if (abs($x - $g) < self::EXCLUDE_RADIUS) {
                        $excluded = true;
                    }
                }
                $point[$v] = $x;
            }
            if (! $excluded) {
                $points[] = $point;
            }
        }

        return $points;
    }

    public static function closeEnough(float $a, float $b, float $relTol, float $absTol): bool
    {
        $diff = abs($a - $b);

        return $diff <= $absTol || $diff <= $relTol * max(abs($a), abs($b));
    }

    /**
     * Miroir de `equivalentExpressions`.
     *
     * @param  array{vars?: list<string>, samples?: int, relTol?: float, absTol?: float, domain?: array, seed?: int}  $opts
     * @return array{equivalent: bool, reason: string, error?: string, normalized?: string}
     *
     * @throws DomainException quand l'expression ATTENDUE est illisible (erreur de contenu)
     */
    public static function equivalent(mixed $given, string $expected, array $opts = []): array
    {
        $vars = $opts['vars'] ?? [];
        $samples = (int) ($opts['samples'] ?? self::DEFAULTS['samples']);
        $relTol = (float) ($opts['relTol'] ?? self::DEFAULTS['relTol']);
        $absTol = (float) ($opts['absTol'] ?? self::DEFAULTS['absTol']);

        $exp = self::parse($expected, $vars);
        if (! $exp['ok']) {
            throw new DomainException("expression attendue illisible ({$exp['error']}) : {$expected}");
        }
        $giv = self::parse($given, $vars);
        if (! $giv['ok']) {
            return ['equivalent' => false, 'reason' => 'syntax', 'error' => $giv['error']];
        }

        $points = $vars === [] ? [[]] : self::samplePoints($vars, $samples, $opts['domain'] ?? [], $opts['seed'] ?? self::DEFAULTS['seed']);
        $needed = $vars === [] ? 1 : $samples;
        $agreed = 0;
        foreach ($points as $point) {
            if ($agreed >= $needed) {
                break;
            }
            $e = self::evaluate($exp['ast'], $point);
            $g = self::evaluate($giv['ast'], $point);
            if (is_nan($e) && is_nan($g)) {
                continue;
            }
            if (is_nan($e) !== is_nan($g)) {
                return ['equivalent' => false, 'reason' => 'domain', 'normalized' => $giv['normalized']];
            }
            if (! self::closeEnough($e, $g, $relTol, $absTol)) {
                return ['equivalent' => false, 'reason' => 'differs', 'normalized' => $giv['normalized']];
            }
            $agreed++;
        }
        if ($agreed < (int) ceil($needed / 2)) {
            return ['equivalent' => false, 'reason' => 'undefined', 'normalized' => $giv['normalized']];
        }

        return ['equivalent' => true, 'reason' => 'equal', 'normalized' => $giv['normalized']];
    }
}
