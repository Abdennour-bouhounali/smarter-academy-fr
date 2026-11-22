import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Parentheses, CheckCircle2 } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure, LabMessage } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { factorExpression } from './factor.js';
import { factorFrames } from './factorFrames.js';
import { FACTOR_EXAMPLES } from './examples.js';
import { isBeyondMoyenFactorization } from './scope.js';

const math = (value) => `$${value}$`;

/**
 * التحليل إلى عوامل — le raisonnement, pas seulement le résultat : le
 * facteur commun, l'identité reconnue, les couples candidats (somme et
 * produit) avec celui qui convient mis en avant, puis la VÉRIFICATION par
 * développement. La méthode du مميّز reste dans un pli : au-delà du
 * programme de quatrième, jamais l'écran d'ouverture.
 *
 * Le raisonnement se construit au tableau (factorFrames.js) : chercher deux
 * nombres, les candidats, [2] ⌒× [3] ↓ 6, [2] ⌒+ [3] ↓ 5, les facteurs qui
 * s'écrivent — la factorisation au DERNIER frame. La vérification par
 * développement et le مميّز n'apparaissent qu'ensuite. « حلّل خطوة بخطوة »
 * charge la saisie ET démarre ; un exemple ne fait que poser l'énoncé.
 *
 * `features` (scope.js) : dans مخبر المتوسط, seuls le facteur commun et les
 * identités remarquables sont déroulés. Une expression qui exige « مجموع
 * وجداء », la méthode « ac » ou le مميّز n'est pas déroulée : une phrase dit
 * que ces méthodes sont celles du ثانوي. Le pli du مميّز n'existe pas.
 */
export default function FactorSection({ value, onChange, announce, features = null }) {
  const { t } = useTranslation('mathlab');
  const examples = features?.examples ?? FACTOR_EXAMPLES;
  const moyenOnly = features?.methods === 'moyen';
  const showDiscriminant = features?.discriminant !== false;
  const rules = features?.rules ?? ['commonFactorRule', 'diffSquares', 'perfectSquareSum', 'perfectSquareDiff', 'sumProductRule'];
  const [draft, setDraft] = useState(value.source);
  const [exampleId, setExampleId] = useState(null);
  const [error, setError] = useState(null);

  const result = useMemo(() => factorExpression(value.source), [value.source]);
  const beyondLab = moyenOnly && isBeyondMoyenFactorization(result);
  const frames = useMemo(() => (result.ok && !beyondLab ? factorFrames(result) : []), [result, beyondLab]);
  // Le raisonnement se DÉROULE geste par geste ; la vérification et la
  // méthode du مميّز n'arrivent qu'après le dernier frame.
  const player = useStepReveal(frames.length, { resetKey: value.source });
  // « تدرّب بنفسك » : l'élève désigne lui-même les éléments et choisit l'opération.
  const practice = useBoardPractice(frames, player, value.source);
  const finished = player.phase === 'completed';

  const run = useCallback((source) => {
    const attempt = factorExpression(source);
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
    <div className="sa-ml-alg__body" data-ml-alg-mode="factor">
      <div className="sa-ml-alg__stage sa-ml-alg__stage--steps">
        {result.ok && beyondLab && (
          <div className="sa-ml-alg__work" data-ml-alg-factor data-ml-alg-factor-status="beyondLab">
            <LabMessage tone="info">{t('tools.algebra.factor.beyondLab')}</LabMessage>
          </div>
        )}
        {result.ok && !beyondLab && (
          <div className="sa-ml-alg__work" data-ml-alg-factor data-ml-alg-factor-status={result.status}>
            <StepPlayer player={player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-alg-step" {...practice.player} />
            <MathBoard frames={frames} cursor={player.cursor} problem={result.original} label={t('tools.algebra.boardLabel')} dataAttr="data-ml-alg-board" {...practice.board} />

            {finished && result.status !== 'factored' && (
              <LabMessage tone="info">
                {t(`tools.algebra.factor.status.${result.status}`)}
              </LabMessage>
            )}

            {finished && result.status === 'factored' && result.verification && (
              <div className="sa-ml-alg__check" data-ml-alg-factor-verify={String(result.verification.holds)}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <div>
                  <p className="sa-ml-alg__check-title">{t('tools.algebra.factor.verifyTitle')}</p>
                  <div dir="ltr"><MathText>{`$${result.verification.latex}$`}</MathText></div>
                  <p className="sa-ml-alg__check-verdict">{t('tools.algebra.factor.verifyTrue')}</p>
                </div>
              </div>
            )}

            {finished && showDiscriminant && result.discriminant && (
              <LabDisclosure kind="note" title={t('tools.algebra.factor.discriminantTitle')} dataAttr="data-ml-alg-discriminant">
                <p className="sa-ml-alg__prose">
                  <MathText>{t('tools.algebra.factor.discriminantIntro', { trinomial: math(result.discriminant.trinomial) })}</MathText>
                </p>
                {result.discriminant.lines.map((line) => (
                  <div key={line} className="sa-ml-alg__disc-line" dir="ltr"><MathText>{`$${line}$`}</MathText></div>
                ))}
                <p className="sa-ml-alg__prose">
                  {t(`tools.algebra.factor.discriminant.${result.discriminant.kind === 'none' ? 'negative' : (result.discriminant.kind === 'double' ? 'zero' : (result.discriminant.rational ? 'positiveRational' : 'positiveIrrational'))}`)}
                </p>
                {result.discriminant.factored && (
                  <div className="sa-ml-alg__disc-line" dir="ltr"><MathText>{`$${result.expanded} = ${result.discriminant.factored}$`}</MathText></div>
                )}
              </LabDisclosure>
            )}
          </div>
        )}
        {!result.ok && (
          <LabMessage tone="error">{t(`tools.algebra.exprErrors.${result.error.code}`, { defaultValue: t('tools.algebra.exprErrors.syntax'), symbol: result.error.symbol ?? '' })}</LabMessage>
        )}
      </div>

      <div className="sa-ml-alg__panel">
        <div className="sa-ml-alg__panel-body">
          <section className="sa-ml-alg__section">
            <h3 className="sa-ml-alg__heading">{t('tools.algebra.factor.heading')}</h3>
            <form className="sa-ml-alg__equation-form" onSubmit={submit}>
              <label className="sa-ml-alg__sr" htmlFor="sa-ml-alg-factor-input">{t('tools.algebra.factor.inputLabel')}</label>
              <input
                id="sa-ml-alg-factor-input"
                className="sa-ml-alg__input"
                type="text"
                dir="ltr"
                lang="en"
                autoComplete="off"
                spellCheck="false"
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setError(null); }}
                placeholder={features?.placeholder ?? 'x^2 + 5x + 6'}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'sa-ml-alg-factor-error' : undefined}
                data-ml-alg-factor-input
              />
              <button type="submit" className="sa-ml-alg__explore" data-ml-alg-factor-run>
                <Parentheses size={15} aria-hidden="true" />
                {t('tools.algebra.factor.run')}
              </button>
            </form>
            {error && <LabMessage tone="error" id="sa-ml-alg-factor-error">{error}</LabMessage>}
            <p className="sa-ml-alg__hint">{t(moyenOnly ? 'tools.algebra.factor.hintMoyen' : 'tools.algebra.factor.hint')}</p>
            <ExamplePicker examples={examples} onPick={pick} activeId={exampleId} dataAttr="data-ml-alg-example" />
          </section>

          <LabDisclosure kind="rule" dataAttr="data-ml-alg-rule">
            <ul className="sa-ml-alg__rules">
              {rules.map((rule) => (
                <li key={rule}><MathText>{t(`tools.algebra.rules.${rule}`)}</MathText></li>
              ))}
            </ul>
          </LabDisclosure>
          <LabDisclosure kind="why">
            <p className="sa-ml-alg__prose">{t(moyenOnly ? 'tools.algebra.factor.whyMoyen' : 'tools.algebra.factor.why')}</p>
          </LabDisclosure>
        </div>
      </div>
    </div>
  );
}
