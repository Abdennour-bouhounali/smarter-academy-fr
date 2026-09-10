/**
 * Fonction affine — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 11 LPs (clé catalogue
 * 'seconde_fonction_affine', append-only) :
 *
 *   seconde_fonction-affine-2nde_P1   Reconnaître une fonction affine
 *   seconde_fonction-affine-2nde_P2   Identifier le coefficient directeur
 *   seconde_fonction-affine-2nde_P3   Identifier l'ordonnée à l'origine
 *   seconde_fonction-affine-2nde_P4   Interpréter le coefficient directeur comme un taux d'accroissement
 *   seconde_fonction-affine-2nde_P5   Relier le signe du coefficient directeur aux variations
 *   seconde_fonction-affine-2nde_P6   Déterminer une fonction affine à partir de données
 *   seconde_fonction-affine-2nde_P7   Lire le coefficient directeur sur un graphique
 *   seconde_fonction-affine-2nde_P8   Lire l'ordonnée à l'origine
 *   seconde_fonction-affine-2nde_P9   Étudier le signe d'une fonction affine
 *   seconde_fonction-affine-2nde_P10  Résoudre une équation avec une fonction affine
 *   seconde_fonction-affine-2nde_P11  Résoudre une inéquation avec une fonction affine
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : dans f(x) = ax + b, a est un
 * TAUX — ce que f gagne quand x avance de 1, le même partout — et b la valeur
 * de départ f(0). Le signe de a décide du sens de variation ; le zéro −b/a du
 * signe ; deux données suffisent à retrouver a puis b.
 *
 * Situation portée : LE RÉSERVOIR — un robinet de débit a (L/min, négatif
 * pour vider) et un volume initial b : V(t) = a·t + b. Il ouvre la leçon
 * (M1) et revient dans les modules 2, 3 et 5.
 *
 * PÉRIMÈTRE : la leçon n'enseigne PAS l'équation d'une droite (leçon
 * « Équations de droites », où m tourne et p glisse) ni la construction du
 * tableau de signes en général (leçon « Signe d'une fonction ») : elle les
 * réactive du point de vue de la fonction (taux, valeur initiale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * La fonction affine est une notion de 3e que la Seconde REPREND : f(x), la
 * représentation graphique, le mot « affine », le coefficient directeur,
 * l'ordonnée à l'origine et la pente d'une droite sont donc de l'ACQUIS
 * (état A), pas la matière de la leçon. Ils sont déclarés ci-dessous et
 * mesurés — chacun — par une question du module 0. Ce que la leçon ÉTABLIT
 * (état B) vit dans knowledge.jsx et est posé par les briques des modules 1
 * à 6, chaque fois après le geste qui donne son sens au mot.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/fonctions/fonction-affine-2nde';

export const LESSON_CONFIG = {
  id: 'fonction-affine-2nde',
  // Ce que la leçon SUPPOSE acquis (état A), venu de la 3e (« Fonctions
  // affines ») et du repérage de collège. On ne déclare QUE ce qu'une
  // question du module 0 mesure : déclarer davantage produit des
  // W_PRIOR_NOT_DIAGNOSED, et promet un diagnostic que la leçon ne fait pas.
  // Le taux d'accroissement, la lecture des variations par le signe de a, la
  // détermination par deux données et le signe de ax + b n'y sont PAS : c'est
  // la matière de la leçon, posée par les briques des modules 1 à 6.
  priorKnowledge: [
    'fonction', 'notation-fx', 'fonction-affine', 'representation-graphique',
    'coefficient-directeur', 'ordonnee-origine', 'pente', 'origine-repere',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Fonction affine',
  description:
    "Régler le débit d'un robinet et le volume de départ d'un réservoir, regarder le volume changer minute après minute, puis découvrir que a est un taux d'accroissement constant et b une valeur initiale : variations, signe, équations et inéquations avec f(x) = ax + b, et deux données pour retrouver la fonction.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'fonctions',
  chapterTitle: 'Fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 78,
  skills: [
    'Reconnaître une fonction affine et identifier a et b',
    'Interpréter a comme un taux d’accroissement et b comme la valeur initiale',
    'Relier le signe de a aux variations ; lire a et b sur un graphique',
    'Déterminer une fonction affine à partir de deux données',
    'Étudier le signe, résoudre f(x) = k et f(x) > k',
  ],
  teachingScope: {
    include: [
      'f(x) = ax + b : a coefficient directeur = taux d’accroissement (f(x₂) − f(x₁))/(x₂ − x₁), constant ; b = f(0), ordonnée à l’origine',
      'Sens de variation selon le signe de a ; lecture graphique de a (escalier +1 → +a) et de b',
      'Reconnaître une fonction affine dans une table (accroissements proportionnels) ; déterminer a puis b à partir de deux points',
      'Signe de ax + b (zéro −b/a) ; équations ax + b = k ; inéquations ax + b > k (le sens s’inverse quand on divise par a < 0)',
    ],
    exclude: [
      'Équation cartésienne, vecteur directeur, droites verticales (leçon « Équations de droites »)',
      'Tableau de signes d’un produit ou d’un quotient (leçon « Signe d’une fonction »)',
      'Systèmes de deux équations (leçon « Positions relatives de deux droites »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les fonctions affines du collège et la lecture d’une droite.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-reservoir', path: `${LESSON_BASE_PATH}/le-reservoir`, title: 'Le réservoir', desc: 'Un robinet, un volume de départ, une horloge. Règle le débit a et le volume initial b : la courbe du volume suit. Que fait a ? Que fait b ?', stage: 'trigger', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P1', 'seconde_fonction-affine-2nde_P2', 'seconde_fonction-affine-2nde_P3'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Ouvrir le robinet' },
    { id: '02', number: 2, slug: 'le-taux-d-accroissement', path: `${LESSON_BASE_PATH}/le-taux-d-accroissement`, title: 'Le taux d’accroissement', desc: 'Deux instants, la différence des volumes divisée par la différence des temps : toujours le même nombre — a. Et une table qui n’est pas affine.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P4', 'seconde_fonction-affine-2nde_P1', 'seconde_fonction-affine-2nde_P7'], color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Mesurer le taux' },
    { id: '03', number: 3, slug: 'croissante-ou-decroissante', path: `${LESSON_BASE_PATH}/croissante-ou-decroissante`, title: 'Croissante ou décroissante ?', desc: 'Fais passer a par 0 : la flèche du tableau de variations bascule. Le signe de a décide, b ne change rien.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P5', 'seconde_fonction-affine-2nde_P2', 'seconde_fonction-affine-2nde_P8'], color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Faire basculer a' },
    { id: '04', number: 4, slug: 'retrouver-la-fonction', path: `${LESSON_BASE_PATH}/retrouver-la-fonction`, title: 'Retrouver la fonction', desc: 'Deux mesures suffisent : a par le taux, b en remontant à t = 0. Sur un graphique aussi : l’escalier donne a, l’axe donne b.', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P6', 'seconde_fonction-affine-2nde_P7', 'seconde_fonction-affine-2nde_P8'], color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Retrouver a et b' },
    { id: '05', number: 5, slug: 'signe-equations-inequations', path: `${LESSON_BASE_PATH}/signe-equations-inequations`, title: 'Signe, équations, inéquations', desc: 'Quand le réservoir est-il vide ? Plein à moitié ? Le zéro, le signe, et une inéquation dont le sens s’inverse quand a < 0.', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P9', 'seconde_fonction-affine-2nde_P10', 'seconde_fonction-affine-2nde_P11'], color: 'cyan', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Résoudre' },
    { id: '06', number: 6, slug: 'atelier-modeliser', path: `${LESSON_BASE_PATH}/atelier-modeliser`, title: 'Atelier : modéliser', desc: 'Un abonnement, une descente en téléphérique, une bougie qui fond : reconnaître a et b dans la situation, puis répondre.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_fonction-affine-2nde_P6', 'seconde_fonction-affine-2nde_P4', 'seconde_fonction-affine-2nde_P5', 'seconde_fonction-affine-2nde_P9', 'seconde_fonction-affine-2nde_P10', 'seconde_fonction-affine-2nde_P11', 'seconde_fonction-affine-2nde_P1'], color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-le-robinet', path: `${LESSON_BASE_PATH}/mission-finale-le-robinet`, title: '🏆 Mission finale : le robinet', desc: 'Dix épreuves pour prouver que a et b n’ont plus de secret pour toi.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
