/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook, no line of the exercise bank. Reached only through the lesson's pack (`lesson.pack.js ›
 * board.memo`). The teacher is « vous »; the board's numbers come from `script.js › BOARD` (one place), the openings, the
 * exit ticket and the extension have their own. ONE NUMBER A LINE where a line is data; a sentence is built from them.
 *
 * Each opening CARRIES its figure (`figure`, the data of a bank sheet's `statement.figure`, drawn by the practice space's
 * StatementFigure — `MemoFigures.jsx`): the template is the board's own (`script.js › FIGURES`), the two pennants and the
 * two shadows are drawn here to scale from their numbers, with « ? » on the length asked. Ported from the Algerian memo
 * of `talis-hisab-atwal`, its lines on the number k (the yard, the painted corner, enlargement and reduction), rebuilt on
 * two separate triangles; its park, its roof and its easel (Thalès in nested triangles) are cut.
 */
import { minus, over, plus, read, tex, times, write } from '../../../../../../common/gameworld/kit/exact';
import { frAll } from '../../../../../../common/gameworld/kit/authoring/numbers';
import { ASKED, BOARD, FACTS, FIGURES, placed, side, triangle } from './script';

const { gabarit: G, contour: C, retour: R } = BOARD;
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
/** « a × b over c = v », every term in LaTeX, the value computed. */
const cross = (a, b, c) => `${F(`${tex(a)} \\times ${tex(b)}`, tex(c))} = ${tex(over(times(a, b), c))}`;
/** « a over b = v », every term in LaTeX. */
const quotient = (a, b) => {
  const r = read(over(a, b));
  return `${F(tex(a), tex(b))} = ${r.d === 1n ? r.n : F(r.n, r.d)}`;
};
/** The two sides the pennants' ratio is read on, and what adding the difference would give. */
const gabaritAdd = write(plus(G.AB, minus(G.DF, G.AC)));
/** A length in plain words, with its unit after a no-break space (« 4,7 m »). */
const len = (x, unit) => `${write(x)} ${unit}`;

/** The two openings the board does not play: two pennants of a regatta, a lamp-post and a stick in the sun. */
const PENNANT = {
  AB: '1,2',
  AC: '1,8',
  BC: '2,1',
  DE: '4',
  DF: '6',
};
const SHADOW = {
  stick: '1',
  shadow: '1,2',
  post: '7,2',
};
/** The pennants: the small one A B C, the big one D E F, the longest side of the big one asked. */
const pennantEF = write(over(times(PENNANT.BC, PENNANT.DE), PENNANT.AB));
const pennantK = over(PENNANT.DE, PENNANT.AB);
const PENNANT_FIGURE = (() => {
  const small = triangle(PENNANT.AB, PENNANT.AC, PENNANT.BC);
  const big = placed(triangle(PENNANT.DE, PENNANT.DF, pennantEF), { turn: 20, at: [5, 0] });
  return {
    points: { ...small, D: big.A, E: big.B, F: big.C },
    segments: [
      side('A', 'B', PENNANT.AB, { labelSide: 1 }),
      side('A', 'C', PENNANT.AC, { labelSide: -1 }),
      side('B', 'C', PENNANT.BC, { labelSide: -1 }),
      side('D', 'E', PENNANT.DE, { labelSide: -1 }),
      side('D', 'F', PENNANT.DF, { labelSide: -1 }),
      side('E', 'F', ASKED, { tone: 'indigo', bold: true }),
    ],
    labels: { A: 'n', D: 'n' },
    ariaLabel: 'Deux fanions de régate de même forme : le petit ABC, le grand DEF dont le plus long côté est cherché',
  };
})();
/** The shadows: a stick and its shadow, a lamp-post and its shadow, both standing on level ground. */
const postHeight = write(over(times(SHADOW.post, SHADOW.stick), SHADOW.shadow));
const num = (x) => Number(read(x).n) / Number(read(x).d);
const SHADOW_FIGURE = {
  points: {
    A: [0, 0],
    B: [num(SHADOW.shadow), 0],
    C: [0, num(SHADOW.stick)],
    D: [num(SHADOW.shadow) + 1.5, 0],
    E: [num(SHADOW.shadow) + 1.5 + num(SHADOW.post), 0],
    F: [num(SHADOW.shadow) + 1.5, num(postHeight)],
  },
  segments: [
    side('A', 'C', SHADOW.stick, { labelSide: -1 }),
    side('A', 'B', SHADOW.shadow, { labelSide: -1 }),
    ['B', 'C'],
    side('D', 'F', ASKED, { tone: 'indigo', bold: true, labelSide: -1 }),
    side('D', 'E', SHADOW.post),
    ['E', 'F'],
  ],
  rightAngles: [
    ['B', 'A', 'C'],
    ['E', 'D', 'F'],
  ],
  labels: { C: 'n', F: 'n' },
  ariaLabel: 'Un bâton vertical et son ombre, un lampadaire vertical et son ombre, au même moment',
};

/** The opening situations a teacher may choose from, each with its figure. */
const OPENINGS = [
  {
    id: 'gabarit',
    kind: 'triangles',
    board: true,
    title: 'Un gabarit de maçon',
    figure: FIGURES.gabarit,
    story: `Un maçon trace sur le sable un triangle qui a la forme de son gabarit, mais tourné. Le gabarit a pour côtés ${len(G.AC, 'm')}, ${len(G.AB, 'm')} et ${len(G.BC, 'm')} ; le plus petit côté du tracé mesure ${len(G.DF, 'm')} et le plus grand ${len(G.EF, 'm')}.`,
    ask: 'Quelle longueur donner au troisième côté du tracé ? Et comment les associe-t-on aux côtés du gabarit ?',
    why: 'C’est la situation de la leçon au tableau : deux triangles qui n’ont rien en commun, ni sommet ni parallèle. Rien ne dit quel côté va avec quel côté : il faut les ranger.',
    expect: `Beaucoup ajoutent la différence ${len(minus(G.DF, G.AC), 'm')} des petits côtés et trouvent ${len(gabaritAdd, 'm')} ; d’autres rangent le grand côté du tracé avec le petit côté du gabarit et trouvent ${len(FACTS.gabarit.mix, 'm')}. La bonne réponse est ${len(FACTS.gabarit.DE, 'm')}.`,
  },
  {
    id: 'fanions',
    kind: 'triangles',
    board: false,
    title: 'Deux fanions de régate',
    figure: PENNANT_FIGURE,
    story: `Un club de voile coud deux fanions de la même forme. Le petit a pour côtés ${len(PENNANT.AB, 'm')}, ${len(PENNANT.AC, 'm')} et ${len(PENNANT.BC, 'm')}. Sur le grand, le plus petit côté mesure ${len(PENNANT.DE, 'm')} et le côté du milieu ${len(PENNANT.DF, 'm')}.`,
    ask: 'Quelle est la longueur du plus grand côté du grand fanion ?',
    why: 'Elle reprend la leçon avec un agrandissement, et deux longueurs données sur le grand triangle : on cherche le nombre qui passe de l’un à l’autre, puis on l’applique au plus grand côté.',
    expect: `Le nombre est $${tex(pennantK)}$, le plus grand côté mesure ${len(pennantEF, 'm')}. Certains ajoutent ${len(minus(PENNANT.DE, PENNANT.AB), 'm')} au plus grand côté du petit fanion.`,
  },
  {
    id: 'ombres',
    kind: 'triangles',
    board: false,
    title: 'Un lampadaire et un bâton',
    figure: SHADOW_FIGURE,
    story: `Au même moment de la journée, un bâton vertical de ${len(SHADOW.stick, 'm')} projette une ombre de ${len(SHADOW.shadow, 'm')} sur le sol. L’ombre d’un lampadaire vertical mesure ${len(SHADOW.post, 'm')}.`,
    ask: 'Quelle est la hauteur du lampadaire ? Pourquoi les deux triangles ont-ils la même forme ?',
    why: 'Elle ouvre la seconde clé : les rayons du soleil sont parallèles, les deux triangles ont un angle droit et le même angle au sol, donc deux angles égaux.',
    expect: `La hauteur est ${len(postHeight, 'm')}. Certains associent la hauteur d’un triangle à l’ombre de l’autre et divisent à l’envers.`,
  },
];

/** The exit ticket's own numbers: a length by the quotient of the sides, the angles of two triangles, a pairing by letters. */
const EXIT = {
  A1: '3',
  A2: '5,4',
  A3: '8,1',
  B1: '5',
  B2: '9',
};
const exitK = over(EXIT.B1, EXIT.A1);
const exitB3 = write(times(EXIT.A3, exitK));
const EXIT_ANGLES = {
  x: '30',
  y: '57',
};
const exitZ = write(minus('180', plus(EXIT_ANGLES.x, EXIT_ANGLES.y)));
/** The extension's numbers: the tracé of the board's template with another shortest side. */
const EXTEND = { shortest: '6' };
const extendLongest = write(over(times(EXTEND.shortest, G.BC), G.AC));

export const MEMO = frAll({
  title: 'Reconnaître des triangles semblables',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève reconnaît deux triangles semblables, posés n’importe où, par les longueurs de leurs côtés ou par deux angles égaux, associe les sommets et les côtés homologues, et calcule une longueur avec le nombre k qui passe de l’un à l’autre.',
    idea: 'Deux triangles ont la même forme quand on passe de l’un à l’autre en multipliant toutes les longueurs par un même nombre k : les côtés rangés du plus petit au plus grand donnent trois quotients égaux, et deux angles égaux suffisent. Les côtés qui se répondent sont homologues ; du second au premier, on multiplie par l’inverse de k.',
    trap: 'Ajouter la même longueur au lieu de multiplier, associer les côtés dans l’ordre des lettres au lieu de l’ordre des tailles, conclure à partir d’un seul angle égal, ou retourner le nombre dans le mauvais sens.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      `Pourquoi le côté du milieu du tracé mesure-t-il $${tex(G.AB)} \\times ${FACTS.gabarit.k} = ${tex(FACTS.gabarit.DE)}$ et non $${tex(gabaritAdd)}$ ?`,
      'Pourquoi deux angles égaux suffisent-ils, alors qu’un seul angle égal ne suffit pas ?',
      `Quel côté de $DEF$ est homologue de $[AB]$, et pourquoi n’est-ce pas $[DE]$ ?`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD — one per savoir-faire of the lesson ──
  criteria: [
    {
      can: 'Reconnaît deux triangles de même forme par les longueurs : il range les côtés de chaque triangle et compare les trois quotients.',
      see: `Pour le gabarit, il écrit $${quotient(G.DF, G.AC)}$ et $${quotient(G.EF, G.BC)}$, deux quotients égaux.`,
    },
    {
      can: 'Reconnaît deux triangles de même forme par deux angles égaux, après avoir calculé le troisième angle de chacun.',
      see: `Il écrit $180 - ${tex(BOARD.angles1.A)} - ${tex(BOARD.angles1.B)} = ${tex(FACTS['angles-1'].C)}$ et trouve les trois mêmes angles dans les deux triangles.`,
    },
    {
      can: 'Associe les sommets et les côtés homologues par leur rang, et non par l’ordre des lettres.',
      see: `Dans les deux triangles de l’envers, il dit que $[DF]$ est homologue de $[AB]$, de longueur $${tex(FACTS.appariement.DF)}$, et que $[DE]$ ne l’est pas.`,
    },
    {
      can: 'Calcule une longueur à l’aide du nombre k, et sait le retourner pour aller dans l’autre sens.',
      see: `Du tracé au gabarit il écrit $${tex(R.NP)} \\times ${F(read(R.k).d, read(R.k).n)} = ${tex(FACTS.retour.BC)}$.`,
    },
  ],
  stands:
    'L’agrandissement et la réduction d’une figure, la quatrième proportionnelle et le produit en croix (4e), Thalès dans les triangles emboîtés — deux triangles qui partagent un sommet (4e) —, la somme des angles d’un triangle (5e). Nouveau : deux triangles qui ne partagent rien, tournés ou retournés, la reconnaissance de leur forme et l’association de leurs côtés.',
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
        'La quatrième proportionnelle et l’agrandissement d’une figure : si la moitié de la classe hésite, prolongez les règles revues.',
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
      aim: 'La classe propose une longueur ou un angle sur chaque figure, la justifie, puis chaque règle reçoit son nom.',
      teacher:
        'Avant chaque vérification, demandez « Qui propose une réponse ? Comment le savez-vous ? » ; ne donnez pas la règle, faites ranger les côtés ou calculer les angles devant la classe.',
      class:
        'Les élèves proposent, justifient, voient laquelle convient ; ensuite seulement la règle prend son nom, puis le cahier.',
      watch:
        'L’élève qui associe deux côtés parce que leurs lettres se suivent : demandez-lui lequel est le plus grand dans chaque triangle.',
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
      says: `« $${quotient(G.DF, G.AC)}$ et $${quotient(G.EF, G.BC)}$ : le côté du milieu est $${tex(G.AB)} \\times ${FACTS.gabarit.k} = ${tex(FACTS.gabarit.DE)}$ ».`,
      assess: 'Pourquoi comparez-vous le plus petit au plus petit, et non le premier écrit au premier écrit ?',
      advance: 'Et si on ne vous donnait que le plus petit côté du tracé ?',
    },
    {
      kind: 'right',
      says: `« $${quotient(C.NP, C.BC)}$, donc le contour du tracé est $${tex(FACTS.contour.P)} \\times ${FACTS.contour.k} = ${tex(FACTS.contour.NP)}$ ».`,
      assess: 'Pourquoi le contour est-il multiplié par le même nombre que chaque côté ?',
      advance: 'Que devient l’aire, si on multiplie chaque côté par ce nombre ?',
    },
    {
      kind: 'miss',
      says: `« $${tex(G.AB)} + (${tex(G.DF)} - ${tex(G.AC)}) = ${tex(gabaritAdd)}$ ».`,
      assess: 'Les deux triangles ont-ils la même forme avec ce côté ? Faites un petit croquis à l’échelle.',
      advance: 'Si on ajoute la même longueur à chaque côté, que devient le triangle ?',
    },
    {
      kind: 'miss',
      says: `« $${tex(R.NP)} \\times ${F(read(R.k).n, read(R.k).d)} = ${tex(FACTS.retour.not)}$ ».`,
      assess: 'Dans quel sens passe-t-on du gabarit au tracé ? Et ici, dans quel sens va-t-on ?',
      advance: 'Que doit-on trouver : un côté plus grand ou plus petit que le côté du tracé ?',
    },
    {
      kind: 'miss',
      says: '« Il y a un angle de $46°$ dans les deux triangles : ils ont la même forme ».',
      assess: 'Que valent les deux autres angles de chaque triangle ?',
      advance: 'Combien d’angles faut-il comparer, et pourquoi pas davantage ?',
    },
    {
      kind: 'miss',
      says: '« $[DE]$ est homologue de $[AB]$, car ce sont les premières lettres ».',
      assess: 'Dans chaque triangle, ce côté est-il le plus petit, celui du milieu ou le plus grand ?',
      advance: 'Quel est l’homologue de $[AB]$ si l’on range les côtés de chaque triangle ?',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord le gabarit : les côtés de chaque triangle rangés, le nombre qui passe de l’un à l’autre, le côté du milieu.',
    'Puis le contour et le retour : tous les côtés et le contour sont multipliés par le même nombre ; en sens inverse, par l’inverse.',
    'On nomme : les triangles semblables, les côtés homologues, le nombre k.',
    'Puis les angles : on calcule le troisième angle de chaque triangle, on compte les angles qui se retrouvent ; un seul angle ne suffit pas.',
    'On nomme : deux angles égaux suffisent.',
    'Enfin l’association des côtés, par le rang et non par les lettres, puis les deux toits de même pente.',
  ],
  connect: `Dans les triangles emboîtés de 4e, la parallèle donnait le même angle et un sommet commun : l’association des côtés était offerte par la figure. Ici rien n’est offert, on la retrouve par le rang des côtés ou par les angles. Dans le gabarit, $k = ${quotient(G.DF, G.AC)}$ : chaque côté du gabarit, multiplié par $${FACTS.gabarit.k}$, donne son homologue.`,
  // ── what is written, the short check, support and extension ──
  written: [
    'Deux triangles sont semblables quand les longueurs de leurs côtés sont proportionnelles : on range les côtés de chacun du plus petit au plus grand, et les trois quotients sont égaux. Les côtés associés sont homologues.',
    'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, alors ces deux triangles sont semblables : le troisième angle est égal aussi, car la somme des angles d’un triangle vaut $180°$.',
    `Du premier triangle au second on multiplie par $k$ ; du second au premier, par l’inverse : $${tex(R.NP)} \\times ${F(read(R.k).d, read(R.k).n)} = ${tex(FACTS.retour.BC)}$.`,
  ],
  exit: [
    {
      q: `Un triangle a pour côtés $${tex(EXIT.A1)}$ cm, $${tex(EXIT.A2)}$ cm et $${tex(EXIT.A3)}$ cm. Un triangle semblable a pour plus petit côté $${tex(EXIT.B1)}$ cm et pour côté du milieu $${tex(EXIT.B2)}$ cm. Calcule son plus grand côté.`,
      a: `$${quotient(EXIT.B2, EXIT.A2)}$ et $${quotient(EXIT.B1, EXIT.A1)}$, donc le plus grand côté mesure $${cross(EXIT.A3, EXIT.B1, EXIT.A1)}$ cm.`,
    },
    {
      q: `Un triangle a des angles de $${tex(EXIT_ANGLES.x)}°$ et $${tex(EXIT_ANGLES.y)}°$. Un autre a des angles de $${tex(EXIT_ANGLES.x)}°$ et $${tex(exitZ)}°$. Ces deux triangles sont-ils semblables ?`,
      a: `Oui : $180 - ${tex(EXIT_ANGLES.x)} - ${tex(EXIT_ANGLES.y)} = ${tex(exitZ)}$, les deux triangles ont les mêmes trois angles.`,
    },
    {
      q: 'Les triangles $KLM$ et $PQR$ sont semblables, avec $K$ et $Q$ homologues, $L$ et $R$ homologues. Quel côté de $PQR$ est homologue de $[KM]$ ?',
      a: 'Le sommet $M$ a pour homologue $P$ : le côté homologue de $[KM]$ est $[QP]$.',
    },
  ],
  support: [
    'Ranger les côtés de chaque triangle du plus petit au plus grand, en les repassant de trois couleurs, avant d’écrire les quotients.',
    'Calculer le troisième angle de chaque triangle avant de comparer, et les écrire du plus petit au plus grand.',
    'Découper deux triangles en papier : poser l’un sur l’autre, en le retournant au besoin, pour voir quels côtés se recouvrent.',
  ],
  extend: [
    `Dans le gabarit, si le plus petit côté du tracé mesurait $${tex(EXTEND.shortest)}$ m, quel serait son plus grand côté ?`,
    `Un triangle a un angle de $${tex(EXIT_ANGLES.x)}°$ et un angle de $${tex(EXIT_ANGLES.y)}°$ ; un autre a un angle de $${tex(EXIT_ANGLES.x)}°$ et un angle de $${tex(exitZ)}°$. Que dire de ces deux triangles ?`,
    'On trace le gabarit avec tous ses côtés multipliés par 1 : que dire du tracé, et de $k$ ?',
  ],
  extendCheck: {
    gabarit: { AC: G.AC, BC: G.BC, shortest: EXTEND.shortest, longest: extendLongest },
    angles: { x: EXIT_ANGLES.x, y: EXIT_ANGLES.y, z: exitZ },
  },
  next: 'La séance suivante : « Thalès dans le papillon » — deux triangles qui se touchent en un point, de part et d’autre : où sont leurs côtés homologues ?',
});

/** For the tests: the openings' and the exit ticket's numbers, computed here. */
export const MEMO_FACTS = {
  pennant: { ...PENNANT, EF: pennantEF },
  shadow: { ...SHADOW, height: postHeight },
  exit: { ...EXIT, B3: exitB3 },
  exitAngles: { ...EXIT_ANGLES, z: exitZ },
};
