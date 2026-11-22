/**
 * « حلبة التدريب » of lesson `qasim-adad-tabii` — the CONTENT of its practice ladder (PURE: no three.js, no React).
 * The ladder itself — what a run is, what is open, the next level, the stars — is the kit's (`gameworld/kit/ladder.js`).
 * Here: the kinds of question of THIS lesson (`G`), when a gate is right (`isRight`), and the map of its levels.
 *
 * A wave is DATA: { type, key, a?, b?, q?, r?, gates: [n, n, n], good: index }. The sentences and the guidance after a
 * mistake are written from it in the world's strings.js — nothing is typed twice.
 */
import { divide } from '../../../../../../common/gameworld/divisorIsles/logic';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';

const divisorsOf = (a) => {
  const out = [];
  for (let d = 1; d <= a; d += 1) if (a % d === 0) out.push(d);
  return out;
};
const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'divisorOf':
    case 'divides':
    case 'fromProduct':
      return n >= 1 && w.a % n === 0;
    case 'multipleOf':
    case 'divisibleBy':
      return n >= 1 && n % w.b === 0;
    case 'remainder':
      return n === w.r;
    case 'missing':
      return n * w.b === w.a;
    case 'everyNumber':
      return n === 1;
    case 'biggest':
      return n === w.a;
    case 'smallest':
      return n === 1;
    case 'sureOf':
      return n >= 1 && w.a % n === 0;
    default:
      return false;
  }
}

// ── the kinds of question ──
const G = {
  /** « قاسم للعدد a » / « عدد يقسم a »: one divisor, two numbers that leave a remainder. `trap` adds a multiple of a. */
  divisorOf(rand, { aMin, aMax, dMax, key, type = 'divisorOf', trap = false }) {
    const a = int(rand, aMin, aMax);
    const ds = divisorsOf(a).filter((d) => d > 1 && d < a && d <= dMax);
    if (!ds.length) return null;
    const right = pick(rand, ds);
    const near = [];
    for (let n = 2; n <= Math.min(10, Math.max(dMax, right + 3)); n += 1)
      if (a % n !== 0 && Math.abs(n - right) <= 4) near.push(n);
    const pool = trap ? [a * 2, a * 3, ...near] : near;
    const w = wave(rand, { type, key, a }, right, pool);
    if (w && trap && !w.gates.some((n) => n > a)) return null; // the trap must really be on the rail
    return w;
  },
  /** « مضاعف للعدد b » / « عدد يقبل القسمة على b ». `trap` adds a divisor of b. */
  multipleOf(rand, { bMin, bMax, kMax, key, type = 'multipleOf', trap = false }) {
    const b = int(rand, bMin, bMax);
    const right = b * int(rand, 2, kMax);
    const near = [];
    for (let n = right - 5; n <= right + 5; n += 1) if (n > b && n % b !== 0) near.push(n);
    const small = divisorsOf(b).filter((d) => d > 1 && d < b);
    if (trap && !small.length) return null;
    const pool = trap ? [pick(rand, small), ...shuffle(rand, near).slice(0, 1)] : near;
    return wave(rand, { type, key, b }, right, pool);
  },
  /** « باقي قسمة a على b ». */
  remainder(rand, { aMin, aMax, bMin, bMax, key }) {
    // built from the table: a = b × q + r with q ≤ 9, so the quotient is a product the student knows by heart
    const b = int(rand, bMin, bMax);
    const a = Math.min(aMax, Math.max(aMin, b * int(rand, 2, 9) + int(rand, 0, b - 1)));
    const { q, r } = divide(a, b);
    if (q > 10) return null;
    const pool = [];
    for (let n = 0; n < b; n += 1) if (n !== r) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r }, r, pool);
  },
  /** « a = b × ؟ ». */
  missing(rand, { bMin, bMax, qMin, qMax, key }) {
    const b = int(rand, bMin, bMax);
    const q = int(rand, qMin, qMax);
    return wave(
      rand,
      { type: 'missing', key, a: b * q, b, q },
      q,
      [q - 2, q - 1, q + 1, q + 2].filter((n) => n > 1),
    );
  },
  /** The equality a = b × q is written; « قاسم للعدد a »: one of its two factors, against two numbers that do not divide a. */
  fromProduct(rand, { bMin, bMax, qMin, qMax, key }) {
    const b = int(rand, bMin, bMax);
    const q = int(rand, qMin, qMax);
    const a = b * q;
    const right = rand() < 0.5 ? b : q;
    const pool = [];
    for (let n = right - 4; n <= Math.min(12, right + 4); n += 1) if (n > 1 && a % n !== 0) pool.push(n);
    return wave(rand, { type: 'fromProduct', key, a, b, q }, right, pool);
  },
  /** « قاسم لكلّ عدد طبيعي ». */
  everyNumber(rand, { key }) {
    return wave(rand, { type: 'everyNumber', key }, 1, [0, 2, 3, 5, 10]);
  },
  /** « أكبر قاسم للعدد a » (a itself) against a half and a multiple. */
  biggest(rand, { aMin, aMax, key }) {
    const a = int(rand, aMin, aMax) * 2;
    return wave(rand, { type: 'biggest', key, a }, a, [a / 2, a * 2, a - 1]);
  },
  /** « أصغر قاسم للعدد a » (1). */
  smallest(rand, { aMin, aMax, key }) {
    const a = int(rand, aMin, aMax);
    return wave(rand, { type: 'smallest', key, a }, 1, [0, 2, 3, a]);
  },
  /** « قاسم أكيد للعدد p » — p is prime: only 1 and p fit, no computation needed. */
  sureOf(rand, { key, big = false }) {
    const p = big ? pick(rand, [53, 59, 61, 67, 71, 73, 79, 83, 89, 97]) : pick(rand, PRIMES);
    const right = rand() < 0.5 ? 1 : p;
    return wave(
      rand,
      { type: 'sureOf', key, a: p },
      right,
      [2, 3, 5, 7, 9, p - 1, p + 1].filter((n) => n !== p && n !== 1),
    );
  },
};

const K = { baqi: 'qasim-baqi', jidaa: 'qasim-jidaa', siyagh: 'siyagh-mutakafia', wahid: 'wahid-wa-nafsuh' };

/**
 * The map: five nodes in the order of the lesson's mind map, three levels each (easiest first). A level lists the kinds of
 * question it draws from (`mix`: [generator, params]) and its speed. `EXAM` has no key of its own: every wave carries the key
 * of the rule it uses, so the reminder always opens the right tablet.
 */
export const EXAM = SUMMARY;
/**
 * THE GATE DASH IS MENTAL ARITHMETIC (owner, 2026-11-15): a gate arrives in a few seconds, so every number the student must
 * work with stays inside the multiplication tables — a ≤ 100, a divisor or a factor ≤ 10. Nothing here needs paper; problems
 * with bigger numbers belong to the real-world cases (cases.js) and to the exam-format training of the knowledge page.
 * `MENTAL` is that limit, enforced by the tests on every generated wave.
 */
export const MENTAL = { a: 100, b: 10 };
export const PRACTICE_NODES = [
  {
    id: K.baqi,
    levels: [
      { speed: 6.0, mix: [['divisorOf', { aMin: 6, aMax: 30, dMax: 6, key: K.baqi }]] },
      {
        speed: 6.5,
        mix: [
          ['divisorOf', { aMin: 20, aMax: 72, dMax: 9, key: K.baqi }],
          ['remainder', { aMin: 10, aMax: 50, bMin: 2, bMax: 9, key: K.baqi }],
        ],
      },
      { game: 'depot', mission: 'fit' },
    ],
  },
  {
    id: K.jidaa,
    levels: [
      { speed: 6.0, mix: [['missing', { bMin: 2, bMax: 5, qMin: 2, qMax: 9, key: K.jidaa }]] },
      {
        speed: 6.5,
        mix: [
          ['missing', { bMin: 6, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
          ['fromProduct', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
        ],
      },
      { game: 'depot', mission: 'count' },
    ],
  },
  {
    id: K.siyagh,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['multipleOf', { bMin: 2, bMax: 5, kMax: 6, key: K.siyagh }],
          ['multipleOf', { bMin: 2, bMax: 5, kMax: 6, key: K.siyagh, type: 'divisibleBy' }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['divisorOf', { aMin: 12, aMax: 40, dMax: 10, key: K.siyagh, trap: true }],
          ['multipleOf', { bMin: 6, bMax: 9, kMax: 6, key: K.siyagh, trap: true }],
          ['divisorOf', { aMin: 12, aMax: 40, dMax: 10, key: K.siyagh, type: 'divides', trap: true }],
          ['multipleOf', { bMin: 6, bMax: 9, kMax: 6, key: K.siyagh, type: 'divisibleBy', trap: true }],
        ],
      },
      { game: 'depot', mission: 'orders' },
    ],
  },
  {
    id: K.wahid,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['everyNumber', { key: K.wahid }],
          ['smallest', { aMin: 12, aMax: 60, key: K.wahid }],
          ['biggest', { aMin: 6, aMax: 30, key: K.wahid }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['sureOf', { key: K.wahid }],
          ['biggest', { aMin: 20, aMax: 50, key: K.wahid }],
          ['smallest', { aMin: 30, aMax: 99, key: K.wahid }],
        ],
      },
      { game: 'depot', mission: 'special' },
    ],
  },
  // the summary node: one mixed run (still mental arithmetic), then three full cases in the way of an exam situation
  {
    id: EXAM,
    levels: [
      {
        speed: 6.8,
        mix: [
          ['remainder', { aMin: 10, aMax: 50, bMin: 2, bMax: 9, key: K.baqi }],
          ['fromProduct', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
          ['divisorOf', { aMin: 12, aMax: 40, dMax: 10, key: K.siyagh, type: 'divides', trap: true }],
          ['multipleOf', { bMin: 6, bMax: 9, kMax: 6, key: K.siyagh, type: 'divisibleBy', trap: true }],
          ['sureOf', { key: K.wahid }],
        ],
      },
      { game: 'depot', mission: 'day' }, // the cooperative's depot: the invoice, the best packaging, the trucks
      { game: 'depot', mission: 'share' }, // another world: sweets shared fairly between friends
      { game: 'depot', mission: 'tiling' }, // another world: the tiler who cuts no tile and wastes none
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map: where each node sits (percent of the map box; RTL: the
 * « start » lane is on the right), the idea at its root, and the links [from, to, label, dashed?].
 */
export const PRACTICE_MAP = {
  root: 'قاسم عدد طبيعي',
  positions: {
    root: [50, 9],
    [K.baqi]: [77, 34],
    [K.jidaa]: [23, 34],
    [K.siyagh]: [50, 57],
    [K.wahid]: [75, 84],
    [EXAM]: [25, 84],
  },
  edges: [
    ['root', K.baqi, 'معناه'],
    ['root', K.jidaa, 'معناه'],
    [K.baqi, K.jidaa, 'نفس الفكرة', true],
    [K.baqi, K.siyagh, 'نقول أيضًا'],
    [K.jidaa, K.siyagh, null],
    [K.siyagh, K.wahid, 'حالتان خاصّتان'],
    [K.siyagh, EXAM, 'نستخلص'],
    [K.wahid, EXAM, null, true],
  ],
};
