import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import ExpressionField from './ExpressionField.jsx';
import ColorSwatch from './ColorSwatch.jsx';

/** Le délai avant de signaler une expression invalide : le temps de finir de la taper. */
const ERROR_DELAY_MS = 700;

/**
 * Une ligne de la liste : la pastille de couleur (qui ouvre la palette),
 * « f(x) = », le champ, et deux gestes — montrer/cacher, supprimer. La ligne EST l'éditeur : pas de
 * dialogue, on corrige sur place et la courbe suit.
 */
export default function FunctionRow({ fn, compiled, onChange, onChangeColor, onToggle, onRemove, autoFocus }) {
  const { t } = useTranslation('mathlab');
  const [showError, setShowError] = useState(false);
  const error = compiled?.ok ? null : compiled?.error;

  useEffect(() => {
    if (!error) { setShowError(false); return undefined; }
    const timer = setTimeout(() => setShowError(true), ERROR_DELAY_MS);

    return () => clearTimeout(timer);
  }, [error, fn.expression]);

  const errorId = `ml-fn-error-${fn.id}`;
  const errorText = error ? t(`tools.functionGrapher.errors.${error.code}`, { symbol: error.symbol ?? '' }) : '';

  return (
    <li className={`sa-ml-grapher__row ${fn.visible ? '' : 'sa-ml-grapher__row--hidden'}`} data-ml-fn={fn.id} data-ml-fn-name={fn.name}>
      <div className="sa-ml-grapher__row-main">
        <ColorSwatch name={fn.name} color={fn.color} onChange={(color) => onChangeColor(fn.id, color)} />
        <span className="sa-ml-grapher__fname" dir="ltr" aria-hidden="true">{fn.name}(x) =</span>
        <ExpressionField
          value={fn.expression}
          onInput={(latex) => onChange(fn.id, latex)}
          ariaLabel={t('tools.functionGrapher.expressionLabel', { name: fn.name })}
          ariaDescribedBy={showError && error ? errorId : undefined}
          invalid={showError && Boolean(error)}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__rowbtn"
          onClick={() => onToggle(fn.id)}
          aria-pressed={fn.visible}
          aria-label={fn.visible ? t('tools.functionGrapher.hide', { name: fn.name }) : t('tools.functionGrapher.show', { name: fn.name })}
          title={fn.visible ? t('tools.functionGrapher.hide', { name: fn.name }) : t('tools.functionGrapher.show', { name: fn.name })}
          data-ml-fn-toggle
        >
          {fn.visible ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="sa-ml-btn sa-ml-btn--icon sa-ml-btn--danger sa-ml-grapher__rowbtn"
          onClick={() => onRemove(fn.id)}
          aria-label={t('tools.functionGrapher.remove', { name: fn.name })}
          title={t('tools.functionGrapher.remove', { name: fn.name })}
          data-ml-fn-remove
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
      {showError && error && (
        <p id={errorId} className="sa-ml-grapher__error" role="alert" data-ml-fn-error>{errorText}</p>
      )}
    </li>
  );
}
