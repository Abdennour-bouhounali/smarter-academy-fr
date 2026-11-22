import { getSchoolYear, schoolYearOf } from '@smarter-academy/core/curriculum/fr/calendar/schoolCalendar.js';

/**
 * The lessons of THIS week for a grade, read from the school calendar and the grade's progression — what the teacher's
 * home « اليوم » shows on each class card. During holidays (no teaching week holds the date) it is the NEXT teaching
 * week. Guessed from the date: a class that is late or ahead is not known here (NAVIGATION_REBUILD_PLAN.md, N6).
 *
 * @returns {{ weekNumber: number, term: number, lessons: string[], upcoming: boolean } | null} `null` when the school
 *   year has no calendar, the grade no progression, or the year is over.
 */
export function weekLessonsFor(grade, date) {
  const year = getSchoolYear(schoolYearOf(date));
  const progression = year?.progressions[grade];
  if (!progression) return null;
  const weeks = year.calendar.weeks;
  let index = weeks.findIndex((week) => week.from <= date && date <= week.to);
  const upcoming = index < 0;
  if (upcoming) index = weeks.findIndex((week) => week.from > date);
  if (index < 0) return null;
  const week = weeks[index];
  const lessons = progression.weeks.find((entry) => entry.week === week.id)?.lessons ?? [];
  return { weekNumber: index + 1, term: week.term, lessons, upcoming };
}

/** Today as an ISO date in the browser's own day (the calendar has no time zone). */
export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
