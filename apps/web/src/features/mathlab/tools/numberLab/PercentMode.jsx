import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus as MinusIcon } from 'lucide-react';
import { LabPanel } from '../../shared/LabKit.jsx';
import ValueInput from './ValueInput.jsx';
import {
  percentageOf, percentageLadder, percentageChange, inverseChange,
  reversePercentage, percentToFrac,
} from './proportion.js';
import { simplify, fracToText } from './fraction.js';
import { formatNumber, formatPercent } from './numberValue.js';

/**
 * §14 à §16 — LES NISAB MI'AWIYYA, vues comme des parts de cent.
 *
 * La grille de cent carrés est le cœur du mode : `35 %` n'est pas une
 * formule, ce sont 35 carrés sur 100, et on les COMPTE. Le curseur les
 * remplit en continu, et le sullam (§15) montre au même instant ce que valent
 * 10 %, 25 %, 50 % de la même quantité — la proportionnalité se voit au lieu
 * de se mémoriser.
 *
 * §16 est traité avec un soin particulier : la hausse et la baisse ne sont
 * JAMAIS distinguées par la seule couleur. Il y a un mot (hausse / baisse),
 * une flèche, et un signe — trois signaux indépendants, comme §16 l'exige.
 */
export default function PercentMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { quantity, percent, from, to, tab } = state;

  const result = useMemo(() => percentageOf(percent, quantity), [percent, quantity]);
  const ladder = useMemo(() => percentageLadder(quantity), [quantity]);
  const change = useMemo(() => percentageChange(from, to), [from, to]);
  const asFraction = useMemo(() => {
    const frac = percentToFrac(percent);

    return frac ? simplify(frac) : null;
  }, [percent]);

  const filled = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--percent">
      <div className="sa-ml-nb__tabs" role="tablist">
        {['of', 'change', 'reverse'].map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`sa-ml-nb__tab${tab === key ? ' is-active' : ''}`}
            onClick={() => onChange({ tab: key })}
          >
            {t(`tools.numberLab.percent.tabs.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'of' && (
        <>
          <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
            <ValueInput
              value={quantity}
              onChange={(next) => onChange({ quantity: next })}
              label={t('tools.numberLab.percent.quantity')}
            />
            <ValueInput
              value={percent}
              onChange={(next) => onChange({ percent: next })}
              label={t('tools.numberLab.percent.percentage')}
            />
          </div>

          {/* §15 : le curseur continu. */}
          <div className="sa-ml-nb__slider-row">
            <input
              type="range"
              className="sa-ml-nb__slider"
              min={0}
              max={100}
              step={1}
              value={Math.max(0, Math.min(100, percent))}
              onChange={(event) => onChange({ percent: Number(event.target.value) })}
              aria-label={t('tools.numberLab.percent.percentage')}
              aria-valuetext={formatPercent(percent)}
            />
            <output className="sa-ml-nb__slider-value">{formatPercent(percent)}</output>
          </div>

          <div className="sa-ml-nb__percent-body">
            {/* §14 : la grille de cent. */}
            <figure className="sa-ml-nb__grid100">
              <svg
                viewBox="0 0 220 220"
                width="100%"
                height={compact ? 190 : 230}
                role="img"
                aria-label={t('tools.numberLab.percent.gridLabel', { filled })}
              >
                {Array.from({ length: 100 }, (_, index) => {
                  const row = Math.floor(index / 10);
                  const col = index % 10;

                  return (
                    <rect
                      key={index}
                      x={8 + col * 20.4}
                      y={8 + row * 20.4}
                      width={18}
                      height={18}
                      rx={2}
                      className={`sa-ml-nb__cell${index < filled ? ' is-filled' : ''}`}
                    />
                  );
                })}
              </svg>
              <figcaption>{t('tools.numberLab.percent.gridHint', { percent: formatPercent(percent) })}</figcaption>
            </figure>

            <div className="sa-ml-nb__percent-facts">
              <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
                {formatPercent(percent)} × {formatNumber(quantity)} = {formatNumber(result?.result ?? 0)}
              </p>
              <dl className="sa-ml-nb__facts">
                <div>
                  <dt>{t('tools.numberLab.percent.asFraction')}</dt>
                  <dd dir="ltr">{asFraction ? fracToText(asFraction) : '—'}</dd>
                </div>
                <div>
                  <dt>{t('tools.numberLab.percent.asDecimal')}</dt>
                  <dd dir="ltr">{formatNumber(percent / 100, 6)}</dd>
                </div>
                <div>
                  <dt>1 %</dt>
                  <dd dir="ltr">{formatNumber(result?.perUnit ?? 0, 6)}</dd>
                </div>
              </dl>

              {/* §15 : l'échelle — la proportionnalité d'un coup d'œil. */}
              <LabPanel id="numberLab.percent.ladder" title={t('tools.numberLab.percent.ladder')}>
                <p className="sa-ml-nb__muted">{t('tools.numberLab.percent.ladderHint')}</p>
                <ul className="sa-ml-nb__ladder" dir="ltr">
                  {ladder.map((stop) => (
                    <li key={stop.percent}>
                      <button
                        type="button"
                        className={`sa-ml-nb__ladder-row${Math.round(percent) === stop.percent ? ' is-current' : ''}`}
                        onClick={() => onChange({ percent: stop.percent })}
                      >
                        <span className="sa-ml-nb__ladder-percent">{stop.percent} %</span>
                        <span className="sa-ml-nb__ladder-bar" style={{ '--fill': `${stop.percent}%` }} />
                        <span className="sa-ml-nb__ladder-value">{formatNumber(stop.value, 4)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </LabPanel>
            </div>
          </div>
        </>
      )}

      {tab === 'change' && change && (
        <>
          <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
            <ValueInput value={from} onChange={(next) => onChange({ from: next })} label={t('tools.numberLab.percent.from')} />
            <ValueInput value={to} onChange={(next) => onChange({ to: next })} label={t('tools.numberLab.percent.to')} />
          </div>

          {/* §16 : on TIRE la nouvelle quantité. */}
          <div className="sa-ml-nb__slider-row">
            <input
              type="range"
              className="sa-ml-nb__slider"
              min={0}
              max={Math.max(1, Math.abs(from) * 2)}
              step={Math.max(0.01, Math.abs(from) / 200)}
              value={Math.max(0, Math.min(Math.abs(from) * 2, to))}
              onChange={(event) => onChange({ to: Number(event.target.value) })}
              aria-label={t('tools.numberLab.percent.to')}
              aria-valuetext={formatNumber(to)}
            />
            <output className="sa-ml-nb__slider-value">{formatNumber(to)}</output>
          </div>

          <div className="sa-ml-nb__bars-compare">
            <BarRow label={t('tools.numberLab.percent.from')} value={from} max={Math.max(Math.abs(from), Math.abs(to))} tone="primary" />
            <BarRow label={t('tools.numberLab.percent.to')} value={to} max={Math.max(Math.abs(from), Math.abs(to))} tone={change.direction === 'decrease' ? 'down' : 'up'} />
          </div>

          {/* §16 : mot + flèche + signe — jamais la couleur seule. */}
          <section className={`sa-ml-nb__panel sa-ml-nb__panel--${change.direction}`}>
            <h4 className="sa-ml-nb__change-head">
              {change.direction === 'increase' && <TrendingUp size={18} aria-hidden="true" />}
              {change.direction === 'decrease' && <TrendingDown size={18} aria-hidden="true" />}
              {change.direction === 'none' && <MinusIcon size={18} aria-hidden="true" />}
              {t(`tools.numberLab.percent.${change.direction === 'increase' ? 'increase' : (change.direction === 'decrease' ? 'decrease' : 'noChange')}`)}
            </h4>
            <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
              {change.percent > 0 ? '+' : ''}{formatPercent(change.percent)}
            </p>
            <dl className="sa-ml-nb__facts">
              <div>
                <dt>{t('tools.numberLab.percent.difference')}</dt>
                <dd dir="ltr">{change.difference > 0 ? '+' : ''}{formatNumber(change.difference)}</dd>
              </div>
              <div>
                <dt>{t('tools.numberLab.percent.factor')}</dt>
                <dd dir="ltr">× {formatNumber(change.factor, 6)}</dd>
              </div>
            </dl>
            <p className="sa-ml-nb__muted">
              {t('tools.numberLab.percent.factorHint', { percent: formatPercent(change.percent), factor: formatNumber(change.factor, 4) })}
            </p>
            {Number.isFinite(inverseChange(change.percent)) && change.percent !== 0 && (
              <p className="sa-ml-nb__callout">
                {t('tools.numberLab.percent.inverseHint', {
                  up: formatPercent(change.percent),
                  down: formatPercent(inverseChange(change.percent)),
                })}
              </p>
            )}
          </section>
        </>
      )}

      {tab === 'reverse' && (
        <>
          <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
            <ValueInput value={quantity} onChange={(next) => onChange({ quantity: next })} label={t('tools.numberLab.percent.result')} />
            <ValueInput value={percent} onChange={(next) => onChange({ percent: next })} label={t('tools.numberLab.percent.percentage')} />
          </div>
          <section className="sa-ml-nb__panel sa-ml-nb__panel--result">
            <p className="sa-ml-nb__question">
              {t('tools.numberLab.percent.reverseQuestion', {
                result: formatNumber(quantity), percent: formatPercent(percent),
              })}
            </p>
            <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
              {formatNumber(quantity)} ÷ {formatNumber(percent)} × 100 = {formatNumber(reversePercentage(quantity, percent) ?? 0)}
            </p>
            <p>{t('tools.numberLab.percent.reverseAnswer', { value: formatNumber(reversePercentage(quantity, percent) ?? 0) })}</p>
          </section>
        </>
      )}
    </div>
  );
}

function BarRow({ label, value, max, tone }) {
  const width = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;

  return (
    <div className="sa-ml-nb__bar-row">
      <span className="sa-ml-nb__bar-label">{label}</span>
      <span className="sa-ml-nb__bar-track">
        <span className={`sa-ml-nb__bar-fill sa-ml-nb__bar-fill--${tone}`} style={{ width: `${width}%` }} />
      </span>
      <span className="sa-ml-nb__bar-value" dir="ltr">{formatNumber(value)}</span>
    </div>
  );
}
