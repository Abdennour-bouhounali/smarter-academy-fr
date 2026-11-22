import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, Divide } from 'lucide-react';

/**
 * LES OPÉRATIONS — « ماذا أفعل بالطرفين ؟ »
 *
 * Quatre boutons, une valeur. L'élève choisit l'opération PUIS le nombre, et
 * l'opération part aux deux membres : l'interface ne laisse littéralement
 * pas la possibilité d'en toucher un seul. C'est la règle du chapitre,
 * inscrite dans les commandes plutôt que dans une consigne.
 *
 * Les raccourcis (`−3`, `÷2`) proposent ce qui FAIT AVANCER l'équation
 * courante : retrancher la constante, diviser par le coefficient. L'élève
 * garde la main — il peut toujours saisir autre chose — mais le chemin
 * naturel est à portée de pouce, ce qui compte sur un téléphone.
 */

const KINDS = [
  { kind: 'add', icon: Plus, labelKey: 'tools.algebra.add' },
  { kind: 'subtract', icon: Minus, labelKey: 'tools.algebra.subtract' },
  { kind: 'multiply', icon: X, labelKey: 'tools.algebra.multiply' },
  { kind: 'divide', icon: Divide, labelKey: 'tools.algebra.divide' },
];

export default function OperationControls({ suggestions, onApply, disabled, error, idPrefix = 'eq' }) {
  const { t } = useTranslation('mathlab');
  const [kind, setKind] = useState('subtract');
  const [value, setValue] = useState('');

  const submit = useCallback((event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    if (onApply({ kind, text })) setValue('');
  }, [kind, value, onApply]);

  return (
    <section className="sa-ml-alg__section" aria-labelledby={`sa-ml-alg-ops-${idPrefix}`}>
      <h3 className="sa-ml-alg__heading" id={`sa-ml-alg-ops-${idPrefix}`}>{t('tools.algebra.operationsHeading')}</h3>

      {suggestions.length > 0 && (
        <div className="sa-ml-alg__suggestions">
          <span className="sa-ml-alg__suggestions-label">{t('tools.algebra.suggestionsLabel')}</span>
          <div className="sa-ml-alg__suggestion-row">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.kind}:${suggestion.text}`}
                type="button"
                className="sa-ml-alg__suggestion"
                onClick={() => onApply(suggestion)}
                disabled={disabled}
                lang="en"
                dir="ltr"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="sa-ml-alg__operation" onSubmit={submit}>
        <div className="sa-ml-alg__kinds" role="group" aria-label={t('tools.algebra.operationsHeading')}>
          {KINDS.map((item) => {
            const Icon = item.icon;
            const active = kind === item.kind;

            return (
              <button
                key={item.kind}
                type="button"
                className={`sa-ml-alg__kind${active ? ' sa-ml-alg__kind--active' : ''}`}
                onClick={() => setKind(item.kind)}
                aria-pressed={active}
                disabled={disabled}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <div className="sa-ml-alg__value-row">
          <label className="sa-ml-alg__value-label" htmlFor={`sa-ml-alg-value-${idPrefix}`}>{t('tools.algebra.valueLabel')}</label>
          <input
            id={`sa-ml-alg-value-${idPrefix}`}
            className="sa-ml-alg__value"
            type="text"
            inputMode="text"
            dir="ltr"
            lang="en"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t('tools.algebra.valuePlaceholder')}
            disabled={disabled}
            autoComplete="off"
          />
          <button type="submit" className="sa-ml-alg__apply" disabled={disabled || !value.trim()}>
            {t('tools.algebra.apply')}
          </button>
        </div>
      </form>

      {error && <p className="sa-ml-alg__error" role="status">{error}</p>}
    </section>
  );
}
