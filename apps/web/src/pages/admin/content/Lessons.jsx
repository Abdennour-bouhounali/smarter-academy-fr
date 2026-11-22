import { getAllGrades } from '@smarter-academy/core';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { AdminPage, useAdminLabels, Num } from '../adminUi';
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

// Le filtre ne propose que les classes du catalogue ACTIF (activeGrades.js) :
// les classes françaises dormantes ne sont ni listées ni filtrables ici, et
// l'API les exclut de toute façon (ContentService, grades.is_active).
const GRADES = getAllGrades().map((g) => g.id);

export default function AdminLessons() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('lessons.metaTitle'));

  const { token } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [status, setStatus] = useState();
  const [tier, setTier] = useState();
  // الوحدة du manuel — les options viennent de l'API (lessonUnits), jamais
  // d'une liste écrite ici : une unité importée demain y apparaît seule.
  const [unit, setUnit] = useState();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'title', direction: 'asc' });

  // La frappe ne déclenche pas une requête par caractère.
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchLessons(token, {
      search: debouncedSearch, grade, unit, status, tier, page,
      sort: sort.key, direction: sort.direction,
    }),
    [debouncedSearch, grade, unit, status, tier, page, sort],
  );

  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const rows = data?.data ?? [];
  const units = data?.units ?? [];
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
      label: t('lessons.columnLesson'),
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
          {/* Le code de la leçon est un identifiant technique : il reste latin et LTR. */}
          <span dir="ltr" className="block truncate font-mono-jetbrains text-xs text-slate-400 text-start">{row.code}</span>
          {/* الوحدة d'abord (le niveau que le manuel nomme), puis le ميدان. */}
          <span className="block truncate font-inter text-xs text-slate-400">
            {row.unitTitle ? `${t('lessons.columnUnit')} : ${row.unitTitle}` : (row.chapterTitle ?? t('common.dash'))}
          </span>
        </Link>
      ),
    },
    { key: 'grade', label: t('common.grade'), sortKey: 'code', render: (row) => row.grade ?? t('common.dash') },
    // Modules / exercices / élèves : trois compteurs étroits, regroupés en
    // une colonne. Séparés, ils coûtaient trois en-têtes larges pour trois
    // chiffres à un caractère.
    {
      key: 'counts',
      label: t('lessons.columnCounts'),
      // `whitespace-nowrap` ET une largeur minimale : sans elles, l'en-tête
      // se casse sur trois lignes, la colonne se réduit à la largeur d'un
      // caractère et chaque rangée triple de hauteur.
      className: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap min-w-[110px]',
      render: (row) => (
        <Num className="font-mono-jetbrains text-xs text-slate-500">
          <span title={t('lessons.countsHint')}>
            {row.modulesCount} · {row.exercisesCount} · {row.studentsCount}
          </span>
        </Num>
      ),
    },
    {
      key: 'openReportsCount',
      label: t('lessons.columnReports'),
      sortKey: 'open_reports_count',
      render: (row) => (row.openReportsCount > 0
        ? <Num className="font-semibold text-amber-700">{row.openReportsCount}</Num>
        : <Num className="text-slate-400">0</Num>),
    },
    {
      key: 'tier',
      label: t('lessons.columnTier'),
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
      label: t('lessons.columnPublication'),
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
      eyebrow={t('lessons.eyebrow')}
      title={t('lessons.title')}
      subtitle={t('lessons.subtitleLong')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder={t('lessons.searchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('common.grade')} allLabel={t('lessons.allGrades')} value={grade}
            onChange={(value) => { setGrade(value); setPage(1); }}
            options={GRADES.map((g) => ({ value: g, label: g }))}
          />
          <SelectFilter
            label={t('lessons.columnUnit')} allLabel={t('lessons.allUnits')} value={unit}
            onChange={(value) => { setUnit(value); setPage(1); }}
            options={units.map((u) => ({ value: u.code, label: u.title }))}
          />
          <SelectFilter
            label={t('lessons.columnPublication')} allLabel={t('lessons.allStates')} value={status}
            onChange={(value) => { setStatus(value); setPage(1); }}
            options={[
              { value: 'published', label: t('status.published') },
              { value: 'hidden', label: t('status.hidden') },
              { value: 'draft', label: t('status.draft') },
              { value: 'archived', label: t('status.archived') },
            ]}
          />
          <SelectFilter
            label={t('lessons.columnTier')} allLabel={t('lessons.allTiers')} value={tier}
            onChange={(value) => { setTier(value); setPage(1); }}
            options={[
              { value: 'free', label: t('status.free') },
              { value: 'premium', label: t('status.premium') },
            ]}
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
          selectionLabel={(row) => L.selectRow(row.title ?? row.code)}
          labels={L.table}
          loading={loading}
          error={error}
          onRetry={reload}
          sort={sort}
          onSortChange={setSort}
          empty={<EmptyState icon={BookOpen} title={t('lessons.emptyTitle')} hint={t('lessons.emptyHint')} />}
        />

        <Pagination meta={data} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
