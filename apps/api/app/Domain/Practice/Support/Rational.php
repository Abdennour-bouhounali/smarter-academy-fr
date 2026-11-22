<?php

namespace App\Domain\Practice\Support;

/**
 * Arithmétique rationnelle EXACTE — portage de packages/core/practice/rational.js.
 *
 * Équivalence sémantique verrouillée par la fixture partagée
 * packages/core/practice/fixtures/answers.json (voir AnswerEvaluator). Toute
 * divergence avec le JS est un bug de CE fichier, jamais une raison de toucher
 * la fixture.
 *
 * Points où PHP et JS ne se ressemblent pas, et qui sont traités ici :
 *   - `\d` et `\s` sous le modificateur `/u` sont Unicode en PCRE (« ١ » est un
 *     chiffre, U+00A0 un blanc) alors qu'ils sont ASCII / liste fixe en JS. On
 *     écrit donc `[0-9]` et la classe de blancs JS en clair (JS_WS).
 *   - JS n'a qu'un type Number : `String(1.5)`, `String(2)`, `String(1e21)`
 *     sont reproduits par jsString(), et un flottant entier (2.0) est traité
 *     comme l'entier 2.
 *   - `$` de PCRE accepte un « \n » final ; on utilise le modificateur `D`.
 */
final class Rational
{
    /**
     * La borne d'une composante : tout entier SÛR de JavaScript (2^53 − 1), miroir de rational.js.
     * Jusqu'au 2026-10-02 elle valait ⌊√(2^53 − 1)⌋ pour que les produits en croix tiennent dans
     * un double JS — ce qui refusait une réponse comme 132 000 000. Les produits en croix se font
     * désormais en bcmath (ici) et en BigInt (JS) : exacts, sans dépassement d'int64.
     */
    public const MAX_SAFE_COMPONENT = 9007199254740991;

    /**
     * La classe `\s` de JavaScript (WhiteSpace + LineTerminator), en clair :
     * c'est aussi ce que `String.prototype.trim` retire.
     */
    public const JS_WS = '\t\n\x0B\f\r \x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}';

    /** Toujours construit via les fabriques : d > 0 et pgcd(|n|, d) = 1. */
    private function __construct(
        public readonly int $n,
        public readonly int $d,
    ) {}

    private static function gcd(int $a, int $b): int
    {
        $a = abs($a);
        $b = abs($b);
        while ($b !== 0) {
            [$a, $b] = [$b, $a % $b];
        }

        return $a === 0 ? 1 : $a;
    }

    /** Réduit et normalise le signe (porté par le numérateur). */
    public static function of(int|float $n, int|float $d = 1): ?self
    {
        $n = self::toInteger($n);
        $d = self::toInteger($d);
        if ($n === null || $d === null || $d === 0) {
            return null;
        }
        if (abs($n) > self::MAX_SAFE_COMPONENT || abs($d) > self::MAX_SAFE_COMPONENT) {
            return null;
        }
        $sign = $d < 0 ? -1 : 1;
        $g = self::gcd($n, $d);

        return new self(intdiv($sign * $n, $g), intdiv($sign * $d, $g));
    }

    /**
     * `Number.isInteger(x)` puis la valeur : un flottant entier devient un int,
     * un flottant non entier (ou hors int64) devient null.
     */
    private static function toInteger(int|float $x): ?int
    {
        if (is_int($x)) {
            return $x;
        }
        if (! is_finite($x) || floor($x) !== $x) {
            return null;
        }
        // Hors int64 : de toute façon bien au-delà de MAX_SAFE_COMPONENT.
        if (abs($x) > 9.0e18) {
            return null;
        }

        return (int) $x;
    }

    /**
     * Normalise une saisie avant analyse — même chaîne de remplacements que le
     * JS, dans le même ordre : tirets Unicode → « - », blancs (classe `\s` JS,
     * U+202F, U+00A0, U+2009) retirés, enrobages LaTeX de MathLive retirés
     * (NB : le JS écrit `\;` qui, en regex JS, est un « ; » nu — on retire donc
     * les points-virgules, pas « \; »), `$` de tête et de queue retirés,
     * virgule décimale → point.
     */
    /** Chiffres arabo-indiens (U+0660) et persans (U+06F0) → ASCII — miroir de `toLatinDigits` (numberFormat.js). */
    public static function latinDigits(string $s): string
    {
        $s = preg_replace_callback('/[\x{0660}-\x{0669}]/u', static fn ($m) => (string) (mb_ord($m[0]) - 0x0660), $s);

        return preg_replace_callback('/[\x{06F0}-\x{06F9}]/u', static fn ($m) => (string) (mb_ord($m[0]) - 0x06F0), $s);
    }

    public static function normalizeNumeric(mixed $raw): string
    {
        $s = self::jsString($raw);
        if (! mb_check_encoding($s, 'UTF-8')) {
            return $s;
        }
        // Miroir de `toLatinDigits` + ٫ (U+066B) → « . » et ∕ (U+2215) → « / » (JS, 2026-09-29).
        $s = self::latinDigits($s);
        $s = str_replace(["\u{066B}", "\u{2215}"], ['.', '/'], $s);
        $s = preg_replace('/[\x{2212}\x{2012}\x{2013}\x{2014}\x{2015}]/u', '-', $s);
        $s = preg_replace('/['.self::JS_WS.'\x{202F}\x{00A0}\x{2009}]/u', '', $s);
        $s = preg_replace('/\\\\left|\\\\right|\\\\,|;|\\\\!|\\\\ /u', '', $s);
        $s = preg_replace('/^\$|\$\z/u', '', $s);

        return str_replace(',', '.', $s);
    }

    /**
     * Lit une réponse d'élève. `null` pour TOUTE saisie non analysable.
     * Formes : entier, décimal (virgule ou point), `a/b`, `\frac{a}{b}`, `n%`.
     */
    public static function parse(mixed $raw): ?self
    {
        if ($raw === null) {
            return null;
        }
        if (is_int($raw) || is_float($raw)) {
            return is_finite($raw) ? self::fromNumber($raw) : null;
        }
        if (! is_string($raw)) {
            return null;
        }

        $s = self::normalizeNumeric($raw);
        if ($s === '') {
            return null;
        }
        if (! mb_check_encoding($s, 'UTF-8')) {
            return null;
        }

        // \frac{a}{b} — MathLive peut l'émettre.
        if (preg_match('/^\\\\frac\{([+-]?[0-9]+)\}\{([+-]?[0-9]+)\}$/Du', $s, $m)) {
            return self::of(self::jsNumber($m[1]), self::jsNumber($m[2]));
        }

        // Pourcentage : 50% → 1/2. La récursion re-normalise, comme en JS.
        if (str_ends_with($s, '%')) {
            $inner = self::parse(substr($s, 0, -1));

            return $inner ? self::of($inner->n, $inner->d * 100) : null;
        }

        // Fraction a/b.
        if (preg_match('/^([+-]?[0-9]+)\/([+-]?[0-9]+)$/Du', $s, $m)) {
            return self::of(self::jsNumber($m[1]), self::jsNumber($m[2]));
        }

        // Décimal ou entier — converti EXACTEMENT, sans passer par un flottant.
        if (! preg_match('/^([+-]?)([0-9]*)(?:\.([0-9]+))?$/Du', $s, $m)) {
            return null;
        }
        $sign = $m[1];
        $whole = $m[2];
        $frth = $m[3] ?? null;
        if ($whole === '' && ($frth === null || $frth === '')) {
            return null;
        }
        if ($frth === null) {
            return self::of(self::jsNumber($sign.$whole), 1);
        }
        if (strlen($frth) > 12) {
            return null; // au-delà, ce n'est plus une réponse d'élève
        }
        $scale = 10 ** strlen($frth);

        return self::of(self::jsNumber($sign.($whole === '' ? '0' : $whole).$frth), $scale);
    }

    /**
     * `Number("+0042")` : un entier signé écrit en chiffres ASCII. Au-delà de
     * 18 chiffres significatifs, on rend un flottant — comme JS, et de toute
     * façon hors de MAX_SAFE_COMPONENT.
     */
    private static function jsNumber(string $digits): int|float
    {
        $sign = 1;
        if ($digits !== '' && ($digits[0] === '+' || $digits[0] === '-')) {
            $sign = $digits[0] === '-' ? -1 : 1;
            $digits = substr($digits, 1);
        }
        $digits = ltrim($digits, '0');
        if ($digits === '') {
            return 0;
        }
        if (strlen($digits) > 18) {
            return $sign * (float) $digits;
        }

        return $sign * (int) $digits;
    }

    /** Conversion depuis un nombre : `toFixed(12)` puis relecture exacte. */
    public static function fromNumber(int|float $x): ?self
    {
        if (is_int($x)) {
            return self::of($x, 1);
        }
        if (! is_finite($x)) {
            return null;
        }
        if (floor($x) === $x) {
            return abs($x) > self::MAX_SAFE_COMPONENT ? null : self::of((int) $x, 1);
        }
        // 12 décimales : au-delà on est dans le bruit de représentation binaire.
        $s = number_format($x, 12, '.', '');
        $s = preg_replace('/0+$/D', '', $s);
        $s = preg_replace('/\.$/D', '', $s);

        return self::parse($s);
    }

    public function equals(mixed $other): bool
    {
        return $other instanceof self && $this->n === $other->n && $this->d === $other->d;
    }

    /** −1, 0 ou 1. Produit en croix en bcmath : exact, jamais de flottant ni de dépassement. */
    public function compare(self $other): int
    {
        $left = bcmul((string) $this->n, (string) $other->d, 0);
        $right = bcmul((string) $other->n, (string) $this->d, 0);

        return bccomp($left, $right, 0);
    }

    public function add(self $other): ?self
    {
        return self::fromBig(
            bcadd(bcmul((string) $this->n, (string) $other->d, 0), bcmul((string) $other->n, (string) $this->d, 0), 0),
            bcmul((string) $this->d, (string) $other->d, 0),
        );
    }

    public function subtract(self $other): ?self
    {
        return self::fromBig(
            bcsub(bcmul((string) $this->n, (string) $other->d, 0), bcmul((string) $other->n, (string) $this->d, 0), 0),
            bcmul((string) $this->d, (string) $other->d, 0),
        );
    }

    /** Une fraction calculée en bcmath, réduite, rendue si ses composantes restent sûres (sinon null) — miroir de `fromBig` (JS). */
    private static function fromBig(string $n, string $d): ?self
    {
        if (bccomp($d, '0', 0) === 0) {
            return null;
        }
        if (bccomp($d, '0', 0) < 0) {
            $n = bcmul($n, '-1', 0);
            $d = bcmul($d, '-1', 0);
        }
        $a = ltrim($n, '-');
        $b = $d;
        while (bccomp($b, '0', 0) !== 0) {
            [$a, $b] = [$b, bcmod($a, $b, 0)];
        }
        $g = bccomp($a, '0', 0) === 0 ? '1' : $a;
        $n = bcdiv($n, $g, 0);
        $d = bcdiv($d, $g, 0);
        $max = (string) self::MAX_SAFE_COMPONENT;
        if (bccomp(ltrim($n, '-'), $max, 0) > 0 || bccomp($d, $max, 0) > 0) {
            return null;
        }

        return self::of((int) $n, (int) $d);
    }

    public function abs(): ?self
    {
        return self::of(abs($this->n), $this->d);
    }

    public function isZero(): bool
    {
        return $this->n === 0;
    }

    public function sign(): int
    {
        return $this->n <=> 0;
    }

    /** Affichage SEULEMENT. Ne jamais comparer sur cette valeur. */
    public function toNumber(): float
    {
        return $this->n / $this->d;
    }

    /** Forme canonique stable, pour `normalized_answer` et les traces d'audit. */
    public function toString(): string
    {
        return $this->d === 1 ? (string) $this->n : "{$this->n}/{$this->d}";
    }

    public function __toString(): string
    {
        return $this->toString();
    }

    /** Égalité de deux réponses, à une tolérance rationnelle près (`null` = exact). */
    public static function rationalEquals(?self $a, ?self $b, ?self $tolerance = null): bool
    {
        if ($a === null || $b === null) {
            return false;
        }
        if ($tolerance === null) {
            return $a->equals($b);
        }
        $diff = $a->subtract($b);

        return $diff !== null && $diff->abs()->compare($tolerance) <= 0;
    }

    /* ── Sémantique JavaScript des valeurs JSON ────────────────────────── */

    /**
     * `String(v)` de JavaScript pour une valeur décodée de JSON : null → « »,
     * booléens en toutes lettres, nombres au format JS, liste jointe par des
     * virgules, objet → « [object Object] ».
     */
    public static function jsString(mixed $v): string
    {
        if ($v === null) {
            return '';
        }
        if (is_bool($v)) {
            return $v ? 'true' : 'false';
        }
        if (is_int($v)) {
            return (string) $v;
        }
        if (is_float($v)) {
            return self::jsNumberToString($v);
        }
        if (is_string($v)) {
            return $v;
        }
        if (is_array($v)) {
            if (! array_is_list($v)) {
                return '[object Object]';
            }

            return implode(',', array_map(self::jsString(...), $v));
        }

        return (string) $v;
    }

    /** `Number.prototype.toString()` : représentation la plus courte, notation JS. */
    public static function jsNumberToString(float $x): string
    {
        if (is_nan($x)) {
            return 'NaN';
        }
        if (is_infinite($x)) {
            return $x > 0 ? 'Infinity' : '-Infinity';
        }
        if ($x === 0.0) {
            return '0';
        }
        $neg = $x < 0;
        $x = abs($x);
        // Chiffres significatifs les plus courts (serialize_precision = -1).
        $sci = sprintf('%.17e', $x);
        for ($p = 0; $p <= 17; $p++) {
            $try = sprintf('%.'.$p.'e', $x);
            if ((float) $try === $x) {
                $sci = $try;
                break;
            }
        }
        [$mant, $exp] = explode('e', $sci);
        $digits = rtrim(str_replace('.', '', $mant), '0');
        if ($digits === '') {
            $digits = '0';
        }
        $k = strlen($digits);
        $n = (int) $exp + 1; // valeur = 0.d1…dk × 10^n

        if ($k <= $n && $n <= 21) {
            $out = $digits.str_repeat('0', $n - $k);
        } elseif (0 < $n && $n <= 21) {
            $out = substr($digits, 0, $n).'.'.substr($digits, $n);
        } elseif (-6 < $n && $n <= 0) {
            $out = '0.'.str_repeat('0', -$n).$digits;
        } else {
            $e = $n - 1;
            $out = ($k === 1 ? $digits : $digits[0].'.'.substr($digits, 1)).'e'.($e >= 0 ? '+' : '-').abs($e);
        }

        return ($neg ? '-' : '').$out;
    }
}
