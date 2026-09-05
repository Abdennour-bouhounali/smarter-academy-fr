import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

/** Shared <ModuleLayout> props every module in this lesson spreads in. */
export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  levelLabel: 'Collège',
  gradeLabel: '6ème',
  totalModules: LESSON_CONFIG.modules.length,
  // With a module 0, modules.length ≠ last module number — ModuleLayout's
  // "Terminer" button on the final module needs the real last number.
  lastModuleNumber: LESSON_CONFIG.modules[LESSON_CONFIG.modules.length - 1].number,
  sequentialUnlock: LESSON_CONFIG.sequentialUnlock,
};

/** Liens précédent / suivant à partir du numéro du module courant. */
export const getNavLinks = (currentModuleNumber) => {
  const idx = LESSON_CONFIG.modules.findIndex((m) => m.number === currentModuleNumber);
  if (idx === -1) return { prevLink: null, nextLink: null };

  return {
    prevLink: idx > 0 ? LESSON_CONFIG.modules[idx - 1].path : LESSON_BASE_PATH,
    nextLink: idx < LESSON_CONFIG.modules.length - 1 ? LESSON_CONFIG.modules[idx + 1].path : null,
  };
};
