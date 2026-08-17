/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Nombres rationnels (3ème)
 */

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
  estimatedDurationMin: 60,
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
      id: 'L01',
      number: 1,
      slug: '1',
      title: 'Notion de nombre rationnel',
      desc: "Comprendre le lien entre fraction, quotient et nombre rationnel.",
      color: 'emerald',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: 'L02',
      number: 2,
      slug: '2',
      title: 'Fractions irréductibles',
      desc: "Rendre une fraction irréductible en utilisant les diviseurs communs.",
      color: 'indigo',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L01'],
    },
    {
      id: 'L03',
      number: 3,
      slug: '3',
      title: 'Addition et Soustraction',
      desc: "Trouver le dénominateur commun pour additionner ou soustraire.",
      color: 'violet',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: '4',
      title: 'Multiplication et Division',
      desc: "Multiplier en simplifiant et diviser en utilisant l'inverse.",
      color: 'blue',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: '5',
      title: 'Priorités opératoires',
      desc: "Gérer les calculs complexes avec plusieurs opérations.",
      color: 'rose',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Mission : Le Budget',
      desc: "Résoudre un problème concret nécessitant plusieurs opérations.",
      color: 'amber',
      style: 'boss',
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Mission ➔',
      prerequisites: ['L05'],
    },
    {
      id: 'L07',
      number: 7,
      slug: '7',
      title: 'Bilan Final',
      desc: "Évaluation pour valider la maîtrise de la leçon.",
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 100,
      actionText: 'Évaluation ➔',
      prerequisites: ['L06'],
    }
  ]
};

// ── Helpers dérivés ─────────────────────────────────────────────────────────

export const TOTAL_MODULES = LESSON_CONFIG.modules.length;

export const LESSON_BASE_PATH = `/courses/${LESSON_CONFIG.level}/${LESSON_CONFIG.grade}/${LESSON_CONFIG.chapter}/${LESSON_CONFIG.slug}`;

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
