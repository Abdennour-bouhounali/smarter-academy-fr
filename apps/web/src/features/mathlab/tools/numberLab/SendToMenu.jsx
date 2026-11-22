import { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, ChevronDown } from 'lucide-react';
import { MODES } from './numberState.js';
import { NumberLabModesContext } from './scope.js';

/**
 * « أرسِل إلى » — LE PONT entre les modes (§46).
 *
 * C'est la pièce qui fait des treize modes UN laboratoire plutôt que treize
 * outils : on explore 360, on l'envoie au crible, du crible à l'arbre de
 * facteurs, de l'arbre au PGCD — sans jamais le retaper.
 *
 * Le geste est toujours EXPLICITE. Rien ne se propage tout seul d'un mode à
 * l'autre : c'est la règle que `numberState.sendTo` tient côté données, et
 * ce menu est sa seule porte côté écran.
 */

/** Les modes qui savent RECEVOIR un nombre entier (numberState.sendTo). */
const RECEIVERS = Object.freeze(['explorer', 'place', 'line', 'divisibility', 'primes', 'factors', 'rounding', 'operations', 'division']);

export default function SendToMenu({ value, onSend, exclude = null, label = null }) {
  const { t } = useTranslation('mathlab');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);

    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  // Seulement vers les modes que le مخبر montre (scope.js).
  const open_ = useContext(NumberLabModesContext);
  const targets = RECEIVERS.filter((mode) => mode !== exclude && MODES.includes(mode) && open_.includes(mode));
  if (!Number.isFinite(value) || targets.length === 0) return null;

  return (
    <div className="sa-ml-nb__sendto" ref={rootRef}>
      <button
        type="button"
        className="sa-ml-nb__button sa-ml-nb__button--ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t('tools.numberLab.sendToHint')}
      >
        <Share2 size={15} aria-hidden="true" />
        {label ?? t('tools.numberLab.sendTo')}
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <ul className="sa-ml-nb__menu" role="menu">
          {targets.map((mode) => (
            <li key={mode} role="none">
              <button
                type="button"
                role="menuitem"
                className="sa-ml-nb__menu-item"
                onClick={() => { onSend(mode, value); setOpen(false); }}
              >
                {t(`tools.numberLab.modes.${mode}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
