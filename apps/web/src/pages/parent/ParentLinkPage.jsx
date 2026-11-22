import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookmarkCheck, Lock, ShieldCheck, ShieldOff } from 'lucide-react';
import { ChevronForward } from '../../components/common/DirectionalIcons';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchLinkProgress, fetchLinkReport, openParentLink, setLinkPin, unlockLink } from '../../services/familyService';
import WeekReport from '../../features/family/WeekReport';
import WeekNav from '../../features/family/WeekNav';
import ProgressDetail from '../../features/family/ProgressDetail';
import ReportTabs, { tabFrom } from '../../features/family/ReportTabs';
import { gradeName } from '../../features/family/gradeName';

/** Le laissez-passer du code, gardé dans CE navigateur (par lien). Le stockage peut manquer : rien ne casse. */
const passKey = (token) => `sa.parent-pass.${token.slice(0, 12)}`;
const readPass = (token) => { try { return localStorage.getItem(passKey(token)); } catch { return null; } };
const writePass = (token, pass) => { try { localStorage.setItem(passKey(token), pass); } catch { /* navigation privée */ } };

function PinForm({ onSubmit, submitLabel, busy, error }) {
  const { t } = useTranslation('family');
  const [pin, setPin] = useState('');
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => { e.preventDefault(); if (/^\d{4}$/.test(pin)) onSubmit(pin); }}
    >
      <label htmlFor="parent-pin" className="block font-inter text-sm font-semibold text-slate-700">{t('linkPage.pinLabel')}</label>
      <input
        id="parent-pin"
        dir="ltr"
        inputMode="numeric"
        autoComplete="off"
        pattern="\d{4}"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-3xl tracking-[0.5em] text-slate-900 focus:border-nav-accent focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button type="submit" disabled={busy || pin.length !== 4}
        className="min-h-[48px] w-full rounded-xl bg-nav-accent px-4 font-space font-bold text-white hover:bg-[#3350c4] disabled:opacity-50">
        {submitLabel}
      </button>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 font-inter text-sm text-red-700">{error}</p>}
    </form>
  );
}

/**
 * « lien parent » — /p/:token, la page du PARENT, SANS compte
 * (docs/architecture/PARENT_SPACE.md §2). Ouverte depuis WhatsApp ou en
 * scannant la « carte parent » : TÉLÉPHONE D'ABORD.
 *
 * Elle montre le même rapport que l'élève lit dans « Ce que voit ton parent » (semaine
 * + « La progression en détail »). Si le parent a posé un code, elle le demande ; sinon
 * elle lui propose d'en poser un. Lien annulé → 410, lien faux → 404 : une
 * phrase qui dit quoi faire, jamais une erreur brute.
 */
export default function ParentLinkPage() {
  const { t } = useTranslation('family');
  useDocumentMeta(t('meta.linkPage'));
  const { token } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = tabFrom(searchParams);
  const [pass, setPass] = useState(() => readPass(token));
  const [state, setState] = useState({ status: 'loading' });
  const [weeksBack, setWeeksBack] = useState(0);
  const [week, setWeek] = useState(null);
  const [progress, setProgress] = useState(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState(null);
  const [protectedNow, setProtectedNow] = useState(false);

  const fail = useCallback((e) => {
    if (e.status === 404) setState({ status: 'invalid' });
    else if (e.status === 410) setState({ status: 'revoked' });
    else if (e.status === 401) setState((s) => ({ ...s, status: 'locked' }));
    else setState({ status: 'error', message: e.message });
  }, []);

  useEffect(() => {
    let alive = true;
    openParentLink(token, pass)
      .then((d) => alive && setState({ status: d.unlocked ? 'open' : 'locked', child: d.child, pinSet: d.pinSet }))
      .catch((e) => alive && fail(e));
    return () => { alive = false; };
  }, [token, pass, fail]);

  useEffect(() => {
    if (state.status !== 'open') return undefined;
    let alive = true;
    const request = tab === 'progress'
      ? fetchLinkProgress(token, pass).then((d) => alive && setProgress(d.progress))
      : fetchLinkReport(token, pass, weeksBack).then((d) => alive && setWeek(d.report));
    request.catch((e) => alive && fail(e));
    return () => { alive = false; };
  }, [state.status, tab, weeksBack, token, pass, fail]);

  const withPin = (action, onDone) => async (pin) => {
    setPinBusy(true);
    setPinError(null);
    try {
      const { pass: fresh } = await action(token, pin);
      writePass(token, fresh);
      setPass(fresh);
      onDone?.();
    } catch (e) {
      setPinError(t(`linkPage.errors.${e.reason}`, { defaultValue: t('linkPage.errors.generic') }));
    } finally {
      setPinBusy(false);
    }
  };

  const child = state.child;
  const name = child ? [child.firstName, child.lastName].filter(Boolean).join(' ') : '';
  const loading = <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:px-6">
          <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-8 w-8" />
          <span className="font-space text-sm font-bold text-nav-accent">{t('linkPage.brand')}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        {state.status === 'loading' && <p className="font-inter text-sm text-slate-500">{t('linkPage.loading')}</p>}

        {(state.status === 'invalid' || state.status === 'revoked') && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center" role="status" data-link-closed={state.status}>
            <ShieldOff size={32} className="mx-auto text-slate-400" aria-hidden="true" />
            <h1 className="mt-3 font-space text-lg font-bold text-slate-900">{t(`linkPage.${state.status}Title`)}</h1>
            <p className="mt-2 font-inter text-sm leading-relaxed text-slate-600">{t(`linkPage.${state.status}Text`)}</p>
          </section>
        )}

        {state.status === 'error' && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.message}</p>}

        {state.status === 'locked' && (
          <section className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6" data-link-locked>
            <Lock size={28} className="mx-auto text-nav-accent" aria-hidden="true" />
            <h1 className="mt-3 text-center font-space text-lg font-bold text-slate-900">{t('linkPage.pinTitle')}</h1>
            <p className="mb-4 mt-1 text-center font-inter text-sm text-slate-600">{t('linkPage.pinText')}</p>
            <PinForm onSubmit={withPin(unlockLink)} submitLabel={t('linkPage.pinSubmit')} busy={pinBusy} error={pinError} />
            <p className="mt-4 text-center font-inter text-xs text-slate-500">{t('linkPage.pinForgot')}</p>
          </section>
        )}

        {state.status === 'open' && (
          <>
            <header className="space-y-4">
              <div>
                <h1 className="font-space text-xl font-bold text-slate-900 sm:text-2xl">{name}</h1>
                {child?.grade && <p className="font-inter text-sm text-slate-500">{gradeName(child.grade)}</p>}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ReportTabs tab={tab} onChange={(next) => setSearchParams(next === 'week' ? {} : { tab: next }, { replace: true })} />
                {tab === 'week' && <WeekNav weeksBack={weeksBack} onChange={setWeeksBack} report={week} />}
              </div>
            </header>

            {tab === 'week' && (week ? <WeekReport report={week} audience="parent" /> : loading)}
            {tab === 'progress' && (progress ? <ProgressDetail progress={progress} audience="parent" /> : loading)}

            {!state.pinSet && !protectedNow && (
              <section className="rounded-2xl border border-indigo-200 bg-white p-4 sm:p-5" data-link-protect>
                <h2 className="flex items-center gap-2 font-space text-base font-bold text-slate-900">
                  <ShieldCheck size={18} className="text-nav-accent" aria-hidden="true" />
                  {t('linkPage.protectTitle')}
                </h2>
                <p className="mb-3 mt-1 font-inter text-sm text-slate-600">{t('linkPage.protectText')}</p>
                <div className="max-w-xs">
                  <PinForm onSubmit={withPin(setLinkPin, () => setProtectedNow(true))} submitLabel={t('linkPage.protectSubmit')} busy={pinBusy} error={pinError} />
                </div>
              </section>
            )}
            {protectedNow && <p role="status" className="rounded-xl bg-emerald-50 p-4 font-inter text-sm text-emerald-800">{t('linkPage.protectDone')}</p>}

            <section className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
              <BookmarkCheck size={20} className="mt-0.5 flex-shrink-0 text-slate-600" aria-hidden="true" />
              <div>
                <p className="font-space text-sm font-bold text-slate-900">{t('linkPage.keepTitle')}</p>
                <p className="font-inter text-sm text-slate-600">{t('linkPage.keepText')}</p>
              </div>
            </section>

            <Link to="/protection" className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-indigo-200 bg-nav-accent-soft p-4 hover:bg-indigo-100">
              <ShieldCheck size={24} className="flex-shrink-0 text-nav-accent" aria-hidden="true" />
              <span className="flex-1 font-space font-bold text-indigo-950">{t('linkPage.guide')}</span>
              <ChevronForward size={18} className="text-nav-accent" aria-hidden="true" />
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
