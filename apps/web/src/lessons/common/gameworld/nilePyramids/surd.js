/**
 * The pyramids world — A LENGTH OF A FIGURE, EXACT (pure; it names no lesson). Most lengths of this world are rationals
 * (the kit's `kit/exact.js`: « 77,5 », « 5/6 »). A few are not: on the river the two crooked sides SR and SF stand on
 * right angles (the 3-4-5 rope), so SR² = SE² + ER² = 2785 and SF² = SA² + AF² = 64 × 2785 — SR = √2785 and
 * SF = 8√2785, never a whole knot. Their ratio is still exact: SR / SF = 1/8.
 *
 * A length is TEXT: a rational as the kit writes it (« 52 », « 6,5 », « 5/6 »), or a rational times the root of a
 * whole number with no square factor: « √2785 », « 8√2785 », « 9/22280√2785 » (the rational before the root). Every
 * product and quotient of two such numbers is one again; a sum is one when the two roots are the same (RF = SR + SF =
 * 9√2785). Nothing compares floats; `lenApprox` is for DRAWING only.
 */
import { read, write, tex, plus, times, over, approx } from '../kit/exact';

const ROOT = '√';
const abs = (x) => (x < 0n ? -x : x);

/** n = s² × f with f free of squares → [s, f] (n ≥ 0, a BigInt). */
function squareOut(n) {
  let s = 1n;
  let f = n;
  for (let p = 2n; p * p <= f; p += 1n)
    while (f % (p * p) === 0n) {
      f /= p * p;
      s *= p;
    }
  return [s, f];
}

/** Reads a length: { q, r } — the rational q (the kit's { n, d }) and the root's radicand r (1n for a rational). */
export function lenRead(x) {
  if (x && typeof x === 'object' && 'q' in x) return x;
  const s = String(x);
  const at = s.indexOf(ROOT);
  if (at < 0) return { q: read(s), r: 1n };
  const head = s.slice(0, at).trim();
  const rad = BigInt(s.slice(at + 1).trim());
  if (rad < 0n) throw new Error(`surd: « ${x} » has a negative radicand`);
  const [k, f] = squareOut(rad);
  const q = times(head === '' ? '1' : head === '-' ? '-1' : head, String(k));
  return f === 1n ? { q, r: 1n } : { q, r: f };
}

/** Is it a rational (no root left)? */
export const isRational = (x) => lenRead(x).r === 1n;

/** The length as text: « 416 », « 8√2785 », « 9/22280√2785 ». */
export function lenWrite(x) {
  const { q, r } = lenRead(x);
  if (r === 1n || q.n === 0n) return write(q);
  const head = q.n === 1n && q.d === 1n ? '' : q.n === -1n && q.d === 1n ? '-' : write(q);
  return `${head}${ROOT}${r}`;
}

/** The same in LaTeX: « 416 », « 8\sqrt{2785} », « \dfrac{9\sqrt{2785}}{22280} ». */
export function lenTex(x) {
  const { q, r } = lenRead(x);
  if (r === 1n || q.n === 0n) return tex(q);
  const root = `\\sqrt{${r}}`;
  const sign = q.n < 0n ? '-' : '';
  const top = `${abs(q.n) === 1n ? '' : abs(q.n)}${root}`;
  return q.d === 1n ? `${sign}${top}` : `${sign}\\dfrac{${top}}{${q.d}}`;
}

/** a × b, exact. */
export function lenTimes(a, b) {
  const x = lenRead(a);
  const y = lenRead(b);
  const [s, f] = squareOut(x.r * y.r);
  return lenWrite({ q: times(times(x.q, y.q), String(s)), r: f });
}

/** a / b, exact (b ≠ 0): a / (q√r) = a × √r / (q r). */
export function lenOver(a, b) {
  const y = lenRead(b);
  if (y.q.n === 0n) throw new Error('surd: a ratio has a denominator 0');
  return lenTimes(a, { q: over('1', times(y.q, String(y.r))), r: y.r });
}

/** a + b, exact — when both are rationals, or both multiples of the same root (else it throws). */
export function lenPlus(a, b) {
  const x = lenRead(a);
  const y = lenRead(b);
  if (x.q.n === 0n) return lenWrite(y);
  if (y.q.n === 0n) return lenWrite(x);
  if (x.r !== y.r) throw new Error(`surd: ${lenWrite(a)} + ${lenWrite(b)} is not one length`);
  return lenWrite({ q: plus(x.q, y.q), r: x.r });
}

/** -1, 0 or 1: by the squares, with their signs (no float). */
export function lenCompare(a, b) {
  const x = lenRead(a);
  const y = lenRead(b);
  const sgn = (v) => (v.q.n < 0n ? -1n : v.q.n > 0n ? 1n : 0n);
  // s × q² × r, as a fraction: sign × n² r / d²
  const key = (v) => ({ n: sgn(v) * v.q.n * v.q.n * v.r, d: v.q.d * v.q.d });
  const [p, q] = [key(x), key(y)];
  const diff = p.n * q.d - q.n * p.d;
  return diff < 0n ? -1 : diff > 0n ? 1 : 0;
}
export const lenEqual = (a, b) => lenCompare(a, b) === 0;

/** The square root of a rational, as a length: √(n/d) = √(n d) / d. */
export function lenRoot(x) {
  const { n, d } = read(x);
  if (n < 0n) throw new Error('surd: the root of a negative number');
  if (n === 0n) return '0';
  return lenWrite(`${write(over('1', String(d)))}${ROOT}${n * d}`);
}

/** For DRAWING only. */
export function lenApprox(x) {
  const { q, r } = lenRead(x);
  return approx(q) * Math.sqrt(Number(r));
}
