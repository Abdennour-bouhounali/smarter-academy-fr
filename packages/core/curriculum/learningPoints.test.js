import { describe, it, expect } from 'vitest';
// Learning-point derivation is a data-shape invariant of the Algerian
// catalogue (the inherited French one was deleted on 2026-09-25).
import { dzCourseLevels as allCourseLevels } from './coursesData';

const allLessons = allCourseLevels.flatMap((level) =>
  level.grades.flatMap((grade) =>
    grade.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({ gradeId: grade.id, lesson }))
    )
  )
);

describe('learningPoints derivation', () => {
  it('derives one learning point per pointsToLearn entry, in the same order', () => {
    for (const { lesson } of allLessons) {
      expect(lesson.learningPoints).toHaveLength(lesson.pointsToLearn.length);
      lesson.learningPoints.forEach((lp, i) => {
        expect(lp.title).toBe(lesson.pointsToLearn[i]);
        expect(lp.order).toBe(i + 1);
      });
    }
  });

  it('produces the documented id format: {gradeId}_{lessonId}_P{n}', () => {
    for (const { gradeId, lesson } of allLessons) {
      lesson.learningPoints.forEach((lp, i) => {
        expect(lp.id).toBe(`${gradeId}_${lesson.id}_P${i + 1}`);
      });
    }
  });

  it('keeps every learning point title within the learning_points.title column (VARCHAR 255)', () => {
    // The importer writes the title as is: a longer one crashes smarter:import-curriculum (hall-mushkil-muadala P3, 2026-10-29).
    for (const { lesson } of allLessons) {
      lesson.learningPoints.forEach((lp) => {
        expect(lp.title.length, lp.id).toBeLessThanOrEqual(255);
      });
    }
  });

  it('has lessons to check', () => {
    expect(allLessons.length).toBeGreaterThan(0);
  });

  it('produces globally unique learning point ids across the whole curriculum', () => {
    const ids = allLessons.flatMap(({ lesson }) => lesson.learningPoints.map((lp) => lp.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('yields an empty array when a lesson has no pointsToLearn', () => {
    for (const { lesson } of allLessons) {
      if (lesson.pointsToLearn.length === 0) {
        expect(lesson.learningPoints).toEqual([]);
      }
    }
  });
});
