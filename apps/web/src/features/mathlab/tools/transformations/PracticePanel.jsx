import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, RefreshCw, Play, Puzzle, ListOrdered } from 'lucide-react';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { VERTEX_NAMES } from './transformState.js';
import { PUZZLES, describeChallengeStep } from './practice.js';
import { buildRevealSteps } from './practiceSteps.js';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import { StepList } from '../../shared/LabKit.jsx';

/**
 * PRÉDIRE → TRANSFORMER → VÉRIFIER (§38 – §40) et les PUZZLES (§42).
 *
 * Deux règles gouvernent ce panneau :
 *
 *   1. On ne BLOQUE jamais. Une réponse fausse donne la bonne réponse et
 *      lance l'animation : l'élève VOIT où il s'était trompé. Il n'y a pas
 *      de « réessayez » qui retienne.
 *   2. On n'entraîne pas sans avoir montré. Chaque vérification anime la
 *      transformation sur le plan — c'est la figure qui explique, pas le
 *      texte.
 *
 * « أرني » ne pose plus A′ d'un bloc (exigence du 2026-09-30) : il DÉROULE
 * le calcul (`buildRevealSteps` : règle → substitution → image, par
 * transformation) avec le lecteur partagé. Tant que le dernier pas n'est pas
 * atteint, il n'y a ni verdict, ni A′, ni image sur le plan, et la réponse
 * est gelée ; au dernier pas, `onReveal` pose le verdict et l'animation
 * confirme sur la figure. Après une réponse de l'élève, le même déroulé est
 * proposé (« شاهد الحلّ خطوة بخطوة ») — la réponse est déjà donnée, il
 * explique d'où elle vient.
 */
export default function PracticePanel({
  challenge, verdict, score, onNew, onSubmit, onReveal,
  puzzleId, puzzleSolved, onPuzzle, onExitPuzzle, puzzles = PUZZLES,
}) {
  const { t } = useTranslation('mathlab');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  // La question dont le déroulé est ouvert (null : aucun). Une nouvelle question le referme d'elle-même.
  const [solvingFor, setSolvingFor] = useState(null);
  const solving = Boolean(challenge) && solvingFor === challenge;
  const solution = useMemo(() => buildRevealSteps(challenge), [challenge]);
  const player = useStepReveal(solution.steps.length, { resetKey: challenge });
  const locked = Boolean(verdict) || solving;

  // Le DERNIER pas est atteint : alors seulement la réponse est posée (verdict + animation).
  useEffect(() => {
    if (solving && player.done && !verdict && solution.steps.length > 0) onReveal();
  }, [solving, player.done, verdict, solution.steps.length, onReveal]);

  const startSolution = () => {
    setSolvingFor(challenge);
    player.start();
  };

  const submitTyped = (event) => {
    event.preventDefault();
    const px = Number(String(x).replace(',', '.'));
    const py = Number(String(y).replace(',', '.'));
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    onSubmit({ x: px, y: py });
  };

  const newChallenge = () => {
    setX('');
    setY('');
    onNew();
  };

  return (
    <div className="sa-ml-tr__practice" data-ml-practice>
      {/* ── §42 : les puzzles ───────────────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <h3 className="sa-ml-tr__paneltitle">
          <Puzzle size={16} aria-hidden="true" />
          {' '}
          {t('tools.transformations.puzzles.title')}
        </h3>

        {puzzleId ? (
          <div className="sa-ml-tr__puzzleactive" data-ml-puzzle-active={puzzleId}>
            <p className="sa-ml-tr__puzzlegoal">{t('tools.transformations.puzzles.goal')}</p>
            {puzzleSolved ? (
              <p className="sa-ml-tr__verdict sa-ml-tr__verdict--ok" data-ml-puzzle-solved role="status">
                <Check size={16} aria-hidden="true" />
                {t('tools.transformations.puzzles.solved')}
              </p>
            ) : (
              <p className="sa-ml-tr__hint">{t(`tools.transformations.${PUZZLES.find((p) => p.id === puzzleId)?.hintKey ?? ''}`)}</p>
            )}
            <button type="button" className="sa-ml-btn sa-ml-tr__wide" onClick={onExitPuzzle} data-ml-puzzle-exit>
              {t('tools.transformations.puzzles.exit')}
            </button>
          </div>
        ) : (
          <ul className="sa-ml-tr__puzzlelist">
            {puzzles.map((puzzle) => (
              <li key={puzzle.id}>
                <button
                  type="button"
                  className="sa-ml-btn sa-ml-tr__wide"
                  onClick={() => onPuzzle(puzzle.id)}
                  data-ml-puzzle={puzzle.id}
                >
                  {t(`tools.transformations.${puzzle.titleKey}`)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── §38 – §40 : prédire ─────────────────────────────────────── */}
      <section className="sa-ml-tr__panelsection">
        <div className="sa-ml-tr__stackhead">
          <h3 className="sa-ml-tr__paneltitle">{t('tools.transformations.practice.title')}</h3>
          <span className="sa-ml-tr__score" data-ml-score dir="ltr">
            {`${score.solved}\u00A0/\u00A0${score.attempts}`}
          </span>
        </div>

        {!challenge ? (
          <button type="button" className="sa-ml-btn sa-ml-tr__wide sa-ml-tr__primary" onClick={newChallenge} data-ml-practice-start>
            <Play size={15} aria-hidden="true" />
            <span>{t('tools.transformations.practice.start')}</span>
          </button>
        ) : (
          <>
            <p className="sa-ml-tr__question" data-ml-question>
              {t('tools.transformations.practice.question', {
                point: `${VERTEX_NAMES[0]}(${formatValue(challenge.point.x)} ; ${formatValue(challenge.point.y)})`,
              })}
            </p>

            <ol className="sa-ml-tr__questionsteps">
              {challenge.steps.map((step, index) => {
                // Le pas ENTIER : axe, centre, sens, rapport — sans quoi la question n'a pas de réponse unique.
                const description = describeChallengeStep(step, [challenge.point]);

                return (
                  <li key={index} data-ml-question-step={description?.key ?? step.kind}>
                    {description
                      ? t(`tools.transformations.practice.stepText.${description.key}`, isolateParams(description.params))
                      : t(`tools.transformations.steps.${step.kind}`)}
                  </li>
                );
              })}
            </ol>

            {/* §39 : choisir une position parmi plusieurs. */}
            {challenge.choices ? (
              <div className="sa-ml-tr__choices" role="group" aria-label={t('tools.transformations.practice.choose')}>
                {challenge.choices.map((choice, index) => (
                  <button
                    key={index}
                    type="button"
                    className="sa-ml-btn sa-ml-tr__choice"
                    onClick={() => onSubmit(choice)}
                    disabled={locked}
                    data-ml-choice={index}
                    dir="ltr"
                  >
                    {`(${formatValue(choice.x)} ; ${formatValue(choice.y)})`}
                  </button>
                ))}
              </div>
            ) : (
              /* §38, §40 : taper les coordonnées. */
              <form className="sa-ml-tr__answerform" onSubmit={submitTyped}>
                <label className="sa-ml-tr__answerfield">
                  <span dir="ltr">x′</span>
                  <input
                    type="text" inputMode="decimal" dir="ltr" value={x}
                    onChange={(event) => setX(event.target.value)}
                    disabled={locked}
                    data-ml-answer-x
                    aria-label={t('tools.transformations.practice.answerX')}
                  />
                </label>
                <label className="sa-ml-tr__answerfield">
                  <span dir="ltr">y′</span>
                  <input
                    type="text" inputMode="decimal" dir="ltr" value={y}
                    onChange={(event) => setY(event.target.value)}
                    disabled={locked}
                    data-ml-answer-y
                    aria-label={t('tools.transformations.practice.answerY')}
                  />
                </label>
                <button type="submit" className="sa-ml-btn sa-ml-tr__primary" disabled={locked} data-ml-answer-submit>
                  {t('tools.transformations.practice.check')}
                </button>
              </form>
            )}

            {/* Le déroulé : le lecteur EN HAUT, puis les pas montrés — un pas futur n'est pas dans le DOM. */}
            {solving && (
              <div className="sa-ml-tr__solution" data-ml-tr-solution>
                <h4 className="sa-ml-tr__solutiontitle">{t('tools.transformations.practice.solution.heading')}</h4>
                <StepPlayer player={player} sticky dataAttr="data-ml-tr-step" />
                <StepList
                  steps={solution.steps.map((step) => solutionStep(step, t))}
                  revealUpTo={player.cursor - 1}
                  dataAttr="data-ml-tr-steps"
                />
              </div>
            )}

            {verdict && (
              <div
                className={`sa-ml-tr__verdict ${verdict.correct ? 'sa-ml-tr__verdict--ok' : 'sa-ml-tr__verdict--no'}`}
                role="status"
                data-ml-verdict={verdict.correct ? 'correct' : 'wrong'}
              >
                {verdict.correct ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                <span>
                  {verdict.correct
                    ? t('tools.transformations.practice.correct')
                    : t('tools.transformations.practice.wrong')}
                </span>
                {/* On ne bloque pas : la réponse est donnée, et la figure l'a montrée. */}
                <span className="sa-ml-tr__expected" dir="ltr">
                  {`${VERTEX_NAMES[0]}′(${formatValue(verdict.expected.x)} ; ${formatValue(verdict.expected.y)})`}
                </span>
              </div>
            )}

            <div className="sa-ml-tr__practiceactions">
              <button type="button" className="sa-ml-btn" onClick={startSolution} disabled={locked} data-ml-practice-reveal>
                {t('tools.transformations.practice.reveal')}
              </button>
              {verdict && !solving && solution.steps.length > 0 && (
                <button type="button" className="sa-ml-btn" onClick={startSolution} data-ml-practice-steps>
                  <ListOrdered size={15} aria-hidden="true" />
                  <span>{t('tools.transformations.practice.solution.show')}</span>
                </button>
              )}
              <button type="button" className="sa-ml-btn" onClick={newChallenge} data-ml-practice-next>
                <RefreshCw size={15} aria-hidden="true" />
                <span>{t('tools.transformations.practice.next')}</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/** Un pas de `buildRevealSteps`, habillé pour `StepList` : la phrase arabe (notations isolées) + le LaTeX. */
function solutionStep(step, t) {
  // Les notations (A(3 ; 2), A₁, 1 من 2) sont isolées en LTR ; la phrase arabe du pas, non.
  const params = isolateParams(step.params);
  if (step.describe) {
    params.transformation = t(`tools.transformations.practice.stepText.${step.describe.key}`, isolateParams(step.describe.params));
  }

  return {
    text: t(`tools.transformations.${step.textKey}`, params),
    latex: step.latex,
    tone: step.kind === 'result' ? 'result' : undefined,
  };
}

/**
 * Les paramètres de l'énoncé sont de la NOTATION (LTR) posée dans une phrase
 * arabe (RTL) : chacun est enfermé dans un isolat bidi (LRI … PDI), sinon
 * « (−2 ; 3) » ou « y = x » se retrouveraient retournés par l'algorithme
 * bidi (ARABIC_RTL_CONTRACT).
 */
function isolateParams(params) {
  return Object.fromEntries(Object.entries(params ?? {}).map(([key, value]) => [key, `\u2066${value}\u2069`]));
}
