/**
 * 3e — « Thalès dans le papillon » (lesson 2 of the unit « Thalès et triangles semblables », programme items `3e.m4.r05`
 * and `3e.m2.r09`). A v2 lesson: the student plays it in the world « Les pyramides » (`nile-pyramids`, `lesson.pack.js`,
 * `world/`), built from the French net's learning points (`npm run lesson:brief -- thales-configuration-papillon`) and
 * the design `docs/reports/UNIT_3E_THALES_DESIGN.md`. It has NO module page: the `modules` below are DATA — their ids
 * and numbers are how progress is stored (the world marks them all at the story's end, `kit/storyEnd.js`;
 * `world/story.js › MODULE_KEYS` says which keys each one needs), every report reads them, and their addresses redirect
 * to the lesson's home. Modules 1–3 are the three docks of the world: dock 3 (K1 `papillon`), dock 4 (K2
 * `calcul-depuis-le-sommet`), dock 5 (the mission, the lesson's problem).
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/thales-configuration-papillon';

export const LESSON_CONFIG = {
  id: 'thales-configuration-papillon',
  kind: 'lesson',
  unit: 'thales-et-triangles-semblables',
  unitTitle: 'Thalès et triangles semblables',
  sequentialUnlock: true,
  title: 'Thalès dans le papillon',
  description:
    'Au bord du Nil, mesurer ce que la corde n’atteint pas : reconnaître deux triangles opposés par le sommet, écrire les trois rapports égaux, choisir chaque longueur depuis le sommet et calculer une longueur dans la configuration du papillon.',
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🦋',
  estimatedDurationMin: 55,
  skills: [
    'Reconnaître une configuration de Thalès en papillon et écrire l’égalité des trois rapports',
    'Choisir l’ordre des longueurs dans les rapports selon la configuration, emboîtée ou en papillon',
    'Calculer une longueur dans une configuration de Thalès en papillon',
  ],
  teachingScope: {
    include: [
      'Le théorème de Thalès dans la configuration du papillon, ramenée aux triangles emboîtés par un demi-tour',
      'La rédaction au brevet : les deux alignements, le parallélisme, puis l’égalité des trois rapports',
      'Chaque longueur d’un rapport part du sommet : recoller les morceaux, ou enlever celui de l’autre côté',
      'Calculer une longueur par les produits en croix, dans le papillon et dans une figure qui mêle les deux configurations',
    ],
    exclude: [
      'La réciproque du théorème de Thalès (leçon 3 de l’unité)',
      'Le coefficient d’agrandissement ou de réduction et les triangles semblables (leçon 1 de l’unité)',
      'Les triangles emboîtés comme règle à forger (vus en 4e)',
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
      desc: 'Ce qu’il faut avant la leçon, mesuré par l’échauffement : la quatrième proportionnelle, les triangles emboîtés de 4e.',
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
      slug: 'la-largeur-du-nil',
      path: `${LESSON_BASE_PATH}/la-largeur-du-nil`,
      title: 'La largeur du Nil',
      desc: 'La corde du bac se coupe avant la traversée : les deux rives, de part et d’autre d’un piquet.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_thales-configuration-papillon_P1', '3e_thales-configuration-papillon_P2'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 18,
      difficulty: 2,
      actionText: 'Je mesure le Nil',
    },
    {
      id: '02',
      number: 2,
      slug: 'le-pyramidion',
      path: `${LESSON_BASE_PATH}/le-pyramidion`,
      title: 'Le pyramidion',
      desc: 'Au sommet d’une pyramide, puis à la table des bâtisseurs : chaque longueur part du sommet.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_thales-configuration-papillon_P2', '3e_thales-configuration-papillon_P3'],
      color: 'violet',
      style: 'featured',
      estimatedMin: 15,
      difficulty: 3,
      actionText: 'Je calcule depuis le sommet',
    },
    // The lesson's problem (track: 'problem'): it counts in completion, never in mastery — the last dock, the shadow of
    // the Great Pyramid in the morning and Ibn al-Haytham's box at noon.
    {
      id: '03',
      number: 3,
      slug: 'l-ombre-de-la-grande-pyramide',
      path: `${LESSON_BASE_PATH}/l-ombre-de-la-grande-pyramide`,
      title: 'Problème de la leçon',
      desc: 'L’ombre de la grande pyramide, puis la feuille de la chambre noire que son image remplit.',
      stage: 'practice_lab',
      track: 'problem',
      teachesLearningPointIds: ['3e_thales-configuration-papillon_P1', '3e_thales-configuration-papillon_P3'],
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
