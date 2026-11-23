/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * Ported from the boards of the three Algerian lessons (`qasim-mushtarak-akbar`, `tayin-pgcd`, `bahth-pgcd`): their
 * `ask` stations for the kept keys, re-numbered and re-worded; the stations of the cut keys (differences, the divisors of
 * the PGCD, the race of the two algorithms) are not ported. The decompositions (K3), which DZ lacks, use lesson 1's
 * `ladder` station. The hour opens on the carpenter of the board (his OWN two gaps, 70 and 98 cases, never the student's
 * story): ONE plank length must fill both, and the plank of 10, which fills the first, falls on the second. Then the four
 * keys, in the order of the student's world, each PROVED by what the board builds before its name:
 *   1 the planks that fill 70, tried on 98 — then the planks of 98 from 14 up, tried on 70: 14 is the longest
 *     (`diviseurs-communs`);
 *   2 baskets of clementines and kiwis: the counts that share the 44 clementines, tried on the 66 kiwis — the cards and
 *     verdicts speak of baskets (`words`, A10) (`lots-identiques`);
 *   3 the two ladders of 910 and 1 950, then the planks of 1 950 tried on 910: 130 = 2 × 5 × 13 is the longest; 325
 *     asks two planks of 5 where 910 has one, 39 a plank of 3 that 910 has not (`pgcd-facteurs`);
 *   4 two long gaps, 2 173 and 1 517: the divisions are written row by row, and of the numbers they write only the last
 *     remainder that is not 0 fills 2 173 (`euclide`).
 * MISSING ON THE BOARD (reported, not bent — as in DZ's `bahth-pgcd`): a station that runs Euclid's divisions row by row
 * (the class says each row, the board writes it). The nearest honest version is used: the first rows are written in the
 * station's text, the class continues them with the pen (the cue asks it), and the `ask` proves which number is the plank.
 * No `forge` / `bridges` step: the keys are forged by each student in his world. The numbers are the board's own
 * (`BOARD`), never the story's nor a number of the lesson's exercise bank; `board.test.js` computes every one of them.
 * A `cue` is at most 70 characters; nothing the class reads before a name holds that name (the words of each key are
 * listed in the test).
 */
import { listFr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { formatFr, texFr } from '@smarter-academy/core';
import { ladderCells, productTex } from '../../../../../../../features/classSession/lessonScripts';

/** The four keys of the lesson (the tablets of the student's world), in the order of his road. */
export const KEYS = ['diviseurs-communs', 'lots-identiques', 'pgcd-facteurs', 'euclide'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter's two gaps, and the plank he tries first: it fills the first, it falls on the second. */
  situation: { a: 98, b: 10, other: 70 },
  /** 1 · the planks that fill 70, tried on 98; then the planks of 98 from the longest common one up, tried on 70. */
  common: { a: 98, other: 70, options: [2, 5, 7, 10, 14, 35] },
  longest: { a: 70, other: 98 },
  /** 2 · the baskets: clementines and kiwis, the counts that share the clementines. */
  baskets: { clementines: 44, kiwis: 66, options: [2, 4, 11, 22, 44] },
  /** 3 · two gaps decomposed on two ladders, then the planks of the second tried on the first. */
  factors: { a: 910, b: 1950, rack: [2, 3, 5, 7, 11, 13], options: [26, 39, 65, 130, 325] },
  /** 4 · two long gaps: the divisions, row by row. */
  euclid: { a: 2173, b: 1517 },
};
const { situation: S, common: C, longest: G, baskets: P, factors: F, euclid: E } = BOARD;

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
const misses = (a, list) => list.filter((o) => a % o !== 0);
const pgcd = (a, b) => `\\text{PGCD}(${texFr(a)} ; ${texFr(b)})`;
/** « n = d1 × k1 = d2 × k2 … », every factor computed. */
const chain = (n, ds) => `${texFr(n)} = ${ds.map((d) => `${texFr(d)} \\times ${texFr(n / d)}`).join(' = ')}`;
/** « n = d × q + r », computed. */
const rest = (n, d) => `${texFr(n)} = ${texFr(d)} \\times ${Math.floor(n / d)} + ${texFr(n % d)}`;
const divRow = ([x, y, q, r]) => `${texFr(x)} = ${texFr(y)} \\times ${q} + ${texFr(r)}`;
/** Formulas one after the other, joined by « ; ». */
const rows = (fs) => fs.map((f) => `$${f}$`).join('\u202f; ');
/** The planks of n that are at least `lo` (computed). */
const from = (n, lo) => divisorsOf(n).filter((d) => d >= lo);
const fr = (xs) => listFr(xs.map((x) => formatFr(x)));

// 1 · the planks that fill both gaps, and the longest
const COMMON = divisorsOf(S.other).filter((d) => S.a % d === 0);
const G1 = gcd(S.a, S.other);
const LONG = from(G.other, G1);

// 2 · the baskets
const BASKETS = fills(P.kiwis, P.options);
const MOST = gcd(P.clementines, P.kiwis);
/** The words of the basket station's cards (an `ask` step's `words`): the choices are basket counts, not planks (A10). */
const BASKET_WORDS = { card: 'Paniers', held: 'Rien ne reste', fell: 'Il reste des fruits' };

// 3 · the two ladders and the longest plank of both
const FA = primeFactors(F.a);
const FB = primeFactors(F.b);
const G3 = gcd(F.a, F.b);
const F_FILL = fills(F.a, F.options);
const F_MISS = misses(F.a, F.options);
/** « 2² × 3 × 5 » with powers: the factor ladder's row written shorter (lesson 1). */
const powersTex = (xs) =>
  [...new Set(xs)]
    .map((p) => {
      const k = xs.filter((x) => x === p).length;
      return k > 1 ? `${p}^{${k}}` : `${p}`;
    })
    .join(' \\times ');

// 4 · Euclid's divisions
const EU = divisions(E.a, E.b);
const G4 = gcd(E.a, E.b);
/** The numbers the divisions write: the divisor, then every remainder before 0. */
const EU_NUMS = [E.b, ...EU.map((r) => r[3]).filter((r) => r > 0)];

export const SCRIPT = {
  title: 'Trouver le PGCD de deux nombres',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'On découvre',
      title: 'Deux fossés, une seule longueur de planche',
      text: `Le menuisier doit franchir deux fossés, l’un de ${ladderCells(S.other)}, l’autre de ${ladderCells(S.a)}. Il ne fabrique qu’une seule longueur de planche pour les deux, et il veut poser le moins de planches possible. La planche de ${S.b} remplit le premier fossé : $${chain(S.other, [S.b])}$.`,
      question: `La planche de ${S.b} remplit-elle aussi le fossé de ${S.a} ?`,
      bridge: { a: S.a, b: S.b },
      cue: 'Avant de poser : qui prévoit ? Quelle planche irait aux deux ?',
    },
    // 1 · the planks that fill both gaps
    {
      id: 'deux-fosses',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Les planches des deux fossés',
      text: `Toutes ces planches remplissent le fossé de ${S.other} : $${chain(S.other, C.options)}$.`,
      question: `Lesquelles remplissent aussi le fossé de ${C.a} ?`,
      a: C.a,
      options: C.options,
      answer: fills(C.a, C.options),
      after: `${rows(misses(C.a, C.options).map((d) => rest(C.a, d)))}. Les planches qui remplissent les deux fossés : ${fr(COMMON)}.`,
      cue: 'A-t-on oublié une planche qui remplit les deux fossés ?',
    },
    {
      id: 'la-plus-longue',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Moins de planches à poser',
      text: `Avec la planche de 7 : $${S.other} = 7 \\times ${S.other / 7}$ et $${S.a} = 7 \\times ${S.a / 7}$, soit ${S.other / 7 + S.a / 7} planches. Les planches du fossé de ${G.other} à partir de ${G1} : $${chain(G.other, LONG)}$.`,
      question: `Lesquelles remplissent aussi le fossé de ${G.a} ?`,
      a: G.a,
      options: LONG,
      answer: fills(G.a, LONG),
      after: `La planche de ${G1} seulement : $${chain(G.a, [G1])}$, soit ${G.a / G1 + G.other / G1} planches en tout. Aucune planche plus longue ne remplit les deux fossés : ${G1} est la plus longue.`,
      cue: `Pourquoi suffit-il d’essayer les planches de ${G.other} à partir de ${G1} ?`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[0],
      recall: ['PGCD'],
      cue: 'Quels sont les diviseurs communs de 15 et 25 ? Et leur PGCD ?',
    },
    // 2 · identical baskets
    {
      id: 'paniers',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Des paniers tous pareils',
      text: `Une marchande a ${P.clementines} clémentines et ${P.kiwis} kiwis. Elle veut des paniers tous pareils, avec tous ses fruits. Ces nombres de paniers partagent les clémentines : $${chain(P.clementines, P.options)}$.`,
      question: 'Quels nombres de paniers partagent aussi les kiwis ?',
      a: P.kiwis,
      options: P.options,
      answer: BASKETS,
      words: BASKET_WORDS,
      after: `${fr(BASKETS)} paniers : ce nombre divise ${P.clementines} et ${P.kiwis}. Le plus de paniers : $${pgcd(P.clementines, P.kiwis)} = ${MOST}$, avec ${P.clementines / MOST} clémentines et ${P.kiwis / MOST} kiwis dans chacun.`,
      cue: `Pourquoi pas ${P.options[1]} paniers ? Que contient un panier sur ${MOST} ?`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[1],
      recall: ['identiques'],
      cue: '32 cahiers et 24 stylos en lots identiques : combien de lots ?',
    },
    // 3 · two ladders, then the longest plank of both
    {
      id: 'echelle-1',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `Le fossé de ${formatFr(F.a)}`,
      text: `Deux fossés trop longs pour essayer chaque planche : ${ladderCells(F.a)} et ${ladderCells(F.b)}. On découpe d’abord le fossé de ${formatFr(F.a)}, planche après planche, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.a,
      rack: F.rack,
      group: true,
      after: `La rangée : $${texFr(F.a)} = ${productTex(FA)}$, soit $${texFr(F.a)} = ${powersTex(FA)}$.`,
      cue: `Quelles planches de la rangée de ${formatFr(F.a)} reviennent plusieurs fois ?`,
    },
    {
      id: 'echelle-2',
      kind: 'ladder',
      chapter: 'On découvre',
      title: `Le fossé de ${formatFr(F.b)}`,
      text: `Puis le fossé de ${ladderCells(F.b)}, planche après planche, jusqu’à 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.b,
      rack: F.rack,
      group: true,
      after: `La rangée : $${texFr(F.b)} = ${productTex(FB)}$, soit $${texFr(F.b)} = ${powersTex(FB)}$.`,
      cue: 'Quelles planches retrouve-t-on dans les deux rangées ?',
    },
    {
      id: 'facteurs',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'La plus longue planche des deux rangées',
      text: `$${texFr(F.a)} = ${powersTex(FA)}$ et $${texFr(F.b)} = ${powersTex(FB)}$. Ces planches remplissent le fossé de ${formatFr(F.b)} : $${chain(F.b, F.options)}$.`,
      question: `Lesquelles remplissent aussi le fossé de ${formatFr(F.a)} ?`,
      a: F.a,
      options: F.options,
      answer: F_FILL,
      after: `$39 = 3 \\times 13$ : il faut une planche de 3, et la rangée de ${formatFr(F.a)} n’en a pas. $325 = 5^{2} \\times 13$ : il faut deux planches de 5, et la rangée de ${formatFr(F.a)} n’en a qu’une. La plus longue : $${pgcd(F.a, F.b)} = ${powersTex(primeFactors(G3))} = ${G3}$.`,
      cue: 'Combien de planches de 5 dans chaque rangée ? Et dans la planche ?',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[2],
      recall: ['facteurs premiers'],
      cue: 'Quel est le PGCD de 2³ × 5 et de 2² × 3 × 5 ? Pourquoi ?',
    },
    // 4 · two long gaps: the divisions
    {
      id: 'divisions',
      kind: 'ask',
      chapter: 'On découvre',
      title: `Deux fossés de ${formatFr(E.a)} et ${formatFr(E.b)} cases`,
      text: `Les rangées seraient longues à trouver. On divise : ${rows([divRow(EU[0]), divRow(EU[1])])}. Puis on divise encore le diviseur par le reste, jusqu’à un reste 0.`,
      question: `Lequel de ces nombres remplit le fossé de ${formatFr(E.a)} ?`,
      a: E.a,
      options: EU_NUMS,
      answer: fills(E.a, EU_NUMS),
      after: `${rows(EU.slice(2).map(divRow))}. Et $${chain(E.a, [G4])}$, $${chain(E.b, [G4])}$ : la planche de ${G4} remplit les deux fossés. Chaque division garde les mêmes planches communes : $${pgcd(E.a, E.b)} = ${pgcd(EU[1][0], EU[1][1])} = ${G4}$.`,
      cue: 'Qui écrit la division suivante au tableau ? Quand s’arrête-t-on ?',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[3],
      // a word of the tablet's LINES (the title is not blanked): « Euclide » is only in its title
      recall: ['dernier reste'],
      cue: 'Avec les divisions : quel est le PGCD de 187 et 51 ?',
    },
    // the copybook: two pages of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: 'Après la copie : qui trouve le PGCD de 15 et 25 sans regarder ?',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 3 et 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: 'Après la copie : quand décomposer, quand diviser ?',
    },
  ],
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  common: COMMON,
  first: G1,
  longest: LONG,
  baskets: { fill: BASKETS, most: MOST, each: [P.clementines / MOST, P.kiwis / MOST] },
  factors: { a: FA, b: FB, gcd: G3, fill: F_FILL, miss: F_MISS },
  euclid: { rows: EU, numbers: EU_NUMS, gcd: G4 },
};
