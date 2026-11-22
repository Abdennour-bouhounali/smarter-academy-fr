import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabPanel } from '../../shared/LabKit.jsx';
import NumberLineStage from './NumberLineStage.jsx';
import ValueInput from './ValueInput.jsx';
import SendToMenu from './SendToMenu.jsx';
import {
  decomposition, primeFactorization, factorizationToText, divisors, isPrime,
  nextPrime, previousPrime, digitSum, digitsOf,
} from './numberTheory.js';
import { formatNumber, frameValues } from './numberValue.js';
import { useModeAvailable } from './scope.js';

/**
 * §4 — L'EXPLORATEUR : tout ce qu'un nombre a à dire, d'un coup.
 *
 * C'est la première page du laboratoire, et elle donne le ton : on ne
 * demande rien à l'élève, on lui MONTRE. Il tape 360 et voit sa place sur la
 * droite, ses mraتب, son écriture développée, ses facteurs premiers, ses
 * قواسم, sa parité, ses voisins premiers — tout en même temps, tout vrai.
 *
 * Chaque bloc porte un « أرسِل إلى » : l'exploration n'est pas une impasse,
 * c'est le point de départ des douze autres modes (§46).
 */
export default function ExplorerMode({ value, onChangeValue, onSend, compact }) {
  // La numération de position n'est pas au مخبر الثانوي (scope.js).
  const placeOpen = useModeAvailable('place');
  const { t } = useTranslation('mathlab');

  const facts = useMemo(() => {
    const absolute = Math.abs(value);
    const factors = absolute >= 2 ? primeFactorization(absolute) : null;
    const divisorList = absolute >= 1 ? divisors(absolute) : [];
    const root = Math.sqrt(absolute);

    return {
      absolute,
      factors,
      divisorList,
      prime: isPrime(absolute),
      even: value % 2 === 0,
      decomposition: decomposition(value),
      digits: digitsOf(value),
      digitSum: digitSum(value),
      perfectSquare: Number.isInteger(root) && absolute > 0 ? root : null,
      next: nextPrime(absolute),
      previous: previousPrime(absolute),
    };
  }, [value]);

  const view = useMemo(() => frameValues([0, value], { minSpan: Math.max(10, Math.abs(value) * 0.6) }), [value]);

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--explorer">
      <div className="sa-ml-nb__row">
        <ValueInput
          value={value}
          onChange={onChangeValue}
          label={t('tools.numberLab.valueLabel')}
          integer
          stepper
        />
        <SendToMenu value={value} onSend={onSend} exclude="explorer" />
      </div>

      <h3 className="sa-ml-nb__heading">{t('tools.numberLab.explorer.heading', { value: formatNumber(value) })}</h3>

      {/* §4 : sa place sur la droite — repliable (MATH_LAB §3.5). */}
      <LabPanel id="numberLab.explorer.line" title={t('tools.numberLab.line.heading')}>
        <NumberLineStage
          view={view}
          points={[{ value, tone: 'primary', draggable: false }]}
          marks={[{ value: 0, tone: 'muted' }]}
          height={compact ? 100 : 108}
          ticksTarget={compact ? 6 : 10}
        />
      </LabPanel>

      <div className="sa-ml-nb__cards">
        {/* §4 : l'écriture développée. */}
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.explorer.decomposition')}</h4>
          <p className="sa-ml-nb__formula" dir="ltr">
            {facts.decomposition.length
              ? `${formatNumber(value)} = ${facts.decomposition.map((p) => formatNumber(p.value)).join(' + ')}`
              : formatNumber(value)}
          </p>
          {placeOpen && (
          <button type="button" className="sa-ml-nb__link" onClick={() => onSend('place', value)}>
            {t('tools.numberLab.modes.place')}
          </button>
          )}
        </section>

        {/* §4 : premier ou composé — et POURQUOI. */}
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.explorer.primality')}</h4>
          {facts.absolute === 1 ? (
            <p>{t('tools.numberLab.explorer.isUnit')}</p>
          ) : facts.prime ? (
            <p className="sa-ml-nb__verdict is-prime">{t('tools.numberLab.explorer.isPrime')}</p>
          ) : (
            <p className="sa-ml-nb__verdict">
              {t('tools.numberLab.explorer.isCompositeLabel')}{' '}
              {/* La formule isolée en LTR : sinon « 360 = 2³ × … » se lit à l'envers. */}
              <bdi dir="ltr" className="sa-ml-nb__ltr">
                {formatNumber(facts.absolute)} = {facts.factors ? factorizationToText(facts.factors) : '—'}
              </bdi>
            </p>
          )}
          {facts.factors && facts.factors.length > 0 && (
            <button type="button" className="sa-ml-nb__link" onClick={() => onSend('primes', facts.absolute)}>
              {t('tools.numberLab.primes.tree')}
            </button>
          )}
        </section>

        {/* §4 : la parité, dite sans détour. */}
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.explorer.parity')}</h4>
          <p className="sa-ml-nb__verdict">
            {facts.even ? t('tools.numberLab.explorer.even') : t('tools.numberLab.explorer.odd')}
          </p>
          <p className="sa-ml-nb__muted">
            {t('tools.numberLab.explorer.digitSum')} : {formatNumber(facts.digitSum)}
          </p>
        </section>

        {/* §4, §25 : ses qawāsim. */}
        <section className="sa-ml-nb__card sa-ml-nb__card--wide">
          <h4>
            {t('tools.numberLab.explorer.divisorsLabel')}
            <span className="sa-ml-nb__count">{t('tools.numberLab.factors.divisorCount', { count: facts.divisorList.length })}</span>
          </h4>
          <ul className="sa-ml-nb__chiplist" dir="ltr">
            {facts.divisorList.slice(0, 48).map((divisor) => (
              <li key={divisor}>
                <button
                  type="button"
                  className="sa-ml-nb__chip"
                  onClick={() => onChangeValue(divisor)}
                  title={t('tools.numberLab.explorer.onLine')}
                >
                  {divisor}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="sa-ml-nb__link" onClick={() => onSend('factors', facts.absolute)}>
            {t('tools.numberLab.factors.pairs')}
          </button>
        </section>

        {/* §4 : les voisins premiers. */}
        <section className="sa-ml-nb__card">
          <h4>{t('tools.numberLab.explorer.neighbours')}</h4>
          <div className="sa-ml-nb__neighbours" dir="ltr">
            <button type="button" className="sa-ml-nb__chip" onClick={() => facts.previous && onChangeValue(facts.previous)} disabled={!facts.previous}>
              ← {facts.previous ?? '—'}
            </button>
            <span className="sa-ml-nb__neighbour-current">{formatNumber(facts.absolute)}</span>
            <button type="button" className="sa-ml-nb__chip" onClick={() => facts.next && onChangeValue(facts.next)} disabled={!facts.next}>
              {facts.next ?? '—'} →
            </button>
          </div>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.explorer.previousPrime')} · {t('tools.numberLab.explorer.nextPrime')}</p>
        </section>

        {facts.perfectSquare && (
          <section className="sa-ml-nb__card">
            <h4>{t('tools.numberLab.explorer.factorization')}</h4>
            <p className="sa-ml-nb__formula" dir="ltr">
              {t('tools.numberLab.explorer.square', { root: facts.perfectSquare })}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
