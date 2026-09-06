/**
 * Nombres rationnels — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_nombres_rationnels',
 * append-only) :
 *
 *   3e_nombres-rationnels_P1   Comprendre les nombres rationnels comme des nombres pouvant s'écrire sous forme de quotient de deux entiers avec un dénominateur non nul
 *   3e_nombres-rationnels_P2   Reconnaître différentes écritures d'un même nombre rationnel
 *   3e_nombres-rationnels_P3   Rendre une fraction irréductible
 *   3e_nombres-rationnels_P4   Comparer deux nombres rationnels
 *   3e_nombres-rationnels_P5   Additionner et soustraire des nombres rationnels
 *   3e_nombres-rationnels_P6   Multiplier des nombres rationnels
 *   3e_nombres-rationnels_P7   Diviser des nombres rationnels
 *   3e_nombres-rationnels_P8   Choisir et enchaîner les opérations adaptées dans une expression
 *   3e_nombres-rationnels_P9   Respecter les priorités de calcul dans une expression contenant des rationnels
 *   3e_nombres-rationnels_P10  Résoudre des problèmes faisant intervenir des nombres rationnels
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : un rationnel est
 * un POINT, et toutes ses écritures ne sont que des façons de le découper.
 * La leçon ne commence donc pas par « un rationnel est un quotient de deux
 * entiers » mais par une barre que l'élève re-découpe (RationalBar) — la
 * longueur coloriée et le marqueur sur la droite ne bougent JAMAIS pendant
 * que les chiffres changent. L'équivalence est cette invariance de position ;
 * le vocabulaire arrive après le geste.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : la leçon travaille les rationnels
 * en écriture fractionnaire, positifs ET négatifs, avec les quatre opérations,
 * les priorités et les problèmes. Sont exclus : les puissances de rationnels,
 * les racines, le calcul littéral sur les fractions (a/b avec des lettres),
 * la démonstration de l'irrationalité, et les écritures décimales illimitées
 * périodiques comme objet d'étude.
 *
 * Fil narratif unique : « deux noms, un seul nombre » — la barre élastique du
 * module 1, la même découpe du module 4, jusqu'au budget du club, reprise
 * figée dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/nombres-rationnels';

export const LESSON_CONFIG = {
  id: 'nombres-rationnels',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : lire une fraction et en reconnaître une égale, diviser,
  // manier les signes et l'ordre des relatifs — exactement ce que le module 0
  // diagnostique. Tout le reste (irréductible, PGCD, PPCM, inverse, les quatre
  // opérations sur les rationnels) est établi dans la leçon même.
  priorKnowledge: ['quotient', 'calcul-numerique', 'nombres-relatifs'],
  title: 'Nombres rationnels',
  description:
    "Re-découper une barre sans jamais déplacer le point qu'elle marque, pour découvrir qu'un rationnel a mille écritures et une seule valeur — puis les rendre irréductibles, les comparer, les additionner à la même découpe, les multiplier, les diviser et les enchaîner dans de vrais problèmes.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➗',
  estimatedDurationMin: 85,
  skills: [
    "Comprendre les nombres rationnels comme des nombres pouvant s'écrire sous forme de quotient de deux entiers avec un dénominateur non nul",
    "Reconnaître différentes écritures d'un même nombre rationnel",
    'Rendre une fraction irréductible',
    'Comparer deux nombres rationnels',
    'Additionner et soustraire des nombres rationnels',
    'Multiplier des nombres rationnels',
    'Diviser des nombres rationnels',
    'Choisir et enchaîner les opérations adaptées dans une expression',
    'Respecter les priorités de calcul dans une expression contenant des rationnels',
    'Résoudre des problèmes faisant intervenir des nombres rationnels',
  ],
  teachingScope: {
    include: [
      'Rationnel = quotient de deux entiers, dénominateur non nul',
      "Écritures multiples d'un même rationnel (fraction, décimal, signe déplacé)",
      'Fraction irréductible et PGCD',
      'Comparaison de rationnels, y compris négatifs',
      'Somme, différence, produit et quotient de rationnels',
      "Priorités de calcul et enchaînement d'opérations sur les rationnels",
      'Problèmes de partage, de parts et de budget',
    ],
    exclude: [
      'Puissances de rationnels (traitées dans « Puissances »)',
      'Racines carrées et nombres irrationnels',
      'Calcul littéral sur les fractions (quotients de lettres)',
      "Développement décimal illimité périodique comme objet d'étude",
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'deux-noms-un-nombre', path: `${LESSON_BASE_PATH}/deux-noms-un-nombre`,
      title: 'Deux noms, un seul nombre', desc: 'Re-découpe la barre : les chiffres changent, le point ne bouge pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_nombres-rationnels_P1', '3e_nombres-rationnels_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Re-découper la barre',
    },
    {
      id: '02', number: 2, slug: 'rendre-irreductible', path: `${LESSON_BASE_PATH}/rendre-irreductible`,
      title: 'Rendre irréductible', desc: 'Regroupe les parts jusqu’à ce qu’aucun diviseur commun ne reste.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_nombres-rationnels_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Simplifier',
    },
    {
      id: '03', number: 3, slug: 'comparer', path: `${LESSON_BASE_PATH}/comparer`,
      title: 'Comparer', desc: 'Place deux rationnels sur la droite — celui de droite est le plus grand.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_nombres-rationnels_P4'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Placer et comparer',
    },
    {
      id: '04', number: 4, slug: 'la-meme-decoupe', path: `${LESSON_BASE_PATH}/la-meme-decoupe`,
      title: 'La même découpe', desc: 'Un demi et un tiers ne s’emboîtent pas — jusqu’à ce que tu recoupes tout en sixièmes.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_nombres-rationnels_P5'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Recouper les barres',
    },
    {
      id: '05', number: 5, slug: 'fraction-de-fraction', path: `${LESSON_BASE_PATH}/fraction-de-fraction`,
      title: 'Une fraction d’une fraction', desc: 'Peins les deux tiers d’un quadrillage déjà aux trois quarts peint.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_nombres-rationnels_P6', '3e_nombres-rationnels_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Peindre la grille',
    },
    {
      id: '06', number: 6, slug: 'dans-quel-ordre', path: `${LESSON_BASE_PATH}/dans-quel-ordre`,
      title: 'Dans quel ordre ?', desc: 'Choisis la prochaine opération autorisée — la chaîne de calcul se construit.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_nombres-rationnels_P8', '3e_nombres-rationnels_P9'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Choisir l’étape',
    },
    {
      id: '07', number: 7, slug: 'le-budget-du-club', path: `${LESSON_BASE_PATH}/le-budget-du-club`,
      title: 'Le budget du club', desc: 'Des parts de budget en barres : combien reste-t-il, et pour combien de maillots ?',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_nombres-rationnels_P10', '3e_nombres-rationnels_P8'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Ouvrir le budget',
    },
    {
      id: '08', number: 8, slug: 'mission-finale', path: `${LESSON_BASE_PATH}/mission-finale`,
      title: '🏆 Mission finale : deux noms, un seul nombre', desc: 'Dix épreuves pour prouver qu’aucune écriture ne te trompe.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
