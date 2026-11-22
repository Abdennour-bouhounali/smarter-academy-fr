import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { LabDisclosure, ExamplePicker, LabMessage, StepList } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import CheckedInput from './CheckedInput.jsx';
import { powerSteps, powerRuleSteps, scientificSteps, localizeSteps } from './solutionSteps.js';
import { rootFrames, rootProblem } from './rootFrames.js';
import {
  powerOf, applyPowerRule, powerOfTen, scientificNotation, simplifySqrt, readIntegerInRange,
  POWER_RULES, POWER_EXAMPLES, ROOT_EXAMPLES, SCIENTIFIC_EXAMPLES, MAX_BASE, MAX_EXPONENT, MAX_ROOT, MAX_GRID_SIDE,
} from './powers.js';
import { POWER_TABS } from './numberState.js';

/**
 * القوى والجذور — quatre onglets d'un même mode :
 *
 *   القوّة               a^n écrite en produit, a^0 = 1, a^{-n} = 1/a^n, puissances de 10
 *   قواعد الحساب         produit, quotient, puissance de puissance — VÉRIFIÉES par le calcul
 *   الكتابة العلمية      d'un nombre TAPÉ, lue depuis ses chiffres (jamais un flottant)
 *   الجذر التربيعي       carré parfait dessiné, simplification exacte, valeur « مقرّبة »
 *
 * Toute la mathématique est dans `powers.js` (BigInt) ; ce composant affiche
 * le LaTeX qu'il reçoit, par MathText (isolé en LTR).
 *
 * Chaque calcul se DÉROULE avec le lecteur partagé (jamais d'un bloc) :
 * la puissance facteur par facteur, la règle appliquée pas à pas, le
 * déplacement de la virgule (StepList, `solutionSteps.js`) ; la racine se
 * simplifie AU TABLEAU (MathBoard, `rootFrames.js`). Le résultat est le
 * DERNIER pas ; les notes qui le supposent (signe, écriture décimale,
 * vérification, encadrement, carré dessiné) n'apparaissent qu'après lui.
 * Seule la table des puissances de 10 reste une lecture permanente.
 */
export default function PowersMode({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.powers';

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--powers" data-ml-nb-powers data-ml-nb-powers-tab={state.tab}>
      <div className="sa-ml-nb__tabs" role="tablist" aria-label={t(`${K}.tabsLabel`)}>
        {POWER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={state.tab === tab}
            className={`sa-ml-nb__tab${state.tab === tab ? ' is-active' : ''}`}
            onClick={() => onChange({ tab })}
            data-ml-nb-powers-tabchip={tab}
          >
            {t(`${K}.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {state.tab === 'power' && <PowerTab state={state} onChange={onChange} />}
      {state.tab === 'rules' && <RulesTab state={state} onChange={onChange} />}
      {state.tab === 'scientific' && <ScientificTab state={state} onChange={onChange} />}
      {state.tab === 'roots' && <RootsTab state={state} onChange={onChange} />}
    </div>
  );
}

const baseText = (base) => (base < 0 ? `(${base})` : String(base));

const errorOf = (t, code) => t(`tools.numberLab.powers.errors.${code}`, { defaultValue: t('tools.numberLab.powers.errors.notNumber') });

function PowerTab({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.powers';
  const result = useMemo(() => powerOf(state.base, state.exponent), [state.base, state.exponent]);
  const steps = useMemo(() => (result.error ? [] : powerSteps(state.base, state.exponent)), [result, state.base, state.exponent]);
  const player = useStepReveal(steps.length, { resetKey: `${state.base}^${state.exponent}` });
  const tens = useMemo(() => [-3, -2, -1, 0, 1, 2, 3].map(powerOfTen), []);
  const examples = POWER_EXAMPLES.map((example) => ({ ...example, label: `${example.base < 0 ? `(${example.base})` : example.base}^${example.exp}` }));

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-power>
      <h4>{t(`${K}.powerTitle`)}</h4>
      <p className="sa-ml-nb__muted">{t(`${K}.powerHint`)}</p>
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <CheckedInput
          value={state.base}
          onValue={(base) => onChange({ base })}
          read={(raw) => readIntegerInRange(raw, MAX_BASE)}
          errorText={(code) => (code === 'tooLarge' ? errorOf(t, 'baseTooLarge') : errorOf(t, code))}
          label={t(`${K}.base`)}
          dataAttr="data-ml-nb-power-base"
        />
        <CheckedInput
          value={state.exponent}
          onValue={(exponent) => onChange({ exponent })}
          read={(raw) => readIntegerInRange(raw, MAX_EXPONENT)}
          errorText={(code) => (code === 'tooLarge' ? errorOf(t, 'exponentTooLarge') : errorOf(t, code))}
          label={t(`${K}.exponent`)}
          dataAttr="data-ml-nb-power-exponent"
        />
      </div>
      <ExamplePicker
        examples={examples}
        activeId={POWER_EXAMPLES.find((e) => e.base === state.base && e.exp === state.exponent)?.id ?? null}
        onPick={(id) => {
          const example = POWER_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ base: example.base, exponent: example.exp });
        }}
        dataAttr="data-ml-nb-power-example"
      />

      {result.error ? (
        <LabMessage tone="error">{errorOf(t, result.error)}</LabMessage>
      ) : (
        <div data-ml-nb-power-derivation {...(player.done ? { 'data-ml-nb-power-result': result.text } : {})}>
          <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{`$${baseText(state.base)}^{${state.exponent}} = \\ ?$`}</MathText></div>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          <StepList steps={localizeSteps(t, steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-power-steps" />
          {player.done && state.base < 0 && state.exponent !== 0 && (
            <p className="sa-ml-nb__muted">{t(Math.abs(state.exponent) % 2 === 0 ? `${K}.signEven` : `${K}.signOdd`)}</p>
          )}
          {player.done && state.exponent < 0 && (
            <p className="sa-ml-nb__muted">
              {t(`${K}.decimalWriting`)}{' '}
              <bdi dir="ltr" className="sa-ml-nb__ltr">{`${result.decimal.exact ? '' : '≈ '}${result.decimal.text}`}</bdi>
            </p>
          )}
        </div>
      )}

      <LabDisclosure kind="rule" dataAttr="data-ml-nb-power-rules">
        <p>{t(`${K}.zeroRule`)}</p>
        <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{'$a^{0} = 1 \\quad (a \\neq 0)$'}</MathText></div>
        <p>{t(`${K}.negativeRule`)}</p>
        <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{'$a^{-n} = \\dfrac{1}{a^{n}} \\quad (a \\neq 0)$'}</MathText></div>
      </LabDisclosure>

      <h5 className="sa-ml-nb__subheading">{t(`${K}.powersOfTen`)}</h5>
      <p className="sa-ml-nb__muted">{t(`${K}.powersOfTenHint`)}</p>
      <ul className="sa-ml-nb__tens" dir="ltr">
        {tens.map((entry) => (
          <li key={entry.n}><MathText>{`$${entry.latex}$`}</MathText></li>
        ))}
      </ul>
    </section>
  );
}

function RulesTab({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.powers';
  const applied = useMemo(
    () => applyPowerRule(state.rule, state.ruleBase, state.m, state.n),
    [state.rule, state.ruleBase, state.m, state.n],
  );
  const steps = useMemo(() => powerRuleSteps(applied), [applied]);
  const player = useStepReveal(steps.length, { resetKey: `${state.rule}|${state.ruleBase}|${state.m}|${state.n}` });
  const read = (max) => (raw) => readIntegerInRange(raw, max);

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-power-rule={state.rule}>
      <h4>{t(`${K}.rulesTitle`)}</h4>
      <p className="sa-ml-nb__muted">{t(`${K}.rulesHint`)}</p>
      <div className="sa-ml-kit-examples__chips" role="group" aria-label={t(`${K}.rulesTitle`)}>
        {POWER_RULES.map((rule) => (
          <button
            key={rule}
            type="button"
            className={`sa-ml-kit-chip${state.rule === rule ? ' is-active' : ''}`}
            aria-pressed={state.rule === rule}
            onClick={() => onChange({ rule })}
            data-ml-nb-power-rulechip={rule}
          >
            {t(`${K}.rules.${rule}`)}
          </button>
        ))}
      </div>
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <CheckedInput
          value={state.ruleBase}
          onValue={(ruleBase) => onChange({ ruleBase })}
          read={(raw) => {
            const r = read(20)(raw);

            return r.value === 0 ? { error: 'zeroBase' } : r;
          }}
          errorText={(code) => (code === 'tooLarge' ? errorOf(t, 'ruleBaseTooLarge') : errorOf(t, code))}
          label={t(`${K}.ruleBase`)}
        />
        <CheckedInput
          value={state.m}
          onValue={(m) => onChange({ m })}
          read={read(12)}
          errorText={(code) => (code === 'tooLarge' ? errorOf(t, 'ruleExponentTooLarge') : errorOf(t, code))}
          label={t(`${K}.m`)}
        />
        <CheckedInput
          value={state.n}
          onValue={(n) => onChange({ n })}
          read={read(12)}
          errorText={(code) => (code === 'tooLarge' ? errorOf(t, 'ruleExponentTooLarge') : errorOf(t, code))}
          label={t(`${K}.n`)}
        />
      </div>

      {applied.error ? (
        <LabMessage tone="error">{errorOf(t, applied.error)}</LabMessage>
      ) : (
        <div data-ml-nb-power-rule-derivation>
          <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{`$${applied.latexStart} = \\ ?$`}</MathText></div>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          <StepList steps={localizeSteps(t, steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-power-rule-steps" />
          {/* La règle n'est pas affirmée : les deux membres, calculés à part, APRÈS le dernier pas. */}
          {player.done && (
            <>
              <div className="sa-ml-nb__math-line" dir="ltr" data-ml-nb-power-rule-check>
                <MathText>{`$${applied.left} = ${applied.right}$`}</MathText>
              </div>
              {applied.holds && <LabMessage tone="success">{t(`${K}.verified`)}</LabMessage>}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function ScientificTab({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.powers';
  const result = useMemo(() => scientificNotation(state.scientific), [state.scientific]);
  const steps = useMemo(() => scientificSteps(result), [result]);
  const player = useStepReveal(steps.length, { resetKey: state.scientific });
  const examples = SCIENTIFIC_EXAMPLES.map((example) => ({ ...example, label: example.text }));

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-scientific>
      <h4>{t(`${K}.scientificTitle`)}</h4>
      <p className="sa-ml-nb__muted"><MathText>{t(`${K}.scientificDefinition`)}</MathText></p>
      <CheckedInput
        value={state.scientific}
        onValue={(scientific) => onChange({ scientific })}
        read={(raw) => {
          const parsed = scientificNotation(raw);

          return parsed.error ? { error: parsed.error } : { value: String(raw).trim().slice(0, 32) };
        }}
        errorText={(code) => errorOf(t, code === 'notNumber' ? 'scientificNotNumber' : code)}
        label={t(`${K}.scientificInput`)}
        placeholder={t(`${K}.scientificPlaceholder`)}
        inputMode="decimal"
        dataAttr="data-ml-nb-scientific-input"
      />
      <ExamplePicker
        examples={examples}
        activeId={SCIENTIFIC_EXAMPLES.find((e) => e.text === state.scientific)?.id ?? null}
        onPick={(id) => {
          const example = SCIENTIFIC_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ scientific: example.text });
        }}
      />
      {result.error ? (
        <LabMessage tone="error">{errorOf(t, result.error === 'notNumber' ? 'scientificNotNumber' : result.error)}</LabMessage>
      ) : (
        <div data-ml-nb-scientific-derivation {...(player.done ? { 'data-ml-nb-scientific-result': `${result.mantissa}e${result.exponent}` } : {})}>
          <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{`$${result.original.replace(',', '{,}')} = a \\times 10^{n}$`}</MathText></div>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          <StepList steps={localizeSteps(t, steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-scientific-steps" />
        </div>
      )}
    </section>
  );
}

function RootsTab({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.powers';
  const result = useMemo(() => simplifySqrt(state.root), [state.root]);
  const frames = useMemo(() => rootFrames(result), [result]);
  const player = useStepReveal(frames.length, { resetKey: state.root });
  const practice = useBoardPractice(frames, player, state.root);
  const examples = ROOT_EXAMPLES.map((example) => ({ ...example, label: `√${example.n}` }));

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-roots>
      <h4>{t(`${K}.rootsTitle`)}</h4>
      <CheckedInput
        value={state.root}
        onValue={(root) => onChange({ root })}
        read={(raw) => {
          const r = readIntegerInRange(raw, MAX_ROOT);
          if (r.error) return r;

          return r.value < 0 ? { error: 'negative' } : r;
        }}
        errorText={(code) => errorOf(t, code === 'tooLarge' ? 'rootTooLarge' : code)}
        label={t(`${K}.rootInput`)}
        dataAttr="data-ml-nb-root-input"
      />
      <ExamplePicker
        examples={examples}
        activeId={ROOT_EXAMPLES.find((e) => e.n === state.root)?.id ?? null}
        onPick={(id) => {
          const example = ROOT_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ root: example.n });
        }}
      />

      {result.error ? (
        <LabMessage tone="error">{errorOf(t, result.error)}</LabMessage>
      ) : (
        <div data-ml-nb-root-derivation {...(player.done ? { 'data-ml-nb-root-result': result.latex } : {})}>
          <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-nb-step" />
          <MathBoard {...practice.board} frames={frames} cursor={player.cursor} problem={rootProblem(result.n)} dataAttr="data-ml-nb-root-frame" />

          {/* Après le dernier pas : le carré dessiné, ou l'encadrement et la valeur approchée. */}
          {player.done && result.perfect && (
            <>
              {result.n > 0 && <p>{t(`${K}.rootPerfect`, { side: result.outer })}</p>}
              {result.outer > 0 && result.outer <= MAX_GRID_SIDE ? (
                <div
                  className="sa-ml-nb__square-grid"
                  role="img"
                  aria-label={t(`${K}.rootGridLabel`, { side: result.outer, n: result.n })}
                  style={{ gridTemplateColumns: `repeat(${result.outer}, 1fr)` }}
                  data-ml-nb-root-grid={result.outer}
                >
                  {Array.from({ length: result.n }, (_, i) => <span key={i} />)}
                </div>
              ) : result.outer > MAX_GRID_SIDE && <p className="sa-ml-nb__muted">{t(`${K}.rootGridTooBig`)}</p>}
            </>
          )}
          {player.done && !result.perfect && (
            <>
              <p className="sa-ml-nb__muted">{t(`${K}.rootBounds`)}</p>
              <div className="sa-ml-nb__math-line" dir="ltr">
                <MathText>{`$${result.bounds.lowSquare} < ${result.n} < ${result.bounds.highSquare} \\quad\\Rightarrow\\quad ${result.bounds.low} < \\sqrt{${result.n}} < ${result.bounds.high}$`}</MathText>
              </div>
              <p className="sa-ml-nb__approx" data-ml-nb-root-approx>
                <strong>{t(`${K}.approx`)}:</strong>{' '}
                <bdi dir="ltr" className="sa-ml-nb__ltr">{`√${result.n} ≈ ${result.approx}`}</bdi>
                {' '}
                <span className="sa-ml-nb__muted">{t(`${K}.approxNote`)}</span>
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
