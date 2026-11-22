import { useCallback, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';
import { parseNumberInput, fracToNumber, fracToText } from './fraction.js';
import { formatNumber } from './numberValue.js';

/**
 * LA SAISIE d'un nombre — une seule porte pour toutes les écritures (§46).
 *
 * L'élève tape `3/4`, `0,75`, `75%` ou `-5` : tout passe par
 * `parseNumberInput`, et le champ ne connaît qu'UNE notion de « nombre
 * valide ». C'est ce qui permet au laboratoire d'accepter partout ce qu'il
 * affiche partout.
 *
 * ── Ce qui est tapé et ce qui est validé ────────────────────────────────
 * Le texte vit dans le composant tant qu'il est en cours de frappe : `-`
 * seul, ou `3/` seul, ne sont pas encore des nombres et ne doivent pas
 * remonter. On ne remonte que ce qui se lit — sinon l'élève verrait son
 * champ se corriger sous ses doigts au milieu d'un mot.
 *
 * `dir="ltr"` sur le champ : un nombre est de la notation mathématique, et
 * elle s'écrit de gauche à droite même sur une page arabe (§58).
 */
export default function ValueInput({
  value,
  onChange,
  label,
  integer = false,
  fraction = false,
  min = null,
  max = null,
  step = 1,
  stepper = false,
  placeholder = null,
  hint = null,
  disabled = false,
}) {
  const { t } = useTranslation('mathlab');
  const id = useId();
  const [text, setText] = useState(() => initialText(value, fraction));
  const [error, setError] = useState(null);

  // Le champ suit la valeur quand elle change AILLEURS (« أرسِل إلى », un
  // glissé, une remise à zéro) — mais pas pendant la frappe.
  useEffect(() => {
    setText(initialText(value, fraction));
    setError(null);
  }, [value, fraction]);

  const commit = useCallback((raw) => {
    const parsed = parseNumberInput(raw);
    if (!parsed) {
      setError(fraction ? t('tools.numberLab.fractionError') : t('tools.numberLab.valueError', { min: min ?? '−10⁷', max: max ?? '10⁷' }));

      return;
    }
    if (fraction) { setError(null); onChange(parsed.frac); return; }

    let next = fracToNumber(parsed.frac);
    if (integer) next = Math.trunc(next);
    if (Number.isFinite(min) && next < min) { setError(t('tools.numberLab.valueError', { min, max: max ?? '—' })); return; }
    if (Number.isFinite(max) && next > max) { setError(t('tools.numberLab.tooLarge', { max })); return; }
    setError(null);
    onChange(next);
  }, [onChange, integer, fraction, min, max, t]);

  const bump = useCallback((delta) => {
    if (fraction) return;
    const next = (Number.isFinite(value) ? value : 0) + delta;
    if (Number.isFinite(min) && next < min) return;
    if (Number.isFinite(max) && next > max) return;
    onChange(integer ? Math.trunc(next) : next);
  }, [value, onChange, integer, fraction, min, max]);

  return (
    <div className={`sa-ml-nb__field${error ? ' has-error' : ''}`}>
      {label && <label className="sa-ml-nb__label" htmlFor={id}>{label}</label>}
      <div className="sa-ml-nb__field-row">
        {stepper && (
          <button
            type="button"
            className="sa-ml-nb__mini"
            onClick={() => bump(-step)}
            disabled={disabled}
            aria-label={t('tools.numberLab.decrease')}
          >
            <Minus size={15} aria-hidden="true" />
          </button>
        )}
        <input
          id={id}
          type="text"
          inputMode={integer ? 'numeric' : 'decimal'}
          dir="ltr"
          className="sa-ml-nb__input"
          value={text}
          disabled={disabled}
          placeholder={placeholder ?? t('tools.numberLab.valuePlaceholder')}
          onChange={(event) => setText(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') { event.preventDefault(); commit(event.currentTarget.value); }
            else if (event.key === 'ArrowUp' && stepper) { event.preventDefault(); bump(step); }
            else if (event.key === 'ArrowDown' && stepper) { event.preventDefault(); bump(-step); }
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : (hint ? `${id}-hint` : undefined)}
        />
        {stepper && (
          <button
            type="button"
            className="sa-ml-nb__mini"
            onClick={() => bump(step)}
            disabled={disabled}
            aria-label={t('tools.numberLab.increase')}
          >
            <Plus size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      {error && <p className="sa-ml-nb__error" id={`${id}-error`} role="alert">{error}</p>}
      {!error && hint && <p className="sa-ml-nb__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

function initialText(value, fraction) {
  if (fraction) return value ? fracToText(value) : '';

  return Number.isFinite(value) ? formatNumber(value, 6) : '';
}
