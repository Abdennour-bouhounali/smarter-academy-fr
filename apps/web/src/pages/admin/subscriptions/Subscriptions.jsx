import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchSubscriptions, fetchPayments } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AdminPage, useAdminLabels, formatDate, Num } from '../adminUi';

/**
 * Les abonnements — tous nés d'une ACTIVATION MANUELLE (fiche du compte) ou
 * d'un code d'activation lié à une offre. Aucun paiement en ligne : ce
 * tableau liste, et renvoie vers la fiche du compte pour agir.
 */
function NoProviderNotice() {
  const { t } = useTranslation('admin');
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-inter text-sm text-slate-700">
        <strong>{t('subscriptions.noticeTitle')}</strong> {t('subscriptions.noticeBody')}
      </p>
      <p className="mt-1 font-inter text-xs text-slate-500">
        {t('subscriptions.noticeHint')}
      </p>
    </div>
  );
}

export function AdminSubscriptions() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('subscriptions.metaTitle'));
  const L = useAdminLabels();

  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchSubscriptions(token, { status, page }), [status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow={t('subscriptions.eyebrow')}
      title={t('subscriptions.title')}
      subtitle={t('subscriptions.subtitle')}
    >
      <div className="space-y-3">
        {data?.summary?.paymentProviderIntegrated === false && <NoProviderNotice />}

        <FilterBar>
          <SelectFilter
            label={t('common.status')} allLabel={t('subscriptions.allStatuses')} value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: 'active', label: t('status.active') }, { value: 'expired', label: t('status.expired') },
              { value: 'cancelled', label: t('status.cancelled') }, { value: 'suspended', label: t('status.suspended') },
              { value: 'trialing', label: t('status.trialing') },
            ]}
          />
        </FilterBar>

        <DataTable
          rows={data?.subscriptions?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.studentEmail ?? row.id)}
          empty={<EmptyState icon={CreditCard} title={t('subscriptions.emptyTitle')} hint={t('subscriptions.emptyHint')} />}
          columns={[
            { key: 'student', label: t('subscriptions.columnUser'), render: (s) => <Link to={`/admin/${s.userRole === 'teacher' ? 'enseignants' : 'eleves'}/${s.studentId}`} className="hover:underline" dir="ltr">{s.studentEmail}</Link> },
            { key: 'role', label: t('subscriptions.columnRole'), render: (s) => <StatusBadge status={s.userRole ?? 'student'} /> },
            { key: 'plan', label: t('subscriptions.columnPlan'), render: (s) => <span>{s.planName ?? s.plan}{s.planVersion ? <> <Num>{`(v${s.planVersion})`}</Num></> : ''}</span> },
            { key: 'seats', label: t('subscriptions.columnSeats'), render: (s) => (s.studentSeatLimit == null ? t('common.dash') : <Num>{s.studentSeatLimit}</Num>) },
            { key: 'status', label: t('common.status'), render: (s) => <StatusBadge status={s.status} /> },
            { key: 'startedAt', label: t('subscriptions.columnStart'), render: (s) => <Num>{formatDate(s.startedAt)}</Num> },
            { key: 'endsAt', label: t('subscriptions.columnEnd'), render: (s) => <Num>{formatDate(s.endsAt)}</Num> },
            { key: 'source', label: t('subscriptions.columnSource'), render: (s) => s.acquisitionSource ?? s.provider ?? t('common.dash') },
            { key: 'grantedBy', label: t('subscriptions.columnGrantedBy'), render: (s) => s.grantedBy ?? t('common.dash') },
          ]}
        />

        <Pagination meta={data?.subscriptions} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}

/**
 * Le registre HISTORIQUE des règlements enregistrés à la main. Il n'est
 * monté par aucune route aujourd'hui ; on le garde traduit pour le jour où
 * l'administration voudra relire ce journal.
 */
export function AdminPayments() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('subscriptions.paymentsMetaTitle'));
  const L = useAdminLabels();

  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchPayments(token, { page }), [page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow={t('subscriptions.eyebrow')}
      title={t('subscriptions.paymentsTitle')}
      subtitle={t('subscriptions.paymentsSubtitle')}
    >
      <div className="space-y-3">
        {data?.summary?.paymentProviderIntegrated === false && <NoProviderNotice />}

        <DataTable
          rows={data?.payments?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.reference ?? row.id)}
          empty={<EmptyState icon={CreditCard} title={t('subscriptions.paymentsEmptyTitle')} hint={t('subscriptions.paymentsEmptyHint')} />}
          columns={[
            { key: 'student', label: t('status.student'), render: (p) => <Link to={`/admin/eleves/${p.studentId}`} className="hover:underline" dir="ltr">{p.studentEmail}</Link> },
            { key: 'amount', label: t('plans.amount'), render: (p) => <Num>{`${p.amount.toFixed(2)} ${p.currency}`}</Num> },
            { key: 'plan', label: t('subscriptions.columnPlan'), render: (p) => p.plan ?? t('common.dash') },
            { key: 'status', label: t('common.status'), render: (p) => <StatusBadge status={p.status} /> },
            { key: 'provider', label: t('subscriptions.columnSource'), render: (p) => p.provider ?? t('common.dash') },
            { key: 'reference', label: t('subscriptions.columnReference'), render: (p) => <code dir="ltr" className="font-mono-jetbrains text-xs">{p.reference ?? t('common.dash')}</code> },
            { key: 'paidAt', label: t('subscriptions.columnRecordedAt'), render: (p) => <Num>{formatDate(p.paidAt)}</Num> },
          ]}
        />

        <Pagination meta={data?.payments} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
