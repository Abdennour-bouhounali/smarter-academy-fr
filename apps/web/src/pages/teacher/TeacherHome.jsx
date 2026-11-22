import { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Plus, ClipboardCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchTeacherDashboard } from '../../services/teacher/classGroupService';
import { getDisplayName } from '../../utils/userDisplay';
import { useReviewCount } from '../../features/teacher/reviews/useReviewCount';
import { weekLessonsFor, todayIso } from '../../features/teacher/today/weekLessons';
import WeekLessons from '../../features/teacher/today/WeekLessonList';
import { TeacherPage, Loading, ErrorBox, btnSecondary } from './teacherUi';
import { usePayments } from '../../context/PaymentsContext';

const CARD = 'rounded-2xl border border-nav-line bg-white p-5';

/** A class on « Aujourd'hui »: who, the lessons of its week, the way to the class. */
function ClassToday({ classGroup, today }) {
  const { t } = useTranslation('teacher');
  return (
    <article className={`${CARD} flex flex-col gap-3`} data-class-today={classGroup.id}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="min-w-0 font-space text-lg font-bold leading-snug text-nav-ink">{classGroup.name}</h3>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 font-inter text-sm font-semibold text-nav-muted">
          <Users size={14} aria-hidden="true" /> {t('home.studentsCount', { count: classGroup.studentsCount ?? 0 })}
        </span>
      </header>
      <WeekLessons grade={classGroup.grade} today={today} />
      <Link to={`/enseignant/classes/${classGroup.id}`} className={`${btnSecondary} mt-auto justify-center`}>
        {t('home.today.openClass')}
      </Link>
    </article>
  );
}

/**
 * « Aujourd'hui », the teacher's home: his week, class by class — the lessons the school calendar gives each class this week,
 * and what waits for him. The seats and the plan live in « Ma formule » (under his picture); the home keeps one line about
 * them only when a limit is reached or a request is pending.
 */
export default function TeacherHome() {
  const { t } = useTranslation('teacher');
  useDocumentMeta(t('home.metaTitle'), t('home.metaDescription'));
  const { user } = useContext(AuthContext);
  const loader = useCallback((token) => fetchTeacherDashboard(token), []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const reviews = useReviewCount();
  // Payments closed: no limit line, no plan link, no pending request — nothing is sold (§4ter).
  const { paymentsOpen } = usePayments();
  const today = todayIso();
  const ent = data?.entitlements;
  const classes = (data?.classrooms ?? []).filter((c) => c.status !== 'archived');
  // The grade whose lessons are built first (3e, FRANCE_REBUILD_PLAN.md §8); null while the year has no calendar.
  const week = weekLessonsFor('3e', today);

  return (
    <TeacherPage
      eyebrow={t('home.greeting', { name: getDisplayName(user) })}
      title={t('home.today.title')}
      subtitle={week ? t('home.today.weekOf', { week: week.weekNumber, term: week.term }) : undefined}
      actions={
        ent && (
          <Link
            to="/enseignant/classes/nouveau"
            className={btnSecondary}
            aria-disabled={!ent.classes.canCreate}
            data-new-class
          >
            <Plus size={15} aria-hidden="true" /> {t('home.newClass')}
          </Link>
        )
      }
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-5" data-tour="teacher-home.classes">
          {reviews > 0 && (
            <Link
              to="/enseignant/tashih"
              className="flex min-h-[52px] items-center gap-3 rounded-2xl bg-nav-alert-soft px-4 font-inter text-sm font-bold text-[#9b2238]"
              data-home-reviews
            >
              <ClipboardCheck size={18} aria-hidden="true" />
              {t('home.today.waiting', { count: reviews })}
            </Link>
          )}
          {!paymentsOpen ? null : ent.students.overLimit || ent.classes.overLimit ? (
            <p
              className="rounded-2xl bg-nav-now-soft p-3 font-inter text-sm font-semibold text-[#8a5a00]"
              role="status"
            >
              {t('home.overLimit')}
            </p>
          ) : ent.students.maximum != null && ent.students.current >= ent.students.maximum ? (
            <p
              className="rounded-2xl border border-nav-line bg-white p-3 font-inter text-sm text-nav-ink"
              role="status"
              data-seats-full
            >
              {t('home.seatsFull', { count: ent.students.maximum })}{' '}
              <Link to="/enseignant/offre" className="font-bold underline">
                {t('home.plan')}
              </Link>
            </p>
          ) : null}
          {paymentsOpen && ent.request && (
            <p
              className="rounded-2xl border border-nav-line bg-white p-3 font-inter text-sm text-nav-ink"
              role="status"
            >
              {t('home.pendingRequest', { plan: ent.request.planName })}
            </p>
          )}
          {classes.length === 0 ? (
            <div className={`${CARD} p-10 text-center`}>
              <Users size={28} className="mx-auto mb-3 text-nav-muted" aria-hidden="true" />
              <p className="font-space font-bold text-nav-ink">{t('home.noClassesTitle')}</p>
              <p className="mt-1 font-inter text-sm text-nav-muted">{t('home.noClassesBody')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3" data-tour="teacher-home.week">
              {classes.map((c) => (
                <ClassToday key={c.id} classGroup={c} today={today} />
              ))}
            </div>
          )}
        </div>
      )}
    </TeacherPage>
  );
}
