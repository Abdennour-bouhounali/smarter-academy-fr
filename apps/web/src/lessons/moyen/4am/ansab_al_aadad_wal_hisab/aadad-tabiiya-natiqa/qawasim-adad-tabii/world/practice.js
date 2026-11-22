/**
 * « حلبة التدريب » of lesson `qawasim-adad-tabii` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a?, b?, q?, gates, good }; its sentence and the guidance after a mistake are written from it
 * in the world's strings.js.
 * THE GATE DASH IS MENTAL ARITHMETIC: a gate arrives in a few seconds, so the numbers stay inside the multiplication
 * tables (a ≤ 100) — except the divisibility rules, where reading the digits of a longer number IS the skill.
 */
import { divide } from '../../../../../../common/gameworld/divisorIsles/logic';
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';

export const divisorsOf = (a) => {
  const out = [];
  for (let d = 1; d <= a; d += 1) if (a % d === 0) out.push(d);
  return out;
};
/** The last number to try when listing the divisors of a: the biggest one whose square does not pass a. */
export const lastTry = (a) => Math.floor(Math.sqrt(a));

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'divisorOf':
    case 'fromProduct':
      return n >= 1 && w.a % n === 0;
    case 'divisibleBy':
      return n >= 1 && n % w.b === 0;
    case 'remainder':
      return n === w.r;
    case 'missing':
      return n * w.b === w.a;
    case 'lastTry':
      return n === lastTry(w.a);
    case 'countOf':
      return n === divisorsOf(w.a).length;
    default:
      return false;
  }
}

// ── the kinds of question ──
const G = {
  /** « a = b × ؟ »: the partner of a divisor. */
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
  /** « قاسم للعدد a »: one divisor, two numbers that leave a remainder. */
  divisorOf(rand, { aMin, aMax, dMax, key }) {
    const a = int(rand, aMin, aMax);
    const ds = divisorsOf(a).filter((d) => d > 1 && d < a && d <= dMax);
    if (!ds.length) return null;
    const right = pick(rand, ds);
    const near = [];
    for (let n = 2; n <= Math.min(10, Math.max(dMax, right + 3)); n += 1)
      if (a % n !== 0 && Math.abs(n - right) <= 4) near.push(n);
    return wave(rand, { type: 'divisorOf', key, a }, right, near);
  },
  /** « باقي قسمة a على b » — a quotient from the tables. */
  remainder(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const a = b * int(rand, 2, 9) + int(rand, 0, b - 1);
    const { q, r } = divide(a, b);
    const pool = [];
    for (let n = 0; n < b; n += 1) if (n !== r) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r }, r, pool);
  },
  /** « آخر عدد نجرّبه لتعيين قواسم a »: against half of a (the usual mistake) and its neighbours. */
  lastTry(rand, { aMin, aMax, key }) {
    const a = int(rand, aMin, aMax);
    const d = lastTry(a);
    return wave(
      rand,
      { type: 'lastTry', key, a },
      d,
      [Math.floor(a / 2), d + 1, d - 1, a].filter((n) => n > 1),
    );
  },
  /** « عدد قواسم a » — counted in pairs. */
  countOf(rand, { list, key }) {
    const a = pick(rand, list);
    const n = divisorsOf(a).length;
    return wave(
      rand,
      { type: 'countOf', key, a },
      n,
      [n - 2, n - 1, n + 1, n + 2].filter((x) => x > 1),
    );
  },
  /** « عدد يقبل القسمة على b » among three numbers of three digits: only the rule can answer in time. */
  rule(rand, { planks, key }) {
    const b = pick(rand, planks);
    const right = b * int(rand, Math.ceil(100 / b), Math.floor(400 / b));
    const pool = [];
    for (let n = right - 9; n <= right + 9; n += 1) if (n >= 100 && n % b !== 0) pool.push(n);
    return wave(rand, { type: 'divisibleBy', key, b }, right, pool);
  },
};

const K = { jidaa: 'jidaa-aamilayn', rappel: 'qasim-rappel', tariqa: 'tariqa-qawasim', qawaid: 'qawaid-qisma' };
const COUNTED = [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25];

/** The map: five nodes in the order of the lesson's mind map, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
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
    ],
  },
  {
    id: K.rappel,
    levels: [
      { speed: 6.0, mix: [['divisorOf', { aMin: 8, aMax: 36, dMax: 6, key: K.rappel }]] },
      {
        speed: 6.5,
        mix: [
          ['divisorOf', { aMin: 24, aMax: 81, dMax: 9, key: K.rappel }],
          ['remainder', { bMin: 2, bMax: 9, key: K.rappel }],
        ],
      },
    ],
  },
  {
    id: K.tariqa,
    levels: [
      { speed: 5.6, mix: [['lastTry', { aMin: 10, aMax: 50, key: K.tariqa }]] },
      {
        speed: 6.0,
        mix: [
          ['lastTry', { aMin: 50, aMax: 99, key: K.tariqa }],
          ['countOf', { list: COUNTED, key: K.tariqa }],
        ],
      },
    ],
  },
  {
    id: K.qawaid,
    levels: [
      { speed: 5.6, mix: [['rule', { planks: [2, 5], key: K.qawaid }]] },
      { speed: 5.8, mix: [['rule', { planks: [3, 9, 4], key: K.qawaid }]] },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: EXAM,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['missing', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
          ['divisorOf', { aMin: 24, aMax: 81, dMax: 9, key: K.rappel }],
          ['lastTry', { aMin: 20, aMax: 99, key: K.tariqa }],
          ['rule', { planks: [3, 5, 9], key: K.qawaid }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['fromProduct', { bMin: 4, bMax: 9, qMin: 4, qMax: 9, key: K.jidaa }],
          ['countOf', { list: COUNTED, key: K.tariqa }],
          ['lastTry', { aMin: 40, aMax: 99, key: K.tariqa }],
          ['rule', { planks: [3, 4, 9], key: K.qawaid }],
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
  root: 'قواسم عدد طبيعي',
  positions: {
    root: [50, 9],
    [K.jidaa]: [77, 34],
    [K.rappel]: [23, 34],
    [K.tariqa]: [50, 57],
    [K.qawaid]: [75, 84],
    [EXAM]: [25, 84],
  },
  edges: [
    ['root', K.jidaa, 'نعيّنها بـ'],
    ['root', K.rappel, 'تذكّر'],
    [K.jidaa, K.rappel, 'كلّ عامل قاسم', true],
    [K.jidaa, K.tariqa, 'الجداءات تتكرّر'],
    [K.rappel, K.tariqa, null],
    [K.tariqa, K.qawaid, 'نُسرّعها بـ'],
    [K.tariqa, EXAM, 'نستخلص'],
    [K.qawaid, EXAM, null, true],
  ],
};
