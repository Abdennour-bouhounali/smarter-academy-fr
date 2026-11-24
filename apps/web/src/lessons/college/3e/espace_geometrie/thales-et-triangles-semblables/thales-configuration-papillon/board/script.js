/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * Ported from the Algerian board of `talis-hisab-atwal` (UNIT_3E_THALES_DESIGN.md § 1, port map): its butterfly station
 * (the streets crossing at a roundabout) and its computing stations (the roof, the easel), re-numbered and re-worded; the
 * stations of its keys « configuration » (the park, the second walkway) and « k » (the yard, the painted corner) are CUT
 * — a French 3e student owns the nested figure from 4e, and k belongs to lesson 1. The hour, on figures of the class's
 * own (never the student's Nile, never a sheet of the bank), in the order of the student's world:
 *   1 `papillon` — two streets crossing at a roundabout, cut by two parallel avenues: the partner of a length from the
 *     crossing is on the SAME line, beyond the crossing (a half-turn about it gives back the nested triangles of 4e);
 *     then the scissors, where the class WRITES the brevet's sentence — both alignments, the parallel, the three ratios —
 *     before it computes (the design: K1's station carries the sentence);
 *   2 `calcul-depuis-le-sommet` — every term of a ratio is a length from the vertex: a roof truss (the nested contrast:
 *     the two pieces of the rafter joined), a garden whose path is given ACROSS the pond (the piece beyond the crossing
 *     cut off), two footpaths from one road to the other (the length across asked: computed from the vertex, then joined).
 * Each question is an `ask` that CARRIES its figure (`figure`, the data of a bank sheet's `statement.figure`: points drawn
 * to scale from the station's lengths, its parallels, its given lengths and « ? » on the one asked), drawn by the
 * practice space's StatementFigure; its words say only what the figure cannot (the story, the unit, the parallel). Its
 * cards are whole lengths (`words`); a card agrees when it is the `answer` (`lessonScripts.js › askProof`).
 *
 * The numbers are the board's own — none of the student's world (UNIT_3E_THALES_DESIGN.md § 3), no pair of the bank, of
 * the class test or of another French lesson's line — and `board.test.js` computes all of them. ONE NUMBER A LINE: a line
 * of this file never holds two of the hour's numbers; every length, option and proof is computed (`kit/exact.js`).
 * Nothing before a naming says its key's name (tested). A `cue` is at most 70 characters.
 */
import { minus, over, plus, read, tex, times, write } from '../../../../../../common/gameworld/kit/exact';
import { fr } from '../../../../../../common/gameworld/kit/authoring/numbers';

/** The keys of the lesson, in the order of the student's world (design § 2); `world/journey.js › KEYS` must be this list. */
export const KEYS = ['papillon', 'calcul-depuis-le-sommet'];
const [K1, K2] = KEYS;

/** The board's numbers, ONE a line; every other length of a station is computed from them below. */
export const BOARD = {
  /** 1 · two streets crossing at the roundabout O, cut by two parallel avenues (AB) and (CD); in metres */
  rues: {
    OA: '4,7',
    OC: '18,8',
    OB: '8',
  },
  /** 1 · a pair of scissors: the pivot O, the handles' rings A, B, the tips C, D; OB = OA, OD = OC; in millimetres */
  ciseaux: {
    OA: '28',
    OC: '44,8',
    CD: '20,8',
  },
  /** 2 · a roof truss: the tie [EF] parallel to the bottom beam [BC], E on the rafter [AB] marked from the ridge A; in metres */
  ferme: {
    AE: '2,4',
    EB: '6',
    EF: '2',
  },
  /** 2 · two garden paths crossing at the pond O, the hedge (AB) parallel to the low wall (CD); AC is given ACROSS O; in metres */
  jardin: {
    OA: '10,8',
    AC: '30,6',
    AB: '24',
  },
  /** 2 · two footpaths crossing at O between two parallel roads (AB) and (CD); the whole path [BD] is asked; in metres */
  sentiers: {
    OA: '20,3',
    OC: '29',
    OB: '35',
  },
};
const { rues: R, ciseaux: X, ferme: T, jardin: J, sentiers: P } = BOARD;

/** A number of the board as a JS number (the cards are whole lengths, `board.test.js`). */
const n = (x) => Number(write(x));
const w = (x) => write(x);
/** « $\dfrac{p}{q}$ » with its terms in LaTeX. */
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
/** « a × b over c = v », every term in LaTeX, the value computed. */
const cross = (a, b, c) => `${F(`${tex(a)} \\times ${tex(b)}`, tex(c))} = ${tex(over(times(a, b), c))}`;
/** The words of a card that is a length (never a plank's « Planche / Tient / S’effondre » — defects.md A10). */
const LENGTH = { card: 'Longueur', held: 'Elle convient', fell: 'Elle ne convient pas' };
/** The choices of an `ask`, in the order written, and its answer: the right length only (tested). */
const ask = (right, options) => ({ options: options.map(n), answer: [n(right)] });

// ── the FIGURES: drawn to scale from the station's own lengths (y up, free units); labels are the lengths as written ──
/** An exact number of the board as a JS number, for a drawing only. */
const num = (x) => {
  const r = read(x);
  return Number(r.n) / Number(r.d);
};
/** A triangle ABC drawn from its three sides: B at the origin, C along the axis, A above (the law of cosines). */
export const triangle = (AB, AC, BC) => {
  const [c, b, a] = [AB, AC, BC].map(num);
  const x = (c * c - b * b + a * a) / (2 * a);
  return { A: [x, Math.sqrt(c * c - x * x)], B: [0, 0], C: [a, 0] };
};
/** The point of [PQ] at the fraction `t` of the way from P (an exact number of the board). */
export const along = (p, q, t) => [p[0] + (q[0] - p[0]) * num(t), p[1] + (q[1] - p[1]) * num(t)];
/**
 * Two lines crossing at O (the butterfly): A and C on one, B and D on the other, each across O from its partner; the
 * line (AC) makes `turn` degrees with (BD). (AB) ∥ (CD) exactly when OC / OA = OD / OB.
 */
export const crossing = ({ OA, OC, OB, OD }, turn = 70) => {
  const u = [Math.cos((turn * Math.PI) / 180), Math.sin((turn * Math.PI) / 180)];
  const on = (v, d) => [v[0] * d, v[1] * d];
  return { O: [0, 0], A: on(u, num(OA)), C: on(u, -num(OC)), B: [num(OB), 0], D: [-num(OD), 0] };
};
/** The angle (degrees) at O of a triangle OAB whose three sides are known (the law of cosines). */
export const angleAt = (OA, OB, AB) => {
  const [a, b, c] = [OA, OB, AB].map(num);
  return (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI;
};
/** A side with its length written on it (« ? » for the one asked); `more`: parallel arrows, a side for the label… */
export const side = (from, to, label, more = {}) => ({
  from,
  to,
  label: label == null ? undefined : String(label),
  ...more,
});
export const ASKED = '?';
/** The lengths from O of a `crossing`, each written outside its two triangles (never on the other line). */
export const OUT = { OA: { labelSide: -1 }, OC: { labelSide: -1 }, OB: { labelSide: 1 }, OD: { labelSide: 1 } };
const PARALLEL = { arrows: 1 };
const SOUGHT = { arrows: 1, tone: 'indigo', bold: true };

// ── 1 · the streets: OD = OB × OC ÷ OA; the crossed partner (OC taken for OB's), the length across O as a term ──
const ru = { OD: w(over(times(R.OB, R.OC), R.OA)), AC: w(plus(R.OA, R.OC)) };
const ruCrossed = w(over(times(R.OB, R.OA), R.OC));
const ruAcross = w(over(times(R.OB, ru.AC), R.OA));
// ── 1 · the scissors: AB = CD × OA ÷ OC; the whole blade and handle AC as a term, the difference taken off ──
const ci = { AC: w(plus(X.OA, X.OC)) };
ci.AB = w(over(times(X.CD, X.OA), X.OC));
const ciAcross = w(over(times(X.CD, X.OA), ci.AC));
const ciDiff = w(minus(X.CD, minus(X.OC, X.OA)));
// ── 2 · the roof: AB = AE + EB, BC = EF × AB ÷ AE; the piece EB for AB, and EF + EB ──
const fe = { AB: w(plus(T.AE, T.EB)) };
fe.BC = w(over(times(T.EF, fe.AB), T.AE));
const fePiece = w(over(times(T.EF, T.EB), T.AE));
const feSum = w(plus(T.EF, T.EB));
// ── 2 · the garden: OC = AC − OA, CD = AB × OC ÷ OA; AC across O as a term, the difference added ──
const ja = { OC: w(minus(J.AC, J.OA)) };
ja.CD = w(over(times(J.AB, ja.OC), J.OA));
const jaAcross = w(over(times(J.AB, J.AC), J.OA));
const jaDiff = w(plus(J.AB, minus(ja.OC, J.OA)));
// ── 2 · the footpaths: OD = OB × OC ÷ OA, BD = OB + OD; OD alone (stopped at O), OB + OC (the other path's piece) ──
const se = { OD: w(over(times(P.OB, P.OC), P.OA)) };
se.BD = w(plus(P.OB, se.OD));
const seOther = w(plus(P.OB, P.OC));

/** Each station's figure (`ask.figure`), and the memo's opening of the streets (`memo.js`). */
const ruAt = crossing({ ...R, OD: ru.OD }, 64);
const ciHalf = Math.asin(num(X.CD) / 2 / num(X.OC));
/** The scissors drawn open: the pivot O, the rings A, B at the left, the tips C, D at the right (OB = OA, OD = OC). */
const ciAt = (() => {
  const [a, c, s, k] = [num(X.OA), num(X.OC), Math.sin(ciHalf), Math.cos(ciHalf)];
  return { O: [0, 0], A: [-a * k, a * s], B: [-a * k, -a * s], C: [c * k, -c * s], D: [c * k, c * s] };
})();
const feAt = triangle(fe.AB, fe.AB, fe.BC);
/** The garden: OB is not given; it only sets the angle at the pond (any OB with a real triangle draws the same story). */
const JA_OB = '20';
const jaAt = crossing(
  { OA: J.OA, OC: ja.OC, OB: JA_OB, OD: over(times(JA_OB, ja.OC), J.OA) },
  angleAt(J.OA, JA_OB, J.AB),
);
const seAt = crossing({ ...P, OD: se.OD }, 58);
export const FIGURES = {
  rues: {
    points: ruAt,
    segments: [
      side('O', 'A', R.OA, OUT.OA),
      side('O', 'C', R.OC, OUT.OC),
      side('O', 'B', R.OB, OUT.OB),
      side('O', 'D', ASKED, { tone: 'indigo', bold: true, ...OUT.OD }),
      side('A', 'B', null, PARALLEL),
      side('C', 'D', null, PARALLEL),
    ],
    labels: { O: 's' },
    ariaLabel: fr('Deux rues se coupent au rond-point O ; les avenues (AB) et (CD) sont parallèles'),
  },
  ciseaux: {
    points: ciAt,
    segments: [
      side('O', 'A', X.OA, { labelSide: 1 }),
      side('O', 'C', X.OC, { labelSide: 1 }),
      ['O', 'B'],
      ['O', 'D'],
      side('A', 'B', ASKED, { ...SOUGHT, labelSide: 1 }),
      side('C', 'D', X.CD, { ...PARALLEL, labelSide: -1 }),
    ],
    labels: { O: 'n' },
    ariaLabel: fr('Une paire de ciseaux ouverte : les lames se croisent en O, (AB) et (CD) sont parallèles'),
  },
  ferme: {
    points: {
      ...feAt,
      E: along(feAt.A, feAt.B, over(T.AE, fe.AB)),
      F: along(feAt.A, feAt.C, over(T.AE, fe.AB)),
    },
    segments: [
      side('A', 'E', T.AE),
      side('E', 'B', T.EB),
      ['A', 'C'],
      side('E', 'F', T.EF, PARALLEL),
      side('B', 'C', ASKED, SOUGHT),
    ],
    ariaLabel: fr('La ferme d’un toit ABC : l’entrait [EF] est parallèle à la poutre [BC]'),
  },
  jardin: {
    points: jaAt,
    segments: [
      side('O', 'A', J.OA, { labelSide: 1 }),
      side('A', 'C', J.AC, { labelSide: -1 }),
      ['O', 'B'],
      ['O', 'D'],
      side('A', 'B', J.AB, PARALLEL),
      side('C', 'D', ASKED, SOUGHT),
    ],
    labels: { O: 'n' },
    ariaLabel: fr('Deux allées se coupent au bassin O ; la haie (AB) et le muret (CD) sont parallèles'),
  },
  sentiers: {
    points: seAt,
    segments: [
      side('O', 'A', P.OA, OUT.OA),
      side('O', 'C', P.OC, OUT.OC),
      side('O', 'B', P.OB, OUT.OB),
      side('B', 'D', ASKED, { tone: 'indigo', bold: true, labelSide: -1 }),
      side('A', 'B', null, PARALLEL),
      side('C', 'D', null, PARALLEL),
    ],
    labels: { O: 's' },
    ariaLabel: fr('Deux sentiers se coupent en O entre les routes parallèles (AB) et (CD)'),
  },
};

/** French typography laid on the sentences of a step (`kit/authoring/numbers.js › fr`); its figure is kept as it is. */
const TEXTS = ['title', 'text', 'question', 'after', 'cue'];
const french = (s) => ({ ...s, ...Object.fromEntries(TEXTS.filter((k) => s[k]).map((k) => [k, fr(s[k])])) });

export const SCRIPT = {
  title: 'Thalès dans le papillon',
  steps: [
    // 1 · the partner on the same line, then the sentence
    {
      id: 'rues',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Deux rues et un rond-point',
      text: 'Deux rues droites se coupent au rond-point $O$ (longueurs en mètres). Les avenues $(AB)$ et $(CD)$ sont parallèles.',
      figure: FIGURES.rues,
      question: 'À quelle distance du rond-point se trouve le coin D ? Choisissez avant de vérifier.',
      ...ask(ru.OD, [ruCrossed, ru.OD, ruAcross]),
      words: LENGTH,
      after: `Un demi-tour autour de $O$ pose $OAB$ sur $[OC)$ et $[OD)$, $(AB)$ parallèle à $(CD)$ : la figure emboîtée de 4e. Donc $\\dfrac{OD}{OB} = \\dfrac{OC}{OA}$ et $OD = ${cross(R.OB, R.OC, R.OA)}$. Le partenaire de $OB$ est sur sa droite : $OD$, pas $OC$ ($${cross(R.OB, R.OA, R.OC)}$). Toute la rue $AC = ${tex(ru.AC)}$ ne part pas de $O$ : $${cross(R.OB, ru.AC, R.OA)}$.`,
      cue: 'Un demi-tour autour de O : où le petit triangle arrive-t-il ?',
    },
    {
      id: 'ciseaux',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Les ciseaux ouverts',
      text: 'Une paire de ciseaux ouverte (en millimètres) : les deux lames se croisent en $O$, et $(AB)$ est parallèle à $(CD)$.',
      figure: FIGURES.ciseaux,
      question: 'De combien les anneaux A et B sont-ils écartés ?',
      ...ask(ci.AB, [ciAcross, ciDiff, ci.AB]),
      words: LENGTH,
      after: `Les points $A$, $O$, $C$ sont alignés, ainsi que les points $B$, $O$, $D$ ; les droites $(AB)$ et $(CD)$ sont parallèles. D’après le théorème de Thalès : $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$, donc $AB = ${cross(X.CD, X.OA, X.OC)}$. Avec toute la branche $AC = ${tex(ci.AC)}$, on trouverait $${cross(X.CD, X.OA, ci.AC)}$.`,
      cue: 'Avant les rapports : quels points sont alignés ? Quelles droites ?',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: K1,
      recall: ['demi-tour', 'même droite'],
      cue: 'Dessinez un autre papillon : qui écrit ses trois rapports égaux ?',
    },
    // 2 · every length from the vertex
    {
      id: 'ferme',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'La ferme d’un toit',
      text: 'La ferme d’un toit (en mètres) : l’entrait $[EF]$ est parallèle à la poutre du bas $[BC]$, avec $E$ sur $[AB]$ et $F$ sur $[AC]$.',
      figure: FIGURES.ferme,
      question: 'Quelle est la longueur de la poutre du bas ?',
      ...ask(fe.BC, [fePiece, fe.BC, feSum]),
      words: LENGTH,
      after: `$AB = ${tex(T.AE)} + ${tex(T.EB)} = ${tex(fe.AB)}$ et $\\dfrac{BC}{EF} = \\dfrac{AB}{AE}$, donc $BC = ${cross(T.EF, fe.AB, T.AE)}$. Avec le morceau $EB$ à la place du côté $AB$ : $${cross(T.EF, T.EB, T.AE)}$, une poutre trop courte.`,
      cue: 'Le morceau EB ou le côté AB : lequel entre dans le rapport ?',
    },
    {
      id: 'jardin',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Les allées du jardin',
      text: 'Deux allées droites se coupent au bassin $O$ (en mètres). La haie $(AB)$ et le muret $(CD)$ sont parallèles.',
      figure: FIGURES.jardin,
      question: 'Quelle est la longueur du muret ?',
      ...ask(ja.CD, [jaDiff, ja.CD, jaAcross]),
      words: LENGTH,
      after: `L’allée $AC$ traverse le bassin : $OC = ${tex(J.AC)} - ${tex(J.OA)} = ${tex(ja.OC)}$. Puis $\\dfrac{CD}{AB} = \\dfrac{OC}{OA}$, donc $CD = ${cross(J.AB, ja.OC, J.OA)}$. Avec toute l’allée : $${cross(J.AB, J.AC, J.OA)}$, un muret trop long.`,
      cue: 'L’allée AC traverse le bassin : quelle longueur va dans le rapport ?',
    },
    {
      id: 'sentiers',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'D’une route à l’autre',
      text: 'Deux sentiers droits se coupent en $O$ (en mètres), entre deux routes parallèles $(AB)$ et $(CD)$.',
      figure: FIGURES.sentiers,
      question: 'Quelle est la longueur du sentier [BD], d’une route à l’autre ?',
      ...ask(se.BD, [se.OD, seOther, se.BD]),
      words: LENGTH,
      after: `$\\dfrac{OD}{OB} = \\dfrac{OC}{OA}$, donc $OD = ${cross(P.OB, P.OC, P.OA)}$, puis $BD = ${tex(P.OB)} + ${tex(se.OD)} = ${tex(se.BD)}$. $OD$ seul s’arrête au croisement ; $${tex(P.OB)} + ${tex(P.OC)} = ${tex(seOther)}$ ajoute un morceau de l’autre sentier.`,
      cue: 'Le sentier entier : quels morceaux, et lequel vient du calcul ?',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: K2,
      recall: ['morceaux', 'deux rapports'],
      cue: 'Qui invente un papillon où il faut enlever un morceau d’abord ?',
    },
    // the copybook: one page of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [K1, K2],
      cue: 'Après la copie : qui rédige la phrase du brevet sans regarder ?',
    },
  ].map(french),
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  rues: { ...ru, crossed: ruCrossed, across: ruAcross },
  ciseaux: { ...ci, across: ciAcross, difference: ciDiff },
  ferme: { ...fe, piece: fePiece, sum: feSum },
  jardin: { ...ja, across: jaAcross, difference: jaDiff },
  sentiers: { ...se, other: seOther },
};
