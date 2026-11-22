import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import { LabPanel } from '../../shared/LabKit.jsx';
import FractionShape from './FractionShape.jsx';
import ValueInput from './ValueInput.jsx';
import {
  decimalToFrac, fracToText, fracToDecimal,
} from './fraction.js';
import { fracToPercent } from './proportion.js';
import { placeValues } from './numberTheory.js';
import { decimalTextOf, formatNumber, formatPercent } from './numberValue.js';

/**
 * §13 — DE L'AADAD AL-ASHARIYYA AU KASR, et retour.
 *
 * `0,75` → `75/100` → `3/4`. Les DEUX étapes sont montrées, et c'est tout le
 * propos : la première est ce que le nombre dit littéralement (« soixante-
 * quinze centièmes », qu'on lit dans les rangs), la seconde est ce qu'on
 * obtient en simplifiant. Sauter de l'une à l'autre cacherait l'essentiel.
 *
 * Le mode dit aussi POURQUOI certaines fractions tombent juste et d'autres
 * non : un dénominateur qui ne contient que des 2 et des 5 donne un décimal
 * fini, sinon il donne une période. C'est un fait sur les puissances de dix,
 * et l'élève peut le vérifier en changeant le dénominateur.
 */
export default function DecimalsMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { value, direction } = state;

  const parsed = useMemo(() => decimalToFrac(value), [value]);
  const places = useMemo(() => placeValues(value, { minPower: -3, maxPower: 2 }), [value]);
  const decimal = useMemo(() => (parsed ? fracToDecimal(parsed.simplified) : null), [parsed]);
  const percent = parsed ? fracToPercent(parsed.simplified) : null;

  // Le dénominateur réduit ne contient-il que des 2 et des 5 ? (§13)
  const onlyTwosAndFives = useMemo(() => {
    if (!parsed) return false;
    let d = parsed.simplified.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;

    return d === 1;
  }, [parsed]);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--decimals">
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <ValueInput value={value} onChange={(next) => onChange({ value: next })} label={t('tools.numberLab.valueLabel')} />
        <button
          type="button"
          className="sa-ml-nb__button sa-ml-nb__button--ghost"
          onClick={() => onChange({ direction: direction === 'toFraction' ? 'toDecimal' : 'toFraction' })}
        >
          <ArrowLeftRight size={15} aria-hidden="true" />
          {t(`tools.numberLab.decimals.${direction === 'toFraction' ? 'toDecimal' : 'toFraction'}`)}
        </button>
      </div>

      <h3 className="sa-ml-nb__heading">{t('tools.numberLab.decimals.heading')}</h3>
      <p className="sa-ml-nb__hint">{t('tools.numberLab.decimals.hint')}</p>

      {/* §6 : les rangs — d'où vient « soixante-quinze centièmes ». */}
      <div className="sa-ml-nb__places" dir="ltr">
        {places.map((place) => (
          <span key={place.power} className={`sa-ml-nb__place${place.digit ? ' is-filled' : ''}`}>
            <span className="sa-ml-nb__place-digit">{place.digit}</span>
            <span className="sa-ml-nb__place-name">
              {t(`tools.numberLab.place.rankShort.${place.power}`, String(place.power))}
            </span>
          </span>
        ))}
      </div>

      {parsed && (
        <>
          {/* §13 : les deux écritures, l'une après l'autre. */}
          <div className="sa-ml-nb__chain" dir="ltr">
            <span className="sa-ml-nb__chain-item">{formatNumber(value, 9)}</span>
            <span className="sa-ml-nb__chain-arrow">→</span>
            <span className="sa-ml-nb__chain-item">
              {fracToText(parsed.literal)}
              <small>{t('tools.numberLab.decimals.literal')}</small>
            </span>
            {parsed.factor > 1 && (
              <>
                <span className="sa-ml-nb__chain-arrow">→</span>
                <span className="sa-ml-nb__chain-item is-result">
                  {fracToText(parsed.simplified)}
                  <small>{t('tools.numberLab.decimals.afterSimplify')} (÷ {parsed.factor})</small>
                </span>
              </>
            )}
          </div>

          {/* Même sens que la chaîne au-dessus (LTR) : 75/100 à gauche, 3/4 à droite. */}
          <div className="sa-ml-nb__shapes-row" dir="ltr">
            <FractionShape frac={parsed.literal} model="bar" tone="secondary" width={compact ? 260 : 340} />
            {parsed.factor > 1 && (
              <FractionShape frac={parsed.simplified} model="bar" tone="primary" width={compact ? 260 : 340} />
            )}
          </div>

          {/* §13 : pourquoi ça tombe juste, ou pas. */}
          <LabPanel
            id="numberLab.decimals.why"
            title={decimal?.exact ? t('tools.numberLab.decimals.exact') : t('tools.numberLab.decimals.repeating', { period: decimal?.period })}
          >
            <p className="sa-ml-nb__muted">
              {onlyTwosAndFives
                ? t('tools.numberLab.decimals.whyExact', { denominator: parsed.simplified.d })
                : t('tools.numberLab.decimals.whyRepeating', { denominator: parsed.simplified.d })}
            </p>
            <dl className="sa-ml-nb__facts" dir="ltr">
              <div>
                <dt>{t('tools.numberLab.modes.fractions')}</dt>
                <dd>{fracToText(parsed.simplified)}</dd>
              </div>
              <div>
                <dt>{t('tools.numberLab.modes.decimals')}</dt>
                <dd>{decimalTextOf(decimal)}</dd>
              </div>
              <div>
                <dt>%</dt>
                <dd>{Number.isFinite(percent) ? formatPercent(percent) : '—'}</dd>
              </div>
            </dl>
          </LabPanel>
        </>
      )}
    </div>
  );
}
