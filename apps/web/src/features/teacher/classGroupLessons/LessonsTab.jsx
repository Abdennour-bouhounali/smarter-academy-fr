import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertTriangle, ChevronDown } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import SelectionCheckbox from '../../../components/admin/ui/SelectionCheckbox';
import {
  fetchClassLessons,
  setClassLessonStatus,
  bulkSetClassLessonStatus,
} from '../../../services/teacher/classGroupService';
import { flattenCurriculum, idsNeeding, applyBulkOutcome, countByStatus } from './lessonSelection';
import { Loading, ErrorBox } from '../../../pages/teacher/teacherUi';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * Les leçons de la classe : afficher / masquer, une par une ou en lot.
 * Le lot ne touche que les leçons dont l'état diffère de la cible, et ne
 * change à l'écran que ce que le serveur dit avoir appliqué. Jamais un mot
 * sur la publication globale — elle appartient à la plateforme, et l'écran
 * la montre comme un fait.
 */
export default function LessonsTab({ classGroup, entitlements }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const loader = useCallback((tk) => fetchClassLessons(tk, classGroup.id), [classGroup.id]);
  const { data: curriculum, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  const rows = useMemo(() => flattenCurriculum(curriculum), [curriculum]);
  const selection = useBulkSelection(rows);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [rowError, setRowError] = useState(null);

  const canBulk = entitlements?.features?.['lessons.bulk_actions'] === true;
  const canToggle = entitlements?.features?.['lessons.visibility'] !== false;
  const counts = countByStatus(rows);

  const patch = (updater) =>
    setData((current) => {
      const flat = updater(flattenCurriculum(current));
      const byId = new Map(flat.map((r) => [r.id, r]));
      return {
        ...current,
        chapters: current.chapters.map((ch) => ({ ...ch, lessons: ch.lessons.map((l) => byId.get(l.id) ?? l) })),
      };
    });

  const toggleOne = async (row) => {
    const status = row.classStatus === 'hidden' ? 'visible' : 'hidden';
    setRowError(null);
    try {
      const result = await setClassLessonStatus(token, classGroup.id, row.id, status);
      patch((flat) => applyBulkOutcome(flat, { applied: result.changed ? [row.id] : [] }, result.classStatus));
    } catch (err) {
      setRowError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    }
  };

  const runBulk = async (status) => {
    const ids = idsNeeding(rows, selection.selectedIds, status);
    setNotice(null);
    setRowError(null);
    if (ids.length === 0) {
      setNotice({ applied: 0, unchanged: selection.count, failed: 0 });
      return;
    }
    setBusy(true);
    try {
      const outcome = await bulkSetClassLessonStatus(token, classGroup.id, ids, status);
      patch((flat) => applyBulkOutcome(flat, outcome, status));
      setNotice({
        applied: outcome.applied.length,
        unchanged: outcome.unchanged.length + (selection.count - ids.length),
        failed: outcome.failed.length,
      });
      if (outcome.failed.length === 0) selection.clear();
    } catch (err) {
      setRowError(t(`classes.errors.${err?.reason ?? 'generic'}`, { defaultValue: t('classes.errors.generic') }));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!curriculum || rows.length === 0)
    return (
      <p className="rounded-2xl border border-nav-line bg-white p-8 text-center text-sm text-slate-500">
        {t('lessons.empty')}
      </p>
    );

  return (
    <div className="space-y-4" data-lessons-tab>
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-inter text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{t('lessons.effective')}</span>{' '}
          <span dir="ltr">
            {counts.effective}
            {'\u00A0/\u00A0'}
            {rows.length}
          </span>
        </p>
      </div>

      {canBulk ? (
        <div
          className="sticky top-14 md:top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-nav-line bg-nav-page px-3 py-2"
          role="region"
          aria-label={t('lessons.select')}
        >
          <p className="font-inter text-xs font-semibold text-nav-accent" aria-live="polite">
            {t('lessons.selectedCount', { count: selection.count })}
          </p>
          {!selection.allSelected && (
            <button
              type="button"
              onClick={selection.toggleAll}
              disabled={busy}
              className="rounded-lg border border-nav-line bg-white px-2.5 py-1 text-xs font-semibold text-nav-accent hover:bg-nav-page"
            >
              {t('lessons.selectAll')}
            </button>
          )}
          <button
            type="button"
            onClick={() => runBulk('visible')}
            disabled={busy || selection.count === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40"
          >
            <Eye size={13} /> {t('lessons.showSelected')}
          </button>
          <button
            type="button"
            onClick={() => runBulk('hidden')}
            disabled={busy || selection.count === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-[#3350c4] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
          >
            <EyeOff size={13} /> {t('lessons.hideSelected')}
          </button>
          {selection.count > 0 && (
            <button type="button" onClick={selection.clear} className="ms-auto text-xs font-semibold text-slate-600">
              {t('lessons.clearSelection')}
            </button>
          )}
          {notice && (
            <p className="w-full text-xs text-slate-700" role="status">
              {notice.applied > 0 && (
                <span className="text-emerald-800 font-semibold">
                  {t('lessons.applied', { count: notice.applied })}{' '}
                </span>
              )}
              {notice.unchanged > 0 && <span>{t('lessons.unchanged', { count: notice.unchanged })} </span>}
              {notice.failed > 0 && (
                <span className="text-amber-800">{t('lessons.failed', { count: notice.failed })}</span>
              )}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {t('lessons.bulkUnavailable')}
        </p>
      )}

      {rowError && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          <AlertTriangle size={14} /> {rowError}
        </p>
      )}

      {curriculum.chapters.map((chapter) => (
        <details
          key={chapter.code}
          className="group overflow-hidden rounded-2xl border border-nav-line bg-white"
          open={curriculum.chapters.length === 1}
          data-lessons-chapter={chapter.code}
        >
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-4 [&::-webkit-details-marker]:hidden">
            <h3 className="min-w-0 flex-1 truncate font-space text-sm font-bold text-nav-ink">
              <MathLabel>{chapter.title}</MathLabel>
            </h3>
            <span className="shrink-0 font-inter text-xs font-bold text-nav-muted" dir="ltr">
              {chapter.lessons.filter((l) => l.classStatus !== 'hidden').length}
              {' / '}
              {chapter.lessons.length}
            </span>
            <ChevronDown
              size={16}
              className="shrink-0 text-nav-muted transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ul className="divide-y divide-nav-line border-t border-nav-line px-4">
            {chapter.lessons.map((row) => (
              <li key={row.id} className="flex items-center gap-3 py-2.5" data-lesson-row={row.code}>
                {canBulk && (
                  <SelectionCheckbox
                    checked={selection.isSelected(row.id)}
                    onChange={() => selection.toggle(row.id)}
                    label={t('common.selectRow', { title: row.title })}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-inter text-sm font-semibold text-slate-800 truncate">
                    <MathLabel>{row.title}</MathLabel>
                  </p>
                  <p className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                    {row.publicationStatus !== 'published' && (
                      <span className="text-amber-700" title={t('lessons.notPublishedHint')}>
                        {t('lessons.notPublished')}
                      </span>
                    )}
                    {row.tier === 'premium' && <span>{t('lessons.premium')}</span>}
                    {!row.effectiveForStudents && row.classStatus !== 'hidden' && (
                      <span>{t('lessons.notEffective')}</span>
                    )}
                  </p>
                </div>
                {canToggle && classGroup.status === 'active' ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.classStatus !== 'hidden'}
                    aria-label={`${row.classStatus === 'hidden' ? t('lessons.show') : t('lessons.hide')} — ${row.title}`}
                    title={row.classStatus === 'hidden' ? t('lessons.show') : t('lessons.hide')}
                    onClick={() => toggleOne(row)}
                    className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3 font-inter text-xs font-bold ${
                      row.classStatus === 'hidden'
                        ? 'border-nav-line bg-nav-page text-nav-muted'
                        : 'border-transparent bg-nav-done-soft text-nav-done'
                    }`}
                    data-toggle-lesson={row.code}
                  >
                    {row.classStatus === 'hidden' ? (
                      <EyeOff size={13} aria-hidden="true" />
                    ) : (
                      <Eye size={13} aria-hidden="true" />
                    )}
                    {t(`lessons.status.${row.classStatus}`)}
                  </button>
                ) : (
                  <span className="shrink-0 font-inter text-xs font-bold text-nav-muted">
                    {t(`lessons.status.${row.classStatus}`)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
