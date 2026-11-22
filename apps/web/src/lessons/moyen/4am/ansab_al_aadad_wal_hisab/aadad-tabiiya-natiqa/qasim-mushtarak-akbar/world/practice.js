/**
 * « حلبة التدريب » of lesson `qasim-mushtarak-akbar` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * Every wave is of a type the world does not know: it carries its own sentence `say` and its guidance
 * `why: { right, wrong: { [gate]: line } }` (GAME_WORLD.md « A wave the lesson writes itself »).
 * THE GATE DASH IS MENTAL ARITHMETIC: the numbers stay inside the tables (a, b ≤ 100). The numbers are BUILT from the
 * lesson's rules: a = g × p and b = g × q with p and q sharing no divisor but 1, so PGCD(a ; b) = g and the common
 * divisors are exactly those of g — the wrong gates are a common divisor that is not the greatest, a divisor of ONE of
 * the two numbers, the number of roses in a bouquet…
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { BOUQUETS, LILIES, ROSES, commonDivisors, counted, divisorsOf, gcd, listAr } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'commonDivisor':
    case 'possibleBouquets':
      return n >= 1 && w.a % n === 0 && w.b % n === 0;
    case 'pgcd':
    case 'longest':
    case 'mostBouquets':
      return n === gcd(w.a, w.b);
    case 'perBouquet':
      return n * w.g === w.a;
    case 'divisorOfPgcd':
      return n >= 1 && w.g % n === 0;
    case 'countCommon':
      return n === divisorsOf(w.g).length;
    default:
      return false;
  }
}

/** « a = n × q + r »: n does not divide a, shown by its own division. */
const leaves = (a, n) => `$${a} = ${n} \\times ${Math.floor(a / n)} + ${a % n}$`;
const pgcdTex = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** The small divisors (2 … 10) of x: the numbers a head tries first. */
const smallDivisors = (x) => [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => x % n === 0);
const near = (k) => [k - 2, k - 1, k + 1, k + 2].filter((n) => n > 1);
/** « 12 وردة و 18 زنبقة », « 6 ورود و 9 زنبقات »: the flowers of a wave, with their number agreement. */
const flowers = (a, b) => `${counted(a, ROSES)} و ${counted(b, LILIES)}`;
/** One guidance line per wrong gate. */
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));

/** a = g × p, b = g × q with p ≠ q in [2, 9] sharing no divisor but 1, both ≤ 100: PGCD(a ; b) = g. */
function pair(rand, gMin, gMax) {
  const g = int(rand, gMin, gMax);
  const p = int(rand, 2, 9);
  const q = int(rand, 2, 9);
  if (p === q || gcd(p, q) !== 1 || g * p > 100 || g * q > 100) return null;
  return { g, p, q, a: g * p, b: g * q };
}
/** The small divisors of ONE of the two numbers only: the trap a common divisor is there for. */
const oneOnly = (a, b) => [...new Set([...smallDivisors(a), ...smallDivisors(b)])].filter((n) => a % n || b % n);
/** Why n is not a divisor of BOTH a and b: the division of the one it leaves a remainder in. */
const notBoth = (a, b, n) =>
  a % n === 0
    ? `${n} يقسم ${a}، لكن ${leaves(b, n)}: ليس قاسمًا مشتركًا.`
    : b % n === 0
      ? `${n} يقسم ${b}، لكن ${leaves(a, n)}: ليس قاسمًا مشتركًا.`
      : `${leaves(a, n)}، إذن ${n} لا يقسم ${a}.`;

// ── the kinds of question ──
const G = {
  /** « قاسم مشترك للعددين a و b » — the right gate divides both, the wrong ones only one of them. */
  common(rand, { gMin, gMax, key }) {
    const P = pair(rand, gMin, gMax);
    if (!P) return null;
    const { a, b, g } = P;
    const pool = oneOnly(a, b);
    const base = {
      type: 'commonDivisor',
      key,
      a,
      b,
      say: `قاسم مشترك للعددين ${a} و ${b}`,
      why: {
        right: `$${a} = ${g} \\times ${a / g}$ و $${b} = ${g} \\times ${b / g}$: ${g} يقسم العددين معًا.`,
        wrong: linesFor(pool, (n) => notBoth(a, b, n)),
      },
    };
    return wave(rand, base, g, pool);
  },

  /**
   * « PGCD(a ; b) = □ » (or « أطول لوح يملأ الهوّتين a و b » with `longest`): the two wrong gates are a common divisor that
   * is not the greatest (when g has one) and a divisor of ONE of the numbers.
   */
  pgcd(rand, { gMin, gMax, key, longest = false }) {
    const P = pair(rand, gMin, gMax);
    if (!P) return null;
    const { a, b, g, p, q } = P;
    const smaller = commonDivisors(a, b).filter((n) => n > 1 && n < g);
    const one = oneOnly(a, b);
    if (!one.length) return null;
    const pool = smaller.length ? [pick(rand, smaller), pick(rand, one)] : one;
    const base = {
      type: longest ? 'longest' : 'pgcd',
      key,
      a,
      b,
      say: longest ? `أطول لوح يملأ الهوّتين ${a} و ${b}` : `$${pgcdTex(a, b)} = \\square$`,
      why: {
        right: `$${a} = ${g} \\times ${p}$ و $${b} = ${g} \\times ${q}$، و ${p} و ${q} لا يشتركان إلّا في القاسم 1: $${pgcdTex(a, b)} = ${g}$.`,
        wrong: linesFor(pool, (n) =>
          a % n === 0 && b % n === 0
            ? `${n} قاسم مشترك فعلًا، لكنّ ${g} أكبر منه ويقسم العددين معًا.`
            : notBoth(a, b, n),
        ),
      },
    };
    return wave(rand, base, g, pool);
  },

  /** « عدد ممكن من الباقات المتماثلة: a وردة و b زنبقة » — any common divisor; the wrong ones leave flowers out. */
  possible(rand, { gMin, gMax, key }) {
    const P = pair(rand, gMin, gMax);
    if (!P) return null;
    const { a, b, g } = P;
    const pool = oneOnly(a, b);
    const left = (n) =>
      a % n
        ? `${leaves(a, n)}: إذا كان عدد الباقات ${n} تبقى ورود دون باقة.`
        : `${leaves(b, n)}: إذا كان عدد الباقات ${n} تبقى زنابق دون باقة.`;
    const base = {
      type: 'possibleBouquets',
      key,
      a,
      b,
      say: `عدد ممكن من الباقات المتماثلة: ${flowers(a, b)}`,
      why: {
        right: `${g} يقسم ${a} و ${b}: ${counted(g, BOUQUETS)}، في كلّ واحدة ${counted(a / g, ROSES)} و ${counted(b / g, LILIES)}.`,
        wrong: linesFor(pool, left),
      },
    };
    return wave(rand, base, g, pool);
  },

  /** « أكبر عدد من الباقات المتماثلة: a وردة و b زنبقة » — the PGCD; traps: a smaller common divisor, the roses of a bouquet. */
  most(rand, { gMin, gMax, key }) {
    const P = pair(rand, gMin, gMax);
    if (!P) return null;
    const { a, b, g, p, q } = P;
    const smaller = commonDivisors(a, b).filter((n) => n > 1 && n < g);
    const pool = [...new Set([...(smaller.length ? [pick(rand, smaller)] : []), p, ...oneOnly(a, b)])].filter(
      (n) => n !== g,
    );
    const line = (n) =>
      a % n === 0 && b % n === 0
        ? `${n} يقسم العددين فيصلح عددًا للباقات، لكنّ ${g} يقسمهما أيضًا، وهو أكبر.`
        : n === p
          ? `${p} هو عدد الورود في كلّ باقة إذا كان عدد الباقات ${g}، وليس عدد الباقات.`
          : notBoth(a, b, n);
    const base = {
      type: 'mostBouquets',
      key,
      a,
      b,
      say: `أكبر عدد من الباقات المتماثلة: ${flowers(a, b)}`,
      why: {
        right: `$${pgcdTex(a, b)} = ${g}$: ${counted(g, BOUQUETS)}، في كلّ واحدة ${counted(p, ROSES)} و ${counted(q, LILIES)}.`,
        wrong: linesFor(pool.slice(0, 2), line),
      },
    };
    return wave(rand, base, g, pool.slice(0, 2));
  },

  /** « g باقات متماثلة من a وردة و b زنبقة: عدد الورود في كلّ باقة » — a ÷ g; trap: the lilies of a bouquet. */
  per(rand, { gMin, gMax, key }) {
    const P = pair(rand, gMin, gMax);
    if (!P) return null;
    const { a, b, g, p, q } = P;
    const pool = [q, ...near(p)].filter((n) => n !== p);
    const base = {
      type: 'perBouquet',
      key,
      a,
      b,
      g,
      say: `${flowers(a, b)} في باقات متماثلة عددها ${g}: عدد الورود في كلّ باقة`,
      why: {
        right: `$${a} = ${g} \\times ${p}$: في كلّ باقة ${counted(p, ROSES)}.`,
        wrong: linesFor(pool, (n) =>
          n === q
            ? `${q} هو عدد الزنابق في كلّ باقة: $${b} = ${g} \\times ${q}$.`
            : `$${g} \\times ${n} = ${g * n}$، وليس ${a}.`,
        ),
      },
    };
    return wave(rand, base, p, pool);
  },

  /** « PGCD(a ; b) = g — قاسم مشترك للعددين a و b »: only g is known; the right gate divides it, the wrong ones do not. */
  nest(rand, { gs, key }) {
    const g = pick(rand, gs);
    const right = pick(
      rand,
      divisorsOf(g).filter((n) => n > 1 && n < g),
    );
    const pool = [...[2, 3, 4, 5, 6, 7, 8, 9, 10, 12].filter((n) => g % n !== 0), 2 * g];
    const base = {
      type: 'divisorOfPgcd',
      key,
      g,
      // a, b: what tells two waves apart for the ladder (the same PGCD and the same right gate are not asked twice in a row)
      a: g,
      b: right,
      say: `$${pgcdTex('a', 'b')} = ${g}$ — قاسم مشترك للعددين $a$ و $b$`,
      why: {
        right: `قواسم ${g}: ${listAr(divisorsOf(g))} — كلّها قواسم مشتركة للعددين $a$ و $b$.`,
        wrong: linesFor(pool, (n) =>
          n > g
            ? `${n} أكبر من القاسم المشترك الأكبر ${g}: لا يكون قاسمًا مشتركًا.`
            : `${leaves(g, n)}: ${n} لا يقسم ${g}، فليس قاسمًا مشتركًا للعددين $a$ و $b$.`,
        ),
      },
    };
    return wave(rand, base, right, pool);
  },

  /** « عدد القواسم المشتركة للعددين a و b إذا كان PGCD(a ; b) = g » — the number of divisors of g. */
  count(rand, { gs, key }) {
    const g = pick(rand, gs);
    const right = divisorsOf(g).length;
    const pool = near(right);
    const base = {
      type: 'countCommon',
      key,
      g,
      a: g,
      b: right,
      say: `عدد القواسم المشتركة للعددين $a$ و $b$ إذا كان $${pgcdTex('a', 'b')} = ${g}$`,
      why: {
        right: `القواسم المشتركة هي قواسم ${g}: ${listAr(divisorsOf(g))} — عددها ${right}.`,
        wrong: linesFor(pool, (n) => `اكتب قواسم ${g} كلّها ثمّ عُدّها: عددها ليس ${n}.`),
      },
    };
    return wave(rand, base, right, pool);
  },
};

const K = { com: 'qawasim-mushtaraka', akbar: 'al-akbar', baqat: 'baqat-mutamathila', nest: 'qawasim-al-pgcd' };
/** The PGCDs the head knows the divisors of (inside the tables). */
const SMALL_PGCD = [6, 8, 10, 12, 15, 16, 18, 20, 24];

/** The map: five nodes in the order of the lesson's mind map, levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.com,
    levels: [
      { speed: 6.0, mix: [['common', { gMin: 2, gMax: 7, key: K.com }]] },
      { speed: 6.5, mix: [['common', { gMin: 4, gMax: 12, key: K.com }]] },
    ],
  },
  {
    id: K.akbar,
    levels: [
      { speed: 6.0, mix: [['pgcd', { gMin: 2, gMax: 9, key: K.akbar, longest: true }]] },
      {
        speed: 6.5,
        mix: [
          ['pgcd', { gMin: 4, gMax: 12, key: K.akbar }],
          ['pgcd', { gMin: 4, gMax: 12, key: K.akbar, longest: true }],
        ],
      },
    ],
  },
  {
    id: K.baqat,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['possible', { gMin: 2, gMax: 9, key: K.baqat }],
          ['per', { gMin: 2, gMax: 9, key: K.baqat }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['most', { gMin: 4, gMax: 12, key: K.baqat }],
          ['per', { gMin: 3, gMax: 10, key: K.baqat }],
        ],
      },
    ],
  },
  {
    id: K.nest,
    levels: [
      { speed: 6.0, mix: [['nest', { gs: SMALL_PGCD, key: K.nest }]] },
      {
        speed: 6.5,
        mix: [
          ['nest', { gs: SMALL_PGCD, key: K.nest }],
          ['count', { gs: SMALL_PGCD, key: K.nest }],
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
          ['common', { gMin: 2, gMax: 9, key: K.com }],
          ['pgcd', { gMin: 3, gMax: 10, key: K.akbar }],
          ['most', { gMin: 3, gMax: 10, key: K.baqat }],
          ['nest', { gs: SMALL_PGCD, key: K.nest }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['pgcd', { gMin: 4, gMax: 12, key: K.akbar, longest: true }],
          ['possible', { gMin: 3, gMax: 10, key: K.baqat }],
          ['per', { gMin: 3, gMax: 10, key: K.baqat }],
          ['count', { gs: SMALL_PGCD, key: K.nest }],
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
 * Its edge labels are shown from the first screen, before any key is forged: they name the story's places, never a rule.
 */
export const PRACTICE_MAP = {
  root: 'القاسم المشترك الأكبر',
  positions: {
    root: [50, 9],
    // the two upper keys sit high and 👑 low enough that the labels of their links pass under their names (2026-11-19: « زوج
    // جديد » was printed under « القواسم المشتركة »)
    [K.com]: [79, 27],
    [K.akbar]: [50, 56],
    [K.baqat]: [21, 27],
    [K.nest]: [74, 82],
    [EXAM]: [26, 82],
  },
  edges: [
    ['root', K.com, 'الهوّتان'],
    [K.com, K.akbar, 'زوج جديد'],
    [K.akbar, K.baqat, 'الزهور'],
    [K.akbar, K.nest, 'السلال'],
    [K.com, K.nest, null, true],
    [K.baqat, EXAM, 'نستخلص'],
    [K.nest, EXAM, null, true],
  ],
};
