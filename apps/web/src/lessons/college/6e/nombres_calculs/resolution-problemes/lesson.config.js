/**
 * Résolution de problèmes — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 6 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_resolution-problemes_P1  Comprendre une situation avant de calculer
 *   6e_resolution-problemes_P2  Extraire les informations utiles / manquantes
 *   6e_resolution-problemes_P3  Modéliser une situation
 *   6e_resolution-problemes_P4  Choisir une stratégie adaptée
 *   6e_resolution-problemes_P5  Résoudre à une ou plusieurs étapes
 *   6e_resolution-problemes_P6  Estimer, vérifier et communiquer une réponse
 */
export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/resolution-problemes';

export const LESSON_CONFIG = {
  id: 'resolution-problemes',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : la fluidité des quatre opérations (y compris sur un
  // décimal simple) et la lecture attentive d'un énoncé court — exactement
  // ce que les cinq questions du module 0 mesurent, et rien d'autre. La
  // démarche elle-même (trier, modéliser, choisir, enchaîner, contrôler,
  // rédiger) est établie dans la leçon même.
  priorKnowledge: ['calcul-numerique', 'tables-multiplication'],
  title: 'Résolution de problèmes',
  description:
    'Développer une démarche complète de résolution : comprendre la situation, choisir une stratégie, calculer, vérifier et communiquer la réponse.',
  level: 'college',
  grade: '6e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et Calculs',
  passingScore: 9,
  masteryThreshold: 0.8,
  emoji: '🧭',
  estimatedDurationMin: 90,
  skills: [
    'Comprendre une situation avant de calculer',
    'Extraire les informations utiles et repérer les informations manquantes',
    'Modéliser une situation (schéma, groupes, droite graduée, tableau)',
    'Choisir une stratégie adaptée parmi plusieurs valables',
    'Résoudre des problèmes à une ou plusieurs étapes',
    'Estimer, vérifier et communiquer une réponse complète',
  ],
  teachingScope: {
    include: ['Problèmes à une ou plusieurs étapes', 'Extraire les informations utiles', 'Modéliser une situation simple'],
    exclude: ['Mise en équation formelle'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Faire le point' },
    { id: '01', number: 1, slug: '1', path: `${LESSON_BASE_PATH}/1`,
      title: 'Mission : Le problème mystère', desc: '6 classes, 24 élèves chacune : découvre la structure avant de calculer.',
      stage: 'trigger', teachesLearningPointIds: ['6e_resolution-problemes_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: '2', path: `${LESSON_BASE_PATH}/2`,
      title: 'Comprendre la situation', desc: "Qu'est-ce qui se passe ? L'opération doit émerger du modèle, pas du hasard.",
      stage: 'discovery', teachesLearningPointIds: ['6e_resolution-problemes_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '03', number: 3, slug: '3', path: `${LESSON_BASE_PATH}/3`,
      title: 'Extraire les informations', desc: 'Trier ce qui sert de ce qui ne sert pas — sans se laisser piéger.',
      stage: 'discovery', teachesLearningPointIds: ['6e_resolution-problemes_P2'],
      color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Trier' },
    { id: '04', number: 4, slug: '4', path: `${LESSON_BASE_PATH}/4`,
      title: 'Modéliser', desc: 'Groupes, schéma en barres, droite graduée : rendre la relation visible.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_resolution-problemes_P3'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Modéliser' },
    { id: '05', number: 5, slug: '5', path: `${LESSON_BASE_PATH}/5`,
      title: 'Choisir une stratégie', desc: 'Plusieurs chemins valables : comparer, pas imposer.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_resolution-problemes_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Comparer' },
    { id: '06', number: 6, slug: '6', path: `${LESSON_BASE_PATH}/6`,
      title: 'Problèmes à une étape', desc: 'Combiner, retirer, comparer, grouper, partager — sans étiquette donnée.',
      stage: 'formalization', teachesLearningPointIds: ['6e_resolution-problemes_P5'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: '7', path: `${LESSON_BASE_PATH}/7`,
      title: 'Problèmes à plusieurs étapes', desc: 'Construire une chaîne de calcul, étape par étape.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_resolution-problemes_P5'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Enchaîner' },
    { id: '08', number: 8, slug: '8', path: `${LESSON_BASE_PATH}/8`,
      title: 'Estimer et vérifier', desc: 'Avant de calculer : à peu près combien ? Après : est-ce cohérent ?',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_resolution-problemes_P6'],
      color: 'blue', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Vérifier' },
    { id: '09', number: 9, slug: '9', path: `${LESSON_BASE_PATH}/9`,
      title: 'Communiquer une réponse', desc: "Un nombre seul n'est pas une réponse complète.",
      stage: 'practice_lab', teachesLearningPointIds: ['6e_resolution-problemes_P6'],
      color: 'purple', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Rédiger' },
    { id: '10', number: 10, slug: '10', path: `${LESSON_BASE_PATH}/10`,
      title: 'Détective des erreurs', desc: "Repérer la PREMIÈRE erreur dans le raisonnement d'un élève.",
      stage: 'practice_lab', teachesLearningPointIds: ['6e_resolution-problemes_P2', '6e_resolution-problemes_P5'],
      color: 'orange', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Enquêter' },
    { id: '11', number: 11, slug: '11', path: `${LESSON_BASE_PATH}/11`,
      title: '🏆 La Grande Mission', desc: 'Boss final, profil de maîtrise et synthèse.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 11, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
