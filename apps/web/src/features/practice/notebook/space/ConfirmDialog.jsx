import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';

/**
 * « Supprimer cette note ? » — une confirmation VRAIMENT modale : le geste est
 * irréversible, donc le focus va sur « Annuler », Échap annule, et rien
 * derrière ne réagit tant qu'on n'a pas répondu.
 */
export default function ConfirmDialog({ open, title, body, confirmLabel, danger = true, onConfirm, onCancel }) {
  const { t: tc } = useTranslation('common');
  const cancelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const timer = setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel?.(); }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="sa-ns-confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className="sa-ns-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sa-ns-confirm-title" aria-describedby="sa-ns-confirm-body">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <TriangleAlert size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p id="sa-ns-confirm-title" className="font-extrabold text-slate-900">{title}</p>
            {body && <p id="sa-ns-confirm-body" className="mt-1 text-sm text-slate-600">{body}</p>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onCancel}>{tc('cancel')}</button>
          <button type="button" className={`sa-ns-btn ${danger ? 'sa-ns-btn--danger' : 'sa-ns-btn--primary'}`} onClick={onConfirm} data-nb-confirm>
            {confirmLabel ?? tc('confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
