/**
 * lesson.config.js
 * Source de vérité unique pour la leçon : Fonctions linéaires et affines (3ème)
 *
 * Ce fichier pilote :
 *  - la page index (liste des modules)
 *  - chaque ModuleLayout (totalModules, ID, navigation)
 *  - le système de progression (XP, complétion)
 *
 * Pour ajouter un module : ajouter un objet dans le tableau `modules` ci-dessous
 * et créer le fichier correspondant dans /modules/.
 */

export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'MOD-3E-FONC-V2',          // Clé localStorage (V2 = nouvelle architecture)
  slug: 'fonctions-lineaires-affines',
  title: 'Fonctions linéaires et affines',
  emoji: '📈',
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  officialObjects: ['Fonctions affines', 'Fonctions linéaires'],

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 107,     // Somme des durées de tous les modules
  difficulty: 3,                 // 1 = très facile … 5 = très difficile
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

  // ── Évaluation finale ─────────────────────────────────────────────────────
  assessment: {
    moduleId: 'L10',
    totalQuestions: 8,
    masteryScore: 6,             // 6/8 = leçon validée
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  // Ordre = ordre d'affichage et de navigation.
  // slug = segment d'URL (ex: /courses/college/3e/.../4)
  modules: [
    {
      id: 'L01',
      number: 1,
      slug: '1',
      title: 'Notion de Fonction',
      desc: "Comprendre qu'une fonction associe un unique résultat à chaque entrée.",
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
      title: 'Image et Antécédent',
      desc: "Calculer f(x) et retrouver x connaissant f(x).",
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
      title: 'Tableau de Valeurs',
      desc: 'Construire et compléter un tableau de valeurs pour une fonction.',
      color: 'violet',
      style: 'featured',
      estimatedMin: 7,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: '4',
      title: 'Fonction Linéaire',
      desc: 'Définition, proportionnalité et droite passant par l\'origine.',
      color: 'blue',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L03'],
    },
    {
      id: 'L05',
      number: 5,
      slug: '5',
      title: 'Représentation Graphique',
      desc: 'Tracer une droite à partir de son tableau de valeurs.',
      color: 'sky',
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
      title: 'Fonction Affine',
      desc: 'Définition de f(x)=ax+b, rôle du coefficient directeur et de l\'ordonnée à l\'origine.',
      color: 'purple',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L05'],
    },
    {
      id: 'L07',
      number: 7,
      slug: '7',
      title: 'Lecture Graphique',
      desc: 'Lire a et b directement sur un graphique et écrire l\'expression.',
      color: 'cyan',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 3,
      xpReward: 100,
      actionText: 'Voir ➔',
      prerequisites: ['L06'],
    },
    {
      id: 'L08',
      number: 8,
      slug: '8',
      title: 'Coefficient avec deux points',
      desc: 'Calculer a avec la formule, puis déterminer b pour obtenir f(x)=ax+b.',
      color: 'rose',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 4,
      xpReward: 100,
      actionText: 'Voir ➔',
      prerequisites: ['L07'],
    },
    {
      id: 'L09',
      number: 9,
      slug: '9',
      title: 'Mission : Le Choix du Forfait',
      desc: 'Appliquer toutes vos compétences sur un problème de vie réelle.',
      color: 'amber',
      style: 'boss',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 200,
      actionText: 'Mission ➔',
      prerequisites: ['L08'],
    },
    {
      id: 'L10',
      number: 10,
      slug: '10',
      title: 'Bilan Final',
      desc: 'Évaluation finale pour valider la maîtrise de la leçon.',
      color: 'slate',
      style: 'assessment',
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Évaluation ➔',
      prerequisites: ['L09'],
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
