import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2, RotateCcw } from 'lucide-react';
import { Statement, Notation } from './LogicPieces.jsx';
import InductionStairs from './InductionStairs.jsx';
import StairsClimb from './StairsClimb.jsx';
import RecurrenceClimb from './RecurrenceClimb.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import StepPlayer from '../../shared/StepPlayer.jsx';
import { inductionCaseSteps } from './proofReveal.js';
import { INDUCTIONS, INDUCTION_CASES, findPreset } from './presets.js';
import { validateStep, availableSteps, isComplete } from './proofMath.js';
import { setInduction, placeInductionStep, undoInductionStep, resetInduction } from './logicState.js';

/**
 * §28 — البرهان بالتراجع, son propre laboratoire.
 *
 * Ce n'est pas une stratégie de plus dans « بناء البرهان » : c'est une AIRE,
 * parce que la récurrence se comprend par une IMAGE avant de se comprendre
 * par un enchaînement — l'escalier — et parce que ce qu'elle a de propre
 * (deux moitiés dont aucune ne suffit) demande un écran qui le montre.
 *
 * L'écran a trois temps :
 *
 *   1. **L'escalier**, et les deux interrupteurs. L'élève éteint le cas de
 *      base : l'escalier flotte, on ne pose jamais le pied. Il éteint le
 *      pas : la montée s'arrête sur un barreau cassé. Il rallume : ça monte.
 *      Rien n'est affirmé ; tout se voit.
 *   2. **Des exemples qui MARCHENT et des exemples qui NE MARCHENT PAS**
 *      (`INDUCTION_CASES`) — une récurrence complète, une où le cas de base
 *      est faux, une où le pas est faux. Le dernier est le plus instructif :
 *      « tous les chevaux ont la même couleur » a un pas qui échoue à un
 *      seul endroit, et c'est pour cela que la conclusion est absurde.
 *   3. **La construction**, sur le même moteur que les autres preuves
 *      (`proofMath.js`) : mêmes refus expliqués, même graphe.
 */
export default function InductionArea({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.induction;
  const proof = findPreset(INDUCTIONS, state.id);
  const [hasBase, setHasBase] = useState(true);
  const [hasStep, setHasStep] = useState(true);
  const [openCase, setOpenCase] = useState(null);
  const [refused, setRefused] = useState(null);

  // Un exemple s'ouvre sur son raisonnement pas à pas (exigence 2026-09-30) :
  // الحالة الأولى → الانتقال → الخلاصة ; l'escalier et le verdict sont le dernier pas.
  const caseSteps = useMemo(
    () => inductionCaseSteps(INDUCTION_CASES.find((item) => item.id === openCase)),
    [openCase],
  );
  const casePlayer = useStepReveal(caseSteps.length, { resetKey: openCase });

  const placed = state.placed;
  const complete = isComplete(proof, placed);
  const pool = useMemo(
    () => availableSteps(proof, placed).filter((id) => !placed.includes(id)),
    [proof, placed],
  );

  const stepText = useCallback(
    (stepId) => t(`tools.logic.proof.proofs.${proof.id}.${stepId}`),
    [t, proof.id],
  );

  const tryPlace = useCallback((stepId) => {
    const verdict = validateStep(proof, placed, stepId);
    if (!verdict.ok) {
      setRefused({ id: stepId, at: Date.now(), ...verdict });
      announce?.(t('tools.logic.announce.stepRefused'));

      return;
    }
    setRefused(null);
    onChange((current) => placeInductionStep(current, stepId));
    announce?.(t('tools.logic.announce.stepPlaced'));
  }, [proof, placed, onChange, announce, t]);

  const stairsState = !hasBase ? 'noBase' : hasStep ? 'complete' : 'broken';

  return (
    <>
      <section className="sa-ml-lg__card sa-ml-lg__card--accent" data-ml-lg-area="induction">
        <h2 className="sa-ml-lg__title">{t('tools.logic.induction.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.induction.climb.invite')}</p>
      </section>

      {/* ── 1. LA RÉCURRENCE TELLE QU'ELLE S'ÉCRIT AU BAC ───────────────
          Une proposition (uₙ < 3, wₙ = −2), des suites définies par
          récurrence, parfois auxiliaires — et l'escalier qu'on monte rang
          par rang avant de construire l'hérédité. C'est la forme des vrais
          exercices ; elle ouvre l'aire pour cette raison. */}
      <RecurrenceClimb data={data} onChange={onChange} announce={announce} />

      {/* ── 2. DÉCOUVRIR UNE RÈGLE : l'escalier le plus simple ───────────
          Ici la proposition est « ma règle décrit-elle cette suite ? ». Pas
          de relation à choisir, pas de suite auxiliaire : c'est le premier
          contact avec l'idée qu'une vérification finie ne prouve rien. */}
      <StairsClimb data={data} onChange={onChange} announce={announce} />

      {/* ── 3. LE PRINCIPE : les deux moitiés, et ce qui arrive sans elles ── */}
      <section className="sa-ml-lg__card" data-ml-lg-induction-stairs>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.stairsHeading')}</h3>
        <p className="sa-ml-lg__question">{t('tools.logic.induction.principle')}</p>
        <p className="sa-ml-lg__note">{t('tools.logic.induction.principleText')}</p>

        <InductionStairs
          hasBase={hasBase}
          hasStep={hasStep}
          caption={t(`tools.logic.induction.stairs.${stairsState}`)}
        />

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--choice"
            aria-pressed={hasBase}
            onClick={() => setHasBase((value) => !value)}
            data-ml-lg-toggle-base
            data-ml-lg-value={String(hasBase)}
          >
            {t('tools.logic.induction.baseLabel')}
            {' '}
            {hasBase ? '✓' : '✗'}
          </button>
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--choice"
            aria-pressed={hasStep}
            onClick={() => setHasStep((value) => !value)}
            data-ml-lg-toggle-step
            data-ml-lg-value={String(hasStep)}
          >
            {t('tools.logic.induction.stepLabel')}
            {' '}
            {hasStep ? '✓' : '✗'}
          </button>
        </div>

        <p
          className={`sa-ml-lg__message sa-ml-lg__message--${stairsState === 'complete' ? 'ok' : 'no'}`}
          role="status"
          aria-live="polite"
          data-ml-lg-stairs-verdict={stairsState}
        >
          {t(`tools.logic.induction.stairs.${stairsState}`)}
        </p>

        <p className="sa-ml-lg__note">{t('tools.logic.induction.whyBothNeeded')}</p>
      </section>

      {/* ── 3. Ce qui MARCHE, et ce qui NE MARCHE PAS ────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-induction-cases>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.casesHeading')}</h3>
        <p className="sa-ml-lg__note">{t('tools.logic.induction.casesLead')}</p>

        <ul className="sa-ml-lg__steps">
          {INDUCTION_CASES.map((item) => {
            const open = openCase === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sa-ml-lg__step${item.works ? '' : ' is-contradiction'}`}
                  aria-expanded={open}
                  onClick={() => {
                    setOpenCase(open ? null : item.id);
                    // Ouvrir un exemple, c'est demander son raisonnement : le premier pas vient avec.
                    if (!open) casePlayer.start();
                  }}
                  data-ml-lg-induction-case={item.id}
                  data-ml-lg-case-works={String(item.works)}
                >
                  <span className="sa-ml-lg__stepRole">
                    {item.works ? t('tools.logic.induction.worksLabel') : t('tools.logic.induction.failsLabel')}
                  </span>
                  <span className="sa-ml-lg__stepText">
                    {t(`tools.logic.induction.cases.${item.id}.claim`)}
                  </span>
                </button>

                {open && (
                  <div className="sa-ml-lg__caseBody" data-ml-lg-case-detail={item.id} data-ml-lg-case-shown={casePlayer.cursor}>
                    <StepPlayer player={casePlayer} sticky title={t('tools.logic.induction.caseSteps.title')} dataAttr="data-ml-lg-case-step" />
                    <ol className="sa-ml-lg__caseSteps">
                      {caseSteps.slice(0, casePlayer.cursor).map((step, index) => {
                        const current = index === casePlayer.cursor - 1;
                        const label = {
                          base: t('tools.logic.induction.baseLabel'),
                          heredity: t('tools.logic.induction.stepLabel'),
                          conclusion: t('tools.logic.induction.caseSteps.conclusion'),
                        }[step.kind];

                        return (
                          <li
                            key={step.kind}
                            className={`sa-ml-lg__caseStep${current ? ' is-current' : ''}${step.kind === 'conclusion' ? ' is-conclusion' : ''}`}
                            data-ml-lg-case-step-kind={step.kind}
                          >
                            {step.kind !== 'conclusion' ? (
                              <p className="sa-ml-lg__caseStepLine">
                                <span className={`sa-ml-lg__chip ${step.holds ? 'sa-ml-lg__chip--true' : 'sa-ml-lg__chip--false'}`}>
                                  {label}
                                  {' '}
                                  {step.holds ? '✓' : '✗'}
                                </span>
                                {' '}
                                <span>{t(`tools.logic.induction.caseSteps.${step.kind}.${step.holds ? 'holds' : 'fails'}`)}</span>
                              </p>
                            ) : (
                              <>
                                <p className="sa-ml-lg__caseStepLine"><strong>{label}</strong></p>
                                <InductionStairs
                                  hasBase={item.baseHolds}
                                  hasStep={item.stepHolds}
                                  breakAt={item.breakAt ?? 3}
                                  caption={t(`tools.logic.induction.cases.${item.id}.claim`)}
                                />
                                <p className={`sa-ml-lg__message sa-ml-lg__message--${item.works ? 'ok' : 'no'}`}>
                                  {t(`tools.logic.induction.cases.${item.id}.why`)}
                                </p>
                                {item.checkAt && (
                                  <p className="sa-ml-lg__note">
                                    {t('tools.logic.induction.checkAt')}
                                    {': '}
                                    <Notation>{item.checkAt}</Notation>
                                  </p>
                                )}
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 4. Construire la récurrence formelle ─────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-induction-build>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.buildHeading')}</h3>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.induction.chooseProof')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.id}
            onChange={(event) => { onChange((c) => setInduction(c, event.target.value)); setRefused(null); }}
            data-ml-lg-induction-select
          >
            {INDUCTIONS.map((item) => (
              <option key={item.id} value={item.id}>{t(`tools.logic.proof.proofs.${item.id}.title`)}</option>
            ))}
          </select>
        </label>

        <Statement data-ml-lg-induction-title>
          {t(`tools.logic.proof.proofs.${proof.id}.title`)}
        </Statement>

        <p className="sa-ml-lg__note">{t('tools.logic.induction.twoPathsHint')}</p>

        {refused && (
          <p className="sa-ml-lg__message sa-ml-lg__message--no" role="alert" data-ml-lg-induction-refused={refused.reason}>
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

        <ul className="sa-ml-lg__steps" data-ml-lg-induction-pool>
          {pool.map((stepId) => {
            const step = proof.steps.find((s) => s.id === stepId);

            return (
              <li key={refused?.id === stepId ? `${stepId}-${refused.at}` : stepId}>
                <button
                  type="button"
                  className={`sa-ml-lg__step${refused?.id === stepId ? ' is-refused' : ''}`}
                  onClick={() => tryPlace(stepId)}
                  data-ml-lg-induction-step={stepId}
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

        {placed.length > 0 && (
          <ol className="sa-ml-lg__steps sa-ml-lg__chain" data-ml-lg-induction-chain>
            {placed.map((stepId, index) => {
              const step = proof.steps.find((s) => s.id === stepId);

              return (
                <li key={stepId} className="sa-ml-lg__step" data-ml-lg-induction-placed={stepId}>
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
            onClick={() => onChange(undoInductionStep)}
            disabled={placed.length === 0}
            data-ml-lg-induction-undo
          >
            <Undo2 size={16} aria-hidden="true" />
            {t('tools.logic.proof.undo')}
          </button>
          <button
            type="button"
            className="sa-ml-lg__btn"
            onClick={() => { onChange(resetInduction); setRefused(null); }}
            disabled={placed.length === 0}
            data-ml-lg-induction-reset
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t('tools.logic.proof.resetChain')}
          </button>
        </div>

        {complete && (
          <p className="sa-ml-lg__message sa-ml-lg__message--ok" role="status" data-ml-lg-induction-complete>
            <strong>{t('tools.logic.proof.complete')}</strong>
            {' '}
            {t('tools.logic.induction.completeExplain')}
          </p>
        )}
      </section>

      <section className="sa-ml-lg__card">
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.trap')}</h3>
        <p className="sa-ml-lg__note">{t('tools.logic.induction.trapText')}</p>
      </section>
    </>
  );
}
