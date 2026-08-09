/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Théorème de Pythagore (3ème)
 */

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'MOD-3E-PYTHAGORE',
  slug: 'pythagore-3e',
  title: 'Théorème de Pythagore',
  emoji: '📐',
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  officialObjects: ['Théorème de Pythagore'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 60,
  difficulty: 2,
  masteryThreshold: 0.8, // 80 % des modules complétés = leçon maîtrisée

  prerequisites: [
    { id: 'PRE-SQUARES', label: 'Connaissance des carrés parfaits et racines carrées basiques' },
    { id: 'PRE-TRIANGLE', label: 'Propriétés élémentaires du triangle rectangle' }
  ],

  skills: [
    "Comprendre l'égalité de Pythagore géométriquement (aires)",
    "Calculer la longueur de l'hypoténuse d'un triangle rectangle",
    "Calculer la longueur d'un côté de l'angle droit",
    "Démontrer qu'un triangle est rectangle (réciproque)",
    "Démontrer qu'un triangle n'est pas rectangle (contraposée)",
    "Modéliser et résoudre un problème géométrique concret"
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
      title: 'Découverte de Pythagore',
      desc: "Observer visuellement la relation entre les carrés construits sur les côtés.",
      color: 'blue',
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
      title: 'Calculer l\'hypoténuse',
      desc: "Trouver la longueur du plus grand côté d'un triangle rectangle.",
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
      title: 'Calculer un petit côté',
      desc: "Savoir soustraire les carrés pour trouver un côté de l'angle droit.",
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
      title: 'La Réciproque',
      desc: "Démontrer qu'un triangle est rectangle à partir de ses trois longueurs.",
      color: 'emerald',
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
      title: 'La Contraposée',
      desc: "Prouver qu'un triangle n'est pas rectangle.",
      color: 'rose',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 3,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Mission : L\'échelle',
      desc: "Résoudre un problème concret modélisé par un triangle rectangle.",
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
      desc: "Évaluation globale sur le théorème de Pythagore.",
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
