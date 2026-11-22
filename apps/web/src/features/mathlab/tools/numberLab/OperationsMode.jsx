import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabPanel } from '../../shared/LabKit.jsx';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import NumberLineStage from './NumberLineStage.jsx';
import ValueInput from './ValueInput.jsx';
import { roundTo } from './numberTheory.js';
import { formatNumber, frameValues } from './numberValue.js';

/**
 * §35 à §44 — LES AMALIYYĀT, vues comme des mouvements et des paquets.
 *
 * Une opération n'est pas un résultat : c'est un GESTE. L'addition avance sur
 * la droite, la soustraction recule (et passe sous zéro sans drame, §37,
 * §40), la multiplication range en grille (§38), la division partage ou
 * groupe (§39) — et le reste est montré, jamais escamoté.
 *
 * §39 insiste sur les deux lectures de la division, et elles sont vraiment
 * différentes : « 24 ÷ 6 » se lit « 6 paquets, combien dans chacun ? »
 * (partage) ou « des paquets de 6, combien de paquets ? » (groupement). Le
 * mode montre les deux, parce que c'est la même écriture pour deux questions.
 *
 * §44 : la valeur absolue est une DISTANCE à zéro, et elle est dessinée comme
 * telle.
 */
export default function OperationsMode({ state, onChange, compact, onGoMode = null }) {
  const { t } = useTranslation('mathlab');
  const { a, b, operation } = state;
  const [divisionView, setDivisionView] = useState('sharing');

  const result = useMemo(() => {
    switch (operation) {
      case 'add': return roundTo(a + b, 6);
      case 'subtract': return roundTo(a - b, 6);
      case 'multiply': return roundTo(a * b, 6);
      case 'divide': return b === 0 ? null : roundTo(a / b, 6);
      default: return null;
    }
  }, [a, b, operation]);

  const quotient = b !== 0 ? Math.trunc(a / b) : 0;
  const remainder = b !== 0 ? roundTo(a - quotient * b, 6) : 0;

  const view = useMemo(
    () => frameValues([0, a, result ?? a], { minSpan: Math.max(6, Math.abs(a) * 0.5) }),
    [a, result],
  );

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--operations">
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <ValueInput value={a} onChange={(next) => onChange({ a: next })} label={t('tools.numberLab.operations.first')} stepper />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.operations.operation')}</span>
          <select className="sa-ml-nb__select" value={operation} onChange={(event) => onChange({ operation: event.target.value })}>
            {['add', 'subtract', 'multiply', 'divide'].map((op) => (
              <option key={op} value={op}>{t(`tools.numberLab.operations.${op}`)}</option>
            ))}
          </select>
        </label>
        <ValueInput value={b} onChange={(next) => onChange({ b: next })} label={t('tools.numberLab.operations.second')} stepper />
      </div>

      <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
        {formatNumber(a)} {SIGNS[operation]} {formatNumber(b)} ={' '}
        {result === null ? t('tools.numberLab.operations.divideByZero') : formatNumber(result)}
      </p>

      {/* §36, §37, §40 : le mouvement sur la droite. */}
      {(operation === 'add' || operation === 'subtract') && (
        <>
          <NumberLineStage
            view={view}
            points={[
              { value: a, label: formatNumber(a), tone: 'secondary', draggable: false },
              { value: result ?? a, label: formatNumber(result ?? a), tone: 'primary', draggable: false },
            ]}
            marks={[{ value: 0, tone: 'muted', label: '0' }]}
            brackets={[{ from: Math.min(a, result ?? a), to: Math.max(a, result ?? a), label: formatNumber(Math.abs(b)) }]}
            height={compact ? 140 : 160}
          />
          <p className="sa-ml-nb__muted">
            {t(operation === 'add' ? 'tools.numberLab.operations.addHint' : 'tools.numberLab.operations.subtractHint', {
              a: formatNumber(a), b: formatNumber(Math.abs(b)),
            })}
          </p>
          {result !== null && result < 0 && (
            <p className="sa-ml-nb__callout">{t('tools.numberLab.operations.negativeResult')}</p>
          )}
        </>
      )}

      {/* §38 : groupes, grille, addition répétée, aire. */}
      {operation === 'multiply' && Number.isInteger(a) && Number.isInteger(b)
        && Math.abs(a) <= 24 && Math.abs(b) <= 24 && (
        <>
          <p className="sa-ml-nb__muted">
            {t('tools.numberLab.operations.multiplyHint', { a: Math.abs(a), b: Math.abs(b) })}
          </p>
          <div
            className="sa-ml-nb__array"
            role="img"
            aria-label={t('tools.numberLab.operations.arrayLabel', { a: Math.abs(a), b: Math.abs(b) })}
          >
            {Array.from({ length: Math.abs(a) }, (_, row) => (
              <span key={row} className="sa-ml-nb__array-row">
                {Array.from({ length: Math.abs(b) }, (_, col) => (
                  <span key={col} className="sa-ml-nb__dot" />
                ))}
              </span>
            ))}
          </div>
          <p className="sa-ml-nb__formula" dir="ltr">
            {t('tools.numberLab.operations.repeatedAddition', {
              terms: Array.from({ length: Math.min(12, Math.abs(a)) }, () => formatNumber(Math.abs(b))).join(' + ')
                + (Math.abs(a) > 12 ? ' + …' : ''),
              result: formatNumber(Math.abs(a * b)),
            })}
          </p>
        </>
      )}

      {/* §39 : les DEUX lectures de la division. */}
      {operation === 'divide' && b !== 0 && Number.isInteger(a) && Number.isInteger(b)
        && Math.abs(a) <= 200 && Math.abs(b) <= 24 && (
        <>
          <div className="sa-ml-nb__tabs" role="tablist">
            {['sharing', 'grouping'].map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={divisionView === key}
                className={`sa-ml-nb__tab${divisionView === key ? ' is-active' : ''}`}
                onClick={() => setDivisionView(key)}
              >
                {t(key === 'sharing'
                  ? 'tools.numberLab.operations.divideSharing'
                  : 'tools.numberLab.operations.divideGrouping', { b: Math.abs(b) })}
              </button>
            ))}
          </div>

          <p className="sa-ml-nb__muted">
            {t('tools.numberLab.operations.divideHint', { a: Math.abs(a), b: Math.abs(b) })}
          </p>

          <div className="sa-ml-nb__groups">
            {Array.from(
              { length: divisionView === 'sharing' ? Math.abs(b) : Math.abs(quotient) },
              (_, g) => (
                <span key={g} className="sa-ml-nb__group">
                  {Array.from(
                    { length: divisionView === 'sharing' ? Math.abs(quotient) : Math.abs(b) },
                    (_, i) => <span key={i} className="sa-ml-nb__dot" />,
                  )}
                </span>
              ),
            )}
            {remainder !== 0 && (
              <span className="sa-ml-nb__group is-remainder">
                {Array.from({ length: Math.abs(remainder) }, (_, i) => (
                  <span key={i} className="sa-ml-nb__dot is-remainder" />
                ))}
              </span>
            )}
          </div>

          {/* Une phrase arabe reste RTL ; seule la formule est une île LTR (MathText). */}
          {remainder === 0
            ? <p className="sa-ml-nb__verdict is-prime">{t('tools.numberLab.operations.exactDivision')}</p>
            : <p className="sa-ml-nb__formula" dir="ltr">{t('tools.numberLab.operations.withRemainder', { a, b, quotient, remainder })}</p>}
          <p className="sa-ml-nb__muted">
            <MathText>{t('tools.numberLab.operations.inverseHint', { b, quotient, product: b * quotient })}</MathText>
          </p>
          {onGoMode && (
            <button type="button" className="sa-ml-nb__link" onClick={() => onGoMode('division')} data-ml-nb-go-division>
              {t('tools.numberLab.operations.divisionLink')}
            </button>
          )}
        </>
      )}

      {/* §44 : la valeur absolue, une distance à zéro. */}
      <LabPanel id="numberLab.operations.absolute" title={t('tools.numberLab.operations.absoluteValue')}>
        <p className="sa-ml-nb__formula" dir="ltr">
          {t('tools.numberLab.operations.absoluteFormula', {
            value: formatNumber(a), result: formatNumber(Math.abs(a)),
          })}
        </p>
        <p className="sa-ml-nb__muted">{t('tools.numberLab.operations.absoluteHint')}</p>
        <NumberLineStage
          view={frameValues([0, a], { minSpan: Math.max(4, Math.abs(a) * 1.6) })}
          points={[{ value: a, label: formatNumber(a), tone: 'primary', draggable: false }]}
          marks={[{ value: 0, tone: 'muted', label: '0' }]}
          brackets={[{ from: Math.min(0, a), to: Math.max(0, a), label: formatNumber(Math.abs(a)) }]}
          height={compact ? 120 : 132}
        />
      </LabPanel>

      {/* §41 : les signes, essayés plutôt que récités. */}
      <LabPanel id="numberLab.operations.signs" title={t('tools.numberLab.operations.signs')}>
        <p className="sa-ml-nb__muted">{t('tools.numberLab.operations.signHint')}</p>
        <table className="sa-ml-nb__table" dir="ltr">
          <tbody>
            {[[3, 4], [3, -4], [-3, 4], [-3, -4]].map(([x, y]) => (
              <tr key={`${x},${y}`}>
                <td>
                  {t('tools.numberLab.operations.signRow', {
                    a: formatNumber(x), b: formatNumber(y), result: formatNumber(x * y),
                  })}
                </td>
                <td className={x * y > 0 ? 'is-positive' : 'is-negative'}>{x * y > 0 ? '+' : '−'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LabPanel>
    </div>
  );
}

const SIGNS = Object.freeze({ add: '+', subtract: '−', multiply: '×', divide: '÷' });
