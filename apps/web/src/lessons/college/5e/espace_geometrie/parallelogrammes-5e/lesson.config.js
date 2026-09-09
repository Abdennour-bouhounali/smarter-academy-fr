/**
 * Parallélogrammes (5e).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `parallelogrammes` du domaine « Espace et géométrie ».
 * Spécification de conception : docs/lessons/5E_PARALLELOGRAMMES_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé
 * catalogue '5e_parallelogrammes', dérivés de l'ORDRE de pointsToLearn) :
 *
 *   5e_parallelogrammes-5e_P1  Reconnaître un parallélogramme à sa définition
 *   5e_parallelogrammes-5e_P2  Construire un parallélogramme
 *   5e_parallelogrammes-5e_P3  Utiliser l'égalité des côtés opposés
 *   5e_parallelogrammes-5e_P4  Utiliser le point d'intersection des diagonales
 *   5e_parallelogrammes-5e_P5  Reconnaître un rectangle, un losange et un carré
 *                              comme parallélogrammes particuliers
 *   5e_parallelogrammes-5e_P6  Justifier qu'un quadrilatère est un parallélogramme
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un parallélogramme n'est pas
 * une forme qu'on reconnaît de l'œil, c'est un quadrilatère dont les côtés
 * opposés sont parallèles — et cette seule condition en impose toutes les
 * autres. L'élève le découvre en traînant le quatrième sommet : quand les
 * deux lampes de parallélisme s'allument, les deux lampes d'égalité des
 * longueurs s'allument AU MÊME INSTANT, sans qu'il les ait demandées.
 *
 * FIL NARRATIF : le portail en croisillons. Un portillon de jardin qu'on
 * ouvre et qu'on ferme : les lattes restent parallèles, les losanges se
 * déforment, les côtés opposés gardent leur longueur. Le laboratoire ne
 * quitte plus la leçon — c'est lui qui livre la construction (M2), les
 * propriétés des côtés (M3), le milieu commun des diagonales (M4), la
 * famille (M6) et l'aire (M7).
 *
 * PROGRESSION — la progression demandée par le cahier des charges, rung par
 * rung : quadrilatère → parallélogramme → propriétés des côtés → propriétés
 * des diagonales → caractérisations → rectangle/losange/carré → aire →
 * problème complexe. Aucune propriété n'est énoncée avant d'avoir été
 * observée sur la figure, puis mise à l'épreuve d'un contre-exemple cherché
 * par l'élève.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : LES VECTEURS, exclus par
 * l'objet officiel, et avec eux la translation (leçon de 4e
 * « Parallélogrammes et translations »). La frontière n'est pas
 * documentaire : components/paral.js LÈVE si l'on demande une translation,
 * et paral.test.js le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/parallelogrammes-5e';

export const LESSON_CONFIG = {
  id: 'parallelogrammes-5e',
  sequentialUnlock: true,
  title: 'Les parallélogrammes',
  description:
    'Traîner le quatrième sommet d’un quadrilatère jusqu’à ce que ses côtés opposés deviennent parallèles, découvrir qu’il n’y a qu’une place possible et que les longueurs suivent toutes seules, chercher en vain un contre-exemple aux propriétés des côtés et des diagonales, puis apprendre à choisir la propriété qui permet de conclure — et reconnaître enfin le rectangle, le losange et le carré pour ce qu’ils sont : des parallélogrammes avec une condition en plus.',
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔷',
  estimatedDurationMin: 78,
  skills: [
    'Reconnaître un parallélogramme à sa définition',
    'Construire un parallélogramme',
    "Utiliser l'égalité des côtés opposés",
    "Utiliser le point d'intersection des diagonales",
    'Reconnaître un rectangle, un losange et un carré comme parallélogrammes particuliers',
    "Justifier qu'un quadrilatère est un parallélogramme",
  ],
  teachingScope: {
    include: [
      'La définition : les côtés opposés sont parallèles deux à deux',
      'La construction du quatrième sommet',
      'Les propriétés des côtés opposés : longueurs et angles',
      'Les diagonales : elles se coupent en leur milieu',
      'Les caractérisations : quelle propriété permet de conclure',
      'Les parallélogrammes particuliers : rectangle, losange, carré',
      'L’aire d’un parallélogramme : base × hauteur',
    ],
    exclude: [
      'Les vecteurs (exclus par l’objet officiel — 3e)',
      'La translation et le lien translation / parallélogramme (4e)',
      'La démonstration rédigée hypothèse → théorème → conclusion (3e)',
      'Le théorème des milieux et la droite des milieux (4e)',
      'Le repérage et les coordonnées dans le plan',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, toutes de 6e et toutes diagnostiquées
  // par le module 0 : le vocabulaire du quadrilatère, le parallélisme, la
  // diagonale, le milieu, la notation des segments, l'angle droit.
  priorKnowledge: [
    'quadrilatere', 'droites-paralleles', 'diagonale', 'milieu-segment',
    'notation-segment', 'angle-droit', 'losange',
    // Trois notions de 6e que la leçon MOBILISE sans les enseigner : la
    // perpendicularité (le distracteur des diagonales du losange, M4), le
    // périmètre (mis en contraste avec l'aire dans un indice, M7) et le
    // sommet d'une figure plane (le diagnostic). Les déclarer ici est ce que
    // demande KNOWLEDGE_DEPENDENCY.md — elles sont alors en état « acquis »
    // plutôt que jamais posées.
    'droites-perpendiculaires', 'perimetre', 'sommet-solide',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'slate', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-portail-qui-souvre', path: `${LESSON_BASE_PATH}/le-portail-qui-souvre`,
      title: 'Le portail qui s’ouvre', desc: 'Traîne le quatrième sommet jusqu’à ce que les quatre témoins s’allument. Il n’y a qu’une place.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Ouvrir le portail',
    },
    {
      id: '02', number: 2, slug: 'la-quatrieme-place', path: `${LESSON_BASE_PATH}/la-quatrieme-place`,
      title: 'La quatrième place', desc: 'Trois points sont posés. Le quatrième n’a pas le choix — trouve où, trois fois de suite.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P1', '5e_parallelogrammes-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Placer le sommet',
    },
    {
      id: '03', number: 3, slug: 'ce-que-les-cotes-promettent', path: `${LESSON_BASE_PATH}/ce-que-les-cotes-promettent`,
      title: 'Ce que les côtés promettent', desc: 'Déforme autant que tu veux : cherche un parallélogramme dont les côtés opposés ne sont pas égaux.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Chercher un contre-exemple',
    },
    {
      id: '04', number: 4, slug: 'le-point-ou-tout-se-croise', path: `${LESSON_BASE_PATH}/le-point-ou-tout-se-croise`,
      title: 'Le point où tout se croise', desc: 'Les diagonales se coupent quelque part. Regarde bien où — et ne confonds pas deux propriétés.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Croiser les diagonales',
    },
    {
      id: '05', number: 5, slug: 'quelle-propriete-conclut', path: `${LESSON_BASE_PATH}/quelle-propriete-conclut`,
      title: 'Quelle propriété permet de conclure ?', desc: 'Six figures codées. À chaque fois : quelle propriété permet d’affirmer — ou de ne pas pouvoir.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Choisir la propriété',
    },
    {
      id: '06', number: 6, slug: 'la-famille', path: `${LESSON_BASE_PATH}/la-famille`,
      title: 'La famille des parallélogrammes', desc: 'Pousse un parallélogramme vers le rectangle, le losange, le carré — sans jamais cesser d’en être un.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P5'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Explorer la famille',
    },
    {
      id: '07', number: 7, slug: 'l-aire-et-la-hauteur', path: `${LESSON_BASE_PATH}/l-aire-et-la-hauteur`,
      title: 'L’aire, et le piège de la hauteur', desc: 'Fais glisser un sommet : le côté s’allonge, l’aire ne bouge pas. Pourquoi ?',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_parallelogrammes-5e_P3'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Faire glisser',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-parallelogramme', path: `${LESSON_BASE_PATH}/mission-finale-le-parallelogramme`,
      title: '🏆 Mission finale : le parallélogramme', desc: 'Dix épreuves pour prouver qu’une propriété vaut mieux qu’un coup d’œil.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 7, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
