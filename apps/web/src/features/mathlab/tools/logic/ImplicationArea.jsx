import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notation, VerdictPill, TruthBadge, TruthTable, SetDiagram } from './LogicPieces.jsx';
import { IMPLICATIONS, findPreset, sampleOf } from './presets.js';
import { analyzeImplication, implicationAt } from './logicMath.js';
import { formatNumber, formOf } from './logicFormat.js';
import { IMPLICATION_FORMS, setImplication, setImplicationForm, setImplicationX, toggleSets } from './logicState.js';

/**
 * §13-16, §20 — LA CONDITIONNELLE (الشرطية).
 *
 * Trois choses se passent au même endroit, parce qu'elles sont la même
 * chose vue de trois côtés :
 *
 *   le CAS — l'élève déplace x, et lit P(x), Q(x), puis P ⇒ Q. Le cas
 *   critique (P vraie, Q fausse) est nommé quand il arrive ;
 *   l'ENSEMBLE — P ⊂ Q quand l'implication tient (§14). Le dessin est
 *   piloté par la partition réelle, donc il ne peut pas montrer une
 *   inclusion qui n'existe pas ;
 *   la TABLE — les quatre formes côte à côte (§15, §16) : la contraposée
 *   coïncide colonne pour colonne, la réciproque non. Rien n'est affirmé ;
 *   tout se lit.
 */
export default function ImplicationArea({ data, onChange, features = null }) {
  const { t } = useTranslation('mathlab');
  // Le مخبر (scope.js) : au collège, la propriété et sa réciproque seulement,
  // sans diagramme d'ensembles ni table de vérité.
  const forms = features?.implicationForms ?? IMPLICATION_FORMS;
  const showSets = features?.implicationSets !== false;
  const showTable = features?.implicationTable !== false;
  const state = data.implication;
  const preset = findPreset(IMPLICATIONS, state.id);
  const domain = preset.domain;

  const analysis = useMemo(
    () => analyzeImplication(preset.p.test, preset.q.test, sampleOf(domain)),
    [preset, domain],
  );
  const at = implicationAt(preset.p.test, preset.q.test, state.x, [], state.form);
  const active = analysis[state.form];

  const formLabels = Object.fromEntries(IMPLICATION_FORMS.map((form) => [
    form, formOf(form, 'P', 'Q'),
  ]));

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="implication">
        <h2 className="sa-ml-lg__title">{t('tools.logic.implication.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.implication.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.common.choosePreset')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => onChange((current) => setImplication(current, event.target.value))}
            data-ml-lg-impl-select
          >
            {IMPLICATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {formOf('direct', item.p.formula, item.q.formula)}
              </option>
            ))}
          </select>
        </label>

        <Notation block lead data-ml-lg-impl-formula>
          {formOf(state.form, preset.p.formula, preset.q.formula)}
        </Notation>

        <div className="sa-ml-lg__actions" role="group" aria-label={t('tools.logic.implication.formLabel')}>
          {forms.map((form) => (
            <button
              key={form}
              type="button"
              className="sa-ml-lg__btn"
              aria-pressed={state.form === form}
              onClick={() => onChange((current) => setImplicationForm(current, form))}
              data-ml-lg-form={form}
            >
              {t(`tools.logic.implication.forms.${form}`)}
            </button>
          ))}
        </div>
        <p className="sa-ml-lg__note">
          <Notation>{formLabels[state.form]}</Notation>
          {' — '}
          {t(`tools.logic.implication.formHints.${state.form}`)}
        </p>
      </section>

      {/* ── Le cas courant : ce que x fait à P et à Q ───────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-impl-case>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.implication.xLabel')}</h3>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">
            <Notation>{`x = ${formatNumber(state.x)}`}</Notation>
          </span>
          <input
            className="sa-ml-lg__input"
            type="range"
            min={domain.min}
            max={domain.max}
            step={domain.integer ? 1 : (domain.step ?? 0.5)}
            value={state.x}
            onChange={(event) => onChange((current) => setImplicationX(current, Number(event.target.value)))}
            data-ml-lg-impl-x
          />
        </label>

        <ul className="sa-ml-lg__chips" data-ml-lg-impl-readout>
          <li className={`sa-ml-lg__chip ${at.p ? 'sa-ml-lg__chip--true' : 'sa-ml-lg__chip--false'}`}>
            <Notation>{preset.p.formula}</Notation>
            {' '}
            <TruthBadge value={at.p} />
          </li>
          <li className={`sa-ml-lg__chip ${at.q ? 'sa-ml-lg__chip--true' : 'sa-ml-lg__chip--false'}`}>
            <Notation>{preset.q.formula}</Notation>
            {' '}
            <TruthBadge value={at.q} />
          </li>
        </ul>

        <p role="status" aria-live="polite" data-ml-lg-impl-verdict={String(at.result)}>
          <VerdictPill value={at.result} />
        </p>

        {at.critical && (
          <p className="sa-ml-lg__message sa-ml-lg__message--no" data-ml-lg-critical>
            {t('tools.logic.implication.criticalCase')}
          </p>
        )}
        {at.antecedent === false && (
          <p className="sa-ml-lg__message sa-ml-lg__message--info" data-ml-lg-vacuous>
            {t('tools.logic.implication.vacuous')}
          </p>
        )}
      </section>

      {/* ── Le verdict d'ensemble et le contre-exemple, s'il y en a un ──── */}
      <section className="sa-ml-lg__card" data-ml-lg-impl-verdict-card>
        <h3 className="sa-ml-lg__sectionTitle">{t(`tools.logic.implication.forms.${state.form}`)}</h3>

        <p className={`sa-ml-lg__message sa-ml-lg__message--${active.holds ? 'ok' : 'no'}`} data-ml-lg-impl-holds={String(active.holds)}>
          {active.holds ? t('tools.logic.implication.holds') : t('tools.logic.implication.fails')}
        </p>

        {!active.holds && active.counterexample !== null && (
          <p className="sa-ml-lg__note" data-ml-lg-impl-counterexample={active.counterexample}>
            {t('tools.logic.implication.converseCounterexample', { value: formatNumber(active.counterexample) })}
          </p>
        )}

        {state.form === 'converse' && active.holds && (
          <p className="sa-ml-lg__message sa-ml-lg__message--warn">{t('tools.logic.implication.converseHolds')}</p>
        )}
        {state.form === 'converse' && !active.holds && (
          <p className="sa-ml-lg__note">{t('tools.logic.implication.converseWarning')}</p>
        )}
        {state.form === 'contrapositive' && (
          <p className="sa-ml-lg__note">{t('tools.logic.implication.contrapositiveSame')}</p>
        )}
      </section>

      {/* ── §14 — l'implication comme inclusion ─────────────────────────── */}
      {showSets && (
      <section className="sa-ml-lg__card" data-ml-lg-impl-sets>
        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn"
            aria-pressed={state.showSets}
            onClick={() => onChange(toggleSets)}
            data-ml-lg-toggle-sets
          >
            {state.showSets ? t('tools.logic.implication.hideSets') : t('tools.logic.implication.showSets')}
          </button>
        </div>

        {state.showSets && (
          <>
            <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.implication.setsHeading')}</h3>
            <SetDiagram
              parts={analysis.parts}
              pLabel={preset.p.formula}
              qLabel={preset.q.formula}
              caption={t('tools.logic.implication.setsHeading')}
            />
            <p className="sa-ml-lg__note">
              {analysis.direct.holds
                ? t('tools.logic.implication.setsInside')
                : t('tools.logic.implication.setsOutside')}
            </p>
          </>
        )}
      </section>
      )}

      {/* ── §15, §16 — les quatre formes, colonne contre colonne ────────── */}
      {showTable && (
      <section className="sa-ml-lg__card" data-ml-lg-impl-table>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.connectors.tableCaption')}</h3>
        <TruthTable
          forms={['direct', 'converse', 'contrapositive', 'inverse']}
          current={at.p === null ? null : { p: at.p, q: at.q }}
          caption={t('tools.logic.connectors.tableCaption')}
          columnLabels={formLabels}
        />
        <p className="sa-ml-lg__tableNote">{t('tools.logic.implication.contrapositiveSame')}</p>
      </section>
      )}
    </>
  );
}
