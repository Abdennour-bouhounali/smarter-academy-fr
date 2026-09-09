/**
 * Nombres rationnels — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `nombres_rationnels` du domaine « Nombres et calculs », applicable à
 * la 4e à la rentrée 2027-2028. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 8 LPs de cette leçon
 * (clé catalogue '4e_nombres_rationnels', append-only) :
 *
 *   4e_nombres-rationnels-4e_P1  Reconnaître un nombre rationnel comme quotient de deux entiers relatifs
 *   4e_nombres-rationnels-4e_P2  Tester l'égalité de deux fractions par les produits en croix
 *   4e_nombres-rationnels-4e_P3  Additionner deux fractions de dénominateurs quelconques
 *   4e_nombres-rationnels-4e_P4  Soustraire deux fractions de dénominateurs quelconques
 *   4e_nombres-rationnels-4e_P5  Multiplier deux fractions
 *   4e_nombres-rationnels-4e_P6  Déterminer l'inverse d'un nombre non nul
 *   4e_nombres-rationnels-4e_P7  Diviser par une fraction en multipliant par son inverse
 *   4e_nombres-rationnels-4e_P8  Résoudre un problème mettant en jeu des rationnels
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : deux fractions sont égales
 * exactement quand leurs PRODUITS EN CROIX le sont. La 5e testait l'égalité
 * en simplifiant — un procédé qui marche tant que les nombres sont petits et
 * qui échoue dès qu'ils résistent. La 4e remplace ce tâtonnement par un test
 * qui porte sur deux ENTIERS, donc toujours décidable. C'est ce même
 * déplacement — « ramener les fractions à des entiers » — qui explique
 * ensuite le dénominateur commun, puis la division par l'inverse.
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit la fraction comme NOMBRE
 * (une position sur la droite), les fractions égales, la simplification, la
 * comparaison et l'addition dans le seul cas où un dénominateur est multiple
 * de l'autre. Son propre noyau de calcul REFUSE d'aller plus loin. La 4e lève
 * exactement les deux barrières qu'elle avait posées — le signe et les
 * dénominateurs quelconques — et ouvre le produit, l'inverse et le quotient.
 * Elle ne rejoue donc ni le sens de la fraction, ni la graduation, ni la
 * simplification, qui sont supposés acquis et diagnostiqués au module 0.
 *
 * PÉRIMÈTRE — hors sujet ici : les identités remarquables avec des fractions
 * (exclusion officielle du niveau, objet de la 3e), les puissances de
 * fractions (objet `puissances`), les fractions littérales (objet
 * `calcul_litteral`). La garde est EXÉCUTABLE : le noyau
 * `components/rationnels4e.js` n'expose aucune de ces fonctions, et
 * `verifierPerimetre` lève sur une donnée hors niveau.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/nombres-rationnels-4e';

export const LESSON_CONFIG = {
  id: 'nombres-rationnels-4e',
  sequentialUnlock: true,
  title: 'Nombres rationnels',
  description:
    "Fabriquer des égalités de fractions et découvrir que les produits en croix décident à eux seuls, puis additionner et soustraire des dénominateurs quelconques, multiplier, reconnaître l'inverse d'un nombre et diviser en multipliant par cet inverse.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🍰',
  estimatedDurationMin: 80,
  skills: [
    'Reconnaître un nombre rationnel comme quotient de deux entiers relatifs',
    "Tester l'égalité de deux fractions par les produits en croix",
    'Additionner deux fractions de dénominateurs quelconques',
    'Soustraire deux fractions de dénominateurs quelconques',
    'Multiplier deux fractions',
    "Déterminer l'inverse d'un nombre non nul",
    'Diviser par une fraction en multipliant par son inverse',
    'Résoudre un problème mettant en jeu des rationnels',
  ],
  teachingScope: {
    include: [
      'Le nombre rationnel comme quotient de deux entiers relatifs',
      'L’égalité de deux fractions, testée par les produits en croix',
      'Le dénominateur commun, fabriqué et non donné',
      'Addition et soustraction de fractions de dénominateurs quelconques',
      'Multiplication de deux fractions',
      'L’inverse d’un nombre non nul, et le cas de zéro',
      'La division par une fraction, ramenée à une multiplication',
      'Des problèmes mêlant plusieurs opérations sur les rationnels',
    ],
    exclude: [
      'Les identités remarquables avec des fractions (exclusion officielle du niveau)',
      'Le sens de la fraction, la graduation et la simplification (acquis de 5e)',
      'Les puissances de fractions (objet officiel « Puissances »)',
      'Les fractions littérales (objet officiel « Calcul littéral »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : tout vient de « Nombres rationnels » et « Nombres
  // relatifs » de 5e, et le module 0 les diagnostique.
  priorKnowledge: [
    'fraction-nombre', 'fractions-egales', 'simplifier', 'comparer-fractions',
    'additionner-fractions', 'nombre-relatif', 'regle-des-signes',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-croix-qui-tranche', path: `${LESSON_BASE_PATH}/la-croix-qui-tranche`,
      title: 'La croix qui tranche', desc: 'Fabrique des égalités de fractions — et regarde deux produits décider à ta place.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Fabriquer une égalité',
    },
    {
      id: '02', number: 2, slug: 'un-quotient-d-entiers', path: `${LESSON_BASE_PATH}/un-quotient-d-entiers`,
      title: 'Un quotient d’entiers', desc: 'Le nombre rationnel, enfin nommé — et le signe qui trouve sa place.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P1', '4e_nombres-rationnels-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Nommer le nombre',
    },
    {
      id: '03', number: 3, slug: 'fabriquer-la-graduation', path: `${LESSON_BASE_PATH}/fabriquer-la-graduation`,
      title: 'Fabriquer la graduation', desc: 'Quand aucun dénominateur ne va, il faut en construire un — additionne et soustrais.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P3', '4e_nombres-rationnels-4e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Fabriquer le dénominateur',
    },
    {
      id: '04', number: 4, slug: 'multiplier', path: `${LESSON_BASE_PATH}/multiplier`,
      title: 'Multiplier', desc: 'Prendre une part d’une part : le produit se lit directement sur le quadrillage.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Multiplier',
    },
    {
      id: '05', number: 5, slug: 'l-inverse-et-la-division', path: `${LESSON_BASE_PATH}/l-inverse-et-la-division`,
      title: 'L’inverse et la division', desc: 'Le nombre qui ramène à 1 — et pourquoi diviser revient à le multiplier.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P6', '4e_nombres-rationnels-4e_P7'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Trouver l’inverse',
    },
    {
      id: '06', number: 6, slug: 'la-recette-et-le-chantier', path: `${LESSON_BASE_PATH}/la-recette-et-le-chantier`,
      title: 'La recette et le chantier', desc: 'Deux problèmes où il faut choisir l’opération avant de calculer.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_nombres-rationnels-4e_P8', '4e_nombres-rationnels-4e_P3', '4e_nombres-rationnels-4e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-croix', path: `${LESSON_BASE_PATH}/mission-finale-la-croix`,
      title: '🏆 Mission finale : la croix', desc: 'Dix épreuves pour prouver que tu maîtrises les nombres rationnels.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
