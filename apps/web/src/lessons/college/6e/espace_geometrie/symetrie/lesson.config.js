/**
 * Symétrie — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 10 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_symetrie_P1   Comprendre le principe d'une symétrie axiale
 *   6e_symetrie_P2   Identifier un axe de symétrie
 *   6e_symetrie_P3   Reconnaître une figure ou une situation présentant une symétrie
 *   6e_symetrie_P4   Comprendre la relation entre un point et son symétrique
 *   6e_symetrie_P5   Construire le symétrique d'un point
 *   6e_symetrie_P6   Construire le symétrique d'une figure
 *   6e_symetrie_P7   Utiliser la perpendicularité pour construire un symétrique
 *   6e_symetrie_P8   Utiliser l'égalité des distances à l'axe de symétrie
 *   6e_symetrie_P9   Identifier les propriétés conservées par symétrie
 *   6e_symetrie_P10  Résoudre des problèmes de symétrie
 *
 * PÉRIMÈTRE OFFICIEL : symétrie AXIALE uniquement ; axe de symétrie d'une
 * figure ; conservation des longueurs, angles et aires. La symétrie CENTRALE
 * est explicitement exclue du programme de 6e.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/symetrie';

export const LESSON_CONFIG = {
  id: 'symetrie',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // Formalisation continue par la carte : chaque module pose ses briques et se
  // termine sur l'état courant de la carte (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A) : exactement ce que les cinq
  // questions du module 0 mesurent — se repérer par des coordonnées, calculer
  // une distance sur une graduation, connaître le carré, et savoir qu'une
  // distance à une droite se mesure perpendiculairement. La symétrie
  // elle-même est entièrement établie par les briques de la leçon.
  priorKnowledge: [
    'coordonnees',
    'abscisse',
    'angle-droit',
    'droites-perpendiculaires',
  ],
  title: 'Symétrie',
  description:
    'Découvrir la symétrie axiale comme un pliage : construire le symétrique d’un point puis d’une figure, et comprendre ce qui se conserve.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🪞',
  estimatedDurationMin: 77,
  skills: [
    'Comprendre la symétrie axiale comme un pliage',
    'Identifier un axe de symétrie',
    'Comprendre la relation entre un point et son symétrique',
    'Construire le symétrique d’un point et d’une figure',
    'Utiliser la perpendicularité et l’égalité des distances',
    'Reconnaître les propriétés conservées',
  ],
  teachingScope: {
    include: [
      'Symétrie axiale',
      'Axe de symétrie d’une figure',
      'Conservation des longueurs, angles, aires',
    ],
    exclude: ['Symétrie centrale', 'Rotations', 'Translations'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-pliage', path: `${LESSON_BASE_PATH}/le-pliage`,
      title: 'Le pliage', desc: 'Plie la feuille : les deux moitiés se superposent-elles exactement ?',
      stage: 'trigger', teachesLearningPointIds: ['6e_symetrie_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'trouver-l-axe', path: `${LESSON_BASE_PATH}/trouver-l-axe`,
      title: 'Trouver l’axe', desc: 'Où passe le pli ? Certaines figures en ont plusieurs, d’autres aucun.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_symetrie_P2', '6e_symetrie_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Chercher' },
    { id: '03', number: 3, slug: 'le-point-et-son-image', path: `${LESSON_BASE_PATH}/le-point-et-son-image`,
      title: 'Le point et son image', desc: 'Déplace un point : son symétrique suit. Quelle règle le relie ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_symetrie_P4', '6e_symetrie_P8'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Manipuler' },
    { id: '04', number: 4, slug: 'construire-le-symetrique', path: `${LESSON_BASE_PATH}/construire-le-symetrique`,
      title: 'Construire le symétrique', desc: 'À toi de placer l’image — perpendiculaire, puis distance égale.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_symetrie_P5', '6e_symetrie_P7'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Construire' },
    { id: '05', number: 5, slug: 'la-regle-du-miroir', path: `${LESSON_BASE_PATH}/la-regle-du-miroir`,
      title: 'La règle du miroir', desc: 'Deux conditions, jamais une seule : la fiche à retenir.',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_symetrie_P9'],
      color: 'blue', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Retenir' },
    { id: '06', number: 6, slug: 'completer-une-figure', path: `${LESSON_BASE_PATH}/completer-une-figure`,
      title: 'Compléter une figure', desc: 'La moitié est donnée : reconstitue l’autre, point par point.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_symetrie_P6'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Compléter' },
    { id: '07', number: 7, slug: 'problemes-de-symetrie', path: `${LESSON_BASE_PATH}/problemes-de-symetrie`,
      title: 'Problèmes de symétrie', desc: 'Se servir de la symétrie pour déduire une longueur, un angle.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_symetrie_P10'],
      color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Résoudre' },
    { id: '08', number: 8, slug: 'mission-finale-le-papillon', path: `${LESSON_BASE_PATH}/mission-finale-le-papillon`,
      title: '🏆 Mission finale : le papillon', desc: 'Dix épreuves : axes, images, constructions et conservations.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
