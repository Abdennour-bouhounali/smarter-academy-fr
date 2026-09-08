/**
 * Calcul littéral et algébrique — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `calcul_litteral` du domaine « Nombres et calculs », applicable à la
 * 5e à la rentrée 2026-2027. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '5e_calcul_litteral', append-only) :
 *
 *   5e_calcul-litteral-5e_P1  Comprendre ce qu'une lettre représente dans une expression
 *   5e_calcul-litteral-5e_P2  Utiliser une lettre comme inconnue ou comme variable
 *   5e_calcul-litteral-5e_P3  Produire une expression littérale à partir d'une situation
 *   5e_calcul-litteral-5e_P4  Calculer la valeur d'une expression par substitution
 *   5e_calcul-litteral-5e_P5  Développer un produit avec la distributivité simple
 *   5e_calcul-litteral-5e_P6  Produire une formule générale et l'appliquer
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : quand une régularité se répète,
 * dessiner ou compter chaque cas devient impossible. On écrit alors une RECETTE
 * valable pour tous les cas à la fois — et la lettre est simplement
 * l'emplacement du nombre qu'on ne veut pas fixer. Elle n'est ni une étiquette,
 * ni l'initiale d'un mot : c'est un trou dans un calcul.
 *
 * Fil narratif : le motif qui grandit. L'élève construit les étapes d'un
 * escalier de carreaux, remplit un tableau sans s'en rendre compte, puis on lui
 * demande l'étape 20 — que le laboratoire refuse de dessiner (M1). Ce refus
 * fait naître la formule, qui revient jusqu'au carrelage du module 6.
 *
 * PLACE DANS LA FAMILLE « Puissances & pensée algébrique » de 5e. Cette leçon
 * est la SECONDE des deux, et prolonge exactement le geste de la première :
 * « Puissances » a inventé une écriture courte pour une RÉPÉTITION (le même
 * facteur, n fois) ; celle-ci en invente une pour une RÉGULARITÉ (le même
 * ajout, à chaque étape). Elle hérite aussi d'« Opérations » (5e) la convention
 * des priorités, dont dépend toute lecture d'une expression.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : réduire des expressions
 * complexes, factoriser formellement, développer un produit de deux sommes
 * (double distributivité) et résoudre formellement une équation — les quatre
 * exclusions de l'objet officiel, toutes de 4e ou au-delà. Ces frontières ne
 * sont pas que documentaires : components/litteral.js LÈVE si l'on tente de
 * développer par autre chose qu'un nombre seul, et le test le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/nombres_calculs/calcul-litteral-5e';

export const LESSON_CONFIG = {
  id: 'calcul-litteral-5e',
  sequentialUnlock: true,
  title: 'Calcul littéral et algébrique',
  description:
    "Construire un motif étape par étape jusqu’à ce que dessiner devienne impossible, découvrir qu’une recette écrite une seule fois répond pour tous les cas, comprendre que la lettre est l’emplacement d’un nombre qu’on ne fixe pas, traduire des situations en expressions, remplacer la lettre par un nombre, et lire la distributivité sur l’aire d’un rectangle qu’on coupe.",
  level: 'college',
  grade: '5e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔤',
  estimatedDurationMin: 70,
  skills: [
    "Comprendre ce qu'une lettre représente dans une expression",
    'Utiliser une lettre comme inconnue ou comme variable',
    "Produire une expression littérale à partir d'une situation",
    "Calculer la valeur d'une expression par substitution",
    'Développer un produit avec la distributivité simple',
    "Produire une formule générale et l'appliquer",
  ],
  teachingScope: {
    include: [
      'La lettre comme emplacement du nombre qu’on ne fixe pas',
      'La différence entre une lettre inconnue et une lettre variable',
      'Traduire une situation en expression littérale',
      'Remplacer la lettre par un nombre et calculer',
      'Développer un produit par un nombre (distributivité simple)',
      'Produire une formule générale et l’appliquer à un grand cas',
    ],
    exclude: [
      "Réduire des expressions complexes (4e)",
      'Factoriser formellement (4e)',
      'La double distributivité (a + b)(c + d) (4e)',
      'Résoudre formellement une équation (4e)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes diagnostiquées par le module 0 : les tables et le
  // calcul numérique (6e), le périmètre (6e), et les priorités opératoires,
  // acquises dans la leçon « Opérations » de 5e.
  priorKnowledge: [
    'calcul-numerique', 'tables-multiplication', 'perimetre', 'quotient',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-motif-qui-grandit', path: `${LESSON_BASE_PATH}/le-motif-qui-grandit`,
      title: 'Le motif qui grandit', desc: 'Construis les étapes une à une — puis trouve l’étape 20 sans la dessiner.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Construire le motif',
    },
    {
      id: '02', number: 2, slug: 'la-lettre-est-un-emplacement', path: `${LESSON_BASE_PATH}/la-lettre-est-un-emplacement`,
      title: 'La lettre est un emplacement', desc: 'Une seule recette, testée sur autant de nombres que tu veux.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P1', '5e_calcul-litteral-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Tester la recette',
    },
    {
      id: '03', number: 3, slug: 'ecrire-la-recette', path: `${LESSON_BASE_PATH}/ecrire-la-recette`,
      title: 'Écrire la recette', desc: 'Traduire une situation en expression — et ne pas confondre somme et produit.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Traduire',
    },
    {
      id: '04', number: 4, slug: 'remplacer-par-un-nombre', path: `${LESSON_BASE_PATH}/remplacer-par-un-nombre`,
      title: 'Remplacer par un nombre', desc: 'La substitution, avec les priorités déjà connues — et le piège du 3n.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Substituer',
    },
    {
      id: '05', number: 5, slug: 'le-rectangle-qu-on-coupe', path: `${LESSON_BASE_PATH}/le-rectangle-qu-on-coupe`,
      title: 'Le rectangle qu’on coupe', desc: 'Couper un rectangle ne change pas son aire — et cela s’écrit.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Développer',
    },
    {
      id: '06', number: 6, slug: 'la-formule-du-carrelage', path: `${LESSON_BASE_PATH}/la-formule-du-carrelage`,
      title: 'La formule du carrelage', desc: 'Produire une formule, la vérifier, et l’appliquer à un très grand cas.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_calcul-litteral-5e_P6', '5e_calcul-litteral-5e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Produire la formule',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-bonne-recette', path: `${LESSON_BASE_PATH}/mission-finale-la-bonne-recette`,
      title: '🏆 Mission finale : la bonne recette', desc: 'Dix épreuves pour prouver qu’une lettre ne fait plus peur.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
