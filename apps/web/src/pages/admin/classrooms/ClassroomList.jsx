import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { School } from 'lucide-react';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchClassrooms } from '../../../services/admin/classroomService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';
import { AdminPage, useAdminLabels, Num } from '../adminUi';

export default function AdminClassroomList() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('classrooms.metaTitle'));
  const L = useAdminLabels();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);
  const loader = useCallback((token) => fetchClassrooms(token, { search: debouncedSearch, status, page }), [debouncedSearch, status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  return (
    <AdminPage eyebrow={t('classrooms.eyebrow')} title={t('classrooms.title')} subtitle={t('classrooms.subtitle')}>
      <div className="space-y-3">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('classrooms.searchPlaceholder')} label={L.filters.searchLabel} />
          <SelectFilter label={t('common.status')} allLabel={t('classrooms.allStatuses')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: 'active', label: t('status.active') }, { value: 'archived', label: t('status.archived') }, { value: 'suspended', label: t('status.suspended') }]} />
        </FilterBar>
        <DataTable
          rows={data?.classrooms?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.name ?? row.id)}
          empty={<EmptyState icon={School} title={t('classrooms.emptyTitle')} hint={t('classrooms.emptyHint')} />}
          columns={[
            { key: 'name', label: t('classrooms.columnName'), render: (c) => <Link to={`/admin/classes/${c.id}`} className="font-semibold text-violet-700 hover:underline">{c.name}</Link> },
            { key: 'teacher', label: t('classrooms.columnTeacher'), render: (c) => (c.teacher ? <Link to={`/admin/enseignants/${c.teacher.id}`} className="hover:underline">{c.teacher.name || <span dir="ltr">{c.teacher.email}</span>}</Link> : t('common.dash')) },
            { key: 'grade', label: t('classrooms.columnGrade'), render: (c) => c.grade },
            { key: 'students', label: t('classrooms.columnStudents'), render: (c) => <Num>{c.studentsCount}</Num> },
            { key: 'status', label: t('common.status'), render: (c) => <StatusBadge status={c.status} /> },
            { key: 'joinCode', label: t('classrooms.joinCode'), render: (c) => <code dir="ltr" className="font-mono-jetbrains">{c.joinCode}</code> },
          ]}
        />
        <Pagination meta={data?.classrooms} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
