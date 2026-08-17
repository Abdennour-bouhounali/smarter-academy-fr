/**
 * lesson.config.js
 * Source de vérité pour la leçon : Puissances (3ème)
 */

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
  estimatedDurationMin: 60,
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
      slug: '1',
      title: 'Comprendre les puissances',
      desc: "Découverte visuelle : multiplication répétée, exposant zéro, et puissances négatives.",
      color: 'emerald',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: 'L02',
      number: 2,
      slug: '2',
      title: 'Puissances de 10',
      desc: "Manipulez la virgule pour comprendre l'effet des puissances de 10.",
      color: 'indigo',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L01'],
    },
    {
      id: 'L03',
      number: 3,
      slug: '3',
      title: 'Calculer avec les puissances',
      desc: "Découvrez visuellement les règles de multiplication et division de puissances.",
      color: 'blue',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: '4',
      title: 'Écriture scientifique',
      desc: "Apprenez à formater les très grands et très petits nombres.",
      color: 'purple',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: '5',
      title: 'Mission : L\'échelle de l\'univers',
      desc: "Voyagez de l'infiniment grand à l'infiniment petit avec les puissances de 10.",
      color: 'amber',
      style: 'boss',
      estimatedMin: 12,
      difficulty: 4,
      xpReward: 150,
      actionText: 'Mission ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Bilan Final',
      desc: "Évaluation pour valider votre maîtrise des puissances.",
      color: 'slate',
      style: 'assessment',
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
