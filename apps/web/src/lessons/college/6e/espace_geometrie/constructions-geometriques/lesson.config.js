/**
 * Constructions géométriques — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 12 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_constructions-geometriques_P1   Utiliser correctement une règle graduée
 *   6e_constructions-geometriques_P2   Utiliser correctement une équerre
 *   6e_constructions-geometriques_P3   Utiliser correctement un compas
 *   6e_constructions-geometriques_P4   Tracer un segment de longueur donnée
 *   6e_constructions-geometriques_P5   Reporter une longueur avec le compas
 *   6e_constructions-geometriques_P6   Construire une droite parallèle
 *   6e_constructions-geometriques_P7   Construire une droite perpendiculaire
 *   6e_constructions-geometriques_P8   Choisir l'instrument adapté à une construction
 *   6e_constructions-geometriques_P9   Construire une figure à partir d'un programme de construction
 *   6e_constructions-geometriques_P10  Identifier et corriger une erreur de construction
 *   6e_constructions-geometriques_P11  Vérifier qu'une construction respecte les propriétés demandées
 *   6e_constructions-geometriques_P12  Communiquer clairement les étapes d'une construction
 *
 * PÉRIMÈTRE OFFICIEL : construire une figure à partir d'un programme de
 * construction ou d'un croquis ; règle, équerre, compas. Les constructions de
 * tangentes à un cercle sont exclues.
 *
 * Cette leçon CLÔT le chapitre : elle réutilise l'équerre virtuelle de
 * « Parallélisme et perpendicularité » et s'appuie sur les figures de
 * « Figures planes ».
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/constructions-geometriques';

export const LESSON_CONFIG = {
  id: 'constructions-geometriques',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : ce que les trois leçons précédentes du chapitre ont
  // établi — la notation des segments et le milieu, l'angle droit et les deux
  // relations entre droites, les figures planes usuelles. Ce sont exactement
  // les cinq questions du module 0, et rien d'autre : les GESTES (tracer,
  // reporter, construire, vérifier) sont, eux, établis dans la leçon.
  priorKnowledge: [
    'notation-segment',
    'demi-droite',
    'milieu-segment',
    'angle-droit',
    'droites-perpendiculaires',
    'droites-paralleles',
    'figures-planes-usuelles',
  ],
  title: 'Constructions géométriques',
  description:
    'Maîtriser la règle, l’équerre et le compas : tracer, reporter, construire une figure à partir d’un programme et vérifier le résultat.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🛠️',
  estimatedDurationMin: 85,
  skills: [
    'Utiliser la règle graduée, l’équerre et le compas',
    'Tracer un segment de longueur donnée',
    'Reporter une longueur au compas',
    'Construire parallèles et perpendiculaires',
    'Choisir l’instrument adapté',
    'Suivre, vérifier et écrire un programme de construction',
  ],
  teachingScope: {
    include: [
      'Construire une figure à partir d’un programme de construction ou d’un croquis',
      'Règle, équerre, compas',
    ],
    exclude: ['Constructions de tangentes à un cercle', 'Constructions avec rapporteur seul'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-croquis-rate', path: `${LESSON_BASE_PATH}/le-croquis-rate`,
      title: 'Le croquis raté', desc: 'À main levée, la figure est fausse. Quel instrument aurait sauvé quoi ?',
      stage: 'trigger', teachesLearningPointIds: ['6e_constructions-geometriques_P8'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'la-regle-graduee', path: `${LESSON_BASE_PATH}/la-regle-graduee`,
      title: 'La règle graduée', desc: 'Tracer un segment d’une longueur exacte, sans le piège du zéro.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_constructions-geometriques_P1', '6e_constructions-geometriques_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Tracer' },
    { id: '03', number: 3, slug: 'le-compas', path: `${LESSON_BASE_PATH}/le-compas`,
      title: 'Le compas', desc: 'Un écartement qui se conserve : reporter une longueur sans la mesurer.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_constructions-geometriques_P3', '6e_constructions-geometriques_P5'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Reporter' },
    { id: '04', number: 4, slug: 'l-equerre', path: `${LESSON_BASE_PATH}/l-equerre`,
      title: 'L’équerre', desc: 'Perpendiculaire, puis parallèle : deux constructions, un seul rituel.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_constructions-geometriques_P2', '6e_constructions-geometriques_P6', '6e_constructions-geometriques_P7'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Construire' },
    { id: '05', number: 5, slug: 'le-programme-de-construction', path: `${LESSON_BASE_PATH}/le-programme-de-construction`,
      title: 'Le programme de construction', desc: 'Des étapes dans l’ordre : suivre, puis écrire.',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_constructions-geometriques_P9', '6e_constructions-geometriques_P12'],
      color: 'blue', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Suivre' },
    { id: '06', number: 6, slug: 'l-atelier-de-verification', path: `${LESSON_BASE_PATH}/l-atelier-de-verification`,
      title: 'L’atelier de vérification', desc: 'Trouve l’erreur, dis quel instrument l’aurait évitée.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['6e_constructions-geometriques_P10', '6e_constructions-geometriques_P11'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Vérifier' },
    { id: '07', number: 7, slug: 'mission-finale-l-atelier', path: `${LESSON_BASE_PATH}/mission-finale-l-atelier`,
      title: '🏆 Mission finale : l’atelier du géomètre', desc: 'Dix épreuves : instruments, programmes et vérifications.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
