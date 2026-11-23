/**
 * « Entraîne-toi » of lesson `trouver-le-pgcd` — the CONTENT of its trainer (PURE). The frame — six questions, two formats
 * that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's TRAINER
 * questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`). Here: the
 * kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged: `check` gives
 * first a HINT that says what the answer produces (never the answer), then the written correction.
 *
 *   exam formats: « Écris les diviseurs communs de a et b, puis leur PGCD » (K1, P1), « Le plus de lots identiques, et
 *   ce que chaque lot contient » (K2, P4), « A et B sont décomposés : écris PGCD(A ; B) avec des puissances, puis sa
 *   valeur » (K3, P2), « Avec l’algorithme d’Euclide : la première division, puis le PGCD » (K4, P3), « Vrai ou faux ?
 *   Justifie ».
 * Ported from the Algerian lessons `qasim-mushtarak-akbar` (common divisors, the bouquets) and `bahth-pgcd` (Euclid),
 * rewritten in French; the exponents are typed RAISED after their printed prime (the kit's `{ pow }` token, lesson 1).
 * Every reason offered to « Justifie » that is not the right one is a FALSE statement, and `trainer.test.js` computes each
 * one. A form line holds at most three answers (defects.md B17); a correction chains at most three divisions (B26).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { K } from './story';
import { isRight, waveOf } from './practice';
import {
  NUMBERS,
  commonDivisors,
  commonPowers,
  counted,
  euclid,
  fr,
  gcd,
  listFr,
  nb,
  pgcdTex as P,
  powTex,
  tx,
  valueOfPowers,
} from './math';

const { twins: TW, deal: DL, factors: FC, euclide: EU, mission: MI } = NUMBERS;
/** The numbers the lesson's road, forges and mission show: a trainer draw never lands on one of them. */
export const RESERVED = new Set([
  ...TW.gaps,
  ...TW.use,
  DL.apples,
  DL.pears,
  ...DL.use,
  ...FC.gaps,
  ...FC.use.map(valueOfPowers),
  ...EU.gaps,
  ...EU.contrast,
  ...EU.use,
  ...MI.gaps,
]);

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/** a = g × p, b = g × q with p > q ≥ 2 sharing no divisor but 1: PGCD(a ; b) = g, neither divides the other. */
function pairOf(rand, { g, pMax = 9, max = 400 }) {
  for (let t = 0; t < 400; t += 1) {
    const p = int(rand, 3, pMax);
    const q = int(rand, 2, p - 1);
    const [a, b] = [g * p, g * q];
    if (gcd(p, q) === 1 && a <= max && !RESERVED.has(a) && !RESERVED.has(b)) return { a, b, g, p, q };
  }
  return null;
}
/** PGCDs with exactly six divisors: the list of common divisors is six boxes, in two lines of three. */
const SIX = [12, 18, 20, 28, 32, 44, 45, 50];
/** A decomposition on 2, 3, 5, 7: [{ p, e }]. */
const drawPowers = (rand) =>
  [2, 3, 5, 7].map((p) => ({ p, e: int(rand, 0, p === 2 ? 4 : p === 3 ? 3 : 2) })).filter((f) => f.e > 0);

/** The words of a sharing: what is shared ([singular, plural]) and the lots. */
const SHARES = [
  { x: ['pomme', 'pommes'], y: ['poire', 'poires'], lot: ['panier', 'paniers'], each: 'chacun' },
  {
    x: ['bille rouge', 'billes rouges'],
    y: ['bille bleue', 'billes bleues'],
    lot: ['sachet', 'sachets'],
    each: 'chacun',
  },
  { x: ['rose', 'roses'], y: ['tulipe', 'tulipes'], lot: ['bouquet', 'bouquets'], each: 'chacun' },
  { x: ['crayon', 'crayons'], y: ['gomme', 'gommes'], lot: ['trousse', 'trousses'], each: 'chacune' },
];
/** French first names, girls and boys in turn. */
const NAMES = [
  ['Léa', 'Elle'],
  ['Hugo', 'Il'],
  ['Inès', 'Elle'],
  ['Malik', 'Il'],
  ['Chloé', 'Elle'],
  ['Théo', 'Il'],
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label, w) => ({ num: name, label, ...(w ? { w } : {}) });
const SLOTS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
/** « PGCD(a ; b) = [g] ». */
const pgcdLine = (a, b, name = 'g') => ({ ltr: true, tokens: [`PGCD(${a} ; ${b})`, '=', num(name, 'PGCD', 3)] });
/** « a = b × [q] + [r] ». */
const divisionLine = (a, b) => ({
  ltr: true,
  tokens: [nb(a), '=', nb(b), '×', num('q', 'quotient'), '+', num('r', 'reste', 3)],
});

/** The boxes of an answer, as numbers — a box left EMPTY (or blank) is no number. */
export const box = (v, k) => (v?.[k] == null || String(v[k]).trim() === '' ? NaN : Number(v[k]));
const natural = (x) => Number.isInteger(x) && x >= 0;
/** « $x = n × q + r$ » — the division of x by n. */
const leaves = (x, n) => `$${tx(x)} = ${n} \\times ${tx(Math.floor(x / n))} + ${tx(x % n)}$`;
/** The divisions of Euclid on (a ; b), as LaTeX equalities joined (at most three: B26). */
const divisionsOf = (a, b) =>
  euclid(a, b)
    .map((s) => `$${tx(s.a)} = ${tx(s.b)} \\times ${s.q} + ${tx(s.r)}$`)
    .join(', ');

// ───────────────────────────── « Vrai ou faux » ─────────────────────────────
/** [statement, truth, why, [two FALSE statements], key] — every verdict computed. */
const TF = {
  commun(rand) {
    let pair = null;
    while (!pair) pair = pairOf(rand, { g: int(rand, 3, 15), pMax: 8, max: 120 });
    const { a, b, g, p, q } = pair;
    const smaller = commonDivisors(a, b).filter((d) => d > 1 && d < g);
    const truth = !smaller.length || pick(rand, [true, false]);
    const d = truth ? g : pick(rand, smaller);
    return [
      `$${P(a, b)} = ${d}$`,
      truth,
      truth
        ? `les diviseurs communs de ${a} et ${b} sont ${listFr(commonDivisors(a, b))}, et le plus grand est ${g}.`
        : `${d} divise ${a} et ${b}, mais ${g} aussi : $${a} = ${g} \\times ${p}$ et $${b} = ${g} \\times ${q}$.`,
      [`$${a} = ${g} \\times ${p + 1}$`, `$${b} = ${g} \\times ${q + 1}$`],
      K.common,
    ];
  },
  lots(rand) {
    const S = pick(rand, SHARES);
    let pair = null;
    while (!pair) pair = pairOf(rand, { g: int(rand, 4, 12), pMax: 7, max: 100 });
    const { a, b, g } = pair;
    const others = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => n !== g && (a % n !== 0 || b % n !== 0));
    const truth = pick(rand, [true, false]) || !others.length;
    const n = truth
      ? pick(
          rand,
          commonDivisors(a, b).filter((x) => x > 1),
        )
      : pick(rand, others);
    const bad = a % n ? [a, S.x] : [b, S.y];
    return [
      `Avec ${counted(a, S.x)} et ${counted(b, S.y)}, on peut faire ${counted(n, S.lot)} identiques, sans qu’il reste rien`,
      truth,
      truth
        ? `$${a} = ${n} \\times ${a / n}$ et $${b} = ${n} \\times ${b / n}$ : ${n} divise les deux nombres.`
        : `${leaves(bad[0], n)} : il resterait ${counted(bad[0] % n, bad[1])}.`,
      [`$${a} = ${n} \\times ${Math.floor(a / n) + 1}$`, `$${b} = ${n} \\times ${Math.floor(b / n) + 1}$`],
      K.lots,
    ];
  },
  facteurs(rand) {
    for (let t = 0; t < 400; t += 1) {
      const [xs, ys] = [drawPowers(rand), drawPowers(rand)];
      const [A, B] = [valueOfPowers(xs), valueOfPowers(ys)];
      const common = commonPowers(xs, ys);
      if (xs.length < 2 || ys.length < 2 || !common.length || A % B === 0 || B % A === 0) continue;
      const largest = common.map(({ p }) => ({
        p,
        e: Math.max(xs.find((f) => f.p === p).e, ys.find((f) => f.p === p).e),
      }));
      const differ = common.find((f, i) => f.e !== largest[i].e);
      if (!differ) continue;
      const truth = pick(rand, [true, false]);
      const big = largest.find((f) => f.p === differ.p);
      const missesIn = xs.find((f) => f.p === big.p).e < big.e ? xs : ys;
      return [
        `$${P(powTex(xs), powTex(ys))} = ${powTex(truth ? common : largest)}$`,
        truth,
        truth
          ? `on garde les facteurs premiers communs, chacun avec le plus petit exposant : $${powTex(common)} = ${tx(valueOfPowers(common))}$.`
          : `$${big.p}^{${big.e}}$ ne divise pas $${powTex(missesIn)}$ : on garde le plus petit exposant, $${powTex(common)} = ${tx(valueOfPowers(common))}$.`,
        [`$${powTex(xs)} = ${tx(A + 1)}$`, `$${powTex(ys)} = ${tx(B + 1)}$`],
        K.factors,
      ];
    }
    throw new Error('trainer: no decompositions');
  },
  euclide(rand) {
    for (let t = 0; t < 400; t += 1) {
      const a = int(rand, 60, 300);
      const b = int(rand, 20, a - 1);
      const [q, r, g] = [Math.floor(a / b), a % b, gcd(a, b)];
      if (r === 0 || q < 2 || gcd(b, q) === g || RESERVED.has(a) || RESERVED.has(b)) continue;
      const truth = pick(rand, [true, false]);
      return [
        `$${P(a, b)} = ${P(b, truth ? r : q)}$`,
        truth,
        truth
          ? `$${a} = ${b} \\times ${q} + ${r}$, et le reste ${r} garde les diviseurs communs de ${a} et ${b}.`
          : `$${a} = ${b} \\times ${q} + ${r}$ : $${P(b, q)} = ${gcd(b, q)}$, alors que $${P(a, b)} = ${g}$.`,
        [`$${a} = ${b} \\times ${q} + ${r + 1}$`, `$${P(a, b)} = ${g + 1}$`],
        K.euclide,
      ];
    }
    throw new Error('trainer: no division');
  },
};

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « Vrai ou faux ? Justifie » — the truth AND its reason. Every verdict is computed. */
  tf(rand, format, flavour) {
    const [statement, truth, why, wrong, key] = TF[flavour](rand);
    return {
      format,
      kind: 'tf',
      key,
      flavour,
      statement: fr(statement),
      truth,
      why: fr(why),
      lies: wrong.map(fr),
      reasons:
        format === 'exam'
          ? shuffle(rand, [
              { t: fr(`Parce que ${why}`), ok: true },
              ...wrong.map((t) => ({ t: fr(`Parce que ${t}`), ok: false })),
            ])
          : null,
      prompt: fr(statement),
    };
  },

  /** exam (P1) — « Écris les diviseurs communs de a et b, puis leur PGCD » : six boxes, then the PGCD. */
  communs(rand) {
    for (let t = 0; t < 40; t += 1) {
      const pair = pairOf(rand, { g: pick(rand, SIX), pMax: 7, max: 400 });
      if (!pair) continue;
      const { a, b, g } = pair;
      return {
        format: 'exam',
        kind: 'communs',
        key: K.common,
        a,
        b,
        g,
        list: commonDivisors(a, b),
        prompt: fr(`Écris les diviseurs communs de ${a} et ${b}, puis leur PGCD.`),
        form: {
          tip: 'tipWrite',
          lines: [
            { tokens: [fr(`Les diviseurs communs de ${a} et ${b} :`)] },
            { ltr: true, tokens: [num('c0', 'diviseur'), ',', num('c1', 'diviseur'), ',', num('c2', 'diviseur')] },
            { ltr: true, tokens: [num('c3', 'diviseur'), ',', num('c4', 'diviseur'), ',', num('c5', 'diviseur')] },
            pgcdLine(a, b),
          ],
        },
      };
    }
    throw new Error('trainer: no pair');
  },

  /** exam (P4) — « Le plus de lots identiques, et ce que chaque lot contient » : three boxes, one a line. */
  lots(rand) {
    const S = pick(rand, SHARES);
    const [name, pronoun] = pick(rand, NAMES);
    for (let t = 0; t < 40; t += 1) {
      const pair = pairOf(rand, { g: int(rand, 4, 24), pMax: 9, max: 300 });
      if (!pair) continue;
      const { a, b, g } = pair;
      return {
        format: 'exam',
        kind: 'lots',
        key: K.lots,
        a,
        b,
        g,
        share: S,
        prompt: fr(
          `${name} a ${counted(a, S.x)} et ${counted(b, S.y)}. ${pronoun} veut tout répartir en ${S.lot[1]} identiques, sans qu’il reste rien. Combien de ${S.lot[1]} au plus ? Et que contient ${S.each} ?`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            { tokens: [fr(`Le plus grand nombre de ${S.lot[1]}`), '=', num('n', S.lot[1])] },
            { tokens: [fr(`${cap(S.x[1])} dans chaque ${S.lot[0]}`), '=', num('x', S.x[1])] },
            { tokens: [fr(`${cap(S.y[1])} dans chaque ${S.lot[0]}`), '=', num('y', S.y[1])] },
          ],
        },
      };
    }
    throw new Error('trainer: no sharing');
  },

  /** exam (P2) — « A et B sont décomposés : PGCD(A ; B) avec des puissances, puis sa valeur ». */
  facteurs(rand) {
    for (let t = 0; t < 800; t += 1) {
      const [xs, ys] = [drawPowers(rand), drawPowers(rand)];
      const [A, B] = [valueOfPowers(xs), valueOfPowers(ys)];
      const common = commonPowers(xs, ys);
      const g = valueOfPowers(common);
      if (xs.length < 2 || ys.length < 2 || common.length < 1 || common.length > 3 || g < 4) continue;
      if (A % B === 0 || B % A === 0 || A > 20000 || B > 20000 || RESERVED.has(A) || RESERVED.has(B)) continue;
      // at least one common prime seen with two different exponents: « the largest exponent » is then a wrong answer
      if (!common.some((f) => xs.find((x) => x.p === f.p).e !== ys.find((y) => y.p === f.p).e)) continue;
      return {
        format: 'exam',
        kind: 'facteurs',
        key: K.factors,
        a: g,
        A,
        B,
        xs,
        ys,
        common,
        primes: common.map((f) => f.p),
        prompt: fr(
          `On donne $A = ${powTex(xs)}$ et $B = ${powTex(ys)}$. Sans calculer $A$ ni $B$, écris $\\mathrm{PGCD}(A ; B)$ avec des puissances, puis donne sa valeur.`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            {
              ltr: true,
              tokens: [
                'PGCD(A ; B)',
                '=',
                ...common.flatMap((f, i) => [
                  ...(i ? ['×'] : []),
                  { pow: { base: String(f.p), exp: num(`e${f.p}`, `exposant de ${f.p}`, 2) } },
                ]),
              ],
            },
            { ltr: true, tokens: ['PGCD(A ; B)', '=', num('g', 'la valeur du PGCD', 4)] },
          ],
        },
      };
    }
    throw new Error('trainer: no decompositions');
  },

  /** exam (P3) — « Avec l’algorithme d’Euclide : la première division, puis le PGCD » (three divisions). */
  euclide(rand) {
    for (let t = 0; t < 800; t += 1) {
      const g = int(rand, 6, 40);
      const pair = pairOf(rand, { g, pMax: 60, max: 2500 });
      if (!pair || pair.a < 300 || euclid(pair.a, pair.b).length !== 3) continue;
      const { a, b } = pair;
      return {
        format: 'exam',
        kind: 'euclide',
        key: K.euclide,
        a,
        b,
        g,
        prompt: fr(
          `Calcule $${P(tx(a), tx(b))}$ avec l’algorithme d’Euclide : écris la première division, puis le PGCD.`,
        ),
        form: { tip: 'tipWrite', lines: [divisionLine(a, b), pgcdLine(nb(a), nb(b))] },
      };
    }
    throw new Error('trainer: no Euclid pair');
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const tap = (kind, key) => ['tap', kind, { key }];
const PLANS = {
  common: [
    tap('common', K.common),
    ['tf', 'commun'],
    ['communs'],
    tap('pgcd', K.common),
    ['tf', 'commun'],
    ['communs'],
  ],
  lots: [tap('lots', K.lots), ['tf', 'lots'], ['lots'], tap('lots', K.lots), ['tf', 'lots'], ['lots']],
  factors: [
    tap('pgcdPow', K.factors),
    ['tf', 'facteurs'],
    ['facteurs'],
    tap('pgcdPow', K.factors),
    ['tf', 'facteurs'],
    ['facteurs'],
  ],
  euclide: [
    tap('euclidRest', K.euclide),
    ['tf', 'euclide'],
    ['euclide'],
    tap('euclidLast', K.euclide),
    ['tf', 'euclide'],
    ['euclide'],
  ],
  mix: [tap('pgcd', K.common), ['tf', 'lots'], ['communs'], tap('euclidLast', K.euclide), ['facteurs'], ['euclide']],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  pgcd: 'mix',
  rappel: 'common',
  'diviseurs-communs': 'common',
  'erreur-difference': 'common',
  'exemple-90-54': 'common',
  lots: 'lots',
  'erreur-lots': 'lots',
  facteurs: 'factors',
  'erreur-exposant': 'factors',
  'exemple-facteurs': 'factors',
  euclide: 'euclide',
  'erreur-quotient': 'euclide',
  'exemple-euclide': 'euclide',
  choisir: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'communs':
      return { ...Object.fromEntries(q.list.map((d, i) => [SLOTS[i], d])), g: q.g };
    case 'lots':
      return { n: q.g, x: q.a / q.g, y: q.b / q.g };
    case 'facteurs':
      return { ...Object.fromEntries(q.common.map((f) => [`e${f.p}`, f.e])), g: q.a };
    case 'euclide': {
      const [first] = euclid(q.a, q.b);
      return { q: first.q, r: first.r, g: q.g };
    }
    default:
      return null;
  }
}

/** Why n is not PGCD(a ; b): it does not divide one of them, or it is a common divisor smaller than the PGCD. */
function pgcdHint(a, b, n) {
  if (!natural(n) || n < 1) return 'Écris un nombre entier qui divise les deux nombres.';
  if (a % n) return `${leaves(a, n)} : ${n} ne divise pas ${nb(a)}.`;
  if (b % n) return `${leaves(b, n)} : ${n} ne divise pas ${nb(b)}.`;
  return `${n} divise ${nb(a)} et ${nb(b)}, mais un diviseur commun plus grand existe.`;
}

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
  if (q.kind === 'tf') {
    const truthOk = v?.truth === q.truth;
    const reasonOk = !q.reasons || q.reasons[v?.reason]?.ok === true;
    return {
      ok: truthOk && reasonOk,
      hint: fr(
        !truthOk
          ? 'Vérifie par le calcul avant de juger : une division, ou les diviseurs de chaque nombre.'
          : 'Le verdict est le bon, mais cette raison ne le prouve pas : cherche le calcul qui le prouve.',
      ),
      fix: fr(`${q.truth ? 'Vrai' : 'Faux'}. ${cap(q.why)}`),
    };
  }
  const { a, b } = q;
  switch (q.kind) {
    case 'communs': {
      const fix = fr(
        `$${a} = ${q.g} \\times ${a / q.g}$ et $${b} = ${q.g} \\times ${b / q.g}$. Les diviseurs communs de ${a} et ${b} sont ${listFr(q.list)} : le plus grand est ${q.g}, donc $${P(a, b)} = ${q.g}$.`,
      );
      const xs = SLOTS.map((s) => box(v, s));
      const g = box(v, 'g');
      if (xs.some((x) => !natural(x) || x < 1) || !natural(g))
        return { ok: false, hint: fr('Remplis chaque case avec un nombre entier : un diviseur commun par case.'), fix };
      const stray = xs.find((d) => a % d !== 0 || b % d !== 0);
      if (stray != null) {
        const n = a % stray ? a : b;
        return { ok: false, hint: fr(`${leaves(n, stray)} : ${stray} ne divise pas ${nb(n)}.`), fix };
      }
      if (new Set(xs).size < xs.length) return { ok: false, hint: fr('Un même diviseur est écrit deux fois.'), fix };
      if (g !== q.g) return { ok: false, hint: fr(`Ton PGCD : ${pgcdHint(a, b, g)}`), fix };
      return { ok: true, fix };
    }
    case 'lots': {
      const S = q.share;
      const fix = fr(
        `$${P(a, b)} = ${q.g}$ : ${counted(q.g, S.lot)} au plus, car $${a} = ${q.g} \\times ${a / q.g}$ et $${b} = ${q.g} \\times ${b / q.g}$. Dans ${S.each} : ${counted(a / q.g, S.x)} et ${counted(b / q.g, S.y)}.`,
      );
      const [n, x, y] = ['n', 'x', 'y'].map((k) => box(v, k));
      if (![n, x, y].every(natural) || n < 1)
        return { ok: false, hint: fr('Remplis les trois cases avec des nombres entiers.'), fix };
      if (n !== q.g) {
        const hint =
          a % n
            ? `${leaves(a, n)} : il resterait ${counted(a % n, S.x)}.`
            : b % n
              ? `${leaves(b, n)} : il resterait ${counted(b % n, S.y)}.`
              : `${counted(n, S.lot)} identiques marchent, mais on peut en faire davantage.`;
        return { ok: false, hint: fr(hint), fix };
      }
      if (n * x !== a)
        return { ok: false, hint: fr(`$${n} \\times ${x} = ${n * x}$, et non ${a} : recompte les ${S.x[1]}.`), fix };
      if (n * y !== b)
        return { ok: false, hint: fr(`$${n} \\times ${y} = ${n * y}$, et non ${b} : recompte les ${S.y[1]}.`), fix };
      return { ok: true, fix };
    }
    case 'facteurs': {
      const fix = fr(
        `Les facteurs premiers communs à $A$ et $B$ sont ${listFr(q.primes)}, chacun avec son plus petit exposant : $${powTex(q.common)} = ${tx(q.a)}$.`,
      );
      const es = q.common.map((f) => box(v, `e${f.p}`));
      const g = box(v, 'g');
      if (es.some((e) => !natural(e)) || !natural(g))
        return { ok: false, hint: fr('Remplis chaque exposant, puis la valeur, avec des nombres entiers.'), fix };
      const at = q.common.findIndex((f, i) => es[i] !== f.e);
      if (at >= 0) {
        const { p, e } = q.common[at];
        const typed = es[at];
        const hint =
          typed === 0
            ? `Un exposant 0 voudrait dire que ${p} n’est pas un facteur commun, or ${p} est dans $A$ et dans $B$.`
            : typed > e
              ? `$${p}^{${typed}}$ ne divise pas les deux nombres : regarde l’exposant de ${p} dans $A$ et dans $B$.`
              : `Avec l’exposant ${typed}, il reste encore un facteur ${p} commun aux deux nombres.`;
        return { ok: false, hint: fr(hint), fix };
      }
      if (g !== q.a) return { ok: false, hint: fr(`Calcule $${powTex(q.common)}$ facteur par facteur.`), fix };
      return { ok: true, fix };
    }
    case 'euclide': {
      const fix = fr(
        `${divisionsOf(a, b)} : le dernier reste qui n’est pas 0 est ${q.g}, donc $${P(tx(a), tx(b))} = ${q.g}$.`,
      );
      const [qq, r, g] = ['q', 'r', 'g'].map((k) => box(v, k));
      if (![qq, r, g].every(natural))
        return { ok: false, hint: fr('Remplis toutes les cases : la division, puis le PGCD.'), fix };
      if (b * qq + r !== a)
        return {
          ok: false,
          hint: fr(`Vérifie : $${tx(b)} \\times ${qq} + ${tx(r)} = ${tx(b * qq + r)}$, et non ${nb(a)}.`),
          fix,
        };
      if (r >= b)
        return {
          ok: false,
          hint: fr(`Le reste ${nb(r)} n’est pas plus petit que ${nb(b)} : ${nb(b)} entre encore une fois.`),
          fix,
        };
      if (g !== q.g)
        return {
          ok: false,
          hint: fr(`Continue : divise ${nb(b)} par ${nb(r)}, et ainsi de suite jusqu’au reste 0. ${pgcdHint(a, b, g)}`),
          fix,
        };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  // a whole number typed is written back the French way (« 1 764 »); anything else as it was typed
  const x = (k) => (v?.[k] == null || v[k] === '' ? '…' : /^\d+$/.test(String(v[k]).trim()) ? nb(Number(v[k])) : v[k]);
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'Vrai' : 'Faux'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'communs':
      return fr(`diviseurs communs : ${SLOTS.map(x).join(', ')} — PGCD : ${x('g')}`);
    case 'lots':
      return fr(`${x('n')} ${q.share.lot[1]} — ${x('x')} et ${x('y')} dans ${q.share.each}`);
    case 'facteurs':
      return fr(
        `$\\mathrm{PGCD}(A ; B) = ${q.common.map((f) => `${f.p}^{${x(`e${f.p}`) === '…' ? '\\ldots' : x(`e${f.p}`)}}`).join(' \\times ')}$ — valeur : ${x('g')}`,
      );
    case 'euclide':
      return fr(`${nb(q.a)} = ${nb(q.b)} × ${x('q')} + ${x('r')} — PGCD : ${x('g')}`);
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
