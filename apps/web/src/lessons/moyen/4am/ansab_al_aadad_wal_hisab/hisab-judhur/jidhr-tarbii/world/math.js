/**
 * The numbers the WRITTEN world of lesson `jidhr-tarbii` shares (practice, trainer, knowledge): the kit's and the world's
 * helpers RE-EXPORTED (defects.md D8 — never a copy), and the few facts about a root these files compute, exactly (the
 * world's own arithmetic, `rootCourts/logic.js`: fractions of BigInt, a number is TEXT « 5,47 », « 4/9 », « -9 »).
 */
import { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { compare, read, square, write } from '../../../../../../common/gameworld/rootCourts/logic';

export { ltr } from '../../../../../../common/gameworld/kit/authoring/numbers';
export { compare, equal, read, rootOf, square, tex, write } from '../../../../../../common/gameworld/rootCourts/logic';
export { tiles } from '../../../../../../common/gameworld/rootCourts/strings';
export { calculator, K1, K2, K3 } from './forges';
export { steps, wholeBelow } from './inquiries';

/** A number read, or null when it is not one (an empty box, a word). */
export function valueOf(x) {
  try {
    return read(x);
  } catch {
    return null;
  }
}
/** The square of a number, written: « 49 », « 0,49 », « 4/9 ». */
export const sq = (x) => write(square(x));
/** How many decimals a decimal number has: « 5,47 » → 2, « 30 » → 0. */
export const decimalsOf = (x) => (write(x).split(',')[1] ?? '').length;
/** x × 10^k, as a JS number: an integer when x has at most k decimals, else a number with a fraction (never a natural). */
export function scaled(x, k) {
  const v = typeof x === 'object' && x !== null && 'n' in x ? x : valueOf(x);
  if (!v) return null;
  const n = v.n * 10n ** BigInt(k);
  return n % v.d === 0n ? Number(n / v.d) : Number(n) / Number(v.d);
}

/**
 * What the world does with a rod of length g over a court of area a, as one plain FACT (the platform rides, leaves a
 * band, or jams) and the product that says it, isolated left to right: « منصّة المقياس 7 تترك شريطًا في الساحة 58:
 * ⁦7 × 7 = 49⁩. » Never « wrong »: the same words as the world's verdicts.
 */
export function rodFact(g, a) {
  const p = sq(g);
  const c = compare(p, a);
  const what = c === 0 ? 'تركب' : c < 0 ? 'تترك شريطًا في' : 'تعلق في';
  return `منصّة المقياس ${write(g)} ${what} الساحة ${write(a)}: ${ltr(`${write(g)} × ${write(g)} = ${p}`)}.`;
}

/** A typed box: its digits, or null (an empty box, a sign, a decimal point typed by a test — the screen keeps digits only). */
export function digits(x) {
  if (typeof x === 'number') return Number.isInteger(x) && x >= 0 ? String(x) : null;
  const t = String(x ?? '').trim();
  return /^\d+$/.test(t) ? t : null;
}
/** A whole number typed in one box, or null. */
export const typedWhole = (x) => (digits(x) == null ? null : Number(digits(x)));
/** A decimal typed in two boxes, the whole part and the decimals (« 5 » and « 07 » → 5,07), read exactly — or null. */
export function typedDecimal(i, d) {
  const [a, b] = [digits(i), digits(d)];
  return a == null || b == null ? null : read(`${a},${b}`);
}
