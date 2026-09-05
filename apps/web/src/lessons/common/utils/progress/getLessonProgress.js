import { calculateCompletionPercentage } from '@smarter-academy/core';
import { scopedStorage as storage } from '../../../../utils/storage';

/**
 * Retrieves and parses the progression state of a specific lesson from storage.
 *
 * @param {string} lessonId - The unique ID of the lesson.
 * @param {number|null} totalModules - The lesson's real module count (from
 *        the lesson registry's getTotalModules — never a fabricated default).
 *        Null/0 keeps progressPercent at 0: an unbuilt lesson has no
 *        completion to report.
 * @returns {Object} Progress details including percentage and last visited timestamp.
 */
export function getLessonProgress(lessonId, totalModules) {
  let progressPercent = 0;
  let currentModule = 1;
  let lastVisitedAt = 0;
  let uniqueModules = new Set();

  if (!lessonId) return { progressPercent, currentModule, lastVisitedAt, uniqueModules };

  try {
    const saved = storage.getItem(`smarter_lesson_${lessonId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.completedModules)) {
        parsed.completedModules.forEach(m => {
          const str = String(m);
          // Match the numeric part (e.g., "L01-4e" -> 1, "3" -> 3)
          const match = str.match(/(?:L0?|^)(\d+)/);
          if (match) uniqueModules.add(parseInt(match[1], 10));
        });
      }

      progressPercent = totalModules
        ? calculateCompletionPercentage(parsed.completedModules, totalModules)
        : 0;
      currentModule = parsed.currentModule || 1;
      lastVisitedAt = parsed.lastVisitedAt || 0;
    }
  } catch {
    // Ignore JSON parse errors or local storage access errors
  }

  return { progressPercent, currentModule, lastVisitedAt, uniqueModules };
}
