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
      slug: '1',
      path: `${LESSON_BASE_PATH}/1`,
      title: "Pourquoi la racine carrée ?",
      desc: "Le problème de l'aire d'un champ : trouver le côté quand on connaît l'aire.",
      color: 'emerald',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 1,
      actionText: 'Démarrer'
    },
    {
      id: 'L02-4e',
      number: 2,
      slug: '2',
      path: `${LESSON_BASE_PATH}/2`,
      title: "Notation et Sens",
      desc: "Distinguer le symbole √ du calcul explicite.",
      color: 'indigo',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L03-4e',
      number: 3,
      slug: '3',
      path: `${LESSON_BASE_PATH}/3`,
      title: "Les Carrés Parfaits",
      desc: "Identifier et retenir les premiers carrés parfaits et calculer leurs racines.",
      color: 'pink',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L04-4e',
      number: 4,
      slug: '4',
      path: `${LESSON_BASE_PATH}/4`,
      title: "Ordre de Grandeur",
      desc: "Encadrer une racine carrée non entière entre deux entiers.",
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Démarrer'
    },
    {
      id: 'L05-4e',
      number: 5,
      slug: '5',
      path: `${LESSON_BASE_PATH}/5`,
      title: "Bilan des Compétences",
      desc: "Quiz final évaluant la maîtrise du sens et des calculs simples.",
      color: 'slate',
      style: 'assessment',
      estimatedMin: 15,
      difficulty: 3,
      actionText: 'Passer le Quiz'
    }
  ]
};
