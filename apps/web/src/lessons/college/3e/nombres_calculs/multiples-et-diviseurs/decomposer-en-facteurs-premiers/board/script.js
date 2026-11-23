/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * The hour opens on the carpenter of the board (his OWN gap of 168 cases, never the student's story): a plank of 5 falls.
 * Then the four keys, in the order of the student's world, each met by ONE factor ladder made for it (the station
 * `ladder`: the class proposes the next plank, the board lays it, the gap becomes the number of planks laid) and PROVED
 * by what the board builds before its name:
 *   1 the ladder of 168 with planks 2 to 9: the class may lay 4 or 6 — the proof writes the row of the shortest planks
 *     and shows that 4, 6 and 9 no longer hold once the planks of 2 are laid (`plus-petit-premier`);
 *   2 the ladder of 720: its row counted plank by plank (« 4 planches de 2 »), the class writes it shorter — and
 *     2 × 2 × 2 × 2 = 16, not 2 × 4 (`puissances`);
 *   3 the ladder of 534 leaves 89, which no short plank breaks: after 7, a plank of 11 would need fewer than 11
 *     planks — a shorter one would have held already (`arret`);
 *   4 a gap of 2 387 cases: the sheet of remainders, three sheets shorter and shorter (`tableur`).
 * No `forge` / `bridges` step: the four keys are forged by each student in his world. Every question is about planks
 * over a gap: the board's own words (« planche », « fossé », « case ») are right here — this lesson's decomposition IS a
 * ladder of planks in its world. The numbers are the board's own (`BOARD`), never the story's nor a number of the lesson's
 * exercise bank; `board.test.js` computes every one of them. A `cue` is at most 70 characters; nothing the class reads
 * before a name holds that name (the words of each key are listed in the test).
 */
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { sheetOf, zerosOf } from '../../../../../../common/gameworld/divisorIsles/sheet';
import { counted, PLANKS, listFr } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { formatFr, texFr } from '@smarter-academy/core';
import {
  rowGroups,
  groupText,
  productTex,
  ladderCells,
} from '../../../../../../../features/classSession/lessonScripts';

/** The four keys of the lesson (the tablets of the student's world), in order. */
export const KEYS = ['plus-petit-premier', 'puissances', 'arret', 'tableur'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter's gap, and the plank he tries first (it falls). */
  situation: { a: 168, b: 5 },
  /** 1 · the ladder of 168: planks from 2 to 9 (4, 6 and 9 among them — the class may lay them). */
  first: { n: 168, rack: [2, 3, 4, 5, 6, 7, 9], composite: [4, 6, 9] },
  /** 2 · a long row: 720, written shorter. */
  row: { n: 720, rack: [2, 3, 4, 5, 6, 9] },
  /** 3 · 534 leaves 89, which no short plank breaks. */
  stop: { n: 534, rack: [2, 3, 5, 7, 11, 13] },
  /** 4 · a gap too long for planks tried by hand: the sheet of remainders. */
  sheet: { n: 2387 },
};
const { situation: S, first: F, row: R, stop: P, sheet: H } = BOARD;

const tex = (xs) => productTex(xs);
/** The gap left after every plank of p that holds, starting from n. */
const peel = (n, p) => {
  let m = n;
  while (m % p === 0) m /= p;
  return m;
};

// 1 · after the planks of 2, what is left; and the planks of the rack that are themselves made of shorter planks
const F_FACTORS = primeFactors(F.n);
const F_LEFT = peel(F.n, 2);
const F_NOT = F.composite.filter((d) => F_LEFT % d !== 0);
const F_SPLIT = F.composite.map((d) => `$${d} = ${tex(primeFactors(d))}$`);

// 2 · the row of 720, counted
const R_GROUPS = rowGroups(primeFactors(R.n));
const R_TWO = R_GROUPS.find((g) => g.p === 2);
const R_VALUES = R_GROUPS.map((g) => g.p ** g.k);
/** « 2 planches de 3 : 3 × 3 = 9 » for every other plank laid more than once. */
const R_MORE = R_GROUPS.filter((g) => g !== R_TWO && g.k > 1)
  .map((g) => `${groupText(g)} : $${tex(Array(g.k).fill(g.p))} = ${g.p ** g.k}$`)
  .join('. ');

// 3 · 534: the gap no short plank breaks, the last plank worth trying, the next one and its count
const P_LEFT = primeFactors(P.n).at(-1);
const P_LAST = Math.max(...P.rack.filter((d) => d * d <= P_LEFT));
const P_NEXT = Math.min(...P.rack.filter((d) => d * d > P_LEFT));
/** « 89 = 7 × 12 + 5 » — every quotient and remainder computed. */
const division = (n, d) => `${texFr(n)} = ${d} \\times ${Math.floor(n / d)} + ${n % d}`;

// 4 · the sheets of 2 387: each sheet, its first 0, what is left
export function sheets(n) {
  const out = [];
  let m = n;
  while (m > 1) {
    const lines = sheetOf(m);
    const zero = zerosOf(lines)[0] ?? null;
    out.push({ n: m, lines: lines.length, zero, after: zero ? m / zero : 1 });
    m = zero ? m / zero : 1;
  }
  return out;
}
const H_SHEETS = sheets(H.n);

export const SCRIPT = {
  title: 'Décomposer un nombre en facteurs premiers',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'On découvre',
      title: `Un fossé de ${ladderCells(S.a)}`,
      text: `Le menuisier doit franchir un fossé de ${ladderCells(S.a)}, mais il n’a que des planches courtes, de 2 à 9 cases. Une planche qui tient découpe le fossé : il reste à franchir autant de cases que de planches posées.`,
      question: `La planche de ${S.b} tient-elle sur ce fossé ?`,
      bridge: { a: S.a, b: S.b },
      cue: 'Avant de poser : qui prévoit ? Quelles planches tiendraient ?',
    },
    // 1 · the ladder of 168
    {
      id: 'echelle',
      kind: 'ladder',
      chapter: 'On découvre',
      title: 'Le fossé, planche après planche',
      text: `On pose une planche sur le fossé de ${F.n}. Si elle tient, le fossé devient le nombre de planches posées, et on recommence jusqu’à un fossé de 1 case.`,
      question: 'Quelle planche posons-nous maintenant ?',
      n: F.n,
      rack: F.rack,
      after: `Avec les planches les plus courtes : $${texFr(F.n)} = ${tex(F_FACTORS)}$. Après les planches de 2, il reste ${ladderCells(F_LEFT)} : ni ${F_NOT.join(', ni ')} n’y tiennent. Et une planche de ${listFr(F.composite).replace(' et ', ' ou ')} se pose en planches plus courtes : ${listFr(F_SPLIT)}.`,
      cue: 'Une planche de 4 : par quelles planches plus courtes la remplacer ?',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[0],
      recall: ['plus petit nombre premier', 'tant qu’il le divise'],
      cue: 'Et pour 220 : quelle planche d’abord, et combien de fois ?',
    },
    // 2 · the row of 720, counted and written shorter
    {
      id: 'rangee',
      kind: 'ladder',
      chapter: 'On découvre',
      title: 'Une longue rangée',
      text: `Un fossé de ${ladderCells(R.n)}. On le découpe jusqu’à 1 case, puis on regarde la rangée des planches posées.`,
      question: 'Comment écrire cette rangée plus court ?',
      n: R.n,
      rack: R.rack,
      group: true,
      after: `La rangée : $${texFr(R.n)} = ${tex(primeFactors(R.n))}$. ${groupText(R_TWO)} : $${tex(Array(R_TWO.k).fill(2))} = ${2 ** R_TWO.k}$, et non $2 \\times ${R_TWO.k} = ${2 * R_TWO.k}$. ${R_MORE}. Puis $${tex(R_VALUES)} = ${texFr(R.n)}$.`,
      cue: `${groupText(R_TWO)} : comment l’écrire avec un seul 2 ?`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[1],
      recall: ['une seule fois', 'exposant'],
      cue: 'Que vaut 2³ ? Pourquoi pas 6 ?',
    },
    // 3 · 534 leaves 89
    {
      id: 'reste',
      kind: 'ladder',
      chapter: 'On découvre',
      title: 'Un fossé qui résiste',
      text: `Un fossé de ${ladderCells(P.n)}. Après quelques planches, il reste un fossé qu’aucune planche courte ne découpe.`,
      question: `Sur ${P_LEFT}, faut-il essayer toutes les planches jusqu’à ${P_LEFT} ?`,
      n: P.n,
      rack: P.rack,
      whole: true,
      after: `$${division(P_LEFT, P_LAST)}$ et $${division(P_LEFT, P_NEXT)}$ : avec une planche de ${P_NEXT} ou plus, il faudrait moins de ${counted(P_NEXT, PLANKS)} — une planche plus courte aurait déjà tenu. Reste la planche de tout le fossé : $${texFr(P.n)} = ${tex(primeFactors(P.n))}$.`,
      cue: `Sur ${P_LEFT}, après la planche de ${P_LAST} : laquelle vaut encore la peine ?`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[2],
      recall: ['carré du diviseur', 'ne dépasse pas'],
      cue: 'Pour 157 : quelles planches faut-il essayer, au plus ?',
    },
    // 4 · 2 387 and its sheets
    {
      id: 'feuille',
      kind: 'ladder',
      chapter: 'On découvre',
      title: 'Un très long fossé',
      text: `Un fossé de ${ladderCells(H.n)}. Une feuille de calcul écrit en colonne B le reste de la division du fossé par chaque nombre de la colonne A.`,
      question: 'Quelle ligne découpe le fossé ?',
      n: H.n,
      sheet: {},
      after: `${H_SHEETS.map((s) => (s.zero ? `${counted(s.lines, ['ligne', 'lignes'])} pour ${formatFr(s.n)}, 0 en face de ${s.zero}` : `aucun reste nul pour ${formatFr(s.n)}`)).join(' ; ')} : $${texFr(H.n)} = ${tex(primeFactors(H.n))}$.`,
      cue: 'Combien de divisions la feuille a-t-elle faites pour nous ?',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'On nomme',
      tablet: KEYS[3],
      recall: ['première ligne', 'recommence'],
      cue: 'Un nombre à quatre chiffres : que lit-on, puis que fait-on ?',
    },
    // the copybook: two pages of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: 'Après la copie : qui décompose 220 sans regarder le tableau ?',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 3 et 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: 'Après la copie : qui redit les quatre clés sans regarder ?',
    },
  ],
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  first: { factors: F_FACTORS, left: F_LEFT, not: F_NOT },
  row: R_GROUPS,
  stop: { left: P_LEFT, last: P_LAST, next: P_NEXT },
  sheets: H_SHEETS,
};
