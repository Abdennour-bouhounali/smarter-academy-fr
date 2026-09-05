/**
 * Graphiques — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_graphiques_P1   Comprendre l'intérêt d'un graphique pour représenter des données
 *   6e_graphiques_P2   Identifier les éléments principaux d'un graphique
 *   6e_graphiques_P3   Lire une valeur à partir d'un graphique
 *   6e_graphiques_P4   Associer un graphique à un tableau de données
 *   6e_graphiques_P5   Construire un graphique simple à partir d'un tableau
 *   6e_graphiques_P6   Comparer des valeurs représentées graphiquement
 *   6e_graphiques_P7   Identifier une valeur maximale ou minimale
 *   6e_graphiques_P8   Repérer une augmentation ou une diminution
 *   6e_graphiques_P9   Interpréter des informations issues d'un graphique
 *   6e_graphiques_P10  Détecter et corriger une représentation graphique incorrecte
 *
 * L'IDÉE CENTRALE : le graphique n'est pas une illustration du tableau,
 * c'est le MÊME nombre transformé en hauteur. La leçon est construite sur un
 * couple tableau ↔ graphique réellement lié (module 3, manipulation
 * signature) : l'élève tire une barre, la case du tableau change ; il change
 * la case, la barre bouge. Une seule donnée, deux rendus (chartUtils.js).
 *
 * Le piège central de la leçon est l'ÉCHELLE : une barre deux fois plus
 * haute ne signifie « deux fois plus » que si l'axe part de zéro et que les
 * graduations sont régulières. Le module 6 en fait un atelier de détection.
 *
 * Fil narratif unique : la station météo du collège (températures de la
 * semaine), prolongée par le sondage des activités du club.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/donnees_proportionnalite/graphiques';

export const LESSON_CONFIG = {
  id: 'graphiques',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Graphiques',
  description:
    'Transformer des nombres en image et savoir la relire : hauteurs, axes, échelle, maximum, évolution — et repérer les graphiques qui mentent.',
  level: 'college',
  grade: '6e',
  chapter: 'donnees_proportionnalite',
  chapterTitle: 'Organisation et gestion de données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 82,
  skills: [
    "Comprendre l'intérêt d'un graphique pour représenter des données",
    "Identifier les éléments principaux d'un graphique",
    'Lire une valeur à partir d’un graphique',
    'Associer un graphique à un tableau de données',
    'Construire un graphique simple à partir d’un tableau',
    'Comparer des valeurs représentées graphiquement',
    'Identifier une valeur maximale ou minimale',
    'Repérer une augmentation ou une diminution',
    'Interpréter des informations issues d’un graphique',
    'Détecter et corriger une représentation graphique incorrecte',
  ],
  teachingScope: {
    include: ['Diagrammes en bâtons, circulaires', 'Graphiques cartésiens simples'],
    exclude: ['Histogrammes à classes inégales'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'douze-nombres-ou-une-image', path: `${LESSON_BASE_PATH}/douze-nombres-ou-une-image`,
      title: 'Douze nombres ou une image', desc: 'Quel jour a-t-il fait le plus chaud ? Compte… ou regarde.',
      stage: 'trigger', teachesLearningPointIds: ['6e_graphiques_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'anatomie-d-un-graphique', path: `${LESSON_BASE_PATH}/anatomie-d-un-graphique`,
      title: "Anatomie d'un graphique", desc: 'Axes, graduations, titre, unités : sans eux, une barre ne dit rien.',
      stage: 'discovery', teachesLearningPointIds: ['6e_graphiques_P2', '6e_graphiques_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Explorer' },
    { id: '03', number: 3, slug: 'tableau-et-graphique-lies', path: `${LESSON_BASE_PATH}/tableau-et-graphique-lies`,
      title: 'Tableau et graphique liés', desc: 'Tire une barre, la case change. Change la case, la barre bouge.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_graphiques_P4', '6e_graphiques_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Manipuler' },
    { id: '04', number: 4, slug: 'lire-comparer-reperer', path: `${LESSON_BASE_PATH}/lire-comparer-reperer`,
      title: 'Lire, comparer, repérer', desc: 'Le plus haut, le plus bas, et tout ce qui se compare d’un regard.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_graphiques_P6', '6e_graphiques_P7'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comparer' },
    { id: '05', number: 5, slug: 'ca-monte-ca-descend', path: `${LESSON_BASE_PATH}/ca-monte-ca-descend`,
      title: 'Ça monte, ça descend', desc: 'Relier les points fait apparaître une histoire : l’évolution.',
      stage: 'formalization', teachesLearningPointIds: ['6e_graphiques_P8', '6e_graphiques_P9'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Suivre' },
    { id: '06', number: 6, slug: 'le-graphique-qui-ment', path: `${LESSON_BASE_PATH}/le-graphique-qui-ment`,
      title: 'Le graphique qui ment', desc: 'Trois graphiques truqués : trouve la faute et corrige-la.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_graphiques_P10'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Enquêter' },
    { id: '07', number: 7, slug: 'la-station-meteo', path: `${LESSON_BASE_PATH}/la-station-meteo`,
      title: '🏆 Mission finale : la station météo', desc: 'Dix épreuves pour publier le bulletin du collège.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 13, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
