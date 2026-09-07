/**
 * Positions relatives de deux droites — 2nde.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres. Les 8 LPs de cette leçon (clé
 * catalogue 'seconde_positions_relatives_droites', append-only) :
 *
 *   seconde_positions-relatives-droites-2nde_P1  Reconnaître deux droites parallèles
 *   seconde_positions-relatives-droites-2nde_P2  Reconnaître deux droites sécantes
 *   seconde_positions-relatives-droites-2nde_P3  Comparer les pentes de deux droites
 *   seconde_positions-relatives-droites-2nde_P4  Utiliser les équations pour étudier le parallélisme
 *   seconde_positions-relatives-droites-2nde_P5  Déterminer le point d'intersection de deux droites
 *   seconde_positions-relatives-droites-2nde_P6  Résoudre un système associé à deux droites
 *   seconde_positions-relatives-droites-2nde_P7  Interpréter graphiquement une intersection
 *   seconde_positions-relatives-droites-2nde_P8  Résoudre un problème géométrique avec deux droites
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : deux droites ont 0, 1 ou une
 * infinité de points communs. Leur DIRECTION (un vecteur, une pente, les
 * coefficients de l'équation) décide entre sécantes et parallèles ; leur
 * POSITION décide ensuite entre strictement parallèles et confondues. Le
 * point commun de deux droites sécantes est la solution commune de leurs
 * deux équations — un système.
 *
 * Fil narratif : « le laboratoire des deux droites » — deux trajectoires
 * rectilignes (deux drones vus du dessus) que l'élève oriente et déplace.
 * Le même plan revient dans chaque module (poignées, puis curseurs m et p,
 * puis figé) et sur la carte des connaissances.
 *
 * PÉRIMÈTRE : la leçon RÉACTIVE vecteurs directeurs, pente et équations
 * (leçons « Vecteurs », « Colinéarité et alignement », « Équations de
 * droites ») sans les réenseigner. Vecteur normal et produit scalaire :
 * Première.
 *
 * CARTE DES CONNAISSANCES (docs/architecture/KNOWLEDGE_MAP.md) : pas de
 * module « À retenir ». Chaque module se termine sur l'état courant de la
 * carte (knowledge.jsx → KnowledgeSnapshot) et la synthèse du test final
 * affiche la carte complète. Implémentation partagée : lessons/common/knowledge.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/positions-relatives-droites-2nde';

export const LESSON_CONFIG = {
  id: 'positions-relatives-droites-2nde',
  // Connaissance SUPPOSÉE acquise (état A du contrat) : la colinéarité vient
  // des leçons « Vecteurs » et « Colinéarité et alignement », et le module 0
  // la mesure explicitement. On ne déclare QUE ce que le module 0 diagnostique
  // — déclarer davantage produit des W_PRIOR_NOT_DIAGNOSED.
  priorKnowledge: ['colineaire'],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Positions relatives de deux droites',
  description:
    "Orienter et déplacer deux droites jusqu'à les faire se couper, devenir parallèles ou se confondre, puis découvrir que les nombres — vecteurs directeurs, pentes, équations — décident sans dessin, et que le point commun de deux droites sécantes est la solution d'un système.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '✖️',
  estimatedDurationMin: 70,
  skills: [
    'Reconnaître deux droites parallèles ou sécantes',
    'Comparer des pentes et des vecteurs directeurs',
    'Utiliser les équations pour étudier le parallélisme',
    "Déterminer le point d'intersection par un système",
    'Interpréter graphiquement une intersection',
    'Résoudre un problème géométrique avec deux droites',
  ],
  teachingScope: {
    include: [
      'Trois positions : sécantes (1 point commun), strictement parallèles (0), confondues (une infinité)',
      'Critère de direction : det(u, v) = 0 ⟺ parallèles ou confondues ; pentes égales ⟺ parallèles (droites non verticales)',
      'Critère sur les équations réduites y = mx + p (m décide, p départage) et cartésiennes ax + by + c = 0 (a₁b₂ − a₂b₁)',
      'Point d’intersection = solution du système ; 0, 1 ou une infinité de solutions et leur lecture graphique',
      'Problèmes : trajectoires qui se croisent, parallèle passant par un point, (AB) ∥ (CD)',
    ],
    exclude: [
      'Vecteur normal et orthogonalité (Première)',
      'La construction des équations de droites (leçon « Équations de droites »)',
      'Le déterminant comme objet (leçon « Colinéarité et alignement ») — ici il est seulement réutilisé',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les équations de droites, les vecteurs et les systèmes.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-laboratoire-des-deux-droites', path: `${LESSON_BASE_PATH}/le-laboratoire-des-deux-droites`,
      title: 'Le laboratoire des deux droites', desc: 'Deux trajectoires. Oriente-les, déplace-les : combien de points communs ? Fais apparaître les trois situations.',
      stage: 'trigger',
      teachesLearningPointIds: ['seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Manipuler les droites',
    },
    {
      id: '02', number: 2, slug: 'la-direction', path: `${LESSON_BASE_PATH}/la-direction`,
      title: 'La direction', desc: 'Sans dessin : les vecteurs directeurs et les pentes décident. Un nombre s’annule exactement quand les droites deviennent parallèles.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_positions-relatives-droites-2nde_P3', 'seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P2'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Comparer les directions',
    },
    {
      id: '03', number: 3, slug: 'les-equations', path: `${LESSON_BASE_PATH}/les-equations`,
      title: 'Les équations', desc: 'Règle m₂ et p₂ : m décide sécantes ou parallèles, p départage parallèles et confondues. Et l’équation cartésienne.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_positions-relatives-droites-2nde_P4', 'seconde_positions-relatives-droites-2nde_P1', 'seconde_positions-relatives-droites-2nde_P2'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Régler m et p',
    },
    {
      id: '04', number: 4, slug: 'le-point-d-intersection', path: `${LESSON_BASE_PATH}/le-point-d-intersection`,
      title: 'Le point d’intersection', desc: 'Le point commun se déplace, sort du cadre, revient : il vérifie les deux équations — c’est la solution du système.',
      stage: 'manipulation',
      teachesLearningPointIds: ['seconde_positions-relatives-droites-2nde_P5', 'seconde_positions-relatives-droites-2nde_P6', 'seconde_positions-relatives-droites-2nde_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Trouver le point commun',
    },
    {
      id: '05', number: 5, slug: 'deux-trajectoires', path: `${LESSON_BASE_PATH}/deux-trajectoires`,
      title: 'Deux trajectoires', desc: 'Deux drones qui se croisent, une route parallèle par un point, (AB) et (CD) : décider, calculer, conclure.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['seconde_positions-relatives-droites-2nde_P8', 'seconde_positions-relatives-droites-2nde_P5', 'seconde_positions-relatives-droites-2nde_P6', 'seconde_positions-relatives-droites-2nde_P7', 'seconde_positions-relatives-droites-2nde_P4'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '06', number: 6, slug: 'mission-finale-le-croisement', path: `${LESSON_BASE_PATH}/mission-finale-le-croisement`,
      title: '🏆 Mission finale : le croisement', desc: 'Dix épreuves pour prouver que tu sais où deux droites se rencontrent — ou qu’elles ne se rencontrent pas.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
