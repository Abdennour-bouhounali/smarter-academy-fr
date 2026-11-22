/**
 * « حلبة التدريب » of lesson `ikhtizal-kasr` — the CONTENT of its practice ladder (PURE). The ladder itself is the kit's
 * (`gameworld/kit/ladder.js`). Here: the kinds of question of THIS lesson, when a gate is right, the map of its levels.
 * A wave is DATA: { type, key, …, gates, good }; its sentences are written here and carried by the wave itself: `say`
 * and `why: { right, wrong: { [gate]: line } }` (the world writes none of these types).
 * THE GATE DASH IS MENTAL ARITHMETIC: every number stays at most 100; the big numbers belong to the exam format of the
 * trainer, where the student has paper. A gate is a whole number: a missing numerator or denominator (`\square`).
 * Every wrong gate is a real mistake: the denominator divided and the numerator not, a writing that still reduces, the
 * denominators added. The levels follow the weight of the bank: the irreducible form by the PGCD (94 questions) and the
 * result of a calculation (42) have two levels each, the stages (4) and the recognition (9) one.
 */
import { int, pick } from '../../../../../../common/gameworld/kit/random';
import { buildWave as wave, createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { divisorsOf, fracTex as F, gcd, pgcdTex as P } from './math';
import { K } from './story';

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  switch (w.type) {
    case 'marhala':
      return n === (w.side === 'd' ? w.b / w.k : w.a / w.k);
    case 'ghayrW':
      return Number.isInteger(n) && n >= 1 && gcd(n, w.n) === 1;
    case 'pgcdW':
      return n === (w.side === 'd' ? w.b : w.a) / gcd(w.a, w.b);
    case 'natijaW':
      return n === w.n / gcd(w.s, w.n);
    default:
      return false;
  }
}

const linesFor = (pool, line) => Object.fromEntries(pool.map((n) => [n, line(n)]));
/** Two coprime numbers x < y, both in [lo, hi]. */
function coprimeBelow(rand, lo, hi) {
  const y = int(rand, lo + 1, hi);
  const x = int(rand, lo, y - 1);
  return gcd(x, y) === 1 ? [x, y] : null;
}

// ── the kinds of question ──
const G = {
  /**
   * 🪜 « $\frac{34}{46} = \frac{17}{\square}$ » — one stage: numerator and denominator divided by the same k; one of
   * the two is shown, the other is the gate.
   */
  marhala(rand, { key }) {
    const k = pick(rand, [2, 3, 5, 7]);
    const pair = coprimeBelow(rand, 2, Math.floor(100 / k));
    if (!pair) return null;
    const m = int(rand, 1, 3); // the fraction shown may still reduce after this stage
    const [x, y] = [pair[0] * m, pair[1] * m];
    const [a, b] = [x * k, y * k];
    if (b > 100 || x < 2) return null;
    const side = rand() < 0.5 ? 'd' : 'n';
    const right = side === 'd' ? y : x;
    const say = side === 'd' ? `$${F(a, b)} = ${F(x, '\\square')}$` : `$${F(a, b)} = ${F('\\square', y)}$`;
    const base = { type: 'marhala', key, a, b, k, side, say };
    // the other number not divided, divided by another number, or the difference kept
    const pool = [side === 'd' ? b : a, right + 1, right - 1, side === 'd' ? b - (a - x) : a - (b - y)].filter(
      (n) => n > 0 && n <= 100,
    );
    const full = side === 'd' ? b : a;
    return wave(
      rand,
      {
        ...base,
        why: {
          right: `$${a} = ${k} \\times ${x}$ و $${b} = ${k} \\times ${y}$: البسط والمقام قُسما على ${k}.`,
          wrong: linesFor(pool, (n) =>
            n === full
              ? `${side === 'd' ? 'البسط' : 'المقام'} قُسم على ${k}، فيُقسم ${side === 'd' ? 'المقام' : 'البسط'} على ${k} أيضًا.`
              : `$${k} \\times ${n} = ${k * n}$، وليس ${full}.`,
          ),
        },
      },
      right,
      pool,
    );
  },
  /**
   * 🔒 « بسط يجعل $\frac{\square}{26}$ غير قابل للاختزال » — n has two prime factors at least; one gate is coprime with
   * n, the two others share a factor with it.
   */
  ghayrW(rand, { key }) {
    const n = pick(rand, [12, 14, 15, 18, 20, 21, 22, 24, 26, 28, 30, 33, 34, 35, 36, 39, 40]);
    const side = rand() < 0.5 ? 'n' : 'd';
    const right = int(rand, 2, 99);
    if (gcd(right, n) !== 1 || right === n) return null;
    const pool = [];
    for (let t = 0; t < 14; t += 1) {
      const x = int(rand, 2, 99);
      if (gcd(x, n) > 1 && x !== n) pool.push(x);
    }
    const say =
      side === 'n'
        ? `بسط يجعل $${F('\\square', n)}$ غير قابل للاختزال`
        : `مقام يجعل $${F(n, '\\square')}$ غير قابل للاختزال`;
    const fr = (x) => (side === 'n' ? F(x, n) : F(n, x));
    return wave(
      rand,
      {
        type: 'ghayrW',
        key,
        // a, b: what the ladder compares to never ask the same wave twice in a row
        a: n,
        b: right,
        n,
        side,
        say,
        why: {
          right: `$${P(right, n)} = 1$: الكسر $${fr(right)}$ غير قابل للاختزال.`,
          wrong: linesFor(pool, (x) => {
            const p = gcd(x, n);
            return `$${x} = ${p} \\times ${x / p}$ و $${n} = ${p} \\times ${n / p}$: الكسر $${fr(x)}$ يُختزل على ${p}.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /**
   * 🎯 « مقام $\frac{36}{60}$ على الشكل غير القابل للاختزال » — a = g·p, b = g·q (p, q coprime, g with a divisor d
   * between 1 and g): the wrong gates are the writing not reduced (b) and a writing that stopped too early (b ÷ d).
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
    return wave(
      rand,
      {
        type: 'pgcdW',
        key,
        a,
        b,
        side,
        say: `${side === 'd' ? 'مقام' : 'بسط'} $${F(a, b)}$ على الشكل غير القابل للاختزال`,
        why: {
          right: `$${P(a, b)} = ${g}$: $${F(a, b)} = ${F(p, q)}$.`,
          wrong: linesFor(pool, (n) => {
            if (n === full) return `$${P(a, b)} = ${g}$: الكسر $${F(a, b)}$ يُختزل.`;
            const d = full / n;
            return `$${F(a, b)} = ${F(a / d, b / d)}$، لكنّ $${P(a / d, b / d)} = ${g / d}$: الكسر يُختزل بعد.`;
          }),
        },
      },
      right,
      pool,
    );
  },
  /**
   * 🧾 « $\frac{17}{30} + \frac{11}{30} = \frac{14}{\square}$ » — a sum or a difference of two fractions of one
   * denominator, its result reduced: the wrong gates are the result not reduced (n) and the denominators added (2n) —
   * or, for a difference, subtracted (0).
   */
  natijaW(rand, { key, op = '+' }) {
    const n = int(rand, 8, 48);
    const x = int(rand, 1, n - 1);
    const y = int(rand, 1, n - 1);
    const s = op === '+' ? x + y : x - y;
    if (s <= 0 || s >= n || x === y) return null;
    const g = gcd(s, n);
    if (g === 1) return null;
    const right = n / g;
    const pool = [n, op === '+' ? 2 * n : 0].filter((v) => v <= 100);
    return wave(
      rand,
      {
        type: 'natijaW',
        key,
        a: x,
        b: y,
        x,
        y,
        n,
        s,
        op,
        say: `$${F(x, n)} ${op} ${F(y, n)} = ${F(s / g, '\\square')}$`,
        why: {
          right: `$${F(x, n)} ${op} ${F(y, n)} = ${F(s, n)}$ و $${P(s, n)} = ${g}$: النتيجة $${F(s / g, n / g)}$.`,
          wrong: linesFor(pool, (v) =>
            v === n
              ? `$${F(s, n)}$ يُختزل: $${P(s, n)} = ${g}$.`
              : `${op === '+' ? 'نجمع' : 'نطرح'} البسطين فقط: المقام يبقى ${n}، ثمّ نختزل.`,
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
  { id: K.marahil, levels: [{ speed: 6.0, mix: [['marhala', { key: K.marahil }]] }] },
  { id: K.ghayr, levels: [{ speed: 6.0, mix: [['ghayrW', { key: K.ghayr }]] }] },
  {
    id: K.pgcd,
    levels: [
      { speed: 6.5, mix: [['pgcdW', { key: K.pgcd, max: 60 }]] },
      { speed: 7.0, mix: [['pgcdW', { key: K.pgcd, max: 100 }]] },
    ],
  },
  {
    id: K.natija,
    levels: [
      { speed: 6.5, mix: [['natijaW', { key: K.natija, op: '+' }]] },
      {
        speed: 7.0,
        mix: [
          ['natijaW', { key: K.natija, op: '+' }],
          ['natijaW', { key: K.natija, op: '-' }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster — most waves on the PGCD, as in the bank
  {
    id: EXAM,
    levels: [
      {
        speed: 6.5,
        mix: [
          ['marhala', { key: K.marahil }],
          ['ghayrW', { key: K.ghayr }],
          ['pgcdW', { key: K.pgcd, max: 60 }],
          ['natijaW', { key: K.natija, op: '+' }],
        ],
      },
      {
        speed: 7.0,
        mix: [
          ['pgcdW', { key: K.pgcd, max: 100 }],
          ['pgcdW', { key: K.pgcd, max: 100 }],
          ['natijaW', { key: K.natija, op: '-' }],
          ['ghayrW', { key: K.ghayr }],
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
 * Its edge labels are shown from the first screen, before any key is forged: they name the story's places (the sign,
 * the post, the workshop), never a rule (`practice.test.js` lists the words they must not hold). Six nodes on the
 * places lesson 6's walked map used (`bahth-pgcd/world/practice.js`): every labelled link is a row or a column of at
 * least 42 %, or the link to the exam that lesson 6 labelled; the link along the bottom row carries no label.
 */
export const PRACTICE_MAP = {
  root: 'اختزال كسر',
  positions: {
    root: [50, 8],
    [K.marahil]: [80, 38],
    [K.ghayr]: [20, 38],
    [K.pgcd]: [20, 80],
    // the bottom row holds the two longest titles side by side: 34 % then 30 % apart (the hub walk, 2026-11-20 — at 50
    // and 80 « نختزل بالقاسم المشترك الأكبر » touched « نختزل نتيجة الحساب »)
    [K.natija]: [54, 80],
    [EXAM]: [84, 80],
  },
  edges: [
    ['root', K.marahil, 'اللافتة'],
    [K.marahil, K.ghayr, 'العمود'],
    [K.ghayr, K.pgcd, 'الورشة'],
    [K.pgcd, K.natija, null],
    [K.natija, EXAM, 'نستخلص'],
  ],
};
