/**
 * Racine carrée — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (clé catalogue '3e_racine_carree', append-only) :
 *
 *   3e_racines-carrees-3e_P1   Comprendre la racine carrée comme l'opération inverse du carré
 *   3e_racines-carrees-3e_P2   Reconnaître les carrés parfaits
 *   3e_racines-carrees-3e_P3   Calculer des racines carrées exactes
 *   3e_racines-carrees-3e_P4   Associer un nombre à son carré et à sa racine carrée
 *   3e_racines-carrees-3e_P5   Comprendre le sens géométrique de la racine carrée
 *   3e_racines-carrees-3e_P6   Utiliser les propriétés de la racine carrée
 *   3e_racines-carrees-3e_P7   Simplifier certaines expressions contenant des racines carrées
 *   3e_racines-carrees-3e_P8   Comparer des nombres contenant des racines carrées
 *   3e_racines-carrees-3e_P9   Utiliser les racines carrées dans des calculs
 *   3e_racines-carrees-3e_P10  Mobiliser les racines carrées dans des problèmes géométriques et numériques
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : √a, c'est le
 * CÔTÉ d'un carré d'aire a. La leçon ne commence donc pas par « la racine
 * carrée est l'opération inverse du carré » mais par un jardin de 49 m²
 * qu'on redimensionne jusqu'à ce qu'il tombe juste — puis par un jardin de
 * 50 m² où aucun côté entier ne tombe juste, et où même les décimaux
 * échouent : il faut un nombre d'un nouveau genre.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : la leçon reste sur les racines
 * carrées de niveau 3e. Sont exclus les équations x² = a comme objet
 * d'étude (aucun `pointsToLearn` ne les demande — la double solution n'est
 * pas au programme de cette leçon), la rationalisation des dénominateurs,
 * les racines n-ièmes et l'irrationalité démontrée.
 *
 * Fil narratif unique : « le carré à reconstruire » — le jardin du module 1,
 * le SquareLab en marche arrière du module 3, le pavage du module 5, repris
 * figés dans la synthèse du boss.
 *
 * REBUILD : cette leçon existait en version pré-kit. Ses défauts, corrigés
 * ici : aucun module n'appelait useProgress (la progression n'était JAMAIS
 * persistée) ; le bilan marquait `setScore(s => Math.max(s, INDEX))`, si
 * bien que seule la dernière question comptait ; plusieurs exercices
 * exigeaient du LaTeX tapé au clavier (« tape 2\sqrt{3} »). Ici : kit
 * (ContentModule / BossFinal), zéro saisie symbolique — QCM et assemblages.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/racines-carrees-3e';

export const LESSON_CONFIG = {
  id: 'racines-carrees-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : elles viennent des années précédentes et le module 0 les
  // diagnostique — le carré d'un nombre et sa notation, la priorité des
  // opérations, l'encadrement d'un nombre entre deux autres, l'aire d'un carré.
  // Tout le reste doit être établi dans la leçon même.
  priorKnowledge: ['carre-nombre', 'calcul-numerique', 'encadrement', 'aire',
    'perimetre', 'quotient', 'angle-droit', 'coefficient-lineaire'],
  title: 'Racine carrée',
  description:
    "Redimensionner un carré jusqu'à ce que son aire tombe juste, découvrir que pour 50 m² aucun nombre décimal ne convient, puis apprendre à encadrer, comparer, multiplier et simplifier ces nouveaux nombres — jusqu'à la diagonale d'un carré et l'hypoténuse d'un triangle.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '√',
  estimatedDurationMin: 78,
  skills: [
    "Comprendre la racine carrée comme l'opération inverse du carré",
    'Reconnaître les carrés parfaits',
    'Calculer des racines carrées exactes',
    'Associer un nombre à son carré et à sa racine carrée',
    'Comprendre le sens géométrique de la racine carrée',
    'Utiliser les propriétés de la racine carrée',
    'Simplifier certaines expressions contenant des racines carrées',
    'Comparer des nombres contenant des racines carrées',
    'Utiliser les racines carrées dans des calculs',
    'Mobiliser les racines carrées dans des problèmes géométriques et numériques',
  ],
  teachingScope: {
    include: [
      'La racine carrée comme côté d’un carré d’aire donnée',
      'Carrés parfaits de 1 à 144 et racines exactes',
      'Encadrement de √n entre deux entiers consécutifs',
      '(√a)² = a et √(a²) = a pour a positif',
      'Produit et quotient de racines carrées, et le contre-exemple de la somme',
      'Simplification a√b par extraction du plus grand carré parfait',
      'Comparaison de nombres contenant des racines, par les carrés',
      'Diagonale d’un carré, hypoténuse : Pythagore avec des racines',
    ],
    exclude: [
      'Les équations x² = a et leur double solution (aucun point du catalogue ne les demande)',
      'La rationalisation des dénominateurs',
      'Les racines n-ièmes (cubiques…)',
      'La démonstration de l’irrationalité de √2',
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
      id: '01', number: 1, slug: 'le-jardin-carre', path: `${LESSON_BASE_PATH}/le-jardin-carre`,
      title: 'Le jardin carré', desc: 'Un jardin de 49 m² : quel côté ? Redimensionne jusqu’à ce que ça tombe juste.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_racines-carrees-3e_P1', '3e_racines-carrees-3e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Redimensionner',
    },
    {
      id: '02', number: 2, slug: 'carres-parfaits', path: `${LESSON_BASE_PATH}/carres-parfaits`,
      title: 'L’escalier des carrés parfaits', desc: 'Monte l’escalier de 1 à 144 : chaque marche relie un nombre, son carré et sa racine.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_racines-carrees-3e_P2', '3e_racines-carrees-3e_P3', '3e_racines-carrees-3e_P4',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Monter l’escalier',
    },
    {
      id: '03', number: 3, slug: 'le-carre-a-reconstruire', path: `${LESSON_BASE_PATH}/le-carre-a-reconstruire`,
      title: 'Le carré à reconstruire', desc: 'On te donne l’aire, tu retrouves le côté — même quand aucun décimal ne tombe juste.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_racines-carrees-3e_P1', '3e_racines-carrees-3e_P4', '3e_racines-carrees-3e_P8',
      ],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Reconstruire',
    },
    {
      id: '04', number: 4, slug: 'pavage-et-produit', path: `${LESSON_BASE_PATH}/pavage-et-produit`,
      title: 'Pavage et produit', desc: 'Colle deux carrés côte à côte : le produit des racines se voit, la somme se casse.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_racines-carrees-3e_P6'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Assembler',
    },
    {
      id: '05', number: 5, slug: 'simplifier-une-racine', path: `${LESSON_BASE_PATH}/simplifier-une-racine`,
      title: 'Simplifier une racine', desc: 'Découpe un carré d’aire 12 en petits carrés identiques : son côté devient 2√3.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_racines-carrees-3e_P7'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découper',
    },
    {
      id: '06', number: 6, slug: 'pythagore-et-cie', path: `${LESSON_BASE_PATH}/pythagore-et-cie`,
      title: 'Pythagore et compagnie', desc: 'La diagonale d’un carré, une hypoténuse, des comparaisons : les racines au travail.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_racines-carrees-3e_P9', '3e_racines-carrees-3e_P10', '3e_racines-carrees-3e_P8',
      ],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Calculer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale', path: `${LESSON_BASE_PATH}/mission-finale`,
      title: '🏆 Mission finale : le carré à reconstruire', desc: 'Dix épreuves pour prouver qu’aucune racine ne te résiste.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
