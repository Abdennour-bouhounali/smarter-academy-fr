/**
 * « Vers le brevet » — PROTOTYPE (docs/reports/VERS_LE_BREVET_PLAN.md §7bis). What is TRUE on the screens, with no React:
 * what a number of lots leaves, how a product of primes is written, when two rhythms meet.
 */

export const gcd = (a, b) => {
  let [x, y] = [Math.abs(a), Math.abs(b)];
  while (y) [x, y] = [y, x % y];
  return x;
};
export const lcm = (a, b) => (a / gcd(a, b)) * b;

/** `a` and `b` things dealt into `n` lots: what each lot holds and what stays. */
export function deal(a, b, n) {
  if (!Number.isInteger(n) || n < 1) return null;
  return { n, q1: Math.floor(a / n), r1: a % n, q2: Math.floor(b / n), r2: b % n };
}

const UP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };

/** Prime factors in the order found, written with powers: [2, 2, 3, 5] → « 2² × 3 × 5 ». */
export function powerForm(factors) {
  const count = new Map();
  for (const p of [...factors].sort((x, y) => x - y)) count.set(p, (count.get(p) ?? 0) + 1);
  return [...count].map(([p, e]) => (e > 1 ? `${p}${UP[e] ?? `^${e}`}` : `${p}`)).join(' × ');
}

/** Every moment one of two rhythms comes back, up to their first meeting: [{ at, who: 'a' | 'b' | 'both' }]. */
export function meetings(a, b) {
  const end = lcm(a, b);
  const out = [];
  for (let t = 1; t <= end; t += 1) {
    const [ia, ib] = [t % a === 0, t % b === 0];
    if (ia || ib) out.push({ at: t, who: ia && ib ? 'both' : ia ? 'a' : 'b' });
  }
  return out;
}
