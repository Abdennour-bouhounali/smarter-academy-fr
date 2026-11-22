import { describe, it, expect, vi } from 'vitest';
import { weekLessonsFor, todayIso } from './weekLessons';

// A neutral school year written here (the shipped French year is empty until Stage 2D): two teaching weeks of 3e.
vi.mock('@smarter-academy/core/curriculum/fr/calendar/schoolCalendar.js', async (importOriginal) => {
  const real = await importOriginal();
  const YEAR = {
    calendar: {
      weeks: [
        { id: 'w1', term: 1, from: '2026-09-28', to: '2026-10-01' },
        { id: 'w2', term: 1, from: '2026-10-05', to: '2026-10-08' },
      ],
    },
    progressions: {
      '3e': {
        weeks: [
          { week: 'w1', lessons: ['lecon-a'] },
          { week: 'w2', lessons: ['lecon-b', 'lecon-c'] },
        ],
      },
    },
  };
  return { ...real, getSchoolYear: (schoolYear) => (schoolYear === real.schoolYearOf('2026-10-01') ? YEAR : null) };
});

describe('the lessons of the week on the teacher’s home', () => {
  it('reads the teaching week that holds the date', () => {
    const week = weekLessonsFor('3e', '2026-09-28');
    expect(week).toMatchObject({ weekNumber: 1, term: 1, upcoming: false });
    expect(week.lessons[0]).toBe('lecon-a');
  });

  it('gives the next teaching week on a day off', () => {
    const friday = weekLessonsFor('3e', '2026-10-02');
    expect(friday).toMatchObject({ weekNumber: 2, upcoming: true });
    expect(friday.lessons).toContain('lecon-b');
  });

  it('is null without a calendar, without a progression, and after the year', () => {
    expect(weekLessonsFor('3e', '2019-01-10')).toBeNull();
    expect(weekLessonsFor('6e', '2026-10-05')).toBeNull();
    expect(weekLessonsFor('3e', '2027-08-01')).toBeNull();
  });

  it('writes today as a calendar date', () => {
    expect(todayIso(new Date(2026, 10, 6))).toBe('2026-11-06');
  });
});
