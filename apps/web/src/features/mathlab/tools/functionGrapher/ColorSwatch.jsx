import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { FUNCTION_COLOR_CHOICES } from './grapherState.js';

/**
 * La pastille de couleur d'une fonction — un BOUTON : elle ouvre la palette
 * (neuf teintes de la charte, pas un sélecteur libre) et la courbe change de
 * couleur aussitôt. Deux fonctions peuvent partager une couleur si l'élève
 * le veut ; par défaut chacune reçoit une teinte libre.
 *
 * La palette est positionnée en `fixed` d'après la pastille : le panneau
 * défile et se replie, un `absolute` y serait rogné. Elle s'ouvre sous la
 * pastille, ou au-dessus s'il n'y a plus de place en bas, et reste dans
 * l'écran en largeur.
 */
export default function ColorSwatch({ name, color, onChange }) {
  const { t } = useTranslation('mathlab');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const paletteRef = useRef(null);
  const [position, setPosition] = useState(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    const anchor = rootRef.current?.getBoundingClientRect();
    const palette = paletteRef.current?.getBoundingClientRect();
    if (!anchor || !palette) return;
    const margin = 8;
    const below = anchor.bottom + 4;
    const top = below + palette.height <= window.innerHeight - margin ? below : Math.max(margin, anchor.top - 4 - palette.height);
    const left = Math.min(Math.max(margin, anchor.left), window.innerWidth - palette.width - margin);
    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const key = (event) => {
      if (event.key === 'Escape') { setOpen(false); rootRef.current?.querySelector('button')?.focus(); }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);

    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  return (
    <span className="sa-ml-grapher__swatch-wrap" ref={rootRef}>
      <button
        type="button"
        className="sa-ml-grapher__swatch"
        style={{ backgroundColor: color }}
        onClick={() => setOpen((o) => !o)}
        aria-label={t('tools.functionGrapher.color', { name })}
        title={t('tools.functionGrapher.color', { name })}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        data-ml-fn-color
      />
      {open && (
        <div
          id={id}
          ref={paletteRef}
          className="sa-ml-grapher__palette"
          style={position ? { top: position.top, left: position.left, visibility: 'visible' } : undefined}
          role="group"
          aria-label={t('tools.functionGrapher.color', { name })}
          data-ml-palette
        >
          {FUNCTION_COLOR_CHOICES.map((candidate, index) => {
            const selected = candidate === color;
            const label = t(`tools.functionGrapher.colors.${index}`);

            return (
              <button
                key={candidate}
                type="button"
                className={`sa-ml-grapher__palette-item ${selected ? 'sa-ml-grapher__palette-item--selected' : ''}`}
                style={{ backgroundColor: candidate }}
                onClick={() => { onChange(candidate); setOpen(false); }}
                aria-label={label}
                title={label}
                aria-pressed={selected}
                data-ml-palette-color={candidate}
              >
                {selected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
