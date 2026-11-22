import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { getAllGrades } from '@smarter-academy/core';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import DataTable from '../../../components/admin/ui/DataTable';
import { EmptyState } from '../../../components/admin/ui/states';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchPlan, fetchEntitlementKeys, updatePlan, changePlanStatus, duplicatePlan, createPlanVersion, updatePlanVersion, publishPlanVersion, fetchPricingQuote } from '../../../services/admin/planService';
import { tiersToRows, rowsToPayload, tierProblems, emptyTier } from '../../../features/admin/plans/pricingTiers';
import { quoteSeats } from '../../../features/teacher/subscription/seatPricing';
import { formatDzd } from '../../../utils/dinars';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { AdminPage, AdminSection, useAdminLabels, Loading, ErrorBox, formatDate, btnPrimary, btnSecondary, btnGhost, input as inputClass, Num } from '../adminUi';

/**
 * L'ÉDITEUR d'une offre : informations, demandes, versions (capacité,
 * GRILLE DE PRIX PAR ÉLÈVE, fonctionnalités, contenu, limites techniques,
 * prix fixe informatif), abonnés.
 *
 * L'offre enseignant se vend par sièges : la grille (paliers min–max →
 * prix par élève) est validée ici pour l'ergonomie (chevauchements, trous)
 * et revalidée par le serveur, qui seul calcule un prix. L'aperçu « pour N
 * élèves » interroge ce calcul serveur.
 *
 * Une version référencée par un abonnement est FIGÉE : on en crée une
 * nouvelle, on la règle, on la publie — et les abonnés existants gardent la
 * leur. Le vocabulaire des clés vient du serveur ; rien n'est codé ici.
 *
 * Tous les MONTANTS sont informatifs, en dinars : l'administration les
 * communique, le règlement se fait hors plateforme.
 */

/**
 * Les problèmes de la grille, dits en arabe.
 *
 * `tierProblems` porte la RÈGLE et rend des codes (`{code, params}`) ; le
 * catalogue porte la PHRASE. On ne relit donc pas les lignes une seconde fois
 * ici : ce qui bloque l'enregistrement et ce qui s'affiche sont exactement la
 * même liste, et reformuler un message ne touche plus à la validation.
 */
function useTierIssues(problems, t) {
  return useMemo(
    () => problems.map(({ code, params }) => ({
      key: `${code}:${JSON.stringify(params)}`,
      text: t(`plans.${code}`, params),
    })),
    [problems, t],
  );
}

export default function AdminPlanEditor() {
  const { t } = useTranslation('admin');
  const { id } = useParams();
  useDocumentMeta(t('plans.detailMetaTitle', { id }));
  const L = useAdminLabels();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const loader = useCallback((tok) => fetchPlan(tok, id), [id]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const [keys, setKeys] = useState([]);
  useEffect(() => { fetchEntitlementKeys(token).then(setKeys).catch(() => setKeys([])); }, [token]);

  const plan = data?.plan;
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [previewSeats, setPreviewSeats] = useState('25');
  const [serverQuote, setServerQuote] = useState(null);

  useEffect(() => {
    if (!plan) return;
    setInfo({ name: plan.name, description: plan.description ?? '', displayOrder: plan.displayOrder, isPublic: plan.isPublic, isDefault: plan.isDefault, allowsRequests: plan.allowsRequests });
    const preferred = plan.versions.find((v) => v.status === 'draft') ?? plan.versions.find((v) => v.status === 'current') ?? plan.versions[0];
    setSelectedVersionId((cur) => (plan.versions.some((v) => v.id === cur) ? cur : preferred?.id ?? null));
  }, [plan]);

  const version = useMemo(() => plan?.versions.find((v) => v.id === selectedVersionId) ?? null, [plan, selectedVersionId]);
  useEffect(() => {
    if (!version) return;
    setDraft({
      entitlements: { ...version.entitlements },
      price: { amountCents: version.price?.amountCents ?? 0, currency: version.price?.currency ?? 'DZD', billingInterval: version.price?.billingInterval ?? 'year', intervalCount: version.price?.intervalCount ?? 1, durationDays: version.price?.durationDays ?? '', trialDays: version.price?.trialDays ?? 0 },
      notes: version.notes ?? '',
      tiers: tiersToRows(version.pricingTiers ?? []),
    });
    setServerQuote(null);
  }, [version]);

  const run = async (fn, ok) => {
    setBusy(true);
    setMessage(null);
    try { await fn(); setMessage({ tone: 'ok', text: ok }); reload(); } catch (err) { setMessage({ tone: 'error', text: err.message }); } finally { setBusy(false); }
  };

  const editable = version && version.status === 'draft' && !version.frozen;
  const byCategory = (cat) => keys.filter((k) => k.category === cat);
  const setEnt = (key, value) => setDraft((d) => ({ ...d, entitlements: { ...d.entitlements, [key]: value } }));
  const isTeacherPlan = plan?.type === 'teacher';
  // Une seule source : `tierProblems` (testée sur ses codes), traduite juste
  // après. `problems.length` reste ce qui verrouille le bouton d'enregistrement.
  const problems = useMemo(() => (draft ? tierProblems(draft.tiers) : []), [draft]);
  const issues = useTierIssues(problems, t);
  const setTier = (index, patch) => setDraft((d) => ({ ...d, tiers: d.tiers.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));
  const moveTier = (index, delta) => setDraft((d) => {
    const rows = [...d.tiers];
    const target = index + delta;
    if (target < 0 || target >= rows.length) return d;
    [rows[index], rows[target]] = [rows[target], rows[index]];
    return { ...d, tiers: rows };
  });
  const addTier = () => setDraft((d) => {
    const last = d.tiers[d.tiers.length - 1];
    const nextMin = last && last.maxStudents !== '' && last.maxStudents !== null ? Number(last.maxStudents) + 1 : '';
    return { ...d, tiers: [...d.tiers, { ...emptyTier(d.tiers.length), minStudents: nextMin }] };
  });
  const removeTier = (index) => setDraft((d) => ({ ...d, tiers: d.tiers.filter((_, i) => i !== index) }));
  const localQuote = draft ? quoteSeats(rowsToPayload(draft.tiers), Number(previewSeats)) : null;
  const askServerQuote = async () => {
    setServerQuote(null);
    try { setServerQuote({ ok: true, quote: await fetchPricingQuote(token, version.id, Number(previewSeats)) }); }
    catch (err) { setServerQuote({ ok: false, message: err.message }); }
  };
  const saveVersion = () => run(() => updatePlanVersion(token, version.id, {
    entitlements: draft.entitlements,
    price: { ...draft.price, durationDays: draft.price.durationDays === '' ? null : Number(draft.price.durationDays) },
    notes: draft.notes,
    pricingTiers: isTeacherPlan ? rowsToPayload(draft.tiers) : undefined,
  }), t('plans.versionSaved'));

  return (
    <AdminPage
      eyebrow={t('plans.editorEyebrow')}
      title={plan?.name ?? t('plans.detailFallbackTitle', { id })}
      subtitle={plan ? `${plan.type === 'teacher' ? t('status.teacher') : t('status.student')} · ${plan.slug}` : undefined}
      actions={<Link to="/admin/offres" className={btnSecondary}><ArrowBack size={14} /> {t('plans.backToList')}</Link>}
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {plan && info && (
        <div className="space-y-6">
          {message && <p role={message.tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 font-inter text-xs ${message.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message.text}</p>}

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-space text-sm font-bold text-slate-900">{t('plans.infoSection')}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={plan.status} />
                {plan.status !== 'active' && <button type="button" className={btnGhost} disabled={busy} onClick={() => run(() => changePlanStatus(token, id, 'active'), t('plans.planActivated'))}>{t('plans.activatePlan')}</button>}
                {plan.status === 'active' && <button type="button" className={btnGhost} disabled={busy} onClick={() => run(() => changePlanStatus(token, id, 'hidden'), t('plans.planHidden'))}>{t('plans.hidePlan')}</button>}
                {plan.status !== 'archived' && <button type="button" className={btnGhost} disabled={busy} onClick={() => run(() => changePlanStatus(token, id, 'archived'), t('plans.planArchived'))}>{t('plans.archivePlan')}</button>}
                <button type="button" className={btnGhost} disabled={busy} onClick={async () => { const copy = await duplicatePlan(token, id); navigate(`/admin/offres/${copy.id}`); }}>{t('plans.duplicate')}</button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block font-inter text-xs font-semibold text-slate-600">{t('common.name')}</span><input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputClass} /></label>
              <label className="block"><span className="mb-1 block font-inter text-xs font-semibold text-slate-600">{t('plans.displayOrder')}</span><input type="number" min={0} value={info.displayOrder} onChange={(e) => setInfo({ ...info, displayOrder: Number(e.target.value) })} className={inputClass} /></label>
              <label className="block sm:col-span-2"><span className="mb-1 block font-inter text-xs font-semibold text-slate-600">{t('plans.description')}</span><textarea rows={2} value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} className={inputClass} /></label>
              <label className="flex items-center gap-2 font-inter text-xs text-slate-700"><input type="checkbox" checked={info.isPublic} onChange={(e) => setInfo({ ...info, isPublic: e.target.checked })} /> {t('plans.isPublic')}</label>
              <label className="flex items-center gap-2 font-inter text-xs text-slate-700"><input type="checkbox" checked={info.isDefault} onChange={(e) => setInfo({ ...info, isDefault: e.target.checked })} /> {t('plans.isDefault')}</label>
              <label className="flex items-center gap-2 font-inter text-xs text-slate-700 sm:col-span-2"><input type="checkbox" checked={info.allowsRequests} onChange={(e) => setInfo({ ...info, allowsRequests: e.target.checked })} /> <b>{t('plans.requestsSection')} :</b> {t('plans.allowsRequestsHint')}</label>
            </div>
            <button type="button" className={`${btnPrimary} mt-3`} disabled={busy} onClick={() => run(() => updatePlan(token, id, info), t('plans.infoSaved'))}>{t('common.save')}</button>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4" data-versions>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-space text-sm font-bold text-slate-900">{t('plans.versionsSection')}</h2>
              <button type="button" className={btnGhost} disabled={busy || plan.versions.some((v) => v.status === 'draft')} onClick={() => run(() => createPlanVersion(token, id), t('plans.versionCreated'))}>{t('plans.newVersion')}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.versions.map((v) => (
                <button key={v.id} type="button" onClick={() => setSelectedVersionId(v.id)} className={`rounded-lg border px-3 py-1.5 font-inter text-xs font-semibold ${v.id === selectedVersionId ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-300 bg-white text-slate-600'}`}>
                  <Num>{`v${v.version}`}</Num> <StatusBadge status={v.status} /> {v.frozen && v.status === 'draft' ? <span aria-label={t('plans.frozenBadge')}>🔒</span> : ''}
                </button>
              ))}
            </div>

            {version && draft && (
              <div className="mt-4 space-y-5">
                {!editable && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 font-inter text-xs text-amber-900">
                    {version.subscriptionsCount
                      ? t('plans.frozenWithSubscribers', { count: version.subscriptionsCount })
                      : t('plans.frozenNotice')}
                  </p>
                )}

                {isTeacherPlan && (
                  <div data-capacity-block>
                    <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{t('plans.seatCapacity')}</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {byCategory('capacity').map((k) => (
                        <label key={k.key} className="block"><span className="mb-1 block font-inter text-xs text-slate-600">{k.label}</span>
                          <input type="number" min={0} disabled={!editable} value={draft.entitlements[k.key] ?? ''} onChange={(e) => setEnt(k.key, e.target.value === '' ? null : Number(e.target.value))} placeholder={t('common.unlimited')} className={inputClass} /></label>
                      ))}
                    </div>
                    <p className="mt-1 font-inter text-[11px] text-slate-400">
                      {plan.isDefault ? t('plans.capacityFreeHint') : t('plans.capacityPurchasedHint')}
                    </p>
                  </div>
                )}

                {isTeacherPlan && !plan.isDefault && (
                  <div data-pricing-tiers>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{t('plans.tiersTitle')}</h3>
                      {editable && <button type="button" className={btnGhost} onClick={addTier}>{t('plans.addTier')}</button>}
                    </div>
                    <p className="mb-2 font-inter text-[11px] text-slate-500">{t('plans.tiersHint')}</p>
                    <table className="w-full font-inter text-xs">
                      <thead><tr className="text-slate-500"><th scope="col" className="py-1 text-start">{t('plans.tierMin')}</th><th scope="col" className="text-start">{t('plans.tierMax')}</th><th scope="col" className="text-start">{t('plans.tierPrice')}</th><th scope="col" className="text-start">{t('plans.currency')}</th><th scope="col" className="text-start">{t('plans.tierActive')}</th><th scope="col" className="text-start">{t('plans.tierOrder')}</th><th scope="col"><span className="sr-only">{t('common.actions')}</span></th></tr></thead>
                      <tbody>
                        {draft.tiers.length === 0 && <tr><td colSpan={7} className="py-2 text-slate-400">{t('plans.noTiers')}</td></tr>}
                        {draft.tiers.map((row, i) => (
                          <tr key={row.id ?? `n${i}`} className="border-t border-slate-100" data-tier-row>
                            <td className="py-1 pe-2"><input type="number" min={1} disabled={!editable} value={row.minStudents} onChange={(e) => setTier(i, { minStudents: e.target.value === '' ? '' : Number(e.target.value) })} className={inputClass} aria-label={t('plans.tierMinAria', { n: i + 1 })} /></td>
                            <td className="pe-2"><input type="number" min={1} disabled={!editable} value={row.maxStudents} onChange={(e) => setTier(i, { maxStudents: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="∞" className={inputClass} aria-label={t('plans.tierMaxAria', { n: i + 1 })} /></td>
                            <td className="pe-2"><input type="number" min={0} step={50} disabled={!editable} value={row.pricePerStudent} onChange={(e) => setTier(i, { pricePerStudent: e.target.value === '' ? '' : Number(e.target.value) })} className={inputClass} aria-label={t('plans.tierPriceAria', { n: i + 1 })} /></td>
                            <td className="pe-2"><input maxLength={3} dir="ltr" disabled={!editable} value={row.currency} onChange={(e) => setTier(i, { currency: e.target.value.toUpperCase() })} className={`${inputClass} w-16`} aria-label={t('plans.tierCurrencyAria', { n: i + 1 })} /></td>
                            <td className="pe-2"><input type="checkbox" disabled={!editable} checked={row.isActive !== false} onChange={(e) => setTier(i, { isActive: e.target.checked })} aria-label={t('plans.tierActiveAria', { n: i + 1 })} /></td>
                            <td className="pe-2 whitespace-nowrap">
                              {editable && <><button type="button" className={btnGhost} onClick={() => moveTier(i, -1)} disabled={i === 0} aria-label={t('plans.moveUp')}>↑</button> <button type="button" className={btnGhost} onClick={() => moveTier(i, 1)} disabled={i === draft.tiers.length - 1} aria-label={t('plans.moveDown')}>↓</button></>}
                            </td>
                            <td className="text-end">{editable && <button type="button" className="font-inter text-xs font-semibold text-rose-700 hover:underline" onClick={() => removeTier(i)}>{t('common.delete')}</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {problems.length > 0 && (
                      <ul role="alert" className="mt-2 list-disc rounded-lg border border-rose-200 bg-rose-50 p-3 ps-6 font-inter text-xs text-rose-800" data-tier-problems>
                        {issues.map((p) => <li key={p.key}>{p.text}</li>)}
                      </ul>
                    )}

                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3" data-pricing-preview>
                      <p className="mb-2 font-inter text-xs font-semibold text-slate-700">{t('plans.previewTitle')}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input type="number" min={1} value={previewSeats} onChange={(e) => { setPreviewSeats(e.target.value); setServerQuote(null); }} className={`${inputClass} w-24`} aria-label={t('plans.previewSeatsAria')} />
                        <span className="font-inter text-xs text-slate-700">
                          {localQuote
                            ? <>{t('plans.tier')} <b><Num>{localQuote.tier.label ?? `${localQuote.tier.minStudents}–${localQuote.tier.maxStudents ?? '∞'}`}</Num></b> · <b><Num>{`${formatDzd(localQuote.unitPriceCents)} ${t('plans.dinarShort')}`}</Num></b> {t('plans.perStudent')} · {t('plans.total')} <b><Num>{`${formatDzd(localQuote.totalCents)} ${t('plans.dinarShort')}`}</Num></b> <span className="text-slate-400">({t('plans.localCalc')})</span></>
                            : <span className="text-rose-700">{t('plans.noTierCovers')}</span>}
                        </span>
                        <button type="button" className={btnGhost} onClick={askServerQuote}>{t('plans.checkOnServer')}</button>
                      </div>
                      {serverQuote && (
                        <p className={`mt-2 font-inter text-xs ${serverQuote.ok ? 'text-emerald-800' : 'text-rose-700'}`} data-server-quote>
                          {serverQuote.ok
                            ? <>{t('plans.serverPrefix')} {t('plans.tier')} <Num>{serverQuote.quote.tier.label}</Num> · <Num>{`${formatDzd(serverQuote.quote.unitPriceCents)} ${t('plans.dinarShort')}`}</Num> {t('plans.perStudent')} · {t('plans.total')} <Num>{`${formatDzd(serverQuote.quote.totalCents)} ${t('plans.dinarShort')}`}</Num></>
                            : serverQuote.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{isTeacherPlan ? t('plans.durationAndFixedPrice') : t('plans.pricingSection')}</h3>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <input type="number" min={0} step={100} disabled={!editable} value={draft.price.amountCents / 100} onChange={(e) => setDraft({ ...draft, price: { ...draft.price, amountCents: Math.round(Number(e.target.value) * 100) } })} className={inputClass} aria-label={t('plans.amountAria')} />
                    <select disabled={!editable} value={draft.price.billingInterval} onChange={(e) => setDraft({ ...draft, price: { ...draft.price, billingInterval: e.target.value } })} className={inputClass} aria-label={t('plans.intervalAria')}><option value="month">{t('plans.intervalMonth')}</option><option value="year">{t('plans.intervalYear')}</option><option value="one_time">{t('plans.intervalOnce')}</option></select>
                    <input type="number" min={1} disabled={!editable} value={draft.price.durationDays} onChange={(e) => setDraft({ ...draft, price: { ...draft.price, durationDays: e.target.value } })} placeholder={t('plans.duration')} aria-label={t('plans.duration')} className={inputClass} />
                    <input type="number" min={0} disabled={!editable} value={draft.price.trialDays} onChange={(e) => setDraft({ ...draft, price: { ...draft.price, trialDays: Number(e.target.value) } })} placeholder={t('plans.trialDays')} aria-label={t('plans.trialDays')} className={inputClass} />
                  </div>
                  <p className="mt-1 font-inter text-[11px] text-slate-400">{isTeacherPlan ? t('plans.durationHint') : t('plans.priceHint')}</p>
                </div>

                <div>
                  <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{t('plans.technicalLimits')}</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {byCategory('technical').concat(isTeacherPlan ? [] : byCategory('capacity')).map((k) => (
                      <label key={k.key} className="block"><span className="mb-1 block font-inter text-xs text-slate-600">{k.label}</span>
                        <input type="number" min={0} disabled={!editable} value={draft.entitlements[k.key] ?? ''} onChange={(e) => setEnt(k.key, e.target.value === '' ? null : Number(e.target.value))} placeholder={t('common.unlimited')} className={inputClass} /></label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{t('plans.featuresSection')}</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {byCategory('features').map((k) => (
                      <label key={k.key} className="flex items-center gap-2 font-inter text-xs text-slate-700"><input type="checkbox" disabled={!editable} checked={Boolean(draft.entitlements[k.key])} onChange={(e) => setEnt(k.key, e.target.checked)} /> {k.label}</label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-inter text-xs font-bold uppercase tracking-wide text-slate-500">{t('plans.allowedGrades')}</h3>
                  <div className="flex flex-wrap gap-3">
                    {getAllGrades().map((g) => {
                      const list = draft.entitlements['content.allowed_grades'] ?? [];
                      const on = list.includes(g.id);
                      return <label key={g.id} className="flex items-center gap-2 font-inter text-xs text-slate-700"><input type="checkbox" disabled={!editable} checked={on} onChange={(e) => setEnt('content.allowed_grades', e.target.checked ? [...list, g.id] : list.filter((x) => x !== g.id))} /> {g.name}</label>;
                    })}
                    <span className="font-inter text-[11px] text-slate-400">{t('plans.noneCheckedMeansAll')}</span>
                  </div>
                </div>

                <label className="block"><span className="mb-1 block font-inter text-xs text-slate-600">{t('plans.versionNotes')}</span><input disabled={!editable} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={inputClass} /></label>

                <div className="flex flex-wrap gap-2">
                  {editable && <button type="button" className={btnPrimary} disabled={busy || problems.length > 0} onClick={saveVersion}>{t('plans.saveVersion')}</button>}
                  {version.status === 'draft' && <button type="button" className={btnGhost} disabled={busy} onClick={() => run(() => publishPlanVersion(token, version.id), t('plans.versionPublished'))}>{t('plans.publishVersion')}</button>}
                  <span className="font-inter text-[11px] text-slate-400 self-center">
                    {t('plans.createdOn')} <Num>{formatDate(version.createdAt)}</Num>
                    {version.publishedAt ? <> · {t('plans.publishedOn')} <Num>{formatDate(version.publishedAt)}</Num></> : ''}
                    {version.createdBy ? ` · ${version.createdBy}` : ''}
                  </span>
                </div>
              </div>
            )}
          </section>

          <AdminSection title={t('plans.subscribersSection')}>
            <DataTable rows={data.subscribers} labels={L.table} selectionLabel={(row) => L.selectRow(row.userName ?? row.userEmail ?? row.userId)} empty={<EmptyState title={t('plans.noSubscribers')} hint={t('plans.noSubscribersHint')} />} columns={[
              { key: 'user', label: t('subscriptions.columnUser'), render: (s) => <Link to={`/admin/${s.userRole === 'teacher' ? 'enseignants' : 'eleves'}/${s.userId}`} className="text-violet-700 hover:underline">{s.userName || <span dir="ltr">{s.userEmail}</span>}</Link> },
              { key: 'role', label: t('subscriptions.columnRole'), render: (s) => <StatusBadge status={s.userRole} /> },
              { key: 'version', label: t('plans.columnVersion'), render: (s) => <Num>{`v${s.planVersion}`}</Num> },
              { key: 'seats', label: t('subscriptions.columnSeats'), render: (s) => (s.studentSeatLimit == null ? t('common.dash') : <Num>{s.studentSeatLimit}</Num>) },
              { key: 'status', label: t('common.status'), render: (s) => <StatusBadge status={s.status} /> },
              { key: 'startedAt', label: t('subscriptions.columnStart'), render: (s) => <Num>{formatDate(s.startedAt)}</Num> },
              { key: 'endsAt', label: t('subscriptions.columnEnd'), render: (s) => <Num>{formatDate(s.endsAt)}</Num> },
              { key: 'source', label: t('subscriptions.columnSource'), render: (s) => s.acquisitionSource ?? t('common.dash') },
            ]} />
          </AdminSection>
        </div>
      )}
    </AdminPage>
  );
}
