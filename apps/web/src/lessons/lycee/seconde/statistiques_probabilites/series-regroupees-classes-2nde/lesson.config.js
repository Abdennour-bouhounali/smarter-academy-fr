/**
 * Séries regroupées en classes — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 10 LPs (clé catalogue
 * 'seconde_series_regroupees_classes', append-only) :
 *
 *   seconde_series-regroupees-classes-2nde_P1   Comprendre le regroupement en classes
 *   seconde_series-regroupees-classes-2nde_P2   Identifier des classes de même amplitude
 *   seconde_series-regroupees-classes-2nde_P3   Construire un histogramme
 *   seconde_series-regroupees-classes-2nde_P4   Lire un histogramme
 *   seconde_series-regroupees-classes-2nde_P5   Construire un polygone des fréquences cumulées
 *   seconde_series-regroupees-classes-2nde_P6   Calculer une moyenne pondérée
 *   seconde_series-regroupees-classes-2nde_P7   Estimer une moyenne à partir de classes
 *   seconde_series-regroupees-classes-2nde_P8   Déterminer la classe médiane
 *   seconde_series-regroupees-classes-2nde_P9   Estimer une médiane dans une classe
 *   seconde_series-regroupees-classes-2nde_P10  Interpréter une série continue regroupée
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : sur 200 mesures continues, la
 * liste des valeurs est illisible. Regrouper en classes la rend lisible — au
 * prix d'une PERTE D'INFORMATION : on ne connaît plus que « combien dans
 * chaque tranche », d'où des indicateurs ESTIMÉS et non plus exacts.
 *
 * Situation portée : LES 200 TEMPS DE RECHARGE d'une borne électrique
 * (en minutes, valeurs décimales). Elle ouvre la leçon (M1) et revient
 * partout ensuite.
 *
 * PÉRIMÈTRE : suppose acquis moyenne, médiane et quartiles sur série
 * discrète (leçon « Statistiques à une variable »). N'aborde pas la boîte à
 * moustaches (leçon dédiée) ni les classes d'amplitudes inégales au-delà de
 * la mise en garde sur les aires.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/series-regroupees-classes-2nde';

export const LESSON_CONFIG = {
  id: 'series-regroupees-classes-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes venues du
  // collège ou de « Statistiques à une variable », leçon 2nde antérieure de la
  // même progression — et toutes diagnostiquées par le module 0 :
  //   — le vocabulaire d'une série : série statistique, effectif, fréquence,
  //     et le quotient qui fait passer de l'un à l'autre ;
  //   — la moyenne et la moyenne pondérée (3e), sur laquelle la moyenne
  //     estimée par les centres sera calquée ;
  //   — les indicateurs d'une série discrète — moyenne, médiane, étendue —
  //     dont la leçon montre qu'ils deviennent ESTIMÉS une fois regroupés ;
  //   — l'intervalle et ses crochets, notation dans laquelle les classes
  //     seront écrites, et l'arrondi (6e) que les consignes de calcul exigent.
  // La leçon enseigne le reste : le regroupement en classes, l'amplitude et le
  // centre, l'histogramme où l'AIRE porte l'effectif, les fréquences cumulées
  // et leur polygone, la moyenne estimée, la classe médiane et l'interpolation.
  priorKnowledge: [
    'serie-statistique', 'effectif', 'frequence', 'quotient',
    'moyenne', 'moyenne-ponderee',
    'indicateur-stat', 'mediane-stat', 'etendue',
    'intervalle', 'intervalle-crochets', 'arrondi',
  ],
  title: 'Séries regroupées en classes',
  description:
    "Recevoir deux cents temps de recharge tous différents, constater qu'aucun tableau d'effectifs ne les résume, puis découper l'axe en tranches jusqu'à faire apparaître la forme de la distribution — histogramme, fréquences cumulées, et des indicateurs devenus estimés parce que le regroupement a perdu le détail.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 80,
  skills: [
    'Regrouper une série continue en classes et choisir une amplitude adaptée',
    'Construire et lire un histogramme, en sachant que c’est l’aire qui porte l’effectif',
    'Construire et exploiter le polygone des fréquences cumulées croissantes',
    'Estimer une moyenne à partir des centres de classes',
    'Déterminer la classe médiane et estimer la médiane par interpolation',
  ],
  teachingScope: {
    include: [
      'Série continue ; classes [a ; b[ contiguës, la dernière fermée ; amplitude, centre de classe',
      'Effectifs et fréquences par classe ; effectifs et fréquences cumulés croissants',
      'Histogramme : hauteur = effectif/amplitude, l’AIRE représente l’effectif (crucial si amplitudes inégales)',
      'Moyenne ESTIMÉE par les centres de classes ; écart avec la moyenne exacte',
      'Classe médiane (première dont la fréquence cumulée atteint 0,5) ; médiane estimée par interpolation linéaire',
    ],
    exclude: [
      'Indicateurs sur série discrète : définitions de la moyenne, médiane, quartiles, écart type (leçon « Statistiques à une variable »)',
      'Boîte à moustaches (leçon « Boîtes à moustaches »)',
      'Densité de probabilité et lois continues (programme de première et terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les effectifs, les fréquences et la moyenne pondérée.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'deux-cents-recharges', path: `${LESSON_BASE_PATH}/deux-cents-recharges`, title: 'Deux cents recharges', desc: 'Deux cents durées, toutes différentes. Règle la largeur des tranches et regarde la forme apparaître — puis disparaître.', stage: 'trigger', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P1', 'seconde_series-regroupees-classes-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Découper l’axe' },
    { id: '02', number: 2, slug: 'du-tableau-a-l-histogramme', path: `${LESSON_BASE_PATH}/du-tableau-a-l-histogramme`, title: 'Du tableau à l’histogramme', desc: 'Effectifs, fréquences, et un diagramme où c’est l’aire — non la hauteur — qui représente l’effectif.', stage: 'discovery', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P3', 'seconde_series-regroupees-classes-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Construire l’histogramme' },
    { id: '03', number: 3, slug: 'les-frequences-cumulees', path: `${LESSON_BASE_PATH}/les-frequences-cumulees`, title: 'Les fréquences cumulées', desc: 'Combien de recharges durent moins de 40 min ? Le polygone croissant répond à toutes ces questions d’un coup.', stage: 'discovery', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P5', 'seconde_series-regroupees-classes-2nde_P10'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Cumuler' },
    { id: '04', number: 4, slug: 'estimer-la-moyenne', path: `${LESSON_BASE_PATH}/estimer-la-moyenne`, title: 'Estimer la moyenne', desc: 'On ne connaît plus les valeurs, seulement les tranches. Chaque classe est représentée par son centre — et le résultat n’est plus exact.', stage: 'manipulation', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P6', 'seconde_series-regroupees-classes-2nde_P7'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Estimer' },
    { id: '05', number: 5, slug: 'la-classe-mediane', path: `${LESSON_BASE_PATH}/la-classe-mediane`, title: 'La classe médiane', desc: 'La médiane n’est plus une valeur de la série : on la cherche dans la classe où le cumul franchit 50 %.', stage: 'manipulation', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P8', 'seconde_series-regroupees-classes-2nde_P9'], color: 'cyan', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Chercher la médiane' },
    { id: '06', number: 6, slug: 'atelier-lire-une-distribution', path: `${LESSON_BASE_PATH}/atelier-lire-une-distribution`, title: 'Atelier : lire une distribution', desc: 'Salaires, tailles, temps d’attente : lire un histogramme, repérer un piège d’amplitudes inégales, conclure.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_series-regroupees-classes-2nde_P4', 'seconde_series-regroupees-classes-2nde_P10', 'seconde_series-regroupees-classes-2nde_P3'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Lire' },
    { id: '07', number: 7, slug: 'mission-finale-la-borne', path: `${LESSON_BASE_PATH}/mission-finale-la-borne`, title: '🏆 Mission finale : la borne', desc: 'Dix épreuves pour prouver que tu regroupes, lis et estimes sans te tromper.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
