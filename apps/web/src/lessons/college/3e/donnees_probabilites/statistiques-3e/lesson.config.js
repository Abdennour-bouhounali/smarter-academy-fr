/**
 * Statistiques (3e) — « La série élastique ».
 *
 * Learning Points (coursesData.js, clé '3e_statistiques') :
 *   3e_statistiques-3e_P1  — Lire et organiser une série statistique
 *   3e_statistiques-3e_P2  — Identifier les effectifs et les valeurs
 *   3e_statistiques-3e_P3  — Calculer et interpréter une moyenne
 *   3e_statistiques-3e_P4  — Déterminer et interpréter une médiane
 *   3e_statistiques-3e_P5  — Déterminer et interpréter une étendue
 *   3e_statistiques-3e_P6  — Comparer deux séries statistiques
 *   3e_statistiques-3e_P7  — Identifier l'influence d'une valeur sur un indicateur
 *   3e_statistiques-3e_P8  — Choisir un indicateur adapté à une situation
 *   3e_statistiques-3e_P9  — Interpréter des résultats dans leur contexte
 *   3e_statistiques-3e_P10 — Résoudre des problèmes avec des données statistiques
 *
 * IDÉE CENTRALE — les indicateurs ne réagissent PAS de la même façon. Tirer une
 * valeur vers l'extrême déplace la moyenne et laisse la médiane immobile. Ce
 * n'est pas une propriété à retenir : c'est quelque chose qui se voit, à
 * condition de pouvoir tirer la valeur soi-même.
 *
 * POURQUOI UN POINT D'ÉQUILIBRE — la moyenne est présentée comme le point où la
 * série « tient en équilibre », pas comme le résultat d'une division. Les écarts
 * de part et d'autre se compensent exactement : c'est ce que `balanceGap` mesure
 * et ce que le curseur fait sentir. La formule somme ÷ effectif arrive ensuite,
 * comme la façon de calculer ce point.
 *
 * OBJET FIL ROUGE : les temps de trajet d'une classe pour venir au collège.
 * Assez concret pour que « la moyenne des trajets » ait un sens, et assez
 * dispersé pour qu'un élève venant de loin change tout.
 *
 * MODULE 1 — LE LABORATOIRE DU DÉ. La leçon s'ouvre sur une expérience
 * aléatoire : un dé lancé 1, 10, 100, 1 000 fois. Les faces sont les VALEURS,
 * les nombres d'apparitions les EFFECTIFS (P1, P2), et la série grandit sous
 * les yeux de l'élève jusqu'à ce que les fréquences se stabilisent — d'où
 * émerge 1/6, la probabilité, en transition vers la leçon Probabilités.
 * Voir docs/lessons/3E_STATISTIQUES_M1_LANCER_LE_DE_SPEC.md.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/statistiques-3e';

export const LESSON_CONFIG = {
  id: 'statistiques-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Statistiques',
  description:
    "Manipuler une série de données pour voir la moyenne se déplacer, la médiane résister et l'étendue s'ouvrir, puis choisir l'indicateur qui répond vraiment à la question posée.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : additionner, diviser, ranger des nombres et lire une
  // proportion viennent des années antérieures. Le module 0 les diagnostique —
  // et rien d'autre. Tout le vocabulaire statistique (série, valeur, effectif,
  // fréquence, moyenne, médiane, étendue, indicateur…) est établi DANS la
  // leçon, par des <KnowledgeBrick>, jamais supposé connu.
  priorKnowledge: ['calcul-numerique', 'nombres-relatifs', 'ordre-nombres', 'proportionnalite', 'pourcentage'],
  knowledgeAudit: {
    ignore: [
      // « ordre croissant » au module 0 : c'est le vocabulaire ordinaire du
      // rangement de nombres (6e), pas les variations d'une fonction.
      { term: 'variations', reason: "« ordre croissant » — rangement de nombres de 6e, pas les variations d'une fonction" },
      // « n'appartient pas à la série » (module 3) : français courant. Le
      // symbole ∈ n'est jamais écrit ni demandé dans cette leçon.
      { term: 'appartient', reason: "verbe français courant ; le symbole ∈ n'apparaît nulle part" },
    ],
  },
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 85,
  skills: [
    'Lire et organiser une série statistique',
    "Identifier les effectifs et les valeurs d'une série",
    'Calculer et interpréter une moyenne',
    'Déterminer et interpréter une médiane',
    'Déterminer et interpréter une étendue',
    'Comparer deux séries statistiques',
    "Identifier l'influence d'une valeur sur un indicateur",
    'Choisir un indicateur adapté à une situation',
    'Interpréter des résultats statistiques dans leur contexte',
    'Résoudre des problèmes faisant intervenir des données statistiques',
  ],
  teachingScope: {
    include: [
      'Série statistique, valeurs et effectifs',
      'Moyenne comme point d’équilibre et par le calcul',
      'Médiane, y compris pour un effectif pair',
      'Étendue et dispersion',
      'Influence d’une valeur extrême et choix de l’indicateur',
    ],
    exclude: [
      'Quartiles et diagrammes en boîte',
      'Écart type et variance',
      'Séries regroupées en classes d’amplitude',
      'Fréquences cumulées',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'lancer-le-de', path: `${LESSON_BASE_PATH}/lancer-le-de`,
      title: 'Lancer le dé',
      desc: 'Prédis, lance, relance : le hasard se range en série, et les fréquences se stabilisent.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_statistiques-3e_P1', '3e_statistiques-3e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Lancer le dé',
    },
    {
      id: '02', number: 2, slug: 'le-point-dequilibre', path: `${LESSON_BASE_PATH}/le-point-dequilibre`,
      title: 'Le point d’équilibre',
      desc: 'Place le pivot là où la série tient en équilibre. C’est la moyenne.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_statistiques-3e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Chercher l’équilibre',
    },
    {
      id: '03', number: 3, slug: 'la-valeur-du-milieu', path: `${LESSON_BASE_PATH}/la-valeur-du-milieu`,
      title: 'La valeur du milieu',
      desc: 'Autant au-dessus qu’en dessous : la médiane, et l’écart entre les extrêmes.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_statistiques-3e_P4', '3e_statistiques-3e_P5'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Trouver le milieu',
    },
    {
      id: '04', number: 4, slug: 'la-serie-elastique', path: `${LESSON_BASE_PATH}/la-serie-elastique`,
      title: 'La série élastique',
      desc: 'Tire une valeur vers l’extrême : un indicateur suit, l’autre non.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_statistiques-3e_P7', '3e_statistiques-3e_P3', '3e_statistiques-3e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Tirer la valeur',
    },
    {
      id: '05', number: 5, slug: 'trois-indicateurs', path: `${LESSON_BASE_PATH}/trois-indicateurs`,
      title: 'Trois indicateurs',
      desc: 'Ce que chacun dit, ce qu’aucun ne dit, et quand les utiliser.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_statistiques-3e_P2', '3e_statistiques-3e_P3', '3e_statistiques-3e_P4', '3e_statistiques-3e_P5', '3e_statistiques-3e_P8'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Formaliser',
    },
    {
      id: '06', number: 6, slug: 'deux-classes', path: `${LESSON_BASE_PATH}/deux-classes`,
      title: 'Deux classes',
      desc: 'Même moyenne, deux réalités très différentes.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_statistiques-3e_P6', '3e_statistiques-3e_P8', '3e_statistiques-3e_P9'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer',
    },
    {
      id: '07', number: 7, slug: 'le-labo-des-donnees', path: `${LESSON_BASE_PATH}/le-labo-des-donnees`,
      title: 'Le labo des données',
      desc: 'Atteindre une moyenne visée, et démonter une affirmation trompeuse.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_statistiques-3e_P10', '3e_statistiques-3e_P9'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Enquêter',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-journal-du-college', path: `${LESSON_BASE_PATH}/mission-finale-le-journal-du-college`,
      title: '🏆 Mission finale : le journal du collège',
      desc: 'Dix épreuves pour publier des chiffres qui ne mentent pas.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
