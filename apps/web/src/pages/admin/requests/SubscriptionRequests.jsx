import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchSubscriptionRequests, rejectSubscriptionRequest } from '../../../services/admin/subscriptionService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { formatEur } from '../../../utils/money';
import { AdminPage, useAdminLabels, formatDate, btnPrimary, btnSecondary, input as inputClass, Num } from '../adminUi';

/** La file des DEMANDES d'offre. Une demande n'active rien : on l'honore depuis la fiche du compte, ou on la refuse ici. */
export default function AdminSubscriptionRequests() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('requests.metaTitle'));
  const L = useAdminLabels();
  const { token } = useContext(AuthContext);
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((tok) => fetchSubscriptionRequests(tok, { status, type, page }), [status, type, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  const doReject = async () => {
    setBusy(true);
    setRejectError(null);
    try { await rejectSubscriptionRequest(token, reject.id, reason.trim()); setReject(null); setReason(''); reload(); }
    catch (err) { setRejectError(err.message); } finally { setBusy(false); }
  };

  const accountPath = (r) => `/admin/${r.userRole === 'teacher' ? 'enseignants' : 'eleves'}/${r.userId}`;

  return (
    <AdminPage eyebrow={t('requests.eyebrow')} title={t('requests.title')} subtitle={t('requests.subtitle')}>
      <div className="space-y-3">
        {data?.counts && (
          <p className="font-inter text-xs text-slate-500">
            {t('requests.countPending')} <b className="text-slate-800"><Num>{data.counts.pending}</Num></b>
            {' · '}
            {t('requests.countAll')} <b className="text-slate-800"><Num>{data.counts.all}</Num></b>
          </p>
        )}
        <FilterBar>
          <SelectFilter label={t('common.status')} allLabel={t('requests.allStatuses')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: 'pending', label: t('status.pending') }, { value: 'fulfilled', label: t('status.fulfilled') }, { value: 'rejected', label: t('status.rejected') }, { value: 'cancelled', label: t('status.cancelled') }]} />
          <SelectFilter label={t('requests.columnType')} allLabel={t('requests.allTypes')} value={type} onChange={(v) => { setType(v); setPage(1); }} options={[{ value: 'teacher', label: t('status.teacher') }, { value: 'student', label: t('status.student') }]} />
        </FilterBar>
        <DataTable
          rows={data?.requests?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.userName ?? row.userEmail ?? row.id)}
          empty={<EmptyState icon={Inbox} title={t('requests.emptyTitle')} hint={t('requests.emptyHint')} />}
          columns={[
            { key: 'user', label: t('requests.columnUser'), render: (r) => <Link to={accountPath(r)} className="font-semibold text-violet-700 hover:underline">{r.userName || <span dir="ltr">{r.userEmail}</span>}</Link> },
            { key: 'role', label: t('requests.columnType'), render: (r) => <StatusBadge status={r.userRole} /> },
            { key: 'plan', label: t('requests.columnPlan'), render: (r) => <span>{r.planName}{r.planVersion ? <> <Num>{`(v${r.planVersion})`}</Num></> : ''}</span> },
            { key: 'seats', label: t('requests.columnSeats'), render: (r) => (r.requestedStudentSeats == null ? t('common.dash') : <Num>{r.requestedStudentSeats}</Num>) },
            { key: 'total', label: t('requests.columnTotal'), render: (r) => (r.calculatedTotalCents == null ? t('common.dash') : (
              <span>
                <Num>{formatEur(r.calculatedTotalCents)}</Num>
                {r.seatTierLabel ? <span className="text-slate-400"> · {t('plans.tier')} <Num>{r.seatTierLabel}</Num> — <Num>{formatEur(r.unitPriceCents)}</Num> {t('plans.perStudent')}</span> : null}
              </span>
            )) },
            { key: 'requestedAt', label: t('requests.columnDate'), render: (r) => <Num>{formatDate(r.requestedAt, { withTime: true })}</Num> },
            { key: 'note', label: t('requests.userNote'), render: (r) => r.userNote ?? t('common.dash') },
            { key: 'status', label: t('common.status'), render: (r) => <StatusBadge status={r.status} /> },
            { key: 'actions', label: t('common.actions'), render: (r) => (r.status === 'pending' ? (
              <span className="inline-flex gap-2">
                <Link to={accountPath(r)} className={btnPrimary}>{t('requests.activateOnAccount')}</Link>
                <button type="button" onClick={() => { setReject(r); setReason(''); }} className={btnSecondary}>{t('requests.reject')}</button>
              </span>
            ) : (r.rejectionReason ? <span className="text-slate-500">{r.rejectionReason}</span> : null)) },
          ]}
        />
        <Pagination meta={data?.requests} onPage={setPage} labels={L.pagination} />
      </div>
      <ConfirmDialog
        open={Boolean(reject)}
        onClose={() => setReject(null)}
        onConfirm={doReject}
        busy={busy}
        tone="danger"
        title={t('requests.rejectTitleFor', { name: reject?.userName || reject?.userEmail || '' })}
        confirmLabel={t('requests.reject')}
        cancelLabel={L.dialog.cancelLabel}
        busyLabel={L.dialog.busyLabel}
        closeLabel={L.dialog.closeLabel}
        message={(
          <div className="space-y-2">
            <p className="font-inter text-xs text-slate-600">{t('requests.rejectMessage')}</p>
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={255} placeholder={t('requests.reasonPlaceholder')} aria-label={t('common.reason')} className={inputClass} />
            {rejectError && <p role="alert" className="font-inter text-xs text-rose-700">{rejectError}</p>}
          </div>
        )}
      />
    </AdminPage>
  );
}
