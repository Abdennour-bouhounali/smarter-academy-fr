import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { DIMENSION_MAX, DIMENSION_MIN, DIMENSION_STEP, PARAM_SYMBOLS, clampDimension, getShape, isValidDimension } from './geometryState.js';

/**
 * Les dimensions du solide courant : pour chacune, un curseur ET un champ
 * numérique, toujours synchronisés, qui redimensionnent le solide sans
 * bouton « appliquer ». Seuls les paramètres du solide choisi apparaissent
 * (un cube n'a qu'une arête, un cône un rayon et une hauteur).
 */
export default function DimensionControls({ shape, dimensions, onChange }) {
  const { t } = useTranslation('mathlab');
  const spec = getShape(shape);

  return (
    <div className="sa-ml-g3d__dims" data-ml-g3d-dims>
      {spec.params.map((param) => (
        <DimensionField key={`${shape}-${param}`} param={param} value={dimensions[param]} onChange={(value) => onChange(param, value)} t={t} />
      ))}
    </div>
  );
}

function DimensionField({ param, value, onChange, t }) {
  const id = `ml-g3d-${param}`;
  const [draft, setDraft] = useState(formatDraft(value));
  const [invalid, setInvalid] = useState(false);
  const focusedRef = useRef(false);
  const name = t(`tools.geometry3d.params.${param}`);
  const symbol = PARAM_SYMBOLS[param];

  // Le curseur (ou un autre chemin) a changé la valeur : le champ suit, sauf pendant qu'on y tape.
  useEffect(() => {
    if (!focusedRef.current) { setDraft(formatDraft(value)); setInvalid(false); }
  }, [value]);

  const applyDraft = (text) => {
    setDraft(text);
    const parsed = parseDraft(text);
    if (isValidDimension(parsed)) {
      setInvalid(false);
      if (parsed !== value) onChange(parsed);
    } else {
      setInvalid(text.trim() !== '');
    }
  };

  const commit = () => {
    focusedRef.current = false;
    const parsed = parseDraft(draft);
    const next = clampDimension(parsed, value);
    setInvalid(false);
    setDraft(formatDraft(next));
    if (next !== value) onChange(next);
  };

  return (
    <div className="sa-ml-g3d__dim" data-ml-g3d-dim={param}>
      <div className="sa-ml-g3d__dim-head">
        <label htmlFor={id} className="sa-ml-g3d__field-label">
          {name} <span className="sa-ml-g3d__symbol" dir="ltr">{symbol}</span>
        </label>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={`sa-ml-g3d__number ${invalid ? 'sa-ml-g3d__number--invalid' : ''}`}
          dir="ltr"
          value={draft}
          onFocus={() => { focusedRef.current = true; }}
          onChange={(event) => applyDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-range` : undefined}
          data-ml-g3d-number={param}
        />
      </div>
      <input
        type="range"
        className="sa-ml-g3d__slider"
        dir="ltr"
        min={DIMENSION_MIN}
        max={DIMENSION_MAX}
        step={DIMENSION_STEP}
        value={value}
        onChange={(event) => onChange(clampDimension(Number(event.target.value), value))}
        aria-label={t('tools.geometry3d.sliderLabel', { name })}
        aria-valuetext={`${symbol} = ${formatValue(value, 2)}`}
        data-ml-g3d-slider={param}
      />
      {invalid && (
        <p id={`${id}-range`} className="sa-ml-g3d__error" role="alert">
          {t('tools.geometry3d.dimensionRange', { min: formatValue(DIMENSION_MIN, 1), max: formatValue(DIMENSION_MAX, 0) })}
        </p>
      )}
    </div>
  );
}

function formatDraft(value) {
  return String(Number(value.toFixed(3))).replace('.', ',');
}

function parseDraft(text) {
  const normalized = String(text).trim().replace(',', '.').replace('−', '-');
  if (normalized === '' || normalized === '-' || normalized === '.') return NaN;

  return Number(normalized);
}
