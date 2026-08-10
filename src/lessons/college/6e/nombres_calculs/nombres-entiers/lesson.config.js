export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/nombres-entiers';

export const LESSON_CONFIG = {
  id: 'nombres-entiers-6e',
  title: 'Nombres entiers',
  description: "Comprendre et manipuler les grands nombres, utiliser les classes (unités, milliers, millions, milliards) et les comparer.",
  level: '6ème',
  chapter: 'Nombres et Calculs',
  totalModules: 5,
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 45,
  skills: [
    "Comprendre l'utilité des classes",
    "Décomposer et écrire de grands nombres",
    "Comparer et ranger",
    "Se repérer sur une demi-droite graduée",
    "Résoudre un problème avec des grands nombres"
  ],
  teachingScope: {
    include: [
      "Lire, écrire, décomposer et recomposer les nombres entiers",
      "Comparer et ranger",
      "Repérer sur une demi-droite graduée",
      "Résolution de problèmes"
    ],
    exclude: [
      "Nombres relatifs",
      "Opérations formelles complexes"
    ]
  },
  modules: [
    {
      id: 'L01-6e',
      number: 1,
      slug: '1',
      path: `${LESSON_BASE_PATH}/1`,
      title: "Le besoin des classes",
      desc: "Pourquoi regrouper les chiffres par paquets de trois ?",
      color: 'emerald',
      style: 'featured',
      estimatedMin: 5,
      difficulty: 1,
      actionText: 'Démarrer'
    },
    {
      id: 'L02-6e',
      number: 2,
      slug: '2',
      path: `${LESSON_BASE_PATH}/2`,
      title: "Décomposition et écriture",
      desc: "Le tableau de numération et l'écriture en lettres.",
      color: 'indigo',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L03-6e',
      number: 3,
      slug: '3',
      path: `${LESSON_BASE_PATH}/3`,
      title: "Comparaison et rangement",
      desc: "Lequel est le plus grand ? Apprendre à comparer efficacement.",
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L04-6e',
      number: 4,
      slug: '4',
      path: `${LESSON_BASE_PATH}/4`,
      title: "Demi-droite graduée",
      desc: "Lire et placer des nombres sur un axe.",
      color: 'pink',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Démarrer'
    },
    {
      id: 'L05-6e',
      number: 5,
      slug: '5',
      path: `${LESSON_BASE_PATH}/5`,
      title: "Mission finale",
      desc: "Résoudre un problème concret mobilisant toutes les compétences.",
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Passer la Mission'
    }
  ]
};
