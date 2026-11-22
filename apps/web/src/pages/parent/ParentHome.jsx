import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link2, ShieldCheck, UserPlus } from 'lucide-react';
import { ChevronForward } from '../../components/common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchChildren, linkChild } from '../../services/familyService';
import { formatDuration } from '../../features/family/format';
import { LOCALE } from '../../locale.js';
import { gradeName } from '../../features/family/gradeName';

function ChildCard({ child, t }) {
  const name = [child.firstName, child.lastName].filter(Boolean).join(' ');
  return (
    <Link
      to={`/parent/enfants/${child.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm sm:p-5"
      data-child-card
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nav-accent font-space text-sm font-bold text-white">
          {(child.firstName || '?').charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-space font-bold text-slate-900">{name}</p>
          <p className="font-inter text-xs text-slate-500">{gradeName(child.grade)}</p>
        </div>
        <ChevronForward size={18} className="text-slate-400 group-hover:text-nav-accent" aria-hidden="true" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="font-inter text-xs text-slate-500">{t('home.today')}</p>
          <p className="font-space text-lg font-bold text-slate-900">{formatDuration(t, child.todayStudySeconds)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="font-inter text-xs text-slate-500">{t('home.thisWeek')}</p>
          <p className="font-space text-lg font-bold text-slate-900">{formatDuration(t, child.weekStudySeconds)}</p>
        </div>
      </div>
      <p className="mt-3 font-inter text-xs text-slate-500">
        {t('home.lastSeen')}{'\u00A0: '}{child.lastSeenAt ? new Date(child.lastSeenAt).toLocaleString(LOCALE, { dateStyle: 'medium', timeStyle: 'short', numberingSystem: 'latn' }) : t('home.never')}
      </p>
    </Link>
  );
}

/**
 * « Mes enfants » — l'accueil de l’espace parent (PARENT_SPACE.md §4) : les enfants liés
 * (temps d'étude réel aujourd'hui et cette semaine), la saisie d'un code de
 * liaison, et l'accès au guide « Protéger l’appareil ».
 */
export default function ParentHome() {
  const { t } = useTranslation('family');
  useDocumentMeta(t('meta.parentHome'));
  const { token } = useContext(AuthContext);
  const [children, setChildren] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(() => {
    fetchChildren(token)
      .then((d) => setChildren(d.children))
      .catch((e) => setLoadError(e.message));
  }, [token]);

  useEffect(load, [load]);

  const submit = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const data = await linkChild(token, code);
      setMessage({ ok: true, text: t('link.success', { name: data.child.firstName }) });
      setCode('');
      load();
    } catch (e) {
      setMessage({ ok: false, text: t(`errors.${e.reason}`, { defaultValue: e.reason ? t('errors.generic') : e.message }) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-space text-xl font-bold text-slate-900 sm:text-2xl">{t('home.title')}</h1>
        <p className="mt-1 max-w-2xl font-inter text-sm text-slate-600">{t('home.subtitle')}</p>
      </header>

      {loadError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}

      {children && children.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((c) => <ChildCard key={c.id} child={c} t={t} />)}
        </div>
      )}

      {children && children.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <UserPlus size={28} className="mx-auto text-indigo-500" aria-hidden="true" />
          <p className="mt-2 font-space font-bold text-slate-900">{t('home.emptyTitle')}</p>
          <p className="mt-1 font-inter text-sm text-slate-600">{t('home.emptyText')}</p>
        </div>
      )}

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:grid-cols-2">
        <div>
          <h2 className="flex items-center gap-2 font-space text-lg font-bold text-slate-900">
            <Link2 size={20} className="text-nav-accent" aria-hidden="true" />
            {t('link.title')}
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label htmlFor="parent-link-code" className="block font-inter text-sm font-semibold text-slate-700">{t('link.label')}</label>
            <input
              id="parent-link-code"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('link.placeholder')}
              maxLength={12}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-xl tracking-widest text-slate-900 focus:border-nav-accent focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="w-full rounded-xl bg-nav-accent px-4 py-3 font-space font-bold text-white hover:bg-[#3350c4] disabled:opacity-50"
            >
              {t('link.submit')}
            </button>
            {message && (
              <p role={message.ok ? 'status' : 'alert'} className={`rounded-xl p-3 font-inter text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
          <h3 className="font-space font-bold text-slate-900">{t('link.howTitle')}</h3>
          <ol className="mt-3 list-decimal space-y-2 ps-5 font-inter text-sm leading-relaxed text-slate-700">
            <li>{t('link.step1')}</li>
            <li>{t('link.step2')}</li>
            <li>{t('link.step3')}</li>
          </ol>
        </div>
      </section>

      <Link to="/parent/protection" className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-nav-accent-soft p-4 hover:bg-indigo-100 sm:gap-4 sm:p-5">
        <ShieldCheck size={28} className="flex-shrink-0 text-nav-accent" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-space font-bold text-indigo-950">{t('guide.title')}</p>
          <p className="font-inter text-sm text-indigo-900">{t('report.howLimit')}</p>
        </div>
        <ChevronForward size={20} className="text-nav-accent" aria-hidden="true" />
      </Link>
    </div>
  );
}
