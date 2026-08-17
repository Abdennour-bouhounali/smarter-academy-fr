export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/ordre-grandeur-estimation';

export const LESSON_CONFIG = {
  id: 'ordre-grandeur-estimation',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Ordre de grandeur et estimation',
  description:
    "Développer le réflexe d'estimer un résultat avant ou après un calcul afin de détecter les erreurs et contrôler la cohérence.",
  level: 'college',
  grade: '6e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et Calculs',
  totalModules: 10,
  passingScore: 8,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 90,
  skills: [
    'Estimer un résultat avant de calculer',
    'Arrondir un nombre pour simplifier un calcul',
    "Trouver l'ordre de grandeur d'une somme, d'une différence, d'un produit",
    'Détecter un résultat impossible ou suspect sans recalculer',
    'Choisir le bon niveau de précision selon la situation',
  ],
  teachingScope: {
    include: ['Estimer un résultat', "Ordre de grandeur d'une somme, différence, produit"],
    exclude: ['Inéquations'],
  },
  modules: [
    {
      id: 'L01-oge', number: 1, slug: '1', path: `${LESSON_BASE_PATH}/1`,
      title: 'Mission : Le résultat impossible',
      desc: "398 + 205 = 1 203 ? Sans recalculer, comment savoir que ça cloche ?",
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer',
    },
    {
      id: 'L02-oge', number: 2, slug: '2', path: `${LESSON_BASE_PATH}/2`,
      title: 'Estimer avant de calculer',
      desc: 'Remplacer temporairement des nombres compliqués par des nombres simples.',
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Démarrer',
    },
    {
      id: 'L03-oge', number: 3, slug: '3', path: `${LESSON_BASE_PATH}/3`,
      title: 'Arrondir pour estimer',
      desc: 'Choisir le nombre ami le plus proche, sur une droite graduée.',
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Arrondir',
    },
    {
      id: 'L04-oge', number: 4, slug: '4', path: `${LESSON_BASE_PATH}/4`,
      title: "Ordre de grandeur d'une somme",
      desc: '347 + 251 : plusieurs façons d\'arrondir, un seul bon ordre de grandeur.',
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Démarrer',
    },
    {
      id: 'L05-oge', number: 5, slug: '5', path: `${LESSON_BASE_PATH}/5`,
      title: "Ordre de grandeur d'une différence",
      desc: '798 − 302 : la distance entre deux nombres arrondis.',
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Démarrer',
    },
    {
      id: 'L06-oge', number: 6, slug: '6', path: `${LESSON_BASE_PATH}/6`,
      title: "Ordre de grandeur d'un produit",
      desc: '49 × 21 ≈ 50 × 20 : voir le rectangle avant de calculer.',
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Démarrer',
    },
    {
      id: 'L07-oge', number: 7, slug: '7', path: `${LESSON_BASE_PATH}/7`,
      title: 'Détective des erreurs',
      desc: 'Calcul + réponse donnée : plausible, suspect ou impossible ?',
      color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Enquêter',
    },
    {
      id: 'L08-oge', number: 8, slug: '8', path: `${LESSON_BASE_PATH}/8`,
      title: 'Estimation dans des problèmes',
      desc: 'Comprendre, estimer, calculer, comparer — dans des situations réelles.',
      color: 'blue', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: 'L09-oge', number: 9, slug: '9', path: `${LESSON_BASE_PATH}/9`,
      title: 'Choisir le bon niveau de précision',
      desc: "Un ordre de grandeur suffit-il, ou faut-il une valeur exacte ?",
      color: 'purple', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Choisir',
    },
    {
      id: 'L10-oge', number: 10, slug: '10', path: `${LESSON_BASE_PATH}/10`,
      title: '🏆 Détective des résultats',
      desc: 'Boss final, profil de maîtrise, synthèse et flash retour.',
      color: 'amber', style: 'boss', estimatedMin: 18, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
