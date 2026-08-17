/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Racine carrée (3ème)
 */

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'racines-carrees',
  slug: 'racines-carrees',
  title: 'Racine carrée',
  emoji: '√',
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  officialObjects: ['racine_carree'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 60,     
  difficulty: 3,                 // 1 = très facile … 5 = très difficile
  masteryThreshold: 0.8,         // 80 % des modules complétés = leçon maîtrisée

  prerequisites: [
    { id: 'PRE-CARR',  label: 'Carrés parfaits' },
    { id: 'PRE-PUIS',  label: 'Puissances' },
    { id: 'PRE-LITT',  label: 'Calcul littéral' },
  ],

  skills: [
    "Comprendre le sens de √a",
    "Reconnaître les carrés parfaits",
    "Calculer des racines carrées exactes",
    "Utiliser les propriétés de produit et de quotient",
    "Simplifier certaines racines",
    "Résoudre des équations du type x² = a"
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
      title: 'Découverte et Aire',
      desc: "Pourquoi a-t-on créé la racine carrée ? Lien Aire → Côté → √.",
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
      title: 'Carrés Parfaits et Repérage',
      desc: "Visualiser les carrés parfaits et encadrer des racines.",
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
      title: 'Produit et Quotient',
      desc: "Découvrir que √(a×b) = √a × √b.",
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
      title: 'Le Piège de l\'Addition',
      desc: "Démontrer que √(a+b) n'est pas égal à √a + √b.",
      color: 'rose',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 3,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: '5',
      title: 'Simplification (Extraction)',
      desc: "Apprendre à écrire sous la forme a√b.",
      color: 'purple',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 100,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Équations x² = a',
      desc: "Distinction entre √25 et x² = 25.",
      color: 'sky',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 4,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L05'],
    },
    {
      id: 'L07',
      number: 7,
      slug: '7',
      title: 'Bilan Final',
      desc: "Quiz global pour valider l'acquisition de toutes les compétences.",
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
