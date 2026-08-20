/**
 * lesson.config.js
 * Source de vérité pour la leçon : Puissances (3ème)
 */

export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/puissances-3e';

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'puissances-3e',
  slug: 'puissances-3e',
  title: 'Puissances',
  emoji: '🚀',
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  officialObjects: ['Puissances'], // Match the object in the official JSON program

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 65,
  difficulty: 3,
  masteryThreshold: 0.8, // 80 % des modules = validé

  prerequisites: [
    { id: 'PRE-MULT', label: 'Tables de multiplication' },
    { id: 'PRE-REL', label: 'Opérations sur les nombres relatifs' },
  ],

  skills: [
    "Comprendre et utiliser la notation a^n",
    "Utiliser les puissances de 10 (positives et négatives)",
    "Appliquer les règles de calcul sur les puissances",
    "Utiliser la notation scientifique",
    "Résoudre des problèmes modélisés par des puissances"
  ],

  assessment: {
    moduleId: 'L06',
    totalQuestions: 5,
    masteryScore: 4,
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: [
    {
      id: 'L01',
      number: 1,
      slug: 'comprendre-les-puissances',
      path: `${LESSON_BASE_PATH}/comprendre-les-puissances`,
      title: "Qu'est-ce qu'une puissance ?",
      desc: "Découverte visuelle : multiplication répétée, exposant zéro, et puissances négatives.",
      color: 'emerald',
      style: 'featured',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_puissances-3e_P1'],
      estimatedMin: 15,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: 'L02',
      number: 2,
      slug: 'puissances-de-10',
      path: `${LESSON_BASE_PATH}/puissances-de-10`,
      title: 'Puissances de 10',
      desc: "Manipulez la virgule pour comprendre l'effet des puissances de 10.",
      color: 'indigo',
      style: 'featured',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_puissances-3e_P3'],
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L01'],
    },
    {
      id: 'L03',
      number: 3,
      slug: 'calculer-avec-les-puissances',
      path: `${LESSON_BASE_PATH}/calculer-avec-les-puissances`,
      title: 'Calculer avec les puissances',
      desc: "Découvrez visuellement les règles de multiplication et division de puissances.",
      color: 'blue',
      style: 'featured',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_puissances-3e_P2'],
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: 'ecriture-scientifique',
      path: `${LESSON_BASE_PATH}/ecriture-scientifique`,
      title: 'Écriture scientifique',
      desc: "Apprenez à formater les très grands et très petits nombres.",
      color: 'purple',
      style: 'featured',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_puissances-3e_P4'],
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: 'echelle-de-lunivers',
      path: `${LESSON_BASE_PATH}/echelle-de-lunivers`,
      title: "Mission : L'échelle de l'univers",
      desc: "Voyagez de l'infiniment grand à l'infiniment petit avec les puissances de 10.",
      color: 'amber',
      style: 'featured',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_puissances-3e_P5', '3e_puissances-3e_P6'],
      estimatedMin: 12,
      difficulty: 4,
      xpReward: 150,
      actionText: 'Mission ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: 'bilan-final',
      path: `${LESSON_BASE_PATH}/bilan-final`,
      title: 'Bilan Final',
      desc: "Évaluation pour valider votre maîtrise des puissances.",
      color: 'slate',
      style: 'assessment',
      stage: 'evaluation',
      estimatedMin: 6,
      difficulty: 3,
      xpReward: 100,
      actionText: 'Évaluation ➔',
      prerequisites: ['L05'],
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────
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
