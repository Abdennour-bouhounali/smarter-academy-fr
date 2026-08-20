/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Théorème de Thalès (3ème)
 */

export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/thales-3e';

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'thales-3e',          // Clé localStorage
  slug: 'thales-3e',
  title: 'Théorème de Thalès',
  emoji: '📐',
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  officialObjects: ['Théorème de Thalès'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 77,
  difficulty: 3,                 // 1 = très facile … 5 = très difficile
  masteryThreshold: 0.8,         // 80 % des modules complétés = leçon maîtrisée

  prerequisites: [
    { id: 'PRE-FRAC',  label: 'Fractions (égalités de quotients)' },
    { id: 'PRE-PROP',  label: 'Proportionnalité et quatrième proportionnelle' },
    { id: 'PRE-DROI',  label: 'Droites parallèles et sécantes' },
  ],

  skills: [
    "Reconnaître les configurations de Thalès (triangles emboîtés et configuration croisée)",
    "Écrire l'égalité des trois rapports",
    "Appliquer le théorème de Thalès pour calculer une longueur manquante",
    "Utiliser la réciproque du théorème de Thalès pour prouver que deux droites sont parallèles",
    "Utiliser la contraposée du théorème de Thalès pour prouver que deux droites ne sont pas parallèles"
  ],

  // ── Évaluation finale ─────────────────────────────────────────────────────
  assessment: {
    moduleId: 'L07',
    totalQuestions: 5,
    masteryScore: 4,             // 4/5 = leçon validée
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: [
    {
      id: 'L01',
      number: 1,
      slug: 'decouverte-configurations',
      path: `${LESSON_BASE_PATH}/decouverte-configurations`,
      title: 'Découverte des Configurations',
      desc: "Identifier visuellement les droites parallèles et les triangles emboîtés ou en papillon.",
      color: 'emerald',
      style: 'featured',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_thales-3e_P1'],
      estimatedMin: 8,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: 'L02',
      number: 2,
      slug: 'egalite-thales',
      path: `${LESSON_BASE_PATH}/egalite-thales`,
      title: "Écrire l'égalité de Thalès",
      desc: "Apprendre à poser les 3 rapports égaux sans se tromper (Petit triangle / Grand triangle).",
      color: 'indigo',
      style: 'featured',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_thales-3e_P2'],
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L01'],
    },
    {
      id: 'L03',
      number: 3,
      slug: 'calcul-longueur',
      path: `${LESSON_BASE_PATH}/calcul-longueur`,
      title: 'Calculer une longueur avec Thalès',
      desc: 'Utiliser l\'égalité et le produit en croix pour trouver une longueur.',
      color: 'blue',
      style: 'featured',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_thales-3e_P3'],
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: 'reciproque-contraposee',
      path: `${LESSON_BASE_PATH}/reciproque-contraposee`,
      title: 'La Réciproque et la Contraposée',
      desc: 'Prouver si deux droites sont parallèles ou non.',
      color: 'purple',
      style: 'featured',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_thales-3e_P4', '3e_thales-3e_P5'],
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: 'configuration-papillon',
      path: `${LESSON_BASE_PATH}/configuration-papillon`,
      title: 'Configurations "Papillon"',
      desc: 'S\'exercer spécifiquement sur la configuration croisée qui pose souvent problème.',
      color: 'sky',
      style: 'featured',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_thales-3e_P6'],
      estimatedMin: 10,
      difficulty: 4,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: 'mission-pyramide',
      path: `${LESSON_BASE_PATH}/mission-pyramide`,
      title: 'Mission : L\'ombre de la Pyramide',
      desc: 'Comment Thalès a-t-il calculé la hauteur de la pyramide de Khéops ?',
      color: 'amber',
      style: 'boss',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_thales-3e_P6'],
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 200,
      actionText: 'Mission ➔',
      prerequisites: ['L05'],
    },
    {
      id: 'L07',
      number: 7,
      slug: 'bilan-final',
      path: `${LESSON_BASE_PATH}/bilan-final`,
      title: 'Bilan Final',
      desc: 'Évaluation finale pour valider la maîtrise de la leçon.',
      color: 'slate',
      style: 'assessment',
      stage: 'evaluation',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Évaluation ➔',
      prerequisites: ['L06'],
    },
  ],
};

// ── Helpers dérivés (calculés une seule fois) ────────────────────────────────

export const TOTAL_MODULES = LESSON_CONFIG.modules.length;



/** Retourne le module précédent et suivant d'un module donné par son numéro */
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
