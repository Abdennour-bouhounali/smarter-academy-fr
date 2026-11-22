import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, EyeOff, Link2, RefreshCw, Share2, Users } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { createParentLink, fetchMyParentLink, revokeParentLink } from '../../services/familyService';
import { LOCALE } from '../../locale.js';
import QrCode from './QrCode';

const day = (iso) => new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', numberingSystem: 'latn' });

/**
 * « وليّ الأمر » dans le profil de l'élève — le « رابط الوليّ », SANS compte
 * parent (owner, 2026-10-23 ; PARENT_SPACE.md §2) :
 *
 *  - le TEXTE de ce que le وليّ verra (et ne verra jamais), lu avant le bouton :
 *    « أوافق وأنشئ رابط وليّي » est le geste de consentement ;
 *  - le lien : « مشاركة » (feuille de partage du système — aucun lien sortant
 *    dans l'espace élève, jardin clos §7), « نسخ », et le QR à scanner depuis
 *    l'écran avec le téléphone du parent ;
 *  - combien de fois il a été ouvert, s'il est protégé par un code, qui l'a
 *    créé (l'élève ou son enseignant) ; « رابط جديد » et « إلغاء ».
 */
export default function ParentLinkCard() {
  const { t } = useTranslation('family');
  const { token } = useContext(AuthContext);
  const [link, setLink] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(() => {
    fetchMyParentLink(token).then((d) => setLink(d.link)).catch((e) => setError(e.message));
  }, [token]);
  useEffect(load, [load]);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(link.url);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('linkPage.brand'), text: t('parentLink.shareText'), url: link.url });
      } catch { /* annulé par l'élève */ }
    } else {
      copy();
    }
  };

  const btn = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 font-inter text-sm font-semibold';

  return (
    <section className="glass-card mb-5 p-6 sm:p-7" data-parent-link-card>
      <h2 className="flex items-center gap-2 font-space text-lg font-bold text-slate-900">
        <Users size={18} className="text-nav-accent" aria-hidden="true" />
        {t('parentLink.title')}
      </h2>
      <p className="mt-1 font-inter text-sm text-slate-600">{t('parentLink.intro')}</p>

      {error && <p role="alert" className="mt-3 break-all rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {link === null && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 font-inter text-sm font-semibold text-emerald-900">
              <Eye size={15} aria-hidden="true" /> {t('student.seesTitle')}
            </p>
            <ul className="list-disc space-y-1 ps-5 font-inter text-xs leading-relaxed text-emerald-950">
              <li>{t('student.sees1')}</li>
              <li>{t('student.sees2')}</li>
              <li>{t('student.sees3')}</li>
            </ul>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 font-inter text-sm font-semibold text-slate-800">
              <EyeOff size={15} aria-hidden="true" /> {t('student.neverTitle')}
            </p>
            <ul className="list-disc space-y-1 ps-5 font-inter text-xs leading-relaxed text-slate-700">
              <li>{t('student.never1')}</li>
              <li>{t('student.never2')}</li>
            </ul>
          </div>
          <button type="button" disabled={busy} onClick={() => run(() => createParentLink(token))}
            className={`${btn} bg-nav-accent text-white hover:bg-[#3350c4] disabled:opacity-50 sm:col-span-2`} data-parent-link-create>
            <Link2 size={16} aria-hidden="true" /> {t('parentLink.consent')}
          </button>
        </div>
      )}

      {link && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 sm:grid-cols-[auto,1fr] sm:items-center" data-parent-link>
          <div className="mx-auto rounded-xl bg-white p-2">
            <QrCode value={link.url} size={152} label={t('parentLink.qrLabel')} />
          </div>
          <div className="min-w-0 space-y-3">
            <div>
              <p className="font-space font-bold text-indigo-950">{t('parentLink.readyTitle')}</p>
              <p className="font-inter text-sm text-indigo-900">{t('parentLink.readyHint')}</p>
            </div>
            <p dir="ltr" className="select-all truncate rounded-lg bg-white px-3 py-2 text-start font-mono text-xs text-slate-700">{link.url}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={share} className={`${btn} bg-nav-accent text-white hover:bg-[#3350c4]`}>
                <Share2 size={16} aria-hidden="true" /> {t('parentLink.share')}
              </button>
              <button type="button" onClick={copy} className={`${btn} border border-indigo-200 bg-white text-nav-accent hover:bg-nav-accent-soft`}>
                <Copy size={16} aria-hidden="true" /> {copied ? t('parentLink.copied') : t('parentLink.copy')}
              </button>
            </div>
            <ul className="space-y-0.5 font-inter text-xs text-slate-600">
              <li>
                {link.openCount > 0 ? t('parentLink.stats', { count: link.openCount }) : t('parentLink.statsNever')}
                {link.lastOpenedAt && ` — ${t('parentLink.lastOpened', { date: day(link.lastOpenedAt) })}`}
              </li>
              {link.pinSet && <li>{t('parentLink.pinSet')}</li>}
              {link.createdBy === 'teacher' && <li>{t('parentLink.byTeacher')}</li>}
            </ul>
          </div>
          <div className="space-y-2 border-t border-indigo-100 pt-3 sm:col-span-2">
            {!confirming ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <button type="button" disabled={busy} onClick={() => run(() => createParentLink(token))}
                  className="inline-flex min-h-[44px] items-center gap-1.5 font-inter text-xs font-semibold text-nav-accent hover:underline" title={t('parentLink.renewHint')}>
                  <RefreshCw size={13} aria-hidden="true" /> {t('parentLink.renew')}
                </button>
                <button type="button" onClick={() => setConfirming(true)} className="min-h-[44px] font-inter text-xs font-semibold text-red-600 hover:underline">
                  {t('parentLink.revoke')}
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-red-50 p-3" role="alertdialog" aria-label={t('parentLink.revoke')}>
                <p className="font-inter text-xs text-red-800">{t('parentLink.revokeConfirm')}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled={busy} onClick={() => run(() => revokeParentLink(token))}
                    className="rounded-lg bg-red-600 px-3 py-1.5 font-inter text-xs font-semibold text-white">{t('parentLink.revokeYes')}</button>
                  <button type="button" onClick={() => setConfirming(false)} className="rounded-lg px-3 py-1.5 font-inter text-xs text-slate-700">{t('parentLink.cancel')}</button>
                </div>
              </div>
            )}
            <p className="font-inter text-[11px] text-slate-500">{t('parentLink.renewHint')}</p>
          </div>
        </div>
      )}

      <Link to="/espace/profil/wali" className="mt-4 inline-flex items-center gap-1.5 font-inter text-sm font-semibold text-nav-accent hover:underline">
        <Eye size={15} aria-hidden="true" />
        {t('student.seeWhatTheySee')}
      </Link>
    </section>
  );
}
