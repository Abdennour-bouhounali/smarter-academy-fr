import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Play, ArrowLeft, RotateCcw, Eye, EyeOff, Keyboard, Blocks, Delete,
} from 'lucide-react';
import { Notation } from './LogicPieces.jsx';
import InductionStairs from './InductionStairs.jsx';
import { INDUCTION_SEQUENCES, findPreset } from './presets.js';
import {
  compileRule, testStep, buildSteps, climbVerdict, climbSummary, nextUntested,
  SUPPORTED_EXAMPLES, SUPPORTED_GRAMMAR, UNSUPPORTED_NOTES, suggestionsFor,
  BUILDER_TOKENS, appendToken, dropToken,
} from './inductionLab.js';
import {
  setStairsSequence, setStairsRule, recordStairVerdict, setStairsCursor,
  setStairsMode, resetStairs,
} from './logicState.js';
import { formatNumber } from './logicFormat.js';

/**
 * L'ESCALIER QU'ON MONTE — l'expérience centrale de §3 à §24.
 *
 *     اكتب قاعدتك → اختبر الخطوة → السلم يتلوّن → الخطوة التالية → لاحظ
 *
 * ── Ce que l'écran refuse de faire ──────────────────────────────────────
 * §4 : il ne calcule PAS tout d'un coup. L'élève avance marche par marche,
 * et c'est ce rythme qui fait la leçon — une règle qui verdit trois marches
 * puis rougit à la quatrième ne dit rien si les quatre s'affichent ensemble.
 *
 * §20, §24 : il ne dit JAMAIS « donc la règle est vraie pour tout n ». Huit
 * marches vertes donnent `experimental`, et l'écran enchaîne sur ce qui
 * manque — le passage de n à n+1. C'est la même honnêteté que le laboratoire
 * des quantificateurs (§5n.5), appliquée à la méthode elle-même.
 *
 * ── Deux façons d'écrire une règle (§6, §8) ─────────────────────────────
 * Le champ libre pour qui sait taper `n(n+1)/2`, et le constructeur à
 * boutons pour qui ne le sait pas. Les deux produisent du TEXTE relu par le
 * même compilateur : il n'y a pas deux grammaires, donc pas deux
 * comportements à maintenir.
 */
export default function StairsClimb({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.stairs;
  const sequence = findPreset(INDUCTION_SEQUENCES, state.sequenceId);
  const [input, setInput] = useState(state.rule);
  const [showValues, setShowValues] = useState(state.mode === 'climb');
  const [entry, setEntry] = useState('type');
  const [lastResult, setLastResult] = useState(null);
  const [why, setWhy] = useState(false);
  const inputRef = useRef(null);

  // Le document peut changer sous nos pieds (réouverture, « اعرضه في المختبر »).
  useEffect(() => { setInput(state.rule); }, [state.rule]);
  useEffect(() => { setShowValues(state.mode === 'climb'); }, [state.mode]);

  /** Les marches : la VÉRITÉ de l'exercice, jamais la règle de l'élève. */
  const steps = useMemo(() => {
    const built = buildSteps(sequence.expected, { from: sequence.from, count: sequence.count });

    return built.map((step, i) => ({ ...step, status: state.statuses[i] ?? 'untested' }));
  }, [sequence, state.statuses]);

  const rule = useMemo(() => compileRule(input), [input]);
  const verdict = climbVerdict(steps);
  const summary = climbSummary(steps);
  const cursor = Math.min(state.cursor, steps.length - 1);
  const currentStep = steps[cursor];
  const allTested = summary.untested === 0;

  /** §4 — tester UNE marche, celle du curseur. */
  const test = useCallback(() => {
    if (!rule.ok || !currentStep) return;
    const result = testStep(rule, currentStep);
    onChange((current) => recordStairVerdict(current, cursor, result.status));
    setLastResult({ ...result, at: Date.now() });
    setWhy(false);
    announce?.(result.status === 'correct'
      ? t('tools.logic.induction.climb.announceCorrect', { n: result.n })
      : t('tools.logic.induction.climb.announceIncorrect', { n: result.n }));
  }, [rule, currentStep, cursor, onChange, announce, t]);

  /** §14 — avancer. Jamais forcé : on peut revenir, retester, changer la règle. */
  const goNext = useCallback(() => {
    const next = nextUntested(steps, cursor + 1) ?? Math.min(cursor + 1, steps.length - 1);
    onChange((current) => setStairsCursor(current, next));
    setLastResult(null);
    setWhy(false);
  }, [steps, cursor, onChange]);

  const selectStep = useCallback((index) => {
    onChange((current) => setStairsCursor(current, index));
    setLastResult(null);
    setWhy(false);
  }, [onChange]);

  const commitRule = useCallback((text) => {
    setInput(text);
    onChange((current) => setStairsRule(current, text));
    setLastResult(null);
  }, [onChange]);

  const suggestions = useMemo(() => suggestionsFor(input), [input]);
  const errorCode = rule.ok ? null : rule.error?.code;

  return (
    <>
      {/* ── La règle ─────────────────────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-stairs-rule>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.climb.ruleHeading')}</h3>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.induction.climb.chooseSequence')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.sequenceId}
            onChange={(event) => {
              onChange((current) => setStairsSequence(current, event.target.value));
              setInput('');
              setLastResult(null);
            }}
            data-ml-lg-stairs-sequence
          >
            {INDUCTION_SEQUENCES.map((item) => (
              <option key={item.id} value={item.id}>
                {t(`tools.logic.induction.sequences.${item.id}`)}
              </option>
            ))}
          </select>
        </label>

        {/* §16 — la suite, valeurs cachées ou montrées. */}
        <div className="sa-ml-lg__tableWrap">
          <table className="sa-ml-lg__table" data-ml-lg-stairs-table>
            <caption className="sa-ml-lg__sr">{t('tools.logic.induction.climb.sequenceCaption')}</caption>
            <thead>
              <tr>
                <th scope="row" dir="ltr">n</th>
                {steps.map((step) => <th key={step.n} scope="col" dir="ltr">{step.n}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" dir="ltr">uₙ</th>
                {steps.map((step) => (
                  <td key={step.n} dir="ltr" data-ml-lg-expected={step.n}>
                    {showValues ? formatNumber(step.expected) : '؟'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn"
            aria-pressed={!showValues}
            onClick={() => {
              const next = showValues ? 'discover' : 'climb';
              setShowValues(!showValues);
              onChange((current) => setStairsMode(current, next));
            }}
            data-ml-lg-stairs-discover
          >
            {showValues ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            {showValues ? t('tools.logic.induction.climb.hideValues') : t('tools.logic.induction.climb.showValues')}
          </button>
        </div>
        {!showValues && <p className="sa-ml-lg__note">{t('tools.logic.induction.climb.discoverHint')}</p>}

        {/* §6 / §8 — écrire, ou construire. */}
        <div className="sa-ml-lg__actions" role="group" aria-label={t('tools.logic.induction.climb.ruleHeading')}>
          <button
            type="button"
            className="sa-ml-lg__btn"
            aria-pressed={entry === 'type'}
            onClick={() => setEntry('type')}
            data-ml-lg-entry="type"
          >
            <Keyboard size={16} aria-hidden="true" />
            {t('tools.logic.induction.climb.entryType')}
          </button>
          <button
            type="button"
            className="sa-ml-lg__btn"
            aria-pressed={entry === 'build'}
            onClick={() => setEntry('build')}
            data-ml-lg-entry="build"
          >
            <Blocks size={16} aria-hidden="true" />
            {t('tools.logic.induction.climb.entryBuild')}
          </button>
        </div>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">
            <Notation>uₙ =</Notation>
            {' '}
            {t('tools.logic.induction.climb.ruleLabel')}
          </span>
          <input
            ref={inputRef}
            className="sa-ml-lg__input"
            type="text"
            dir="ltr"
            value={input}
            placeholder={SUPPORTED_EXAMPLES[0] ?? '2n + 1'}
            readOnly={entry === 'build'}
            onChange={(event) => commitRule(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && rule.ok) test(); }}
            aria-invalid={Boolean(errorCode && input.trim())}
            aria-describedby={errorCode && input.trim() ? 'sa-ml-lg-rule-error' : undefined}
            data-ml-lg-stairs-input
          />
        </label>

        {entry === 'build' && (
          <div className="sa-ml-lg__builder" data-ml-lg-stairs-builder>
            {BUILDER_TOKENS.map((token) => (
              <button
                key={token.id}
                type="button"
                className="sa-ml-lg__btn sa-ml-lg__btn--token"
                onClick={() => commitRule(appendToken(input, token.id))}
                data-ml-lg-token={token.id}
              >
                <Notation>{token.text.trim()}</Notation>
              </button>
            ))}
            <button
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--token"
              onClick={() => commitRule(dropToken(input))}
              aria-label={t('tools.logic.induction.climb.dropToken')}
              data-ml-lg-token-drop
            >
              <Delete size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* §9 — jamais une erreur technique : une suggestion issue de la grammaire. */}
        {errorCode && input.trim() && (
          <div className="sa-ml-lg__message sa-ml-lg__message--warn" role="alert" id="sa-ml-lg-rule-error" data-ml-lg-rule-error={errorCode}>
            <p>{t(`tools.logic.induction.climb.errors.${errorCode}`, t('tools.logic.induction.climb.errors.syntax'))}</p>
            <p className="sa-ml-lg__note">{t('tools.logic.induction.climb.trySuggestions')}</p>
            <ul className="sa-ml-lg__chips">
              {suggestions.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    className="sa-ml-lg__btn sa-ml-lg__btn--token"
                    onClick={() => commitRule(example)}
                    data-ml-lg-suggestion={example}
                  >
                    <Notation>{example}</Notation>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!input.trim() && (
          <>
            <p className="sa-ml-lg__note">{t('tools.logic.induction.climb.examples')}</p>
            <ul className="sa-ml-lg__chips" data-ml-lg-stairs-examples>
              {SUPPORTED_EXAMPLES.slice(0, 5).map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    className="sa-ml-lg__btn sa-ml-lg__btn--token"
                    onClick={() => commitRule(example)}
                    data-ml-lg-example={example}
                  >
                    <Notation>{example}</Notation>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <details className="sa-ml-lg__grammar" data-ml-lg-grammar>
          <summary className="sa-ml-lg__btn">{t('tools.logic.induction.climb.grammarHeading')}</summary>
          <ul className="sa-ml-lg__chips">
            {SUPPORTED_GRAMMAR.map((item) => (
              <li key={item.id} className="sa-ml-lg__chip sa-ml-lg__chip--true" data-ml-lg-grammar-item={item.id}>
                {t(`tools.logic.induction.climb.grammar.${item.id}`)}
                {' '}
                <Notation>{item.probe}</Notation>
              </li>
            ))}
          </ul>
          <p className="sa-ml-lg__note">{t('tools.logic.induction.climb.grammarUnsupported')}</p>
          <ul className="sa-ml-lg__chips">
            {UNSUPPORTED_NOTES.map((id) => (
              <li key={id} className="sa-ml-lg__chip sa-ml-lg__chip--false" data-ml-lg-unsupported={id}>
                {t(`tools.logic.induction.climb.unsupported.${id}`)}
              </li>
            ))}
          </ul>
        </details>
      </section>

      {/* ── L'escalier et le résultat ────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-stairs-climb>
        <div className="sa-ml-lg__climb">
          <div className="sa-ml-lg__climbStage">
            <InductionStairs
              name="rule"
              steps={steps}
              currentIndex={cursor}
              onSelectStep={selectStep}
              caption={t('tools.logic.induction.climb.stairsCaption', {
                correct: summary.correct, total: summary.total,
              })}
            />

            {/* §23 — le résumé, sans faire du pourcentage le signal principal. */}
            <ul className="sa-ml-lg__chips" data-ml-lg-stairs-summary>
              <li className="sa-ml-lg__chip sa-ml-lg__chip--true">
                ✓ {t('tools.logic.induction.climb.correctCount', { count: summary.correct })}
              </li>
              {summary.incorrect > 0 && (
                <li className="sa-ml-lg__chip sa-ml-lg__chip--false">
                  ✕ {t('tools.logic.induction.climb.incorrectCount', { count: summary.incorrect })}
                </li>
              )}
              <li className="sa-ml-lg__chip">
                ○ {t('tools.logic.induction.climb.untestedCount', { count: summary.untested })}
              </li>
            </ul>
          </div>

          {/* §5 — le panneau de résultat, synchronisé avec la marche courante. */}
          <div className="sa-ml-lg__climbPanel" data-ml-lg-stairs-result>
            <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.climb.currentHeading')}</h3>
            <p className="sa-ml-lg__math sa-ml-lg__math--lead" dir="ltr" data-ml-lg-current-n>
              {`n = ${currentStep?.n ?? '—'}`}
            </p>

            {lastResult ? (
              <ResultPanel
                result={lastResult}
                rule={input}
                why={why}
                onWhy={() => setWhy((value) => !value)}
              />
            ) : (
              <p className="sa-ml-lg__note" data-ml-lg-result-idle>
                {rule.ok
                  ? t('tools.logic.induction.climb.readyToTest', { n: currentStep?.n ?? '' })
                  : t('tools.logic.induction.climb.writeRuleFirst')}
              </p>
            )}

            <div className="sa-ml-lg__actions">
              <button
                type="button"
                className="sa-ml-lg__btn sa-ml-lg__btn--primary"
                onClick={test}
                disabled={!rule.ok}
                data-ml-lg-stairs-test
              >
                <Play size={16} aria-hidden="true" />
                {t('tools.logic.induction.climb.test')}
              </button>
              <button
                type="button"
                className="sa-ml-lg__btn"
                onClick={goNext}
                disabled={cursor >= steps.length - 1 && allTested}
                data-ml-lg-stairs-next
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {t('tools.logic.induction.climb.next')}
              </button>
              <button
                type="button"
                className="sa-ml-lg__btn"
                onClick={() => { onChange(resetStairs); setLastResult(null); }}
                disabled={summary.correct + summary.incorrect === 0}
                data-ml-lg-stairs-reset
              >
                <RotateCcw size={16} aria-hidden="true" />
                {t('tools.logic.induction.climb.restart')}
              </button>
            </div>
          </div>
        </div>

        {/* §17, §20, §24 — la conclusion, toujours honnête. */}
        <ClimbVerdict verdict={verdict} summary={summary} steps={steps} />
      </section>
    </>
  );
}

/** §5, §18 — ce que la marche a donné, et POURQUOI (jamais un simple « خطأ »). */
function ResultPanel({ result, rule, why, onWhy }) {
  const { t } = useTranslation('mathlab');
  const correct = result.status === 'correct';

  return (
    <div
      className={`sa-ml-lg__message sa-ml-lg__message--${correct ? 'ok' : 'no'}`}
      role="status"
      aria-live="polite"
      data-ml-lg-step-result={result.status}
      data-ml-lg-step-n={result.n}
    >
      <p>
        <strong>
          {correct
            ? t('tools.logic.induction.climb.correct')
            : t('tools.logic.induction.climb.incorrect')}
        </strong>
      </p>

      <dl className="sa-ml-lg__readout">
        <div>
          <dt>{t('tools.logic.induction.climb.yourRule')}</dt>
          <dd><Notation>{`uₙ = ${rule}`}</Notation></dd>
        </div>
        <div>
          <dt>{t('tools.logic.induction.climb.yourResult')}</dt>
          <dd data-ml-lg-actual>
            <Notation>
              {result.actual === null
                ? t(`tools.logic.induction.climb.errors.${result.reason ?? 'undefined'}`)
                : formatNumber(result.actual)}
            </Notation>
          </dd>
        </div>
        <div>
          <dt>{t('tools.logic.induction.climb.expected')}</dt>
          <dd data-ml-lg-expected-value><Notation>{formatNumber(result.expected)}</Notation></dd>
        </div>
      </dl>

      {!correct && (
        <>
          <button type="button" className="sa-ml-lg__btn" onClick={onWhy} aria-expanded={why} data-ml-lg-why>
            {t('tools.logic.induction.climb.why')}
          </button>
          {why && (
            <div className="sa-ml-lg__note" data-ml-lg-why-detail>
              <p>
                <Notation>
                  {`n = ${result.n} → ${rule || '…'} = ${result.actual === null ? '—' : formatNumber(result.actual)}`}
                </Notation>
              </p>
              <p>
                {t('tools.logic.induction.climb.whyText', {
                  n: result.n,
                  actual: result.actual === null ? '—' : formatNumber(result.actual),
                  expected: formatNumber(result.expected),
                })}
              </p>
              <p>{t('tools.logic.induction.climb.tryAdjust')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * §20, §24 — la conclusion.
 *
 * Elle ne dit jamais « la règle est vraie pour tout n ». Huit marches vertes
 * donnent « vérification expérimentale », et l'écran enchaîne aussitôt sur
 * ce qui manque : le passage de n à n+1. C'est LA leçon de l'aire.
 */
function ClimbVerdict({ verdict, summary, steps }) {
  const { t } = useTranslation('mathlab');
  if (verdict === 'idle') return null;

  const firstBroken = steps.find((step) => step.status === 'incorrect');

  return (
    <div
      className={`sa-ml-lg__message sa-ml-lg__message--${verdict === 'broken' ? 'no' : verdict === 'experimental' ? 'warn' : 'info'}`}
      role="status"
      data-ml-lg-climb-verdict={verdict}
    >
      {verdict === 'climbing' && (
        <p>{t('tools.logic.induction.climb.climbing', { count: summary.correct })}</p>
      )}

      {verdict === 'broken' && (
        <>
          <p><strong>{t('tools.logic.induction.climb.brokenTitle', { count: summary.correct })}</strong></p>
          <p>{t('tools.logic.induction.climb.brokenText', { n: firstBroken?.n })}</p>
          <p>{t('tools.logic.induction.climb.brokenLesson')}</p>
        </>
      )}

      {verdict === 'experimental' && (
        <>
          <p><strong>{t('tools.logic.induction.climb.allGreen', { count: summary.total })}</strong></p>
          {/* Le point entier de §20 : ce n'est PAS une preuve. */}
          <p data-ml-lg-not-a-proof>{t('tools.logic.induction.climb.notAProof')}</p>
          <p>{t('tools.logic.induction.climb.towardsInduction')}</p>
        </>
      )}
    </div>
  );
}
