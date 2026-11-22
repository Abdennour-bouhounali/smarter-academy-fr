import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, TruthBadge } from './LogicPieces.jsx';
import { QUANTIFIER_STATEMENTS, findPreset, sampleOf } from './presets.js';
import { deMorganTable, quantifierNegationHolds } from './logicMath.js';
import { SYMBOLS, boolText } from './logicFormat.js';
import { NEGATION_KINDS, setNegationKind, setNegationQuantifier } from './logicState.js';

/**
 * §24-25 — LA NÉGATION (النفي).
 *
 * Deux moitiés, la même idée :
 *
 *   De Morgan — deux colonnes calculées séparément, affichées côte à côte,
 *   et une troisième colonne « identiques ? » qui se remplit de ✓. §24 exige
 *   qu'on ne s'appuie pas seulement sur le symbolique : la table EST la
 *   démonstration, ligne par ligne.
 *
 *   Les quantificateurs — sur un énoncé concret, l'écran montre que
 *   « ¬(∀x, P) » et « ∃x, ¬P » ont la même valeur. §25 dit que c'est « one
 *   of the most important reasoning ideas » : elle est donc écrite en toutes
 *   lettres — نفي «لكلّ» يصير «يوجد مثال مضاد».
 */
export default function NegationArea({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const state = data.negation;
  const isDeMorgan = state.kind === 'and' || state.kind === 'or';

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="negation">
        <h2 className="sa-ml-lg__title">{t('tools.logic.negation.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.negation.lead')}</p>

        <div className="sa-ml-lg__actions" role="group" aria-label={t('tools.logic.negation.heading')}>
          {NEGATION_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className="sa-ml-lg__btn"
              aria-pressed={state.kind === kind}
              onClick={() => onChange((current) => setNegationKind(current, kind))}
              data-ml-lg-negation={kind}
            >
              <Notation>{t(`tools.logic.negation.kinds.${kind}`)}</Notation>
            </button>
          ))}
        </div>
      </section>

      {isDeMorgan ? <DeMorgan kind={state.kind} /> : <QuantifierNegation data={data} onChange={onChange} />}

      <section className="sa-ml-lg__card sa-ml-lg__card--accent">
        <p className="sa-ml-lg__question">{t('tools.logic.negation.keyIdea')}</p>
      </section>
    </>
  );
}

/** §24 — les deux colonnes, calculées à part, comparées ligne à ligne. */
function DeMorgan({ kind }) {
  const { t } = useTranslation('mathlab');
  const rows = useMemo(() => deMorganTable(kind), [kind]);
  const left = kind === 'and' ? `${SYMBOLS.not}(P ${SYMBOLS.and} Q)` : `${SYMBOLS.not}(P ${SYMBOLS.or} Q)`;
  const right = kind === 'and'
    ? `${SYMBOLS.not}P ${SYMBOLS.or} ${SYMBOLS.not}Q`
    : `${SYMBOLS.not}P ${SYMBOLS.and} ${SYMBOLS.not}Q`;
  const allSame = rows.every((row) => row.same);

  return (
    <section className="sa-ml-lg__card" data-ml-lg-demorgan={kind}>
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.negation.deMorgan')}</h3>

      <div className="sa-ml-lg__tableWrap">
        <table className="sa-ml-lg__table">
          <caption className="sa-ml-lg__sr">{t('tools.logic.negation.deMorgan')}</caption>
          <thead>
            <tr>
              <th scope="col" dir="ltr">P</th>
              <th scope="col" dir="ltr">Q</th>
              <th scope="col" dir="ltr">{left}</th>
              <th scope="col" dir="ltr">{right}</th>
              <th scope="col">=</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} data-ml-lg-row={index}>
                <td className={row.p ? 'is-true' : 'is-false'}>{boolText(row.p)}</td>
                <td className={row.q ? 'is-true' : 'is-false'}>{boolText(row.q)}</td>
                <td className={row.left ? 'is-true' : 'is-false'} data-ml-lg-cell="left">{boolText(row.left)}</td>
                <td className={row.right ? 'is-true' : 'is-false'} data-ml-lg-cell="right">{boolText(row.right)}</td>
                <td data-ml-lg-cell="same">{row.same ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allSame && (
        <p className="sa-ml-lg__message sa-ml-lg__message--ok" data-ml-lg-demorgan-holds>
          {t('tools.logic.negation.sameColumn')}
        </p>
      )}
    </section>
  );
}

/** §25 — sur un énoncé concret : ¬∀ devient ∃¬. */
function QuantifierNegation({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const preset = findPreset(QUANTIFIER_STATEMENTS, data.negation.quantifierId);
  const holds = useMemo(
    () => quantifierNegationHolds(preset.kind, preset.predicate, sampleOf(preset.domain)),
    [preset],
  );

  return (
    <section className="sa-ml-lg__card" data-ml-lg-quant-negation>
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.negation.quantifierNegation')}</h3>

      <label className="sa-ml-lg__field">
        <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
        <select
          className="sa-ml-lg__select"
          value={data.negation.quantifierId}
          onChange={(event) => onChange((current) => setNegationQuantifier(current, event.target.value))}
          data-ml-lg-neg-select
        >
          {QUANTIFIER_STATEMENTS.map((item) => (
            <option key={item.id} value={item.id}>{item.formula}</option>
          ))}
        </select>
      </label>

      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.negation.left')}</h3>
      <Notation block data-ml-lg-neg-source>{`${SYMBOLS.not}(${preset.formula})`}</Notation>

      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.negation.right')}</h3>
      <Notation block lead data-ml-lg-neg-result>{preset.negationFormula}</Notation>

      {holds && (
        <p className="sa-ml-lg__message sa-ml-lg__message--ok">
          <TruthBadge value />
          {' '}
          {t('tools.logic.negation.sameColumn')}
        </p>
      )}

      <p className="sa-ml-lg__note">
        {preset.kind === 'forall'
          ? t('tools.logic.practice.e.negateForall')
          : t('tools.logic.practice.e.negateExists')}
      </p>
    </section>
  );
}
