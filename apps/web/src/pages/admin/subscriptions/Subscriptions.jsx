import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchSubscriptions, fetchPayments } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');

/**
 * Écran délibérément en LECTURE SEULE : aucun fournisseur de paiement n'est
 * intégré, et saisir un abonnement à la main donnerait un accès que rien n'a
 * payé. L'état vide dit pourquoi il est vide.
 */
function NoProviderNotice() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-inter text-sm text-slate-700">
        <strong>Aucun système de paiement n’est encore intégré.</strong> Ces tableaux resteront vides
        jusque-là — ce n’est pas une erreur de chargement.
      </p>
      <p className="mt-1 font-inter text-xs text-slate-500">
        Le modèle est volontairement indépendant du fournisseur : brancher Stripe ou un autre
        prestataire n’imposera pas de refonte. L’administration reste en lecture seule.
      </p>
    </div>
  );
}

export function AdminSubscriptions() {
  useDocumentMeta('Abonnements — Administration');

  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchSubscriptions(token, { status, page }), [status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow="Abonnements"
      title="Abonnements"
      subtitle="L’état d’abonnement est indépendant de l’état du compte : « compte actif, abonnement expiré » est valide."
    >
      <div className="space-y-3">
        {data?.summary?.paymentProviderIntegrated === false && <NoProviderNotice />}

        <FilterBar>
          <SelectFilter
            label="Statut" allLabel="Tous les statuts" value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: 'active', label: 'Actif' }, { value: 'expired', label: 'Expiré' },
              { value: 'cancelled', label: 'Annulé' }, { value: 'pending', label: 'En attente' },
              { value: 'free', label: 'Gratuit' },
            ]}
          />
        </FilterBar>

        <DataTable
          rows={data?.subscriptions?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState icon={CreditCard} title="Aucun abonnement" hint="Aucun abonnement n’a encore été enregistré." />}
          columns={[
            { key: 'student', label: 'Élève', render: (s) => <Link to={`/admin/eleves/${s.studentId}`} className="hover:underline">{s.studentEmail}</Link> },
            { key: 'plan', label: 'Formule', render: (s) => s.plan },
            { key: 'status', label: 'Statut', render: (s) => <StatusBadge status={s.status} /> },
            { key: 'startedAt', label: 'Début', render: (s) => formatDate(s.startedAt) },
            { key: 'endsAt', label: 'Fin', render: (s) => formatDate(s.endsAt) },
            { key: 'provider', label: 'Fournisseur', render: (s) => s.provider ?? '—' },
            { key: 'reference', label: 'Référence', render: (s) => <code className="font-mono-jetbrains text-xs">{s.reference ?? '—'}</code> },
          ]}
        />

        <Pagination meta={data?.subscriptions} onPage={setPage} />
      </div>
    </AdminPage>
  );
}

export function AdminPayments() {
  useDocumentMeta('Paiements — Administration');

  const [page, setPage] = useState(1);
  const loader = useCallback((token) => fetchPayments(token, { page }), [page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow="Abonnements"
      title="Paiements"
      subtitle="Aucune donnée de carte n’est stockée — il n’existe pas même de colonne pour en accueillir une."
    >
      <div className="space-y-3">
        {data?.summary?.paymentProviderIntegrated === false && <NoProviderNotice />}

        <DataTable
          rows={data?.payments?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState icon={CreditCard} title="Aucun paiement" hint="Aucune transaction enregistrée." />}
          columns={[
            { key: 'student', label: 'Élève', render: (p) => <Link to={`/admin/eleves/${p.studentId}`} className="hover:underline">{p.studentEmail}</Link> },
            { key: 'amount', label: 'Montant', render: (p) => `${p.amount.toFixed(2)} ${p.currency}` },
            { key: 'plan', label: 'Formule', render: (p) => p.plan ?? '—' },
            { key: 'status', label: 'Statut', render: (p) => <StatusBadge status={p.status} /> },
            { key: 'provider', label: 'Fournisseur', render: (p) => p.provider ?? '—' },
            { key: 'reference', label: 'Référence', render: (p) => <code className="font-mono-jetbrains text-xs">{p.reference ?? '—'}</code> },
            { key: 'paidAt', label: 'Payé le', render: (p) => formatDate(p.paidAt) },
          ]}
        />

        <Pagination meta={data?.payments} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
