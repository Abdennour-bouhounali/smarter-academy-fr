/**
 * Ordre de grandeur et estimation — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 5 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_ordre-grandeur-estimation_P1  Estimer un résultat avant de calculer
 *   6e_ordre-grandeur-estimation_P2  Arrondir un nombre pour simplifier un calcul
 *   6e_ordre-grandeur-estimation_P3  Ordre de grandeur d'une somme, différence, produit
 *   6e_ordre-grandeur-estimation_P4  Détecter un résultat impossible ou suspect
 *   6e_ordre-grandeur-estimation_P5  Choisir le bon niveau de précision
 */
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
  passingScore: 8,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 89,
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
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Faire le point',
    },
    {
      id: '01', number: 1, slug: 'resultat-impossible', path: `${LESSON_BASE_PATH}/resultat-impossible`,
      title: 'Mission : Le résultat impossible',
      desc: "398 + 205 = 1 203 ? Sans recalculer, comment savoir que ça cloche ?",
      stage: 'trigger',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer',
    },
    {
      id: '02', number: 2, slug: 'estimer-avant-de-calculer', path: `${LESSON_BASE_PATH}/estimer-avant-de-calculer`,
      title: 'Estimer avant de calculer',
      desc: 'Remplacer temporairement des nombres compliqués par des nombres simples.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer',
    },
    {
      id: '03', number: 3, slug: 'arrondir-pour-estimer', path: `${LESSON_BASE_PATH}/arrondir-pour-estimer`,
      title: 'Arrondir pour estimer',
      desc: 'Choisir le nombre ami le plus proche, sur une droite graduée.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Arrondir',
    },
    {
      id: '04', number: 4, slug: 'ordre-de-grandeur-somme', path: `${LESSON_BASE_PATH}/ordre-de-grandeur-somme`,
      title: "Ordre de grandeur d'une somme",
      desc: '347 + 251 : plusieurs façons d\'arrondir, un seul bon ordre de grandeur.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P3'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Démarrer',
    },
    {
      id: '05', number: 5, slug: 'ordre-de-grandeur-difference', path: `${LESSON_BASE_PATH}/ordre-de-grandeur-difference`,
      title: "Ordre de grandeur d'une différence",
      desc: '798 − 302 : la distance entre deux nombres arrondis.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Démarrer',
    },
    {
      id: '06', number: 6, slug: 'ordre-de-grandeur-produit', path: `${LESSON_BASE_PATH}/ordre-de-grandeur-produit`,
      title: "Ordre de grandeur d'un produit",
      desc: '49 × 21 ≈ 50 × 20 : voir le rectangle avant de calculer.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P3'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Démarrer',
    },
    {
      id: '07', number: 7, slug: 'detective-des-erreurs', path: `${LESSON_BASE_PATH}/detective-des-erreurs`,
      title: 'Détective des erreurs',
      desc: 'Calcul + réponse donnée : plausible, suspect ou impossible ?',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P4'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Enquêter',
    },
    {
      id: '08', number: 8, slug: 'estimation-dans-des-problemes', path: `${LESSON_BASE_PATH}/estimation-dans-des-problemes`,
      title: 'Estimation dans des problèmes',
      desc: 'Comprendre, estimer, calculer, comparer — dans des situations réelles.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P1', '6e_ordre-grandeur-estimation_P4'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '09', number: 9, slug: 'choisir-le-niveau-de-precision', path: `${LESSON_BASE_PATH}/choisir-le-niveau-de-precision`,
      title: 'Choisir le bon niveau de précision',
      desc: "Un ordre de grandeur suffit-il, ou faut-il une valeur exacte ?",
      stage: 'practice_lab',
      teachesLearningPointIds: ['6e_ordre-grandeur-estimation_P5'],
      color: 'purple', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'Choisir',
    },
    {
      id: '10', number: 10, slug: 'detective-des-resultats', path: `${LESSON_BASE_PATH}/detective-des-resultats`,
      title: '🏆 Détective des résultats',
      desc: 'Boss final, profil de maîtrise et synthèse.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
