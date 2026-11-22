/**
 * « حلبة التدريب » of lesson `qawaid-qabiliyat-qisma` — the CONTENT of its practice ladder (PURE). The ladder itself is
 * the kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its
 * levels. A wave is DATA: { type, key, …numbers, gates, good }.
 *
 * The world knows a few sentences (`divisibleBy`, `multipleOf`, `remainder` of `divisorIsles/strings.js`, explained by
 * the division) — the fourth key uses them, on numbers inside the tables: « يقبل القسمة » IS the remainder 0. The
 * sentences of the three reading keys are THIS lesson's, carried by the wave (`say`) with their guidance
 * (`why: { right, wrong: { [gate]: line } }`), which reads the number the way the key does: its units digit, the sum of
 * its digits, the number its last two digits write — never a division the head cannot do in a few seconds.
 * A reading wave shows numbers of three or four digits: the key reads them at a glance, where dividing would not.
 * The wrong gates are the traps the rule is there for: an even number for 5, a multiple of 3 for 9, an even number whose
 * last two digits are not a multiple of 4, a number ending in 3 for 3.
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';

export const digitsOf = (n) => String(n).split('').map(Number);
export const digitSum = (n) => digitsOf(n).reduce((t, x) => t + x, 0);
/** The value of a « missing digit » wave for the digit n: □ in the units, or in the tens between `pre` and `post`. */
export const digitValue = (w, n) => (w.pos === 'units' ? w.pre * 10 + n : w.pre * 100 + n * 10 + w.post);

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'unitsBy':
    case 'sumBy':
    case 'last2By':
    case 'divisibleBy':
    case 'multipleOf':
      return n >= 1 && n % w.b === 0;
    case 'notBy':
      return n >= 1 && n % w.b !== 0;
    case 'sum3not9':
      return n >= 1 && n % 3 === 0 && n % 9 !== 0;
    case 'digitFor':
      return Number.isInteger(n) && n >= 0 && n <= 9 && digitValue(w, n) % w.b === 0;
    case 'remainder':
      return n === w.r;
    case 'dividesNum':
      return n >= 1 && w.a % n === 0;
    default:
      return false;
  }
}

// ── helpers ──
const range = (digits) => [10 ** (digits - 1), 10 ** digits - 1];
/** A number of `digits` digits that passes `test` — or null after a few tries (the generator then asks again). */
function draw(rand, digits, test) {
  const [lo, hi] = range(digits);
  for (let k = 0; k < 60; k += 1) {
    const n = int(rand, lo, hi);
    if (test(n)) return n;
  }
  return null;
}
/** Several such numbers (the traps of a wave). */
const drawMany = (rand, digits, test, count) =>
  Array.from({ length: count }, () => draw(rand, digits, test)).filter((n) => n != null);
/** « a = b × q + r », with q and r computed. */
const division = (a, b) => `$${a} = ${b} \\times ${Math.floor(a / b)} + ${a % b}$`;
const sumLine = (n) => `$${digitsOf(n).join(' + ')} = ${digitSum(n)}$`;
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
const notMultiples = (right, b) =>
  [right - 3, right - 2, right - 1, right + 1, right + 2, right + 3].filter((n) => n > 0 && n % b !== 0);

/** The units digits that a multiple of b shows (b = 10: « by 2 and by 5 »), and the traps students really pick. */
const UNITS = {
  2: { ok: [0, 2, 4, 6, 8], traps: [5, 1, 3, 7, 9] },
  5: { ok: [0, 5], traps: [2, 4, 6, 8, 3] },
  10: { ok: [0], traps: [5, 2, 4, 6, 8] },
};

// ── the kinds of question ──
const G = {
  /**
   * « عدد يقبل القسمة على 5 » (or 2, or « على 2 وعلى 5 » with b = 10): the gates differ in their units digit, and the
   * wrong ones end with the digit a student wrongly trusts (an even digit for 5, a 5 for 2).
   */
  unitsBy(rand, { b, digits, key }) {
    const [lo, hi] = range(digits - 1);
    const make = (u) => int(rand, lo, hi) * 10 + u;
    const right = make(pick(rand, UNITS[b].ok));
    const pool = UNITS[b].traps.map(make);
    const say = b === 10 ? 'عدد يقبل القسمة على 2 وعلى 5' : `عدد يقبل القسمة على ${b}`;
    const proof =
      b === 10
        ? `$${right} = 2 \\times ${right / 2}$ و $${right} = 5 \\times ${right / 5}$`
        : `$${right} = ${b} \\times ${right / b}$`;
    const failing = (n) => (b === 10 ? (n % 2 !== 0 ? 2 : 5) : b);
    const base = {
      type: 'unitsBy',
      a: right,
      key,
      b,
      say,
      why: {
        right: `رقم آحاد ${right} هو ${right % 10}: ${proof}.`,
        wrong: linesFor(
          pool,
          (n) => `رقم آحاد ${n} هو ${n % 10}: ${division(n, failing(n))}، الباقي ${n % failing(n)}.`,
        ),
      },
    };
    return wave(rand, base, right, pool);
  },
  /** « عدد لا يقبل القسمة على b » (b = 2 or 5): two gates are multiples, one is not. */
  notBy(rand, { b, digits, key }) {
    const [lo, hi] = range(digits - 1);
    const make = (u) => int(rand, lo, hi) * 10 + u;
    const right = make(pick(rand, UNITS[b].traps));
    const pool = UNITS[b].ok.flatMap((u) => [make(u), make(u)]);
    const base = {
      type: 'notBy',
      a: right,
      key,
      b,
      say: `عدد لا يقبل القسمة على ${b}`,
      why: {
        right: `رقم آحاد ${right} هو ${right % 10}: ${division(right, b)}، الباقي ${right % b}.`,
        wrong: linesFor(pool, (n) => `رقم آحاد ${n} هو ${n % 10}: $${n} = ${b} \\times ${n / b}$، الباقي 0.`),
      },
    };
    return wave(rand, base, right, pool);
  },
  /**
   * « عدد يقبل القسمة على 9 » (or 3): read by the sum of the digits. For 9 the traps are multiples of 3 that are not
   * multiples of 9; for 3, numbers that END with 3, 6 or 9 and are not multiples of 3.
   */
  sumBy(rand, { b, digits, key }) {
    const right = draw(rand, digits, (n) => n % b === 0);
    if (right == null) return null;
    const pool =
      b === 9
        ? [
            ...drawMany(rand, digits, (n) => n % 3 === 0 && n % 9 !== 0, 3),
            ...drawMany(rand, digits, (n) => n % 3 !== 0, 1),
          ]
        : drawMany(rand, digits, (n) => n % 3 !== 0 && [3, 6, 9].includes(n % 10), 4);
    const s = (n) => digitSum(n);
    const base = {
      type: 'sumBy',
      a: right,
      key,
      b,
      say: `عدد يقبل القسمة على ${b}`,
      why: {
        right: `مجموع أرقام ${right}: ${sumLine(right)}، و $${s(right)} = ${b} \\times ${s(right) / b}$.`,
        wrong: linesFor(pool, (n) => `مجموع أرقام ${n}: ${sumLine(n)}، و ${division(s(n), b)}.`),
      },
    };
    return wave(rand, base, right, pool);
  },
  /** « عدد يقبل القسمة على 3 ولا يقبل القسمة على 9 »: the traps are a multiple of 9 and a number that is not of 3. */
  sum3not9(rand, { digits, key }) {
    const right = draw(rand, digits, (n) => n % 3 === 0 && n % 9 !== 0);
    if (right == null) return null;
    const pool = [...drawMany(rand, digits, (n) => n % 9 === 0, 2), ...drawMany(rand, digits, (n) => n % 3 !== 0, 2)];
    const s = (n) => digitSum(n);
    const said = (n) =>
      n % 9 === 0
        ? `مجموع أرقام ${n}: ${sumLine(n)}، و $${s(n)} = 9 \\times ${s(n) / 9}$: يقبل القسمة على 9.`
        : `مجموع أرقام ${n}: ${sumLine(n)}، و ${division(s(n), 3)}: لا يقبل القسمة على 3.`;
    const base = {
      type: 'sum3not9',
      a: right,
      key,
      say: 'عدد يقبل القسمة على 3 ولا يقبل القسمة على 9',
      why: {
        right: `مجموع أرقام ${right}: ${sumLine(right)}، و $${s(right)} = 3 \\times ${s(right) / 3}$ و ${division(s(right), 9)}.`,
        wrong: linesFor(pool, said),
      },
    };
    return wave(rand, base, right, pool);
  },
  /**
   * « عدد يقبل القسمة على 4 »: read by the number its last two digits write. Every trap is EVEN (and some end with 4),
   * its last two digits a multiple of 4 plus 2.
   */
  last2By(rand, { digits, key }) {
    const [lo, hi] = range(digits - 2);
    const make = (t) => int(rand, lo, hi) * 100 + t;
    const right = make(4 * int(rand, 3, 24));
    const pool = [14, 34, 54, 74, 94, 10, 22, 30, 38, 46, 58, 62, 70, 86].map(make);
    const t = (n) => n % 100;
    const base = {
      type: 'last2By',
      a: right,
      key,
      b: 4,
      say: 'عدد يقبل القسمة على 4',
      why: {
        right: `العدد المشكّل من رقمَي آحاد ${right} وعشراته هو ${t(right)}: $${t(right)} = 4 \\times ${t(right) / 4}$.`,
        wrong: linesFor(pool, (n) => `العدد المشكّل من رقمَي آحاد ${n} وعشراته هو ${t(n)}: ${division(t(n), 4)}.`),
      },
    };
    return wave(rand, base, right, pool);
  },
  /**
   * « رقم مكان □ ليقبل $47\square$ القسمة على 9 » (□ in the units, for 3 or 9), or « $5\square 2$ … على 4 » (□ in the
   * tens): the gates are digits, ONE of them makes the number a multiple of b.
   */
  digitFor(rand, { b, key }) {
    const pos = b === 4 ? 'tens' : 'units';
    const pre = pos === 'units' ? int(rand, 10, 99) : int(rand, 1, 9);
    const post = pos === 'tens' ? pick(rand, [0, 2, 4, 6, 8]) : null;
    const w0 = { pos, pre, post, b };
    const value = (n) => digitValue(w0, n);
    const fits = [];
    const misses = [];
    for (let n = 0; n <= 9; n += 1) (value(n) % b === 0 ? fits : misses).push(n);
    if (!fits.length) return null;
    const right = pick(rand, fits);
    const shape = pos === 'units' ? `${pre}\\square` : `${pre}\\square ${post}`;
    const read = (v) => (b === 4 ? `الرقمان الأخيران ${v % 100}` : `مجموع الأرقام ${digitSum(v)}`);
    const reread = (v) => (b === 4 ? v % 100 : digitSum(v));
    const base = {
      type: 'digitFor',
      a: value(right),
      key,
      ...w0,
      say: `رقم مكان □ ليقبل $${shape}$ القسمة على ${b}`,
      why: {
        right: `بالرقم ${right}: ${read(value(right))}، و $${reread(value(right))} = ${b} \\times ${reread(value(right)) / b}$.`,
        wrong: linesFor(misses, (n) => `بالرقم ${n}: ${read(value(n))}، و ${division(reread(value(n)), b)}.`),
      },
    };
    return wave(rand, base, right, misses);
  },
  /** « باقي قسمة a على b » (b without a reading rule): sometimes 0 — the number is then divisible. */
  remainder(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const q = int(rand, 3, 12);
    const r = int(rand, 0, 2) === 0 ? 0 : int(rand, 1, b - 1);
    const a = b * q + r;
    if (a > 100) return null;
    const pool = [];
    for (let n = 0; n < b; n += 1) if (n !== r) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r }, r, pool);
  },
  /** « عدد يقبل القسمة على b » on numbers inside the tables: the world explains each gate by its division. */
  divisible(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const right = b * int(rand, 3, 12);
    if (right > 100) return null;
    return wave(rand, { type: 'divisibleBy', key, b }, right, notMultiples(right, b));
  },
  /** « مضاعف للعدد b »: the same fact, said another way. */
  multiple(rand, { bMin, bMax, key }) {
    const b = int(rand, bMin, bMax);
    const right = b * int(rand, 3, 12);
    if (right > 100) return null;
    return wave(rand, { type: 'multipleOf', key, b }, right, notMultiples(right, b));
  },
  /** « عدد يقسم a »: the third way — the small number divides the big one when the remainder is 0. */
  divides(rand, { key }) {
    const b = int(rand, 6, 9);
    const a = b * int(rand, 3, 11);
    if (a > 100) return null;
    const pool = [];
    for (let n = 4; n <= 12; n += 1) if (a % n !== 0) pool.push(n);
    const base = {
      type: 'dividesNum',
      key,
      a,
      say: `عدد يقسم ${a}`,
      why: {
        right: `$${a} = ${b} \\times ${a / b} + 0$: الباقي 0، إذن ${b} يقسم ${a}.`,
        wrong: linesFor(pool, (n) => `${division(a, n)}: الباقي ${a % n}، إذن ${n} لا يقسم ${a}.`),
      },
    };
    return wave(rand, base, b, pool);
  },
};

const K = { ahad: 'raqm-alahad', majmu: 'majmu-arqam', akhir: 'raqmayn-akhirayn', baqi: 'baqi-sifr' };
const SMALL = { bMin: 6, bMax: 8 };

/** The map: five nodes in the order of the lesson's keys, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.ahad,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['unitsBy', { b: 5, digits: 3, key: K.ahad }],
          ['unitsBy', { b: 2, digits: 3, key: K.ahad }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['unitsBy', { b: 10, digits: 4, key: K.ahad }],
          ['notBy', { b: 5, digits: 4, key: K.ahad }],
          ['notBy', { b: 2, digits: 4, key: K.ahad }],
        ],
      },
    ],
  },
  {
    id: K.majmu,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['sumBy', { b: 3, digits: 3, key: K.majmu }],
          ['sumBy', { b: 9, digits: 3, key: K.majmu }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['sum3not9', { digits: 3, key: K.majmu }],
          ['digitFor', { b: 9, key: K.majmu }],
          ['sumBy', { b: 9, digits: 4, key: K.majmu }],
        ],
      },
    ],
  },
  {
    id: K.akhir,
    levels: [
      { speed: 6.0, mix: [['last2By', { digits: 3, key: K.akhir }]] },
      {
        speed: 6.5,
        mix: [
          ['last2By', { digits: 4, key: K.akhir }],
          ['digitFor', { b: 4, key: K.akhir }],
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
          ['remainder', { ...SMALL, key: K.baqi }],
          ['divisible', { ...SMALL, key: K.baqi }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['multiple', { ...SMALL, key: K.baqi }],
          ['divides', { key: K.baqi }],
          ['remainder', { bMin: 7, bMax: 9, key: K.baqi }],
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
          ['unitsBy', { b: 5, digits: 3, key: K.ahad }],
          ['sumBy', { b: 9, digits: 3, key: K.majmu }],
          ['last2By', { digits: 3, key: K.akhir }],
          ['remainder', { ...SMALL, key: K.baqi }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['unitsBy', { b: 10, digits: 4, key: K.ahad }],
          ['sum3not9', { digits: 3, key: K.majmu }],
          ['digitFor', { b: 4, key: K.akhir }],
          ['last2By', { digits: 4, key: K.akhir }],
          ['divides', { key: K.baqi }],
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
  root: 'قواعد قابلية القسمة',
  positions: {
    root: [50, 9],
    [K.ahad]: [78, 34],
    [K.majmu]: [50, 40],
    [K.akhir]: [22, 34],
    [K.baqi]: [70, 76],
    [EXAM]: [30, 80],
  },
  edges: [
    ['root', K.ahad, 'رقم واحد'],
    ['root', K.majmu, 'كلّ الأرقام'],
    ['root', K.akhir, 'رقمان'],
    [K.ahad, K.baqi, 'الباقي 0'],
    [K.majmu, K.baqi, null],
    [K.akhir, K.baqi, null],
    [K.baqi, EXAM, 'نستخلص'],
  ],
};
