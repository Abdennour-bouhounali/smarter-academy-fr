/**
 * Angles — deux droites coupées par une sécante (5e).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `angles` du domaine « Espace et géométrie », applicable à la 5e à la
 * rentrée 2026-2027.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 5 LPs de cette leçon (clé catalogue
 * '5e_angles', append-only) :
 *
 *   5e_angles-5e_P1  Identifier deux angles alternes-internes
 *   5e_angles-5e_P2  Identifier deux angles correspondants
 *   5e_angles-5e_P3  Déduire une égalité d'angles à partir de deux parallèles
 *   5e_angles-5e_P4  Prouver que deux droites sont parallèles à partir des angles
 *   5e_angles-5e_P5  Utiliser les angles dans une configuration géométrique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : le parallélisme SE MESURE avec
 * des angles. Deux droites sont parallèles quand elles « partent dans la même
 * direction » — mais cela ne se vérifie pas à l'œil, et prolonger les droites
 * jusqu'à voir si elles se coupent est impossible sur une feuille. Une sécante
 * transforme cette question inaccessible en une comparaison de DEUX ANGLES,
 * mesurables au rapporteur, ici et maintenant.
 *
 * FIL NARRATIF : la question qu'on ne peut pas trancher à l'œil. Le module 1
 * pose deux droites presque parallèles et demande de décider ; l'œil se
 * trompe, et le prolongement ne tient pas dans le cadre. La sécante arrive
 * comme l'INSTRUMENT qui rend la question décidable — et elle ne quitte plus
 * la leçon.
 *
 * PROGRESSION — manipuler, observer, conjecturer, justifier, formaliser,
 * réutiliser. Le module 3 fait DÉCOUVRIR l'égalité des angles à partir des
 * parallèles ; le module 5 en fait la réciproque, qui est l'outil de preuve.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : le théorème de Thalès (4e), la
 * trigonométrie (4e/3e), les angles inscrits et au centre (3e), la somme des
 * angles d'un polygone quelconque. La somme des angles du triangle est vue
 * dans la leçon « Triangles », qui suit et s'appuie sur celle-ci. Ces
 * frontières ne sont pas que documentaires : components/angles.js LÈVE si la
 * sécante est parallèle à l'une des droites, et le test le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/angles-5e';

export const LESSON_CONFIG = {
  id: 'angles-5e',
  sequentialUnlock: true,
  title: 'Angles et parallélisme',
  description:
    "Découvrir qu’une question impossible à trancher à l’œil — ces deux droites sont-elles parallèles ? — devient décidable dès qu’on trace une sécante : les angles qu’elle forme se comparent au rapporteur, et leur égalité dit le parallélisme dans les deux sens.",
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 60,
  skills: [
    'Identifier deux angles alternes-internes',
    'Identifier deux angles correspondants',
    "Déduire une égalité d'angles à partir de deux parallèles",
    'Prouver que deux droites sont parallèles à partir des angles',
    'Utiliser les angles dans une configuration géométrique',
  ],
  teachingScope: {
    include: [
      'La configuration : deux droites coupées par une sécante',
      'Les angles correspondants',
      'Les angles alternes-internes',
      'Deux parallèles donnent des angles égaux',
      'Des angles égaux prouvent le parallélisme (la réciproque)',
      'Enchaîner deux relations d’angles dans une figure',
    ],
    exclude: [
      'Le théorème de Thalès (4e)',
      'La trigonométrie (4e et 3e)',
      'Les angles inscrits et au centre (3e)',
      'La somme des angles d’un polygone quelconque',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, toutes diagnostiquées par le module 0 :
  // mesurer un angle, le vocabulaire aigu/obtus/droit, les parallèles et les
  // perpendiculaires — tout cela vient de la 6e.
  priorKnowledge: [
    'angle-aigu-obtus', 'angle-droit', 'droites-paralleles', 'droites-perpendiculaires',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'se-couperont-elles', path: `${LESSON_BASE_PATH}/se-couperont-elles`,
      title: 'Se couperont-elles ?', desc: 'Deux droites presque parallèles. Décide — puis regarde ce qui se passe vraiment.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_angles-5e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Trancher la question',
    },
    {
      id: '02', number: 2, slug: 'la-secante-et-ses-huit-angles', path: `${LESSON_BASE_PATH}/la-secante-et-ses-huit-angles`,
      title: 'La sécante et ses huit angles', desc: 'Un trait de plus, et huit angles apparaissent. Apprends à les situer.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_angles-5e_P1', '5e_angles-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Nommer les angles',
    },
    {
      id: '03', number: 3, slug: 'quand-les-droites-sont-paralleles', path: `${LESSON_BASE_PATH}/quand-les-droites-sont-paralleles`,
      title: 'Quand les droites sont parallèles', desc: 'Rends-les parallèles et surveille les huit mesures. Quelque chose se produit.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_angles-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Observer',
    },
    {
      id: '04', number: 4, slug: 'calculer-sans-mesurer', path: `${LESSON_BASE_PATH}/calculer-sans-mesurer`,
      title: 'Calculer sans mesurer', desc: 'Un seul angle donné, et les sept autres se déduisent — sans rapporteur.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_angles-5e_P3', '5e_angles-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Déduire',
    },
    {
      id: '05', number: 5, slug: 'prouver-le-parallelisme', path: `${LESSON_BASE_PATH}/prouver-le-parallelisme`,
      title: 'Prouver le parallélisme', desc: 'La propriété lue à l’envers : deux angles égaux suffisent à conclure.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_angles-5e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Prouver',
    },
    {
      id: '06', number: 6, slug: 'la-figure-complete', path: `${LESSON_BASE_PATH}/la-figure-complete`,
      title: 'La figure complète', desc: 'Deux relations enchaînées : le raisonnement en plusieurs étapes.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_angles-5e_P5', '5e_angles-5e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Enchaîner',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-les-angles', path: `${LESSON_BASE_PATH}/mission-finale-les-angles`,
      title: '🏆 Mission finale : les angles', desc: 'Dix épreuves pour prouver qu’une configuration ne te fait plus peur.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
