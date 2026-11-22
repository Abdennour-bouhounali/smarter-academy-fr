import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue } from './grapherFormat.js';

/**
 * Le bloc « المماس » du panneau du grapheur : un interrupteur, puis — quand
 * il est allumé — la fonction étudiée (si plusieurs), les valeurs en A
 * (x, f(x), f′(x)), l'alternative au glisser (le champ « x = » et un
 * curseur sur l'étendue visible), et deux options : la courbe de f′ et le
 * triangle de pente. Le geste premier — glisser A — se fait dans le plan.
 */
export default function TangentPanel({
  tangent, functions, studied, compiled, derivative, tangentLine, viewport,
  onToggle, onSelectFunction, onChangeX, onToggleOption,
}) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(formatDraft(tangent.x));
  useEffect(() => { setDraft(formatDraft(tangent.x)); }, [tangent.x]);

  const commitX = () => {
    const parsed = Number(String(draft).replace(',', '.').replace('−', '-'));
    if (Number.isFinite(parsed)) onChangeX(parsed);
    else setDraft(formatDraft(tangent.x));
  };

  const name = studied?.name ?? 'f';
  const y = compiled?.ok ? compiled.fn(tangent.x) : NaN;
  const reason = derivative && !derivative.ok ? derivative.reason : null;

  return (
    <section className="sa-ml-grapher__tangent" aria-labelledby="ml-tangent-heading" data-ml-tangent>
      <h2 id="ml-tangent-heading" className="sa-ml-grapher__heading">{t('tools.functionGrapher.optionsHeading')}</h2>
      <label className="sa-ml-grapher__toggle">
        <input type="checkbox" checked={tangent.enabled} onChange={onToggle} disabled={functions.length === 0} data-ml-tangent-toggle />
        <span>{t('tools.functionGrapher.tangent.enable')}</span>
      </label>

      {tangent.enabled && studied && (
        <>
          {functions.length > 1 && (
            <fieldset className="sa-ml-grapher__studied" data-ml-tangent-studied>
              <legend className="sa-ml-grapher__point-label">{t('tools.functionGrapher.tangent.studied')}</legend>
              {functions.map((fn) => (
                <label key={fn.id} className="sa-ml-grapher__studied-item" dir="ltr">
                  <input type="radio" name="ml-tangent-studied" value={fn.id} checked={fn.id === tangent.functionId} onChange={() => onSelectFunction(fn.id)} data-ml-tangent-pick={fn.name} />
                  <span className="sa-ml-grapher__swatch-dot" style={{ backgroundColor: fn.color }} aria-hidden="true" />
                  <span>{fn.name}(x)</span>
                </label>
              ))}
            </fieldset>
          )}

          <div className="sa-ml-grapher__values" aria-live="polite" data-ml-tangent-values>
            <p className="sa-ml-grapher__point-label sa-ml-grapher__values-title">{t('tools.functionGrapher.tangent.pointHeading', { name })}</p>
            <div className="sa-ml-grapher__point-grid" dir="ltr">
              <label className="sa-ml-grapher__point-x">
                <span className="sa-ml-grapher__point-label">x =</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="sa-ml-grapher__point-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitX}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitX(); } }}
                  aria-label={t('tools.functionGrapher.tangent.pointX')}
                  data-ml-tangent-x
                />
              </label>
              <p className="sa-ml-grapher__point-value" data-ml-tangent-f>
                <span className="sa-ml-grapher__point-label">{name}(x) =</span>
                <span className="sa-ml-grapher__point-number" style={{ color: studied.color }}>{formatValue(y, 3)}</span>
              </p>
              <input
                type="range"
                className="sa-ml-grapher__slider"
                dir="ltr"
                min={viewport.xMin}
                max={viewport.xMax}
                step={(viewport.xMax - viewport.xMin) / 1000}
                value={Math.min(viewport.xMax, Math.max(viewport.xMin, tangent.x))}
                onChange={(e) => onChangeX(Number(e.target.value))}
                aria-label={t('tools.functionGrapher.tangent.sliderLabel')}
                aria-valuetext={`x = ${formatValue(tangent.x, 2)}`}
                data-ml-tangent-slider
              />
            </div>
            <p className="sa-ml-grapher__point-label sa-ml-grapher__values-title">{t('tools.functionGrapher.tangent.slope')}</p>
            <p className="sa-ml-grapher__point-value sa-ml-grapher__slope" dir="ltr" data-ml-tangent-slope>
              <span className="sa-ml-grapher__point-label">{name}′(x) =</span>
              <span className="sa-ml-grapher__point-number">{derivative?.ok ? formatValue(derivative.value, 3) : '—'}</span>
            </p>
            <p className="sa-ml-grapher__point-pair" dir="ltr" data-ml-tangent-pair>
              {tangentLine
                ? `A(${formatValue(tangentLine.x, 2)} ; ${formatValue(tangentLine.y, 2)})${tangent.showDerivative ? `   B(${formatValue(tangentLine.x, 2)} ; ${formatValue(tangentLine.slope, 2)})` : ''}`
                : ''}
            </p>
            {reason && compiled?.ok && (
              <p className="sa-ml-grapher__error" role="status" data-ml-tangent-undefined={reason}>{t(`tools.functionGrapher.tangent.undefined.${reason}`)}</p>
            )}
          </div>

          <label className="sa-ml-grapher__toggle">
            <input type="checkbox" checked={tangent.showDerivative} onChange={() => onToggleOption('showDerivative')} data-ml-tangent-derivative />
            <span>{t('tools.functionGrapher.tangent.showDerivative', { name })}</span>
          </label>
          <label className="sa-ml-grapher__toggle">
            <input type="checkbox" checked={tangent.showTriangle} onChange={() => onToggleOption('showTriangle')} data-ml-tangent-triangle />
            <span>{t('tools.functionGrapher.tangent.showTriangle')}</span>
          </label>
          <p className="sa-ml-grapher__hint">{t('tools.functionGrapher.tangent.explanation')}</p>
        </>
      )}
    </section>
  );
}

function formatDraft(x) {
  return String(Number(x.toFixed(4))).replace('.', ',');
}
