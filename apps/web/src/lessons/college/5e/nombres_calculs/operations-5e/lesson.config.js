/**
 * Opérations — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `operations` du domaine « Nombres et calculs », applicable à la 5e à
 * la rentrée 2026-2027. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '5e_operations', append-only) :
 *
 *   5e_operations-5e_P1  Calculer mentalement sur des nombres décimaux
 *   5e_operations-5e_P2  Calculer en ligne en décomposant un calcul
 *   5e_operations-5e_P3  Diviser par un nombre décimal
 *   5e_operations-5e_P4  Appliquer les priorités opératoires avec parenthèses
 *   5e_operations-5e_P5  Enchaîner plusieurs opérations dans un même calcul
 *   5e_operations-5e_P6  Reconnaître un multiple et un diviseur
 *   5e_operations-5e_P7  Contrôler la vraisemblance d'un résultat
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un calcul n'est pas une phrase
 * qu'on lit de gauche à droite — il a une STRUCTURE. Les parenthèses la
 * désignent explicitement ; en leur absence, une convention la fixe (× et ÷
 * avant + et −). Savoir DIRE la structure d'un calcul (« une somme de deux
 * produits ») précède et gouverne le fait de le calculer.
 *
 * Fil narratif : le calcul qu'on lit de deux façons. Il ouvre la leçon avec
 * deux caisses qui n'affichent pas le même total (M1), revient en fil de
 * contrôle dans chaque module, et se referme sur la note du traiteur (M7).
 *
 * PLACE DANS LA FAMILLE « Calcul & Nombres » de 5e. Cette leçon est la
 * PREMIÈRE des trois : elle installe la structure d'un calcul et la division
 * exacte, dont « Nombres relatifs » puis « Nombres rationnels » héritent. Les
 * fractions et les relatifs n'apparaissent donc jamais ici — c'est le
 * `teachingScope.exclude` de l'objet officiel, et c'est aussi ce qui laisse à
 * chacune des deux autres leçons sa propre découverte.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : les nombres relatifs dans les
 * enchaînements et les fractions dans les priorités opératoires (exclus par
 * l'objet officiel) ; la distributivité écrite avec des lettres et la
 * factorisation (objets de 4e) ; le PGCD et les nombres premiers (3e).
 */
export const LESSON_BASE_PATH = '/courses/college/5e/nombres_calculs/operations-5e';

export const LESSON_CONFIG = {
  id: 'operations-5e',
  sequentialUnlock: true,
  title: 'Opérations',
  description:
    "Découvrir qu’un même calcul peut se lire de deux façons, poser des parenthèses et voir le total changer, adopter la convention des priorités, enchaîner plusieurs opérations, apprendre à découper un calcul pour le faire de tête, ramener une division par un décimal à une division connue, et reconnaître multiples et diviseurs.",
  level: 'college',
  grade: '5e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 70,
  skills: [
    'Calculer mentalement sur des nombres décimaux',
    'Calculer en ligne en décomposant un calcul',
    'Diviser par un nombre décimal',
    'Appliquer les priorités opératoires avec parenthèses',
    'Enchaîner plusieurs opérations dans un même calcul',
    'Reconnaître un multiple et un diviseur',
    "Contrôler la vraisemblance d'un résultat",
  ],
  teachingScope: {
    include: [
      'Un calcul a une structure : les parenthèses la désignent',
      'La convention des priorités : × et ÷ avant + et −',
      "Enchaîner plusieurs opérations dans un même calcul",
      'Découper un calcul pour le faire de tête (calcul en ligne)',
      'Diviser par un nombre décimal en se ramenant à un diviseur entier',
      'Multiples, diviseurs et critères de divisibilité (2, 3, 5, 9, 10)',
      "Contrôler un résultat par son ordre de grandeur",
    ],
    exclude: [
      'Les nombres relatifs dans les enchaînements (objet officiel « Nombres relatifs »)',
      'Les fractions dans les priorités opératoires (objet officiel « Nombres rationnels »)',
      'La distributivité écrite avec des lettres et la factorisation (4e)',
      'Le PGCD, le PPCM et les nombres premiers (3e)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes venues de la 6e et toutes diagnostiquées par le
  // module 0 : le sens des quatre opérations, les tables, la valeur des
  // chiffres après la virgule, le quotient et le décalage de la virgule.
  priorKnowledge: [
    'calcul-numerique', 'tables-multiplication', 'valeur-position', 'quotient', 'decalage-virgule',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'les-deux-caisses', path: `${LESSON_BASE_PATH}/les-deux-caisses`,
      title: 'Les deux caisses', desc: 'Le même ticket, deux totaux différents. Pose des parenthèses et vois le résultat changer.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_operations-5e_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Poser les parenthèses',
    },
    {
      id: '02', number: 2, slug: 'l-ordre-cache', path: `${LESSON_BASE_PATH}/l-ordre-cache`,
      title: 'L’ordre caché', desc: 'Sans parenthèses, une seule lecture est la bonne — et ce n’est pas un caprice.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_operations-5e_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Trouver la convention',
    },
    {
      id: '03', number: 3, slug: 'multiples-et-diviseurs', path: `${LESSON_BASE_PATH}/multiples-et-diviseurs`,
      title: 'Multiples et diviseurs', desc: 'Range des carreaux en rectangle : les largeurs qui marchent ont un nom.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_operations-5e_P6'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Ranger les carreaux',
    },
    {
      id: '04', number: 4, slug: 'enchainer-les-operations', path: `${LESSON_BASE_PATH}/enchainer-les-operations`,
      title: 'Enchaîner les opérations', desc: 'Trois, quatre opérations dans un même calcul : choisis l’ordre, et regarde ce que ça change.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_operations-5e_P5', '5e_operations-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Enchaîner',
    },
    {
      id: '05', number: 5, slug: 'le-calcul-malin', path: `${LESSON_BASE_PATH}/le-calcul-malin`,
      title: 'Le calcul malin', desc: 'Découpe un calcul difficile en morceaux faciles — et fais-le de tête.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_operations-5e_P2', '5e_operations-5e_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découper',
    },
    {
      id: '06', number: 6, slug: 'diviser-par-un-decimal', path: `${LESSON_BASE_PATH}/diviser-par-un-decimal`,
      title: 'Diviser par un décimal', desc: 'Multiplie les deux nombres par 10 : le quotient ne bouge pas, et la virgule disparaît.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_operations-5e_P3', '5e_operations-5e_P1'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Diviser',
    },
    {
      id: '07', number: 7, slug: 'la-note-du-traiteur', path: `${LESSON_BASE_PATH}/la-note-du-traiteur`,
      title: 'La note du traiteur', desc: 'Une vraie commande à vérifier : structure, ordre de grandeur, virgule mal placée.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_operations-5e_P7', '5e_operations-5e_P5', '5e_operations-5e_P1'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Vérifier la note',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-calcul-juste', path: `${LESSON_BASE_PATH}/mission-finale-le-calcul-juste`,
      title: '🏆 Mission finale : le calcul juste', desc: 'Dix épreuves pour prouver que tu lis un calcul avant de le faire.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
