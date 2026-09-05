/**
 * Ensembles et intervalles — 2nde.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 5 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue
 * 'seconde_ensembles_et_intervalles', append-only) :
 *
 *   seconde_ensembles-et-intervalles-2nde_P1  Utiliser le langage des ensembles.
 *   seconde_ensembles-et-intervalles-2nde_P2  Lire et représenter des intervalles.
 *   seconde_ensembles-et-intervalles-2nde_P3  Décrire un ensemble de nombres à l’aide d’un intervalle.
 *   seconde_ensembles-et-intervalles-2nde_P4  Interpréter les bornes et les différents types d’intervalles.
 *   seconde_ensembles-et-intervalles-2nde_P5  Utiliser les intervalles pour résoudre des situations mathématiques.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un intervalle est l'ensemble
 * de TOUS les nombres réels entre deux bornes — pas seulement les entiers —
 * et le crochet dit si la borne en fait partie. La leçon s'ouvre sur le
 * panneau d'un manège (« à partir de 1,20 m, moins de 1,90 m ») que l'élève
 * teste avec des tailles, avant tout mot.
 *
 * Fil narratif : le filtre du manège (M1), retrouvé en croisant deux
 * attractions (M6) et figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde';

export const LESSON_CONFIG = {
  id: 'ensembles-et-intervalles-2nde',
  sequentialUnlock: true,
  title: 'Ensembles et intervalles',
  description:
    "Tester des tailles au panneau d'un manège, retourner des crochets, ranger des nombres dans des boîtes emboîtées, croiser deux plages : le langage des ensembles et les intervalles, découverts en manipulant la droite des réels avant d'être écrits.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 70,
  skills: [
    'Utiliser le langage des ensembles',
    'Lire et représenter des intervalles',
    "Décrire un ensemble de nombres à l'aide d'un intervalle",
    'Interpréter les bornes et les différents types d’intervalles',
    'Utiliser les intervalles pour résoudre des situations mathématiques',
  ],
  teachingScope: {
    include: [
      'Ensemble, élément, appartenance (∈, ∉), inclusion (⊂), ensemble vide, ℕ ⊂ ℤ ⊂ ℝ',
      'Intersection et réunion de deux ensembles finis, puis de deux intervalles',
      'Les quatre types d’intervalles bornés, les demi-droites, la borne infinie toujours ouverte',
      'Passer d’une double inégalité à un intervalle et réciproquement',
      'Résoudre une situation concrète par un intervalle (plage autorisée, budget, entiers d’un intervalle)',
    ],
    exclude: [
      'Les ensembles 𝔻 et ℚ et la nature des nombres (leçon « Nombres réels »)',
      'La valeur absolue et la distance (leçon « Valeur absolue et distance »)',
      'La résolution d’inéquations (leçon « Équations et inéquations »)',
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
      id: '01', number: 1, slug: 'le-manege', path: `${LESSON_BASE_PATH}/le-manege`,
      title: 'Le panneau du manège', desc: '« À partir de 1,20 m, moins de 1,90 m. » Teste des tailles : qui passe, qui reste dehors ?',
      stage: 'trigger',
      teachesLearningPointIds: [
        'seconde_ensembles-et-intervalles-2nde_P2', 'seconde_ensembles-et-intervalles-2nde_P4',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Tester une taille',
    },
    {
      id: '02', number: 2, slug: 'le-langage-des-ensembles', path: `${LESSON_BASE_PATH}/le-langage-des-ensembles`,
      title: 'Le langage des ensembles', desc: 'Des boîtes emboîtées, deux cercles qui se croisent : ∈, ⊂, ∩, ∪ et ∅ en rangeant des nombres.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_ensembles-et-intervalles-2nde_P1'],
      color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Ranger les nombres',
    },
    {
      id: '03', number: 3, slug: 'quatre-crochets', path: `${LESSON_BASE_PATH}/quatre-crochets`,
      title: 'Quatre crochets', desc: 'Fermé, ouvert, semi-ouvert, et la demi-droite qui ne s’arrête jamais.',
      stage: 'discovery',
      teachesLearningPointIds: [
        'seconde_ensembles-et-intervalles-2nde_P2', 'seconde_ensembles-et-intervalles-2nde_P4',
      ],
      color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Construire un intervalle',
    },
    {
      id: '04', number: 4, slug: 'inegalite-ou-intervalle', path: `${LESSON_BASE_PATH}/inegalite-ou-intervalle`,
      title: 'Inégalité ou intervalle ?', desc: '« −1 < x ≤ 4 » et « ]−1 ; 4] » disent la même chose. Passe de l’un à l’autre dans les deux sens.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        'seconde_ensembles-et-intervalles-2nde_P3', 'seconde_ensembles-et-intervalles-2nde_P4',
      ],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Traduire',
    },
    {
      id: '05', number: 5, slug: 'croiser-deux-intervalles', path: `${LESSON_BASE_PATH}/croiser-deux-intervalles`,
      title: 'Croiser deux intervalles', desc: 'À retenir, puis deux bandes sur la même droite : ce qui est dans les deux, ce qui est dans l’une ou l’autre.',
      stage: 'formalization',
      teachesLearningPointIds: [
        'seconde_ensembles-et-intervalles-2nde_P1', 'seconde_ensembles-et-intervalles-2nde_P4',
        'seconde_ensembles-et-intervalles-2nde_P5',
      ],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Croiser',
    },
    {
      id: '06', number: 6, slug: 'situations', path: `${LESSON_BASE_PATH}/situations`,
      title: 'Situations', desc: 'Deux attractions, un vaccin, un forfait, des entiers à compter : les intervalles au travail.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        'seconde_ensembles-et-intervalles-2nde_P5', 'seconde_ensembles-et-intervalles-2nde_P3',
      ],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-fete-foraine', path: `${LESSON_BASE_PATH}/mission-finale-la-fete-foraine`,
      title: '🏆 Mission finale : la fête foraine', desc: 'Dix épreuves pour prouver qu’aucun crochet ne te trompe.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
