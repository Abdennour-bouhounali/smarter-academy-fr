/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Fonctions linéaires et affines (3ème)
 *
 * Ce fichier pilote :
 *  - la page index (liste des modules)
 *  - chaque ModuleLayout (totalModules, ID, navigation)
 *  - le système de progression (XP, complétion)
 *
 * See docs/architecture/LESSON_CONTRACT.md and AI_LESSON_CONTRACT.md.
 *
 * Learning Point ids are derived by coursesData.js from the ordered
 * `pointsToLearn` list authored for the '3e_fonctions' catalogue entry
 * (LESSON_CONFIG.id below is 'fonctions-lineaires-affines'; the id format
 * is `${gradeId}_${lessonId}_P${n}`) — never invent one here.
 *   3e_fonctions-lineaires-affines_P1 — Calculer l'image d'un nombre par une fonction
 *   3e_fonctions-lineaires-affines_P2 — Rechercher un antécédent
 *   3e_fonctions-lineaires-affines_P3 — Construire un tableau de valeurs
 *   3e_fonctions-lineaires-affines_P4 — Identifier et utiliser une fonction linéaire
 *   3e_fonctions-lineaires-affines_P5 — Identifier et utiliser une fonction affine (f(x)=ax+b)
 *   3e_fonctions-lineaires-affines_P6 — Lire a et b et tracer une représentation graphique
 *   3e_fonctions-lineaires-affines_P7 — Déterminer le coefficient directeur à partir de deux points
 *   3e_fonctions-lineaires-affines_P8 — Déterminer l'expression complète d'une fonction depuis deux points
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines';

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'fonctions-lineaires-affines',          // Clé localStorage (V2 = nouvelle architecture)
  slug: 'fonctions-lineaires-affines',
  // sequentialUnlock: opt-out deliberately for this lesson (cleanup-phase
  // audit finding) — modules are freely navigable, only the final
  // evaluation's mastery gate matters.
  sequentialUnlock: false,
  title: 'Fonctions linéaires et affines',
  description:
    "Maîtriser le vocabulaire image/antécédent/f(x), construire un tableau de valeurs, identifier et représenter graphiquement une fonction linéaire puis une fonction affine (f(x)=ax+b), lire a et b sur un graphique, déterminer l'expression d'une fonction depuis deux points et modéliser une situation concrète.",
  emoji: '📈',
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  officialObjects: ['Fonctions affines', 'Fonctions linéaires'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 107,     // Somme des durées de tous les modules
  difficulty: 3,                 // 1 = très facile … 5 = très difficile
  passingScore: 6,                // 6/8 = leçon validée (voir Module10BilanEvaluation)
  masteryThreshold: 0.8,         // 80 % des modules complétés = leçon maîtrisée

  prerequisites: [
    { id: 'PRE-PROP',  label: 'Proportionnalité (4ème)' },
    { id: 'PRE-REP',   label: 'Repère cartésien (4ème)' },
    { id: 'PRE-CALC',  label: 'Calcul littéral de base' },
  ],

  skills: [
    "Calculer l'image d'un nombre par une fonction",
    'Rechercher un antécédent',
    'Construire un tableau de valeurs',
    'Identifier une fonction linéaire ou affine',
    "Tracer la représentation graphique d'une fonction affine",
    'Lire a et b directement sur un graphique',
    "Déterminer l'expression d'une fonction depuis deux points",
    'Résoudre un problème concret par modélisation fonctionnelle',
  ],

  teachingScope: {
    include: [
      "Vocabulaire fonction, image, antécédent, f(x)",
      'Tableau de valeurs',
      'Fonction linéaire f(x)=ax et sa représentation graphique',
      'Fonction affine f(x)=ax+b, coefficient directeur, ordonnée à l\'origine',
      'Lecture graphique de a et b',
      "Détermination du coefficient directeur et de l'expression complète à partir de deux points",
      'Modélisation d\'une situation concrète (forfait, tarif) par une fonction affine',
    ],
    exclude: [
      'Systèmes de deux équations',
      'Fonctions du second degré',
      'Étude de signe / variations avancées',
    ],
  },

  // ── Évaluation finale ─────────────────────────────────────────────────────
  assessment: {
    moduleId: 'L10',
    totalQuestions: 8,
    masteryScore: 6,             // 6/8 = leçon validée
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  // Ordre = ordre d'affichage et de navigation.
  // slug = segment d'URL (ex: /courses/college/3e/.../le-compteur-du-taxi)
  modules: [
    {
      id: 'L01',
      number: 1,
      slug: 'notion-de-fonction',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/notion-de-fonction',
      title: 'Notion de Fonction',
      desc: "Comprendre qu'une fonction associe un unique résultat à chaque entrée, à travers le compteur d'un taxi.",
      stage: 'trigger',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P1'],
      color: 'emerald',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
    },
    {
      id: 'L02',
      number: 2,
      slug: 'image-et-antecedent',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/image-et-antecedent',
      title: 'Image et Antécédent',
      desc: 'Calculer f(x) et retrouver x connaissant f(x).',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P1', '3e_fonctions-lineaires-affines_P2'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
    },
    {
      id: 'L03',
      number: 3,
      slug: 'tableau-de-valeurs',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/tableau-de-valeurs',
      title: 'Tableau de Valeurs',
      desc: 'Construire et compléter un tableau de valeurs pour une fonction.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P3'],
      color: 'violet',
      style: 'featured',
      estimatedMin: 7,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
    },
    {
      id: 'L04',
      number: 4,
      slug: 'fonction-lineaire',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/fonction-lineaire',
      title: 'Fonction Linéaire',
      desc: "Définition, proportionnalité et droite passant par l'origine.",
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P4'],
      color: 'blue',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 75,
      actionText: 'Voir ➔',
    },
    {
      id: 'L05',
      number: 5,
      slug: 'representation-graphique',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/representation-graphique',
      title: 'Représentation Graphique',
      desc: 'Tracer une droite à partir de son tableau de valeurs.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P4'],
      color: 'sky',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
    },
    {
      id: 'L06',
      number: 6,
      slug: 'fonction-affine',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/fonction-affine',
      title: 'Fonction Affine',
      desc: "Définition de f(x)=ax+b, rôle du coefficient directeur et de l'ordonnée à l'origine.",
      stage: 'formalization',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P5'],
      color: 'purple',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 75,
      actionText: 'Voir ➔',
    },
    {
      id: 'L07',
      number: 7,
      slug: 'lecture-graphique',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/lecture-graphique',
      title: 'Lecture Graphique',
      desc: "Lire a et b directement sur un graphique et écrire l'expression.",
      stage: 'formalization',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P6'],
      color: 'cyan',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 100,
      actionText: 'Voir ➔',
    },
    {
      id: 'L08',
      number: 8,
      slug: 'coefficient-deux-points',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/coefficient-deux-points',
      title: 'Coefficient directeur avec deux points',
      desc: 'Calculer a avec la formule, puis déterminer b pour obtenir f(x)=ax+b.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P7'],
      color: 'rose',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 4,
      xpReward: 100,
      actionText: 'Voir ➔',
    },
    {
      id: 'L09',
      number: 9,
      slug: 'mission-forfait',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/mission-forfait',
      title: 'Mission : Le Choix du Forfait',
      desc: 'Appliquer toutes vos compétences sur un problème de vie réelle : modéliser puis déterminer une expression complète depuis deux points.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-lineaires-affines_P8'],
      color: 'amber',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 200,
      actionText: 'Mission ➔',
    },
    {
      id: 'L10',
      number: 10,
      slug: 'bilan-final',
      path: '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines/bilan-final',
      title: 'Bilan Final',
      desc: 'Évaluation finale pour valider la maîtrise de la leçon (8 questions, 6/8 minimum).',
      stage: 'evaluation',
      color: 'slate',
      style: 'assessment',
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Évaluation ➔',
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
