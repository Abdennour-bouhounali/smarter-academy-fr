<?php

namespace App\Domain\GameWorld;

/**
 * Le juge des réponses du MONDE DE JEU (« أرخبيل القواسم », 2026-11-15).
 *
 * Les questions du jeu sont de l'arithmétique générée dans le navigateur : il
 * n'existe aucune clé stockée à comparer. Le client envoie donc une
 * AFFIRMATION (`claim`) — les nombres de la question et ce que l'élève a
 * écrit — et le serveur RECALCULE le verdict. La parole du navigateur n'est
 * jamais crue (frontière de confiance, LEARNING_ARCHITECTURE.md).
 *
 * Même règle que `verifyClaim()` de apps/web/src/lessons/common/gameworld/kit/claims.js :
 * une seule fixture pour les deux (tests/Fixtures/game-claims.json).
 *
 * Un GENRE d'affirmation n'appartient à aucune leçon : c'est un énoncé sur des entiers naturels, que toute leçon peut
 * employer. POUR EN AJOUTER UN : l'écrire ICI (`KINDS` et `verify`) et dans `kit/claims.js`, puis ajouter à la fixture des
 * lignes vraies et des lignes fausses. `claims.test.js` (web) échoue si les deux listes diffèrent ou si un genre n'a pas
 * ses deux verdicts ; `ClaimVerifierTest` rejoue la fixture ici.
 */
final class ClaimVerifier
{
    public const KINDS = [
        'division', 'product', 'phrase', 'sure', 'containers', 'pair', 'divisors', 'stop', 'divisible',
        'bracket', 'fullNeeded', 'pgcd', 'coprime', 'commonDivisor', 'fraction',
    ];

    /** Les nombres admis : des entiers naturels de taille scolaire. */
    public const MAX = 1000000;

    public static function verify(array $c): bool
    {
        $n = static fn (string $k): ?int => isset($c[$k]) && is_int($c[$k]) && $c[$k] >= 0 && $c[$k] <= self::MAX ? $c[$k] : null;

        switch ($c['kind'] ?? null) {
            case 'division':
                [$a, $b, $q, $r] = [$n('a'), $n('b'), $n('q'), $n('r')];
                if ($a === null || $b === null || $q === null || $r === null || $b === 0 || ! is_bool($c['fits'] ?? null)) {
                    return false;
                }

                return $b * $q + $r === $a && $r < $b && $c['fits'] === ($r === 0);
            case 'product':
                [$a, $b, $q, $o] = [$n('a'), $n('b'), $n('q'), $n('other')];
                if ($a === null || $b === null || $q === null || $o === null || $b === 0 || $o === 0) {
                    return false;
                }

                // « un AUTRE diviseur » : pas celui qu'on vient de montrer (sauf a = b × b)
                return $b * $q === $a && $a % $o === 0 && ($o !== $b || $b === $q);
            case 'phrase':
                [$a, $b, $first] = [$n('a'), $n('b'), $n('first')];
                if ($a === null || $b === null || $first === null) {
                    return false;
                }
                $divisorFirst = $first === min($a, $b);

                return match ($c['phrase'] ?? null) {
                    'qasim', 'yaqsim' => $divisorFirst,
                    'mudaaf', 'yaqbal' => ! $divisorFirst,
                    default => false,
                };
            case 'sure':
                [$a, $x, $y] = [$n('a'), $n('x'), $n('y')];
                if ($a === null || $x === null || $y === null) {
                    return false;
                }

                return $x !== $y && in_array(1, [$x, $y], true) && in_array($a, [$x, $y], true);
            case 'containers':
                [$a, $b, $count] = [$n('a'), $n('b'), $n('count')];
                if ($a === null || $b === null || $count === null || $b === 0) {
                    return false;
                }

                return $count === intdiv($a + $b - 1, $b);
            case 'pair':
                // a = b × e : un produit de deux facteurs — les deux sont des diviseurs
                [$a, $b, $e] = [$n('a'), $n('b'), $n('e')];
                if ($a === null || $b === null || $e === null || $b === 0 || $e === 0) {
                    return false;
                }

                return $b * $e === $a;
            case 'divisors':
                // TOUS les diviseurs de a, chacun une fois (l'ordre n'importe pas) ; b = leur nombre annoncé
                [$a, $b] = [$n('a'), $n('b')];
                $list = $c['list'] ?? null;
                if ($a === null || $a === 0 || $b === null || ! is_array($list) || count($list) > 400) {
                    return false;
                }
                foreach ($list as $d) {
                    if (! is_int($d) || $d < 1) {
                        return false;
                    }
                }
                $all = [];
                for ($d = 1; $d * $d <= $a; $d++) {
                    if ($a % $d === 0) {
                        $all[] = $d;
                        $all[] = intdiv($a, $d);
                    }
                }
                $all = array_values(array_unique($all));
                sort($all);
                $mine = array_values($list);
                sort($mine);

                return $mine === $all && $b === count($all);
            case 'stop':
                // jusqu'où tester : le plus grand b dont le carré ne dépasse pas a
                [$a, $b] = [$n('a'), $n('b')];
                if ($a === null || $b === null) {
                    return false;
                }

                return $b * $b <= $a && $a < ($b + 1) * ($b + 1);
            case 'divisible':
                // « a est divisible par b » dit juste (une règle de divisibilité, sans poser la division)
                [$a, $b] = [$n('a'), $n('b')];
                if ($a === null || $b === null || $b === 0 || ! is_bool($c['fits'] ?? null)) {
                    return false;
                }

                return $c['fits'] === ($a % $b === 0);
            case 'bracket':
                // le quotient de a par b entre deux naturels CONSÉCUTIFS : b × lo ≤ a < b × hi, hi = lo + 1
                [$a, $b, $lo, $hi] = [$n('a'), $n('b'), $n('lo'), $n('hi')];
                if ($a === null || $b === null || $lo === null || $hi === null || $b === 0) {
                    return false;
                }

                return $hi === $lo + 1 && $b * $lo <= $a && $a < $b * $hi;
            case 'fullNeeded':
                // les contenants de b que a remplit (quotient par défaut) et ceux qu'il faut (quotient par excès)
                [$a, $b, $full, $need] = [$n('a'), $n('b'), $n('full'), $n('need')];
                if ($a === null || $b === null || $full === null || $need === null || $b === 0) {
                    return false;
                }

                return $full === intdiv($a, $b) && $need === intdiv($a + $b - 1, $b);
            case 'pgcd':
                // g est le PGCD de a et b, pas tous deux nuls (PGCD(a ; 0) = a)
                [$a, $b, $g] = [$n('a'), $n('b'), $n('g')];
                if ($a === null || $b === null || $g === null || $a + $b === 0) {
                    return false;
                }

                return $g === self::gcd($a, $b);
            case 'coprime':
                // « a et b sont premiers entre eux » dit juste
                [$a, $b] = [$n('a'), $n('b')];
                if ($a === null || $b === null || $a < 1 || $b < 1 || ! is_bool($c['says'] ?? null)) {
                    return false;
                }

                return $c['says'] === (self::gcd($a, $b) === 1);
            case 'commonDivisor':
                // d divise a ET b ; avec `notOne: true`, un diviseur commun AUTRE QUE 1 (le témoin que a et b ne
                // sont pas premiers entre eux — d = 1 est alors faux)
                [$a, $b, $d] = [$n('a'), $n('b'), $n('d')];
                $min = ($c['notOne'] ?? null) === true ? 2 : 1;
                if ($a === null || $b === null || $d === null || $a < 1 || $b < 1 || $d < $min) {
                    return false;
                }

                return $a % $d === 0 && $b % $d === 0;
            case 'fraction':
                // a/b la fraction donnée, p/q l'écriture de l'élève : égales (a × q = p × b) et, sauf
                // `reduced === false`, p/q irréductible (PGCD(p ; q) = 1). Avec `op` ('+', '-' ou '*'), a/b est le
                // RÉSULTAT du calcul x/y op z/w que porte l'affirmation : il doit lui être égal (recalculé ici, jamais
                // repris du navigateur) — l'affirmation porte alors sur le calcul lui-même.
                [$a, $b, $p, $q] = [$n('a'), $n('b'), $n('p'), $n('q')];
                if ($a === null || $b === null || $p === null || $q === null || $b === 0 || $q === 0) {
                    return false;
                }

                return $a * $q === $p * $b && (($c['reduced'] ?? null) === false || self::gcd($p, $q) === 1)
                    && (! array_key_exists('op', $c) || self::isResult($c, $a, $b, $n));
            default:
                return false;
        }
    }

    /**
     * a/b est le résultat de x/y op z/w : les deux formes irréductibles sont les mêmes (non réduit, le calcul reste
     * ≤ 2 × 10^12 ; un résultat négatif n'est jamais une fraction a/b de naturels).
     */
    private static function isResult(array $c, int $a, int $b, callable $n): bool
    {
        [$x, $y, $z, $w] = [$n('x'), $n('y'), $n('z'), $n('w')];
        if ($x === null || $y === null || $z === null || $w === null || $y === 0 || $w === 0) {
            return false;
        }
        [$num, $den] = match ($c['op']) {
            '+' => [$x * $w + $z * $y, $y * $w],
            '-' => [$x * $w - $z * $y, $y * $w],
            '*' => [$x * $z, $y * $w],
            default => [-1, 1],
        };
        if ($num < 0) {
            return false;
        }
        [$g, $h] = [self::gcd($num, $den), self::gcd($a, $b)];

        return intdiv($num, $g) === intdiv($a, $h) && intdiv($den, $g) === intdiv($b, $h);
    }

    private static function gcd(int $a, int $b): int
    {
        while ($b !== 0) {
            [$a, $b] = [$b, $a % $b];
        }

        return $a;
    }

    /** L'identité d'un item généré : la même division posée deux fois est le MÊME item (règle des items distincts). */
    public static function itemId(array $c): string
    {
        $parts = array_map(static fn ($k) => isset($c[$k]) && is_int($c[$k]) ? (string) $c[$k] : '-', ['a', 'b']);

        return ($c['kind'] ?? 'x').'-'.implode('x', $parts);
    }
}
