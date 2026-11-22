import { describe, it, expect } from 'vitest';
import { allCourseLevels, buildCourseLevels } from './coursesData';

// The delivered catalogue has no lesson yet: the derivation is also checked on a small neutral grade of its own.
const FIXTURE = buildCourseLevels([
  {
    programme: {
      grade: '6e', gradeLabel: 'Sixième', level: 'college', levelLabel: 'Collège',
      domains: [{ id: 'd1', title: 'Domaine A', topics: [{ id: 't1', title: 'Sujet 1' }] }],
    },
    lessons: {
      grade: '6e',
      lessons: [
        { code: 'lecon-a', chapterId: 'd1', sourceTopicId: 't1', order: 0, pointsToLearn: ['Point un', 'Point deux'], status: 'available' },
        {
          code: 'lecon-b', chapterId: 'd1', sourceTopicId: 't1', order: 1, pointsToLearn: ['Point trois'], status: 'coming_soon',
          pointPrerequisites: { P1: ['6e_lecon-a_P2'] },
        },
        { code: 'lecon-vide', chapterId: 'd1', sourceTopicId: 't1', order: 2, pointsToLearn: [], status: 'coming_soon' },
      ],
    },
    units: { grade: '6e', units: [] },
  },
]);

const lessonsOf = (levels) => levels.flatMap((level) =>
  level.grades.flatMap((grade) =>
    grade.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({ gradeId: grade.id, lesson }))
    )
  )
);

describe('learningPoints derivation (fixture)', () => {
  const [a, b, empty] = lessonsOf(FIXTURE).map(({ lesson }) => lesson);

  it('carries the declared point prerequisites with the server mastery threshold', () => {
    expect(b.learningPoints[0].prerequisites).toEqual([{ id: '6e_lecon-a_P2', requiredMastery: 0.7 }]);
    expect(a.learningPoints.map((lp) => lp.prerequisites)).toEqual([[], []]);
  });

  it('yields an empty array when a lesson has no pointsToLearn', () => {
    expect(empty.learningPoints).toEqual([]);
  });
});

describe.each([
  ['delivered', allCourseLevels],
  ['fixture', FIXTURE],
])('learningPoints derivation (%s)', (_, levels) => {
  const allLessons = lessonsOf(levels);

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

  it('declares point prerequisites only on points that exist in the catalogue', () => {
    const ids = new Set(allLessons.flatMap(({ lesson }) => lesson.learningPoints.map((lp) => lp.id)));
    for (const { lesson } of allLessons) {
      for (const lp of lesson.learningPoints) for (const pre of lp.prerequisites) expect(ids, `${lp.id} → ${pre.id}`).toContain(pre.id);
    }
  });
});
