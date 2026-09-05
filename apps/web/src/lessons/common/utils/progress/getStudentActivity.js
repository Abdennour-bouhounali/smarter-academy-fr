import { getLessonProgress } from './getLessonProgress';
import { getFlatAvailableLessons } from '@smarter-academy/core';
import { scopedStorage as storage } from '../../../../utils/storage';
import { getTotalModules } from '../../../registry';

/**
 * Aggregates the same per-lesson progress `getResumeLesson` already reads
 * (storage['smarter_lesson_{id}'] via getLessonProgress) across every
 * available lesson, optionally scoped to one grade — for dashboard/
 * progression views that need more than "the single best lesson to resume."
 *
 * No new storage keys, no new mechanic: this is read-only aggregation over
 * the existing completion model. Mastery is intentionally not computed here
 * — completion percent is the only signal this data supports today.
 *
 * @param {Array} courseLevels - The full curriculum hierarchy from coursesData.js
 * @param {{ gradeId?: string }} [options] - Restrict to one grade's lessons
 * @returns {{
 *   lessons: Array<{lesson: object, chapter: object, grade: object, level: object, progressPercent: number, lastVisitedAt: number, uniqueModules: Set<number>}>,
 *   recentlyActive: Array<same shape, sorted by lastVisitedAt desc>,
 *   completedCount: number,
 *   inProgressCount: number,
 *   notStartedCount: number,
 *   averageProgress: number,
 *   totalXp: number,
 * }}
 */
export function getStudentActivity(courseLevels, { gradeId } = {}) {
  const flatLessons = getFlatAvailableLessons(courseLevels).filter(
    (item) => !gradeId || item.grade.id === gradeId
  );

  // Only built lessons (a registered lesson.config.js gives the real module
  // count) are aggregated — no fabricated module totals.
  const lessons = flatLessons
    .map((item) => ({ item, totalCount: getTotalModules(item.lesson.id) }))
    .filter(({ totalCount }) => totalCount)
    .map(({ item, totalCount }) => {
      const progress = getLessonProgress(item.lesson.id, totalCount);
      return { ...item, ...progress, totalCount };
    });

  const started = lessons.filter((l) => l.lastVisitedAt > 0);
  const completedCount = lessons.filter((l) => l.progressPercent >= 100).length;
  const inProgressCount = started.filter((l) => l.progressPercent < 100).length;
  const notStartedCount = lessons.length - started.length;

  const recentlyActive = [...started].sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);

  const averageProgress = lessons.length
    ? Math.round(lessons.reduce((sum, l) => sum + l.progressPercent, 0) / lessons.length)
    : 0;

  const totalXp = Number(storage.getItem('smarter_global_xp')) || 0;

  return { lessons, recentlyActive, completedCount, inProgressCount, notStartedCount, averageProgress, totalXp };
}
