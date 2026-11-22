import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/**
 * Une boîte de dialogue accessible : fermeture à Échap, clic sur le fond,
 * focus déplacé dedans à l'ouverture et rendu au déclencheur à la fermeture.
 *
 * Écrite ici parce que le projet n'en avait aucune — et une action
 * conséquente (désactiver un compte, archiver une leçon) doit se confirmer
 * dans quelque chose qui piège le focus, pas dans un `window.confirm`.
 *
 * Rendue dans `document.body` (portail) : un ancêtre avec `backdrop-filter`
 * ou `transform` — une `glass-card`, par exemple — devient sinon le repère de
 * `position: fixed`, et la boîte se centre dans la carte au lieu de l'écran,
 * son fond gris ne couvrant que la carte. Sa hauteur est bornée à l'écran :
 * l'en-tête et le pied restent visibles, seul le contenu défile.
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md', closeLabel }) {
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

  const width = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size] ?? 'max-w-lg';

  const dialog = (
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
        className={`flex max-h-[calc(100dvh-2rem)] w-full ${width} flex-col rounded-2xl bg-white shadow-xl outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="font-space text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 font-inter text-sm text-slate-700">{children}</div>

        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );

  // Hors navigateur (rendu serveur des tests), pas de portail possible.
  return typeof document === 'undefined' ? dialog : createPortal(dialog, document.body);
}

/**
 * Confirmation d'une action conséquente. `tone="danger"` pour ce qui ferme un
 * accès ou retire du contenu aux élèves.
 */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, tone = 'default', busy = false, cancelLabel, busyLabel, closeLabel }) {
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      closeLabel={closeLabel}
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel ?? t('ui.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-60 ${
              tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            {busy ? (busyLabel ?? t('ui.busy')) : (confirmLabel ?? t('ui.confirm'))}
          </button>
        </>
      )}
    >
      {message}
    </Modal>
  );
}
