/**
 * Équations produit nul — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_equations_inequations',
 * append-only) :
 *
 *   3e_equations-produit_P1   Comprendre une équation comme une égalité contenant une inconnue
 *   3e_equations-produit_P2   Comprendre la notion de solution d'une équation
 *   3e_equations-produit_P3   Transformer une équation en conservant les mêmes solutions
 *   3e_equations-produit_P4   Résoudre une équation du premier degré
 *   3e_equations-produit_P5   Utiliser la distributivité dans une équation
 *   3e_equations-produit_P6   Comprendre la propriété du produit nul
 *   3e_equations-produit_P7   Résoudre une équation produit nul
 *   3e_equations-produit_P8   Vérifier une solution
 *   3e_equations-produit_P9   Interpréter une solution dans une situation concrète
 *   3e_equations-produit_P10  Résoudre des problèmes à l'aide d'équations
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : un produit ne
 * vaut zéro que si l'un de ses facteurs vaut zéro. La leçon ne commence donc
 * pas par « A × B = 0 équivaut à… » mais par deux molettes que l'élève
 * tourne (ProductDial) jusqu'à ce que le produit tombe à 0 — et il constate
 * qu'il n'y a que trois façons d'y arriver, toutes avec un zéro dedans.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : la description catalogue parle
 * d'inéquations, mais AUCUN `pointsToLearn` n'en contient — la leçon n'en
 * enseigne donc pas. Sont également exclus le discriminant, les identités
 * (a + b)² / (a − b)² pour elles-mêmes (seule a² − b² apparaît, comme
 * CHEMIN vers un produit), et la factorisation à coefficients littéraux.
 *
 * Fil narratif unique : « le zéro qui gagne » — la molette du module 1, le
 * scanner de produit du module 4, puis le duel carré contre rectangle du
 * module 6, repris figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/equations-produit';

export const LESSON_CONFIG = {
  id: 'equations-produit',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Équations produit nul',
  description:
    "Tourner deux molettes jusqu'à faire tomber un produit à zéro, puis apprendre à lire une équation comme une balance, à scanner un produit pour y trouver ses zéros, et à ramener un problème d'aires à « quelque chose × quelque chose = 0 ».",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 77,
  skills: [
    'Comprendre une équation comme une égalité contenant une inconnue',
    "Comprendre la notion de solution d'une équation",
    'Transformer une équation en conservant les mêmes solutions',
    'Résoudre une équation du premier degré',
    'Utiliser la distributivité dans une équation',
    'Comprendre la propriété du produit nul',
    'Résoudre une équation produit nul',
    'Vérifier une solution',
    'Interpréter une solution dans une situation concrète',
    "Résoudre des problèmes à l'aide d'équations",
  ],
  teachingScope: {
    include: [
      'Équation, inconnue, solution, ensemble de solutions',
      'Transformations qui conservent les solutions (balance)',
      'Résolution de ax + b = c et de k(ax + b) = c',
      'Propriété du produit nul et équations produit',
      'Vérification et interprétation concrète des solutions',
      "Factorisation par facteur commun et a² − b² comme chemins vers un produit",
    ],
    exclude: [
      'Inéquations (aucun point du catalogue ne les demande)',
      'Équations du second degré générales (discriminant)',
      "Les identités (a + b)² et (a − b)² étudiées pour elles-mêmes",
      'Factorisation à coefficients littéraux',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'zero-ou-pas', path: `${LESSON_BASE_PATH}/zero-ou-pas`,
      title: 'Zéro ou pas zéro ?', desc: 'Deux molettes, un produit. Trouve toutes les façons de le faire tomber à 0.',
      stage: 'trigger', teachesLearningPointIds: ['3e_equations-produit_P6'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Tourner les molettes',
    },
    {
      id: '02', number: 2, slug: 'une-egalite-a-inconnue', path: `${LESSON_BASE_PATH}/une-egalite-a-inconnue`,
      title: 'Une égalité à trou', desc: 'Teste des valeurs de x : certaines rendent l’égalité vraie, les autres non.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_equations-produit_P1', '3e_equations-produit_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Tester des valeurs',
    },
    {
      id: '03', number: 3, slug: 'la-balance', path: `${LESSON_BASE_PATH}/la-balance`,
      title: 'La balance', desc: 'Enlève la même chose des deux côtés — sinon le plateau penche.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_equations-produit_P3', '3e_equations-produit_P4', '3e_equations-produit_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Équilibrer',
    },
    {
      id: '04', number: 4, slug: 'le-scanner-de-produit', path: `${LESSON_BASE_PATH}/le-scanner-de-produit`,
      title: 'Le scanner de produit', desc: 'Balaye la bande des x et repère les endroits où le produit tombe à 0.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_equations-produit_P6', '3e_equations-produit_P7'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Scanner',
    },
    {
      id: '05', number: 5, slug: 'verifier-et-interpreter', path: `${LESSON_BASE_PATH}/verifier-et-interpreter`,
      title: 'Vérifier et interpréter', desc: 'Remets tes solutions dans l’équation, puis regarde si elles ont un sens.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_equations-produit_P8', '3e_equations-produit_P9'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Vérifier',
    },
    {
      id: '06', number: 6, slug: 'carre-contre-rectangle', path: `${LESSON_BASE_PATH}/carre-contre-rectangle`,
      title: 'Carré contre rectangle', desc: 'Un carré et un rectangle de même aire : trouve x, puis prouve-le.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_equations-produit_P10', '3e_equations-produit_P5', '3e_equations-produit_P7',
      ],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale', path: `${LESSON_BASE_PATH}/mission-finale`,
      title: '🏆 Mission finale : le zéro qui gagne', desc: 'Dix épreuves pour prouver qu’aucun produit nul ne te résiste.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
