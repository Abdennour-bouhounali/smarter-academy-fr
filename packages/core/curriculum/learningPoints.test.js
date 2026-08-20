import { describe, it, expect } from 'vitest';
import { courseLevels } from './coursesData';

const allLessons = courseLevels.flatMap((level) =>
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

  it('is deterministic and matches the spec example for resolution-problemes', () => {
    const rp = allLessons.find(({ lesson }) => lesson.id === 'resolution-problemes').lesson;
    expect(rp.learningPoints[2]).toEqual({
      id: '6e_resolution-problemes_P3',
      title: 'Modéliser une situation (schéma, groupes, droite graduée, tableau)',
      order: 3,
    });
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
