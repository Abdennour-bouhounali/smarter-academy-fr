import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
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
import { fetchLessons } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

const GRADES = ['6e', '5e', '4e', '3e', 'seconde', 'premiere_specialite', 'terminale_specialite'];

export default function AdminLessons() {
  useDocumentMeta('Leçons — Administration');

  const { token } = useContext(AuthContext);

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

  const rows = data?.data ?? [];
  // La sélection se vide d'elle-même de tout ce qui quitte l'écran — filtre,
  // page, recherche, tri, rechargement. Voir useBulkSelection.
  const selection = useBulkSelection(rows);

  /** Met à jour une ligne sur place, sans recharger toute la liste. */
  const patchRow = (id, patch) => {
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  };

  /** Les mêmes deux gestes qu'en colonne, appliqués à la sélection. */
  const bulkActions = useMemo(
    () => buildContentBulkActions({
      type: 'lesson',
      token,
      titleOf: (row) => row.title,
      withTier: true,
    }),
    [token],
  );

  /**
   * Réconcilier après un lot : seules les lignes RÉELLEMENT changées prennent
   * le nouvel état. Repeindre toute la sélection ferait afficher « Publié »
   * sur une leçon que le serveur vient de refuser — l'interface mentirait sur
   * la base.
   */
  const applyBulkOutcome = (outcome) => {
    const touched = new Set(outcome.applied);
    setData((current) => current && ({
      ...current,
      data: current.data.map((row) => (touched.has(row.id) ? { ...row, ...outcome.patch } : row)),
    }));
  };

  const columns = [
    {
      key: 'title',
      label: 'Leçon',
      sortKey: 'title',
      // `min-w` sur la cellule : sans elle, une colonne étroite empile un
      // titre long sur trois lignes et fait tripler la hauteur de la rangée.
      cellClassName: 'min-w-[240px]',
      render: (row) => (
        <Link to={`/admin/contenu/lecons/${encodeURIComponent(row.code)}`} className="block hover:underline">
          <span className="font-semibold text-slate-900">{row.title}</span>
          {/* Le chapitre sous le titre plutôt qu'en colonne propre : c'est du
              repère, pas une donnée qu'on trie ou compare, et la colonne
              qu'il occupait (la plus large du tableau) poussait les deux
              menus d'action hors de l'écran. Un contrôle qu'il faut deviner
              en faisant défiler n'existe pas vraiment. */}
          <span className="block truncate font-mono-jetbrains text-xs text-slate-400">{row.code}</span>
          <span className="block truncate font-inter text-xs text-slate-400">{row.chapterTitle ?? '—'}</span>
        </Link>
      ),
    },
    { key: 'grade', label: 'Classe', sortKey: 'code', render: (row) => row.grade ?? '—' },
    // Modules / exercices / élèves : trois compteurs étroits, regroupés en
    // une colonne. Séparés, ils coûtaient trois en-têtes larges pour trois
    // chiffres à un caractère.
    {
      key: 'counts',
      label: 'Mod · Ex · Él',
      // `whitespace-nowrap` ET une largeur minimale : sans elles, l'en-tête
      // se casse sur trois lignes, la colonne se réduit à la largeur d'un
      // caractère et chaque rangée triple de hauteur.
      className: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap min-w-[110px]',
      render: (row) => (
        <span className="font-mono-jetbrains text-xs text-slate-500" title="Modules · Exercices · Élèves">
          {row.modulesCount} · {row.exercisesCount} · {row.studentsCount}
        </span>
      ),
    },
    {
      key: 'openReportsCount',
      label: 'Signalements',
      sortKey: 'open_reports_count',
      render: (row) => (row.openReportsCount > 0
        ? <span className="font-semibold text-amber-700">{row.openReportsCount}</span>
        : <span className="text-slate-400">0</span>),
    },
    {
      key: 'tier',
      label: 'Accès',
      cellClassName: 'min-w-[190px]',
      render: (row) => (
        <TierControl
          type="lesson"
          id={row.id}
          tier={row.tier}
          onChanged={(next) => patchRow(row.id, { tier: next })}
          compact
        />
      ),
    },
    {
      key: 'publicationStatus',
      label: 'Publication',
      sortKey: 'publication_status',
      render: (row) => (
        <PublicationControl
          type="lesson"
          id={row.id}
          status={row.publicationStatus}
          onChanged={(next) => patchRow(row.id, { publicationStatus: next })}
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

        <BulkActionBar
          count={selection.count}
          noun={CONTENT_NOUNS.lesson}
          actions={bulkActions}
          selectedRows={selection.selectedRows}
          onClear={selection.clear}
          onSelectAllVisible={selection.toggleAll}
          allSelected={selection.allSelected}
          visibleCount={selection.visibleCount}
          onDone={applyBulkOutcome}
        />

        <DataTable
          columns={columns}
          rows={rows}
          selection={selection}
          selectionLabel={(row) => `Sélectionner la leçon ${row.title}`}
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
