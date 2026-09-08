/**
 * Transformations — symétrie centrale (5e).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `transformations` du domaine « Espace et géométrie », applicable à la
 * 5e à la rentrée 2026-2027.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '5e_transformations', append-only) :
 *
 *   5e_transformations-5e_P1  Reconnaître une symétrie centrale comme un demi-tour
 *   5e_transformations-5e_P2  Construire le symétrique d'un point par rapport à un centre
 *   5e_transformations-5e_P3  Construire le symétrique d'une figure
 *   5e_transformations-5e_P4  Identifier le centre de symétrie d'une figure
 *   5e_transformations-5e_P5  Utiliser les propriétés conservées par la symétrie centrale
 *   5e_transformations-5e_P6  Distinguer symétrie centrale et symétrie axiale
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : la symétrie centrale n'est pas
 * une construction à mémoriser, c'est UN DEMI-TOUR. On pose une pointe de
 * compas sur la feuille, on fait tourner la figure d'un demi-tour autour
 * d'elle, et on regarde où elle arrive. Tout le reste — « le centre est le
 * milieu de [MM'] », la conservation des longueurs, des angles, des aires —
 * n'est que la description de ce geste unique.
 *
 * FIL NARRATIF : le calque qui tourne. Le module 1 fait littéralement pivoter
 * un calque autour d'une punaise que l'élève déplace ; il découvre que le
 * demi-tour envoie chaque point à une place parfaitement prévisible. Le
 * laboratoire ne quitte plus la leçon : c'est lui qui, module après module,
 * livre le milieu (M2), les invariants (M4), le centre d'une figure (M5) et
 * le contraste avec l'axiale (M6).
 *
 * PROGRESSION — manipuler, observer, conjecturer, justifier, formaliser,
 * réutiliser. Aucune propriété n'est énoncée avant d'avoir été observée sur
 * la figure, puis mise à l'épreuve d'un contre-exemple cherché par l'élève.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : la rotation d'un angle
 * quelconque (4e), la translation (4e), les vecteurs (3e), la composition de
 * transformations et l'homothétie (3e). Ces frontières ne sont pas que
 * documentaires : components/transformations.js LÈVE si l'on demande une
 * rotation d'un angle autre que 180°, et le test le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/transformations-5e';

export const LESSON_CONFIG = {
  id: 'transformations-5e',
  sequentialUnlock: true,
  title: 'Transformations : la symétrie centrale',
  description:
    "Faire tourner un calque d’un demi-tour autour d’une punaise, découvrir que chaque point atterrit à une place prévisible, établir que le centre est toujours le milieu du segment qui joint un point à son image, puis vérifier ce que ce demi-tour conserve — longueurs, angles, aires — et ce qui distingue vraiment un demi-tour d’un pliage.",
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔄',
  estimatedDurationMin: 65,
  skills: [
    'Reconnaître une symétrie centrale comme un demi-tour',
    "Construire le symétrique d'un point par rapport à un centre",
    "Construire le symétrique d'une figure",
    "Identifier le centre de symétrie d'une figure",
    'Utiliser les propriétés conservées par la symétrie centrale',
    'Distinguer symétrie centrale et symétrie axiale',
  ],
  teachingScope: {
    include: [
      'La symétrie centrale comme demi-tour autour d’un point',
      'Le centre, milieu du segment joignant un point à son image',
      'La construction du symétrique d’un point, puis d’une figure',
      'Les propriétés conservées : longueurs, angles, aires, alignement',
      'Le centre de symétrie d’une figure',
      'La différence entre symétrie centrale et symétrie axiale',
    ],
    exclude: [
      'La rotation d’un angle quelconque (4e)',
      'La translation (4e)',
      'Les vecteurs (3e)',
      'La composition de deux transformations (3e)',
      'L’homothétie (3e)',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, toutes diagnostiquées par le module 0 :
  // le vocabulaire du segment et de son milieu, la symétrie axiale et les
  // figures planes — tout cela vient de la 6e.
  priorKnowledge: [
    'milieu-segment', 'notation-segment', 'axe-symetrie', 'droites-perpendiculaires',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-calque-qui-tourne', path: `${LESSON_BASE_PATH}/le-calque-qui-tourne`,
      title: 'Le calque qui tourne', desc: 'Plante une punaise, fais faire un demi-tour à la figure — et regarde où elle arrive.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_transformations-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Faire tourner',
    },
    {
      id: '02', number: 2, slug: 'ou-atterrit-un-point', path: `${LESSON_BASE_PATH}/ou-atterrit-un-point`,
      title: 'Où atterrit un point ?', desc: 'Un seul point, une punaise — et une règle de placement que tu vas trouver toi-même.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_transformations-5e_P1', '5e_transformations-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Trouver la règle',
    },
    {
      id: '03', number: 3, slug: 'construire-une-figure', path: `${LESSON_BASE_PATH}/construire-une-figure`,
      title: 'Construire la figure entière', desc: 'Point par point, sans calque : la construction devient une méthode.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_transformations-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '04', number: 4, slug: 'ce-qui-ne-change-pas', path: `${LESSON_BASE_PATH}/ce-qui-ne-change-pas`,
      title: 'Ce qui ne change pas', desc: 'Cherche une longueur, un angle, une aire que le demi-tour abîme. Tu n’en trouveras pas.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_transformations-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Chercher un contre-exemple',
    },
    {
      id: '05', number: 5, slug: 'le-centre-d-une-figure', path: `${LESSON_BASE_PATH}/le-centre-d-une-figure`,
      title: 'Une figure qui se retrouve sur elle-même', desc: 'Certaines figures reviennent exactement sur elles-mêmes après un demi-tour.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_transformations-5e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Trouver le centre',
    },
    {
      id: '06', number: 6, slug: 'demi-tour-ou-pliage', path: `${LESSON_BASE_PATH}/demi-tour-ou-pliage`,
      title: 'Demi-tour ou pliage ?', desc: 'Deux transformations qu’on confond — et le test qui les sépare pour de bon.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_transformations-5e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Les distinguer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-demi-tour', path: `${LESSON_BASE_PATH}/mission-finale-le-demi-tour`,
      title: '🏆 Mission finale : le demi-tour', desc: 'Dix épreuves pour prouver que le demi-tour n’a plus de secret.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
