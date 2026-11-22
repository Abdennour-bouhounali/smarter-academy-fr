import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Play } from 'lucide-react';
import * as R from './ruleEngine.js';
import { ruleVariablesFor, ruleNumbersFor } from './investigations.js';

/**
 * Le CONSTRUCTEUR de règles (§19) — visuel, sans syntaxe à taper.
 *
 * L'élève ne tape pas « (b*h)/2 » : il pose des jetons. Le premier jeton
 * devient la règle ; ensuite, chaque opération EMBOÎTE ce qui existe à
 * gauche et ouvre un trou à droite, exactement comme on écrit au tableau :
 *
 *     b            →   b × …        →   b × h        →   b × h ÷ …
 *
 * C'est pauvre en possibilités comparé à un analyseur syntaxique, et c'est
 * voulu : un collégien construit une relation entre des grandeurs qu'il
 * vient de mesurer, pas une expression arbitraire. Les priorités sont celles
 * de l'écriture (× avant +), et `formatRule` pose les parenthèses.
 *
 * L'expression reste en LTR même en arabe (§30) : « A = L × l » se lit de
 * gauche à droite, c'est de la mathématique. Ce sont les BOUTONS qui suivent
 * la direction de la page.
 */
export default function RuleBuilder({ investigation, rule, onChange, onTest, disabled }) {
  const { t } = useTranslation('mathlab');
  const [pendingOperator, setPendingOperator] = useState(null);

  const variables = useMemo(() => ruleVariablesFor(investigation), [investigation]);
  // Les nombres du programme, et ceux propres à l'enquête (90, 180, 360 pour
  // les angles : la somme cherchée doit pouvoir s'ÉCRIRE).
  const numbers = useMemo(() => ruleNumbersFor(investigation), [investigation]);
  const symbolOf = useCallback((name) => {
    const found = investigation.quantities.find((entry) => entry.key === name);

    return found?.symbol ?? name;
  }, [investigation]);

  const complete = R.isComplete(rule);

  /**
   * Poser un jeton (une variable, un nombre, π).
   *
   * S'il n'y a rien, il devient la règle. Si une opération attend son
   * membre droit, il le remplit. Sinon il REMPLACE la règle — parce qu'un
   * élève qui reclique sur une variable veut visiblement repartir d'elle,
   * et non l'empiler silencieusement.
   */
  const place = useCallback((node) => {
    if (!rule) {
      onChange(node);

      return;
    }
    if (pendingOperator) {
      onChange(R.operation(pendingOperator, rule, node));
      setPendingOperator(null);

      return;
    }
    onChange(node);
  }, [rule, pendingOperator, onChange]);

  /** Choisir une opération : elle attend son membre droit. */
  const chooseOperator = useCallback((op) => {
    if (!rule) return;
    setPendingOperator((current) => (current === op ? null : op));
  }, [rule]);

  /** Élever au carré ou au cube ce qui est déjà posé. */
  const raise = useCallback((exponent) => {
    if (!rule || pendingOperator) return;
    onChange(R.power(rule, exponent));
  }, [rule, pendingOperator, onChange]);

  const reset = useCallback(() => {
    setPendingOperator(null);
    onChange(null);
  }, [onChange]);

  // Ce que l'élève LIT de sa propre règle, trou compris.
  const written = useMemo(() => {
    if (!rule) return t('tools.measurement.rule.empty');
    const text = R.formatRule(rule, symbolOf);

    return pendingOperator
      ? `${text} ${{ '*': '×', '/': '÷', '+': '+', '-': '−' }[pendingOperator]} …`
      : text;
  }, [rule, pendingOperator, symbolOf, t]);

  return (
    <section className="sa-ml-ms__panelSection" aria-labelledby="sa-ml-ms-rule">
      <header className="sa-ml-ms__panelHead">
        <h3 id="sa-ml-ms-rule" className="sa-ml-ms__panelTitle">
          {t('tools.measurement.rule.heading')}
        </h3>
      </header>

      <p className="sa-ml-ms__invite">{t('tools.measurement.rule.invite')}</p>

      {/* L'ÉQUATION en construction — toujours LTR (§30). */}
      <output className="sa-ml-ms__equation" dir="ltr" aria-live="polite">
        <span className="sa-ml-ms__equationTarget">{symbolOf(investigation.target)}</span>
        <span className="sa-ml-ms__equationSign">=</span>
        <span className={`sa-ml-ms__equationBody${complete ? '' : ' sa-ml-ms__equationBody--open'}`}>
          {written}
        </span>
      </output>
      <p className="sa-ml-ms__sr" aria-live="polite">
        {rule ? t('tools.measurement.rule.current', { rule: written }) : ''}
      </p>

      <div className="sa-ml-ms__builder" aria-label={t('tools.measurement.rule.builderLabel')}>
        <fieldset className="sa-ml-ms__group">
          <legend>{t('tools.measurement.rule.variables')}</legend>
          <div className="sa-ml-ms__chips">
            {variables.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className="sa-ml-ms__chip sa-ml-ms__chip--var"
                onClick={() => place(R.variable(entry.key))}
                disabled={disabled}
              >
                <span dir="ltr" className="sa-ml-ms__chipSymbol">{entry.symbol}</span>
                <span className="sa-ml-ms__chipName">
                  {t(`tools.measurement.quantities.${entry.key}`, entry.key)}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="sa-ml-ms__group">
          <legend>{t('tools.measurement.rule.operators')}</legend>
          <div className="sa-ml-ms__chips">
            {R.OPERATORS.map((op) => (
              <button
                key={op}
                type="button"
                className={`sa-ml-ms__chip sa-ml-ms__chip--op${pendingOperator === op ? ' is-active' : ''}`}
                onClick={() => chooseOperator(op)}
                disabled={disabled || !rule}
                aria-pressed={pendingOperator === op}
              >
                <span dir="ltr">{{ '*': '×', '/': '÷', '+': '+', '-': '−' }[op]}</span>
              </button>
            ))}
            <button
              type="button"
              className="sa-ml-ms__chip sa-ml-ms__chip--op"
              onClick={() => raise(2)}
              disabled={disabled || !rule || Boolean(pendingOperator)}
            >
              <span dir="ltr">x²</span>
            </button>
            <button
              type="button"
              className="sa-ml-ms__chip sa-ml-ms__chip--op"
              onClick={() => raise(3)}
              disabled={disabled || !rule || Boolean(pendingOperator)}
            >
              <span dir="ltr">x³</span>
            </button>
          </div>
        </fieldset>

        <fieldset className="sa-ml-ms__group">
          <legend>{t('tools.measurement.rule.numbers')}</legend>
          <div className="sa-ml-ms__chips">
            {numbers.map((value) => (
              <button
                key={value}
                type="button"
                className="sa-ml-ms__chip sa-ml-ms__chip--num"
                onClick={() => place(R.number(value))}
                disabled={disabled}
              >
                <span dir="ltr">{value}</span>
              </button>
            ))}
            {/* π n'est proposé que là où l'élève a une chance de le
                rencontrer : sur le cercle. Ailleurs, ce serait un indice. */}
            {investigation.revealsConstant === 'pi' && (
              <button
                type="button"
                className="sa-ml-ms__chip sa-ml-ms__chip--num"
                onClick={() => place(R.constant('pi'))}
                disabled={disabled}
              >
                <span dir="ltr">π</span>
              </button>
            )}
          </div>
        </fieldset>
      </div>

      <div className="sa-ml-ms__ruleActions">
        <button
          type="button"
          className="sa-ml-ms__primaryBtn"
          onClick={onTest}
          disabled={disabled || !complete}
        >
          <Play size={16} aria-hidden="true" />
          {t('tools.measurement.rule.test')}
        </button>
        <button type="button" className="sa-ml-ms__ghostBtn" onClick={reset} disabled={!rule}>
          <RotateCcw size={15} aria-hidden="true" />
          {t('tools.measurement.rule.reset')}
        </button>
      </div>

      {!complete && rule && (
        <p className="sa-ml-ms__warn">{t('tools.measurement.rule.incomplete')}</p>
      )}
    </section>
  );
}
