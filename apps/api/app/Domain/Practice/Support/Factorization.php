<?php

namespace App\Domain\Practice\Support;

/**
 * La décomposition en produit de facteurs premiers — portage SÉMANTIQUEMENT ÉQUIVALENT de
 * packages/core/practice/factorization.js, tenu égal par la fixture partagée
 * packages/core/practice/fixtures/answers.json (cas `factorization-*`).
 *
 * Une saisie est un PRODUIT de facteurs `p` ou `p^e`, dans n'importe quel ordre : signe `×`, `*`, `x`, `X`, `·`,
 * `⋅`, `∙`, `✕`, `∗`, `\times`, `\cdot`, `\ast` ; exposant `^3`, `^{13}` ou en chiffres exposants ; espaces libres
 * autour d'un signe, jamais au milieu d'un nombre. Tous les nombres restent ≤ 2^53 − 1 (un entier PHP exact, comme
 * un Number JS).
 */
final class Factorization
{
    public const MAX_FACTORIZED = 1000000000000;

    public const MAX_FACTORS = 64;

    public const MAX_EXPONENT = 999;

    private const LIMIT = 9007199254740991;

    private const SUPERSCRIPT = ['⁰' => '0', '¹' => '1', '²' => '2', '³' => '3', '⁴' => '4', '⁵' => '5', '⁶' => '6', '⁷' => '7', '⁸' => '8', '⁹' => '9'];

    /** Jumeau de `normalizeFactorizationInput` (JS). */
    public static function normalize(string $s): string
    {
        $s = Rational::latinDigits($s);
        $s = preg_replace_callback('/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/u', static fn ($m) => '^'.strtr($m[0], self::SUPERSCRIPT), $s);
        $s = preg_replace('/\\\\times|\\\\cdot|\\\\ast/u', '*', $s);
        $s = preg_replace('/\\\\[,;:! ]|~/u', ' ', $s);
        $s = preg_replace('/[×·⋅∙✕∗xX]/u', '*', $s);
        $s = preg_replace('/['.Rational::JS_WS.']+/u', ' ', $s);
        $s = preg_replace('/\^ ?\{ ?([0-9]+) ?\}/u', '^$1', $s);

        return trim($s, ' ');
    }

    /**
     * @return array<int, array{p: int, e: int}>|null les facteurs dans l'ordre écrit ; null si illisible
     */
    public static function parse(mixed $raw): ?array
    {
        if ($raw === null || is_array($raw) || is_object($raw)) {
            return null;
        }
        $s = Rational::jsString($raw);
        if (! mb_check_encoding($s, 'UTF-8')) {
            return null;
        }
        $s = self::normalize($s);
        if ($s === '') {
            return null;
        }
        $parts = explode('*', $s);
        if (count($parts) > self::MAX_FACTORS) {
            return null;
        }
        $factors = [];
        foreach ($parts as $part) {
            if (! preg_match('/^ ?([0-9]+)(?: ?\^ ?([0-9]+))? ?$/D', $part, $m)) {
                return null;
            }
            $p = self::digitsValue($m[1]);
            $e = isset($m[2]) && $m[2] !== '' ? self::digitsValue($m[2]) : 1;
            if ($p === null || $e === null || $e > self::MAX_EXPONENT) {
                return null;
            }
            $factors[] = ['p' => $p, 'e' => $e];
        }

        return $factors;
    }

    private static function digitsValue(string $digits): ?int
    {
        $s = ltrim($digits, '0');
        if (strlen($s) > 15) {
            return null;
        }

        return $s === '' ? 0 : (int) $s;
    }

    /** p^e exact, ou null au-delà de 2^53 − 1. */
    private static function power(int $p, int $e): ?int
    {
        if ($e === 0) {
            return 1;
        }
        if ($p <= 1) {
            return $p;
        }
        $r = 1;
        for ($i = 0; $i < $e; $i++) {
            $r *= $p;
            if ($r > self::LIMIT) {
                return null;
            }
        }

        return $r;
    }

    /** @param  array<int, array{p: int, e: int}>  $factors */
    public static function productOf(array $factors): ?int
    {
        $prod = 1;
        $over = false;
        foreach ($factors as $f) {
            $pw = self::power($f['p'], $f['e']);
            if ($pw === 0) {
                return 0;
            }
            if ($pw === null) {
                $over = true;
            } elseif (! $over) {
                $prod *= $pw;
                if ($prod > self::LIMIT) {
                    $over = true;
                }
            }
        }

        return $over ? null : $prod;
    }

    public static function isPrime(int $n): bool
    {
        if ($n < 2) {
            return false;
        }
        if ($n % 2 === 0) {
            return $n === 2;
        }
        for ($d = 3; $d * $d <= $n; $d += 2) {
            if ($n % $d === 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Chaque base une fois, exposants additionnés, bases croissantes, exposant 1 omis : `2^3*3^2*5`.
     *
     * @param  array<int, array{p: int, e: int}>  $factors
     */
    public static function canonical(array $factors): string
    {
        $merged = [];
        foreach ($factors as $f) {
            $merged[$f['p']] = ($merged[$f['p']] ?? 0) + $f['e'];
        }
        ksort($merged, SORT_NUMERIC);
        $out = [];
        foreach ($merged as $p => $e) {
            $out[] = $e === 1 ? (string) $p : $p.'^'.$e;
        }

        return implode('*', $out);
    }
}
