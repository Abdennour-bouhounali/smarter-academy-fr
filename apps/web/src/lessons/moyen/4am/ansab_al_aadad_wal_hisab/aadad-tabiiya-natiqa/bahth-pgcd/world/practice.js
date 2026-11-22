/**
 * « حلبة التدريب » of lesson `bahth-pgcd` — the CONTENT of its practice ladder (PURE). The ladder itself is the kit's
 * (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, a, b, …, gates, good }. The world writes the sentence of the types it knows (`remainder`);
 * the sentences of THIS lesson — « $\mathrm{PGCD}(a ; b) = \mathrm{PGCD}(b ; \square)$ », « عدد القسمات … » — are written
 * here and carried by the wave itself: `say` and `why: { right, wrong: { [gate]: line } }`.
 * THE GATE DASH IS MENTAL ARITHMETIC: every number stays at most 100; the big numbers belong to the exam format of the
 * trainer, where the student has paper. The levels follow the weight of the bank: Euclid (48 questions) and the choice of
 * an algorithm (57) have two levels each, the subtractions (13) two, the two equalities (4 and 3) one each.
 */
import { int } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { DIVISIONS, SUBTRACTIONS, counted, differences, divTex, euclid, gcd, pgcdTex as P, subTex } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'pgcdBox':
      // the equality PGCD(a ; b) = PGCD(b ; n) is TRUE
      return n >= 1 && gcd(w.b, n) === gcd(w.a, w.b);
    case 'remainder':
      return n === w.r;
    case 'lastDiff':
    case 'lastRest':
    case 'pgcd':
      return n === gcd(w.a, w.b);
    case 'divCount':
      return n === euclid(w.a, w.b).length;
    case 'subCount':
      return n === differences(w.a, w.b).length;
    default:
      return false;
  }
}

/** « $x = n × q + r$ » — the division of x by n (r ≠ 0: n does not divide x). */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
const ZERO = '0 ليس قاسمًا لأيّ عدد: لا نقسم على 0.';

/** Two numbers b < a ≤ max, b not dividing a, with a common divisor of at least 2 (so the PGCD is never a plain 1). */
function pair(rand, { min = 20, max = 100 } = {}) {
  const a = int(rand, min, max);
  const b = int(rand, Math.max(4, Math.floor(a / 6)), a - 2);
  return gcd(a, b) >= 2 && a % b !== 0 ? [a, b] : null;
}
/** The wrong gates of a numeric wave: around the right one, never another right one, never past 100. */
const around = (w, right, spread) => {
  const out = [];
  for (let k = 1; k <= spread; k += 1) out.push(right - k, right + k);
  return out.filter((n) => n >= 0 && n <= 100 && !isRight(w, n));
};
/** Why a wrong gate n is not the PGCD of a and b: it is 0, it does not divide one of them, or it is not the greatest. */
function notPgcd(a, b, n) {
  const g = gcd(a, b);
  if (n === 0) return ZERO;
  if (n > b) return `${n} أكبر من ${b}: لا يقسمه.`;
  const ofA = a % n === 0;
  const ofB = b % n === 0;
  if (ofA && ofB) return `${n} قاسم مشترك للعددين، لكنّه ليس الأكبر: ${g} يقسمهما أيضًا.`;
  if (ofA) return `${n} يقسم ${a}، لكن ${leaves(b, n)}.`;
  if (ofB) return `${n} يقسم ${b}، لكن ${leaves(a, n)}.`;
  return `${leaves(a, n)}، إذن ${n} لا يقسم ${a}.`;
}
/** The subtraction ladder of a and b, written as a chain. */
const chain = (a, b) =>
  differences(a, b)
    .map((s) => `$${subTex(s)}$`)
    .join('، ');
/** Euclid's ladder of a and b, written as a chain. */
const divisions = (a, b) =>
  euclid(a, b)
    .map((s) => `$${divTex(s)}$`)
    .join('، ');

// ── the kinds of question ──
const G = {
  /** « PGCD(a ; b) = PGCD(b ; □) » where the right gate is a − b; every other gate makes the equality FALSE. */
  diffBox(rand, { max, key }) {
    const p = pair(rand, { max });
    if (!p) return null;
    const [a, b] = p;
    const d = a - b;
    const g = gcd(a, b);
    const base = { type: 'pgcdBox', key, a, b, say: `$${P(a, b)} = \\mathrm{PGCD}(${b} ; \\square)$` };
    const pool = around(base, d, 12).filter((n) => n >= 1);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `$${a} - ${b} = ${d}$: $${P(a, b)} = ${P(b, d)}$.`,
          wrong: linesFor(pool, (n) => `$${P(b, n)} = ${gcd(b, n)}$، أمّا $${P(a, b)} = ${g}$.`),
        },
      },
      d,
      pool,
    );
  },
  /** « PGCD(a ; b) = PGCD(b ; □) » where the right gate is the remainder r (a quotient of at least 2, so r ≠ a − b). */
  restBox(rand, { key }) {
    const b = int(rand, 6, 30);
    const q = int(rand, 2, 6);
    const r = int(rand, 1, b - 1);
    const a = b * q + r;
    if (a > 100 || gcd(b, r) < 2) return null;
    const g = gcd(a, b);
    const base = { type: 'pgcdBox', key, a, b, say: `$${P(a, b)} = \\mathrm{PGCD}(${b} ; \\square)$` };
    const pool = [q, ...around(base, r, 6)].filter((n) => n >= 1 && !isRight(base, n));
    const division = `$${a} = ${b} \\times ${q} + ${r}$`;
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${division}: $${P(a, b)} = ${P(b, r)}$.`,
          wrong: linesFor(pool, (n) =>
            n === q
              ? `${division}: ${n} هو حاصل القسمة، و $${P(b, n)} = ${gcd(b, n)}$، أمّا $${P(a, b)} = ${g}$.`
              : `$${P(b, n)} = ${gcd(b, n)}$، أمّا $${P(a, b)} = ${g}$.`,
          ),
        },
      },
      r,
      pool,
    );
  },
  /** « باقي قسمة a على b » — the world's own sentence. */
  remainder(rand, { key }) {
    const b = int(rand, 7, 15);
    const q = int(rand, 2, 8);
    const r = int(rand, 1, b - 1);
    const a = b * q + r;
    if (a > 100) return null;
    const pool = [];
    for (let n = 0; n < b; n += 1) if (n !== r) pool.push(n);
    return wave(rand, { type: 'remainder', key, a, b, q, r }, r, pool);
  },
  /** « آخر فرق غير معدوم في خوارزمية الفروق للعددين a و b ». */
  lastDiff(rand, { maxSteps, key }) {
    const p = pair(rand);
    if (!p) return null;
    const [a, b] = p;
    if (differences(a, b).length > maxSteps) return null;
    const g = gcd(a, b);
    const base = { type: 'lastDiff', key, a, b, say: `آخر فرق غير معدوم في خوارزمية الفروق للعددين ${a} و ${b}` };
    const pool = [a - b, b, ...around(base, g, 3)].filter((n) => n !== g);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${chain(a, b)}: آخر فرق غير معدوم هو ${g}.`,
          wrong: linesFor(pool, (n) =>
            n === a - b ? `$${a} - ${b} = ${n}$ هو الفرق الأوّل فقط، ونعيد الطرح حتّى نصل إلى 0.` : notPgcd(a, b, n),
          ),
        },
      },
      g,
      pool,
    );
  },
  /** « آخر باقٍ غير معدوم في خوارزمية إقليدس للعددين a و b ». */
  lastRest(rand, { key }) {
    const p = pair(rand);
    if (!p) return null;
    const [a, b] = p;
    const steps = euclid(a, b);
    if (steps.length < 2) return null;
    const g = gcd(a, b);
    const base = { type: 'lastRest', key, a, b, say: `آخر باقٍ غير معدوم في خوارزمية إقليدس للعددين ${a} و ${b}` };
    const pool = [0, steps[0].r, steps[0].q, ...around(base, g, 2)].filter((n) => n !== g);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${divisions(a, b)}: آخر باقٍ غير معدوم هو ${g}.`,
          wrong: linesFor(pool, (n) => notPgcd(a, b, n)),
        },
      },
      g,
      pool,
    );
  },
  /** « $\mathrm{PGCD}(a ; b)$ » — found by the student's own algorithm. */
  pgcdOf(rand, { key }) {
    const p = pair(rand);
    if (!p) return null;
    const [a, b] = p;
    const g = gcd(a, b);
    const base = { type: 'pgcd', key, a, b, say: `$${P(a, b)}$` };
    const smaller = [];
    for (let n = 2; n < g; n += 1) if (g % n === 0) smaller.push(n);
    const pool = [...smaller, a - b, ...around(base, g, 2)].filter((n) => n !== g);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${divisions(a, b)}: $${P(a, b)} = ${g}$.`,
          wrong: linesFor(pool, (n) => notPgcd(a, b, n)),
        },
      },
      g,
      pool,
    );
  },
  /** « عدد القسمات في خوارزمية إقليدس للعددين a و b ». */
  divCount(rand, { key }) {
    const p = pair(rand);
    if (!p) return null;
    const [a, b] = p;
    const e = euclid(a, b).length;
    const s = differences(a, b).length;
    if (s === e || s > 12) return null;
    const base = { type: 'divCount', key, a, b, say: `عدد القسمات في خوارزمية إقليدس للعددين ${a} و ${b}` };
    const pool = [s, e + 1, e - 1].filter((n) => n >= 1);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${divisions(a, b)}: ${counted(e, DIVISIONS)}.`,
          wrong: linesFor(pool, (n) =>
            n === s
              ? `${n} هو عدد عمليات الطرح في خوارزمية الفروق، لا عدد القسمات.`
              : `نكتب القسمات حتّى نصل إلى الباقي 0 ونعدّها: ليست ${n}.`,
          ),
        },
      },
      e,
      pool,
    );
  },
  /** « عدد عمليات الطرح في خوارزمية الفروق للعددين a و b » (down to the difference 0). */
  subCount(rand, { key }) {
    const p = pair(rand);
    if (!p) return null;
    const [a, b] = p;
    const steps = euclid(a, b);
    const s = differences(a, b).length;
    if (s === steps.length || s > 12) return null;
    const base = { type: 'subCount', key, a, b, say: `عدد عمليات الطرح في خوارزمية الفروق للعددين ${a} و ${b}` };
    const pool = [steps.length, s + 1, s - 1].filter((n) => n >= 1);
    const qs = steps.map((x) => x.q);
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `${divisions(a, b)}: كلّ قسمة تجمع عمليات طرح بعدد حاصلها، $${qs.join(' + ')} = ${s}$: ${counted(s, SUBTRACTIONS)}.`,
          wrong: linesFor(pool, (n) =>
            n === steps.length
              ? `${n} هو عدد القسمات في خوارزمية إقليدس؛ الفروق تحتاج أكثر.`
              : `نكتب الفروق حتّى نصل إلى الفرق 0 ونعدّها: ليست ${n}.`,
          ),
        },
      },
      s,
      pool,
    );
  },
};

const K = {
  farq: 'farq-yabqi',
  tarh: 'khawarizmiyat-al-tarh',
  baqi: 'baqi-yabqi',
  iqlidis: 'iqlidis',
  sura: 'aqall-khutuwat',
};

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  { id: K.farq, levels: [{ speed: 6.0, mix: [['diffBox', { max: 80, key: K.farq }]] }] },
  {
    id: K.tarh,
    levels: [
      { speed: 6.5, mix: [['lastDiff', { maxSteps: 4, key: K.tarh }]] },
      { speed: 7.0, mix: [['lastDiff', { maxSteps: 6, key: K.tarh }]] },
    ],
  },
  {
    id: K.baqi,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['remainder', { key: K.baqi }],
          ['restBox', { key: K.baqi }],
        ],
      },
    ],
  },
  {
    id: K.iqlidis,
    levels: [
      { speed: 6.5, mix: [['lastRest', { key: K.iqlidis }]] },
      {
        speed: 7.0,
        mix: [
          ['lastRest', { key: K.iqlidis }],
          ['pgcdOf', { key: K.iqlidis }],
        ],
      },
    ],
  },
  {
    id: K.sura,
    levels: [
      { speed: 7.0, mix: [['divCount', { key: K.sura }]] },
      {
        speed: 7.0,
        mix: [
          ['divCount', { key: K.sura }],
          ['subCount', { key: K.sura }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster — most waves on Euclid and the comparison, as in the bank
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['diffBox', { max: 100, key: K.farq }],
          ['lastDiff', { maxSteps: 4, key: K.tarh }],
          ['restBox', { key: K.baqi }],
          ['lastRest', { key: K.iqlidis }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['pgcdOf', { key: K.iqlidis }],
          ['lastRest', { key: K.iqlidis }],
          ['divCount', { key: K.sura }],
          ['subCount', { key: K.sura }],
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
 * Its edge labels are shown from the first screen, before any key is forged: they name the story's places (the three
 * gaps, the workshops, the notebook, the race), never a rule (`practice.test.js` lists the words they must not hold).
 */
export const PRACTICE_MAP = {
  root: 'البحث عن القاسم المشترك الأكبر',
  // ➖ and 🧮 on one row, 🪜 raised between them (three long names on one row touched at 1024 × 768), 🔁 ⏱️ and the exam
  // on the bottom row: every labelled link is a column of at least 42 % or lies between two circles — never across a
  // node's name (2026-11-19: on 28 / 54 / 72 / 90 the labels « الدفتر », « الهوّات الطويلة » and « نستخلص » were printed
  // under the nodes, and ⏱️ sat on the exam). The link ➖ → 🪜 carries no label: at 1024 its midpoint fell on 🪜's name.
  positions: {
    root: [50, 8],
    [K.farq]: [80, 38],
    [K.tarh]: [50, 28],
    [K.baqi]: [20, 38],
    [K.iqlidis]: [20, 80],
    [K.sura]: [50, 80],
    [EXAM]: [80, 80],
  },
  edges: [
    ['root', K.farq, 'الهوّات الثلاث'],
    ['root', K.baqi, 'الورشة'],
    [K.farq, K.tarh, null],
    [K.baqi, K.iqlidis, 'الهوّات الطويلة'],
    [K.tarh, K.sura, 'السباق'],
    [K.iqlidis, K.sura, null],
    [K.sura, EXAM, 'نستخلص'],
  ],
};
