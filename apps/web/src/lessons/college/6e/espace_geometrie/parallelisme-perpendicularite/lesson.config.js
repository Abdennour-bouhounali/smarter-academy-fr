/**
 * Parallélisme et perpendicularité — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 10 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_parallelisme-perpendicularite_P1   Reconnaître deux droites parallèles
 *   6e_parallelisme-perpendicularite_P2   Comprendre que deux droites parallèles ne se coupent pas
 *   6e_parallelisme-perpendicularite_P3   Reconnaître deux droites perpendiculaires
 *   6e_parallelisme-perpendicularite_P4   Comprendre le rôle de l'angle droit dans la perpendicularité
 *   6e_parallelisme-perpendicularite_P5   Identifier des situations de parallélisme et de perpendicularité
 *   6e_parallelisme-perpendicularite_P6   Vérifier le parallélisme avec les instruments adaptés
 *   6e_parallelisme-perpendicularite_P7   Vérifier la perpendicularité avec une équerre
 *   6e_parallelisme-perpendicularite_P8   Construire une droite parallèle à une droite donnée
 *   6e_parallelisme-perpendicularite_P9   Construire une droite perpendiculaire à une droite donnée
 *   6e_parallelisme-perpendicularite_P10  Résoudre des problèmes utilisant le parallélisme et la perpendicularité
 *
 * ATTENTION CATALOGUE : la clé smaMetadata est '6e_paralleles_perpendiculaires'
 * (id de l'objet officiel), et non '6e_parallelisme_perpendicularite'.
 *
 * PÉRIMÈTRE OFFICIEL : inclut la distance d'un point à une droite et le tracé
 * à la règle et à l'équerre ; exclut les démonstrations par angles
 * alternes-internes.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/parallelisme-perpendicularite';

export const LESSON_CONFIG = {
  id: 'parallelisme-perpendicularite',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // Formalisation continue par la carte : chaque module pose ses briques et se
  // termine sur l'état courant de la carte (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A) : exactement ce que les cinq
  // questions du module 0 mesurent — la droite et sa notation, l'angle droit
  // et sa mesure. Le parallélisme et la perpendicularité, eux, sont l'objet
  // même de la leçon et sont établis par ses briques.
  priorKnowledge: ['notation-segment', 'demi-droite', 'angle-droit', 'angle-aigu-obtus'],
  title: 'Parallélisme et perpendicularité',
  description:
    'Reconnaître, vérifier et construire des droites parallèles et perpendiculaires, avec la règle et l’équerre, jusqu’au plus court chemin d’un point à une droite.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 89,
  skills: [
    'Reconnaître deux droites parallèles à l’écart constant',
    'Comprendre que deux parallèles ne se coupent jamais',
    'Reconnaître deux droites perpendiculaires et l’angle droit',
    'Repérer ces relations dans des situations réelles',
    'Vérifier avec la règle et l’équerre',
    'Construire une parallèle et une perpendiculaire',
    'Résoudre un problème de plus court chemin',
  ],
  teachingScope: {
    include: [
      'Reconnaître et tracer des droites parallèles et perpendiculaires avec règle et équerre',
      'Distance d’un point à une droite',
    ],
    exclude: [
      'Démonstrations avec angles alternes-internes',
      'Théorème de Thalès',
      'Équations de droites',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'les-rails-qui-ne-se-croisent-jamais', path: `${LESSON_BASE_PATH}/les-rails-qui-ne-se-croisent-jamais`,
      title: 'Les rails qui ne se croisent jamais', desc: 'Prolonge les deux droites : une des paires finit par se couper. Laquelle ?',
      stage: 'trigger',
      teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P1', '6e_parallelisme-perpendicularite_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'l-ecart-constant', path: `${LESSON_BASE_PATH}/l-ecart-constant`,
      title: 'L’écart constant', desc: 'Fais glisser le point : si l’écart ne bouge jamais, elles sont parallèles.',
      stage: 'discovery', teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P1'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Mesurer l’écart' },
    { id: '03', number: 3, slug: 'l-angle-droit', path: `${LESSON_BASE_PATH}/l-angle-droit`,
      title: 'L’angle droit', desc: 'Tourne la droite jusqu’au déclic : le coin parfait, ni plus ni moins.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P3', '6e_parallelisme-perpendicularite_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Tourner' },
    { id: '04', number: 4, slug: 'le-chasseur-de-relations', path: `${LESSON_BASE_PATH}/le-chasseur-de-relations`,
      title: 'Le chasseur de relations', desc: 'Dans la ville, sur la feuille, sur un plan : repère les deux relations.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P5'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Repérer' },
    { id: '05', number: 5, slug: 'poser-l-equerre', path: `${LESSON_BASE_PATH}/poser-l-equerre`,
      title: 'Poser l’équerre', desc: 'Le rituel en deux gestes : le côté sur la droite, le sommet sur le point.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P6', '6e_parallelisme-perpendicularite_P7'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Vérifier' },
    { id: '06', number: 6, slug: 'les-deux-relations', path: `${LESSON_BASE_PATH}/les-deux-relations`,
      title: 'Les deux relations', desc: 'Ce qui change, ce qui ne change jamais : la fiche à retenir.',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P2', '6e_parallelisme-perpendicularite_P4'],
      color: 'blue', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'Retenir' },
    { id: '07', number: 7, slug: 'l-atelier-de-construction', path: `${LESSON_BASE_PATH}/l-atelier-de-construction`,
      title: 'L’atelier de construction', desc: 'Trace la parallèle, puis la perpendiculaire — avec les instruments.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P8', '6e_parallelisme-perpendicularite_P9'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire' },
    { id: '08', number: 8, slug: 'le-chemin-le-plus-court', path: `${LESSON_BASE_PATH}/le-chemin-le-plus-court`,
      title: 'Le chemin le plus court', desc: 'Du point à la route : quel trajet est le plus court ? Et pourquoi celui-là ?',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_parallelisme-perpendicularite_P10'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Résoudre' },
    { id: '09', number: 9, slug: 'mission-finale-le-quartier', path: `${LESSON_BASE_PATH}/mission-finale-le-quartier`,
      title: '🏆 Mission finale : le plan du quartier', desc: 'Dix épreuves d’urbaniste : rues, trottoirs et distances.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
