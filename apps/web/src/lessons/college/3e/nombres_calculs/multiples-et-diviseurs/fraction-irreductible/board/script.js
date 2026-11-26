/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * Ported from the board of the Algerian lesson `ikhtizal-kasr` (the same four keys, in the order the owner validated:
 * P2 strike, P1 finished, P4 at once, P3 after a calculation), rewritten from its job: DZ's successive-division method
 * becomes the striking of common PRIME factors (lesson 1's ladder, used twice), and the board's own French numbers
 * replace its. The idea of the student's world, on the board's own numbers: a bridge whose stretch is LIT; the sign of
 * the bridge is the fraction « lit cells over all the cells ». A plank rewrites the sign only when it fills BOTH the lit
 * stretch and the whole bridge. The hour opens on the carpenter of the board (a bridge of 84 cases, 36 of them lit —
 * never the student's story): his plank of 7 fills the bridge, not the lit stretch. Then the four keys, each PROVED by
 * what the board builds before its name:
 *   1 the two ladders of 490 and 686, then the planks of 490 tried on 686: 14, 49 and 98 fill both, and 98 = 2 × 7² is
 *     made of the factors the two ladders share — as often as both hold them: 490/686 = 5/7 (`simplifier-facteurs`);
 *   2 91 lit of 124: of the planks of 91 only the plank of 1 fills 124, though neither number is prime (`irreductible`);
 *   3 627 lit of 726: Euclid's divisions, then the planks of 627 tried on 726: 11 and 33 fill both; 33, the PGCD, writes
 *     19/22 in ONE division, where 11 leaves 57/66 to go on (`diviser-par-le-pgcd`);
 *   4 a product computed, 11/20 × 34/55 = 374/1100: the planks 11 and 22 fill both, and the product is written 17/50
 *     although each fraction of the calculation was already finished (`resultat-irreductible`).
 * No `forge` / `bridges` step: the keys are forged by each student in his world. What the board cannot draw (no station
 * has it): a bridge with its LIT stretch and a fraction with its bar under a bridge — the nearest honest version is the
 * one of the Algerian board and of lesson 2: the options are planks OF THE LIT STRETCH (written with their equalities in
 * the text), tried on the WHOLE bridge (`a`); the fractions are formulas of the text and of `after`. The numbers are the
 * board's own (`BOARD`), never the story's, never a headline of the lesson's exercise bank nor of another lesson's;
 * `board.test.js` computes every one of them. A `cue` is at most 70 characters, holds no formula; nothing the class reads
 * before a name holds that name (the words of each key are listed in the test).
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { ladderCells, productTex } from '../../../../../../../features/classSession/lessonScripts';

/** The four keys of the lesson (the tablets of the student's world), in the order of his road. */
export const KEYS = ['simplifier-facteurs', 'irreductible', 'diviser-par-le-pgcd', 'resultat-irreductible'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter: a bridge of 84 cases, 36 lit; his plank of 7 fills the bridge, not the lit stretch. */
  situation: { lit: 36, whole: 84, first: 7 },
  /** 1 · the two ladders, then six planks of the lit stretch tried on the bridge. */
  factors: { lit: 490, whole: 686, rack: [2, 3, 5, 7], options: [10, 14, 35, 49, 70, 98] },
  /** 2 · 91 lit of 124: neither number is prime, and only the plank 1 fills both. */
  stays: { lit: 91, whole: 124, options: [1, 7, 13, 91] },
  /** 3 · 627 lit of 726: Euclid's divisions, then four planks of the lit stretch tried on the bridge. */
  pgcd: { lit: 627, whole: 726, options: [11, 19, 33, 57] },
  /** 4 · the product 11/20 × 34/55 = 374/1100: four planks of the lit stretch tried on the bridge. */
  product: { x: [11, 20], y: [34, 55], options: [11, 17, 22, 34] },
};
const { situation: S, factors: F, stays: K, pgcd: P, product: R } = BOARD;

export const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const divisorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
/** The prime factors of n, smallest first. */
export function primeFactors(n) {
  const out = [];
  let m = n;
  for (let d = 2; m > 1; d += 1)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  return out;
}
/** Euclid's divisions: [dividend, divisor, quotient, remainder] rows, down to the remainder 0. */
export function divisions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    out.push([x, y, Math.floor(x / y), x % y]);
    [x, y] = [y, x % y];
  }
  return out;
}
const fills = (a, list) => list.filter((o) => a % o === 0);
const pgcd = (a, b) => `\\text{PGCD}(${texFr(a)} ; ${texFr(b)})`;
const frac = (n, d) => `\\frac{${texFr(n)}}{${texFr(d)}}`;
/** « n = d1 × k1 = d2 × k2 … », every factor computed. */
const chain = (n, ds) => `${texFr(n)} = ${ds.map((d) => `${texFr(d)} \\times ${texFr(n / d)}`).join(' = ')}`;
/** « n = d × q + r », computed. */
const rest = (n, d) => `${texFr(n)} = ${texFr(d)} \\times ${Math.floor(n / d)} + ${texFr(n % d)}`;
const divRow = ([x, y, q, r]) => `${texFr(x)} = ${texFr(y)} \\times ${q} + ${texFr(r)}`;
/** Formulas one after the other, joined by « ; ». */
const rows = (fs) => fs.map((f) => `$${f}$`).join(' ; ');
/** « 2² × 5 × 7 » with powers: the factor ladder's row written shorter (lesson 1). */
const powersTex = (xs) =>
  [...new Set(xs)]
    .map((p) => {
      const k = xs.filter((x) => x === p).length;
      return k > 1 ? `${p}^{${k}}` : `${p}`;
    })
    .join(' \\times ');

// 1 · the two ladders: what both rows hold, as often as both hold it
const FA = primeFactors(F.lit);
const FB = primeFactors(F.whole);
const G1 = gcd(F.lit, F.whole);
const F_FILL = fills(F.whole, F.options);
const F_MISS = F.options.filter((o) => !F_FILL.includes(o));
const SHARED = primeFactors(G1);

// 2 · the fraction that stays
const K_FILL = fills(K.whole, K.options);
const K_G = gcd(K.lit, K.whole);

// 3 · Euclid's divisions, then the planks of 627 tried on 726
const EU = divisions(P.lit, P.whole);
const EU_G = gcd(P.lit, P.whole);
const P_FILL = fills(P.whole, P.options);

// 4 · a product computed
const R_N = R.x[0] * R.y[0];
const R_D = R.x[1] * R.y[1];
const R_FILL = fills(R_D, R.options);
const R_G = gcd(R_N, R_D);

export const SCRIPT = {
  title: 'Rendre une fraction irréductible',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'On découvre',
      title: 'Un pont et sa pancarte',
      text: `Le menuisier a un pont de ${ladderCells(S.whole)}, dont ${ladderCells(S.lit)} sont éclairées : sur sa pancarte, il lit $${frac(S.lit, S.whole)}$. Il voudrait écrire la pancarte avec des nombres plus petits, en posant des planches toutes de la même longueur. La planche de ${S.first} remplit le pont : $${chain(S.whole, [S.first])}$.`,
      question: `La planche de ${S.first} remplit-elle aussi la partie éclairée ?`,
      bridge: { a: S.lit, b: S.first },
      cue: 'Avant de poser : où finit la lumière ? Quelle planche irait ?',
    },
    // 1 · the two ladders, then the planks of the lit stretch tried on the bridge
    {
      id: 'echelle-1',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `La partie éclairée : ${formatFr(F.lit)}`,
      text: `Un grand pont de ${ladderCells(F.whole)}, dont ${ladderCells(F.lit)} sont éclairées : $${frac(F.lit, F.whole)}$. Trop de planches à essayer une par une : on découpe d’abord les ${ladderCells(F.lit)} de la partie éclairée, planche après planche, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.lit,
      rack: F.rack,
      group: true,
      // the lit stretch is not a gap to cross (gate B, 2026-11-26): the box says what it holds
      words: { start: 'Partie éclairée :', gap: 'Encore à découper :', crossed: 'Découpée jusqu’à 1 case' },
      after: `La rangée : $${texFr(F.lit)} = ${productTex(FA)}$, soit $${texFr(F.lit)} = ${powersTex(FA)}$.`,
      cue: 'Quelle planche essayer d’abord ? Pourquoi ?',
    },
    {
      id: 'echelle-2',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `Le pont entier : ${formatFr(F.whole)}`,
      text: `Puis le pont entier, ${ladderCells(F.whole)}, planche après planche, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.whole,
      rack: F.rack,
      group: true,
      // the whole bridge, cut plank after plank
      words: { start: 'Pont entier :', gap: 'Encore à découper :', crossed: 'Découpé jusqu’à 1 case' },
      after: `La rangée : $${texFr(F.whole)} = ${productTex(FB)}$, soit $${texFr(F.whole)} = ${powersTex(FB)}$.`,
      cue: 'Que retrouve-t-on dans les deux rangées ? Combien de fois ?',
    },
    {
      id: 'facteurs',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Des planches faites avec les deux rangées',
      text: `$${texFr(F.lit)} = ${powersTex(FA)}$ et $${texFr(F.whole)} = ${powersTex(FB)}$. Ces planches remplissent la partie éclairée : $${chain(F.lit, F.options)}$.`,
      question: `Lesquelles remplissent aussi le pont de ${ladderCells(F.whole)} ?`,
      a: F.whole,
      options: F.options,
      answer: F_FILL,
      after: `$${powersTex(SHARED)} = ${G1}$ : $${texFr(F.lit)} = ${G1} \\times ${F.lit / G1}$ et $${texFr(F.whole)} = ${G1} \\times ${F.whole / G1}$. Sur les rangées : $${frac(F.lit, F.whole)} = ${frac(`${powersTex(FA)}`, `${powersTex(FB)}`)} = ${frac(F.lit / G1, F.whole / G1)}$.`,
      cue: 'Pourquoi 10 ne remplit-il pas le pont, alors que 14 oui ?',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[0],
      recall: ['facteurs premiers'],
      cue: 'Fraction 45/60 : quels facteurs premiers sont des deux côtés ?',
    },
    // 2 · the fraction that stays: only the plank 1 fills both
    {
      id: 'reste',
      kind: 'ask',
      chapter: 'On découvre',
      title: `Un pont : ${K.lit} cases éclairées sur ${K.whole}`,
      text: `Un pont de ${ladderCells(K.whole)}, dont ${ladderCells(K.lit)} sont éclairées : $${frac(K.lit, K.whole)}$. Les planches de la partie éclairée : $${chain(K.lit, [1, 7])}$.`,
      question: `Lesquelles remplissent aussi le pont de ${ladderCells(K.whole)} ?`,
      a: K.whole,
      options: K.options,
      answer: K_FILL,
      after: `${rows(K.options.filter((o) => o > 1 && o < K.whole).map((d) => rest(K.whole, d)))}. La planche de 1 seule : $${pgcd(K.lit, K.whole)} = ${K_G}$, bien que $${K.lit} = 7 \\times 13$ et $${K.whole} = 2^{2} \\times 31$ ne soient pas des nombres premiers.`,
      cue: 'Et la fraction 5/7 de la station d’avant : peut-on continuer ?',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[1],
      recall: ['PGCD'],
      cue: 'Fraction 55/84 : quels facteurs premiers sur chaque ligne ?',
    },
    // 3 · Euclid's divisions, then the planks of the lit stretch tried on the bridge: the longest is the PGCD
    {
      id: 'pgcd',
      kind: 'ask',
      chapter: 'On découvre',
      title: `Un pont : ${P.lit} cases éclairées sur ${P.whole}`,
      // two lines and no fraction, the title says the bridge: the four plank cards keep their height (2026-11-26 walk:
      // three lines and a tall `after` pushed each card's equation and verdict out of it); the `after` writes the fraction
      text: `On divise comme Euclide : ${rows(EU.slice(0, 2).map(divRow))} ; … jusqu’au reste 0. Ces planches remplissent la partie éclairée : $${chain(P.lit, P.options)}$.`,
      question: `Lesquelles remplissent aussi le pont de ${ladderCells(P.whole)} ?`,
      a: P.whole,
      options: P.options,
      answer: P_FILL,
      after: `${rows(EU.slice(2).map(divRow))} : $${pgcd(P.whole, P.lit)} = ${EU_G}$, la plus longue planche commune : $${frac(P.lit, P.whole)} = \\frac{${texFr(P.lit)} \\div ${EU_G}}{${texFr(P.whole)} \\div ${EU_G}} = ${frac(P.lit / EU_G, P.whole / EU_G)}$ ; avec ${P_FILL[0]}, il resterait $${frac(P.lit / P_FILL[0], P.whole / P_FILL[0])}$ à continuer.`,
      cue: 'Que reste-t-il à faire si on prend 11 au lieu de 33 ?',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[2],
      recall: ['PGCD'],
      cue: 'Fraction 54/90 : par quel nombre diviser les deux termes ?',
    },
    // 4 · a product computed: its writing is a fraction to look at again
    {
      id: 'produit',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Le produit de deux fractions',
      text: `Un élève calcule $${frac(...R.x)} \\times ${frac(...R.y)} = ${frac(R_N, R_D)}$. Un pont de ${ladderCells(R_D)}, dont ${ladderCells(R_N)} sont éclairées. Ces planches remplissent la partie éclairée : $${chain(R_N, R.options)}$.`,
      question: `Lesquelles remplissent aussi le pont de ${ladderCells(R_D)} ?`,
      a: R_D,
      options: R.options,
      answer: R_FILL,
      after: `$${texFr(R_N)} = ${R_G} \\times ${R_N / R_G}$ et $${texFr(R_D)} = ${R_G} \\times ${R_D / R_G}$ : la planche de ${R_G} remplit les deux. Le calcul s’écrit $${frac(...R.x)} \\times ${frac(...R.y)} = ${frac(R_N, R_D)} = ${frac(R_N / R_G, R_D / R_G)}$, alors que chaque fraction du calcul était déjà finie.`,
      cue: 'A-t-on le droit de s’arrêter à ce produit ? Que manque-t-il ?',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[3],
      recall: ['facteur premier commun'],
      cue: '5/18 + 7/18 : peut-on s’arrêter à 12/18 ?',
    },
    // the copybook: two pages of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: 'Après la copie : qui écrit 45/60 avec les facteurs premiers ?',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 3 et 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: 'Après la copie : quand diviser par le PGCD, quand reprendre ?',
    },
  ],
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  factors: { a: FA, b: FB, gcd: G1, shared: SHARED, fill: F_FILL, miss: F_MISS, reduced: [F.lit / G1, F.whole / G1] },
  stays: { fill: K_FILL, gcd: K_G },
  euclid: { rows: EU, gcd: EU_G, fill: P_FILL, reduced: [P.lit / EU_G, P.whole / EU_G] },
  product: { n: R_N, d: R_D, fill: R_FILL, gcd: R_G, reduced: [R_N / R_G, R_D / R_G] },
  /** The divisors of the lit stretch of K3, for the memo. */
  litDivisors: divisorsOf(P.lit),
};
