/**
 * Droites et segments — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 9 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_droites-segments_P1  Reconnaître une droite
 *   6e_droites-segments_P2  Reconnaître un segment
 *   6e_droites-segments_P3  Reconnaître une demi-droite
 *   6e_droites-segments_P4  Comprendre la différence entre droite, segment et demi-droite
 *   6e_droites-segments_P5  Identifier les extrémités d'un segment et d'une demi-droite
 *   6e_droites-segments_P6  Comprendre le rôle des points sur une droite
 *   6e_droites-segments_P7  Utiliser correctement les notations géométriques
 *   6e_droites-segments_P8  Construire et prolonger une droite, un segment ou une demi-droite
 *   6e_droites-segments_P9  Décrire une figure à l'aide de droites et de segments
 *
 * PÉRIMÈTRE OFFICIEL : l'objet « droites_segments » inclut l'alignement de
 * points et le milieu d'un segment, et exclut les vecteurs.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/droites-segments';

export const LESSON_CONFIG = {
  id: 'droites-segments',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat) : le repérage dans
  // le plan et le vocabulaire des figures — exactement ce que les cinq
  // questions du module 0 mesurent, et rien d'autre. L'étendue, le segment,
  // la droite, la demi-droite, la notation, l'alignement et le milieu sont
  // tous établis dans la leçon même.
  priorKnowledge: ['coordonnees', 'abscisse'],
  title: 'Droites et segments',
  description:
    'Distinguer droite, segment et demi-droite par leur étendue, identifier les extrémités, noter correctement et construire les objets demandés.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 86,
  skills: [
    'Reconnaître une droite, un segment et une demi-droite',
    'Comprendre que la différence est une question d’étendue',
    'Identifier les extrémités d’un objet géométrique',
    'Comprendre le rôle des points sur une droite',
    'Utiliser les notations (AB), [AB] et [AB)',
    'Construire et prolonger un objet géométrique',
    'Décrire une figure avec des mots exacts',
  ],
  teachingScope: {
    include: ['Droites, demi-droites, segments', 'Alignement de points', 'Milieu d’un segment'],
    exclude: ['Vecteurs', 'Droites parallèles et perpendiculaires', 'Équations de droites'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'jusqu-ou-ca-va', path: `${LESSON_BASE_PATH}/jusqu-ou-ca-va`,
      title: 'Jusqu’où ça va ?', desc: 'Tire sur les bouts du trait : certains s’arrêtent, d’autres non.',
      stage: 'trigger', teachesLearningPointIds: ['6e_droites-segments_P1', '6e_droites-segments_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'un-seul-bout', path: `${LESSON_BASE_PATH}/un-seul-bout`,
      title: 'Un seul bout', desc: 'Bloque une extrémité, laisse l’autre filer : un troisième objet apparaît.',
      stage: 'discovery', teachesLearningPointIds: ['6e_droites-segments_P3', '6e_droites-segments_P5'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Explorer' },
    { id: '03', number: 3, slug: 'le-tri-des-traits', path: `${LESSON_BASE_PATH}/le-tri-des-traits`,
      title: 'Le tri des traits', desc: 'Trois objets, une seule différence : jusqu’où ça continue.',
      stage: 'discovery', teachesLearningPointIds: ['6e_droites-segments_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Trier' },
    { id: '04', number: 4, slug: 'les-points-sur-la-droite', path: `${LESSON_BASE_PATH}/les-points-sur-la-droite`,
      title: 'Les points sur la droite', desc: 'Un point est-il « dessus » ? Alignés ou pas ? Et où est le milieu ?',
      stage: 'manipulation', teachesLearningPointIds: ['6e_droites-segments_P6'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Manipuler' },
    { id: '05', number: 5, slug: 'crochets-et-parentheses', path: `${LESSON_BASE_PATH}/crochets-et-parentheses`,
      title: 'Crochets et parenthèses', desc: '(AB), [AB], [AB) : chaque signe raconte l’étendue.',
      stage: 'formalization', teachesLearningPointIds: ['6e_droites-segments_P7'],
      color: 'blue', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Noter' },
    { id: '06', number: 6, slug: 'l-atelier-de-trace', path: `${LESSON_BASE_PATH}/l-atelier-de-trace`,
      title: 'L’atelier de tracé', desc: 'Construis et prolonge : à toi de produire l’objet demandé.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_droites-segments_P8'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire' },
    { id: '07', number: 7, slug: 'decrire-une-figure', path: `${LESSON_BASE_PATH}/decrire-une-figure`,
      title: 'Décrire une figure', desc: 'Dis une figure avec des mots assez exacts pour qu’on la redessine.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_droites-segments_P9'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Décrire' },
    { id: '08', number: 8, slug: 'mission-finale-le-skatepark', path: `${LESSON_BASE_PATH}/mission-finale-le-skatepark`,
      title: '🏆 Mission finale : le skatepark', desc: 'Dix épreuves sur le plan du skatepark.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
