/**
 * Algorithmique et programmation — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026, objet
 * `algorithmique_programmation` du domaine « Pensée informatique », rôle
 * « APPROFONDISSEMENT » dans la chaîne 6e → 5e → 4e → 3e.
 * Clé catalogue `4e_algorithmique_programmation`.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_ALGORITHMIQUE_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * des modules doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon, dérivés
 * de `pointsToLearn` dans coursesData.js (append-only) :
 *
 *   4e_algorithmique-programmation-4e_P1  Lire une instruction conditionnelle « si… alors… sinon »
 *   4e_algorithmique-programmation-4e_P2  Écrire une condition qui teste une valeur
 *   4e_algorithmique-programmation-4e_P3  Prévoir le chemin suivi par un programme selon la valeur testée
 *   4e_algorithmique-programmation-4e_P4  Manipuler une variable qui évolue au cours du programme
 *   4e_algorithmique-programmation-4e_P5  Modifier un programme existant pour changer son résultat
 *   4e_algorithmique-programmation-4e_P6  Tester un programme et corriger son erreur
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un programme ne subit plus sa
 * liste d'ordres du début à la fin. Il CHOISIT son chemin, et il garde une
 * mémoire qui CHANGE. D'où le fait le plus contre-intuitif du niveau : la même
 * instruction, rencontrée deux fois, peut ne pas faire la même chose. Aucun
 * dessin fini ne le montre — il faut arrêter le programme au milieu. C'est
 * pourquoi le geste signature de cette leçon est un PAS À PAS, et non un
 * curseur.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE LA 5e. En 5e, KIWI obéissait : l'instruction
 * portait un nombre, la variable était LUE, la boucle répétait n fois. En 4e,
 * KIWI décide : une instruction peut choisir sa branche, et une variable peut
 * être ÉCRITE. Le moteur est écrit deux fois à deux niveaux (règle §6ter.6,
 * copier-adapter plutôt qu'importer d'un dossier de leçon à l'autre).
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : la boucle « tant que », les
 * conditions composées (ET / OU), la création de blocs ou de fonctions,
 * l'imbrication de structures. La frontière est EXÉCUTABLE :
 * `lessons/common/turtle/trace4e.js` expose un `KINDS` clos qui n'a pas de
 * boucle conditionnelle, `evalTest` ne connaît qu'UNE comparaison, et
 * `makeSi` / `makeRepeat` aplatissent toute imbrication. Un test unitaire
 * échoue si on les élargit.
 *
 * Fil narratif : un programme qu'on regarde au ralenti, puis qui se met à
 * choisir, puis à compter — et qu'il faut enfin réparer.
 */
// Le segment de domaine est l'id OFFICIEL du référentiel
// (`pensee_informatique`, avec un souligné), parce que la carte des cours
// construit le lien de chaque leçon comme
// `/courses/{niveau}/{classe}/{domainId}/{lessonId}` (buildLesson,
// coursesData.js). Un tiret ici ne casse rien de visible : la route existe,
// `check:routes` passe — mais aucune carte ne pointe dessus, et l'élève qui
// clique atterrit sur la page d'accueil.
export const LESSON_BASE_PATH = '/courses/college/4e/pensee_informatique/algorithmique-programmation-4e';

export const LESSON_CONFIG = {
  id: 'algorithmique-programmation-4e',
  sequentialUnlock: true,
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  title: 'Algorithmique et programmation',
  description:
    "Arrêter un programme au milieu pour voir ce qu'il a dans la tête : sa position, son cap et ses variables. Puis lui donner un bloc « si… alors… sinon » qui choisit son chemin, écrire soi-même la condition, faire grandir un compteur, modifier un programme pour atteindre une figure imposée, et réparer trois programmes cassés.",
  level: 'college',
  grade: '4e',
  chapter: 'pensee_informatique',
  chapterTitle: 'Pensée informatique',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '💻',
  estimatedDurationMin: 80,
  skills: [
    'Lire une instruction « si… alors… sinon » et dire quelle branche est prise',
    'Écrire une condition qui teste une valeur, et la vérifier à sa borne',
    'Prévoir le chemin suivi par un programme selon la valeur testée',
    'Suivre une variable qui évolue au cours du programme',
    'Modifier un programme existant pour obtenir un résultat imposé',
    'Tester un programme, trouver la première instruction fautive et la corriger',
  ],
  teachingScope: {
    include: [
      'Conditions (si… alors… sinon)',
      'Manipulation de variables informatiques simples',
      'Modification d’un programme existant',
    ],
    exclude: [
      'Boucles « tant que »',
      'Conditions composées (ET, OU)',
      'Création de blocs ou de fonctions',
      'Imbrication de structures (une boucle dans une boucle, un choix dans un choix)',
    ],
  },
  // CHAÎNE DE CONTINUITÉ : le programme que l'élève règle au module 1 est
  // CELUI dans lequel on glisse un bloc « si » au module 2 — il reconnaît son
  // propre travail à l'instant précis où on lui ajoute le choix. Au-delà, les
  // modules ont besoin de programmes CHOISIS (une condition à écrire, un
  // compteur, trois bugs précis) : y imposer la continuité serait artificiel.
  continuity: { key: 'programme', chain: [1, 2] },
  /**
   * Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
   * module 0 :
   *  - `instruction-programme` et `boucle` : ids du lexique, portés par la 6e.
   *  - `instruction-parametree`, `prevoir-executer`, `variable-informatique`,
   *    `entree-programme`, `formule-programme`, `repeter-n-fois`,
   *    `angle-exterieur`, `deboguer` : les huit connaissances établies par la
   *    leçon `algorithmique-programmation-5e` (son knowledge.jsx en est la
   *    source unique).
   * Le SI, la condition, l'affectation, le compteur et l'exécution pas à pas
   * sont tous établis DANS cette leçon, jamais supposés.
   */
  priorKnowledge: [
    'instruction-programme',
    'boucle',
    'instruction-parametree',
    'prevoir-executer',
    'variable-informatique',
    'entree-programme',
    'formule-programme',
    'repeter-n-fois',
    'angle-exterieur',
    'deboguer',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Six questions — jamais bloquantes — sur ce que la 5e t’a déjà appris.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-programme-au-ralenti', path: `${LESSON_BASE_PATH}/le-programme-au-ralenti`,
      title: 'Le programme au ralenti',
      desc: 'Arrête le programme au milieu : sa position, son cap et ses variables s’affichent.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_algorithmique-programmation-4e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Passer au ralenti',
    },
    {
      id: '02', number: 2, slug: 'le-bloc-qui-choisit', path: `${LESSON_BASE_PATH}/le-bloc-qui-choisit`,
      title: 'Le bloc qui choisit',
      desc: 'Un même programme, deux entrées, deux figures : le programme a pris deux chemins.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '4e_algorithmique-programmation-4e_P1',
        '4e_algorithmique-programmation-4e_P3',
      ],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Voir le choix',
    },
    {
      id: '03', number: 3, slug: 'ecrire-la-condition', path: `${LESSON_BASE_PATH}/ecrire-la-condition`,
      title: 'Écrire la condition',
      desc: 'À toi de composer le test — et de le vérifier là où il est le plus fragile.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '4e_algorithmique-programmation-4e_P2',
        '4e_algorithmique-programmation-4e_P3',
      ],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Composer le test',
    },
    {
      id: '04', number: 4, slug: 'le-compteur-qui-grandit', path: `${LESSON_BASE_PATH}/le-compteur-qui-grandit`,
      title: 'Le compteur qui grandit',
      desc: 'Une variable qu’on écrit à chaque tour : la même instruction ne fait plus la même chose.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_algorithmique-programmation-4e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Suivre le compteur',
    },
    {
      id: '05', number: 5, slug: 'changer-le-resultat', path: `${LESSON_BASE_PATH}/changer-le-resultat`,
      title: 'Changer le résultat',
      desc: 'Un programme donné, une figure imposée : touche au minimum d’instructions.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_algorithmique-programmation-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Modifier',
    },
    {
      id: '06', number: 6, slug: 'le-labo-de-reparation', path: `${LESSON_BASE_PATH}/le-labo-de-reparation`,
      title: 'Le labo de réparation',
      desc: 'Trois programmes cassés, trois causes différentes. Trouve le premier écart, puis répare.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_algorithmique-programmation-4e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Réparer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-latelier-des-choix', path: `${LESSON_BASE_PATH}/mission-finale-latelier-des-choix`,
      title: '🏆 Mission finale : l’atelier des choix',
      desc: 'Dix épreuves pour prouver que tu sais faire choisir et compter un programme.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
