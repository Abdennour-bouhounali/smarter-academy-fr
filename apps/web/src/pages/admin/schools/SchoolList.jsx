import { useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Plus } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import Modal from '../../../components/admin/ui/Modal';
import { FilterBar, SearchInput, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { createSchool, fetchSchools } from '../../../services/admin/schoolService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useDebounced } from '../../../hooks/useDebounced';
import { AdminPage, useAdminLabels, Num, btnPrimary, btnSecondary, input, label } from '../adminUi';

const BLANK = { name: '', wilaya: '', commune: '', code: '', currentAcademicYear: '' };

/**
 * « Établissements » — les établissements de l’« espace établissement » (SCHOOL_ADMIN_SPACE.md §5).
 * Créer ici ; le directeur se nomme sur la fiche.
 */
export default function AdminSchoolList() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('schools.metaTitle'));
  const L = useAdminLabels();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 300);
  const loader = useCallback((tok) => fetchSchools(tok, { search: debouncedSearch, status, page }), [debouncedSearch, status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const created = await createSchool(token, draft);
      setDraft(null);
      navigate(`/admin/etablissements/${created.school.id}`);
    } catch (caught) {
      setProblem(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow={t('schools.eyebrow')}
      title={t('schools.title')}
      subtitle={t('schools.subtitle')}
      actions={<button type="button" className={btnPrimary} onClick={() => { setDraft(BLANK); setProblem(null); }}><Plus size={14} />{t('schools.newSchool')}</button>}
    >
      <div className="space-y-3">
        <FilterBar>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('schools.searchPlaceholder')} label={L.filters.searchLabel} />
          <SelectFilter label={t('common.status')} allLabel={t('schools.allStatuses')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: 'active', label: t('status.active') }, { value: 'suspended', label: t('status.suspended') }, { value: 'archived', label: t('status.archived') }]} />
        </FilterBar>
        <DataTable
          rows={data?.schools?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.name ?? row.id)}
          empty={<EmptyState icon={Building2} title={t('schools.emptyTitle')} hint={t('schools.emptyHint')} />}
          columns={[
            { key: 'name', label: t('schools.columnName'), render: (s) => <Link to={`/admin/etablissements/${s.id}`} className="font-semibold text-violet-700 hover:underline">{s.name}</Link> },
            { key: 'place', label: t('schools.columnPlace'), render: (s) => [s.wilaya, s.commune].filter(Boolean).join(' / ') || t('common.dash') },
            { key: 'director', label: t('schools.columnDirector'), render: (s) => (s.director ? [s.director.firstName, s.director.lastName].filter(Boolean).join(' ') : <span className="text-amber-700">{t('schools.noDirector')}</span>) },
            { key: 'classes', label: t('schools.columnClasses'), render: (s) => <Num>{s.classroomsCount}</Num> },
            { key: 'status', label: t('common.status'), render: (s) => <StatusBadge status={s.status} /> },
          ]}
        />
        <Pagination meta={data?.schools} onPage={setPage} labels={L.pagination} />
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={t('schools.newSchool')}
        closeLabel={t('schools.cancel')}
        footer={(
          <>
            <button type="button" className={btnSecondary} onClick={() => setDraft(null)}>{t('schools.cancel')}</button>
            <button type="submit" form="school-form" disabled={busy} className={btnPrimary}>{t('schools.create')}</button>
          </>
        )}
      >
        {draft && (
          <form id="school-form" onSubmit={save} className="grid gap-4 md:grid-cols-2">
            {problem && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-inter text-sm text-rose-700 md:col-span-2">{problem}</p>}
            <div className="md:col-span-2"><label htmlFor="school-name" className={label}>{t('schools.name')}</label><input id="school-name" required minLength={2} className={input} value={draft.name} onChange={set('name')} /></div>
            <div><label htmlFor="school-wilaya" className={label}>{t('schools.wilaya')}</label><input id="school-wilaya" className={input} value={draft.wilaya} onChange={set('wilaya')} /></div>
            <div><label htmlFor="school-commune" className={label}>{t('schools.commune')}</label><input id="school-commune" className={input} value={draft.commune} onChange={set('commune')} /></div>
            <div>
              <label htmlFor="school-code" className={label}>{t('schools.code')}</label>
              <input id="school-code" dir="ltr" className={input} value={draft.code} onChange={set('code')} />
              <p className="mt-1 font-inter text-xs text-slate-500">{t('schools.codeHint')}</p>
            </div>
            <div>
              <label htmlFor="school-year" className={label}>{t('schools.academicYear')}</label>
              <input id="school-year" dir="ltr" pattern="\d{4}-\d{4}" placeholder="2026-2027" className={input} value={draft.currentAcademicYear} onChange={set('currentAcademicYear')} />
              <p className="mt-1 font-inter text-xs text-slate-500">{t('schools.academicYearHint')}</p>
            </div>
          </form>
        )}
      </Modal>
    </AdminPage>
  );
}
