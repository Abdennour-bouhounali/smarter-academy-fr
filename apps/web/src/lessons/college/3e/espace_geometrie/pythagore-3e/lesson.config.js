/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Théorème de Pythagore (3ème)
 * See docs/architecture/LESSON_CONTRACT.md.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/pythagore-3e';

// Learning Point ids are derived by coursesData.js from the ordered
// `pointsToLearn` list authored for the '3e_pythagore' catalogue entry
// (LESSON_CONFIG.id below is 'pythagore-3e', which is what the ids are
// actually keyed on) — never invent one here.
// The validator parses this file statically, so ids below must be literal
// strings (not identifier references):
//   3e_pythagore-3e_P1 — Identifier l'hypoténuse
//   3e_pythagore-3e_P2 — Écrire l'égalité de Pythagore
//   3e_pythagore-3e_P3 — Calculer l'hypoténuse
//   3e_pythagore-3e_P4 — Calculer un côté de l'angle droit
//   3e_pythagore-3e_P5 — Utiliser la réciproque
//   3e_pythagore-3e_P6 — Résoudre des problèmes

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'pythagore-3e',
  sequentialUnlock: true,
  title: 'Théorème de Pythagore',
  description:
    "Découvre le théorème de Pythagore par l'observation des aires, apprends à calculer l'hypoténuse puis un côté de l'angle droit, démontre qu'un triangle est rectangle (réciproque) ou ne l'est pas (contraposée), et résous un problème concret modélisé par un triangle rectangle.",
  emoji: '📐',
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  officialObjects: ['Théorème de Pythagore'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 71,
  difficulty: 2,
  passingScore: 5,
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

  teachingScope: {
    include: [
      "Identification de l'hypoténuse dans un triangle rectangle",
      "Égalité de Pythagore et son usage géométrique (aires)",
      "Calcul de l'hypoténuse à partir des deux côtés de l'angle droit",
      "Calcul d'un côté de l'angle droit à partir de l'hypoténuse et de l'autre côté",
      "Réciproque du théorème de Pythagore (démontrer qu'un triangle est rectangle)",
      "Contraposée (démontrer qu'un triangle n'est pas rectangle)",
      "Modélisation d'un problème concret par un triangle rectangle",
    ],
    exclude: [
      'Trigonométrie (sinus, cosinus, tangente)',
      'Théorème de Pythagore dans l\'espace (3D)',
      'Triplets pythagoriciens et démonstrations avancées',
    ],
  },

  // ── Évaluation finale ─────────────────────────────────────────────────────
  assessment: {
    moduleId: 'L07',
    totalQuestions: 5,
    masteryScore: 4,
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: [
    {
      id: 'L01',
      number: 1,
      slug: 'decouverte-pythagore',
      path: `${LESSON_BASE_PATH}/decouverte-pythagore`,
      title: 'Découverte de Pythagore',
      desc: "Observer visuellement la relation entre les carrés construits sur les côtés.",
      stage: 'trigger',
      teachesLearningPointIds: ['3e_pythagore-3e_P1'],
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
      slug: 'calculer-hypotenuse',
      path: `${LESSON_BASE_PATH}/calculer-hypotenuse`,
      title: "Calculer l'hypoténuse",
      desc: "Trouver la longueur du plus grand côté d'un triangle rectangle.",
      stage: 'discovery',
      teachesLearningPointIds: ['3e_pythagore-3e_P2', '3e_pythagore-3e_P3'],
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
      slug: 'calculer-un-cote',
      path: `${LESSON_BASE_PATH}/calculer-un-cote`,
      title: 'Calculer un petit côté',
      desc: "Savoir soustraire les carrés pour trouver un côté de l'angle droit.",
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_pythagore-3e_P4'],
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
      slug: 'la-reciproque',
      path: `${LESSON_BASE_PATH}/la-reciproque`,
      title: 'La Réciproque',
      desc: "Démontrer qu'un triangle est rectangle à partir de ses trois longueurs.",
      stage: 'formalization',
      teachesLearningPointIds: ['3e_pythagore-3e_P5'],
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
      slug: 'la-contraposee',
      path: `${LESSON_BASE_PATH}/la-contraposee`,
      title: 'La Contraposée',
      desc: "Prouver qu'un triangle n'est pas rectangle.",
      stage: 'formalization',
      teachesLearningPointIds: ['3e_pythagore-3e_P5'],
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
      slug: 'mission-echelle',
      path: `${LESSON_BASE_PATH}/mission-echelle`,
      title: "Mission : L'échelle",
      desc: "Résoudre un problème concret modélisé par un triangle rectangle.",
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_pythagore-3e_P6'],
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
      slug: 'bilan-final',
      path: `${LESSON_BASE_PATH}/bilan-final`,
      title: 'Bilan Final',
      desc: "Évaluation globale sur le théorème de Pythagore.",
      stage: 'evaluation',
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

export function getModuleNav(moduleNumber) {
  const modules = LESSON_CONFIG.modules;
  const idx = modules.findIndex((m) => m.number === moduleNumber);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;
  return {
    prevLink: prev ? prev.path : null,
    nextLink: next ? next.path : null,
  };
}
