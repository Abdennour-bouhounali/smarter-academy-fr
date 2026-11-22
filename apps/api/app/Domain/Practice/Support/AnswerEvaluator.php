<?php

namespace App\Domain\Practice\Support;

use App\Domain\Progress\Outcome;
use DomainException;

/**
 * L'évaluateur de réponses côté serveur — portage SÉMANTIQUEMENT ÉQUIVALENT de
 * packages/core/practice/answerEvaluator.js.
 *
 * L'équivalence n'est pas une intention, c'est un test : les deux runtimes
 * consomment la même fixture packages/core/practice/fixtures/answers.json
 * (answerEvaluator.fixtures.test.js côté JS, AnswerEvaluatorFixtureTest côté
 * PHP). La fixture est produite en EXÉCUTANT le JS ; quand PHP diverge, on
 * corrige PHP.
 *
 * Il ne rend pas un booléen : six issues (docs/architecture/EXERCISE_CONTRACT.md
 * § 0), `syntax_error` n'étant PAS un `incorrect`. Fonction pure : le contenu
 * de la question entre (tableaux décodés du JSON), une évaluation sort.
 *
 * Conventions d'entrée : la réponse et la question sont des tableaux PHP
 * décodés du JSON (`json_decode(…, true)`) — objet → tableau associatif, liste
 * → tableau `array_is_list`. Limite connue : `{}` et `[]` sont le même tableau
 * vide en PHP, là où `JSON.stringify` les distingue (« {} » / « [] »).
 */
final class AnswerEvaluator
{
    public const CORRECT = 'correct';

    public const EQUIVALENT_CORRECT = 'equivalent_correct';

    public const PARTIALLY_CORRECT = 'partially_correct';

    public const INCORRECT = 'incorrect';

    public const SYNTAX_ERROR = 'syntax_error';

    public const ABANDONED = 'abandoned';

    /** Miroir de `OUTCOMES` (JS) ; les valeurs sont celles de l'enum Progress\Outcome. */
    public const OUTCOMES = [
        'CORRECT' => self::CORRECT,
        'EQUIVALENT_CORRECT' => self::EQUIVALENT_CORRECT,
        'PARTIALLY_CORRECT' => self::PARTIALLY_CORRECT,
        'INCORRECT' => self::INCORRECT,
        'SYNTAX_ERROR' => self::SYNTAX_ERROR,
        'ABANDONED' => self::ABANDONED,
    ];

    /** Types de réponse gérés. Le validateur de contenu compare cette liste au schéma. */
    public const SUPPORTED_ANSWER_TYPES = [
        'choice', 'multiChoice', 'rational', 'affine', 'interval', 'point', 'integerSet', 'selfCheck',
    ];

    /**
     * Miroir de `countsForMastery` (JS) : une question auto-évaluée (`selfCheck`)
     * ou déclarée `counted: false` est jugée, mais n'écrit aucune preuve de maîtrise.
     *
     * @param  array<string, mixed>  $question
     */
    public static function countsForMastery(array $question): bool
    {
        return ($question['answerType'] ?? null) !== 'selfCheck' && ($question['counted'] ?? true) !== false;
    }

    /** Les issues qui comptent comme une réussite pour la maîtrise. */
    public static function isSuccessOutcome(string $outcome): bool
    {
        return Outcome::tryFrom($outcome)?->isSuccess() ?? false;
    }

    /** Les issues qui ne portent aucune information mathématique. */
    public static function isInertOutcome(string $outcome): bool
    {
        return Outcome::tryFrom($outcome)?->isInert() ?? false;
    }

    /**
     * @param  mixed  $answer  La réponse brute de l'élève, forme selon answerType (null = abandon).
     * @param  array<string, mixed>  $question  La question du contenu, réponse attendue comprise.
     * @return array{outcome: string, misconceptionId: ?string, normalized: string, isCorrect: bool, feedbackKey: string}
     *
     * @throws DomainException sur un answerType inconnu ou un expectedAnswer illisible —
     *   jamais un `incorrect` silencieux, qui ferait passer un bug de contenu pour une erreur d'élève.
     */
    public function evaluate(mixed $answer, array $question): array
    {
        if ($answer === null) {
            return self::result(self::ABANDONED);
        }
        $answer = self::normalizeJsonNumbers($answer);
        $question = self::normalizeJsonNumbers($question);

        $type = array_key_exists('answerType', $question) ? $question['answerType'] : null;
        $method = is_string($type) ? match ($type) {
            'choice' => 'evaluateChoice',
            'multiChoice' => 'evaluateMultiChoice',
            'rational' => 'evaluateRational',
            'affine' => 'evaluateAffine',
            'interval' => 'evaluateInterval',
            'point' => 'evaluatePoint',
            'integerSet' => 'evaluateIntegerSet',
            'selfCheck' => 'evaluateSelfCheck',
            default => null,
        } : null;
        if ($method === null) {
            $shown = array_key_exists('answerType', $question) ? self::jsonStringify($type) : 'undefined';
            throw new DomainException("answerType inconnu : {$shown}");
        }

        return self::{$method}($answer, $question);
    }

    /* ── Ensembles d'entiers naturels (« عيّن كل قواسم العدد 84 ») ────────── */

    /**
     * Chiffres arabo-indiens (U+0660–0669) et persans (U+06F0–06F9) → ASCII ;
     * accolades, « و », séparateurs « ، ؛ ; , » et sauts de ligne → espace ;
     * un point final ôté ; découpe sur les blancs.
     *
     * @return string[]
     */
    public static function normalizeIntegerSetInput(mixed $raw): array
    {
        $s = Rational::jsString($raw);
        if (! mb_check_encoding($s, 'UTF-8')) {
            return [$s];
        }
        $s = Rational::latinDigits($s);
        // Accolades (« \{8 ; 12\} »), « و » et un point final : miroir du JS (2026-09-29).
        $s = preg_replace('/\\\\[{}]/u', ' ', $s);
        $s = preg_replace('/[{}]/u', ' ', $s);
        $s = preg_replace('/و/u', ' ', $s);
        $s = preg_replace('/[،؛;,\n]/u', ' ', $s);
        $s = preg_replace('/^['.Rational::JS_WS.']+|['.Rational::JS_WS.']+\z/u', '', $s);
        $s = preg_replace('/\.\z/u', '', $s);
        $s = preg_replace('/^['.Rational::JS_WS.']+|['.Rational::JS_WS.']+\z/u', '', $s);
        if ($s === '') {
            return [];
        }

        return preg_split('/['.Rational::JS_WS.']+/u', $s);
    }

    /**
     * @return array<int, int|float>|null l'ensemble trié, ou null si un jeton n'est pas un naturel
     */
    public static function parseIntegerSet(mixed $raw): ?array
    {
        if ($raw === null) {
            return null;
        }
        $tokens = (is_array($raw) && array_is_list($raw))
            ? array_map(Rational::jsString(...), $raw)
            : self::normalizeIntegerSetInput($raw);
        if ($tokens === []) {
            return null;
        }
        $out = [];
        foreach ($tokens as $t) {
            if (! preg_match('/^[0-9]+$/D', $t)) {
                return null;
            }
            $n = self::digitsToNumber($t);
            $out[self::numberKey($n)] = $n;
        }
        $values = array_values($out);
        usort($values, static fn ($x, $y) => $x <=> $y);

        return $values;
    }

    /** `Number("0042")` sur des chiffres ASCII ; flottant au-delà de 18 chiffres, comme JS perd l'exactitude. */
    private static function digitsToNumber(string $digits): int|float
    {
        $digits = ltrim($digits, '0');
        if ($digits === '') {
            return 0;
        }

        return strlen($digits) > 18 ? (float) $digits : (int) $digits;
    }

    private static function numberKey(int|float $n): string
    {
        return is_int($n) ? (string) $n : Rational::jsNumberToString($n);
    }

    /* ── Résultat ─────────────────────────────────────────────────────────── */

    /**
     * @return array{outcome: string, misconceptionId: ?string, normalized: string, isCorrect: bool, feedbackKey: string}
     */
    private static function result(string $outcome, ?string $misconceptionId = null, string $normalized = '', ?string $feedbackKey = null): array
    {
        $success = self::isSuccessOutcome($outcome);

        return [
            'outcome' => $outcome,
            'misconceptionId' => $misconceptionId,
            'normalized' => $normalized,
            'isCorrect' => $success,
            'feedbackKey' => $feedbackKey ?? ($success ? 'correct' : ($outcome === self::PARTIALLY_CORRECT ? 'partial' : 'incorrect')),
        ];
    }

    private static function syntaxError(string $normalized = ''): array
    {
        return self::result(self::SYNTAX_ERROR, null, $normalized);
    }

    /**
     * Cherche la réponse fausse dans les signatures déclarées par la question.
     * Comme en JS, la PREMIÈRE signature qui correspond décide, même si son id
     * est absent.
     */
    private static function matchSignature(array $question, callable $matches): ?string
    {
        $signatures = $question['misconceptionSignatures'] ?? [];
        if (! is_array($signatures)) {
            return null;
        }
        foreach ($signatures as $sig) {
            $value = is_array($sig) ? ($sig['value'] ?? null) : null;
            if ($matches($value)) {
                $id = is_array($sig) ? ($sig['id'] ?? null) : null;

                return is_string($id) ? $id : null;
            }
        }

        return null;
    }

    private static function prop(mixed $container, string $key): mixed
    {
        return is_array($container) ? ($container[$key] ?? null) : null;
    }

    /** Vérité JavaScript : `0`, `''`, `false`, `null`, `NaN` sont faux ; « 0 » (chaîne) est VRAI. */
    private static function jsTruthy(mixed $v): bool
    {
        if ($v === null || $v === false) {
            return false;
        }
        if (is_int($v) || is_float($v)) {
            return $v != 0 && ! is_nan((float) $v);
        }
        if (is_string($v)) {
            return $v !== '';
        }

        return true;
    }

    /* ── Évaluateurs par type ─────────────────────────────────────────────── */

    /**
     * Auto-évaluation (« بيّن أن »، « برّر ») : `{ text }` = démonstration
     * enregistrée et verrouillée, en attente (`abandoned`, « self:pending ») ;
     * `{ text, selfMark }` = la déclaration de l'élève après le corrigé type.
     * Miroir de `evaluateSelfCheck` (JS).
     */
    private static function evaluateSelfCheck(mixed $answer, array $question): array
    {
        $mark = self::prop($answer, 'selfMark');
        if ($mark === 'correct') {
            return self::result(self::CORRECT, null, 'self:correct');
        }
        if ($mark === 'incorrect') {
            return self::result(self::INCORRECT, null, 'self:incorrect');
        }

        if ($mark === null) {
            $text = self::prop($answer, 'text');
            if (is_string($text) && trim($text) !== '') {
                return self::result(self::ABANDONED, null, 'self:pending', 'pending');
            }
        }

        return self::syntaxError($mark === null ? '' : Rational::jsString($mark));
    }

    private static function evaluateChoice(mixed $answer, array $question): array
    {
        $picked = self::prop($answer, 'choiceId');
        $choice = null;
        foreach (self::choices($question) as $c) {
            if (($c['id'] ?? null) === $picked && array_key_exists('id', $c)) {
                $choice = $c;
                break;
            }
        }
        if ($choice === null) {
            return self::result(self::INCORRECT, null, Rational::jsString($picked));
        }
        $id = Rational::jsString($choice['id']);

        return self::jsTruthy($choice['isCorrect'] ?? null)
            ? self::result(self::CORRECT, null, $id)
            : self::result(self::INCORRECT, self::stringOrNull($choice['misconceptionId'] ?? null), $id);
    }

    private static function evaluateMultiChoice(mixed $answer, array $question): array
    {
        $rawPicked = self::prop($answer, 'choiceIds') ?? [];
        // `new Set(iterable)` : une chaîne s'itère caractère par caractère ; le reste n'est pas itérable.
        if (is_string($rawPicked)) {
            $rawPicked = mb_str_split($rawPicked);
        } elseif (! is_array($rawPicked) || ! array_is_list($rawPicked)) {
            throw new \TypeError('choiceIds is not iterable');
        }
        $picked = self::jsSet($rawPicked);
        $expected = self::jsSet(array_map(
            static fn ($c) => $c['id'] ?? null,
            array_values(array_filter(self::choices($question), static fn ($c) => self::jsTruthy($c['isCorrect'] ?? null))),
        ));

        // `Array.prototype.sort()` sans comparateur : tri par `String(v)`, où null s'écrit « null ».
        $sortKey = static fn ($v): string => $v === null ? 'null' : Rational::jsString($v);
        $sorted = array_values($picked);
        usort($sorted, static fn ($x, $y) => strcmp($sortKey($x), $sortKey($y)));
        $normalized = implode(',', array_map(Rational::jsString(...), $sorted));
        if ($picked === []) {
            return self::result(self::INCORRECT, null, $normalized);
        }

        $hitAll = true;
        foreach ($expected as $key => $_) {
            if (! array_key_exists($key, $picked)) {
                $hitAll = false;
                break;
            }
        }
        $noExtra = true;
        $wrong = null;
        foreach ($picked as $key => $id) {
            if (! array_key_exists($key, $expected)) {
                $noExtra = false;
                $wrong ??= [$id];
            }
        }
        if ($hitAll && $noExtra) {
            return self::result(self::CORRECT, null, $normalized);
        }

        // Une sélection strictement incluse dans la bonne réponse est un raisonnement
        // partiel, pas une erreur : l'élève a vu juste, mais pas tout.
        if ($noExtra) {
            return self::result(self::PARTIALLY_CORRECT, null, $normalized);
        }

        $misconceptionId = null;
        foreach (self::choices($question) as $c) {
            if (array_key_exists('id', $c) && $c['id'] === $wrong[0]) {
                $misconceptionId = self::stringOrNull($c['misconceptionId'] ?? null);
                break;
            }
        }

        return self::result(self::INCORRECT, $misconceptionId, $normalized);
    }

    private static function evaluateRational(mixed $answer, array $question): array
    {
        $value = self::prop($answer, 'value');
        $given = Rational::parse($value);
        if (! $given) {
            return self::syntaxError(Rational::jsString($value));
        }

        $expected = Rational::parse($question['expectedAnswer'] ?? null);
        if (! $expected) {
            throw new DomainException('expectedAnswer illisible pour '.Rational::jsString($question['id'] ?? null));
        }

        $policy = $question['evaluationPolicy'] ?? [];
        $policy = is_array($policy) ? $policy : [];
        $tolerance = self::jsTruthy($policy['tolerance'] ?? null) ? Rational::parse($policy['tolerance']) : null;

        if (Rational::rationalEquals($given, $expected, $tolerance)) {
            // `requiredForm: 'irreducible'` (leçon « اختزال كسر ») : la VALEUR est
            // juste mais la fraction écrite n'est pas réduite (« 21/12 » pour 7/4).
            if (($policy['requiredForm'] ?? null) === 'irreducible') {
                $written = self::rawFractionParts($value);
                if ($written && ! self::isIrreducible($written['n'], $written['d'])) {
                    $partialId = self::matchSignature($question, static function ($v) use ($written) {
                        $sig = self::rawFractionParts($v);

                        return $sig ? ($sig['n'] === $written['n'] && $sig['d'] === $written['d']) : false;
                    });

                    return self::result(self::PARTIALLY_CORRECT, $partialId, $given->toString(), 'notIrreducible');
                }
                // Une écriture DÉCIMALE n'est pas une fraction : même issue
                // partielle (jumeau exact de answerEvaluator.js).
                if (! $written && $given->d !== 1) {
                    return self::result(self::PARTIALLY_CORRECT, null, $given->toString(), 'notIrreducible');
                }
            }
            // Même valeur, écriture différente ("3/2" pour "1,5") : juste, et on peut le dire.
            // Virgule et point décimaux = MÊME écriture (propriétaire, 2026-10-07 ; jumeau de sameWriting() en JS).
            $sameText = self::sameWriting(Rational::jsString($question['expectedAnswer'] ?? null), Rational::jsString($value));

            return self::result($sameText ? self::CORRECT : self::EQUIVALENT_CORRECT, null, $given->toString());
        }

        $misconceptionId = self::matchSignature($question, static function ($v) use ($given) {
            $sig = Rational::parse($v);

            return $sig ? $sig->equals($given) : false;
        });

        return self::result(self::INCORRECT, $misconceptionId, $given->toString());
    }

    /**
     * Les composantes ÉCRITES d'une fraction « a/b » ou « \frac{a}{b} », sans
     * réduction — pour juger la forme, pas la valeur.
     *
     * @return array{n: int|float, d: int|float}|null
     */
    private static function rawFractionParts(mixed $raw): ?array
    {
        $s = Rational::normalizeNumeric($raw);
        if (! mb_check_encoding($s, 'UTF-8')) {
            return null;
        }
        if (! preg_match('/^([+-]?[0-9]+)\/([+-]?[0-9]+)$/Du', $s, $m)
            && ! preg_match('/^\\\\frac\{([+-]?[0-9]+)\}\{([+-]?[0-9]+)\}$/Du', $s, $m)) {
            return null;
        }
        $n = abs(self::digitsToNumber(ltrim($m[1], '+-')));
        $d = abs(self::digitsToNumber(ltrim($m[2], '+-')));

        return $d == 0 ? null : ['n' => $n, 'd' => $d];
    }

    /** Miroir de `isIrreducible` (arithmetic/divisibility.js) : pgcd(|n|, d) = 1, d > 0 ; pgcd(0, d) = d. */
    private static function isIrreducible(int|float $n, int|float $d): bool
    {
        if (! is_int($n) || ! is_int($d) || $n < 0 || $d <= 0) {
            return false;
        }
        if ($n === 0) {
            return $d === 1;
        }
        [$a, $b] = [$n, $d];
        while ($b !== 0) {
            [$a, $b] = [$b, $a % $b];
        }

        return $a === 1;
    }

    private static function evaluateIntegerSet(mixed $answer, array $question): array
    {
        $value = self::prop($answer, 'value');
        $given = self::parseIntegerSet($value);
        if (! $given) {
            return self::syntaxError(Rational::jsString($value));
        }

        $expected = self::parseIntegerSet($question['expectedAnswer'] ?? null);
        if (! $expected) {
            throw new DomainException('expectedAnswer illisible pour '.Rational::jsString($question['id'] ?? null));
        }

        $normalized = implode(';', array_map(self::numberKey(...), $given));
        $givenKeys = array_flip(array_map(self::numberKey(...), $given));
        $expectedKeys = array_flip(array_map(self::numberKey(...), $expected));
        $hitAll = array_diff_key($expectedKeys, $givenKeys) === [];
        $noExtra = array_diff_key($givenKeys, $expectedKeys) === [];
        if ($hitAll && $noExtra) {
            return self::result(self::CORRECT, null, $normalized);
        }

        $misconceptionId = self::matchSignature($question, static function ($v) use ($normalized) {
            $sig = self::parseIntegerSet($v);

            return $sig ? implode(';', array_map(self::numberKey(...), $sig)) === $normalized : false;
        });
        if (self::jsTruthy($misconceptionId)) {
            return self::result(self::INCORRECT, $misconceptionId, $normalized);
        }

        // Un sous-ensemble strict de la bonne réponse : l'élève a trouvé des
        // diviseurs, pas tous — la même lecture que pour multiChoice.
        if ($noExtra) {
            return self::result(self::PARTIALLY_CORRECT, null, $normalized, 'partial');
        }

        return self::result(self::INCORRECT, null, $normalized);
    }

    private static function evaluateAffine(mixed $answer, array $question): array
    {
        $given = AffineCanonical::parseAffineAnswer($answer);
        if (! $given) {
            $latex = self::prop($answer, 'latex');

            return self::syntaxError(is_string($latex) ? $latex : self::jsonStringify($answer));
        }

        $expected = AffineCanonical::parseAffineAnswer($question['expectedAnswer'] ?? null);
        if (! $expected) {
            throw new DomainException('expectedAnswer illisible pour '.Rational::jsString($question['id'] ?? null));
        }

        ['equal' => $equal, 'matchedA' => $matchedA, 'matchedB' => $matchedB] = AffineCanonical::affineEquals($given, $expected);
        $normalized = AffineCanonical::affineToString($given);
        if ($equal) {
            return self::result(self::CORRECT, null, $normalized);
        }

        $misconceptionId = self::matchSignature($question, static function ($v) use ($given) {
            $sig = AffineCanonical::parseAffineAnswer($v);

            return $sig ? AffineCanonical::affineEquals($given, $sig)['equal'] : false;
        });

        // Un seul coefficient juste : le raisonnement a porté, la lecture a manqué.
        if (($matchedA || $matchedB) && ! self::jsTruthy($misconceptionId)) {
            return self::result(self::PARTIALLY_CORRECT, null, $normalized, 'partial');
        }

        return self::result(self::INCORRECT, $misconceptionId, $normalized);
    }

    private static function evaluateInterval(mixed $answer, array $question): array
    {
        $given = IntervalCompare::parseInterval($answer);
        if (! $given) {
            return self::syntaxError(self::jsonStringify($answer));
        }

        $expected = IntervalCompare::parseInterval($question['expectedAnswer'] ?? null);
        if (! $expected) {
            throw new DomainException('expectedAnswer illisible pour '.Rational::jsString($question['id'] ?? null));
        }

        $normalized = IntervalCompare::intervalToString($given);
        if (IntervalCompare::intervalEquals($given, $expected)) {
            return self::result(self::CORRECT, null, $normalized);
        }

        $misconceptionId = self::matchSignature($question, static function ($v) use ($given) {
            $sig = IntervalCompare::parseInterval($v);

            return $sig ? IntervalCompare::intervalEquals($given, $sig) : false;
        });

        return self::result(self::INCORRECT, $misconceptionId, $normalized);
    }

    private static function evaluatePoint(mixed $answer, array $question): array
    {
        $rawX = self::prop($answer, 'x');
        $rawY = self::prop($answer, 'y');
        $x = Rational::parse($rawX);
        $y = Rational::parse($rawY);
        if (! $x || ! $y) {
            return self::syntaxError(Rational::jsString($rawX).';'.Rational::jsString($rawY));
        }

        $expectedAnswer = $question['expectedAnswer'] ?? null;
        $ex = Rational::parse(self::prop($expectedAnswer, 'x'));
        $ey = Rational::parse(self::prop($expectedAnswer, 'y'));
        if (! $ex || ! $ey) {
            throw new DomainException('expectedAnswer illisible pour '.Rational::jsString($question['id'] ?? null));
        }

        $normalized = '('.$x->toString().';'.$y->toString().')';
        $matchedX = $x->equals($ex);
        $matchedY = $y->equals($ey);
        if ($matchedX && $matchedY) {
            return self::result(self::CORRECT, null, $normalized);
        }

        $misconceptionId = self::matchSignature($question, static function ($v) use ($x, $y) {
            $sx = Rational::parse(self::prop($v, 'x'));
            $sy = Rational::parse(self::prop($v, 'y'));

            return $sx && $sy && $sx->equals($x) && $sy->equals($y);
        });
        if (($matchedX || $matchedY) && ! self::jsTruthy($misconceptionId)) {
            return self::result(self::PARTIALLY_CORRECT, null, $normalized, 'partial');
        }

        return self::result(self::INCORRECT, $misconceptionId, $normalized);
    }

    /* ── Sémantique JavaScript des valeurs JSON ────────────────────────── */

    /** @return array<int, array<string, mixed>> */
    private static function choices(array $question): array
    {
        $choices = $question['choices'] ?? [];

        return is_array($choices) ? array_values(array_filter($choices, 'is_array')) : [];
    }

    private static function stringOrNull(mixed $v): ?string
    {
        return is_string($v) ? $v : null;
    }

    /** `String.prototype.trim` : la classe de blancs JS, pas celle de PHP. */
    private static function jsTrim(string $s): string
    {
        if (! mb_check_encoding($s, 'UTF-8')) {
            return trim($s);
        }

        return preg_replace('/^['.Rational::JS_WS.']+|['.Rational::JS_WS.']+\z/u', '', $s);
    }

    /**
     * `new Set(list)` avec l'égalité SameValueZero : clé → valeur, dans l'ordre
     * de première apparition. Les tableaux (objets JS) ne se dédoublonnent
     * jamais entre eux.
     *
     * @return array<string, mixed>
     */
    private static function jsSet(array $values): array
    {
        $set = [];
        $i = 0;
        foreach ($values as $v) {
            $key = match (true) {
                $v === null => 'null',
                is_bool($v) => 'b:'.($v ? '1' : '0'),
                is_int($v), is_float($v) => 'n:'.self::numberKey($v),
                is_string($v) => 's:'.$v,
                default => 'o:'.($i++),
            };
            if (! array_key_exists($key, $set)) {
                $set[$key] = $v;
            }
        }

        return $set;
    }

    /**
     * JSON n'a qu'un type numérique et JS non plus : « 2.0 » décodé en flottant
     * PHP redevient l'entier 2, pour que `===`, `String()` et `JSON.stringify`
     * se comportent comme côté JS.
     */
    private static function normalizeJsonNumbers(mixed $v): mixed
    {
        if (is_float($v)) {
            return (is_finite($v) && floor($v) === $v && abs($v) < 9.0e18) ? (int) $v : $v;
        }
        if (is_array($v)) {
            foreach ($v as $k => $item) {
                $v[$k] = self::normalizeJsonNumbers($item);
            }
        }

        return $v;
    }

    /** `JSON.stringify(v ?? null)` : ordre des clés conservé, ni espace ni échappement superflu. */
    private static function jsonStringify(mixed $v): string
    {
        if ($v === null) {
            return 'null';
        }
        if (is_float($v)) {
            return is_finite($v) ? Rational::jsNumberToString($v) : 'null';
        }
        if (is_array($v)) {
            if (array_is_list($v)) {
                return '['.implode(',', array_map(self::jsonStringify(...), $v)).']';
            }
            $pairs = [];
            foreach ($v as $k => $item) {
                $pairs[] = self::jsonStringify((string) $k).':'.self::jsonStringify($item);
            }

            return '{'.implode(',', $pairs).'}';
        }

        return json_encode($v, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_LINE_TERMINATORS | JSON_INVALID_UTF8_SUBSTITUTE);
    }

    /** Deux écritures identiques au séparateur décimal près (« , » « . » « ٫ ») — jumeau de sameWriting() (JS). */
    private static function sameWriting(string $a, string $b): bool
    {
        $norm = static fn (string $v): string => str_replace(['.', '٫'], ',', self::jsTrim($v));

        return $norm($a) === $norm($b);
    }
}
