/**
 * « Entraîne-toi » of lesson `decomposer-en-facteurs-premiers` — the CONTENT of its trainer (PURE). The frame — six
 * questions, two formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the
 * platform's TRAINER questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged: `check`
 * gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *
 *   exam formats: « Décompose n » (three boxes, a prime in each), « Écris n avec des puissances » (an exponent box raised
 *   after each printed prime), « Écris A ÷ d avec des puissances » (READING a decomposition as a tool — « What the bank
 *   showed », 1), « n est-il premier ? Jusqu’où essaies-tu ? », « Avec un tableur, décompose ce grand nombre », « Suis le
 *   programme » (its trace — « What the bank showed », 2), « Vrai ou faux ? Justifie ».
 * THE POWER IS TYPED IN ITS OWN SHAPE: each printed prime carries its exponent as a box RAISED after it, the kit's
 * token `{ pow: { base, exp } }` (`kit/Trainer.jsx › FormLines`, the forge's look) — one answer of its line.
 * Every reason offered to « Justifie » that is not the right one is a FALSE statement, and `trainer.test.js` computes each
 * one. A form line holds at most three boxes (defects.md B17); a correction chains at most three divisions (B26).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { K } from './story';
import { isRight, waveOf } from './practice';
import {
  NUMBERS,
  fr,
  isPrime,
  listFr,
  nb,
  powTex,
  powersOf,
  primeFactors,
  productTex,
  smallestPrime,
  stopOf,
  triedPrimes,
  tx,
  valueOfPowers,
} from './math';

/** The numbers the lesson's road, forges and mission show: a trainer draw never lands on one of them. */
export const RESERVED = new Set([
  ...NUMBERS.road.map((r) => r.a),
  ...NUMBERS.ladder.rounds,
  NUMBERS.ladder.use,
  NUMBERS.powers.use,
  ...NUMBERS.stop.rounds,
  NUMBERS.stop.use,
  ...NUMBERS.tool.rounds,
  504,
  ...NUMBERS.boss.options,
]);
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/** n = a product of `count` primes taken in `primes` (repetition allowed), min ≤ n ≤ max, not a reserved number. */
function productOf(rand, { count, primes, min, max }) {
  for (let t = 0; t < 800; t += 1) {
    const list = Array.from({ length: count }, () => pick(rand, primes)).sort((x, y) => x - y);
    const n = list.reduce((p, x) => p * x, 1);
    if (n >= min && n <= max && !RESERVED.has(n)) return { n, list };
  }
  throw new Error('trainer: no product');
}
/** A decomposition on 2, 3, 5, 7 with 2 or 3 primes and at least one power, min ≤ value ≤ max. */
function powersDraw(rand, { min, max, primes = 3 }) {
  for (let t = 0; t < 800; t += 1) {
    const chosen = shuffle(rand, [2, 3, 5, 7])
      .slice(0, int(rand, 2, primes))
      .sort((x, y) => x - y);
    const fs = chosen.map((p) => ({ p, e: int(rand, 1, p === 2 ? 5 : p === 3 ? 4 : 2) }));
    const v = valueOfPowers(fs);
    if (v >= min && v <= max && fs.some((f) => f.e >= 2) && !RESERVED.has(v)) return fs;
  }
  throw new Error('trainer: no decomposition');
}

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** « n = [ ] × [ ] × [ ] » — a prime in each box (the order he likes). */
const factorLine = (shown, count) => ({
  ltr: true,
  tokens: [
    shown,
    '=',
    ...Array.from({ length: count }, (_, i) => [
      ...(i ? ['×'] : []),
      num(`f${i + 1}`, `facteur premier ${i + 1}`),
    ]).flat(),
  ],
});
/**
 * « shown = 2^[ ] × 3^[ ] × 7^[ ] » — each prime printed, its exponent a box RAISED after it: the kit's power token
 * `{ pow: { base, exp } }` (`kit/Trainer.jsx › FormLines`), ONE answer of its line; the box takes two digits.
 */
const powerLine = (shown, primes) => ({
  ltr: true,
  tokens: [
    shown,
    '=',
    ...primes.flatMap((p, i) => [
      ...(i ? ['×'] : []),
      { pow: { base: String(p), exp: { ...num(`e${p}`, `exposant de ${p}`), w: 2 } } },
    ]),
  ],
});
const YES_NO = [
  { value: 'oui', text: 'oui' },
  { value: 'non', text: 'non' },
];

/** The boxes of a factor line, as numbers — a box left EMPTY (or blank) is no number. */
export const box = (v, k) => (v?.[k] == null || String(v[k]).trim() === '' ? NaN : Number(v[k]));
export const factorsTyped = (q, v) => Array.from({ length: q.count }, (_, i) => box(v, `f${i + 1}`));
/** The ladder of n by its smallest primes, as a chain of at most `most` divisions in LaTeX. */
const ladderTex = (n, most = 3) => {
  const steps = [];
  let m = n;
  for (const p of primeFactors(n)) {
    steps.push(`$${tx(m)} \\div ${p} = ${tx(m / p)}$`);
    m /= p;
  }
  return steps.length <= most ? steps.join(', ') : `${steps.slice(0, most - 1).join(', ')}… ${steps.at(-1)}`;
};
const same = (xs, ys) =>
  xs.length === ys.length && [...xs].sort((a, b) => a - b).join() === [...ys].sort((a, b) => a - b).join();

/** The program of key 4, as one sentence of French blocks. */
const PROGRAM =
  'Le programme : d prend la valeur 2 ; tant que $d \\times d \\leqslant N$, si d divise N, il note d et N prend la valeur $N \\div d$, sinon d augmente de 1 ; à la fin, si $N > 1$, il note N.';
/** What the program does on N: the first number noted, the value of N right after, the value of d when the loop stops. */
export function traceOf(N) {
  let n = N;
  let d = 2;
  const noted = [];
  let after = null;
  while (d * d <= n) {
    if (n % d === 0) {
      noted.push(d);
      n /= d;
      if (after == null) after = n;
    } else d += 1;
  }
  if (n > 1) noted.push(n);
  return { first: noted[0], after: after ?? 1, stop: d, noted };
}

// ───────────────────────────── « Vrai ou faux » ─────────────────────────────
/** Two statements that are FALSE, offered as wrong reasons: an equality off by one, a composite said prime. */
const lies = (a, composite) => {
  const p = smallestPrime(a);
  return [`$${tx(a)} = ${p} \\times ${tx(a / p + 1)}$`, `${composite} est un nombre premier`];
};
const TF = {
  ladder(rand) {
    const { n, list } = productOf(rand, { count: 3, primes: [2, 3, 5, 7, 11, 13], min: 40, max: 400 });
    const c = list[0] * list[1];
    const truth = pick(rand, [true, false]);
    return truth
      ? [
          `$${tx(n)} = ${productTex(list)}$ est une décomposition en facteurs premiers`,
          true,
          `${listFr(list)} sont des nombres premiers, et leur produit vaut ${nb(n)}.`,
          lies(n, c),
          K.ladder,
        ]
      : [
          `$${tx(n)} = ${c} \\times ${list[2]}$ est une décomposition en facteurs premiers`,
          false,
          `$${c} = ${list[0]} \\times ${list[1]}$ n’est pas premier : $${tx(n)} = ${productTex(list)}$.`,
          lies(n, c),
          K.ladder,
        ];
  },
  powers(rand) {
    const fs = powersDraw(rand, { min: 12, max: 400 });
    const v = valueOfPowers(fs);
    const big = fs.find((f) => f.e >= 2);
    const misread = valueOfPowers(fs.map((f) => (f === big ? { p: f.p * f.e, e: 1 } : f)));
    const list = fs.flatMap((f) => Array(f.e).fill(f.p));
    const truth = misread === v || pick(rand, [true, false]);
    // the first wrong reason reads the exponent as a factor - false unless p^e = p x e (2 squared): then another lie
    const readAsFactor =
      big.p ** big.e !== big.p * big.e ? `$${big.p}^{${big.e}} = ${big.p * big.e}$` : lies(v, 2 * v)[0];
    return [
      `$${powTex(fs)} = ${truth ? v : misread}$`,
      truth,
      truth
        ? `$${productTex(list)} = ${v}$.`
        : `$${big.p}^{${big.e}}$ vaut $${productTex(Array(big.e).fill(big.p))} = ${big.p ** big.e}$, et non $${big.p} \\times ${big.e}$ : le produit vaut ${v}.`,
      [readAsFactor, `${2 * v} est un nombre premier`],
      K.powers,
    ];
  },
  /** READING a decomposition: does d divide A? (« the same primes are there, so it divides » is the false one.) */
  read(rand) {
    const fs = powersDraw(rand, { min: 100, max: 5000, primes: 3 });
    const truth = pick(rand, [true, false]);
    // a divisor: each exponent at most A's; a non-divisor: the same primes, one exponent one too many
    const ds = truth
      ? fs.map((f, i) => ({ p: f.p, e: i === 0 ? Math.max(1, f.e - 1) : int(rand, 0, f.e) })).filter((f) => f.e > 0)
      : fs.map((f, i) => ({ p: f.p, e: i === fs.length - 1 ? f.e + 1 : int(rand, 0, f.e) })).filter((f) => f.e > 0);
    const d = valueOfPowers(ds);
    const high = ds.find((g) => g.e > fs.find((f) => f.p === g.p).e);
    const statement = `${nb(d)} divise $${powTex(fs)}$`;
    const why = truth
      ? `$${tx(d)} = ${powTex(ds)}$ : chaque exposant de ${nb(d)} ne dépasse pas celui de $${powTex(fs)}$.`
      : `$${tx(d)} = ${powTex(ds)}$ : il faudrait ${high.p} au moins ${high.e} fois, et $${powTex(fs)}$ ne l’a que ${high.e - 1} fois.`;
    return [statement, truth, why, lies(d, 2 * d), K.powers];
  },
  stop(rand) {
    for (let t = 0; t < 400; t += 1) {
      const n = int(rand, 50, 250);
      if (RESERVED.has(n)) continue;
      const primes = triedPrimes(n);
      if (isPrime(n) && pick(rand, [true, false]))
        return [
          `Pour savoir si ${n} est premier, il suffit d’essayer les divisions par ${listFr(primes)}`,
          true,
          `$${primes.at(-1)} \\times ${primes.at(-1)} = ${primes.at(-1) ** 2}$ ne dépasse pas ${n} ; le nombre premier suivant a un carré qui le dépasse.`,
          lies(n, 2 * n),
          K.stop,
        ];
      const f = primeFactors(n);
      if (f.length === 2 && f[0] >= 7)
        return [
          `${n} est un nombre premier`,
          false,
          `$${n} = ${f[0]} \\times ${f[1]}$ : ${f[0]} divise ${n}, et $${f[0]} \\times ${f[0]} = ${f[0] ** 2}$ ne dépasse pas ${n}.`,
          lies(n, n),
          K.stop,
        ];
    }
    throw new Error('trainer: no stop statement');
  },
  tool(rand) {
    const { n, list } = productOf(rand, { count: 3, primes: [7, 11, 13, 17, 19, 23, 29, 31], min: 1000, max: 9999 });
    if (pick(rand, [true, false]))
      return [
        `Si la cellule $\\texttt{=MOD(${n};${list[1]})}$ affiche 0, alors ${list[1]} divise ${nb(n)}`,
        true,
        `Le reste de la division de ${nb(n)} par ${list[1]} est 0 : $${tx(n)} = ${list[1]} \\times ${tx(n / list[1])}$.`,
        lies(n, list[0] * list[1]),
        K.tool,
      ];
    return [
      `${nb(n)} se termine par ${n % 10} : c’est donc un nombre premier`,
      false,
      `$${tx(n)} = ${productTex(list)}$ : le dernier chiffre ne dit pas si un nombre est premier.`,
      lies(n, list[0] * list[1]),
      K.tool,
    ];
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

  /** exam (P1) — « Décompose n en produit de facteurs premiers » : n has three prime factors, one in each box. */
  decompose(rand) {
    const { n, list } = productOf(rand, { count: 3, primes: [2, 3, 5, 7, 11, 13, 17, 19], min: 60, max: 600 });
    return {
      format: 'exam',
      kind: 'decompose',
      key: K.ladder,
      a: n,
      count: 3,
      list,
      prompt: fr(`Décompose ${nb(n)} en produit de facteurs premiers : divise par 2, 3, 5, 7… dans l’ordre.`),
      form: { tip: 'tipWrite', lines: [factorLine(nb(n), 3)] },
    };
  },

  /** exam (P2) — « Écris n en produit de facteurs premiers, avec des puissances » : the primes printed, the exponents typed. */
  powers(rand) {
    const fs = powersDraw(rand, { min: 100, max: 3000 });
    const n = valueOfPowers(fs);
    const primes = fs.map((f) => f.p);
    return {
      format: 'exam',
      kind: 'powers',
      key: K.powers,
      a: n,
      primes,
      prompt: fr(
        `Écris ${nb(n)} en produit de facteurs premiers, avec des puissances : complète l’exposant de chaque facteur.`,
      ),
      form: { tip: 'tipWrite', lines: [powerLine(nb(n), primes)] },
    };
  },

  /** exam (P2) — READING a decomposition: « A = … et d = … : écris A ÷ d avec des puissances ». */
  quotient(rand) {
    for (let t = 0; t < 400; t += 1) {
      const fs = powersDraw(rand, { min: 200, max: 20000, primes: 3 });
      if (fs.length < 2 || fs.every((f) => f.e < 2)) continue;
      const ds = fs.map((f) => ({ p: f.p, e: int(rand, 0, f.e - 1) })).filter((f) => f.e > 0);
      if (!ds.length) continue;
      const A = valueOfPowers(fs);
      const d = valueOfPowers(ds);
      if (d < 4 || RESERVED.has(A / d)) continue;
      const qs = fs.map((f) => ({ p: f.p, e: f.e - (ds.find((g) => g.p === f.p)?.e ?? 0) }));
      return {
        format: 'exam',
        kind: 'quotient',
        key: K.powers,
        a: A / d,
        A,
        d,
        fs,
        ds,
        qs,
        primes: qs.map((f) => f.p),
        prompt: fr(
          `On donne $A = ${powTex(fs)}$ et $d = ${powTex(ds)}$. Sans calculer A, écris le quotient $A \\div d$ en produit de facteurs premiers, avec des puissances.`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            powerLine(
              'A ÷ d',
              qs.map((f) => f.p),
            ),
          ],
        },
      };
    }
    throw new Error('trainer: no quotient');
  },

  /** exam (P1) — « n est-il premier ? » : how far the divisions go, then the verdict. */
  prime(rand) {
    for (let t = 0; t < 400; t += 1) {
      const n = int(rand, 101, 399);
      if (RESERVED.has(n) || n % 2 === 0 || n % 3 === 0 || n % 5 === 0) continue;
      const f = primeFactors(n);
      if (!isPrime(n) && !(f.length === 2 && f[0] >= 7)) continue;
      return {
        format: 'exam',
        kind: 'prime',
        key: K.stop,
        a: n,
        prompt: fr(`Le nombre ${n} est-il premier ? Écris jusqu’à quel nombre tu essaies les divisions, puis réponds.`),
        form: {
          tip: 'tipWrite',
          lines: [
            { tokens: ['On essaie les divisions au plus jusqu’à', num('d', 'le dernier nombre à essayer')] },
            { tokens: [fr(`${n} est premier :`), { choice: 'says', options: YES_NO }] },
          ],
        },
      };
    }
    throw new Error('trainer: no prime question');
  },

  /** exam (P3) — « Avec un tableur ou une calculatrice, décompose ce grand nombre » : two or three large primes. */
  big(rand) {
    const count = pick(rand, [2, 3]);
    const { n, list } =
      count === 2
        ? productOf(rand, { count: 2, primes: PRIMES.filter((p) => p >= 23), min: 1000, max: 9999 })
        : productOf(rand, { count: 3, primes: [7, 11, 13, 17, 19, 23, 29, 31], min: 1000, max: 9999 });
    return {
      format: 'exam',
      kind: 'big',
      key: K.tool,
      a: n,
      count,
      list,
      prompt: fr(`Avec un tableur ou une calculatrice, décompose ${nb(n)} en produit de facteurs premiers.`),
      form: { tip: 'tipWrite', lines: [factorLine(nb(n), count)] },
    };
  },

  /** exam (P3) — the trace of the program that tests the divisors (not evidence: no claim kind states a trace). */
  trace(rand) {
    const { n } = productOf(rand, { count: 3, primes: [2, 3, 5, 7, 11], min: 30, max: 200 });
    const tr = traceOf(n);
    return {
      format: 'exam',
      kind: 'trace',
      key: K.tool,
      a: n,
      trace: tr,
      prompt: fr(`${PROGRAM} On le lance avec $N = ${n}$.`),
      form: {
        tip: 'tipWrite',
        lines: [
          { tokens: ['Le premier nombre noté :', num('first', 'le premier nombre noté')] },
          { tokens: ['La valeur de N juste après :', num('after', 'la valeur de N')] },
          { tokens: ['La valeur de d quand la boucle s’arrête :', num('stop', 'la valeur de d')] },
        ].map((l) => ({ tokens: l.tokens.map((x) => (typeof x === 'string' ? fr(x) : x)) })),
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const tap = (kind, key) => ['tap', kind, { key }];
const PLANS = {
  ladder: [
    tap('smallestPrime', K.ladder),
    ['tf', 'ladder'],
    ['decompose'],
    tap('missingFactor', K.ladder),
    ['tf', 'ladder'],
    ['decompose'],
  ],
  // from the third slot on, the reading of a decomposition as a tool
  powers: [
    tap('powerValue', K.powers),
    ['tf', 'powers'],
    ['quotient'],
    tap('divisorOfPow', K.powers),
    ['tf', 'read'],
    ['powers'],
  ],
  stop: [tap('lastPrime', K.stop), ['tf', 'stop'], ['prime'], tap('divisorOfPow', K.powers), ['tf', 'read'], ['prime']],
  tool: [tap('modCell', K.tool), ['tf', 'tool'], ['big'], tap('programStop', K.tool), ['trace'], ['big']],
  mix: [tap('smallestPrime', K.ladder), ['tf', 'read'], ['decompose'], tap('lastPrime', K.stop), ['powers'], ['big']],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  'nombre-premier': 'mix',
  rappel: 'ladder',
  echelle: 'ladder',
  'erreur-compose': 'ladder',
  'exemple-72': 'ladder',
  puissances: 'powers',
  'erreur-exposant': 'powers',
  lire: 'powers',
  'erreur-memes': 'powers',
  arret: 'stop',
  'erreur-91': 'stop',
  'exemple-97': 'stop',
  tableur: 'tool',
  programme: 'tool',
  synthese: 'mix',
};

/** The exponents of a decomposition question, as the answer writes them. */
export const exponentsOf = (q) => (q.kind === 'quotient' ? q.qs : powersOf(q.a));

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'decompose':
    case 'big':
      return Object.fromEntries(q.list.map((p, i) => [`f${i + 1}`, p]));
    case 'powers':
    case 'quotient':
      return Object.fromEntries(exponentsOf(q).map((f) => [`e${f.p}`, f.e]));
    case 'prime':
      return { d: stopOf(q.a), says: isPrime(q.a) ? 'oui' : 'non' };
    case 'trace':
      return { first: q.trace.first, after: q.trace.after, stop: q.trace.stop };
    default:
      return null;
  }
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
          ? 'Vérifie par le calcul avant de juger : décompose, ou essaie les divisions.'
          : 'Le verdict est le bon, mais cette raison ne le prouve pas : cherche le calcul qui le prouve.',
      ),
      fix: fr(`${q.truth ? 'Vrai' : 'Faux'}. ${q.why}`),
    };
  }
  const n = q.a;
  switch (q.kind) {
    case 'decompose':
    case 'big': {
      const fix = fr(
        q.kind === 'decompose'
          ? `${ladderTex(n)} : donc $${tx(n)} = ${productTex(q.list)}$.`
          : `Le tableur montre le reste 0 pour ${listFr([...new Set(q.list)])} : $${tx(n)} = ${productTex(q.list)}$.`,
      );
      const xs = factorsTyped(q, v);
      if (xs.some((x) => !Number.isInteger(x) || x < 0))
        return { ok: false, hint: fr('Remplis chaque case avec un nombre entier : un facteur premier par case.'), fix };
      const bad = xs.find((x) => !isPrime(x));
      if (bad != null)
        return {
          ok: false,
          hint: fr(
            bad < 2
              ? `${bad} n’est pas un nombre premier : un nombre premier a exactement deux diviseurs.`
              : `${nb(bad)} n’est pas un nombre premier : casse-le encore.`,
          ),
          fix,
        };
      const prod = xs.reduce((p, x) => p * x, 1);
      if (prod !== n)
        return {
          ok: false,
          hint: fr(`Ton produit vaut ${nb(prod)}, et non ${nb(n)} : reprends les divisions une par une.`),
          fix,
        };
      return { ok: same(xs, q.list), fix };
    }
    case 'powers':
    case 'quotient': {
      const right = exponentsOf(q);
      const shown = q.kind === 'quotient' ? '$A \\div d$' : nb(n);
      const fix = fr(
        q.kind === 'quotient'
          ? `On retire de A les facteurs de d : $A \\div d = ${powTex(right)} = ${tx(q.a)}$.`
          : `$${tx(n)} = ${productTex(right.flatMap((f) => Array(f.e).fill(f.p)))}$, donc $${tx(n)} = ${powTex(right)}$.`,
      );
      const es = right.map((f) => box(v, `e${f.p}`));
      if (es.some((e) => !Number.isInteger(e) || e < 0))
        return { ok: false, hint: fr('Remplis chaque exposant avec un nombre entier.'), fix };
      const at = right.findIndex((f, i) => es[i] !== f.e);
      if (at < 0) return { ok: true, fix };
      const { p, e } = right[at];
      const typed = es[at];
      const hint =
        typed === 0
          ? `Un exposant 0 voudrait dire que ${p} n’est pas un facteur de ${shown}, or ${p} en est un.`
          : typed < e
            ? `Avec l’exposant ${typed}, il reste encore un facteur ${p} : recompte combien de fois ${p} revient.`
            : `Avec l’exposant ${typed}, il y a un facteur ${p} de trop : recompte combien de fois ${p} revient.`;
      return { ok: false, hint: fr(hint), fix };
    }
    case 'prime': {
      const s = stopOf(n);
      const prime = isPrime(n);
      const p = prime ? null : smallestPrime(n);
      const fix = fr(
        prime
          ? `$${s} \\times ${s} = ${s * s}$ ne dépasse pas ${n}, $${s + 1} \\times ${s + 1} = ${(s + 1) ** 2}$ le dépasse : on essaie ${listFr(triedPrimes(n))}, aucun ne divise ${n}, donc ${n} est premier.`
          : `$${s} \\times ${s} = ${s * s}$ ne dépasse pas ${n}, $${s + 1} \\times ${s + 1} = ${(s + 1) ** 2}$ le dépasse, et $${n} = ${p} \\times ${n / p}$ : ${n} n’est pas premier.`,
      );
      const d = box(v, 'd');
      if (!Number.isInteger(d) || d < 0 || (v?.says !== 'oui' && v?.says !== 'non'))
        return { ok: false, hint: fr('Écris le dernier nombre à essayer, et choisis oui ou non.'), fix };
      if (d !== s)
        return {
          ok: false,
          hint: fr(
            d * d > n
              ? `$${d} \\times ${d} = ${d * d}$ dépasse ${n} : on peut s’arrêter avant.`
              : `$${d + 1} \\times ${d + 1} = ${(d + 1) ** 2}$ ne dépasse pas encore ${n} : il faut aller plus loin.`,
          ),
          fix,
        };
      if ((v.says === 'oui') !== prime)
        return {
          ok: false,
          hint: fr(`Essaie vraiment les divisions par ${listFr(triedPrimes(n))} : regarde si l’une tombe juste.`),
          fix,
        };
      return { ok: true, fix };
    }
    case 'trace': {
      const tr = q.trace;
      const fix = fr(
        `d = 2, 3… : le premier diviseur trouvé est ${tr.first}, alors $N = ${n} \\div ${tr.first} = ${tr.after}$. Le programme note ${listFr(tr.noted)}, et la boucle s’arrête quand $${tr.stop} \\times ${tr.stop} = ${tr.stop ** 2}$ dépasse N.`,
      );
      const xs = ['first', 'after', 'stop'].map((k) => box(v, k));
      if (xs.some((x) => !Number.isInteger(x) || x < 0))
        return { ok: false, hint: fr('Remplis les trois cases en suivant le programme ligne par ligne.'), fix };
      if (xs[0] !== tr.first)
        return {
          ok: false,
          hint: fr(`Le programme commence à d = 2 et augmente d de 1 tant que d ne divise pas ${n}.`),
          fix,
        };
      if (xs[1] !== tr.after)
        return { ok: false, hint: fr(`Après la première division, N prend la valeur $${n} \\div ${tr.first}$.`), fix };
      if (xs[2] !== tr.stop)
        return {
          ok: false,
          hint: fr('La boucle continue tant que d × d ne dépasse pas la valeur de N du moment.'),
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
  const x = (k) => (v?.[k] == null || v[k] === '' ? '…' : v[k]);
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'Vrai' : 'Faux'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'decompose':
    case 'big':
      return `${nb(q.a)} = ${Array.from({ length: q.count }, (_, i) => x(`f${i + 1}`)).join(' × ')}`;
    case 'powers':
    case 'quotient':
      return `$${q.kind === 'quotient' ? 'A \\div d' : tx(q.a)} = ${exponentsOf(q)
        .map((f) => `${f.p}^{${x(`e${f.p}`) === '…' ? '\\ldots' : x(`e${f.p}`)}}`)
        .join(' \\times ')}$`;
    case 'prime':
      return fr(`jusqu’à ${x('d')} — ${q.a} est premier : ${x('says')}`);
    case 'trace':
      return fr(`noté d’abord : ${x('first')} — N ensuite : ${x('after')} — d à la fin : ${x('stop')}`);
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
