import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, Square } from 'lucide-react';
import {
  EXPERIMENT_IDS, MAX_DRAWS, RANDOM_MAX_BOUND, RANDOM_MAX_SPAN, RANDOM_MIN_BOUND, SAMPLE_SIZES,
} from './experiments.js';

/**
 * Le pupitre de l'expérience : laquelle, avec quels paramètres, combien de
 * tirages, et les deux gestes — LANCER et RÉINITIALISER.
 *
 * Le nombre de tirages se choisit d'abord par des pastilles (1, 10, 100,
 * 1 000, 10 000, 100 000) : c'est en passant de l'une à l'autre que l'élève
 * fait l'expérience de la loi des grands nombres, sans avoir à taper quoi
 * que ce soit. Le champ reste là pour une valeur quelconque.
 */
export default function ExperimentControls({
  experiment, range, draws, runLabel, running, hasData,
  onChangeExperiment, onChangeRange, onChangeDraws, onRun, onStop, onReset,
}) {
  const { t } = useTranslation('mathlab');

  return (
    <div className="sa-ml-ps__controls">
      <label className="sa-ml-ps__field">
        <span className="sa-ml-ps__field-label">{t('tools.probabilityStats.experimentLabel')}</span>
        <select
          className="sa-ml-ps__select"
          value={experiment}
          onChange={(event) => onChangeExperiment(event.target.value)}
          data-ml-ps-experiment
        >
          {EXPERIMENT_IDS.map((id) => (
            <option key={id} value={id}>{t(`tools.probabilityStats.experiments.${id}`)}</option>
          ))}
        </select>
      </label>

      {experiment === 'random' && (
        <div className="sa-ml-ps__range" data-ml-ps-range>
          <BoundField
            id="ml-ps-min"
            label={t('tools.probabilityStats.min')}
            value={range.min}
            onCommit={(min) => onChangeRange({ ...range, min })}
          />
          <BoundField
            id="ml-ps-max"
            label={t('tools.probabilityStats.max')}
            value={range.max}
            onCommit={(max) => onChangeRange({ ...range, max })}
          />
          <p className="sa-ml-ps__hint">{t('tools.probabilityStats.rangeHint', { span: RANDOM_MAX_SPAN })}</p>
        </div>
      )}

      <fieldset className="sa-ml-ps__draws">
        <legend className="sa-ml-ps__field-label">{t('tools.probabilityStats.drawsLabel')}</legend>
        <div className="sa-ml-ps__chips" role="group" aria-label={t('tools.probabilityStats.drawsLabel')}>
          {SAMPLE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`sa-ml-ps__chip ${draws === size ? 'sa-ml-ps__chip--on' : ''}`}
              onClick={() => onChangeDraws(size)}
              aria-pressed={draws === size}
              data-ml-ps-draws={size}
            >
              {size.toLocaleString('en-US')}
            </button>
          ))}
        </div>
        <DrawsField value={draws} onCommit={onChangeDraws} />
      </fieldset>

      <div className="sa-ml-ps__actions">
        {running ? (
          <button type="button" className="sa-ml-btn sa-ml-btn--primary sa-ml-ps__run" onClick={onStop} data-ml-ps-stop>
            <Square size={16} aria-hidden="true" />
            <span>{t('tools.probabilityStats.stop')}</span>
          </button>
        ) : (
          <button type="button" className="sa-ml-btn sa-ml-btn--primary sa-ml-ps__run" onClick={onRun} data-ml-ps-run>
            <Play size={16} aria-hidden="true" />
            <span>{runLabel ?? t('tools.probabilityStats.run')}</span>
          </button>
        )}
        <button
          type="button"
          className="sa-ml-btn sa-ml-ps__reset"
          onClick={onReset}
          disabled={!hasData && !running}
          data-ml-ps-reset
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>{t('tools.probabilityStats.reset')}</span>
        </button>
      </div>
      <p className="sa-ml-ps__hint">{t('tools.probabilityStats.runHint')}</p>
    </div>
  );
}

/**
 * Une borne du générateur. Comme les dimensions de la géométrie 3D : on
 * applique dès que c'est valide, on signale sans rien casser quand ça ne
 * l'est pas, et on ramène dans les bornes à la validation.
 */
function BoundField({ id, label, value, onCommit }) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) { setDraft(String(value)); setInvalid(false); }
  }, [value]);

  const parse = (text) => {
    const normalized = String(text).trim().replace(/[−–—]/g, '-');
    if (!/^-?\d+$/.test(normalized)) return NaN;

    return Number(normalized);
  };

  return (
    <div className="sa-ml-ps__bound">
      <label htmlFor={id} className="sa-ml-ps__field-label">{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        className={`sa-ml-ps__number ${invalid ? 'sa-ml-ps__number--invalid' : ''}`}
        value={draft}
        onFocus={() => { focusedRef.current = true; }}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = parse(event.target.value);
          const ok = Number.isFinite(parsed) && parsed >= RANDOM_MIN_BOUND && parsed <= RANDOM_MAX_BOUND;
          setInvalid(!ok && event.target.value.trim() !== '');
          if (ok) onCommit(parsed);
        }}
        onBlur={() => {
          focusedRef.current = false;
          const parsed = parse(draft);
          const inBounds = Number.isFinite(parsed) && parsed >= RANDOM_MIN_BOUND && parsed <= RANDOM_MAX_BOUND;
          setInvalid(false);
          if (inBounds) {
            // Déjà appliqué à la frappe — et peut-être REDRESSÉ depuis
            // (min > max échange les bornes) : l'état fait foi, pas le brouillon.
            // Re-soumettre le brouillon ramènerait min = max = 9.
            setDraft(String(value));

            return;
          }
          const next = Number.isFinite(parsed)
            ? Math.min(RANDOM_MAX_BOUND, Math.max(RANDOM_MIN_BOUND, parsed))
            : value;
          setDraft(String(next));
          onCommit(next);
        }}
        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        data-ml-ps-bound={id}
      />
      {invalid && (
        <p id={`${id}-error`} className="sa-ml-ps__error" role="alert">
          {t('tools.probabilityStats.boundError', { min: RANDOM_MIN_BOUND, max: RANDOM_MAX_BOUND })}
        </p>
      )}
    </div>
  );
}

/** Le nombre de tirages, à la main — borné à MAX_DRAWS, jamais nul. */
function DrawsField({ value, onCommit }) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) { setDraft(String(value)); setInvalid(false); }
  }, [value]);

  const commit = () => {
    focusedRef.current = false;
    const parsed = Number(String(draft).trim());
    const next = Number.isFinite(parsed) && parsed >= 1
      ? Math.min(MAX_DRAWS, Math.floor(parsed))
      : value;
    setInvalid(false);
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <div className="sa-ml-ps__bound sa-ml-ps__bound--draws">
      <label htmlFor="ml-ps-draws" className="sa-ml-ps__field-label">{t('tools.probabilityStats.drawsCustom')}</label>
      <input
        id="ml-ps-draws"
        type="text"
        inputMode="numeric"
        dir="ltr"
        className={`sa-ml-ps__number ${invalid ? 'sa-ml-ps__number--invalid' : ''}`}
        value={draft}
        onFocus={() => { focusedRef.current = true; }}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = Number(String(event.target.value).trim());
          const ok = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DRAWS;
          setInvalid(!ok && event.target.value.trim() !== '');
          if (ok) onCommit(parsed);
        }}
        onBlur={commit}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'ml-ps-draws-error' : undefined}
        data-ml-ps-draws-field
      />
      {invalid && (
        <p id="ml-ps-draws-error" className="sa-ml-ps__error" role="alert">
          {t('tools.probabilityStats.drawsError', { max: MAX_DRAWS.toLocaleString('en-US') })}
        </p>
      )}
    </div>
  );
}
