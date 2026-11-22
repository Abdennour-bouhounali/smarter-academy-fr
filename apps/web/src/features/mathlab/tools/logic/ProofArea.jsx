import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2, RotateCcw, Shuffle } from 'lucide-react';
import useStepReveal from '../../shared/useStepReveal.js';
import StepPlayer from '../../shared/StepPlayer.jsx';
import { Statement } from './LogicPieces.jsx';
import { DIRECT_PROOFS, findPreset } from './presets.js';
import {
  validateStep, availableSteps, isComplete, firstOrderError, makeGapChallenge,
  checkGapAnswer, stepIds,
} from './proofMath.js';
import { treeReveal, visibleTreeRanks } from './proofReveal.js';
import {
  PROOF_MODES, setProof, setProofMode, placeStep, undoStep, resetProof, nextGap,
} from './logicState.js';

/**
 * §26-36 — LE CONSTRUCTEUR DE PREUVE (بناء البرهان).
 *
 * Trois modes sur le même graphe (`presets.PROOFS`, `proofMath.js`) :
 *   ابنِ    — les cartes disponibles, une à la fois, dans l'ordre logique ;
 *   رتّب    — toutes les cartes mêlées, à remettre en ordre (§35) ;
 *   الناقصة — une étape retirée, à retrouver parmi des distracteurs (§34).
 *
 * ── Le geste (§44) ───────────────────────────────────────────────────────
 * Pas de HTML5 drag-and-drop : Pointer Events, comme partout ailleurs dans
 * le مختبر (DragHandle des أشعة, NumberLineStage du مختبر الأعداد). Et
 * SURTOUT : toute manipulation a un équivalent au clic et au clavier — on
 * pose une carte en la touchant, on la déplace avec les flèches. Le contrat
 * des manipulations l'exige, et sur téléphone c'est le seul geste fiable.
 *
 * ── Le refus qui enseigne (§27) ──────────────────────────────────────────
 * Une carte posée trop tôt n'est pas refusée d'un « خطأ » : le laboratoire
 * dit « هذه النتيجة لا تتبع مباشرةً من المعطيات الحالية » et NOMME ce qui
 * manque. Il ne dit jamais quelle carte poser — c'est le travail de l'élève.
 */
export default function ProofArea({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.proof;
  const proof = findPreset(DIRECT_PROOFS, state.id);
  const [refused, setRefused] = useState(null);
  const [gapAnswer, setGapAnswer] = useState(null);

  const placed = state.placed;
  const complete = isComplete(proof, placed);
  const gap = useMemo(
    () => (state.mode === 'gap' ? makeGapChallenge(proof, state.gapSeed) : null),
    [proof, state.mode, state.gapSeed],
  );

  const stepText = useCallback(
    (stepId) => t(`tools.logic.proof.proofs.${proof.id}.${stepId}`),
    [t, proof.id],
  );

  /** Poser une carte — ou expliquer pourquoi elle ne peut pas l'être (§27). */
  const tryPlace = useCallback((stepId) => {
    const verdict = validateStep(proof, placed, stepId);
    if (!verdict.ok) {
      // Le message RESTE : il explique ce qui manque, et une explication qui
      // s'efface au bout d'une seconde n'est pas une explication (§27). Seul
      // le tremblement de la carte est bref — il n'a rien à lire.
      setRefused({ id: stepId, at: Date.now(), ...verdict });
      announce?.(t('tools.logic.announce.stepRefused'));

      return;
    }
    setRefused(null);
    onChange((current) => placeStep(current, stepId));
    announce?.(t('tools.logic.announce.stepPlaced'));
  }, [proof, placed, onChange, announce, t]);

  /** En mode « رتّب », toutes les cartes sont proposées, mêlées mais stables. */
  const pool = useMemo(() => {
    if (state.mode === 'gap') return gap?.candidates ?? [];
    const ids = state.mode === 'order'
      ? shuffleStable(stepIds(proof), state.gapSeed)
      : availableSteps(proof, placed);

    return ids.filter((id) => !placed.includes(id));
  }, [state.mode, state.gapSeed, proof, placed, gap]);

  const orderError = state.mode === 'order' ? firstOrderError(proof, placed) : null;

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="proof">
        <h2 className="sa-ml-lg__title">{t('tools.logic.proof.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.proof.lead')}</p>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.proof.chooseProof')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setProof(c, event.target.value)); setRefused(null); setGapAnswer(null); }}
            data-ml-lg-proof-select
          >
            {DIRECT_PROOFS.map((item) => (
              <option key={item.id} value={item.id}>{t(`tools.logic.proof.proofs.${item.id}.title`)}</option>
            ))}
          </select>
        </label>

        <Statement data-ml-lg-proof-title>
          {t(`tools.logic.proof.proofs.${proof.id}.title`)}
        </Statement>

        <p className="sa-ml-lg__note">
          {t('tools.logic.proof.strategyLabel')}
          {': '}
          <strong>{t(`tools.logic.proof.strategies.${proof.strategy}`)}</strong>
        </p>

        <div className="sa-ml-lg__actions" role="group" aria-label={t('tools.logic.proof.heading')}>
          {PROOF_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className="sa-ml-lg__btn"
              aria-pressed={state.mode === mode}
              onClick={() => { onChange((c) => setProofMode(c, mode)); setRefused(null); setGapAnswer(null); }}
              data-ml-lg-proof-mode={mode}
            >
              {t(`tools.logic.proof.modes.${mode}`)}
            </button>
          ))}
        </div>
        <p className="sa-ml-lg__note">{t(`tools.logic.proof.modeHints.${state.mode}`)}</p>
      </section>

      {state.mode === 'gap' ? (
        <GapMode
          gap={gap}
          proof={proof}
          stepText={stepText}
          answer={gapAnswer}
          onAnswer={setGapAnswer}
          onNext={() => { onChange(nextGap); setGapAnswer(null); }}
        />
      ) : (
        <section className="sa-ml-lg__proof" data-ml-lg-proof-board>
          {/* ── Les cartes à poser ───────────────────────────────────── */}
          <div className="sa-ml-lg__card sa-ml-lg__proofCol">
            <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.proof.available')}</h3>
            <p className="sa-ml-lg__note">{t('tools.logic.proof.dragHint')}</p>
            {refused && (
              <p className="sa-ml-lg__message sa-ml-lg__message--no" role="alert" data-ml-lg-refused={refused.reason}>
                {t(`tools.logic.proof.errors.${refused.reason}`)}
                {refused.missing?.length > 0 && (
                  <>
                    {' '}
                    {t('tools.logic.proof.errors.missingNames', {
                      steps: refused.missing.map((id) => stepText(id)).join('، '),
                    })}
                  </>
                )}
              </p>
            )}

            <ul className="sa-ml-lg__steps" data-ml-lg-proof-pool>
              {pool.map((stepId) => {
                const step = proof.steps.find((s) => s.id === stepId);

                return (
                  // La clé porte l'instant du refus : elle REMONTE la carte,
                  // ce qui rejoue le tremblement même si l'élève reclique la
                  // même carte deux fois de suite.
                  <li key={refused?.id === stepId ? `${stepId}-refused-${refused.at}` : stepId}>
                    <button
                      type="button"
                      className={`sa-ml-lg__step${refused?.id === stepId ? ' is-refused' : ''}`}
                      onClick={() => tryPlace(stepId)}
                      data-ml-lg-step={stepId}
                    >
                      {step?.role && (
                        <span className="sa-ml-lg__stepRole">{t(`tools.logic.proof.roles.${step.role}`)}</span>
                      )}
                      <span className="sa-ml-lg__stepText">{stepText(stepId)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {pool.length === 0 && !complete && (
              <p className="sa-ml-lg__note">{t('tools.logic.proof.empty')}</p>
            )}

          </div>

          {/* ── La chaîne construite ─────────────────────────────────── */}
          <div className="sa-ml-lg__card sa-ml-lg__proofCol">
            <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.proof.chain')}</h3>

            {placed.length === 0 ? (
              <p className="sa-ml-lg__chainEmpty">{t('tools.logic.proof.empty')}</p>
            ) : (
              <ol className="sa-ml-lg__steps sa-ml-lg__chain" data-ml-lg-proof-chain>
                {placed.map((stepId, index) => {
                  const step = proof.steps.find((s) => s.id === stepId);
                  const broken = orderError?.index === index;

                  return (
                    <li
                      key={stepId}
                      className={`sa-ml-lg__step${step?.contradiction ? ' is-contradiction' : ''}${broken ? ' is-refused' : ''}`}
                      data-ml-lg-placed={stepId}
                    >
                      <span className="sa-ml-lg__stepIndex">{index + 1}</span>
                      {step?.role && (
                        <span className="sa-ml-lg__stepRole">{t(`tools.logic.proof.roles.${step.role}`)}</span>
                      )}
                      <span className="sa-ml-lg__stepText">{stepText(stepId)}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="sa-ml-lg__actions">
              <button
                type="button"
                className="sa-ml-lg__btn"
                onClick={() => onChange(undoStep)}
                disabled={placed.length === 0}
                data-ml-lg-proof-undo
              >
                <Undo2 size={16} aria-hidden="true" />
                {t('tools.logic.proof.undo')}
              </button>
              <button
                type="button"
                className="sa-ml-lg__btn"
                onClick={() => { onChange(resetProof); setRefused(null); }}
                disabled={placed.length === 0}
                data-ml-lg-proof-reset
              >
                <RotateCcw size={16} aria-hidden="true" />
                {t('tools.logic.proof.resetChain')}
              </button>
            </div>

            {orderError && (
              <p className="sa-ml-lg__message sa-ml-lg__message--no" role="alert">
                {t('tools.logic.proof.errors.orderBreaksAt', { index: orderError.index + 1 })}
              </p>
            )}

            {complete && (
              <p className="sa-ml-lg__message sa-ml-lg__message--ok" role="status" data-ml-lg-proof-complete>
                <strong>{t('tools.logic.proof.complete')}</strong>
                {' '}
                {t('tools.logic.proof.completeExplain')}
              </p>
            )}
          </div>
        </section>
      )}

      <ProofTree
        proof={proof}
        placed={state.mode === 'gap' ? [] : placed}
        complete={state.mode !== 'gap' && complete}
        resetKey={`${proof.id}|${state.mode}|${state.gapSeed}`}
        stepText={stepText}
      />
    </>
  );
}

/** §34 — une étape retirée, des candidats, et une explication qui ne donne pas la suite. */
function GapMode({ gap, proof, stepText, answer, onAnswer, onNext }) {
  const { t } = useTranslation('mathlab');
  if (!gap) return null;
  const right = answer !== null && checkGapAnswer(gap, answer);

  return (
    <section className="sa-ml-lg__card" data-ml-lg-proof-gap>
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.proof.gapQuestion')}</h3>

      <ol className="sa-ml-lg__steps">
        {proof.steps.map((step, index) => {
          const hidden = step.id === gap.missingId;

          return (
            <li
              key={step.id}
              className={`sa-ml-lg__step${hidden ? ' is-dropTarget' : ''}`}
              data-ml-lg-gap-slot={hidden ? 'missing' : step.id}
            >
              <span className="sa-ml-lg__stepIndex">{index + 1}</span>
              {hidden ? (
                <span className="sa-ml-lg__stepText">
                  {answer && right ? stepText(gap.missingId) : '…'}
                </span>
              ) : (
                <>
                  <span className="sa-ml-lg__stepRole">{t(`tools.logic.proof.roles.${step.role}`)}</span>
                  <span className="sa-ml-lg__stepText">{stepText(step.id)}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className="sa-ml-lg__actions">
        {gap.candidates.map((candidateId) => (
          <button
            key={candidateId}
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--choice"
            aria-pressed={answer === candidateId}
            onClick={() => onAnswer(candidateId)}
            data-ml-lg-gap-candidate={candidateId}
          >
            {stepText(candidateId)}
          </button>
        ))}
      </div>

      {answer !== null && (
        <p className={`sa-ml-lg__message sa-ml-lg__message--${right ? 'ok' : 'no'}`} role="status">
          {right ? t('tools.logic.proof.gapCorrect') : t('tools.logic.proof.gapWrong')}
        </p>
      )}

      <div className="sa-ml-lg__actions">
        <button type="button" className="sa-ml-lg__btn" onClick={onNext} data-ml-lg-gap-next>
          <Shuffle size={16} aria-hidden="true" />
          {t('tools.logic.proof.anotherGap')}
        </button>
      </div>
    </section>
  );
}

/**
 * §32 — L'ARBRE. Les rangs viennent du graphe : une conclusion qui dépend de
 * deux branches apparaît APRÈS elles et les réunit.
 *
 * ── L'arbre ne donne pas la preuve d'un bloc (exigence 2026-09-30) ───────
 * Il était dessiné en entier dès l'ouverture — l'ordre des modes « رتّب »
 * et la carte retirée du mode « الناقصة » s'y lisaient avant que l'élève
 * ait rien fait. Désormais il montre :
 *   - les étapes que l'élève a POSÉES (sa construction — la carte d'avancement) ;
 *   - et, sur demande, le reste rang par rang (`useStepReveal`, un pas = un
 *     rang du graphe, chaque nœud avec son rôle : معطى, قاعدة, استنتاج, النتيجة) ;
 *     le dernier rang est la conclusion.
 * Une preuve que l'élève a achevée s'affiche entière : il l'a produite.
 * Un rang futur n'est pas dans le DOM.
 */
function ProofTree({ proof, placed, complete, resetKey, stepText }) {
  const { t } = useTranslation('mathlab');
  const layers = useMemo(() => treeReveal(proof), [proof]);
  const player = useStepReveal(layers.length, { resetKey });
  const ranks = visibleTreeRanks(layers, { revealed: complete ? layers.length : player.cursor, placed });
  const lastRank = layers.length - 1;

  return (
    <section className="sa-ml-lg__card" data-ml-lg-proof-tree data-ml-lg-tree-shown={ranks.length}>
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.proof.treeHeading')}</h3>
      {!complete && (
        <StepPlayer player={player} sticky title={t('tools.logic.proof.treeSteps')} dataAttr="data-ml-lg-tree-step" />
      )}
      {ranks.length === 0 ? (
        <p className="sa-ml-lg__note" data-ml-lg-tree-empty>{t('tools.logic.proof.treeEmpty')}</p>
      ) : (
        <div className="sa-ml-lg__tree">
          {ranks.map(({ index, steps }, position) => {
            const current = !complete && index === player.cursor - 1;
            const conclusion = index === lastRank && (complete || player.done);

            return (
              <div key={index}>
                <div
                  className={`sa-ml-lg__treeRank${current ? ' is-current' : ''}${conclusion ? ' is-conclusion' : ''}`}
                  data-ml-lg-tree-rank={index}
                >
                  {steps.map((step) => (
                    <span
                      key={step.id}
                      className={`sa-ml-lg__treeNode${placed.includes(step.id) ? ' is-placed' : ''}`}
                      data-ml-lg-tree-node={step.id}
                    >
                      {step.role && (
                        <span className="sa-ml-lg__treeRole">{t(`tools.logic.proof.roles.${step.role}`)}</span>
                      )}
                      {stepText(step.id)}
                    </span>
                  ))}
                </div>
                {position < ranks.length - 1 && <div className="sa-ml-lg__treeJoin" aria-hidden="true">↓</div>}
              </div>
            );
          })}
        </div>
      )}
      <p className="sa-ml-lg__note">{t('tools.logic.proof.treeHint')}</p>
    </section>
  );
}

/** Mélange stable : la même graine rend le même ordre tant qu'on ne change rien. */
function shuffleStable(list, seed) {
  const out = [...list];
  let state = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  const next = () => { state = (state * 16807) % 2147483647; return (state - 1) / 2147483646; };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}
