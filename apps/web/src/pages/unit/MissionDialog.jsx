import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

/**
 * La fenêtre des écrans de mission (carte, énoncé, point d'étape) : Échap ferme, le focus y entre, un bouton fermer.
 * Portée dans <body> (comme MemoQuiz) : la page du module crée un contexte d'empilement qui la glissait sous la barre latérale.
 * `card` (2026-11-09, page d'unité, conseil puis propriétaire « plus large ») : une carte de 760 px pensée pour NE PAS défiler — le contenu
 * tient, le reste se plie.
 */
export default function MissionDialog({ label, onClose, children, closable = true, wide = false, card = false }) {
  const { t } = useTranslation('lesson');
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    if (!closable) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, closable]);
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 p-6" data-mission-dialog>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}
        className={`relative max-h-[90vh] w-full ${wide ? 'max-w-6xl' : card ? 'max-w-[760px]' : 'max-w-3xl'} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none`}>
        {closable && (
          <button type="button" onClick={onClose} aria-label={t('mission.close')}
            className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100">
            ×
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
