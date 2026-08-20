export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/racines-carrees';

export const LESSON_CONFIG = {
  id: 'racines-carrees-4e',
  title: 'Racine carrée (4ème)',
  description: "Découvrir la racine carrée comme l'opération inverse du carré, et apprendre à l'encadrer.",
  level: '4ème',
  chapter: 'Nombres et Calculs',
  totalModules: 5,
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '√',
  estimatedDurationMin: 53,
  skills: [
    "Comprendre la racine carrée (aire → côté)",
    "Connaître les premiers carrés parfaits",
    "Encadrer une racine non exacte"
  ],
  teachingScope: {
    include: [
      "Sens de la racine carrée (problème inverse de l'aire)",
      "Carrés parfaits",
      "Calcul de racines carrées simples",
      "Encadrement d'une racine carrée",
      "Problèmes utilisant la racine carrée"
    ],
    exclude: [
      "Propriétés de produit et quotient des racines",
      "Simplification sous la forme a√b",
      "Équations x² = a comme méthode algébrique",
      "Calcul littéral avec des racines carrées"
    ]
  },
  modules: [
    {
      id: 'L01-4e',
      number: 1,
      slug: 'pourquoi-racine-carree',
      path: `${LESSON_BASE_PATH}/pourquoi-racine-carree`,
      title: "Pourquoi la racine carrée ?",
      desc: "Le problème de l'aire d'un champ : trouver le côté quand on connaît l'aire.",
      color: 'emerald',
      style: 'featured',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P1', '4e_racines-carrees-4e_P4'],
      estimatedMin: 10,
      difficulty: 1,
      actionText: 'Démarrer'
    },
    {
      id: 'L02-4e',
      number: 2,
      slug: 'notation-et-sens',
      path: `${LESSON_BASE_PATH}/notation-et-sens`,
      title: "Notation et Sens",
      desc: "Distinguer le symbole √ du calcul explicite.",
      color: 'indigo',
      style: 'featured',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P1'],
      estimatedMin: 8,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L03-4e',
      number: 3,
      slug: 'carres-parfaits',
      path: `${LESSON_BASE_PATH}/carres-parfaits`,
      title: "Les Carrés Parfaits",
      desc: "Identifier et retenir les premiers carrés parfaits et calculer leurs racines.",
      color: 'pink',
      style: 'featured',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P2', '4e_racines-carrees-4e_P3'],
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L04-4e',
      number: 4,
      slug: 'ordre-de-grandeur',
      path: `${LESSON_BASE_PATH}/ordre-de-grandeur`,
      title: "Ordre de Grandeur",
      desc: "Encadrer une racine carrée non entière entre deux entiers.",
      color: 'amber',
      style: 'featured',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P4'],
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Démarrer'
    },
    {
      id: 'L05-4e',
      number: 5,
      slug: 'bilan',
      path: `${LESSON_BASE_PATH}/bilan`,
      title: "Bilan des Compétences",
      desc: "Quiz final évaluant la maîtrise du sens et des calculs simples.",
      color: 'slate',
      style: 'assessment',
      stage: 'evaluation',
      estimatedMin: 15,
      difficulty: 3,
      actionText: 'Passer le Quiz'
    }
  ]
};
