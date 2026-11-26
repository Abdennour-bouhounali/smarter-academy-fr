// The walks of the third French lesson `fraction-irreductible` (3e, « Rendre une fraction irréductible », world
// `divisor-isles`) — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot say — the walk's
// own arithmetic of each verdict, the words no screen may show before their tablet, and the order of the wrong tries the
// design's « walk's outline » asks (docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md › Lesson 3 › « The walk's
// outline »). Written 2026-11-26 from the lesson's files, BEFORE its first run.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs fraction-irreductible [story|hub|trainer|board|launch|sitting|all] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { divisions, gcd, primeFactorsOf } from '../lib/lessonWalk/experiments.mjs';

/** A fraction in lowest terms, computed here. */
const reduce = (p, q) => {
  const g = gcd(p, q);
  return [p / g, q / g];
};
/** A decomposition [{ p, e }] of n, primes increasing — computed here. */
const powersOf = (n) => {
  const out = [];
  for (const p of primeFactorsOf(n)) {
    const f = out.find((x) => x.p === p);
    if (f) f.e += 1;
    else out.push({ p, e: 1 });
  }
  return out;
};
/** A calculation x/y op z/w, unreduced (a sum over y × w). */
const resultOf = ({ op, x, y, z, w }) =>
  op === '+' ? [x * w + z * y, y * w] : op === '*' || op === '×' ? [x * z, y * w] : null;
/** Is p/q the finished writing of N/D? */
const finished = (N, D, p, q) => p * D === q * N && gcd(p, q) === 1;

// ───────────────────────── the dash: the walk's own reading of each sentence ─────────────────────────
/** A sentence's LaTeX as plain: thin spaces out, white space one space. */
const texOf = (s) =>
  String(s)
    .replace(/\\,/g, '')
    .replace(/[\s  ]+/g, ' ');
/** « \dfrac{…}{…} » with one level of braces inside (« 2^{2} »). */
const FRAC = /\\d?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g;
/** A term: a product of numbers and powers (« 2^{2} \times 3 \times 23 ») → its value; « \square » → null. */
const termOf = (t) => {
  const s = t.trim();
  if (s === '\\square') return null;
  return s.split('\\times').reduce((v, f) => {
    const m = f.trim().match(/^(\d+)(?:\^\{?(\d+)\}?)?$/);
    return m ? v * Number(m[1]) ** Number(m[2] ?? 1) : NaN;
  }, 1);
};
const fracsOf = (s) => [...texOf(s).matchAll(FRAC)].map((m) => [termOf(m[1]), termOf(m[2])]);

/**
 * A gate of the story's dash (story.js › DASH_WAVES): « the numerator / denominator of a/b made irreducible », « x/□ is
 * irreducible », and « (product or sum of fractions) = p/□ » — the missing term that makes the equality true.
 */
function dashTrue(say, n) {
  const t = texOf(say);
  if (/rendu irréductible/.test(t)) {
    const [[a, b]] = fracsOf(t);
    const [p, q] = reduce(a, b);
    return n === (/dénominateur/i.test(t) ? q : p);
  }
  const sides = t.split('=');
  if (sides.length === 1 && /irréductible/.test(t)) {
    const [[a, b]] = fracsOf(t);
    return Number.isInteger(n) && n >= 1 && gcd(a ?? b, n) === 1;
  }
  if (sides.length === 2) {
    const left = fracsOf(sides[0]);
    const [[p, q]] = fracsOf(sides[1]);
    let N;
    let D;
    if (left.length === 1) [N, D] = left[0];
    else {
      const op = sides[0].replace(FRAC, '#').includes('+') ? '+' : '*';
      [N, D] = resultOf({ op, x: left[0][0], y: left[0][1], z: left[1][0], w: left[1][1] });
    }
    const [P, Q] = [p ?? n, q ?? n];
    return P * D === Q * N;
  }
  return null;
}

/** « 3² et 23 », « 23 seulement », « rien » → the values it names ([9, 23], [23], []), sorted. */
const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
const namedIn = (text) =>
  String(text)
    .replace(/seulement/g, '')
    .split(/\s+et\s+|,\s*/)
    .map((x) => x.trim())
    .filter((x) => x && x !== 'rien')
    .map((x) => {
      const m = x.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/);
      return m ? Number(m[1]) ** (m[2] ? Number([...m[2]].map((c) => SUP[c]).join('')) : 1) : NaN;
    })
    .sort((a, b) => a - b);

export default {
  id: 'fraction-irreductible',
  uid: 9330,
  // the words of each key that no screen shows before its tablet (its tablet's title is added by the library) — the
  // forges' own `FORBIDDEN` (world/forges.test.js) and the design's « No rule told before its seal »; case-sensitive
  forbidden: {
    // (K1's tiles say « commun » — « chaque facteur premier commun »: not forbidden here, its mirror shows it as a choice)
    'simplifier-facteurs': ['simplifi', 'Simplifi', 'irréductible', 'PGCD'],
    irreductible: ['irréductible', 'premiers entre eux', 'PGCD'],
    'diviser-par-le-pgcd': ['par le PGCD', 'par leur PGCD', 'diviser par', 'Diviser par'],
    'resultat-irreductible': ['sous forme irréductible', 'le résultat peut', 'barrer avant', 'avant de multiplier'],
  },
  // what the bench (C's notebook) and the experiments never say while a key is left (design, C–D)
  benchForbidden: ['une seule étape', 'dernier reste', 'premiers entre eux'],
  // derived numbers this lesson really shows: 240 = ⌊722 / 3⌋, the band the K3 mirror (`measure` / `direct`, long strips)
  // writes on the top strip when the student types the plank 3 — the walk's refused plank (`refusingPlank`: the
  // smallest that does not fill both). The student types any plank, so the count is his own plank's reading, not lesson
  // 4's 240 (2026-11-26 walk: « nothing of another lesson on screen — 240 » on forge3-direct-r1-refused-3).
  ownNumbers: [240],
  story: {
    // the one convoy « carnet » (1 786 / 722, purse 93): no second gap to refuse a plank, no plank that misses the post
    // played (the outline's row 7: 19 runs the purse out — 94 planks for 93 coins —, then 38)
    wrongFirst: [],
    markMiss: [],
    purseOut: ['carnet'],
    // the three bridges on pedestals (`story.marked`, the plan of each — lib/lessonWalk/story.mjs › markedBridge):
    marked: {
      // A → B (246, 138 lit; 2 3 5 7): 5 falls first, a reload; then 2 holds, he crosses, is sent back, 7 fails on the
      // standing bridge, 3 holds — the mirror of B opens (outline rows 1–2)
      m246: { first: [5], reload: true },
      // B → C (96, 65 lit; 2 3 5 13 1): 1 holds first (the sign stays), he crosses, is sent back; 13, 3, 2, 5 fail one
      // after the other — the mirror of C opens on the LAST (outline row 4)
      m96: { first: [], after: [13, 3, 2, 5] },
      // D → E (78 lit 65 then 4; 2 3 6 13): 13 fills and misses the post, then 3 holds — E's mirror opens on arrival (row 9)
      m78: { first: [13] },
    },
  },
  // the false rule each forge plays first (forges report « One false rule each to show », the outline rows 3, 5, 8, 10)
  falseTiles: {
    'simplifier-facteurs': ['which:common', 'times:once', 'where:both'],
    irreductible: ['see:no235', 'then:stays'],
    'diviser-par-le-pgcd': ['by:any', 'how:both'],
    'resultat-irreductible': ['after:once', 'when:always'],
  },
  truth: {
    // a writing p/q of L/W: the same part, and no plank longer than a cell fills p and q
    'simplifier-facteurs': (c) => finished(c.L, c.W, c.p, c.q),
    // a fraction L/W stays as it is when only the plank 1 fills both
    irreductible: (c) => gcd(c.L, c.W) === 1,
    'diviser-par-le-pgcd': (c) => finished(c.L, c.W, c.p, c.q),
    // a calculation and a writing of its result: the result computed HERE from x, y, z, w
    'resultat-irreductible': (c) => {
      const [N, D] = resultOf(c);
      return finished(N, D, c.p, c.q);
    },
  },
  use: {
    // 735 and 588 decomposed (a prime and its exponent a box each), 735/588, then the product given decomposed
    'simplifier-facteurs': (c) => {
      const [N, D] = c.raw;
      const row = (x, r) =>
        Object.fromEntries(
          powersOf(x).flatMap((f, i) => [
            [`${r}${i + 1}`, f.p],
            [`${r}e${i + 1}`, f.e],
          ]),
        );
      const [n1, d1] = reduce(N, D);
      const [n2, d2] = reduce(...c.dec);
      return { ...row(N, 'a'), ...row(D, 'b'), n1, d1, n2, d2 };
    },
    // PGCD(65 ; 96), then three fractions: irreducible or not (the option ids « oui » / « non »), and their writing
    irreductible: (c) => ({
      g: gcd(c.A, c.B),
      ...Object.fromEntries(
        c.items.flatMap(([L, W], i) => {
          const [n, d] = reduce(L, W);
          return [
            [`y${i + 1}`, gcd(L, W) === 1 ? 'oui' : 'non'],
            [`n${i + 1}`, n],
            [`d${i + 1}`, d],
          ];
        }),
      ),
    }),
    // 682 = 558 × □ + □, then two rows whole, the PGCD, the fraction in one division
    'diviser-par-le-pgcd': (c) => {
      const rows = divisions(c.W, c.L);
      const [n, d] = reduce(c.L, c.W);
      return {
        q1: rows[0].q,
        r1: rows[0].r,
        ...Object.fromEntries(
          rows.slice(1).flatMap((r, i) => [
            [`a${i + 2}`, r.a],
            [`b${i + 2}`, r.b],
            [`q${i + 2}`, r.q],
            [`r${i + 2}`, r.r],
          ]),
        ),
        g: gcd(c.L, c.W),
        n,
        d,
      };
    },
    // the product given decomposed: what to strike (the option naming the common prime powers, read on screen), what is
    // left; then the raw product
    'resultat-irreductible': (c) => {
      const [GN, GD] = resultOf({ op: '*', ...c.guided });
      const struck = powersOf(gcd(GN, GD)).map((f) => f.p ** f.e);
      const [n1, d1] = reduce(GN, GD);
      const [n2, d2] = reduce(...resultOf({ op: '*', ...c.raw }));
      return {
        strike: (opts) => opts.find((o) => namedIn(o.text).join() === struck.join())?.id ?? null,
        n1,
        d1,
        n2,
        d2,
      };
    },
  },
  dash: dashTrue,
  // the practice waves (world/practice.js) and the trainer's taps — each from the wave's question only
  gate: {
    // a/b, its common primes struck: the denominator left
    barrer: (x, n) => n === reduce(x.a, x.b)[1],
    stays: (x, n) => Number.isInteger(n) && n >= 1 && gcd(n, x.n) === 1,
    pgcdW: (x, n) => n === reduce(x.a, x.b)[x.side === 'd' ? 1 : 0],
    // x/y op z/w (a = x·100 + y, b = z·100 + w; the sign read in the sentence): the irreducible result's denominator
    calcul: (x, n) => {
      const op = /\\times/.test(x.say) ? '*' : '+';
      const [N, D] = resultOf({ op, x: Math.floor(x.a / 100), y: x.a % 100, z: Math.floor(x.b / 100), w: x.b % 100 });
      return n === reduce(N, D)[1];
    },
  },
  solve: {
    barrer: (q) => {
      const [p, d] = reduce(q.a, q.b);
      return { p, q: d };
    },
    // the verdict by its words on screen (« irréductible » / « réductible »), given as the id of the option that bears
    // them: the library's wrong try picks « another option » by id, and an id never equals a word — with the words, its
    // « other » could be the right option (2026-11-26 walk: question 5, a « wrong » verdict was the right one → « Bravo »)
    verdict: (q) => {
      const word = gcd(q.a, q.b) === 1 ? 'irréductible' : 'réductible';
      const options = q.form.lines.flatMap((l) => l.tokens).find((t) => t?.choice === 'verdict')?.options ?? [];
      const id = options.find((o) => o.text === word)?.value;
      if (id == null || options.length !== 2) throw new Error(`fraction-irreductible.walk: no option « ${word} »`);
      return { g: gcd(q.a, q.b), verdict: id };
    },
    diviser: (q) => {
      const [p, d] = reduce(q.a, q.b);
      return { g: gcd(q.a, q.b), p, q: d };
    },
    calcul: (q) => {
      const [s, t] = resultOf(q);
      const [p, d] = reduce(s, t);
      return { s, t, p, q: d };
    },
  },
  // the trainer's wrong try of a verdict: the right PGCD, the OTHER verdict — checked to differ from the right one (C17;
  // to move to LIB/: `trainer.mjs › wrongOf` should never pick « another option » that is the right one)
  wrong: {
    verdict: (q, v) => {
      const options = q.form.lines.flatMap((l) => l.tokens).find((t) => t?.choice === 'verdict')?.options ?? [];
      const other = options.find((o) => o.value !== v.verdict)?.value;
      if (other == null || other === v.verdict) throw new Error('fraction-irreductible.walk: no wrong verdict');
      return { ...v, verdict: other };
    },
  },
  // the learning net gives this lesson TWO core tools, in this order: lesson 1's decomposition (3e) and the equal
  // fractions (4e, no French lesson yet: « Revois d’abord » names the item itself)
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
        item: '4e.m1.r07',
        name: 'Les fractions égales',
        year: 'vu en 4e',
        home: getItem('4e.m1.r07').text,
        memo: 4,
        second: 'sort',
        // the very first question: an equal fraction to write, its DENOMINATOR asked (families.js › fracWrite, `first`)
        firstOk: (q) => q.calc?.op === 'frac' && q.calc.side === 'bottom',
      },
    ],
  },
};

// the walk's own arithmetic is checked once at load: the plaque, the bridges, the dash's six forms
if (
  reduce(255, 2958).join() !== '5,58' ||
  gcd(1786, 722) !== 38 ||
  !dashTrue('$\\dfrac{2 \\times 41 \\times 3}{2^{2} \\times 3 \\times 23} = \\dfrac{41}{\\square}$', 46) ||
  dashTrue('$\\dfrac{2 \\times 41 \\times 3}{2^{2} \\times 3 \\times 23} = \\dfrac{41}{\\square}$', 92) ||
  !dashTrue('$\\dfrac{10}{23} \\times \\dfrac{17}{20} = \\dfrac{17}{\\square}$', 46) ||
  !dashTrue('$\\dfrac{39}{\\square}$ est irréductible', 50) ||
  dashTrue('$\\dfrac{39}{\\square}$ est irréductible', 52) ||
  !dashTrue('Le numérateur de $\\dfrac{319}{551}$ rendu irréductible', 11) ||
  namedIn('3² et 23').join() !== '9,23'
)
  throw new Error('fraction-irreductible.walk: arithmetic');
