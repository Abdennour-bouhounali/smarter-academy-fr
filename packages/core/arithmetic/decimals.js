/**
 * decimals — l'arithmétique EXACTE des nombres décimaux et des fractions décimales (1AM, unité 1, درس « الكسور العشرية والكتابة
 * العشرية », labo `decimal-comma`). Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/decimals.js`), jamais depuis le barrel du core.
 *
 * Une valeur est `{ n, k }` = n / 10^k, avec `n` un ENTIER SÛR (`Number.isSafeInteger`) ≥ 0 et `k` un entier ≥ 0. Aucune virgule
 * flottante : les comparaisons et les déplacements de virgule passent par BigInt, le texte est fabriqué chiffre par chiffre.
 * Une « bande de chiffres » (slip) est un couple (`digits`, `point`) : une chaîne de 1 à 15 chiffres latins et le nombre de chiffres
 * placés APRÈS la virgule (0 = pas de partie décimale, `digits.length` = la virgule devant le premier chiffre) ; sa valeur est
 * `Number(digits) / 10^point`.
 *
 *     parse('2,35')            // { n: 235, k: 2 }
 *     parse('3125/1000')       // { n: 3125, k: 3 }  — le dénominateur doit être 1, 10, 100, 1000 …
 *     format({ n: 250, k: 2 }) // '2,50'              formatTrim → '2,5'
 *     shift({ n: 35, k: 1 }, -2) // { n: 35, k: 3 }  → 0,035
 */
import { RANK_NAMES, toArabicWords } from './placeValue.js';

const big = (x) => BigInt(x);
const P10 = (k) => 10n ** big(k);
const toSafe = (b) => {
  const n = Number(b);
  if (!Number.isSafeInteger(n)) throw new RangeError('decimals: value out of the safe integer range');
  return n;
};

const MAX_DIGITS = 15;

/** 10^k, exact tant que k ≤ 15. */
export const pow10 = (k) => toSafe(P10(k));

/** Une valeur, validée. */
export function make(n, k = 0) {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isInteger(k) || k < 0 || k > MAX_DIGITS) throw new RangeError('decimals.make: n and k must be non-negative safe integers');
  return Object.freeze({ n, k });
}

/** Les chiffres d'une bande de chiffres, vérifiés. */
const checkDigits = (digits) => {
  if (typeof digits !== 'string' || !/^[0-9]{1,15}$/.test(digits)) throw new RangeError(`decimals: digits must be 1–${MAX_DIGITS} Latin digits (got ${JSON.stringify(digits)})`);
  return digits;
};

/** La valeur d'une bande : `digits` avec `point` chiffres après la virgule. */
export function fromSlip(digits, point) {
  checkDigits(digits);
  if (!Number.isInteger(point) || point < 0 || point > digits.length) throw new RangeError('decimals.fromSlip: point must be within the digits');
  return make(Number(digits), point);
}

/**
 * Lit « 2,35 », « 2.35 », « 12 », « 0,05 », « 3125/1000 » (dénominateur 1, 10, 100 … seulement). Les espaces (y compris U+00A0) sont
 * ignorés. Retourne `null` si le texte n'est pas un décimal / une fraction décimale.
 */
export function parse(text) {
  if (typeof text !== 'string' && typeof text !== 'number') return null;
  const s = String(text).replace(/[\s  ]/g, '');
  let m = /^(\d+)\/(\d+)$/.exec(s);
  if (m) {
    const den = m[2];
    if (!/^10*$/.test(den)) return null;
    if (m[1].length > MAX_DIGITS) return null;
    return make(Number(m[1]), den.length - 1);
  }
  m = /^(\d+)(?:[,.](\d+))?$/.exec(s);
  if (!m) return null;
  const frac = m[2] ?? '';
  const digits = `${m[1]}${frac}`.replace(/^0+(?=\d)/, '');
  if (digits.length > MAX_DIGITS) return null;
  return make(Number(digits), frac.length);
}

/** Les deux valeurs sur la même échelle (BigInt). */
const align = (a, b) => {
  const k = Math.max(a.k, b.k);
  return [big(a.n) * P10(k - a.k), big(b.n) * P10(k - b.k), k];
};
export function cmp(a, b) {
  const [x, y] = align(a, b);
  return x === y ? 0 : x < y ? -1 : 1;
}
export const eq = (a, b) => cmp(a, b) === 0;

/** Enlève les zéros inutiles de la fin de la partie décimale : { 250, 2 } → { 25, 1 } ; { 1200, 2 } → { 12, 0 }. */
export function normalize(v) {
  let { n, k } = v;
  while (k > 0 && n % 10 === 0) { n /= 10; k -= 1; }
  return make(n, k);
}

/** L'écriture avec la VIRGULE : tous les chiffres de la partie décimale gardés (`k` chiffres), zéro devant la virgule si besoin. */
export function format(v) {
  const { n, k } = v;
  const s = String(n).padStart(k + 1, '0');
  return k === 0 ? s : `${s.slice(0, s.length - k)},${s.slice(s.length - k)}`;
}
/** La même, sans zéro inutile à la fin de la partie décimale (2,50 → 2,5 ; 12,0 → 12). */
export const formatTrim = (v) => format(normalize(v));

/**
 * La bande telle qu'elle est ÉCRITE (les chiffres imprimés, zéros de tête gardés tels quels, zéros de fin gardés) :
 * ('235', 2) → '2,35' ; ('05', 2) → '0,05' ; ('05', 0) → '05' ; ('35', 2) → '0,35' (la virgule devant le premier chiffre imprime « 0, »).
 */
export function slipText(digits, point) {
  checkDigits(digits);
  const len = digits.length;
  if (point <= 0) return digits;
  if (point >= len) return `0,${digits}`;
  return `${digits.slice(0, len - point)},${digits.slice(len - point)}`;
}

/** Le texte de la valeur d'une bande, sans zéro inutile (la forme canonique « value » des rapports). */
export const slipValueText = (digits, point) => formatTrim(fromSlip(digits, point));

/** La fraction décimale n / 10^k : numérateur, dénominateur (10^k), nombre de zéros du dénominateur. */
export function fractionOf(v) {
  return { num: v.n, den: pow10(v.k), zeros: v.k, text: `${v.n}/${pow10(v.k)}` };
}
export const fractionText = (v) => `${v.n}/${pow10(v.k)}`;

/** × 10^e (e entier, négatif = division) : exact, la virgule glisse, des zéros apparaissent là où il le faut. */
export function shift(v, e) {
  if (e >= 0) {
    const gone = Math.min(e, v.k);
    return make(toSafe(big(v.n) * P10(e - gone)), v.k - gone);
  }
  return make(v.n, v.k - e);
}

/** L'exposant d'une opération de la machine : « ×1000 » → 3 ; « ÷100 » → −2 ; « ×0,01 » → −2 ; « ÷0,1 » → 1. null si inconnue. */
export function opExponent(op) {
  const m = /^([×÷])\s*(10|100|1000|0[,.]1|0[,.]01|0[,.]001)$/.exec(String(op).replace(/\s/g, ''));
  if (!m) return null;
  const j = { 10: 1, 100: 2, 1000: 3, '0,1': -1, '0,01': -2, '0,001': -3 }[m[2].replace('.', ',')];
  return m[1] === '×' ? j : -j;
}
export const OPERATORS = Object.freeze(['×10', '×100', '×1000', '÷10', '÷100', '÷1000', '×0,1', '×0,01', '×0,001']);

/** Le nombre de chiffres que contient la partie entière d'une valeur (sans zéro de tête, mais « 0 » compte 1). */
export const integerPart = (v) => toSafe(big(v.n) / P10(v.k));

/**
 * Le NOMBRE de pièces du rang d'exposant e (« عدد الأعشار » pour e = −1, à ne pas confondre avec le CHIFFRE de ce rang) : ⌊v / 10^e⌋.
 *   countOfExp(217,48; −1) → 2174 ; countOfExp(217,48; −2) → 21748 ; countOfExp(217,48; 1) → 21.
 */
export function countOfExp(v, e) {
  const m = e >= 0 ? big(v.n) / P10(v.k + e) : big(v.n) * P10(-e) / P10(v.k);
  return toSafe(m);
}

/* ── Rangs ───────────────────────────────────────────────────────────────────────────────── */

/** Le nom du rang d'exposant e (e ≥ 0 : unités, dizaines … ; e < 0 : dixièmes, centièmes …). */
const FINE_NAMES = ['الأعشار', 'الأجزاء من مائة', 'الأجزاء من ألف', 'الأجزاء من عشرة آلاف', 'الأجزاء من مائة ألف', 'الأجزاء من مليون'];
export function rankName(e) {
  if (e >= 0) return RANK_NAMES[e] ?? `10^${e}`;
  return FINE_NAMES[-e - 1] ?? `10^${e}`;
}
/** Pour chaque chiffre d'une bande (de gauche à droite) : son exposant — le dernier chiffre avant la virgule vaut 0. */
export const exponentsOf = (digits, point) => Array.from(checkDigits(digits), (_, i) => digits.length - 1 - i - point);

/** La décomposition par rangs, du plus haut au plus bas, sans les rangs vides : [{ digit, exp }]. */
export function decomposeDigits(v) {
  const s = String(v.n).padStart(v.k + 1, '0');
  const out = [];
  for (let i = 0; i < s.length; i += 1) {
    const d = Number(s[i]);
    if (d !== 0) out.push({ digit: d, exp: s.length - 1 - i - v.k });
  }
  return out;
}
/** Tous les rangs (zéros compris) de la valeur, du plus haut au plus bas : [{ digit, exp }] (la partie entière toujours au moins « 0 »). */
export function rankTable(v) {
  const s = String(v.n).padStart(v.k + 1, '0');
  return Array.from(s, (c, i) => ({ digit: Number(c), exp: s.length - 1 - i - v.k }));
}

const pw = (e) => (e >= 0 ? pow10(e) : null);
/** Un terme de la somme : « 3/10 », « 5/100 », « 4 × 10 », « 2 » (les unités). */
function termFraction({ digit, exp }) { return exp >= 0 ? (exp === 0 ? `${digit}` : `${digit} × ${pw(exp)}`) : `${digit}/${pow10(-exp)}`; }
function termTimes({ digit, exp }) { return exp === 0 ? `${digit}` : exp > 0 ? `${digit} × ${pw(exp)}` : `${digit} × ${format(make(1, -exp))}`; }
/**
 * Le « مفكوك » : 2,35 → '2 + 3/10 + 5/100' et '2 + 3 × 0,1 + 5 × 0,01' ; les rangs vides n'y figurent pas ; 0 → '0'.
 */
export function decomposition(v) {
  const parts = decomposeDigits(v);
  if (parts.length === 0) return { fraction: '0', times: '0', parts };
  return { fraction: parts.map(termFraction).join(' + '), times: parts.map(termTimes).join(' + '), parts };
}

/* ── Lecture en arabe ─────────────────────────────────────────────────────────────────────── */

/**
 * Le nom de la pièce (« عُشر », « جزء من مائة » …) accordé à son nombre : 1 → singulier, 2 → duel, 3–10 → pluriel,
 * 11–99 → accusatif singulier ; à partir de 100 on regarde les deux derniers chiffres (100, 101, 102 : singulier ; 103–110 : pluriel). k = nombre de zéros du dénominateur (1 : dixièmes, 2 : centièmes, 3 : millièmes …).
 */
export function partName(k, count) {
  const base = k === 1 ? { one: 'عُشر', two: 'عُشران', few: 'أعشار', many: 'عُشرًا' }
    : { one: `جزء من ${denWord(k)}`, two: `جزآن من ${denWord(k)}`, few: `أجزاء من ${denWord(k)}`, many: `جزءًا من ${denWord(k)}` };
  // à partir de 100 le nom s'accorde avec les DEUX derniers chiffres : 100, 101, 102 → singulier ; 103–110 → pluriel ; 111–199 → accusatif
  const r = count >= 100 ? count % 100 : count;
  if (count >= 100 && r <= 2) return base.one;
  if (r === 1) return base.one;
  if (r === 2) return base.two;
  if (r >= 3 && r <= 10) return base.few;
  return base.many;
}
const DEN_WORDS = { 2: 'مائة', 3: 'ألف', 4: 'عشرة آلاف', 5: 'مائة ألف', 6: 'مليون' };
const denWord = (k) => DEN_WORDS[k] ?? `10^${k}`;

/** « مئتان وخمسة وثلاثون جزءًا من مائة » : la fraction décimale n / 10^k lue en toutes lettres (k = 0 : le nombre seul). */
export function readFraction(v) {
  const words = toArabicWords(v.n);
  if (v.k === 0) return words;
  return `${words} ${partName(v.k, v.n)}`;
}

/**
 * La lecture par rangs de la PARTIE DÉCIMALE : « ثلاثة أعشار وخمسة أجزاء من مائة » (rangs vides omis, un chiffre par rang) ;
 * '' quand la valeur est entière.
 */
export function readTail(v) {
  const parts = decomposeDigits(v).filter((p) => p.exp < 0);
  return parts.map((p) => `${toArabicWords(p.digit)} ${partName(-p.exp, p.digit)}`).join(' و');
}

/* ── Pièces (le monde « mosaïque ») ──────────────────────────────────────────────────────── */

/**
 * Les pièces d'une valeur, honnêtes : le chiffre des unités compte des panneaux (1), celui des dixièmes des bandes (1/10), celui des
 * centièmes des carreaux (1/100), celui des millièmes des éclats (1/1000) ; les rangs au-dessus des unités comptent
 * des paquets de 10 / 100 panneaux (`tens`, `hundreds`) ou, plus haut, un total de panneaux (`more`) ; les rangs plus fins que
 * les éclats ne se dessinent pas (`finer` : leur valeur exacte, un décimal).
 *   → { units, tenths, hundredths, thousandths, tens, hundreds, more, panels (total exact ≥ unités), finer: {n,k}|null }
 */
export function piecesOf(v) {
  const d = (e) => {
    const c = countOfExp(v, e);
    const next = countOfExp(v, e + 1);
    return c - next * 10;
  };
  const panelsAbove = integerPart(v);
  const units = d(0);
  const tens = d(1);
  const hundreds = d(2);
  const more = toSafe((big(panelsAbove) / 1000n) * 1000n); // les panneaux des rangs ≥ milliers, d'un bloc (multiple de 1000)
  const finerN = v.k > 3 ? make(Number(big(v.n) % P10(v.k - 3)), v.k) : null;
  return {
    units, tens, hundreds, more,
    tenths: v.k >= 1 ? d(-1) : 0,
    hundredths: v.k >= 2 ? d(-2) : 0,
    thousandths: v.k >= 3 ? d(-3) : 0,
    panels: panelsAbove,
    finer: finerN && finerN.n !== 0 ? finerN : null,
  };
}

/* ── La règle graduée (le labo `ruler-compare`, 1AM, unité 1, درس « مقارنة الأعداد العشرية وترتيبها ») ─────────────────── */

/** Les graduations d'une règle : 0 = le mètre, 1 = le décimètre, 2 = le centimètre, 3 = le millimètre (10^g graduations par mètre). */
export const GRADUATIONS = Object.freeze([0, 1, 2, 3]);

/**
 * La LECTURE d'une longueur `v` (en mètres) sur une règle graduée au rang `g` : un nombre ENTIER de graduations, `count` = ⌊v · 10^g⌋,
 * et un RESTE strictement plus petit qu'une graduation, exact (jamais arrondi) : `rest` est une valeur `{ n, k }` de l'intervalle [0 ; 1[
 * (en graduations) et `restIsZero` dit si la longueur tombe juste sur un trait.
 *     readAt(parse('4,35'), 1) // { count: 43, rest: { n: 5, k: 1 }, restIsZero: false }   — 43 dm + 5/10 de dm
 *     readAt(parse('4,6'), 2)  // { count: 460, rest: { n: 0, k: 0 }, restIsZero: true }
 */
export function readAt(v, g) {
  if (!Number.isInteger(g) || g < 0 || g > MAX_DIGITS) throw new RangeError('decimals.readAt: g must be a small non-negative integer');
  if (g >= v.k) return { count: toSafe(big(v.n) * P10(g - v.k)), rest: make(0, 0), restIsZero: true };
  const unit = P10(v.k - g);
  const count = toSafe(big(v.n) / unit);
  const r = toSafe(big(v.n) % unit);
  return { count, rest: r === 0 ? make(0, 0) : make(r, v.k - g), restIsZero: r === 0 };
}

/**
 * La règle au rang `g` SÉPARE-T-ELLE a et b ? Oui quand les deux lectures entières diffèrent, ou quand elles sont égales et que ni
 * l'une ni l'autre n'a de reste (les deux longueurs tombent sur le même trait : elles sont égales). Sinon la règle est trop grossière :
 * 4,6 et 4,65 se lisent « 46 dm » tous les deux. Monotone en g : une fois séparés, toujours séparés.
 */
export function decidedAt(a, b, g) {
  const x = readAt(a, g);
  const y = readAt(b, g);
  return x.count !== y.count || (x.restIsZero && y.restIsZero);
}

/** Le verdict que donnent les lectures entières au rang `g` : −1, 0 ou 1 ; `null` si la règle ne sépare pas (`decidedAt` faux). */
export function verdictAt(a, b, g) {
  if (!decidedAt(a, b, g)) return null;
  const x = readAt(a, g).count;
  const y = readAt(b, g).count;
  return x === y ? 0 : x < y ? -1 : 1;
}

/** La plus fine graduation utile (0…3) à partir de laquelle la règle sépare a et b ; `null` si 3 ne suffit pas (plus de 3 décimales). */
export function minGraduation(a, b) {
  return GRADUATIONS.find((g) => decidedAt(a, b, g)) ?? null;
}

/** Le premier rang (0 = les unités, 1 = les dixièmes, …) où les chiffres de a et de b diffèrent ; `null` si a = b. Égal à `minGraduation` quand a ≠ b. */
export function firstDifferingRank(a, b) {
  const [x, y, k] = align(a, b);
  if (x === y) return null;
  const w = Math.max(String(x).length, String(y).length, k + 1);
  const sa = String(x).padStart(w, '0');
  const sb = String(y).padStart(w, '0');
  const wholeLen = w - k;
  for (let i = 0; i < w; i += 1) if (sa[i] !== sb[i]) return Math.max(0, i - wholeLen + 1);
  return null;
}

/** La valeur écrite avec exactement `k` chiffres après la virgule (zéros inutiles ajoutés) : (4,6 ; 2) → « 4,60 » ; k plus petit que celui de la valeur : inchangée. */
export function paddedText(v, k) {
  return format(make(toSafe(big(v.n) * P10(Math.max(0, k - v.k))), Math.max(k, v.k)));
}

/** La plus petite graduation qui sépare TOUTES les paires d'une liste de valeurs ; `null` si aucune (plus de 3 décimales). */
export function rowGraduation(values) {
  for (const g of GRADUATIONS) {
    let ok = true;
    for (let i = 0; i < values.length && ok; i += 1) for (let j = i + 1; j < values.length && ok; j += 1) ok = decidedAt(values[i], values[j], g);
    if (ok) return g;
  }
  return null;
}

/* ── Approximations, rounding and bracketing (3AM unit 5, lesson `hasr-adad-ushri`, lab `scoop-scale`, 2026-10-26) ──────────────────────
 * A rank k is the exponent of 10^-k (k = 0 the unit, 1 the tenth, 2 the hundredth, 3 the thousandth). All BigInt underneath; the values stay
 * positive `{ n, k }`. `floorAt` / `ceilAt` are the approximations BY DEFECT / BY EXCESS, `roundAt` the rounding (HALF UP: a next digit of 5 or
 * more rounds up), `roundingInterval` the inverse (every number whose rounding at rank k is r), `quotientDigits` / `quotientBracket` read a
 * calculator quotient. */
const scaleTo = (v, k) => (k >= v.k ? big(v.n) * P10(k - v.k) : null);
const checkRank = (k) => { if (!Number.isInteger(k) || k < 0 || k > MAX_DIGITS) throw new RangeError('decimals: rank out of range'); };

/** The approximation by defect of v at rank k: the greatest multiple of 10^-k that is ≤ v. */
export function floorAt(v, k) {
  checkRank(k);
  if (v.k <= k) return make(toSafe(scaleTo(v, k)), k);
  return make(toSafe(big(v.n) / P10(v.k - k)), k);
}
/** The approximation by excess of v at rank k: the least multiple of 10^-k that is ≥ v (equal to `floorAt` when v is exact at that rank). */
export function ceilAt(v, k) {
  checkRank(k);
  if (v.k <= k) return make(toSafe(scaleTo(v, k)), k);
  const d = P10(v.k - k);
  const q = big(v.n) / d;
  return make(toSafe(big(v.n) % d === 0n ? q : q + 1n), k);
}
/** The rounding of v at rank k, half up (the digit after the rank is 5 or more → the upper mark). */
export function roundAt(v, k) {
  checkRank(k);
  if (v.k <= k) return make(toSafe(scaleTo(v, k)), k);
  const d = P10(v.k - k);
  const q = big(v.n) / d;
  return make(toSafe(2n * (big(v.n) % d) >= d ? q + 1n : q), k);
}
/**
 * Every number whose rounding at rank k is r: r − ½·10^-k ≤ x < r + ½·10^-k, written at rank k + 1. The left end is included, the right one is
 * not; for r = 0 the left end is 0 itself. `r` must be written with at most k decimals.
 */
export function roundingInterval(r, k) {
  checkRank(k + 1);
  if (r.k > k) throw new RangeError('decimals.roundingInterval: r has more than k decimals');
  const c = scaleTo(r, k + 1);
  const lo = c >= 5n ? c - 5n : 0n;
  return { lo: make(toSafe(lo), k + 1), hi: make(toSafe(c + 5n), k + 1), loIncluded: true, hiIncluded: false };
}
/**
 * The screen of a calculator for a ÷ b (positive integers): `n` significant digits, the last digit ROUNDED (247 ÷ 83 → "2.975903614" although the
 * digits that follow are 45…), trailing zeros of an exact quotient dropped ("2.5"), a decimal POINT as calculators print it.
 */
export function quotientDigits(a, b, n) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 1 || !Number.isInteger(n) || n < 1 || n > 15) throw new RangeError('decimals.quotientDigits: bad arguments');
  const A = big(a); const B = big(b);
  if (A === 0n) return '0';
  const ip = A / B;
  let f;
  if (ip > 0n) f = Math.max(0, n - String(ip).length);
  else {
    let z = 0; let r = A;
    while (r * 10n < B) { r *= 10n; z += 1; }
    f = z + n;
  }
  const num = A * P10(f);
  const q = num / B;
  const scaled = 2n * (num % B) >= B ? q + 1n : q;
  let s = String(scaled).padStart(f + 1, '0');
  s = f === 0 ? s : `${s.slice(0, s.length - f)}.${s.slice(s.length - f)}`;
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
/** The two consecutive marks of rank k around a ÷ b: `lo` ≤ a/b ≤ `hi`; `exact` when the quotient is a decimal reached at that rank (then lo = hi). */
export function quotientBracket(a, b, k) {
  checkRank(k);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 1) throw new RangeError('decimals.quotientBracket: bad arguments');
  const num = big(a) * P10(k);
  const lo = num / big(b);
  const exact = num % big(b) === 0n;
  return { lo: make(toSafe(lo), k), hi: make(toSafe(exact ? lo : lo + 1n), k), exact };
}
