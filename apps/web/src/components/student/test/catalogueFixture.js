// A neutral catalogue for the tests of this folder (the shipped French catalogue is empty until its lessons exist):
// one grade, two thèmes, one unit of two lessons and a synthesis, and one lesson outside any unit.
// By path, not the barrel: a test may mock the barrel with this very fixture.
import { buildCourseLevels } from '@smarter-academy/core/curriculum/coursesData.js';

const lesson = (code, extra) => ({
  code, order: 0, kind: 'lesson', description: `Description ${code}`, prerequisites: [], prerequisiteLessonCodes: [],
  pointsToLearn: [`Point 1 de ${code}`], durationMinutes: 45, difficulty: 1, status: 'available', icon: null,
  decompositionType: 'textbook_lesson', decisionStatus: 'draft', ...extra,
});

export const fixtureLevels = buildCourseLevels([
  {
    programme: {
      grade: '5e', gradeLabel: 'Cinquième', gradeShortLabel: '5e', level: 'college', levelLabel: 'Collège',
      domains: [
        { id: 'd1', title: 'Domaine A', topics: [{ id: 't1', title: 'Sujet 1' }, { id: 't2', title: 'Sujet 2' }] },
        { id: 'd2', title: 'Domaine B', topics: [{ id: 't3', title: 'Sujet 3' }] },
      ],
    },
    lessons: {
      grade: '5e',
      lessons: [
        lesson('lecon-a', { chapterId: 'd1', unitId: 'u1', sourceTopicId: 't1', order: 0 }),
        lesson('lecon-b', { chapterId: 'd1', unitId: 'u1', sourceTopicId: 't2', order: 1 }),
        lesson('synthese-u1', { chapterId: 'd1', unitId: 'u1', sourceTopicId: 't1', order: 2, kind: 'synthesis' }),
        lesson('lecon-c', { chapterId: 'd2', sourceTopicId: 't3', order: 0 }),
      ],
    },
    units: {
      grade: '5e',
      units: [{ code: 'u1', chapterId: 'd1', order: 0, number: 1, title: 'Unité 1', objectives: ['Objectif 1'] }],
      ownerChapters: [],
      chapterIcons: {},
      chapterOrder: { order: [] },
    },
  },
]);

export const fixtureGrade = fixtureLevels[0].grades[0];
