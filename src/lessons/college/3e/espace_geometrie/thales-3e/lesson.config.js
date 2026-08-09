/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Théorème de Thalès (3ème)
 */

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
  estimatedDurationMin: 70,     
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
      slug: '1',
      title: 'Découverte des Configurations',
      desc: "Identifier visuellement les droites parallèles et les triangles emboîtés ou en papillon.",
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
      title: "Écrire l'égalité de Thalès",
      desc: "Apprendre à poser les 3 rapports égaux sans se tromper (Petit triangle / Grand triangle).",
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
      title: 'Calculer une longueur avec Thalès',
      desc: 'Utiliser l\'égalité et le produit en croix pour trouver une longueur.',
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
      title: 'La Réciproque et la Contraposée',
      desc: 'Prouver si deux droites sont parallèles ou non.',
      color: 'purple',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: '5',
      title: 'Configurations "Papillon"',
      desc: 'S\'exercer spécifiquement sur la configuration croisée qui pose souvent problème.',
      color: 'sky',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 4,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Mission : L\'ombre de la Pyramide',
      desc: 'Comment Thalès a-t-il calculé la hauteur de la pyramide de Khéops ?',
      color: 'amber',
      style: 'boss',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 200,
      actionText: 'Mission ➔',
      prerequisites: ['L05'],
    },
    {
      id: 'L07',
      number: 7,
      slug: '7',
      title: 'Bilan Final',
      desc: 'Évaluation finale pour valider la maîtrise de la leçon.',
      color: 'slate',
      style: 'assessment',
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

export const LESSON_BASE_PATH =
  `/courses/${LESSON_CONFIG.level}/${LESSON_CONFIG.grade}/${LESSON_CONFIG.chapter}/${LESSON_CONFIG.slug}`;

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
