/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook, no line of the exercise bank. Reached only through the lesson's pack (`lesson.pack.js ›
 * board.memo`). The teacher is « vous »; the board's numbers come from `script.js › BOARD` (one place), the openings, the
 * exit ticket and the extension have their own. ONE NUMBER A LINE where a line is data; a sentence is built from them.
 *
 * Each opening CARRIES its figure (`figure`, the data of a bank sheet's `statement.figure`, drawn by the practice space's
 * StatementFigure — `MemoFigures.jsx`; the geometry opening of CLASS_SESSION.md §2quater): the streets are the board's own
 * (`script.js › FIGURES`), the tent and the two ladders are drawn here to scale from their numbers, with « ? » on the
 * length asked. Ported from the Algerian memo of `talis-hisab-atwal` (its park, its yard and the k are cut).
 */
import { minus, over, plus, read, tex, times, write } from '../../../../../../common/gameworld/kit/exact';
import { frAll } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { ASKED, BOARD, FACTS, FIGURES, side } from './script';

const { rues: R, ciseaux: X, ferme: T, jardin: J, sentiers: P } = BOARD;
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
/** « a × b over c = v », every term in LaTeX, the value computed. */
const cross = (a, b, c) => `${F(`${tex(a)} \\times ${tex(b)}`, tex(c))} = ${tex(over(times(a, b), c))}`;
/** A length in plain words, with its unit after a no-break space (« 4,7 m »). */
const len = (x, unit) => `${write(x)} ${unit}`;

/** The two openings the board does not play: a tent's guy rope over a stick (4e), two ladders crossing in an alley. */
const TENT = {
  AM: '1,3',
  AB: '5,2',
  MN: '1,1',
};
const LADDERS = {
  OA: '2',
  OC: '5',
  AB: '1,6',
};

/** The tent: the peg A, the stick [MN] and the pole [BC], both upright; the pole's height is computed, then drawn. */
const tentPole = write(over(times(TENT.MN, TENT.AB), TENT.AM));
/** An exact number as a JS number, for a drawing only. */
const num = (x) => Number(read(x).n) / Number(read(x).d);
const at = (x, y = 0) => [num(x), num(y)];
const TENT_FIGURE = {
  points: { A: at(0), M: at(TENT.AM), N: at(TENT.AM, TENT.MN), B: at(TENT.AB), C: at(TENT.AB, tentPole) },
  segments: [
    side('A', 'M', TENT.AM),
    side('A', 'B', TENT.AB, { labelSide: 1 }),
    side('M', 'N', TENT.MN, { labelSide: 1 }),
    side('B', 'C', ASKED, { tone: 'indigo', bold: true }),
    ['A', 'C'],
  ],
  rightAngles: [
    ['A', 'M', 'N'],
    ['A', 'B', 'C'],
  ],
  labels: { N: 'n' },
  ariaLabel: 'Le hauban [AC] d’une tente ; le bâton [MN] et le mât [BC] sont verticaux',
};
/** The ladders: ladder 1 [AC] from the foot A of wall 1 to the point C of wall 2, ladder 2 [BD] from B on wall 1 to the foot D. */
const ladderCD = write(over(times(LADDERS.AB, LADDERS.OC), LADDERS.OA));
const ladderAC = plus(LADDERS.OA, LADDERS.OC);
/** The width of the alley: ladder 1 is the hypotenuse of the wall's height CD and the alley (Pythagoras), for the drawing. */
const ALLEY = Math.sqrt(num(ladderAC) ** 2 - num(ladderCD) ** 2);
const LADDERS_FIGURE = (() => {
  const t = num(over(LADDERS.OA, ladderAC));
  const C = [ALLEY, num(ladderCD)];
  return {
    points: { A: [0, 0], B: [0, num(LADDERS.AB)], C, D: [ALLEY, 0], O: [C[0] * t, C[1] * t] },
    segments: [
      side('O', 'A', LADDERS.OA, { labelSide: 1 }),
      side('O', 'C', LADDERS.OC, { labelSide: 1 }),
      ['O', 'B'],
      ['O', 'D'],
      side('A', 'B', LADDERS.AB, { arrows: 1, labelSide: -1 }),
      side('D', 'C', ASKED, { arrows: 1, tone: 'indigo', bold: true, labelSide: 1 }),
    ],
    labels: { O: 'e' },
    ariaLabel: 'Deux échelles [AC] et [BD] se croisent en O entre deux murs verticaux (AB) et (CD)',
  };
})();

/** The opening situations a teacher may choose from, each with its figure. */
const OPENINGS = [
  {
    id: 'rues',
    kind: 'thales',
    board: true,
    title: 'Deux rues et un rond-point',
    figure: FIGURES.rues,
    story: `Deux rues droites se coupent à un rond-point. Deux avenues parallèles les coupent, l’une de chaque côté. Vers la première, ${len(R.OA, 'm')} sur une rue et ${len(R.OB, 'm')} sur l’autre ; vers la seconde, ${len(R.OC, 'm')} sur la première rue.`,
    ask: 'À quelle distance du rond-point la seconde avenue coupe-t-elle l’autre rue ?',
    why: 'C’est la situation de la leçon au tableau : la figure de 4e, mais les points sont passés de l’autre côté du rond-point. Un demi-tour la ramène aux triangles emboîtés.',
    expect: `Beaucoup associent ${len(R.OB, 'm')} à ${len(R.OC, 'm')}, la longueur qui « lui fait face », et trouvent ${len(FACTS.rues.crossed, 'm')} ; d’autres prennent toute la rue, ${len(FACTS.rues.AC, 'm')}, et trouvent ${len(FACTS.rues.across, 'm')}. La bonne réponse est ${len(FACTS.rues.OD, 'm')}.`,
  },
  {
    id: 'tente',
    kind: 'thales',
    board: false,
    title: 'Le hauban de la tente',
    figure: TENT_FIGURE,
    story: `Un hauban est tendu du haut du mât d’une tente jusqu’à un piquet planté à ${len(TENT.AB, 'm')} du pied du mât. À ${len(TENT.AM, 'm')} du piquet, un bâton vertical de ${len(TENT.MN, 'm')} touche le hauban.`,
    ask: 'Quelle est la hauteur du mât ? Et si le piquet était planté de l’autre côté du bâton ?',
    why: 'Elle part de la figure de 4e, que la classe possède : le bâton et le mât sont parallèles car tous deux verticaux. La seconde question ouvre le papillon.',
    expect: `La plupart trouvent ${len(tentPole, 'm')} ; certains soustraient ou ajoutent des longueurs. À la seconde question, on cherche où va le triangle.`,
  },
  {
    id: 'echelles',
    kind: 'thales',
    board: false,
    title: 'Deux échelles dans une ruelle',
    figure: LADDERS_FIGURE,
    story: `Dans une ruelle, deux échelles s’appuient sur deux murs verticaux et se croisent. Sur la première, ${len(LADDERS.OA, 'm')} du pied au croisement et ${len(LADDERS.OC, 'm')} du croisement au mur d’en face. La seconde touche le premier mur à ${len(LADDERS.AB, 'm')} du sol.`,
    ask: 'À quelle hauteur la première échelle touche-t-elle le mur d’en face ?',
    why: 'Les deux murs sont parallèles, et les deux échelles se croisent : un papillon debout, sans qu’aucune droite ne soit dessinée d’avance.',
    expect: `Certains écrivent un rapport avec toute l’échelle, ${len(ladderAC, 'm')} ; la hauteur cherchée est ${len(ladderCD, 'm')}.`,
  },
];

/** The exit ticket's own numbers: a butterfly length, then a length given across the vertex. */
const EXIT = {
  OE: '3',
  OG: '8',
  EF: '2,7',
};
const EXIT_ACROSS = {
  OA: '4',
  AC: '9',
  OB: '2,8',
};
const exitGH = write(over(times(EXIT.EF, EXIT.OG), EXIT.OE));
const exitOC = write(minus(EXIT_ACROSS.AC, EXIT_ACROSS.OA));
const exitOD = write(over(times(EXIT_ACROSS.OB, exitOC), EXIT_ACROSS.OA));
/** The extension's numbers: the second avenue twice as far; the scissors opened wider. */
const FARTHER = times(R.OC, '2');
const WIDER = '41,6';

export const MEMO = frAll({
  title: 'Thalès dans le papillon',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève reconnaît deux triangles en papillon, rédige la phrase qui justifie l’égalité des trois rapports, associe chaque longueur à celle de la même droite et calcule une longueur en partant du sommet, même quand la longueur donnée traverse le point d’intersection.',
    idea: 'Un demi-tour autour du point d’intersection ramène le papillon aux triangles emboîtés de 4e : les trois rapports restent égaux. Chaque longueur se lit depuis le sommet et va avec celle de la même droite ; une longueur qui traverse le sommet se coupe en deux morceaux.',
    trap: 'Associer une longueur à celle qui lui « fait face » sur le dessin au lieu de celle de la même droite, mettre dans un rapport une longueur qui traverse le sommet, oublier de recoller ou d’enlever un morceau, ou écrire l’égalité sans citer les alignements et le parallélisme.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      `Pourquoi, dans les deux rues, $OD = ${cross(R.OB, R.OC, R.OA)}$ et non $${cross(R.OB, R.OA, R.OC)}$ ?`,
      'Quelle phrase faut-il écrire avant les trois rapports égaux, et que cite-t-elle ?',
      `Dans le jardin, pourquoi calcule-t-on $OC = ${tex(J.AC)} - ${tex(J.OA)} = ${tex(FACTS.jardin.OC)}$ avant d’écrire les rapports ?`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD — one per savoir-faire of the lesson ──
  criteria: [
    {
      can: 'Reconnaît une configuration en papillon et rédige la phrase : les deux alignements, le parallélisme, puis l’égalité des trois rapports.',
      see: 'Pour les ciseaux, il écrit « $A$, $O$, $C$ alignés ; $B$, $O$, $D$ alignés ; $(AB) \\parallel (CD)$ », puis $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$.',
    },
    {
      can: 'Associe chaque longueur à celle de la même droite, de l’autre côté du sommet, et choisit l’ordre des longueurs dans les rapports.',
      see: `Dans les deux rues, il écrit $\\dfrac{OD}{OB} = \\dfrac{OC}{OA}$, puis $OD = ${cross(R.OB, R.OC, R.OA)}$.`,
    },
    {
      can: 'Calcule une longueur en partant du sommet : il recolle deux morceaux ou enlève celui d’en face avant de garder deux rapports.',
      see: `Dans le jardin, $OC = ${tex(J.AC)} - ${tex(J.OA)} = ${tex(FACTS.jardin.OC)}$ puis $CD = ${cross(J.AB, FACTS.jardin.OC, J.OA)}$.`,
    },
  ],
  stands:
    'Le théorème de Thalès dans les triangles emboîtés et le calcul d’une longueur avec ses morceaux (4e), la quatrième proportionnelle et le produit en croix (4e), le demi-tour, c’est-à-dire la symétrie centrale (5e). Le papillon, sa phrase et le choix des longueurs depuis le sommet sont nouveaux.',
  // ── several opening situations, each drawn ──
  openings: OPENINGS,
  // ── the hour, as the class session runs it: launch → explore → summarize ──
  phases: [
    {
      moment: 'start',
      name: 'Test de début',
      min: 7,
      aim: 'Où en est la classe avant la leçon ?',
      teacher: 'Vous donnez la souris à l’élève dont c’est le tour, sans corriger encore.',
      class: 'Chacun répond sous son nom ; les équipes cumulent leurs points.',
      watch:
        'La quatrième proportionnelle et la figure emboîtée de 4e : si la moitié de la classe hésite, prolongez les règles revues.',
    },
    {
      moment: 'revise',
      name: 'Les règles revues',
      min: 5,
      aim: 'On rappelle ce dont on aura besoin.',
      teacher:
        'Vous choisissez un lecteur ou lisez vous-même ; demandez un exemple avant de montrer celui de la carte.',
      class: 'Les élèves lisent la règle et donnent un exemple à eux.',
      watch: 'Le produit en croix : quels deux nombres on multiplie, et par lequel on divise.',
    },
    {
      moment: 'lesson',
      name: 'La leçon au tableau',
      min: 25,
      aim: 'La classe propose une longueur sur chaque figure, la justifie par les rapports, puis chaque règle reçoit son nom.',
      teacher:
        'Avant chaque vérification, demandez « Qui propose une longueur ? Pourquoi ? » ; ne donnez pas la règle, faites lire chaque longueur avec sa partenaire.',
      class:
        'Les élèves proposent des longueurs, associent chacune à sa partenaire, rédigent la phrase des ciseaux, puis voient laquelle convient ; ensuite seulement la règle prend son nom.',
      watch: 'L’élève qui associe deux longueurs « face à face » : demandez-lui sur quelle droite se trouve chacune.',
    },
    {
      moment: 'end',
      name: 'Test de fin',
      min: 8,
      aim: 'Qu’a changé la séance ?',
      teacher: 'Vous comparez « au début » et « maintenant », et nommez ceux qui ont progressé.',
      class: 'Les élèves répondent aux questions de la nouvelle leçon.',
      watch: 'Le savoir-faire resté fragile devient le travail du lendemain.',
    },
  ],
  // ── what students will likely say or do, and the question for each ──
  anticipated: [
    {
      kind: 'right',
      says: `« $\\dfrac{OD}{OB} = \\dfrac{OC}{OA}$, donc $OD = ${cross(R.OB, R.OC, R.OA)}$ ».`,
      assess: 'Pourquoi as-tu le droit d’écrire cette égalité ? Que faut-il dans la figure ?',
      advance: 'Et si on te donnait toute la rue au lieu de la longueur depuis le rond-point ?',
    },
    {
      kind: 'right',
      says: `« $AB = ${tex(T.AE)} + ${tex(T.EB)} = ${tex(FACTS.ferme.AB)}$, puis $BC = ${cross(T.EF, FACTS.ferme.AB, T.AE)}$ ».`,
      assess: 'Pourquoi recolles-tu les deux morceaux avant d’écrire le rapport ?',
      advance: 'Dans le papillon, la longueur qui traverse le sommet : la recolles-tu aussi ?',
    },
    {
      kind: 'miss',
      says: `« $OD = ${cross(R.OB, R.OA, R.OC)}$ ».`,
      assess: 'Sur quelle droite se trouve le point $D$ ? Et le point $C$ ?',
      advance: 'Fais tourner le petit triangle d’un demi-tour autour de $O$ : sur quel point arrive $B$ ?',
    },
    {
      kind: 'miss',
      says: `« $CD = ${cross(J.AB, J.AC, J.OA)}$ », avec toute l’allée.`,
      assess: 'L’allée $AC$ part-elle du bassin ?',
      advance: 'Quel morceau de l’allée part du bassin vers le muret ?',
    },
    {
      kind: 'miss',
      says: `« $BD = ${cross(P.OB, P.OC, P.OA)}$ », sans le morceau $OB$.`,
      assess: 'Le sentier s’arrête-t-il au croisement ?',
      advance: 'De quels morceaux le sentier $[BD]$ est-il fait ?',
    },
    {
      kind: 'miss',
      says: '« $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$ », sans phrase avant.',
      assess: 'Qu’est-ce qui te permet d’écrire cette égalité ?',
      advance: 'Quels points sont alignés, et quelles droites sont parallèles ?',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord les deux rues : la partenaire d’une longueur est sur la même droite, de l’autre côté du rond-point ; un demi-tour ramène la figure de 4e.',
    'Puis les ciseaux : la phrase avant les rapports, les deux alignements et le parallélisme.',
    'On nomme : le théorème de Thalès dans le papillon.',
    'Puis la ferme du toit : le côté entier depuis le sommet, les deux morceaux recollés.',
    'Puis le jardin et les sentiers : une longueur qui traverse le sommet se coupe, une longueur cherchée à travers le sommet se recolle.',
    'On nomme : chaque longueur part du sommet.',
  ],
  connect: `Le papillon et les triangles emboîtés sont la même figure à un demi-tour près : dans les deux, chaque rapport compare deux longueurs depuis le sommet, sur la même droite. Dans les deux rues : $${F(R.OC, R.OA)} = ${tex(over(R.OC, R.OA))}$, et chaque longueur du petit triangle, multipliée par $${tex(over(R.OC, R.OA))}$, donne sa partenaire.`,
  // ── what is written, the short check, support and extension ──
  written: [
    'Si les points $A$, $O$, $C$ sont alignés, ainsi que les points $B$, $O$, $D$, et si $(AB) \\parallel (CD)$, alors $\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$.',
    `Ciseaux : $AB = ${cross(X.CD, X.OA, X.OC)}$ mm.`,
    `Chaque longueur part du sommet : $OC = ${tex(J.AC)} - ${tex(J.OA)} = ${tex(FACTS.jardin.OC)}$, puis $CD = ${cross(J.AB, FACTS.jardin.OC, J.OA)}$.`,
  ],
  exit: [
    {
      q: `Les points $E$, $O$, $G$ sont alignés, ainsi que $F$, $O$, $H$, et $(EF) \\parallel (GH)$. $OE = ${tex(EXIT.OE)}$, $OG = ${tex(EXIT.OG)}$ et $EF = ${tex(EXIT.EF)}$. Calcule $GH$.`,
      a: `$\\dfrac{GH}{EF} = \\dfrac{OG}{OE}$, donc $GH = ${cross(EXIT.EF, EXIT.OG, EXIT.OE)}$.`,
    },
    {
      q: `Les points $A$, $O$, $C$ sont alignés, ainsi que $B$, $O$, $D$, avec $O$ entre les deux autres, et $(AB) \\parallel (CD)$. $OA = ${tex(EXIT_ACROSS.OA)}$, $AC = ${tex(EXIT_ACROSS.AC)}$ et $OB = ${tex(EXIT_ACROSS.OB)}$. Calcule $OD$.`,
      a: `$OC = ${tex(EXIT_ACROSS.AC)} - ${tex(EXIT_ACROSS.OA)} = ${tex(exitOC)}$, puis $OD = ${cross(EXIT_ACROSS.OB, exitOC, EXIT_ACROSS.OA)}$.`,
    },
    {
      q: 'Les droites $(KM)$ et $(LN)$ se coupent en $P$, et $(KL) \\parallel (MN)$. Rédige la phrase qui permet d’écrire l’égalité des trois rapports, puis écris-la.',
      a: 'Les points $K$, $P$, $M$ sont alignés, ainsi que les points $L$, $P$, $N$ ; les droites $(KL)$ et $(MN)$ sont parallèles. D’après le théorème de Thalès : $\\dfrac{PK}{PM} = \\dfrac{PL}{PN} = \\dfrac{KL}{MN}$.',
    },
  ],
  support: [
    'Repasser d’une même couleur chaque longueur et sa partenaire, sur la même droite, avant d’écrire les rapports.',
    'Lire chaque longueur depuis le sommet : si l’énoncé donne une longueur qui le traverse, enlever le morceau d’en face.',
    'Refaire le demi-tour sur papier calque : le petit triangle vient se poser dans le grand.',
  ],
  extend: [
    `Dans les deux rues, si la seconde avenue coupait la première rue à $${tex(FARTHER)}$ m du rond-point, à quelle distance couperait-elle l’autre ?`,
    'Dans un papillon, quand a-t-on $AB = CD$ ? Que dire alors du quadrilatère $ABCD$ ?',
    `Les ciseaux s’ouvrent davantage : $CD = ${tex(WIDER)}$ mm. De combien les anneaux sont-ils écartés ?`,
  ],
  extendCheck: {
    farther: { OB: R.OB, OA: R.OA, OC: write(FARTHER), OD: write(over(times(R.OB, FARTHER), R.OA)) },
    wider: { OA: X.OA, OC: X.OC, CD: WIDER, AB: write(over(times(WIDER, X.OA), X.OC)) },
  },
  next: 'La séance suivante : « Prouver que deux droites sont parallèles » — quand les rapports égaux disent-ils que deux droites sont parallèles ?',
});

/** For the tests: the openings' and the exit ticket's numbers, computed here. */
export const MEMO_FACTS = {
  tent: { ...TENT, BC: tentPole },
  ladders: { ...LADDERS, CD: ladderCD, AC: write(ladderAC) },
  exit: { ...EXIT, GH: exitGH },
  exitAcross: { ...EXIT_ACROSS, OC: exitOC, OD: exitOD },
};
