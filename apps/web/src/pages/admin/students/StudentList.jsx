import { getAllGrades } from '@smarter-academy/core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { AdminPage, useAdminLabels, formatDate, Num, btnPrimary } from '../adminUi';
import OneTimeCredentials from '../../../components/admin/OneTimeCredentials';
import { CreateStudentForm, useCreateStudent } from './CreateStudent';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import BulkActionBar from '../../../components/admin/BulkActionBar';
import PlanActivateControl from '../../../components/admin/commercial/PlanActivateControl';
import { buildPlanBulkActions } from '../../../components/admin/commercial/bulkPlanActions';
import { AuthContext } from '../../../context/AuthContext';
import { useBulkSelection } from '../../../hooks/useBulkSelection';
import { fetchPlans } from '../../../services/admin/planService';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchStudents } from '../../../services/admin/studentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';

// Les classes du CATALOGUE, jamais une liste écrite ici : le tableau
// français hérité ('6e', '5e', …) survivait à la bascule algérienne et
// aurait proposé de filtrer sur des classes qui n'existent plus en base.
// Le `name` vient du catalogue (donnée), il n'est donc pas traduit ici.
const GRADE_OPTIONS = getAllGrades().map((g) => ({ value: g.id, label: g.name }));

const STUDENT_NOUN = { key: 'student' };
const nameOf = (s) => [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;

export default function AdminStudentList() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  useDocumentMeta(t('students.metaTitle'));

  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? undefined;

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' });
  const debouncedSearch = useDebounced(search, 300);

  const loader = useCallback(
    (token) => fetchStudents(token, {
      search: debouncedSearch, grade, status, page,
      sort: sort.key, direction: sort.direction,
    }),
    [debouncedSearch, grade, status, page, sort],
  );
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  const { token } = useContext(AuthContext);
  const create = useCreateStudent(token, t, reload);

  // Les offres ÉLÈVE activables — mêmes règles que le CommercialPanel de la
  // fiche : actives ou masquées, jamais l'offre par défaut.
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    fetchPlans(token, { type: 'student', perPage: 100 })
      .then((d) => setPlans((d.plans?.data ?? []).filter((p) => ['active', 'hidden'].includes(p.status) && !p.isDefault)))
      .catch(() => setPlans([]));
  }, [token]);

  const rows = data?.students?.data ?? [];
  const selection = useBulkSelection(rows);
  const bulkActions = useMemo(() => buildPlanBulkActions({ token, plans, nameOf }), [token, plans]);

  /** Chaque ligne prend l'état que le serveur a donné à SON abonnement. */
  const patchSubscription = (statusById) => {
    setData((current) => current && ({
      ...current,
      students: {
        ...current.students,
        data: current.students.data.map((row) => (row.id in statusById ? { ...row, subscriptionStatus: statusById[row.id] } : row)),
      },
    }));
  };

  const setStatusFilter = (next) => {
    const updated = new URLSearchParams(params);
    if (next) updated.set('status', next);
    else updated.delete('status');
    setParams(updated);
    setPage(1);
  };

  return (
    <AdminPage
      eyebrow={t('students.eyebrow')}
      title={t('students.title')}
      subtitle={t('students.subtitle')}
      actions={!create.form && (
        <button type="button" className={btnPrimary} onClick={create.start}>
          <UserPlus size={16} /> {t('students.create.button')}
        </button>
      )}
    >
      <div className="space-y-3">
        {create.secret && (
          <OneTimeCredentials
            title={t('students.create.passwordTitle')}
            hint={t('students.create.passwordHint')}
            footer={t('students.create.loginAt')}
            login={create.secret.login}
            password={create.secret.password}
            labels={{ copy: t('common.copy'), copied: t('common.copied'), done: t('students.create.done') }}
            onDone={create.dismissSecret}
          />
        )}

        {create.form && (
          <CreateStudentForm
            t={t}
            form={create.form}
            gradeOptions={GRADE_OPTIONS}
            busy={create.busy}
            nameErrors={create.nameErrors}
            formError={create.formError}
            onField={create.setField}
            onSubmit={create.submit}
            onCancel={create.cancel}
          />
        )}

        {data?.counts && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: undefined, id: 'all', label: t('common.all'), value: data.counts.all },
              { key: 'active', id: 'active', label: t('status.active'), value: data.counts.active },
              { key: 'suspended', id: 'suspended', label: t('status.suspended'), value: data.counts.suspended },
              { key: 'disabled', id: 'disabled', label: t('status.disabled'), value: data.counts.disabled },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-lg border px-3 py-1.5 font-inter text-xs font-semibold ${
                  status === tab.key
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
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
            placeholder={t('students.searchPlaceholder')}
            label={L.filters.searchLabel}
          />
          <SelectFilter
            label={t('students.columnGrade')} allLabel={t('students.allGrades')} value={grade}
            onChange={(v) => { setGrade(v); setPage(1); }}
            options={GRADE_OPTIONS}
          />
        </FilterBar>

        <BulkActionBar
          count={selection.count}
          noun={STUDENT_NOUN}
          actions={bulkActions}
          selectedRows={selection.selectedRows}
          onClear={selection.clear}
          onSelectAllVisible={selection.toggleAll}
          allSelected={selection.allSelected}
          visibleCount={selection.visibleCount}
          onDone={(outcome) => patchSubscription(outcome.statusById ?? {})}
        />

        <DataTable
          columns={[
            {
              key: 'email',
              label: t('students.columnStudent'),
              sortKey: 'email',
              render: (s) => (
                <Link to={`/admin/eleves/${s.id}`} className="block hover:underline">
                  <span className="font-semibold text-slate-900">
                    {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.email}
                  </span>
                  <span className="block text-xs text-slate-500" dir="ltr">{s.email}</span>
                </Link>
              ),
            },
            { key: 'grade', label: t('students.columnGrade'), sortKey: 'grade', render: (s) => s.grade ?? <span className="text-slate-400">{t('common.dash')}</span> },
            { key: 'accountStatus', label: t('students.columnAccount'), sortKey: 'account_status', render: (s) => <StatusBadge status={s.accountStatus} /> },
            {
              key: 'subscriptionStatus',
              label: t('students.columnSubscription'),
              render: (s) => (s.subscriptionStatus
                ? <StatusBadge status={s.subscriptionStatus} />
                : <span className="text-slate-400">{t('common.none')}</span>),
            },
            {
              key: 'progress',
              label: t('students.columnProgress'),
              sortKey: 'lessons_completed_count',
              // Le ratio reste LTR : « 3 / 10 » ne doit pas se lire « 10 / 3 ».
              render: (s) => (
                <span className="font-inter text-xs text-slate-700">
                  <Num className="tabular-nums text-slate-900">{s.lessonsCompletedCount ?? 0}</Num>
                  {' '}
                  {t('students.ofStarted', { count: s.lessonsStartedCount ?? 0 })}
                </span>
              ),
            },
            {
              key: 'activatePlan',
              label: t('students.columnActivatePlan'),
              cellClassName: 'min-w-[160px]',
              render: (s) => (
                <PlanActivateControl
                  studentId={s.id}
                  studentName={nameOf(s)}
                  plans={plans}
                  onActivated={(sub) => patchSubscription({ [s.id]: sub?.status ?? null })}
                />
              ),
            },
            { key: 'reportsCount', label: t('students.columnReports'), render: (s) => <Num>{s.reportsCount ?? 0}</Num> },
            { key: 'lastActivityAt', label: t('students.columnLastActivity'), sortKey: 'last_activity_at', render: (s) => <span className="whitespace-nowrap">{formatDate(s.lastActivityAt)}</span> },
            { key: 'createdAt', label: t('students.columnRegistered'), sortKey: 'created_at', render: (s) => <span className="whitespace-nowrap">{formatDate(s.createdAt)}</span> },
          ]}
          rows={rows}
          selection={plans.length ? selection : undefined}
          loading={loading}
          error={error}
          onRetry={reload}
          sort={sort}
          onSortChange={setSort}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(nameOf(row))}
          empty={<EmptyState icon={Users} title={t('students.emptyTitle')} hint={t('students.emptyHint')} />}
        />

        <Pagination meta={data?.students} onPage={setPage} labels={L.pagination} />
      </div>
    </AdminPage>
  );
}
