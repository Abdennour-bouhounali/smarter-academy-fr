import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { AdminPage, useAdminLabels, formatDate, Num } from '../adminUi';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import AmbassadorSwitch from '../../../components/admin/ui/AmbassadorSwitch';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchTeachers } from '../../../services/admin/teacherService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

export default function AdminTeacherList() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('teachers.metaTitle'));
  const [params] = useSearchParams();
  const requests = params.get('requests') ?? undefined;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState();
  const [ambassador, setAmbassador] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback((token) => fetchTeachers(token, { search: debouncedSearch, status, ambassador, requests, page }), [debouncedSearch, status, ambassador, requests, page]);
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  // Le serveur renvoie la ligne à jour : on la remplace sur place, puis on
  // relit les compteurs (et la liste, si elle est filtrée sur les ambassadeurs).
  const replaceRow = (updated) => {
    setData((c) => ({ ...c, teachers: { ...c.teachers, data: c.teachers.data.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) } }));
    reload();
  };

  return (
    <AdminPage
      eyebrow={t('teachers.eyebrow')}
      title={requests === 'pending' ? t('teachers.pendingRequestsTitle') : t('teachers.title')}
      subtitle={t('teachers.subtitle')}
    >
      <div className="space-y-3">
        {data?.counts && (
          <div className="flex flex-wrap gap-3 font-inter text-xs text-slate-500">
            <span>{t('common.all')} <Num className="font-bold text-slate-800">{data.counts.all}</Num></span>
            <span>{t('status.active')} <Num className="font-bold text-slate-800">{data.counts.active}</Num></span>
            <span>{t('status.suspended')} <Num className="font-bold text-slate-800">{data.counts.suspended}</Num></span>
            <span>{t('status.disabled')} <Num className="font-bold text-slate-800">{data.counts.disabled}</Num></span>
            <span>{t('teachers.ambassador.plural')} <Num className="font-bold text-amber-700">{data.counts.ambassadors ?? 0}</Num></span>
          </div>
        )}
        <FilterBar>
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder={t('teachers.searchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('common.status')} allLabel={t('teachers.allStatuses')} value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: 'active', label: t('status.active') },
              { value: 'suspended', label: t('status.suspended') },
              { value: 'disabled', label: t('status.disabled') },
            ]}
          />
          <SelectFilter
            label={t('teachers.ambassador.column')} allLabel={t('teachers.ambassador.filterAll')} value={ambassador}
            onChange={(v) => { setAmbassador(v); setPage(1); }}
            options={[{ value: '1', label: t('teachers.ambassador.filterOnly') }]}
          />
        </FilterBar>
        <DataTable
          rows={data?.teachers?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow([row.firstName, row.lastName].filter(Boolean).join(' ') || row.email)}
          empty={<EmptyState icon={GraduationCap} title={t('teachers.emptyTitle')} hint={t('teachers.emptyHint')} />}
          columns={[
            { key: 'name', label: t('teachers.columnTeacher'), render: (row) => <Link to={`/admin/enseignants/${row.id}`} className="font-semibold text-blue-700 hover:underline">{[row.firstName, row.lastName].filter(Boolean).join(' ') || row.email}</Link> },
            { key: 'email', label: t('common.email'), render: (row) => <span dir="ltr">{row.email}</span> },
            { key: 'status', label: t('teachers.columnStatus'), render: (row) => <StatusBadge status={row.accountStatus} /> },
            { key: 'ambassador', label: t('teachers.ambassador.column'), render: (row) => <AmbassadorSwitch teacher={row} onChange={replaceRow} /> },
            { key: 'plan', label: t('teachers.columnPlan'), render: (row) => <span>{row.plan?.name ?? t('common.dash')}{row.plan?.source === 'subscription' ? '' : <span className="text-slate-400"> ({t('teachers.byDefault')})</span>}</span> },
            { key: 'classes', label: t('teachers.columnClassrooms'), render: (row) => <Num>{row.usage?.classes?.current ?? 0}{'\u00A0/\u00A0'}{row.usage?.classes?.maximum ?? '∞'}</Num> },
            { key: 'students', label: t('teachers.columnStudents'), render: (row) => <Num>{row.usage?.students?.current ?? 0}{'\u00A0/\u00A0'}{row.usage?.students?.maximum ?? '∞'}</Num> },
            { key: 'requests', label: t('teachers.columnRequests'), render: (row) => (row.pendingRequestsCount > 0 ? <StatusBadge status="pending" label={t('teachers.pendingCount', { count: row.pendingRequestsCount })} /> : <span className="text-slate-400">{t('common.dash')}</span>) },
            { key: 'createdAt', label: t('teachers.columnRegistered'), render: (row) => formatDate(row.createdAt) },
          ]}
        />
        <Pagination meta={data?.teachers} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
