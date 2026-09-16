import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import PublicationControl from '../../../components/admin/PublicationControl';
import BulkActionBar from '../../../components/admin/BulkActionBar';
import { buildContentBulkActions } from '../../../components/admin/bulkContentActions';
import { CONTENT_NOUNS } from '../../../components/admin/contentNouns';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import { AuthContext } from '../../../context/AuthContext';
import { fetchModules } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const GRADES = ['6e', '5e', '4e', '3e', 'seconde', 'premiere_specialite', 'terminale_specialite'];

/**
 * Les étapes du parcours, dans leur ordre pédagogique — pas alphabétique :
 * c'est la séquence d'une leçon, et la lire dans le désordre n'aiderait
 * personne.
 */
export const STAGE_LABELS = {
  prerequisite_check: 'Vérification des acquis',
  trigger: 'Déclencheur',
  discovery: 'Découverte',
  manipulation: 'Manipulation',
  formalization: 'Formalisation',
  practice_lab: 'Entraînement',
  evaluation: 'Évaluation',
};

export default function AdminModules() {
  useDocumentMeta('Modules — Administration');

  const { token } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [stage, setStage] = useState();
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchModules(token, { search: debouncedSearch, grade, stage, status, page }),
    [debouncedSearch, grade, stage, status, page],
  );
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const rows = data?.data ?? [];
  const selection = useBulkSelection(rows);

  /**
   * Pas de palier ici : un module suit celui de sa leçon. `withTier: false`
   * est la MÊME frontière qu'à l'unité, où la colonne « Accès » n'existe pas
   * dans ce tableau et où la route serveur refuse le type `module`.
   */
  const bulkActions = useMemo(
    () => buildContentBulkActions({
      type: 'module',
      token,
      titleOf: (row) => `${row.title} — ${row.lessonTitle ?? row.lessonCode}`,
      withTier: false,
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
      title="Modules"
      subtitle="Tous les modules, toutes leçons confondues. Retirer un module ne ferme pas sa leçon — et ne supprime aucune progression."
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder="Titre de module, ou leçon…"
          />
          <SelectFilter
            label="Classe" allLabel="Toutes les classes" value={grade}
            onChange={resetPage(setGrade)}
            options={GRADES.map((g) => ({ value: g, label: g }))}
          />
          <SelectFilter
            label="Étape" allLabel="Toutes les étapes" value={stage}
            onChange={resetPage(setStage)}
            options={Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }))}
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
          noun={CONTENT_NOUNS.module}
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
          selectionLabel={(row) => `Sélectionner le module ${row.title} de ${row.lessonTitle ?? row.lessonCode}`}
          columns={[
            {
              key: 'title',
              label: 'Module',
              cellClassName: 'min-w-[220px]',
              render: (row) => (
                <div>
                  <span className="font-semibold text-slate-900">{row.title}</span>
                  <span className="block font-mono-jetbrains text-xs text-slate-400">
                    module {String(row.number).padStart(2, '0')}
                  </span>
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
            { key: 'stage', label: 'Étape', render: (row) => STAGE_LABELS[row.stage] ?? row.stage ?? '—' },
            {
              key: 'estimatedMin',
              label: 'Durée',
              render: (row) => (row.estimatedMin ? `${row.estimatedMin} min` : '—'),
            },
            {
              key: 'learningPointCount',
              label: 'Points',
              render: (row) => (row.learningPointCount > 0
                ? row.learningPointCount
                // Une étape qui n'enseigne pas n'a pas à en déclarer : le dire
                // évite de lire un tiret comme une donnée manquante.
                : <span className="text-slate-400" title="Cette étape n’enseigne pas de point">—</span>),
            },
            {
              key: 'publicationStatus',
              label: 'Publication',
              render: (row) => (
                <PublicationControl
                  type="module"
                  id={row.id}
                  status={row.publicationStatus}
                  onChanged={(next) => patchRow(row.id, next)}
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
              icon={Layers}
              title="Aucun module"
              hint="Aucun module ne correspond à ces filtres."
            />
          )}
        />

        <Pagination meta={data} onPage={setPage} />
      </div>
    </AdminPage>
  );
}
