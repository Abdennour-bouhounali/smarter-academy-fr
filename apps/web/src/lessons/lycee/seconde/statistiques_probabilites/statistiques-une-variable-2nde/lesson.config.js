/**
 * Statistiques à une variable — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 12 LPs (clé catalogue
 * 'seconde_statistiques_une_variable', append-only) :
 *
 *   seconde_statistiques-une-variable-2nde_P1   Lire une série statistique
 *   seconde_statistiques-une-variable-2nde_P2   Calculer une moyenne
 *   seconde_statistiques-une-variable-2nde_P3   Utiliser la linéarité de la moyenne
 *   seconde_statistiques-une-variable-2nde_P4   Calculer une médiane
 *   seconde_statistiques-une-variable-2nde_P5   Déterminer les quartiles
 *   seconde_statistiques-une-variable-2nde_P6   Interpréter les indicateurs statistiques
 *   seconde_statistiques-une-variable-2nde_P7   Comprendre l'écart type
 *   seconde_statistiques-une-variable-2nde_P8   Calculer ou utiliser un écart type
 *   seconde_statistiques-une-variable-2nde_P9   Interpréter la dispersion d'une série
 *   seconde_statistiques-une-variable-2nde_P10  Étudier l'influence de l'ajout d'une valeur
 *   seconde_statistiques-une-variable-2nde_P11  Étudier l'influence de la suppression d'une valeur
 *   seconde_statistiques-une-variable-2nde_P12  Comparer deux séries statistiques
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un seul nombre ne résume pas
 * une série. Il faut dire OÙ elle se situe (moyenne, médiane) ET comment elle
 * s'étale (étendue, écart interquartile, écart type) — deux séries de même
 * moyenne peuvent être radicalement différentes.
 *
 * Situation portée : LES TEMPS DE TRAJET de deux classes vers le lycée
 * (en minutes). Elle ouvre la leçon (M1) et revient aux modules 2, 3, 5 et 6.
 *
 * CONVENTION DE QUARTILES : celle du programme français — rang de Q1 = ⌈n/4⌉,
 * rang de Q3 = ⌈3n/4⌉, valeurs de la série, jamais d'interpolation
 * (lessons/common/stats/statsUtils.js, testée).
 *
 * PÉRIMÈTRE : série DISCRÈTE, valeurs individuelles connues. Le regroupement
 * en classes et l'histogramme appartiennent à la leçon « Séries regroupées en
 * classes » ; la boîte à moustaches à la leçon « Boîtes à moustaches » — ici
 * les quartiles sont calculés et lus, pas encore dessinés en boîte.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde';

export const LESSON_CONFIG = {
  id: 'statistiques-une-variable-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Statistiques à une variable',
  description:
    "Poser les temps de trajet d'une classe sur un axe, chercher le nombre qui la résume et découvrir qu'aucun n'y suffit seul : la moyenne se laisse tirer par une valeur extrême, la médiane non, et deux séries de même moyenne peuvent s'étaler tout autrement — d'où les indicateurs de dispersion, étendue, écart interquartile et écart type.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 85,
  skills: [
    'Lire une série statistique et la représenter sur un axe',
    'Calculer une moyenne, une médiane, les quartiles, et savoir ce que chacun mesure',
    'Mesurer la dispersion : étendue, écart interquartile, écart type',
    'Prévoir l’effet de l’ajout ou de la suppression d’une valeur sur chaque indicateur',
    'Comparer deux séries en croisant un indicateur de position et un de dispersion',
  ],
  teachingScope: {
    include: [
      'Série statistique discrète : effectifs, fréquences ; moyenne simple et pondérée',
      'Linéarité de la moyenne : moyenne de (ax + b) = a × moyenne + b',
      'Médiane (demi-somme centrale si n pair) ; quartiles Q1 et Q3 aux rangs ⌈n/4⌉ et ⌈3n/4⌉',
      'Dispersion : étendue, écart interquartile Q3 − Q1, écart type (diviseur n)',
      'Sensibilité comparée de la moyenne et de la médiane à une valeur extrême ; comparaison de deux séries',
    ],
    exclude: [
      'Regroupement en classes, histogramme, fréquences cumulées (leçon « Séries regroupées en classes »)',
      'Tracé et lecture d’une boîte à moustaches (leçon « Boîtes à moustaches »)',
      'Variables croisées et fréquences conditionnelles (leçons « Tableaux croisés » et « Fréquences conditionnelles »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur la moyenne, la médiane et la lecture d’un tableau d’effectifs.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'les-temps-de-trajet', path: `${LESSON_BASE_PATH}/les-temps-de-trajet`, title: 'Les temps de trajet', desc: 'Vingt élèves, vingt durées posées sur un axe. Un seul nombre peut-il résumer tout ça ? Déplace une valeur et regarde qui bouge.', stage: 'trigger', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P1', 'seconde_statistiques-une-variable-2nde_P2', 'seconde_statistiques-une-variable-2nde_P4'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Poser la série' },
    { id: '02', number: 2, slug: 'moyenne-et-mediane', path: `${LESSON_BASE_PATH}/moyenne-et-mediane`, title: 'Moyenne et médiane', desc: 'Deux façons de dire « le milieu ». L’une additionne tout, l’autre compte les individus — et elles ne répondent pas à la même question.', stage: 'discovery', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P2', 'seconde_statistiques-une-variable-2nde_P4', 'seconde_statistiques-une-variable-2nde_P6'], color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Comparer les deux' },
    { id: '03', number: 3, slug: 'les-quartiles', path: `${LESSON_BASE_PATH}/les-quartiles`, title: 'Les quartiles', desc: 'Découper la série en quatre paquets d’effectifs égaux : Q1, la médiane, Q3. Et l’écart interquartile, qui mesure le cœur de la série.', stage: 'discovery', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P5', 'seconde_statistiques-une-variable-2nde_P9'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Découper en quatre' },
    { id: '04', number: 4, slug: 'l-ecart-type', path: `${LESSON_BASE_PATH}/l-ecart-type`, title: 'L’écart type', desc: 'Deux séries, même moyenne, allures opposées. L’écart type mesure à quelle distance de la moyenne on vit en général.', stage: 'discovery', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P7', 'seconde_statistiques-une-variable-2nde_P8'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Mesurer l’étalement' },
    { id: '05', number: 5, slug: 'ajouter-ou-retirer-une-valeur', path: `${LESSON_BASE_PATH}/ajouter-ou-retirer-une-valeur`, title: 'Ajouter ou retirer une valeur', desc: 'Un élève déménage très loin. La moyenne s’envole, la médiane bouge à peine. Et si tout le monde partait 5 min plus tôt ?', stage: 'manipulation', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P10', 'seconde_statistiques-une-variable-2nde_P11', 'seconde_statistiques-une-variable-2nde_P3'], color: 'cyan', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Perturber la série' },
    { id: '06', number: 6, slug: 'atelier-comparer-deux-series', path: `${LESSON_BASE_PATH}/atelier-comparer-deux-series`, title: 'Atelier : comparer deux séries', desc: 'Deux classes, deux ateliers, deux capteurs : choisir les bons indicateurs et conclure honnêtement.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_statistiques-une-variable-2nde_P12', 'seconde_statistiques-une-variable-2nde_P6', 'seconde_statistiques-une-variable-2nde_P9', 'seconde_statistiques-une-variable-2nde_P1'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Comparer' },
    { id: '07', number: 7, slug: 'mission-finale-resumer-une-serie', path: `${LESSON_BASE_PATH}/mission-finale-resumer-une-serie`, title: '🏆 Mission finale : résumer une série', desc: 'Dix épreuves pour prouver que tu sais choisir et interpréter le bon indicateur.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
