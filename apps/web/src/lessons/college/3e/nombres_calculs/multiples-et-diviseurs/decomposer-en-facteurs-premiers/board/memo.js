/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`). The teacher is « vous »;
 * the board's numbers come from `script.js › BOARD`.
 */
import { BOARD, FACTS } from './script';

const { situation: S, first: F, row: R, sheet: H } = BOARD;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: S.a,
    b: S.b,
    board: true,
    title: 'Un fossé de 168 cases',
    story:
      'Le menuisier doit franchir un fossé de 168 cases avec des planches courtes, de 2 à 9 cases. Chaque planche qui tient laisse un fossé plus court à franchir.',
    ask: 'La planche de 5 tient-elle ? Avec quelles planches découper 168 jusqu’à 1 case ?',
    why: 'C’est la situation de la séance au tableau : la planche de 5 s’effondre, et la question devient celle de la leçon — quelles planches courtes découpent 168 jusqu’au bout ?',
    expect:
      'Ils essaient 2 parce que 168 est pair ; certains posent 4 ou 6 et obtiennent une autre rangée, ce qui ouvre la comparaison.',
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 26,
    b: 4,
    board: false,
    title: 'Des équipes pour un tournoi',
    story:
      'Les 26 élèves d’une classe forment des équipes de même taille pour un tournoi, sans que personne reste sur le banc.',
    ask: 'Peut-on faire 4 équipes ? Combien d’équipes sont possibles ?',
    why: '$26 = 2 \\times 13$ : en dehors d’une seule équipe ou d’équipes d’un élève, seules 2 ou 13 équipes sont possibles — la décomposition donne d’un coup toutes les réponses.',
    expect: 'Avec 4 équipes, 2 élèves restent sur le banc ; ils cherchent ensuite 3, 5, 6… sans rien trouver.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 264,
    b: 20,
    alt: 12,
    board: false,
    title: 'Les étagères de la médiathèque',
    story:
      'La médiathèque reçoit 264 livres à ranger sur des étagères pleines. Elle a des étagères de 20 livres et des étagères de 12 livres.',
    ask: 'Quelles étagères choisir pour qu’aucun livre ne reste par terre ?',
    why: '$264 = 2^3 \\times 3 \\times 11$ : $12 = 2^2 \\times 3$ s’y retrouve, $20 = 2^2 \\times 5$ non (pas de 5) — la décomposition répond sans diviser.',
    expect: 'Beaucoup choisissent 20 « parce que c’est plus grand » ; le calcul tranche : $264 = 20 \\times 13 + 4$.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 140,
    b: 30,
    alt: 28,
    board: false,
    title: 'Une frise de carreaux',
    story: 'Une frise de 140 cm est couverte de carreaux carrés identiques, posés côte à côte sans en couper aucun.',
    ask: 'Des carreaux de 30 cm conviennent-ils ? Et de 28 cm ? Quelles tailles sont possibles ?',
    why: '$140 = 2^2 \\times 5 \\times 7$ : une taille possible n’utilise que ces facteurs — $28 = 2^2 \\times 7$ oui, $30 = 2 \\times 3 \\times 5$ non (le 3 manque).',
    expect: 'Avec 30 cm, il reste 20 cm ; avec 28 cm, la frise tient en 5 carreaux.',
  },
];

export const MEMO = {
  title: 'Décomposer un nombre en facteurs premiers',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève décompose un nombre en produit de facteurs premiers, à la main pour un petit nombre et avec une feuille de calcul pour un grand, et l’écrit avec des puissances.',
    idea: 'On divise par 2 tant que c’est possible, puis par 3, 5, 7… dans l’ordre ; on s’arrête quand le carré du nombre essayé dépasse ce qui reste — ce qui reste est alors premier.',
    trap: 'Garder un facteur qui n’est pas premier (4, 6, 9), lire $2^4$ comme $2 \\times 4$, ou croire qu’il faut essayer tous les nombres jusqu’au nombre lui-même.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      'Décomposez 168 : par quelle planche commence-t-on, et combien de fois ?',
      'Que vaut $2^4$ ? Pourquoi pas 8 ?',
      'Pour savoir si 89 est premier, jusqu’à quel nombre premier essaie-t-on ?',
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'Décompose un nombre en essayant 2, puis 3, 5, 7… dans l’ordre, chaque nombre tant qu’il divise.',
      see: 'Pour 168, il écrit l’échelle 168, 84, 42, 21, 7, 1 et la rangée 2, 2, 2, 3, 7.',
      check: { n: F.n, factors: FACTS.first.factors },
    },
    {
      can: 'Écrit un facteur répété une seule fois avec un exposant, et lit $2^4$ comme $2 \\times 2 \\times 2 \\times 2$.',
      see: '$720 = 2^4 \\times 3^2 \\times 5$, et il refuse « $2^4 = 8$ ».',
      check: {
        n: R.n,
        powers: [
          [2, 4],
          [3, 2],
          [5, 1],
        ],
      },
    },
    {
      can: 'Sait quand s’arrêter : un nombre qui n’a aucun diviseur premier $p$ tel que $p^2 \\leqslant n$ est premier.',
      see: 'Sur 89, il essaie 2, 3, 5 et 7, puis s’arrête car $11^2 = 121 > 89$.',
      check: { n: FACTS.stop.left, upTo: FACTS.stop.last },
    },
    {
      can: 'Décompose un grand nombre avec une feuille de calcul : il lit le premier reste nul, divise et recommence sur le quotient.',
      see: '$2\\,387 = 7 \\times 11 \\times 31$, en trois feuilles de plus en plus courtes.',
      check: { n: H.n, factors: [7, 11, 31] },
    },
  ],
  stands:
    'La division euclidienne, les diviseurs et les nombres premiers inférieurs à 30, les critères de divisibilité par 2, 3 et 5, et la lecture d’une puissance ($2^3 = 8$) — vus en 5e et en 4e. La décomposition elle-même a été rencontrée en 4e sur de petits nombres : la 3e y ajoute l’ordre des essais, l’arrêt et les grands nombres avec un outil.',
  // ── several opening situations, each drawn ──
  openings: OPENINGS,
  // ── the hour, as the class session runs it: launch → explore → summarize ──
  phases: [
    {
      moment: 'start',
      name: 'Test de début',
      min: 7,
      aim: 'Où en est la classe avant la leçon ?',
      teacher: 'Vous donnez la souris à l’élève dont c’est le tour, sans corriger encore.',
      class: 'Chacun répond sous son nom ; les équipes cumulent leurs points.',
      watch:
        'Les nombres premiers : si la moitié de la classe pense que 1 ou 9 est premier, prolongez les règles revues.',
    },
    {
      moment: 'revise',
      name: 'Les règles revues',
      min: 5,
      aim: 'On rappelle ce dont on aura besoin.',
      teacher:
        'Vous choisissez un lecteur ou lisez vous-même ; demandez un exemple avant de montrer celui de la carte.',
      class: 'Les élèves lisent la règle et donnent un exemple à eux.',
      watch: 'La lecture d’un exposant : $2^3 = 8$, pas 6.',
    },
    {
      moment: 'lesson',
      name: 'La leçon au tableau',
      min: 25,
      aim: 'La classe propose les planches, le tableau les pose, puis chaque règle reçoit son nom.',
      teacher: 'Avant chaque planche, demandez « Qui prévoit ? » ; ne donnez pas la règle, laissez le fossé répondre.',
      class:
        'Les élèves proposent la planche suivante, voient l’échelle se construire, comparent leurs rangées ; ensuite seulement la règle prend son nom.',
      watch: 'L’élève qui répond vite sans justifier : demandez-lui l’égalité qui prouve sa planche.',
    },
    {
      moment: 'end',
      name: 'Test de fin',
      min: 8,
      aim: 'Qu’a changé la séance ?',
      teacher: 'Vous comparez « au début » et « maintenant », et nommez ceux qui ont progressé.',
      class: 'Les élèves répondent aux questions de la nouvelle leçon.',
      watch: 'Le savoir-faire resté fragile devient le travail du lendemain.',
    },
  ],
  // ── what students will likely say or do, and the question for each ──
  anticipated: [
    {
      kind: 'right',
      says: '« $168 = 2 \\times 2 \\times 2 \\times 3 \\times 7$, j’ai divisé par 2 tant que je pouvais ».',
      assess: 'Pourquoi n’essaies-tu pas 4 après les trois 2 ?',
      advance: 'Écris la même décomposition avec des puissances.',
    },
    {
      kind: 'right',
      says: '« 89 est premier : j’ai essayé 2, 3, 5, 7, et $11^2$ dépasse 89 ».',
      assess: 'Pourquoi n’est-il pas utile d’essayer 13 ?',
      advance: 'Et pour 299 ? Jusqu’où faut-il aller ?',
    },
    {
      kind: 'miss',
      says: '« $168 = 4 \\times 6 \\times 7$ ».',
      assess: 'La planche de 4 peut-elle être remplacée par des planches plus courtes ?',
      advance: 'Que doit-on pouvoir dire de chaque facteur de la rangée ?',
    },
    {
      kind: 'miss',
      says: '« $2^4 = 8$ ».',
      assess: 'Combien de planches de 2 l’exposant 4 compte-t-il ?',
      advance: 'Calcule $2 \\times 2 \\times 2 \\times 2$, puis compare avec $2 \\times 4$.',
    },
    {
      kind: 'miss',
      says: '« Pour savoir si 89 est premier, il faut essayer tous les nombres jusqu’à 89 ».',
      assess: 'Si une planche de 11 tenait, combien de planches faudrait-il ?',
      advance: 'À partir de quelle planche le partenaire devient-il plus petit que la planche ?',
    },
    {
      kind: 'miss',
      says: '« 2 387 se termine par 7, donc il est premier ».',
      assess: 'Que dit la colonne B en face de 7 ?',
      advance: 'Trouve un grand nombre qui finit par 1, 3, 7 ou 9 et qui n’est pas premier.',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord une planche qui s’effondre (5 sur 168) : la question de l’heure naît là.',
    'Puis l’échelle de 168 : les planches courtes d’abord ; 4, 6 et 9 ne tiennent plus une fois les 2 posés.',
    'Puis la rangée de 720 : on compte les planches égales, on l’écrit plus court.',
    'Puis 534, qui laisse 89 : après 7, plus aucune planche ne vaut la peine.',
    'Enfin 2 387 : la feuille de calcul fait les divisions, la classe lit le premier 0.',
  ],
  connect:
    'Chaque planche qui tient remplace le nombre par un plus petit : $n = p \\times q$. Les facteurs premiers sont les planches qu’on ne peut plus découper, et on n’a jamais à essayer un $p$ tel que $p^2 > n$.',
  // ── what is written, the short check, support and extension ──
  written: [
    'Pour décomposer un nombre, on le divise par 2 tant que c’est possible, puis par 3, puis par 5, 7, 11… jusqu’à obtenir 1.',
    'Un facteur répété s’écrit une seule fois avec un exposant : $720 = 2^4 \\times 3^2 \\times 5$.',
    'Si aucun nombre premier $p$ tel que $p^2 \\leqslant n$ ne divise $n$, alors $n$ est premier.',
    'Pour un grand nombre, une feuille de calcul affiche les restes : on lit le premier reste nul, on divise et on recommence sur le quotient.',
  ],
  exit: [
    {
      q: 'Décompose 156 en produit de facteurs premiers, avec des puissances.',
      a: '$156 = 2^2 \\times 3 \\times 13$.',
      check: {
        n: 156,
        powers: [
          [2, 2],
          [3, 1],
          [13, 1],
        ],
      },
    },
    {
      q: '179 est-il premier ? Jusqu’à quel nombre premier faut-il essayer ?',
      a: 'Oui : ni 2, ni 3, ni 5, ni 7, ni 11, ni 13 ne divisent 179, et $13^2 = 169 \\leqslant 179 < 196 = 14^2$.',
      check: { n: 179, prime: true, upTo: 13 },
    },
    {
      q: 'Une feuille de calcul affiche les restes de 1 739 par 2, 3, 5, 7… jusqu’à 41 : le premier reste nul est en face de 37. Décompose 1 739.',
      a: '$1\\,739 = 37 \\times 47$, et 47 est premier.',
      check: { n: 1739, first: 37, factors: [37, 47] },
    },
  ],
  support: [
    'Des nombres de deux chiffres d’abord (28, 44, 46), avec les planches de 2, 3, 5 et 7 seulement.',
    'Écrire l’échelle en deux colonnes : le nombre à gauche, la planche qui tient à droite.',
    'La liste des nombres premiers jusqu’à 30 posée sur la table.',
  ],
  extend: [
    'Trouve le plus petit nombre qui s’écrit avec exactement trois facteurs premiers différents.',
    'Décompose 1 024 et 1 000 : lequel a le plus de facteurs ?',
    'Pourquoi un nombre qui est un carré a-t-il tous ses exposants pairs ?',
  ],
  extendCheck: {
    smallestThree: 30,
    n1024: [[2, 10]],
    n1000: [
      [2, 3],
      [5, 3],
    ],
  },
  next: 'La séance suivante : « Trouver le PGCD de deux nombres » — leurs décompositions côte à côte.',
};
