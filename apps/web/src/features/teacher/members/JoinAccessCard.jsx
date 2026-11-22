import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, RefreshCw, Link2, KeyRound, Lock } from 'lucide-react';
import { btnPrimary, btnSecondary } from '../../../pages/teacher/teacherUi';
import { joinLinkUrl } from '../../classJoin/pendingClassJoin';

/**
 * Comment un élève entre dans la classe — en haut de la page de la classe.
 *
 *   1. le LIEN (lien de la classe)  — la voie recommandée : envoyé par la messagerie de l'ENT ou par e-mail,
 *      il ouvre /rejoindre/classe/{jeton} et l'élève rejoint sans rien taper
 *   2. le CODE (code de la classe) — le repli manuel : écrit au tableau, saisi
 *      dans « Ma classe »
 *
 * Les deux mènent à la MÊME adhésion côté serveur, et un seul interrupteur
 * (`joinCodeEnabled`, « Autoriser les inscriptions », dans les paramètres) les ferme ensemble.
 *
 * L'URL est composée sur l'origine où se trouve l'enseignant : c'est celle
 * que ses élèves ouvriront. Le champ est en lecture seule et `dir="ltr"` : une
 * URL longue défile dans son champ au lieu d'élargir la page, sur un écran
 * comme sur un téléphone.
 *
 * Extension prévue (Planned) : un QR code du lien. `JoinLinkBlock` reçoit
 * déjà l'URL complète ; un QR s'y ajoute à côté du champ sans toucher au reste.
 */
export default function JoinAccessCard({ classGroup, onRotateLink, onRotateCode }) {
  const { t } = useTranslation('teacher');
  const active = classGroup.status === 'active';
  const open = active && classGroup.joinCodeEnabled;
  const url = classGroup.joinLinkToken ? joinLinkUrl(window.location.origin, classGroup.joinLinkToken) : '';

  return (
    <section className="rounded-2xl border border-nav-line bg-white p-4 sm:p-5 space-y-4" data-join-access aria-label={t('classes.joinAccessLabel')}>
      {!open && (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" data-join-closed>
          <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {active ? t('classes.joiningClosed') : t('classes.joiningClosedInactive')}
        </p>
      )}

      <JoinLinkBlock url={url} open={open} onRotate={active ? onRotateLink : null} />

      <div className="border-t border-slate-100" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-3" data-join-code-card>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-inter text-xs font-semibold text-slate-500"><KeyRound size={13} aria-hidden="true" /> {t('classes.joinCode')}</p>
          <p dir="ltr" className="font-mono-jetbrains text-2xl font-black tracking-[0.35em] text-nav-accent text-start" data-join-code>{classGroup.joinCodeEnabled ? classGroup.joinCode : '······'}</p>
          <p className="text-[11px] text-slate-400">{classGroup.joinCodeEnabled ? t('classes.joinCodeHint') : t('classes.joinCodeDisabled')}</p>
        </div>
        <div className="ms-auto flex flex-wrap gap-2">
          <CopyButton value={classGroup.joinCode} label={t('classes.copyCode')} copiedLabel={t('classes.codeCopied')} className={btnSecondary} disabled={!classGroup.joinCodeEnabled} dataAttr="data-copy-code" />
          {onRotateCode && active && <button type="button" onClick={onRotateCode} className={btnSecondary}><RefreshCw size={14} aria-hidden="true" /> {t('classes.rotateJoinCode')}</button>}
        </div>
      </div>
    </section>
  );
}

function JoinLinkBlock({ url, open, onRotate }) {
  const { t } = useTranslation('teacher');
  const inputRef = useRef(null);

  return (
    <div className="space-y-2" data-join-link-block>
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-center gap-1.5 font-inter text-sm font-bold text-slate-900"><Link2 size={15} className="text-nav-accent" aria-hidden="true" /> {t('classes.joinLink')}</p>
        <span className="rounded-full bg-nav-page px-2 py-0.5 text-[11px] font-semibold text-nav-accent">{t('classes.joinLinkRecommended')}</span>
      </div>
      <p className="text-xs text-slate-500">{t('classes.joinLinkHint')}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="text"
          readOnly
          dir="ltr"
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label={t('classes.joinLink')}
          data-join-link
          className={`min-w-0 w-full flex-1 truncate rounded-xl border px-3 py-2.5 font-mono-jetbrains text-[13px] focus:border-nav-accent focus:outline-none focus:ring-1 focus:ring-nav-accent ${open ? 'border-slate-300 bg-white text-slate-800' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
        />
        <div className="flex gap-2">
          <CopyButton value={url} label={t('classes.copyLink')} copiedLabel={t('classes.linkCopied')} className={`${btnPrimary} flex-1 justify-center sm:flex-none min-h-[44px]`} fallbackRef={inputRef} dataAttr="data-copy-link" />
          {onRotate && <button type="button" onClick={onRotate} className={`${btnSecondary} min-h-[44px]`} data-rotate-link><RefreshCw size={14} aria-hidden="true" /> {t('classes.rotateJoinLink')}</button>}
        </div>
      </div>
    </div>
  );
}

/**
 * Copier, et le DIRE : l'icône change et une annonce polie part pour les
 * lecteurs d'écran. Sans presse-papiers (HTTP, navigateur restrictif), le
 * texte est sélectionné dans son champ et un message invite à le copier.
 */
function CopyButton({ value, label, copiedLabel, className, disabled = false, fallbackRef = null, dataAttr }) {
  const { t } = useTranslation('teacher');
  const [state, setState] = useState('idle'); // idle | copied | failed
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      fallbackRef?.current?.focus();
      fallbackRef?.current?.select();
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 2500);
  };

  return (
    <>
      <button type="button" onClick={copy} disabled={disabled || !value} className={className} {...{ [dataAttr]: '' }}>
        {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        {state === 'copied' ? copiedLabel : label}
      </button>
      <span className="sr-only" aria-live="polite">{state === 'copied' ? copiedLabel : state === 'failed' ? t('classes.copyFailed') : ''}</span>
      {state === 'failed' && <span role="status" className="basis-full text-xs text-amber-800">{t('classes.copyFailed')}</span>}
    </>
  );
}
