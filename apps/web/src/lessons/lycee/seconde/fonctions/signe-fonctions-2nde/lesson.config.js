/**
 * Signe d'une fonction — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 12 LPs (clé catalogue
 * 'seconde_signe_fonctions', append-only) :
 *
 *   seconde_signe-fonctions-2nde_P1   Déterminer le signe d'une fonction
 *   seconde_signe-fonctions-2nde_P2   Interpréter le signe graphiquement
 *   seconde_signe-fonctions-2nde_P3   Déterminer les zéros d'une fonction
 *   seconde_signe-fonctions-2nde_P4   Construire un tableau de signes
 *   seconde_signe-fonctions-2nde_P5   Étudier le signe d'une fonction affine
 *   seconde_signe-fonctions-2nde_P6   Étudier le signe d'un produit
 *   seconde_signe-fonctions-2nde_P7   Étudier le signe d'un quotient
 *   seconde_signe-fonctions-2nde_P8   Utiliser un tableau de signes pour résoudre une inéquation
 *   seconde_signe-fonctions-2nde_P9   Résoudre f(x)=0
 *   seconde_signe-fonctions-2nde_P10  Résoudre f(x)>0
 *   seconde_signe-fonctions-2nde_P11  Résoudre f(x)<0
 *   seconde_signe-fonctions-2nde_P12  Vérifier graphiquement une résolution
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : le signe de f(x) EST la
 * position de la courbe par rapport à l'axe des abscisses ; il ne change
 * qu'en traversant l'axe — aux zéros. L'axe peint sous la sonde est déjà un
 * tableau de signes ; pour une fonction affine, un produit, un quotient, le
 * tableau se construit par le calcul et sert à résoudre f(x) = 0, > 0, < 0.
 *
 * Objet porté : la SONDE qui peint l'axe (M1), reprise en frozen dans les
 * modules suivants comme vérification graphique.
 *
 * PÉRIMÈTRE : pas de second degré général (discriminant), pas de variations.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/fonctions/signe-fonctions-2nde';

export const LESSON_CONFIG = {
  id: 'signe-fonctions-2nde',
  // Connaissances SUPPOSÉES acquises, venues d'« Ensembles et intervalles »
  // (premier objet du domaine « Nombres et calculs ») : le tableau de signes
  // découpe l'axe en intervalles et l'on y lit « x ∈ ]1 ; 4[ » dès le
  // module 2. Diagnostiquées par sg-d6.
  priorKnowledge: ['intervalle', 'intervalle-crochets', 'appartient'],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Signe d’une fonction',
  description:
    "Balayer une courbe avec une sonde qui peint l'axe en vert au-dessus, en rose en dessous, puis découvrir que cet axe peint est un tableau de signes : le construire pour une fonction affine, un produit, un quotient, et s'en servir pour résoudre f(x) = 0, f(x) > 0, f(x) < 0.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'fonctions',
  chapterTitle: 'Fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➕➖',
  estimatedDurationMin: 80,
  skills: [
    'Lire le signe d’une fonction sur sa courbe et trouver ses zéros',
    'Construire et lire un tableau de signes',
    'Étudier le signe d’une fonction affine, d’un produit, d’un quotient',
    'Résoudre f(x) = 0, f(x) > 0, f(x) < 0 et vérifier graphiquement',
  ],
  teachingScope: {
    include: [
      'Signe de f(x) et position de la courbe par rapport à l’axe des abscisses ; zéros = solutions de f(x) = 0',
      'Tableau de signes : bornes, zéros, valeurs interdites (double barre), signe constant entre deux zéros consécutifs',
      'Signe de ax + b : zéro en −b/a, signe de a à droite du zéro',
      'Signe d’un produit et d’un quotient de facteurs affines par la règle des signes',
      'Résolution de f(x) = 0, > 0, ≥ 0, < 0, ≤ 0 par lecture du tableau ; écriture en réunion d’intervalles ; vérification graphique',
    ],
    exclude: [
      'Le discriminant et le signe du trinôme (Première)',
      'Les variations et le tableau de variations (leçon « Variations et extremums »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les images, les inéquations et la règle des signes.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'au-dessus-ou-en-dessous', path: `${LESSON_BASE_PATH}/au-dessus-ou-en-dessous`, title: 'Au-dessus ou en dessous ?', desc: 'Balaye la courbe des températures avec une sonde qui peint l’axe. Quand gèle-t-il ? Où le signe change-t-il ?', stage: 'trigger', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P1', 'seconde_signe-fonctions-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Balayer la courbe' },
    { id: '02', number: 2, slug: 'les-zeros-et-le-tableau', path: `${LESSON_BASE_PATH}/les-zeros-et-le-tableau`, title: 'Les zéros et le tableau de signes', desc: 'L’axe peint devient un tableau : les zéros en colonnes, les signes entre. Construis-le, puis lis-le sans la courbe.', stage: 'discovery', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P3', 'seconde_signe-fonctions-2nde_P4', 'seconde_signe-fonctions-2nde_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire le tableau' },
    { id: '03', number: 3, slug: 'le-signe-d-une-fonction-affine', path: `${LESSON_BASE_PATH}/le-signe-d-une-fonction-affine`, title: 'Le signe d’une fonction affine', desc: 'Deux curseurs a et b : le zéro glisse avec b, le côté « + » bascule avec le signe de a. La règle avant la formule.', stage: 'discovery', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P5', 'seconde_signe-fonctions-2nde_P3', 'seconde_signe-fonctions-2nde_P9'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Régler a et b' },
    { id: '04', number: 4, slug: 'produit-et-quotient', path: `${LESSON_BASE_PATH}/produit-et-quotient`, title: 'Produit et quotient', desc: 'Une ligne par facteur, la règle des signes pour la dernière ligne — et une double barre là où le quotient n’existe pas.', stage: 'manipulation', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P6', 'seconde_signe-fonctions-2nde_P7', 'seconde_signe-fonctions-2nde_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Remplir le tableau' },
    { id: '05', number: 5, slug: 'resoudre-avec-le-signe', path: `${LESSON_BASE_PATH}/resoudre-avec-le-signe`, title: 'Résoudre avec le signe', desc: 'f(x) = 0, f(x) > 0, f(x) ≤ 0 : lire le tableau, écrire les solutions en intervalles, vérifier sur la courbe.', stage: 'manipulation', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P8', 'seconde_signe-fonctions-2nde_P9', 'seconde_signe-fonctions-2nde_P10', 'seconde_signe-fonctions-2nde_P11', 'seconde_signe-fonctions-2nde_P12'], color: 'cyan', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Résoudre' },
    { id: '06', number: 6, slug: 'atelier-gel-et-benefice', path: `${LESSON_BASE_PATH}/atelier-gel-et-benefice`, title: 'Atelier : gel et bénéfice', desc: 'Quand gèle-t-il ? Pour quelles quantités l’entreprise gagne-t-elle ? Un quotient à trancher. Le signe répond.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_signe-fonctions-2nde_P8', 'seconde_signe-fonctions-2nde_P10', 'seconde_signe-fonctions-2nde_P11', 'seconde_signe-fonctions-2nde_P12', 'seconde_signe-fonctions-2nde_P6', 'seconde_signe-fonctions-2nde_P7', 'seconde_signe-fonctions-2nde_P1'], color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Trancher' },
    { id: '07', number: 7, slug: 'mission-finale-le-signe', path: `${LESSON_BASE_PATH}/mission-finale-le-signe`, title: '🏆 Mission finale : le signe', desc: 'Dix épreuves pour prouver que tu sais où une fonction est positive, négative, nulle — et le prouver.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
