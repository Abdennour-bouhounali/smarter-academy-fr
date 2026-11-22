import { getAllGrades } from '@smarter-academy/core';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AdminPage, useAdminLabels, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, SearchInput } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchContentAnalytics, fetchLearningPointAnalytics } from '../../../services/admin/dashboardService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

/** Par leçon : combien commencent, combien terminent, combien signalent. */
// Les classes du CATALOGUE, jamais une liste écrite ici : le tableau
// français hérité ('6e', '5e', …) survivait à la bascule algérienne et
// aurait proposé de filtrer sur des classes qui n'existent plus en base.
const GRADE_OPTIONS = getAllGrades().map((g) => ({ value: g.id, label: g.name }));

export function ContentAnalytics() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('analytics.contentMetaTitle'));

  const [grade, setGrade] = useState();
  const loader = useCallback((token) => fetchContentAnalytics(token, { grade }), [grade]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage
      eyebrow={t('analytics.platformEyebrow')}
      title={t('analytics.contentTitle')}
      subtitle={t('analytics.contentSubtitle')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter
            label={t('common.grade')} allLabel={t('analytics.allGrades')} value={grade} onChange={setGrade}
            options={GRADE_OPTIONS}
          />
        </FilterBar>

        <p className="font-inter text-xs text-slate-500">
          {t('analytics.missingColumnsHint')}
        </p>

        <DataTable
          rows={data?.lessons ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          empty={<EmptyState title={t('analytics.emptyTitle')} hint={t('analytics.emptyHint')} />}
          columns={[
            {
              key: 'title',
              label: t('analytics.columnLesson'),
              render: (row) => (
                <Link to={`/admin/contenu/lecons/${encodeURIComponent(row.code)}`} className="hover:underline">
                  <span className="font-semibold text-slate-900">{row.title}</span>
                  {/* Le code de la leçon est un identifiant technique : latin, LTR. */}
                  <span dir="ltr" className="block font-mono-jetbrains text-xs text-slate-400 text-start">{row.code}</span>
                </Link>
              ),
            },
            { key: 'grade', label: t('common.grade'), render: (row) => row.grade ?? t('common.dash') },
            { key: 'starts', label: t('analytics.columnStarts'), render: (row) => <Num>{row.starts}</Num> },
            { key: 'completions', label: t('analytics.columnCompletions'), render: (row) => <Num>{row.completions}</Num> },
            {
              key: 'completionRate',
              label: t('analytics.columnRate'),
              render: (row) => (row.completionRate === null
                ? <span className="text-slate-400" title={t('analytics.noStartHint')}>{t('common.dash')}</span>
                : <Num className="tabular-nums font-semibold">{row.completionRate} %</Num>),
            },
            { key: 'modules', label: t('analytics.columnModules'), render: (row) => <Num>{row.modules}</Num> },
            {
              key: 'reports',
              label: t('analytics.columnReports'),
              render: (row) => (row.reports > 0
                ? <Num className="font-semibold text-amber-700">{row.reports}</Num>
                : <Num className="text-slate-400">0</Num>),
            },
            {
              key: 'publicationStatus',
              label: t('analytics.columnPublication'),
              render: (row) => <StatusBadge status={row.publicationStatus} />,
            },
          ]}
        />
      </div>
    </AdminPage>
  );
}

/** Par point d'apprentissage : qui l'a rencontré, qui le maîtrise, qui bute. */
export function LearningPointAnalytics() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('analytics.pointsMetaTitle'));

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
      eyebrow={t('analytics.platformEyebrow')}
      title={t('analytics.pointsTitle')}
      subtitle={t('analytics.pointsSubtitle')}
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('analytics.pointsSearchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('analytics.scopeLabel')} allLabel={t('analytics.allPoints')} value={onlyExposed}
            onChange={(v) => setOnlyExposed(v ?? '')}
            options={[{ value: '1', label: t('analytics.onlyWorked') }]}
          />
        </FilterBar>

        <DataTable
          rows={data?.learningPoints ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          empty={<EmptyState title={t('analytics.noPointsTitle')} hint={t('analytics.noPointsHint')} />}
          columns={[
            {
              key: 'title',
              label: t('analytics.columnPoint'),
              render: (row) => (
                <div>
                  <span className="font-semibold text-slate-900">{row.title}</span>
                  {/* Le code du point d'apprentissage est technique : latin, LTR. */}
                  <span dir="ltr" className="block font-mono-jetbrains text-xs text-slate-400 text-start">{row.code}</span>
                </div>
              ),
            },
            { key: 'lesson', label: t('analytics.columnLesson'), render: (row) => row.lesson ?? t('common.dash') },
            { key: 'studentsExposed', label: t('analytics.columnStudents'), render: (row) => <Num>{row.studentsExposed}</Num> },
            { key: 'mastered', label: t('analytics.columnMastered'), render: (row) => <Num className="text-emerald-700">{row.mastered}</Num> },
            { key: 'reinforce', label: t('analytics.columnReinforce'), render: (row) => <Num className="text-amber-700">{row.reinforce}</Num> },
            {
              key: 'struggling',
              label: t('analytics.columnStruggling'),
              render: (row) => (row.struggling > 0
                ? <Num className="font-semibold text-rose-700">{row.struggling}</Num>
                : <Num className="text-slate-400">0</Num>),
            },
            {
              key: 'masteryRate',
              label: t('analytics.columnMasteryRate'),
              render: (row) => (row.masteryRate === null
                ? <span className="text-slate-400">{t('common.dash')}</span>
                : <Num className="tabular-nums font-semibold">{row.masteryRate} %</Num>),
            },
          ]}
        />
      </div>
    </AdminPage>
  );
}
