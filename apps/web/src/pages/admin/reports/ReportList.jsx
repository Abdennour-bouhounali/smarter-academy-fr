import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flag, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminPage, useAdminLabels, formatDate, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchReports } from '../../../services/admin/reportService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';
import { SOURCE_VALUES, sourceKey, categoryKey, CATEGORY_KEYS } from './reportLabels';

export default function AdminReportList() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('reports.metaTitle'));

  // Le statut vient de l'URL : les entrées « Nouveaux » / « En cours » de la
  // barre latérale sont de simples liens, et un filtre reste partageable.
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? undefined;

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState();
  const [category, setCategory] = useState();
  const [source, setSource] = useState();
  const [screenshot, setScreenshot] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchReports(token, {
      search: debouncedSearch, status, priority, category, source, screenshot, page,
    }),
    [debouncedSearch, status, priority, category, source, screenshot, page],
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

  // Le libellé d'une catégorie : la clé du catalogue, ou le code brut quand
  // la base porte une valeur qu'aucun des deux vocabulaires ne connaît.
  const labelForCategory = (value) => {
    const key = categoryKey(value);
    if (key === null) return t('common.dash');
    return key ? t(key) : value;
  };

  return (
    <AdminPage
      eyebrow={t('reports.eyebrow')}
      title={t('reports.title')}
      subtitle={t('reports.subtitle')}
    >
      <div className="space-y-3">
        {counts && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: undefined, id: 'all', label: t('common.all'), value: counts.all },
              { key: 'new', id: 'new', label: t('reports.tabNew'), value: counts.new },
              { key: 'in_review', id: 'in_review', label: t('reports.tabInReview'), value: counts.inReview },
              { key: 'resolved', id: 'resolved', label: t('reports.tabResolved'), value: counts.resolved },
              { key: 'dismissed', id: 'dismissed', label: t('reports.tabDismissed'), value: counts.dismissed },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatus(tab.key)}
                className={`rounded-lg border px-3 py-1.5 font-inter text-xs font-semibold ${
                  status === tab.key
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label} <Num className="tabular-nums text-slate-400">{tab.value}</Num>
              </button>
            ))}
          </div>
        )}

        <FilterBar>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder={t('reports.searchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('reports.columnSeverity')} allLabel={t('reports.allPriorities')} value={priority}
            onChange={(v) => { setPriority(v); setPage(1); }}
            options={[
              { value: 'critical', label: t('status.critical') }, { value: 'high', label: t('status.high') },
              { value: 'medium', label: t('status.medium') }, { value: 'low', label: t('status.low') },
            ]}
          />
          <SelectFilter
            label={t('reports.columnCategory')} allLabel={t('reports.allCategories')} value={category}
            onChange={(v) => { setCategory(v); setPage(1); }}
            options={Object.entries(CATEGORY_KEYS).map(([value, key]) => ({ value, label: t(key) }))}
          />
          <SelectFilter
            label={t('reports.columnSource')} allLabel={t('reports.allSources')} value={source}
            onChange={(v) => { setSource(v); setPage(1); }}
            options={SOURCE_VALUES.map((value) => ({ value, label: t(sourceKey(value)) }))}
          />
          <SelectFilter
            label={t('reports.columnScreenshot')} allLabel={t('common.all')} value={screenshot}
            onChange={(v) => { setScreenshot(v); setPage(1); }}
            options={[{ value: '1', label: t('reports.withScreenshotOnly') }]}
          />
        </FilterBar>

        <DataTable
          labels={L.table}
          columns={[
            { key: 'id', label: '#', render: (r) => <Num className="font-mono-jetbrains text-xs text-slate-400">{r.id}</Num> },
            {
              key: 'content',
              label: t('reports.columnContent'),
              // Sans largeur minimale, un titre long s'empile sur quatre
              // lignes et quadruple la hauteur de chaque rangée.
              cellClassName: 'min-w-[220px]',
              render: (r) => (
                <Link to={`/admin/signalements/${r.id}`} className="block hover:underline">
                  <span className="font-semibold text-slate-900">{r.lessonTitle ?? r.lessonCode ?? t('common.dash')}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {r.moduleTitle ?? (r.moduleNumber != null ? t('reports.moduleNumber', { number: r.moduleNumber }) : null)}
                    {r.exerciseCode ? <> · <Num>{r.exerciseCode}</Num></> : ''}
                    {r.questionId ? <> · <Num>{r.questionId}</Num></> : ''}
                  </span>
                </Link>
              ),
            },
            {
              key: 'source',
              label: t('reports.columnSource'),
              render: (r) => (
                <span className="whitespace-nowrap">{sourceKey(r.source) ? t(sourceKey(r.source)) : r.source}</span>
              ),
            },
            {
              key: 'category',
              label: t('reports.columnCategory'),
              render: (r) => labelForCategory(r.category),
            },
            {
              key: 'hasScreenshot',
              label: t('reports.columnScreenshot'),
              render: (r) => (r.hasScreenshot
                ? <ImageIcon size={16} className="text-violet-600" aria-label={t('reports.hasScreenshot')} />
                : <span className="text-slate-400">{t('common.dash')}</span>),
            },
            {
              key: 'note',
              label: t('reports.columnMessage'),
              render: (r) => <span className="line-clamp-2 max-w-xs text-slate-600">{r.note || <span className="text-slate-400">{t('reports.noMessage')}</span>}</span>,
            },
            {
              key: 'studentEmail',
              label: t('reports.columnReporter'),
              render: (r) => <Num>{r.studentEmail}</Num>,
            },
            { key: 'priority', label: t('reports.columnSeverity'), render: (r) => <StatusBadge status={r.priority} /> },
            { key: 'status', label: t('reports.columnStatus'), render: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'createdAt',
              label: t('reports.columnDate'),
              render: (r) => <span className="whitespace-nowrap text-slate-500">{formatDate(r.createdAt, { withTime: true })}</span>,
            },
          ]}
          rows={data?.reports?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          empty={(
            <EmptyState
              icon={Flag}
              title={t('reports.emptyTitle')}
              hint={t('reports.emptyHint')}
            />
          )}
        />

        <Pagination meta={data?.reports} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}

