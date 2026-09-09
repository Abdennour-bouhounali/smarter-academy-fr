/**
 * Fonctions — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `fonctions` du domaine « Proportionnalité et fonctions », rôle
 * « INTRODUCTION » — la 5e est le premier maillon de la chaîne
 * 5e → 4e → 3e → seconde. Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception de la famille : docs/lessons/5E_PROPORTIONNALITE_FONCTIONS_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '5e_fonctions', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   5e_fonctions-5e_P1  Identifier la grandeur qui dépend d'une autre dans une situation
 *   5e_fonctions-5e_P2  Employer l'expression « en fonction de »
 *   5e_fonctions-5e_P3  Compléter un tableau de valeurs à partir d'un programme de calcul
 *   5e_fonctions-5e_P4  Lire une valeur dans un tableau de valeurs
 *   5e_fonctions-5e_P5  Lire une valeur sur un graphique cartésien
 *   5e_fonctions-5e_P6  Répondre à une question concrète à partir d'un graphique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : dans une situation, une
 * grandeur en DÉTERMINE une autre. Dire « le prix en fonction du nombre de
 * croissants », c'est nommer qui commande et qui suit — et cet ordre n'est
 * pas symétrique.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE SA VOISINE DE FAMILLE (`proportionnalite-5e`) :
 * là-bas, l'objet d'étude est LE COEFFICIENT, et une situation non
 * proportionnelle est un contre-exemple qu'on apprend à écarter. Ici, l'objet
 * est LA DÉPENDANCE, et une situation non proportionnelle est un cas
 * parfaitement normal — la plupart des dépendances n'ont pas de coefficient.
 * Le tableau et le graphique servent là-bas à trouver et à reconnaître ; ici,
 * à lire et à répondre.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. La notation f(x), les mots
 * « image » et « antécédent », les fonctions linéaires et affines sont des
 * objets de 3e. Ils ne doivent apparaître NULLE PART : ni énoncé, ni
 * distracteur, ni correction. La 5e construit l'intuition fonctionnelle ;
 * elle ne la formalise pas.
 *
 * Fil narratif : le four à pain de la cantine, puis la journée du collège —
 * la cuisson, la douche, la sortie scolaire, la croissance d'une plante.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/proportionnalite_fonctions/fonctions-5e';

export const LESSON_CONFIG = {
  id: 'fonctions-5e',
  sequentialUnlock: true,
  title: 'Fonctions',
  description:
    "Régler un four et voir trois grandeurs réagir à la même commande, découvrir qu'une même durée redonne toujours le même pain, dire ce qui dépend de quoi avec l'expression « en fonction de », ranger une dépendance dans un tableau de valeurs, transformer chaque couple en point, et lire un graphique pour répondre à une vraie question.",
  level: 'college',
  grade: '5e',
  chapter: 'proportionnalite_fonctions',
  chapterTitle: 'Proportionnalité et fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 75,
  skills: [
    "Identifier la grandeur qui dépend d'une autre dans une situation",
    "Employer l'expression « en fonction de »",
    'Compléter un tableau de valeurs à partir d’un programme de calcul',
    'Lire une valeur dans un tableau de valeurs',
    'Lire une valeur sur un graphique cartésien',
    'Répondre à une question concrète à partir d’un graphique',
  ],
  teachingScope: {
    include: [
      'La dépendance entre deux grandeurs : laquelle commande, laquelle suit',
      "L'expression « en fonction de » et son sens orienté",
      'Une même entrée redonne toujours la même sortie',
      'Le tableau de valeurs : ranger une dépendance',
      'Un programme de calcul, et le tableau qu’il engendre',
      'Chaque couple devient un point du repère',
      'Lire une valeur sur un graphique, et répondre à une question concrète',
    ],
    exclude: [
      'La notation f(x) (3e)',
      'Les mots « image » et « antécédent » (3e)',
      'Les fonctions linéaires et affines (3e)',
      'Le coefficient directeur et l’ordonnée à l’origine (3e)',
      'La reconnaissance de la proportionnalité (objet officiel « Proportionnalité », leçon sœur)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : le repérage dans le plan (6e), la lecture d'un tableau (6e), et
  // le calcul littéral au sens de la 5e — remplacer une lettre par un nombre.
  priorKnowledge: [
    'coordonnees', 'abscisse', 'ordonnee', 'lire-tableau', 'calcul-numerique',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-four', path: `${LESSON_BASE_PATH}/le-four`,
      title: 'Le four', desc: 'Une seule molette, trois grandeurs qui réagissent. Remets la même durée : le même pain revient.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_fonctions-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Enfourner',
    },
    {
      id: '02', number: 2, slug: 'qui-commande-qui', path: `${LESSON_BASE_PATH}/qui-commande-qui`,
      title: 'Qui commande qui ?', desc: 'Une phrase pour dire la dépendance — et elle ne se retourne pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_fonctions-5e_P2', '5e_fonctions-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Dire la dépendance',
    },
    {
      id: '03', number: 3, slug: 'le-carnet-de-bord', path: `${LESSON_BASE_PATH}/le-carnet-de-bord`,
      title: 'Le carnet de bord', desc: 'Range la dépendance dans un tableau, puis fais-le produire par un programme de calcul.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_fonctions-5e_P3', '5e_fonctions-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Remplir le carnet',
    },
    {
      id: '04', number: 4, slug: 'un-couple-un-point', path: `${LESSON_BASE_PATH}/un-couple-un-point`,
      title: 'Un couple, un point', desc: 'Chaque ligne du tableau devient un point. Place-les, et une forme apparaît.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_fonctions-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '05', number: 5, slug: 'lire-le-graphique', path: `${LESSON_BASE_PATH}/lire-le-graphique`,
      title: 'Lire le graphique', desc: 'Une vraie question, une sonde à déplacer : la réponse est sur le dessin.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_fonctions-5e_P6', '5e_fonctions-5e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Interroger la courbe',
    },
    {
      id: '06', number: 6, slug: 'la-cabane-du-club', path: `${LESSON_BASE_PATH}/la-cabane-du-club`,
      title: 'La cabane du club', desc: 'Une situation entière, de la règle au graphique : à toi de la mener de bout en bout.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_fonctions-5e_P3', '5e_fonctions-5e_P4', '5e_fonctions-5e_P6'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Mener l’enquête',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-journee', path: `${LESSON_BASE_PATH}/mission-finale-la-journee`,
      title: '🏆 Mission finale : la journée', desc: 'Dix épreuves pour prouver que tu sais dire, ranger et lire une dépendance.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
