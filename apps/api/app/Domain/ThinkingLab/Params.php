<?php

namespace App\Domain\ThinkingLab;

use App\Domain\Practice\Support\Rational;

/**
 * Les nombres PROPRES à chaque élève (`params`) — miroir de packages/core/thinkingLab/params.js,
 * verrouillé par content/thinking-lab/_fixtures/params.json (ParamsFixtureTest).
 *
 * Tuple d'un élève : fnv1a32("userId:challengeId:edition") mod (nombre de tuples) ;
 * variables triées par nom, la dernière varie le plus vite.
 */
final class Params
{
    public static function fnv1a32(string $text): int
    {
        $h = 0x811C9DC5;
        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            $h ^= ord($text[$i]);
            $h = ($h * 0x01000193) & 0xFFFFFFFF;
        }

        return $h;
    }

    /** @return list<string> */
    public static function names(?array $params): array
    {
        $names = array_map('strval', array_keys($params['vars'] ?? []));
        sort($names, SORT_STRING);

        return $names;
    }

    public static function tupleCount(?array $params): int
    {
        $n = 1;
        foreach (self::names($params) as $name) {
            $n *= count($params['vars'][$name]);
        }

        return $n;
    }

    /** @return array<string, int|float|string> */
    public static function tupleAt(?array $params, int $index): array
    {
        $values = [];
        $rest = $index;
        $names = self::names($params);
        for ($i = count($names) - 1; $i >= 0; $i--) {
            $list = $params['vars'][$names[$i]];
            $values[$names[$i]] = $list[$rest % count($list)];
            $rest = intdiv($rest, count($list));
        }
        ksort($values, SORT_STRING);

        return $values;
    }

    /** @return array{index: int, values: array<string, int|float|string>} */
    public static function pick(?array $params, int $userId, string $challengeId, int $edition): array
    {
        $size = self::tupleCount($params);
        $index = $size === 1 ? 0 : self::fnv1a32("{$userId}:{$challengeId}:{$edition}") % $size;

        return ['index' => $index, 'values' => self::tupleAt($params, $index)];
    }

    /** Remplit les {nom} ; `asExpression` les entoure de parenthèses (miroir de fillTemplate). */
    public static function fillTemplate(string $text, array $values, bool $asExpression = false): string
    {
        return preg_replace_callback('/\{([a-zA-Z][a-zA-Z0-9_]*)\}/', static function ($m) use ($values, $asExpression) {
            if (! array_key_exists($m[1], $values)) {
                return $m[0];
            }
            $v = $values[$m[1]];
            $v = is_float($v) ? Rational::jsNumberToString($v) : (string) $v;

            return $asExpression ? "({$v})" : $v;
        }, $text);
    }

    /** Copie d'un défi avec ses {nom} remplis ; `params` reste intact (miroir de fillChallenge). */
    public static function fillChallenge(array $challenge, array $values): array
    {
        $walk = function ($node, ?string $key) use (&$walk, $values) {
            if (is_string($node)) {
                return self::fillTemplate($node, $values, in_array($key, ['value', 'scaleWith'], true));
            }
            if (is_array($node)) {
                $isList = array_is_list($node);
                $out = [];
                foreach ($node as $k => $v) {
                    $out[$k] = (! $isList && $k === 'params') ? $v : $walk($v, $isList ? $key : (string) $k);
                }

                return $out;
            }

            return $node;
        };

        return $walk($challenge, null);
    }
}
