/**
 * « Entraîne-toi » of lesson `fraction-irreductible` — the CONTENT of its trainer (PURE). The frame — six questions, two
 * formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's
 * TRAINER questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *
 *   game formats: one gate of the practice ladder (`tap`).
 *   exam formats: « Barre les facteurs premiers communs » (K1, P2), « Calcule le PGCD, puis dis si la fraction est
 *   irréductible » (K2, P1), « Rends la fraction irréductible avec le PGCD » (K3, P4), « Calcule, puis donne le résultat
 *   sous forme irréductible » (K4, P3: a sum or a product).
 * Ported from the Algerian `ikhtizal-kasr` (`hukm`, `mukhtazal`, `hisab`); its `marahil` (two stages by given divisors)
 * became the striking of the common prime factors. A FRACTION on the sheet is the kit's fraction template, ONE token
 * `{ frac: { n, d } }`: typed, n and d are two boxes stacked over a real bar; it counts as ONE answer on a line (B17).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { K } from './story';
import { isRight, waveOf } from './practice';
import { NUMBERS, fr, fracTex as F, gcd, nb, pgcdTex as P, powTex, powersOf, tx } from './math';

const { strike: ST, stays: SY, pgcd: PG, result: RS } = NUMBERS;
/** The numbers the lesson's road, forges and mission show: a trainer draw never lands on one of them. */
export const RESERVED = new Set([
  ST.gap,
  ST.mark,
  ...ST.rounds.flat(),
  ...ST.use.raw,
  SY.gap,
  SY.mark,
  ...SY.attack,
  ...SY.use.fractions.flat(),
  PG.gap,
  PG.mark,
  ...PG.use,
  RS.gap,
  ...NUMBERS.mission.product,
]);

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** A fraction to type: its numerator box over its denominator box, on a real bar (the kit's fraction template). */
const fracBoxes = (n, d, of = '') => ({ frac: { n: num(n, `numérateur${of}`), d: num(d, `dénominateur${of}`) } });
/** A fraction given by the statement, printed in the same shape. */
const given = (a, b) => ({ frac: { n: nb(a), d: nb(b) } });
/** « PGCD(a ; b) = [g] » as a plain line. */
const pgcdLine = (a, b) => ({ ltr: true, tokens: [`PGCD(${nb(a)} ; ${nb(b)})`, '=', num('g', 'PGCD')] });
/** The two verdicts of « la fraction est-elle irréductible ? ». */
const VERDICTS = [
  { value: 'irr', text: 'irréductible' },
  { value: 'red', text: 'réductible' },
];

/** Two coprime numbers p < q in [lo, hi]. */
function coprime(rand, lo, hi) {
  for (let t = 0; t < 400; t += 1) {
    const q = int(rand, lo + 1, hi);
    const p = int(rand, lo, q - 1);
    if (gcd(p, q) === 1) return [p, q];
  }
  throw new Error('trainer: no coprime pair');
}
/** The common divisors the trainer hides from the rules of divisibility (2, 3, 5): primes of 7 and more. */
const HIDDEN = [7, 11, 13, 17, 19];
/** A box is a whole number written (not empty, not a decimal, not negative). */
const whole = (v, ...ks) =>
  ks.every((k) => v?.[k] != null && String(v[k]).trim() !== '' && Number.isInteger(Number(v[k])) && Number(v[k]) >= 0);
const n = (v, k) => Number(v?.[k]);
const free = (...xs) => xs.every((x) => !RESERVED.has(x));

/** The hint for a PGCD x written for a and b, when it is not the right one (never the answer). */
function pgcdHint(a, b, x) {
  if (x === 0) return '0 ne divise aucun nombre : le PGCD n’est pas 0.';
  if (x > Math.min(a, b)) return `${nb(x)} est plus grand que ${nb(Math.min(a, b))} : il ne le divise pas.`;
  if (a % x === 0 && b % x === 0)
    return `${x} divise bien les deux nombres. Est-ce le plus grand ? Cherche si un autre facteur premier est commun.`;
  const [u, w] = a % x === 0 ? [b, a] : [a, b];
  return `$${tx(u)} = ${x} \\times ${tx(Math.floor(u / x))} + ${tx(u % x)}$ : ${x} ne divise pas ${nb(u)}${a % x === 0 ? `, même s’il divise ${nb(w)}` : ''}.`;
}
/** The hint for a fraction p/q written where the irreducible form of A/B is asked (equal? irreducible?). */
function irreducibleHint(A, B, p, q) {
  if (q === 0) return 'Le dénominateur n’est jamais 0.';
  if (A * q !== p * B)
    return `$${F(p, q)}$ n’est pas égal à $${F(A, B)}$ : on divise les deux termes par le même nombre.`;
  return `$${F(p, q)}$ est égal à $${F(A, B)}$, mais il s’écrit encore avec des nombres plus petits : $${P(p, q)} = ${gcd(p, q)}$.`;
}

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** exam (K1, P2) — both terms given with their decompositions: strike the common prime factors, write the fraction. */
  barrer(rand) {
    for (let t = 0; t < 400; t += 1) {
      const c = pick(rand, [2, 3, 5, 6, 10, 12, 14, 15, 18, 20, 28, 30, 42]);
      const [u, v] = coprime(rand, 1, 30);
      if (gcd(c, u) !== 1 && rand() < 0.5) continue;
      const [a, b] = [c * u, c * v];
      if (gcd(a, b) !== c || a > 700 || b > 700 || b < 24 || !free(a, b)) continue;
      return {
        format: 'exam',
        kind: 'barrer',
        key: K.strike,
        a,
        b,
        prompt: fr(
          `On donne $${tx(a)} = ${powTex(powersOf(a))}$ et $${tx(b)} = ${powTex(powersOf(b))}$. Barre les facteurs premiers communs et écris $${F(a, b)}$ sous forme irréductible.`,
        ),
        form: {
          tip: 'tipCompute',
          lines: [{ ltr: true, tokens: [given(a, b), '=', fracBoxes('p', 'q')] }],
        },
      };
    }
    throw new Error('trainer: no fraction to strike');
  },

  /** exam (K2, P1) — « Calcule PGCD(a ; b), puis dis si la fraction est irréductible ». */
  verdict(rand) {
    for (let t = 0; t < 400; t += 1) {
      // irreducible, or a common divisor that no rule of 2, 3, 5 shows (7, 11, 13, 17, 19)
      const g = rand() < 0.5 ? 1 : pick(rand, HIDDEN);
      const [p, q] = g === 1 ? coprime(rand, 20, 150) : coprime(rand, 3, Math.floor(400 / g));
      const [a, b] = [p * g, q * g];
      if (!free(a, b)) continue;
      return {
        format: 'exam',
        kind: 'verdict',
        key: K.stays,
        a,
        b,
        prompt: fr(`Calcule $${P(tx(a), tx(b))}$, puis dis si la fraction $${F(a, b)}$ est irréductible.`),
        form: {
          tip: 'tipCompute',
          lines: [
            pgcdLine(a, b),
            { tokens: ['La fraction', given(a, b), 'est', { choice: 'verdict', options: shuffle(rand, VERDICTS) }] },
          ],
        },
      };
    }
    throw new Error('trainer: no fraction to judge');
  },

  /** exam (K3, P4) — « Rends la fraction irréductible » : the PGCD, then the fraction. */
  diviser(rand) {
    for (let t = 0; t < 400; t += 1) {
      const [p, q] = coprime(rand, 2, 24);
      const g = pick(rand, [12, 14, 15, 18, 21, 24, 26, 27, 28, 33, 35, 36, 39]);
      const [a, b] = [p * g, q * g];
      if (!free(a, b)) continue;
      return {
        format: 'exam',
        kind: 'diviser',
        key: K.pgcd,
        a,
        b,
        prompt: fr(`Calcule $${P(tx(a), tx(b))}$, puis écris $${F(a, b)}$ sous forme irréductible.`),
        form: {
          tip: 'tipDivision',
          lines: [pgcdLine(a, b), { ltr: true, tokens: [given(a, b), '=', fracBoxes('p', 'q')] }],
        },
      };
    }
    throw new Error('trainer: no fraction to divide');
  },

  /** exam (K4, P3) — « Calcule, puis donne le résultat sous forme irréductible » : a sum of different denominators or a product. */
  calcul(rand) {
    for (let t = 0; t < 600; t += 1) {
      const op = pick(rand, ['+', '×']);
      const [y, w] = [int(rand, 3, 15), int(rand, 3, 15)];
      const [x, z] = [int(rand, 1, y - 1), int(rand, 1, w - 1)];
      // each fraction given is irreducible; the result is not, and is not a whole number
      if (gcd(x, y) !== 1 || gcd(z, w) !== 1 || (op === '+' && y === w) || (op === '×' && x === z)) continue;
      const [A, B] = op === '×' ? [x * z, y * w] : [x * w + z * y, y * w];
      if (A >= B || gcd(A, B) === 1 || A % B === 0) continue;
      if (RESERVED.has(A) || RESERVED.has(B)) continue;
      const expr = `${F(x, y)} ${op === '×' ? '\\times' : '+'} ${F(z, w)}`;
      return {
        format: 'exam',
        kind: 'calcul',
        key: K.result,
        op,
        x,
        y,
        z,
        w,
        A,
        B,
        prompt: fr(`Calcule $${expr}$, puis donne le résultat sous forme irréductible.`),
        form: {
          tip: 'tipCompute',
          lines: [
            { ltr: true, tokens: [given(x, y), op, given(z, w), '=', fracBoxes('s', 't', ' du résultat')] },
            { ltr: true, tokens: ['=', fracBoxes('p', 'q', ' irréductible')] },
          ],
        },
      };
    }
    throw new Error('trainer: no calculation');
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const tap = (kind, key, extra = {}) => ['tap', kind, { key, ...extra }];
const PLANS = {
  strike: [
    tap('barrer', K.strike),
    tap('barrer', K.strike),
    ['barrer'],
    tap('barrer', K.strike),
    ['barrer'],
    ['barrer'],
  ],
  stays: [tap('stays', K.stays), tap('stays', K.stays), ['verdict'], tap('stays', K.stays), ['verdict'], ['verdict']],
  pgcd: [
    tap('pgcdW', K.pgcd, { max: 60 }),
    tap('pgcdW', K.pgcd, { max: 100 }),
    ['diviser'],
    tap('pgcdW', K.pgcd, { max: 100 }),
    ['diviser'],
    ['diviser'],
  ],
  result: [
    tap('calcul', K.result, { op: '+' }),
    tap('calcul', K.result, { op: '*' }),
    ['calcul'],
    tap('calcul', K.result, { op: '+' }),
    ['calcul'],
    ['calcul'],
  ],
  mix: [
    tap('stays', K.stays),
    tap('calcul', K.result, { op: '+' }),
    ['verdict'],
    tap('pgcdW', K.pgcd, { max: 100 }),
    ['diviser'],
    ['calcul'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  fraction: 'strike',
  rappel: 'strike',
  facteurs: 'strike',
  'erreur-une-fois': 'strike',
  'exemple-246': 'strike',
  irreductible: 'stays',
  'erreur-235': 'stays',
  'exemple-96': 'stays',
  pgcd: 'pgcd',
  'erreur-tot': 'pgcd',
  'exemple-pont-long': 'pgcd',
  resultat: 'result',
  'erreur-tel-quel': 'result',
  'exemple-78': 'result',
  choisir: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'barrer': {
      const g = gcd(q.a, q.b);
      return { p: q.a / g, q: q.b / g };
    }
    case 'verdict':
      return { g: gcd(q.a, q.b), verdict: gcd(q.a, q.b) === 1 ? 'irr' : 'red' };
    case 'diviser': {
      const g = gcd(q.a, q.b);
      return { g, p: q.a / g, q: q.b / g };
    }
    case 'calcul': {
      const g = gcd(q.A, q.B);
      return { s: q.A, t: q.B, p: q.A / g, q: q.B / g };
    }
    default:
      return null;
  }
}

/** « $\dfrac{p}{q}$ » of what he wrote in two boxes. */
const wrote = (v, a, b) => `$${F(n(v, a), n(v, b))}$`;

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  if (q.kind === 'tap') {
    const g = explain(q.wave, v);
    return {
      ok: isRight(q.wave, v),
      hint: g.wrong || fr('Relis la phrase, puis vérifie chaque porte par le calcul.'),
      fix: g.right,
    };
  }
  switch (q.kind) {
    case 'barrer': {
      const { a, b } = q;
      const g = gcd(a, b);
      const fix = fr(
        `Les facteurs premiers communs ($${powTex(powersOf(g))} = ${g}$) sont barrés dans les deux termes : $${F(a, b)} = ${F(a / g, b / g)}$.`,
      );
      if (!whole(v, 'p', 'q')) return { ok: false, hint: fr('Remplis le numérateur et le dénominateur.'), fix };
      if (n(v, 'q') === 0 || a * n(v, 'q') !== n(v, 'p') * b || gcd(n(v, 'p'), n(v, 'q')) !== 1)
        return { ok: false, hint: fr(irreducibleHint(a, b, n(v, 'p'), n(v, 'q'))), fix };
      return { ok: true, fix };
    }
    case 'verdict': {
      const { a, b } = q;
      const g = gcd(a, b);
      const fix = fr(
        `$${P(tx(a), tx(b))} = ${g}$, donc la fraction $${F(a, b)}$ ${g === 1 ? 'est irréductible' : `est réductible : on peut diviser ses deux termes par ${g}`}.`,
      );
      if (!whole(v, 'g') || !['irr', 'red'].includes(v?.verdict))
        return { ok: false, hint: fr('Remplis la case et choisis le verdict.'), fix };
      if (n(v, 'g') !== g) return { ok: false, hint: fr(pgcdHint(a, b, n(v, 'g'))), fix };
      if (v.verdict !== (g === 1 ? 'irr' : 'red'))
        return { ok: false, hint: fr(`Compare le PGCD que tu as trouvé, ${g}, au nombre 1.`), fix };
      return { ok: true, fix };
    }
    case 'diviser': {
      const { a, b } = q;
      const g = gcd(a, b);
      const fix = fr(
        `$${P(tx(a), tx(b))} = ${g}$, donc $${F(a, b)} = ${F(`${a} \\div ${g}`, `${b} \\div ${g}`)} = ${F(a / g, b / g)}$.`,
      );
      if (!whole(v, 'g', 'p', 'q'))
        return { ok: false, hint: fr('Remplis toutes les cases : le PGCD, puis la fraction.'), fix };
      if (n(v, 'g') !== g) return { ok: false, hint: fr(pgcdHint(a, b, n(v, 'g'))), fix };
      if (n(v, 'p') !== a / g || n(v, 'q') !== b / g)
        return { ok: false, hint: fr(irreducibleHint(a, b, n(v, 'p'), n(v, 'q'))), fix };
      return { ok: true, fix };
    }
    case 'calcul': {
      const { A, B } = q;
      const g = gcd(A, B);
      const expr = `${F(q.x, q.y)} ${q.op === '×' ? '\\times' : '+'} ${F(q.z, q.w)}`;
      const fix = fr(`$${expr} = ${F(A, B)}$ et $${P(A, B)} = ${g}$, donc le résultat est $${F(A / g, B / g)}$.`);
      if (!whole(v, 's', 't', 'p', 'q'))
        return { ok: false, hint: fr('Remplis les quatre cases : le résultat, puis la fraction irréductible.'), fix };
      if (n(v, 't') === 0 || A * n(v, 't') !== n(v, 's') * B)
        return {
          ok: false,
          hint: fr(
            q.op === '×'
              ? `${wrote(v, 's', 't')} n’est pas le produit : on multiplie les numérateurs entre eux et les dénominateurs entre eux.`
              : `${wrote(v, 's', 't')} n’est pas la somme : on réduit d’abord au même dénominateur, puis on additionne les numérateurs.`,
          ),
          fix,
        };
      if (n(v, 'p') !== A / g || n(v, 'q') !== B / g)
        return { ok: false, hint: fr(irreducibleHint(A, B, n(v, 'p'), n(v, 'q'))), fix };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const x = (k) => (v?.[k] == null || v[k] === '' ? '…' : v[k]);
  const frac = (a, b) => `$${F(x(a), x(b))}$`;
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'barrer':
      return fr(`$${F(q.a, q.b)}$ = ${frac('p', 'q')}`);
    case 'verdict': {
      const verdict = VERDICTS.find((o) => o.value === v?.verdict)?.text ?? '…';
      return fr(`$${P(tx(q.a), tx(q.b))} = ${x('g')}$ — ${verdict}`);
    }
    case 'diviser':
      return fr(`$${P(tx(q.a), tx(q.b))} = ${x('g')}$ — ${frac('p', 'q')}`);
    case 'calcul':
      return fr(`${frac('s', 't')} = ${frac('p', 'q')}`);
    default:
      return '';
  }
}

/** The trainer of this lesson: its questions and how they are judged, bound to the kit's frame. */
export const trainer = createTrainer({
  kinds: Q,
  plans: PLANS,
  planOf: PLAN_OF,
  fallback: 'mix',
  check,
  solution,
  answerLabel,
});
