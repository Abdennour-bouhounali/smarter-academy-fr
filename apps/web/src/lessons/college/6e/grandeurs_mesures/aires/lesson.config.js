/**
 * Aires — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 7 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_aires_P1  Comprendre l'aire comme la mesure d'une surface
 *   6e_aires_P2  Comparer des surfaces sans se limiter à leur forme/contour
 *   6e_aires_P3  Mesurer une aire avec des unités adaptées
 *   6e_aires_P4  Comprendre les unités usuelles d'aire et leurs relations
 *   6e_aires_P5  Calculer l'aire d'un rectangle et d'un carré
 *   6e_aires_P6  Décompositions et recompositions pour déterminer une aire
 *   6e_aires_P7  Résoudre des problèmes faisant intervenir des aires
 *
 * La confusion aire/périmètre est LE piège de la leçon : le Module 2 lui
 * est entièrement consacré (même contour ≠ même aire, découpage/recollage
 * conserve l'aire), et le Module 6 le referme sur un cas concret.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/aires';

export const LESSON_CONFIG = {
  id: 'aires',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Aires',
  description:
    'Construire le sens de l’aire à partir du geste : recouvrir, découper, recomposer — puis compter, calculer et convertir des surfaces dans des situations concrètes.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '▦',
  estimatedDurationMin: 81,
  skills: [
    'Comprendre l’aire comme la mesure d’une surface',
    'Comparer des surfaces sans se limiter à leur forme ou à leur contour',
    'Mesurer une aire avec des unités adaptées',
    'Comprendre les unités usuelles d’aire et leurs relations',
    'Calculer l’aire d’un rectangle et d’un carré',
    'Utiliser des décompositions et recompositions pour déterminer une aire',
    'Résoudre des problèmes faisant intervenir des aires',
  ],
  teachingScope: {
    include: ['Aire par pavage et comptage d’unités', 'Aires du carré et du rectangle', 'Conversions d’unités d’aire (×100 par marche)'],
    exclude: ['Aire du triangle quelconque et du disque', 'Are et hectare', 'Périmètres (leçon dédiée)'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-guerre-des-pelouses', path: `${LESSON_BASE_PATH}/la-guerre-des-pelouses`,
      title: 'La guerre des pelouses', desc: 'Deux jardins, deux voisins fâchés : lequel a le plus de pelouse ?',
      stage: 'trigger', teachesLearningPointIds: ['6e_aires_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'meme-contour-meme-aire', path: `${LESSON_BASE_PATH}/meme-contour-meme-aire`,
      title: 'Même contour, même aire ?', desc: 'Découpe, recolle, compare : l’aire ne se devine pas au contour.',
      stage: 'discovery', teachesLearningPointIds: ['6e_aires_P2'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Découper' },
    { id: '03', number: 3, slug: 'paver-pour-mesurer', path: `${LESSON_BASE_PATH}/paver-pour-mesurer`,
      title: 'Paver pour mesurer', desc: 'Recouvrir de carreaux-unités et compter : mesurer une aire, c’est ça.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_aires_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Paver' },
    { id: '04', number: 4, slug: 'la-formule-du-rectangle', path: `${LESSON_BASE_PATH}/la-formule-du-rectangle`,
      title: 'La formule du rectangle', desc: 'Colorier ligne par ligne… et voir apparaître L × l.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_aires_P5', '6e_aires_P6'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Colorier' },
    { id: '05', number: 5, slug: 'les-unites-d-aire', path: `${LESSON_BASE_PATH}/les-unites-d-aire`,
      title: 'Les unités d’aire', desc: 'Pourquoi 1 dm² vaut 100 cm² (et pas 10) : la marche des aires vaut ×100.',
      stage: 'formalization', teachesLearningPointIds: ['6e_aires_P4'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Convertir' },
    { id: '06', number: 6, slug: 'chantiers-d-aires', path: `${LESSON_BASE_PATH}/chantiers-d-aires`,
      title: 'Chantiers d’aires', desc: 'Peinture, fenêtre, tapis : trois problèmes de surfaces bien réels.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_aires_P7'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'le-chantier-de-l-ecole', path: `${LESSON_BASE_PATH}/le-chantier-de-l-ecole`,
      title: '🏆 Mission finale : le chantier de l’école', desc: 'Peinture, pelouse, carrelage : mobilise tout ce que tu as appris.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
