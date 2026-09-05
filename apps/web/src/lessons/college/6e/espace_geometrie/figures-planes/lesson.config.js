/**
 * Figures planes — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 10 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_figures-planes_P1   Reconnaître les principales figures planes
 *   6e_figures-planes_P2   Identifier les côtés et les sommets d'une figure
 *   6e_figures-planes_P3   Identifier et comparer les angles d'une figure
 *   6e_figures-planes_P4   Reconnaître et caractériser un carré
 *   6e_figures-planes_P5   Reconnaître et caractériser un rectangle
 *   6e_figures-planes_P6   Reconnaître et caractériser un triangle
 *   6e_figures-planes_P7   Décrire une figure à partir de ses propriétés
 *   6e_figures-planes_P8   Comparer des figures à partir de leurs propriétés
 *   6e_figures-planes_P9   Identifier une figure à partir d'indices géométriques
 *   6e_figures-planes_P10  Construire une figure répondant à des propriétés données
 *
 * PÉRIMÈTRE OFFICIEL : vocabulaire des polygones ; quadrilatères (rectangle,
 * losange, carré) ; triangles (isocèle, équilatéral, rectangle) ; cercle
 * (centre, rayon, diamètre, corde). Aucune exclusion déclarée — mais on reste
 * à la CARACTÉRISATION par propriétés, sans démonstration.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/figures-planes';

export const LESSON_CONFIG = {
  id: 'figures-planes',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Figures planes',
  description:
    'Caractériser les figures par leurs propriétés — côtés, sommets, angles — plutôt que par leur allure, puis les identifier et les construire.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔷',
  estimatedDurationMin: 80,
  skills: [
    'Reconnaître les principales figures planes',
    'Identifier côtés, sommets et angles d’une figure',
    'Caractériser un carré, un rectangle, un triangle',
    'Décrire et comparer des figures par leurs propriétés',
    'Identifier une figure à partir d’indices',
    'Construire une figure sous contraintes',
  ],
  teachingScope: {
    include: [
      'Vocabulaire des polygones',
      'Quadrilatères (rectangle, losange, carré)',
      'Triangles (isocèle, équilatéral, rectangle)',
      'Cercle (centre, rayon, diamètre, corde)',
    ],
    exclude: ['Démonstrations', 'Aires et périmètres (traités ailleurs)', 'Symétrie (leçon dédiée)'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-faux-carre', path: `${LESSON_BASE_PATH}/le-faux-carre`,
      title: 'Le faux carré', desc: 'Cette figure ressemble à un carré. Mesure-la : elle n’en est pas un.',
      stage: 'trigger', teachesLearningPointIds: ['6e_figures-planes_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'cotes-sommets-angles', path: `${LESSON_BASE_PATH}/cotes-sommets-angles`,
      title: 'Côtés, sommets, angles', desc: 'Les trois choses qu’on mesure sur une figure — et rien d’autre.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_figures-planes_P2', '6e_figures-planes_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Inspecter' },
    { id: '03', number: 3, slug: 'le-laboratoire-des-quadrilateres', path: `${LESSON_BASE_PATH}/le-laboratoire-des-quadrilateres`,
      title: 'Le laboratoire des quadrilatères', desc: 'Déforme la figure : regarde quelles propriétés survivent.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_figures-planes_P4', '6e_figures-planes_P5'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Déformer' },
    { id: '04', number: 4, slug: 'la-famille-des-triangles', path: `${LESSON_BASE_PATH}/la-famille-des-triangles`,
      title: 'La famille des triangles', desc: 'Isocèle, équilatéral, rectangle : trois façons d’être un triangle.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_figures-planes_P6'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Explorer' },
    { id: '05', number: 5, slug: 'la-carte-d-identite', path: `${LESSON_BASE_PATH}/la-carte-d-identite`,
      title: 'La carte d’identité des figures', desc: 'Chaque figure a sa liste de propriétés — la fiche à retenir.',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_figures-planes_P7', '6e_figures-planes_P8'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Retenir' },
    { id: '06', number: 6, slug: 'l-enquete-geometrique', path: `${LESSON_BASE_PATH}/l-enquete-geometrique`,
      title: 'L’enquête géométrique', desc: 'Trois indices, une seule figure possible. Laquelle ?',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_figures-planes_P9'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Enquêter' },
    { id: '07', number: 7, slug: 'construire-sous-contraintes', path: `${LESSON_BASE_PATH}/construire-sous-contraintes`,
      title: 'Construire sous contraintes', desc: 'On te donne les propriétés : fabrique la figure qui les vérifie toutes.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_figures-planes_P10'],
      color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Construire' },
    { id: '08', number: 8, slug: 'mission-finale-le-vitrail', path: `${LESSON_BASE_PATH}/mission-finale-le-vitrail`,
      title: '🏆 Mission finale : le vitrail', desc: 'Dix épreuves d’expertise : reconnaître, comparer, caractériser.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
