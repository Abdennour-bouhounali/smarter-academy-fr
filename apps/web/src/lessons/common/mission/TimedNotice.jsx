import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './mission.css';

/**
 * UN MESSAGE QUI S'EN VA SEUL (propriétaire, 2026-11-07, « أستعدّ » du lecteur) : une fenêtre au centre, une barre en haut
 * qui se vide en `ms` (5 s), puis elle disparaît et le premier écran est déjà là. « ابدأ الآن » (ou un clic à côté) la ferme
 * plus tôt. La barre est un compte à rebours : elle reste animée même en mouvement réduit (c'est une information, pas un décor).
 */
export default function TimedNotice({ ms = 5000, onDone, children }) {
  const { t } = useTranslation('lesson');
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; onDone?.(); };
  useEffect(() => {
    const timer = setTimeout(finish, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/55 p-6" onClick={finish} data-timed-notice>
      <div role="dialog" aria-modal="true" aria-live="polite" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white text-center shadow-2xl">
        <div className="h-2 bg-indigo-100" aria-hidden="true">
          <div className="sa-timed-notice-bar h-full origin-right bg-indigo-600" style={{ animationDuration: `${ms}ms` }} data-timed-notice-bar />
        </div>
        <div className="space-y-6 px-10 py-9">
          <p className="text-2xl font-black leading-relaxed text-slate-900">{children}</p>
          <button type="button" onClick={finish} autoFocus data-timed-notice-go
            className="min-h-[52px] rounded-2xl bg-indigo-600 px-8 text-lg font-black text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-700">
            {t('mission.startNow')} <span aria-hidden="true">←</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
