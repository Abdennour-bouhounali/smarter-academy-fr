import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { parseValue, tokenizeDataset, tokensToText } from './datasetStatistics.js';

/** Au-delà, les pastilles deviendraient un mur : le champ de texte reste l'éditeur. */
const MAX_CHIPS = 120;

/**
 * LES VALEURS EN PASTILLES — une deuxième façon d'éditer la même saisie.
 * Chaque pastille est un JETON de la saisie (datasetStatistics.tokenizeDataset),
 * valide ou non : un jeton fautif apparaît en rouge et se corrige ou se
 * retire ici, il n'est jamais avalé. Toute modification réécrit le texte
 * (`tokensToText`, séparateur « ; ») : le champ et les pastilles disent
 * toujours la même chose.
 *
 *   clic sur une pastille → elle devient un champ (Entrée valide, Échap annule,
 *   vide = retirer) ; × retire ; le champ du bas ajoute.
 */
export default function DatasetChips({ text, onReplace, onHighlightValue }) {
  const { t } = useTranslation('mathlab');
  const tokens = tokenizeDataset(text);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [added, setAdded] = useState('');
  const addedValid = added.trim() === '' || !Number.isNaN(parseValue(added));

  const write = (next) => onReplace(tokensToText(next));
  const commitEdit = () => {
    if (editing === null) return;
    const value = draft.trim();
    write(value === '' ? tokens.filter((_, i) => i !== editing) : tokens.map((token, i) => (i === editing ? value : token)));
    setEditing(null);
  };
  const add = () => {
    const value = added.trim();
    if (value === '' || Number.isNaN(parseValue(value))) return;
    write([...tokens, value]);
    setAdded('');
  };

  return (
    <section className="sa-ml-ps__section" aria-labelledby="ml-ps-chips-heading">
      <h3 id="ml-ps-chips-heading" className="sa-ml-ps__heading">{t('tools.probabilityStats.chips.heading')}</h3>
      <ul className="sa-ml-ps__chips-list" data-ml-ps-chips={tokens.length}>
        {tokens.slice(0, MAX_CHIPS).map((token, index) => {
          const invalid = Number.isNaN(parseValue(token));
          if (editing === index) {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>
                <input
                  className="sa-ml-ps__chip-input"
                  dir="ltr"
                  value={draft}
                  // Le champ remplace la pastille qu'on vient de toucher : le focus doit y aller.
                  autoFocus
                  aria-label={t('tools.probabilityStats.chips.editLabel', { value: token })}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') { event.preventDefault(); commitEdit(); }
                    if (event.key === 'Escape') setEditing(null);
                  }}
                  data-ml-ps-chip-edit={index}
                />
              </li>
            );
          }

          return (
            // L'indice EST l'identité d'un jeton (deux « 15 » sont deux individus).
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className={`sa-ml-ps__value-chip${invalid ? ' is-invalid' : ''}`}>
              <button
                type="button"
                className="sa-ml-ps__value-chip-text"
                dir="ltr"
                onClick={() => { setEditing(index); setDraft(token); }}
                onMouseEnter={() => !invalid && onHighlightValue?.(parseValue(token))}
                onMouseLeave={() => onHighlightValue?.(null)}
                onFocus={() => !invalid && onHighlightValue?.(parseValue(token))}
                onBlur={() => onHighlightValue?.(null)}
                aria-label={t(invalid ? 'tools.probabilityStats.chips.invalidChip' : 'tools.probabilityStats.chips.chip', { value: token })}
                aria-invalid={invalid || undefined}
                data-ml-ps-chip={index}
              >
                {token}
              </button>
              <button
                type="button"
                className="sa-ml-ps__value-chip-remove"
                onClick={() => write(tokens.filter((_, i) => i !== index))}
                aria-label={t('tools.probabilityStats.chips.remove', { value: token })}
                title={t('tools.probabilityStats.chips.remove', { value: token })}
                data-ml-ps-chip-remove={index}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      {tokens.length > MAX_CHIPS && (
        <p className="sa-ml-ps__hint">{t('tools.probabilityStats.chips.tooMany', { max: MAX_CHIPS })}</p>
      )}
      <form
        className="sa-ml-ps__chip-add"
        onSubmit={(event) => { event.preventDefault(); add(); }}
      >
        <input
          className={`sa-ml-ps__chip-input ${addedValid ? '' : 'sa-ml-ps__number--invalid'}`}
          dir="ltr"
          inputMode="decimal"
          value={added}
          onChange={(event) => setAdded(event.target.value)}
          aria-label={t('tools.probabilityStats.chips.addLabel')}
          placeholder={t('tools.probabilityStats.chips.addPlaceholder')}
          aria-invalid={!addedValid || undefined}
          aria-describedby={addedValid ? undefined : 'ml-ps-chip-add-error'}
          data-ml-ps-chip-new
        />
        <button type="submit" className="sa-ml-ps__small-btn" disabled={added.trim() === '' || !addedValid} data-ml-ps-chip-add>
          <Plus size={16} aria-hidden="true" />
          {t('tools.probabilityStats.chips.add')}
        </button>
      </form>
      {!addedValid && (
        <p id="ml-ps-chip-add-error" className="sa-ml-ps__error" role="alert">{t('tools.probabilityStats.chips.addInvalid')}</p>
      )}
    </section>
  );
}
