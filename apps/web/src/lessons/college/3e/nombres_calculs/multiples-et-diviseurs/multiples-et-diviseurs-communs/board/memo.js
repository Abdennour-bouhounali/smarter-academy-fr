/**
 * « La fiche du professeur » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from a textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`). The teacher is « vous »;
 * the board's numbers come from `script.js › BOARD`; the openings and the exit ticket have their own. The words
 * « plus petit multiple commun » are written in full, never abbreviated (owner's default for this lesson).
 */
import { BOARD, FACTS } from './script';

const { situation: S, crews: C, factors: F, gears: G } = BOARD;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: S.a,
    b: S.b,
    board: true,
    title: 'Deux équipes, un seul pilier',
    story:
      'Deux équipes bâtissent une passerelle depuis le même bord, l’une avec des planches de 22 cases, l’autre avec des planches de 8 cases. Elles plantent un seul pilier, là où les deux finissent pile.',
    ask: 'À 22 cases du bord, l’équipe de 22 finit pile. Et l’équipe de 8 ? Où planter le pilier ?',
    why: 'C’est la situation de la séance au tableau : $22 = 8 \\times 2 + 6$, l’équipe de 8 s’arrête avant. Le premier pilier où les deux finissent pile est à 88 cases : $88 = 8 \\times 11 = 22 \\times 4$.',
    expect:
      'Ils proposent 22 ou 8, puis 30 (la somme) ou 176 (le produit) ; le premier pilier plus proche que 176 les oblige à essayer 44, 66, puis 88.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 45,
    b: 6,
    alt: 9,
    board: false,
    title: 'Deux frises de carreaux',
    story:
      'Deux frises partent du même coin d’un mur, l’une de carreaux de 6 cm, l’autre de carreaux de 9 cm. Au bout de 45 cm de mur, on regarde où elles finissent.',
    ask: 'À 45 cm, la frise de 9 cm finit-elle pile ? Et celle de 6 cm ? Où finissent-elles pile toutes les deux, pour la première fois ?',
    why: '$45 = 9 \\times 5$ mais $45 = 6 \\times 7 + 3$. Les deux frises finissent pile ensemble à 18 cm : $18 = 6 \\times 3 = 9 \\times 2$.',
    expect: 'Beaucoup répondent 54 (le produit) ; 18 arrive quand on liste les carreaux de 9 : 9, 18, puis on teste 6.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 44,
    b: 6,
    alt: 11,
    board: false,
    title: 'Deux listes de morceaux',
    story:
      'Deux listes de morceaux démarrent ensemble, l’une avec des morceaux de 6 minutes, l’autre avec des morceaux de 11 minutes. À la 44e minute, on regarde où elles en sont.',
    ask: 'À la 44e minute, la liste de 11 minutes vient-elle de finir un morceau ? Et celle de 6 minutes ? Quand finissent-elles un morceau en même temps ?',
    why: '$44 = 11 \\times 4$ mais $44 = 6 \\times 7 + 2$. Elles finissent ensemble après 66 minutes : $66 = 6 \\times 11 = 11 \\times 6$.',
    expect: 'Certains cherchent 17 (la somme) ; essayer 11, 22, 33, 44, 55, 66 montre que 66 est le premier.',
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 36,
    b: 8,
    alt: 12,
    board: false,
    title: 'Deux lignes de bus',
    story:
      'Une ligne de bus passe toutes les 8 minutes, une autre toutes les 12 minutes. À la 36e minute après un départ commun, on regarde laquelle vient de passer.',
    ask: 'À la 36e minute, la ligne de 12 minutes vient-elle de passer ? Et celle de 8 minutes ? Quand passeront-elles ensemble ?',
    why: '$36 = 12 \\times 3$ mais $36 = 8 \\times 4 + 4$. Elles repassent ensemble après 24 minutes : $24 = 8 \\times 3 = 12 \\times 2$.',
    expect: 'Certains répondent 96 (le produit) : il convient, mais 24 arrive bien avant ; demandez pourquoi.',
  },
];

export const MEMO = {
  title: 'Multiples communs et plus petit multiple commun',
  // ── the one page for the desk ──
  glance: {
    goal: 'À la fin de la séance, l’élève trouve le plus petit multiple commun de deux nombres — par les distances où deux rythmes finissent pile ou par leurs décompositions en facteurs premiers — et s’en sert pour lire un rendez-vous : une durée ou un nombre de tours.',
    idea: 'Deux rythmes partis ensemble se retrouvent pour la première fois au plus petit multiple commun non nul. Sur les décompositions, on prend tous les facteurs premiers vus, chacun avec son plus grand exposant. Pour plusieurs équipes qui travaillent puis dorment, on compte le jour 1 comme 0 jour écoulé et on ajoute le plus petit multiple commun des jours de travail et de sommeil réunis.',
    trap: 'Prendre le produit des deux nombres, ou le plus grand des deux, pour le plus petit multiple commun ; garder le plus petit exposant au lieu du plus grand ; oublier que le jour 1 compte pour 0 jour écoulé ; prendre les seuls jours de sommeil pour la durée d’un cycle.',
    minutes: [
      { moment: 'start', label: 'Test de début', min: 7 },
      { moment: 'revise', label: 'Les règles revues', min: 5 },
      { moment: 'lesson', label: 'La leçon au tableau', min: 25 },
      { moment: 'end', label: 'Test de fin', min: 8 },
    ],
    three: [
      'À quelles distances du bord les équipes de 22 et de 8 cases finissent-elles pile toutes les deux ? Laquelle est la première ?',
      'Pourquoi le plus petit multiple commun de $2^{3} \\times 5$ et de $5^{2} \\times 13$ garde-t-il $2^{3}$ et $5^{2}$ ?',
      'Trois équipes travaillent 1 jour puis dorment : à partir de quel jour retravaillent-elles toutes ensemble ?',
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'Écrit des multiples communs de deux nombres et reconnaît le premier non nul, leur plus petit multiple commun.',
      see: 'Pour 22 et 8, il écrit 88, 176, 264 et choisit 88.',
      check: { a: C.planks[1], b: C.planks[0], first: FACTS.crews.first, common: [88, 176, 264] },
    },
    {
      can: 'Lit le plus petit multiple commun sur deux décompositions : tous les facteurs premiers, chacun avec son plus grand exposant.',
      see: '$40 = 2^{3} \\times 5$ et $325 = 5^{2} \\times 13$, donc le plus petit multiple commun est $2^{3} \\times 5^{2} \\times 13 = 2\\,600$.',
      check: {
        a: F.a,
        b: F.b,
        lcm: FACTS.factors.whole,
        powers: [
          [2, 3],
          [5, 2],
          [13, 1],
        ],
      },
    },
    {
      can: 'Traduit une histoire de roues en équipes, puis relit la réponse en tours ou en heure.',
      see: 'Avec des roues de 9 et de 24 dents, il écrit 72 dents, puis 8 tours et 3 tours.',
      check: { a: G.teeth[0], b: G.teeth[1], lcm: FACTS.gears.meet, turns: FACTS.gears.turns },
    },
    {
      can: 'Compte les jours depuis le jour 1 et prend le plus petit multiple commun des jours de travail et de sommeil réunis.',
      see: 'Trois équipes de 12, 17 et 18 jours retravaillent ensemble le jour 613.',
      check: { cycles: FACTS.teams.cycles, lcm: FACTS.teams.all, day: FACTS.teams.day },
    },
  ],
  stands:
    'Les multiples et les tables, la division euclidienne et la divisibilité, vus de la 6e à la 4e ; la décomposition en facteurs premiers avec des puissances, vue à la première leçon de l’unité ; le PGCD, vu à la deuxième leçon, qui revient ici comme une mauvaise règle à écarter. Le plus petit multiple commun lui-même est nouveau.',
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
        'La décomposition en facteurs premiers : si la moitié de la classe oublie un exposant, prolongez les règles revues.',
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
      aim: 'La classe propose les piliers, le tableau pose les équipes, puis chaque règle reçoit son nom.',
      teacher:
        'Avant chaque essai, demandez « Qui prévoit ? » ; ne donnez pas la règle, laissez les deux équipes finir ou s’arrêter avant le pilier.',
      class:
        'Les élèves proposent des piliers et des jours, voient où chaque rythme finit pile, puis écrivent les décompositions ; ensuite seulement la règle prend son nom.',
      watch:
        'L’élève qui annonce un pilier sans vérifier la seconde équipe : demandez-lui les deux égalités, la division de chaque équipe.',
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
      says: '« À 88 cases les deux équipes finissent pile : 11 planches de 8 et 4 planches de 22 ».',
      assess: 'Comment es-tu sûr qu’aucun pilier plus proche ne convient ?',
      advance: 'Et si une troisième équipe posait des planches de 12 cases ?',
    },
    {
      kind: 'right',
      says: '« Les deux roues se retrouvent après 72 dents : 8 tours pour la petite, 3 tours pour la grande ».',
      assess: 'Pourquoi la roue de 9 dents fait-elle plus de tours que celle de 24 ?',
      advance: 'Et si les roues avaient 9 et 27 dents ?',
    },
    {
      kind: 'miss',
      says: '« Le pilier est à $8 \\times 22 = 176$ : c’est le produit ».',
      assess: 'Les deux équipes finissent-elles pile avant 176 ?',
      advance: 'Calcule $22 \\times 4$ et $8 \\times 11$ : où sont-elles déjà arrivées ?',
    },
    {
      kind: 'miss',
      says: '« Pour $2^{3} \\times 5$ et $5^{2} \\times 13$, je garde le 5 une seule fois, comme pour le PGCD ».',
      assess: 'La planche de 325 finit-elle pile avec un seul 5 ?',
      advance: 'Que manque-t-il à la rangée du pilier pour finir les planches de 325 ?',
    },
    {
      kind: 'miss',
      says: '« Les équipes qui dorment 11, 16 et 17 jours retravaillent ensemble après $11 \\times 16 \\times 17$ jours ».',
      assess: 'Une équipe qui dort 11 jours retravaille-t-elle après 11 jours ?',
      advance: 'Combien de jours séparent deux jours de travail de l’équipe A ?',
    },
    {
      kind: 'miss',
      says: '« Les trois équipes retravaillent ensemble le jour 612 ».',
      assess: 'Combien de jours se sont écoulés le jour 1 ?',
      advance: 'Écris le jour de départ, puis compte les 612 jours : à quel jour arrive-t-on ?',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    'D’abord un pilier où une équipe finit pile et pas l’autre (22 cases : l’équipe de 8 s’arrête avant).',
    'Puis les piliers 44 et 88 : seul 88 convient aux deux équipes.',
    'Puis deux planches trop longues pour essayer chaque pilier : les rangées de 40 et de 325, et un pilier auquel il manque un 2.',
    'Puis deux roues dentées dites en mots : 9 et 24 dents, 72 dents et 8 tours, 3 tours.',
    'Enfin trois équipes qui travaillent un jour puis dorment : le jour 37, puis le jour 613.',
  ],
  connect:
    'Les quatre situations cherchent le même nombre : le premier qui est à la fois dans la table de chaque rythme. La liste le montre quand les nombres sont petits, les décompositions le construisent facteur par facteur quand ils sont grands, et chaque histoire se traduit en équipes avant de se relire en tours, en heure ou en jour.',
  // ── what is written, the short check, support and extension ──
  written: [
    'Un multiple commun de deux nombres est un multiple de chacun ; le plus petit qui n’est pas 0 est leur plus petit multiple commun : celui de 22 et de 8 est 88.',
    'Sur deux décompositions, le plus petit multiple commun est le produit de tous les facteurs premiers vus, chacun avec son plus grand exposant : $2^{3} \\times 5^{2} \\times 13 = 2\\,600$.',
    'Deux rythmes partis ensemble se retrouvent pour la première fois après leur plus petit multiple commun ; chacun s’est alors répété ce nombre divisé par son propre rythme : 72 dents, 8 tours et 3 tours.',
    'Plusieurs équipes qui travaillent 1 jour puis dorment retravaillent ensemble le jour 1 plus le plus petit multiple commun de leurs jours de travail et de sommeil réunis : $1 + 612 = 613$.',
  ],
  exit: [
    {
      q: 'Écris les premiers multiples communs de 6 et de 15, puis leur plus petit multiple commun.',
      a: 'Les multiples communs sont 30, 60, 90 ; le plus petit est 30.',
      check: { a: 6, b: 15, common: [30, 60, 90], lcm: 30 },
    },
    {
      q: 'Quel est le plus petit multiple commun de $2^{3} \\times 3 \\times 5$ et de $2 \\times 3^{2} \\times 7$ ?',
      a: '$2^{3} \\times 3^{2} \\times 5 \\times 7 = 2\\,520$ : tous les facteurs, chacun avec son plus grand exposant.',
      check: {
        a: [
          [2, 3],
          [3, 1],
          [5, 1],
        ],
        b: [
          [2, 1],
          [3, 2],
          [7, 1],
        ],
        lcm: 2520,
      },
    },
    {
      q: 'Un bus passe toutes les 9 minutes, un tram toutes les 12 minutes. Ils passent ensemble à 7 h 10. À quelle heure repassent-ils ensemble pour la première fois ?',
      a: 'Le plus petit multiple commun de 9 et de 12 est 36 : ils repassent ensemble à 7 h 46.',
      check: { a: 9, b: 12, lcm: 36, start: [7, 10], back: [7, 46] },
    },
  ],
  support: [
    'Des petits nombres d’abord (4 et 6, 6 et 9), en écrivant les deux tables l’une sous l’autre jusqu’au premier nombre commun.',
    'Pour les décompositions, les écrire en colonnes, facteur premier par facteur premier, et entourer le plus grand exposant.',
    'Pour les histoires, écrire d’abord « une case, c’est… » puis les deux planches avant de chercher le pilier.',
  ],
  extend: [
    'Quel est le plus petit multiple commun de 7 et de 11 ? De 7 et de 21 ? Que remarquez-vous ?',
    'Combien de multiples communs de 6 et de 8 y a-t-il entre 1 et 100 ?',
    'Une équipe D de 4 jours rejoint les équipes de 12, 17 et 18 jours : le jour de rendez-vous change-t-il ? Pourquoi ?',
  ],
  extendCheck: { sevenEleven: 77, sevenTwentyOne: 21, commonSixEight: [24, 48, 72, 96], withFourth: 613 },
  next: 'La séance suivante : « Rendre une fraction irréductible » — diviser ses deux termes par leur PGCD.',
};
