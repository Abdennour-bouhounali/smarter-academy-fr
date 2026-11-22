import { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminPage, useAdminLabels, formatDate, Num, btnDanger, input } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { EmptyState } from '../../../components/admin/ui/states';
import { FilterBar, SearchInput, Pagination } from '../../../components/admin/ui/FilterBar';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useDebounced } from '../../../hooks/useDebounced';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AuthContext } from '../../../context/AuthContext';
import { fetchActivationBatches, revokeActivationBatch } from '../../../services/admin/activationCodeService';

/**
 * Les LOTS : ce qui a été imprimé d'un coup, et ce qu'il en reste.
 *
 * La vue opérationnelle du stock physique — « le lot d'Oran, 100 cartes, 37
 * activées, 2 révoquées ». C'est aussi d'ici qu'on neutralise un lot égaré,
 * ce qui ne touche que les codes ENCORE DISPONIBLES : fermer d'un clic
 * l'accès de trente élèves ayant payé serait un geste bien trop lourd pour
 * être groupé.
 */
export default function AdminActivationBatches() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('activation.batchesMetaTitle'));

  const { token } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const [pendingRevoke, setPendingRevoke] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  const loader = useCallback(
    (authToken) => fetchActivationBatches(authToken, { search: debouncedSearch, page }),
    [debouncedSearch, page],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const confirmRevoke = async () => {
    if (!reason.trim()) {
      setRevokeError(t('activation.reasonRequired'));
      return;
    }

    setBusy(true);
    setRevokeError(null);
    try {
      await revokeActivationBatch(token, pendingRevoke.id, reason.trim());
      setPendingRevoke(null);
      setReason('');
      reload();
    } catch (caught) {
      setRevokeError(caught.message || t('activation.revokeBatchFailed'));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'label',
      label: t('activation.columnBatch'),
      render: (row) => (
        <Link to={`/admin/codes-activation?batch=${row.id}`} className="font-semibold text-violet-700 hover:underline">
          {row.label}
        </Link>
      ),
    },
    {
      key: 'plan',
      label: t('activation.columnPlan'),
      render: (row) => (row.plan
        ? (
          <span>
            {row.plan.name} <Num>(v{row.plan.version})</Num>
            {row.studentSeatLimit ? ` · ${t('activation.seatsPerCodeShort', { count: row.studentSeatLimit })}` : ''}
          </span>
        )
        : <span className="text-slate-400">{t('activation.planNoneShort')}</span>),
    },
    { key: 'quantity', label: t('activation.columnQuantity'), render: (row) => <Num>{row.quantity}</Num> },
    { key: 'available', label: t('status.available'), render: (row) => <Num>{row.codeCounts?.available ?? 0}</Num> },
    { key: 'activated', label: t('status.activated'), render: (row) => <Num>{row.codeCounts?.activated ?? 0}</Num> },
    { key: 'expired', label: t('status.expired'), render: (row) => <Num>{row.codeCounts?.expired ?? 0}</Num> },
    { key: 'revoked', label: t('status.revoked'), render: (row) => <Num>{row.codeCounts?.revoked ?? 0}</Num> },
    {
      key: 'access',
      label: t('activation.columnAccess'),
      render: (row) => {
        if (row.accessEndsAt) return t('activation.accessUntil', { date: formatDate(row.accessEndsAt) });
        if (row.accessDays) return t('activation.accessDaysValue', { count: row.accessDays });
        return t('activation.accessEndless');
      },
    },
    { key: 'redeemBy', label: t('activation.redeemBy'), render: (row) => formatDate(row.redeemBy) },
    { key: 'createdAt', label: t('activation.columnCreated'), render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (row) => (
        (row.codeCounts?.available ?? 0) > 0 ? (
          <button
            type="button"
            onClick={() => { setPendingRevoke(row); setReason(''); setRevokeError(null); }}
            className={btnDanger}
          >
            {t('activation.revokeAvailable')}
          </button>
        ) : null
      ),
    },
  ];

  return (
    <AdminPage
      eyebrow={t('activation.eyebrow')}
      title={t('activation.batchesTitle')}
      subtitle={t('activation.batchesSubtitle')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder={t('activation.batchSearchPlaceholder')}
            label={L.filters.searchLabel}
          />
        </FilterBar>

        <DataTable
          labels={L.table}
          columns={columns}
          rows={data?.batches?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState title={t('activation.emptyBatchesTitle')} hint={t('activation.emptyBatchesHint')} />}
        />

        <Pagination meta={data?.batches} onPage={setPage} labels={L.pagination} />
      </div>

      <ConfirmDialog
        open={pendingRevoke !== null}
        onClose={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
        title={t('activation.revokeBatchTitle', { label: pendingRevoke?.label ?? '' })}
        tone="danger"
        confirmLabel={t('activation.revoke')}
        cancelLabel={L.dialog.cancelLabel}
        busyLabel={L.dialog.busyLabel}
        closeLabel={L.dialog.closeLabel}
        busy={busy}
        message={(
          <div className="space-y-3">
            <p className="font-inter text-xs text-slate-600">
              {t('activation.revokeBatchMessage', {
                available: pendingRevoke?.codeCounts?.available ?? 0,
                activated: pendingRevoke?.codeCounts?.activated ?? 0,
              })}
            </p>
            <label className="block">
              <span className="mb-1 block font-inter text-xs font-semibold text-slate-700">{t('activation.reasonLabel')}</span>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={255}
                className={input}
                placeholder={t('activation.reasonBatchPlaceholder')}
              />
            </label>
            {revokeError && (
              <p role="alert" className="font-inter text-xs text-rose-700">{revokeError}</p>
            )}
          </div>
        )}
      />
    </AdminPage>
  );
}
