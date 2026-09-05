/**
 * Vecteurs — 2nde.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 14 LPs de cette leçon (clé catalogue 'seconde_vecteurs', append-only) :
 *
 *   seconde_vecteurs-2nde_P1   Comprendre l'égalité de deux vecteurs
 *   seconde_vecteurs-2nde_P2   Identifier le vecteur nul
 *   seconde_vecteurs-2nde_P3   Construire un représentant d'un vecteur
 *   seconde_vecteurs-2nde_P4   Additionner deux vecteurs
 *   seconde_vecteurs-2nde_P5   Multiplier un vecteur par un réel
 *   seconde_vecteurs-2nde_P6   Reconnaître deux vecteurs colinéaires
 *   seconde_vecteurs-2nde_P7   Utiliser une base orthonormée
 *   seconde_vecteurs-2nde_P8   Lire les coordonnées d'un vecteur
 *   seconde_vecteurs-2nde_P9   Calculer les coordonnées d'un vecteur
 *   seconde_vecteurs-2nde_P10  Calculer la norme d'un vecteur
 *   seconde_vecteurs-2nde_P11  Calculer les coordonnées du vecteur AB
 *   seconde_vecteurs-2nde_P12  Calculer une distance entre deux points
 *   seconde_vecteurs-2nde_P13  Calculer les coordonnées du milieu d'un segment
 *   seconde_vecteurs-2nde_P14  Utiliser les vecteurs pour résoudre un problème
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un vecteur est un
 * DÉPLACEMENT — direction, sens, longueur — décrit indépendamment de son
 * point de départ. Deux nombres le décrivent entièrement ; enchaîner,
 * inverser et étirer des déplacements deviennent des calculs, et un
 * parallélogramme, un milieu ou un alignement aussi.
 *
 * Fil narratif unique : « le robot du dépôt » — un robot livreur sur un sol
 * carrelé, à qui l'on donne des recettes de déplacement. Il ouvre la leçon
 * (M1), ses flèches deviennent des vecteurs (M2), et il revient figé dans la
 * synthèse du boss.
 *
 * PÉRIMÈTRE : le déterminant (leçon « Colinéarité et alignement ») et le
 * produit scalaire ne sont pas enseignés.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/vecteurs-2nde';

export const LESSON_CONFIG = {
  id: 'vecteurs-2nde',
  sequentialUnlock: true,
  title: 'Vecteurs',
  description:
    "Piloter un robot sur un sol carrelé, refaire le même trajet depuis un autre point, enchaîner et inverser des déplacements, puis découvrir que deux nombres suffisent à tout décrire : le vecteur comme outil de déplacement, de calcul et de résolution de problèmes géométriques.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➡️',
  estimatedDurationMin: 90,
  skills: [
    "Comprendre l'égalité de deux vecteurs",
    'Identifier le vecteur nul',
    "Construire un représentant d'un vecteur",
    'Additionner deux vecteurs',
    'Multiplier un vecteur par un réel',
    'Reconnaître deux vecteurs colinéaires',
    'Utiliser une base orthonormée',
    "Lire les coordonnées d'un vecteur",
    "Calculer les coordonnées d'un vecteur",
    "Calculer la norme d'un vecteur",
    'Calculer les coordonnées du vecteur AB',
    'Calculer une distance entre deux points',
    "Calculer les coordonnées du milieu d'un segment",
    'Utiliser les vecteurs pour résoudre un problème',
  ],
  teachingScope: {
    include: [
      'Vecteur = déplacement : direction, sens, longueur ; représentants, égalité, vecteur nul, opposé',
      'Base orthonormée (O ; i, j) ; coordonnées d’un vecteur ; coordonnées de AB = (xB − xA ; yB − yA)',
      'Somme (bout à bout, relation de Chasles, coordonnées) ; produit par un réel ; colinéarité comme multiple',
      'Norme √(x² + y²), distance AB, milieu d’un segment',
      'Problèmes : quatrième sommet d’un parallélogramme, déplacement manquant, alignement',
    ],
    exclude: [
      'Le déterminant et la condition det = 0 (leçon « Colinéarité et alignement »)',
      'Le produit scalaire',
      'Les équations de droites (leçon « Droites du plan »)',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-robot-du-depot', path: `${LESSON_BASE_PATH}/le-robot-du-depot`,
      title: 'Le robot du dépôt', desc: 'Pilote le robot jusqu’à la station, refais le même trajet depuis ailleurs, enchaîne, reviens.',
      stage: 'trigger',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Piloter le robot',
    },
    {
      id: '02', number: 2, slug: 'le-meme-vecteur', path: `${LESSON_BASE_PATH}/le-meme-vecteur`,
      title: 'Le même vecteur', desc: 'Promène la flèche sans changer son déplacement : est-ce toujours le même vecteur ?',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P1', 'seconde_vecteurs-2nde_P2', 'seconde_vecteurs-2nde_P3'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Promener la flèche',
    },
    {
      id: '03', number: 3, slug: 'deux-nombres-suffisent', path: `${LESSON_BASE_PATH}/deux-nombres-suffisent`,
      title: 'Deux nombres suffisent', desc: 'Une base (i, j), un escalier, et les coordonnées d’un vecteur apparaissent — puis se calculent.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P7', 'seconde_vecteurs-2nde_P8', 'seconde_vecteurs-2nde_P11'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Lire et calculer',
    },
    {
      id: '04', number: 4, slug: 'enchainer-les-deplacements', path: `${LESSON_BASE_PATH}/enchainer-les-deplacements`,
      title: 'Enchaîner les déplacements', desc: 'Deux flèches bout à bout : la somme est le trajet direct, et les coordonnées s’ajoutent.',
      stage: 'manipulation',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P4', 'seconde_vecteurs-2nde_P2', 'seconde_vecteurs-2nde_P9'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Additionner',
    },
    {
      id: '05', number: 5, slug: 'etirer-inverser', path: `${LESSON_BASE_PATH}/etirer-inverser`,
      title: 'Étirer, inverser', desc: 'Multiplie un vecteur par k : la flèche s’allonge, se retourne, s’annule. Deux vecteurs colinéaires.',
      stage: 'manipulation',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P5', 'seconde_vecteurs-2nde_P6', 'seconde_vecteurs-2nde_P9'],
      color: 'purple', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Étirer',
    },
    {
      id: '06', number: 6, slug: 'mesurer-un-vecteur', path: `${LESSON_BASE_PATH}/mesurer-un-vecteur`,
      title: 'Mesurer un vecteur', desc: 'La longueur de la flèche sort de l’escalier : norme, distance entre deux points, milieu.',
      stage: 'manipulation',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P10', 'seconde_vecteurs-2nde_P12', 'seconde_vecteurs-2nde_P13', 'seconde_vecteurs-2nde_P7'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Mesurer',
    },
    {
      id: '07', number: 7, slug: 'a-retenir', path: `${LESSON_BASE_PATH}/a-retenir`,
      title: 'À retenir', desc: 'Égalité, somme, produit, coordonnées, norme, milieu : la carte de la leçon.',
      stage: 'formalization',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P1', 'seconde_vecteurs-2nde_P2', 'seconde_vecteurs-2nde_P4', 'seconde_vecteurs-2nde_P5', 'seconde_vecteurs-2nde_P6', 'seconde_vecteurs-2nde_P8', 'seconde_vecteurs-2nde_P9', 'seconde_vecteurs-2nde_P10', 'seconde_vecteurs-2nde_P11', 'seconde_vecteurs-2nde_P12', 'seconde_vecteurs-2nde_P13'],
      color: 'blue', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'Retenir',
    },
    {
      id: '08', number: 8, slug: 'problemes-de-geometrie', path: `${LESSON_BASE_PATH}/problemes-de-geometrie`,
      title: 'Problèmes de géométrie', desc: 'Fermer un parallélogramme, retrouver un déplacement manquant, prouver un alignement.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['seconde_vecteurs-2nde_P14', 'seconde_vecteurs-2nde_P3', 'seconde_vecteurs-2nde_P11', 'seconde_vecteurs-2nde_P13', 'seconde_vecteurs-2nde_P6'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '09', number: 9, slug: 'mission-finale-le-depot', path: `${LESSON_BASE_PATH}/mission-finale-le-depot`,
      title: '🏆 Mission finale : le dépôt', desc: 'Dix épreuves pour prouver que tu maîtrises les vecteurs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
