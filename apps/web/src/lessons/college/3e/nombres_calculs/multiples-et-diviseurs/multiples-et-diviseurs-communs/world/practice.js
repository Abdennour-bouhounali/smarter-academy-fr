/**
 * « Espace jeu » of lesson `multiples-et-diviseurs-communs` — the CONTENT of its practice ladder (PURE). The ladder itself
 * is the kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of
 * its levels. A wave is DATA: { type, key, a, b, …, gates, good }; its sentences are written here and carried by the wave
 * itself: `say` and `why: { right, wrong: { [gate]: line } }`.
 *
 * THE GATE DASH IS MENTAL ARITHMETIC: every number a wave prints or offers stays at most 100 (a decomposition is printed as
 * its primes and powers, never as its value, and its value stays ≤ 100 too); the large numbers belong to the exam format
 * of the trainer, where he has paper. Every wrong gate is a belief a student holds — the product, a multiple that is not
 * the smallest, a number that divides instead of being divided, the other wheel's turns, the rest days taken as the cycle,
 * day 1 forgotten — and no wrong gate is right (`practice.test.js` re-computes each).
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { K } from './story';
import { commonPowers, counted, frAll, gcd, lcm, lcmOf, lcmPowers, powTex, valueOfPowers } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'common':
      return n >= 1 && n % w.a === 0 && n % w.b === 0;
    case 'smallest':
    case 'powers':
      return n === w.m;
    case 'turns':
      return n === w.turns;
    case 'together':
      return n === w.day;
    default:
      return false;
  }
}

/** « $x = n × q + r$ » — the division of x by n (r ≠ 0: n does not divide x). */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** A wave whose sentences take French typography. */
const fair = (rand, base, right, pool) =>
  wave(rand, { ...base, say: frAll(base.say), why: frAll(base.why) }, right, pool);

/** Why n is not the smallest common multiple of a and b: a multiple of only one, or a common multiple that is not the smallest. */
const notTheSmallest = (a, b, n, m) =>
  n % a
    ? `${leaves(n, a)} : ${n} n’est pas un multiple de ${a}.`
    : n % b
      ? `${leaves(n, b)} : ${n} n’est pas un multiple de ${b}.`
      : `${n} est un multiple commun de ${a} et de ${b}, mais ${m} en est un plus petit.`;

/** Two numbers lo … hi, neither dividing the other, whose smallest common multiple stays at most `max`. */
function pairOf(rand, { lo = 4, hi = 20, max = 100, coprime = null } = {}) {
  const a = int(rand, lo, hi);
  const b = int(rand, lo, hi);
  if (a === b || a % b === 0 || b % a === 0) return null;
  const g = gcd(a, b);
  if (coprime === true && g !== 1) return null;
  if (coprime === false && g === 1) return null;
  const m = lcm(a, b);
  return m <= max ? { a, b, g, m } : null;
}

// ── the kinds of question ──
const G = {
  /** « Un multiple commun de a et de b » — one common multiple; wrong: a multiple of one number only. */
  common(rand, { key }) {
    const p = pairOf(rand, { lo: 3, hi: 12, max: 50 });
    if (!p) return null;
    const { a, b, m } = p;
    const right = m * int(rand, 1, Math.floor(100 / m));
    const only = (x, y) =>
      Array.from({ length: Math.floor(100 / x) }, (_, k) => x * (k + 1)).filter((n) => n % y !== 0);
    const pool = [...only(a, b), ...only(b, a)].filter((n) => n >= 6);
    return fair(
      rand,
      {
        type: 'common',
        key,
        a,
        b,
        say: `Un multiple commun de ${a} et de ${b}`,
        why: {
          right: `$${right} = ${a} \\times ${right / a}$ et $${right} = ${b} \\times ${right / b}$ : ${right} est un multiple de ${a} et de ${b}.`,
          wrong: linesFor(pool, (n) => notTheSmallest(a, b, n, m)),
        },
      },
      right,
      pool,
    );
  },
  /** « Le plus petit multiple commun non nul de a et de b » — wrong: the product, a larger common multiple, the larger number. */
  smallest(rand, { key }) {
    const p = pairOf(rand, { lo: 4, hi: 20, max: 60, coprime: pick(rand, [true, false, false]) });
    if (!p) return null;
    const { a, b, m } = p;
    const pool = [a * b, 2 * m, 3 * m, Math.max(a, b), a + b].filter((n) => n !== m && n <= 100);
    return fair(
      rand,
      {
        type: 'smallest',
        key,
        a,
        b,
        m,
        say: `Le plus petit multiple commun non nul de ${a} et de ${b}`,
        why: {
          right: `$${m} = ${a} \\times ${m / a}$ et $${m} = ${b} \\times ${m / b}$ : aucun multiple commun plus petit, sauf 0.`,
          wrong: linesFor(pool, (n) => notTheSmallest(a, b, n, m)),
        },
      },
      m,
      pool,
    );
  },
  /**
   * « Le plus petit multiple commun non nul de 2² × 3 et de 2 × 3² » — two decompositions on 2, 3, 5; the numbers
   * themselves are never printed, and their multiple stays ≤ 100. Wrong: the smaller exponents, only the common primes,
   * one decomposition copied.
   */
  powers(rand, { key }) {
    const draw = () =>
      [2, 3, 5].map((q) => ({ p: q, e: int(rand, 0, q === 2 ? 3 : q === 3 ? 2 : 1) })).filter((f) => f.e > 0);
    const xs = draw();
    const ys = draw();
    if (!xs.length || !ys.length) return null;
    const [a, b] = [valueOfPowers(xs), valueOfPowers(ys)];
    const big = lcmPowers(xs, ys);
    const m = valueOfPowers(big);
    if (a === b || a % b === 0 || b % a === 0 || m > 100 || a < 4 || b < 4) return null;
    const smaller = commonPowers(xs, ys);
    const pool = [
      smaller.length ? valueOfPowers(smaller) : null,
      valueOfPowers(
        commonPowers(xs, ys).map(({ p }) => ({
          p,
          e: Math.max(xs.find((f) => f.p === p).e, ys.find((f) => f.p === p).e),
        })),
      ),
      a,
      b,
      a * b,
    ].filter((n) => n != null && n !== m && n <= 100 && n >= 2);
    return fair(
      rand,
      {
        type: 'powers',
        key,
        a,
        b,
        m,
        say: `Le plus petit multiple commun non nul de $${powTex(xs)}$ et de $${powTex(ys)}$`,
        why: {
          right: `Tous les facteurs premiers, chacun avec son plus grand exposant : $${powTex(big)} = ${m}$.`,
          wrong: linesFor(pool, (n) => notTheSmallest(a, b, n, m)),
        },
      },
      m,
      pool,
    );
  },
  /** « Roues de a et de b dents : les tours de la roue de a dents quand les marques se retrouvent » — wrong: the other wheel's turns, the teeth. */
  turns(rand, { key }) {
    const p = pairOf(rand, { lo: 6, hi: 30, max: 100 });
    if (!p) return null;
    const { a, b, m } = p;
    const t = m / a;
    const pool = [m / b, m, a, b].filter((n) => n !== t && n <= 100 && n >= 2);
    return fair(
      rand,
      {
        type: 'turns',
        key,
        a,
        b,
        m,
        turns: t,
        say: `Deux roues de ${a} et de ${b} dents : les tours de la roue de ${a} dents quand les marques se retrouvent pour la première fois`,
        why: {
          right: `$${m} = ${a} \\times ${t}$ : la roue de ${a} dents fait ${counted(t, ['tour', 'tours'])}.`,
          wrong: linesFor(pool, (n) =>
            n === m / b
              ? `$${m} = ${b} \\times ${n}$ : ce sont les tours de la roue de ${b} dents.`
              : n === m
                ? `${m} dents sont passées : $${m} = ${a} \\times ${t}$, ce n’est pas un nombre de tours.`
                : `$${a} \\times ${n} = ${a * n}$ : ${a * n} dents ne ramènent pas les deux marques face à face.`,
          ),
        },
      },
      t,
      pool,
    );
  },
  /** « … le prochain jour où elles travaillent ensemble » — wrong: the rest days as the cycle, day 1 forgotten. */
  together(rand, { key }) {
    const r1 = int(rand, 2, 9);
    const r2 = int(rand, 2, 9);
    const [c1, c2] = [r1 + 1, r2 + 1];
    if (c1 === c2 || c1 % c2 === 0 || c2 % c1 === 0) return null;
    const L = lcmOf([c1, c2]);
    const day = 1 + L;
    if (day > 100) return null;
    /** The first team still at rest on day d: [its cycle, how to name it] — null when both work. */
    const resting = (d) => ((d - 1) % c1 !== 0 ? [c1, 'la première'] : (d - 1) % c2 !== 0 ? [c2, 'la deuxième'] : null);
    const pool = [L, 1 + lcm(r1, r2), 1 + c1 * c2, L - 1, 2 * L].filter((n) => n !== day && n >= 2 && n <= 100);
    return fair(
      rand,
      {
        type: 'together',
        key,
        a: c1,
        b: c2,
        m: L,
        day,
        say: `Une équipe travaille 1 jour puis se repose ${counted(r1, ['jour', 'jours'])}, une autre 1 jour puis se repose ${counted(r2, ['jour', 'jours'])}. Elles travaillent ensemble le jour 1 : le prochain jour où elles travaillent ensemble`,
        why: {
          right: `Les cycles sont ${c1} et ${c2} jours : $${L} = ${c1} \\times ${L / c1} = ${c2} \\times ${L / c2}$, donc le jour $1 + ${L} = ${day}$.`,
          wrong: linesFor(pool, (n) => {
            const s = resting(n);
            return s
              ? `$${n - 1} = ${s[0]} \\times ${Math.floor((n - 1) / s[0])} + ${(n - 1) % s[0]}$ : le jour ${n}, ${s[1]} équipe se repose encore.`
              : `Le jour ${n}, les deux équipes travaillent, mais elles travaillaient déjà ensemble plus tôt.`;
          }),
        },
      },
      day,
      pool,
    );
  },
};

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.pilier,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['common', { key: K.pilier }],
          ['smallest', { key: K.pilier }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['smallest', { key: K.pilier }],
          ['common', { key: K.pilier }],
          ['smallest', { key: K.pilier }],
        ],
      },
    ],
  },
  {
    id: K.facteurs,
    levels: [
      { speed: 6.5, mix: [['powers', { key: K.facteurs }]] },
      {
        speed: 7.0,
        mix: [
          ['powers', { key: K.facteurs }],
          ['smallest', { key: K.pilier }],
        ],
      },
    ],
  },
  {
    id: K.rendezvous,
    levels: [
      { speed: 6.5, mix: [['turns', { key: K.rendezvous }]] },
      {
        speed: 7.0,
        mix: [
          ['turns', { key: K.rendezvous }],
          ['smallest', { key: K.pilier }],
        ],
      },
    ],
  },
  {
    id: K.equipes,
    levels: [
      { speed: 6.5, mix: [['together', { key: K.equipes }]] },
      {
        speed: 7.0,
        mix: [
          ['together', { key: K.equipes }],
          ['turns', { key: K.rendezvous }],
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
          ['common', { key: K.pilier }],
          ['powers', { key: K.facteurs }],
          ['turns', { key: K.rendezvous }],
          ['together', { key: K.equipes }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['smallest', { key: K.pilier }],
          ['powers', { key: K.facteurs }],
          ['turns', { key: K.rendezvous }],
          ['together', { key: K.equipes }],
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
 * (`practice.test.js` lists the words they must not hold). Laid as lesson 2's (walked), not walked for these names.
 */
export const PRACTICE_MAP = {
  root: 'Deux équipes, un pilier',
  positions: {
    root: [50, 7],
    [K.pilier]: [50, 40],
    [K.facteurs]: [82, 47],
    [K.rendezvous]: [82, 76],
    [K.equipes]: [22, 76],
    [EXAM]: [19, 36],
  },
  edges: [
    ['root', K.pilier, 'Le ponton des bâtisseurs'],
    [K.pilier, K.facteurs, null],
    [K.facteurs, K.rendezvous, null],
    [K.rendezvous, K.equipes, 'Les îles des vigies'],
    [K.equipes, EXAM, 'Le port des navettes'],
  ],
};
