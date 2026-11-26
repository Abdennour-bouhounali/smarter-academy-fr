/**
 * « Entraîne-toi » of lesson `multiples-et-diviseurs-communs` — the CONTENT of its trainer (PURE). The frame — six questions,
 * two formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's
 * TRAINER questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`). Here:
 * the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged: `check` gives
 * first a HINT that says what the answer produces (never the answer), then the written correction.
 *
 *   exam formats (what the bank asks of P1, P2, P3):
 *     pilier       K1 · « le premier pilier où deux équipes finissent pile, et les planches de chacune »
 *     facteurs     K2 · « deux (ou trois) nombres décomposés : le plus petit multiple commun avec des puissances, puis sa valeur »
 *     rendezvous   K3 · « deux roues dentées : les dents passées, les tours de chacune »
 *     horaire      K3 · « deux lignes de bus : au bout de combien de minutes, à quelle heure »
 *     fenetre      K3 · « combien de fois ensemble pendant une durée »
 *     jours        K4 · « des équipes qui travaillent 1 jour puis se reposent : le motif, le jour »
 *     outil        K3 · « le même couple, deux situations : couper ou faire coïncider »
 *     budget       K1 · « un budget de passerelle : la longueur d’un tronçon, les tronçons payés »
 *     tf           « Vrai ou faux ? Justifie » (the five flavours)
 *   « plus petit multiple commun » is written in full, the abbreviation never (open question 2, decided by default).
 * Every reason offered to « Justifie » that is not the right one is a FALSE equality, and `trainer.test.js` computes each
 * one. A form line holds at most three answers (defects.md B17); a correction chains at most three equalities (B26).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { K } from './story';
import { isRight, waveOf } from './practice';
import {
  NUMBERS,
  PLANKS,
  counted,
  fr,
  gcd,
  lcm,
  lcmOf,
  lcmPowers,
  listFr,
  nb,
  ordinal,
  powTex,
  togetherDay,
  tx,
  valueOfPowers,
} from './math';

const { pillar: PI, factors: FC, story: ST, days: DY, mission: MI } = NUMBERS;
const TURNS = ['tour', 'tours'];
const DAYS = ['jour', 'jours'];
const SECTIONS = ['tronçon', 'tronçons'];

/**
 * The numbers the lesson's road, forges, dash and mission show: a trainer draw never lands on one of them (a number under
 * 10 is no landmark of the road: the road's small numbers are its crews' and its teams').
 */
export const RESERVED = new Set([
  ...PI.crews,
  ...PI.use,
  lcm(...PI.crews),
  lcm(...PI.use),
  ...FC.crews,
  lcm(...FC.crews),
  ...FC.mirror,
  lcm(...FC.mirror),
  ...FC.use.map(valueOfPowers),
  lcm(...FC.use.map(valueOfPowers)),
  ...FC.coprime.map(valueOfPowers),
  valueOfPowers(FC.coprime.flat()),
  ...ST.gears,
  lcm(...ST.gears),
  ...ST.bus.every,
  lcm(...ST.bus.every),
  lcmOf(DY.sleeps.map((s) => s + 1)),
  togetherDay(DY.sleeps.map((s) => s + 1)),
  ...DY.trio.map((s) => s + 1),
  lcmOf(DY.trio.map((s) => s + 1)),
  togetherDay(DY.trio.map((s) => s + 1)),
  ...MI.rests.map((r) => r + 1),
  lcmOf(MI.rests.map((r) => r + 1)),
  togetherDay(MI.rests.map((r) => r + 1)),
  // the gate dash of the story
  4,
  34,
  68,
  24,
  92,
  552,
  26,
  442,
  19,
  37,
  703,
]);
const fresh = (x) => x < 10 || !RESERVED.has(x);

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/**
 * Two numbers lo … hi, neither dividing the other, whose smallest common multiple stays at most `max`: `coprime` true
 * (no prime in common: the product), false (a common divisor ≥ 2), null (either).
 */
function pairOf(rand, { lo = 6, hi = 40, max = 400, coprime = null } = {}) {
  for (let t = 0; t < 2000; t += 1) {
    const a = int(rand, lo, hi);
    const b = int(rand, lo, hi);
    if (a === b || a % b === 0 || b % a === 0) continue;
    const g = gcd(a, b);
    if (coprime === true && g !== 1) continue;
    if (coprime === false && g === 1) continue;
    const m = lcm(a, b);
    if (m > max || ![a, b, m].every(fresh)) continue;
    return { a, b, g, m };
  }
  throw new Error('trainer: no pair');
}
/** The primes a decomposition is drawn on, and the largest exponent of each. */
const MAX_E = { 2: 3, 3: 2, 5: 2, 7: 1 };
const THREES = [
  [2, 3, 5],
  [2, 3, 7],
  [2, 5, 7],
  [3, 5, 7],
];
/** Two (or three) decomposed numbers on at most three primes: none divides another, one prime has two exponents. */
function factorsOf(rand, { count }) {
  for (let t = 0; t < 3000; t += 1) {
    const primes = pick(rand, THREES);
    const xs = Array.from({ length: count }, () =>
      primes.map((p) => ({ p, e: int(rand, 0, MAX_E[p]) })).filter((f) => f.e > 0),
    );
    if (xs.some((fs) => fs.length < 2)) continue;
    const values = xs.map(valueOfPowers);
    if (new Set(values).size < count || values.some((v) => v > 2000 || !fresh(v))) continue;
    if (values.some((v, i) => values.some((w, j) => i !== j && w % v === 0))) continue;
    const big = lcmPowers(...xs);
    const m = valueOfPowers(big);
    if (m > (count === 3 ? 5000 : 20000) || !fresh(m) || big.length > 3) continue;
    // one prime seen with two different exponents: « the smaller exponent » is then a wrong answer
    if (!big.some(({ p, e }) => xs.some((fs) => (fs.find((f) => f.p === p)?.e ?? 0) !== e))) continue;
    return { xs, values, big, m };
  }
  throw new Error('trainer: no decompositions');
}
/** The teams of a calendar: their rests, cycles and the smallest common multiple. */
function teamsOf(rand, count) {
  for (let t = 0; t < 3000; t += 1) {
    const rests = Array.from({ length: count }, () => int(rand, 2, 11));
    const cycles = rests.map((r) => r + 1);
    if (new Set(cycles).size < count) continue;
    if (cycles.some((c, i) => cycles.some((d, j) => i !== j && d % c === 0))) continue;
    const m = lcmOf(cycles);
    if (m > 300 || !fresh(m) || !cycles.every(fresh)) continue;
    return { rests, cycles, m };
  }
  throw new Error('trainer: no teams');
}
const NAMES = ['A', 'B', 'C'];
const nameOf = (i) => `l’équipe ${NAMES[i]}`;
/** The words of a hand-drawn clock: « 6 h 10 », « 8 h ». */
const clock = (h, m) => (m ? `${h} h ${m}` : `${h} h`);

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label, w) => ({ num: name, label, ...(w ? { w } : {}) });
/** One line of a form: a printed label, « = », its box, then a unit. */
const row = (label, box, unit) => ({ tokens: [fr(label), '=', box, ...(unit ? [unit] : [])] });

/** The boxes of an answer, as numbers — a box left EMPTY (or blank) is no number. */
export const box = (v, k) => (v?.[k] == null || String(v[k]).trim() === '' ? NaN : Number(v[k]));
const natural = (x) => Number.isInteger(x) && x >= 0;
/** « $x = n × q + r$ » — the division of x by n. */
const leaves = (x, n) => `$${tx(x)} = ${n} \\times ${tx(Math.floor(x / n))} + ${x % n}$`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ───────────────────────────── « Vrai ou faux » ─────────────────────────────
/** [statement, truth, why, [two FALSE equalities], key] — every verdict computed. */
const TF = {
  /** « n est un multiple commun de a et de b » */
  pilier(rand) {
    const { a, b, m } = pairOf(rand, { lo: 4, hi: 25, max: 300 });
    const truth = pick(rand, [true, false]);
    const [x, y] = pick(rand, [
      [a, b],
      [b, a],
    ]);
    let n = m * int(rand, 1, 3);
    if (!truth) {
      do n = x * int(rand, 2, 9);
      while (n % y === 0 || n % x !== 0);
    }
    return [
      `${nb(n)} est un multiple commun de ${a} et de ${b}`,
      truth,
      truth
        ? `$${tx(n)} = ${a} \\times ${tx(n / a)}$ et $${tx(n)} = ${b} \\times ${tx(n / b)}$.`
        : `${leaves(n, y)} : ${nb(n)} n’est pas un multiple de ${y}.`,
      [
        `$${tx(n)} = ${a} \\times ${tx(Math.floor(n / a) + 1)}$`,
        `$${tx(n)} = ${b} \\times ${tx(Math.floor(n / b) + 1)}$`,
      ],
      K.pilier,
    ];
  },
  /** « le plus petit multiple commun de A et de B est … » */
  facteurs(rand) {
    const { xs, values, big, m } = factorsOf(rand, { count: 2 });
    const truth = pick(rand, [true, false]);
    // a wrong one: every prime with the exponent 1 (the smaller one), which a decomposition does not contain
    const small = big.map(({ p }) => ({ p, e: 1 }));
    const shown = truth || valueOfPowers(small) === m ? big : small;
    const ok = shown === big;
    const S = valueOfPowers(shown);
    const [V, i] = values.map((v, k) => [v, k]).find(([v]) => S % v !== 0) ?? [null, 0];
    return [
      `Le plus petit multiple commun non nul de $A = ${powTex(xs[0])}$ et de $B = ${powTex(xs[1])}$ est $${powTex(shown)}$`,
      ok,
      ok
        ? `chaque facteur premier est pris avec son plus grand exposant : $${powTex(big)} = ${tx(m)}$.`
        : `$${tx(S)} = ${tx(V)} \\times ${tx(Math.floor(S / V))} + ${S % V}$ : ${nb(S)} n’est pas un multiple de ${nb(V)}, la valeur de $${'AB'[i]}$.`,
      [`$${powTex(xs[0])} = ${tx(values[0] + 1)}$`, `$${powTex(xs[1])} = ${tx(values[1] + 1)}$`],
      K.facteurs,
    ];
  },
  /** « les marques se retrouvent après n dents » */
  rendez(rand) {
    const { a, b, m } = pairOf(rand, { lo: 8, hi: 40, max: 400, coprime: false });
    const truth = pick(rand, [true, false]);
    const n = truth ? m : a * b;
    return [
      `Deux roues de ${a} et de ${b} dents : les marques se retrouvent face à face pour la première fois après ${nb(n)} dents`,
      truth,
      truth
        ? `$${tx(m)} = ${a} \\times ${m / a} = ${b} \\times ${m / b}$ : aucun retour avant.`
        : `$${tx(a * b)} = ${a} \\times ${b}$ est bien un retour des marques, mais $${tx(m)} = ${a} \\times ${m / a} = ${b} \\times ${m / b}$ en est un plus tôt.`,
      [`$${tx(m)} = ${a} \\times ${m / a + 1}$`, `$${tx(m)} = ${b} \\times ${m / b + 1}$`],
      K.rendezvous,
    ];
  },
  /** « elles travaillent ensemble le jour n » */
  jours(rand) {
    const { rests, cycles, m } = teamsOf(rand, 2);
    const truth = pick(rand, [true, false]);
    const n = truth ? 1 + m : m;
    const [c1, c2] = cycles;
    return [
      `Une équipe travaille 1 jour puis se repose ${counted(rests[0], DAYS)}, une autre 1 jour puis se repose ${counted(rests[1], DAYS)} : elles travaillent toutes deux le jour 1 et de nouveau ensemble le jour ${n}`,
      truth,
      truth
        ? `les cycles sont ${c1} et ${c2} jours : $${m} = ${c1} \\times ${m / c1} = ${c2} \\times ${m / c2}$, donc le jour $1 + ${m} = ${1 + m}$.`
        : `$${m - 1} = ${c1} \\times ${Math.floor((m - 1) / c1)} + ${(m - 1) % c1}$ : le jour ${m}, la première équipe se repose encore.`,
      [`$${m} = ${c1} \\times ${m / c1 + 1}$`, `$${m} = ${c2} \\times ${m / c2 + 1}$`],
      K.equipes,
    ];
  },
  /** « pour couper …, on cherche le plus grand diviseur commun » / « pour faire coïncider …, le plus petit multiple commun » */
  outil(rand) {
    const { a, b, g, m } = pairOf(rand, { lo: 12, hi: 60, max: 600, coprime: false });
    const rods = pick(rand, [true, false]);
    const truth = pick(rand, [true, false]);
    const tool = (divisor) => (divisor ? 'leur plus grand diviseur commun' : 'leur plus petit multiple commun');
    const asked = rods ? truth : !truth;
    return [
      rods
        ? `Pour couper deux baguettes de ${a} cm et de ${b} cm en morceaux tous de même longueur, les plus longs possible, on cherche ${tool(asked)}`
        : `Pour savoir quand les marques de deux roues de ${a} et de ${b} dents se retrouvent, on cherche ${tool(asked)}`,
      truth,
      rods
        ? truth
          ? `$${a} = ${g} \\times ${a / g}$ et $${b} = ${g} \\times ${b / g}$ : un morceau de ${g} cm entre un nombre entier de fois dans chaque baguette.`
          : `un morceau de ${nb(m)} cm est plus long qu’une baguette : $${a} = ${tx(m)} \\times 0 + ${a}$.`
        : truth
          ? `$${tx(m)} = ${a} \\times ${m / a} = ${b} \\times ${m / b}$ : les marques se retrouvent après ${nb(m)} dents.`
          : `après ${g} dents, aucune roue n’a fait un tour : $${a} = ${g} \\times ${a / g}$, la roue de ${a} dents en demande ${a / g} fois plus.`,
      [`$${a} = ${g} \\times ${a / g + 1}$`, `$${b} = ${g} \\times ${b / g + 1}$`],
      K.rendezvous,
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

  /** exam (K1, P1) — « le premier pilier où deux équipes finissent pile, puis les planches de chacune ». */
  pilier(rand) {
    const { a, b, m } = pairOf(rand, { lo: 8, hi: 45, max: 500, coprime: pick(rand, [true, false, false, false]) });
    return {
      format: 'exam',
      kind: 'pilier',
      key: K.pilier,
      a,
      b,
      m,
      prompt: fr(
        `Deux équipes bâtissent une passerelle depuis la rive : l’une pose des planches de ${a} cm, l’autre des planches de ${b} cm. À quelle distance de la rive se trouve le premier pilier où les deux équipes finissent pile ? Combien de planches pose chacune ?`,
      ),
      form: {
        tip: 'tipWrite',
        lines: [
          row('Distance du premier pilier', num('m', 'distance du pilier', 4), 'cm'),
          row(`Planches de ${a} cm`, num('x', `planches de ${a} cm`, 3)),
          row(`Planches de ${b} cm`, num('y', `planches de ${b} cm`, 3)),
        ],
      },
    };
  },

  /** exam (K2, P2) — « A et B sont décomposés : leur plus petit multiple commun avec des puissances, puis sa valeur ». */
  facteurs(rand) {
    const count = pick(rand, [2, 2, 3]);
    const { xs, values, big, m } = factorsOf(rand, { count });
    const names = NAMES.slice(0, count);
    const given = names.map((n, i) => `$${n} = ${powTex(xs[i])}$`);
    return {
      format: 'exam',
      kind: 'facteurs',
      key: K.facteurs,
      a: values[0],
      b: values[1],
      ...(count === 3 ? { more: [values[2]] } : {}),
      m,
      values,
      xs,
      big,
      primes: big.map((f) => f.p),
      names,
      prompt: fr(
        `On donne ${listFr(given)}. Sans calculer ${listFr(names.map((n) => `$${n}$`))}, écris leur plus petit multiple commun non nul avec des puissances, puis donne sa valeur.`,
      ),
      form: {
        tip: 'tipWrite',
        lines: [
          {
            ltr: true,
            tokens: [
              'Multiple',
              '=',
              ...big.flatMap((f, i) => [
                ...(i ? ['×'] : []),
                { pow: { base: String(f.p), exp: num(`e${f.p}`, `exposant de ${f.p}`, 2) } },
              ]),
            ],
          },
          { ltr: true, tokens: ['Multiple', '=', num('g', 'la valeur du multiple', 5)] },
        ],
      },
    };
  },

  /** exam (K3, P3) — « deux roues dentées : les dents passées, les tours de chacune ». */
  rendezvous(rand) {
    const { a, b, m } = pairOf(rand, { lo: 8, hi: 50, max: 600, coprime: pick(rand, [true, false, false, false]) });
    const [w1, w2] = pick(rand, [
      ['roues dentées', 'dents'],
      ['pignons', 'dents'],
    ]);
    return {
      format: 'exam',
      kind: 'rendezvous',
      key: K.rendezvous,
      a,
      b,
      m,
      prompt: fr(
        `Deux ${w1} s’engrènent : l’une a ${a} ${w2}, l’autre ${b}. Au départ, une marque sur chacune est face à face. Quand les deux marques sont de nouveau face à face pour la première fois, combien de dents sont passées ? Combien de tours a fait chaque roue ?`,
      ),
      form: {
        tip: 'tipWrite',
        lines: [
          row('Dents passées', num('m', 'dents passées', 4)),
          row(`Tours de la roue de ${a} dents`, num('x', `tours de la roue de ${a} dents`, 3)),
          row(`Tours de la roue de ${b} dents`, num('y', `tours de la roue de ${b} dents`, 3)),
        ],
      },
    };
  },

  /** exam (K3, P3) — « deux lignes de bus : au bout de combien de minutes, à quelle heure ». */
  horaire(rand) {
    for (let t = 0; t < 400; t += 1) {
      const { a, b, m } = pairOf(rand, { lo: 6, hi: 48, max: 300 });
      const [h0, m0] = [int(rand, 5, 14), pick(rand, [0, 10, 15, 20, 30, 40, 45])];
      const startMin = h0 * 60 + m0;
      const arrival = startMin + m;
      if (arrival >= 24 * 60) continue;
      return {
        format: 'exam',
        kind: 'horaire',
        key: K.rendezvous,
        a,
        b,
        m,
        start: [h0, m0],
        startMin,
        arrival,
        prompt: fr(
          `Deux lignes de bus partent ensemble du dépôt à ${clock(h0, m0)}. La ligne A repart toutes les ${a} min, la ligne B toutes les ${b} min. Au bout de combien de minutes repartent-elles ensemble pour la première fois ? À quelle heure ?`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            row('Au bout de', num('m', 'minutes', 4), 'min'),
            { ltr: true, tokens: ['À', '=', num('h', 'heures', 2), 'h', num('min', 'minutes', 2), 'min'] },
          ],
        },
      };
    }
    throw new Error('trainer: no clock');
  },

  /** exam (K3, P3) — « combien de fois ensemble pendant une durée ». */
  fenetre(rand) {
    for (let t = 0; t < 400; t += 1) {
      const { a, b, m } = pairOf(rand, { lo: 6, hi: 40, max: 200 });
      const n = int(rand, 2, 6);
      const window = n * m + int(rand, 0, m - 1);
      if (window > 3600 || !fresh(window)) continue;
      return {
        format: 'exam',
        kind: 'fenetre',
        key: K.rendezvous,
        a,
        b,
        m,
        window,
        count: n,
        prompt: fr(
          `Deux feux clignotent, l’un toutes les ${a} s, l’autre toutes les ${b} s. Ils clignotent ensemble à l’instant 0. Au bout de combien de secondes clignotent-ils ensemble pour la première fois ? Pendant les ${nb(window)} s qui suivent l’instant 0, combien de fois clignotent-ils ensemble ?`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            row('Première fois ensemble', num('m', 'secondes', 4), 's'),
            row('Nombre de fois ensemble', num('n', 'fois', 2)),
          ],
        },
      };
    }
    throw new Error('trainer: no window');
  },

  /** exam (K4, P3) — « des équipes qui travaillent 1 jour puis se reposent : le motif, le jour ». */
  jours(rand) {
    const count = pick(rand, [2, 2, 3]);
    const { rests, cycles, m } = teamsOf(rand, count);
    const teams = rests.map((r, i) => `${nameOf(i)} travaille 1 jour puis se repose ${counted(r, DAYS)}`);
    return {
      format: 'exam',
      kind: 'jours',
      key: K.equipes,
      a: cycles[0],
      b: cycles[1],
      ...(count === 3 ? { more: [cycles[2]] } : {}),
      cycles,
      rests,
      m,
      day: togetherDay(cycles),
      prompt: fr(
        `${cap(teams[0])}, ${listFr(teams.slice(1))}. Toutes travaillent le jour 1. Au bout de combien de jours le motif des équipes recommence-t-il ? Quel est le premier jour après le jour 1 où elles travaillent toutes ensemble ?`,
      ),
      form: {
        tip: 'tipWrite',
        lines: [
          row('Le motif recommence tous les', num('m', 'jours', 3), 'jours'),
          row('Le jour', num('d', 'jour', 3)),
        ],
      },
    };
  },

  /** exam (K3, P1 · P3) — « le même couple, deux situations : couper, ou faire coïncider ». */
  outil(rand) {
    const { a, b, g, m } = pairOf(rand, { lo: 12, hi: 60, max: 600, coprime: false });
    return {
      format: 'exam',
      kind: 'outil',
      key: K.rendezvous,
      a,
      b,
      g,
      m,
      prompt: fr(
        `Deux baguettes de ${a} cm et de ${b} cm sont coupées en morceaux tous de même longueur, la plus grande possible, sans chute. Deux roues de ${a} et de ${b} dents s’engrènent, avec une marque sur chacune, face à face au départ. Quelle est la longueur d’un morceau ? Combien de dents sont passées quand les marques se retrouvent pour la première fois ?`,
      ),
      form: {
        tip: 'tipWrite',
        lines: [
          row('Longueur d’un morceau', num('g', 'longueur', 3), 'cm'),
          row('Dents passées', num('m', 'dents passées', 4)),
        ],
      },
    };
  },

  /** exam (K1, P3) — « un budget de passerelle : la longueur d’un tronçon, les tronçons que le budget paie ». */
  budget(rand) {
    for (let t = 0; t < 600; t += 1) {
      const { a, b, m } = pairOf(rand, { lo: 6, hi: 40, max: 200 });
      const [pa, pb] = [int(rand, 2, 9), int(rand, 2, 9)];
      const cost = (m / a) * pa + (m / b) * pb;
      const n = int(rand, 3, 6);
      const budget = n * cost + int(rand, 0, cost - 1);
      if (budget > 5000 || !fresh(budget)) continue;
      return {
        format: 'exam',
        kind: 'budget',
        key: K.pilier,
        a,
        b,
        m,
        prices: [pa, pb],
        cost,
        budget,
        count: n,
        prompt: fr(
          `Deux équipes bâtissent une passerelle depuis la rive. L’équipe A pose des planches de ${a} cm à ${pa} € pièce, l’équipe B des planches de ${b} cm à ${pb} € pièce. Un pilier est possible là où les deux équipes finissent pile. Quelle est la longueur d’un tronçon, de la rive ou d’un pilier au suivant ? Avec un budget de ${nb(budget)} €, combien de tronçons complets peut-on bâtir ?`,
        ),
        form: {
          tip: 'tipWrite',
          lines: [
            row('Longueur d’un tronçon', num('m', 'longueur', 4), 'cm'),
            row('Tronçons complets payés', num('n', 'tronçons', 2)),
          ],
        },
      };
    }
    throw new Error('trainer: no budget');
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const tap = (kind, key) => ['tap', kind, { key }];
const PLANS = {
  pilier: [
    tap('common', K.pilier),
    ['tf', 'pilier'],
    ['pilier'],
    tap('smallest', K.pilier),
    ['tf', 'pilier'],
    ['budget'],
  ],
  facteurs: [
    tap('powers', K.facteurs),
    ['tf', 'facteurs'],
    ['facteurs'],
    tap('powers', K.facteurs),
    ['tf', 'facteurs'],
    ['facteurs'],
  ],
  rendez: [
    tap('turns', K.rendezvous),
    ['tf', 'rendez'],
    ['rendezvous'],
    tap('smallest', K.pilier),
    ['fenetre'],
    ['horaire'],
  ],
  outil: [tap('smallest', K.pilier), ['tf', 'outil'], ['outil'], tap('turns', K.rendezvous), ['outil'], ['outil']],
  jours: [
    tap('together', K.equipes),
    ['tf', 'jours'],
    ['jours'],
    tap('together', K.equipes),
    ['tf', 'jours'],
    ['jours'],
  ],
  mix: [
    tap('smallest', K.pilier),
    ['tf', 'pilier'],
    ['pilier'],
    tap('together', K.equipes),
    ['facteurs'],
    ['rendezvous'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  multiples: 'pilier',
  pilier: 'pilier',
  'erreur-produit': 'pilier',
  'exemple-pilier': 'pilier',
  facteurs: 'facteurs',
  'erreur-exposant': 'facteurs',
  'exemple-facteurs': 'facteurs',
  'rendez-vous': 'rendez',
  'erreur-tours': 'rendez',
  choisir: 'outil',
  equipes: 'jours',
  'erreur-sommeil': 'jours',
  'exemple-equipes': 'jours',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'pilier':
    case 'rendezvous':
      return { m: q.m, x: q.m / q.a, y: q.m / q.b };
    case 'facteurs':
      return { ...Object.fromEntries(q.big.map((f) => [`e${f.p}`, f.e])), g: q.m };
    case 'horaire':
      return { m: q.m, h: Math.floor(q.arrival / 60), min: q.arrival % 60 };
    case 'fenetre':
      return { m: q.m, n: q.count };
    case 'jours':
      return { m: q.m, d: q.day };
    case 'outil':
      return { g: q.g, m: q.m };
    case 'budget':
      return { m: q.m, n: q.count };
    default:
      return null;
  }
}

/**
 * Why m is not the first meeting of two rhythms a and b: it is not a multiple of one of them (its division), or it is a
 * common multiple that is not the first. `where` words it: { ofA, late }.
 */
function meetingHint(q, m, words) {
  if (!natural(m) || m < 1) return words.zero;
  const c = [q.a, q.b, ...(q.more ?? [])].find((x) => m % x !== 0);
  if (c != null) return `${leaves(m, c)} : ${words.notMultiple(c, m)}`;
  return words.late(m);
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
          ? 'Vérifie par le calcul avant de juger : une division, ou les multiples de chaque nombre.'
          : 'Le verdict est le bon, mais cette raison ne le prouve pas : cherche le calcul qui le prouve.',
      ),
      fix: fr(`${q.truth ? 'Vrai' : 'Faux'}. ${cap(q.why)}`),
    };
  }
  const { a, b, m: L } = q;
  const fill = (text) => ({ ok: false, hint: fr(text) });
  switch (q.kind) {
    case 'pilier':
    case 'rendezvous': {
      const walkway = q.kind === 'pilier';
      const fix = fr(
        walkway
          ? `$${tx(L)} = ${a} \\times ${tx(L / a)}$ et $${tx(L)} = ${b} \\times ${tx(L / b)}$ : le premier pilier est à ${nb(L)} cm, avec ${counted(L / a, PLANKS)} de ${a} cm et ${counted(L / b, PLANKS)} de ${b} cm.`
          : `$${tx(L)} = ${a} \\times ${tx(L / a)} = ${b} \\times ${tx(L / b)}$ : les marques se retrouvent après ${nb(L)} dents ; la roue de ${a} dents a fait ${counted(L / a, TURNS)}, celle de ${b} dents ${counted(L / b, TURNS)}.`,
      );
      const [m, x, y] = ['m', 'x', 'y'].map((k) => box(v, k));
      if (![m, x, y].every(natural)) return { ...fill('Remplis les trois cases avec des nombres entiers.'), fix };
      if (m !== L)
        return {
          ok: false,
          hint: fr(
            meetingHint(q, m, {
              zero: walkway
                ? 'Un pilier sur la rive : il n’y a pas de passerelle à construire.'
                : 'Au départ, aucune dent n’est passée : cherche le premier retour des marques.',
              notMultiple: (c, mm) =>
                walkway
                  ? `l’équipe des planches de ${c} cm s’arrête ${mm % c} cm avant le pilier.`
                  : `la roue de ${c} dents n’a pas fini son dernier tour.`,
              late: (mm) =>
                walkway
                  ? `les deux équipes finissent pile à ${nb(mm)} cm, mais un pilier plus proche tient déjà.`
                  : `les marques sont face à face après ${nb(mm)} dents, mais elles l’étaient déjà plus tôt.`,
            }),
          ),
          fix,
        };
      for (const [c, k] of [
        [a, x],
        [b, y],
      ])
        if (c * k !== m)
          return {
            ok: false,
            hint: fr(
              walkway
                ? `$${c} \\times ${k} = ${tx(c * k)}$ : ${counted(k, PLANKS)} de ${c} cm font ${nb(c * k)} cm, et non ${nb(m)} cm.`
                : `$${c} \\times ${k} = ${tx(c * k)}$ : ${nb(c * k)} dents, et non ${nb(m)} : recompte les tours de la roue de ${c} dents.`,
            ),
            fix,
          };
      return { ok: true, fix };
    }
    case 'facteurs': {
      const fix = fr(
        `Tous les facteurs premiers vus (${listFr(q.primes)}), chacun avec son plus grand exposant : $${powTex(q.big)} = ${tx(L)}$.`,
      );
      const es = q.big.map((f) => box(v, `e${f.p}`));
      const g = box(v, 'g');
      if (es.some((e) => !natural(e)) || !natural(g))
        return { ...fill('Remplis chaque exposant, puis la valeur, avec des nombres entiers.'), fix };
      const at = q.big.findIndex((f, i) => es[i] !== f.e);
      if (at >= 0) {
        const { p, e } = q.big[at];
        const typed = es[at];
        const has = q.xs.map((fs, i) => [fs.find((f) => f.p === p)?.e ?? 0, i]);
        const more = has.find(([x]) => x > typed);
        const hint =
          typed === 0
            ? `Un exposant 0 voudrait dire que ${p} n’est pas un facteur du multiple, or ${p} est dans ${listFr(has.filter(([x]) => x > 0).map(([, i]) => `$${q.names[i]}$`))}.`
            : typed > e
              ? `Aucun des nombres ne contient autant de facteurs ${p} que ton exposant ${typed} : un plus petit multiple commun n’en demande pas plus.`
              : `$${q.names[more[1]]}$ contient plus de facteurs ${p} que ton exposant ${typed} : un multiple de $${q.names[more[1]]}$ doit les contenir tous.`;
        return { ok: false, hint: fr(hint), fix };
      }
      if (g !== L) return { ok: false, hint: fr(`Calcule $${powTex(q.big)}$ facteur par facteur.`), fix };
      return { ok: true, fix };
    }
    case 'horaire': {
      const [h0, m0] = q.start;
      const fix = fr(
        `$${tx(L)} = ${a} \\times ${tx(L / a)} = ${b} \\times ${tx(L / b)}$ : elles repartent ensemble ${nb(L)} min plus tard. $${tx(q.startMin)} + ${L} = ${tx(q.arrival)}$ min depuis minuit, soit ${clock(Math.floor(q.arrival / 60), q.arrival % 60)}.`,
      );
      const [m, h, min] = ['m', 'h', 'min'].map((k) => box(v, k));
      if (![m, h, min].every(natural)) return { ...fill('Remplis les trois cases avec des nombres entiers.'), fix };
      if (m !== L)
        return {
          ok: false,
          hint: fr(
            meetingHint(q, m, {
              zero: 'Au départ, les deux lignes sont déjà ensemble : cherche leur prochaine fois.',
              notMultiple: (c) => `la ligne qui repart toutes les ${c} min n’est pas au dépôt à ce moment-là.`,
              late: (mm) =>
                `elles repartent ensemble au bout de ${nb(mm)} min, mais elles l’avaient déjà fait plus tôt.`,
            }),
          ),
          fix,
        };
      if (min > 59)
        return { ok: false, hint: fr('Les minutes vont de 0 à 59 : une heure complète est une heure de plus.'), fix };
      if (h * 60 + min !== q.arrival)
        return {
          ok: false,
          hint: fr(
            `$${h} \\times 60 + ${min} = ${tx(h * 60 + min)}$ : cela fait ${nb(h * 60 + min)} min depuis minuit, et non ${nb(q.arrival)} (départ à ${clock(h0, m0)}, plus la durée).`,
          ),
          fix,
        };
      return { ok: true, fix };
    }
    case 'fenetre': {
      const fix = fr(
        `$${tx(L)} = ${a} \\times ${tx(L / a)} = ${b} \\times ${tx(L / b)}$ : ils clignotent ensemble toutes les ${nb(L)} s. $${tx(L)} \\times ${q.count} = ${tx(L * q.count)}$ et $${tx(L)} \\times ${q.count + 1} = ${tx(L * (q.count + 1))}$ : ${q.count} fois en ${nb(q.window)} s.`,
      );
      const [m, n] = ['m', 'n'].map((k) => box(v, k));
      if (![m, n].every(natural)) return { ...fill('Remplis les deux cases avec des nombres entiers.'), fix };
      if (m !== L)
        return {
          ok: false,
          hint: fr(
            meetingHint(q, m, {
              zero: 'À l’instant 0 ils clignotent déjà ensemble : cherche la fois suivante.',
              notMultiple: (c) => `le feu qui clignote toutes les ${c} s n’est pas allumé à ce moment-là.`,
              late: (mm) => `ils clignotent ensemble après ${nb(mm)} s, mais ils l’avaient déjà fait plus tôt.`,
            }),
          ),
          fix,
        };
      if (n !== q.count)
        return {
          ok: false,
          hint: fr(
            L * n > q.window
              ? `La ${ordinal(n)} fois serait à ${nb(L * n)} s, après la fin des ${nb(q.window)} s.`
              : `Il y a encore une fois à ${nb(L * (n + 1))} s, avant la fin des ${nb(q.window)} s.`,
          ),
          fix,
        };
      return { ok: true, fix };
    }
    case 'jours': {
      const chain = q.cycles.map((c) => `${c} \\times ${tx(L / c)}`).join(' = ');
      const fix = fr(
        `Les cycles sont ${listFr(q.cycles)} jours (1 jour de travail et les jours de repos) : $${tx(L)} = ${chain}$. Le motif recommence tous les ${nb(L)} jours, donc le jour $1 + ${tx(L)} = ${tx(q.day)}$.`,
      );
      const [m, d] = ['m', 'd'].map((k) => box(v, k));
      if (![m, d].every(natural)) return { ...fill('Remplis les deux cases avec des nombres entiers.'), fix };
      if (m !== L) {
        const rests = lcmOf(q.rests);
        return {
          ok: false,
          hint: fr(
            m === rests
              ? `Une équipe qui se repose ${counted(q.rests[0], DAYS)} a un cycle plus long : regarde le cycle de chaque équipe, jour de travail compris.`
              : meetingHint(q, m, {
                  zero: 'Il faut un nombre de jours qui ne soit pas 0.',
                  notMultiple: (c) => `un cycle de ${c} jours ne recommence pas à ce moment-là.`,
                  late: (mm) => `le motif recommence après ${nb(mm)} jours, mais il avait déjà recommencé plus tôt.`,
                }),
          ),
          fix,
        };
      }
      if (d !== q.day) {
        const c = q.cycles.find((x) => (d - 1) % x !== 0);
        return {
          ok: false,
          hint: fr(
            d < 2
              ? 'Le jour 1 est le départ : cherche le jour d’après où elles travaillent ensemble.'
              : c != null
                ? `$${tx(d - 1)} = ${c} \\times ${tx(Math.floor((d - 1) / c))} + ${(d - 1) % c}$ : le jour ${nb(d)}, une équipe se repose encore.`
                : `Le jour ${nb(d)}, toutes les équipes travaillent, mais elles travaillaient déjà ensemble plus tôt.`,
          ),
          fix,
        };
      }
      return { ok: true, fix };
    }
    case 'outil': {
      const fix = fr(
        `$${a} = ${q.g} \\times ${a / q.g}$ et $${b} = ${q.g} \\times ${b / q.g}$ : des morceaux de ${q.g} cm. $${tx(L)} = ${a} \\times ${tx(L / a)} = ${b} \\times ${tx(L / b)}$ : ${nb(L)} dents.`,
      );
      const [g, m] = ['g', 'm'].map((k) => box(v, k));
      if (![g, m].every(natural)) return { ...fill('Remplis les deux cases avec des nombres entiers.'), fix };
      if (g !== q.g) {
        const hint =
          g === L
            ? `Un morceau de ${nb(g)} cm est plus long que chaque baguette : il faut un nombre qui entre dans les deux longueurs.`
            : g < 1 || a % g || b % g
              ? `${leaves(a % (g || 1) ? a : b, g || 1)} : ${g || 1} ne partage pas les deux baguettes sans chute.`
              : `Des morceaux de ${g} cm marchent, mais on peut les faire plus longs.`;
        return { ok: false, hint: fr(g < 1 ? 'Écris une longueur qui n’est pas 0.' : hint), fix };
      }
      if (m !== L)
        return {
          ok: false,
          hint: fr(
            m === q.g
              ? `Après ${m} dents, aucune roue n’a fini un tour : cherche un nombre de dents que les deux roues ont fini.`
              : meetingHint(q, m, {
                  zero: 'Au départ, aucune dent n’est passée.',
                  notMultiple: (c) => `la roue de ${c} dents n’a pas fini son dernier tour.`,
                  late: (mm) =>
                    `les marques sont face à face après ${nb(mm)} dents, mais elles l’étaient déjà plus tôt.`,
                }),
          ),
          fix,
        };
      return { ok: true, fix };
    }
    case 'budget': {
      const [pa, pb] = q.prices;
      const per = `$${tx(L / a)} \\times ${pa} + ${tx(L / b)} \\times ${pb} = ${tx(q.cost)}$`;
      const fix = fr(
        `$${tx(L)} = ${a} \\times ${tx(L / a)} = ${b} \\times ${tx(L / b)}$ : un tronçon fait ${nb(L)} cm et coûte ${per} €. $${tx(q.cost)} \\times ${q.count} = ${tx(q.cost * q.count)}$ : ${nb(q.cost * q.count)} € paient ${counted(q.count, SECTIONS)} complets, et un de plus coûterait ${nb(q.cost * (q.count + 1))} €, au-delà des ${nb(q.budget)} €.`,
      );
      const [m, n] = ['m', 'n'].map((k) => box(v, k));
      if (![m, n].every(natural)) return { ...fill('Remplis les deux cases avec des nombres entiers.'), fix };
      if (m !== L)
        return {
          ok: false,
          hint: fr(
            meetingHint(q, m, {
              zero: 'Un tronçon a une longueur qui n’est pas 0.',
              notMultiple: (c) => `l’équipe des planches de ${c} cm ne finit pas pile à ce pilier.`,
              late: (mm) => `les deux équipes finissent pile à ${nb(mm)} cm, mais un pilier plus proche tient déjà.`,
            }),
          ),
          fix,
        };
      if (n !== q.count)
        return {
          ok: false,
          hint: fr(
            `Un tronçon demande ${counted(L / a, PLANKS)} de ${a} cm et ${counted(L / b, PLANKS)} de ${b} cm : ${per} €. Combien de fois ce prix entre-t-il dans ${nb(q.budget)} € ?`,
          ),
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
    case 'pilier':
      return fr(`pilier à ${x('m')} cm — ${x('x')} et ${x('y')} planches`);
    case 'rendezvous':
      return fr(`${x('m')} dents — ${x('x')} et ${x('y')} tours`);
    case 'facteurs':
      return fr(
        `$${q.big.map((f) => `${f.p}^{${x(`e${f.p}`) === '…' ? '\\ldots' : x(`e${f.p}`)}}`).join(' \\times ')}$ — valeur : ${x('g')}`,
      );
    case 'horaire':
      return fr(`${x('m')} min — à ${x('h')} h ${x('min')}`);
    case 'fenetre':
      return fr(`${x('m')} s — ${x('n')} fois`);
    case 'jours':
      return fr(`motif de ${x('m')} jours — le jour ${x('d')}`);
    case 'outil':
      return fr(`morceaux de ${x('g')} cm — ${x('m')} dents`);
    case 'budget':
      return fr(`tronçon de ${x('m')} cm — ${x('n')} tronçons`);
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
