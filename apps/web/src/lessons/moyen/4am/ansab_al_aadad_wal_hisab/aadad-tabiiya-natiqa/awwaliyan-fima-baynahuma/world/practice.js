/**
 * « حلبة التدريب » of lesson `awwaliyan-fima-baynahuma` — the CONTENT of its practice ladder (PURE). The ladder itself is
 * the kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its
 * levels. A wave is DATA: { type, key, a, b, …, gates, good }. The sentences of THIS lesson are written here and carried
 * by the wave itself: `say` and `why: { right, wrong: { [gate]: line } }` (the world writes none of these types).
 * THE GATE DASH IS MENTAL ARITHMETIC: every number stays at most 100; the big numbers belong to the exam format of the
 * trainer, where the student has paper. The levels follow the weight of the bank: the proof by the PGCD (113 questions)
 * and the witness (41) have two levels each, the recognition (26) one.
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { RULES, divTex, divisorsOf, euclid, gcd, pgcdTex as P } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'pgcd':
      return n === gcd(w.a, w.b);
    case 'witness':
      // a common divisor of a and b OTHER than 1
      return n > 1 && w.a % n === 0 && w.b % n === 0;
    case 'coprimeWith':
      return n >= 1 && gcd(n, w.a) === 1;
    default:
      return false;
  }
}

/** « $x = n × q + r$ » — the division of x by n (r ≠ 0: n does not divide x). */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
const ZERO = '0 ليس قاسمًا لأيّ عدد: لا نقسم على 0.';
const ONE = '1 يقسم كلّ عدد طبيعي: لا يثبت شيئًا عن العددين.';

/** Euclid's ladder of a and b, written as a chain. */
const divisions = (a, b) =>
  euclid(a, b)
    .map((s) => `$${divTex(s)}$`)
    .join('، ');
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
/** Why n is not a common divisor of a and b other than 1. */
function notWitness(a, b, n) {
  if (n === 1) return ONE;
  if (n === 0) return ZERO;
  if (a % n === 0) return `${n} يقسم ${a}، لكن ${leaves(b, n)}.`;
  if (b % n === 0) return `${n} يقسم ${b}، لكن ${leaves(a, n)}.`;
  return `${leaves(a, n)}، إذن ${n} لا يقسم ${a}.`;
}

// ── the kinds of question ──
const G = {
  /**
   * « $\mathrm{PGCD}(a ; b)$ » — found by Euclid's divisions; `coprime`: 'yes' (the PGCD is 1), 'no' (it is not) or
   * 'mix'; the ladder takes `minSteps` to `maxSteps` divisions (its chain is the guidance: at most 5).
   */
  pgcd(rand, { key, coprime = 'mix', minSteps = 2, maxSteps = 5 }) {
    const a = int(rand, 20, 100);
    const b = int(rand, Math.max(6, Math.floor(a / 6)), a - 2);
    if (a % b === 0) return null;
    const g = gcd(a, b);
    if ((coprime === 'yes' && g !== 1) || (coprime === 'no' && g === 1)) return null;
    const steps = euclid(a, b);
    if (steps.length < minSteps || steps.length > maxSteps) return null;
    const base = { type: 'pgcd', key, a, b, say: `$${P(a, b)}$` };
    const common = divisorsOf(g).filter((d) => d < g);
    const pool = [...common, a - b, steps[0].r, steps[0].q, ...around(base, g, 2)].filter((n) => n !== g && n <= 100);
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
  /**
   * « قاسم مشترك للعددين a و b غير 1 » — a = w·m, b = w·n with m, n coprime. `hidden`: w is none of the rules' planks
   * (7, 11, 13, 17, 19) and no plank of the rules divides both — « I saw no witness » is not a proof.
   */
  witness(rand, { key, hidden = false }) {
    const w = pick(rand, hidden ? [7, 11, 13, 17, 19] : RULES);
    const top = Math.floor(100 / w);
    if (top < 3) return null;
    const m = int(rand, 2, top);
    const n = int(rand, 2, top);
    if (m === n || gcd(m, n) !== 1) return null;
    const [a, b] = [w * Math.max(m, n), w * Math.min(m, n)];
    if (hidden && RULES.some((r) => a % r === 0 && b % r === 0)) return null;
    const base = { type: 'witness', key, a, b, say: `قاسم مشترك للعددين ${a} و ${b} غير 1` };
    const own = [...divisorsOf(a), ...divisorsOf(b)].filter((d) => d > 1 && d <= 100 && !isRight(base, d));
    const pool = [1, ...own, ...RULES.filter((r) => !isRight(base, r))];
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `$${a} = ${w} \\times ${a / w}$ و $${b} = ${w} \\times ${b / w}$: ${w} قاسم مشترك للعددين غير 1.`,
          wrong: linesFor(pool, (x) => notWitness(a, b, x)),
        },
      },
      w,
      pool,
    );
  },
  /** « عدد أوّليّ مع c فيما بينهما » — c a number with at least two different prime factors; the gates are never 1. */
  coprimeWith(rand, { key }) {
    const c = pick(rand, [6, 10, 12, 14, 15, 18, 20, 21, 22, 24, 26, 28, 30, 33, 35, 36, 39, 40]);
    const right = int(rand, 4, 100);
    if (gcd(right, c) !== 1) return null;
    const base = { type: 'coprimeWith', key, a: c, say: `عدد أوّليّ مع ${c} فيما بينهما` };
    const pool = [];
    for (let t = 0; t < 12; t += 1) {
      const x = int(rand, 4, 100);
      if (gcd(x, c) > 1) pool.push(x);
    }
    /** Why x (sharing p with c) is not coprime with c: both are written with p. */
    const shared = (x) => {
      const p = gcd(x, c);
      return `$${x} = ${p} \\times ${x / p}$ و $${c} = ${p} \\times ${c / p}$: ${p} قاسم مشترك لهما غير 1.`;
    };
    return wave(rand, { ...base, why: { right: `$${P(right, c)} = 1$.`, wrong: linesFor(pool, shared) } }, right, pool);
  },
};

const K = { only: 'awwaliyan', proof: 'ithbat-awwaliyan', witness: 'shahid-wahid' };

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  {
    id: K.only,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['pgcd', { key: K.only, coprime: 'mix', maxSteps: 4 }],
          ['coprimeWith', { key: K.only }],
        ],
      },
    ],
  },
  {
    id: K.proof,
    levels: [
      { speed: 6.5, mix: [['pgcd', { key: K.proof, coprime: 'yes', minSteps: 2, maxSteps: 3 }]] },
      { speed: 7.0, mix: [['pgcd', { key: K.proof, coprime: 'yes', minSteps: 3, maxSteps: 5 }]] },
    ],
  },
  {
    id: K.witness,
    levels: [
      { speed: 6.5, mix: [['witness', { key: K.witness, hidden: false }]] },
      {
        speed: 7.0,
        mix: [
          ['witness', { key: K.witness, hidden: true }],
          ['pgcd', { key: K.witness, coprime: 'no', minSteps: 2, maxSteps: 4 }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster — most waves on the proof, as in the bank
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['coprimeWith', { key: K.only }],
          ['pgcd', { key: K.proof, coprime: 'yes', minSteps: 2, maxSteps: 4 }],
          ['witness', { key: K.witness, hidden: false }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['pgcd', { key: K.proof, coprime: 'yes', minSteps: 3, maxSteps: 5 }],
          ['pgcd', { key: K.only, coprime: 'mix', maxSteps: 5 }],
          ['witness', { key: K.witness, hidden: true }],
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
 * Its edge labels are shown from the first screen, before any key is forged: they name the story's places (the purse,
 * the workshop, the planks of the rules), never a rule (`practice.test.js` lists the words they must not hold).
 * Five nodes, laid like lesson 6's walked map: every labelled link is a row or a column of at least 42 %, its label
 * between two circles — never across a node's name.
 */
export const PRACTICE_MAP = {
  root: 'العددان الأوّليّان فيما بينهما',
  positions: {
    root: [50, 8],
    [K.only]: [80, 38],
    [K.proof]: [20, 38],
    [K.witness]: [20, 80],
    [EXAM]: [80, 80],
  },
  edges: [
    ['root', K.only, 'الكيس'],
    [K.only, K.proof, 'الورشة'],
    [K.proof, K.witness, 'ألواح القواعد'],
    [K.witness, EXAM, 'نستخلص'],
  ],
};
