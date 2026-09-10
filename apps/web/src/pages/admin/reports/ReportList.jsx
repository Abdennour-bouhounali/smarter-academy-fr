import React, { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flag } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchReports } from '../../../services/admin/reportService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';
import { REPORT_CATEGORIES } from '../../../services/reportService';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminReportList() {
  useDocumentMeta('Signalements — Administration');

  // Le statut vient de l'URL : les entrées « Nouveaux » / « En cours » de la
  // barre latérale sont de simples liens, et un filtre reste partageable.
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? undefined;

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState();
  const [category, setCategory] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchReports(token, { search: debouncedSearch, status, priority, category, page }),
    [debouncedSearch, status, priority, category, page],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const setStatus = (next) => {
    const updated = new URLSearchParams(params);
    if (next) updated.set('status', next);
    else updated.delete('status');
    setParams(updated);
    setPage(1);
  };

  const counts = data?.counts;

  return (
    <AdminPage
      eyebrow="Signalements"
      title="Problèmes signalés par les élèves"
      subtitle="Le contexte (leçon, module, exercice, question) est capté automatiquement — l’élève n’a rien à désigner."
    >
      <div className="space-y-3">
        {counts && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: undefined, label: 'Tous', value: counts.all },
              { key: 'new', label: 'Nouveaux', value: counts.new },
              { key: 'in_review', label: 'En cours', value: counts.inReview },
              { key: 'resolved', label: 'Résolus', value: counts.resolved },
              { key: 'dismissed', label: 'Rejetés', value: counts.dismissed },
            ].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setStatus(tab.key)}
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
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Message, leçon, exercice…" />
          <SelectFilter
            label="Priorité" allLabel="Toutes priorités" value={priority}
            onChange={(v) => { setPriority(v); setPage(1); }}
            options={[
              { value: 'critical', label: 'Critique' }, { value: 'high', label: 'Haute' },
              { value: 'medium', label: 'Moyenne' }, { value: 'low', label: 'Basse' },
            ]}
          />
          <SelectFilter
            label="Catégorie" allLabel="Toutes catégories" value={category}
            onChange={(v) => { setCategory(v); setPage(1); }}
            options={REPORT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
          />
        </FilterBar>

        <DataTable
          columns={[
            { key: 'id', label: '#', render: (r) => <span className="font-mono-jetbrains text-xs text-slate-400">{r.id}</span> },
            {
              key: 'content',
              label: 'Contenu',
              render: (r) => (
                <Link to={`/admin/signalements/${r.id}`} className="block hover:underline">
                  <span className="font-semibold text-slate-900">{r.lessonTitle ?? r.lessonCode ?? '—'}</span>
                  <span className="block text-xs text-slate-500">
                    {r.moduleTitle ?? (r.moduleNumber != null ? `Module ${r.moduleNumber}` : null)}
                    {r.exerciseCode ? ` · ${r.exerciseCode}` : ''}
                    {r.questionId ? ` · ${r.questionId}` : ''}
                  </span>
                </Link>
              ),
            },
            {
              key: 'category',
              label: 'Type',
              render: (r) => REPORT_CATEGORIES.find((c) => c.id === r.category)?.label ?? r.category,
            },
            { key: 'note', label: 'Message', render: (r) => <span className="line-clamp-2 max-w-xs text-slate-600">{r.note || <span className="text-slate-400">Sans message</span>}</span> },
            { key: 'studentEmail', label: 'Élève', render: (r) => <Link to={`/admin/eleves/${r.studentId}`} className="hover:underline">{r.studentEmail}</Link> },
            { key: 'priority', label: 'Priorité', render: (r) => <StatusBadge status={r.priority} /> },
            { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'createdAt', label: 'Date', render: (r) => <span className="whitespace-nowrap text-slate-500">{dateFormat.format(new Date(r.createdAt))}</span> },
          ]}
          rows={data?.reports?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={(
            <EmptyState
              icon={Flag}
              title="Aucun signalement"
              hint="C’est plutôt bon signe. Les élèves peuvent en envoyer depuis chaque module et chaque question."
            />
          )}
        />

        <Pagination meta={data?.reports} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
