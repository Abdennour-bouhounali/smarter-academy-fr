import { describe, it, expect } from 'vitest';
import { weekLessonsFor, todayIso } from './weekLessons';

describe('the lessons of the week on the teacher’s home', () => {
  it('reads the teaching week that holds the date', () => {
    const week = weekLessonsFor('4am', '2026-09-28');
    expect(week).toMatchObject({ weekNumber: 1, term: 1, upcoming: false });
    expect(week.lessons[0]).toBe('qasim-adad-tabii');
  });

  it('gives the next teaching week on a day off', () => {
    const friday = weekLessonsFor('4am', '2026-10-02');
    expect(friday).toMatchObject({ weekNumber: 2, upcoming: true });
    expect(friday.lessons).toContain('tayin-pgcd');
  });

  it('is null without a calendar, without a progression, and after the year', () => {
    expect(weekLessonsFor('4am', '2019-01-10')).toBeNull();
    expect(weekLessonsFor('1as', '2026-10-05')).toBeNull();
    expect(weekLessonsFor('4am', '2027-08-01')).toBeNull();
  });

  it('writes today as a calendar date', () => {
    expect(todayIso(new Date(2026, 10, 6))).toBe('2026-11-06');
  });
});
