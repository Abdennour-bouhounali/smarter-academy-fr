/**
 * 3e — « Reconnaître des triangles semblables » (lesson 1 of the unit « Thalès et triangles semblables », programme items
 * `3e.m4.r04` and `3e.m2.r09`). A v2 lesson: the student plays it in the world « Les pyramides » (`nile-pyramids`,
 * `lesson.pack.js`, `world/`), built from the French net's learning points (`npm run lesson:brief -- triangles-semblables`)
 * and the design `docs/reports/UNIT_3E_THALES_DESIGN.md` (Lesson 1, design v4). It has NO module page: the `modules`
 * below are DATA — their ids and numbers are how progress is stored (the world marks them all at the story's end,
 * `kit/storyEnd.js`; `world/story.js › MODULE_KEYS` says which keys each one needs), every report reads them, and their
 * addresses redirect to the lesson's home. Modules 1–3 are the three docks the story plays: dock 2 (K1
 * `cotes-proportionnels`), dock 4 (K2 `angles-egaux`), the plateau (the mission, the lesson's problem).
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/triangles-semblables';

export const LESSON_CONFIG = {
  id: 'triangles-semblables',
  kind: 'lesson',
  unit: 'thales-et-triangles-semblables',
  unitTitle: 'Thalès et triangles semblables',
  sequentialUnlock: true,
  title: 'Reconnaître des triangles semblables',
  description:
    'Au chantier des bâtisseurs, dire si deux triangles séparés ont la même forme : par leurs côtés rangés, puis par leurs angles ; associer leurs sommets et leurs côtés homologues ; mesurer un palmier par son ombre.',
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 55,
  skills: [
    'Reconnaître deux triangles semblables par la proportionnalité des longueurs de leurs côtés',
    'Reconnaître deux triangles semblables par l’égalité de leurs angles',
    'Associer les sommets et les côtés homologues de deux triangles semblables',
    'Calculer une longueur inconnue à l’aide du rapport entre deux triangles semblables',
  ],
  teachingScope: {
    include: [
      'Deux triangles séparés, tournés ou retournés : ranger leurs côtés et comparer les trois quotients',
      'Deux angles égaux suffisent : le troisième s’en déduit, la somme des angles valant 180°',
      'Les sommets et les côtés homologues, associés par le rang des côtés ou par les angles égaux',
      'Le rapport k, agrandissement ou réduction, et le calcul d’une longueur inconnue',
    ],
    exclude: [
      'Le théorème de Thalès dans le papillon (leçon 2 de l’unité) et sa réciproque (leçon 3)',
      'Les triangles emboîtés et les cas d’égalité des triangles (vus en 4e)',
      'Les aires et les volumes après un agrandissement (leçon sur l’homothétie)',
    ],
  },
  // The lesson's progressive map is the world's « carte des connaissances »: the `KNOWLEDGE_GRAPH` of the knowledge its
  // pack declares (`lesson.pack.js › knowledge`) — the only one (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // no lesson of 4e exists yet: nothing it assumes is the knowledge of an earlier lesson of this platform
  priorKnowledge: [],
  resources: [],
  modules: [
    {
      id: '00',
      number: 0,
      slug: 'echauffement',
      path: `${LESSON_BASE_PATH}/echauffement`,
      title: 'Échauffement',
      desc: 'Ce qu’il faut avant la leçon, mesuré par l’échauffement : la quatrième proportionnelle, l’agrandissement d’une figure.',
      stage: 'prerequisite_check',
      color: 'teal',
      style: 'diagnostic',
      estimatedMin: 6,
      difficulty: 1,
      actionText: 'Je vérifie mes acquis',
    },
    {
      id: '01',
      number: 1,
      slug: 'le-chantier-des-batisseurs',
      path: `${LESSON_BASE_PATH}/le-chantier-des-batisseurs`,
      title: 'Le chantier des bâtisseurs',
      desc: 'Des tracés posés de travers : ont-ils la forme du gabarit ? Le monde les pose l’un sur l’autre.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_triangles-semblables_P1', '3e_triangles-semblables_P3'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 18,
      difficulty: 2,
      actionText: 'Je compare les tracés',
    },
    {
      id: '02',
      number: 2,
      slug: 'le-pyramidion',
      path: `${LESSON_BASE_PATH}/le-pyramidion`,
      title: 'Le pyramidion',
      desc: 'Au sommet, le rapporteur : deux angles mesurés suffisent-ils pour la même forme ?',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_triangles-semblables_P2', '3e_triangles-semblables_P3'],
      color: 'violet',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 3,
      actionText: 'Je mesure les angles',
    },
    // The lesson's problem (track: 'problem'): it counts in completion, never in mastery — the plateau, a date palm
    // measured by its shadow.
    {
      id: '03',
      number: 3,
      slug: 'le-palmier-du-plateau',
      path: `${LESSON_BASE_PATH}/le-palmier-du-plateau`,
      title: 'Problème de la leçon',
      desc: 'Le bâton et le palmier, chacun avec son ombre : la hauteur du palmier sans le toucher.',
      stage: 'practice_lab',
      track: 'problem',
      teachesLearningPointIds: ['3e_triangles-semblables_P3', '3e_triangles-semblables_P4'],
      color: 'amber',
      style: 'featured',
      estimatedMin: 10,
      difficulty: 3,
      actionText: 'Je résous le problème',
    },
    {
      id: '04',
      number: 4,
      slug: 'evaluation',
      path: `${LESSON_BASE_PATH}/evaluation`,
      title: 'Évaluation',
      desc: 'Les savoir-faire de la leçon, sur des questions au format du brevet.',
      stage: 'evaluation',
      color: 'slate',
      style: 'boss',
      estimatedMin: 8,
      difficulty: 4,
      actionText: 'Je passe l’évaluation',
    },
  ],
};
