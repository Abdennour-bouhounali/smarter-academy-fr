/**
 * « Espace jeu » of lesson `trouver-le-pgcd` — the CONTENT of its practice ladder (PURE). The ladder itself is the kit's
 * (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels. A
 * wave is DATA: { type, key, a, b, …, gates, good }; its sentences are written here and carried by the wave itself:
 * `say` and `why: { right, wrong: { [gate]: line } }`.
 *
 * THE GATE DASH IS MENTAL ARITHMETIC: every number printed stays at most 100 (a decomposition is printed as its primes and
 * powers, never as its value); the large numbers belong to the exam format of the trainer, where he has paper. Every
 * wrong gate is a belief a student holds — a smaller common divisor, a divisor of one number only, the difference, the
 * largest exponent, a quotient — and no wrong gate makes a TRUE equality (`practice.test.js`).
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { K } from './story';
import { commonDivisors, commonPowers, counted, euclid, frAll, gcd, pgcdTex as P, powTex, powersOf } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'common':
      return n >= 1 && w.a % n === 0 && w.b % n === 0;
    case 'pgcd':
    case 'lots':
    case 'pgcdPow':
    case 'euclidLast':
      return n === gcd(w.a, w.b);
    case 'euclidRest':
      return n === w.a % w.b;
    default:
      return false;
  }
}

/** « $x = n × q + r$ » — the division of x by n (r ≠ 0: n does not divide x). */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** Why n is not PGCD(a ; b): it does not divide one of them, or it is a common divisor smaller than g. */
const notThePgcd = (a, b, n) => {
  const g = gcd(a, b);
  if (a % n) return `${leaves(a, n)} : ${n} ne divise pas ${a}.`;
  if (b % n) return `${leaves(b, n)} : ${n} ne divise pas ${b}.`;
  return `${n} divise ${a} et ${b}, mais ${g} aussi, et ${g} est plus grand.`;
};
/** A wave whose sentences take French typography. */
const fair = (rand, base, right, pool) =>
  wave(rand, { ...base, say: frAll(base.say), why: frAll(base.why) }, right, pool);

/** Two numbers 12 … 99, a > b, sharing a divisor g ≥ min, and neither dividing the other. */
function pairOf(rand, { min = 2 } = {}) {
  const a = int(rand, 20, 99);
  const b = int(rand, 12, a - 1);
  const g = gcd(a, b);
  if (g < min || a % b === 0) return null;
  return { a, b, g };
}

/** The things a sharing shares, and the lots: [singular, plural] each — the words of the stall (K2's experiment). */
const SHARES = [
  { x: ['pomme', 'pommes'], y: ['poire', 'poires'], lot: ['panier', 'paniers'] },
  { x: ['bille rouge', 'billes rouges'], y: ['bille bleue', 'billes bleues'], lot: ['sachet', 'sachets'] },
  { x: ['rose', 'roses'], y: ['tulipe', 'tulipes'], lot: ['bouquet', 'bouquets'] },
];

// ── the kinds of question ──
const G = {
  /** « Un diviseur commun de a et b » — one common divisor (not 1), two that divide one number only. */
  common(rand, { key }) {
    const p = pairOf(rand, { min: 4 });
    if (!p) return null;
    const { a, b } = p;
    const right = pick(
      rand,
      commonDivisors(a, b).filter((d) => d > 1),
    );
    const pool = [...new Set([...range2(a), ...range2(b)])].filter((d) => (a % d === 0) !== (b % d === 0));
    return fair(
      rand,
      {
        type: 'common',
        key,
        a,
        b,
        say: `Un diviseur commun de ${a} et ${b}`,
        why: {
          right: `$${a} = ${right} \\times ${a / right}$ et $${b} = ${right} \\times ${b / right}$ : ${right} divise les deux nombres.`,
          wrong: linesFor(pool, (n) => notThePgcd(a, b, n)),
        },
      },
      right,
      pool,
    );
  },
  /** « PGCD(a ; b) = □ » — the PGCD; wrong: a smaller common divisor, a divisor of one number, the difference. */
  pgcd(rand, { key }) {
    const p = pairOf(rand, { min: 3 });
    if (!p) return null;
    const { a, b, g } = p;
    const pool = [
      ...commonDivisors(a, b).filter((d) => d > 1 && d < g),
      ...range2(a).filter((d) => b % d !== 0 && d <= 30),
      a - b,
    ].filter((n) => n !== g);
    return fair(
      rand,
      {
        type: 'pgcd',
        key,
        a,
        b,
        say: `$${P(a, b)} = \\square$`,
        why: {
          right: `$${a} = ${g} \\times ${a / g}$ et $${b} = ${g} \\times ${b / g}$ : aucun diviseur commun ne dépasse ${g}.`,
          wrong: linesFor(pool, (n) => notThePgcd(a, b, n)),
        },
      },
      g,
      pool,
    );
  },
  /** « Le plus de paniers identiques avec a pommes et b poires » — the PGCD as the most lots. */
  lots(rand, { key }) {
    const p = pairOf(rand, { min: 3 });
    if (!p) return null;
    const { a, b, g } = p;
    const S = pick(rand, SHARES);
    const pool = [...commonDivisors(a, b).filter((d) => d > 1 && d < g), ...range2(a), ...range2(b)].filter(
      (n) => n !== g && n <= 30,
    );
    const left = (n) =>
      a % n
        ? `${leaves(a, n)} : il resterait ${counted(a % n, S.x)}.`
        : b % n
          ? `${leaves(b, n)} : il resterait ${counted(b % n, S.y)}.`
          : `${counted(n, S.lot)} identiques marchent, mais ${counted(g, S.lot)} aussi, et c’est plus.`;
    return fair(
      rand,
      {
        type: 'lots',
        key,
        a,
        b,
        say: `Le plus de ${S.lot[1]} identiques avec ${counted(a, S.x)} et ${counted(b, S.y)}`,
        why: {
          right: `$${a} = ${g} \\times ${a / g}$ et $${b} = ${g} \\times ${b / g}$ : ${counted(g, S.lot)} de ${counted(a / g, S.x)} et ${counted(b / g, S.y)}.`,
          wrong: linesFor(pool, left),
        },
      },
      g,
      pool,
    );
  },
  /**
   * « PGCD(2³ × 5 ; 2 × 5²) = □ » — two decompositions on 2, 3, 5, 7; the numbers themselves are never printed. Wrong:
   * the largest exponents, one decomposition copied, the common primes with the exponent 1.
   */
  pgcdPow(rand, { key }) {
    const draw = () =>
      [2, 3, 5, 7].map((q) => ({ p: q, e: int(rand, 0, q === 2 ? 3 : q === 3 ? 2 : 1) })).filter((f) => f.e > 0);
    const xs = draw();
    const ys = draw();
    const value = (fs) => fs.reduce((v, { p, e }) => v * p ** e, 1);
    const [a, b] = [value(xs), value(ys)];
    if (xs.length < 2 || ys.length < 2 || a === b || a > 2000 || b > 2000) return null;
    const g = gcd(a, b);
    const common = commonPowers(xs, ys);
    if (g < 2 || g > 100 || a % b === 0 || b % a === 0) return null;
    const largest = common.map(({ p }) => ({
      p,
      e: Math.max(xs.find((f) => f.p === p).e, ys.find((f) => f.p === p).e),
    }));
    const pool = [value(largest), a, b, value(common.map(({ p }) => ({ p, e: 1 })))].filter((n) => n !== g && n <= 100);
    return fair(
      rand,
      {
        type: 'pgcdPow',
        key,
        a,
        b,
        say: `$${P(powTex(xs), powTex(ys))} = \\square$`,
        why: {
          right: `Les facteurs premiers communs, chacun avec le plus petit exposant : $${powTex(common)} = ${g}$.`,
          wrong: linesFor(pool, (n) =>
            a % n
              ? `$${n} = ${powTex(powersOf(n))}$ ne divise pas $${powTex(xs)}$.`
              : b % n
                ? `$${n} = ${powTex(powersOf(n))}$ ne divise pas $${powTex(ys)}$.`
                : `${n} divise les deux nombres, mais $${powTex(common)} = ${g}$ aussi, et ${g} est plus grand.`,
          ),
        },
      },
      g,
      pool,
    );
  },
  /**
   * « PGCD(a ; b) = PGCD(b ; □) » — the remainder of a by b. No wrong gate makes the equality true: a gate n with
   * PGCD(b ; n) = PGCD(a ; b) is never offered (the difference a − b would be one).
   */
  euclidRest(rand, { key }) {
    const p = pairOf(rand);
    if (!p) return null;
    const { a, b, g } = p;
    const q = Math.floor(a / b);
    const r = a % b;
    const pool = [q, r + 1, r - 1, b, b - r].filter((n) => n >= 1 && n !== r && gcd(b, n) !== g);
    return fair(
      rand,
      {
        type: 'euclidRest',
        key,
        a,
        b,
        say: `$${P(a, b)} = ${P(b, '\\square')}$`,
        why: {
          right: `$${a} = ${b} \\times ${q} + ${r}$ : on continue avec ${b} et le reste ${r}.`,
          wrong: linesFor(pool, (n) => `$${P(b, n)} = ${gcd(b, n)}$, alors que $${P(a, b)} = ${g}$.`),
        },
      },
      r,
      pool,
    );
  },
  /** « a = b × q + r et … : PGCD(a ; b) = □ » — the divisions written, two or three; wrong: a quotient, a remainder too early. */
  euclidLast(rand, { key }) {
    const p = pairOf(rand, { min: 2 });
    if (!p) return null;
    const { a, b, g } = p;
    const rows = euclid(a, b);
    if (rows.length < 2 || rows.length > 3) return null;
    const pool = [...rows.map((s) => s.q), ...rows.slice(0, -2).map((s) => s.r)].filter((n) => n !== g && n >= 1);
    const shown = rows.map((s) => `$${s.a} = ${s.b} \\times ${s.q} + ${s.r}$`);
    return fair(
      rand,
      {
        type: 'euclidLast',
        key,
        a,
        b,
        say: `${shown.slice(0, -1).join(', ')} et ${shown.at(-1)} : $${P(a, b)} = \\square$`,
        why: {
          right: `Le dernier reste qui n’est pas 0 est ${g} : $${P(a, b)} = ${g}$.`,
          wrong: linesFor(pool, (n) => notThePgcd(a, b, n)),
        },
      },
      g,
      pool,
    );
  },
};
/** The divisors of n from 2 to n − 1. */
function range2(n) {
  const out = [];
  for (let d = 2; d < n; d += 1) if (n % d === 0) out.push(d);
  return out;
}

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.common,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['common', { key: K.common }],
          ['pgcd', { key: K.common }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['pgcd', { key: K.common }],
          ['common', { key: K.common }],
          ['pgcd', { key: K.common }],
        ],
      },
    ],
  },
  {
    id: K.lots,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['lots', { key: K.lots }],
          ['lots', { key: K.lots }],
          ['pgcd', { key: K.common }],
        ],
      },
    ],
  },
  {
    id: K.factors,
    levels: [
      { speed: 6.5, mix: [['pgcdPow', { key: K.factors }]] },
      {
        speed: 7.0,
        mix: [
          ['pgcdPow', { key: K.factors }],
          ['lots', { key: K.lots }],
        ],
      },
    ],
  },
  {
    id: K.euclide,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['euclidRest', { key: K.euclide }],
          ['euclidLast', { key: K.euclide }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['euclidLast', { key: K.euclide }],
          ['pgcdPow', { key: K.factors }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster — the four keys
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['common', { key: K.common }],
          ['lots', { key: K.lots }],
          ['pgcdPow', { key: K.factors }],
          ['euclidRest', { key: K.euclide }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['pgcd', { key: K.common }],
          ['lots', { key: K.lots }],
          ['pgcdPow', { key: K.factors }],
          ['euclidLast', { key: K.euclide }],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box; left to right). Its edge labels
 * are shown from the first screen, before any key is forged: they name the story's places, never a rule
 * (`practice.test.js` lists the words they must not hold). Laid as lesson 1's (walked), not walked for these names.
 */
export const PRACTICE_MAP = {
  root: 'Deux fossés, une planche',
  positions: {
    root: [50, 7],
    [K.common]: [50, 40],
    [K.lots]: [82, 47],
    [K.factors]: [82, 76],
    [K.euclide]: [22, 76],
    [EXAM]: [19, 36],
  },
  edges: [
    ['root', K.common, 'Les premiers fossés'],
    [K.common, K.lots, null],
    [K.lots, K.factors, null],
    [K.factors, K.euclide, 'Les fossés immenses'],
    [K.euclide, EXAM, 'La jetée du phare'],
  ],
};
