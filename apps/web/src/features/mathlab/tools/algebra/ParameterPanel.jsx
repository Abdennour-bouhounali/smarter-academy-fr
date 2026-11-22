import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import * as R from './rational.js';

/**
 * LES PARAMÈTRES — `a·x + b = c` dont on bouge les lettres.
 *
 * Trois curseurs, et la solution qui suit. C'est le panneau qui fait passer
 * de « je sais résoudre CETTE équation » à « je vois comment la solution
 * DÉPEND des nombres » : doubler a divise la solution par deux, augmenter c
 * la décale. La formule `x = (c − b) / a` est montrée SOUS l'expérience, pas
 * avant — elle conclut, elle n'introduit pas (§25).
 *
 * `a = 0` est exclu par la borne des curseurs : sans inconnue, il n'y a plus
 * d'équation à explorer.
 */

const RANGE = { min: -9, max: 9 };

/** Les paramètres, dans l'ordre où ils s'écrivent. */
const FIELDS = ['a', 'b', 'c'];

export default function ParameterPanel({ values, onChange }) {
  const { t } = useTranslation('mathlab');

  const update = (key, raw) => {
    const value = Number(raw);
    if (!Number.isInteger(value)) return;
    // a = 0 effacerait l'inconnue : on saute zéro dans le sens du geste.
    const safe = key === 'a' && value === 0 ? (values.a > 0 ? -1 : 1) : value;
    if (safe === values[key]) return;
    onChange({ ...values, [key]: safe });
  };

  const solution = values.a === 0 ? null : R.makeRational(values.c - values.b, values.a);

  return (
    <section className="sa-ml-alg__section sa-ml-alg__parameters" aria-labelledby="sa-ml-alg-params">
      <h3 className="sa-ml-alg__heading" id="sa-ml-alg-params">{t('tools.algebra.parametersHeading')}</h3>
      <p className="sa-ml-alg__parameters-form" dir="ltr">
        <MathText>{'$a\\,x + b = c$'}</MathText>
      </p>

      {FIELDS.map((key) => (
        <div className="sa-ml-alg__param" key={key}>
          <label className="sa-ml-alg__param-label" htmlFor={`sa-ml-alg-param-${key}`}>
            <span dir="ltr" lang="en">{key}</span>
            <output className="sa-ml-alg__param-value" dir="ltr" lang="en">
              {String(values[key]).replace('-', '−')}
            </output>
          </label>
          <input
            id={`sa-ml-alg-param-${key}`}
            className="sa-ml-alg__param-slider"
            type="range"
            min={RANGE.min}
            max={RANGE.max}
            step="1"
            value={values[key]}
            onChange={(event) => update(key, event.target.value)}
          />
        </div>
      ))}

      {solution && (
        <p className="sa-ml-alg__parameters-solution" dir="ltr">
          <MathText>{`$x = \\frac{c - b}{a} = ${R.toLatex(solution)}$`}</MathText>
        </p>
      )}
      <p className="sa-ml-alg__parameters-hint">{t('tools.algebra.parametersHint')}</p>
    </section>
  );
}
