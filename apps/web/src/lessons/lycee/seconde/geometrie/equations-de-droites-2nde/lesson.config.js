/**
 * Équations de droites — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 12 LPs (clé catalogue
 * 'seconde_equations_de_droites', append-only) :
 *
 *   seconde_equations-de-droites-2nde_P1   Comprendre un vecteur directeur
 *   seconde_equations-de-droites-2nde_P2   Identifier un vecteur directeur d'une droite
 *   seconde_equations-de-droites-2nde_P3   Comprendre la pente d'une droite
 *   seconde_equations-de-droites-2nde_P4   Calculer la pente d'une droite
 *   seconde_equations-de-droites-2nde_P5   Déterminer une équation de droite à partir de deux points
 *   seconde_equations-de-droites-2nde_P6   … à partir d'un point et d'un vecteur directeur
 *   seconde_equations-de-droites-2nde_P7   … à partir d'un point et de la pente
 *   seconde_equations-de-droites-2nde_P8   Comprendre l'équation réduite
 *   seconde_equations-de-droites-2nde_P9   Comprendre l'équation cartésienne
 *   seconde_equations-de-droites-2nde_P10  Tracer une droite à partir de son équation
 *   seconde_equations-de-droites-2nde_P11  Déterminer si un point appartient à une droite
 *   seconde_equations-de-droites-2nde_P12  Établir l'alignement de trois points
 *
 * L'IDÉE CENTRALE, vécue avant d'être écrite : une droite, c'est UN POINT et
 * UNE DIRECTION. Tous ses points sont A + t·u ; leurs coordonnées obéissent
 * à une seule relation, det(AM, u) = 0, qui, écrite, EST l'équation. Vecteur
 * directeur, pente, équation cartésienne, équation réduite : quatre lectures
 * du même objet, et on passe de l'une à l'autre.
 *
 * Fil narratif : le laboratoire des droites (M1), le marcheur (M2), le test du
 * déterminant (M3), les coefficients (M4), les points suspects (M5), figés
 * au boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/equations-de-droites-2nde';

export const LESSON_CONFIG = {
  id: 'equations-de-droites-2nde',
  // Connaissances SUPPOSÉES acquises, mesurées — et rien d'autre — par le
  // module 0 : le repérage du collège, le vecteur et la COLINÉARITÉ de la
  // leçon précédente (« Vecteurs et colinéarité »), la fonction affine de 3e.
  // « colinéaire » est bien un prérequis et non une notion de cette leçon :
  // le module 3 s'appuie dessus (det(AM, u) = 0) sans jamais le redéfinir.
  priorKnowledge: ['abscisse', 'ordonnee', 'coordonnees', 'vecteur',
    'colineaire', 'fonction-affine', 'coefficient-directeur'],
  sequentialUnlock: true,
  title: 'Équations de droites',
  description:
    "Construire une droite avec un point et une flèche, la faire tourner, la faire glisser, marcher dessus point par point, puis découvrir que ses coordonnées obéissent à une seule relation : l'équation. Quatre lectures d'un même objet, et le test qui dit si un point est dessus.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  // La formalisation de cette leçon EST la carte cumulative : le module 6
  // pose ses quatre briques, le tiroir et l'« À retenir » de fin de module les
  // rendent. Sans ce drapeau, validate-lessons attend un module `formalization`
  // séparé — et la carte reste invisible (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  emoji: '📈',
  estimatedDurationMin: 85,
  skills: [
    'Comprendre et identifier un vecteur directeur',
    'Comprendre et calculer la pente d’une droite',
    'Déterminer une équation (deux points, point + vecteur, point + pente)',
    'Lire une équation cartésienne et une équation réduite',
    'Tracer une droite, tester un point, établir un alignement',
  ],
  teachingScope: {
    include: [
      'Droite définie par un point et un vecteur directeur ; tout vecteur non nul colinéaire convient',
      'Points de la droite A + t·u ; pente m = u_y / u_x ; pente entre deux points',
      'Équation cartésienne a·x + b·y + c = 0 (vecteur directeur (−b ; a)) et équation réduite y = m·x + p ; droites verticales x = k',
      'Déterminer une équation à partir de deux points, d’un point et d’un vecteur directeur, d’un point et de la pente',
      'Tracer une droite à partir de son équation ; appartenance d’un point ; alignement de trois points',
    ],
    exclude: [
      'Intersection de deux droites et systèmes (leçon « Positions relatives de droites »)',
      'Vecteur normal et produit scalaire (Première)',
      'La fonction affine comme objet (leçon « Fonction affine »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les vecteurs, le repérage et les fonctions affines.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-laboratoire-des-droites', path: `${LESSON_BASE_PATH}/le-laboratoire-des-droites`, title: 'Le laboratoire des droites', desc: 'Un point, une flèche : une droite. Tourne la flèche, étire-la, déplace le point — que devient la droite ?', stage: 'trigger', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P1', 'seconde_equations-de-droites-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Construire une droite' },
    { id: '02', number: 2, slug: 'des-points-sur-la-droite', path: `${LESSON_BASE_PATH}/des-points-sur-la-droite`, title: 'Des points sur la droite', desc: 'Marche sur la droite pas à pas depuis A : chaque pas ajoute la même chose à x et à y. La pente apparaît.', stage: 'discovery', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P3', 'seconde_equations-de-droites-2nde_P4', 'seconde_equations-de-droites-2nde_P1'], color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Marcher sur la droite' },
    { id: '03', number: 3, slug: 'de-la-droite-a-l-equation', path: `${LESSON_BASE_PATH}/de-la-droite-a-l-equation`, title: 'De la droite à l’équation', desc: 'Un nombre vaut 0 exactement quand M est sur la droite. Écris-le avec x et y : c’est l’équation.', stage: 'discovery', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P9', 'seconde_equations-de-droites-2nde_P8', 'seconde_equations-de-droites-2nde_P6'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Trouver la relation' },
    { id: '04', number: 4, slug: 'le-laboratoire-des-coefficients', path: `${LESSON_BASE_PATH}/le-laboratoire-des-coefficients`, title: 'Le laboratoire des coefficients', desc: 'Fais varier m, puis p : qui tourne, qui glisse ? Et cette droite verticale que y = mx + p refuse de donner.', stage: 'manipulation', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P8', 'seconde_equations-de-droites-2nde_P3', 'seconde_equations-de-droites-2nde_P10', 'seconde_equations-de-droites-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Régler m et p' },
    { id: '05', number: 5, slug: 'ce-point-est-il-sur-la-droite', path: `${LESSON_BASE_PATH}/ce-point-est-il-sur-la-droite`, title: 'Ce point est-il sur la droite ?', desc: 'Cinq points suspects, dont deux à 0,1 près. Ton œil dit oui ; que dit l’équation ?', stage: 'manipulation', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P11', 'seconde_equations-de-droites-2nde_P12'], color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Tester les points' },
    { id: '06', number: 6, slug: 'a-retenir', path: `${LESSON_BASE_PATH}/a-retenir`, title: 'À retenir', desc: 'Vecteur directeur, pente, équation cartésienne, équation réduite : quatre lectures d’une même droite, et les trois chemins vers une équation.', stage: 'formalization', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P5', 'seconde_equations-de-droites-2nde_P6', 'seconde_equations-de-droites-2nde_P7', 'seconde_equations-de-droites-2nde_P8', 'seconde_equations-de-droites-2nde_P9', 'seconde_equations-de-droites-2nde_P2'], color: 'blue', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'Retenir' },
    { id: '07', number: 7, slug: 'atelier-construire-et-resoudre', path: `${LESSON_BASE_PATH}/atelier-construire-et-resoudre`, title: 'Atelier : construire et résoudre', desc: 'Deux points, un point et une flèche, un point et une pente ; lire une équation, tracer, et une rampe à vérifier.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_equations-de-droites-2nde_P5', 'seconde_equations-de-droites-2nde_P6', 'seconde_equations-de-droites-2nde_P7', 'seconde_equations-de-droites-2nde_P10', 'seconde_equations-de-droites-2nde_P11', 'seconde_equations-de-droites-2nde_P4', 'seconde_equations-de-droites-2nde_P12'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Résoudre' },
    { id: '08', number: 8, slug: 'mission-finale-la-droite', path: `${LESSON_BASE_PATH}/mission-finale-la-droite`, title: '🏆 Mission finale : la droite', desc: 'Dix épreuves pour prouver qu’aucune droite ne garde de secret pour toi.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
