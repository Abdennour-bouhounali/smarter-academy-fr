import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AdminPage, AdminCard, Loading, ErrorBox, btnSecondary, btnPrimary, input, Num, formatDate } from '../adminUi';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchReport, updateReport, addReportNote, fetchReportScreenshotUrl } from '../../../services/admin/reportService';
import { sourceKey, categoryKey } from './reportLabels';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const formatMoment = (value) => formatDate(value, { withTime: true });

export default function AdminReportDetail() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  useDocumentMeta(t('reports.detailMetaTitle', { id }));

  const { token } = useContext(AuthContext);
  const loader = useCallback((authToken) => fetchReport(authToken, id), [id]);
  const { data: report, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  // La capture jointe : route authentifiée → URL d'objet, révoquée au départ.
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const hasScreenshot = Boolean(report?.hasScreenshot);
  useEffect(() => {
    if (!hasScreenshot || !token) return undefined;
    let url = null;
    let cancelled = false;
    fetchReportScreenshotUrl(token, id)
      .then((created) => { url = created; if (cancelled) URL.revokeObjectURL(created); else setScreenshotUrl(created); })
      .catch(() => {});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); setScreenshotUrl(null); };
  }, [hasScreenshot, token, id]);

  const mutate = async (changes) => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await updateReport(token, id, changes);
      setData((current) => ({ ...current, ...updated }));
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      const created = await addReportNote(token, id, note.trim());
      setData((current) => ({ ...current, notes: [...(current.notes ?? []), created] }));
      setNote('');
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  // Le libellé d'une catégorie : la clé du catalogue, ou le code brut quand
  // la base porte une valeur hors des deux vocabulaires connus.
  const labelForCategory = (value) => {
    const key = categoryKey(value);
    if (key === null) return t('common.dash');
    return key ? t(key) : value;
  };

  return (
    <AdminPage
      eyebrow={t('reports.detailEyebrow')}
      title={t('reports.detailTitle', { id })}
      actions={(
        <Link to="/admin/signalements" className={btnSecondary}>
          <ArrowBack size={14} /> {t('reports.backToList')}
        </Link>
      )}
    >
      {loading && <Loading label={t('reports.loadingReport')} />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {report && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <AdminCard title={t('reports.whatWasReported')}>
              <div className="space-y-3">
                <Field label={t('reports.columnCategory')}>{labelForCategory(report.category)}</Field>
                <Field label={t('reports.columnSource')}>
                  {sourceKey(report.source) ? t(sourceKey(report.source)) : report.source}
                </Field>
                <Field label={t('reports.columnReporter')}>
                  <span dir="ltr">{report.student?.email ?? t('common.dash')}</span>
                  {report.student?.isAmbassador && <span className="ms-2"><StatusBadge status="teacher" label={t('teachers.ambassador.on')} /></span>}
                  {report.student?.role === 'admin' && <span className="ms-2"><StatusBadge status="new" label={t('reports.reporterAdmin')} /></span>}
                </Field>
                <Field label={t('reports.columnMessage')}>
                  {report.note
                    ? <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700">{report.note}</p>
                    : <span className="text-slate-400">{t('reports.noMessageHint')}</span>}
                </Field>
                <Field label={t('reports.sentAt')}>{formatMoment(report.createdAt)}</Field>
              </div>
            </AdminCard>

            {hasScreenshot && (
              <AdminCard title={t('reports.columnScreenshot')}>
                {screenshotUrl ? (
                  <a href={screenshotUrl} target="_blank" rel="noreferrer" className="block" data-report-screenshot>
                    <img src={screenshotUrl} alt={t('reports.screenshotAlt')} className="w-full rounded-lg border border-slate-200" />
                    <span className="mt-1 block font-inter text-xs text-violet-700">{t('reports.openFullSize')}</span>
                  </a>
                ) : <Loading label={t('reports.loadingScreenshot')} />}
              </AdminCard>
            )}

            <AdminCard title={t('reports.whereExactly')}>
              <div className="space-y-3">
                <Field label={t('reports.lesson')}>
                  {report.context.lessonCode ? (
                    <Link to={`/admin/contenu/lecons/${encodeURIComponent(report.context.lessonCode)}`} className="text-violet-700 hover:underline">
                      {report.context.lessonTitle ?? report.context.lessonCode}
                    </Link>
                  ) : t('common.dash')}
                </Field>
                <Field label={t('reports.module')}>
                  {report.context.isLessonLevel
                    // Signalement parti du SOMMAIRE : il n'y a pas de module, et
                    // le dire vaut mieux qu'un tiret qu'on lirait comme perdu.
                    ? <span className="text-slate-500">{t('reports.lessonLevelReport')}</span>
                    : report.context.moduleTitle
                      ?? (report.context.moduleNumber != null
                        ? t('reports.moduleNumber', { number: report.context.moduleNumber })
                        : t('common.dash'))}
                </Field>
                {report.context.step && <Field label={t('reports.step')}>{report.context.step}</Field>}
                {report.context.exerciseCode && <Field label={t('reports.exercise')}><code className="font-mono-jetbrains text-xs" dir="ltr">{report.context.exerciseCode}</code></Field>}
                {report.context.questionId && <Field label={t('reports.question')}><code className="font-mono-jetbrains text-xs" dir="ltr">{report.context.questionId}</code></Field>}
                {report.context.route && <Field label={t('reports.page')}><code className="font-mono-jetbrains text-xs text-slate-500" dir="ltr">{report.context.route}</code></Field>}
              </div>
            </AdminCard>

            {report.attempt && (
              <AdminCard title={t('reports.studentAttempt')}>
                <p className="mb-3 font-inter text-xs text-slate-500">
                  {t('reports.studentAttemptHint')}
                </p>
                <div className="space-y-3">
                  <Field label={t('reports.givenAnswer')}>
                    <code className="rounded bg-slate-100 px-2 py-1 font-mono-jetbrains text-xs" dir="ltr">
                      {JSON.stringify(report.attempt.submittedAnswer)}
                    </code>
                  </Field>
                  <Field label={t('reports.interpretedAs')}>{report.attempt.normalizedAnswer ?? t('common.dash')}</Field>
                  <Field label={t('reports.outcome')}>
                    <StatusBadge
                      status={report.attempt.outcome === 'correct' ? 'resolved' : 'new'}
                      label={report.attempt.outcome === 'correct' ? t('reports.outcomeCorrect') : t('reports.outcomeIncorrect')}
                    />
                  </Field>
                  <Field label={t('reports.attemptNumber')}><Num>{report.attempt.attemptNumber}</Num></Field>
                  <Field label={t('reports.hintsUsed')}><Num>{report.attempt.hintsUsed}</Num></Field>
                  {report.attempt.misconceptionId && <Field label={t('reports.misconception')}><code className="font-mono-jetbrains text-xs" dir="ltr">{report.attempt.misconceptionId}</code></Field>}
                </div>
              </AdminCard>
            )}

            {report.diagnostics && (
              <AdminCard title={t('reports.technicalContext')}>
                <p className="mb-3 font-inter text-xs text-slate-500">
                  {t('reports.technicalContextHint')}
                </p>
                <div className="space-y-3">
                  <Field label={t('reports.browser')}>{report.diagnostics.browser ?? t('common.dash')}</Field>
                  <Field label={t('reports.operatingSystem')}>{report.diagnostics.os ?? t('common.dash')}</Field>
                  <Field label={t('reports.screen')}><Num>{report.diagnostics.screen ?? t('common.dash')}</Num></Field>
                </div>
              </AdminCard>
            )}

            <AdminCard title={<span className="flex items-center gap-1.5"><Lock size={14} /> {t('reports.internalNotes')}</span>}>
              <p className="mb-3 font-inter text-xs text-slate-500">
                {t('reports.internalNotesHint')}
              </p>

              {report.notes?.length > 0 ? (
                <ul className="mb-3 space-y-2">
                  {report.notes.map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="whitespace-pre-wrap text-slate-700">{entry.body}</p>
                      <p className="mt-1 font-inter text-xs text-slate-400">{entry.author} · {formatMoment(entry.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3 font-inter text-xs text-slate-400">{t('reports.noNote')}</p>
              )}

              <form onSubmit={submitNote} className="space-y-2">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder={t('reports.notePlaceholder')}
                  aria-label={t('reports.newInternalNote')}
                  className={input}
                />
                <button type="submit" disabled={busy || !note.trim()} className={btnPrimary}>
                  {t('reports.addNote')}
                </button>
              </form>
            </AdminCard>
          </div>

          <div className="space-y-5">
            <AdminCard title={t('reports.handling')}>
              {actionError && <p className="mb-2 rounded-lg bg-rose-50 p-2 font-inter text-xs text-rose-700" role="alert">{actionError}</p>}

              <div className="space-y-3">
                <Field label={t('reports.columnStatus')}>
                  <select
                    value={report.status}
                    disabled={busy}
                    onChange={(event) => mutate({ status: event.target.value })}
                    aria-label={t('reports.statusAria')}
                    className={input}
                  >
                    <option value="new">{t('status.new')}</option>
                    <option value="in_review">{t('status.in_review')}</option>
                    <option value="resolved">{t('status.resolved')}</option>
                    <option value="dismissed">{t('status.dismissed')}</option>
                    <option value="duplicate">{t('status.duplicate')}</option>
                  </select>
                </Field>

                <Field label={t('reports.columnSeverity')}>
                  <select
                    value={report.priority}
                    disabled={busy}
                    onChange={(event) => mutate({ priority: event.target.value })}
                    aria-label={t('reports.priorityAria')}
                    className={input}
                  >
                    <option value="critical">{t('status.critical')}</option>
                    <option value="high">{t('status.high')}</option>
                    <option value="medium">{t('status.medium')}</option>
                    <option value="low">{t('status.low')}</option>
                  </select>
                </Field>

                {report.resolvedAt && (
                  <p className="font-inter text-xs text-slate-500">
                    {t('reports.handledAt', { date: formatMoment(report.resolvedAt) })}
                  </p>
                )}
              </div>
            </AdminCard>

            <AdminCard title={t('reports.theStudent')}>
              <div className="space-y-3">
                <Field label={t('reports.account')}>
                  <Link to={`/admin/eleves/${report.student.id}`} className="text-violet-700 hover:underline">
                    <Num>{report.student.email}</Num>
                  </Link>
                </Field>
                <Field label={t('common.grade')}>{report.student.grade ?? t('common.dash')}</Field>
                <Field label={t('reports.accountStatus')}><StatusBadge status={report.student.accountStatus} /></Field>
              </div>
            </AdminCard>

            {report.related.total > 1 && (
              <AdminCard title={<span className="flex items-center gap-1.5"><Users size={14} /> {t('reports.sameProblem')}</span>}>
                <p className="font-inter text-sm text-slate-700">
                  {t('reports.sameProblemCount', { count: report.related.total })}
                </p>
                <ul className="mt-2 space-y-1">
                  {report.related.reports.slice(0, 8).map((sibling) => (
                    <li key={sibling.id}>
                      <Link to={`/admin/signalements/${sibling.id}`} className="font-inter text-xs text-violet-700 hover:underline">
                        <Num>#{sibling.id}</Num> — {formatMoment(sibling.createdAt)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AdminCard>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 font-inter text-sm text-slate-800">{children}</div>
    </div>
  );
}
