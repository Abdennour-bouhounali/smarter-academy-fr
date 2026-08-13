export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/nombres-decimaux';

export const LESSON_CONFIG = {
  id: 'nombres-decimaux',
  title: 'Nombres décimaux',
  description: "Comprendre les fractions décimales, maîtriser l'écriture à virgule et utiliser le tableau de numération étendu.",
  level: 'college',
  grade: '6e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et Calculs',
  totalModules: 5,
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 50,
  skills: [
    "Faire le lien entre fraction et écriture décimale",
    "Placer un chiffre dans le tableau de numération",
    "Repérer un décimal sur une droite graduée",
    "Comparer deux décimaux"
  ],
  modules: [
    {
      id: 'L01-dec',
      number: 1,
      slug: '1',
      path: `${LESSON_BASE_PATH}/1`,
      title: 'Fractions et virgules',
      desc: 'Le lien entre fractions décimales et écriture décimale.',
      color: 'blue',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 1,
      actionText: 'Démarrer'
    },
    {
      id: 'L02-dec',
      number: 2,
      slug: '2',
      path: `${LESSON_BASE_PATH}/2`,
      title: 'Le tableau de numération',
      desc: 'Placer chaque chiffre au bon endroit (dixièmes, centièmes...).',
      color: 'emerald',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L03-dec',
      number: 3,
      slug: '3',
      path: `${LESSON_BASE_PATH}/3`,
      title: 'Repérage sur un axe',
      desc: 'Placer un point sur une droite graduée.',
      color: 'indigo',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L04-dec',
      number: 4,
      slug: '4',
      path: `${LESSON_BASE_PATH}/4`,
      title: 'Comparaison',
      desc: 'Comparer et ranger des nombres décimaux.',
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Démarrer'
    },
    {
      id: 'L05-dec',
      number: 5,
      slug: '5',
      path: `${LESSON_BASE_PATH}/5`,
      title: 'Bilan',
      desc: 'Vérifier la maîtrise de ce chapitre.',
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Faire le Bilan'
    }
  ]
};
