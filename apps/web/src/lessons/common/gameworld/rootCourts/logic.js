/**
 * « Le palais des dalles » — THE LAW OF THE WORLD (pure; it names no lesson).
 *
 * A COURT is a square whose area is known, in tiles. A ROD is a length: a number (`rod('5,47')`), or the wall of a
 * court — the length whose square is that court's area, which may have no number (`wall(30)`). The world builds a
 * square platform on the rod and lowers it into the court:
 *   it RIDES the court's lift when it covers the court exactly;
 *   it leaves a BAND when it is smaller (the band's area is what the court holds more);
 *   it JAMS on the rim when it is larger (what sticks out is what it holds more).
 * Everything is EXACT (fractions of BigInt): 29,99999 is never taken for 30. A number is written as text everywhere
 * outside this file — « 30 », « 5,47 », « 49/64 » — so that a save, a log and a forge's case stay plain data.
 */
const big = (x) => BigInt(x);
const abs = (x) => (x < 0n ? -x : x);
const gcd = (a, b) => {
  let [x, y] = [abs(a), abs(b)];
  while (y) [x, y] = [y, x % y];
  return x || 1n;
};
/** An exact number: n / d, d > 0, in lowest terms. */
const frac = (n, d = 1n) => {
  if (d === 0n) throw new Error('rootCourts: a denominator is 0');
  const g = gcd(n, d) * (d < 0n ? -1n : 1n);
  return { n: n / g, d: d / g };
};

/** Reads a number: 30, '30', '5,47', '5.47', '-9', '49/64', or an exact number already read. */
export function read(x) {
  if (x && typeof x === 'object' && 'n' in x) return x;
  const s = String(x).trim().replace(',', '.').replace('−', '-');
  const [top, bottom] = s.split('/');
  const one = (t) => {
    const m = /^(-?)(\d*)(?:\.(\d+))?$/.exec(t.trim());
    if (!m || (!m[2] && !m[3])) throw new Error(`rootCourts: « ${x} » is not a number`);
    const digits = big((m[2] || '0') + (m[3] ?? ''));
    return frac(m[1] ? -digits : digits, 10n ** big((m[3] ?? '').length));
  };
  const a = one(top);
  if (bottom == null) return a;
  const b = one(bottom);
  return frac(a.n * b.d, a.d * b.n);
}

const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
/** -1, 0 or 1. */
export const compare = (a, b) => {
  const d = read(a).n * read(b).d - read(b).n * read(a).d;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
};
export const equal = (a, b) => compare(a, b) === 0;
export const square = (x) => mul(read(x), read(x));
export const times = (a, b) => mul(read(a), read(b));
export const minus = (a, b) => sub(read(a), read(b));
export const magnitude = (x) => frac(abs(read(x).n), read(x).d);
/** For DRAWING only (a length on screen): never to decide what the world does. */
export const approx = (x) => Number(read(x).n) / Number(read(x).d);

/** Can it be written with a finite number of decimals? */
export const isDecimal = (x) => {
  let d = read(x).d;
  for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  return d === 1n;
};
/** The number as it is written on screen: « 5,47 », or « 49/64 » when it has no finite decimal writing. */
export function write(x) {
  const { n, d } = read(x);
  if (d === 1n) return String(n);
  if (!isDecimal({ n, d })) return `${n}/${d}`;
  let k = 0;
  let den = d;
  let num = abs(n);
  while (den !== 1n) {
    // one more decimal: multiply both by 10 and reduce
    num *= 10n;
    const g = gcd(num, den);
    num /= g;
    den /= g;
    k += 1;
  }
  const digits = String(num).padStart(k + 1, '0');
  return `${n < 0n ? '-' : ''}${digits.slice(0, -k)},${digits.slice(-k)}`;
}
/** The same in LaTeX (a fraction is drawn with its bar; the comma does not open a space). */
export function tex(x) {
  const { n, d } = read(x);
  if (d === 1n || isDecimal({ n, d })) return write({ n, d }).replace(',', '{,}');
  return `${n < 0n ? '-' : ''}\\dfrac{${abs(n)}}{${d}}`;
}

// ───────────────────────────── rods ─────────────────────────────
/** A rod whose length is a number. */
export const rod = (length) => ({ q: write(length) });
/** The wall of a court of area `area`: the length whose square is that area. It may have no number. */
export const wall = (area) => ({ root: write(area) });
export const isWall = (r) => r.root != null;
/** The area of the square platform built on a rod — exact. */
export const platform = (r) => (isWall(r) ? read(r.root) : square(r.q));
/** The rod's length for DRAWING only. */
export const lengthOf = (r) => (isWall(r) ? Math.sqrt(approx(r.root)) : Math.abs(approx(r.q)));
/** A rod as it is written: its number, or the sign over its court's area. */
export const rodText = (r) => (isWall(r) ? `√${r.root}` : r.q);
export const rodTex = (r) => (isWall(r) ? `\\sqrt{${tex(r.root)}}` : tex(r.q));
/** The exact root of a number when it HAS one among the numbers (36 → « 6 », 49/64 → « 7/8 », 0,25 → « 0,5 »), else null. */
export function rootOf(area) {
  const { n, d } = read(area);
  if (n < 0n) return null;
  const isqrt = (v) => {
    if (v < 2n) return v;
    let x = big(Math.floor(Math.sqrt(Number(v))));
    while (x * x > v) x -= 1n;
    while ((x + 1n) * (x + 1n) <= v) x += 1n;
    return x;
  };
  const [p, q] = [isqrt(n), isqrt(d)];
  return p * p === n && q * q === d ? write(frac(p, q)) : null;
}

/**
 * What the world does with a rod over a court of area `area`:
 *   { kind: 'ride' | 'band' | 'jam', covers, diff } — `covers` = the tiles the platform holds, `diff` = the band's area
 *   or what sticks out, both written as text.
 */
export function outcome(r, area) {
  const covers = platform(r);
  const c = compare(covers, area);
  return {
    kind: c === 0 ? 'ride' : c < 0 ? 'band' : 'jam',
    covers: write(covers),
    diff: write(magnitude(minus(area, covers))),
  };
}

/** The rod of a dial stopped at `steps` marks of `step` (« 0,1 », « 0,01 »…): no rounding, whatever the step. */
export const dialRod = (steps, step) => rod(times(String(steps), step));
