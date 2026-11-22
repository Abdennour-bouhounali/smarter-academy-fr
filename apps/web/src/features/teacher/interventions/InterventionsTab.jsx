import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, ChevronDown, ChevronUp, CalendarClock } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchClassInterventions, fetchClassIntervention, updateClassIntervention } from '../../../services/teacher/classGroupService';
import { Loading, ErrorBox, formatDate, btnSecondary } from '../../../pages/teacher/teacherUi';
import InterventionOutcome from './InterventionOutcome';
import { studentName } from '../insights/insights';

const FILTERS = ['open', 'closed', 'all'];

/**
 * « Interventions » — ce que l'enseignant a fait, et ce qui a suivi. Les
 * interventions ouvertes d'abord. Une carte résume la mesure ; la déplier
 * charge le détail (le chemin de chaque élève depuis le geste).
 */
export default function InterventionsTab({ classGroup, onOpenPoint }) {
  const { t } = useTranslation('teacher');
  const [filter, setFilter] = useState('open');
  const loader = useCallback((tk) => fetchClassInterventions(tk, classGroup.id, { status: filter === 'all' ? undefined : filter, perPage: 30 }), [classGroup.id, filter]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <div className="space-y-4" data-interventions-tab>
      <div className="flex flex-wrap items-center justify-between gap-3" title={t('interventions.subtitle')}>
        <div role="tablist" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`min-h-[40px] rounded-full border px-3.5 font-inter text-sm font-bold ${filter === f ? 'border-transparent bg-nav-accent-soft text-nav-accent' : 'border-nav-line bg-white text-nav-muted hover:text-nav-ink'}`}>
              {t(`interventions.filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !loading && (data.interventions.length === 0 ? (
        <div className="rounded-2xl border border-nav-line bg-white p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">{t('interventions.empty')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('interventions.emptyHint')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.interventions.map((iv) => <InterventionCard key={iv.id} classGroup={classGroup} intervention={iv} onChanged={reload} onOpenPoint={onOpenPoint} />)}
        </ul>
      ))}
    </div>
  );
}

export function InterventionCard({ classGroup, intervention, onChanged, onOpenPoint }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const iv = detail ?? intervention;
  const unnamed = t('common.unnamedStudent');
  const reviewDue = iv.status === 'open' && iv.reviewAfter && iv.reviewAfter <= new Date().toISOString().slice(0, 10);

  const expand = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (!detail && intervention.outcome) {
      try { setDetail(await fetchClassIntervention(token, classGroup.id, intervention.id)); } catch { /* le résumé reste affiché */ }
    }
  };

  const toggleStatus = async () => {
    setBusy(true);
    try {
      setDetail(await updateClassIntervention(token, classGroup.id, iv.id, { status: iv.status === 'open' ? 'closed' : 'open' }));
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-nav-line bg-white p-4" data-intervention={iv.id} data-intervention-status={iv.status}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-space text-sm font-bold text-slate-900">{t(`interventions.kinds.${iv.kind}`)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${iv.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t(`interventions.status.${iv.status}`)}</span>
            {iv.studentVisible && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800"><Eye size={10} /> {t('interventions.visibleBadge')}</span>}
            {reviewDue && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"><CalendarClock size={10} /> {t('interventions.reviewDue')}</span>}
          </p>
          {iv.learningPoint && (
            <p className="text-xs text-slate-700">
              {onOpenPoint
                ? <button type="button" className="font-semibold text-nav-accent hover:underline" onClick={() => onOpenPoint(iv.learningPoint.code)}>{iv.learningPoint.title}</button>
                : <span className="font-semibold">{iv.learningPoint.title}</span>}
              {iv.lesson?.title && <span className="text-slate-400"> · {iv.lesson.title}</span>}
            </p>
          )}
          <p className="flex flex-wrap gap-1.5 text-[11px]">
            {iv.students.map((s) => (
              <Link key={s.id} to={`/enseignant/classes/${classGroup.id}/eleves/${s.id}`} className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-700 hover:bg-nav-page">{studentName(s, unnamed)}</Link>
            ))}
          </p>
          {iv.note && <p className="whitespace-pre-line rounded-lg bg-slate-50 p-2 text-xs text-slate-700">{iv.note}</p>}
          {iv.studentMessage && <p className="text-[11px] text-sky-800">« {iv.studentMessage} »</p>}
          <p className="text-[10px] text-slate-400">
            {t('interventions.openedAt', { date: formatDate(iv.openedAt) })}
            {iv.closedAt && <> · {t('interventions.closedAt', { date: formatDate(iv.closedAt) })}</>}
            {iv.reviewAfter && <> · {t('interventions.reviewAfter', { date: formatDate(iv.reviewAfter) })}</>}
            {iv.sourceSignal && <> · {t('interventions.sourceSignal', { type: t(`attention.types.${iv.sourceSignal}.title`, { point: iv.learningPoint?.title ?? '' }) })}</>}
          </p>
        </div>
        <button type="button" onClick={toggleStatus} disabled={busy} className={btnSecondary} data-intervention-toggle>
          {iv.status === 'open' ? t('interventions.close') : t('interventions.reopen')}
        </button>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        {iv.outcome ? (
          <>
            <InterventionOutcome outcome={iv.outcome} detailed={open && Boolean(detail)} />
            <button type="button" onClick={expand} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-nav-accent hover:underline" data-intervention-expand>
              {open ? <><ChevronUp size={13} /> {t('interventions.hideDetails')}</> : <><ChevronDown size={13} /> {t('interventions.details')}</>}
            </button>
          </>
        ) : <InterventionOutcome outcome={null} />}
      </div>
    </li>
  );
}
