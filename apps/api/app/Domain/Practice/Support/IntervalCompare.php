<?php

namespace App\Domain\Practice\Support;

/**
 * Intervalles solutions d'une inéquation affine — portage de
 * packages/core/practice/intervalCompare.js.
 *
 * Un intervalle est `['lo' => ?Rational, 'loOpen' => bool, 'hi' => ?Rational, 'hiOpen' => bool]`,
 * `null` valant l'infini. Les bornes se comparent en rationnels exacts.
 */
final class IntervalCompare
{
    /**
     * @return array{lo: ?Rational, loOpen: bool, hi: ?Rational, hiOpen: bool}|null
     *   null si la notation est malformée (→ syntax_error)
     */
    public static function parseInterval(mixed $raw): ?array
    {
        // JS : `!raw || typeof raw !== 'object'` — tout tableau (liste ou objet) passe.
        if (! is_array($raw)) {
            return null;
        }

        $rawLo = $raw['lo'] ?? null;
        $rawHi = $raw['hi'] ?? null;
        $bound = static fn (mixed $v): ?Rational => ($v === null || $v === '') ? null : Rational::parse($v);
        $lo = $bound($rawLo);
        $hi = $bound($rawHi);

        // Une borne fournie mais illisible est une erreur de saisie, pas un infini.
        if ($rawLo !== null && $rawLo !== '' && $lo === null) {
            return null;
        }
        if ($rawHi !== null && $rawHi !== '' && $hi === null) {
            return null;
        }

        $rawLoOpen = $raw['loOpen'] ?? null;
        $rawHiOpen = $raw['hiOpen'] ?? null;
        $loOpen = $rawLoOpen !== false;
        $hiOpen = $rawHiOpen !== false;

        // ]−∞ et +∞[ : l'infini n'est jamais atteint, donc jamais crocheté vers lui.
        if ($lo === null && $rawLoOpen === false) {
            return null;
        }
        if ($hi === null && $rawHiOpen === false) {
            return null;
        }

        // Intervalle vide ou renversé : mathématiquement faux, mais bien formé —
        // c'est `incorrect`, pas `syntax_error`.
        return ['lo' => $lo, 'loOpen' => $loOpen, 'hi' => $hi, 'hiOpen' => $hiOpen];
    }

    /** Un intervalle bien formé mais qui ne contient rien (borne basse ≥ borne haute). */
    public static function isEmptyInterval(?array $i): bool
    {
        if (! $i || $i['lo'] === null || $i['hi'] === null) {
            return false;
        }
        $c = $i['lo']->compare($i['hi']);

        return $c > 0 || ($c === 0 && ($i['loOpen'] || $i['hiOpen']));
    }

    /** Égalité stricte : mêmes bornes ET même ouverture de chaque côté. */
    public static function intervalEquals(?array $given, ?array $expected): bool
    {
        if (! $given || ! $expected) {
            return false;
        }
        $sameBound = static fn (?Rational $a, ?Rational $b): bool => ($a === null && $b === null)
            || ($a !== null && $b !== null && $a->equals($b));

        return $sameBound($given['lo'], $expected['lo'])
            && $sameBound($given['hi'], $expected['hi'])
            && $given['loOpen'] === $expected['loOpen']
            && $given['hiOpen'] === $expected['hiOpen'];
    }

    /** « ]-∞ ; 15/2[ » — forme canonique stable pour l'audit. */
    public static function intervalToString(?array $i): string
    {
        if (! $i) {
            return '';
        }
        $lo = $i['lo'] === null ? ']-∞' : ($i['loOpen'] ? ']' : '[').$i['lo']->toString();
        $hi = $i['hi'] === null ? '+∞[' : $i['hi']->toString().($i['hiOpen'] ? '[' : ']');

        return "{$lo} ; {$hi}";
    }
}
