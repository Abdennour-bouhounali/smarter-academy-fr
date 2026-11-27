/**
 * « La leçon au tableau » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter). The kinds
 * of step and what the board does with each: `features/classSession/lessonScripts.js`. Reached only through the lesson's
 * pack (`lesson.pack.js › board.script`).
 *
 * Ported from the Algerian board of `talis-hisab-atwal` (UNIT_3E_THALES_DESIGN.md § 8bis, port map): its stations « yard »
 * (every length × k gives the corner, and its perimeter) and « corner » (from the corner back to the yard, the number turned
 * upside down) and its naming of k, REBUILT on two SEPARATE triangles — the Algerian ones share a vertex and two parallels,
 * which is the very help this lesson removes. The stations of P1, P2 and P3 are new (the DZ lesson teaches none of them).
 * The hour, on figures of the class's own (never the student's Nile, never a sheet of the bank), in the order of the
 * student's world:
 *   1 `gabarit`    P1, P4 — a mason's template and a traced triangle apart, turned: the sides of each are ranked, the
 *                  three quotients are equal, the middle side of the tracé is the template's middle side × the quotient;
 *   2 `contour`    P4 — every length of the template × k gives the tracé's, its perimeter too (DZ « yard »);
 *   3 `retour`     P4 — from the tracé back to the template the number is turned upside down (DZ « corner »);
 *   4 `name-1`     the first key — the lengths are proportional (« semblables », « homologues », k);
 *   5 `angles-1`   P2 — two triangles of cardboard: the angles of each are computed, all three are found again;
 *   6 `angles-2`   P2 — one angle in common is not enough: only one is found again;
 *   7 `name-2`     the second key — two angles are enough;
 *   8 `appariement` P3 — the homologous side of a side, by rank and never by the order of the letters;
 *   9 `rampes`     P2, P3, P4 — two roofs of the same pitch: a right angle and the same angle at the foot, the sides paired,
 *                  the height computed (the inverted pairing is the trap).
 * Each question is an `ask` that CARRIES its figure (`figure`, the data of a bank sheet's `statement.figure`: points drawn
 * to scale from the station's lengths, its given lengths and « ? » on the one asked), drawn by the practice space's
 * StatementFigure; its words say only what the figure cannot. Its cards are whole numbers (`words`); a card agrees when it
 * is the `answer` (`lessonScripts.js › askProof`).
 *
 * The numbers are the board's own — none of the student's world (UNIT_3E_THALES_DESIGN.md § 3), no pair of the bank, of
 * the class test or of another French lesson's line — and `board.test.js` computes all of them. ONE NUMBER A LINE: a line
 * of this file never holds two of the hour's numbers; every length, option and proof is computed (`kit/exact.js`).
 * Nothing before a naming says its key's name (tested). A `cue` is at most 70 characters.
 */
import { minus, over, plus, read, tex, times, write } from '../../../../../../common/gameworld/kit/exact';
import { fr } from '../../../../../../common/gameworld/kit/authoring/numbers';

/** The keys of the lesson, in the order of the student's world (design); `world/journey.js › KEYS` must be this list. */
export const KEYS = ['cotes-proportionnels', 'angles-egaux'];
const [K1, K2] = KEYS;

/** The board's numbers, ONE a line; every other length of a station is computed from them below. */
export const BOARD = {
  /** 1 · the mason's template (sides AC, AB, BC) and the tracé's shortest and longest sides; in metres */
  gabarit: {
    AC: '2',
    AB: '7,5',
    BC: '8',
    DF: '2,4',
    EF: '9,6',
  },
  /** 2 · a template (AB, AC, BC) and the tracé's side NP, placed where BC is; in metres */
  contour: {
    AB: '3,3',
    AC: '5,5',
    BC: '7,7',
    NP: '4,2',
  },
  /** 3 · k from the template to the tracé, as « p/q », and the tracé's measured side; in metres */
  retour: {
    k: '7/8',
    NP: '56',
  },
  /** 5 · two cardboard triangles: the angles of the first, one more of the second; in degrees */
  angles1: {
    A: '46',
    B: '56',
    F: '78',
  },
  /** 6 · the same first triangle, and a second one with an angle in common only; in degrees */
  angles2: {
    A: '46',
    B: '56',
    E: '61',
  },
  /** 8 · two triangles of the same shape, the second turned over: every side, in centimetres */
  appariement: {
    BC: '2',
    AB: '2,8',
    AC: '4,4',
    DE: '5',
    EF: '11',
    DF: '7',
  },
  /** 9 · two roofs of the same pitch: half-span and height of the first, half-span of the second; in metres */
  rampes: {
    AB: '3',
    BC: '4',
    DE: '6',
  },
};
const { gabarit: G, contour: C, retour: R, angles1: N1, angles2: N2, appariement: A, rampes: P } = BOARD;

/** A number of the board as a JS number (the cards are whole numbers, `board.test.js`). */
const n = (x) => Number(write(x));
const w = (x) => write(x);
/** « $\dfrac{p}{q}$ » with its terms in LaTeX. */
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
/** « a × b over c = v », every term in LaTeX, the value computed. */
const cross = (a, b, c) => `${F(`${tex(a)} \\times ${tex(b)}`, tex(c))} = ${tex(over(times(a, b), c))}`;
/** A ratio as a fraction in lowest terms, however it is written (« 6/5 », never « 0,4 »): the integer itself when whole. */
const frac = (x) => {
  const r = read(x);
  return r.d === 1n ? `${r.n}` : F(r.n, r.d);
};
/** « a over b » as a fraction of two exact numbers, and its value as a fraction: « \dfrac{2{,}4}{2} = \dfrac{6}{5} ». */
const quotient = (a, b) => `${F(tex(a), tex(b))} = ${frac(over(a, b))}`;
/** The words of a card that is a length or a number (never a plank's « Planche / Tient / S’effondre » — defects.md A10). */
const LENGTH = { card: 'Longueur', held: 'Elle convient', fell: 'Elle ne convient pas' };
const COUNT = { card: 'Nombre', held: 'Il convient', fell: 'Il ne convient pas' };
/** The choices of an `ask`, in the order written, and its answer: the right number only (tested). */
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
/** A triangle XYZ drawn from the angles at X and Y (degrees): Y at the origin, Z along the axis, X above (law of sines). */
export const fromAngles = (x, y) => {
  const rad = (d) => (d * Math.PI) / 180;
  const z = 180 - x - y;
  const [a, c] = [Math.sin(rad(x)), Math.sin(rad(z))];
  return { X: [c * Math.cos(rad(y)), c * Math.sin(rad(y))], Y: [0, 0], Z: [a, 0] };
};
/** The points of a figure turned by `turn` degrees about the origin, mirrored first when `flip`, then moved by `at`. */
export const placed = (pts, { turn = 0, flip = false, at = [0, 0], scale = 1 } = {}) => {
  const r = (turn * Math.PI) / 180;
  const [cos, sin] = [Math.cos(r), Math.sin(r)];
  return Object.fromEntries(
    Object.entries(pts).map(([k, [x, y]]) => {
      const [u, v] = [(flip ? -x : x) * scale, y * scale];
      return [k, [at[0] + u * cos - v * sin, at[1] + u * sin + v * cos]];
    }),
  );
};
/** The same points under other names: `rename({ A: 'D' })`. */
const rename = (pts, names) => Object.fromEntries(Object.entries(pts).map(([k, p]) => [names[k] ?? k, p]));
/** A side with its length written on it (« ? » for the one asked); `more`: a tone, a side for the label… */
export const side = (from, to, label, more = {}) => ({
  from,
  to,
  label: label == null ? undefined : String(label),
  ...more,
});
export const ASKED = '?';
const SOUGHT = { tone: 'indigo', bold: true };

// ── 1 · the template (AC < AB < BC) and the tracé (DF < DE < EF): k from the shortest sides, the middle one asked ──
const gaK = over(G.DF, G.AC);
const ga = { DE: w(times(G.AB, gaK)) };
const gaMix = w(over(times(G.AB, G.EF), G.AC));
const gaAvg = w(over(plus(G.DF, G.EF), '2'));
// ── 2 · the tracé is the template × k: its contour (each side × k) is the template's × k ──
const coK = over(C.NP, C.BC);
const co = { P: w(plus(plus(C.AB, C.AC), C.BC)) };
co.NP = w(times(co.P, coK));
co.MN = w(times(C.AB, coK));
co.MP = w(times(C.AC, coK));
const coEach = w(plus(co.P, times('3', minus(C.NP, C.BC))));
const coOne = w(plus(minus(co.P, C.BC), C.NP));
// ── 3 · from the tracé back to the template: × the inverse of k, not × k, not × the top of k ──
const reK = read(R.k);
const re = { BC: w(times(R.NP, over(reK.d, reK.n))) };
const reNot = w(times(R.NP, R.k));
const reTop = w(times(R.NP, String(reK.n)));
// ── 5, 6 · the angles: the third angle of each triangle, and how many angles the second finds again in the first ──
const third = (x, y) => w(minus('180', plus(x, y)));
const an1 = { C: third(N1.A, N1.B), E: third(N1.A, N1.F) };
const an2 = { C: third(N2.A, N2.B), F: third(N2.A, N2.E) };
/** How many of the angles of a triangle (a, b, c) are angles of another (x, y, z): each angle found once. */
export const common = (first, second) => {
  const rest = [...second];
  return first.filter((a) => {
    const i = rest.findIndex((b) => b === a);
    if (i < 0) return false;
    rest.splice(i, 1);
    return true;
  }).length;
};
const an1Common = common([N1.A, N1.B, an1.C], [N1.A, an1.E, N1.F]);
const an2Common = common([N2.A, N2.B, an2.C], [N2.A, N2.E, an2.F]);
// ── 8 · the homologous side of [AB] (the middle side) is the middle side of DEF, never the side that carries « D E » ──
const apK = over(A.DE, A.BC);
const ap = { DF: w(times(A.AB, apK)), EF: w(times(A.AC, apK)) };
// ── 9 · two roofs of the same pitch: height = height × half-span ÷ half-span; the inverted pairing; the difference added ──
const ra = { EF: w(over(times(P.BC, P.DE), P.AB)) };
const raTurned = w(over(times(P.BC, P.AB), P.DE));
const raAdd = w(plus(P.BC, minus(P.DE, P.AB)));

/** Each station's figure (`ask.figure`). The second triangle is turned, or flipped: never in the first one's place. */
const gaT = triangle(G.AB, G.AC, G.BC);
const gaTracé = rename(placed(triangle(ga.DE, G.DF, G.EF), { turn: -8, flip: true, at: [10, -2.4] }), {
  A: 'D',
  B: 'E',
  C: 'F',
});
const coT = triangle(C.AB, C.AC, C.BC);
const coTracé = rename(placed(triangle(co.MN, co.MP, C.NP), { at: [11, 0] }), { A: 'M', B: 'N', C: 'P' });
/** The template drawn with two sides of its own, the tracé its image × k: the same shape, to scale. */
const reT = triangle('48', '60', re.BC);
const reTracé = rename(placed(triangle(w(times('48', R.k)), w(times('60', R.k)), R.NP), { at: [70, 0] }), {
  A: 'M',
  B: 'N',
  C: 'P',
});
const an1T = rename(fromAngles(num(N1.A), num(N1.B)), { X: 'A', Y: 'B', Z: 'C' });
const an1U = rename(placed(fromAngles(num(N1.A), num(an1.E)), { turn: 15, flip: true, at: [2.1, 0.1], scale: 0.8 }), {
  X: 'D',
  Y: 'E',
  Z: 'F',
});
const an2T = an1T;
const an2U = rename(placed(fromAngles(num(N2.A), num(N2.E)), { turn: 15, flip: true, at: [2.1, 0.1], scale: 0.8 }), {
  X: 'D',
  Y: 'E',
  Z: 'F',
});
const apT = triangle(A.AB, A.AC, A.BC);
const apU = rename(placed(triangle(A.DE, A.DF, A.EF), { turn: -10, flip: true, at: [14, -1] }), {
  A: 'D',
  B: 'E',
  C: 'F',
});
const raT = { A: [0, 0], B: [num(P.AB), 0], C: [num(P.AB), num(P.BC)] };
const raU = { D: [num(P.AB) + 2, 0], E: [num(P.AB) + 2 + num(P.DE), 0], F: [num(P.AB) + 2 + num(P.DE), num(ra.EF)] };
export const FIGURES = {
  gabarit: {
    points: { ...gaT, ...gaTracé },
    segments: [
      side('A', 'B', G.AB, { labelSide: 1 }),
      side('A', 'C', G.AC, { labelSide: -1 }),
      side('B', 'C', G.BC, { labelSide: -1 }),
      side('D', 'E', ASKED, { ...SOUGHT, labelSide: -1 }),
      side('D', 'F', G.DF, { labelSide: -1 }),
      side('E', 'F', G.EF, { labelSide: -1 }),
    ],
    labels: { A: 'n', D: 's' },
    ariaLabel: fr('Le gabarit ABC et, à côté, un triangle DEF tracé sur le sable, tourné'),
  },
  contour: {
    points: { ...coT, ...coTracé },
    segments: [
      side('A', 'B', C.AB),
      side('A', 'C', C.AC, { labelSide: -1 }),
      side('B', 'C', C.BC),
      ['M', 'N'],
      ['M', 'P'],
      side('N', 'P', C.NP),
    ],
    polygons: [{ points: ['M', 'N', 'P'], tone: 'amber' }],
    labels: { A: 'n', M: 'n' },
    ariaLabel: fr('Le gabarit ABC et, à côté, son tracé MNP dans la même position ; le côté NP répond au côté BC'),
  },
  retour: {
    points: { ...reT, ...reTracé },
    segments: [['A', 'B'], ['A', 'C'], side('B', 'C', ASKED, SOUGHT), ['M', 'N'], ['M', 'P'], side('N', 'P', R.NP)],
    labels: { A: 'n', M: 'n' },
    ariaLabel: fr('Le gabarit ABC, de côté BC inconnu, et son tracé MNP dont le côté NP mesure 56 m'),
  },
  'angles-1': {
    points: { ...an1T, ...an1U },
    segments: [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'A'],
      ['D', 'E'],
      ['E', 'F'],
      ['F', 'D'],
    ],
    angles: [
      { at: 'A', from: 'B', to: 'C', label: `${N1.A}°` },
      { at: 'B', from: 'C', to: 'A', label: `${N1.B}°` },
      { at: 'D', from: 'E', to: 'F', label: `${N1.A}°` },
      { at: 'F', from: 'D', to: 'E', label: `${N1.F}°` },
    ],
    labels: { A: 'n', D: 's' },
    ariaLabel: fr('Deux triangles de carton posés côte à côte, avec leurs angles'),
  },
  'angles-2': {
    points: { ...an2T, ...an2U },
    segments: [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'A'],
      ['D', 'E'],
      ['E', 'F'],
      ['F', 'D'],
    ],
    angles: [
      { at: 'A', from: 'B', to: 'C', label: `${N2.A}°` },
      { at: 'B', from: 'C', to: 'A', label: `${N2.B}°` },
      { at: 'D', from: 'E', to: 'F', label: `${N2.A}°` },
      { at: 'E', from: 'F', to: 'D', label: `${N2.E}°` },
    ],
    labels: { A: 'n', D: 's' },
    ariaLabel: fr('Deux triangles de carton posés côte à côte, avec leurs angles'),
  },
  appariement: {
    points: { ...apT, ...apU },
    segments: [
      side('A', 'B', A.AB, { ...SOUGHT, labelSide: 1 }),
      side('A', 'C', A.AC, { labelSide: -1 }),
      side('B', 'C', A.BC, { labelSide: -1 }),
      side('D', 'E', A.DE, { labelSide: -1 }),
      side('D', 'F', A.DF, { labelSide: -1 }),
      side('E', 'F', A.EF, { labelSide: -1 }),
    ],
    labels: { A: 'n', D: 's' },
    ariaLabel: fr('Un triangle ABC et un triangle DEF de même forme, posé à l’envers ; le côté AB est marqué'),
  },
  rampes: {
    points: { ...raT, ...raU },
    segments: [
      side('A', 'B', P.AB),
      side('B', 'C', P.BC),
      ['A', 'C'],
      side('D', 'E', P.DE),
      side('E', 'F', ASKED, { ...SOUGHT, labelSide: -1 }),
      ['D', 'F'],
    ],
    rightAngles: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    ],
    angles: [
      { at: 'A', from: 'B', to: 'C', label: 'α' },
      { at: 'D', from: 'E', to: 'F', label: 'α' },
    ],
    labels: { C: 'n', F: 'n' },
    ariaLabel: fr('Deux toits de chalet en triangles rectangles, avec le même angle α au pied'),
  },
};

/** French typography laid on the sentences of a step (`kit/authoring/numbers.js › fr`); its figure is kept as it is. */
const TEXTS = ['title', 'text', 'question', 'after', 'cue'];
const french = (s) => ({ ...s, ...Object.fromEntries(TEXTS.filter((k) => s[k]).map((k) => [k, fr(s[k])])) });

export const SCRIPT = {
  title: 'Reconnaître des triangles semblables',
  steps: [
    // 1 · the sides of each triangle ranked, one number for all of them
    {
      id: 'gabarit',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Un gabarit de maçon',
      text: 'Un maçon trace sur le sable un triangle qui a la forme de son gabarit, mais tourné (longueurs en mètres).',
      figure: FIGURES.gabarit,
      question: 'Quelle longueur donner au côté marqué du tracé ?',
      ...ask(ga.DE, [gaMix, ga.DE, gaAvg]),
      words: LENGTH,
      after: `Le côté du milieu répond au côté du milieu : $${quotient(G.DF, G.AC)}$ et $${quotient(G.EF, G.BC)}$, donc $${tex(G.AB)} \\times ${frac(gaK)} = ${tex(ga.DE)}$. La carte $${tex(gaMix)}$ range le grand côté avec le petit ; la carte $${tex(gaAvg)}$ est un milieu deviné.`,
      cue: 'Les triangles sont tournés : comment retrouver le côté du milieu ?',
    },
    // 2 · every length × k, the contour too (DZ « yard »)
    {
      id: 'contour',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Un contour de corde',
      text: 'Un gabarit et son tracé sont posés côte à côte, dans la même position (mètres). Le côté $[NP]$ répond au côté $[BC]$.',
      figure: FIGURES.contour,
      question: 'Quelle longueur de corde borde le tracé tout autour ?',
      ...ask(co.NP, [coEach, co.NP, coOne]),
      words: LENGTH,
      after: `Chaque côté est multiplié par $${quotient(C.NP, C.BC)}$ : $${tex(co.P)} \\times ${frac(coK)} = ${tex(co.NP)}$. La carte $${tex(coOne)}$ ne change que $[BC]$ ; la carte $${tex(coEach)}$ retire la même longueur à chaque côté.`,
      cue: 'Un seul côté a changé, ou tous ? Que devient le contour ?',
    },
    // 3 · from the tracé back to the template (DZ « corner »): the number turned upside down
    {
      id: 'retour',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Du tracé au gabarit',
      text: `Chaque longueur du gabarit, multipliée par $${F(reK.n, reK.d)}$, donne la longueur du tracé (en mètres).`,
      figure: FIGURES.retour,
      question: 'Quelle est la longueur du côté marqué du gabarit ?',
      ...ask(re.BC, [reNot, reTop, re.BC]),
      words: LENGTH,
      after: `Du gabarit au tracé on multiplie par $${F(reK.n, reK.d)}$ ; du tracé au gabarit, par $${F(reK.d, reK.n)}$ : $${tex(R.NP)} \\times ${F(reK.d, reK.n)} = ${tex(re.BC)}$. La carte $${tex(reNot)}$ multiplie encore par $${F(reK.n, reK.d)}$ ; la carte $${tex(reTop)}$ ne multiplie que par $${reK.n}$.`,
      cue: 'Du gabarit au tracé on multiplie : et dans l’autre sens ?',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'On nomme',
      tablet: K1,
      recall: ['proportionnelles', 'trois quotients'],
      cue: 'Dessinez un autre tracé : qui écrit les trois quotients égaux ?',
    },
    // 5 · the angles of each triangle
    {
      id: 'angles-1',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Deux triangles de carton',
      text: 'Un menuisier pose côte à côte deux triangles de carton, avec les angles qu’il a mesurés (en degrés).',
      figure: FIGURES['angles-1'],
      question: 'Combien d’angles du triangle de droite sont aussi des angles du triangle de gauche ?',
      ...ask(an1Common, [1, 2, 3]),
      words: COUNT,
      after: `Les trois angles font $180°$ : $180 - ${tex(N1.A)} - ${tex(N1.B)} = ${tex(an1.C)}$ à gauche, $180 - ${tex(N1.A)} - ${tex(N1.F)} = ${tex(an1.E)}$ à droite. Ils se retrouvent tous.`,
      cue: 'Combien d’angles voit-on ? Combien faut-il en calculer ?',
    },
    {
      id: 'angles-2',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Un angle en commun',
      text: 'Le menuisier recommence avec un autre triangle de droite (angles en degrés).',
      figure: FIGURES['angles-2'],
      question: 'Combien d’angles du triangle de droite sont aussi des angles du triangle de gauche ?',
      ...ask(an2Common, [1, 2, 3]),
      words: COUNT,
      after: `$180 - ${tex(N2.A)} - ${tex(N2.B)} = ${tex(an2.C)}$ à gauche, $180 - ${tex(N2.A)} - ${tex(N2.E)} = ${tex(an2.F)}$ à droite. Un seul angle se retrouve : $${tex(N2.A)}°$. Les autres ne sont pas les mêmes, les triangles n’ont pas la même forme.`,
      cue: 'Un angle se retrouve : est-ce que cela suffit pour la forme ?',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'On nomme',
      tablet: K2,
      recall: ['deux angles', 'troisième angle'],
      cue: 'Qui choisit deux angles et fabrique un triangle de même forme ?',
    },
    // 8 · the pairing, by rank, never by the order of the letters
    {
      id: 'appariement',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Quel côté va avec quel côté ?',
      text: 'Deux triangles ont la même forme, le second est posé à l’envers (longueurs en centimètres).',
      figure: FIGURES.appariement,
      question: 'Quelle est la longueur du côté du second triangle homologue du côté AB ?',
      ...ask(ap.DF, [A.DE, ap.DF, A.EF]),
      words: LENGTH,
      after: `Dans $ABC$, $[AB]$ est le côté du milieu : son homologue est $[DF]$. $[DE]$ a le même rang dans les lettres, mais c’est le plus petit côté : $${tex(A.AB)} \\times ${frac(apK)} = ${tex(ap.DF)}$.`,
      cue: 'Les lettres se suivent : les côtés qui se ressemblent aussi ?',
    },
    // 9 · P2, P3, P4: a right angle, the same angle at the foot, the sides paired
    {
      id: 'rampes',
      kind: 'ask',
      chapter: 'On découvre',
      title: 'Deux toits de même pente',
      text: 'Deux charpentes de chalet sont des triangles rectangles, avec le même angle au pied (mètres).',
      figure: FIGURES.rampes,
      question: 'Quelle est la hauteur de la grande charpente ?',
      ...ask(ra.EF, [raTurned, raAdd, ra.EF]),
      words: LENGTH,
      after: `Un angle droit et le même angle au pied : même forme. Pied avec pied, hauteur avec hauteur : $${cross(P.BC, P.DE, P.AB)}$. La carte $${tex(raTurned)}$ associe la hauteur au pied.`,
      cue: 'Même angle au pied, un angle droit : quels côtés se répondent ?',
    },
    // the copybook: one page of two keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'On écrit',
      title: 'Dans le cahier : les clés 1 et 2',
      tablets: [K1, K2],
      cue: 'Après la copie : pourquoi la taille ne change-t-elle pas la forme ?',
    },
  ].map(french),
};

/** For the memo and the tests: what the board computes. */
export const FACTS = {
  gabarit: { ...ga, k: frac(gaK), mix: gaMix, avg: gaAvg },
  contour: { ...co, k: frac(coK), each: coEach, one: coOne },
  retour: { ...re, not: reNot, top: reTop },
  'angles-1': { ...an1, common: String(an1Common) },
  'angles-2': { ...an2, common: String(an2Common) },
  appariement: { ...ap, k: frac(apK) },
  rampes: { ...ra, turned: raTurned, add: raAdd },
};
/** The labels a card shows, for the tests. */
export const WORDS = { LENGTH, COUNT };
