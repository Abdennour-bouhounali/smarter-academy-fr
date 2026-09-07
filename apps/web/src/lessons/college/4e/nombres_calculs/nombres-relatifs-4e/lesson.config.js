/**
 * Opérations sur les nombres relatifs — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `nombres_relatifs` du domaine « Nombres et calculs », applicable à la
 * 4e à la rentrée 2027-2028. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon
 * (clé catalogue '4e_nombres_relatifs', append-only) :
 *
 *   4e_nombres-relatifs-4e_P1  Multiplier deux nombres relatifs
 *   4e_nombres-relatifs-4e_P2  Justifier la règle des signes par la régularité d'une table
 *   4e_nombres-relatifs-4e_P3  Déterminer le signe d'un produit de plusieurs facteurs
 *   4e_nombres-relatifs-4e_P4  Diviser deux nombres relatifs
 *   4e_nombres-relatifs-4e_P5  Enchaîner les quatre opérations sur des relatifs
 *   4e_nombres-relatifs-4e_P6  Contrôler le signe d'un résultat avant de calculer
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : la règle des signes n'est pas
 * une convention à mémoriser, c'est la SEULE façon de prolonger une table de
 * multiplication sans casser sa régularité. L'élève étend lui-même la table
 * vers les négatifs, constate que chaque colonne descend d'un pas constant, et
 * voit « − × − = + » apparaître comme la seule valeur possible.
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit le SENS du nombre relatif
 * (position, opposé, distance à zéro) et ses deux premières opérations (somme,
 * différence, vues comme des déplacements). La 4e ne les rejoue pas : elle
 * ouvre le produit et le quotient, puis l'enchaînement des quatre opérations.
 *
 * PÉRIMÈTRE — hors sujet ici : les racines carrées de nombres négatifs
 * (exclusion officielle), le calcul littéral sur les relatifs (objet
 * `calcul_litteral`), les puissances d'exposant négatif (objet `puissances`).
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/nombres-relatifs-4e';

export const LESSON_CONFIG = {
  id: 'nombres-relatifs-4e',
  sequentialUnlock: true,
  title: 'Opérations sur les nombres relatifs',
  description:
    "Prolonger une table de multiplication vers les nombres négatifs et voir la règle des signes apparaître comme la seule suite possible, puis multiplier, diviser, déterminer le signe d'un produit de plusieurs facteurs et enchaîner les quatre opérations sans se tromper de priorité.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➕',
  estimatedDurationMin: 70,
  skills: [
    'Multiplier deux nombres relatifs',
    "Justifier la règle des signes par la régularité d'une table",
    "Déterminer le signe d'un produit de plusieurs facteurs",
    'Diviser deux nombres relatifs',
    'Enchaîner les quatre opérations sur des relatifs',
    "Contrôler le signe d'un résultat avant de calculer",
  ],
  teachingScope: {
    include: [
      'Multiplication de deux nombres relatifs',
      'La règle des signes, obtenue en prolongeant la régularité d’une table',
      'Signe d’un produit de plusieurs facteurs (parité du nombre de facteurs négatifs)',
      'Division de deux nombres relatifs',
      'Enchaînement des quatre opérations et priorités opératoires',
      'Contrôle du signe d’un résultat avant de calculer',
    ],
    exclude: [
      'Racines carrées de nombres négatifs (exclusion officielle du niveau)',
      'Le sens du nombre relatif, l’opposé, la comparaison (acquis de 5e)',
      'Le calcul littéral avec des relatifs (objet officiel « Calcul littéral »)',
      'Les puissances d’exposant négatif (objet officiel « Puissances »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : tout vient de la leçon « Nombres relatifs » de 5e et du
  // calcul de 6e, et le module 0 les diagnostique.
  priorKnowledge: [
    'nombre-relatif', 'oppose', 'distance-a-zero', 'ordre-relatifs',
    'addition-deplacement', 'soustraction-oppose', 'priorites-operatoires',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'prolonger-la-table', path: `${LESSON_BASE_PATH}/prolonger-la-table`,
      title: 'Prolonger la table', desc: 'Continue la table de multiplication vers les négatifs — sans casser sa régularité.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_nombres-relatifs-4e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Prolonger la table',
    },
    {
      id: '02', number: 2, slug: 'la-regle-des-signes', path: `${LESSON_BASE_PATH}/la-regle-des-signes`,
      title: 'La règle des signes', desc: 'Les quatre cas, énoncés à partir de ce que la table a montré.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_nombres-relatifs-4e_P1', '4e_nombres-relatifs-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Multiplier',
    },
    {
      id: '03', number: 3, slug: 'plusieurs-facteurs', path: `${LESSON_BASE_PATH}/plusieurs-facteurs`,
      title: 'Plusieurs facteurs', desc: 'Compte les facteurs négatifs : leur parité décide du signe, à elle seule.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_nombres-relatifs-4e_P3', '4e_nombres-relatifs-4e_P6'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Compter les signes',
    },
    {
      id: '04', number: 4, slug: 'diviser', path: `${LESSON_BASE_PATH}/diviser`,
      title: 'Diviser', desc: 'La division suit exactement la même règle — et la table le prouve.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_nombres-relatifs-4e_P4', '4e_nombres-relatifs-4e_P6'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Diviser',
    },
    {
      id: '05', number: 5, slug: 'enchainer-les-operations', path: `${LESSON_BASE_PATH}/enchainer-les-operations`,
      title: 'Enchaîner les opérations', desc: 'Quatre opérations dans un même calcul : l’ordre décide du résultat.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_nombres-relatifs-4e_P5', '4e_nombres-relatifs-4e_P1', '4e_nombres-relatifs-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Enchaîner',
    },
    {
      id: '06', number: 6, slug: 'mission-finale-la-table', path: `${LESSON_BASE_PATH}/mission-finale-la-table`,
      title: '🏆 Mission finale : la table', desc: 'Dix épreuves pour prouver que tu maîtrises les opérations sur les relatifs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
