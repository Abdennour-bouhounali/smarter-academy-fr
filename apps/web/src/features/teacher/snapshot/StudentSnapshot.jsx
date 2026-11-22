import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';
import { formatDate } from '../../../pages/teacher/teacherUi';
import MasteryPill, { FreshnessMark } from '../learningPoints/MasteryPill';
import { LP_STATUSES } from '../learningPoints/lpBar';
import { DIRECTION_TONE, TREND_TONE } from '../insights/insights';

/**
 * « لمحة » — l'aperçu d'UN élève, en une lecture, tel que le serveur l'a
 * composé (App\Domain\Classroom\Insights\StudentSnapshot).
 *
 * Trois colonnes pour trois choses qu'on ne confond pas :
 *   APPRENTISSAGE — forces et difficultés, par point (statuts du moteur) ;
 *   ÉVOLUTION     — ce qui a bougé sur la période (tendance lue sur les
 *                   statuts, jamais sur un pourcentage) ;
 *   ACTIVITÉ      — ce que l'élève a fait, avec un rappel : l'activité
 *                   n'est pas l'apprentissage.
 * « Preuve insuffisante » n'est jamais rangé dans les difficultés.
 */
export default function StudentSnapshot({ snapshot, onExplain }) {
  const { t } = useTranslation('teacher');
  if (!snapshot) return null;
  const { learning, evolution, activity } = snapshot;
  const waiting = (learning.reasons?.insufficientEvidence ?? 0) + (learning.reasons?.needsAssessment ?? 0);

  return (
    <section className="rounded-2xl border border-nav-line bg-white p-5 space-y-4" aria-labelledby="snapshot-title" data-student-snapshot>
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="snapshot-title" className="font-space text-lg font-bold text-slate-900">{t('snapshot.title')}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${TREND_TONE[evolution.trend] ?? TREND_TONE.stable}`} data-snapshot-trend={evolution.trend} title={t('snapshot.trendHint')}>
          {t(`snapshot.trend.${evolution.trend}`)}
        </span>
        <span className="text-xs text-slate-500">{t('snapshot.window', { days: snapshot.window?.days ?? 14 })}</span>
        <span className="ms-auto flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {LP_STATUSES.map((key) => (
            <span key={key} className="inline-flex items-center gap-1"><MasteryPill status={key} /><span className="font-mono-jetbrains font-bold tabular-nums text-slate-700">{learning.counts?.[key] ?? 0}</span></span>
          ))}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-3">
          <PointList title={t('snapshot.difficulties')} rows={learning.difficulties} total={learning.difficultiesTotal} onExplain={onExplain} tone="rose" empty={t('snapshot.none')} />
          {waiting > 0 && <p className="flex items-start gap-1.5 text-[11px] text-slate-500"><Info size={12} className="mt-0.5 shrink-0" /> {t('snapshot.insufficient', { count: waiting })}</p>}
        </div>
        <PointList title={t('snapshot.strengths')} rows={learning.strengths} total={learning.strengthsTotal} onExplain={onExplain} tone="emerald" empty={t('snapshot.none')} showFreshness />
        <div className="space-y-3">
          <div>
            <h3 className="mb-1.5 text-xs font-semibold text-slate-800">{t('snapshot.changes')}</h3>
            {evolution.changes?.length ? (
              <ul className="space-y-1 text-xs">
                {evolution.changes.map((c) => (
                  <li key={c.code} className="flex items-center gap-2">
                    {c.direction === 'improved' ? <TrendingUp size={12} className={DIRECTION_TONE.improved} /> : c.direction === 'declined' ? <TrendingDown size={12} className={DIRECTION_TONE.declined} /> : <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                    <button type="button" onClick={() => onExplain?.(c.code)} className="min-w-0 flex-1 truncate text-start text-slate-700 hover:underline">{c.title}</button>
                    <MasteryPill status={c.to} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-slate-400">{t('snapshot.noChanges')}</p>}
          </div>
          <div className="rounded-xl bg-slate-50 p-3" data-snapshot-activity>
            <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800"><Activity size={12} /> {t('snapshot.activity')}</h3>
            <dl className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-2"><dt className="text-slate-500">{t('snapshot.lastActivity')}</dt><dd className="font-semibold text-slate-800">{activity.lastActivityAt ? formatDate(activity.lastActivityAt) : t('snapshot.noActivity')}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">{t('snapshot.recentAnswered')}</dt><dd className="font-mono-jetbrains font-semibold tabular-nums text-slate-800" dir="ltr">{activity.recentAnswered}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">{t('snapshot.recentSuccess')}</dt><dd className="font-mono-jetbrains font-semibold tabular-nums text-slate-800" dir="ltr">{activity.recentSuccessRate === null ? '—' : `${activity.recentSuccessRate}%`}</dd></div>
              {activity.currentLearningPoint && (
                <div className="flex justify-between gap-2"><dt className="text-slate-500">{t('snapshot.currentPoint')}</dt><dd className="truncate font-semibold text-slate-800">{activity.currentLearningPoint.title}</dd></div>
              )}
            </dl>
            <p className="mt-2 text-[10px] text-slate-400">{t('snapshot.activityNote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PointList({ title, rows, total, onExplain, tone, empty, showFreshness = false }) {
  const { t } = useTranslation('teacher');
  return (
    <div data-snapshot-list={tone}>
      <h3 className="mb-1.5 text-xs font-semibold text-slate-800">{title} <span className="font-mono-jetbrains text-slate-400" dir="ltr">{total ?? 0}</span></h3>
      {!rows?.length ? <p className="text-xs text-slate-400">{empty}</p> : (
        <ul className="space-y-1">
          {rows.map((r) => (
            <li key={r.code}>
              <button type="button" onClick={() => onExplain?.(r.code)} className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1 text-start text-xs hover:bg-white ${tone === 'rose' ? 'border-rose-100 bg-rose-50/40' : 'border-emerald-100 bg-emerald-50/40'}`} data-snapshot-point={r.code}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-800">{r.title}</span>
                  <span className="block truncate text-[10px] text-slate-500">{r.lessonTitle}</span>
                </span>
                {tone === 'rose' && r.recentFailures > 0 && <span className="shrink-0 text-[10px] text-rose-700">{t('attention.studentFacts', { failures: r.recentFailures, answered: r.recentAnswered })}</span>}
                {showFreshness && <FreshnessMark freshness={r.freshness} />}
                <MasteryPill status={r.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
