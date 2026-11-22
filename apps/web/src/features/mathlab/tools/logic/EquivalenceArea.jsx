import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, VerdictPill, SetDiagram } from './LogicPieces.jsx';
import { EQUIVALENCES, findPreset, sampleOf } from './presets.js';
import { analyzeImplication } from './logicMath.js';
import { formatNumber, formOf, equivalenceOf, valueList } from './logicFormat.js';
import { setEquivalence } from './logicState.js';

/**
 * §17 — L'ÉQUIVALENCE (التكافؤ).
 *
 * L'équivalence est présentée comme ce qu'elle est : DEUX implications. Les
 * deux sens sont examinés séparément, chacun avec son verdict et son
 * contre-exemple s'il tombe, et le dessin ne montre un seul disque que
 * lorsque les deux régions coïncident réellement — la partition le décide,
 * pas une mise en page.
 */
export default function EquivalenceArea({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const state = data.equivalence;
  const preset = findPreset(EQUIVALENCES, state.id);

  const analysis = useMemo(
    () => analyzeImplication(preset.p.test, preset.q.test, sampleOf(preset.domain)),
    [preset],
  );

  const both = analysis.direct.holds && analysis.converse.holds;

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="equivalence">
        <h2 className="sa-ml-lg__title">{t('tools.logic.equivalence.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.equivalence.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => onChange((current) => setEquivalence(current, event.target.value))}
            data-ml-lg-equiv-select
          >
            {EQUIVALENCES.map((item) => (
              <option key={item.id} value={item.id}>
                {equivalenceOf(item.p.formula, item.q.formula)}
              </option>
            ))}
          </select>
        </label>

        <Notation block lead data-ml-lg-equiv-formula>
          {equivalenceOf(preset.p.formula, preset.q.formula)}
        </Notation>
      </section>

      {/* ── Les deux sens, séparément ───────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-equiv-directions>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.equivalence.forward')}</h3>
        <Notation block>{formOf('direct', preset.p.formula, preset.q.formula)}</Notation>
        <p data-ml-lg-equiv-forward={String(analysis.direct.holds)}>
          <VerdictPill
            value={analysis.direct.holds}
            label={analysis.direct.holds
              ? t('tools.logic.equivalence.forwardHolds')
              : t('tools.logic.equivalence.forwardFails')}
          />
        </p>
        {!analysis.direct.holds && analysis.direct.counterexample !== null && (
          <p className="sa-ml-lg__note">
            {t('tools.logic.equivalence.counterexample', { value: formatNumber(analysis.direct.counterexample) })}
          </p>
        )}

        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.equivalence.backward')}</h3>
        <Notation block>{formOf('converse', preset.p.formula, preset.q.formula)}</Notation>
        <p data-ml-lg-equiv-backward={String(analysis.converse.holds)}>
          <VerdictPill
            value={analysis.converse.holds}
            label={analysis.converse.holds
              ? t('tools.logic.equivalence.backwardHolds')
              : t('tools.logic.equivalence.backwardFails')}
          />
        </p>
        {!analysis.converse.holds && analysis.converse.counterexample !== null && (
          <p className="sa-ml-lg__note">
            {t('tools.logic.equivalence.counterexample', { value: formatNumber(analysis.converse.counterexample) })}
          </p>
        )}

        <p
          className={`sa-ml-lg__message sa-ml-lg__message--${both ? 'ok' : 'warn'}`}
          role="status"
          data-ml-lg-equiv-holds={String(both)}
        >
          {both ? t('tools.logic.equivalence.bothHold') : t('tools.logic.equivalence.onlyOne')}
        </p>
      </section>

      {/* ── Les régions : mêmes ensembles, ou pas ───────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-equiv-sets>
        <SetDiagram
          parts={analysis.parts}
          pLabel={preset.p.formula}
          qLabel={preset.q.formula}
          caption={t('tools.logic.equivalence.sharedRegion')}
        />
        {both ? (
          <p className="sa-ml-lg__note">{t('tools.logic.equivalence.bothHold')}</p>
        ) : (
          <ul className="sa-ml-lg__chips">
            {analysis.parts.pOnly.length > 0 && (
              <li className="sa-ml-lg__chip">
                {t('tools.logic.equivalence.pOnlyRegion')}
                {': '}
                <Notation>{valueList(analysis.parts.pOnly, 5)}</Notation>
              </li>
            )}
            {analysis.parts.qOnly.length > 0 && (
              <li className="sa-ml-lg__chip">
                {t('tools.logic.equivalence.qOnlyRegion')}
                {': '}
                <Notation>{valueList(analysis.parts.qOnly, 5)}</Notation>
              </li>
            )}
          </ul>
        )}
      </section>
    </>
  );
}
