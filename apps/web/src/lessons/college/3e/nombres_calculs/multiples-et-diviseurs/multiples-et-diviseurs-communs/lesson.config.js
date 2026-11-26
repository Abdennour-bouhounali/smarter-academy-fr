/**
 * 3e — « Engrenages et rendez-vous : quand deux rythmes se retrouvent » (lesson 4 of the chapter « Multiples et
 * diviseurs », programme item `3e.m1.r07`). A v2 lesson: the student plays it in the world « L’archipel des diviseurs »
 * (`lesson.pack.js`, `world/`), built from the French net's learning points (`npm run lesson:brief --
 * multiples-et-diviseurs-communs`) and the design `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md` (lesson 4,
 * version 2: « plus petit multiple commun » in full, never « PPCM »). It has NO module page: the `modules` below are DATA
 * — their ids and numbers are how progress is stored (the world marks them, `onModule`; `world/story.js › MODULE_KEYS`
 * says which keys each one needs), every report reads them, and their addresses redirect to the lesson's home.
 * DRAFT (`.draft`): renamed `lesson.config.js` by `npm run lesson:assemble`.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/multiples-et-diviseurs-communs';


export const LESSON_CONFIG = {
  id: 'multiples-et-diviseurs-communs',
  kind: 'lesson',
  unit: 'multiples-et-diviseurs',
  unitTitle: 'Multiples et diviseurs',
  sequentialUnlock: true,
  title: 'Engrenages et rendez-vous : quand deux rythmes se retrouvent',
  description:
    'Reconnaître qu’une répétition simultanée cherche un multiple commun, trouver le plus petit multiple commun non nul de deux nombres à partir de leurs décompositions en facteurs premiers, et résoudre un problème de rendez-vous en lisant ce nombre comme une durée, un nombre de tours ou un jour.',
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚙️',
  estimatedDurationMin: 60,
  skills: [
    'Reconnaître qu’un problème de répétitions simultanées revient à chercher un multiple commun, le plus petit qui n’est pas 0',
    'Trouver le plus petit multiple commun non nul de deux entiers à partir de leurs décompositions en facteurs premiers',
    'Résoudre un problème de rendez-vous (engrenages, bus, équipes) et lire le plus petit multiple commun comme une durée ou un nombre de tours',
  ],
  teachingScope: {
    include: [
      'Les multiples communs de deux entiers, le plus petit qui n’est pas 0',
      'Le plus petit multiple commun lu sur deux décompositions : tous les facteurs premiers, chacun avec le plus grand exposant ; sans facteur premier commun, le produit',
      'Traduire une histoire de rendez-vous (engrenages, bus) en deux rythmes, puis revenir à l’histoire : nombre de tours, heure',
      'Plusieurs rythmes comptés depuis le jour 1 : le jour 1 + le plus petit multiple commun de leurs cycles',
    ],
    exclude: [
      'Une notation abrégée du plus petit multiple commun (aucun texte officiel déposé n’en nomme une : les mots en toutes lettres)',
      'La relation entre le PGCD, le plus petit multiple commun et le produit de deux nombres (leçon suivante du chapitre)',
      'La somme de fractions et le dénominateur commun (5e–4e)',
    ],
  },
  // The lesson's progressive map is the world's « carte des connaissances »: the `KNOWLEDGE_GRAPH` of the knowledge its
  // pack declares (`lesson.pack.js › knowledge`) — the only one (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // lessons 1 and 2 of the chapter: decomposing (the sheet is K2's bench) and the PGCD (it comes back as a wrong tile)
  priorKnowledge: ['decomposer-en-facteurs-premiers', 'trouver-le-pgcd'],
  resources: [],
  modules: [
    {
      id: '00',
      number: 0,
      slug: 'echauffement',
      path: `${LESSON_BASE_PATH}/echauffement`,
      title: 'Échauffement',
      desc: 'Ce qu’il faut avant la leçon, mesuré par l’échauffement : multiples, divisibilité, décomposition.',
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
      slug: 'pilier-commun',
      path: `${LESSON_BASE_PATH}/pilier-commun`,
      title: 'Multiples communs',
      desc: 'Deux équipes, des planches de 16 et de 20, une pièce par planche : où poser le pilier de la passerelle.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_multiples-et-diviseurs-communs_P1'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 2,
      actionText: 'Je place le pilier',
    },
    {
      id: '02',
      number: 2,
      slug: 'par-les-facteurs-premiers',
      path: `${LESSON_BASE_PATH}/par-les-facteurs-premiers`,
      title: 'Le plus petit multiple commun par les facteurs premiers',
      desc: 'Des planches trop longues pour compter, leurs décompositions au tableur : lire le pilier sur les deux produits.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_multiples-et-diviseurs-communs_P2'],
      color: 'emerald',
      style: 'featured',
      estimatedMin: 12,
      difficulty: 3,
      actionText: 'Je lis les décompositions',
    },
    {
      id: '03',
      number: 3,
      slug: 'rendez-vous',
      path: `${LESSON_BASE_PATH}/rendez-vous`,
      title: 'Deux rythmes, une rencontre',
      desc: 'Des roues dentées, des bus, des équipes : traduire l’histoire, trouver la rencontre, revenir à l’histoire.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_multiples-et-diviseurs-communs_P3'],
      color: 'violet',
      style: 'featured',
      estimatedMin: 14,
      difficulty: 3,
      actionText: 'Je traduis l’histoire',
    },
    // The lesson's problem (track: 'problem'): it counts in completion, never in mastery — the final mission of the world
    // (world/story.js › PROBLEM_MODULE): the harbour's three ferries, the next day all three cross together.
    {
      id: '04',
      number: 4,
      slug: 'la-fete-des-navettes',
      path: `${LESSON_BASE_PATH}/la-fete-des-navettes`,
      title: 'Problème de la leçon',
      desc: 'Le port des navettes : trois rythmes de traversée, le jour de la fête à trouver.',
      stage: 'practice_lab',
      track: 'problem',
      teachesLearningPointIds: ['3e_multiples-et-diviseurs-communs_P1', '3e_multiples-et-diviseurs-communs_P2', '3e_multiples-et-diviseurs-communs_P3'],
      color: 'amber',
      style: 'featured',
      estimatedMin: 6,
      difficulty: 3,
      actionText: 'Je résous le problème',
    },
    {
      id: '05',
      number: 5,
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
