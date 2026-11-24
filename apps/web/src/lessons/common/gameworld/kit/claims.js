/**
 * THE CLAIMS a game answer can make — PURE, and THE SAME on the server (`apps/api/app/Domain/GameWorld/ClaimVerifier.php`).
 *
 * A game question is arithmetic generated in the browser: there is no stored key to compare. So an answer that counts
 * toward a savoir-faire is sent as a CLAIM — the numbers of the question and what the student wrote — and the server re-computes
 * the verdict from the numbers alone; it never trusts the browser's. `verifyClaim` is the browser's copy of that rule: the
 * game uses it to show « Ma progression » at once.
 *
 * A claim kind belongs to no lesson: it is a statement about natural numbers that any lesson may use (a decimal length is
 * sent as a natural in a smaller unit: `scaleClaim`).
 * TO ADD A KIND (a lesson needs a statement none of these makes): write it HERE and in `ClaimVerifier.php` (`KINDS` and
 * `verify`), add rows that are true and rows that are false to the ONE fixture both sides read
 * (`apps/api/tests/Fixtures/game-claims.json`). `claims.test.js` fails when the two lists differ, when a kind has no row of
 * each verdict, or when the two sides disagree on a row.
 */
import { read } from './exact';

const natural = (x) => Number.isInteger(x) && x >= 0;
/** The numbers admitted by the kinds below: naturals of school size, ≤ 10^6 — the server's `MAX` (no product overflows). */
const MAX = 1000000;
const n = (x) => natural(x) && x <= MAX;
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
/** a is prime: exactly two divisors (0 and 1 are not). */
function isPrime(a) {
  if (a < 2) return false;
  for (let d = 2; d * d <= a; d += 1) if (a % d === 0) return false;
  return true;
}
/** a = p1^e1 × p2^e2 × …: every p prime, the p distinct and INCREASING, every e ≥ 1 (≤ 20: 2^20 > 10^6), product a. */
function isFactorization(c) {
  if (!n(c.a) || c.a < 2 || !Array.isArray(c.factors) || c.factors.length === 0 || c.factors.length > 20) return false;
  let prod = 1;
  let last = 1;
  for (const f of c.factors) {
    if (!f || typeof f !== 'object' || !Number.isInteger(f.p) || !Number.isInteger(f.e)) return false;
    if (f.p <= last || f.e < 1 || f.e > 20 || !isPrime(f.p)) return false;
    for (let i = 0; i < f.e; i += 1) {
      prod *= f.p;
      if (prod > c.a) return false;
    }
    last = f.p;
  }
  return prod === c.a;
}
/** The operations a `fraction` claim may carry: x/y op z/w = A/B, unreduced (numbers ≤ 2 × 10^12: exact in a double). */
const OPS = {
  '+': (x, y, z, w) => [x * w + z * y, y * w],
  '-': (x, y, z, w) => [x * w - z * y, y * w],
  '*': (x, y, z, w) => [x * z, y * w],
};
/** a/b is the result of x/y op z/w: both irreducible forms are the same (a negative result is never a natural a/b). */
function isResult(c) {
  if (typeof c.op !== 'string' || !Object.hasOwn(OPS, c.op) || ![c.x, c.y, c.z, c.w].every(n) || c.y === 0 || c.w === 0)
    return false;
  const [A, B] = OPS[c.op](c.x, c.y, c.z, c.w);
  if (A < 0) return false;
  const [g, h] = [gcd(A, B), gcd(c.a, c.b)];
  return A / g === c.a / h && B / g === c.b / h;
}

const KINDS = {
  /** a = b × q + r with r < b, and « b fills a » said rightly. */
  division: (c) =>
    natural(c.q) && natural(c.r) && c.b > 0 && c.b * c.q + c.r === c.a && c.r < c.b && c.fits === (c.r === 0),
  /** a = b × q, and `other` is ANOTHER divisor of a (not the one just shown — unless a = b × b). */
  product: (c) =>
    natural(c.q) &&
    natural(c.b) &&
    c.b > 0 &&
    c.b * c.q === c.a &&
    natural(c.other) &&
    c.other > 0 &&
    c.a % c.other === 0 &&
    (c.other !== c.b || c.b === c.q),
  /** In the phrasing `phrase`, the number written first is the divisor (`diviseur` « est un diviseur de », `divise`
   * « divise ») or the multiple (`multiple` « est un multiple de », `divisible` « est divisible par »). */
  phrase: (c) => {
    const divisorFirst = c.first === Math.min(c.a, c.b);
    if (['diviseur', 'divise'].includes(c.phrase)) return divisorFirst;
    return ['multiple', 'divisible'].includes(c.phrase) ? !divisorFirst : false;
  },
  /** The two divisors every a has: 1 and a itself. */
  sure: (c) => new Set([c.x, c.y]).size === 2 && [c.x, c.y].includes(1) && [c.x, c.y].includes(c.a),
  /** How many containers of b hold a things, the last one not full: the quotient rounded UP. */
  containers: (c) => natural(c.count) && c.b > 0 && c.count === Math.ceil(c.a / c.b),
  /** a = b × e: a product of two factors — both are divisors. */
  pair: (c) => natural(c.b) && natural(c.e) && c.b > 0 && c.e > 0 && c.b * c.e === c.a,
  /** ALL the divisors of a, each once (in any order); b = how many were announced. */
  divisors: (c) => {
    if (!natural(c.a) || c.a === 0 || !Array.isArray(c.list) || c.list.length > 400) return false;
    if (!c.list.every((d) => Number.isInteger(d) && d >= 1)) return false;
    const all = [];
    for (let d = 1; d * d <= c.a; d += 1) if (c.a % d === 0) all.push(d, c.a / d);
    const sorted = (list) => [...new Set(list)].sort((x, y) => x - y).join();
    return c.list.length === new Set(c.list).size && sorted(c.list) === sorted(all) && c.b === new Set(all).size;
  },
  /** How far to test: the biggest b whose square does not pass a. */
  stop: (c) => natural(c.b) && c.b * c.b <= c.a && c.a < (c.b + 1) * (c.b + 1),
  /** « a is divisible by b » said rightly — a divisibility rule, without posing the division. */
  divisible: (c) => natural(c.b) && c.b > 0 && typeof c.fits === 'boolean' && c.fits === (c.a % c.b === 0),
  /** The quotient of a by b lies between two CONSECUTIVE naturals: b × lo ≤ a < b × hi, hi = lo + 1 (lo = a ÷ b when b divides a). */
  bracket: (c) =>
    n(c.a) && n(c.b) && n(c.lo) && n(c.hi) && c.b > 0 && c.hi === c.lo + 1 && c.b * c.lo <= c.a && c.a < c.b * c.hi,
  /** The containers of b that a fills (the quotient rounded DOWN) and the containers it needs (rounded UP). */
  fullNeeded: (c) =>
    n(c.a) &&
    n(c.b) &&
    n(c.full) &&
    n(c.need) &&
    c.b > 0 &&
    c.full === Math.floor(c.a / c.b) &&
    c.need === Math.ceil(c.a / c.b),
  /** g is the greatest common divisor of a and b, not both 0 (PGCD(a ; 0) = a). */
  pgcd: (c) => n(c.a) && n(c.b) && n(c.g) && c.a + c.b > 0 && c.g === gcd(c.a, c.b),
  /** « a and b are coprime » said rightly: PGCD(a ; b) = 1. */
  coprime: (c) =>
    n(c.a) && n(c.b) && c.a >= 1 && c.b >= 1 && typeof c.says === 'boolean' && c.says === (gcd(c.a, c.b) === 1),
  /** d is a divisor of a AND of b; with `notOne: true`, a common divisor OTHER THAN 1 (the witness that a and b are not
   * coprime — d = 1 is then false). */
  commonDivisor: (c) =>
    n(c.a) &&
    n(c.b) &&
    n(c.d) &&
    c.a >= 1 &&
    c.b >= 1 &&
    c.d >= (c.notOne === true ? 2 : 1) &&
    c.a % c.d === 0 &&
    c.b % c.d === 0,
  /** a/b is the fraction given, p/q the student's writing: equal (a × q = p × b) and, unless `reduced === false`,
   * irreducible (PGCD(p ; q) = 1). With `op` ('+', '-' or '*'), a/b is the RESULT of a calculation x/y op z/w the
   * claim carries: it must equal that result (computed here, never taken from the browser) — the claim is then about the
   * calculation itself. */
  fraction: (c) =>
    n(c.a) &&
    n(c.b) &&
    n(c.p) &&
    n(c.q) &&
    c.b > 0 &&
    c.q > 0 &&
    c.a * c.q === c.p * c.b &&
    (c.reduced === false || gcd(c.p, c.q) === 1) &&
    (c.op === undefined || isResult(c)),
  /** The prime factorization of a: `factors` = [{p, e}, …], primes increasing, each once with its exponent. */
  factorization: isFactorization,
  /** « a is prime » (`says: true`) or « a is not prime » (`says: false`) said rightly. */
  prime: (c) => n(c.a) && typeof c.says === 'boolean' && c.says === isPrime(c.a),
  /** THE SCALE of two triangles in a Thalès position: every length of (1) `from[i]`, multiplied by k = p/q, gives its
   * partner of (2) `to[i]` (from[i] × p = to[i] × q, for every pair — 1 to 6 pairs); any writing of k equal to it is
   * accepted (85/136 for 5/8). The lengths are naturals in ONE unit for the whole claim: 42,5 and 68 are sent as 425 and
   * 680 (tenths) or 85 and 136 (halves), which leaves k unchanged — `scaleClaim` below does it. With `says` ('enlargement' or 'reduction'), the
   * student's word must be the one k gives: k > 1 an enlargement, k < 1 a reduction (k = 1 is neither). */
  scale: (c) =>
    Array.isArray(c.from) &&
    Array.isArray(c.to) &&
    c.from.length >= 1 &&
    c.from.length <= 6 &&
    c.from.length === c.to.length &&
    [...c.from, ...c.to].every((x) => n(x) && x > 0) &&
    n(c.p) &&
    n(c.q) &&
    c.p > 0 &&
    c.q > 0 &&
    c.from.every((x, i) => x * c.p === c.to[i] * c.q) &&
    (c.says === undefined ||
      (c.says !== null && c.says === (c.p > c.q ? 'enlargement' : c.p < c.q ? 'reduction' : null))),
};

export const CLAIM_KINDS = Object.keys(KINDS);

/** The verdict of a claim, from its numbers alone. An unknown kind is never right. */
export const verifyClaim = (claim) =>
  Boolean(claim) && Object.hasOwn(KINDS, claim.kind) && Boolean(KINDS[claim.kind](claim));

/**
 * A `scale` claim from lengths as a student or a statement writes them (« 42,5 », '68', 2.75 — read EXACTLY by
 * `exact.js › read`): every length is brought to ONE unit small enough that each is a natural (the smallest: 42,5 = 85/2
 * makes it the half), and k is the student's p/q. `says` ('enlargement' | 'reduction') is his word, when he wrote one.
 *   scaleClaim({ from: [68, 92], to: ['42,5', '57,5'], p: 5, q: 8, says: 'reduction' })
 *     → { kind: 'scale', from: [136, 184], to: [85, 115], p: 5, q: 8, says: 'reduction' }
 * Any exact number works (1/3 too: the unit is then a third). A length that is not a number (« abc », '') gives a claim
 * that is never right (an empty `from`). p and q are numbers: a lesson turns the student's boxes into numbers first.
 */
export function scaleClaim({ from, to, p, q, says }) {
  let lengths;
  try {
    lengths = [...from, ...to].map(read);
  } catch {
    lengths = null;
  }
  const unit = lengths?.reduce((m, x) => (m % x.d === 0n ? m : (m * x.d) / gcdBig(m, x.d)), 1n);
  const whole = lengths?.map((x) => Number((x.n * unit) / x.d));
  const ok = whole && whole.every(Number.isSafeInteger);
  return {
    kind: 'scale',
    from: ok ? whole.slice(0, from.length) : [],
    to: ok ? whole.slice(from.length) : [],
    p,
    q,
    ...(says !== undefined ? { says } : {}),
  };
}
const gcdBig = (a, b) => (b === 0n ? a : gcdBig(b, a % b));
