import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

/** Shared <ModuleLayout> props every module in this lesson spreads in. */
export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  levelLabel: 'Collège',
  gradeLabel: '3ème',
  totalModules: LESSON_CONFIG.modules.length,
  sequentialUnlock: LESSON_CONFIG.sequentialUnlock,
};

/** @param {number} currentModuleNumber 1-indexed */
export function getNavLinks(currentModuleNumber) {
  const modules = LESSON_CONFIG.modules;
  const prev = modules.find((m) => m.number === currentModuleNumber - 1);
  const next = modules.find((m) => m.number === currentModuleNumber + 1);
  return {
    prevLink: prev ? prev.path : LESSON_BASE_PATH,
    nextLink: next ? next.path : null,
  };
}
