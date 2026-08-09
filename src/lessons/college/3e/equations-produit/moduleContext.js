import { LESSON_CONFIG, LESSON_BASE_PATH, getModuleNav, TOTAL_MODULES } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  totalModules: TOTAL_MODULES
};

export function getNavLinks(currentModuleNumber) {
  return getModuleNav(currentModuleNumber);
}
