export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/fractions';

export const LESSON_CONFIG = {
  id: 'fractions',
  title: 'Fractions',
  description: "Découvrir le sens de la fraction comme partage, l'utiliser pour décrire un quotient et la repérer sur une droite graduée.",
  level: 'college',
  grade: '6e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et Calculs',
  totalModules: 5,
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🍕',
  estimatedDurationMin: 50,
  skills: [
    "Partager équitablement une grandeur",
    "Utiliser le vocabulaire : numérateur et dénominateur",
    "Comprendre la fraction comme un quotient",
    "Placer une fraction simple sur un axe gradué"
  ],
  modules: [
    {
      id: 'L01-frac',
      number: 1,
      slug: '1',
      path: `${LESSON_BASE_PATH}/1`,
      title: 'Le partage équitable',
      desc: 'Découvrir comment exprimer un partage de pizza.',
      color: 'blue',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 1,
      actionText: 'Démarrer'
    },
    {
      id: 'L02-frac',
      number: 2,
      slug: '2',
      path: `${LESSON_BASE_PATH}/2`,
      title: 'Vocabulaire des fractions',
      desc: 'Numérateur et Dénominateur : ne pas les confondre !',
      color: 'emerald',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L03-frac',
      number: 3,
      slug: '3',
      path: `${LESSON_BASE_PATH}/3`,
      title: 'La fraction quotient',
      desc: 'Partager plusieurs objets entre plusieurs personnes.',
      color: 'indigo',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      actionText: 'Démarrer'
    },
    {
      id: 'L04-frac',
      number: 4,
      slug: '4',
      path: `${LESSON_BASE_PATH}/4`,
      title: 'Repérage sur un axe',
      desc: 'Où se cachent 1/2 et 3/4 sur une droite graduée ?',
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Démarrer'
    },
    {
      id: 'L05-frac',
      number: 5,
      slug: '5',
      path: `${LESSON_BASE_PATH}/5`,
      title: 'Bilan et Défi',
      desc: 'Vérifie si tu as tout compris.',
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Faire le Bilan'
    }
  ]
};
