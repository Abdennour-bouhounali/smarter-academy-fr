/**
 * Calcul littéral — 4e (partie 1 de l'objet officiel `calcul_litteral`).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `calcul_litteral` du domaine « Nombres et calculs », applicable à la
 * 4e à la rentrée 2027-2028. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * POURQUOI DEUX LEÇONS. L'objet officiel porte huit points d'apprentissage,
 * des transformations d'expression jusqu'à la résolution d'équations : les
 * traiter en une seule leçon donnerait ~150 min, très au-delà du plafond de
 * 90 min que `validate-lessons.mjs` fait respecter. Le catalogue déclare donc
 * `4e_calcul_litteral` comme un TABLEAU de deux entrées (le mécanisme prévu
 * par `buildLesson`, partIndex 1 et 2) : « Calcul littéral » transforme les
 * expressions, « Équations du premier degré » s'en sert pour résoudre.
 * La coupure est pédagogique : une équation n'est manipulable que si l'on
 * sait déjà réduire et développer ses deux membres.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 5 LPs de cette leçon
 * (clé catalogue '4e_calcul_litteral', partie 1, append-only) :
 *
 *   4e_calcul-litteral-4e_P1  Réduire une expression littérale
 *   4e_calcul-litteral-4e_P2  Développer avec la distributivité simple
 *   4e_calcul-litteral-4e_P3  Développer avec la double distributivité
 *   4e_calcul-litteral-4e_P4  Factoriser une expression à facteur commun évident
 *   4e_calcul-litteral-4e_P5  Tester si une égalité est vraie pour une valeur
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une expression littérale est
 * un SAC D'OBJETS, et réduire c'est ranger ensemble ce qui est de même
 * nature. 3x + 2x fait 5x parce que trois objets et deux objets du même type
 * font cinq objets ; 3x + 2 ne fait pas 5x parce que ce ne sont pas les mêmes
 * objets. L'élève manipule des tuiles avant qu'aucune règle ne soit écrite —
 * et le bouton « Regrouper » REFUSE, par construction, de réunir des tuiles
 * de natures différentes.
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit le sens de la lettre
 * (une valeur qui peut changer), l'écriture d'une expression à partir d'un
 * motif, la substitution d'une valeur, et la distributivité simple sur des
 * cas numériques. La 4e ne rejoue rien de cela : elle réduit des expressions
 * quelconques, développe des produits (simple puis double), factorise, et
 * teste une égalité.
 *
 * PÉRIMÈTRE — hors sujet ici : les identités remarquables, les inéquations et
 * les équations produit nul, exclusions officielles du niveau (3e). Les
 * équations du premier degré appartiennent à la PARTIE 2 (`equations-4e`) :
 * cette leçon prépare les gestes, elle ne résout rien.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/calcul-litteral-4e';

export const LESSON_CONFIG = {
  id: 'calcul-litteral-4e',
  sequentialUnlock: true,
  title: 'Calcul littéral',
  description:
    "Ranger des tuiles algébriques pour découvrir qu'on ne regroupe que ce qui est de même nature, puis développer un produit en lisant l'aire d'un rectangle, passer à la double distributivité, retrouver le facteur commun pour factoriser, et tester si une égalité tient pour une valeur donnée.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔤',
  estimatedDurationMin: 74,
  skills: [
    'Réduire une expression littérale',
    'Développer avec la distributivité simple',
    'Développer avec la double distributivité',
    'Factoriser une expression à facteur commun évident',
    'Tester si une égalité est vraie pour une valeur',
  ],
  teachingScope: {
    include: [
      'Les termes semblables, et pourquoi eux seuls se regroupent',
      'Réduire une expression du premier degré',
      'La distributivité simple, lue sur l’aire d’un rectangle',
      'La double distributivité, et les quatre produits',
      'La factorisation par un facteur commun évident',
      'Tester une égalité pour une valeur donnée',
    ],
    exclude: [
      'Les identités remarquables (exclusion officielle du niveau)',
      'Les inéquations et les équations produit nul (exclusions officielles)',
      'Le sens de la lettre, l’écriture d’une expression, la substitution (acquis de 5e)',
      'La résolution d’équations (partie 2 de cet objet : leçon « Équations du premier degré »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : tout vient de « Calcul littéral » de 5e et des opérations
  // sur les relatifs de 4e, et le module 0 les diagnostique.
  priorKnowledge: [
    'calcul-litteral', 'inconnue-variable', 'ecrire-expression', 'substituer',
    'distributivite', 'regle-des-signes', 'priorites-operatoires',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'ranger-les-tuiles', path: `${LESSON_BASE_PATH}/ranger-les-tuiles`,
      title: 'Ranger les tuiles', desc: 'Regroupe ce qui va ensemble — et découvre ce qui refuse de se regrouper.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Ranger',
    },
    {
      id: '02', number: 2, slug: 'termes-semblables', path: `${LESSON_BASE_PATH}/termes-semblables`,
      title: 'Termes semblables', desc: 'Le mot qui dit pourquoi certaines tuiles se réunissent et d’autres non.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Réduire',
    },
    {
      id: '03', number: 3, slug: 'l-aire-qui-developpe', path: `${LESSON_BASE_PATH}/l-aire-qui-developpe`,
      title: 'L’aire qui développe', desc: 'Un rectangle, deux façons de calculer son aire — et la distributivité apparaît.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Développer',
    },
    {
      id: '04', number: 4, slug: 'couper-les-deux-cotes', path: `${LESSON_BASE_PATH}/couper-les-deux-cotes`,
      title: 'Couper les deux côtés', desc: 'Quand les deux dimensions sont des sommes : quatre morceaux, quatre produits.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Découper',
    },
    {
      id: '05', number: 5, slug: 'remonter-le-facteur', path: `${LESSON_BASE_PATH}/remonter-le-facteur`,
      title: 'Remonter le facteur', desc: 'Le chemin inverse : reconstituer le rectangle à partir de son aire.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P4'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Factoriser',
    },
    {
      id: '06', number: 6, slug: 'tester-une-egalite', path: `${LESSON_BASE_PATH}/tester-une-egalite`,
      title: 'Tester une égalité', desc: 'Une seule valeur suffit à démolir une égalité — mais jamais à la prouver.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_calcul-litteral-4e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Tester',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-les-tuiles', path: `${LESSON_BASE_PATH}/mission-finale-les-tuiles`,
      title: '🏆 Mission finale : les tuiles', desc: 'Dix épreuves pour prouver que tu maîtrises le calcul littéral.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
