/**
 * Loi des grands nombres — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 9 LPs (clé catalogue
 * 'seconde_loi_des_grands_nombres', append-only) :
 *
 *   seconde_loi-grands-nombres-2nde_P1   Simuler une expérience aléatoire
 *   seconde_loi-grands-nombres-2nde_P2   Répéter une expérience indépendante
 *   seconde_loi-grands-nombres-2nde_P3   Calculer une fréquence observée
 *   seconde_loi-grands-nombres-2nde_P4   Observer la fluctuation des fréquences
 *   seconde_loi-grands-nombres-2nde_P5   Observer la stabilisation des fréquences
 *   seconde_loi-grands-nombres-2nde_P6   Comprendre le lien entre fréquence et probabilité
 *   seconde_loi-grands-nombres-2nde_P7   Distinguer modèle probabiliste et situation réelle
 *   seconde_loi-grands-nombres-2nde_P8   Comprendre qu'une équiprobabilité est une hypothèse
 *   seconde_loi-grands-nombres-2nde_P9   Utiliser une simulation Python ou tableur
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : la fréquence observée
 * FLUCTUE — beaucoup sur peu de répétitions, de moins en moins quand on en
 * fait davantage. Elle ne « tend » pas vers la probabilité comme un objet
 * qui tombe : l'écart possible se resserre. Les deux malentendus visés sont
 * la « loi des séries » (après cinq piles, face serait plus probable) et
 * l'idée qu'un écart en EFFECTIF devrait se réduire — c'est l'écart en
 * FRÉQUENCE qui se réduit, l'écart brut, lui, grandit.
 *
 * Situation portée : un dé et une pièce que l'élève lance RÉELLEMENT
 * (mulberry32, common/stats/randomUtils) — jamais une courbe préenregistrée.
 * Deux séries lancées avec le même réglage ne donnent pas le même dessin,
 * et c'est le cœur de la leçon.
 *
 * PÉRIMÈTRE : la probabilité conditionnelle, l'arbre pondéré et les tests
 * appartiennent aux trois leçons suivantes. Ici on ne conditionne rien : on
 * répète, on observe, on relie fréquence et probabilité.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde';

export const LESSON_CONFIG = {
  id: 'loi-grands-nombres-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes venues du
  // collège et toutes diagnostiquées par le module 0 :
  //   — le vocabulaire du hasard de 3e : issue et événement, dé équilibré /
  //     issues équiprobables, probabilité d'un événement. La 2nde n'invente
  //     rien de tout cela : elle interroge le STATUT de l'équiprobabilité
  //     (module 4), pas le mot ;
  //   — la fréquence de 3e et l'effectif qu'on lui rapporte, ainsi que le
  //     quotient (6e) et le pourcentage (5e) qui l'écrivent ;
  //   — la face d'un solide (6e), qui sert seulement à décrire le dé ;
  //   — l'arrondi (6e), demandé au module 5 pour lire un résultat de
  //     simulation à une décimale donnée.
  // La leçon enseigne le reste : simulation et répétitions indépendantes,
  // fluctuation d'échantillonnage, loi des grands nombres et ses deux
  // contre-sens, modèle confronté aux données, lecture d'un script. Deux
  // notions déjà croisées ailleurs sont RE-POSÉES au point d'emploi par une
  // brique plutôt que supposées : « expérience aléatoire » au module 1, la
  // « boucle » d'un programme (6e) au module 5.
  priorKnowledge: [
    'issue-evenement', 'equiprobable', 'probabilite',
    'frequence', 'effectif', 'quotient', 'pourcentage', 'face-solide', 'arrondi',
  ],
  knowledgeAudit: {
    ignore: [
      // « a tendance à grandir » (M03, distracteur de la boss e6) et « la
      // tendance d'ensemble » (GapExplorer) emploient « tendance » au sens
      // courant — une direction qu'on observe dans une série de nombres —
      // jamais au sens 3e de « tendance d'un nuage de points » (droite qui
      // résume un nuage). Aucune question de cette leçon ne demande de
      // tracer ou lire une tendance de nuage de points.
      { term: 'tendance', reason: 'emploi courant (« a tendance à ») pour décrire l’écart en nombre, hors périmètre du sens 3e (tendance d’un nuage de points)' },
    ],
  },
  title: 'Loi des grands nombres',
  description:
    "Lancer soi-même dix fois, puis cent, puis dix mille : voir la fréquence sauter dans tous les sens au début, puis se resserrer autour de la probabilité sans jamais s'y poser exactement. Comprendre ce que la loi promet — et ce qu'elle ne promet pas.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎲',
  estimatedDurationMin: 72,
  skills: [
    'Simuler une expérience aléatoire et la répéter un grand nombre de fois',
    'Calculer une fréquence observée et la comparer à la probabilité du modèle',
    'Décrire la fluctuation d’échantillonnage et sa diminution avec n',
    'Énoncer la loi des grands nombres et repérer ce qu’elle ne dit pas',
    'Distinguer le modèle probabiliste de la situation réelle qu’il représente',
  ],
  teachingScope: {
    include: [
      'Expérience aléatoire, issue, répétitions indépendantes, simulation',
      'Fréquence observée f = nombre de succès ÷ nombre de répétitions',
      'Fluctuation d’échantillonnage : deux séries de même taille diffèrent',
      'Loi des grands nombres : la fréquence se stabilise autour de p quand n grandit',
      'Équiprobabilité comme HYPOTHÈSE du modèle, confrontable aux données',
      'Lecture d’un script Python / d’une formule tableur de simulation',
    ],
    exclude: [
      'Probabilité conditionnelle et notation P_A(B) (leçon « Probabilités conditionnelles »)',
      'Arbre pondéré et expériences à deux étapes (leçon « Arbres de probabilités »)',
      'Intervalle de fluctuation, loi binomiale, écart-type d’une fréquence (première)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les probabilités et les fréquences.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'lance-et-regarde', path: `${LESSON_BASE_PATH}/lance-et-regarde`, title: 'Lance, et regarde la fréquence bouger', desc: 'Dix lancers, puis dix mille. La fréquence saute, puis se calme. À toi de le provoquer.', stage: 'trigger', teachesLearningPointIds: ['seconde_loi-grands-nombres-2nde_P1', 'seconde_loi-grands-nombres-2nde_P3'], color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Lancer la série' },
    { id: '02', number: 2, slug: 'deux-series-jamais-pareilles', path: `${LESSON_BASE_PATH}/deux-series-jamais-pareilles`, title: 'Deux séries jamais pareilles', desc: 'Même réglage, même nombre de lancers, résultats différents : la fluctuation d’échantillonnage.', stage: 'discovery', teachesLearningPointIds: ['seconde_loi-grands-nombres-2nde_P2', 'seconde_loi-grands-nombres-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Comparer les séries' },
    { id: '03', number: 3, slug: 'ce-que-la-loi-dit-vraiment', path: `${LESSON_BASE_PATH}/ce-que-la-loi-dit-vraiment`, title: 'Ce que la loi dit vraiment', desc: 'La fréquence se resserre — mais l’écart en nombre de lancers, lui, grandit. Et le dé n’a pas de mémoire.', stage: 'formalization', teachesLearningPointIds: ['seconde_loi-grands-nombres-2nde_P5', 'seconde_loi-grands-nombres-2nde_P6'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Mettre à l’épreuve' },
    { id: '04', number: 4, slug: 'le-modele-est-il-bon', path: `${LESSON_BASE_PATH}/le-modele-est-il-bon`, title: 'Le modèle est-il bon ?', desc: 'Un dé pipé se cache parmi des dés équilibrés. Seules les grandes séries le trahissent.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_loi-grands-nombres-2nde_P7', 'seconde_loi-grands-nombres-2nde_P8'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Démasquer le dé' },
    { id: '05', number: 5, slug: 'simuler-en-python', path: `${LESSON_BASE_PATH}/simuler-en-python`, title: 'Simuler avec un programme', desc: 'Lire un script de simulation et prévoir ce qu’il affiche — sans l’exécuter.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_loi-grands-nombres-2nde_P9', 'seconde_loi-grands-nombres-2nde_P1'], color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Lire le script' },
    { id: '06', number: 6, slug: 'mission-finale-le-grand-nombre', path: `${LESSON_BASE_PATH}/mission-finale-le-grand-nombre`, title: '🏆 Mission finale : le grand nombre', desc: 'Dix épreuves pour prouver que tu ne confonds plus hasard et régularité.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
