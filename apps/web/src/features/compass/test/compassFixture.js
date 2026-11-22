// A neutral net, calendar and progression for the compass tests (the delivered ones are EMPTY until Stage 2,
// FRANCE_REBUILD_PLAN.md §4bis): two grades, five items, four lessons of 3e and a synthesis, ten teaching weeks.
// Used through the `vi.mock` factories below, which bind the core modules to this fixture.
const item = (id) => ({ id, segment: id.slice(0, 5), grade: id.split('.')[0], number: Number(id.slice(-2)), text: `Compétence ${id}` });

export const NET_INPUT = {
  programme: {
    grades: [{ id: '6e' }, { id: '3e' }],
    segments: [{ id: '6e.m1', grade: '6e', number: 1 }, { id: '3e.m1', grade: '3e', number: 1 }],
    items: ['6e.m1.r01', '6e.m1.r02', '3e.m1.r01', '3e.m1.r02', '3e.m1.r03'].map(item),
  },
  net: {
    threads: [],
    links: [
      { from: '6e.m1.r01', to: '3e.m1.r01', type: 'requires' },
      { from: '6e.m1.r02', to: '3e.m1.r02', type: 'requires' },
      { from: '3e.m1.r01', to: '3e.m1.r02', type: 'requires' },
    ],
  },
  lessonFiles: [
    { grade: '6e', lessons: [{ code: 'a6', order: 0, kind: 'lesson', title: 'Leçon a6', programmeItems: ['6e.m1.r01', '6e.m1.r02'] }] },
    {
      grade: '3e',
      lessons: [
        { code: 'l1', order: 0, kind: 'lesson', title: 'Leçon l1', programmeItems: ['3e.m1.r01'] },
        { code: 'l2', order: 1, kind: 'lesson', title: 'Leçon l2', programmeItems: ['3e.m1.r02'] },
        { code: 'syn', order: 2, kind: 'synthesis', title: 'Synthèse', programmeItems: [] },
        { code: 'l3', order: 3, kind: 'lesson', title: 'Leçon l3', programmeItems: ['3e.m1.r03'] },
      ],
    },
  ],
  unitFiles: [],
};

const monday = (i) => new Date(Date.UTC(2026, 8, 7 + 7 * i)).toISOString().slice(0, 10);
const friday = (i) => new Date(Date.UTC(2026, 8, 11 + 7 * i)).toISOString().slice(0, 10);
const WEEKS = Array.from({ length: 10 }, (_, i) => ({ id: `w${i + 1}`, term: 1, from: monday(i), to: friday(i) }));
const LESSONS_BY_WEEK = [['l1'], [], ['l2'], ['syn', 'l3']];

export const CALENDAR = {
  start: '2026-09-01',
  end: '2027-06-30',
  weeks: WEEKS,
  events: [
    { kind: 'exam', from: '2026-12-07', to: '2026-12-10' },
    { kind: 'break', from: '2026-12-20', to: '2027-01-03' },
    { kind: 'bem_sprint', from: '2027-05-24', to: '2027-06-04', grades: ['3e'] },
  ],
};
export const PROGRESSION = { weeks: WEEKS.map((w, i) => ({ week: w.id, lessons: LESSONS_BY_WEEK[i] ?? [] })) };

/** `vi.mock` factory of learningNet.js: the fixture net, exposed as `fixtureNet` for the scope mock. */
export async function mockLearningNet(importOriginal) {
  const real = await importOriginal();
  const net = real.createLearningNet(NET_INPUT);
  return { ...real, ...net, fixtureNet: net };
}

/** `vi.mock` factory of compass/scope.js: the real rules, on the fixture net. */
export async function mockScope(importOriginal) {
  const real = await importOriginal();
  const { fixtureNet: net } = await import('@smarter-academy/core/curriculum/fr/net/learningNet.js');
  return {
    ...real,
    buildScope: (options) => real.buildScope({ ...options, net }),
    prereqsOf: (id) => real.prereqsOf(id, net),
    itemInfo: (id) => real.itemInfo(id, net),
  };
}

/** `vi.mock` factory of schoolCalendar.js: the fixture year as 2026/2027, for 3e. */
export async function mockSchoolCalendar(importOriginal) {
  const real = await importOriginal();
  const SCHOOL_YEARS = { '2026/2027': { calendar: CALENDAR, progressions: { '3e': PROGRESSION } } };
  return { ...real, SCHOOL_YEARS, getSchoolYear: (schoolYear) => SCHOOL_YEARS[schoolYear] ?? null };
}
