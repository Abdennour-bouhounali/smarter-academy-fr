// Équations produit nul — 3e — "equations-produit": maîtriser la règle du
// produit nul pour résoudre des équations qui ne sont pas du premier degré
// simple. De la machine multiplicatrice au problème d'aires en passant par
// le facteur commun et la différence de deux carrés. See
// docs/architecture/LESSON_CONTRACT.md.

export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/equations-produit';

// Learning Point ids are derived by coursesData.js from the ordered
// `pointsToLearn` list authored for '3e_equations_inequations' (catalogue
// key) whose id is 'equations-produit' — never invent one here. The
// validator parses this file statically, so ids below must be literal
// strings (not identifier references):
//   3e_equations-produit_P1 — Résoudre une équation du premier degré
//   3e_equations-produit_P2 — Résoudre une inéquation
//   3e_equations-produit_P3 — Vérifier une solution
//   3e_equations-produit_P4 — Représenter un ensemble de solutions
//   3e_equations-produit_P5 — Modéliser un problème
//
// NOTE: this lesson's actual content (7 modules, restored 1:1 from the old
// system) is entirely about the "produit nul" method — it never teaches
// inequality solving (P2). P2 is mapped to Module 2 (isolating x with the
// balance method) as the closest kin available in the real content — see
// the porting report for this caveat; the catalogue's pointsToLearn list
// was authored for a broader "équations et inéquations" scope than what
// this lesson actually builds.

export const LESSON_CONFIG = {
  id: 'equations-produit',
  sequentialUnlock: true,
  slug: 'equations-produit',
  title: 'Équations produit nul',
  description:
    "Découvrez la Règle du Zéro avec la machine multiplicatrice, consolidez la résolution d'une équation du premier degré, puis apprenez à séparer une équation produit en deux équations simples, à factoriser par un facteur commun et à reconnaître une différence de deux carrés — jusqu'à résoudre un vrai problème d'aires et valider vos acquis dans le bilan final.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  officialObjects: ['Équations et inéquations du premier degré'],
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚖️',

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 83,
  difficulty: 3,

  prerequisites: [
    { id: 'PRE-CALC',  label: 'Calcul littéral (développement)' },
    { id: 'PRE-EQ1',   label: 'Équations du premier degré' }
  ],

  skills: [
    "Appliquer la règle du produit nul",
    "Résoudre une équation du type (ax+b)(cx+d) = 0",
    "Factoriser par un facteur commun simple",
    "Factoriser à l'aide de l'identité remarquable a²-b²",
    "Résoudre un problème se ramenant à une équation produit"
  ],

  teachingScope: {
    include: [
      'La règle du produit nul (A × B = 0 ⟺ A = 0 ou B = 0)',
      'Résolution d\'une équation du premier degré ax + b = 0',
      'Résolution d\'une équation produit (ax+b)(cx+d) = 0',
      'Factorisation par un facteur commun simple',
      'Factorisation avec l\'identité remarquable a² - b²',
      'Modélisation d\'un problème géométrique par une équation produit',
    ],
    exclude: [
      'Résolution d\'inéquations',
      'Les identités remarquables (a+b)² et (a-b)²',
      'Équations du second degré générales (discriminant)',
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
      id: '01',
      number: 1,
      slug: 'regle-du-zero',
      path: `${LESSON_BASE_PATH}/regle-du-zero`,
      title: 'La Règle du Zéro',
      desc: "Découvrez le secret d'une multiplication qui donne zéro avec la machine multiplicatrice.",
      stage: 'trigger',
      teachesLearningPointIds: ['3e_equations-produit_P3'],
      color: 'blue',
      style: 'featured',
      estimatedMin: 8,
      difficulty: 1,
      xpReward: 50,
      actionText: 'Démarrer ➔',
      prerequisites: [],
    },
    {
      id: '02',
      number: 2,
      slug: 'rappel-premier-degre',
      path: `${LESSON_BASE_PATH}/rappel-premier-degre`,
      title: 'Rappel : 1er Degré',
      desc: "S'entraîner à résoudre ax + b = 0 avec la balance interactive.",
      stage: 'discovery',
      teachesLearningPointIds: ['3e_equations-produit_P1', '3e_equations-produit_P2'],
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 2,
      xpReward: 50,
      actionText: 'Voir ➔',
      prerequisites: ['01'],
    },
    {
      id: '03',
      number: 3,
      slug: 'separer-pour-regner',
      path: `${LESSON_BASE_PATH}/separer-pour-regner`,
      title: 'Séparer pour régner',
      desc: "Appliquez la règle du zéro pour résoudre des équations produit.",
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_equations-produit_P4'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['02'],
    },
    {
      id: '04',
      number: 4,
      slug: 'facteur-commun',
      path: `${LESSON_BASE_PATH}/facteur-commun`,
      title: 'Le Facteur Commun',
      desc: "Apprenez à factoriser x² + 5x = 0 en extrayant le facteur commun.",
      stage: 'formalization',
      teachesLearningPointIds: ['3e_equations-produit_P3'],
      color: 'sky',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['03'],
    },
    {
      id: '05',
      number: 5,
      slug: 'difference-de-carres',
      path: `${LESSON_BASE_PATH}/difference-de-carres`,
      title: 'La différence de carrés',
      desc: "Le puzzle géométrique pour comprendre et utiliser a² - b² = (a-b)(a+b).",
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_equations-produit_P3'],
      color: 'violet',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['04'],
    },
    {
      id: '06',
      number: 6,
      slug: 'carre-contre-rectangle',
      path: `${LESSON_BASE_PATH}/carre-contre-rectangle`,
      title: 'Mission : Carré contre Rectangle',
      desc: "Utilisez les équations produit pour modéliser et résoudre un problème d'aires.",
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_equations-produit_P5'],
      color: 'amber',
      style: 'boss',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 200,
      actionText: 'Mission ➔',
      prerequisites: ['05'],
    },
    {
      id: '07',
      number: 7,
      slug: 'bilan-final',
      path: `${LESSON_BASE_PATH}/bilan-final`,
      title: 'Bilan Final',
      desc: "Évaluation finale pour valider la maîtrise des équations produit nul.",
      stage: 'evaluation',
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Évaluation ➔',
      prerequisites: ['06'],
    }
  ]
};

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
