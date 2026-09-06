/**
 * Contenances — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 6 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_contenances_P1  Comparer des contenances en transvasant un liquide
 *   6e_contenances_P2  Mesurer une contenance à l'aide d'un récipient gradué
 *   6e_contenances_P3  Choisir une unité de contenance adaptée à une situation
 *   6e_contenances_P4  Comprendre les relations entre L, dL, cL et mL
 *   6e_contenances_P5  Convertir une contenance en comprenant pourquoi la valeur change
 *   6e_contenances_P6  Relier 1 L à 1 dm³ et résoudre des problèmes concrets
 *
 * P6 n'était enseigné par AUCUN module : la leçon sautait l'étape
 * `practice_lab` et passait de la formalisation des conversions au boss
 * final, où « 1 L = 1 dm³ » n'était qu'un titre. Le module 6
 * (« L'atelier du bar à jus ») comble ce trou par une vraie mise en
 * pratique — verser un litre dans un cube de 1 dm d'arête, composer des
 * commandes exactes, résoudre un problème à deux unités — et le boss est
 * devenu le module 7.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/contenances';

export const LESSON_CONFIG = {
  id: 'contenances',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques au point de besoin et se termine sur l'état
  // courant de la carte (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : lire une graduation régulière et enchaîner des
  // multiplications par 10 — exactement ce que mesurent les cinq questions du
  // module 0, et rien d'autre. Tout le reste (la contenance, le litre,
  // l'escalier L/dL/cL/mL, la conversion, le lien avec le décimètre cube) est
  // établi dans la leçon même (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
  priorKnowledge: ['calcul-numerique', 'multiplication-repetee'],
  title: 'Contenances',
  description:
    'Comparer, mesurer, choisir la bonne unité et convertir des contenances dans des situations concrètes : du verre au bar à jus.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  totalModules: 8,
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '💧',
  estimatedDurationMin: 78,
  skills: [
    'Comparer des contenances en transvasant un liquide',
    'Mesurer une contenance à l’aide d’un récipient gradué',
    'Choisir une unité de contenance adaptée à une situation',
    'Comprendre les relations entre L, dL, cL et mL',
    'Convertir une contenance en comprenant pourquoi la valeur change',
    'Relier 1 L à 1 dm³ et résoudre des problèmes concrets',
  ],
  teachingScope: {
    include: ['Unités de contenance (L, dL, cL, mL)', 'Conversions', 'Lien avec le volume (1 L = 1 dm³)'],
    exclude: ['Calculs de volume de solides quelconques', 'Densité', 'Relation masse-volume'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic pour savoir par où commencer — jamais un examen.',
      color: 'teal', style: 'diagnostic', stage: 'prerequisite_check',
      estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'lequel-contient-le-plus', path: `${LESSON_BASE_PATH}/lequel-contient-le-plus`,
      title: 'Mission : lequel contient le plus ?', desc: 'Une bouteille, une cruche : laquelle contient le plus d’eau ?',
      color: 'indigo', style: 'featured', stage: 'trigger', teachesLearningPointIds: ['6e_contenances_P1'],
      estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'mesurer-une-contenance', path: `${LESSON_BASE_PATH}/mesurer-une-contenance`,
      title: 'Mesurer une contenance', desc: 'Le litre comme repère : remplir, lire, comparer.',
      color: 'sky', style: 'featured', stage: 'discovery', teachesLearningPointIds: ['6e_contenances_P2'],
      estimatedMin: 9, difficulty: 1, actionText: 'Mesurer' },
    { id: '03', number: 3, slug: 'unites-l-dl-cl-ml', path: `${LESSON_BASE_PATH}/unites-l-dl-cl-ml`,
      title: 'Les unités L, dL, cL, mL', desc: 'Quatre unités pour quatre échelles de contenance.',
      color: 'emerald', style: 'featured', stage: 'discovery', teachesLearningPointIds: ['6e_contenances_P3'],
      estimatedMin: 9, difficulty: 1, actionText: 'Choisir' },
    { id: '04', number: 4, slug: 'construire-les-relations', path: `${LESSON_BASE_PATH}/construire-les-relations`,
      title: 'Construire les relations', desc: 'Partager 1 L en 10 dL, en 100 cL, en 1000 mL.',
      color: 'violet', style: 'featured', stage: 'manipulation', teachesLearningPointIds: ['6e_contenances_P4'],
      estimatedMin: 10, difficulty: 2, actionText: 'Construire' },
    { id: '05', number: 5, slug: 'convertir-les-contenances', path: `${LESSON_BASE_PATH}/convertir-les-contenances`,
      title: 'Convertir les contenances', desc: 'Passer d’une unité à l’autre en comprenant pourquoi le nombre change.',
      color: 'rose', style: 'featured', stage: 'formalization', teachesLearningPointIds: ['6e_contenances_P5'],
      estimatedMin: 11, difficulty: 3, actionText: 'Convertir' },
    { id: '06', number: 6, slug: 'atelier-du-bar', path: `${LESSON_BASE_PATH}/atelier-du-bar`,
      title: 'L’atelier du bar à jus', desc: 'Le litre a une forme : verse-le dans un cube de 1 dm, puis prépare des commandes au centilitre près.',
      color: 'sky', style: 'featured', stage: 'practice_lab', teachesLearningPointIds: ['6e_contenances_P6'],
      estimatedMin: 12, difficulty: 3, actionText: 'S’entraîner' },
    { id: '07', number: 7, slug: 'lien-volume-mission-finale', path: `${LESSON_BASE_PATH}/lien-volume-mission-finale`,
      title: '🏆 Le Grand Défi des Contenances', desc: 'Boss final, profil de maîtrise et synthèse — le bar à jus de l’école.',
      color: 'amber', style: 'assessment', stage: 'evaluation',
      estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
