import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ArrowUpRight, ArrowDownRight, Sparkles, Map as MapIcon, HandHelping } from 'lucide-react';
import { useAdminResource } from '../../../hooks/useAdminResource';
import {
  fetchClassAttention,
  fetchClassLearningMap,
  fetchClassInterventions,
} from '../../../services/teacher/classGroupService';
import { Loading, ErrorBox } from '../../../pages/teacher/teacherUi';
import SignalCard from '../insights/SignalCard';
import InterventionForm from '../interventions/InterventionForm';
import { interventionDefaults, studentName } from '../insights/insights';
import { barSegments, LP_STATUS_BAR, LP_STATUSES } from '../learningPoints/lpBar';
import WeekLessons from '../today/WeekLessonList';
import { todayIso } from '../today/weekLessons';
import MathLabel from '../../../lessons/common/components/MathLabel';

const VISIBLE_SIGNALS = 2;
const CARD = 'rounded-2xl border border-nav-line bg-white p-5';

/**
 * « Vue d'ensemble » — what the teacher sees FIRST when he opens a class, on about one screen:
 *
 *   1. this week        — the lessons the calendar gives this class, and the way into each;
 *   2. the class today  — ONE bar of all its savoir-faire (counts, never an average) and what changed;
 *   3. needs a look     — the two most shared signals, the rest on demand;
 *   4. engagement       — who is not active (not a proof of difficulty).
 *
 * The full map of savoir-faire is NOT repeated here: it is the section « Apprentissages », one tap away. Everything comes from the
 * server, already decided; the screen only lays it out.
 */
export default function OverviewTab({ classGroup, onOpenPoint, onOpenTab }) {
  const { t } = useTranslation('teacher');
  const attentionLoader = useCallback((tk) => fetchClassAttention(tk, classGroup.id), [classGroup.id]);
  const mapLoader = useCallback((tk) => fetchClassLearningMap(tk, classGroup.id), [classGroup.id]);
  const openLoader = useCallback(
    (tk) => fetchClassInterventions(tk, classGroup.id, { status: 'open', perPage: 1 }),
    [classGroup.id],
  );
  const attention = useAdminResource(attentionLoader, [attentionLoader]);
  const map = useAdminResource(mapLoader, [mapLoader]);
  const openInterventions = useAdminResource(openLoader, [openLoader]);
  const [acting, setActing] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const learning = (attention.data?.signals ?? []).filter((s) => s.category === 'learning');
  const engagement = (attention.data?.signals ?? []).filter((s) => s.category === 'engagement');
  const openCount = Number(openInterventions.data?.meta?.total) || 0;

  return (
    <div className="space-y-5" data-overview-tab>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className={CARD} data-overview-week>
          <WeekLessons grade={classGroup.grade} today={todayIso()} />
        </section>
        <div className="space-y-4">
          <LearningMapSummary map={map} onOpenTab={onOpenTab} />
          {attention.data && (
            <RecentChanges
              changes={attention.data.recentChanges}
              classGroupId={classGroup.id}
              onOpenPoint={onOpenPoint}
            />
          )}
        </div>
      </div>

      <section aria-labelledby="attention-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="attention-title"
            className="font-space text-lg font-bold text-nav-ink"
            title={attention.data ? t('attention.subtitle', { days: attention.data.window?.days ?? 14 }) : undefined}
          >
            {t('attention.title')}
          </h2>
          {openCount > 0 && (
            <button
              type="button"
              onClick={() => onOpenTab('interventions')}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-nav-accent-soft px-3 text-xs font-bold text-nav-accent"
              data-open-interventions
            >
              <HandHelping size={13} /> {t('attention.openInterventions', { count: openCount })}
            </button>
          )}
        </div>

        {attention.loading && <Loading />}
        {attention.error && <ErrorBox message={attention.error} onRetry={attention.reload} />}
        {attention.data &&
          !attention.loading &&
          (learning.length === 0 ? (
            <div className={`${CARD} flex items-center gap-3`} data-attention-empty>
              <CheckCircle2 size={20} className="shrink-0 text-nav-done" />
              <p className="text-sm font-semibold text-nav-ink">{t('attention.empty')}</p>
            </div>
          ) : (
            <>
              {/* The most SHARED first (the server's order); the rest on demand. */}
              <div className="grid gap-3 lg:grid-cols-2" data-attention-list>
                {(showAll ? learning : learning.slice(0, VISIBLE_SIGNALS)).map((signal) => (
                  <SignalCard
                    key={signal.key}
                    signal={signal}
                    classGroupId={classGroup.id}
                    onOpenPoint={onOpenPoint}
                    onAct={setActing}
                    compact
                  />
                ))}
              </div>
              {learning.length > VISIBLE_SIGNALS && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="min-h-[36px] text-sm font-bold text-nav-accent hover:underline"
                  data-attention-more
                >
                  {showAll ? t('attention.showLess') : t('attention.showAll', { count: learning.length })}
                </button>
              )}
            </>
          ))}
      </section>

      {engagement.length > 0 && (
        <section aria-labelledby="engagement-title" className="space-y-2">
          <h2
            id="engagement-title"
            className="font-space text-base font-bold text-nav-ink"
            title={t('attention.engagementHint')}
          >
            {t('attention.engagementTitle')}
          </h2>
          {engagement.map((signal) => (
            <SignalCard key={signal.key} signal={signal} classGroupId={classGroup.id} onAct={setActing} compact />
          ))}
        </section>
      )}

      <InterventionForm
        open={Boolean(acting)}
        onClose={() => setActing(null)}
        onCreated={() => {
          openInterventions.reload();
        }}
        classGroupId={classGroup.id}
        candidates={acting?.students ?? []}
        prefill={acting ? interventionDefaults(acting) : null}
        point={acting?.learningPoint ? { code: acting.learningPoint.code, title: acting.learningPoint.title } : null}
      />
    </div>
  );
}

/** « Qu'est-ce qui a changé ? »: three numbers on one line; which savoir-faire and which students are one tap away. */
function RecentChanges({ changes, classGroupId, onOpenPoint }) {
  const { t } = useTranslation('teacher');
  if (!changes) return null;
  const unnamed = t('common.unnamedStudent');
  const nothing = changes.improved + changes.declined + changes.firstAssessed === 0;
  const TONE = { improved: 'text-nav-done', declined: 'text-nav-alert', firstAssessed: 'text-nav-accent' };
  const ICON = { improved: ArrowUpRight, declined: ArrowDownRight, firstAssessed: Sparkles };
  const hasDetail =
    changes.byLearningPoint?.length > 0 || changes.studentsImproved?.length > 0 || changes.studentsDeclined?.length > 0;

  return (
    <section aria-labelledby="changes-title" className={CARD} data-recent-changes>
      <h2
        id="changes-title"
        className="font-space text-base font-bold text-nav-ink"
        title={t('attention.changes.subtitle')}
      >
        {t('attention.changes.title')}
      </h2>
      {nothing ? (
        <p className="mt-1 text-sm text-nav-muted">{t('attention.changes.none')}</p>
      ) : (
        <>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {['improved', 'declined', 'firstAssessed'].map((key) => {
              const Icon = ICON[key];
              return (
                <div key={key} className="flex items-baseline gap-1.5" data-change={key}>
                  <dd className={`font-space text-2xl font-bold tabular-nums ${TONE[key]}`} dir="ltr">
                    {changes[key]}
                  </dd>
                  <dt className="flex items-center gap-1 text-xs font-bold text-nav-muted">
                    <Icon size={12} className={TONE[key]} /> {t(`attention.changes.${key}`)}
                  </dt>
                </div>
              );
            })}
          </dl>
          {hasDetail && (
            <details className="group mt-3 border-t border-nav-line pt-2">
              <summary className="flex min-h-[36px] cursor-pointer list-none items-center gap-1 text-sm font-bold text-nav-accent [&::-webkit-details-marker]:hidden">
                {t('attention.changes.byPoint')}
              </summary>
              <ul className="divide-y divide-nav-line text-sm">
                {(changes.byLearningPoint ?? []).map((p) => (
                  <li key={p.code} className="flex items-center gap-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPoint(p.code)}
                      className="min-w-0 flex-1 truncate text-start font-semibold text-nav-ink hover:text-nav-accent"
                    >
                      <MathLabel>{p.title}</MathLabel>
                    </button>
                    {p.improved > 0 && <span className="text-nav-done">↑ {p.improved}</span>}
                    {p.declined > 0 && <span className="text-nav-alert">↓ {p.declined}</span>}
                    {p.firstAssessed > 0 && <span className="text-nav-accent">• {p.firstAssessed}</span>}
                  </li>
                ))}
              </ul>
              {[
                ['studentsImproved', changes.studentsImproved],
                ['studentsDeclined', changes.studentsDeclined],
              ].map(
                ([key, list]) =>
                  list?.length > 0 && (
                    <p key={key} className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-nav-muted">{t(`attention.changes.${key}`)}:</span>
                      {list.map((st) => (
                        <Link
                          key={st.id}
                          to={`/enseignant/classes/${classGroupId}/eleves/${st.id}`}
                          className="rounded-full bg-nav-page px-2 py-0.5 font-semibold text-nav-ink hover:text-nav-accent"
                        >
                          {studentName(st, unnamed)}
                        </Link>
                      ))}
                    </p>
                  ),
              )}
            </details>
          )}
        </>
      )}
    </section>
  );
}

/** The class on ALL its savoir-faire as ONE bar of counts (never an average). The map itself is the section « Apprentissages ». */
function LearningMapSummary({ map, onOpenTab }) {
  const { t } = useTranslation('teacher');
  const totals = {};
  for (const lesson of map.data?.lessons ?? []) {
    for (const lp of lesson.learningPoints ?? []) {
      for (const key of LP_STATUSES) totals[key] = (totals[key] ?? 0) + (Number(lp.counts?.[key]) || 0);
    }
  }
  const segments = barSegments(totals);
  const assessed = segments.some((seg) => seg.key !== 'unassessed' && seg.count > 0);
  return (
    <section aria-labelledby="map-title" className={CARD} data-learning-map-summary>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="map-title" className="font-space text-base font-bold text-nav-ink" title={t('attention.map.subtitle')}>
          {t('attention.map.title')}
        </h2>
        <button
          type="button"
          onClick={() => onOpenTab('learningPoints')}
          className="inline-flex min-h-[36px] items-center gap-1 text-sm font-bold text-nav-accent hover:underline"
        >
          <MapIcon size={14} /> {t('attention.map.open')}
        </button>
      </div>
      {map.loading && <Loading />}
      {map.error && <ErrorBox message={map.error} onRetry={map.reload} />}
      {map.data &&
        !map.loading &&
        (!assessed ? (
          <p className="mt-1 text-sm text-nav-muted">{t('learningPoints.empty')}</p>
        ) : (
          <>
            <span
              className="mt-3 flex h-3 overflow-hidden rounded-full bg-nav-line"
              role="img"
              aria-label={segments
                .map((seg) => `${t(`students.masteryStatus.${seg.key}`)} ${seg.percent}%`)
                .join(' · ')}
            >
              {segments.map(
                (seg) =>
                  seg.percent > 0 && (
                    <span
                      key={seg.key}
                      className={`h-full ${LP_STATUS_BAR[seg.key]}`}
                      style={{ width: `${seg.percent}%` }}
                    />
                  ),
              )}
            </span>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-nav-muted">
              {segments.map((seg) => (
                <span key={seg.key} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-sm ${LP_STATUS_BAR[seg.key]}`} aria-hidden="true" />
                  {t(`students.masteryStatus.${seg.key}`)}{' '}
                  <b className="text-nav-ink" dir="ltr">
                    {seg.percent}%
                  </b>
                </span>
              ))}
            </p>
          </>
        ))}
    </section>
  );
}
