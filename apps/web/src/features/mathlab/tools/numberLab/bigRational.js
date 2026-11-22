/**
 * Les RATIONNELS EXACTS sur BigInt — logique pure, sans React (§61).
 *
 * `fraction.js` travaille en `number` et plafonne à 10¹² : c'est assez pour
 * les fractions que l'élève coupe, pas pour `2^60` ni pour un calcul de
 * priorités où les puissances s'enchaînent. Ici numérateur et dénominateur
 * sont des BigInt : le résultat est EXACT, et il ne s'écrit jamais `1e+21`,
 * `Infinity` ou `NaN` — une chaîne de chiffres, toujours.
 *
 *     { n: BigInt, d: BigInt }   — d > 0, toujours RÉDUIT
 *
 * (Contrairement à `Frac`, qui garde `2/4` pour l'enseigner, un rationnel de
 * CALCUL est réduit : c'est le résultat d'une opération, pas une écriture de
 * l'élève.)
 */

const ZERO = 0n;
const ONE = 1n;
const TEN = 10n;

const absBig = (x) => (x < ZERO ? -x : x);

function gcdBig(a, b) {
  let x = absBig(a);
  let y = absBig(b);
  while (y !== ZERO) [x, y] = [y, x % y];

  return x;
}

/** Un rationnel réduit, ou null si le dénominateur est nul. */
export function rat(n, d = ONE) {
  const num = BigInt(n);
  const den = BigInt(d);
  if (den === ZERO) return null;
  const g = gcdBig(num, den) || ONE;
  const sign = den < ZERO ? -ONE : ONE;

  return { n: (num / g) * sign, d: (den / g) * sign };
}

export const isInteger = (r) => r.d === ONE;
const isZero = (r) => r.n === ZERO;
export const isNegative = (r) => r.n < ZERO;
export const neg = (r) => ({ n: -r.n, d: r.d });
export const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => rat(a.n * b.n, a.d * b.d);
/** null si on divise par zéro — l'appelant DIT pourquoi, il ne rend pas Infinity. */
export const div = (a, b) => (b.n === ZERO ? null : rat(a.n * b.d, a.d * b.n));
export const equals = (a, b) => a.n === b.n && a.d === b.d;

/** Le nombre de chiffres d'un rationnel (le plus long de ses deux termes). */
export const digitLength = (r) => Math.max(absBig(r.n).toString().length, r.d.toString().length);

/**
 * `base^exp`, exp ENTIER (négatif compris). Rend `{ value }` ou `{ error }` :
 *   - `zeroPowerZero`  : 0⁰ n'est pas défini au collège
 *   - `divisionByZero` : 0 à une puissance négative
 *   - `tooLarge`       : plus de `maxDigits` chiffres — on le DIT au lieu de geler
 */
export function pow(base, exp, { maxDigits = 120 } = {}) {
  if (!Number.isInteger(exp)) return { error: 'nonIntegerExponent' };
  if (isZero(base)) {
    if (exp === 0) return { error: 'zeroPowerZero' };
    if (exp < 0) return { error: 'divisionByZero' };

    return { value: rat(0) };
  }
  const k = BigInt(Math.abs(exp));
  // Estimation AVANT le calcul : on ne fabrique pas un nombre de 10⁶ chiffres pour le refuser.
  const estimate = Math.abs(exp) * Math.max(absBig(base.n).toString().length, base.d.toString().length);
  if (estimate > maxDigits + Math.abs(exp)) return { error: 'tooLarge' };
  const n = base.n ** k;
  const d = base.d ** k;
  const value = exp >= 0 ? rat(n, d) : rat(d, n);
  if (digitLength(value) > maxDigits) return { error: 'tooLarge' };

  return { value };
}

/** Le dénominateur n'a-t-il que des facteurs 2 et 5 ? (écriture décimale FINIE) */
export function isTerminating(r) {
  let d = r.d;
  while (d % 2n === ZERO) d /= 2n;
  while (d % 5n === ZERO) d /= 5n;

  return d === ONE;
}

/** Grouper les chiffres par trois avec une espace fine : 1 048 576. */
export function groupDigits(digits, separator = ' ') {
  const text = String(digits);
  if (text.length <= 4) return text;

  return text.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * L'écriture DÉCIMALE d'un rationnel, virgule algérienne.
 *
 * `exact: true` si l'écriture est finie (dénominateur en 2ᵃ5ᵇ) ; sinon elle
 * est tronquée à `places` décimales et `exact: false` — l'interface l'annonce
 * « Valeur approchée » au lieu de la faire passer pour la valeur.
 *
 * @returns {{ text: string, exact: boolean }}
 */
export function toDecimal(r, { places = 6, group = false } = {}) {
  const negative = r.n < ZERO;
  const n = absBig(r.n);
  const whole = n / r.d;
  let rest = n % r.d;
  const terminating = isTerminating(r);
  let digits = '';
  let count = 0;
  const limit = terminating ? 200 : places;
  while (rest !== ZERO && count < limit) {
    rest *= TEN;
    digits += (rest / r.d).toString();
    rest %= r.d;
    count += 1;
  }
  const exact = rest === ZERO;
  const wholeText = group ? groupDigits(whole.toString()) : whole.toString();
  const body = digits ? `${wholeText},${digits}` : wholeText;
  const isZeroText = /^[0,]+$/.test(body);

  return { text: `${negative && !isZeroText ? '−' : ''}${body}`, exact };
}

/** Le LaTeX d'un rationnel : `-\frac{3}{4}` (signe devant la barre, comme le manuel). */
export function toLatex(r) {
  if (r.d === ONE) return r.n.toString();
  const body = `\\frac{${absBig(r.n).toString()}}{${r.d.toString()}}`;

  return r.n < ZERO ? `-${body}` : body;
}

/** `-3/4` en texte nu, avec le VRAI signe moins. */
export function toText(r) {
  const s = r.d === ONE ? r.n.toString() : `${r.n.toString()}/${r.d.toString()}`;

  return s.replace('-', '−');
}

/**
 * Lire un littéral décimal EXACTEMENT, depuis ses chiffres (jamais via un
 * flottant) : `0,1` vaut 1/10, pas 0.1000000000000000055…
 */
export function fromDecimalText(text) {
  const match = /^(-?)(\d*)(?:[.,](\d+))?$/.exec(String(text).trim());
  if (!match || (!match[2] && !match[3])) return null;
  const [, sign, whole, frac = ''] = match;
  const n = BigInt(`${whole || '0'}${frac}`);

  return rat(sign ? -n : n, TEN ** BigInt(frac.length));
}
