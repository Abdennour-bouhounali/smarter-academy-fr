import { useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatEur } from '../../../utils/money';
import { BadgeCheck, Plus } from 'lucide-react';
import DataTable from '../../../components/admin/ui/DataTable';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { FilterBar, SelectFilter, Pagination } from '../../../components/admin/ui/FilterBar';
import { EmptyState } from '../../../components/admin/ui/states';
import Modal from '../../../components/admin/ui/Modal';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchPlans, createPlan } from '../../../services/admin/planService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AdminPage, useAdminLabels, btnPrimary, input as inputClass, Num } from '../adminUi';

/** Les OFFRES : ce que l'administration configure sans déploiement. Prix informatifs, aucun paiement en ligne. */
export default function AdminPlanList() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('plans.metaTitle'));
  const L = useAdminLabels();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [type, setType] = useState();
  const [status, setStatus] = useState();
  const [page, setPage] = useState(1);
  const loader = useCallback((t2) => fetchPlans(t2, { type, status, page }), [type, status, page]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'teacher', description: '' });
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Le prix de la version, en euros (`formatEur` : « 9,90 € »).
  const price = (p) => (p?.amountCents
    ? <Num>{formatEur(p.amountCents)}</Num>
    : t('status.free'));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setCreateError(null);
    try {
      const plan = await createPlan(token, { name: form.name.trim(), type: form.type, description: form.description.trim() || undefined });
      navigate(`/admin/offres/${plan.id}`);
    } catch (err) { setCreateError(err.message); } finally { setBusy(false); }
  };

  return (
    <AdminPage
      eyebrow={t('plans.eyebrow')}
      title={t('plans.title')}
      subtitle={t('plans.subtitle')}
      actions={<button type="button" onClick={() => setCreating(true)} className={btnPrimary}><Plus size={14} /> {t('plans.newPlan')}</button>}
    >
      <div className="space-y-3">
        <FilterBar>
          <SelectFilter label={t('plans.columnType')} allLabel={t('plans.allTypes')} value={type} onChange={(v) => { setType(v); setPage(1); }} options={[{ value: 'teacher', label: t('status.teacher') }, { value: 'student', label: t('status.student') }]} />
          <SelectFilter label={t('plans.columnStatus')} allLabel={t('plans.allStatuses')} value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: 'draft', label: t('status.draft') }, { value: 'active', label: t('status.active') }, { value: 'hidden', label: t('status.hidden') }, { value: 'archived', label: t('status.archived') }]} />
        </FilterBar>
        <DataTable
          rows={data?.plans?.data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          labels={L.table}
          selectionLabel={(row) => L.selectRow(row.name ?? row.id)}
          empty={<EmptyState icon={BadgeCheck} title={t('plans.emptyTitle')} hint={t('plans.emptyHint')} />}
          columns={[
            { key: 'name', label: t('plans.columnPlan'), render: (p) => <Link to={`/admin/offres/${p.id}`} className="font-semibold text-violet-700 hover:underline">{p.name}</Link> },
            { key: 'slug', label: t('plans.columnKey'), render: (p) => <code dir="ltr" className="font-mono-jetbrains text-xs">{p.slug}</code> },
            { key: 'type', label: t('plans.columnType'), render: (p) => <StatusBadge status={p.type} /> },
            { key: 'status', label: t('plans.columnStatus'), render: (p) => <StatusBadge status={p.status} /> },
            { key: 'default', label: t('plans.columnDefault'), render: (p) => (p.isDefault ? t('common.yes') : t('common.dash')) },
            { key: 'public', label: t('plans.columnPublic'), render: (p) => (p.isPublic ? t('common.yes') : t('common.no')) },
            { key: 'version', label: t('plans.columnVersion'), render: (p) => (p.currentVersion ? <Num>{`v${p.currentVersion}`}</Num> : t('common.dash')) },
            { key: 'price', label: t('plans.columnPrice'), render: (p) => price(p.price) },
          ]}
        />
        <Pagination meta={data?.plans} onPage={setPage} labels={L.pagination} />
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title={t('plans.newPlan')} closeLabel={L.dialog.closeLabel} size="sm">
        <form onSubmit={submit} className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={120} placeholder={t('plans.namePlaceholder')} aria-label={t('common.name')} className={inputClass} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label={t('plans.columnType')} className={inputClass}><option value="teacher">{t('status.teacher')}</option><option value="student">{t('status.student')}</option></select>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={1000} placeholder={t('plans.descriptionPlaceholder')} aria-label={t('plans.description')} className={inputClass} />
          <p className="font-inter text-xs text-slate-500">{t('plans.createHint')}</p>
          {createError && <p role="alert" className="font-inter text-xs text-rose-700">{createError}</p>}
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? t('common.busy') : t('common.create')}</button>
        </form>
      </Modal>
    </AdminPage>
  );
}
