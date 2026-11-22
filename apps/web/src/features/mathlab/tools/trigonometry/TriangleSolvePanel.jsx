import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import { StepList } from '../../shared/LabKit.jsx';
import { buildTriangleSolveSteps, solveKey } from './triangleSolveSteps.js';

/**
 * « حلّ المثلث خطوة بخطوة » — l'écriture du manuel, pas à pas.
 *
 * Le dessin reste VIVANT (la règle « on lit en manipulant ») : il se résout à
 * chaque frappe et à chaque glissement, ses longueurs suivent le doigt. Ce
 * panneau-ci déroule le RAISONNEMENT : quel rapport relie le connu à
 * l'inconnu, l'égalité, la substitution, l'isolement, le calcul — un pas à
 * la fois, le triangle résolu en dernier. Changer une donnée (ou tirer le
 * sommet) change la question : le déroulé revient à l'énoncé (`resetKey`).
 *
 * Un pas futur n'est jamais dans le DOM (StepList tranche par `revealUpTo`).
 */

/** Les paramètres qui NOMMENT un côté ou un rapport sont traduits ici ; les formules restent `$…$`. */
function localParams(params, t) {
  const out = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (key === 'ratioName') out[key] = t(`tools.trigonometry.solve.ratioNames.${value}`);
    else if (/Side$|Field$|^wanted/.test(key)) out[key] = t(`tools.trigonometry.sides.${value}`);
    else out[key] = value;
  }

  return out;
}

export default function TriangleSolvePanel({ triangle }) {
  const { t } = useTranslation('mathlab');
  const result = useMemo(() => buildTriangleSolveSteps(triangle.given, triangle), [triangle]);
  const total = result.ok ? result.steps.length : 0;
  const player = useStepReveal(total, { resetKey: solveKey(triangle.given, triangle) });

  const steps = useMemo(() => (result.ok
    ? result.steps.map((step) => ({
      latex: step.latex,
      tone: step.tone,
      text: <MathText>{t(step.textKey, localParams(step.params, t))}</MathText>,
    }))
    : []), [result, t]);

  if (!result.ok) return null;

  return (
    <section
      className="sa-ml-trig__solve"
      aria-label={t('tools.trigonometry.solve.title')}
      data-ml-trig-solve={player.phase}
    >
      <StepPlayer player={player} sticky dataAttr="data-ml-trig-step" title={t('tools.trigonometry.solve.title')} />
      {player.cursor === 0 && (
        <p className="sa-ml-trig__note" data-ml-trig-solve-intro>{t('tools.trigonometry.solve.intro')}</p>
      )}
      <StepList
        steps={steps}
        revealUpTo={player.cursor - 1}
        label={t('tools.trigonometry.solve.title')}
        dataAttr="data-ml-trig-solve-steps"
      />
      {player.done && player.cursor > 0 && (
        <p className="sa-ml-trig__note" data-ml-trig-solve-done>{t('tools.trigonometry.solve.done')}</p>
      )}
    </section>
  );
}
