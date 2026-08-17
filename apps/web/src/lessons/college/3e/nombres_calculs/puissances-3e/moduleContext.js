import { createContext } from 'react';
import { LESSON_CONFIG, getModuleNav, LESSON_BASE_PATH } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  totalModules: LESSON_CONFIG.modules.length,
};

export const LessonContext = createContext(MODULE_CTX);

export { getModuleNav as getNavLinks };
