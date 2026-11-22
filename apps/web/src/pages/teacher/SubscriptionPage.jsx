import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Clock, Info, KeyRound, CheckCircle2, AlertCircle, XCircle, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { fetchPlanCatalog, fetchMySubscription, requestPlan, cancelPlanRequest } from '../../services/teacher/subscriptionService';
import { redeemActivationCode } from '../../services/activationService';
import { deriveSubscriptionState, informationalPrice } from '../../features/teacher/subscription/subscriptionState';
import { quoteSeats, firstRequestableSeats, maxCoveredSeats, formatDzd, tierLabel } from '../../features/teacher/subscription/seatPricing';
import UsageMeter from '../../features/teacher/usage/UsageMeter';
import { TeacherPage, Loading, ErrorBox, btnPrimary, btnSecondary, input, formatDate } from './teacherUi';

/**
 * « عرضي » — l'offre de l'enseignant, PAR SIÈGES.
 *
 * AUCUN paiement en ligne. L'enseignant choisit combien d'élèves il veut
 * encadrer ; la grille (venue du serveur) donne le palier, le prix par élève
 * et le total — un APERÇU, que le serveur recalcule et impose à la demande
 * comme à l'activation. Le nombre de classes n'entre nulle part. La page
 * enregistre une DEMANDE (qui n'active rien) et accepte un code
 * d'activation. Pas de formulaire de carte, pas de bouton « payer », et le
 * test de contrat le garantit.
 */
function formatCodeInput(raw) {
  const symbols = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return symbols.match(/.{1,4}/g)?.join('-') ?? '';
}

export default function SubscriptionPage() {
  const { t } = useTranslation('teacher');
  const { t: ta } = useTranslation('access');
  useDocumentMeta(t('subscription.metaTitle'));
  const { token } = useContext(AuthContext);
  const { refresh: refreshAvailability } = useContentAvailability();

  const loader = useCallback(async (tk) => {
    const [mine, catalog] = await Promise.all([fetchMySubscription(tk), fetchPlanCatalog(tk)]);
    return { ...mine, plans: catalog.plans, freeSeats: catalog.freeSeats };
  }, []);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const [requesting, setRequesting] = useState(null);
  const [note, setNote] = useState('');
  const [requestError, setRequestError] = useState(null);
  const [seatsByPlan, setSeatsByPlan] = useState({});
  const [code, setCode] = useState('');
  const [codePending, setCodePending] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  const state = data ? deriveSubscriptionState(data) : null;
  const ent = data?.entitlements;
  const pendingDetail = useMemo(() => (state?.pending ? (data?.requests ?? []).find((r) => r.id === state.pending.id) ?? null : null), [data, state]);

  const submitRequest = async (plan, seats) => {
    setRequesting(plan.id);
    setRequestError(null);
    try {
      await requestPlan(token, plan.id, note.trim(), plan.seatBased ? seats : undefined);
      setNote('');
      await reload();
    } catch (err) {
      const reason = err?.reason;
      setRequestError(reason ? t(`subscription.seats.errors.${reason}`, { defaultValue: t('subscription.seats.errors.generic') }) : (err.message || t('subscription.seats.errors.generic')));
    } finally {
      setRequesting(null);
    }
  };

  const withdraw = async (requestId) => {
    setRequestError(null);
    try { await cancelPlanRequest(token, requestId); await reload(); } catch (err) { setRequestError(err.message); }
  };

  const redeem = async (event) => {
    event.preventDefault();
    if (codePending) return;
    setCodeError(null);
    setCodeSuccess(false);
    setCodePending(true);
    try {
      await redeemActivationCode(token, code);
      setCode('');
      setCodeSuccess(true);
      await Promise.all([reload(), refreshAvailability().catch(() => {})]);
    } catch (err) {
      const reason = err?.reason;
      setCodeError(err?.type === 'RATE_LIMITED' ? ta('errorRateLimited')
        : reason === 'invalid' ? ta('errorInvalid') : reason === 'already_activated' ? ta('errorAlreadyActivated')
          : reason === 'expired' ? ta('errorExpired') : reason === 'revoked' ? ta('errorRevoked')
            : reason === 'plan_mismatch' ? ta('errorPlanMismatch') : ta('errorGeneric'));
    } finally {
      setCodePending(false);
    }
  };

  const statusKey = state?.base === 'active' ? (ent?.plan?.status ?? 'active') : state?.base === 'suspended' ? 'suspended' : 'default';

  return (
    <TeacherPage eyebrow={t('space')} title={t('subscription.title')} subtitle={t('subscription.subtitle')}>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && state && (
        <div className="space-y-6" data-subscription-page>
          {/* ── L'offre effective ─────────────────────────────────── */}
          <section className="rounded-2xl border border-nav-line bg-white p-5 sm:p-6" data-current-plan>
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${state.base === 'active' ? 'bg-nav-page text-nav-accent' : 'bg-slate-100 text-slate-500'}`}><BadgeCheck className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-inter text-xs text-slate-500">{t('subscription.currentTitle')}</p>
                <p className="font-space font-bold text-slate-900 text-lg">{ent.plan?.name ?? t('subscription.status.default')}</p>
                <p className="text-sm text-slate-600">{t(`subscription.status.${statusKey}`, { defaultValue: t('subscription.status.default') })}{state.base === 'free' ? ` — ${t('subscription.freeCurrent')}` : ''}</p>
                {ent.plan?.studentSeatLimit != null && state.base === 'active' && (
                  <p className="text-sm text-slate-700 mt-0.5 flex items-center gap-1" data-purchased-seats>
                    <Users size={13} /> {t('subscription.purchased', { count: ent.plan.studentSeatLimit })}
                    {ent.plan.seatTotalCents != null && <span className="text-slate-500"> · {t('subscription.purchasedPrice', { unit: formatDzd(ent.plan.seatUnitPriceCents), total: formatDzd(ent.plan.seatTotalCents) })}</span>}
                  </p>
                )}
                {ent.plan?.endsAt && state.base === 'active' && <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1"><Clock size={13} /> {t('subscription.until', { date: formatDate(ent.plan.endsAt) })}</p>}
                {!ent.plan?.endsAt && state.base === 'active' && <p className="text-sm text-slate-500 mt-0.5">{t('subscription.unlimited')}</p>}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <UsageMeter label={t('subscription.limitLabels.students')} meter={ent.students} hint={t('subscription.seats.classesUnlimited')} />
              <UsageMeter label={t('subscription.limitLabels.classes')} meter={ent.classes} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {Object.entries(ent.features ?? {}).map(([key, on]) => (
                <li key={key} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${on ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400 line-through'}`}>{t(`subscription.featureLabels.${key}`, { defaultValue: key })}</li>
              ))}
            </ul>
          </section>

          {/* ── Demande en attente / refus ─────────────────────────── */}
          {state.pending && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 flex items-start gap-3" role="status" data-pending-request>
              <Clock className="w-5 h-5 text-nav-accent shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-blue-900">{t('subscription.pendingTitle')}</p>
                <p className="text-sm text-blue-900/80 mt-0.5">
                  {pendingDetail?.requestedStudentSeats
                    ? t('subscription.pendingSeatsBody', { count: pendingDetail.requestedStudentSeats, amount: formatDzd(pendingDetail.calculatedTotalCents), date: formatDate(state.pending.requestedAt) })
                    : t('subscription.pendingBody', { plan: state.pending.planName, date: formatDate(state.pending.requestedAt) })}
                </p>
              </div>
              <button type="button" onClick={() => withdraw(state.pending.id)} className="text-xs font-semibold text-nav-accent hover:underline">{t('subscription.cancelRequest')}</button>
            </section>
          )}
          {state.rejected && (
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-3" data-rejected-request>
              <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div><p className="font-semibold text-slate-800">{t('subscription.rejectedTitle')}</p>{state.rejected.rejectionReason && <p className="text-sm text-slate-600">{t('subscription.rejectedReason', { reason: state.rejected.rejectionReason })}</p>}</div>
            </section>
          )}
          {requestError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{requestError}</p>}

          {/* ── Les offres ─────────────────────────────────────────── */}
          <section>
            <h2 className="font-space font-bold text-slate-900 mb-3">{t('subscription.plansTitle')}</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 flex items-start gap-3" data-tour="plan.howto">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{t('subscription.howToTitle')}</p>
                <ol className="mt-1 list-decimal ps-5 space-y-0.5 text-sm text-slate-600">
                  {t('subscription.howToSteps', { returnObjects: true }).map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            </div>
            {data.plans.length === 0 ? <p className="text-sm text-slate-500">{t('subscription.noPlans')}</p> : (
              <div className="space-y-4">
                {data.plans.filter((p) => p.seatBased).map((plan) => (
                  <SeatPlanCard
                    key={plan.id}
                    plan={plan}
                    freeSeats={data.freeSeats}
                    currentStudents={ent.students?.current ?? 0}
                    seats={seatsByPlan[plan.id]}
                    onSeats={(value) => setSeatsByPlan((m) => ({ ...m, [plan.id]: value }))}
                    canRequest={state.canRequest && plan.allowsRequests}
                    requesting={requesting === plan.id}
                    onRequest={(seats) => submitRequest(plan, seats)}
                    t={t}
                  />
                ))}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.plans.filter((p) => !p.seatBased).map((plan) => {
                    const price = informationalPrice(plan.price);
                    return (
                      <article key={plan.id} className={`rounded-2xl border border-nav-line bg-white p-5 flex flex-col gap-3 ${plan.isCurrent ? 'ring-2 ring-nav-accent' : ''}`} data-plan-card={plan.slug}>
                        <div>
                          <h3 className="font-space font-bold text-slate-900 text-lg">{plan.name}</h3>
                          {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
                        </div>
                        <p className="font-space font-black text-2xl text-slate-900" dir="ltr">
                          {price ? <>{price.amount.toLocaleString('fr-DZ')} <span className="text-sm font-bold text-slate-500">{ta('planInformationalPrice')}</span></> : ta('planFreeBadge')}
                        </p>
                        {price && <p className="text-[11px] text-slate-400 -mt-2">{ta('planPriceHint')}</p>}
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li><span dir="ltr">{plan.entitlements['students_total.max'] ?? '∞'}</span> {t('subscription.limitLabels.students')}</li>
                          <li>{t('subscription.seats.classesUnlimited')}</li>
                          {plan.entitlements['students.covered'] && <li className="text-nav-accent font-semibold">{t('subscription.featureLabels.students.covered')}</li>}
                        </ul>
                        <div className="mt-auto pt-2">
                          {plan.isCurrent ? <span className="text-xs font-semibold text-nav-accent">{t('subscription.isCurrent')}</span>
                            : plan.allowsRequests && state.canRequest ? (
                              <button type="button" onClick={() => submitRequest(plan)} disabled={requesting !== null} className={btnPrimary} data-request-plan={plan.slug}>
                                {requesting === plan.id ? t('subscription.requesting') : t('subscription.request')}
                              </button>
                            ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
            {state.canRequest && data.plans.some((p) => p.allowsRequests && !p.isCurrent) && (
              <label className="block mt-3 max-w-xl">
                <span className="mb-1 block text-xs font-semibold text-slate-600">{t('subscription.requestNote')}</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={input} />
              </label>
            )}
          </section>

          {/* ── Le code d'activation ───────────────────────────────── */}
          <section className="rounded-2xl border border-nav-line bg-white p-5 sm:p-6" data-activation-code>
            <h2 className="font-space font-bold text-slate-900 flex items-center gap-2"><KeyRound size={16} /> {t('subscription.codeTitle')}</h2>
            <p className="text-sm text-slate-600 mt-1 mb-3">{t('subscription.codeBody')}</p>
            <form onSubmit={redeem} noValidate className="flex flex-col sm:flex-row gap-2">
              <input dir="ltr" value={code} onChange={(e) => setCode(formatCodeInput(e.target.value))} placeholder={ta('codePlaceholder')} aria-label={ta('codeLabel')} autoComplete="off" spellCheck={false} className={`${input} font-mono tracking-[0.2em] text-center`} />
              <button type="submit" disabled={codePending} className={btnSecondary}>{codePending ? ta('submitLoading') : ta('submit')}</button>
            </form>
            {codeError && <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-rose-700"><AlertCircle size={14} /> {codeError}</p>}
            {codeSuccess && <p role="status" className="mt-2 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 size={14} /> {t('subscription.codeSuccess')}</p>}
          </section>

          {/* ── Historique ─────────────────────────────────────────── */}
          {data.subscriptions.length > 0 && (
            <section className="rounded-2xl border border-nav-line bg-white p-5">
              <h2 className="font-space font-bold text-slate-900 mb-2">{t('subscription.historyTitle')}</h2>
              <ul className="divide-y divide-slate-100 text-sm">
                {data.subscriptions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="font-semibold text-slate-800">
                      {s.planName}{s.planVersion ? <span className="text-slate-400 font-normal"> · v{s.planVersion}</span> : ''}
                      {s.studentSeatLimit != null && <span className="text-slate-500 font-normal"> · {t('subscription.purchased', { count: s.studentSeatLimit })}</span>}
                    </span>
                    <span className="text-xs text-slate-500">{t(`subscription.status.${s.status}`, { defaultValue: s.status })} · {t(`subscription.source.${s.acquisitionSource}`, { defaultValue: '' })} · {formatDate(s.startedAt)} → {s.endsAt ? formatDate(s.endsAt) : t('subscription.unlimited')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </TeacherPage>
  );
}

/**
 * Le SÉLECTEUR de sièges d'une offre par élève : un nombre, et l'aperçu
 * (palier, prix unitaire, total) recalculé à chaque frappe depuis la grille
 * du serveur. Le passage 20 → 21 change de palier sous les yeux.
 */
function SeatPlanCard({ plan, freeSeats, currentStudents, seats, onSeats, canRequest, requesting, onRequest, t }) {
  const tiers = plan.pricingTiers ?? [];
  const floor = Math.max(firstRequestableSeats(tiers, freeSeats), currentStudents || 1);
  const ceiling = maxCoveredSeats(tiers);
  const value = seats === undefined || seats === '' ? floor : seats;
  const n = Number(value);
  const quote = quoteSeats(tiers, n);
  const belowUsage = Number.isInteger(n) && currentStudents > 0 && n < currentStudents;
  const coveredByFree = Number.isInteger(freeSeats) && Number.isInteger(n) && n <= freeSeats;
  const requestable = canRequest && quote && !quote.free && !belowUsage && !coveredByFree;

  return (
    <article className={`rounded-2xl border border-nav-line bg-white p-5 sm:p-6 ${plan.isCurrent ? 'ring-2 ring-nav-accent' : ''}`} data-seat-plan={plan.slug}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-space font-bold text-slate-900 text-lg">{plan.name}</h3>
          {plan.description && <p className="text-sm text-slate-500 mt-1">{plan.description}</p>}
          <p className="mt-2 text-sm text-slate-700">{t('subscription.seats.classesUnlimited')}</p>
          {Number.isInteger(freeSeats) && <p className="text-sm text-slate-500">{t('subscription.seats.freeHint', { count: freeSeats })}</p>}

          <label className="block mt-4">
            <span className="mb-1 block font-space font-bold text-slate-900">{t('subscription.seats.title')}</span>
            <input
              type="number"
              inputMode="numeric"
              dir="ltr"
              min={floor}
              max={ceiling ?? undefined}
              value={value}
              onChange={(e) => onSeats(e.target.value)}
              aria-label={t('subscription.seats.inputLabel')}
              className={`${input} max-w-[10rem] text-center font-mono-jetbrains text-lg`}
              data-seat-input
            />
          </label>
          {belowUsage && <p className="mt-1 text-xs text-amber-800">{t('subscription.seats.currentUsage', { count: currentStudents })}</p>}
          {!quote && Number.isInteger(n) && n >= 1 && <p className="mt-1 text-xs text-rose-700">{t('subscription.seats.outOfRange')}</p>}

          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-700">{t('subscription.seats.tiersTitle')}</summary>
            <ul className="mt-2 space-y-1">
              {tiers.map((tier) => (
                <li key={tier.id ?? tierLabel(tier)} className={`flex items-center justify-between gap-3 ${quote?.tier === tier ? 'font-bold text-nav-accent' : ''}`}>
                  <span>{tier.maxStudents == null ? t('subscription.seats.tierRowOpen', { min: tier.minStudents }) : t('subscription.seats.tierRow', { min: tier.minStudents, max: tier.maxStudents })}</span>
                  <span dir="ltr">{tier.pricePerStudentCents ? t('subscription.seats.perStudent', { amount: formatDzd(tier.pricePerStudentCents) }) : t('subscription.seats.free')}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-seat-quote aria-live="polite">
          {quote ? (
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3"><dt className="text-slate-500">{t('subscription.seats.tier')}</dt><dd className="font-semibold text-slate-800" dir="ltr">{quote.free ? t('subscription.seats.free') : t('subscription.seats.perStudent', { amount: formatDzd(quote.unitPriceCents) })}</dd></div>
              <div className="flex items-baseline justify-between gap-3"><dt className="text-slate-500">{t('subscription.seats.tierRange', { range: '' }).trim()}</dt><dd dir="ltr" className="text-slate-700">{tierLabel(quote.tier)}</dd></div>
              <div className="flex items-baseline justify-between gap-3"><dt className="text-slate-500">{t('subscription.seats.count')}</dt><dd dir="ltr" className="text-slate-700">{quote.seats}</dd></div>
              <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2"><dt className="font-semibold text-slate-800">{t('subscription.seats.total')}</dt><dd dir="ltr" className="font-space font-black text-2xl text-slate-900" data-seat-total>{quote.free ? t('subscription.seats.free') : t('subscription.seats.amount', { amount: formatDzd(quote.totalCents) })}</dd></div>
            </dl>
          ) : <p className="text-sm text-slate-500">{t('subscription.seats.outOfRange')}</p>}
          {quote && !quote.free && (
            <p className="mt-3 text-xs text-slate-600">
              <span className="font-semibold">{t('subscription.seats.amountDue')}</span> <span dir="ltr">{t('subscription.seats.amount', { amount: formatDzd(quote.totalCents) })}</span>
              <br />{t('subscription.seats.paymentNote')}
            </p>
          )}
          <div className="mt-3">
            {plan.isCurrent && !requestable ? <span className="text-xs font-semibold text-nav-accent">{t('subscription.isCurrent')}</span> : null}
            {requestable && (
              <button type="button" onClick={() => onRequest(n)} disabled={requesting} className={`${btnPrimary} w-full`} data-request-plan={plan.slug}>
                {requesting ? t('subscription.requesting') : t('subscription.seats.request')}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
