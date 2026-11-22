// The walk's OWN exact arithmetic for « قصر الساحات » (defects.md C1: never the lesson's nor the world's `logic.js`): a
// number is a fraction of BigInt, read from what the screen writes (« 30 », « 5,47 », « −9 », « 49/64 », « 0{,}25 »).
const big = (x) => BigInt(x);
const abs = (x) => (x < 0n ? -x : x);
const gcdBig = (a, b) => {
  let [x, y] = [abs(a), abs(b)];
  while (y) [x, y] = [y, x % y];
  return x || 1n;
};
const frac = (n, d = 1n) => {
  if (d === 0n) throw new Error('exact: a denominator is 0');
  const g = gcdBig(n, d) * (d < 0n ? -1n : 1n);
  return { n: n / g, d: d / g };
};

/** Reads a number as a screen writes it (a comma or a point, a true minus, a LaTeX `{,}`, a fraction « p/q »). */
export function q(x) {
  if (x && typeof x === 'object' && 'n' in x) return x;
  const s = String(x)
    .replace(/[⁦⁩\s]/g, '')
    .replace('{,}', ',')
    .replace(',', '.')
    .replace(/[−–]/g, '-');
  const [top, bottom] = s.split('/');
  const one = (t) => {
    const m = /^(-?)(\d*)(?:\.(\d+))?$/.exec(t);
    if (!m || (!m[2] && !m[3])) throw new Error(`exact: « ${x} » is not a number`);
    const digits = big((m[2] || '0') + (m[3] ?? ''));
    return frac(m[1] ? -digits : digits, 10n ** big((m[3] ?? '').length));
  };
  const a = one(top);
  if (bottom == null) return a;
  const b = one(bottom);
  return frac(a.n * b.d, a.d * b.n);
}
export const mul = (a, b) => frac(q(a).n * q(b).n, q(a).d * q(b).d);
export const sub = (a, b) => frac(q(a).n * q(b).d - q(b).n * q(a).d, q(a).d * q(b).d);
export const cmp = (a, b) => {
  const d = q(a).n * q(b).d - q(b).n * q(a).d;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
};
export const eq = (a, b) => cmp(a, b) === 0;
export const sq = (a) => mul(a, a);
export const absq = (a) => frac(abs(q(a).n), q(a).d);
/** The whole square root of a BigInt, rounded down. */
export function isqrt(v) {
  const n = big(v);
  if (n < 2n) return n;
  let x = big(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
}
/** The exact root of a number when it HAS one among the fractions, else null. */
export function rootOf(a) {
  const { n, d } = q(a);
  if (n < 0n) return null;
  const [p, r] = [isqrt(n), isqrt(d)];
  return p * p === n && r * r === d ? frac(p, r) : null;
}
/** Written as the world writes it: « 5,47 », « 49/64 » when no finite decimal writing exists. */
export function write(x) {
  const { n, d } = q(x);
  if (d === 1n) return String(n);
  let den = d;
  for (const p of [2n, 5n]) while (den % p === 0n) den /= p;
  if (den !== 1n) return `${n}/${d}`;
  let k = 0;
  let num = abs(n);
  den = d;
  while (den !== 1n) {
    num *= 10n;
    const g = gcdBig(num, den);
    num /= g;
    den /= g;
    k += 1;
  }
  const digits = String(num).padStart(k + 1, '0');
  return `${n < 0n ? '-' : ''}${digits.slice(0, -k)},${digits.slice(-k)}`;
}
/** What a ten-digit calculator shows for the side of a WHOLE area: its root rounded to ten significant digits. */
export function display(area) {
  const r0 = rootOf(area);
  if (r0) return r0;
  const a = q(area);
  const whole = String(isqrt(a.n / a.d)).length;
  const k = big(10 - whole);
  const r = isqrt(a.n * 10n ** (2n * (k + 1n)));
  return frac((r + 5n) / 10n, 10n ** k);
}
/** A platform on a rod (its length, or the wall of a court `{ root }`) over a court of area a: ride, band or jam, exactly. */
export function platform(rod, a) {
  const covers = rod.root != null ? q(rod.root) : sq(rod.q ?? rod);
  const c = cmp(covers, a);
  return { kind: c === 0 ? 'ride' : c < 0 ? 'band' : 'jam', covers: write(covers), diff: write(absq(sub(a, covers))) };
}
/** A number in the writing of a sentence: its digits as the page draws them (« 0,0791 » or « 0{,}0791 »). */
export const shownIn = (text, x) => {
  const t = String(text).replace(/\{,\}/g, ',').replace(/[⁦⁩]/g, '');
  return t.includes(write(x));
};
