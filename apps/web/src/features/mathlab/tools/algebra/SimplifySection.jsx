import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wand2 } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure, LabMessage } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { simplifyExpression } from './simplify.js';
import { simplifyFrames } from './simplifyFrames.js';
import { SIMPLIFY_EXAMPLES } from './examples.js';

/**
 * تبسيط التعابير — l'expression, puis le tableau qui se construit terme par
 * terme (simplifyFrames.js) : le produit désigné, l'arc « × » (التوزيع), les
 * produits posés puis calculés, les termes semblables désignés et regroupés
 * (تجميع الحدود المتشابهة), chaque famille réduite (التبسيط) — le résultat
 * au DERNIER frame. Le calcul est entièrement dans simplify.js.
 *
 * « بسّط خطوة بخطوة » charge la saisie ET démarre le déroulé ; un exemple
 * ne fait que poser l'énoncé (le bouton d'action démarre).
 */
export default function SimplifySection({ value, onChange, announce, examples = SIMPLIFY_EXAMPLES }) {
  const { t } = useTranslation('mathlab');
  const [draft, setDraft] = useState(value.source);
  const [exampleId, setExampleId] = useState(null);
  const [error, setError] = useState(null);

  const result = useMemo(() => simplifyExpression(value.source), [value.source]);
  const frames = useMemo(() => (result.ok ? simplifyFrames(result) : []), [result]);
  // Le calcul se DÉROULE : l'énoncé d'abord, puis un geste par clic ou en
  // lecture automatique ; le résultat n'arrive qu'avec le dernier frame.
  const player = useStepReveal(frames.length, { resetKey: value.source });
  // « تدرّب بنفسك » : l'élève désigne lui-même les éléments et choisit l'opération.
  const practice = useBoardPractice(frames, player, value.source);
  const finished = player.phase === 'completed';

  const run = useCallback((source) => {
    const attempt = simplifyExpression(source);
    if (!attempt.ok) {
      setError(t(`tools.algebra.exprErrors.${attempt.error.code}`, { defaultValue: t('tools.algebra.exprErrors.syntax'), symbol: attempt.error.symbol ?? '' }));

      return false;
    }
    setError(null);
    onChange({ source: source.slice(0, 200) });
    // Le résultat n'est pas annoncé d'avance : il arrive avec le dernier pas.
    announce(t('tools.algebra.stepsReady'));

    return true;
  }, [onChange, t, announce]);

  const submit = useCallback((event) => {
    event.preventDefault();
    setExampleId(null);
    if (run(draft)) player.start();
  }, [draft, run, player]);

  const pick = useCallback((id) => {
    const example = examples.find((item) => item.id === id);
    if (!example) return;
    setDraft(example.source);
    // Un exemple POSE l'énoncé ; seul le bouton d'action démarre le déroulé.
    if (run(example.source)) setExampleId(id);
    player.rewind();
  }, [run, player, examples]);

  return (
    <div className="sa-ml-alg__body" data-ml-alg-mode="simplify">
      <div className="sa-ml-alg__stage sa-ml-alg__stage--steps">
        {result.ok ? (
          <div className="sa-ml-alg__work" data-ml-alg-simplify>
            <StepPlayer player={player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-alg-step" {...practice.player} />
            <MathBoard frames={frames} cursor={player.cursor} problem={result.steps[0].latex} label={t('tools.algebra.boardLabel')} dataAttr="data-ml-alg-board" {...practice.board} />
            {finished && result.kind === 'polynomial' && (
              <div className="sa-ml-alg__result" data-ml-alg-simplify-result>
                <span className="sa-ml-alg__result-label">{t('tools.algebra.simplify.result')}</span>
                <span dir="ltr"><MathText>{`$${result.resultLatex}$`}</MathText></span>
              </div>
            )}
            {finished && result.kind === 'fraction' && (
              <>
                {result.irreducible && <LabMessage tone="info">{t('tools.algebra.simplify.irreducible')}</LabMessage>}
                {!result.irreducible && (
                  <div className="sa-ml-alg__result" data-ml-alg-simplify-result>
                    <span className="sa-ml-alg__result-label">{t('tools.algebra.simplify.result')}</span>
                    <span dir="ltr"><MathText>{`$${result.resultLatex}$`}</MathText></span>
                  </div>
                )}
                <p className="sa-ml-alg__restriction" data-ml-alg-restriction>
                  {result.restriction.latex
                    ? <MathText>{t(result.restriction.complete ? 'tools.algebra.simplify.restriction' : 'tools.algebra.simplify.restrictionPartial', { condition: `$${result.restriction.latex}$` })}</MathText>
                    : t('tools.algebra.simplify.restrictionGeneric')}
                </p>
              </>
            )}
          </div>
        ) : (
          <LabMessage tone="error">{t(`tools.algebra.exprErrors.${result.error.code}`, { defaultValue: t('tools.algebra.exprErrors.syntax'), symbol: result.error.symbol ?? '' })}</LabMessage>
        )}
      </div>

      <div className="sa-ml-alg__panel">
        <div className="sa-ml-alg__panel-body">
          <section className="sa-ml-alg__section">
            <h3 className="sa-ml-alg__heading">{t('tools.algebra.simplify.heading')}</h3>
            <form className="sa-ml-alg__equation-form" onSubmit={submit}>
              <label className="sa-ml-alg__sr" htmlFor="sa-ml-alg-simplify-input">{t('tools.algebra.simplify.inputLabel')}</label>
              <input
                id="sa-ml-alg-simplify-input"
                className="sa-ml-alg__input"
                type="text"
                dir="ltr"
                lang="en"
                autoComplete="off"
                spellCheck="false"
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setError(null); }}
                placeholder="(x + 2)(x - 3)"
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'sa-ml-alg-simplify-error' : undefined}
                data-ml-alg-simplify-input
              />
              <button type="submit" className="sa-ml-alg__explore" data-ml-alg-simplify-run>
                <Wand2 size={15} aria-hidden="true" />
                {t('tools.algebra.simplify.run')}
              </button>
            </form>
            {error && <LabMessage tone="error" id="sa-ml-alg-simplify-error">{error}</LabMessage>}
            <p className="sa-ml-alg__hint">{t('tools.algebra.simplify.hint')}</p>
            <ExamplePicker examples={examples} onPick={pick} activeId={exampleId} dataAttr="data-ml-alg-example" />
          </section>

          <LabDisclosure kind="rule" dataAttr="data-ml-alg-rule">
            <ul className="sa-ml-alg__rules">
              {['distributive', 'doubleDistributive', 'squareSum', 'squareDiff', 'diffSquares', 'minusBracket', 'groupLikeTerms'].map((rule) => (
                <li key={rule}><MathText>{t(`tools.algebra.rules.${rule}`)}</MathText></li>
              ))}
            </ul>
          </LabDisclosure>
          <LabDisclosure kind="why">
            <p className="sa-ml-alg__prose">{t('tools.algebra.simplify.why')}</p>
          </LabDisclosure>
        </div>
      </div>
    </div>
  );
}
