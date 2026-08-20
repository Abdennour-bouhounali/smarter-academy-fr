/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Nombres rationnels (3ème)
 */

export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/nombres-rationnels';

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'nombres-rationnels',
  slug: 'nombres-rationnels',
  title: 'Nombres rationnels',
  emoji: '➗',
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  officialObjects: ['Nombres rationnels'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 71,
  difficulty: 2,
  masteryThreshold: 0.8, // 80 % des modules complétés = leçon maîtrisée

  prerequisites: [
    { id: 'PRE-FRAC-4E', label: 'Opérations de base sur les fractions (4ème)' },
    { id: 'PRE-DIV', label: 'Notion de diviseur et de multiple' }
  ],

  skills: [
    "Distinguer un nombre rationnel d'un nombre décimal",
    "Rendre une fraction irréductible",
    "Additionner et soustraire des fractions en choisissant un dénominateur commun",
    "Multiplier des fractions en simplifiant avant le calcul",
    "Diviser par une fraction en utilisant son inverse",
    "Respecter les priorités opératoires dans un calcul fractionnaire",
    "Résoudre un problème modélisable par un calcul sur les fractions"
  ],

  // ── Évaluation finale ─────────────────────────────────────────────────────
  assessment: {
    moduleId: 'L07',
    totalQuestions: 6,
    masteryScore: 5,
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: [
    {
      id: '01',
      number: 1,
      slug: 'notion-rationnel',
      path: `${LESSON_BASE_PATH}/notion-rationnel`,
      title: 'Notion de nombre rationnel',
      desc: "Comprendre le lien entre fraction, quotient et nombre rationnel.",
      color: 'emerald',
      style: 'featured',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_nombres-rationnels_P1'],
      estimatedMin: 8,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: '02',
      number: 2,
      slug: 'fractions-irreductibles',
      path: `${LESSON_BASE_PATH}/fractions-irreductibles`,
      title: 'Fractions irréductibles',
      desc: "Rendre une fraction irréductible en utilisant les diviseurs communs, et comparer des rationnels.",
      color: 'indigo',
      style: 'featured',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_nombres-rationnels_P2', '3e_nombres-rationnels_P3'],
      estimatedMin: 8,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['01'],
    },
    {
      id: '03',
      number: 3,
      slug: 'addition-soustraction',
      path: `${LESSON_BASE_PATH}/addition-soustraction`,
      title: 'Addition et Soustraction',
      desc: "Trouver le dénominateur commun pour additionner ou soustraire.",
      color: 'violet',
      style: 'featured',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_nombres-rationnels_P4'],
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['02'],
    },
    {
      id: '04',
      number: 4,
      slug: 'multiplication-division',
      path: `${LESSON_BASE_PATH}/multiplication-division`,
      title: 'Multiplication et Division',
      desc: "Multiplier en simplifiant et diviser en utilisant l'inverse.",
      color: 'blue',
      style: 'featured',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_nombres-rationnels_P5'],
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['03'],
    },
    {
      id: '05',
      number: 5,
      slug: 'priorites-operatoires',
      path: `${LESSON_BASE_PATH}/priorites-operatoires`,
      title: 'Priorités opératoires',
      desc: "Gérer les calculs complexes avec plusieurs opérations.",
      color: 'rose',
      style: 'featured',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_nombres-rationnels_P5'],
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['04'],
    },
    {
      id: '06',
      number: 6,
      slug: 'mission-budget',
      path: `${LESSON_BASE_PATH}/mission-budget`,
      title: 'Mission : Le Budget',
      desc: "Résoudre un problème concret nécessitant plusieurs opérations.",
      color: 'amber',
      style: 'boss',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_nombres-rationnels_P6'],
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Mission ➔',
      prerequisites: ['05'],
    },
    {
      id: '07',
      number: 7,
      slug: 'bilan-final',
      path: `${LESSON_BASE_PATH}/bilan-final`,
      title: 'Bilan Final',
      desc: "Évaluation pour valider la maîtrise de la leçon.",
      color: 'slate',
      style: 'assessment',
      stage: 'evaluation',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 100,
      actionText: 'Évaluation ➔',
      prerequisites: ['06'],
    }
  ]
};

// ── Helpers dérivés ─────────────────────────────────────────────────────────

export const TOTAL_MODULES = LESSON_CONFIG.modules.length;

export function getModuleNav(moduleNumber) {
  const modules = LESSON_CONFIG.modules;
  const idx = modules.findIndex((m) => m.number === moduleNumber);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;
  return {
    prevLink: prev ? `${LESSON_BASE_PATH}/${prev.slug}` : null,
    nextLink: next ? `${LESSON_BASE_PATH}/${next.slug}` : null,
  };
}
