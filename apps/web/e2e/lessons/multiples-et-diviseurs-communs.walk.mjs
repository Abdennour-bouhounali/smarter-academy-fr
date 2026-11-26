// The walks of the fourth French lesson `multiples-et-diviseurs-communs` (3e, « Engrenages et rendez-vous : quand deux
// rythmes se retrouvent », world `divisor-isles`) — a DESCRIPTOR for lib/lessonWalk (README there): only what the
// lesson's files cannot say — the walk's own arithmetic of each verdict, the words no screen may show before their
// tablet, and the wrong tries of the design's « walk's outline » (docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md ›
// Lesson 4 › « The walk's outline », and its « Built as » notes). Written 2026-11-26 from the lesson's files, BEFORE its
// first run. The walkway, the crews and the day mission are played by lib/lessonWalk/walkwayStory.mjs and
// crewsExperiments.mjs.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs multiples-et-diviseurs-communs [story|hub|trainer|board|launch|sitting|all] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { gcd, primeFactorsOf } from '../lib/lessonWalk/experiments.mjs';

const lcm = (a, b) => (a / gcd(a, b)) * b;
const lcmOf = (xs) => xs.reduce(lcm, 1);
/** A decomposition [{ p, e }] of n — computed here. */
const powersOf = (n) => {
  const out = [];
  for (const p of primeFactorsOf(n)) {
    const f = out.find((x) => x.p === p);
    if (f) f.e += 1;
    else out.push({ p, e: 1 });
  }
  return out;
};
const valueOf = (fs) => fs.reduce((v, f) => v * f.p ** f.e, 1);
/** Every prime of the decompositions, each with its larger exponent — the walk's own smallest common multiple. */
const bigOf = (...lists) => {
  const best = new Map();
  for (const fs of lists) for (const { p, e } of fs) best.set(p, Math.max(best.get(p) ?? 0, e));
  return [...best.entries()].sort((a, b) => a[0] - b[0]).map(([p, e]) => ({ p, e }));
};
const expOf = (n, p) => powersOf(n).find((f) => f.p === p)?.e ?? 0;
/** The first day after day 1 when teams of these cycles all work. */
const together = (cycles) => 1 + lcmOf(cycles);

// ───────────────────────── reading a sentence (the dash, the trainer's statements and reasons) ─────────────────────────
/** A sentence as plain text: no `$`, × for \times, ^n for ^{n}, thousands joined, white space one space. */
const clean = (t) =>
  String(t)
    .replace(/\$/g, '')
    .replace(/\\times/g, '×')
    .replace(/\^\{(\d+)\}/g, '^$1')
    .replace(/(\d)\\,(?=\d{3}\b)/g, '$1')
    .replace(/\\[,;:!]/g, ' ')
    .replace(/[\s  ]+/g, ' ')
    .replace(/(\d) (?=\d{3}\b)/g, '$1')
    .trim();
/** « 2^3 × 3 » (+ r): its value; NaN when it is not a product. */
const valueOfText = (s) => {
  const [p, plus] = String(s).split('+');
  const v = p.split('×').reduce((x, term) => {
    const m = term.trim().match(/^(\d+)(?:\^(\d+))?$/);
    return m ? x * Number(m[1]) ** Number(m[2] ?? 1) : NaN;
  }, 1);
  return plus == null ? v : v + Number(plus.trim());
};
const PROD = String.raw`\d+(?:\^\d+)?(?: × \d+(?:\^\d+)?)*`;

/** A gate of the story's dash, of a practice wave or of a trainer tap: the walk's reading of its sentence. */
function dashTrue(say, n) {
  const t = clean(say);
  let m = t.match(/^Un multiple commun de (\d+) et de (\d+)$/);
  if (m) return n >= 1 && n % Number(m[1]) === 0 && n % Number(m[2]) === 0;
  m = t.match(/premier pilier où finissent pile des planches de (\d+) et de (\d+)/);
  if (m) return n === lcm(Number(m[1]), Number(m[2]));
  m = t.match(new RegExp(`plus petit multiple commun non nul de (?:A = )?(${PROD}) et de (?:B = )?(${PROD})`));
  if (m) return n === lcm(valueOfText(m[1]), valueOfText(m[2]));
  m = t.match(/Deux roues de (\d+) et de (\d+) dents : les tours de la roue de (\d+) dents/);
  if (m) return n === lcm(Number(m[1]), Number(m[2])) / Number(m[3]);
  m = t.match(/Partager (\d+) .+ et (\d+) .+ en sachets identiques : le plus de sachets/);
  if (m) return n === gcd(Number(m[1]), Number(m[2]));
  m = t.match(/se repose (\d+) jours?, une autre 1 jour puis se repose (\d+) jours?/);
  if (m) return n === together([Number(m[1]) + 1, Number(m[2]) + 1]);
  return null;
}

/** « Vrai ou faux ? » — the walk's own reading of each form the trainer writes (null: unknown). */
function statementTrue(text) {
  const t = clean(text);
  let m = t.match(/^(\d+) est un multiple commun de (\d+) et de (\d+)$/);
  if (m) return Number(m[1]) % Number(m[2]) === 0 && Number(m[1]) % Number(m[3]) === 0;
  m = t.match(new RegExp(`^Le plus petit multiple commun non nul de A = (${PROD}) et de B = (${PROD}) est (${PROD})$`));
  if (m) return valueOfText(m[3]) === lcm(valueOfText(m[1]), valueOfText(m[2]));
  m = t.match(/^Deux roues de (\d+) et de (\d+) dents : .+ pour la première fois après (\d+) dents$/);
  if (m) return Number(m[3]) === lcm(Number(m[1]), Number(m[2]));
  m = t.match(
    /se repose (\d+) jours?, une autre 1 jour puis se repose (\d+) jours? : .+ de nouveau ensemble le jour (\d+)$/,
  );
  if (m) return Number(m[3]) === together([Number(m[1]) + 1, Number(m[2]) + 1]);
  if (/^Pour couper deux baguettes/.test(t)) return /plus grand diviseur commun$/.test(t);
  if (/^Pour savoir quand les marques/.test(t)) return /plus petit multiple commun$/.test(t);
  return null;
}

/** Is a reason of « Justifie » TRUE? Every equality it writes (products with powers, a remainder added) holds. */
function reasonTrue(text) {
  const t = clean(text).replace(/^Parce que /, '');
  for (const m of t.matchAll(/[\d^×+ ]+(?:=[\d^×+ ]+)+/g)) {
    const vals = m[0]
      .split('=')
      .map((x) => x.trim())
      .filter(Boolean)
      .map(valueOfText);
    if (vals.length >= 2 && !vals.some(Number.isNaN) && !vals.every((v) => v === vals[0])) return false;
  }
  return true;
}

/** A clock « partis à 6 h 10 » in a case's sentence → minutes since midnight. */
const startIn = (text) => {
  const m = clean(text).match(/partis à (\d{1,2}) h (\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export default {
  id: 'multiples-et-diviseurs-communs',
  uid: 9340,
  // the words of each key no screen shows before its tablet (its tablet's title is added by the library) — the forges'
  // own `FORBIDDEN` (world/forges.test.js) and the design's « No rule told before its seal »; case-sensitive
  forbidden: {
    'pilier-commun': ['commun', 'PPCM', 'multiple', 'Multiple', 'non nul'],
    'ppcm-facteurs': ['PPCM', 'par les facteurs premiers'],
    'traduire-rendez-vous': ['rendez-vous', 'Rendez-vous', 'PPCM'],
    'cinq-equipes': ['cycle', 'PPCM'],
  },
  // what the bench (the spreadsheet of C) and the experiments never say while a key is left (inquiries.test.js › never)
  benchForbidden: ['PPCM', 'multiple', 'commun', 'cycle', 'exposant', 'plus petit', 'plus grand', 'tous les facteurs'],
  story: {
    // the pillars tried before the paid one (outline rows 2 and 6): 64 (B 4 short), 320 (holds, the purse cannot pay
    // it), 0 (the shore); 6 (no plank), 576 (A 162 short). The paid pillar is the walk's own first common multiple.
    walkway: { 'pilier-quai': [64, 320, 0], 'pilier-chantier': [6, 576] },
    // the mission (outline row 11): the rest days' trap 2 129, the day before 681, a later meeting — then the board's
    // next run, 681. Computed by the library from the mission's text; listed here only to fix the order.
  },
  // the false rule each forge plays first (outline rows 4, 7, 8, 9)
  falseTiles: {
    'traduire-rendez-vous': ['when:product', 'times:own'],
    'cinq-equipes': ['what:lcm', 'of:sleep', 'add:plus'],
  },
  // 138 = 2 × 3 × 23 is the student's OWN reading: the false rule of forge 2 (« tous les facteurs premiers, son plus
  // petit exposant », falseTiles' default) applied to 414 = 2 × 3² × 23 and 192 = 2⁶ × 3 — the mirror writes what his
  // rule gives (« ta règle donne 2 × 3 × 23 = 138 »); it is another lesson's number by coincidence, not a choice
  ownNumbers: [2 * 3 * 23],
  // K3 and K4 are not about bridges: their logs never say « planche » (A10)
  notBridge: ['cinq-equipes'],
  truth: {
    // ONE pillar at d for crews A and B with a purse: built when both end on it and the purse pays the planks
    'pilier-commun': (c) => c.d > 0 && c.d % c.A === 0 && c.d % c.B === 0 && c.d / c.A + c.d / c.B <= c.purse,
    'ppcm-facteurs': (c) => c.d > 0 && c.d % c.A === 0 && c.d % c.B === 0 && c.d / c.A + c.d / c.B <= c.purse,
    // a meeting after v, a count of repetitions v of `who`, a clock time (minutes since midnight) — the first meeting?
    'traduire-rendez-vous': (c) => {
      const L = lcm(c.a, c.b);
      if (c.kind === 'meet') return c.v === L;
      if (c.kind === 'turns') return c.v * c.who === L;
      if (c.kind === 'clock') return c.v - startIn(c.text) === L;
      return null;
    },
    // teams that sleep `sleeps` days: day `day` is the first after day 1 when they all work
    'cinq-equipes': (c) => c.day === together(c.sleeps.map((s) => s + 1)),
  },
  use: {
    // planks of 14 and 49: the first pillar, then each crew's planks
    'pilier-commun': (c) => {
      const m = lcm(c.A, c.B);
      return { d: m, x: m / c.A, y: m / c.B };
    },
    // 2³ × 7 × 11 and 2² × 11²: the larger exponents of 2 and 11, the value; then 2⁵ and 3³ (the pair the step prints —
    // `givenPower`; checked offline against the lesson's lines)
    'ppcm-facteurs': (c) => {
      const big = bigOf(c.xs, c.ys);
      return {
        e2: big.find((f) => f.p === 2).e,
        e11: big.find((f) => f.p === 11).e,
        m: valueOf(big),
        n: lcm(2 ** 5, 3 ** 3),
      };
    },
    // rods cut into equal pieces: the PGCD; wheels whose marks meet: the smallest common multiple
    'traduire-rendez-vous': (c) => ({ t1: 'pgcd', v1: gcd(c.A, c.B), t2: 'multiple', v2: lcm(c.A, c.B) }),
    // three teams sleeping 3, 13 and 18 days: their cycles, the exponent of 2, the multiple, the day
    'cinq-equipes': (c) => {
      const cycles = c.sleeps.map((s) => s + 1);
      const m = lcmOf(cycles);
      return { ca: cycles[0], cb: cycles[1], cc: cycles[2], e2: expOf(m, 2), m, day: 1 + m };
    },
  },
  // the wrong last steps of the outline: the longer plank (49), the multiple for the rods, the sleep days as cycles (235)
  useWrong: {
    'pilier-commun': (c) => {
      const m = lcm(c.A, c.B);
      return { d: Math.max(c.A, c.B), x: m / c.A, y: m / c.B };
    },
    'traduire-rendez-vous': (c) => ({ t1: 'multiple', v1: gcd(c.A, c.B), t2: 'multiple', v2: lcm(c.A, c.B) }),
    'cinq-equipes': (c) => {
      const m = lcmOf(c.sleeps);
      return { ca: c.sleeps[0], cb: c.sleeps[1], cc: c.sleeps[2], e2: expOf(m, 2), m, day: 1 + m };
    },
  },
  // the board: the pillar each figure station asks — the walkways' figure writes each crew's plank on its planks; the
  // pillar where every crew ends is the walk's own first common multiple of those lengths (lib/lessonWalk/board.mjs)
  board: {
    // (the planks only: the post `P0`–`P1` writes the pillar's distance, the answer, which the walk does not read)
    'pilier-88': (st) =>
      lcmOf([...new Set((st.figure?.segments ?? []).filter((x) => x.from[0] !== 'P').map((x) => Number(x.label)))]),
  },
  dash: dashTrue,
  // the practice waves (world/practice.js) and the trainer's taps — each from the wave's question only
  gate: {
    common: (x, n) => n >= 1 && n % x.a === 0 && n % x.b === 0,
    smallest: (x, n) => n === lcm(x.a, x.b),
    powers: (x, n) => n === lcm(x.a, x.b),
    turns: (x, n) => n === lcm(x.a, x.b) / x.a,
    // two cycles a and b
    together: (x, n) => n === together([x.a, x.b]),
  },
  statement: statementTrue,
  reasonTrue,
  solve: {
    pilier: (q) => {
      const m = lcm(q.a, q.b);
      return { m, x: m / q.a, y: m / q.b };
    },
    rendezvous: (q) => {
      const m = lcm(q.a, q.b);
      return { m, x: m / q.a, y: m / q.b };
    },
    // the decompositions shown (`q.xs`): every prime with its larger exponent, then the value
    facteurs: (q) => {
      const big = bigOf(...q.xs);
      return { ...Object.fromEntries(big.map((f) => [`e${f.p}`, f.e])), g: valueOf(big) };
    },
    horaire: (q) => {
      const m = lcm(q.a, q.b);
      const t = q.start[0] * 60 + q.start[1] + m;
      return { m, h: Math.floor(t / 60), min: t % 60 };
    },
    fenetre: (q) => {
      const m = lcm(q.a, q.b);
      return { m, n: Math.floor(q.window / m) };
    },
    jours: (q) => {
      const m = lcmOf(q.rests.map((r) => r + 1));
      return { m, d: 1 + m };
    },
    outil: (q) => ({ g: gcd(q.a, q.b), m: lcm(q.a, q.b) }),
    budget: (q) => {
      const m = lcm(q.a, q.b);
      const cost = (m / q.a) * q.prices[0] + (m / q.b) * q.prices[1];
      return { m, n: Math.floor(q.budget / cost) };
    },
  },
  // the learning net gives this lesson TWO core tools, in this order: lesson 1's decomposition (3e) and the divisors of a
  // number (4e, no French lesson yet: « Revois d’abord » names the item itself) — the same two as lesson 2
  launch: {
    scenario: 'pair',
    tools: [
      {
        item: '3e.m1.r05',
        name: 'Produits de nombres premiers',
        year: 'vu en 3e',
        home: 'Décomposer un nombre en facteurs premiers',
        memo: 4,
        second: 'sort',
        firstOk: (q) => q.calc?.op === 'factor' && q.calc.n === 24,
      },
      {
        item: '4e.m1.r08',
        name: 'Les diviseurs d’un nombre',
        year: 'vu en 4e',
        home: getItem('4e.m1.r08').text,
        memo: 4,
        second: 'sort',
        firstOk: (q) => q.gesture === 'write' && q.a === q.b * Math.round(q.a / q.b),
      },
    ],
  },
};

// the walk's own arithmetic is checked once at load: the two walkways, the mission, the dash's forms
if (
  lcm(16, 20) !== 80 ||
  lcm(414, 192) !== 13248 ||
  together([8, 17, 20]) !== 681 ||
  !dashTrue('Le premier pilier où finissent pile des planches de 4 et de 34 cases', 68) ||
  !dashTrue('Le plus petit multiple commun non nul de $2^{3} \\times 3$ et de $2^{2} \\times 23$', 552) ||
  !dashTrue(
    'Une équipe travaille 1 jour puis se repose 4 jours, une autre 1 jour puis se repose 7 jours. Elles travaillent ensemble le jour 1 : le prochain jour où elles travaillent ensemble',
    41,
  )
)
  throw new Error('multiples-et-diviseurs-communs.walk: arithmetic');
