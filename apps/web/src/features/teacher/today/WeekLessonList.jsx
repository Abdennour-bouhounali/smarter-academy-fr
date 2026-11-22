import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLessonById, getLessonPath } from '@smarter-academy/core';
import { weekLessonsFor } from './weekLessons';
import { hasClassBoard, classSessionPath } from '../../classSession/boardLessons';
import { btnPrimary, btnSecondary } from '../../../pages/teacher/teacherUi';

/** One line per lesson of the week: its name, and the way in. A lesson not written yet is named, never linked. */
function WeekLesson({ code, first }) {
  const { t } = useTranslation('teacher');
  const lesson = getLessonById(code);
  const path = getLessonPath(code);
  const name = lesson?.title ?? code;
  if (!path) {
    return (
      <li className="flex min-h-[44px] items-center justify-between gap-3 text-nav-muted">
        <span className="min-w-0 truncate font-inter text-sm font-semibold">{name}</span>
        <span className="flex-shrink-0 rounded-full border border-nav-line px-2.5 py-0.5 text-xs font-semibold">
          {t('home.today.comingSoon')}
        </span>
      </li>
    );
  }
  return (
    <li
      className="flex min-h-[44px] flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1"
      data-week-lesson={code}
    >
      <Link
        to={path}
        className={`min-w-0 font-space font-bold text-nav-ink hover:underline ${first ? 'text-base' : 'text-sm'}`}
      >
        {name}
      </Link>
      {hasClassBoard(code) && (
        <Link to={classSessionPath(code)} className={first ? btnPrimary : btnSecondary} data-week-session>
          {t('home.today.classSession')}
        </Link>
      )}
    </li>
  );
}

/**
 * The lessons the school calendar gives a grade THIS week (the next teaching week on a day off) — the same reading on
 * the teacher's home « Aujourd'hui » and at the top of a class page, so the two never disagree.
 */
export default function WeekLessons({ grade, today }) {
  const { t } = useTranslation('teacher');
  const week = weekLessonsFor(grade, today);
  return (
    <div data-week-lessons>
      <p className="font-inter text-xs font-bold text-nav-muted">
        {week?.upcoming ? t('home.today.nextWeekLessons') : t('home.today.weekLessons')}
      </p>
      {week?.lessons.length ? (
        <ul className="mt-1 divide-y divide-nav-line">
          {week.lessons.map((code, index) => (
            <WeekLesson key={code} code={code} first={index === 0} />
          ))}
        </ul>
      ) : (
        <p className="mt-1 font-inter text-sm text-nav-muted">{t('home.today.noLesson')}</p>
      )}
    </div>
  );
}
