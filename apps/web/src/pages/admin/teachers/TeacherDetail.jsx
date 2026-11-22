import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AdminPage, useAdminLabels, formatDate, Num, btnSecondary, btnGhost, input as INPUT } from '../adminUi';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import DataTable from '../../../components/admin/ui/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../../components/admin/ui/states';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import AmbassadorSwitch from '../../../components/admin/ui/AmbassadorSwitch';
import CommercialPanel from '../../../components/admin/commercial/CommercialPanel';
import FeatureUsagePanel from '../../../components/admin/commercial/FeatureUsagePanel';
import DeleteUserSection from '../../../components/admin/DeleteUserSection';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchTeacher, changeTeacherStatus, grantTeacherOverride, revokeTeacherOverride } from '../../../services/admin/teacherService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { formatDzd } from '../../../utils/dinars';

/**
 * LA FICHE ENSEIGNANT — la surface de contrôle : compte, offre, activation,
 * demandes, abonnements, droits (avec leur source), classes, journal.
 */
export default function AdminTeacherDetail() {
  const { t } = useTranslation('admin');
  const L = useAdminLabels();
  const { id } = useParams();
  useDocumentMeta(t('teachers.detailMetaTitle', { id }));
  const { token } = useContext(AuthContext);
  const loader = useCallback((tok) => fetchTeacher(tok, id), [id]);
  const { data, loading, error, reload, setData } = useAdminResource(loader, [loader]);
  const teacher = data?.teacher;

  // La SOURCE d'un droit, en arabe. Table locale (et non `status.*`) parce que
  // ce vocabulaire n'existe que sur cet écran.
  const SOURCE_LABELS = {
    default: t('teachers.sourceDefault'),
    plan: t('teachers.sourcePlan'),
    subscription: t('teachers.sourceSubscription'),
    override: t('teachers.sourceOverride'),
  };

  const [pendingStatus, setPendingStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState({ key: '', value: '', reason: '', endsAt: '' });
  const [overrideError, setOverrideError] = useState(null);

  const applyStatus = async () => {
    setBusy(true);
    try { const updated = await changeTeacherStatus(token, id, pendingStatus); setData((c) => ({ ...c, teacher: { ...c.teacher, ...updated } })); }
    finally { setBusy(false); setPendingStatus(null); }
  };

  const grant = async () => {
    setOverrideError(null);
    const meta = data.entitlementsDetail.find((e) => e.key === override.key);
    let value = override.value;
    if (meta?.type === 'limit') value = override.value === '' ? null : Number(override.value);
    if (meta?.type === 'feature') value = override.value === 'true';
    if (meta?.type === 'list') value = override.value.split(',').map((v) => v.trim()).filter(Boolean);
    try {
      await grantTeacherOverride(token, id, { key: override.key, value, reason: override.reason || undefined, endsAt: override.endsAt || undefined });
      setOverride({ key: '', value: '', reason: '', endsAt: '' });
      reload();
    } catch (err) { setOverrideError(err.message); }
  };

  const revoke = async (overrideId) => {
    try { await revokeTeacherOverride(token, id, overrideId); reload(); } catch (err) { setOverrideError(err.message); }
  };

  const usageOf = (key) => {
    const e = data?.entitlements;
    if (!e) return null;
    if (key === 'classrooms.max') return e.classes.current;
    if (key === 'students_total.max') return e.students.current;
    return null;
  };

  const statusActionLabel = (value) => (
    value === 'active' ? t('teachers.reactivate')
      : value === 'suspended' ? t('teachers.suspend')
        : t('teachers.disable')
  );

  return (
    <AdminPage
      eyebrow={t('teachers.detailEyebrow')}
      title={teacher ? ([teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.email) : t('teachers.detailTitleFallback', { id })}
      subtitle={teacher?.email}
      actions={<Link to="/admin/enseignants" className={btnSecondary}><ArrowBack size={14} /> {t('teachers.backToList')}</Link>}
    >
      {loading && <LoadingState label={t('common.loadingData')} />}
      {error && <ErrorState message={error} onRetry={reload} retryLabel={L.table.retry} />}
      {data && teacher && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-space text-sm font-bold text-slate-900">{t('teachers.accountSection')}</h2>
            <dl className="grid grid-cols-2 gap-3 font-inter text-sm lg:grid-cols-5">
              <Info label={t('common.email')}><span dir="ltr">{teacher.email}</span></Info>
              <Info label={t('teachers.columnRegistered')}>{formatDate(teacher.createdAt)}</Info>
              <Info label={t('teachers.emailVerifiedLabel')}>{teacher.emailVerified ? t('common.yes') : t('common.no')}</Info>
              <Info label={t('teachers.lastActivity')}>{formatDate(teacher.lastActivityAt)}</Info>
              <Info label={t('common.status')}><StatusBadge status={teacher.accountStatus} /></Info>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="font-inter text-xs text-slate-500">{t('teachers.changeStatus')}</span>
              {['active', 'suspended', 'disabled'].filter((v) => v !== teacher.accountStatus).map((v) => (
                <button key={v} type="button" onClick={() => setPendingStatus(v)} className={btnGhost}>{statusActionLabel(v)}</button>
              ))}
              <span className="font-inter text-[11px] text-slate-400">{t('teachers.statusVsPlanHint')}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3" data-ambassador-block>
              <span className="font-inter text-xs font-semibold text-slate-700">{t('teachers.ambassador.column')}</span>
              <AmbassadorSwitch teacher={teacher} withLabel onChange={(updated) => setData((c) => ({ ...c, teacher: { ...c.teacher, ...updated } }))} />
              <span className="font-inter text-[11px] text-slate-400">{t('teachers.ambassador.hint')}</span>
            </div>
          </section>

          {data.capacity && (
            <section className="rounded-xl border border-slate-200 bg-white p-4" data-capacity-block>
              <h2 className="mb-3 font-space text-sm font-bold text-slate-900">{t('teachers.capacitySection')}</h2>
              <dl className="grid grid-cols-2 gap-3 font-inter text-sm lg:grid-cols-5">
                <Info label={t('teachers.capacityUsed')}><Num>{data.capacity.current}{'\u00A0/\u00A0'}{data.capacity.limit ?? '∞'}</Num>{data.capacity.overLimit ? <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{t('teachers.overLimit')}</span> : null}</Info>
                <Info label={t('teachers.seatsRemaining')}><Num>{data.capacity.remaining ?? '∞'}</Num></Info>
                <Info label={t('teachers.columnClassrooms')}><Num>{data.classrooms.filter((c) => c.status !== 'archived').length}</Num> <span className="text-slate-400">({t('common.unlimited')}{data.entitlements.classes.maximum != null ? `، ${t('teachers.technicalLimit', { value: data.entitlements.classes.maximum })}` : ''})</span></Info>
                <Info label={t('teachers.seatsPurchased')}>{data.entitlements.plan?.studentSeatLimit != null ? <Num>{data.entitlements.plan.studentSeatLimit}</Num> : <span className="text-slate-400">{t('teachers.planAllocation')}</span>}</Info>
                <Info label={t('teachers.amountOnActivation')}>{data.entitlements.plan?.seatUnitPriceCents != null ? <Num>{formatDzd(data.entitlements.plan.seatUnitPriceCents)} DA × {data.entitlements.plan.studentSeatLimit} = {formatDzd(data.entitlements.plan.seatTotalCents)} DA</Num> : t('common.dash')}</Info>
              </dl>
              <p className="mt-2 font-inter text-[11px] text-slate-400">{t('teachers.capacityHint')}</p>
            </section>
          )}

          <CommercialPanel role="teachers" userId={id} planType="teacher" onChanged={reload} />
          <FeatureUsagePanel userId={id} />

          <section className="rounded-xl border border-slate-200 bg-white p-4" data-entitlements-block>
            <h2 className="mb-1 font-space text-sm font-bold text-slate-900">{t('teachers.effectiveEntitlements')}</h2>
            <p className="mb-3 font-inter text-xs text-slate-500">{t('teachers.entitlementsHint')}</p>
            <DataTable
              rows={data.entitlementsDetail}
              rowKey={(r) => r.key}
              labels={L.table}
              selectionLabel={(row) => L.selectRow(row.label ?? row.key)}
              columns={[
                { key: 'label', label: t('teachers.columnEntitlement'), render: (r) => r.label },
                { key: 'value', label: t('teachers.value'), render: (r) => (r.type === 'feature' ? (r.value ? t('common.yes') : t('common.no')) : r.type === 'list' ? (Array.isArray(r.value) && r.value.length ? r.value.join('، ') : t('common.all')) : r.value === null ? t('common.unlimited') : <Num>{String(r.value)}</Num>) },
                { key: 'usage', label: t('teachers.usage'), render: (r) => (usageOf(r.key) === null ? t('common.dash') : <Num>{usageOf(r.key)}{'\u00A0/\u00A0'}{r.value === null ? '∞' : r.value}</Num>) },
                { key: 'source', label: t('teachers.source'), render: (r) => <StatusBadge status={r.source === 'override' ? 'pending' : 'free'} label={SOURCE_LABELS[r.source] ?? r.source} /> },
              ]}
            />
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3" data-override-form>
              <p className="mb-2 font-inter text-xs font-semibold text-slate-700">{t('teachers.grantOverride')}</p>
              <div className="grid gap-2 sm:grid-cols-4">
                <select value={override.key} onChange={(e) => setOverride({ ...override, key: e.target.value, value: '' })} className={INPUT} aria-label={t('teachers.overrideKeyLabel')}>
                  <option value="">{t('teachers.overrideKeyPlaceholder')}</option>
                  {data.entitlementsDetail.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
                {data.entitlementsDetail.find((e) => e.key === override.key)?.type === 'feature'
                  ? <select value={override.value} onChange={(e) => setOverride({ ...override, value: e.target.value })} className={INPUT} aria-label={t('teachers.value')}><option value="">{t('teachers.valuePlaceholder')}</option><option value="true">{t('common.yes')}</option><option value="false">{t('common.no')}</option></select>
                  : <input value={override.value} onChange={(e) => setOverride({ ...override, value: e.target.value })} placeholder={data.entitlementsDetail.find((e) => e.key === override.key)?.type === 'list' ? t('teachers.overrideListPlaceholder') : t('teachers.overrideValuePlaceholder')} className={INPUT} aria-label={t('teachers.value')} />}
                <input value={override.reason} onChange={(e) => setOverride({ ...override, reason: e.target.value })} maxLength={255} placeholder={t('common.reason')} className={INPUT} aria-label={t('common.reason')} />
                <input type="date" value={override.endsAt} onChange={(e) => setOverride({ ...override, endsAt: e.target.value })} className={INPUT} aria-label={t('teachers.overrideEndsAtLabel')} />
              </div>
              <button type="button" onClick={grant} disabled={!override.key} className={`${btnGhost} mt-2 border border-slate-300 bg-white`}>{t('teachers.grant')}</button>
              {overrideError && <p role="alert" className="mt-2 font-inter text-xs text-rose-700">{overrideError}</p>}
            </div>
            {data.overrides.length > 0 && (
              <ul className="mt-3 divide-y divide-slate-100 font-inter text-xs">
                {data.overrides.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 py-1.5">
                    <span><b>{o.label}</b> ← {o.value === null ? t('common.unlimited') : <Num>{String(o.value)}</Num>}{o.reason ? ` — ${o.reason}` : ''}{o.endsAt ? ` (${t('teachers.untilDate', { date: formatDate(o.endsAt) })})` : ''}</span>
                    <span className="flex items-center gap-2 text-slate-500">{o.active ? <StatusBadge status="active" /> : <StatusBadge status="revoked" label={o.revokedAt ? t('teachers.overrideWithdrawn') : t('teachers.overrideInactive')} />}{o.active && <button type="button" onClick={() => revoke(o.id)} className="text-rose-700 hover:underline">{t('teachers.withdraw')}</button>}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('teachers.classroomsSection')}</h2>
            <DataTable
              rows={data.classrooms}
              labels={L.table}
              selectionLabel={(row) => L.selectRow(row.name)}
              empty={<EmptyState title={t('teachers.noClassroom')} />}
              columns={[
                { key: 'name', label: t('teachers.columnClassroom'), render: (c) => <Link to={`/admin/classes/${c.id}`} className="font-semibold text-blue-700 hover:underline">{c.name}</Link> },
                { key: 'grade', label: t('common.grade'), render: (c) => c.grade },
                { key: 'students', label: t('teachers.columnStudents'), render: (c) => <Num>{c.studentsCount}</Num> },
                { key: 'status', label: t('common.status'), render: (c) => <StatusBadge status={c.status} /> },
                { key: 'joinCode', label: t('teachers.columnJoinCode'), render: (c) => <code className="font-mono-jetbrains" dir="ltr">{c.joinCode}</code> },
                { key: 'createdAt', label: t('teachers.columnCreatedAt'), render: (c) => formatDate(c.createdAt) },
              ]}
            />
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('teachers.activitySection')}</h2>
            {data.activity.length === 0 ? <EmptyState title={t('teachers.noActivity')} /> : (
              <ol className="space-y-1.5">
                {data.activity.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 font-inter text-xs">
                    <code className="shrink-0 font-mono-jetbrains text-slate-700" dir="ltr">{e.action}</code>
                    <span className="min-w-0 flex-1 text-slate-500">{e.actor ?? t('common.dash')}{e.actorRole ? ` (${e.actorRole})` : ''}{e.after ? ` — ${JSON.stringify(e.after)}` : ''}</span>
                    <span className="shrink-0 text-slate-400">{formatDate(e.createdAt, { withTime: true })}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <DeleteUserSection user={teacher} role="teacher" backTo="/admin/enseignants" />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={applyStatus}
        busy={busy}
        tone={pendingStatus === 'active' ? 'default' : 'danger'}
        cancelLabel={L.dialog.cancelLabel}
        busyLabel={L.dialog.busyLabel}
        closeLabel={L.dialog.closeLabel}
        title={pendingStatus === 'active' ? t('teachers.confirmReactivateTitle') : pendingStatus === 'suspended' ? t('teachers.confirmSuspendTitle') : t('teachers.confirmDisableTitle')}
        confirmLabel={statusActionLabel(pendingStatus)}
        message={<p>{pendingStatus === 'active' ? t('teachers.confirmReactivateMessage') : t('teachers.confirmBlockMessage')}</p>}
      />
    </AdminPage>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <dt className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{children}</dd>
    </div>
  );
}
