/**
 * Translations et vecteurs — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 10 LPs de cette leçon (clé catalogue '3e_translations_vecteurs') :
 *
 *   3e_translations-vecteurs-3e_P1   Comprendre une translation comme un déplacement
 *   3e_translations-vecteurs-3e_P2   Identifier la direction, le sens et la longueur d'un déplacement
 *   3e_translations-vecteurs-3e_P3   Représenter un déplacement à l'aide d'un vecteur
 *   3e_translations-vecteurs-3e_P4   Construire l'image d'un point par une translation
 *   3e_translations-vecteurs-3e_P5   Construire l'image d'une figure par une translation
 *   3e_translations-vecteurs-3e_P6   Comprendre qu'un même vecteur peut représenter un même déplacement en différents endroits
 *   3e_translations-vecteurs-3e_P7   Identifier des vecteurs égaux
 *   3e_translations-vecteurs-3e_P8   Utiliser les coordonnées pour représenter un vecteur
 *   3e_translations-vecteurs-3e_P9   Déterminer les coordonnées d'un vecteur à partir de deux points
 *   3e_translations-vecteurs-3e_P10  Utiliser les translations et les vecteurs pour résoudre des problèmes géométriques
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un vecteur décrit un
 * DÉPLACEMENT, pas une position. Le module 4 fige donc les composantes et ne
 * laisse bouger que l'origine : l'élève promène la flèche et constate qu'elle
 * reste identique à elle-même. Le mot « vecteur » n'est prononcé qu'à ce
 * moment-là.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : la relation de Chasles n'est PAS
 * enseignée — aucun point du catalogue ne la demande. L'enchaînement de deux
 * déplacements apparaît une seule fois, en fin de leçon, comme une addition
 * de coordonnées et sans notation formelle.
 *
 * Fil narratif unique : « la chorégraphie des drones », repris figé dans la
 * synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/translations-vecteurs-3e';

export const LESSON_CONFIG = {
  id: 'translations-vecteurs-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Translations et vecteurs',
  description:
    "Reproduire un même trajet depuis un autre point de départ, découvrir qu'une flèche posée ailleurs reste le même vecteur, puis s'en servir pour translater des figures et construire des parallélogrammes.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➡️',
  estimatedDurationMin: 83,
  skills: [
    'Comprendre une translation comme un déplacement',
    "Identifier la direction, le sens et la longueur d'un déplacement",
    "Représenter un déplacement à l'aide d'un vecteur",
    "Construire l'image d'un point par une translation",
    "Construire l'image d'une figure par une translation",
    "Comprendre qu'un même vecteur peut représenter un même déplacement en différents endroits",
    'Identifier des vecteurs égaux',
    'Utiliser les coordonnées pour représenter un vecteur',
    "Déterminer les coordonnées d'un vecteur à partir de deux points",
    'Utiliser les translations et les vecteurs pour résoudre des problèmes géométriques',
  ],
  teachingScope: {
    include: [
      'Translation comme glissement, conservation des longueurs et des angles',
      'Direction, sens et longueur d’un déplacement',
      'Vecteur, vecteurs égaux, vecteur nul, vecteur opposé',
      'Image d’un point et d’une figure',
      'Coordonnées d’un vecteur à partir de deux points',
      'Parallélogramme et frise construits avec un vecteur',
    ],
    exclude: [
      'Relation de Chasles (aucun point du catalogue ne la demande)',
      'Colinéarité de deux vecteurs',
      'Produit scalaire',
      'Rotations et homothéties',
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
      id: '01', number: 1, slug: 'le-meme-trajet', path: `${LESSON_BASE_PATH}/le-meme-trajet`,
      title: 'Le même trajet', desc: 'Refais le trajet du drone modèle — en partant d’ailleurs.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P1', '3e_translations-vecteurs-3e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Piloter',
    },
    {
      id: '02', number: 2, slug: 'direction-sens-longueur', path: `${LESSON_BASE_PATH}/direction-sens-longueur`,
      title: 'Direction, sens, longueur', desc: 'Trois attributs, trois voyants qui s’allument séparément.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P2', '3e_translations-vecteurs-3e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Comparer',
    },
    {
      id: '03', number: 3, slug: 'toute-la-figure-bouge', path: `${LESSON_BASE_PATH}/toute-la-figure-bouge`,
      title: 'Toute la figure bouge', desc: 'La figure glisse sans tourner ni changer de taille.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P4', '3e_translations-vecteurs-3e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Translater',
    },
    {
      id: '04', number: 4, slug: 'la-fleche-vagabonde', path: `${LESSON_BASE_PATH}/la-fleche-vagabonde`,
      title: 'La flèche vagabonde', desc: 'Pose la même flèche à trois endroits : c’est toujours le même vecteur.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P6', '3e_translations-vecteurs-3e_P7'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Promener la flèche',
    },
    {
      id: '05', number: 5, slug: 'deux-nombres-suffisent', path: `${LESSON_BASE_PATH}/deux-nombres-suffisent`,
      title: 'Deux nombres suffisent', desc: 'Lire, puis calculer les coordonnées d’un vecteur.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P8', '3e_translations-vecteurs-3e_P9'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '06', number: 6, slug: 'vecteur-et-translation', path: `${LESSON_BASE_PATH}/vecteur-et-translation`,
      title: 'Vecteur et translation', desc: 'La notation, une fois le geste acquis.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P3', '3e_translations-vecteurs-3e_P7'],
      color: 'blue', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Formaliser',
    },
    {
      id: '07', number: 7, slug: 'problemes-de-deplacement', path: `${LESSON_BASE_PATH}/problemes-de-deplacement`,
      title: 'Problèmes de déplacement', desc: 'Fermer un parallélogramme, dessiner une frise, enchaîner deux trajets.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_translations-vecteurs-3e_P10', '3e_translations-vecteurs-3e_P9'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-la-choregraphie', path: `${LESSON_BASE_PATH}/mission-finale-la-choregraphie`,
      title: '🏆 Mission finale : la chorégraphie', desc: 'Dix épreuves pour prouver que tu maîtrises les vecteurs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
