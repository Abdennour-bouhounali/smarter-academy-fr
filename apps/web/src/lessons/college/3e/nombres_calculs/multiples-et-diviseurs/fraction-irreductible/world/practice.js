/**
 * « Espace jeu » of lesson `fraction-irreductible` — the CONTENT of its practice ladder (PURE). The ladder itself is the
 * kit's (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its
 * levels. A wave is DATA: { type, key, a, b, …, gates, good }; its sentences are written here and carried by the wave
 * itself: `say` and `why: { right, wrong: { [gate]: line } }`. Ported from the Algerian `ikhtizal-kasr` (`marhala`,
 * `ghayrW`, `pgcdW`, `natijaW`); its stages by successive divisions became the striking of the common prime factors.
 *
 * THE GATE DASH IS MENTAL ARITHMETIC: every number printed (and every gate) stays at most 100; a decomposition is
 * printed as its primes and powers. A gate is a whole number, the missing term of a fraction (`\square`). Every wrong
 * gate is a belief a student holds — a common prime kept, nothing struck, a result simplified once, the terms swapped —
 * and no wrong gate makes a TRUE equality (`practice.test.js`).
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { K } from './story';
import { divisorsOf, fracTex as F, frAll, gcd, pgcdTex as P, powTex, powersOf } from './math';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'barrer':
      return n === w.v;
    case 'stays':
      return Number.isInteger(n) && n >= 1 && gcd(n, w.n) === 1;
    case 'pgcdW':
      return n === (w.side === 'd' ? w.b : w.a) / gcd(w.a, w.b);
    case 'calcul':
      return n === w.B / gcd(w.A, w.B);
    default:
      return false;
  }
}

const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** A wave whose sentences take French typography. */
const fair = (rand, base, right, pool) =>
  wave(rand, { ...base, say: frAll(base.say), why: frAll(base.why) }, right, pool);
/** Two coprime numbers x < y, both in [lo, hi]. */
function coprimeBelow(rand, lo, hi) {
  const y = int(rand, lo + 1, hi);
  const x = int(rand, lo, y - 1);
  return gcd(x, y) === 1 ? [x, y] : null;
}
/** The smallest prime two numbers share. */
const sharedPrime = (x, y) => powersOf(gcd(x, y))[0].p;

// ── the kinds of question ──
const G = {
  /**
   * « $\dfrac{2 \times 3^{2}}{2 \times 5} = \dfrac{3^{2}}{\square}$ » — both terms decomposed, the common prime factors
   * struck: the denominator that is left. Wrong: a common prime kept, nothing struck, the numerator's term.
   */
  barrer(rand, { key }) {
    const common = pick(rand, [[2], [3], [5], [2, 2], [2, 3], [3, 3], [2, 5]]).map(Number);
    const ups = pick(rand, [[3], [5], [7], [3, 3], [7, 7], [3, 5], [5, 7]]);
    const downs = pick(rand, [[2], [3], [5], [7], [2, 2], [5, 7], [3, 7], [2, 5]]);
    if (ups.some((p) => downs.includes(p) || common.includes(p)) || downs.some((p) => common.includes(p))) return null;
    const dec = (xs) => powTex(powersOf(xs.reduce((v, p) => v * p, 1)));
    const [c, u, v] = [common, ups, downs].map((xs) => xs.reduce((n, p) => n * p, 1));
    if (c * v > 100 || v < 2) return null;
    const p = common[0];
    const num = [...common, ...ups];
    const den = [...common, ...downs];
    const say = `$${F(dec(num), dec(den))} = ${F(dec(ups), '\\square')}$`;
    const pool = [v * p, c * v, u].filter((n) => n <= 100);
    return fair(
      rand,
      {
        type: 'barrer',
        key,
        a: c * u,
        b: c * v,
        v,
        say,
        why: {
          right: `On barre ${powTex(powersOf(c))} dans les deux termes : il reste $${F(u, v)}$.`,
          wrong: linesFor(pool, (n) =>
            n === u
              ? `${u} est ce qui reste au numérateur : on cherche le dénominateur.`
              : n === c * v
                ? `Le dénominateur ${c * v} n’a pas changé : aucun facteur n’a été barré.`
                : `Il reste le facteur premier ${p} dans les deux termes : on n’a pas tout barré.`,
          ),
        },
      },
      v,
      pool,
    );
  },
  /**
   * « Un dénominateur qui rend $\dfrac{39}{\square}$ irréductible » — one gate shares no prime factor with n, the two
   * others do (a factor that no rule of 2, 3, 5 shows: 7, 11, 13, 17, 19).
   */
  stays(rand, { key }) {
    const n = pick(rand, [14, 15, 22, 26, 33, 34, 35, 38, 39, 46, 51, 55, 57, 65, 77, 85, 91]);
    const side = rand() < 0.5 ? 'n' : 'd';
    const right = int(rand, 2, 99);
    if (gcd(right, n) !== 1 || right === n) return null;
    const pool = [];
    for (let t = 0; t < 14; t += 1) {
      const x = int(rand, 2, 99);
      if (gcd(x, n) > 1 && x !== n) pool.push(x);
    }
    const fr = (x) => (side === 'n' ? F(x, n) : F(n, x));
    return fair(
      rand,
      {
        type: 'stays',
        key,
        a: n,
        b: right,
        n,
        side,
        say:
          side === 'n'
            ? `Un numérateur qui rend $${F('\\square', n)}$ irréductible`
            : `Un dénominateur qui rend $${F(n, '\\square')}$ irréductible`,
        why: {
          right: `$${P(right, n)} = 1$ : $${fr(right)}$ est irréductible.`,
          wrong: linesFor(pool, (x) => {
            const q = sharedPrime(x, n);
            return `$${x} = ${q} \\times ${x / q}$ et $${n} = ${q} \\times ${n / q}$ : $${fr(x)}$ se simplifie par ${q}.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /**
   * « Le dénominateur de $\dfrac{36}{60}$ rendu irréductible » — a = g·p, b = g·q (p, q coprime): wrong gates are the
   * term not divided and a writing that stopped too early (divided by a divisor of g only).
   */
  pgcdW(rand, { key, max = 100 }) {
    const g = pick(rand, [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20]);
    const pair = coprimeBelow(rand, 1, Math.floor(max / g));
    if (!pair) return null;
    const [p, q] = pair;
    const [a, b] = [g * p, g * q];
    if (b > max || q < 2) return null;
    const side = rand() < 0.5 ? 'd' : 'n';
    const full = side === 'd' ? b : a;
    const right = full / g;
    const early = divisorsOf(g)
      .filter((d) => d > 1 && d < g)
      .map((d) => full / d);
    const pool = [full, ...early];
    return fair(
      rand,
      {
        type: 'pgcdW',
        key,
        a,
        b,
        side,
        say: `${side === 'd' ? 'Le dénominateur' : 'Le numérateur'} de $${F(a, b)}$ rendu irréductible`,
        why: {
          right: `$${P(a, b)} = ${g}$ : $${F(a, b)} = ${F(p, q)}$.`,
          wrong: linesFor(pool, (n) => {
            if (n === full) return `$${P(a, b)} = ${g}$ : la fraction se simplifie.`;
            const d = full / n;
            return `$${F(a, b)} = ${F(a / d, b / d)}$, mais $${P(a / d, b / d)} = ${g / d}$ : il reste un facteur commun.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /**
   * « $\dfrac{5}{6} + \dfrac{7}{10} = \dfrac{\square}{…}$ » style: a sum or a product of two irreducible fractions whose
   * result is not; the denominator of the irreducible result. Wrong: the result not simplified, simplified once only.
   */
  calcul(rand, { key, op = '+' }) {
    const ds = [3, 4, 5, 6, 8, 9, 10, 12, 14, 15];
    const y = pick(rand, ds);
    const w = pick(rand, ds);
    const x = int(rand, 1, y - 1);
    const z = int(rand, 1, w - 1);
    if (gcd(x, y) !== 1 || gcd(z, w) !== 1 || y === w) return null;
    const [A, B] = op === '+' ? [x * w + z * y, y * w] : [x * z, y * w];
    const g = gcd(A, B);
    if (g === 1 || A >= B || B / g > 100) return null;
    const right = B / g;
    const partial = powersOf(g)
      .map((f) => B / f.p)
      .filter((n) => n !== right);
    const pool = [B, ...partial].filter((n) => n <= 100);
    return fair(
      rand,
      {
        type: 'calcul',
        key,
        a: x * 100 + y,
        b: z * 100 + w,
        A,
        B,
        say: `$${F(x, y)} ${op === '+' ? '+' : '\\times'} ${F(z, w)} = ${F(A / g, '\\square')}$`,
        why: {
          right: `$${F(x, y)} ${op === '+' ? '+' : '\\times'} ${F(z, w)} = ${F(A, B)}$ et $${P(A, B)} = ${g}$ : le résultat est $${F(A / g, B / g)}$.`,
          wrong: linesFor(pool, (n) =>
            n === B
              ? `$${F(A, B)}$ se simplifie encore : $${P(A, B)} = ${g}$.`
              : `Une seule simplification ne suffit pas : il reste un facteur commun aux deux termes.`,
          ),
        },
      },
      right,
      pool,
    );
  },
};

/** The map: one node per key in the order of the road, then the summary node; levels from the easiest. */
const EXAM = SUMMARY;
export const PRACTICE_NODES = [
  { id: K.strike, levels: [{ speed: 6.0, mix: [['barrer', { key: K.strike }]] }] },
  { id: K.stays, levels: [{ speed: 6.0, mix: [['stays', { key: K.stays }]] }] },
  {
    id: K.pgcd,
    levels: [
      { speed: 6.5, mix: [['pgcdW', { key: K.pgcd, max: 60 }]] },
      { speed: 7.0, mix: [['pgcdW', { key: K.pgcd, max: 100 }]] },
    ],
  },
  {
    id: K.result,
    levels: [
      { speed: 6.5, mix: [['calcul', { key: K.result, op: '+' }]] },
      {
        speed: 7.0,
        mix: [
          ['calcul', { key: K.result, op: '+' }],
          ['calcul', { key: K.result, op: '*' }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['barrer', { key: K.strike }],
          ['stays', { key: K.stays }],
          ['pgcdW', { key: K.pgcd, max: 60 }],
          ['calcul', { key: K.result, op: '+' }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['pgcdW', { key: K.pgcd, max: 100 }],
          ['calcul', { key: K.result, op: '*' }],
          ['stays', { key: K.stays }],
          ['barrer', { key: K.strike }],
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
 * (`practice.test.js` lists the words they must not hold). The positions are lesson 2's walked map, the first key a
 * little left and the second a little lower: the first key's name wraps on two lines (the kit wraps a name at 17rem,
 * styles/practice.css › .di-node) and met the second's (2026-11-26 walk, hub: « no label of the mind map covers another »).
 */
export const PRACTICE_MAP = {
  root: 'Les ponts du gardien',
  positions: {
    root: [50, 7],
    [K.strike]: [46, 40],
    [K.stays]: [84, 50],
    [K.pgcd]: [82, 76],
    [K.result]: [22, 76],
    [EXAM]: [19, 36],
  },
  edges: [
    ['root', K.strike, 'Les pancartes'],
    [K.strike, K.stays, null],
    [K.stays, K.pgcd, null],
    [K.pgcd, K.result, 'L’atelier du forgeron'],
    [K.result, EXAM, 'La jetée du gardien'],
  ],
};
