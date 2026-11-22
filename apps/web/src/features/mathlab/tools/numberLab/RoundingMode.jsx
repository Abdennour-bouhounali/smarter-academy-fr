import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabPanel } from '../../shared/LabKit.jsx';
import NumberLineStage from './NumberLineStage.jsx';
import ValueInput from './ValueInput.jsx';
import { roundingDetail, truncateTo, approximationError } from './numberTheory.js';
import { formatNumber, formatPercent } from './numberValue.js';

/**
 * §32 à §34 — LE TAQRĪB, décidé sur la droite.
 *
 * Arrondir, c'est choisir entre deux voisins. Le mode les montre donc tous
 * les deux, avec le MILIEU entre eux — et le nombre de l'élève posé quelque
 * part. La décision devient géométrique : « de quel côté du milieu suis-je ? »
 * Plus besoin de règle sur le chiffre suivant ; la règle se LIT.
 *
 * §33 ajoute la troncature à côté, parce que c'est la confusion classique :
 * `7,89` tronqué au dixième fait `7,8`, arrondi fait `7,9`. Les deux sont
 * affichés ensemble, et la différence saute aux yeux.
 *
 * §34 : l'erreur est une DISTANCE sur la droite, pas un nombre abstrait.
 */

const PRESETS = Object.freeze([
  { key: 'presetPi', exact: Math.PI, approximation: 3.14 },
  { key: 'presetThird', exact: 1 / 3, approximation: 0.33 },
  { key: 'presetSqrt2', exact: Math.SQRT2, approximation: 1.41 },
]);

export default function RoundingMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { value, power } = state;

  const detail = useMemo(() => roundingDetail(value, power), [value, power]);
  const truncated = useMemo(() => truncateTo(value, power), [value, power]);
  const error = useMemo(
    () => (detail ? approximationError(value, detail.rounded) : null),
    [value, detail],
  );

  if (!detail) return null;

  const span = (detail.upper - detail.lower) * 2.4;
  const view = { center: (detail.lower + detail.upper) / 2, span: Math.max(span, 1e-6) };

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--rounding">
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <ValueInput value={value} onChange={(next) => onChange({ value: next })} label={t('tools.numberLab.valueLabel')} />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.rounding.rank')}</span>
          <select
            className="sa-ml-nb__select"
            value={power}
            onChange={(event) => onChange({ power: Number(event.target.value) })}
          >
            {[2, 1, 0, -1, -2, -3].map((p) => (
              <option key={p} value={p}>{t(`tools.numberLab.rounding.ranks.${p}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="sa-ml-nb__heading">{t('tools.numberLab.rounding.heading', { value: formatNumber(value, 6) })}</h3>
      <p className="sa-ml-nb__hint">{t('tools.numberLab.rounding.hint')}</p>

      {/* §32 : les deux voisins, le milieu, et le nombre entre eux. */}
      <NumberLineStage
        view={view}
        points={[{ value, tone: 'primary', draggable: false }]}
        marks={[
          { value: detail.lower, tone: 'neutral', label: formatNumber(detail.lower, 6) },
          // Le milieu porte sa VALEUR, pas seulement son nom : c'est le
          // nombre qui décide de l'arrondi, et l'élève doit pouvoir le lire.
          { value: detail.midpoint, tone: 'midpoint', label: formatNumber(detail.midpoint, 6) },
          { value: detail.upper, tone: 'neutral', label: formatNumber(detail.upper, 6) },
        ]}
        bands={[{
          from: detail.direction === 'up' ? detail.midpoint : detail.lower,
          to: detail.direction === 'up' ? detail.upper : detail.midpoint,
          tone: 'target',
        }]}
        ticksTarget={compact ? 5 : 8}
        height={compact ? 140 : 160}
      />

      <div className="sa-ml-nb__cards">
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.rounding.lower')}</h4>
          <p className="sa-ml-nb__rep-value" dir="ltr">{formatNumber(detail.lower, 6)}</p>
          <p className="sa-ml-nb__muted" dir="ltr">
            {t('tools.numberLab.rounding.distanceLower', { value: formatNumber(detail.distanceToLower, 6) })}
          </p>
        </section>
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.rounding.upper')}</h4>
          <p className="sa-ml-nb__rep-value" dir="ltr">{formatNumber(detail.upper, 6)}</p>
          <p className="sa-ml-nb__muted" dir="ltr">
            {t('tools.numberLab.rounding.distanceUpper', { value: formatNumber(detail.distanceToUpper, 6) })}
          </p>
        </section>
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.rounding.midpoint')}</h4>
          <p className="sa-ml-nb__rep-value" dir="ltr">{formatNumber(detail.midpoint, 6)}</p>
          <p className="sa-ml-nb__muted">
            {detail.atMidpoint
              ? t('tools.numberLab.rounding.atMidpoint')
              : t('tools.numberLab.rounding.closerTo', { value: formatNumber(detail.rounded, 6) })}
          </p>
        </section>
        <section className="sa-ml-nb__card sa-ml-nb__card--result">
          <h4>{t('tools.numberLab.rounding.rounded')}</h4>
          <p className="sa-ml-nb__rep-value sa-ml-nb__rep-value--big" dir="ltr">{formatNumber(detail.rounded, 6)}</p>
          <p className="sa-ml-nb__muted">
            {detail.atMidpoint
              ? t('tools.numberLab.rounding.atMidpoint')
              : t('tools.numberLab.rounding.closerTo', { value: formatNumber(detail.rounded, 6) })}
          </p>
        </section>
      </div>

      {/* §33 : la troncature, à côté — c'est la confusion classique. */}
      <LabPanel id="numberLab.rounding.truncation" title={t('tools.numberLab.rounding.truncation')}>
        <p className="sa-ml-nb__muted">
          {t('tools.numberLab.rounding.truncationHint', {
            truncated: formatNumber(truncated, 6),
            rounded: formatNumber(detail.rounded, 6),
          })}
        </p>
      </LabPanel>

      {/* §33, §34 : l'erreur, comme une distance. */}
      {error && (
        <LabPanel id="numberLab.rounding.error" title={t('tools.numberLab.rounding.approximation')} className="sa-ml-nb__panel--result">
          <dl className="sa-ml-nb__facts" dir="ltr">
            <div>
              <dt>{t('tools.numberLab.rounding.exactValue')}</dt>
              <dd>{formatNumber(error.exact, 8)}</dd>
            </div>
            <div>
              <dt>{t('tools.numberLab.rounding.approximateValue')}</dt>
              <dd>{formatNumber(error.approximation, 8)}</dd>
            </div>
            <div>
              <dt>{t('tools.numberLab.rounding.absoluteError')}</dt>
              <dd>{formatNumber(error.absolute, 8)}</dd>
            </div>
            <div>
              <dt>{t('tools.numberLab.rounding.relativeError')}</dt>
              <dd>{error.relative === null ? t('tools.numberLab.rounding.noRelative') : formatPercent(error.relative * 100, 4)}</dd>
            </div>
          </dl>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.rounding.errorHint')}</p>
          <p className="sa-ml-nb__muted">
            {error.over ? t('tools.numberLab.rounding.over') : t('tools.numberLab.rounding.under')}
          </p>

          {/* §34 : π et 3,14, la distance qu'on VOIT. */}
          <div className="sa-ml-nb__controls">
            <span className="sa-ml-nb__label">{t('tools.numberLab.rounding.presets')}</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="sa-ml-nb__chip"
                onClick={() => onChange({ value: preset.exact, power: -2 })}
              >
                {t(`tools.numberLab.rounding.${preset.key}`)}
              </button>
            ))}
          </div>
        </LabPanel>
      )}
    </div>
  );
}
