import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import NumberLineStage from './NumberLineStage.jsx';
import ValueInput from './ValueInput.jsx';
import { LabPanel } from '../../shared/LabKit.jsx';
import {
  fracToNumber, fracToText, simplify, fracToDecimal,
} from './fraction.js';
import { fracToPercent } from './proportion.js';
import { snapToFraction, compareValues, decimalTextOf, formatNumber, formatPercent } from './numberValue.js';

/**
 * §7, §43, §45, §46 — LE MUSTAQĪM MUDARRAJ, et « une valeur, plusieurs
 * écritures ».
 *
 * Deux points qu'on tire au doigt. Pour chacun, le laboratoire affiche EN
 * MÊME TEMPS la fraction, le décimal, le pourcentage et la position : c'est
 * l'écran qui porte l'identité de §47, et il est ici parce que la droite est
 * le seul endroit où les quatre écritures sont visiblement le même point.
 *
 * L'accrochage (§7) est ce qui rend `1/3` atteignable : sans lui, un doigt ne
 * tombe jamais exactement sur un tiers, et l'élève croirait que la machine
 * refuse sa réponse alors qu'elle refuse son pixel.
 */
export default function LineMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { view, points, denominator, snap } = state;

  const values = points.map(fracToNumber);

  /** Un point glissé : on le rend en FRACTION exacte, pas en flottant (§61). */
  const dragPoint = useCallback((index, value) => {
    const frac = snap
      ? snapToFraction(value, denominator)
      : snapToFraction(value, 1000);
    if (!frac) return;
    const next = points.map((p, i) => (i === index ? (snap ? frac : simplify(frac)) : p));
    onChange({ points: next });
  }, [points, denominator, snap, onChange]);

  const comparison = useMemo(
    () => (points.length === 2 ? compareValues(points[0], points[1]) : null),
    [points],
  );

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--line">
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <ValueInput
          value={points[0]}
          onChange={(frac) => onChange({ points: [frac, points[1]] })}
          label={`${t('tools.numberLab.line.pointLabel', { index: 1, value: '' })}`.trim()}
          fraction
        />
        <ValueInput
          value={points[1]}
          onChange={(frac) => onChange({ points: [points[0], frac] })}
          label={`${t('tools.numberLab.line.pointLabel', { index: 2, value: '' })}`.trim()}
          fraction
        />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.line.subdivide')}</span>
          <select
            className="sa-ml-nb__select"
            value={denominator}
            onChange={(event) => onChange({ denominator: Number(event.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 100].map((d) => (
              <option key={d} value={d}>{t('tools.numberLab.line.subdivisions', { count: d })}</option>
            ))}
          </select>
        </label>
        <label className="sa-ml-nb__switch">
          <input type="checkbox" checked={snap} onChange={(event) => onChange({ snap: event.target.checked })} />
          <span>{t('tools.numberLab.line.snap')}</span>
        </label>
      </div>

      <p className="sa-ml-nb__hint">{t('tools.numberLab.line.hint')}</p>

      <NumberLineStage
        view={view}
        onChangeView={(next) => onChange({ view: next })}
        points={points.map((frac, index) => ({
          value: fracToNumber(frac),
          frac,
          tone: index === 0 ? 'primary' : 'secondary',
        }))}
        onDragPoint={dragPoint}
        subdivisions={denominator > 1 ? denominator : null}
        snapTo={snap ? { snapDenominator: denominator, tolerance: 0.5 } : null}
        brackets={comparison && !comparison.equal ? [{
          from: Math.min(...values),
          to: Math.max(...values),
          label: formatNumber(comparison.distance, 4),
        }] : []}
        height={compact ? 140 : 156}
      />

      {/* §45 : la comparaison (LTR) et la distance (phrase + île LTR), sous le dessin. */}
      {comparison && (
        <div className="sa-ml-nb__row sa-ml-nb__row--between sa-ml-nb__line-readout">
          <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr" data-ml-nb-line-compare>
            {fracToText(points[0])} {comparison.sign} {fracToText(points[1])}
          </p>
          <p className="sa-ml-nb__muted sa-ml-nb__line-distance">
            {t('tools.numberLab.line.distance')}{' : '}
            <bdi dir="ltr" className="sa-ml-nb__ltr">
              {comparison.difference ? fracToText(simplify({ n: Math.abs(comparison.difference.n), d: comparison.difference.d })) : formatNumber(comparison.distance, 4)}
            </bdi>
          </p>
        </div>
      )}

      {/* §46, §47 : LA MÊME VALEUR, quatre écritures — repliable (MATH_LAB §3.5). */}
      <LabPanel id="numberLab.line.values" title={t('tools.numberLab.line.valuesTitle')}>
        <div className="sa-ml-nb__representations" dir="ltr">
          {points.map((frac, index) => (
            <RepresentationCard key={index} frac={frac} index={index} />
          ))}
        </div>
      </LabPanel>
    </div>
  );
}

/**
 * §47 — « une valeur, plusieurs représentations », affichées ensemble.
 *
 * Elles sont toutes DÉRIVÉES de la même fraction : elles ne peuvent pas se
 * contredire, parce qu'il n'y a qu'un nombre derrière.
 */
function RepresentationCard({ frac, index }) {
  const { t } = useTranslation('mathlab');
  const decimal = fracToDecimal(frac);
  const percent = fracToPercent(frac);
  const reduced = simplify(frac);

  return (
    <section className={`sa-ml-nb__card sa-ml-nb__card--rep is-${index === 0 ? 'primary' : 'secondary'}`}>
      <h4>{t('tools.numberLab.line.pointLabel', { index: index + 1, value: '' })}</h4>
      <dl className="sa-ml-nb__facts" dir="ltr">
        <div>
          <dt>{t('tools.numberLab.modes.fractions')}</dt>
          <dd className="sa-ml-nb__rep-value">{fracToText(frac)}</dd>
        </div>
        {fracToText(reduced) !== fracToText(frac) && (
          <div>
            <dt>{t('tools.numberLab.fractions.simplify')}</dt>
            <dd>{fracToText(reduced)}</dd>
          </div>
        )}
        <div>
          <dt>{t('tools.numberLab.modes.decimals')}</dt>
          <dd className="sa-ml-nb__rep-value">{decimalTextOf(decimal)}</dd>
        </div>
        <div>
          <dt>%</dt>
          <dd className="sa-ml-nb__rep-value">{Number.isFinite(percent) ? formatPercent(percent) : '—'}</dd>
        </div>
      </dl>
      {decimal && !decimal.exact && (
        <p className="sa-ml-nb__muted">{t('tools.numberLab.decimals.repeatingHint', { period: decimal.period })}</p>
      )}
    </section>
  );
}
