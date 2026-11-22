/**
 * « حلبة التدريب » of lesson `qisma-iqlidiya-baqi` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a?, b?, q?, r?, gates, good }. The one type the world already says (`remainder`, « باقي
 * قسمة a على b ») is written by the world's strings.js (`waveSay`, `explain`); every other sentence of THIS lesson —
 * « حاصل قسمة 30 على 4 », « باقٍ ممكن لقسمة على 6 », « $\square = 8 \times 5 + 3$ », « عدد عشرات حاصل قسمة 692 على 27 »,
 * « 52 مسافرًا، 8 في كلّ عربة: العربات اللازمة »… — is written here and carried by the wave itself: `say` and
 * `why: { right, wrong: { [gate]: line } }`.
 * THE GATE DASH IS MENTAL ARITHMETIC: a gate arrives in a few seconds, so the numbers stay inside the tables (a ≤ 100),
 * except the estimate of a big quotient, where only tens are compared (b × 10, b × 20 …) — the rule finds the gate before
 * the division does.
 */
import { int } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { cabinsOf, travellersOf } from './counted';

const quo = (a, b) => Math.floor(a / b);

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'quotient':
    case 'quotientBig':
    case 'fixDivision':
      return n === quo(w.a, w.b);
    case 'remainder':
    case 'missingRest':
    case 'leftOut':
      return n === w.a % w.b;
    case 'cabinsFull':
      return n === quo(w.a, w.b);
    case 'cabinsNeeded':
      return n === Math.ceil(w.a / w.b);
    case 'missingQuotient':
      return n * w.b + w.r === w.a && w.r < w.b;
    case 'dividend':
      return n === w.b * w.q + w.r;
    case 'possibleRest':
      return n >= 0 && n < w.b;
    case 'maxRest':
      return n === w.b - 1;
    case 'tensOf':
      return n === Math.floor(quo(w.a, w.b) / 10);
    default:
      return false;
  }
}

/** « a = b × q + r » written in maths. */
const eq = (a, b, q, r) => `$${a} = ${b} \\times ${q} + ${r}$`;
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** Why n is not the quotient of a by b: too few (what is left still holds b) or too many (b × n passes a). */
const notQuotient = (a, b, n) =>
  n * b > a
    ? `$${b} \\times ${n} = ${b * n}$: أكبر من ${a}، فلا يدخل ${b} في ${a} هذا العدد من المرّات.`
    : `${eq(a, b, n, a - b * n)}: ما بقي (${a - b * n}) ليس أصغر من ${b}، فيدخل ${b} مرّة أخرى.`;
/** A random division a = b × q + r with a leftover, inside the bounds — or null. */
function division(rand, { bMin, bMax, qMin = 2, qMax, aMax = 100, zero = false }) {
  const b = int(rand, bMin, bMax);
  const q = int(rand, qMin, qMax);
  const r = int(rand, zero ? 0 : 1, b - 1);
  const a = b * q + r;
  return a > aMax ? null : { a, b, q, r };
}

/** « 52 مسافرًا، 8 في كلّ عربة » — the cable-car station of a wave. */
const stationOf = (a, b) => `${travellersOf(a)}، ${b} في كلّ عربة`;

// ── the kinds of question ──
const G = {
  /** « حاصل قسمة a على b »: the number of full groups. The traps: one too few, one too many, the remainder. */
  quotient(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [...new Set([q - 1, q + 1, r])].filter((n) => n > 0 && n !== q);
    const base = {
      type: 'quotient',
      key: params.key,
      a,
      b,
      q,
      r,
      say: `حاصل قسمة ${a} على ${b}`,
      why: {
        right: `${eq(a, b, q, r)} و ${r} أصغر من ${b}: الحاصل ${q}.`,
        wrong: linesFor(pool, (n) =>
          n === r && n !== q - 1 ? `${n} هو الباقي، لا الحاصل: ${eq(a, b, q, r)}.` : notQuotient(a, b, n),
        ),
      },
    };
    return wave(rand, base, q, pool);
  },
  /** « باقي قسمة a على b » — the world's own sentence and guidance. */
  remainder(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const pool = [];
    for (let n = 0; n < d.b; n += 1) if (n !== d.r) pool.push(n);
    return wave(rand, { type: 'remainder', key: params.key, ...d }, d.r, pool);
  },
  /** « باقٍ ممكن لقسمة على b »: ONE gate is smaller than b; the others are b or more. */
  possibleRest(rand, { key }) {
    const b = int(rand, 4, 9);
    const right = int(rand, 1, b - 1);
    const pool = [b, b + 1, b + 2, b + 3, 2 * b - 1];
    return wave(
      rand,
      {
        type: 'possibleRest',
        key,
        b,
        say: `باقٍ ممكن لقسمة إقليدية على ${b}`,
        why: {
          right: `في القسمة على ${b} يكون الباقي أصغر من ${b}: من 0 إلى ${b - 1}.`,
          wrong: linesFor(pool, (n) => `لو بقي ${n} لدخل ${b} مرّة أخرى: ${n} ليس أصغر من ${b}.`),
        },
      },
      right,
      pool,
    );
  },
  /** « أكبر باقٍ ممكن في القسمة على b »: b − 1, against b itself and a smaller leftover. */
  maxRest(rand, { key }) {
    const b = int(rand, 5, 12);
    const pool = [b, b + 1, b - 2];
    return wave(
      rand,
      {
        type: 'maxRest',
        key,
        b,
        say: `أكبر باقٍ ممكن في القسمة على ${b}`,
        why: {
          right: `الباقي أصغر من ${b}: أكبره ${b - 1}.`,
          wrong: linesFor(pool, (n) =>
            n < b
              ? `${n} باقٍ ممكن، لكنّ ${b - 1} أكبر منه وما زال أصغر من ${b}.`
              : `باقٍ يساوي ${n} يتّسع لمجموعة أخرى من ${b}.`,
          ),
        },
      },
      b - 1,
      pool,
    );
  },
  /** « صحّح الحاصل »: a division written with a remainder that is NOT smaller than b — one group was left out. */
  fixDivision(rand, { key }) {
    const d = division(rand, { bMin: 3, bMax: 9, qMin: 3, qMax: 10, zero: true });
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q - 1, q + 1];
    return wave(
      rand,
      {
        type: 'fixDivision',
        key,
        a,
        b,
        q,
        r,
        say: `صحّح الحاصل: ${eq(a, b, q - 1, r + b)}`,
        why: {
          right: `الباقي ${r + b} ليس أصغر من ${b}: يدخل ${b} مرّة أخرى، ${eq(a, b, q, r)}.`,
          wrong: {
            [q - 1]: `الباقي ${r + b} ليس أصغر من ${b}: الحاصل ${q - 1} ناقص.`,
            [q + 1]: `$${b} \\times ${q + 1} = ${b * (q + 1)}$: أكبر من ${a}.`,
          },
        },
      },
      q,
      pool,
    );
  },
  /** « $\square = b \times q + r$ »: the dividend rebuilt. The traps: the remainder forgotten, one group too many. */
  dividend(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [b * q, b * (q + 1), a + 1, a - 1].filter((n) => n !== a && n > 0);
    return wave(
      rand,
      {
        type: 'dividend',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `$\\square = ${b} \\times ${q} + ${r}$`,
        why: {
          right: `$${b} \\times ${q} = ${b * q}$، ثمّ $${b * q} + ${r} = ${a}$.`,
          wrong: linesFor(pool, (n) =>
            n === b * q
              ? `$${b} \\times ${q} = ${n}$، ولم يُضف الباقي ${r}.`
              : `$${b} \\times ${q} + ${r} = ${a}$، وليس ${n}.`,
          ),
        },
      },
      a,
      pool,
    );
  },
  /** « $a = b \times q + \square$ »: the remainder that rebuilds a. */
  missingRest(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [r - 1, r + 1, r + 2, b].filter((n) => n >= 0 && n !== r);
    return wave(
      rand,
      {
        type: 'missingRest',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `$${a} = ${b} \\times ${q} + \\square$`,
        why: {
          right: `$${b} \\times ${q} = ${b * q}$، و $${a} - ${b * q} = ${r}$.`,
          wrong: linesFor(pool, (n) => `$${b} \\times ${q} + ${n} = ${b * q + n}$، وليس ${a}.`),
        },
      },
      r,
      pool,
    );
  },
  /** « $a = b \times \square + r$ »: the quotient that rebuilds a. */
  missingQuotient(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q - 1, q + 1, q + 2].filter((n) => n > 0);
    return wave(
      rand,
      {
        type: 'missingQuotient',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `$${a} = ${b} \\times \\square + ${r}$`,
        why: {
          right: `$${a} - ${r} = ${a - r} = ${b} \\times ${q}$.`,
          wrong: linesFor(pool, (n) => `$${b} \\times ${n} + ${r} = ${b * n + r}$، وليس ${a}.`),
        },
      },
      q,
      pool,
    );
  },
  /** « عدد عشرات حاصل قسمة a على b » — b of two digits: b × 10t ≤ a < b × 10(t + 1). */
  tensOf(rand, { key }) {
    const d = division(rand, { bMin: 12, bMax: 25, qMin: 12, qMax: 59, aMax: 999, zero: true });
    if (!d) return null;
    const { a, b, q } = d;
    const t = Math.floor(q / 10);
    const pool = [t - 1, t + 1, t + 2].filter((n) => n >= 1);
    return wave(
      rand,
      {
        type: 'tensOf',
        key,
        a,
        b,
        say: `عدد عشرات حاصل قسمة ${a} على ${b}`,
        why: {
          right: `$${b} \\times ${10 * t} = ${b * 10 * t}$ لا يتجاوز ${a}، و $${b} \\times ${10 * (t + 1)} = ${b * 10 * (t + 1)}$ يتجاوزه: الحاصل بين ${10 * t} و ${10 * (t + 1)}.`,
          wrong: linesFor(pool, (n) =>
            n > t
              ? `$${b} \\times ${10 * n} = ${b * 10 * n}$: يتجاوز ${a}.`
              : `$${b} \\times ${10 * (n + 1)} = ${b * 10 * (n + 1)}$ لا يتجاوز ${a}: الحاصل ${10 * (n + 1)} على الأقلّ.`,
          ),
        },
      },
      t,
      pool,
    );
  },
  /** « حاصل قسمة a على b » — b of two digits: the wrong gates are ten away, the estimate of the tens finds the right one. */
  quotientBig(rand, { key }) {
    const d = division(rand, { bMin: 12, bMax: 25, qMin: 12, qMax: 39, aMax: 999, zero: true });
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q - 10, q + 10];
    return wave(
      rand,
      {
        type: 'quotientBig',
        key,
        a,
        b,
        q,
        r,
        say: `حاصل قسمة ${a} على ${b}`,
        why: {
          right: `${eq(a, b, q, r)} و ${r} أصغر من ${b}.`,
          wrong: {
            [q - 10]: `${eq(a, b, q - 10, r + 10 * b)}: الباقي ${r + 10 * b} يتّسع لعشر مجموعات أخرى.`,
            [q + 10]: `$${b} \\times ${q + 10} = ${b * (q + 10)}$: يتجاوز ${a}.`,
          },
        },
      },
      q,
      pool,
    );
  },

  // ── the station: ONE division, three questions — the full cabins, the cabins needed, the travellers left out ──
  /** « a مسافرًا، b في كلّ عربة: العربات اللازمة » — the quotient, and one more cabin when somebody is left. */
  cabinsNeeded(rand, params) {
    const d = division(rand, { ...params, zero: true });
    if (!d) return null;
    const { a, b, q, r } = d;
    const need = q + (r > 0 ? 1 : 0);
    const pool = [need - 1, need + 1, need + 2];
    return wave(
      rand,
      {
        type: 'cabinsNeeded',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `${stationOf(a, b)}: العربات اللازمة ليعبر الجميع`,
        why: {
          right:
            r > 0
              ? `${eq(a, b, q, r)}: امتلأت ${cabinsOf(q)} وبقي ${travellersOf(r)}، فتلزم عربة أخرى: ${need}.`
              : `${eq(a, b, q, r)}: امتلأت ${cabinsOf(q)} ولم يبقَ أحد، فتلزم ${need}.`,
          wrong: linesFor(pool, (n) =>
            n < need
              ? `مع ${n} فقط يبقى ${travellersOf(a - b * n)} دون عربة.`
              : `${need} تكفي ليعبر الجميع: ${n} أكثر ممّا يلزم.`,
          ),
        },
      },
      need,
      pool,
    );
  },
  /** « … : العربات الممتلئة » — the quotient, whatever is left. */
  cabinsFull(rand, params) {
    const d = division(rand, { ...params, zero: true });
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q + 1, q - 1, r].filter((n) => n !== q);
    return wave(
      rand,
      {
        type: 'cabinsFull',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `${stationOf(a, b)}: العربات الممتلئة`,
        why: {
          right: `${eq(a, b, q, r)}: امتلأت ${cabinsOf(q)}.`,
          wrong: linesFor(pool, (n) =>
            n === q + 1
              ? `العربة رقم ${n} لا تمتلئ: ${r === 0 ? 'لم يبقَ أحد' : `لم يبقَ إلّا ${travellersOf(r)}`}.`
              : n === r
                ? `${n} هو عدد من بقوا خارج العربات الممتلئة: ${eq(a, b, q, r)}.`
                : `$${b} \\times ${q} = ${b * q}$ لا يتجاوز ${a}: تمتلئ عربة أخرى بعد ${n}.`,
          ),
        },
      },
      q,
      pool,
    );
  },
  /** « … : الباقون خارج العربات الممتلئة » — the remainder, not the quotient and not what the next cabin lacks. */
  leftOut(rand, params) {
    const d = division(rand, params);
    if (!d) return null;
    const { a, b, q, r } = d;
    const pool = [q, b - r, r + 1, r - 1].filter((n) => n !== r);
    return wave(
      rand,
      {
        type: 'leftOut',
        key: params.key,
        a,
        b,
        q,
        r,
        say: `${stationOf(a, b)}: الباقون خارج العربات الممتلئة`,
        why: {
          right: `${eq(a, b, q, r)}: امتلأت ${cabinsOf(q)} وبقي ${travellersOf(r)}.`,
          wrong: linesFor(pool, (n) =>
            n === q
              ? `${n} هو عدد العربات الممتلئة: ${eq(a, b, q, r)}.`
              : n === b - r
                ? `${n} هو ما ينقص لتمتلئ عربة أخرى، لا عدد من بقوا.`
                : `$${b} \\times ${q} + ${n} = ${b * q + n}$، وليس ${a}.`,
          ),
        },
      },
      r,
      pool,
    );
  },
};

const K = {
  kamila: 'majmuaat-kamila',
  asghar: 'baqi-asghar',
  musawat: 'musawat-qisma',
  taqdir: 'taqdir-hasil',
  masala: 'baqi-fi-masala',
};
const SMALL = { bMin: 3, bMax: 9, qMax: 9 };
const WIDER = { bMin: 6, bMax: 12, qMax: 12 };

/** The map: six nodes in the order of the lesson's mind map, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.kamila,
    levels: [
      { speed: 6.0, mix: [['quotient', { ...SMALL, key: K.kamila }]] },
      {
        speed: 6.5,
        mix: [
          ['quotient', { ...WIDER, key: K.kamila }],
          ['remainder', { ...WIDER, key: K.kamila }],
        ],
      },
    ],
  },
  {
    id: K.asghar,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['possibleRest', { key: K.asghar }],
          ['maxRest', { key: K.asghar }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['fixDivision', { key: K.asghar }],
          ['possibleRest', { key: K.asghar }],
        ],
      },
    ],
  },
  {
    id: K.musawat,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['dividend', { ...SMALL, key: K.musawat }],
          ['missingRest', { ...SMALL, key: K.musawat }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['dividend', { ...WIDER, key: K.musawat }],
          ['missingQuotient', { ...WIDER, key: K.musawat }],
          ['missingRest', { ...WIDER, key: K.musawat }],
        ],
      },
    ],
  },
  {
    id: K.taqdir,
    levels: [
      { speed: 6.0, mix: [['tensOf', { key: K.taqdir }]] },
      {
        speed: 6.5,
        mix: [
          ['quotientBig', { key: K.taqdir }],
          ['tensOf', { key: K.taqdir }],
        ],
      },
    ],
  },
  {
    id: K.masala,
    levels: [
      { speed: 6.0, mix: [['cabinsNeeded', { ...SMALL, key: K.masala }]] },
      {
        speed: 6.5,
        mix: [
          ['cabinsNeeded', { ...WIDER, key: K.masala }],
          ['cabinsFull', { ...WIDER, key: K.masala }],
          ['leftOut', { ...WIDER, key: K.masala }],
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
          ['quotient', { ...SMALL, key: K.kamila }],
          ['possibleRest', { key: K.asghar }],
          ['dividend', { ...SMALL, key: K.musawat }],
          ['tensOf', { key: K.taqdir }],
          ['cabinsNeeded', { ...SMALL, key: K.masala }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['remainder', { ...WIDER, key: K.kamila }],
          ['fixDivision', { key: K.asghar }],
          ['maxRest', { key: K.asghar }],
          ['missingQuotient', { ...WIDER, key: K.musawat }],
          ['quotientBig', { key: K.taqdir }],
          ['cabinsFull', { ...WIDER, key: K.masala }],
          ['leftOut', { ...WIDER, key: K.masala }],
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
  root: 'القسمة الإقليدية',
  positions: {
    root: [50, 8],
    [K.kamila]: [78, 28],
    [K.asghar]: [22, 28],
    [K.musawat]: [50, 48],
    [K.taqdir]: [78, 68],
    [K.masala]: [22, 68],
    [EXAM]: [50, 88],
  },
  edges: [
    ['root', K.kamila, 'نعدّ المجموعات'],
    [K.kamila, K.asghar, 'ماذا يبقى؟'],
    [K.kamila, K.musawat, 'نعيد البناء'],
    [K.asghar, K.musawat, null],
    [K.musawat, K.taqdir, 'أعداد كبيرة'],
    [K.musawat, K.masala, 'في مسألة'],
    [K.masala, EXAM, 'نستخلص'],
    [K.taqdir, EXAM, null, true],
  ],
};
