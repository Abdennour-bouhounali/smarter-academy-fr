/**
 * Angles — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 7 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_angles_P1  Comprendre l'angle comme une ouverture entre deux demi-droites
 *   6e_angles_P2  Identifier et comparer des angles à partir de représentations
 *   6e_angles_P3  Reconnaître un angle droit, aigu ou obtus
 *   6e_angles_P4  Mesurer un angle avec un rapporteur
 *   6e_angles_P5  Utiliser correctement le rapporteur et choisir la bonne graduation
 *   6e_angles_P6  Construire un angle de mesure donnée
 *   6e_angles_P7  Résoudre des problèmes impliquant des angles
 *
 * Le piège central : confondre l'ouverture avec la LONGUEUR des côtés. Il
 * est posé dès le Module 1 (mêmes 40°, côtés courts vs longs), re-testé au
 * Module 2 (classement de vignettes d'orientations et de tailles variées)
 * et refermé au Module 6.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/angles';

export const LESSON_CONFIG = {
  id: 'angles',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Angles',
  description:
    'L’angle comme ouverture : ouvrir, comparer, classer, puis mesurer et construire au rapporteur — jusqu’au brevet de pilote.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 77,
  skills: [
    'Comprendre l’angle comme une ouverture entre deux demi-droites',
    'Identifier et comparer des angles à partir de représentations',
    'Reconnaître un angle droit, aigu ou obtus',
    'Mesurer un angle avec un rapporteur',
    'Utiliser correctement le rapporteur et choisir la bonne graduation',
    'Construire un angle de mesure donnée',
    'Résoudre des problèmes impliquant des angles',
  ],
  teachingScope: {
    include: ['Notion d’angle et vocabulaire', 'Angles aigu, droit, obtus, plat', 'Mesure et construction au rapporteur'],
    exclude: ['Angles alternes-internes', 'Somme des angles d’un triangle', 'Angles orientés'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'l-ouverture', path: `${LESSON_BASE_PATH}/l-ouverture`,
      title: 'La porte, la pizza et le skate', desc: 'Ouvre la porte : ce qui grandit, ce n’est pas la longueur.',
      stage: 'trigger', teachesLearningPointIds: ['6e_angles_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'comparer-et-classer', path: `${LESSON_BASE_PATH}/comparer-et-classer`,
      title: 'Comparer et classer les angles', desc: 'Superposer pour comparer, l’équerre pour classer : aigu, droit, obtus, plat.',
      stage: 'discovery', teachesLearningPointIds: ['6e_angles_P2', '6e_angles_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Classer' },
    { id: '03', number: 3, slug: 'le-rapporteur', path: `${LESSON_BASE_PATH}/le-rapporteur`,
      title: 'Mesurer avec le rapporteur', desc: 'Deux gestes, toujours dans le même ordre — puis on lit.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_angles_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Mesurer' },
    { id: '04', number: 4, slug: 'la-bonne-graduation', path: `${LESSON_BASE_PATH}/la-bonne-graduation`,
      title: 'Le piège des deux graduations', desc: '50 ou 130 ? Un réflexe simple élimine la mauvaise à tous les coups.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_angles_P5'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Choisir' },
    { id: '05', number: 5, slug: 'construire-un-angle', path: `${LESSON_BASE_PATH}/construire-un-angle`,
      title: 'Construire un angle', desc: 'La méthode en quatre temps, du trait de base au second côté.',
      stage: 'formalization', teachesLearningPointIds: ['6e_angles_P6'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Construire' },
    { id: '06', number: 6, slug: 'missions-d-angles', path: `${LESSON_BASE_PATH}/missions-d-angles`,
      title: 'Missions d’angles', desc: 'Mini-golf : lire un rebond, partager un gâteau, viser le dernier trou.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_angles_P7'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'l-ecole-de-pilotage', path: `${LESSON_BASE_PATH}/l-ecole-de-pilotage`,
      title: '🏆 Mission finale : l’école de pilotage', desc: 'Passe ton brevet : caps, virages et angle d’approche.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
