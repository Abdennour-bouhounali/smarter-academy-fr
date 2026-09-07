/**
 * Théorème de Pythagore — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 12 LPs de cette leçon (clé catalogue '3e_pythagore') :
 *
 *   3e_pythagore-3e_P1   Reconnaître un triangle rectangle
 *   3e_pythagore-3e_P2   Identifier l'angle droit
 *   3e_pythagore-3e_P3   Identifier l'hypoténuse
 *   3e_pythagore-3e_P4   Comprendre la relation entre les carrés des longueurs des côtés
 *   3e_pythagore-3e_P5   Écrire correctement l'égalité de Pythagore
 *   3e_pythagore-3e_P6   Calculer la longueur de l'hypoténuse
 *   3e_pythagore-3e_P7   Calculer la longueur d'un côté de l'angle droit
 *   3e_pythagore-3e_P8   Utiliser les racines carrées dans les calculs de longueurs
 *   3e_pythagore-3e_P9   Vérifier qu'un résultat est cohérent avec la configuration
 *   3e_pythagore-3e_P10  Utiliser la réciproque du théorème de Pythagore
 *   3e_pythagore-3e_P11  Démontrer qu'un triangle est rectangle
 *   3e_pythagore-3e_P12  Résoudre des problèmes concrets à l'aide du théorème de Pythagore
 *
 * L'IDÉE CENTRALE : le théorème est une ÉGALITÉ D'AIRES avant d'être une
 * formule. Les trois carrés sont réellement tracés et leurs aires MESURÉES
 * (`polygonArea`) — l'ancienne version écrivait « aire = a² + b² » sur le
 * grand carré, ce qui affirmait le résultat au lieu de le faire constater.
 * L'équivalence « équilibre ⟺ angle droit » est manipulée dans les deux sens
 * (modules 2 et 3), ce qui installe la réciproque avant de la nommer.
 *
 * REFONTE (2026-09-04) : leçon portée sur le lesson kit. Les modules pré-kit
 * appelaient `markModuleCompleted('L0N')`, un espace de noms que rien ne lit
 * (ModuleLayout enregistre `String(number)`), d'où un déverrouillage
 * séquentiel qui ne voyait jamais les modules terminés. Git conserve
 * l'archive des anciens modules.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : plan uniquement. La trigonométrie
 * et Pythagore dans l'espace ont leurs propres leçons.
 *
 * Fil narratif unique : « le chantier », repris figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/pythagore-3e';

export const LESSON_CONFIG = {
  id: 'pythagore-3e',
  // Formalisation continue par la carte des connaissances.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, diagnostiquées par le module 0.
  // « angle droit » (6e) est un prérequis au même titre que le triangle
  // rectangle : le module 0 le diagnostique dès sa première question, et la
  // leçon ne l'enseigne pas — elle enseigne le lien entre cet angle et les
  // aires des carrés.
  priorKnowledge: ['triangle-rectangle', 'angle-droit', 'aire', 'puissance', 'racine-carree', 'arrondi'],
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Théorème de Pythagore',
  description:
    "Construire les carrés sur les trois côtés et voir la balance des aires s'équilibrer exactement quand l'angle est droit, puis écrire l'égalité, calculer une longueur et démontrer qu'un triangle est rectangle.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 82,
  skills: [
    'Reconnaître un triangle rectangle',
    "Identifier l'angle droit",
    "Identifier l'hypoténuse",
    'Comprendre la relation entre les carrés des longueurs des côtés',
    "Écrire correctement l'égalité de Pythagore",
    "Calculer la longueur de l'hypoténuse",
    "Calculer la longueur d'un côté de l'angle droit",
    'Utiliser les racines carrées dans les calculs de longueurs',
    "Vérifier qu'un résultat est cohérent avec la configuration",
    'Utiliser la réciproque du théorème de Pythagore',
    "Démontrer qu'un triangle est rectangle",
    "Résoudre des problèmes concrets à l'aide du théorème de Pythagore",
  ],
  teachingScope: {
    include: [
      'Angle droit et hypoténuse, quelle que soit l’orientation',
      'Égalité des aires des carrés construits sur les côtés',
      'Théorème direct : calcul de l’hypoténuse et d’un côté de l’angle droit',
      'Racines carrées et arrondis dans les calculs de longueurs',
      'Réciproque et contraposée, rédaction d’une démonstration',
      'Problèmes concrets : échelle, diagonale, corde du maçon',
    ],
    exclude: [
      'Trigonométrie (leçon dédiée du même chapitre)',
      'Théorème de Pythagore dans l’espace',
      'Valeurs exactes non simplifiables poussées (radicaux composés)',
      'Démonstration du théorème lui-même',
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
      id: '01', number: 1, slug: 'langle-droit-et-son-vis-a-vis', path: `${LESSON_BASE_PATH}/langle-droit-et-son-vis-a-vis`,
      title: 'L’angle droit et son vis-à-vis', desc: 'Des triangles posés de travers : retrouve l’hypoténuse quand même.',
      stage: 'trigger',
      teachesLearningPointIds: [
        '3e_pythagore-3e_P1', '3e_pythagore-3e_P2', '3e_pythagore-3e_P3',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Chercher',
    },
    {
      id: '02', number: 2, slug: 'les-trois-carres', path: `${LESSON_BASE_PATH}/les-trois-carres`,
      title: 'Les trois carrés', desc: 'Trois triangles rectangles, trois relevés : la balance ne bouge pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_pythagore-3e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Peser les carrés',
    },
    {
      id: '03', number: 3, slug: 'quand-langle-nest-plus-droit', path: `${LESSON_BASE_PATH}/quand-langle-nest-plus-droit`,
      title: 'Quand l’angle n’est plus droit', desc: 'Casse l’angle droit : la balance penche aussitôt.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_pythagore-3e_P4', '3e_pythagore-3e_P10'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Déformer',
    },
    {
      id: '04', number: 4, slug: 'ecrire-puis-calculer', path: `${LESSON_BASE_PATH}/ecrire-puis-calculer`,
      title: 'Écrire, puis calculer', desc: 'De la balance à l’égalité, et de l’égalité au résultat.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_pythagore-3e_P5', '3e_pythagore-3e_P6', '3e_pythagore-3e_P8',
      ],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '05', number: 5, slug: 'le-cote-manquant', path: `${LESSON_BASE_PATH}/le-cote-manquant`,
      title: 'Le côté manquant', desc: 'Même théorème, mais cette fois on soustrait.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_pythagore-3e_P7', '3e_pythagore-3e_P9'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Soustraire',
    },
    {
      id: '06', number: 6, slug: 'direct-et-reciproque', path: `${LESSON_BASE_PATH}/direct-et-reciproque`,
      title: 'Direct et réciproque', desc: 'Assemble une démonstration : deux membres, une comparaison, une conclusion.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_pythagore-3e_P11', '3e_pythagore-3e_P10'],
      color: 'blue', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Rédiger',
    },
    {
      id: '07', number: 7, slug: 'echelles-et-diagonales', path: `${LESSON_BASE_PATH}/echelles-et-diagonales`,
      title: 'Échelles, écrans et diagonales', desc: 'Repérer l’angle droit là où personne ne l’annonce.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_pythagore-3e_P12', '3e_pythagore-3e_P9'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-chantier', path: `${LESSON_BASE_PATH}/mission-finale-le-chantier`,
      title: '🏆 Mission finale : le chantier', desc: 'Dix épreuves pour prouver que tu maîtrises Pythagore.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
