/**
 * 3e — « Vers le brevet — Multiples et diviseurs »: the LAST lesson of the chapter « Multiples et diviseurs » (kind
 * `synthesis`). It is NOT a game world and it teaches no new rule: it is a RAPID REVISION of the whole unit (owner,
 * 2026-11-26) — the chapter on one screen, each lesson revised with a twenty-second manipulation, two solved exercises
 * and a quick quiz — drawn by `features/versLeBrevet` from `brevet.js` beside this file, in two presentations (« Par
 * écrans », « En une page »). Its ONE module below is DATA: how progress and reports name it.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/vers-le-brevet-multiples-et-diviseurs';

export const LESSON_CONFIG = {
  id: 'vers-le-brevet-multiples-et-diviseurs',
  kind: 'synthesis',
  unit: 'multiples-et-diviseurs',
  unitTitle: 'Multiples et diviseurs',
  sequentialUnlock: false,
  title: 'Vers le brevet — Multiples et diviseurs',
  description:
    'Une révision rapide de tout le chapitre : les idées, les règles, les pièges et les mots des quatre leçons, une manipulation pour chacune, deux exercices résolus et un quiz.',
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 20,
  skills: ['Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Multiples et diviseurs »'],
  teachingScope: {
    include: ['Les règles, les pièges et le vocabulaire des quatre leçons du chapitre, revus rapidement'],
    exclude: ['Toute règle nouvelle : cette leçon n’en enseigne aucune'],
  },
  priorKnowledge: [
    'decomposer-en-facteurs-premiers',
    'trouver-le-pgcd',
    'fraction-irreductible',
    'multiples-et-diviseurs-communs',
  ],
  resources: [],
  modules: [
    {
      id: '01',
      number: 1,
      slug: 'revision',
      path: `${LESSON_BASE_PATH}/revision`,
      title: 'Révision rapide du chapitre',
      desc: 'Les quatre leçons revues, deux exercices résolus, un quiz.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_vers-le-brevet-multiples-et-diviseurs_P1'],
      color: 'indigo',
      style: 'featured',
      estimatedMin: 20,
      difficulty: 2,
      actionText: 'Je révise le chapitre',
    },
  ],
};
