/**
 * Colinéarité et alignement — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 9 LPs (clé catalogue
 * 'seconde_colinearite_et_alignement', append-only) :
 *
 *   seconde_colinearite-alignement-2nde_P1  Comprendre la colinéarité
 *   seconde_colinearite-alignement-2nde_P2  Reconnaître deux vecteurs colinéaires
 *   seconde_colinearite-alignement-2nde_P3  Utiliser la proportionnalité des coordonnées
 *   seconde_colinearite-alignement-2nde_P4  Calculer un déterminant
 *   seconde_colinearite-alignement-2nde_P5  Utiliser le déterminant pour tester la colinéarité
 *   seconde_colinearite-alignement-2nde_P6  Déterminer si trois points sont alignés
 *   seconde_colinearite-alignement-2nde_P7  Déterminer si deux droites sont parallèles
 *   seconde_colinearite-alignement-2nde_P8  Résoudre un problème d'alignement
 *   seconde_colinearite-alignement-2nde_P9  Résoudre un problème de parallélisme
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : « même direction » est une
 * propriété VISIBLE (deux flèches sur le même rail, quelles que soient leur
 * longueur et leur sens) que l'on détecte EXACTEMENT par un nombre calculé
 * sur les coordonnées, det(u, v) = x y′ − y x′, nul quand le parallélogramme
 * construit sur u et v est plat. Alignement de trois points et parallélisme
 * de deux droites sont la même propriété, lue sur AB/AC et AB/CD.
 *
 * Fil : vecteur → direction → colinéarité → alignement → coordonnées
 * proportionnelles → déterminant → test symbolique. Objet porté : le
 * vecteur u(2 ; 1) et son rail, du module 1 au boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/colinearite-alignement-2nde';

export const LESSON_CONFIG = {
  id: 'colinearite-alignement-2nde',
  sequentialUnlock: true,
  title: 'Colinéarité et alignement',
  description:
    "Poser un vecteur sur le rail d'un autre, aligner trois points en déplaçant le troisième, puis découvrir le nombre qui détecte tout cela sans dessin : le déterminant, et ses deux usages, alignement et parallélisme.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 70,
  skills: [
    'Reconnaître deux vecteurs colinéaires',
    'Utiliser la proportionnalité des coordonnées',
    'Calculer un déterminant',
    'Décider un alignement ou un parallélisme par le calcul',
  ],
  teachingScope: {
    include: [
      'Même direction : même rail, quels que soient la longueur et le sens ; vecteurs colinéaires u et v = k·u',
      'Coordonnées proportionnelles, produits en croix, le vecteur nul colinéaire à tout vecteur',
      'det(u, v) = x y′ − y x′ ; interprétation : aire signée du parallélogramme ; det = 0 ⇔ colinéaires',
      'A, B, C alignés ⇔ AB et AC colinéaires ; (AB) ∥ (CD) ⇔ AB et CD colinéaires',
      'Problèmes : coordonnée manquante pour un alignement, parallélogramme, trapèze',
    ],
    exclude: [
      'Vecteur directeur et équation de droite (leçon « Équations de droites »)',
      'Positions relatives et intersection de deux droites (leçon dédiée)',
      'Le produit scalaire (Première)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète. Aucun module « À retenir » n'est attendu
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Prérequis venus d'AVANT cette leçon : lire des coordonnées dans un
  // repère (6e), et les vecteurs de la leçon précédente — composante, le
  // vecteur lui-même, k·u, l'opposé, l'égalité de deux vecteurs. La
  // colinéarité elle-même ('colineaire') est le contenu propre de cette
  // leçon : elle n'est jamais un prérequis.
  priorKnowledge: ['abscisse', 'ordonnee', 'coordonnees', 'composante', 'vecteur'],
  knowledgeAudit: {
    ignore: [
      // « sécantes » (module 6, épreuve 9) nomme ce que sont (AD) et (BC)
      // dans un trapèze : le mot courant de collège (3e) pour deux droites
      // qui se coupent, employé pour DÉCRIRE une conclusion de géométrie —
      // pas une notion que cette leçon enseigne ni exige : aucune question
      // ne demande de reconnaître ou de justifier des droites sécantes.
      { term: 'secantes', reason: 'vocabulaire de collège employé pour décrire une conclusion, hors périmètre de la leçon' },
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les vecteurs et leurs coordonnées.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-rail', path: `${LESSON_BASE_PATH}/le-rail`, title: 'Le rail', desc: 'Deux flèches partent du même point. Déplace la seconde : quand roule-t-elle sur le rail de la première ?', stage: 'trigger', teachesLearningPointIds: ['seconde_colinearite-alignement-2nde_P1', 'seconde_colinearite-alignement-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Déplacer la flèche' },
    { id: '02', number: 2, slug: 'trois-points-une-droite', path: `${LESSON_BASE_PATH}/trois-points-une-droite`, title: 'Trois points, une droite', desc: 'A et B sont fixés. Déplace C : quand les trois points sont-ils alignés — et que font alors les vecteurs AB et AC ?', stage: 'discovery', teachesLearningPointIds: ['seconde_colinearite-alignement-2nde_P6', 'seconde_colinearite-alignement-2nde_P1'], color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Déplacer C' },
    { id: '03', number: 3, slug: 'des-coordonnees-proportionnelles', path: `${LESSON_BASE_PATH}/des-coordonnees-proportionnelles`, title: 'Des coordonnées proportionnelles', desc: 'v = k·u : les coordonnées suivent le même facteur. Peut-on décider la colinéarité sans dessiner ?', stage: 'discovery', teachesLearningPointIds: ['seconde_colinearite-alignement-2nde_P3', 'seconde_colinearite-alignement-2nde_P2'], color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Régler k' },
    { id: '04', number: 4, slug: 'le-detecteur', path: `${LESSON_BASE_PATH}/le-detecteur`, title: 'Le détecteur', desc: 'Un nombre calculé sur les coordonnées, un parallélogramme qui s’aplatit : le déterminant détecte la colinéarité.', stage: 'manipulation', teachesLearningPointIds: ['seconde_colinearite-alignement-2nde_P4', 'seconde_colinearite-alignement-2nde_P5'], color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Annuler le déterminant' },
    { id: '05', number: 5, slug: 'alignement-et-parallelisme', path: `${LESSON_BASE_PATH}/alignement-et-parallelisme`, title: 'Alignement et parallélisme', desc: 'Trois points, un quadrilatère, une coordonnée manquante : le déterminant tranche là où l’œil hésite.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_colinearite-alignement-2nde_P6', 'seconde_colinearite-alignement-2nde_P7', 'seconde_colinearite-alignement-2nde_P8', 'seconde_colinearite-alignement-2nde_P9'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Résoudre' },
    { id: '06', number: 6, slug: 'mission-finale-le-detecteur', path: `${LESSON_BASE_PATH}/mission-finale-le-detecteur`, title: '🏆 Mission finale : le détecteur', desc: 'Dix épreuves pour prouver qu’aucun alignement ne t’échappe.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 13, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
