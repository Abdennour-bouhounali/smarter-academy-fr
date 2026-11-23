import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users } from 'lucide-react';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * The lesson the student goes back to — one card. Shared by the home's two states: « Ma boussole » on
 * (CompassHomeSections) and off (TodaySection, below). `resume` is getResumeLesson's shape (or the first lesson of his
 * grade, `progress` 0); none → nothing. Extra props (a `data-*` marker) go on the link.
 */
export function ResumeLessonCard({ resume, ...rest }) {
  const { t } = useTranslation('student');
  if (!resume) return <div />;
  const percent = Math.round(resume.progress ?? 0);
  return (
    <Link
      to={resume.resumePath}
      className="flex h-full min-w-0 items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 sm:p-5"
      {...rest}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-nav-accent-soft text-nav-accent">
        <BookOpen size={24} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-black text-slate-900">
          <MathLabel>
            {percent > 0
              ? t('compassHome.lesson.continue', { title: resume.course.title })
              : t('compassHome.lesson.next', { title: resume.course.title })}
          </MathLabel>
        </span>
        <span className="block text-sm text-slate-600">{t('compassHome.lesson.progress', { percent })}</span>
        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full bg-nav-accent" style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-nav-accent">
        {percent > 0 ? t('compassHome.lesson.cta') : t('compassHome.lesson.start')}
      </span>
    </Link>
  );
}

/**
 * The home's « what I do now » while « Ma boussole » is switched off (config/features.js): his class, his lesson, the
 * daily challenge when it is on. Nothing of the compass — no calendar, no milestone, no year strip, no network: the
 * compass's lazy bundle is not even loaded.
 */
export default function TodaySection({ resume, classroom, challenge }) {
  const { t } = useTranslation('student');
  return (
    <div className="space-y-5" data-home-today>
      {classroom && (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-nav-accent-soft px-3 py-1 text-sm font-bold text-indigo-900">
            <Users size={16} aria-hidden="true" />
            {t('compassHome.classChip', { name: classroom.name, teacher: classroom.teacherName ?? '' })}
          </span>
        </div>
      )}
      <div className={`grid gap-4 ${challenge ? 'lg:grid-cols-2' : ''}`}>
        <ResumeLessonCard resume={resume} data-home-lesson />
        {challenge && <div className="min-w-0 [&>a]:mt-0 [&>a]:h-full">{challenge}</div>}
      </div>
    </div>
  );
}
