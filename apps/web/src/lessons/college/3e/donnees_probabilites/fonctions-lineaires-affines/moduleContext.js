/**
 * moduleContext.js
 * Fournit aux composants de module les props communes dérivées de lesson.config.js :
 *  - lessonId, courseTitle, coursePath, totalModules
 *  - levelLabel, gradeLabel (pour le fil d'Ariane dans ModuleLayout)
 *  - getNavLinks(moduleNumber) → { prevLink, nextLink }
 *
 * Usage dans un module :
 *   import { MODULE_CTX, getNavLinks } from '../moduleContext';
 *   const { prevLink, nextLink } = getNavLinks(4);
 */

import { LESSON_CONFIG, LESSON_BASE_PATH, TOTAL_MODULES, getModuleNav } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  coursePath: LESSON_BASE_PATH,
  totalModules: TOTAL_MODULES,
  levelLabel: LESSON_CONFIG.levelLabel ?? 'Collège',
  gradeLabel: LESSON_CONFIG.grade ?? '3ème',
};

export { getModuleNav as getNavLinks };
