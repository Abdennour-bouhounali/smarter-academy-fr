/**
 * The numbers the WRITTEN world of lesson `natiqa-ghayr-natiqa` shares (story, practice, trainer, evidence, knowledge):
 * the kit's and the world's helpers RE-EXPORTED (defects.md D8 — never a copy), and the few facts about a root these
 * files compute, EXACTLY (the world's arithmetic, `rootCourts/logic.js`: fractions of BigInt; a number is TEXT « 2,56 »,
 * « 25/36 », never a float that decides anything).
 */
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { compare, read, rootOf, square, tex, write } from '../../../../../../common/gameworld/rootCourts/logic';

export { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
export { compare, equal, read, rootOf, square, tex, write } from '../../../../../../common/gameworld/rootCourts/logic';
// the key ids from the story (forges.js holds the same literals): the forges read the story, so nothing they import
// imports them back
export { K1, K2, K3 } from './story';

/** A number read, or null when it is not one (an empty box, a word). */
export function valueOf(x) {
  try {
    return read(x);
  } catch {
    return null;
  }
}
/** The square of a number, written: « 2,56 », « 25/36 ». */
export const sq = (x) => write(square(x));
/** How many decimals a decimal number has: « 2,56 » → 2, « 30 » → 0. */
export const decimalsOf = (x) => (write(x).split(',')[1] ?? '').length;
/** x × 10^k, as a JS number: an integer when x has at most k decimals, else a number with a fraction (never a natural). */
export function scaled(x, k) {
  const v = typeof x === 'object' && x !== null && 'n' in x ? x : valueOf(x);
  if (!v) return null;
  const n = v.n * 10n ** BigInt(k);
  return n % v.d === 0n ? Number(n / v.d) : Number(n) / Number(v.d);
}

/** The whole square root of a natural (BigInt), rounded down. */
export function isqrt(v) {
  if (v < 2n) return v;
  let x = BigInt(Math.floor(Math.sqrt(Number(v))));
  while (x * x > v) x -= 1n;
  while ((x + 1n) * (x + 1n) <= v) x += 1n;
  return x;
}
/** The largest whole number whose square does not pass the area: the rod that leaves the band (4 for 19). */
export const wholeBelow = (area) => {
  const { n, d } = read(area);
  return Number(isqrt(n / d));
};
/**
 * The longest rod of k decimals whose platform does not pass the court — the value to 10^-k BY DEFAULT of its side
 * (« 4,3 » for 19 and k = 1, « 8,12 » for 66 and k = 2), written. Exact: ⌊√a × 10^k⌋ / 10^k.
 */
/** ⌊√a × 10^k⌋: the marks of 10^-k below the end of the wall (BigInt). */
const marksBelow = (area, k) => {
  const { n, d } = read(area);
  return isqrt((n * 10n ** BigInt(2 * k)) / d);
};
export const cut = (area, k) => write(`${marksBelow(area, k)}/${10n ** BigInt(k)}`);
/** The next mark: the value to 10^-k BY EXCESS (when the side is not itself a mark of 10^-k). */
export const above = (area, k) => write(`${marksBelow(area, k) + 1n}/${10n ** BigInt(k)}`);
/** The MIDDLE mark between the two: « 4,35 » between 4,3 and 4,4. */
export const middle = (area, k) => write(`${marksBelow(area, k) * 10n + 5n}/${10n ** BigInt(k + 1)}`);
/**
 * The ROUNDED value to 10^-k of the side: the mark of the two that is nearer. The middle mark decides — its platform
 * leaves a band (the wall ends beyond the middle): the upper mark; it jams: the lower one (a middle that rides exactly is
 * rounded up, as the school does).
 */
export const rounded = (area, k) => (compare(square(middle(area, k)), area) <= 0 ? above(area, k) : cut(area, k));

/**
 * What a calculator of ten digits shows for the side of a court: the side itself when it is a decimal, else √a rounded to
 * ten digits in all (« 4,358898944 » for 19, « 0,222222222 » for 4/81).
 */
export function calculator(area, digits = 10) {
  const exact = rootOf(area);
  if (exact != null && !exact.includes('/')) return exact;
  const { n, d } = read(area);
  const whole = String(isqrt(n / d)).length;
  const k = BigInt(digits - whole); // the decimals shown
  const r = isqrt((n * 10n ** (2n * (k + 1n))) / d); // one digit more, to round
  return write(`${(r + 5n) / 10n}/${10n ** k}`);
}

/** Is a number written as a fraction (it has no finite decimal writing)? */
const isFrac = (x) => write(x).includes('/');
/**
 * A number inside a fact: a whole number or a decimal as it is written, a FRACTION as a formula over a real bar
 * (`$\\dfrac{4}{7}$` — never « 4/7 » as text). A fact is drawn by MathText (the rail's `why`, the trainer's hints).
 */
export const said = (x) => (isFrac(x) ? `$${tex(x)}$` : write(x));
/** A product « g × g = p » inside a fact: isolated left to right, or a formula when a fraction is in it. */
const product = (g, p) =>
  isFrac(g) || isFrac(p) ? `$${tex(g)} \\times ${tex(g)} = ${tex(p)}$` : ltr(`${write(g)} × ${write(g)} = ${write(p)}`);

/**
 * What the world does with a rod of length g over a court of area a, as one FACT (the platform rides, leaves a band, or
 * jams) and the product that says it. Never « wrong »: the world's own verdicts.
 */
export function rodFact(g, a) {
  const p = sq(g);
  const c = compare(p, a);
  const what = c === 0 ? 'تركب' : c < 0 ? 'تترك شريطًا في' : 'تعلق في';
  return `منصّة المقياس ${said(g)} ${what} الساحة ${said(a)}: ${product(g, p)}.`;
}

/** A typed box: its digits, or null (an empty box, a sign, a decimal point typed by a test — the screen keeps digits only). */
export function digits(x) {
  if (typeof x === 'number') return Number.isInteger(x) && x >= 0 ? String(x) : null;
  const t = String(x ?? '').trim();
  return /^\d+$/.test(t) ? t : null;
}
/** A whole number typed in one box, or null. */
export const typedWhole = (x) => (digits(x) == null ? null : Number(digits(x)));
/** A decimal typed in two boxes, the whole part and the decimals (« 2 » and « 4 » → 2,4), read exactly — or null. */
export function typedDecimal(i, d) {
  const [a, b] = [digits(i), digits(d)];
  return a == null || b == null ? null : read(`${a},${b}`);
}
/** A fraction typed over a bar, as text « p/q » — or null (an empty box, a denominator 0). */
export function typedFrac(n, d) {
  const [p, q] = [typedWhole(n), typedWhole(d)];
  return p == null || !q ? null : `${p}/${q}`;
}
