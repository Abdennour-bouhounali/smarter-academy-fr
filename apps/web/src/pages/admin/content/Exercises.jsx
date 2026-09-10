import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchExercises } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const GRADES = ['6e', '5e', '4e', '3e', 'seconde'];

export default function AdminExercises() {
  useDocumentMeta('Exercices — Administration');

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [level, setLevel] = useState();
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchExercises(token, { search: debouncedSearch, grade, level, status, page }),
    [debouncedSearch, grade, level, status, page],
  );
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const patchRow = (id, publicationStatus) => {
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (row.id === id ? { ...row, publicationStatus } : row)),
    }));
  };

  const resetPage = (setter) => (value) => { setter(value); setPage(1); };

  return (
    <AdminPage
      eyebrow="Contenu"
      title="Exercices"
      subtitle="Retirer un exercice le fait disparaître de la liste de l’élève — sans effacer aucune tentative déjà enregistrée."
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder="Identifiant, titre, ou leçon…"
          />
          <SelectFilter
            label="Classe" allLabel="Toutes les classes" value={grade}
            onChange={resetPage(setGrade)}
            options={GRADES.map((g) => ({ value: g, label: g }))}
          />
          <SelectFilter
            label="Niveau" allLabel="Tous les niveaux" value={level}
            onChange={resetPage(setLevel)}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Niveau ${n}` }))}
          />
          <SelectFilter
            label="Publication" allLabel="Tous les états" value={status}
            onChange={resetPage(setStatus)}
            options={[
              { value: 'published', label: 'Publié' },
              { value: 'hidden', label: 'Masqué' },
              { value: 'draft', label: 'Brouillon' },
              { value: 'archived', label: 'Archivé' },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={[
            {
              key: 'exerciseCode',
              label: 'Exercice',
              cellClassName: 'min-w-[240px]',
              render: (row) => (
                <div>
                  <span className="font-semibold text-slate-900">{row.title ?? row.exerciseCode}</span>
                  <span className="block font-mono-jetbrains text-xs text-slate-400">{row.exerciseCode}</span>
                </div>
              ),
            },
            {
              key: 'lesson',
              label: 'Leçon',
              cellClassName: 'min-w-[180px]',
              render: (row) => (
                <Link
                  to={`/admin/contenu/lecons/${encodeURIComponent(row.lessonCode)}`}
                  className="hover:underline"
                >
                  {row.lessonTitle ?? row.lessonCode}
                </Link>
              ),
            },
            { key: 'grade', label: 'Classe', render: (row) => row.grade ?? '—' },
            { key: 'level', label: 'Niveau', render: (row) => row.level },
            { key: 'questionCount', label: 'Questions', render: (row) => row.questionCount ?? '—' },
            {
              key: 'publicationStatus',
              label: 'Publication',
              render: (row) => (
                <PublicationControl
                  type="exercise"
                  id={row.id}
                  status={row.publicationStatus}
                  onChanged={(next) => patchRow(row.id, next)}
                  compact
                />
              ),
            },
          ]}
          rows={data?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={(
            <EmptyState
              icon={Dumbbell}
              title="Aucun exercice"
              hint="Le moteur d’exercices s’active leçon par leçon (content/practice/active.json) : peu de leçons en ont aujourd’hui, ce n’est pas une erreur."
            />
          )}
        />

        <Pagination meta={data} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
