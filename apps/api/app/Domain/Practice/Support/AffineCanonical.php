<?php

namespace App\Domain\Practice\Support;

/**
 * Forme canonique d'une fonction affine : le couple exact (a, b) de f(x) = ax + b.
 * Portage de packages/core/practice/affineCanonical.js — grammaire volontairement
 * restreinte (somme de termes constants ou en x) ; « 2(x+3) » est REFUSÉ, pas
 * développé : un refus devient `syntax_error`, jamais `incorrect`.
 *
 * Une fonction affine est le tableau `['a' => Rational, 'b' => Rational]`.
 */
final class AffineCanonical
{
    /** @return array{a: Rational, b: Rational}|null */
    public static function affineFromPair(mixed $pair): ?array
    {
        // JS : `!pair || typeof pair !== 'object'` — une liste passe (et n'a ni a ni b).
        if (! is_array($pair)) {
            return null;
        }
        $a = Rational::parse($pair['a'] ?? null);
        $b = Rational::parse($pair['b'] ?? null);

        return $a && $b ? ['a' => $a, 'b' => $b] : null;
    }

    /**
     * Lit « 2x - 3 », « -3 + 2x », « f(x) = 2x - 3 », « y=-x+1 », « 5 », « x ».
     * Null sur toute écriture hors grammaire (puissance, quotient en x,
     * parenthèses, produit de x par x).
     *
     * @return array{a: Rational, b: Rational}|null
     */
    public static function affineFromLatex(mixed $raw): ?array
    {
        if (! is_string($raw)) {
            return null;
        }

        $s = Rational::normalizeNumeric($raw);
        if (! mb_check_encoding($s, 'UTF-8')) {
            return null;
        }
        $s = preg_replace('/^[a-z]\([a-z]\)=/iu', '', $s);   // f(x)=
        $s = preg_replace('/^y=/iu', '', $s);
        $s = preg_replace('/\\\\cdot|\\\\times|\*/u', '', $s);

        if ($s === '') {
            return null;
        }
        // Tout ce qui sort de la grammaire « somme de termes en x ou constants ».
        if (preg_match('/[()^]|x['.Rational::JS_WS.']*x|\/['.Rational::JS_WS.']*x|\\\\frac\{[^}]*x/u', $s)) {
            return null;
        }

        // Découpe en termes signés : « -3+2x » → ['-3', '+2x'].
        if (! preg_match_all('/[+-]?[^+-]+/u', $s, $mm) || $mm[0] === []) {
            return null;
        }

        $a = Rational::of(0);
        $b = Rational::of(0);

        foreach ($mm[0] as $term) {
            if ($term === '+' || $term === '-') {
                return null;
            }
            $xAt = strpos($term, 'x');
            if ($xAt !== false) {
                $coeffText = substr($term, 0, $xAt);
                if (substr($term, $xAt + 1) !== '') {
                    return null; // « 2xy », « 2x3 »
                }
                if ($coeffText === '' || $coeffText === '+') {
                    $coeff = Rational::of(1);
                } elseif ($coeffText === '-') {
                    $coeff = Rational::of(-1);
                } else {
                    $coeff = Rational::parse($coeffText);
                }
                if (! $coeff) {
                    return null;
                }
                $a = $a?->add($coeff);
            } else {
                $constant = Rational::parse($term);
                if (! $constant) {
                    return null;
                }
                $b = $b?->add($constant);
            }
        }

        return $a && $b ? ['a' => $a, 'b' => $b] : null;
    }

    /**
     * Analyse une réponse quelle que soit sa forme : le couple structuré {a, b}
     * (objet), une expression LaTeX ({latex} ou chaîne nue). Une liste JSON
     * n'est ni l'un ni l'autre.
     *
     * @return array{a: Rational, b: Rational}|null
     */
    public static function parseAffineAnswer(mixed $answer): ?array
    {
        if (is_array($answer) && ! array_is_list($answer)) {
            if (is_string($answer['latex'] ?? null)) {
                return self::affineFromLatex($answer['latex']);
            }

            return self::affineFromPair($answer);
        }
        if (is_string($answer)) {
            return self::affineFromLatex($answer);
        }

        return null;
    }

    /**
     * Compare deux fonctions affines, coefficient par coefficient.
     *
     * @return array{equal: bool, matchedA: bool, matchedB: bool}
     */
    public static function affineEquals(?array $given, ?array $expected): array
    {
        if (! $given || ! $expected) {
            return ['equal' => false, 'matchedA' => false, 'matchedB' => false];
        }
        $matchedA = $given['a']->equals($expected['a']);
        $matchedB = $given['b']->equals($expected['b']);

        return ['equal' => $matchedA && $matchedB, 'matchedA' => $matchedA, 'matchedB' => $matchedB];
    }

    /** Forme canonique stable pour l'audit : « a=2;b=-3 ». */
    public static function affineToString(?array $f): string
    {
        return $f ? 'a='.$f['a']->toString().';b='.$f['b']->toString() : '';
    }
}
