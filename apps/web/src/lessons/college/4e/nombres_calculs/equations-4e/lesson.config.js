/**
 * Équations du premier degré — 4e (partie 2 de l'objet officiel
 * `calcul_litteral`).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `calcul_litteral` du domaine « Nombres et calculs », applicable à la
 * 4e à la rentrée 2027-2028 — dont les points « Reconnaître ce qu'est une
 * solution d'équation », « Résoudre une équation du premier degré ax + b = c »
 * et « Modéliser un problème par une équation ». Périmètre et frontières de
 * niveau : docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * POURQUOI UNE LEÇON À PART. L'objet officiel porte huit points
 * d'apprentissage : les traiter d'un bloc dépasserait de loin le plafond de
 * 90 min que `validate-lessons.mjs` fait respecter. Le catalogue déclare donc
 * `4e_calcul_litteral` comme un TABLEAU de deux entrées (mécanisme prévu par
 * `buildLesson`, partIndex 1 et 2). La coupure est pédagogique : une équation
 * n'est manipulable que si l'on sait déjà réduire et développer ses deux
 * membres — c'est exactement ce que fait la partie 1, `calcul-litteral-4e`,
 * dont cette leçon suppose les acquis.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon
 * (clé catalogue '4e_calcul_litteral', partie 2, append-only) :
 *
 *   4e_equations-4e_P1  Reconnaître ce qu'est une solution d'équation
 *   4e_equations-4e_P2  Tester une valeur dans une équation
 *   4e_equations-4e_P3  Conserver l'équilibre en agissant sur les deux membres
 *   4e_equations-4e_P4  Résoudre une équation du type x + b = c et ax = c
 *   4e_equations-4e_P5  Résoudre une équation du premier degré ax + b = c
 *   4e_equations-4e_P6  Modéliser un problème par une équation
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une équation est une BALANCE.
 * Ce qui autorise une transformation, ce n'est pas une règle de passage (« le
 * 3 change de côté et change de signe ») mais la conservation de l'équilibre :
 * tout geste fait des DEUX côtés à la fois laisse la balance droite. L'élève
 * agit sur les deux plateaux et voit le fléau rester horizontal — ou basculer
 * s'il triche. La règle du « changement de côté » n'est jamais enseignée comme
 * un tour de main : elle est constatée après coup comme le RÉSUMÉ du geste.
 *
 * PÉRIMÈTRE — hors sujet ici : les inéquations et les équations produit nul,
 * exclusions officielles du niveau (3e) ; les équations du second degré ; les
 * systèmes. Les transformations d'expression (réduire, développer,
 * factoriser) appartiennent à la PARTIE 1 : cette leçon les MOBILISE, elle ne
 * les enseigne pas. La garde est EXÉCUTABLE : le noyau partagé
 * `common/algebra4e/exprCore` ne représente que le premier degré, et
 * `eqScaleBoth` LÈVE sur une multiplication par zéro.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/equations-4e';

export const LESSON_CONFIG = {
  id: 'equations-4e',
  sequentialUnlock: true,
  title: 'Équations du premier degré',
  description:
    "Découvrir qu'une équation est une balance : chercher la masse cachée, comprendre qu'un geste ne conserve l'équilibre que s'il est fait des deux côtés, puis résoudre x + b = c, ax = c et enfin ax + b = c, avant de traduire un problème en équation.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 76,
  skills: [
    "Reconnaître ce qu'est une solution d'équation",
    'Tester une valeur dans une équation',
    "Conserver l'équilibre en agissant sur les deux membres",
    'Résoudre une équation du type x + b = c et ax = c',
    'Résoudre une équation du premier degré ax + b = c',
    'Modéliser un problème par une équation',
  ],
  teachingScope: {
    include: [
      "L'équation comme égalité à vérifier, et la solution comme valeur qui la rend vraie",
      'Tester une valeur dans les deux membres',
      "Les transformations qui conservent l'équilibre : agir des DEUX côtés",
      'Résoudre x + b = c et ax = c',
      'Résoudre ax + b = c en deux gestes',
      'Vérifier une solution en la réinjectant',
      'Traduire un problème en équation, le résoudre et interpréter le résultat',
    ],
    exclude: [
      'Les inéquations et les équations produit nul (exclusions officielles du niveau)',
      'Les équations du second degré et les systèmes (lycée)',
      'Réduire, développer et factoriser une expression (partie 1 : leçon « Calcul littéral »)',
      'Les équations à inconnue des deux côtés au-delà d’un cas simple de transfert',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : la partie 1 de cet objet et les relatifs de 4e. Le module 0
  // les diagnostique.
  priorKnowledge: [
    'inconnue-variable', 'substituer', 'termes-semblables', 'distributivite-simple',
    'regle-des-signes', 'quotient-relatifs',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis en calcul littéral.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-masse-cachee', path: `${LESSON_BASE_PATH}/la-masse-cachee`,
      title: 'La masse cachée', desc: 'Une balance en équilibre, un paquet mystère : retire ce qu’il faut pour le découvrir.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_equations-4e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Peser',
    },
    {
      id: '02', number: 2, slug: 'ce-qu-est-une-solution', path: `${LESSON_BASE_PATH}/ce-qu-est-une-solution`,
      title: 'Ce qu’est une solution', desc: 'Le mot « équation », le mot « solution » — et comment vérifier sans deviner.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_equations-4e_P1', '4e_equations-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Tester',
    },
    {
      id: '03', number: 3, slug: 'un-seul-geste', path: `${LESSON_BASE_PATH}/un-seul-geste`,
      title: 'Un seul geste', desc: 'Les équations qui se résolvent d’un coup : x + b = c et ax = c.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_equations-4e_P4', '4e_equations-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '04', number: 4, slug: 'deux-gestes', path: `${LESSON_BASE_PATH}/deux-gestes`,
      title: 'Deux gestes', desc: 'ax + b = c : d’abord enlever, ensuite partager. Et jamais l’inverse.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_equations-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Enchaîner',
    },
    {
      id: '05', number: 5, slug: 'ecrire-l-equation', path: `${LESSON_BASE_PATH}/ecrire-l-equation`,
      title: 'Écrire l’équation', desc: 'Le plus dur n’est pas de résoudre : c’est de traduire l’énoncé.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_equations-4e_P6'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Traduire',
    },
    {
      id: '06', number: 6, slug: 'l-atelier', path: `${LESSON_BASE_PATH}/l-atelier`,
      title: 'L’atelier', desc: 'Trois problèmes complets : traduire, résoudre, vérifier, interpréter.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_equations-4e_P6', '4e_equations-4e_P5', '4e_equations-4e_P2'],
      color: 'rose', style: 'featured', estimatedMin: 7, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-balance', path: `${LESSON_BASE_PATH}/mission-finale-la-balance`,
      title: '🏆 Mission finale : la balance', desc: 'Dix épreuves pour prouver que tu maîtrises les équations.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
