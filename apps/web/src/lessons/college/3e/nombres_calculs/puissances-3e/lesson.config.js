/**
 * Puissances — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 11 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_puissances',
 * append-only) :
 *
 *   3e_puissances-3e_P1   Comprendre une puissance comme une multiplication répétée
 *   3e_puissances-3e_P2   Lire et interpréter une écriture avec exposant
 *   3e_puissances-3e_P3   Calculer des puissances d'un nombre
 *   3e_puissances-3e_P4   Comprendre le rôle de l'exposant
 *   3e_puissances-3e_P5   Utiliser les propriétés des puissances
 *   3e_puissances-3e_P6   Calculer avec des puissances de 10
 *   3e_puissances-3e_P7   Comprendre les ordres de grandeur
 *   3e_puissances-3e_P8   Écrire un nombre en notation scientifique
 *   3e_puissances-3e_P9   Passer d'une écriture décimale à une écriture scientifique
 *   3e_puissances-3e_P10  Comparer des nombres à l'aide des puissances de 10
 *   3e_puissances-3e_P11  Utiliser les puissances dans des problèmes scientifiques ou numériques
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : l'exposant est
 * un COMPTE de facteurs. La leçon ne commence donc pas par « a^n se lit a
 * puissance n » mais par une feuille qu'on plie — 2, 4, 8, 16 épaisseurs —
 * jusqu'à ce que le besoin d'un nom court se fasse sentir. Puis la tour des
 * facteurs (PowerTower) : l'écriture a^n s'écrit toute seule À PARTIR du
 * nombre de blocs empilés, et les trois règles (produit, quotient,
 * puissance de puissance) se LISENT sur le compte, jamais avant.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : exposants ENTIERS (positifs,
 * nuls, négatifs) et bases numériques. Sont exclus les exposants
 * fractionnaires / racines n-ièmes, le calcul littéral sur les puissances
 * (a^m × b^m pour a ≠ b n'est vu que comme contre-exemple), et la précision
 * / les chiffres significatifs en physique.
 *
 * Fil narratif unique : « le compte des facteurs » — le pliage du module 1,
 * la tour du module 3, la virgule qui glisse du module 4, puis l'échelle de
 * l'univers du module 6, reprises figées dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/puissances-3e';

export const LESSON_CONFIG = {
  id: 'puissances-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Puissances',
  description:
    "Plier une feuille jusqu'à ce que compter les épaisseurs devienne impossible, puis empiler des tours de facteurs pour lire les règles de calcul sur le compte des blocs, faire glisser la virgule avec les puissances de 10 et mesurer l'univers en écriture scientifique.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🚀',
  estimatedDurationMin: 77,
  skills: [
    'Comprendre une puissance comme une multiplication répétée',
    'Lire et interpréter une écriture avec exposant',
    "Calculer des puissances d'un nombre",
    "Comprendre le rôle de l'exposant",
    'Utiliser les propriétés des puissances',
    'Calculer avec des puissances de 10',
    'Comprendre les ordres de grandeur',
    'Écrire un nombre en notation scientifique',
    "Passer d'une écriture décimale à une écriture scientifique",
    "Comparer des nombres à l'aide des puissances de 10",
    'Utiliser les puissances dans des problèmes scientifiques ou numériques',
  ],
  teachingScope: {
    include: [
      "Puissance à exposant entier positif comme multiplication répétée (base, exposant)",
      "Exposant nul et exposants négatifs (a^0 = 1, a^{-n} = 1/a^n)",
      'Produit, quotient et puissance de puissance de même base',
      'Puissances de 10 positives et négatives, décalage de la virgule',
      'Ordres de grandeur et comparaison par les exposants',
      'Écriture scientifique a × 10^n avec 1 ≤ a < 10, et son usage en sciences',
    ],
    exclude: [
      'Exposants fractionnaires et racines n-ièmes',
      "Calcul littéral sur les puissances (a^m × b^m avec a ≠ b, hors contre-exemple)",
      'Chiffres significatifs et précision des mesures physiques',
      'Notation ingénieur et puissances de 2 en informatique',
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
      id: '01', number: 1, slug: 'le-pliage', path: `${LESSON_BASE_PATH}/le-pliage`,
      title: 'Le pliage', desc: 'Plie une feuille et compte les épaisseurs. Très vite, écrire le calcul en entier devient impossible.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_puissances-3e_P1', '3e_puissances-3e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Plier la feuille',
    },
    {
      id: '02', number: 2, slug: 'la-tour-des-facteurs', path: `${LESSON_BASE_PATH}/la-tour-des-facteurs`,
      title: 'La tour des facteurs', desc: 'Choisis une base, empile des facteurs, dépile-les — jusqu’en dessous de zéro.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_puissances-3e_P3', '3e_puissances-3e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Empiler',
    },
    {
      id: '03', number: 3, slug: 'empiler-les-tours', path: `${LESSON_BASE_PATH}/empiler-les-tours`,
      title: 'Empiler les tours', desc: 'Deux tours qui fusionnent, une tour qu’on ampute, une tour qu’on répète : compte les blocs.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_puissances-3e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Fusionner',
    },
    {
      id: '04', number: 4, slug: 'la-virgule-qui-glisse', path: `${LESSON_BASE_PATH}/la-virgule-qui-glisse`,
      title: 'La virgule qui glisse', desc: 'Change l’exposant de 10 : la virgule se déplace, le nombre change d’échelle.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_puissances-3e_P6', '3e_puissances-3e_P7'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Faire glisser',
    },
    {
      id: '05', number: 5, slug: 'ecriture-scientifique', path: `${LESSON_BASE_PATH}/ecriture-scientifique`,
      title: 'Écriture scientifique', desc: 'Une seule écriture est acceptée : le coefficient entre 1 et 10. Construis-la.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_puissances-3e_P8', '3e_puissances-3e_P9'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '06', number: 6, slug: 'lechelle-de-lunivers', path: `${LESSON_BASE_PATH}/lechelle-de-lunivers`,
      title: "L'échelle de l'univers", desc: 'De l’atome à la galaxie : compare des tailles en ne regardant que les exposants.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_puissances-3e_P10', '3e_puissances-3e_P11'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Explorer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale', path: `${LESSON_BASE_PATH}/mission-finale`,
      title: '🏆 Mission finale : le compte des facteurs', desc: 'Dix épreuves pour prouver qu’aucun exposant ne te surprend.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
