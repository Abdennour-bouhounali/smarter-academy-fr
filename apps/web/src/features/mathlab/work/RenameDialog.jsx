import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

/**
 * Renommer un travail — une vraie boîte modale, comme la confirmation de
 * suppression (ConfirmDialog) : le focus part dans le champ, Échap annule,
 * Entrée valide. Même habillage que le cahier (`.sa-ns-confirm`), pour que
 * la plateforme n'ait qu'UNE façon de demander quelque chose.
 */
export default function RenameDialog({ open, initialTitle = '', onRename, onCancel }) {
  const { t } = useTranslation('mathlab');
  const { t: tc } = useTranslation('common');
  const inputRef = useRef(null);
  const previouslyFocused = useRef(null);
  const [value, setValue] = useState(initialTitle);

  useEffect(() => { if (open) setValue(initialTitle); }, [open, initialTitle]);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement;
    const timer = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel?.(); } };
    document.addEventListener('keydown', onKey, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const clean = value.replace(/\s+/g, ' ').trim().slice(0, 160);
    if (clean !== '') onRename?.(clean);
  };

  return createPortal(
    <div className="sa-ns-confirm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <form className="sa-ns-confirm" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="sa-mlw-rename-title">
        <p id="sa-mlw-rename-title" className="font-extrabold text-slate-900">{t('work.rename.title')}</p>
        <label className="mt-3 block">
          <span className="sr-only">{t('work.rename.label')}</span>
          <input
            ref={inputRef}
            type="text"
            className="sa-mlw-input"
            value={value}
            maxLength={160}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('work.rename.placeholder')}
            data-ml-work-rename-input
          />
        </label>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="sa-ns-btn sa-ns-btn--ghost" onClick={onCancel}>{tc('cancel')}</button>
          <button type="submit" className="sa-ns-btn sa-ns-btn--primary" disabled={value.trim() === ''} data-ml-work-rename-confirm>
            {t('work.rename.confirm')}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
