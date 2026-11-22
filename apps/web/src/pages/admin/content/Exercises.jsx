import { getAllGrades } from '@smarter-academy/core';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { AdminPage, useAdminLabels, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import ExerciseBankControl from '../../../components/admin/ExerciseBankControl';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchLessons } from '../../../services/admin/contentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

// Le filtre ne propose que les classes du catalogue ACTIF (activeGrades.js).
const GRADES = getAllGrades().map((g) => g.id);

/**
 * « Exercices » — organisée PAR LEÇON (propriétaire, 2026-11-11).
 *
 * On ne publie pas les exercices un par un : on choisit une leçon et on donne
 * un état à TOUTE sa banque d'exercices, d'un seul geste
 * (`ExerciseBankControl` → `PATCH …/lesson/{id}/exercises-status`). Chaque
 * ligne résume la banque par état (`exerciseStatusCounts`). Masquer UN
 * exercice reste possible depuis la fiche de la leçon (lien du titre).
 * Changer l'état de la LEÇON elle-même le donne aussi à ses exercices.
 */
export default function AdminExercises() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('exercises.metaTitle'));

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [unit, setUnit] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchLessons(token, {
      search: debouncedSearch, grade, unit, page, withExercises: 1, sort: 'code',
    }),
    [debouncedSearch, grade, unit, page],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const rows = data?.data ?? [];
  const units = data?.units ?? [];
  const resetPage = (setter) => (value) => { setter(value); setPage(1); };

  return (
    <AdminPage
      eyebrow={t('exercises.eyebrow')}
      title={t('exercises.title')}
      subtitle={t('exercises.subtitleByLesson')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder={t('exercises.searchLessonPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('common.grade')} allLabel={t('exercises.allGrades')} value={grade}
            onChange={resetPage(setGrade)}
            options={GRADES.map((g) => ({ value: g, label: g }))}
          />
          <SelectFilter
            label={t('lessons.columnUnit')} allLabel={t('lessons.allUnits')} value={unit}
            onChange={resetPage(setUnit)}
            options={units.map((u) => ({ value: u.code, label: u.title }))}
          />
        </FilterBar>

        <DataTable
          labels={L.table}
          columns={[
            {
              key: 'lesson',
              label: t('exercises.columnLesson'),
              cellClassName: 'min-w-[220px]',
              render: (row) => (
                <div>
                  <Link
                    to={`/admin/contenu/lecons/${encodeURIComponent(row.code)}`}
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    {row.title}
                  </Link>
                  {row.unitTitle && <span className="block text-xs text-slate-400">{row.unitTitle}</span>}
                </div>
              ),
            },
            { key: 'grade', label: t('common.grade'), render: (row) => row.grade ?? t('common.dash') },
            {
              key: 'exercisesCount',
              label: t('exercises.columnCount'),
              render: (row) => <Num>{row.exercisesCount ?? 0}</Num>,
            },
            {
              key: 'bank',
              label: t('exercises.columnPublication'),
              cellClassName: 'min-w-[320px]',
              render: (row) => <ExerciseBankControl lesson={row} onChanged={() => reload()} />,
            },
          ]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={(
            <EmptyState
              icon={Dumbbell}
              title={t('exercises.emptyTitle')}
              hint={t('exercises.emptyEngineHint')}
            />
          )}
        />

        <Pagination meta={data} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
