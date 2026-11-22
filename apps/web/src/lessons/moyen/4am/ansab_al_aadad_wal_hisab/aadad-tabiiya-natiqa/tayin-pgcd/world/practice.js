/**
 * « حلبة التدريب » of lesson `tayin-pgcd` — the CONTENT of its practice ladder (PURE). The ladder itself is the kit's
 * (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a?, b?, q?, gates, good }. The world writes the sentence of the types it knows (`missing`);
 * the sentences of THIS lesson — « $\mathrm{PGCD}(12 ; 20)$ », « قاسم مشترك للعددين 12 و 20 » — are written here and
 * carried by the wave itself: `say` and `why: { right, wrong: { [gate]: line } }`.
 * THE GATE DASH IS MENTAL ARITHMETIC: every number stays at most 100, and the divisors to try inside the tables.
 * The weight follows the exercise bank: the first key (list and intersect, 116 of its 150 questions) has three levels,
 * the third (the smaller divides the bigger, 27) two, the second (direct results, 7) one.
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { commonDivisors, divisorsOf, gcd, listAr, pgcdTex } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'missing':
      return n * w.b === w.a;
    case 'pgcd':
      return n === gcd(w.a, w.b);
    case 'commonDivisor':
      return n >= 1 && w.a % n === 0 && w.b % n === 0;
    default:
      return false;
  }
}

const near = (k) => [k - 2, k - 1, k + 1, k + 2].filter((n) => n > 1);
const smallestPrime = (n) => divisorsOf(n).find((d) => d > 1);
/** The composite numbers 12 … 99: a « PGCD(a ; a) » or « PGCD(a ; 0) » whose divisors are not only 1 and a. */
const COMPOSITES = Array.from({ length: 88 }, (_, i) => i + 12).filter((n) => smallestPrime(n) !== n);
/** « a = n × q + r »: n does not divide a, shown by its own division. */
const leaves = (a, n) => `$${a} = ${n} \\times ${Math.floor(a / n)} + ${a % n}$: الباقي ${a % n}`;
const ZERO = '0 ليس قاسمًا لأيّ عدد: لا نقسم على 0.';
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** Two different partners in [2, 9] with no common factor: the common divisors of d·p and d·q are then those of d. */
function coprimePair(rand) {
  const p = int(rand, 2, 9);
  const q = int(rand, 2, 9);
  return p !== q && gcd(p, q) === 1 ? [p, q] : null;
}
/** Why a wrong gate n is not the PGCD of a and b (g): it does not divide one of them, or it is not the greatest. */
function notPgcd(a, b, g, n) {
  if (n === 0) return ZERO;
  if (n > a && a > 0) return `${n} أكبر من ${a}: لا يقسمه.`;
  if (n > b && b > 0) return `${n} أكبر من ${b}: لا يقسمه.`;
  const ofA = a % n === 0;
  const ofB = b % n === 0;
  if (ofA && ofB) return `${n} قاسم مشترك للعددين، لكنّه ليس الأكبر: ${g} يقسمهما أيضًا.`;
  if (ofA) return `${n} يقسم ${a}، لكن ${leaves(b, n)}.`;
  if (ofB) return `${n} يقسم ${b}، لكن ${leaves(a, n)}.`;
  return `${leaves(a, n)}، إذن ${n} لا يقسم ${a}.`;
}
/** A « PGCD » wave: the sentence and the guidance travel with it. */
function pgcdWave(rand, { key, a, b, right, pool, why }) {
  const base = {
    type: 'pgcd',
    key,
    a,
    b,
    say: `$${pgcdTex(a, b)}$`,
    why: { right: why, wrong: linesFor(pool, (n) => notPgcd(a, b, right, n)) },
  };
  return wave(rand, base, right, pool);
}
/** a and b in a random order. */
const order = (rand, x, y) => (rand() < 0.5 ? [x, y] : [y, x]);

// ── the kinds of question ──
const G = {
  /** « قاسم مشترك للعددين a و b »: a common divisor against the small divisors of only one of them. */
  common(rand, { dMin, dMax, key }) {
    const d = int(rand, dMin, dMax);
    const pair = coprimePair(rand);
    if (!pair) return null;
    const [a, b] = pair.map((x) => d * x);
    if (a > 100 || b > 100) return null;
    const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => (a % n === 0) !== (b % n === 0));
    const line = (n) => (a % n === 0 ? `${n} يقسم ${a}، لكن ${leaves(b, n)}.` : `${n} يقسم ${b}، لكن ${leaves(a, n)}.`);
    const base = {
      type: 'commonDivisor',
      key,
      a,
      b,
      say: `قاسم مشترك للعددين ${a} و ${b}`,
      why: {
        right: `$${a} = ${d} \\times ${a / d}$ و $${b} = ${d} \\times ${b / d}$: ${d} يقسم العددين معًا.`,
        wrong: linesFor(pool, line),
      },
    };
    // the right gate is d; every wrong one divides exactly one of the two numbers
    return wave(rand, base, d, pool);
  },
  /**
   * « PGCD(a ; b) » found by listing: a = d·p, b = d·q with p and q coprime, so the PGCD is d. The wrong gates are the
   * traps of the lists: a common divisor that is not the greatest, a divisor of only one of the two numbers.
   */
  list(rand, { dMin, dMax, key }) {
    const d = int(rand, dMin, dMax);
    const pair = coprimePair(rand);
    if (!pair) return null;
    const [a, b] = pair.map((x) => d * x);
    if (a > 100 || b > 100) return null;
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => n !== d && (a % n === 0 || b % n === 0));
    const why = `قواسم ${a}: ${listAr(divisorsOf(a))}. قواسم ${b}: ${listAr(divisorsOf(b))}. المشتركة: ${listAr(commonDivisors(a, b))}، وأكبرها ${d}.`;
    return pgcdWave(rand, { key, a, b, right: d, pool, why });
  },
  /** « PGCD(a ; a) »: the number itself. */
  same(rand, { key }) {
    const a = pick(rand, COMPOSITES);
    const p = smallestPrime(a);
    return pgcdWave(rand, {
      key,
      a,
      b: a,
      right: a,
      pool: [1, p, a / p],
      why: `$${a} = ${a} \\times 1$: أكبر قاسم للعدد ${a} هو ${a} نفسه، إذن $${pgcdTex(a, a)} = ${a}$.`,
    });
  },
  /** « PGCD(a ; 0) » or « PGCD(0 ; a) »: every number divides 0. */
  zero(rand, { key }) {
    const n = pick(rand, COMPOSITES);
    const [a, b] = order(rand, n, 0);
    return pgcdWave(rand, {
      key,
      a,
      b,
      right: n,
      pool: [0, 1, n / smallestPrime(n)],
      why: `كلّ عدد يقسم 0: $0 = ${n} \\times 0$. إذن كلّ قواسم ${n} مشتركة، وأكبرها ${n}.`,
    });
  },
  /** « PGCD(a ; 1) » or « PGCD(1 ; a) »: 1 has one divisor. */
  one(rand, { key }) {
    const n = pick(rand, COMPOSITES);
    const [a, b] = order(rand, n, 1);
    return pgcdWave(rand, {
      key,
      a,
      b,
      right: 1,
      pool: [0, smallestPrime(n), n],
      why: `للعدد 1 قاسم واحد هو 1، وهو يقسم ${n}: إذن $${pgcdTex(a, b)} = 1$.`,
    });
  },
  /** « PGCD(a ; b) » where b divides a (a = b × k): the smaller one. */
  divides(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const k = int(rand, 2, 9);
    const n = b * k;
    if (n > 100) return null;
    const [x, y] = order(rand, n, b);
    const pool = [1, k, n, smallestPrime(b)].filter((v) => v !== b);
    return pgcdWave(rand, {
      key,
      a: x,
      b: y,
      right: b,
      pool,
      why: `$${n} = ${b} \\times ${k}$: ${b} يقسم ${n}، إذن $${pgcdTex(x, y)} = ${b}$.`,
    });
  },
  /** « a = b × ؟ »: is the smaller a divisor of the bigger? */
  factor(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const k = int(rand, 2, 9);
    const a = b * k;
    if (a > 100) return null;
    return wave(rand, { type: 'missing', key, a, b, q: k }, k, near(k));
  },
};

const K = { hasr: 'hasr-wa-taqatu', nataij: 'nataij-mubashira', yaqsim: 'b-yaqsim-a' };

/** The map: four nodes in the order of the lesson's mind map, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.hasr,
    levels: [
      { speed: 6.0, mix: [['common', { dMin: 2, dMax: 6, key: K.hasr }]] },
      {
        speed: 6.3,
        mix: [
          ['list', { dMin: 2, dMax: 6, key: K.hasr }],
          ['list', { dMin: 2, dMax: 10, key: K.hasr }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['list', { dMin: 4, dMax: 10, key: K.hasr }],
          ['common', { dMin: 4, dMax: 10, key: K.hasr }],
        ],
      },
    ],
  },
  {
    id: K.nataij,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['same', { key: K.nataij }],
          ['zero', { key: K.nataij }],
          ['one', { key: K.nataij }],
        ],
      },
    ],
  },
  {
    id: K.yaqsim,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['factor', { bMin: 3, bMax: 9, key: K.yaqsim }],
          ['divides', { bMin: 3, bMax: 9, key: K.yaqsim }],
        ],
      },
      { speed: 6.5, mix: [['divides', { bMin: 6, bMax: 15, key: K.yaqsim }]] },
    ],
  },
  // the summary node: two mixed runs, the second faster — most waves on the first key, as in the bank
  {
    id: EXAM,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['list', { dMin: 2, dMax: 8, key: K.hasr }],
          ['list', { dMin: 2, dMax: 8, key: K.hasr }],
          ['same', { key: K.nataij }],
          ['divides', { bMin: 3, bMax: 12, key: K.yaqsim }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['list', { dMin: 3, dMax: 10, key: K.hasr }],
          ['common', { dMin: 3, dMax: 10, key: K.hasr }],
          ['zero', { key: K.nataij }],
          ['one', { key: K.nataij }],
          ['divides', { bMin: 6, bMax: 15, key: K.yaqsim }],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box; RTL: « start » is on the right).
 * Its edge labels are shown from the first screen, before any key is forged: they name the story's places (the
 * workshop, the purse, the masts), never a rule (2026-11-19: the draft's « دون حساب », « طريق مختصر » hinted the keys).
 */
export const PRACTICE_MAP = {
  root: 'تعيين القاسم المشترك الأكبر',
  positions: {
    root: [50, 9],
    [K.hasr]: [79, 30],
    [K.nataij]: [24, 30],
    [K.yaqsim]: [74, 80],
    [EXAM]: [26, 80],
  },
  edges: [
    ['root', K.hasr, 'الورشة'],
    [K.hasr, K.nataij, 'الكيس'],
    [K.hasr, K.yaqsim, 'الصواري'],
    [K.nataij, EXAM, null, true],
    [K.yaqsim, EXAM, 'نستخلص'],
  ],
};
