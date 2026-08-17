import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  courseTitle: LESSON_CONFIG.title,
  coursePath: LESSON_BASE_PATH,
  chapter: LESSON_CONFIG.chapterTitle || LESSON_CONFIG.chapter,
  totalModules: LESSON_CONFIG.totalModules,
  sequentialUnlock: LESSON_CONFIG.sequentialUnlock,
};

export function getNavLinks(currentIndex) {
  const prevNum = currentIndex > 1 ? currentIndex - 1 : null;
  const nextNum = currentIndex < LESSON_CONFIG.totalModules ? currentIndex + 1 : null;
  return {
    prevLink: prevNum ? `${LESSON_BASE_PATH}/${prevNum}` : null,
    nextLink: nextNum ? `${LESSON_BASE_PATH}/${nextNum}` : null,
  };
}
