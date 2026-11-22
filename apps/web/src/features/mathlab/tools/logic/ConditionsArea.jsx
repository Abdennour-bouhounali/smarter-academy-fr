import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, VerdictPill } from './LogicPieces.jsx';
import { CONDITIONS, findPreset, sampleOf } from './presets.js';
import { conditionReading } from './logicMath.js';
import { formatNumber, formOf, valueList } from './logicFormat.js';
import { setCondition } from './logicState.js';

/**
 * §18-20 — NÉCESSAIRE ET SUFFISANT.
 *
 * §18 le dit explicitement : « Do not immediately reveal the terminology.
 * Let students discover the relationship first. » L'écran pose donc d'abord
 * les deux QUESTIONS — « A suffit-il à garantir B ? », « B suffit-il à
 * garantir A ? » — et ne nomme « شرط كافٍ » / « شرط ضروري » qu'après la
 * réponse. Le vocabulaire arrive sur une relation déjà vue.
 *
 * La carte de relation (§20) se met à jour toute seule : c'est la même
 * lecture (`conditionReading`), affichée dans le sens que l'élève regarde.
 */
export default function ConditionsArea({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const state = data.conditions;
  const preset = findPreset(CONDITIONS, state.id);
  const [answered, setAnswered] = useState({ forward: null, backward: null });

  const reading = useMemo(
    () => conditionReading(preset.a.test, preset.b.test, sampleOf(preset.domain)),
    [preset],
  );

  const answer = (direction, value) => setAnswered((current) => ({ ...current, [direction]: value }));

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="conditions">
        <h2 className="sa-ml-lg__title">{t('tools.logic.conditions.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.conditions.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setCondition(c, event.target.value)); setAnswered({ forward: null, backward: null }); }}
            data-ml-lg-cond-select
          >
            {CONDITIONS.map((item) => (
              <option key={item.id} value={item.id}>{formOf('direct', item.a.formula, item.b.formula)}</option>
            ))}
          </select>
        </label>

        <Notation block lead data-ml-lg-cond-formula>
          {formOf('direct', preset.a.formula, preset.b.formula)}
        </Notation>
      </section>

      {/* ── Les deux questions, AVANT le vocabulaire (§18) ──────────────── */}
      <QuestionBlock
        id="forward"
        question={t('tools.logic.conditions.forwardQuestion')}
        truth={reading.aSufficientForB}
        answered={answered.forward}
        onAnswer={(value) => answer('forward', value)}
        explanation={t('tools.logic.conditions.aSufficient')}
        naming={[t('tools.logic.conditions.aSufficient'), t('tools.logic.conditions.bNecessary')]}
      />

      <QuestionBlock
        id="backward"
        question={t('tools.logic.conditions.backwardQuestion')}
        truth={reading.bSufficientForA}
        answered={answered.backward}
        onAnswer={(value) => answer('backward', value)}
        explanation={reading.bNotSufficientCounterexample !== null
          ? t('tools.logic.conditions.bNotSufficient', { value: formatNumber(reading.bNotSufficientCounterexample) })
          : null}
        naming={[]}
      />

      {/* ── §20 — la carte de la relation ───────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-cond-map>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.conditions.mapHeading')}</h3>
        <Notation block lead>{formOf('direct', preset.a.formula, preset.b.formula)}</Notation>

        <ul className="sa-ml-lg__chips">
          <li className="sa-ml-lg__chip sa-ml-lg__chip--true" data-ml-lg-cond-sufficient>
            {t('tools.logic.conditions.aSufficient')}
          </li>
          <li className="sa-ml-lg__chip sa-ml-lg__chip--true" data-ml-lg-cond-necessary>
            {t('tools.logic.conditions.bNecessary')}
          </li>
          {reading.bNotSufficientCounterexample !== null && (
            <li className="sa-ml-lg__chip sa-ml-lg__chip--false" data-ml-lg-cond-not-sufficient>
              {t('tools.logic.conditions.bNotSufficient', {
                value: formatNumber(reading.bNotSufficientCounterexample),
              })}
            </li>
          )}
        </ul>

        {reading.parts.qOnly.length > 0 && (
          <p className="sa-ml-lg__note">
            <Notation>{valueList(reading.parts.qOnly, 6)}</Notation>
          </p>
        )}
      </section>
    </>
  );
}

/**
 * Une question fermée dont la réponse n'est révélée qu'après le choix, et
 * dont l'explication vient du calcul, jamais d'une phrase écrite d'avance.
 */
function QuestionBlock({ id, question, truth, answered, onAnswer, explanation, naming }) {
  const { t } = useTranslation('mathlab');
  const right = answered !== null && answered === truth;

  return (
    <section className="sa-ml-lg__card" data-ml-lg-cond-question={id}>
      <p className="sa-ml-lg__question">{question}</p>

      <div className="sa-ml-lg__actions">
        <button
          type="button"
          className="sa-ml-lg__btn sa-ml-lg__btn--choice"
          aria-pressed={answered === true}
          onClick={() => onAnswer(true)}
          data-ml-lg-answer="yes"
        >
          {t('tools.logic.conditions.yes')}
        </button>
        <button
          type="button"
          className="sa-ml-lg__btn sa-ml-lg__btn--choice"
          aria-pressed={answered === false}
          onClick={() => onAnswer(false)}
          data-ml-lg-answer="no"
        >
          {t('tools.logic.conditions.no')}
        </button>
      </div>

      {answered !== null && (
        <div className={`sa-ml-lg__message sa-ml-lg__message--${right ? 'ok' : 'info'}`} role="status">
          <VerdictPill value={truth} />
          {explanation && <p className="sa-ml-lg__note">{explanation}</p>}
          {naming.length > 0 && truth && (
            <ul className="sa-ml-lg__chips">
              {naming.map((text) => <li key={text} className="sa-ml-lg__chip">{text}</li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
