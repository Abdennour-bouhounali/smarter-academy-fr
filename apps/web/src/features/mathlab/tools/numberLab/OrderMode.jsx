import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { LabDisclosure, ExamplePicker, LabMessage } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { evaluateStepByStep, ORDER_EXAMPLES, randomExpression } from './orderOfOperations.js';
import { orderFrames } from './orderFrames.js';

/**
 * أولويات العمليات — l'élève TAPE une expression, et la voit se réduire
 * une opération à la fois, dans l'ordre de l'école.
 *
 * Chaque réduction se fait AU TABLEAU (MathBoard, frames de `orderFrames.js`) :
 * l'opération prioritaire désignée dans l'expression entière, l'arc qui porte
 * son opérateur, la valeur qui tombe, puis la valeur qui prend sa place —
 * ligne acquise « = … ». La règle appliquée est dite en arabe à chaque pas.
 * La valeur finale n'est écrite qu'au DERNIER pas (le cadre « النتيجة » aussi).
 *
 * « احسب » lance le déroulé (`player.start()`) ; changer l'expression ou
 * d'exemple ramène à l'énoncé. Seul le TEXTE tapé est enregistré
 * (`order.expression`), jamais le curseur.
 */
export default function OrderMode({ state, onChange }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.order';
  const [draft, setDraft] = useState(state.expression);
  useEffect(() => { setDraft(state.expression); }, [state.expression]);

  const run = useMemo(() => evaluateStepByStep(state.expression), [state.expression]);
  const frames = useMemo(() => orderFrames(run), [run]);
  const player = useStepReveal(frames.length, { resetKey: state.expression });

  const commit = (text) => { if (text !== state.expression) onChange({ expression: text }); };
  const compute = (text) => { player.start(); commit(text); };
  const examples = ORDER_EXAMPLES.map((example) => ({ ...example, label: example.expression }));
  const inputId = useId();

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--order" data-ml-nb-order>
      <h3 className="sa-ml-nb__heading">{t(`${K}.title`)}</h3>

      <div className="sa-ml-nb__field sa-ml-nb__field--wide">
        <label className="sa-ml-nb__label" htmlFor={inputId}>{t(`${K}.inputLabel`)}</label>
        <div className="sa-ml-nb__row">
          <input
            id={inputId}
            type="text"
            dir="ltr"
            className="sa-ml-nb__input sa-ml-nb__input--expression"
            value={draft}
            maxLength={120}
            spellCheck={false}
            autoComplete="off"
            placeholder={t(`${K}.placeholder`)}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={(event) => commit(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); compute(event.currentTarget.value); } }}
            data-ml-nb-order-input
          />
          <button type="button" className="sa-ml-nb__button" onClick={() => compute(draft)} data-ml-nb-order-compute>
            {t(`${K}.compute`)}
          </button>
        </div>
        <p className="sa-ml-nb__hint">{t(`${K}.inputHint`)}</p>
      </div>

      <ExamplePicker
        examples={examples}
        activeId={ORDER_EXAMPLES.find((e) => e.expression === state.expression)?.id ?? null}
        onPick={(id) => {
          const example = ORDER_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ expression: example.expression });
        }}
        onRandom={() => onChange({ expression: randomExpression() })}
        dataAttr="data-ml-nb-order-example"
      />

      <OrderSteps expression={state.expression} run={run} frames={frames} player={player} />

      <LabDisclosure kind="rule" title={t(`${K}.rulesTitle`)} dataAttr="data-ml-nb-order-rules">
        <ol className="sa-ml-nb__rules-list">
          <li>{t(`${K}.rule1`)}</li>
          <li>{t(`${K}.rule2`)}</li>
          <li>{t(`${K}.rule3`)}</li>
          <li>{t(`${K}.rule4`)}</li>
        </ol>
        <p><MathText>{t(`${K}.trap`)}</MathText></p>
      </LabDisclosure>
    </div>
  );
}

function OrderSteps({ expression, run, frames, player }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.order';
  const steps = run.steps ?? [];
  const { cursor } = player;
  const practice = useBoardPractice(frames, player, expression);

  // Erreur d'ANALYSE : rien à dérouler, on dit où.
  if (!run.ok && !run.initialLatex) {
    return (
      <div data-ml-nb-order-error={run.error.code}>
        <LabMessage tone="error">
          {t(`${K}.errorAt`, { pos: run.error.pos + 1 })}{' '}
          {t(`${K}.errors.${run.error.code}`, { char: run.error.char ?? '' })}
        </LabMessage>
        <ErrorCaret expression={expression} pos={run.error.pos} />
      </div>
    );
  }

  const done = player.done;
  const finished = run.ok && done;

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-order-steps={steps.length} data-ml-nb-order-cursor={cursor}>
      <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, cursor)} dataAttr="data-ml-nb-step" />

      <MathBoard {...practice.board} frames={frames} cursor={cursor} problem={run.initialLatex} label={t(`${K}.expression`)} dataAttr="data-ml-nb-order-frame" />

      {/* Erreur de CALCUL (division par 0…) : les pas faits restent, et on montre où ça s'arrête. */}
      {!run.ok && done && (
        <div data-ml-nb-order-error={run.error.code}>
          <p className="sa-ml-nb__muted">{t(`${K}.stoppedAt`)}</p>
          {run.failingLatex && (
            <div className="sa-ml-nb__math-line" dir="ltr"><MathText>{`$${run.failingLatex}$`}</MathText></div>
          )}
          <LabMessage tone="error">{t(`${K}.errors.${run.error.code}`)}</LabMessage>
        </div>
      )}

      {/* Le cadre du résultat — seulement une fois le dernier pas montré. */}
      {finished && (
        <div className="sa-ml-nb__order-result" data-ml-nb-order-result={run.result.fraction}>
          <strong>{t(`${K}.result`)}</strong>
          <div className="sa-ml-nb__math-line sa-ml-nb__math-line--big" dir="ltr"><MathText>{`$${run.result.latex}$`}</MathText></div>
          {!run.result.isInteger && (
            <p className="sa-ml-nb__muted">
              {t(`${K}.decimal`)}{' '}
              <bdi dir="ltr" className="sa-ml-nb__ltr">{`${run.result.decimal.exact ? '' : '≈ '}${run.result.decimal.text}`}</bdi>
              {!run.result.decimal.exact && ` (${t(`${K}.approx`)})`}
            </p>
          )}
          <p className="sa-ml-nb__muted">{t(`${K}.stepsTotal`, { count: steps.length })}</p>
        </div>
      )}
    </section>
  );
}

/** L'expression tapée, le caractère fautif souligné — la position se VOIT. */
function ErrorCaret({ expression, pos }) {
  const safe = Math.max(0, Math.min(pos, expression.length));

  return (
    <p className="sa-ml-nb__formula sa-ml-nb__error-caret" dir="ltr" aria-hidden="true">
      {expression.slice(0, safe)}
      <mark>{expression.slice(safe, safe + 1) || ' '}</mark>
      {expression.slice(safe + 1)}
    </p>
  );
}
