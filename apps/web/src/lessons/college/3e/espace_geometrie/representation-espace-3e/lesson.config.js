/**
 * Représentation de l'espace — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 10 LPs de cette leçon (clé catalogue '3e_representations_espace') :
 *
 *   3e_representation-espace-3e_P1   Reconnaître les principaux solides usuels
 *   3e_representation-espace-3e_P2   Identifier les faces, arêtes et sommets
 *   3e_representation-espace-3e_P3   Lire une représentation en perspective
 *   3e_representation-espace-3e_P4   Distinguer les éléments visibles et cachés
 *   3e_representation-espace-3e_P5   Identifier un solide à partir de différentes représentations
 *   3e_representation-espace-3e_P6   Changer de point de vue sur un solide
 *   3e_representation-espace-3e_P7   Associer différentes représentations d'un même solide
 *   3e_representation-espace-3e_P8   Produire une représentation adaptée d'un solide
 *   3e_representation-espace-3e_P9   Raisonner sur les positions relatives dans l'espace
 *   3e_representation-espace-3e_P10  Résoudre des problèmes à partir de représentations
 *
 * L'IDÉE CENTRALE : un dessin plat n'est PAS le solide. C'est une projection,
 * et ce qu'elle cache dépend du point de vue. Le module 3 fait donc suivre à
 * l'élève UNE arête précise pendant qu'il tourne le cube, et il la voit passer
 * de pointillé à trait plein — la même arête, deux états.
 *
 * CE QUE CETTE LEÇON EXIGEAIT DE NOUVEAU : la leçon 6e « Solides et patrons »
 * dessine ses solides avec des sommets écrits en dur ; on ne peut ni les
 * tourner, ni calculer ce qui est caché. Cette leçon repose donc sur un
 * nouveau module partagé, `common/utils/geometry3d.js` : un solide y est un
 * modèle sommets/arêtes/faces, la visibilité est CALCULÉE (une arête est
 * cachée quand toutes ses faces sont tournées de l'autre côté), et les comptes
 * viennent du modèle, jamais du dessin.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : représentation et lecture de
 * l'espace. Les sections de solides, le volume de la boule et les
 * agrandissements de volumes ne sont pas traités — le catalogue ne les demande
 * pas dans ses `pointsToLearn`.
 *
 * Fil narratif unique : « l'atelier de l'architecte », repris figé dans la
 * synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/representation-espace-3e';

export const LESSON_CONFIG = {
  id: 'representation-espace-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Représentation de l’espace',
  description:
    "Découvrir que trois dessins très différents montrent le même cube, suivre une arête qui passe de pointillé à trait plein quand on tourne, lire les trois vues d'un plan et raisonner sur des droites qui ne se rencontrent jamais sans être parallèles.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧊',
  estimatedDurationMin: 88,
  skills: [
    'Reconnaître les principaux solides usuels',
    "Identifier les faces, arêtes et sommets d'un solide",
    "Lire une représentation en perspective d'un solide",
    "Distinguer les éléments visibles et cachés d'un solide",
    'Identifier un solide à partir de différentes représentations',
    'Changer de point de vue sur un solide',
    "Associer différentes représentations d'un même solide",
    "Produire une représentation adaptée d'un solide",
    'Raisonner sur les positions relatives de points, droites et plans dans l’espace',
    'Résoudre des problèmes à partir de représentations de l’espace',
  ],
  teachingScope: {
    include: [
      'Solides usuels : cube, pavé, prisme, pyramide, et solides courbes',
      'Faces, arêtes, sommets et relation d’Euler',
      'Perspective cavalière : règles et arêtes cachées',
      'Changement de point de vue, identification d’un solide',
      'Les trois vues du dessin technique',
      'Positions relatives de deux droites de l’espace',
    ],
    exclude: [
      'Sections de solides par un plan',
      'Volume de la boule et de la sphère',
      'Agrandissement et réduction des volumes',
      'Patrons (traités en 6e) et coordonnées dans l’espace',
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
      id: '01', number: 1, slug: 'trois-dessins-un-objet', path: `${LESSON_BASE_PATH}/trois-dessins-un-objet`,
      title: 'Trois dessins, un objet', desc: 'Trois images très différentes… et un seul cube.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_representation-espace-3e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Tourner',
    },
    {
      id: '02', number: 2, slug: 'faces-aretes-sommets', path: `${LESSON_BASE_PATH}/faces-aretes-sommets`,
      title: 'Faces, arêtes, sommets', desc: 'Compter ce que le dessin cache, et découvrir une relation.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_representation-espace-3e_P1', '3e_representation-espace-3e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Compter',
    },
    {
      id: '03', number: 3, slug: 'ce-que-le-dessin-cache', path: `${LESSON_BASE_PATH}/ce-que-le-dessin-cache`,
      title: 'Ce que le dessin cache', desc: 'Suis une arête : elle passe de pointillé à plein sous tes yeux.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_representation-espace-3e_P4', '3e_representation-espace-3e_P6'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Observer',
    },
    {
      id: '04', number: 4, slug: 'tourner-pour-verifier', path: `${LESSON_BASE_PATH}/tourner-pour-verifier`,
      title: 'Tourner pour vérifier', desc: 'Un solide mystère, une vue ambiguë : change d’angle.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_representation-espace-3e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Identifier',
    },
    {
      id: '05', number: 5, slug: 'les-trois-vues', path: `${LESSON_BASE_PATH}/les-trois-vues`,
      title: 'Les trois vues', desc: 'Comme sur un plan d’architecte : de face, de dessus, de côté.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_representation-espace-3e_P7'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Projeter',
    },
    {
      id: '06', number: 6, slug: 'la-perspective-cavaliere', path: `${LESSON_BASE_PATH}/la-perspective-cavaliere`,
      title: 'La perspective cavalière', desc: 'Une convention, et ses trois règles.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_representation-espace-3e_P8', '3e_representation-espace-3e_P3'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Formaliser',
    },
    {
      id: '07', number: 7, slug: 'dans-le-cube', path: `${LESSON_BASE_PATH}/dans-le-cube`,
      title: 'Dans le cube', desc: 'Deux droites qui ne se croisent jamais — sans être parallèles.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_representation-espace-3e_P9', '3e_representation-espace-3e_P10'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Raisonner',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-latelier', path: `${LESSON_BASE_PATH}/mission-finale-latelier`,
      title: '🏆 Mission finale : l’atelier', desc: 'Dix épreuves pour prouver que tu lis l’espace.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
