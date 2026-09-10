import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, SearchInput } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchContentAnalytics, fetchLearningPointAnalytics } from '../../../services/admin/dashboardService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

/** Par leçon : combien commencent, combien terminent, combien signalent. */
export function ContentAnalytics() {
  useDocumentMeta('Statistiques contenu — Administration');

  const [grade, setGrade] = useState();
  const loader = useCallback((token) => fetchContentAnalytics(token, { grade }), [grade]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow="Statistiques"
      title="Contenu"
      subtitle="Où les élèves entrent, où ils terminent, où ils signalent."
    >
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter
            label="Classe" allLabel="Toutes les classes" value={grade} onChange={setGrade}
            options={['6e', '5e', '4e', '3e', 'seconde'].map((g) => ({ value: g, label: g }))}
          />
        </FilterBar>

        <p className="font-inter text-xs text-slate-500">
          Les colonnes « vues », « temps moyen » et « abandon » de la spécification ne figurent pas ici :
          rien ne les enregistre encore. Elles seraient inventées.
        </p>

        <DataTable
          rows={data?.lessons ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState title="Aucune donnée" />}
          columns={[
            {
              key: 'title',
              label: 'Leçon',
              render: (row) => (
                <Link to={`/admin/contenu/lecons/${encodeURIComponent(row.code)}`} className="hover:underline">
                  <span className="font-semibold text-slate-900">{row.title}</span>
                  <span className="block font-mono-jetbrains text-xs text-slate-400">{row.code}</span>
                </Link>
              ),
            },
            { key: 'grade', label: 'Classe', render: (row) => row.grade ?? '—' },
            { key: 'starts', label: 'Commencées', render: (row) => row.starts },
            { key: 'completions', label: 'Terminées', render: (row) => row.completions },
            {
              key: 'completionRate',
              label: 'Taux',
              render: (row) => (row.completionRate === null
                ? <span className="text-slate-400" title="Personne n’a commencé cette leçon">—</span>
                : <span className="tabular-nums font-semibold">{row.completionRate} %</span>),
            },
            { key: 'modules', label: 'Modules', render: (row) => row.modules },
            {
              key: 'reports',
              label: 'Signalements',
              render: (row) => (row.reports > 0
                ? <span className="font-semibold text-amber-700">{row.reports}</span>
                : <span className="text-slate-400">0</span>),
            },
            { key: 'publicationStatus', label: 'Publication', render: (row) => <StatusBadge status={row.publicationStatus} /> },
          ]}
        />
      </div>
    </AdminPage>
  );
}

/** Par point d'apprentissage : qui l'a rencontré, qui le maîtrise, qui bute. */
export function LearningPointAnalytics() {
  useDocumentMeta('Points d’apprentissage — Administration');

  const [search, setSearch] = useState('');
  const [onlyExposed, setOnlyExposed] = useState('1');
  const debounced = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchLearningPointAnalytics(token, { search: debounced, onlyExposed: onlyExposed === '1' ? 1 : undefined }),
    [debounced, onlyExposed],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow="Statistiques"
      title="Points d’apprentissage"
      subtitle="Sur quoi les élèves butent réellement — dérivé de la maîtrise enregistrée."
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Intitulé ou code…" />
          <SelectFilter
            label="Portée" allLabel="Tous les points" value={onlyExposed} onChange={(v) => setOnlyExposed(v ?? '')}
            options={[{ value: '1', label: 'Seulement ceux travaillés' }]}
          />
        </FilterBar>

        <DataTable
          rows={data?.learningPoints ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={<EmptyState title="Aucun point d’apprentissage" hint="Aucun point ne correspond à ce filtre." />}
          columns={[
            {
              key: 'title',
              label: 'Point',
              render: (row) => (
                <div>
                  <span className="font-semibold text-slate-900">{row.title}</span>
                  <span className="block font-mono-jetbrains text-xs text-slate-400">{row.code}</span>
                </div>
              ),
            },
            { key: 'lesson', label: 'Leçon', render: (row) => row.lesson ?? '—' },
            { key: 'studentsExposed', label: 'Élèves', render: (row) => row.studentsExposed },
            { key: 'mastered', label: 'Maîtrisé', render: (row) => <span className="text-emerald-700">{row.mastered}</span> },
            { key: 'reinforce', label: 'À consolider', render: (row) => <span className="text-amber-700">{row.reinforce}</span> },
            {
              key: 'struggling',
              label: 'En difficulté',
              render: (row) => (row.struggling > 0
                ? <span className="font-semibold text-rose-700">{row.struggling}</span>
                : <span className="text-slate-400">0</span>),
            },
            {
              key: 'masteryRate',
              label: 'Taux de maîtrise',
              render: (row) => (row.masteryRate === null
                ? <span className="text-slate-400">—</span>
                : <span className="tabular-nums font-semibold">{row.masteryRate} %</span>),
            },
          ]}
        />
      </div>
    </AdminPage>
  );
}
