/**
 * « حلبة التدريب » of lesson `khawass-qawasim` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a?, b?, q?, r?, gates, good }. The world's types of sentence (`missing`, `multipleOf`,
 * `remainder`…) are written by the world's strings.js (`waveSay`, `explain`); the sentences of THIS lesson that the world
 * does not know — « عدد يقسم $21 + 35$ », « قاسم مشترك للعددين 21 و 35 », « عدد يقسم باقي قسمة 42 على 12 » — are written
 * here and carried by the wave itself: `say` and `why: { right, wrong: { [gate]: line } }`.
 * THE GATE DASH IS MENTAL ARITHMETIC: a gate arrives in a few seconds, so the numbers stay inside the tables (a ≤ 100).
 * The numbers are BUILT from the lesson's rules: a sum of two multiples of d, a multiple of a multiple, a remainder of two
 * multiples of d — where the rule finds the gate before the arithmetic does (only one gate is a multiple of d).
 */
import { int } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'missing':
      return n * w.b === w.a;
    case 'divides':
      return n >= 1 && w.a % n === 0;
    case 'multipleOf':
    case 'divisibleBy':
      return n >= 1 && n % w.b === 0;
    case 'remainder':
      return n === w.r;
    case 'dividesSum':
      return n >= 1 && (w.a + w.b) % n === 0;
    case 'dividesDiff':
      return n >= 1 && (w.a - w.b) % n === 0;
    case 'commonDivisor':
      return n >= 1 && w.a % n === 0 && w.b % n === 0;
    case 'dividesRest':
      return n >= 1 && w.r % n === 0;
    default:
      return false;
  }
}

const near = (k) => [k - 2, k - 1, k + 1, k + 2].filter((n) => n > 1);
/** The small divisors (2 … 10, inside the tables) of x: the numbers a head tries first. */
const smallDivisors = (x) => [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => x % n === 0);
/** « a = n × q + r »: n does not divide a, shown by its own division. */
const leaves = (a, n) => `$${a} = ${n} \\times ${Math.floor(a / n)} + ${a % n}$: الباقي ${a % n}`;
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
/**
 * The wrong gates of a wave about a COMMON divisor: the small divisors of ONE of the numbers that do not fit — the trap the
 * rule is there for — completed by neighbours of the right gate when there are too few.
 */
function trapPool(right, xs, fits) {
  const traps = [...new Set(xs.flatMap(smallDivisors))].filter((n) => !fits(n));
  if (traps.length >= 2) return traps;
  const around = [];
  for (let n = Math.max(2, right - 4); n <= Math.min(10, right + 4); n += 1) if (!fits(n)) around.push(n);
  return [...traps, ...around];
}
/** Two different partners in [2, 9] with no common factor: the common divisors of d·p and d·q are then those of d. */
function coprimePair(rand) {
  const p = int(rand, 2, 9);
  const q = int(rand, 2, 9);
  return p !== q && gcd(p, q) === 1 ? [p, q] : null;
}
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
const notMultiples = (right, b) =>
  [right - 3, right - 2, right - 1, right + 1, right + 2, right + 3].filter((n) => n > 0 && n % b !== 0);

// ── the kinds of question ──
const G = {
  /** « d·p + d·q = d × ؟ »: the sum of two multiples of d is d times the sum of their partners. */
  sum(rand, { dMin, dMax, key }) {
    const d = int(rand, dMin, dMax);
    const k = int(rand, 2, 6) + int(rand, 2, 6);
    const a = d * k;
    if (a > 100) return null;
    return wave(rand, { type: 'missing', key, a, b: d, q: k }, k, near(k));
  },
  /** « d·p − d·q = d × ؟ »: the difference, with a partner of at least 2. */
  diff(rand, { dMin, dMax, key }) {
    const d = int(rand, dMin, dMax);
    const p = int(rand, 5, 12);
    const k = p - int(rand, 1, p - 2);
    const a = d * k;
    if (a > 100 || k < 2) return null;
    return wave(rand, { type: 'missing', key, a, b: d, q: k }, k, near(k));
  },
  /**
   * « عدد يقسم $a + b$ » (or « $a - b$ » with `minus`): a and b two multiples of d. The right gate is d; the wrong ones
   * divide ONE of the two numbers and not the sum — the rule finds the gate before the addition does.
   */
  sumOf(rand, { dMin, dMax, key, minus = false }) {
    const d = int(rand, dMin, dMax);
    const pair = coprimePair(rand);
    if (!pair) return null;
    const [p, q] = minus ? [Math.max(...pair), Math.min(...pair)] : pair;
    const [a, b] = [d * p, d * q];
    const t = minus ? a - b : a + b;
    const op = minus ? '-' : '+';
    if (a > 100 || b > 100 || t > 100) return null;
    const pool = trapPool(d, [a, b], (n) => t % n === 0);
    const only = (n) =>
      a % n === 0 ? `${n} يقسم ${a} ولا يقسم ${b}. ` : b % n === 0 ? `${n} يقسم ${b} ولا يقسم ${a}. ` : '';
    const k = minus ? p - q : p + q;
    const base = {
      type: minus ? 'dividesDiff' : 'dividesSum',
      key,
      a,
      b,
      d,
      say: `عدد يقسم $${a} ${op} ${b}$`,
      why: {
        right: `${d} يقسم ${a} و ${b}: $${a} ${op} ${b} = ${d} \\times ${p} ${op} ${d} \\times ${q} = ${d} \\times ${k}$.`,
        wrong: linesFor(pool, (n) => `${only(n)}${leaves(t, n)}، إذن ${n} لا يقسم ${t}.`),
      },
    };
    return wave(rand, base, d, pool);
  },
  /** « قاسم مشترك للعددين a و b »: d against the divisors of only one of them. */
  common(rand, { dMin, dMax, key }) {
    const d = int(rand, dMin, dMax);
    const pair = coprimePair(rand);
    if (!pair) return null;
    const [a, b] = pair.map((x) => d * x);
    if (a > 100 || b > 100) return null;
    const pool = trapPool(d, [a, b], (n) => a % n === 0 && b % n === 0);
    const line = (n) =>
      a % n === 0
        ? `${n} يقسم ${a}، لكن ${leaves(b, n)}.`
        : b % n === 0
          ? `${n} يقسم ${b}، لكن ${leaves(a, n)}.`
          : `${leaves(a, n)}، إذن ${n} لا يقسم ${a}.`;
    const base = {
      type: 'commonDivisor',
      key,
      a,
      b,
      d,
      say: `قاسم مشترك للعددين ${a} و ${b}`,
      why: {
        right: `$${a} = ${d} \\times ${a / d}$ و $${b} = ${d} \\times ${b / d}$: ${d} يقسم العددين معًا.`,
        wrong: linesFor(pool, line),
      },
    };
    return wave(rand, base, d, pool);
  },
  /** « مضاعف للعدد b » — b a two-digit number: one of its multiples among two neighbours that are not. */
  multiple(rand, { bMin, bMax, kMax, key }) {
    const b = int(rand, bMin, bMax);
    const right = b * int(rand, 2, kMax);
    if (right > 100) return null;
    return wave(rand, { type: 'multipleOf', key, b }, right, notMultiples(right, b));
  },
  /** « عدد يقبل القسمة على b »: the same question in the other phrasing. */
  divisible(rand, { key }) {
    const b = int(rand, 6, 9);
    const right = b * int(rand, 3, 11);
    if (right > 100) return null;
    return wave(rand, { type: 'divisibleBy', key, b }, right, notMultiples(right, b));
  },
  /**
   * « باقي قسمة a على b » where d divides a and b: the remainder is a multiple of d, and only ONE gate is — the rule finds
   * it before the division does.
   */
  rest(rand, { key }) {
    const d = int(rand, 3, 7);
    const m = int(rand, 2, 4);
    const b = d * m;
    const q = int(rand, 2, 4);
    const r = d * int(rand, 1, m - 1);
    const a = b * q + r;
    if (a > 100) return null;
    const pool = [];
    for (let n = 1; n < b; n += 1) if (n % d !== 0) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r, d }, r, pool);
  },
  /**
   * « عدد يقسم باقي قسمة a على b » where d divides a and b: d divides the remainder too. The wrong gates divide a or b (and
   * are not above b) but not the remainder.
   */
  restOf(rand, { key }) {
    const d = int(rand, 2, 7);
    const m = int(rand, 2, 4);
    const b = d * m;
    const q = int(rand, 2, 4);
    const r = d * int(rand, 1, m - 1);
    const a = b * q + r;
    if (a > 100) return null;
    const pool = trapPool(d, [a, b], (n) => r % n === 0).filter((n) => n <= b);
    const division = `$${a} = ${b} \\times ${q} + ${r}$`;
    const base = {
      type: 'dividesRest',
      key,
      a,
      b,
      q,
      r,
      d,
      say: `عدد يقسم باقي قسمة ${a} على ${b}`,
      why: {
        right: `${d} يقسم ${a} و ${b}، فهو يقسم الباقي: ${division} و $${r} = ${d} \\times ${r / d}$.`,
        wrong: linesFor(pool, (n) => `${division}: الباقي ${r}، و ${leaves(r, n)}، إذن ${n} لا يقسمه.`),
      },
    };
    return wave(rand, base, d, pool);
  },
  /** « باقي قسمة a على b » — any two numbers: the division itself. */
  remainder(rand, { key }) {
    const b = int(rand, 6, 12);
    const q = int(rand, 2, 8);
    const r = int(rand, 1, b - 1);
    const a = b * q + r;
    if (a > 100) return null;
    const pool = [];
    for (let n = 0; n < b; n += 1) if (n !== r) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r }, r, pool);
  },
  /** « m = d × ؟ »: the k of the proof, found by the head. */
  factor(rand, { dMin, dMax, kMin, kMax, key }) {
    const d = int(rand, dMin, dMax);
    const k = int(rand, kMin, kMax);
    const a = d * k;
    if (a > 100) return null;
    return wave(rand, { type: 'missing', key, a, b: d, q: k }, k, near(k));
  },
};

const K = { jam: 'jam-wal-farq', madaaf: 'madaaf', baqi: 'baqi-qisma', burhan: 'burhan' };

/** The map: five nodes in the order of the lesson's mind map, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.jam,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['sum', { dMin: 2, dMax: 7, key: K.jam }],
          ['sumOf', { dMin: 2, dMax: 9, key: K.jam }],
          ['common', { dMin: 2, dMax: 9, key: K.jam }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['diff', { dMin: 3, dMax: 9, key: K.jam }],
          ['sumOf', { dMin: 2, dMax: 9, key: K.jam, minus: true }],
          ['common', { dMin: 2, dMax: 9, key: K.jam }],
        ],
      },
    ],
  },
  {
    id: K.madaaf,
    levels: [
      { speed: 6.0, mix: [['multiple', { bMin: 11, bMax: 25, kMax: 4, key: K.madaaf }]] },
      {
        speed: 6.5,
        mix: [
          ['divisible', { key: K.madaaf }],
          ['multiple', { bMin: 12, bMax: 33, kMax: 3, key: K.madaaf }],
        ],
      },
    ],
  },
  {
    id: K.baqi,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['rest', { key: K.baqi }],
          ['restOf', { key: K.baqi }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['rest', { key: K.baqi }],
          ['restOf', { key: K.baqi }],
          ['remainder', { key: K.baqi }],
        ],
      },
    ],
  },
  {
    id: K.burhan,
    levels: [
      { speed: 6.0, mix: [['factor', { dMin: 3, dMax: 9, kMin: 6, kMax: 12, key: K.burhan }]] },
      { speed: 6.5, mix: [['factor', { dMin: 11, dMax: 19, kMin: 3, kMax: 5, key: K.burhan }]] },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: EXAM,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['sum', { dMin: 3, dMax: 9, key: K.jam }],
          ['sumOf', { dMin: 2, dMax: 9, key: K.jam }],
          ['multiple', { bMin: 11, bMax: 25, kMax: 4, key: K.madaaf }],
          ['rest', { key: K.baqi }],
          ['factor', { dMin: 3, dMax: 9, kMin: 6, kMax: 12, key: K.burhan }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['diff', { dMin: 3, dMax: 9, key: K.jam }],
          ['common', { dMin: 2, dMax: 9, key: K.jam }],
          ['divisible', { key: K.madaaf }],
          ['restOf', { key: K.baqi }],
          ['remainder', { key: K.baqi }],
          ['factor', { dMin: 11, dMax: 19, kMin: 3, kMax: 5, key: K.burhan }],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/** The practice hub draws the ladder as the lesson's mind map (percent of the map box; RTL: « start » is on the right). */
export const PRACTICE_MAP = {
  root: 'خواص قواسم عدد طبيعي',
  positions: {
    root: [50, 9],
    [K.jam]: [77, 34],
    [K.madaaf]: [23, 34],
    [K.baqi]: [50, 57],
    [K.burhan]: [75, 84],
    [EXAM]: [25, 84],
  },
  edges: [
    ['root', K.jam, 'قاسم مشترك يقسم'],
    [K.jam, K.madaaf, 'جمع متكرّر', true],
    [K.jam, K.baqi, 'الباقي فرق'],
    [K.madaaf, K.baqi, null],
    [K.baqi, K.burhan, 'نبرهن بـ'],
    [K.baqi, EXAM, 'نستخلص'],
    [K.burhan, EXAM, null, true],
  ],
};
