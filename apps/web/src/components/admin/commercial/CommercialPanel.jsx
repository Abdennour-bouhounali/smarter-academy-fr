import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, BadgeCheck, Inbox, History } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { ConfirmDialog } from '../ui/Modal';
import { Loading, ErrorBox, formatDate, Num } from '../../../pages/admin/adminUi';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchAccountSubscription, activatePlan, issueActivationCode, rejectSubscriptionRequest, subscriptionAction } from '../../../services/admin/subscriptionService';
import { fetchPlans } from '../../../services/admin/planService';
import { quoteSeats } from '../../../features/teacher/subscription/seatPricing';
import { formatDzd } from '../../../utils/dinars';

const INPUT = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-inter text-xs text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500';
const BTN = 'rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';
const BTN_PRIMARY = 'rounded-lg bg-violet-600 px-3 py-1.5 font-inter text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50';

/** La provenance d'un abonnement, par sa CLÉ serveur — le libellé se traduit au rendu. */
const SOURCE_KEYS = {
  manual_admin_activation: 'subscriptions.sourceManual',
  activation_code: 'subscriptions.sourceCode',
  // `provider` n'existe pas dans la section `subscriptions` du catalogue : il
  // n'a jamais eu de colonne à lui. Son libellé vit donc ici.
  provider: 'commercial.sourceProvider',
  promotion: 'subscriptions.sourcePromotion',
  partnership: 'subscriptions.sourcePartnership',
  other: 'subscriptions.sourceOther',
};

/**
 * LE BLOC COMMERCIAL d'un compte — enseignant ou élève, le même.
 *
 * Aucun paiement en ligne : l'argent est reçu hors plateforme, puis
 * l'administrateur ACTIVE l'offre ici, ou ENVOIE un code. Les demandes sont
 * une file d'attente, jamais une activation. Tout est journalisé côté serveur.
 * Les montants affichés ici sont INFORMATIFS, en dinars algériens, et
 * correspondent à une somme reçue hors de la plateforme.
 *
 * Une offre enseignant PAR SIÈGES demande un nombre d'élèves : le panneau
 * montre l'aperçu (grille de la version courante) et n'envoie que le nombre —
 * le serveur calcule le prix de la version figée et le recopie sur
 * l'abonnement.
 *
 * @param {{role: 'teachers'|'students', userId: number|string, planType: 'teacher'|'student', onChanged?: () => void}} props
 */
export default function CommercialPanel({ role, userId, planType, onChanged }) {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const loader = useCallback((tk) => fetchAccountSubscription(tk, role, userId), [role, userId]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    fetchPlans(token, { type: planType, perPage: 100 }).then((d) => setPlans((d.plans?.data ?? []).filter((p) => ['active', 'hidden'].includes(p.status) && !p.isDefault))).catch(() => setPlans([]));
  }, [token, planType]);

  const [form, setForm] = useState({ planId: '', endsAt: '', note: '', studentSeats: '' });
  const [codeForm, setCodeForm] = useState({ planId: '', accessDays: '', redeemBy: '', studentSeats: '' });
  const [lifecycleSeats, setLifecycleSeats] = useState('');
  const planOf = (id) => plans.find((p) => String(p.id) === String(id)) ?? null;
  const seatLine = (plan, seats) => {
    if (!plan?.seatBased) return null;
    const q = quoteSeats(plan.pricingTiers ?? [], Number(seats));
    if (q) {
      return t('commercial.seatQuote', {
        tier: q.tier.label,
        unit: formatDzd(q.unitPriceCents),
        total: formatDzd(q.totalCents),
      });
    }
    return seats ? t('commercial.noTierCovers') : t('commercial.enterSeats');
  };
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [issued, setIssued] = useState(null);
  const [reject, setReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [lifecycle, setLifecycle] = useState(null);
  const [lifecycleValue, setLifecycleValue] = useState('');

  const refreshAll = () => { reload(); onChanged?.(); };
  const run = async (fn) => {
    setBusy(true);
    setMessage(null);
    try { await fn(); refreshAll(); } catch (err) { setMessage({ tone: 'error', text: err.message }); } finally { setBusy(false); }
  };

  const activate = () => run(async () => {
    await activatePlan(token, role, userId, { planId: Number(form.planId), endsAt: form.endsAt || undefined, note: form.note || undefined, studentSeats: form.studentSeats ? Number(form.studentSeats) : undefined });
    setMessage({ tone: 'ok', text: t('commercial.activated') });
    setForm({ planId: '', endsAt: '', note: '', studentSeats: '' });
  });

  const sendCode = () => run(async () => {
    const result = await issueActivationCode(token, role, userId, { planId: Number(codeForm.planId), accessDays: codeForm.accessDays ? Number(codeForm.accessDays) : undefined, redeemBy: codeForm.redeemBy || undefined, studentSeats: codeForm.studentSeats ? Number(codeForm.studentSeats) : undefined });
    setIssued(result);
    setCodeForm({ planId: '', accessDays: '', redeemBy: '', studentSeats: '' });
  });

  const doReject = () => run(async () => {
    await rejectSubscriptionRequest(token, reject.id, rejectReason.trim());
    setReject(null);
    setRejectReason('');
  });

  const doLifecycle = () => run(async () => {
    const payload = lifecycle.action === 'extend' ? { endsAt: lifecycleValue }
      : lifecycle.action === 'change-plan' ? { planId: Number(lifecycleValue), studentSeats: lifecycleSeats ? Number(lifecycleSeats) : undefined } : { reason: lifecycleValue || undefined };
    await subscriptionAction(token, lifecycle.subscription.id, lifecycle.action, payload);
    setLifecycle(null);
    setLifecycleValue('');
    setLifecycleSeats('');
  });

  if (loading) return <Loading label={t('commercial.loading')} />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  const ent = data.entitlements;
  const pending = data.requests.find((r) => r.status === 'pending');
  const running = data.subscriptions.find((s) => s.running) ?? data.subscriptions.find((s) => s.status === 'suspended') ?? null;
  const sourceLabel = (key) => (SOURCE_KEYS[key] ? t(SOURCE_KEYS[key]) : (key ?? t('common.dash')));

  return (
    <div className="space-y-5" data-commercial-panel>
      {message && <p role={message.tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 font-inter text-xs ${message.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message.text}</p>}

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 font-space text-sm font-bold text-slate-900"><BadgeCheck size={15} /> {t('commercial.currentPlan')}</h2>
          <dl className="grid grid-cols-2 gap-3 font-inter text-sm">
            <Info label={t('teachers.planLabel')}>{ent.plan?.name ?? <span className="text-slate-400">{t('commercial.noPlanConfigured')}</span>}</Info>
            <Info label={t('teachers.versionLabel')}>{ent.plan?.version ? <Num>v{ent.plan.version}</Num> : t('common.dash')}</Info>
            <Info label={t('teachers.sourceLabel')}>{ent.plan?.source === 'subscription' ? t('commercial.sourceSubscription') : t('commercial.sourceDefaultPlan')}</Info>
            <Info label={t('common.status')}><StatusBadge status={ent.plan?.status === 'default' ? 'free' : (ent.plan?.status ?? 'free')} label={ent.plan?.status === 'default' ? t('commercial.defaultPlan') : undefined} /></Info>
            <Info label={t('teachers.startsAt')}>{formatDate(ent.plan?.startedAt)}</Info>
            <Info label={t('teachers.endsAt')}>{formatDate(ent.plan?.endsAt)}</Info>
            {data.capacity && (
              <>
                <Info label={t('commercial.studentCapacity')}>
                  <span data-capacity-meter>
                    {/* Le rapport « 12 / 40 » ne doit jamais se retourner. */}
                    <Num>{data.capacity.current}{'\u00A0/\u00A0'}{data.capacity.limit ?? '∞'}</Num>
                    {data.capacity.remaining != null ? <span className="text-slate-500"> — {t('commercial.seatsRemaining', { count: data.capacity.remaining })}</span> : null}
                    {data.capacity.overLimit ? <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{t('commercial.overLimit')}</span> : null}
                  </span>
                </Info>
                <Info label={t('commercial.purchasedSeats')}>
                  {ent.plan?.studentSeatLimit != null
                    ? (
                      <span>
                        <Num>{ent.plan.studentSeatLimit}</Num>
                        {ent.plan.seatUnitPriceCents != null
                          ? <span className="text-slate-500"> · {t('commercial.seatUnitAndTotal', { unit: formatDzd(ent.plan.seatUnitPriceCents), total: formatDzd(ent.plan.seatTotalCents) })}</span>
                          : null}
                      </span>
                    )
                    : <span className="text-slate-400">{t('commercial.seatsFromPlan')}</span>}
                </Info>
              </>
            )}
          </dl>
          {data.capacity && <p className="mt-2 font-inter text-[11px] text-slate-400">{t('commercial.capacityRule')}</p>}
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4" data-activate-form>
          <h2 className="mb-1 font-space text-sm font-bold text-slate-900">{t('commercial.activatePlanTitle')}</h2>
          <p className="mb-3 font-inter text-xs text-slate-500">{t('commercial.activatePlanHint')}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className={INPUT} aria-label={t('commercial.planToActivate')}>
              <option value="">{t('commercial.choosePlan')}</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}{p.currentVersion ? ` (v${p.currentVersion})` : ''}</option>)}
            </select>
            <input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className={INPUT} aria-label={t('commercial.endsAtOptional')} />
            {planOf(form.planId)?.seatBased && (
              <div className="sm:col-span-2" data-activate-seats>
                <input type="number" min={1} value={form.studentSeats} onChange={(e) => setForm({ ...form, studentSeats: e.target.value })} placeholder={t('commercial.seatsPlaceholder')} className={INPUT} aria-label={t('commercial.studentCount')} />
                <p className="mt-1 font-inter text-[11px] text-slate-500">{seatLine(planOf(form.planId), form.studentSeats)}</p>
              </div>
            )}
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={255} placeholder={t('commercial.notePlaceholder')} className={`${INPUT} sm:col-span-2`} aria-label={t('common.note')} />
          </div>
          <button type="button" onClick={activate} disabled={busy || !form.planId || (planOf(form.planId)?.seatBased && !form.studentSeats)} className={`${BTN_PRIMARY} mt-3`}>{t('commercial.activate')}</button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4" data-issue-code-form>
          <h2 className="mb-1 flex items-center gap-2 font-space text-sm font-bold text-slate-900"><KeyRound size={15} /> {t('commercial.sendCodeTitle')}</h2>
          <p className="mb-3 font-inter text-xs text-slate-500">{t('commercial.sendCodeHint')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={codeForm.planId} onChange={(e) => setCodeForm({ ...codeForm, planId: e.target.value })} className={INPUT} aria-label={t('commercial.codePlan')}>
              <option value="">{t('activation.plan')}</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min={1} max={3650} value={codeForm.accessDays} onChange={(e) => setCodeForm({ ...codeForm, accessDays: e.target.value })} placeholder={t('commercial.durationDays')} className={INPUT} aria-label={t('commercial.durationDays')} />
            <input type="date" value={codeForm.redeemBy} onChange={(e) => setCodeForm({ ...codeForm, redeemBy: e.target.value })} className={INPUT} aria-label={t('commercial.redeemBy')} />
            {planOf(codeForm.planId)?.seatBased && (
              <div className="sm:col-span-3" data-code-seats>
                <input type="number" min={1} value={codeForm.studentSeats} onChange={(e) => setCodeForm({ ...codeForm, studentSeats: e.target.value })} placeholder={t('commercial.codeSeatsPlaceholder')} className={INPUT} aria-label={t('commercial.codeSeats')} />
                <p className="mt-1 font-inter text-[11px] text-slate-500">{seatLine(planOf(codeForm.planId), codeForm.studentSeats)}</p>
              </div>
            )}
          </div>
          <button type="button" onClick={sendCode} disabled={busy || !codeForm.planId || (planOf(codeForm.planId)?.seatBased && !codeForm.studentSeats)} className={`${BTN} mt-3`}>{t('commercial.sendCode')}</button>
          {issued && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3" role="status">
              <p className="font-inter text-xs font-semibold text-amber-900">{t('commercial.codeSentTo', { email: issued.sentTo })}</p>
              <code dir="ltr" className="mt-1 block font-mono-jetbrains text-lg font-bold tracking-widest text-slate-900">{issued.code?.code}</code>
            </div>
          )}
          {data.issuedCodes.length > 0 && (
            <ul className="mt-3 divide-y divide-slate-100 font-inter text-xs">
              {data.issuedCodes.map((c) => (
                <li key={c.batchId} className="flex items-center justify-between gap-2 py-1.5">
                  <span>
                    {c.planName ?? t('common.dash')}
                    {c.studentSeatLimit ? ` · ${t('commercial.seatsCount', { count: c.studentSeatLimit })}` : ''}
                    {' · …'}
                    <code dir="ltr" className="font-mono-jetbrains">{c.hint}</code>
                  </span>
                  <span className="flex items-center gap-2 text-slate-500"><StatusBadge status={c.status} /> {formatDate(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4" data-requests-block>
          <h2 className="mb-3 flex items-center gap-2 font-space text-sm font-bold text-slate-900"><Inbox size={15} /> {t('commercial.requestTitle')}</h2>
          {pending ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="font-inter text-sm font-semibold text-slate-900">
                {pending.planName}
                {pending.requestedStudentSeats ? ` — ${t('commercial.seatsCount', { count: pending.requestedStudentSeats })}` : ''}
              </p>
              {pending.calculatedTotalCents != null && (
                <p className="font-inter text-xs text-slate-700" data-pending-quote>
                  {t('commercial.quoteTierUnit', { tier: pending.seatTierLabel ?? t('common.dash'), unit: formatDzd(pending.unitPriceCents) })}{' · '}
                  <b>{t('commercial.quoteTotal', { total: formatDzd(pending.calculatedTotalCents), currency: pending.currency ?? t('commercial.currencyDzd') })}</b>{' '}
                  {t('commercial.quoteServerComputed')}
                </p>
              )}
              <p className="font-inter text-xs text-slate-600">
                {t('commercial.requestedOn', { date: formatDate(pending.requestedAt) })}
                {pending.userNote ? ` — « ${pending.userNote} »` : ''}
              </p>
              <p className="mt-1 font-inter text-xs text-slate-500">{t('commercial.requestGrantsNothing')}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, planId: String(pending.planId), studentSeats: pending.requestedStudentSeats ? String(pending.requestedStudentSeats) : '' })} className={BTN_PRIMARY}>{t('commercial.activateThisPlan')}</button>
                <button type="button" onClick={() => { setReject(pending); setRejectReason(''); }} className={BTN}>{t('requests.reject')}</button>
              </div>
            </div>
          ) : <p className="font-inter text-xs text-slate-400">{t('teachers.noRequest')}</p>}
          {data.requests.filter((r) => r.status !== 'pending').length > 0 && (
            <ul className="mt-3 divide-y divide-slate-100 font-inter text-xs">
              {data.requests.filter((r) => r.status !== 'pending').slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-1.5">
                  <span>
                    {r.planName}
                    {r.requestedStudentSeats ? ` · ${t('commercial.seatsCount', { count: r.requestedStudentSeats })}` : ''}
                    {r.rejectionReason ? ` — ${r.rejectionReason}` : ''}
                  </span>
                  <span className="flex items-center gap-2 text-slate-500"><StatusBadge status={r.status} /> {formatDate(r.reviewedAt ?? r.requestedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4" data-subscriptions-block>
        <h2 className="mb-3 flex items-center gap-2 font-space text-sm font-bold text-slate-900"><History size={15} /> {t('subscriptions.title')}</h2>
        {data.subscriptions.length === 0 ? <p className="font-inter text-xs text-slate-400">{t('commercial.noSubscription')}</p> : (
          <table className="w-full font-inter text-xs">
            <thead>
              <tr className="text-start text-slate-500">
                <th scope="col" className="py-1 text-start">{t('teachers.planLabel')}</th>
                <th scope="col" className="text-start">{t('nav.students')}</th>
                <th scope="col" className="text-start">{t('common.status')}</th>
                <th scope="col" className="text-start">{t('teachers.startsAt')}</th>
                <th scope="col" className="text-start">{t('teachers.endsAt')}</th>
                <th scope="col" className="text-start">{t('teachers.sourceLabel')}</th>
                <th scope="col" className="text-start">{t('teachers.grantedBy')}</th>
                <th scope="col"><span className="sr-only">{t('common.actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-1.5">{s.planName}{s.planVersion ? <> <Num>v{s.planVersion}</Num></> : ''}</td>
                  <td>
                    {s.studentSeatLimit != null
                      ? (
                        <span title={s.seatTierLabel ? t('commercial.tierNamed', { tier: s.seatTierLabel }) : undefined}>
                          <Num>{s.studentSeatLimit}</Num>
                          {s.seatUnitPriceCents != null ? <span className="text-slate-400"> · {t('commercial.seatUnitShort', { unit: formatDzd(s.seatUnitPriceCents) })}</span> : null}
                        </span>
                      )
                      : t('common.dash')}
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{formatDate(s.startedAt)}</td>
                  <td>{formatDate(s.endsAt)}</td>
                  <td>{sourceLabel(s.acquisitionSource)}</td>
                  <td>{s.grantedBy ?? t('common.dash')}</td>
                  <td className="text-end">
                    {s.manual && (
                      <span className="inline-flex flex-wrap gap-1">
                        {['active', 'trialing'].includes(s.status) && <button type="button" className={BTN} onClick={() => setLifecycle({ subscription: s, action: 'suspend' })}>{t('teachers.suspend')}</button>}
                        {s.status === 'suspended' && <button type="button" className={BTN} onClick={() => setLifecycle({ subscription: s, action: 'resume' })}>{t('teachers.resume')}</button>}
                        {!['cancelled', 'expired'].includes(s.status) && <button type="button" className={BTN} onClick={() => setLifecycle({ subscription: s, action: 'cancel' })}>{t('teachers.cancel')}</button>}
                        <button type="button" className={BTN} onClick={() => { setLifecycle({ subscription: s, action: 'extend' }); setLifecycleValue(''); }}>{t('teachers.extend')}</button>
                        {s.running && <button type="button" className={BTN} onClick={() => { setLifecycle({ subscription: s, action: 'change-plan' }); setLifecycleValue(''); }}>{t('teachers.changePlan')}</button>}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {running && running.status === 'suspended' && <p className="mt-2 font-inter text-xs text-amber-800">{t('commercial.suspendedNotice')}</p>}
      </section>

      <ConfirmDialog
        open={Boolean(reject)}
        onClose={() => setReject(null)}
        onConfirm={doReject}
        busy={busy}
        tone="danger"
        cancelLabel={t('common.cancel')}
        busyLabel={t('common.busy')}
        closeLabel={t('common.close')}
        title={t('commercial.rejectTitle', { plan: reject?.planName ?? '' })}
        confirmLabel={t('requests.reject')}
        message={(
          <div className="space-y-2">
            <p className="font-inter text-xs text-slate-600">{t('commercial.rejectMessage')}</p>
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} maxLength={255} placeholder={t('commercial.reasonRequired')} className={INPUT} aria-label={t('teachers.rejectReason')} />
          </div>
        )}
      />
      <ConfirmDialog
        open={Boolean(lifecycle)}
        onClose={() => setLifecycle(null)}
        onConfirm={doLifecycle}
        busy={busy}
        tone={['cancel', 'suspend'].includes(lifecycle?.action) ? 'danger' : 'default'}
        cancelLabel={t('common.cancel')}
        busyLabel={t('common.busy')}
        closeLabel={t('common.close')}
        title={{
          suspend: t('commercial.lifecycleSuspendTitle'),
          resume: t('commercial.lifecycleResumeTitle'),
          cancel: t('commercial.lifecycleCancelTitle'),
          extend: t('commercial.lifecycleExtendTitle'),
          'change-plan': t('commercial.lifecycleChangePlanTitle'),
        }[lifecycle?.action] ?? ''}
        confirmLabel={t('common.confirm')}
        message={(
          <div className="space-y-2 font-inter text-xs text-slate-600">
            {lifecycle?.action === 'suspend' && <p>{t('commercial.lifecycleSuspendMessage')}</p>}
            {lifecycle?.action === 'cancel' && <p>{t('commercial.lifecycleCancelMessage')}</p>}
            {lifecycle?.action === 'extend' && <input type="date" value={lifecycleValue} onChange={(e) => setLifecycleValue(e.target.value)} className={INPUT} aria-label={t('commercial.newEndDate')} />}
            {lifecycle?.action === 'change-plan' && (
              <>
                <select value={lifecycleValue} onChange={(e) => setLifecycleValue(e.target.value)} className={INPUT} aria-label={t('commercial.newPlan')}>
                  <option value="">{t('commercial.chooseShort')}</option>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {planOf(lifecycleValue)?.seatBased && (
                  <>
                    <input type="number" min={1} value={lifecycleSeats} onChange={(e) => setLifecycleSeats(e.target.value)} placeholder={t('commercial.seatsPlaceholder')} className={INPUT} aria-label={t('commercial.studentCount')} />
                    <p className="text-[11px] text-slate-500">{seatLine(planOf(lifecycleValue), lifecycleSeats)}</p>
                    <p className="text-[11px] text-slate-500">{t('commercial.capacityBelowCovered')}</p>
                  </>
                )}
              </>
            )}
            {['suspend', 'resume', 'cancel'].includes(lifecycle?.action) && <input value={lifecycleValue} onChange={(e) => setLifecycleValue(e.target.value)} maxLength={255} placeholder={t('commercial.reasonOptional')} className={INPUT} aria-label={t('common.reason')} />}
          </div>
        )}
      />
    </div>
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
