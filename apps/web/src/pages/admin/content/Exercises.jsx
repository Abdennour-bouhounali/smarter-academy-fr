import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import TierControl from '../../../components/admin/TierControl';
import BulkActionBar from '../../../components/admin/BulkActionBar';
import { buildContentBulkActions } from '../../../components/admin/bulkContentActions';
import { CONTENT_NOUNS } from '../../../components/admin/contentNouns';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import { AuthContext } from '../../../context/AuthContext';
import { fetchExercises } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const GRADES = ['6e', '5e', '4e', '3e', 'seconde'];

export default function AdminExercises() {
  useDocumentMeta('Exercices — Administration');

  const { token } = useContext(AuthContext);

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

  const rows = data?.data ?? [];
  const selection = useBulkSelection(rows);

  /**
   * Un exercice a un palier PROPRE, et en plus « hérite de sa leçon » —
   * exactement les trois choix du menu unitaire (voir TierControl), ni un de
   * plus.
   */
  const bulkActions = useMemo(
    () => buildContentBulkActions({
      type: 'exercise',
      token,
      titleOf: (row) => row.title ?? row.exerciseCode,
      withTier: true,
      withTierInherit: true,
    }),
    [token],
  );

  const applyBulkOutcome = (outcome) => {
    const touched = new Set(outcome.applied);
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (touched.has(row.id) ? { ...row, ...outcome.patch } : row)),
    }));
  };

  const patchRow = (id, changes) => {
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (row.id === id ? { ...row, ...changes } : row)),
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

        <BulkActionBar
          count={selection.count}
          noun={CONTENT_NOUNS.exercise}
          actions={bulkActions}
          selectedRows={selection.selectedRows}
          onClear={selection.clear}
          onSelectAllVisible={selection.toggleAll}
          allSelected={selection.allSelected}
          visibleCount={selection.visibleCount}
          onDone={applyBulkOutcome}
        />

        <DataTable
          selection={selection}
          selectionLabel={(row) => `Sélectionner l’exercice ${row.title ?? row.exerciseCode}`}
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
              key: 'tier',
              label: 'Accès',
              cellClassName: 'min-w-[210px]',
              render: (row) => (
                <TierControl
                  type="exercise"
                  id={row.id}
                  tier={row.tier}
                  lessonTier={row.lessonTier}
                  onChanged={(next) => patchRow(row.id, { tier: next })}
                  compact
                />
              ),
            },
            {
              key: 'publicationStatus',
              label: 'Publication',
              render: (row) => (
                <PublicationControl
                  type="exercise"
                  id={row.id}
                  status={row.publicationStatus}
                  onChanged={(next) => patchRow(row.id, { publicationStatus: next })}
                  compact
                />
              ),
            },
          ]}
          rows={rows}
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
