/**
 * « حلبة التدريب » of lesson `qisma-iqlidiya-hasr` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a?, b?, q?, r?, gates, good }. The world's types of sentence (`remainder`, `missing`,
 * `multipleOf`, `divisibleBy`, `divides`) are written by the world's strings.js (`waveSay`, `explain`); the sentences of
 * THIS lesson that the world does not know — « حاصل قسمة 250 على 12 », « حاصل القسمة بالنقصان », « عدد الصناديق
 * اللازمة », « أصغر عدد نضيفه » — are written here and carried by the wave itself: `say` and
 * `why: { right, wrong: { [gate]: line } }`.
 * THE GATE DASH IS MENTAL ARITHMETIC: a gate arrives in a few seconds. The first level of a node stays inside the tables
 * (a ≤ 100); the second asks an estimate — a divisor of two digits and a quotient of tens (a ≤ 600), and, for the first
 * key, ONE DIGIT with a divisor of three digits (`digit`: what this lesson adds — 1500 by 208 is 7: the divisor is close
 * to 200) — where the three gates are neighbours and one product decides.
 */
import { int } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { count, noun } from './counted';

const CAN = noun('علبة', 'علب', 'f');

const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'quotient':
    case 'byDefault':
    case 'full':
      return n === Math.floor(w.a / w.b);
    case 'byExcess':
    case 'needed':
      return n === Math.ceil(w.a / w.b);
    case 'remainder':
      return n === w.r;
    case 'missing':
      return n * w.b === w.a;
    case 'divides':
      return n >= 1 && w.a % n === 0;
    case 'multipleOf':
    case 'divisibleBy':
      return n >= 1 && n % w.b === 0;
    case 'complete':
      return n === w.b - w.r;
    default:
      return false;
  }
}

/** « a = b × q + r » in LaTeX. */
const euclid = (a, b) => `$${a} = ${b} \\times ${div(a, b).q} + ${div(a, b).r}$`;
/** Why a gate n is not the quotient (the full count) of a by b. */
function notQuotient(a, b, n) {
  const { q } = div(a, b);
  if (n > q) return `$${b} \\times ${n} = ${b * n}$ يتجاوز ${a}: ${n} أكبر من الحاصل.`;
  return `$${a} - ${b} \\times ${n} = ${a - b * n}$، وهذا ليس أصغر من ${b}: يدخل ${b} مرّة أخرى على الأقلّ.`;
}
/** Why a gate n is not the count needed to cover a by b. */
function notNeeded(a, b, n) {
  const { q } = div(a, b);
  if (n <= q) return `$${b} \\times ${n} = ${b * n}$ أصغر من ${a}: ${n} لا يكفي.`;
  return `$${b} \\times ${q + 1} = ${b * (q + 1)}$ يكفي ${a}: ${n} أكثر من اللازم.`;
}
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
const notMultiples = (right, b) =>
  [right - 3, right - 2, right - 1, right + 1, right + 2, right + 3].filter((n) => n > 0 && n % b !== 0);

/** A division a = b × q + r with r ≠ 0, drawn in the ranges asked; null when a passes `aMax`. */
function draw(rand, { bMin, bMax, qMin, qMax, aMax }) {
  const b = int(rand, bMin, bMax);
  const q = int(rand, qMin, qMax);
  const r = int(rand, 1, b - 1);
  const a = b * q + r;
  return a > aMax ? null : { a, b, q, r };
}

// ── the kinds of question ──
const G = {
  /** « حاصل قسمة a على b »: the quotient, against its neighbours and the remainder. */
  quotient(rand, p) {
    const d = draw(rand, p);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q - 1, q + 1, r, q + 2].filter((n) => n >= 0 && n !== q);
    const base = {
      type: 'quotient',
      key: p.key,
      a,
      b,
      q,
      r,
      say: `حاصل قسمة ${a} على ${b}`,
      why: {
        right: `${euclid(a, b)} و ${r} أصغر من ${b}: الحاصل ${q}.`,
        wrong: linesFor(pool, (n) => (n === r ? `${n} هو الباقي، لا الحاصل: ${euclid(a, b)}.` : notQuotient(a, b, n))),
      },
    };
    return wave(rand, base, q, pool);
  },
  /**
   * « حاصل قسمة a على b » with a divisor of THREE digits and a quotient of one digit: the digit is estimated (the divisor
   * is close to a hundred), and the two neighbours are the gates beside it — one product decides.
   */
  digit(rand, { key, bMin = 104, bMax = 395 }) {
    const b = int(rand, bMin, bMax);
    const q = int(rand, 2, 9);
    const r = int(rand, 1, b - 1);
    const a = b * q + r;
    const pool = [q - 1, q + 1];
    const base = {
      type: 'quotient',
      key,
      a,
      b,
      q,
      r,
      long: true,
      say: `حاصل قسمة ${a} على ${b}`,
      why: {
        right: `$${b} \\times ${q} = ${b * q}$ لا يتجاوز ${a}، و $${b} \\times ${q + 1} = ${b * (q + 1)}$ يتجاوزه: الحاصل ${q}.`,
        wrong: linesFor(pool, (n) => notQuotient(a, b, n)),
      },
    };
    return wave(rand, base, q, pool);
  },
  /** « باقي قسمة a على b » — the world's sentence: the traps are a remainder not smaller than b and the quotient. */
  remainder(rand, p) {
    const d = draw(rand, p);
    if (!d) return null;
    const { a, b, q, r } = d;
    return wave(
      rand,
      { type: 'remainder', key: p.key, a, b, q, r },
      r,
      [r + b, b - r, q, r + 1].filter((n) => n !== r),
    );
  },
  /** « $a = b \times □ + r$ »: the quotient, read from the equality. */
  equality(rand, p) {
    const d = draw(rand, p);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q - 1, q + 1, q + 2].filter((n) => n >= 0);
    const base = {
      type: 'quotient',
      key: p.key,
      a,
      b,
      q,
      r,
      say: `$${a} = ${b} \\times \\square + ${r}$`,
      why: {
        right: `$${b} \\times ${q} + ${r} = ${a}$.`,
        wrong: linesFor(pool, (n) => `$${b} \\times ${n} + ${r} = ${b * n + r}$، وليس ${a}.`),
      },
    };
    return wave(rand, base, q, pool);
  },
  /**
   * « القيمة المقرّبة بالنقصان / بالزيادة » (`excess`), or in a context « الصناديق المملوءة / اللازمة » (`boxes`): the two
   * ends of the bracket, each against the other end — the trap the rule is there for.
   */
  bracket(rand, p) {
    const d = draw(rand, p);
    if (!d) return null;
    const { a, b, q, r } = d;
    const up = Boolean(p.excess);
    const right = up ? q + 1 : q;
    const pool = (up ? [q, q + 2, r] : [q + 1, q - 1, r]).filter((n) => n >= 0 && n !== right);
    const tex = `$${a} \\div ${b}$`;
    const say = p.boxes
      ? `${up ? 'عدد الصناديق اللازمة' : 'عدد الصناديق المملوءة'}: ${count(a, CAN)}، ${b} في كلّ صندوق`
      : `${up ? 'حاصل القسمة بالزيادة' : 'حاصل القسمة بالنقصان'}: ${tex}`;
    const bracketLine = `$${b * q} < ${a} < ${b * (q + 1)}$، إذن $${q} < ${a} \\div ${b} < ${q + 1}$`;
    const base = {
      type: up ? (p.boxes ? 'needed' : 'byExcess') : p.boxes ? 'full' : 'byDefault',
      key: p.key,
      a,
      b,
      q,
      r,
      say,
      why: {
        right: `${bracketLine}: ${up ? `القيمة بالزيادة ${q + 1}` : `القيمة بالنقصان ${q}`}.`,
        wrong: linesFor(pool, (n) =>
          n === r && n !== q && n !== q + 1
            ? `${n} هو الباقي: ${euclid(a, b)}.`
            : up
              ? notNeeded(a, b, n)
              : notQuotient(a, b, n),
        ),
      },
    };
    return wave(rand, base, right, pool);
  },
  /** « $a = b \times □$ » with b dividing a: the zero remainder, read as a product. */
  exact(rand, { bMin, bMax, qMin, qMax, aMax, key }) {
    const b = int(rand, bMin, bMax);
    const q = int(rand, qMin, qMax);
    const a = b * q;
    if (a > aMax) return null;
    return wave(
      rand,
      { type: 'missing', key, a, b, q },
      q,
      [q - 1, q + 1, q + 2].filter((n) => n > 0),
    );
  },
  /** « مضاعف للعدد b » or « عدد يقبل القسمة على b » (`divisible`): one multiple among neighbours that leave a remainder. */
  multiple(rand, { bMin, bMax, kMax, key, divisible = false }) {
    const b = int(rand, bMin, bMax);
    const right = b * int(rand, 2, kMax);
    if (right > 100) return null;
    return wave(rand, { type: divisible ? 'divisibleBy' : 'multipleOf', key, b }, right, notMultiples(right, b));
  },
  /** « عدد يقسم a »: a divisor of a among numbers that leave a remainder. */
  divisor(rand, { key }) {
    const b = int(rand, 3, 9);
    const a = b * int(rand, 4, 11);
    if (a > 100) return null;
    const pool = [2, 3, 4, 5, 6, 7, 8, 9].filter((n) => a % n !== 0);
    return wave(rand, { type: 'divides', key, a }, b, pool);
  },
  /** « أصغر عدد نضيفه إلى a ليقبل القسمة على b »: b − r — the remainder itself is the trap. */
  complete(rand, p) {
    const d = draw(rand, p);
    if (!d) return null;
    const { a, b, q, r } = d;
    const right = b - r;
    const pool = [r, right + 1, right - 1, right + b].filter((n) => n > 0 && n !== right && (a + n) % b !== 0);
    const base = {
      type: 'complete',
      key: p.key,
      a,
      b,
      q,
      r,
      say: `أصغر عدد نضيفه إلى ${a} ليقبل القسمة على ${b}`,
      why: {
        right: `${euclid(a, b)}: ينقص ${right} ليكتمل ${b} آخر، و $${a} + ${right} = ${b} \\times ${q + 1}$.`,
        wrong: linesFor(
          pool,
          (n) => `$${a} + ${n} = ${a + n} = ${b} \\times ${div(a + n, b).q} + ${(a + n) % b}$: الباقي ليس 0.`,
        ),
      },
    };
    return wave(rand, base, right, pool);
  },
};

const K = { ay: 'qisma-ay-adad', hasr: 'hasr-hasil', zero: 'inidam-baqi' };
/** The ranges: inside the tables, then the estimate of a two-digit divisor. */
const SMALL = { bMin: 3, bMax: 9, qMin: 3, qMax: 9, aMax: 100 };
const BIG = { bMin: 11, bMax: 25, qMin: 10, qMax: 30, aMax: 600 };

const EXAM = SUMMARY;
/** The map: four nodes in the order of the lesson's mind map, levels from the easiest. */
export const PRACTICE_NODES = [
  {
    id: K.ay,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['quotient', { ...SMALL, key: K.ay }],
          ['remainder', { ...SMALL, key: K.ay }],
          ['equality', { ...SMALL, key: K.ay }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['quotient', { ...BIG, key: K.ay }],
          ['remainder', { ...BIG, key: K.ay }],
          ['equality', { ...BIG, key: K.ay }],
          ['digit', { key: K.ay }],
          ['digit', { key: K.ay }],
        ],
      },
    ],
  },
  {
    id: K.hasr,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['bracket', { ...SMALL, key: K.hasr }],
          ['bracket', { ...SMALL, key: K.hasr, excess: true }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['bracket', { ...BIG, key: K.hasr, boxes: true }],
          ['bracket', { ...BIG, key: K.hasr, boxes: true, excess: true }],
          ['bracket', { ...BIG, key: K.hasr, excess: true }],
        ],
      },
    ],
  },
  {
    id: K.zero,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['multiple', { bMin: 6, bMax: 15, kMax: 6, key: K.zero, divisible: true }],
          ['multiple', { bMin: 11, bMax: 25, kMax: 4, key: K.zero }],
          ['divisor', { key: K.zero }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['exact', { ...BIG, key: K.zero }],
          ['complete', { ...SMALL, key: K.zero }],
          ['complete', { ...BIG, aMax: 300, key: K.zero }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: EXAM,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['quotient', { ...SMALL, key: K.ay }],
          ['remainder', { ...BIG, key: K.ay }],
          ['bracket', { ...SMALL, key: K.hasr, excess: true }],
          ['multiple', { bMin: 6, bMax: 15, kMax: 6, key: K.zero, divisible: true }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['quotient', { ...BIG, key: K.ay }],
          ['digit', { key: K.ay }],
          ['bracket', { ...BIG, key: K.hasr, boxes: true }],
          ['bracket', { ...BIG, key: K.hasr, boxes: true, excess: true }],
          ['exact', { ...BIG, key: K.zero }],
          ['complete', { ...SMALL, key: K.zero }],
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
  root: 'القسمة الإقليدية وحصر حاصل القسمة',
  positions: {
    root: [50, 9],
    [K.ay]: [74, 36],
    [K.hasr]: [26, 36],
    [K.zero]: [70, 78],
    [EXAM]: [28, 80],
  },
  edges: [
    ['root', K.ay, 'نجرّب ثمّ نصحّح'],
    [K.ay, K.hasr, 'الحاصل وما يليه'],
    [K.ay, K.zero, 'باقٍ معدوم'],
    [K.hasr, EXAM, 'نستخلص'],
    [K.zero, EXAM, null, true],
  ],
};
