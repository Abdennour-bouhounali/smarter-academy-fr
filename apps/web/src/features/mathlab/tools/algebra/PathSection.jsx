import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2, Redo2, Shuffle, Footprints, CheckCircle2, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { ExamplePicker, LabDisclosure } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import {
  parseEquation,
  applyOperation,
  classify,
  solve,
  equationToLatex,
  equationToText,
  isInequality,
  RELATION_LATEX,
  flipRelation,
} from './equation.js';
import { makeLinear, formToLatex } from './linearForm.js';
import {
  pushStep, resetTo, undo, redo, canUndo, canRedo, MAX_STEPS, MAX_INEQUALITY_STEPS,
} from './algebraState.js';
import { suggestOperations, parseOperationValue } from './operationHints.js';
import { verifyResolution } from './verify.js';
import {
  generateEquation, generateInequality, LEVELS, INEQUALITY_LEVELS, DEFAULT_LEVEL,
} from './generator.js';
import { operationLatex, solutionSet, equationExpansion } from './equationDisplay.js';
import { EQUATION_EXAMPLES, INEQUALITY_EXAMPLES } from './examples.js';
import { buildWalkthrough, hasNoUnknown } from './walkthrough.js';
import { resolutionFrames, verificationFrames } from './equationFrames.js';
import BalanceScale from './BalanceScale.jsx';
import NumberLine from './NumberLine.jsx';
import OperationControls from './OperationControls.jsx';
import StepHistory from './StepHistory.jsx';
import ParameterPanel from './ParameterPanel.jsx';

/**
 * LA SECTION-CHEMIN : المعادلات et المتراجحات partagent CE composant — la
 * balance, les opérations aux deux membres, l'historique qui est aussi
 * l'annulation. Le mode ne change que ce qui doit changer :
 *
 *   equations      le laboratoire V1, intact (et une relation `<` y reste permise) ;
 *                  + le panneau de paramètres ax + b = c.
 *   inequalities   ouvre sur `-2x + 3 < 9`, refuse `=`, garde la droite graduée
 *                  TOUJOURS visible, annonce en grand le retournement du sens et
 *                  écrit l'ensemble des solutions en intervalle ET en mots.
 *
 * Nouveautés V2 communes : la ligne INTERMÉDIAIRE de chaque opération (posée
 * aux deux membres, en orange, avant simplification), le « نشر وتبسيط كل
 * طرف » d'une saisie à parenthèses ou fractions, et les exemples par niveau.
 * Toute la mathématique reste dans les modules purs.
 *
 * « حلّ خطوة بخطوة » (2026-09-30) : la réponse n'apparaît JAMAIS d'un bloc.
 * Depuis l'équation COURANTE, walkthrough.js calcule tout le chemin
 * (applyOperation, les opérations d'un professeur) ; equationFrames.js en
 * fait des gestes au tableau (MathBoard) : désigner, poser l'opération sous
 * les deux membres, l'écrire, simplifier. Le résultat est le DERNIER frame ;
 * la droite graduée n'a sa borne qu'à ce moment-là, et la balance suit le
 * frame courant. Manipuler la balance, changer d'équation : retour à l'énoncé.
 * « التحقق » se déroule de la même façon, sur son propre tableau.
 */
export default function PathSection({
  mode, path, commitPath, parameters = null, onToggleParameters = null, onChangeParameters = null, announce,
}) {
  const { t } = useTranslation('mathlab');
  const inequalityMode = mode === 'inequalities';
  const maxSteps = inequalityMode ? MAX_INEQUALITY_STEPS : MAX_STEPS;
  const [draft, setDraft] = useState(path.source);
  const [inputError, setInputError] = useState(null);
  const [operationError, setOperationError] = useState(null);
  const [verification, setVerification] = useState(null);
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [exampleId, setExampleId] = useState(null);

  const step = path.steps[path.cursor] ?? path.steps[path.steps.length - 1];
  const equation = step.equation;
  const verdict = useMemo(() => classify(equation), [equation]);
  const suggestions = useMemo(() => suggestOperations(equation), [equation]);
  const inequality = isInequality(equation.relation);
  const expansion = useMemo(() => equationExpansion(path.source), [path.source]);
  const previous = path.cursor > 0 ? path.steps[path.cursor - 1] : null;
  const intermediate = previous && step.operation ? operationLatex(previous.equation, step.operation, step.flipped) : null;
  const studentSolved = verdict.kind === 'solved';
  const noUnknown = hasNoUnknown(equation);

  // Le déroulé « حلّ خطوة بخطوة » : tout est calculé, rien n'est montré avant le geste.
  const expandFirst = path.cursor === 0 && expansion ? expansion : null;
  const frames = useMemo(
    () => resolutionFrames(buildWalkthrough(equation), { expansion: expandFirst, start: equation }),
    [equation, expandFirst],
  );
  const problemLatex = useMemo(() => (expandFirst
    ? `${expandFirst.left?.steps[0].latex ?? formToLatex(equation.left)} ${RELATION_LATEX[equation.relation]} ${expandFirst.right?.steps[0].latex ?? formToLatex(equation.right)}`
    : equationToLatex(equation)), [expandFirst, equation]);
  const player = useStepReveal(frames.length, { resetKey: `${mode}|${problemLatex}` });
  // « تدرّب بنفسك » : l'élève fait lui-même les gestes (désigner, choisir l'opération).
  const practice = useBoardPractice(frames, player, `${mode}|${problemLatex}`);
  const boardActive = player.started;
  const walkthroughDone = player.phase === 'completed';
  const boardFrame = boardActive ? frames[player.cursor - 1] : null;
  const balanceEquation = boardFrame?.equation ?? equation;
  const balanceVerdict = useMemo(() => classify(balanceEquation), [balanceEquation]);

  // « التحقق » : son propre tableau, son propre déroulé.
  const verificationBoard = useMemo(
    () => (verification ? verificationFrames(path.steps[0].equation, verification) : []),
    [verification, path.steps],
  );
  const verifyPlayer = useStepReveal(verificationBoard.length, { resetKey: verification });
  const verifyPractice = useBoardPractice(verificationBoard, verifyPlayer, verification);

  const reset = useCallback(() => {
    setInputError(null);
    setOperationError(null);
    setVerification(null);
  }, []);

  /** Une opération, d'un raccourci ou de la saisie. Rend true si elle a été appliquée. */
  const applyKind = useCallback(({ kind, value, text, term }) => {
    setVerification(null);
    let rational = value;
    if (!rational) {
      const parsed = parseOperationValue(text);
      if (!parsed.ok) {
        setOperationError(t(`tools.algebra.valueErrors.${parsed.error.code}`, { defaultValue: t('tools.algebra.valueErrors.notANumber') }));

        return false;
      }
      rational = parsed.value;
    }

    const operation = { kind, value: rational, ...(term === 'x' ? { term } : {}) };
    const result = applyOperation(equation, operation);
    if (!result.ok) {
      setOperationError(t(`tools.algebra.operationErrors.${result.error.code}`, { defaultValue: t('tools.algebra.operationErrors.unsupported') }));

      return false;
    }

    setOperationError(null);
    commitPath((current) => pushStep(current, result.equation, operation, result.flipped, maxSteps));
    announce(result.flipped
      ? t('tools.algebra.announceFlipped', { equation: equationToText(result.equation) })
      : t('tools.algebra.announceStep', { equation: equationToText(result.equation) }));

    return true;
  }, [commitPath, t, equation, maxSteps, announce]);

  /** Repartir d'une saisie (« استكشاف » ou un exemple). */
  const startFrom = useCallback((source) => {
    const parsed = parseEquation(source);
    if (!parsed.ok) {
      const { code, side } = parsed.error;
      setInputError(t(`tools.algebra.parseErrors.${code}`, {
        defaultValue: t('tools.algebra.parseErrors.syntax'),
        symbol: parsed.error.symbol ?? '',
        side: side ? t(`tools.algebra.${side}Side`) : '',
      }));

      return false;
    }
    if (inequalityMode && !isInequality(parsed.equation.relation)) {
      setInputError(t('tools.algebra.inequality.notInequality'));

      return false;
    }
    reset();
    player.rewind();
    commitPath((current) => resetTo(current, parsed.equation, source));
    announce(t('tools.algebra.announceNew', { equation: equationToText(parsed.equation) }));

    return true;
  }, [commitPath, t, inequalityMode, reset, announce, player]);

  const explore = useCallback((event) => {
    event?.preventDefault();
    setExampleId(null);
    startFrom(draft);
  }, [draft, startFrom]);

  const pickExample = useCallback((id) => {
    const example = (inequalityMode ? INEQUALITY_EXAMPLES : EQUATION_EXAMPLES).find((item) => item.id === id);
    if (!example) return;
    setDraft(example.source);
    if (startFrom(example.source)) setExampleId(id);
  }, [inequalityMode, startFrom]);

  /** « معادلة جديدة » / « متراجحة جديدة » : un exercice du niveau choisi. */
  const generate = useCallback(() => {
    const generated = inequalityMode
      ? generateInequality({ level: Math.min(level, 4) })
      : generateEquation({ level, relation: inequality && Math.random() < 0.5 ? equation.relation : '=' });
    setDraft(generated.source);
    setExampleId(null);
    reset();
    player.rewind();
    commitPath((current) => resetTo(current, generated.equation, generated.source));
    announce(t('tools.algebra.announceNew', { equation: generated.source }));
  }, [inequalityMode, level, inequality, equation.relation, commitPath, reset, t, announce, player]);

  /** « حلّ خطوة بخطوة » : démarre le déroulé de l'équation affichée — le premier geste, jamais la fin. */
  const solveSteps = useCallback(() => {
    setVerification(null);
    player.start();
  }, [player]);

  const verify = useCallback(() => {
    if (!verdict.solution) return;
    setVerification(verifyResolution(path.steps[0].equation, verdict.solution, verdict.relation ?? '='));
    verifyPlayer.start();
  }, [verdict.solution, verdict.relation, path.steps, verifyPlayer]);

  const goToStep = useCallback((index) => {
    setVerification(null);
    commitPath((current) => ({ ...current, cursor: Math.max(0, Math.min(current.steps.length - 1, index)) }));
  }, [commitPath]);

  const doUndo = useCallback(() => { setVerification(null); commitPath(undo); }, [commitPath]);
  const doRedo = useCallback(() => { setVerification(null); commitPath(redo); }, [commitPath]);

  /** Le panneau `ax + b = c` : changer un paramètre repart d'une équation neuve. */
  const changeParameters = useCallback((next) => {
    const fromParams = {
      left: makeLinear(R.makeRational(next.a), R.makeRational(next.b)),
      right: makeLinear(R.ZERO, R.makeRational(next.c)),
      relation: '=',
    };
    setVerification(null);
    setDraft(equationToText(fromParams));
    onChangeParameters?.(next, fromParams);
  }, [onChangeParameters]);

  const changeNumberLine = useCallback((view) => {
    commitPath((current) => ({ ...current, numberLine: { ...current.numberLine, ...view } }));
  }, [commitPath]);

  // Le verdict en toutes lettres — chaque état a SA phrase : jamais un faux nombre.
  const solutionLine = useMemo(() => {
    if (verdict.kind === 'none') return { tone: 'none', text: t('tools.algebra.noSolution') };
    if (verdict.kind === 'infinite') return { tone: 'infinite', text: t('tools.algebra.infiniteSolutions') };
    const solved = solve(equation);
    if (!solved.equation) return null;

    return { tone: 'unique', latex: equationToLatex(solved.equation), relation: solved.relation, solution: solved.solution };
  }, [verdict, equation, t]);

  // La réponse n'est lisible que si l'élève l'a atteinte lui-même (x isolé,
  // ou plus d'inconnue écrite) ou si le déroulé est arrivé à son DERNIER frame.
  const revealed = studentSolved || noUnknown || walkthroughDone;
  const set = inequalityMode && revealed ? solutionSet(verdict) : null;
  const levels = inequalityMode ? INEQUALITY_LEVELS : LEVELS;
  const levelKey = inequalityMode ? 'tools.algebra.inequality.levels' : 'tools.algebra.levels';
  const prefix = inequalityMode ? 'in' : 'eq';

  return (
    <div className="sa-ml-alg__body" data-ml-alg-mode={mode}>
      <div className="sa-ml-alg__stage">
        {/* Le déroulé : ses commandes restent en haut de la scène (sticky), le tableau dessous */}
        {boardActive && (
          <>
            <StepPlayer player={player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-alg-step" {...practice.player} />
            <MathBoard frames={frames} cursor={player.cursor} problem={problemLatex} label={t('tools.algebra.boardLabel')} dataAttr="data-ml-alg-board" {...practice.board} />
          </>
        )}

        {/* « نشر وتبسيط كل طرف » : la saisie telle qu'écrite ; son développement se déroule au tableau */}
        {expansion && path.cursor === 0 && !boardActive && (
          <section className="sa-ml-alg__expansion" data-ml-alg-expansion aria-labelledby={`sa-ml-alg-expansion-${prefix}`}>
            <h3 className="sa-ml-alg__card-title" id={`sa-ml-alg-expansion-${prefix}`}>{t('tools.algebra.expansion.title')}</h3>
            <div className="sa-ml-alg__expansion-side" dir="ltr"><MathText>{`$${problemLatex}$`}</MathText></div>
            <p className="sa-ml-alg__expansion-next">{t('tools.algebra.expansion.hint')}</p>
          </section>
        )}

        {/* La ligne intermédiaire : l'opération posée AUX DEUX MEMBRES, puis le résultat */}
        {intermediate && !boardActive && (
          <div className="sa-ml-alg__intermediate" dir="ltr" key={`op-${path.cursor}`} data-ml-alg-intermediate>
            <MathText>{`$$${intermediate}$$`}</MathText>
          </div>
        )}

        {/* L'équation courante, en grand — la seule chose qui compte (le tableau la montre pendant le déroulé) */}
        {!boardActive && (
          <div className={`sa-ml-alg__current${intermediate ? ' sa-ml-alg__current--after' : ''}`} dir="ltr" key={`eq-${path.cursor}`} data-ml-current-equation>
            <MathText>{`$$${equationToLatex(equation)}$$`}</MathText>
          </div>
        )}

        {/* Le retournement du sens : LA règle du chapitre, annoncée en grand */}
        {inequalityMode && step.flipped && previous && !boardActive && (
          <div className="sa-ml-alg__flip" role="note" data-ml-alg-flip>
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <p className="sa-ml-alg__flip-title">{t('tools.algebra.inequality.flipTitle')}</p>
              <p className="sa-ml-alg__flip-symbols" dir="ltr">
                <MathText>{`$${RELATION_LATEX[flipRelation(step.equation.relation)]} \\;\\longrightarrow\\; ${RELATION_LATEX[step.equation.relation]}$`}</MathText>
              </p>
            </div>
          </div>
        )}

        {/* La balance suit le frame courant du déroulé */}
        <BalanceScale equation={balanceEquation} verdict={balanceVerdict} />

        {/* La droite graduée ne DONNE pas la réponse (§5e.6) : la borne attend l'isolement ou le DERNIER frame. */}
        {(inequality || inequalityMode) && (
          <NumberLine
            solution={revealed ? verdict.solution : null}
            relation={verdict.relation ?? equation.relation}
            view={path.numberLine}
            onChangeView={changeNumberLine}
          />
        )}

        <div className="sa-ml-alg__verdict">
          {!revealed && !boardActive && (
            <button type="button" className="sa-ml-alg__solve" onClick={solveSteps} data-ml-alg-solve data-ml-alg-show-solution>
              <Footprints size={16} aria-hidden="true" />
              {t('tools.algebra.solveSteps')}
            </button>
          )}
          {solutionLine && revealed && (
            <p className={`sa-ml-alg__solution sa-ml-alg__solution--${solutionLine.tone}`} data-ml-solution>
              <span className="sa-ml-alg__solution-label">{t('tools.algebra.solution')}</span>
              {solutionLine.latex
                ? <MathText>{`$${solutionLine.latex}$`}</MathText>
                : <span>{solutionLine.text}</span>}
            </p>
          )}
          {solutionLine?.tone === 'unique' && revealed && (
            <button type="button" className="sa-ml-alg__ghost" onClick={verify} data-ml-alg-verify>
              <CheckCircle2 size={15} aria-hidden="true" />
              {t('tools.algebra.verify')}
            </button>
          )}
        </div>

        {set && (
          <div className="sa-ml-alg__set" data-ml-alg-solution-set>
            <p className="sa-ml-alg__set-row">
              <span className="sa-ml-alg__set-label">{t('tools.algebra.inequality.setLabel')}</span>
              <span dir="ltr" data-ml-alg-interval><MathText>{`$S = ${set.latex}$`}</MathText></span>
            </p>
            <p className="sa-ml-alg__set-words">
              <MathText>{t(`tools.algebra.inequality.words.${set.words}`, { value: set.value ? `$${set.value}$` : '' })}</MathText>
            </p>
          </div>
        )}

        {/* « التحقق » : substitution → calcul → verdict, un geste à la fois */}
        {verification && revealed && (
          <div
            className="sa-ml-alg__verification"
            data-ml-verification={verification.kind}
            data-ml-verification-holds={verifyPlayer.done ? String(verification.holds) : 'pending'}
          >
            <MathBoard frames={verificationBoard} cursor={verifyPlayer.cursor} label={t('tools.algebra.verifyBoardLabel')} dataAttr="data-ml-alg-verify-board" {...verifyPractice.board} />
            <StepPlayer player={verifyPlayer} progress={boardProgress(verificationBoard, verifyPlayer.cursor)} title={t('tools.algebra.verifySteps')} dataAttr="data-ml-alg-verify-step" {...verifyPractice.player} />
          </div>
        )}
      </div>

      <div className="sa-ml-alg__panel">
        <div className="sa-ml-alg__panel-body">
          <section className="sa-ml-alg__section">
            <h3 className="sa-ml-alg__heading">{t(inequalityMode ? 'tools.algebra.inequality.heading' : 'tools.algebra.equationHeading')}</h3>
            <form className="sa-ml-alg__equation-form" onSubmit={explore}>
              <label className="sa-ml-alg__sr" htmlFor={`sa-ml-alg-input-${prefix}`}>
                {t(inequalityMode ? 'tools.algebra.inequality.inputLabel' : 'tools.algebra.inputLabel')}
              </label>
              <input
                id={`sa-ml-alg-input-${prefix}`}
                className="sa-ml-alg__input"
                type="text"
                dir="ltr"
                lang="en"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setInputError(null); }}
                placeholder={inequalityMode ? '-2x + 3 < 9' : '2x + 3 = 11'}
                aria-invalid={inputError ? 'true' : undefined}
                aria-describedby={inputError ? `sa-ml-alg-input-error-${prefix}` : undefined}
                data-ml-equation-input
              />
              <button type="submit" className="sa-ml-alg__explore">{t('tools.algebra.explore')}</button>
            </form>
            {inputError && <p className="sa-ml-alg__error" id={`sa-ml-alg-input-error-${prefix}`} role="alert">{inputError}</p>}
            {inequalityMode && <p className="sa-ml-alg__hint">{t('tools.algebra.inequality.inputHint')}</p>}

            <div className="sa-ml-alg__generate">
              <label className="sa-ml-alg__sr" htmlFor={`sa-ml-alg-level-${prefix}`}>{t('tools.algebra.levelLabel')}</label>
              <select
                id={`sa-ml-alg-level-${prefix}`}
                className="sa-ml-alg__level"
                value={Math.min(level, levels[levels.length - 1])}
                onChange={(event) => setLevel(Number(event.target.value))}
                data-ml-alg-level
              >
                {levels.map((value) => (
                  <option key={value} value={value}>{t(`${levelKey}.${value}`)}</option>
                ))}
              </select>
              <button type="button" className="sa-ml-alg__new" onClick={generate} data-ml-alg-generate>
                <Shuffle size={15} aria-hidden="true" />
                {t(inequalityMode ? 'tools.algebra.inequality.newInequality' : 'tools.algebra.newEquation')}
              </button>
            </div>

            <ExamplePicker
              examples={inequalityMode ? INEQUALITY_EXAMPLES : EQUATION_EXAMPLES}
              onPick={pickExample}
              activeId={exampleId}
              dataAttr="data-ml-alg-example"
            />
          </section>

          <OperationControls
            suggestions={suggestions}
            onApply={applyKind}
            disabled={noUnknown}
            error={operationError}
            idPrefix={prefix}
          />

          {inequalityMode && (
            <LabDisclosure kind="rule" dataAttr="data-ml-alg-rule">
              <MathText>{t('tools.algebra.inequality.rule')}</MathText>
            </LabDisclosure>
          )}

          <div className="sa-ml-alg__history-actions">
            <button type="button" className="sa-ml-alg__mini-action" onClick={doUndo} disabled={!canUndo(path)} data-ml-undo>
              <Undo2 size={15} aria-hidden="true" />
              {t('tools.algebra.undo')}
            </button>
            <button type="button" className="sa-ml-alg__mini-action" onClick={doRedo} disabled={!canRedo(path)} data-ml-redo>
              <Redo2 size={15} aria-hidden="true" />
              {t('tools.algebra.redo')}
            </button>
            {!inequalityMode && onToggleParameters && (
              <button
                type="button"
                className={`sa-ml-alg__mini-action${parameters ? ' sa-ml-alg__mini-action--active' : ''}`}
                onClick={onToggleParameters}
                aria-pressed={Boolean(parameters)}
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                {t('tools.algebra.parameters')}
              </button>
            )}
          </div>

          {!inequalityMode && parameters && <ParameterPanel values={parameters} onChange={changeParameters} />}

          <StepHistory steps={path.steps} cursor={path.cursor} onSelect={goToStep} expanded={Boolean(expansion)} idPrefix={prefix} />
        </div>
      </div>

      <p className="sa-ml-alg__sr" data-ml-alg-state={prefix}>
        {t('tools.algebra.stateSummary', {
          equation: equationToText(equation),
          step: path.cursor + 1,
          total: path.steps.length,
        })}
      </p>
    </div>
  );
}
