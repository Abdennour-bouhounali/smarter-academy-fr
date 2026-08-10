import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapter,
  totalModules: LESSON_CONFIG.totalModules,
};

export const getNavLinks = (currentModuleNumber) => {
  const currentIdx = LESSON_CONFIG.modules.findIndex(m => m.number === currentModuleNumber);
  if (currentIdx === -1) return { prevLink: null, nextLink: null };

  const prevLink = currentIdx > 0 ? LESSON_CONFIG.modules[currentIdx - 1].path : LESSON_BASE_PATH;
  const nextLink = currentIdx < LESSON_CONFIG.modules.length - 1 ? LESSON_CONFIG.modules[currentIdx + 1].path : null;

  return { prevLink, nextLink };
};
