/**
 * Représentation graphique (3e) — « L'atelier du graphique ».
 *
 * Learning Points (coursesData.js, clé '3e_representation_graphique') :
 *   3e_representation-graphique-3e_P1  — Identifier les axes
 *   3e_representation-graphique-3e_P2  — Comprendre le rôle de l'échelle
 *   3e_representation-graphique-3e_P3  — Lire les coordonnées d'un point
 *   3e_representation-graphique-3e_P4  — Placer un point à partir de ses coordonnées
 *   3e_representation-graphique-3e_P5  — Construire un graphique à partir d'un tableau
 *   3e_representation-graphique-3e_P6  — Associer un graphique à une situation
 *   3e_representation-graphique-3e_P7  — Associer un graphique à un tableau
 *   3e_representation-graphique-3e_P8  — Relier un graphique à une expression
 *   3e_representation-graphique-3e_P9  — Comparer plusieurs graphiques
 *   3e_representation-graphique-3e_P10 — Interpréter les informations représentées
 *   3e_representation-graphique-3e_P11 — Détecter et corriger un graphique incorrect
 *
 * IDÉE CENTRALE — un graphique n'est pas donné, il se CONSTRUIT, et chaque
 * décision de construction (quelle grandeur sur quel axe, quelle échelle,
 * relier ou non) change ce qu'on voit. L'élève fabrique donc le graphique
 * avant de le lire, puis répare ceux des autres.
 *
 * CE QUI LA DISTINGUE DES LEÇONS VOISINES :
 *  - `fonctions-3e` M04 plaçait des points d'un tableau sur une grille d'unités
 *    pour constater l'alignement. Ici l'échelle est le sujet : les données sont
 *    décimales, le pas ne vaut pas 1, et placer entre deux graduations est la
 *    difficulté.
 *  - `lecture-graphique-3e` LIT avec une échelle imposée ; cette leçon-ci
 *    CHOISIT l'échelle pour construire. C'est la différence à tenir.
 *  - Le module 6 ne rejoue pas « le graphique qui ment » de 6e : il ajoute le
 *    piège proprement 3e de l'échelle qui aplatit une variation réelle.
 *
 * INVARIANT SIGNATURE : les mêmes données, lues à deux échelles différentes,
 * racontent deux histoires — alors que les nombres n'ont pas bougé.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/representation-graphique-3e';

export const LESSON_CONFIG = {
  id: 'representation-graphique-3e',
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : elles viennent du repérage de 6e et des trois leçons
  // antérieures du même chapitre — `fonctions-3e` (fonction, f(x), image,
  // tableau de valeurs), `fonctions-lineaires-3e` et `fonctions-affines-3e`
  // (forme ax + b, rôle de a, ordonnée à l'origine). Le module 0 les
  // diagnostique une par une.
  //
  // CE QUE CETTE LEÇON N'ASSUME PAS. Le rôle de l'échelle, le placement entre
  // deux graduations, le choix des axes et la détection d'un graphique
  // trompeur sont sa matière (P1, P2, P4, P11) : ce sont des briques `new`,
  // pas des prérequis. Deux questions du module 0 les pré-testaient ; elles
  // ont été remplacées.
  priorKnowledge: [
    'fonction', 'notation-fx', 'image', 'tableau-de-valeurs',
    'fonction-affine', 'coefficient-lineaire', 'ordonnee-origine',
    'abscisse', 'ordonnee', 'coordonnees', 'origine-repere',
  ],
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Représentation graphique',
  description:
    "Choisir les axes et l'échelle, placer les points d'un tableau entre les graduations, décider de relier ou non, puis reconnaître et réparer les graphiques qui trompent.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 70,
  skills: [
    "Identifier les axes d'une représentation graphique",
    "Comprendre le rôle de l'échelle",
    "Lire les coordonnées d'un point",
    'Placer un point à partir de ses coordonnées',
    'Construire une représentation graphique à partir d’un tableau',
    'Associer une représentation graphique à une situation',
    'Associer une représentation graphique à un tableau de valeurs',
    'Relier une représentation graphique à une expression de fonction',
    'Comparer plusieurs représentations graphiques',
    'Interpréter les informations représentées graphiquement',
    'Détecter et corriger une représentation graphique incorrecte',
  ],
  teachingScope: {
    include: [
      'Choix des axes et des grandeurs représentées',
      "Choix d'une échelle et conséquences sur la lecture",
      'Placement de points à coordonnées décimales',
      'Construction complète depuis un tableau de valeurs',
      'Détection des graphiques trompeurs et leur correction',
    ],
    exclude: [
      'Diagrammes circulaires et histogrammes statistiques',
      'Échelles logarithmiques',
      'Régression et ajustement de courbes',
      'Lecture fine des variations (leçon Lecture graphique)',
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
      id: '01', number: 1, slug: 'une-image-vaut-douze-lignes', path: `${LESSON_BASE_PATH}/une-image-vaut-douze-lignes`,
      title: 'Une image vaut cinq lignes',
      desc: 'Cinq mesures dans un tableau. Mets-les en points : que voit-on de plus ?',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P1', '3e_representation-graphique-3e_P4', '3e_representation-graphique-3e_P10'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Construire l’image',
    },
    {
      id: '02', number: 2, slug: 'lechelle-qui-change-tout', path: `${LESSON_BASE_PATH}/lechelle-qui-change-tout`,
      title: 'L’échelle qui change tout',
      desc: 'Mêmes nombres, deux échelles, deux impressions opposées.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P2', '3e_representation-graphique-3e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Changer d’échelle',
    },
    {
      id: '03', number: 3, slug: 'entre-deux-graduations', path: `${LESSON_BASE_PATH}/entre-deux-graduations`,
      title: 'Entre deux graduations',
      desc: 'Quand le pas ne vaut pas 1, placer un point demande de compter.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P4', '3e_representation-graphique-3e_P5'],
      color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Placer les points',
    },
    {
      id: '04', number: 4, slug: 'latelier-du-graphique', path: `${LESSON_BASE_PATH}/latelier-du-graphique`,
      title: 'L’atelier du graphique',
      desc: 'Axes, échelle, points, tracé : construis le graphique de bout en bout.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P5', '3e_representation-graphique-3e_P2', '3e_representation-graphique-3e_P3', '3e_representation-graphique-3e_P4', '3e_representation-graphique-3e_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '05', number: 5, slug: 'quatre-graphiques-quatre-histoires', path: `${LESSON_BASE_PATH}/quatre-graphiques-quatre-histoires`,
      title: 'Quatre graphiques, quatre histoires',
      desc: 'Associer une courbe à une situation, à un tableau, à une expression.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P6', '3e_representation-graphique-3e_P8', '3e_representation-graphique-3e_P9'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Associer',
    },
    {
      id: '06', number: 6, slug: 'quatre-graphiques-a-reparer', path: `${LESSON_BASE_PATH}/quatre-graphiques-a-reparer`,
      title: 'Quatre graphiques à réparer',
      desc: 'Axe tronqué, axes inversés, point égaré, échelle qui aplatit.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_representation-graphique-3e_P11', '3e_representation-graphique-3e_P10', '3e_representation-graphique-3e_P9'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Réparer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-bureau-detudes', path: `${LESSON_BASE_PATH}/mission-finale-le-bureau-detudes`,
      title: '🏆 Mission finale : le bureau d’études',
      desc: 'Dix épreuves où chaque graphique doit dire la vérité.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 13, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
