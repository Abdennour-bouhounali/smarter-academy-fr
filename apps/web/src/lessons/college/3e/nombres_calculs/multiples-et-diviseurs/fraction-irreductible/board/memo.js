/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`). The teacher is « vous »;
 * the board's numbers come from `script.js › BOARD`; the openings and the exit ticket have their own. Ported from the
 * memo of the Algerian lesson `ikhtizal-kasr` and rewritten from its job: the method of the first key is the striking of
 * the common prime factors, the numbers and the contexts are French.
 */
import { BOARD, FACTS } from './script';

const { situation: S, stays: K, pgcd: P, product: R } = BOARD;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: S.lit,
    b: S.first,
    board: true,
    title: 'Un pont et sa pancarte',
    story:
      'Le menuisier a un pont de 84 cases, dont 36 sont éclairées : sa pancarte porte la fraction 36 sur 84. Il voudrait l’écrire avec des nombres plus petits, en posant des planches toutes de la même longueur.',
    ask: 'La planche de 7 remplit-elle le pont ? Et la partie éclairée ? Quelle planche remplit les deux ?',
    why: 'C’est la situation de la séance au tableau : la planche de 7 remplit le pont et laisse une case de la partie éclairée ; une planche qui remplit les deux réécrit la pancarte.',
    expect:
      'Ils voient que 7 remplit 84, puis que la lumière s’arrête entre deux planches : $36 = 7 \\times 5 + 1$. Ils cherchent ensuite une planche qui remplit les deux nombres.',
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 42,
    b: 4,
    board: false,
    title: 'Des cyclistes dans la classe',
    story:
      'Sur 42 élèves, 30 viennent à vélo. Pour dire quelle part de la classe vient à vélo, on forme des groupes d’élèves tous pareils, sans que personne reste seul.',
    ask: 'Peut-on faire des groupes de 4 élèves ? Quelle taille de groupe convient à la fois aux 42 élèves et aux 30 cyclistes ?',
    why: '$42 = 4 \\times 10 + 2$ : 4 ne convient pas. Des groupes de 6 conviennent aux deux nombres : 7 groupes en tout, dont 5 de cyclistes, donc la part est $\\dfrac{30}{42} = \\dfrac{5}{7}$.',
    expect: 'Certains choisissent 2 ou 3, qui conviennent aussi ; ils verront ensuite qu’on peut aller plus loin.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 90,
    b: 8,
    alt: 10,
    board: false,
    title: 'Les bacs de la médiathèque',
    story:
      'La médiathèque a 90 livres, dont 40 bandes dessinées. Elle les range dans des bacs qui contiennent tous le même nombre de livres, sans mélanger deux bacs.',
    ask: 'Des bacs de 8 livres conviennent-ils ? Et de 10 livres ? Quelle part des livres est formée de bandes dessinées ?',
    why: '$90 = 8 \\times 11 + 2$ : 8 laisse deux livres ; $90 = 10 \\times 9$ et $40 = 10 \\times 4$ : la part est $\\dfrac{40}{90} = \\dfrac{4}{9}$.',
    expect: 'Beaucoup choisissent 8 « parce que 40 est dans sa table » ; le calcul tranche : $90 = 8 \\times 11 + 2$.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 88,
    b: 6,
    alt: 8,
    board: false,
    title: 'Une affiche en carrés',
    story:
      'Une affiche de 88 cm sur 56 cm est couverte de carrés identiques, posés côte à côte sans en couper aucun. On compare la largeur à la longueur.',
    ask: 'Des carrés de 6 cm conviennent-ils ? Et de 8 cm ? Que devient la fraction 56 sur 88 ?',
    why: '$88 = 8 \\times 11$ et $56 = 8 \\times 7$ : le carré de 8 cm convient aux deux longueurs, et $\\dfrac{56}{88} = \\dfrac{7}{11}$.',
    expect: 'Avec 6 cm, il reste une bande de 4 cm ; avec 8 cm, l’affiche tient en $11 \\times 7 = 77$ carrés.',
  },
];

const [FN, FD] = FACTS.factors.reduced;
const [KN, KD] = FACTS.euclid.reduced;
const [XN, XD] = FACTS.product.reduced;

export const MEMO = {
  title: 'Rendre une fraction irréductible',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève rend une fraction irréductible — en barrant les facteurs premiers communs des deux décompositions, ou en divisant le numérateur et le dénominateur par leur PGCD —, reconnaît une fraction irréductible et reprend le résultat d’un calcul de fractions.',
    idea: 'Une fraction ne change pas quand on divise ses deux termes par un même nombre. Elle est irréductible quand ses deux termes n’ont aucun facteur premier commun, c’est-à-dire quand leur PGCD est 1. Pour y arriver d’un coup, on divise par le PGCD ; après un calcul, on vérifie toujours le résultat.',
    trap: 'S’arrêter dès qu’on ne voit plus de règle de 2, 3 ou 5, barrer un facteur commun une seule fois quand il est deux fois dans les deux termes, diviser par un diviseur commun qui n’est pas le plus grand, ou croire que le résultat d’un calcul est irréductible parce que chaque fraction l’était.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      'Quelles planches remplissent à la fois un pont de 686 cases et la partie éclairée de 490 cases ? Quels facteurs premiers retrouve-t-on dans leurs deux rangées ?',
      'Pourquoi la fraction $\\dfrac{91}{124}$ ne s’écrit-elle pas avec des nombres plus petits, alors que 91 et 124 ne sont pas premiers ?',
      'Après le calcul d’un produit de deux fractions irréductibles, que fait-on, et pourquoi ?',
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'Décompose le numérateur et le dénominateur, barre chaque facteur premier commun autant de fois qu’il est dans les deux, et écrit la fraction qui reste.',
      see: '$490 = 2 \\times 5 \\times 7^{2}$ et $686 = 2 \\times 7^{3}$ : il barre $2$ et $7^{2}$ et écrit $\\dfrac{490}{686} = \\dfrac{5}{7}$.',
      check: {
        a: 490,
        b: 686,
        shared: [
          [2, 1],
          [7, 2],
        ],
        reduced: [FN, FD],
      },
    },
    {
      can: 'Reconnaît qu’une fraction est irréductible quand ses termes n’ont aucun facteur premier commun, même si aucun des deux n’est premier.',
      see: 'Pour 91 sur 124, il écrit $91 = 7 \\times 13$ et $124 = 2^{2} \\times 31$ : aucun facteur ne se retrouve, la fraction reste telle quelle.',
      check: { a: K.lit, b: K.whole, pgcd: FACTS.stays.gcd },
    },
    {
      can: 'Rend une fraction irréductible en une seule division, par le PGCD de ses deux termes.',
      see: 'Avec $\\text{PGCD}(627 ; 726) = 33$, il écrit $\\dfrac{627 \\div 33}{726 \\div 33} = \\dfrac{19}{22}$.',
      check: { a: P.lit, b: P.whole, pgcd: FACTS.euclid.gcd, reduced: [KN, KD] },
    },
    {
      can: 'Reprend le résultat d’un calcul de fractions pour le donner sous forme irréductible.',
      see: '$\\dfrac{11}{20} \\times \\dfrac{34}{55} = \\dfrac{374}{1\\,100} = \\dfrac{17}{50}$.',
      check: { x: R.x, y: R.y, n: FACTS.product.n, d: FACTS.product.d, reduced: [XN, XD] },
    },
  ],
  stands:
    'Les fractions égales (on divise ou on multiplie les deux termes par un même nombre) et les critères de divisibilité par 2, 3 et 5, vus de la 5e à la 4e ; la décomposition en facteurs premiers et le PGCD, vus aux deux leçons précédentes. Ce qui est nouveau : une fraction est terminée quand ses termes n’ont plus de facteur premier commun, et la méthode pour y arriver.',
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
        'Les décompositions et les fractions égales : si la moitié de la classe ne décompose pas 260, prolongez les règles revues.',
    },
    {
      moment: 'revise',
      name: 'Les règles revues',
      min: 5,
      aim: 'On rappelle ce dont on aura besoin.',
      teacher:
        'Vous choisissez un lecteur ou lisez vous-même ; demandez un exemple avant de montrer celui de la carte.',
      class: 'Les élèves lisent la règle et donnent un exemple à eux.',
      watch: 'Une fraction égale s’obtient en divisant les deux termes par le même nombre, jamais en les soustrayant.',
    },
    {
      moment: 'lesson',
      name: 'La leçon au tableau',
      min: 25,
      aim: 'La classe propose les planches, le tableau les pose, puis chaque règle reçoit son nom.',
      teacher:
        'Avant chaque essai, demandez « Qui prévoit ? » ; ne donnez pas la règle, laissez les ponts et les rangées répondre.',
      class:
        'Les élèves décomposent, proposent des planches, voient ce qui tient sur le pont et sur la partie éclairée ; ensuite seulement la règle prend son nom.',
      watch:
        'L’élève qui s’arrête à une fraction qu’il ne voit plus simplifier : demandez-lui les deux décompositions.',
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
      says: '« $490 = 2 \\times 5 \\times 7^{2}$ et $686 = 2 \\times 7^{3}$ : je barre le 2 et deux 7, il reste $\\dfrac{5}{7}$ ».',
      assess: 'Pourquoi barres-tu deux 7 et pas trois ?',
      advance: 'Quelle planche cela correspond-il à poser sur les deux nombres ?',
    },
    {
      kind: 'right',
      says: '« $91 = 7 \\times 13$ et $124 = 2^{2} \\times 31$ : aucun facteur ne se retrouve, on ne peut plus rien barrer ».',
      assess: 'Faut-il que 91 et 124 soient premiers pour qu’on ne puisse rien barrer ?',
      advance: 'Invente une autre fraction irréductible dont aucun terme n’est premier.',
    },
    {
      kind: 'miss',
      says: '« $\\dfrac{490}{686}$ : je divise par 2, ça fait $\\dfrac{245}{343}$, c’est fini, je ne vois plus de 2, 3 ni 5 ».',
      assess: 'Que valent 245 et 343 écrits avec leurs facteurs premiers ?',
      advance: 'Quel facteur reste dans les deux termes ?',
    },
    {
      kind: 'miss',
      says: '« Je barre le 7 une seule fois : $\\dfrac{490}{686} = \\dfrac{70}{98}$, et j’arrête ».',
      assess: '70 et 98 ont-ils encore un facteur premier commun ?',
      advance: 'Combien de fois 7 est-il dans chaque terme ?',
    },
    {
      kind: 'miss',
      says: '« Pour $\\dfrac{627}{726}$, je divise par 11 : c’est un diviseur commun, donc la fraction est finie ».',
      assess: 'Écris $\\dfrac{627 \\div 11}{726 \\div 11}$ : que remarques-tu ?',
      advance: 'Quel est le plus grand nombre qui divise 627 et 726 ?',
    },
    {
      kind: 'miss',
      says: '« Les deux fractions du produit étaient irréductibles, donc le produit l’est aussi ».',
      assess: 'Que vaut le produit $11 \\times 34$ ? Et $20 \\times 55$ ?',
      advance: 'Quel facteur premier est dans 374 et dans 1 100 ?',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord une planche qui laisse une case (7 sur le pont de 84 cases) : une planche doit remplir la partie éclairée ET le pont.',
    'Puis les deux rangées de 490 et 686 : les planches faites des facteurs qu’elles partagent, et la fraction 5 sur 7.',
    'Puis 91 sur 124 : seule la planche de 1 remplit les deux, bien que ni 91 ni 124 ne soit premier.',
    'Puis 627 sur 726 : le PGCD 33 réécrit la fraction d’un coup, là où 11 laisse du travail.',
    'Enfin 11 sur 20 fois 34 sur 55 : le produit 374 sur 1 100 s’écrit encore plus petit.',
  ],
  connect:
    'Les trois gestes disent la même chose : une fraction est terminée quand ses deux termes n’ont plus de facteur premier commun. Barrer les facteurs communs sur les décompositions, ou diviser d’un coup par le PGCD, mène à la même fraction : $\\dfrac{a}{b} = \\dfrac{a \\div g}{b \\div g}$ avec $g = \\text{PGCD}(a ; b)$.',
  // ── what is written, the short check, support and extension ──
  written: [
    'On écrit les décompositions du numérateur et du dénominateur, et on barre chaque facteur premier commun aux deux termes, autant de fois qu’il est dans les deux : $\\dfrac{490}{686} = \\dfrac{2 \\times 5 \\times 7^{2}}{2 \\times 7 \\times 7^{2}} = \\dfrac{5}{7}$.',
    'Une fraction est irréductible quand son numérateur et son dénominateur n’ont aucun facteur premier commun, c’est-à-dire quand leur PGCD est 1 : $\\text{PGCD}(91 ; 124) = 1$.',
    'Pour rendre une fraction irréductible en une seule étape, on divise son numérateur et son dénominateur par leur PGCD : $\\dfrac{627}{726} = \\dfrac{627 \\div 33}{726 \\div 33} = \\dfrac{19}{22}$.',
    'Même si les fractions du calcul sont irréductibles, le résultat peut ne pas l’être : on cherche un facteur premier commun à ses deux termes et on le rend irréductible. $\\dfrac{11}{20} \\times \\dfrac{34}{55} = \\dfrac{374}{1\\,100} = \\dfrac{17}{50}$.',
  ],
  exit: [
    {
      q: 'Rends irréductible la fraction $\\dfrac{2^{2} \\times 3 \\times 11}{2 \\times 3^{2} \\times 11}$.',
      a: 'On barre $2$, $3$ et $11$ : il reste $\\dfrac{2}{3}$.',
      check: {
        top: [
          [2, 2],
          [3, 1],
          [11, 1],
        ],
        bottom: [
          [2, 1],
          [3, 2],
          [11, 1],
        ],
        reduced: [2, 3],
      },
    },
    {
      q: 'La fraction $\\dfrac{77}{111}$ est-elle irréductible ? Justifie.',
      a: 'Oui : $77 = 7 \\times 11$ et $111 = 3 \\times 37$ n’ont aucun facteur premier commun.',
      check: { n: 77, d: 111, irreducible: true },
    },
    {
      q: 'Avec les divisions d’Euclide, rends irréductible la fraction $\\dfrac{667}{725}$.',
      a: '$725 = 667 \\times 1 + 58$, $667 = 58 \\times 11 + 29$, $58 = 29 \\times 2 + 0$ : $\\text{PGCD}(667 ; 725) = 29$, donc $\\dfrac{667}{725} = \\dfrac{23}{25}$.',
      check: { n: 667, d: 725, rows: 3, pgcd: 29, reduced: [23, 25] },
    },
    {
      q: 'Calcule $\\dfrac{17}{20} \\times \\dfrac{28}{51}$ et donne le résultat sous forme irréductible.',
      a: '$\\dfrac{17}{20} \\times \\dfrac{28}{51} = \\dfrac{476}{1\\,020} = \\dfrac{7}{15}$ : on divise par $\\text{PGCD}(476 ; 1\\,020) = 68$.',
      check: { x: [17, 20], y: [28, 51], n: 476, d: 1020, pgcd: 68, reduced: [7, 15] },
    },
  ],
  support: [
    'Écrire les deux décompositions l’une sous l’autre, facteur premier par facteur premier, et entourer ce qui se retrouve.',
    'Commencer par des fractions dont les termes sont inférieurs à 100, avec des décompositions déjà écrites.',
    'Pour le PGCD, un tableau à quatre colonnes pour les divisions d’Euclide : dividende, diviseur, quotient, reste.',
  ],
  extend: [
    'Combien de fractions $\\dfrac{n}{30}$ irréductibles y a-t-il avec $1 \\le n < 30$ ?',
    'Peut-on rendre irréductible une fraction dont le numérateur est le dénominateur plus 1 ? Pourquoi ?',
    'Trouve deux fractions irréductibles dont la somme est un nombre entier.',
  ],
  extendCheck: { totatives30: 8, consecutive: 1 },
  next: 'La séance suivante : « Engrenages et rendez-vous : quand deux rythmes se retrouvent » — les multiples communs de deux nombres.',
};
