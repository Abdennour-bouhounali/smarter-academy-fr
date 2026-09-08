/**
 * Nombres rationnels — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `nombres_rationnels` du domaine « Nombres et calculs », applicable à
 * la 5e à la rentrée 2026-2027. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '5e_nombres_rationnels', append-only) :
 *
 *   5e_nombres-rationnels-5e_P1  Reconnaître une fraction comme un nombre et la placer sur une droite
 *   5e_nombres-rationnels-5e_P2  Produire des fractions égales en multipliant ou divisant les deux termes
 *   5e_nombres-rationnels-5e_P3  Simplifier une fraction
 *   5e_nombres-rationnels-5e_P4  Comparer des fractions de même dénominateur ou de dénominateurs multiples
 *   5e_nombres-rationnels-5e_P5  Additionner deux fractions de dénominateurs multiples
 *   5e_nombres-rationnels-5e_P6  Soustraire deux fractions de dénominateurs multiples
 *   5e_nombres-rationnels-5e_P7  Prendre une fraction d'une quantité
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une fraction est un NOMBRE. Pas
 * un dessin de parts, pas une division en attente, pas « deux nombres » — UNE
 * POSITION sur la droite graduée, aussi légitime que celle d'un entier. Tout
 * le reste en découle : deux écritures qui désignent la même position sont
 * égales ; comparer, c'est regarder qui est le plus à droite ; additionner
 * n'est possible qu'une fois les deux nombres portés sur la MÊME graduation.
 *
 * Fil narratif : la graduation qu'on fabrique. La leçon ouvre sur une règle où
 * seuls les entiers sont marqués et où il faut pourtant placer 3/4 (M1) ; la
 * graduation choisie devient le fil de toute la suite, jusqu'à la recette du
 * module 6, où « prendre les trois quarts » est un partage bien réel.
 *
 * PLACE DANS LA FAMILLE « Calcul & Nombres » de 5e. Cette leçon est la
 * TROISIÈME et dernière. Elle hérite d'« Opérations » la division exacte et
 * les multiples — dont dépend tout le travail sur les dénominateurs multiples
 * — et de « Nombres relatifs » l'idée qu'un nombre est une POSITION sur un
 * axe, qu'elle applique ici à un nombre non entier. Les deux leçons
 * précédentes sont donc réutilisées, jamais refaites.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : additionner des fractions de
 * dénominateurs QUELCONQUES, multiplier ou diviser des fractions, manipuler
 * des rationnels relatifs (les trois exclusions de l'objet officiel, toutes de
 * 4e). Ces frontières ne sont pas que documentaires : components/rationnels.js
 * LÈVE plutôt que de produire un tel calcul, et le test le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/nombres_calculs/nombres-rationnels-5e';

export const LESSON_CONFIG = {
  id: 'nombres-rationnels-5e',
  sequentialUnlock: true,
  title: 'Nombres rationnels',
  description:
    "Fabriquer soi-même la graduation qui manque pour placer une fraction sur une droite, découvrir que deux écritures différentes tombent au même endroit, produire et simplifier des fractions égales, comparer, puis additionner et soustraire en amenant les deux nombres sur une graduation commune — et enfin prendre une fraction d’une quantité.",
  level: 'college',
  grade: '5e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🍰',
  estimatedDurationMin: 75,
  skills: [
    'Reconnaître une fraction comme un nombre et la placer sur une droite',
    'Produire des fractions égales en multipliant ou divisant les deux termes',
    'Simplifier une fraction',
    'Comparer des fractions de même dénominateur ou de dénominateurs multiples',
    'Additionner deux fractions de dénominateurs multiples',
    'Soustraire deux fractions de dénominateurs multiples',
    "Prendre une fraction d'une quantité",
  ],
  teachingScope: {
    include: [
      'La fraction est un nombre : une position sur la droite graduée',
      'Deux écritures peuvent désigner le même nombre (fractions égales)',
      'Produire une fraction égale en multipliant les deux termes',
      'Simplifier en divisant les deux termes',
      'Comparer à même dénominateur, puis à dénominateurs multiples',
      'Additionner et soustraire sur une graduation commune (dénominateurs multiples)',
      "Prendre une fraction d'une quantité",
    ],
    exclude: [
      'Additionner des fractions de dénominateurs quelconques (4e)',
      'Multiplier et diviser des fractions (4e)',
      'Les nombres rationnels relatifs (4e)',
      'Le PGCD et la fraction irréductible (3e)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  knowledgeAudit: {
    ignore: [
      // Test final, épreuve 7 : « Range dans l'ordre croissant » est le
      // rangement de nombres de la 6e — le scanner du lexique y voit le terme
      // « croissante » des VARIATIONS d'une fonction (2nde), qui n'a rien à
      // voir. Même faux positif, même traitement que nombres-relatifs-5e.
      { term: 'variations', reason: "« ordre croissant » — rangement de nombres, pas les variations d'une fonction" },
    ],
  },
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes diagnostiquées par le module 0 : le sens du
  // numérateur et du dénominateur, la fraction simple d'une quantité et la
  // demi-droite graduée (6e), plus les multiples et diviseurs, acquis dans la
  // leçon « Opérations » de cette même famille de 5e.
  priorKnowledge: [
    'numerateur', 'denominateur', 'fraction-decimale', 'quotient', 'tables-multiplication',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-graduation-manquante', path: `${LESSON_BASE_PATH}/la-graduation-manquante`,
      title: 'La graduation manquante', desc: 'Place 3/4 sur une règle qui ne connaît que les entiers. À toi de fabriquer les marques.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Fabriquer la graduation',
    },
    {
      id: '02', number: 2, slug: 'deux-ecritures-un-nombre', path: `${LESSON_BASE_PATH}/deux-ecritures-un-nombre`,
      title: 'Deux écritures, un seul nombre', desc: 'Coupe chaque part en deux : il y a deux fois plus de parts, et pourtant rien n’a bougé.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Multiplier les deux termes',
    },
    {
      id: '03', number: 3, slug: 'remonter-la-machine', path: `${LESSON_BASE_PATH}/remonter-la-machine`,
      title: 'Remonter la machine', desc: 'Le geste inverse : regrouper les parts pour trouver l’écriture la plus simple.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Simplifier',
    },
    {
      id: '04', number: 4, slug: 'qui-est-le-plus-grand', path: `${LESSON_BASE_PATH}/qui-est-le-plus-grand`,
      title: 'Qui est le plus grand ?', desc: 'Comparer, c’est regarder qui est le plus à droite — encore faut-il la même graduation.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Comparer',
    },
    {
      id: '05', number: 5, slug: 'ajouter-des-parts', path: `${LESSON_BASE_PATH}/ajouter-des-parts`,
      title: 'Ajouter des parts', desc: 'On ne peut réunir que des parts de même taille. Amène les deux nombres sur la même graduation.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P5', '5e_nombres-rationnels-5e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Additionner',
    },
    {
      id: '06', number: 6, slug: 'la-recette-pour-six', path: `${LESSON_BASE_PATH}/la-recette-pour-six`,
      title: 'La recette pour six', desc: 'Prendre une fraction d’une quantité, sur une vraie recette à adapter.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_nombres-rationnels-5e_P7', '5e_nombres-rationnels-5e_P2'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Adapter la recette',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-bon-nombre', path: `${LESSON_BASE_PATH}/mission-finale-le-bon-nombre`,
      title: '🏆 Mission finale : le bon nombre', desc: 'Dix épreuves pour prouver qu’une fraction est bien un nombre.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
