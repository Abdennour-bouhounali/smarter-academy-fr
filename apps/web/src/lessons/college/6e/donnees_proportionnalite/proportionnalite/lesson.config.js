/**
 * Proportionnalité — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 11 LPs de cette leçon
 * (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_proportionnalite_P1   Reconnaître une situation de proportionnalité
 *   6e_proportionnalite_P2   Comprendre qu'elle repose sur une relation multiplicative
 *   6e_proportionnalite_P3   Identifier les grandeurs qui varient dans une situation
 *   6e_proportionnalite_P4   Compléter un tableau de proportionnalité
 *   6e_proportionnalite_P5   Utiliser le passage par l'unité lorsque c'est pertinent
 *   6e_proportionnalite_P6   Utiliser la multiplication ou la division
 *   6e_proportionnalite_P7   Utiliser double, triple, moitié
 *   6e_proportionnalite_P8   Comparer situations proportionnelles et non proportionnelles
 *   6e_proportionnalite_P9   Choisir une stratégie adaptée
 *   6e_proportionnalite_P10  Résoudre des problèmes concrets
 *   6e_proportionnalite_P11  Vérifier la cohérence d'un résultat
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : dans une
 * situation proportionnelle, on passe TOUJOURS d'une grandeur à l'autre en
 * multipliant par le même nombre. La leçon ne commence donc pas par « une
 * situation est proportionnelle lorsque… » mais par un distributeur que
 * l'élève actionne : 1 jeton, 2 jetons, 5 jetons — et il constate.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : le produit en croix ET la
 * représentation graphique de la proportionnalité sont EXCLUS du programme
 * de 6e. La leçon n'en montre aucun — les points alignés sur une droite
 * appartiennent à la 5e. Les procédures travaillées sont le passage par
 * l'unité, la multiplication/division, la linéarité additive et les
 * relations double/triple/moitié.
 *
 * Fil narratif unique : la kermesse du collège (stand de crêpes, jetons,
 * recette), reprise du module 1 jusqu'à la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/donnees_proportionnalite/proportionnalite';

export const LESSON_CONFIG = {
  id: 'proportionnalite',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A) : les tables, la division
  // exacte, les relations double/moitié sur des NOMBRES, et la lecture d'un
  // petit tableau. Ce sont exactement les trois choses que les cinq questions
  // du module 0 mesurent. La proportionnalité elle-même et son coefficient
  // sont établis dans la leçon, jamais supposés.
  priorKnowledge: ['tables-multiplication', 'calcul-numerique', 'lire-tableau'],
  // FAUX POSITIF DOCUMENTÉ. `coefficient-lineaire` est l'entrée du lexique
  // pour le mot « coefficient » employé SEUL au sens de la 3e (fonction
  // linéaire). En 6e, ce mot est toujours ici le raccourci de « coefficient
  // de proportionnalité » — une connaissance que la leçon pose elle-même,
  // par une brique, au module 2 étape 2, AVANT tout emploi abrégé. Le
  // détecteur ne peut pas distinguer les deux sens ; le contrat, lui, est
  // respecté (docs/architecture/KNOWLEDGE_DEPENDENCY.md, contrôle 2).
  knowledgeAudit: {
    ignore: [
      {
        term: 'coefficient-lineaire',
        reason:
          "En 6e « le coefficient » abrège toujours « le coefficient de proportionnalité », posé par une brique au module 2 avant tout emploi ; le sens 3e (coefficient d'une fonction linéaire) n'apparaît nulle part dans cette leçon.",
      },
    ],
  },
  title: 'Proportionnalité',
  description:
    "Manipuler deux grandeurs qui varient ensemble jusqu'à voir apparaître la relation multiplicative, puis choisir la stratégie la plus efficace pour trouver une valeur manquante.",
  level: 'college',
  grade: '6e',
  chapter: 'donnees_proportionnalite',
  chapterTitle: 'Organisation et gestion de données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 86,
  skills: [
    'Reconnaître une situation de proportionnalité',
    'Comprendre la relation multiplicative entre deux grandeurs',
    'Identifier les grandeurs qui varient dans une situation',
    'Compléter un tableau de proportionnalité',
    "Utiliser le passage par l'unité",
    'Utiliser la multiplication ou la division pour trouver une valeur',
    'Utiliser les relations double, triple et moitié',
    'Comparer situations proportionnelles et non proportionnelles',
    'Choisir une stratégie adaptée',
    'Résoudre des problèmes de proportionnalité concrets',
    "Vérifier la cohérence d'un résultat",
  ],
  teachingScope: {
    include: [
      'Reconnaître une situation de proportionnalité',
      'Procédures simples (linéarité additive et multiplicative)',
      "Passage à l'unité",
      'Pourcentages très simples',
    ],
    exclude: ['Produit en croix', 'Représentation graphique de la proportionnalité', 'Coefficient multiplicateur complexe'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-distributeur', path: `${LESSON_BASE_PATH}/le-distributeur`,
      title: 'Le distributeur de crêpes', desc: '1 jeton, 2 jetons, 5 jetons : actionne et regarde ce qui sort.',
      stage: 'trigger', teachesLearningPointIds: ['6e_proportionnalite_P1', '6e_proportionnalite_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Actionner' },
    { id: '02', number: 2, slug: 'toujours-le-meme-nombre', path: `${LESSON_BASE_PATH}/toujours-le-meme-nombre`,
      title: 'Toujours le même nombre', desc: 'Le passage d’une grandeur à l’autre cache une multiplication.',
      stage: 'discovery', teachesLearningPointIds: ['6e_proportionnalite_P2'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Découvrir' },
    { id: '03', number: 3, slug: 'le-banc-d-essai', path: `${LESSON_BASE_PATH}/le-banc-d-essai`,
      title: 'Le banc d’essai', desc: 'Teste une situation : double la quantité et vois si le prix suit.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_proportionnalite_P8', '6e_proportionnalite_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'Tester' },
    { id: '04', number: 4, slug: 'completer-le-tableau', path: `${LESSON_BASE_PATH}/completer-le-tableau`,
      title: 'Compléter le tableau', desc: 'Quatre cases vides, plusieurs chemins pour les remplir.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_proportionnalite_P4', '6e_proportionnalite_P5'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Compléter' },
    { id: '05', number: 5, slug: 'choisir-sa-strategie', path: `${LESSON_BASE_PATH}/choisir-sa-strategie`,
      title: 'Choisir sa stratégie', desc: 'Unité, multiplication, division, addition : la plus rapide dépend des nombres.',
      stage: 'formalization', teachesLearningPointIds: ['6e_proportionnalite_P6', '6e_proportionnalite_P9'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Choisir' },
    { id: '06', number: 6, slug: 'la-kermesse', path: `${LESSON_BASE_PATH}/la-kermesse`,
      title: 'Les problèmes de la kermesse', desc: 'Recettes, courses, distances : et un résultat à vérifier.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_proportionnalite_P10', '6e_proportionnalite_P11'],
      color: 'rose', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'le-grand-stand', path: `${LESSON_BASE_PATH}/le-grand-stand`,
      title: '🏆 Mission finale : le grand stand', desc: 'Dix épreuves pour tenir le stand de la kermesse sans une erreur.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 11, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
