export const LESSON_CONFIG = {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: 'equations-produit',
  slug: 'equations-produit',
  title: 'Équations produit nul',
  emoji: '⚖️',
  level: 'college',
  grade: '3e',
  chapter: 'Algèbre',

  // ── Méta-pédagogique ──────────────────────────────────────────────────────
  estimatedDurationMin: 50,
  difficulty: 3,
  masteryThreshold: 0.8,

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
      slug: '1',
      title: 'La Règle du Zéro',
      desc: "Découvrez le secret d'une multiplication qui donne zéro avec la machine multiplicatrice.",
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
      title: 'Rappel : 1er Degré',
      desc: "S'entraîner à résoudre ax + b = 0 avec la balance interactive.",
      color: 'amber',
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
      title: 'Séparer pour régner',
      desc: "Appliquez la règle du zéro pour résoudre des équations produit.",
      color: 'indigo',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 3,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L02'],
    },
    {
      id: 'L04',
      number: 4,
      slug: '4',
      title: 'Le Facteur Commun',
      desc: "Apprenez à factoriser x² + 5x = 0 en extrayant le facteur commun.",
      color: 'sky',
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
      title: 'La différence de carrés',
      desc: "Le puzzle géométrique pour comprendre et utiliser a² - b² = (a-b)(a+b).",
      color: 'violet',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 4,
      xpReward: 75,
      actionText: 'Voir ➔',
      prerequisites: ['L04'],
    },
    {
      id: 'L06',
      number: 6,
      slug: '6',
      title: 'Mission : Carré contre Rectangle',
      desc: "Utilisez les équations produit pour modéliser et résoudre un problème d'aires.",
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
      desc: "Évaluation finale pour valider la maîtrise des équations produit nul.",
      color: 'slate',
      style: 'assessment',
      estimatedMin: 10,
      difficulty: 3,
      xpReward: 150,
      actionText: 'Évaluation ➔',
      prerequisites: ['L06'],
    }
  ]
};

export const TOTAL_MODULES = LESSON_CONFIG.modules.length;

export const LESSON_BASE_PATH = `/courses/${LESSON_CONFIG.level}/${LESSON_CONFIG.grade}/${LESSON_CONFIG.slug}`;

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
