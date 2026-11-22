import { useMemo } from 'react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import { LabDisclosure, StepList } from '../../shared/LabKit.jsx';
import { buildIntersectionSteps, intersectionKey } from './intersectionSteps.js';

/**
 * « الحلّ الجبري خطوة بخطوة » — pourquoi la droite coupe 0, 1 ou 2 fois.
 *
 * Les points restent VIVANTS sur le plan et le compte suit le doigt (§26,
 * §27) : c'est la manipulation. Ce pli, fermé à l'ouverture, déroule sur
 * demande la résolution algébrique (`intersectionSteps.js`) ; la conique et
 * la droite forment la question — les tirer la change, et le déroulé revient
 * à l'énoncé. Un pas futur n'est jamais dans le DOM.
 */
function IntersectionSolveBody({ conic, line, t }) {
  const result = useMemo(() => buildIntersectionSteps(conic, line), [conic, line]);
  const total = result.ok ? result.steps.length : 0;
  const player = useStepReveal(total, { resetKey: intersectionKey(conic, line) });

  const steps = useMemo(() => (result.ok
    ? result.steps.map((step) => ({
      latex: step.latex,
      tone: step.tone,
      text: <MathText>{t(step.textKey, step.params ?? {})}</MathText>,
    }))
    : []), [result, t]);

  if (!result.ok) {
    return <p className="sa-ml-cn__note" data-ml-cn-solve-unavailable>{t('tools.conics.solveIntersection.unavailable')}</p>;
  }

  return (
    <div className="sa-ml-cn__solve" data-ml-cn-solve={player.phase}>
      <StepPlayer player={player} sticky dataAttr="data-ml-cn-solve-step" title={t('tools.conics.solveIntersection.title')} />
      <StepList
        steps={steps}
        revealUpTo={player.cursor - 1}
        label={t('tools.conics.solveIntersection.title')}
        dataAttr="data-ml-cn-solve-steps"
      />
    </div>
  );
}

export default function IntersectionSolvePanel({ conic, line, t }) {
  return (
    <LabDisclosure kind="why" title={t('tools.conics.solveIntersection.title')} dataAttr="data-ml-cn-solve-panel">
      <IntersectionSolveBody conic={conic} line={line} t={t} />
    </LabDisclosure>
  );
}
