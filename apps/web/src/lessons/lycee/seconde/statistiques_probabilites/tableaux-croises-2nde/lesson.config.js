/**
 * Tableaux croisés — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 10 LPs (clé catalogue
 * 'seconde_tableaux_croises', append-only) :
 *
 *   seconde_tableaux-croises-2nde_P1   Identifier deux variables qualitatives
 *   seconde_tableaux-croises-2nde_P2   Identifier une variable nominale
 *   seconde_tableaux-croises-2nde_P3   Identifier une variable ordinale
 *   seconde_tableaux-croises-2nde_P4   Lire un fichier de données
 *   seconde_tableaux-croises-2nde_P5   Filtrer une population
 *   seconde_tableaux-croises-2nde_P6   Construire un tableau croisé d'effectifs
 *   seconde_tableaux-croises-2nde_P7   Lire un tableau croisé
 *   seconde_tableaux-croises-2nde_P8   Calculer des effectifs marginaux
 *   seconde_tableaux-croises-2nde_P9   Interpréter les résultats d'un tableau croisé
 *   seconde_tableaux-croises-2nde_P10  Utiliser ET, OU et NON pour filtrer des données
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : croiser deux variables, c'est
 * RANGER chaque individu dans une case et une seule. Le tableau croisé n'est
 * pas une présentation : c'est un comptage exhaustif et sans recouvrement,
 * d'où le fait que les marges se recoupent et que la somme des lignes égale
 * celle des colonnes.
 *
 * Situation portée : LES 60 ÉLÈVES DU CLUB, chacun décrit par sa classe et
 * son activité. L'élève les trie lui-même, un par un, dans le tableau.
 *
 * PÉRIMÈTRE : effectifs uniquement. Les FRÉQUENCES conditionnelles et
 * marginales appartiennent à la leçon suivante (« Fréquences
 * conditionnelles ») — ici on compte, on ne divise pas encore.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/tableaux-croises-2nde';

export const LESSON_CONFIG = {
  id: 'tableaux-croises-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Tableaux croisés',
  description:
    "Recevoir soixante fiches d'élèves décrites par deux caractères, les ranger soi-même case par case jusqu'à ce que le tableau croisé se remplisse, puis découvrir que les totaux de lignes et de colonnes tombent sur le même nombre — parce que chaque individu occupe une case et une seule.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🗂️',
  estimatedDurationMin: 75,
  skills: [
    'Reconnaître une variable qualitative, nominale ou ordinale',
    'Lire un fichier de données individuelles et le filtrer',
    'Construire un tableau croisé d’effectifs à partir des observations',
    'Calculer et interpréter les effectifs marginaux et le total général',
    'Traduire une phrase en filtre logique ET / OU / NON',
  ],
  teachingScope: {
    include: [
      'Variables qualitatives : modalités ; nominale (sans ordre) vs ordinale (avec ordre)',
      'Fichier de données individuelles : une ligne par individu, une colonne par variable',
      'Tableau croisé d’effectifs : chaque individu dans une case et une seule',
      'Effectifs marginaux (totaux de lignes et de colonnes) et total général ; leur cohérence',
      'Filtres logiques ET (intersection), OU (réunion, inclusif), NON (complémentaire)',
    ],
    exclude: [
      'Fréquences marginales et conditionnelles, division par un effectif de référence (leçon « Fréquences conditionnelles »)',
      'Probabilités conditionnelles et notation P_A(B) (leçon « Probabilités conditionnelles »)',
      'Variables quantitatives, moyennes et dispersions (leçon « Statistiques à une variable »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les effectifs et la lecture d’un tableau à double entrée.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'soixante-fiches-a-ranger', path: `${LESSON_BASE_PATH}/soixante-fiches-a-ranger`, title: 'Soixante fiches à ranger', desc: 'Chaque élève a une classe et une activité. Range les fiches une par une : le tableau se remplit sous tes yeux.', stage: 'trigger', teachesLearningPointIds: ['seconde_tableaux-croises-2nde_P4', 'seconde_tableaux-croises-2nde_P6'], color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Ranger les fiches' },
    { id: '02', number: 2, slug: 'deux-variables-qualitatives', path: `${LESSON_BASE_PATH}/deux-variables-qualitatives`, title: 'Deux variables qualitatives', desc: 'Des modalités, pas des nombres. Et parmi elles, certaines ont un ordre naturel — d’autres non.', stage: 'discovery', teachesLearningPointIds: ['seconde_tableaux-croises-2nde_P1', 'seconde_tableaux-croises-2nde_P2', 'seconde_tableaux-croises-2nde_P3'], color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Classer les variables' },
    { id: '03', number: 3, slug: 'les-marges-et-le-total', path: `${LESSON_BASE_PATH}/les-marges-et-le-total`, title: 'Les marges et le total', desc: 'Les totaux de lignes, ceux de colonnes, et le nombre qui doit tomber deux fois pareil — sinon il y a une erreur.', stage: 'discovery', teachesLearningPointIds: ['seconde_tableaux-croises-2nde_P8', 'seconde_tableaux-croises-2nde_P7'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Vérifier les marges' },
    { id: '04', number: 4, slug: 'filtrer-avec-et-ou-non', path: `${LESSON_BASE_PATH}/filtrer-avec-et-ou-non`, title: 'Filtrer avec ET, OU, NON', desc: 'Traduire une phrase en filtre : « en 2de A ET au judo », « au judo OU à la danse », « pas en 2de B ».', stage: 'manipulation', teachesLearningPointIds: ['seconde_tableaux-croises-2nde_P5', 'seconde_tableaux-croises-2nde_P10'], color: 'emerald', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Filtrer' },
    { id: '05', number: 5, slug: 'atelier-interpreter-un-tableau', path: `${LESSON_BASE_PATH}/atelier-interpreter-un-tableau`, title: 'Atelier : interpréter un tableau', desc: 'Trois tableaux réels : ce qu’ils disent, ce qu’ils ne disent pas, et le piège de la comparaison brute d’effectifs.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_tableaux-croises-2nde_P9', 'seconde_tableaux-croises-2nde_P7'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Interpréter' },
    { id: '06', number: 6, slug: 'mission-finale-le-club', path: `${LESSON_BASE_PATH}/mission-finale-le-club`, title: '🏆 Mission finale : le club', desc: 'Dix épreuves pour prouver que tu construis, lis et interroges un tableau croisé.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
