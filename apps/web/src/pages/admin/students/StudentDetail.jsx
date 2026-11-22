import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { CircleCheckBig, Dumbbell, Target, Percent } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AdminPage, useAdminLabels, formatDate, Num, btnSecondary, btnGhost } from '../adminUi';
import StatTile from '../../../components/common/StatTile';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import DataTable from '../../../components/admin/ui/DataTable';
import { LoadingState, ErrorState, EmptyState, MetricUnavailable } from '../../../components/admin/ui/states';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import CommercialPanel from '../../../components/admin/commercial/CommercialPanel';
import FeatureUsagePanel from '../../../components/admin/commercial/FeatureUsagePanel';
import DeleteUserSection from '../../../components/admin/DeleteUserSection';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchStudent, changeStudentStatus } from '../../../services/admin/studentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

export default function AdminStudentDetail() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  const { id } = useParams();
  useDocumentMeta(t('students.detailMetaTitle', { id }));

  const { token } = useContext(AuthContext);
  const loader = useCallback((tok) => fetchStudent(tok, id), [id]);
  const { data: student, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const [pendingStatus, setPendingStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const applyStatus = async () => {
    setBusy(true);
    try {
      const updated = await changeStudentStatus(token, id, pendingStatus);
      setData((current) => ({ ...current, ...updated }));
    } finally {
      setBusy(false);
      setPendingStatus(null);
    }
  };

  const learning = student?.learning;
  const strong = student?.mastery?.filter((m) => m.status === 'mastered') ?? [];
  const weak = student?.mastery?.filter((m) => m.status === 'gap') ?? [];

  // Le libellé du bouton d'état ET celui du dialogue viennent du même endroit :
  // deux vocabulaires pour la même action sèmeraient le doute.
  const statusActionLabel = (value) => (
    value === 'active' ? t('students.reactivate')
      : value === 'suspended' ? t('students.suspend')
        : t('students.disable')
  );

  return (
    <AdminPage
      eyebrow={t('students.detailEyebrow')}
      title={student ? ([student.firstName, student.lastName].filter(Boolean).join(' ') || student.email) : t('students.detailTitleFallback', { id })}
      subtitle={student?.email}
      actions={(
        <Link to="/admin/eleves" className={btnSecondary}>
          <ArrowBack size={14} /> {t('students.backToList')}
        </Link>
      )}
    >
      {loading && <LoadingState label={t('common.loadingData')} />}
      {error && <ErrorState message={error} onRetry={reload} retryLabel={L.table.retry} />}

      {student && (
        <div className="space-y-6">
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 font-space text-sm font-bold text-slate-900">{t('students.accountSection')}</h2>
              <dl className="grid grid-cols-2 gap-3 font-inter text-sm">
                <Info label={t('common.email')}><span dir="ltr">{student.email}</span></Info>
                <Info label={t('students.columnGrade')}>{student.grade ?? t('common.dash')}</Info>
                <Info label={t('students.columnRegistered')}>{formatDate(student.createdAt)}</Info>
                <Info label={t('students.columnLastActivity')}>{formatDate(student.lastActivityAt)}</Info>
                <Info label={t('common.status')}><StatusBadge status={student.accountStatus} /></Info>
                <Info label={t('students.columnSubscription')}>
                  {student.subscription
                    ? <StatusBadge status={student.subscription.status} />
                    : <span className="text-slate-400">{t('common.none')}</span>}
                </Info>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="font-inter text-xs text-slate-500">{t('students.changeStatus')}</span>
                {['active', 'suspended', 'disabled']
                  .filter((value) => value !== student.accountStatus)
                  .map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPendingStatus(value)}
                      className={btnGhost}
                    >
                      {statusActionLabel(value)}
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-space text-sm font-bold text-slate-900">{t('students.columnSubscription')}</h2>
              {student.subscription ? (
                <dl className="space-y-2 font-inter text-sm">
                  <Info label={t('students.planLabel')}>{student.subscription.plan}</Info>
                  <Info label={t('students.startsAt')}>{formatDate(student.subscription.startedAt)}</Info>
                  <Info label={t('students.endsAt')}>{formatDate(student.subscription.endsAt)}</Info>
                </dl>
              ) : (
                <p className="font-inter text-xs text-slate-500">
                  {t('students.noSubscriptionHint')}
                </p>
              )}
            </div>
          </section>

          {/* L'état COMMERCIAL, partagé avec la fiche enseignant : activer une
              offre après règlement hors plateforme, envoyer un code, traiter
              une demande, piloter l'abonnement. */}
          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('students.offerSection')}</h2>
            <CommercialPanel role="students" userId={id} planType="student" onChanged={reload} />
            <FeatureUsagePanel userId={id} />
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('students.progressSection')}</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile icon={CircleCheckBig} value={learning.lessonsCompleted} label={t('students.lessonsCompleted')} accent="bg-emerald-50 text-emerald-600" hint={t('students.lessonsStartedHint', { count: learning.lessonsStarted })} />
              <StatTile icon={Target} value={learning.modulesCompleted} label={t('students.modulesCompleted')} accent="bg-blue-50 text-blue-600" />
              <StatTile icon={Dumbbell} value={learning.questionsAnswered} label={t('students.questionsAnswered')} accent="bg-violet-50 text-violet-600" hint={t('students.hintsUsedHint', { count: learning.hintsUsed })} />
              {learning.successRate === null ? (
                <MetricUnavailable label={t('students.successRate')} reason="no_data" />
              ) : (
                <StatTile icon={Percent} value={`${learning.successRate}%`} label={t('students.successRate')} accent="bg-amber-50 text-amber-600" />
              )}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 font-space text-sm font-bold text-slate-900">{t('students.gapsTitle')}</h2>
              <p className="mb-3 font-inter text-xs text-slate-500">{t('students.gapsHint')}</p>
              {weak.length === 0 ? (
                <p className="py-3 font-inter text-xs text-slate-400">{t('students.gapsEmpty')}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {weak.slice(0, 10).map((m) => (
                    <li key={m.code} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">{m.title}</span>
                      <Num className="shrink-0 font-inter text-xs tabular-nums text-slate-400">{m.correctCount}/{m.attempts}</Num>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 font-space text-sm font-bold text-slate-900">{t('students.masteredTitle')}</h2>
              <p className="mb-3 font-inter text-xs text-slate-500">{t('students.masteredCount', { count: strong.length })}</p>
              {strong.length === 0 ? (
                <p className="py-3 font-inter text-xs text-slate-400">{t('students.masteredEmpty')}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {strong.slice(0, 10).map((m) => (
                    <li key={m.code} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">{m.title}</span>
                      <StatusBadge status="published" label={t('students.masteryMastered')} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('students.perLessonSection')}</h2>
            <DataTable
              rows={student.progress ?? []}
              rowKey={(row) => row.lessonCode}
              labels={L.table}
              selectionLabel={(row) => L.selectRow(row.lessonTitle ?? row.lessonCode)}
              empty={<EmptyState title={t('students.noLessonStarted')} />}
              columns={[
                { key: 'lessonTitle', label: t('students.columnLesson'), render: (p) => p.lessonTitle ?? p.lessonCode },
                { key: 'status', label: t('common.status'), render: (p) => <StatusBadge status={p.status === 'completed' ? 'resolved' : 'in_review'} label={p.status === 'completed' ? t('students.lessonDone') : t('students.lessonOngoing')} /> },
                { key: 'completedModules', label: t('students.columnModulesDone'), render: (p) => <Num>{p.completedModules?.length ?? 0}</Num> },
                { key: 'lastActivityAt', label: t('students.columnLastActivity'), render: (p) => formatDate(p.lastActivityAt) },
              ]}
            />
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('students.timelineSection')}</h2>
            {student.timeline?.length === 0 ? (
              <EmptyState title={t('students.timelineEmptyTitle')} hint={t('students.timelineEmptyHint')} />
            ) : (
              <ol className="space-y-2">
                {student.timeline.map((event, index) => (
                  <li key={index} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-inter text-xs font-semibold text-slate-800">{event.lesson ?? t('common.dash')}</p>
                      <p className="font-inter text-xs text-slate-500">{event.detail}</p>
                    </div>
                    <span className="shrink-0 font-inter text-xs text-slate-400">{formatDate(event.at, { withTime: true })}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <DeleteUserSection user={student} role="student" backTo="/admin/eleves" />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={applyStatus}
        busy={busy}
        tone={pendingStatus === 'active' ? 'default' : 'danger'}
        cancelLabel={L.dialog.cancelLabel}
        busyLabel={L.dialog.busyLabel}
        closeLabel={L.dialog.closeLabel}
        title={
          pendingStatus === 'active' ? t('students.confirmReactivateTitle')
            : pendingStatus === 'suspended' ? t('students.confirmSuspendTitle')
              : t('students.confirmDisableTitle')
        }
        confirmLabel={statusActionLabel(pendingStatus)}
        message={
          pendingStatus === 'active'
            ? <p>{t('students.confirmReactivateMessage')}</p>
            : (
              <p>
                {pendingStatus === 'disabled'
                  ? t('students.confirmDisableMessage')
                  : t('students.confirmSuspendMessage')}
                {' '}<strong>{t('students.confirmDataKeptStrong')}</strong>{' '}
                {t('students.confirmDataKeptRest')}
              </p>
            )
        }
      />
    </AdminPage>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <dt className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{children}</dd>
    </div>
  );
}
