/**
 * Triangles — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX (et les objets `assessment`
 * doivent être écrits en toutes lettres — un helper les rendrait invisibles).
 * Les 11 LPs de cette leçon (clé catalogue '3e_triangles', append-only) :
 *
 *   3e_triangles-3e_P1   Reconnaître et caractériser les différents types de triangles
 *   3e_triangles-3e_P2   Utiliser les propriétés des triangles particuliers
 *   3e_triangles-3e_P3   Identifier les côtés et angles d'un triangle
 *   3e_triangles-3e_P4   Utiliser la somme des angles d'un triangle
 *   3e_triangles-3e_P5   Construire un triangle à partir de données données
 *   3e_triangles-3e_P6   Construire un triangle répondant à des contraintes géométriques
 *   3e_triangles-3e_P7   Calculer des longueurs ou des angles dans un triangle
 *   3e_triangles-3e_P8   Utiliser les propriétés géométriques pour justifier une construction
 *   3e_triangles-3e_P9   Formuler et vérifier une conjecture sur une configuration triangulaire
 *   3e_triangles-3e_P10  Rédiger un raisonnement géométrique à partir des propriétés d'un triangle
 *   3e_triangles-3e_P11  Résoudre des problèmes géométriques faisant intervenir des triangles
 *
 * L'IDÉE CENTRALE : le NOM d'un triangle est une CONSÉQUENCE de ses mesures,
 * jamais une étiquette. La leçon ne commence donc pas par une liste de
 * définitions mais par un compas dont les arcs refusent de se croiser
 * (module 1), puis par une figure dont le nom se recalcule sous les doigts
 * (module 2). Le vocabulaire arrive après le geste.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : propriétés générales et triangles
 * particuliers, inégalité triangulaire, somme des angles, constructions,
 * droite des milieux, rédaction d'un raisonnement. Thalès, Pythagore et la
 * trigonométrie ont chacun leur propre leçon dans ce chapitre et ne sont pas
 * traités ici — seulement annoncés.
 *
 * Fil narratif unique : « le chantier de la charpente », repris figé dans la
 * synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/triangles-3e';

export const LESSON_CONFIG = {
  id: 'triangles-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Triangles',
  description:
    "Découvrir au compas pourquoi certains triangles n'existent pas, voir le nom d'une figure se recalculer quand on la déforme, puis calculer des angles et rédiger de vraies justifications.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔺',
  estimatedDurationMin: 87,
  skills: [
    'Reconnaître et caractériser les différents types de triangles',
    'Utiliser les propriétés des triangles particuliers',
    "Identifier les côtés et angles d'un triangle",
    "Utiliser la somme des angles d'un triangle",
    'Construire un triangle à partir de données données',
    'Construire un triangle répondant à des contraintes géométriques',
    'Calculer des longueurs ou des angles dans un triangle',
    'Utiliser les propriétés géométriques pour justifier une construction',
    'Formuler et vérifier une conjecture sur une configuration triangulaire',
    "Rédiger un raisonnement géométrique à partir des propriétés d'un triangle",
    'Résoudre des problèmes géométriques faisant intervenir des triangles',
  ],
  teachingScope: {
    include: [
      'Inégalité triangulaire et constructibilité',
      'Triangles particuliers : isocèle, équilatéral, rectangle',
      'Somme des angles d’un triangle',
      'Construction à partir de trois longueurs ou de contraintes',
      'Droite des milieux',
      'Rédaction d’un raisonnement géométrique',
    ],
    exclude: [
      'Théorème de Thalès (leçon dédiée du même chapitre)',
      'Théorème de Pythagore (leçon dédiée du même chapitre)',
      'Trigonométrie (leçon dédiée du même chapitre)',
      'Droites remarquables et points de concours (hauteurs, médianes, bissectrices)',
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
      id: '01', number: 1, slug: 'trois-poutres', path: `${LESSON_BASE_PATH}/trois-poutres`,
      title: 'Trois poutres', desc: 'Deux arcs de compas qui refusent de se croiser : ce triangle n’existe pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_triangles-3e_P5'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Ouvrir le compas',
    },
    {
      id: '02', number: 2, slug: 'le-triangle-qui-change-de-nom', path: `${LESSON_BASE_PATH}/le-triangle-qui-change-de-nom`,
      title: 'Le triangle qui change de nom', desc: 'Déforme la figure : son nom se recalcule tout seul.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_triangles-3e_P1', '3e_triangles-3e_P2', '3e_triangles-3e_P3',
      ],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Déformer',
    },
    {
      id: '03', number: 3, slug: 'cent-quatre-vingts-degres', path: `${LESSON_BASE_PATH}/cent-quatre-vingts-degres`,
      title: '180°, quoi qu’il arrive', desc: 'Essaie de faire varier la somme des angles. Tu n’y arriveras pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_triangles-3e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Chercher l’invariant',
    },
    {
      id: '04', number: 4, slug: 'construire-sous-contrainte', path: `${LESSON_BASE_PATH}/construire-sous-contrainte`,
      title: 'Construire sous contrainte', desc: 'Trois constructions — dont une impossible, à diagnostiquer.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_triangles-3e_P5', '3e_triangles-3e_P6', '3e_triangles-3e_P8',
      ],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '05', number: 5, slug: 'calculer-sans-mesurer', path: `${LESSON_BASE_PATH}/calculer-sans-mesurer`,
      title: 'Calculer sans mesurer', desc: 'Les figures ne portent plus aucune mesure : il faut raisonner.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_triangles-3e_P7', '3e_triangles-3e_P2'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '06', number: 6, slug: 'justifier', path: `${LESSON_BASE_PATH}/justifier`,
      title: 'Justifier', desc: 'Assemble une démonstration : donnée, propriété, conclusion.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_triangles-3e_P10', '3e_triangles-3e_P8'],
      color: 'blue', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Rédiger',
    },
    {
      id: '07', number: 7, slug: 'conjecturer-puis-prouver', path: `${LESSON_BASE_PATH}/conjecturer-puis-prouver`,
      title: 'Conjecturer, puis prouver', desc: 'Trois relevés sur trois formes : la droite des milieux ne bouge pas.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_triangles-3e_P9', '3e_triangles-3e_P11', '3e_triangles-3e_P7',
      ],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Expérimenter',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-la-charpente', path: `${LESSON_BASE_PATH}/mission-finale-la-charpente`,
      title: '🏆 Mission finale : la charpente', desc: 'Dix épreuves pour prouver que tu maîtrises les triangles.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
