/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`). The teacher is « vous »;
 * the board's numbers come from `script.js › BOARD`; the openings and the exit ticket have their own.
 */
import { BOARD, FACTS } from './script';

const { situation: S, common: C, baskets: P, factors: F, euclid: E } = BOARD;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: S.a,
    b: S.b,
    board: true,
    title: 'Deux fossés, une seule planche',
    story:
      'Le menuisier franchit un fossé de 70 cases et un fossé de 98 cases avec des planches toutes de la même longueur, et il veut en poser le moins possible.',
    ask: 'La planche de 10, qui remplit le premier fossé, remplit-elle le second ? Quelle planche choisir ?',
    why: 'C’est la situation de la séance au tableau : la planche de 10 s’effondre sur 98, et la question devient celle de la leçon — quelle est la plus longue planche qui remplit les deux fossés ?',
    expect:
      'Ils proposent 7 ou 2, qui remplissent les deux fossés ; la contrainte « le moins de planches » les pousse ensuite vers 14.',
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 39,
    b: 6,
    board: false,
    title: 'Des groupes pour une sortie',
    story:
      'Pour une sortie, 26 garçons et 39 filles forment des groupes tous pareils : autant de garçons et autant de filles dans chaque groupe.',
    ask: 'Peut-on faire 6 groupes ? Combien de groupes au plus ?',
    why: '$26 = 2 \\times 13$ et $39 = 3 \\times 13$ : le nombre de groupes divise les deux nombres, et le plus grand est $13$, avec $2$ garçons et $3$ filles par groupe.',
    expect:
      'Avec 6 groupes, 3 filles restent sans groupe ; certains proposent 2 ou 3, qui ne partagent qu’un des deux nombres.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 85,
    b: 10,
    alt: 17,
    board: false,
    title: 'Les bacs de la médiathèque',
    story:
      'La médiathèque range 85 bandes dessinées et 68 mangas dans des bacs qui contiennent tous le même nombre de livres, sans mélanger les deux sortes.',
    ask: 'Des bacs de 10 livres conviennent-ils ? Et de 17 livres ? Quelle taille de bac convient aux deux piles ?',
    why: '$85 = 5 \\times 17$ et $68 = 2^{2} \\times 17$ : seule une taille qui divise les deux nombres convient, et la plus grande est $17$.',
    expect: 'Beaucoup choisissent 10 « parce que c’est rond » ; le calcul tranche : $85 = 10 \\times 8 + 5$.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 64,
    b: 12,
    alt: 16,
    board: false,
    title: 'Un panneau en carrés',
    story: 'Un panneau de 64 cm sur 80 cm est couvert de carrés identiques, posés côte à côte sans en couper aucun.',
    ask: 'Des carrés de 12 cm conviennent-ils ? Et de 16 cm ? Quel est le plus grand carré possible ?',
    why: '$64 = 2^{6}$ et $80 = 2^{4} \\times 5$ : le côté divise les deux longueurs, et le plus grand est $2^{4} = 16$.',
    expect: 'Avec 12 cm, il reste une bande de 4 cm ; avec 16 cm, le panneau tient en $4 \\times 5 = 20$ carrés.',
  },
];

export const MEMO = {
  title: 'Trouver le PGCD de deux nombres',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève trouve le plus grand diviseur commun de deux nombres — par leurs listes de diviseurs, par leurs décompositions en facteurs premiers ou par l’algorithme d’Euclide — et s’en sert pour partager en lots identiques.',
    idea: 'Le PGCD est le plus grand nombre qui divise les deux. On le lit sur les décompositions (les facteurs premiers communs, chacun avec le plus petit exposant) ou on le trouve en divisant le diviseur par le reste jusqu’à un reste nul : c’est le dernier reste non nul.',
    trap: 'Prendre un diviseur commun qui n’est pas le plus grand, garder le plus grand exposant, prendre la différence des deux nombres, ou lire le dernier quotient dans l’algorithme d’Euclide.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      'Quelles planches remplissent à la fois un fossé de 70 et un fossé de 98 ? Laquelle est la plus longue ?',
      'Pourquoi le PGCD de $2^{3} \\times 5$ et de $2^{2} \\times 3 \\times 5$ n’est-il pas $2^{3} \\times 5$ ?',
      'Dans l’algorithme d’Euclide, quel nombre lit-on, et quand s’arrête-t-on ?',
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'Écrit les diviseurs communs de deux nombres et reconnaît le plus grand, leur PGCD.',
      see: 'Pour 70 et 98, il écrit $1$, $2$, $7$, $14$ et $\\text{PGCD}(70 ; 98) = 14$.',
      check: { a: C.other, b: C.a, common: FACTS.common, pgcd: FACTS.first },
    },
    {
      can: 'Reconnaît qu’un partage en lots identiques demande un diviseur commun, et que le plus de lots est le PGCD.',
      see: 'Avec 44 clémentines et 66 kiwis, il fait 22 paniers de 2 clémentines et 3 kiwis.',
      check: { a: P.clementines, b: P.kiwis, most: FACTS.baskets.most, each: FACTS.baskets.each },
    },
    {
      can: 'Lit le PGCD sur deux décompositions : les facteurs premiers communs, chacun avec le plus petit exposant.',
      see: '$910 = 2 \\times 5 \\times 7 \\times 13$ et $1\\,950 = 2 \\times 3 \\times 5^{2} \\times 13$, donc le PGCD est $2 \\times 5 \\times 13 = 130$.',
      check: {
        a: F.a,
        b: F.b,
        pgcd: FACTS.factors.gcd,
        powers: [
          [2, 1],
          [5, 1],
          [13, 1],
        ],
      },
    },
    {
      can: 'Applique l’algorithme d’Euclide et lit le PGCD dans le dernier reste non nul.',
      see: 'Pour 2 173 et 1 517, il écrit quatre divisions et trouve $41$.',
      check: { a: E.a, b: E.b, rows: FACTS.euclid.rows.length, pgcd: FACTS.euclid.gcd },
    },
  ],
  stands:
    'Les diviseurs d’un nombre et la division euclidienne (dividende, diviseur, quotient, reste), vus de la 6e à la 4e, et la décomposition en facteurs premiers avec des puissances, vue à la leçon précédente. Le PGCD lui-même et l’algorithme d’Euclide sont nouveaux.',
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
      class: 'Chacun répond sous son nom ; les équipes cumulent leurs points.',
      watch:
        'La division euclidienne : si la moitié de la classe confond quotient et reste, prolongez les règles revues.',
    },
    {
      moment: 'revise',
      name: 'Les règles revues',
      min: 5,
      aim: 'On rappelle ce dont on aura besoin.',
      teacher:
        'Vous choisissez un lecteur ou lisez vous-même ; demandez un exemple avant de montrer celui de la carte.',
      class: 'Les élèves lisent la règle et donnent un exemple à eux.',
      watch: 'Une décomposition complète : chaque facteur premier, avec son exposant.',
    },
    {
      moment: 'lesson',
      name: 'La leçon au tableau',
      min: 25,
      aim: 'La classe propose les planches, le tableau les pose, puis chaque règle reçoit son nom.',
      teacher:
        'Avant chaque essai, demandez « Qui prévoit ? » ; ne donnez pas la règle, laissez les deux fossés répondre.',
      class:
        'Les élèves proposent des planches et des nombres de paniers, voient ce qui tient sur les deux fossés, puis continuent les divisions au tableau ; ensuite seulement la règle prend son nom.',
      watch: 'L’élève qui annonce un nombre sans vérifier l’autre fossé : demandez-lui les deux égalités.',
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
      says: '« Les planches 1, 2, 7 et 14 remplissent les deux fossés, la plus longue est 14 ».',
      assess: 'Comment es-tu sûr qu’aucune planche plus longue ne convient ?',
      advance: 'Combien de planches poses-tu en tout avec 14 ? Et avec 7 ?',
    },
    {
      kind: 'right',
      says: '« $1\\,950 = 2 \\times 3 \\times 5^{2} \\times 13$, alors je garde 2, 5 et 13 une seule fois ».',
      assess: 'Pourquoi le 3 ne fait-il pas partie du PGCD ?',
      advance: 'Et si 910 avait deux facteurs 5, que changerait-il ?',
    },
    {
      kind: 'miss',
      says: '« Le PGCD de 70 et 98, c’est 7 : il divise les deux ».',
      assess: '7 est-il le plus grand des diviseurs communs ?',
      advance: 'Écris tous les diviseurs communs, puis choisis.',
    },
    {
      kind: 'miss',
      says: '« Le PGCD, c’est la différence : $98 - 70 = 28$ ».',
      assess: '28 remplit-il le fossé de 70 ?',
      advance: 'Calcule $70 = 28 \\times 2 + 14$ : que reste-t-il ?',
    },
    {
      kind: 'miss',
      says: '« Le PGCD de 910 et 1 950, c’est $2 \\times 5^{2} \\times 13 = 650$ ».',
      assess: 'Combien de facteurs 5 y a-t-il dans 910 ?',
      advance: 'Le PGCD doit diviser les deux nombres : quel exposant garder ?',
    },
    {
      kind: 'miss',
      says: '« Dans l’algorithme d’Euclide, le PGCD est le dernier quotient, 5 ».',
      assess: 'La planche de 5 remplit-elle le fossé de 1 517 ?',
      advance: 'Relis les restes : lequel est le dernier avant 0 ?',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord une planche qui s’effondre (10 sur 98) : une seule longueur doit aller aux deux fossés.',
    'Puis les planches communes à 70 et 98, et la plus longue, 14 : le moins de planches.',
    'Puis les paniers : 44 clémentines et 66 kiwis, au plus 22 paniers.',
    'Puis les deux rangées de 910 et 1 950 : la plus longue planche commune se lit sur les rangées.',
    'Enfin 2 173 et 1 517 : les divisions successives, et le dernier reste non nul.',
  ],
  connect:
    'Les trois méthodes cherchent le même nombre : le plus grand qui divise les deux. Les listes le montrent, les décompositions le construisent facteur par facteur, et chaque division d’Euclide garde les mêmes diviseurs communs : $\\text{PGCD}(a ; b) = \\text{PGCD}(b ; r)$.',
  // ── what is written, the short check, support and extension ──
  written: [
    'Le PGCD de deux nombres est le plus grand de leurs diviseurs communs : $\\text{PGCD}(70 ; 98) = 14$.',
    'Partager deux quantités en lots identiques, sans reste : le nombre de lots divise les deux quantités, et le plus grand nombre de lots est leur PGCD.',
    'Sur deux décompositions, le PGCD est le produit des facteurs premiers communs, chacun avec le plus petit exposant : $\\text{PGCD}(910 ; 1\\,950) = 2 \\times 5 \\times 13 = 130$.',
    'Algorithme d’Euclide : on divise le plus grand nombre par le plus petit, puis le diviseur par le reste, jusqu’à un reste nul ; le PGCD est le dernier reste non nul, car $\\text{PGCD}(a ; b) = \\text{PGCD}(b ; r)$.',
  ],
  exit: [
    {
      q: 'Écris les diviseurs communs de 34 et 85, puis leur PGCD.',
      a: 'Les diviseurs communs sont $1$ et $17$, donc $\\text{PGCD}(34 ; 85) = 17$.',
      check: { a: 34, b: 85, common: [1, 17], pgcd: 17 },
    },
    {
      q: 'Quel est le PGCD de $2^{3} \\times 5 \\times 7$ et de $2 \\times 3 \\times 5^{2}$ ?',
      a: '$2 \\times 5 = 10$ : les facteurs communs $2$ et $5$, chacun avec le plus petit exposant.',
      check: {
        a: [
          [2, 3],
          [5, 1],
          [7, 1],
        ],
        b: [
          [2, 1],
          [3, 1],
          [5, 2],
        ],
        pgcd: 10,
      },
    },
    {
      q: 'Avec l’algorithme d’Euclide, trouve le PGCD de 851 et 629.',
      a: '$851 = 629 \\times 1 + 222$, $629 = 222 \\times 2 + 185$, $222 = 185 \\times 1 + 37$, $185 = 37 \\times 5 + 0$ : le PGCD est $37$.',
      check: { a: 851, b: 629, rows: 4, pgcd: 37 },
    },
  ],
  support: [
    'Des petits nombres d’abord (12 et 20, 15 et 25), en écrivant les deux listes de diviseurs l’une sous l’autre.',
    'Pour les décompositions, écrire les deux en colonnes, facteur premier par facteur premier, et entourer le plus petit exposant.',
    'Pour l’algorithme d’Euclide, un tableau à quatre colonnes : dividende, diviseur, quotient, reste.',
  ],
  extend: [
    'Que vaut le PGCD de deux nombres entiers consécutifs ? Pourquoi ?',
    'Combien de nombres entiers de 1 à 50 ont un PGCD égal à 1 avec 50 ?',
    'Combien de divisions l’algorithme d’Euclide écrit-il pour 34 et 21 ? Pourquoi autant ?',
  ],
  extendCheck: { consecutive: 1, coprimeTo50: 20, rows34and21: 7 },
  next: 'La séance suivante : « Rendre une fraction irréductible » — diviser ses deux termes par leur PGCD.',
};
