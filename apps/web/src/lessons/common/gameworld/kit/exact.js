/**
 * THE KIT'S EXACT NUMBERS — what a world computes with when a length, a ratio or an area decides what it does (pure; it
 * names no lesson and no world). A world never imports another world: the helpers that were `rootCourts/logic.js`'s
 * own live here (PYRAMIDS_WORLD_PLAN §2.1, K-e), and `rootCourts/logic.js` re-exports them.
 *
 * A number is `{ n, d }` of BigInt, d > 0, in lowest terms (`rat`, `add`, `sub`, `mul`, `div` below — on the Algerian
 * platform they are imported from `@smarter-academy/core/arithmetic/powers.js`, a module this tree deleted with the
 * lessons that used it; here they are the same five operations, written once). Nothing here compares floats: 0,1 + 0,2
 * is 0,3, and 29,99999 is never taken for 30. `approx` exists for DRAWING only.
 *
 * Outside this file a number is TEXT, as a French student writes it: « 77,5 » (a comma), « 5/6 », « −9 ». `read`
 * accepts what a student types or a screen writes (a comma or a point, a true minus, LaTeX `7{,}5` and `\dfrac{5}{6}`);
 * `write` gives « 77,5 » or « 5/6 », `tex` gives `77{,}5` or `\dfrac{5}{6}`.
 */
const big = (x) => BigInt(x);
const abs = (x) => (x < 0n ? -x : x);

/** n / d reduced, d > 0 (n and d: integers, BigInt or their text). Throws on d = 0. */
function rat(n, d = 1) {
  let N = big(n);
  let D = big(d);
  if (D === 0n) throw new Error('exact: a denominator is 0');
  if (D < 0n) {
    N = -N;
    D = -D;
  }
  const g = gcdOf(N, D);
  return Object.freeze({ n: N / g, d: D / g });
}
const add = (p, q) => rat(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => rat(p.n * q.d - q.n * p.d, p.d * q.d);
const mul = (p, q) => rat(p.n * q.n, p.d * q.d);
const div = (p, q) => {
  if (q.n === 0n) throw new Error('exact: division by 0');
  return rat(p.n * q.d, p.d * q.n);
};

/** An exact number n / d (BigInt or integers), reduced. */
export const of = (n, d = 1) => rat(n, d);

/** The bidirectional marks a page may wrap around a number (text pasted from a right-to-left page), and the LaTeX thin
 * spaces. */
const NOISE = /[‎‏⁦-⁩]|\\[,;!: ]|\$/g;

/**
 * Reads a number: 30, 30n, '30', '77,5', '77.5', '7{,}5', '-9', '−9', '5/6', '3,5/2', '\dfrac{5}{6}', '-\frac{5}{6}', or
 * an exact number already read. Throws on anything else (« 1,2,3 », « abc », « 5/0 »).
 */
export function read(x) {
  if (x && typeof x === 'object' && 'n' in x) return x;
  if (typeof x === 'bigint') return rat(x);
  const s = String(x)
    .replace(NOISE, '')
    .trim()
    .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/, '$1/$2')
    .replace(/\{,\}/g, ',')
    .replace(/[−–]/g, '-')
    .replace(',', '.');
  const [top, bottom, extra] = s.split('/');
  const one = (t) => {
    const m = /^(-?)(\d*)(?:\.(\d+))?$/.exec(t.trim());
    if (!m || (!m[2] && !m[3])) throw new Error(`exact: « ${x} » is not a number`);
    const digits = big((m[2] || '0') + (m[3] ?? ''));
    return rat(m[1] ? -digits : digits, 10n ** big((m[3] ?? '').length));
  };
  if (extra != null) throw new Error(`exact: « ${x} » is not a number`);
  const a = one(top);
  if (bottom == null) return a;
  const b = one(bottom);
  if (b.n === 0n) throw new Error(`exact: « ${x} » has a denominator 0`);
  return rat(a.n * b.d, a.d * b.n);
}

/** Reads, or null when it is not a number (a student's box). */
export function tryRead(x) {
  try {
    return read(x);
  } catch {
    return null;
  }
}

/** -1, 0 or 1. */
export const compare = (a, b) => {
  const d = read(a).n * read(b).d - read(b).n * read(a).d;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
};
export const equal = (a, b) => compare(a, b) === 0;
export const plus = (a, b) => add(read(a), read(b));
export const minus = (a, b) => sub(read(a), read(b));
export const times = (a, b) => mul(read(a), read(b));
export const over = (a, b) => div(read(a), read(b));
export const square = (x) => times(x, x);
export const magnitude = (x) => rat(abs(read(x).n), read(x).d);
export const isInteger = (x) => read(x).d === 1n;
/** For DRAWING only (a length on screen): never to decide what the world does. */
export const approx = (x) => Number(read(x).n) / Number(read(x).d);

/** Can it be written with a finite number of decimals? */
export const isDecimal = (x) => {
  let d = read(x).d;
  for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  return d === 1n;
};

/** The number as it is written on screen: « 77,5 », « -9 », or « 5/6 » when it has no finite decimal writing. */
export function write(x) {
  const { n, d } = read(x);
  if (d === 1n) return String(n);
  if (!isDecimal({ n, d })) return `${n}/${d}`;
  let k = 0;
  let den = d;
  let num = abs(n);
  while (den !== 1n) {
    // one more decimal: multiply the numerator by 10 and reduce
    num *= 10n;
    const g = gcdOf(num, den);
    num /= g;
    den /= g;
    k += 1;
  }
  const digits = String(num).padStart(k + 1, '0');
  return `${n < 0n ? '-' : ''}${digits.slice(0, -k)},${digits.slice(-k)}`;
}
function gcdOf(a, b) {
  let [x, y] = [abs(a), abs(b)];
  while (y) [x, y] = [y, x % y];
  return x || 1n;
}

/** The same in LaTeX: « 77{,}5 » (the comma does not open a space), « \dfrac{5}{6} » (a real fraction bar). */
export function tex(x) {
  const { n, d } = read(x);
  if (d === 1n || isDecimal({ n, d })) return write({ n, d }).replace(',', '{,}');
  return `${n < 0n ? '-' : ''}\\dfrac{${abs(n)}}{${d}}`;
}

// ───────────────────────────── ratios and proportions ─────────────────────────────

/**
 * The FOURTH PROPORTIONAL: the x for which a / b = c / x, that is x = b × c / a (a ≠ 0, c ≠ 0). In a Thalès
 * configuration AM / AB = AN / AC gives AC = fourth(AM, AB, AN).
 */
export function fourth(a, b, c) {
  if (read(a).n === 0n || read(c).n === 0n) throw new Error('exact: the fourth proportional needs a ≠ 0 and c ≠ 0');
  return over(times(b, c), a);
}
