import React, { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchStudents } from '../../../services/admin/studentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');

export default function AdminStudentList() {
  useDocumentMeta('Élèves — Administration');

  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? undefined;

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' });
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchStudents(token, {
      search: debouncedSearch, grade, status, page,
      sort: sort.key, direction: sort.direction,
    }),
    [debouncedSearch, grade, status, page, sort],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const setStatusFilter = (next) => {
    const updated = new URLSearchParams(params);
    if (next) updated.set('status', next);
    else updated.delete('status');
    setParams(updated);
    setPage(1);
  };

  return (
    <AdminPage
      eyebrow="Élèves"
      title="Comptes élèves"
      subtitle="Suspendre ou désactiver un compte ferme l’accès immédiatement — sans jamais supprimer l’historique d’apprentissage."
    >
      <div className="space-y-3">
        {data?.counts && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: undefined, label: 'Tous', value: data.counts.all },
              { key: 'active', label: 'Actifs', value: data.counts.active },
              { key: 'suspended', label: 'Suspendus', value: data.counts.suspended },
              { key: 'disabled', label: 'Désactivés', value: data.counts.disabled },
            ].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-lg border px-3 py-1.5 font-inter text-xs font-semibold ${
                  status === tab.key
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label} <span className="tabular-nums text-slate-400">{tab.value}</span>
              </button>
            ))}
          </div>
        )}

        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Email, nom ou identifiant…" />
          <SelectFilter
            label="Classe" allLabel="Toutes les classes" value={grade}
            onChange={(v) => { setGrade(v); setPage(1); }}
            options={['6e', '5e', '4e', '3e', 'seconde'].map((g) => ({ value: g, label: g }))}
          />
        </FilterBar>

        <DataTable
          columns={[
            {
              key: 'email',
              label: 'Élève',
              sortKey: 'email',
              render: (s) => (
                <Link to={`/admin/eleves/${s.id}`} className="block hover:underline">
                  <span className="font-semibold text-slate-900">
                    {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.email}
                  </span>
                  <span className="block text-xs text-slate-500">{s.email}</span>
                </Link>
              ),
            },
            { key: 'grade', label: 'Classe', sortKey: 'grade', render: (s) => s.grade ?? <span className="text-slate-400">—</span> },
            { key: 'accountStatus', label: 'Compte', sortKey: 'account_status', render: (s) => <StatusBadge status={s.accountStatus} /> },
            {
              key: 'subscriptionStatus',
              label: 'Abonnement',
              render: (s) => (s.subscriptionStatus
                ? <StatusBadge status={s.subscriptionStatus} />
                : <span className="text-slate-400">Aucun</span>),
            },
            {
              key: 'progress',
              label: 'Progression',
              sortKey: 'lessons_completed_count',
              render: (s) => (
                <span className="tabular-nums">
                  {s.lessonsCompletedCount ?? 0}<span className="text-slate-400"> / {s.lessonsStartedCount ?? 0} commencées</span>
                </span>
              ),
            },
            { key: 'reportsCount', label: 'Signalements', render: (s) => s.reportsCount ?? 0 },
            { key: 'lastActivityAt', label: 'Dernière activité', sortKey: 'last_activity_at', render: (s) => <span className="whitespace-nowrap">{formatDate(s.lastActivityAt)}</span> },
            { key: 'createdAt', label: 'Inscrit le', sortKey: 'created_at', render: (s) => <span className="whitespace-nowrap">{formatDate(s.createdAt)}</span> },
          ]}
          rows={data?.students?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          sort={sort}
          onSortChange={setSort}
          empty={<EmptyState icon={Users} title="Aucun élève" hint="Aucun compte ne correspond à ces filtres." />}
        />

        <Pagination meta={data?.students} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
