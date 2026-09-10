/**
 * Boîtes à moustaches — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 9 LPs (clé catalogue
 * 'seconde_boites_a_moustaches', append-only) :
 *
 *   seconde_boites-a-moustaches-2nde_P1  Lire une boîte à moustaches
 *   seconde_boites-a-moustaches-2nde_P2  Identifier médiane et quartiles
 *   seconde_boites-a-moustaches-2nde_P3  Identifier l'étendue
 *   seconde_boites-a-moustaches-2nde_P4  Comprendre la dispersion
 *   seconde_boites-a-moustaches-2nde_P5  Comparer deux distributions
 *   seconde_boites-a-moustaches-2nde_P6  Comparer des médianes
 *   seconde_boites-a-moustaches-2nde_P7  Comparer des dispersions
 *   seconde_boites-a-moustaches-2nde_P8  Choisir des indicateurs adaptés
 *   seconde_boites-a-moustaches-2nde_P9  Interpréter une boîte à moustaches dans son contexte
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : cinq nombres suffisent à
 * dessiner la silhouette d'une série, et cette silhouette rend la COMPARAISON
 * de plusieurs séries immédiate — ce qu'aucune liste de valeurs ne permet.
 * Chaque zone de la boîte contient environ un quart de l'effectif : une zone
 * LARGE signifie des valeurs étalées, pas plus nombreuses.
 *
 * Situation portée : LES TEMPÉRATURES DE MIDI de trois villes sur un mois
 * (30 relevés chacune). Elle ouvre la leçon (M1) et sert de fil partout.
 *
 * PÉRIMÈTRE : suppose acquis médiane, quartiles et écart interquartile
 * (leçon « Statistiques à une variable », où ils sont calculés). Ici on les
 * DESSINE et on s'en sert pour comparer. La convention des « valeurs
 * aberrantes » (moustaches à 1,5 × IQ) est hors programme de 2nde : les
 * moustaches vont au minimum et au maximum.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/boites-a-moustaches-2nde';

export const LESSON_CONFIG = {
  id: 'boites-a-moustaches-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes
  // diagnostiquées par le module 0 :
  //   — la série statistique et son effectif (3e), qu'on compte ici avant de
  //     le découper en quarts ; ranger les valeurs (6e) précède tout rang ;
  //   — médiane (3e), quartiles et écart interquartile (leçon 2nde
  //     « Statistiques à une variable ») : ici on les DESSINE, on ne les
  //     calcule plus ;
  //   — étendue, dispersion et la notion d'indicateur statistique (3e) ;
  //   — la moyenne (6e), dont la leçon a besoin comme CONTRE-EXEMPLE : elle ne
  //     fait pas partie du résumé des cinq nombres.
  // La leçon enseigne le reste : le résumé des cinq nombres, la construction
  // de la boîte, le quart d'effectif par zone, la lecture de l'étendue et de
  // l'écart interquartile SUR la figure, l'axe commun et le choix d'indicateur.
  priorKnowledge: [
    'serie-statistique', 'effectif', 'ordre-nombres',
    // `quartile` a QUITTÉ priorKnowledge : aucune leçon de collège ne
    // l'enseigne (le programme officiel de 3e l'inclut, mais statistiques-3e
    // s'en exclut — trou vertical noté au Tier C de l'audit). La 2de le pose
    // donc elle-même, brique `quartile-rang` au module 1, en variant="rappel"
    // pour rester honnête sur son statut : c'est un dû du collège.
    'mediane-stat',
    'etendue', 'dispersion', 'indicateur-stat',
    'moyenne',
  ],
  title: 'Boîtes à moustaches',
  description:
    "Réduire une série de trente relevés à cinq nombres, les poser un par un jusqu'à voir la boîte se construire, puis empiler trois villes sur un même axe pour comparer d'un coup d'œil ce qu'aucune liste de valeurs ne laissait voir : le centre, l'étalement, et la part de l'effectif que couvre chaque zone.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📦',
  estimatedDurationMin: 65,
  skills: [
    'Déterminer le résumé des cinq nombres d’une série',
    'Construire une boîte à moustaches et savoir ce que chaque zone représente',
    'Lire une boîte : médiane, quartiles, étendue, écart interquartile',
    'Comparer deux ou trois distributions sur un axe commun',
    'Choisir l’indicateur adapté à la question posée et interpréter en contexte',
  ],
  teachingScope: {
    include: [
      'Résumé des cinq nombres : minimum, Q1, médiane, Q3, maximum',
      'Construction de la boîte : rectangle de Q1 à Q3, trait de la médiane, moustaches jusqu’aux extrêmes',
      'Chaque zone contient environ 25 % de l’effectif ; une zone large = valeurs étalées, pas plus nombreuses',
      'Lecture de l’étendue (max − min) et de l’écart interquartile (Q3 − Q1) sur la boîte',
      'Comparaison de plusieurs séries sur un AXE COMMUN : position (médianes) et dispersion (boîtes, moustaches)',
    ],
    exclude: [
      'Calcul des quartiles et de la médiane, conventions de rang (leçon « Statistiques à une variable »)',
      'Moustaches à 1,5 × écart interquartile et valeurs aberrantes (hors programme de 2nde)',
      'Histogramme et fréquences cumulées (leçon « Séries regroupées en classes »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur la médiane, les quartiles et l’étendue.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'cinq-nombres-suffisent', path: `${LESSON_BASE_PATH}/cinq-nombres-suffisent`, title: 'Cinq nombres suffisent', desc: 'Trente températures. Révèle-les une à une : minimum, maximum, médiane, Q1, Q3 — et regarde la boîte se dessiner toute seule.', stage: 'trigger', teachesLearningPointIds: ['seconde_boites-a-moustaches-2nde_P1', 'seconde_boites-a-moustaches-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Révéler les cinq nombres' },
    { id: '02', number: 2, slug: 'ce-que-chaque-zone-raconte', path: `${LESSON_BASE_PATH}/ce-que-chaque-zone-raconte`, title: 'Ce que chaque zone raconte', desc: 'Quatre zones, un quart de l’effectif chacune. Une zone large ne contient pas plus de monde — elle est plus étalée.', stage: 'discovery', teachesLearningPointIds: ['seconde_boites-a-moustaches-2nde_P3', 'seconde_boites-a-moustaches-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Explorer les zones' },
    { id: '03', number: 3, slug: 'trois-villes-un-axe', path: `${LESSON_BASE_PATH}/trois-villes-un-axe`, title: 'Trois villes, un axe', desc: 'Empile les boîtes sur la même échelle : la comparaison devient immédiate — à condition que l’axe soit commun.', stage: 'discovery', teachesLearningPointIds: ['seconde_boites-a-moustaches-2nde_P5', 'seconde_boites-a-moustaches-2nde_P6', 'seconde_boites-a-moustaches-2nde_P7'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Comparer' },
    { id: '04', number: 4, slug: 'choisir-le-bon-indicateur', path: `${LESSON_BASE_PATH}/choisir-le-bon-indicateur`, title: 'Choisir le bon indicateur', desc: 'Selon la question — « où fait-il le plus chaud ? », « où est-ce le plus régulier ? » — ce n’est pas le même nombre qui répond.', stage: 'manipulation', teachesLearningPointIds: ['seconde_boites-a-moustaches-2nde_P8', 'seconde_boites-a-moustaches-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Choisir' },
    { id: '05', number: 5, slug: 'atelier-lire-des-boites', path: `${LESSON_BASE_PATH}/atelier-lire-des-boites`, title: 'Atelier : lire des boîtes', desc: 'Salaires, temps de réponse, notes : quatre boîtes à interpréter, et un piège classique à éviter.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_boites-a-moustaches-2nde_P1', 'seconde_boites-a-moustaches-2nde_P9', 'seconde_boites-a-moustaches-2nde_P5'], color: 'rose', style: 'featured', estimatedMin: 7, difficulty: 4, actionText: 'Interpréter' },
    { id: '06', number: 6, slug: 'mission-finale-les-cinq-nombres', path: `${LESSON_BASE_PATH}/mission-finale-les-cinq-nombres`, title: '🏆 Mission finale : les cinq nombres', desc: 'Dix épreuves pour prouver que tu lis et compares des boîtes sans te tromper.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
