// The walks of the second French lesson `trouver-le-pgcd` (3e, « Trouver le PGCD de deux nombres », world
// `divisor-isles`) — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot say — the walk's
// own arithmetic of each verdict, and the words no screen may show before their tablet. Written from the design's « walk's
// outline » (docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md › Lesson 2), BEFORE the forges existed: the boxes of
// each last step (`use`) are the names the design and the kit's blocks give them (`divisionRow`, `pgcdBox`, `powerBox`)
// and must be checked against `world/forges.js` on the first run.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs trouver-le-pgcd [story|hub|trainer|board|launch|sitting|all] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { gcd, common, divisions, isPrime, primeFactorsOf } from '../lib/lessonWalk/experiments.mjs';

/**
 * A sentence as plain text: no `$`, « PGCD » for \mathrm{PGCD}, × for \times, ^n for ^{n}, French thousands joined
 * (« 1\,073 », « 1 073 » → 1073), every white space (the no-break ones included) one space.
 */
const clean = (t) =>
  String(t)
    .replace(/\$/g, '')
    .replace(/\\mathrm\{PGCD\}/g, 'PGCD')
    .replace(/\\times/g, '×')
    .replace(/\\square/g, '□')
    .replace(/\^\{(\d+)\}/g, '^$1')
    .replace(/(\d)\\,(?=\d{3}\b)/g, '$1')
    .replace(/\\[,;:!]/g, ' ')
    .replace(/[\s  ]+/g, ' ')
    .replace(/(\d) (?=\d{3}\b)/g, '$1')
    .trim();

/** A product « 2^3 × 5 × 7 » (+ r): its value; NaN when it is not one. */
const PROD = String.raw`\d+(?:\^\d+)?(?: × \d+(?:\^\d+)?)*`;
const valueOf = (s) => {
  const [p, plus] = String(s).split('+');
  const v = p.split('×').reduce((x, term) => {
    const m = term.trim().match(/^(\d+)(?:\^(\d+))?$/);
    return m ? x * Number(m[1]) ** Number(m[2] ?? 1) : NaN;
  }, 1);
  return plus == null ? v : v + Number(plus.trim());
};
/** Every PGCD(x ; y) the sentence writes, as [x, y] values (□ read as null). */
const pgcds = (t) =>
  [...clean(t).matchAll(/PGCD\(([^;()]+) ; ([^;()]+)\)/g)].map((m) =>
    [m[1], m[2]].map((x) => (x.trim() === '□' ? null : valueOf(x.trim()))),
  );

/**
 * Is a reason of « Justifie » TRUE? Its equalities (products with powers, a remainder added), every « d (ne) divise
 * (pas) n (et m) », every « PGCD(x ; y) = z », « les diviseurs communs de a et b sont …, et le plus grand est g ».
 */
function reasonTrue(text) {
  const t = clean(text).replace(/^Parce que /, '');
  for (const m of t.matchAll(/[\d^×+ ]+(?:=[\d^×+ ]+)+/g)) {
    const vals = m[0]
      .split('=')
      .map((x) => x.trim())
      .filter(Boolean)
      .map(valueOf);
    if (vals.length >= 2 && !vals.some(Number.isNaN) && !vals.every((v) => v === vals[0])) return false;
  }
  for (const m of t.matchAll(new RegExp(`(${PROD}) (ne divise pas|divise) (${PROD})(?: et (${PROD}))?`, 'g'))) {
    const d = valueOf(m[1]);
    for (const n of [m[3], m[4]].filter(Boolean)) if ((valueOf(n) % d === 0) === (m[2] !== 'divise')) return false;
  }
  for (const m of t.matchAll(new RegExp(`PGCD\\((${PROD}) ; (${PROD})\\) = (${PROD})(?![\\d^])`, 'g')))
    if (gcd(valueOf(m[1]), valueOf(m[2])) !== valueOf(m[3])) return false;
  const c = t.match(/les diviseurs communs de (\d+) et (\d+) sont (.+?), et le plus grand est (\d+)/);
  if (c) {
    const said = c[3].split(/, | et /).map(Number);
    const [a, b] = [Number(c[1]), Number(c[2])];
    if (JSON.stringify(said) !== JSON.stringify(common(a, b)) || Number(c[4]) !== gcd(a, b)) return false;
  }
  return true;
}

/** Is a statement of « Vrai ou faux ? » true — the walk's own reading of each form the trainer writes (null: unknown). */
function statementTrue(text) {
  const t = clean(text);
  let m = t.match(/^Avec (\d+) .+ et (\d+) .+, on peut faire (\d+) .+ identiques, sans qu’il reste rien$/);
  if (m) return Number(m[1]) % Number(m[3]) === 0 && Number(m[2]) % Number(m[3]) === 0;
  const P = pgcds(t);
  // « PGCD(a ; b) = PGCD(b ; r) »
  if (P.length === 2) return gcd(...P[0]) === gcd(...P[1]);
  // « PGCD(x ; y) = z », x, y, z products of powers or numbers
  m = t.match(new RegExp(`^PGCD\\((${PROD}) ; (${PROD})\\) = (${PROD})$`));
  if (m) return gcd(valueOf(m[1]), valueOf(m[2])) === valueOf(m[3]);
  return null;
}

/** A gate of the story's dash, of a practice wave or of a trainer tap: the walk's reading of the sentence. */
function dashTrue(say, n) {
  const t = clean(say);
  let m = t.match(/diviseur commun de (\d+) et (\d+)/);
  if (m) return n > 1 && Number(m[1]) % n === 0 && Number(m[2]) % n === 0;
  m = t.match(/^Le plus de .+ identiques avec (\d+) .+ et (\d+) /);
  if (m) return n === gcd(Number(m[1]), Number(m[2]));
  const P = pgcds(t);
  // « PGCD(a ; b) = PGCD(b ; □) »: the equality holds with n
  if (P.length === 2) return n >= 1 && gcd(P[1][0], n) === gcd(...P[0]);
  if (P.length === 1) return n === gcd(...P[0]);
  return null;
}
const isGcd = (x, n) => n === gcd(x.a, x.b);
/** Row i of Euclid's divisions as the kit's `divisionRow(i)` names its boxes: a_i = b_i × q_i + r_i. */
const rows = (A, B) =>
  Object.fromEntries(
    divisions(A, B).flatMap((d, k) => [
      [`a${k + 1}`, d.a],
      [`b${k + 1}`, d.b],
      [`q${k + 1}`, d.q],
      [`r${k + 1}`, d.r],
    ]),
  );
/** A decomposition [{ p, e }] of n, computed here. */
const powersOf = (n) => {
  const out = [];
  for (const p of primeFactorsOf(n)) {
    const f = out.find((x) => x.p === p);
    if (f) f.e += 1;
    else out.push({ p, e: 1 });
  }
  return out;
};
/** The two numbers of a case, whatever the forge names them (a pair: A, B; a sharing: nA, nB). */
const two = (c) => [c.A ?? c.nA ?? c.a, c.B ?? c.nB ?? c.b];

export default {
  id: 'trouver-le-pgcd',
  uid: 9310,
  // the words of each key's name (its tablet's title is added by the library) — the design's « no rule told before its
  // seal » table; case-sensitive substrings
  forbidden: {
    // (« la plus longue planche » is one of its own tiles — the mirror shows it as a choice; the benches keep « plus longue »)
    'diviseurs-communs': ['commun', 'PGCD', 'plus grand'],
    'lots-identiques': ['lots identiques', 'le plus de paniers'],
    // the words of a forge's RIGHT tile (« les facteurs premiers communs », « son plus petit exposant », « le dernier
    // reste qui n’est pas 0 ») are on its own tiles board, as choices: they are kept out of the benches (`benchForbidden`)
    'pgcd-facteurs': ['facteurs communs'],
    euclide: ['Euclide', 'algorithme'],
  },
  // what the two benches (the sheet at C, the division notebook at E) never say while a key is left
  benchForbidden: ['plus petit exposant', 'dernier reste', 'reste qui n’est pas 0', 'plus longue', 'le plus de'],
  // the convoys (story.js › CONVOYS): « jumeaux » 90 / 54 (15 coins), « grands » 1 736 / 980 (193), « euclide »
  // 52 015 / 31 209 (807), « jetee » 1 462 / 946 (55). A first plank refused by the second gap on « jumeaux » and
  // « euclide » (the library computes it: 45, then 515); the purse run out on « jumeaux » (3), « grands » (7) and
  // « jetee » (2) — never on « euclide » (its only plank under 65 is 1: 807 planks). A reload on island B (inside the
  // first convoy). The design's outline tried 27, 9, 14, 20 806 and 43: the library chooses its own wrong planks.
  story: { wrongFirst: ['jumeaux', 'euclide'], purseOut: ['jumeaux', 'grands', 'jetee'], reloadOn: 1 },
  // a sharing has no bridge to carry (A10): its log never says « planche »
  notBridge: ['lots-identiques'],
  truth: {
    // a plank on two gaps with a purse: it builds both bridges with the fewest planks exactly when it is their PGCD
    'diviseurs-communs': (c) => c.d === gcd(...two(c)),
    // a sharing: k baskets leave no fruit (`deal`), k is the most (`most`), each basket holds x and y (`lot`)
    'lots-identiques': (c) => {
      const [a, b] = two(c);
      const k = c.k ?? c.d;
      const shares = a % k === 0 && b % k === 0;
      if (c.kind === 'most') return k === gcd(a, b);
      if (c.kind === 'lot') return shares && c.x * k === a && c.y * k === b;
      return shares;
    },
    'pgcd-facteurs': (c) => c.d === gcd(...two(c)),
    euclide: (c) => c.d === gcd(...two(c)),
  },
  use: {
    // (75 ; 45): the planks that fill both, smallest first, then the one to make
    'diviseurs-communs': (c) => {
      const [a, b] = two(c);
      return { ...Object.fromEntries(common(a, b).map((d, i) => [`d${i + 1}`, d])), g: gcd(a, b) };
    },
    // 35 apples and 56 pears: the most baskets, then what one holds
    'lots-identiques': (c) => {
      const [a, b] = two(c);
      const g = gcd(a, b);
      return { k: g, x: a / g, y: b / g };
    },
    // 2⁴ × 3³ × 5 and 2² × 3⁴ × 7: the exponent of each common prime (`powerBox`, « e<p> »), then the value
    'pgcd-facteurs': (c) => {
      const [a, b] = two(c);
      const g = gcd(a, b);
      return { ...Object.fromEntries(powersOf(g).map((f) => [`e${f.p}`, f.e])), g };
    },
    // (1 073 ; 957): row 1's quotient and remainder (its pair is printed), rows 2 and 3 whole, then the PGCD
    euclide: (c) => {
      const [a, b] = two(c);
      const { a1, b1, ...boxes } = rows(Math.max(a, b), Math.min(a, b));
      return { ...boxes, g: gcd(a, b) };
    },
  },
  dash: dashTrue,
  // the practice waves (world/practice.js) and the trainer's taps
  gate: {
    common: (x, n) => n > 1 && x.a % n === 0 && x.b % n === 0,
    pgcd: isGcd,
    lots: isGcd,
    pgcdPow: isGcd,
    euclidRest: (x, n) => n >= 1 && gcd(x.b, n) === gcd(x.a, x.b),
    euclidLast: isGcd,
  },
  statement: statementTrue,
  reasonTrue,
  solve: {
    // « Écris les diviseurs communs de a et b, puis leur PGCD »: six boxes c0 … c5, then g
    communs: (q) => ({ ...Object.fromEntries(common(q.a, q.b).map((d, i) => [`c${i}`, d])), g: gcd(q.a, q.b) }),
    lots: (q) => {
      const g = gcd(q.a, q.b);
      return { n: g, x: q.a / g, y: q.b / g };
    },
    // the PGCD of the two decompositions shown, read from their factors (never from a stored value)
    facteurs: (q) => {
      const A = q.xs.reduce((v, f) => v * f.p ** f.e, 1);
      const B = q.ys.reduce((v, f) => v * f.p ** f.e, 1);
      const g = gcd(A, B);
      return { ...Object.fromEntries(powersOf(g).map((f) => [`e${f.p}`, f.e])), g };
    },
    euclide: (q) => {
      const [first] = divisions(q.a, q.b);
      return { q: first.q, r: first.r, g: gcd(q.a, q.b) };
    },
  },
  // the learning net gives this lesson TWO core tools, in this order: lesson 1's decomposition (3e) and the divisors of a
  // number (4e, no French lesson yet: « Revois d’abord » names the item itself)
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

// the walk's own arithmetic is checked once at load: a prime is prime, a division row is a division
if (!isPrime(103) || divisions(52015, 31209).at(-1).b !== 10403) throw new Error('trouver-le-pgcd.walk: arithmetic');
