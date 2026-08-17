import { LESSON_CONFIG, TOTAL_MODULES, LESSON_BASE_PATH, getModuleNav } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  coursePath: LESSON_BASE_PATH,
  totalModules: TOTAL_MODULES,
};

export { getModuleNav as getNavLinks };
