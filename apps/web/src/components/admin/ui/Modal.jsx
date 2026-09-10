import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Une boîte de dialogue accessible : fermeture à Échap, clic sur le fond,
 * focus déplacé dedans à l'ouverture et rendu au déclencheur à la fermeture.
 *
 * Écrite ici parce que le projet n'en avait aucune — et une action
 * conséquente (désactiver un compte, archiver une leçon) doit se confirmer
 * dans quelque chose qui piège le focus, pas dans un `window.confirm`.
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    panelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    // La page derrière ne défile pas pendant qu'une boîte est ouverte.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' }[size] ?? 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        // onMouseDown et non onClick : sinon un glissement commencé DANS la
        // boîte et relâché sur le fond la fermerait.
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`w-full ${width} rounded-2xl bg-white shadow-xl outline-none`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="font-space text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 font-inter text-sm text-slate-700">{children}</div>

        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Confirmation d'une action conséquente. `tone="danger"` pour ce qui ferme un
 * accès ou retire du contenu aux élèves.
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmer', tone = 'default', busy = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-60 ${
              tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {busy ? 'En cours…' : confirmLabel}
          </button>
        </>
      )}
    >
      {message}
    </Modal>
  );
}
