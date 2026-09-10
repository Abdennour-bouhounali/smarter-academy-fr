import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchLessons } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const GRADES = ['6e', '5e', '4e', '3e', 'seconde', 'premiere_specialite', 'terminale_specialite'];

export default function AdminLessons() {
  useDocumentMeta('Leçons — Administration');

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [status, setStatus] = useState();
  const [tier, setTier] = useState();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'title', direction: 'asc' });

  // La frappe ne déclenche pas une requête par caractère.
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchLessons(token, {
      search: debouncedSearch, grade, status, tier, page,
      sort: sort.key, direction: sort.direction,
    }),
    [debouncedSearch, grade, status, tier, page, sort],
  );

  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  /** Met à jour une ligne sur place, sans recharger toute la liste. */
  const patchRow = (id, publicationStatus) => {
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (row.id === id ? { ...row, publicationStatus } : row)),
    }));
  };

  const columns = [
    {
      key: 'title',
      label: 'Leçon',
      sortKey: 'title',
      render: (row) => (
        <Link to={`/admin/contenu/lecons/${encodeURIComponent(row.code)}`} className="block hover:underline">
          <span className="font-semibold text-slate-900">{row.title}</span>
          <span className="block font-mono-jetbrains text-xs text-slate-400">{row.code}</span>
        </Link>
      ),
    },
    { key: 'grade', label: 'Classe', sortKey: 'code', render: (row) => row.grade ?? '—' },
    { key: 'chapter', label: 'Chapitre', render: (row) => row.chapterTitle ?? '—' },
    { key: 'modulesCount', label: 'Modules', sortKey: 'modules_count', render: (row) => row.modulesCount },
    { key: 'exercisesCount', label: 'Exercices', sortKey: 'exercises_count', render: (row) => row.exercisesCount },
    { key: 'studentsCount', label: 'Élèves', render: (row) => row.studentsCount },
    {
      key: 'openReportsCount',
      label: 'Signalements',
      sortKey: 'open_reports_count',
      render: (row) => (row.openReportsCount > 0
        ? <span className="font-semibold text-amber-700">{row.openReportsCount}</span>
        : <span className="text-slate-400">0</span>),
    },
    { key: 'tier', label: 'Accès', render: (row) => <StatusBadge status={row.tier} label={row.tier === 'free' ? 'Gratuit' : 'Premium'} /> },
    {
      key: 'publicationStatus',
      label: 'Publication',
      sortKey: 'publication_status',
      render: (row) => (
        <PublicationControl
          type="lesson"
          id={row.id}
          status={row.publicationStatus}
          onChanged={(next) => patchRow(row.id, next)}
          compact
        />
      ),
    },
  ];

  return (
    <AdminPage
      eyebrow="Contenu"
      title="Leçons"
      subtitle="Publier, masquer ou archiver une leçon. Masquer ne supprime jamais la progression des élèves."
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Titre ou code de leçon…" />
          <SelectFilter
            label="Classe" allLabel="Toutes les classes" value={grade}
            onChange={(value) => { setGrade(value); setPage(1); }}
            options={GRADES.map((g) => ({ value: g, label: g }))}
          />
          <SelectFilter
            label="Publication" allLabel="Tous les états" value={status}
            onChange={(value) => { setStatus(value); setPage(1); }}
            options={[
              { value: 'published', label: 'Publié' },
              { value: 'hidden', label: 'Masqué' },
              { value: 'draft', label: 'Brouillon' },
              { value: 'archived', label: 'Archivé' },
            ]}
          />
          <SelectFilter
            label="Accès" allLabel="Tous les accès" value={tier}
            onChange={(value) => { setTier(value); setPage(1); }}
            options={[{ value: 'free', label: 'Gratuit' }, { value: 'premium', label: 'Premium' }]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          sort={sort}
          onSortChange={setSort}
          empty={<EmptyState icon={BookOpen} title="Aucune leçon" hint="Aucune leçon ne correspond à ces filtres." />}
        />

        <Pagination meta={data} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
