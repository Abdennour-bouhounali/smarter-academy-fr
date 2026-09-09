/**
 * Produit scalaire : définir et détecter l'orthogonalité — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_produit_scalaire', partie 1/2, append-only) :
 *
 *   premiere_specialite_produit-scalaire-definir-1ere_P1  Calculer un produit scalaire à partir des coordonnées
 *   premiere_specialite_produit-scalaire-definir-1ere_P2  Calculer un produit scalaire à partir des normes et de l'angle
 *   premiere_specialite_produit-scalaire-definir-1ere_P3  Utiliser la bilinéarité et la symétrie du produit scalaire
 *   premiere_specialite_produit-scalaire-definir-1ere_P4  Démontrer l'orthogonalité de deux vecteurs par le produit scalaire
 *   premiere_specialite_produit-scalaire-definir-1ere_P5  Déterminer un vecteur normal à une droite
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : de DEUX flèches naît UN nombre.
 * Deux recettes qui n'ont rien à voir l'une avec l'autre — d'un côté une ombre
 * mesurée sur la figure, de l'autre un calcul sur quatre coordonnées — donnent
 * toujours le même. Et ce nombre s'annule EXACTEMENT à l'angle droit : c'est
 * lui qui transforme « ça a l'air perpendiculaire » en démonstration.
 *
 * Objet porté : L'OMBRE PORTÉE (components/OmbreLab.jsx), reprise au module 2
 * pour poser les deux formules, puis remplacée par des calculs aux modules 3
 * à 5 — l'instrument s'efface quand le calcul prend le relais.
 *
 * PÉRIMÈTRE : pas d'Al-Kashi, pas de calcul d'angle par arccos, pas de
 * distance d'un point à une droite, pas de cercle ni d'équation normale
 * — « Produit scalaire : mesurer et démontrer ». Pas de produit scalaire dans
 * l'espace (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/geometrie/produit-scalaire-definir-1ere';

export const LESSON_CONFIG = {
  id: 'produit-scalaire-definir-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0. Les ids sont ceux
  // que « Vecteurs » (2de) établit déjà : une leçon de Première hérite du
  // vocabulaire, elle ne le réinvente pas.
  //   vecteur-deplacement, coordonnees-vecteur, regle-coordonnees — la leçon
  //     écrit u = (4 ; 3) et calcule AB dès son module 1 (ps-d1, ps-d2) ;
  //   vocab-norme, formule-norme — ‖u‖ est un FACTEUR de la formule enseignée,
  //     jamais son objet (ps-d3) ;
  //   vocab-base-orthonormee — la formule des coordonnées n'est vraie QUE dans
  //     une base orthonormée ; l'élève doit savoir ce qu'est ce repère (ps-d4) ;
  //   regle-produit-reel, regle-somme — le module 3 étire et enchaîne des
  //     flèches avant d'énoncer la bilinéarité (ps-d5, ps-d6) ;
  //   abscisse, ordonnee — DÉCLARÉS EXPLICITEMENT, et non laissés implicites
  //     dans `coordonnees-vecteur`. La formule enseignée au module 2 s'énonce
  //     « abscisse fois abscisse, ordonnée fois ordonnée » : les deux mots y
  //     sont en position d'ENSEIGNEMENT, et l'audit strict signalait alors
  //     leur emploi antérieur au module 0. Ce sont des acquis de 6e, mesurés
  //     par ps-d2 : les nommer ici est la réparation juste, la seule autre
  //     étant de les retirer de l'énoncé de la formule — ce qui la rendrait
  //     moins claire.
  priorKnowledge: [
    'vecteur-deplacement', 'coordonnees-vecteur', 'regle-coordonnees',
    'abscisse', 'ordonnee',
    'vocab-norme', 'formule-norme', 'vocab-base-orthonormee',
    'regle-produit-reel', 'regle-somme',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Produit scalaire : définir et détecter l’orthogonalité',
  description:
    'Faire tourner une flèche et regarder son ombre : deux calculs qui n’ont rien à voir donnent toujours le même nombre, et ce nombre tombe à zéro pile à l’angle droit. Voilà le produit scalaire — de quoi le calculer de deux façons, s’en servir comme d’une algèbre, et démontrer qu’un angle est droit sans rapporteur.',
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⊥',
  estimatedDurationMin: 75,
  skills: [
    'Calculer un produit scalaire à partir des coordonnées de deux vecteurs',
    'Calculer un produit scalaire à partir des normes et de l’angle',
    'Utiliser la symétrie et la bilinéarité pour transformer une expression',
    'Démontrer que deux vecteurs sont orthogonaux par le calcul',
    'Déterminer un vecteur normal à une droite et son équation cartésienne',
  ],
  teachingScope: {
    include: [
      'Le produit scalaire de deux vecteurs : un nombre, obtenu par la projection ou par les coordonnées',
      'u·v = x·x′ + y·y′ dans une base orthonormée, et u·v = ‖u‖ × ‖v‖ × cos(angle)',
      'Symétrie u·v = v·u et bilinéarité (ku)·v = k(u·v), u·(v + w) = u·v + u·w',
      'Deux vecteurs non nuls sont orthogonaux ⟺ leur produit scalaire est nul',
      'Vecteur normal à une droite, et équation cartésienne ax + by + c = 0 qui en découle',
    ],
    exclude: [
      'Le théorème d’Al-Kashi, les formules de polarisation et le calcul d’un angle par arccos (leçon « Produit scalaire : mesurer et démontrer »)',
      'La distance d’un point à une droite, l’équation d’un cercle et les lieux géométriques (leçon « Produit scalaire : mesurer et démontrer »)',
      'Le produit scalaire dans l’espace et le produit vectoriel (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les coordonnées d’une flèche, sa longueur, et ce qui se passe quand on l’étire ou qu’on en enchaîne deux.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'l-ombre-portee', path: `${LESSON_BASE_PATH}/l-ombre-portee`, title: 'L’ombre portée', desc: 'Fais tourner une flèche et regarde l’ombre de l’autre. Deux calculs qui n’ont rien à voir donnent le même nombre — et il tombe à zéro pile à l’angle droit.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire tourner' },
    { id: '02', number: 2, slug: 'le-nombre-a-deux-visages', path: `${LESSON_BASE_PATH}/le-nombre-a-deux-visages`, title: 'Le nombre à deux visages', desc: 'Ce nombre a un nom et une notation. Et deux formules pour le calculer, selon ce que l’énoncé te donne : des coordonnées, ou des longueurs et un angle.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P1', 'premiere_specialite_produit-scalaire-definir-1ere_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Nommer le nombre' },
    { id: '03', number: 3, slug: 'une-algebre-de-fleches', path: `${LESSON_BASE_PATH}/une-algebre-de-fleches`, title: 'Une algèbre de flèches', desc: 'Échange les deux flèches, étire-en une, enchaîne-en deux : constate ce que devient le nombre AVANT qu’on ne l’écrive en règles.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Manipuler' },
    { id: '04', number: 4, slug: 'demontrer-l-angle-droit', path: `${LESSON_BASE_PATH}/demontrer-l-angle-droit`, title: 'Démontrer l’angle droit', desc: 'Un dessin ne prouve rien. Un nombre nul, si. Quatre couples à trancher, dont un qui trompe l’œil.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P4', 'premiere_specialite_produit-scalaire-definir-1ere_P1'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Démontrer' },
    { id: '05', number: 5, slug: 'la-fleche-qui-tient-la-droite', path: `${LESSON_BASE_PATH}/la-fleche-qui-tient-la-droite`, title: 'La flèche qui tient la droite', desc: 'Une flèche orthogonale à une droite suffit à l’écrire tout entière : ax + by + c = 0, et les deux premiers nombres sont ses coordonnées.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_produit-scalaire-definir-1ere_P5', 'premiere_specialite_produit-scalaire-definir-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Écrire la droite' },
    { id: '06', number: 6, slug: 'mission-finale-l-angle-droit', path: `${LESSON_BASE_PATH}/mission-finale-l-angle-droit`, title: '🏆 Mission finale : l’angle droit', desc: 'Dix épreuves pour prouver que tu sais calculer ce nombre de deux façons, t’en servir comme d’une algèbre et démontrer un angle droit.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
