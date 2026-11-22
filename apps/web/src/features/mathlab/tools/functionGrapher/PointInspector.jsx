import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { formatValue } from './grapherFormat.js';

/**
 * La lecture d'un point posé sur une courbe : son nom, la fonction, x (que
 * l'on peut taper exactement), f(x), et le couple (x ; y). C'est ce qui fait
 * du graphique un OBJET mathématique et non une image : « en x = 2, f vaut 5 ».
 */
export default function PointInspector({ point, fn, compiled, onChangeX, onRemove }) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(String(point.x));

  useEffect(() => {
    setDraft(formatDraft(point.x));
  }, [point.x]);

  const y = compiled?.ok ? compiled.fn(point.x) : NaN;
  const defined = Number.isFinite(y);

  const commit = () => {
    const parsed = Number(String(draft).replace(',', '.').replace('−', '-'));
    if (Number.isFinite(parsed)) onChangeX(parsed);
    else setDraft(formatDraft(point.x));
  };

  return (
    <section className="sa-ml-grapher__point" aria-labelledby="ml-point-heading" data-ml-point>
      <div className="sa-ml-grapher__point-head">
        <h3 id="ml-point-heading" className="sa-ml-grapher__heading">
          {t('tools.functionGrapher.pointHeading')}
          <span className="sa-ml-grapher__point-on" style={{ color: fn?.color }} data-ml-point-on>{t('tools.functionGrapher.pointOn', { point: point.name, name: fn?.name ?? '?' })}</span>
        </h3>
        <button
          type="button"
          className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__rowbtn"
          onClick={onRemove}
          aria-label={t('tools.functionGrapher.pointRemove')}
          title={t('tools.functionGrapher.pointRemove')}
          data-ml-point-remove
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="sa-ml-grapher__point-grid" dir="ltr">
        <label className="sa-ml-grapher__point-x">
          <span className="sa-ml-grapher__point-label">x =</span>
          <input
            type="text"
            inputMode="decimal"
            className="sa-ml-grapher__point-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
            aria-label={t('tools.functionGrapher.pointX', { point: point.name })}
            data-ml-point-x
          />
        </label>
        <p className="sa-ml-grapher__point-value" aria-live="polite" data-ml-point-y>
          <span className="sa-ml-grapher__point-label">{fn?.name ?? 'f'}(x) =</span>
          <span className="sa-ml-grapher__point-number">{formatValue(y, 3)}</span>
        </p>
        <p className="sa-ml-grapher__point-pair" data-ml-point-pair>
          {defined
            ? `${point.name}(${formatValue(point.x, 3)} ; ${formatValue(y, 3)})`
            : ''}
        </p>
      </div>
      {!defined && <p className="sa-ml-grapher__error" role="status" data-ml-point-undefined>{t('tools.functionGrapher.pointUndefined')}</p>}
    </section>
  );
}

function formatDraft(x) {
  return String(Number(x.toFixed(4))).replace('.', ',');
}
