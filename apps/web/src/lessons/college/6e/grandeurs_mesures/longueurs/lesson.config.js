/**
 * Longueurs — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 6 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_longueurs_P1  Choisir une unité de longueur adaptée
 *   6e_longueurs_P2  Mesurer une longueur avec une règle, sans le piège du zéro
 *   6e_longueurs_P3  Comprendre les relations entre km, m, cm et mm
 *   6e_longueurs_P4  Convertir une longueur en comprenant pourquoi la valeur change
 *   6e_longueurs_P5  Estimer un ordre de grandeur
 *   6e_longueurs_P6  Calculer le périmètre d'un polygone
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/longueurs';

export const LESSON_CONFIG = {
  id: 'longueurs',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Longueurs',
  description:
    'Mesurer, comparer, convertir et calculer des longueurs dans des situations concrètes : du mètre ruban au plan du quartier.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 86,
  skills: [
    'Choisir une unité de longueur adaptée à une situation',
    'Mesurer une longueur avec une règle, sans se laisser piéger par le zéro',
    'Comprendre les relations entre km, m, cm et mm',
    'Convertir une longueur en comprenant pourquoi la valeur change',
    'Estimer un ordre de grandeur avant de mesurer ou de calculer',
    'Calculer le périmètre d’un polygone',
  ],
  teachingScope: {
    include: [
      'Mesurer des longueurs',
      "Conversions d'unités de longueur (km, m, cm, mm)",
      'Périmètres de polygones',
    ],
    exclude: ['Calculs avec Pi (au-delà d’une première approche)', 'Aires', 'Masses', 'Contenances', 'Durées', 'Angles'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'quelle-unite', path: `${LESSON_BASE_PATH}/quelle-unite`,
      title: 'Mission : quelle unité ?', desc: 'La largeur d’un cahier, la distance Paris–Lyon : une seule unité pour tout mesurer ?',
      stage: 'trigger', teachesLearningPointIds: ['6e_longueurs_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'mesurer-comparer', path: `${LESSON_BASE_PATH}/mesurer-comparer`,
      title: 'Mesurer et comparer', desc: 'La règle ne commence pas toujours où l’objet commence : attention au piège du zéro.',
      stage: 'discovery', teachesLearningPointIds: ['6e_longueurs_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Mesurer' },
    { id: '03', number: 3, slug: 'construire-unites', path: `${LESSON_BASE_PATH}/construire-unites`,
      title: 'Construire les unités', desc: 'Km, m, cm, mm : une même longueur, plusieurs façons de l’écrire.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_longueurs_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Construire' },
    { id: '04', number: 4, slug: 'convertir', path: `${LESSON_BASE_PATH}/convertir`,
      title: 'Convertir', desc: 'Passer d’une unité à l’autre en comprenant pourquoi le nombre change.',
      stage: 'formalization', teachesLearningPointIds: ['6e_longueurs_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Convertir' },
    { id: '05', number: 5, slug: 'choisir-estimer', path: `${LESSON_BASE_PATH}/choisir-estimer`,
      title: 'Choisir et estimer', desc: 'Quelle unité choisir ? Quel ordre de grandeur attendre avant de mesurer ?',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_longueurs_P5'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Estimer' },
    { id: '06', number: 6, slug: 'perimetres', path: `${LESSON_BASE_PATH}/perimetres`,
      title: 'Périmètres', desc: 'Le périmètre, c’est la longueur du contour : en faire le tour, puis calculer.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_longueurs_P6'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Calculer' },
    { id: '07', number: 7, slug: 'mission-finale', path: `${LESSON_BASE_PATH}/mission-finale`,
      title: '🏆 Mission finale : le parcours', desc: 'Un parcours sportif de 25 m sur 12 m : mobilise tout ce que tu as appris.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 16, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
