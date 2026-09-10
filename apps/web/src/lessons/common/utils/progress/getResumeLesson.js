import { getLessonProgress } from './getLessonProgress';
import { getNextIncompleteModule, getFlatAvailableLessons } from '@smarter-academy/core';
import { getTotalModules, getModulePath } from '../../../registry';

/**
 * Le chemin de reprise d'une leçon : celui du module visé, ou à défaut
 * l'index de la leçon. Jamais une URL fabriquée à partir d'un numéro.
 */
function resumeShape(entry, resumeModule) {
  const lesson = entry.item.lesson;
  return {
    course: lesson,
    level: entry.item.level,
    grade: entry.item.grade,
    chapter: entry.item.chapter,
    progress: entry.progressPercent,
    resumeModule,
    totalModules: entry.totalCount,
    // Le module d'abord ; l'index de la leçon si ce module n'est pas routé.
    // L'index existe toujours pour une leçon construite, donc ce chemin ne
    // peut pas être nul — l'élève atterrit au pire sur le sommaire, jamais
    // sur la page d'accueil.
    resumePath: getModulePath(lesson.id, resumeModule) || lesson.path,
  };
}

/**
 * Determines the single best lesson for the student to resume.
 * 
 * Rules:
 * 1. Find all started lessons. Sort by most recently visited.
 * 2. If the most recently visited lesson is incomplete (< 100%), resume it.
 * 3. If the most recently visited lesson is complete (100%), find the next 
 *    chronological lesson in the curriculum that is incomplete (started or 0%).
 * 4. If all subsequent lessons are complete, fallback to the most recently 
 *    visited incomplete lesson from the past (if any).
 * 5. Returns null if all lessons are 100% or no lessons are started.
 * 
 * Every returned shape carries `resumePath`: the URL to actually navigate to.
 * Callers must use it instead of joining `course.path` with `resumeModule` —
 * module routes are declared by SLUG, so a numeric segment matches no route
 * and silently falls through to the marketing landing page.
 *
 * @param {Array} courseLevels - The full curriculum hierarchy from coursesData.js
 * @returns {Object|null} The lesson to resume, enriched with progress data.
 */
export function getResumeLesson(courseLevels) {
  const flatLessons = getFlatAvailableLessons(courseLevels);
  if (flatLessons.length === 0) return null;

  // 1. Gather progress for all available lessons
  const lessonProgressMap = new Map();
  const startedLessons = [];

  flatLessons.forEach(item => {
    // A lesson without a built config has no real module count — it is not
    // resumable, and we never fabricate one.
    const totalCount = getTotalModules(item.lesson.id);
    if (!totalCount) return;
    const progress = getLessonProgress(item.lesson.id, totalCount);
    
    lessonProgressMap.set(item.lesson.id, {
      ...progress,
      totalCount,
      item
    });

    if (progress.lastVisitedAt > 0) {
      startedLessons.push(lessonProgressMap.get(item.lesson.id));
    }
  });

  // 2. If nothing is started, return null
  if (startedLessons.length === 0) return null;

  // 3. Sort started lessons by lastVisitedAt (descending)
  startedLessons.sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
  const mostRecent = startedLessons[0];

  // 4. If the most recent is incomplete, resume it
  if (mostRecent.progressPercent < 100) {
    return resumeShape(
      mostRecent,
      getNextIncompleteModule(mostRecent.uniqueModules, mostRecent.totalCount),
    );
  }

  // 5. Most recent is 100%. Find the next incomplete lesson chronologically
  const currentIndex = flatLessons.findIndex(item => item.lesson.id === mostRecent.item.lesson.id);
  
  if (currentIndex !== -1) {
    for (let i = currentIndex + 1; i < flatLessons.length; i++) {
      const nextItem = flatLessons[i];
      const nextProgress = lessonProgressMap.get(nextItem.lesson.id);

      if (nextProgress && nextProgress.progressPercent < 100) {
        return resumeShape(
          nextProgress,
          getNextIncompleteModule(nextProgress.uniqueModules, nextProgress.totalCount),
        );
      }
    }
  }

  // 6. If we reached here, all subsequent lessons are 100%. 
  // Is there ANY incomplete lesson in the past that they started?
  const anyIncomplete = startedLessons.find(p => p.progressPercent < 100);
  if (anyIncomplete) {
    return resumeShape(
      anyIncomplete,
      getNextIncompleteModule(anyIncomplete.uniqueModules, anyIncomplete.totalCount),
    );
  }

  // 7. Everything is 100% completed
  return null;
}
