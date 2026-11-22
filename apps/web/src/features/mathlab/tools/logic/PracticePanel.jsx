import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Eye, RefreshCw, X, ExternalLink } from 'lucide-react';
import { Notation, Statement } from './LogicPieces.jsx';
import { checkAnswer, revealTarget } from './practice.js';
import { PROOFS, FALLACY_KINDS, findPreset } from './presets.js';
import { anyValidOrder } from './proofMath.js';
import { MAX_PRACTICE_LEVEL } from './logicState.js';

/**
 * §37-39 — « prédire → essayer → indice → révéler », sans jamais bloquer.
 *
 * Le panneau tient une conversation, pas un examen :
 *   — une réponse fausse laisse le champ ouvert et « تحقّق » actif ;
 *   — « تلميح » donne UN cran de plus, jamais la réponse ;
 *   — « أظهِر الحلّ » est accessible à tout instant, y compris sans avoir
 *     répondu — §39 ne l'interdit que par défaut, pas sur demande ;
 *   — « اعرضه في المختبر » renvoie à l'aire qui MONTRE la réponse, parce
 *     qu'une explication se voit mieux qu'elle ne se lit (§37).
 *
 * Trois issues, jamais deux : juste, faux, ILLISIBLE. Dire « خطأ » à qui a
 * mal tapé lui enseignerait une fausseté sur sa propre pensée.
 */
export default function PracticePanel({
  challenge, level, solved, seen, onLevel, onCheck, onHint, onNext, onClose, onShowInLab,
  maxLevel = MAX_PRACTICE_LEVEL,
}) {
  const { t } = useTranslation('mathlab');
  const [answer, setAnswer] = useState('');
  const [order, setOrder] = useState([]);
  const [fallacyKind, setFallacyKind] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  // Une nouvelle question remet la conversation à zéro.
  useEffect(() => {
    setAnswer('');
    setOrder([]);
    setFallacyKind(null);
    setVerdict(null);
    setHints(0);
    setRevealed(false);
  }, [challenge]);

  const composed = useCallback(() => {
    if (!challenge) return null;
    if (challenge.answerType === 'order') return order;
    if (challenge.answerType === 'fallacy') return { kind: fallacyKind, value: answer };

    return answer;
  }, [challenge, answer, order, fallacyKind]);

  const check = useCallback(() => {
    const result = checkAnswer(challenge, composed());
    setVerdict(result);
    if (result.correct) onCheck?.(true);
  }, [challenge, composed, onCheck]);

  if (!challenge) return null;

  const hintKey = hints > 0 ? challenge.hintKeys[Math.min(hints - 1, challenge.hintKeys.length - 1)] : null;
  const hintsLeft = hints < challenge.hintKeys.length;
  const target = revealTarget(challenge);

  return (
    <aside className="sa-ml-lg__card sa-ml-lg__card--accent" role="region" aria-label={t('tools.logic.practice.heading')} data-ml-lg-practice>
      <header className="sa-ml-lg__actions">
        <h3 className="sa-ml-lg__title">{t('tools.logic.practice.heading')}</h3>
        <span className="sa-ml-lg__chip" dir="ltr" data-ml-lg-practice-score>
          {t('tools.logic.practice.score', { solved, seen })}
        </span>
        <button
          type="button"
          className="sa-ml-lg__btn sa-ml-lg__btn--icon"
          onClick={onClose}
          aria-label={t('tools.logic.common.closePractice')}
          data-ml-lg-practice-close
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <label className="sa-ml-lg__field">
        <span className="sa-ml-lg__label">{t('tools.logic.practice.levelLabel')}</span>
        <select
          className="sa-ml-lg__select"
          value={level}
          onChange={(event) => onLevel?.(Number(event.target.value))}
          data-ml-lg-practice-level
        >
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map((value) => (
            <option key={value} value={value}>{`${value} — ${t(`tools.logic.practice.levels.${value}`)}`}</option>
          ))}
        </select>
      </label>

      <p className="sa-ml-lg__question" data-ml-lg-practice-question>{t(challenge.promptKey)}</p>

      <ChallengeSubject challenge={challenge} />

      {/* ── La réponse, selon la forme de la question ─────────────────── */}
      {challenge.answerType === 'choice' && (
        <div className="sa-ml-lg__actions">
          {challenge.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--choice"
              aria-pressed={answer === choice}
              onClick={() => setAnswer(choice)}
              data-ml-lg-practice-choice={choice}
            >
              {choiceLabel(t, challenge, choice)}
            </button>
          ))}
        </div>
      )}

      {challenge.answerType === 'number' && (
        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.practice.answerLabel')}</span>
          <input
            ref={inputRef}
            className="sa-ml-lg__input"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={answer}
            placeholder={t('tools.logic.practice.answerPlaceholder')}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') check(); }}
            data-ml-lg-practice-input
          />
        </label>
      )}

      {challenge.answerType === 'fallacy' && (
        <>
          <div className="sa-ml-lg__actions">
            {FALLACY_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="sa-ml-lg__btn sa-ml-lg__btn--choice"
                aria-pressed={fallacyKind === kind}
                onClick={() => setFallacyKind(kind)}
                data-ml-lg-practice-fallacy={kind}
              >
                {t(`tools.logic.fallacy.kinds.${kind}`)}
              </button>
            ))}
          </div>
          <label className="sa-ml-lg__field">
            <span className="sa-ml-lg__label">{t('tools.logic.fallacy.refuteIt')}</span>
            <input
              className="sa-ml-lg__input"
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              data-ml-lg-practice-input
            />
          </label>
        </>
      )}

      {challenge.answerType === 'order' && (
        <OrderAnswer
          proofId={challenge.proofId}
          order={order}
          onOrder={setOrder}
        />
      )}

      {/* ── Le verdict : trois issues ─────────────────────────────────── */}
      {verdict && (
        <p
          className={`sa-ml-lg__message sa-ml-lg__message--${verdict.correct ? 'ok' : verdict.readable ? 'no' : 'warn'}`}
          role="status"
          aria-live="polite"
          data-ml-lg-practice-verdict={verdict.correct ? 'ok' : verdict.readable ? 'no' : 'unreadable'}
        >
          {verdict.correct
            ? t('tools.logic.practice.correct')
            : verdict.readable
              ? t('tools.logic.practice.incorrect')
              : verdict.detail?.tooLarge
                ? t('tools.logic.practice.tooLarge', { value: String(verdict.detail.value) })
                : t('tools.logic.practice.unreadable')}
          {!verdict.correct && (
            <span className="sa-ml-lg__note">{t('tools.logic.practice.retryFreely')}</span>
          )}
        </p>
      )}

      {hintKey && (
        <p className="sa-ml-lg__message sa-ml-lg__message--info" data-ml-lg-practice-hint={hints}>
          <Lightbulb size={14} aria-hidden="true" />
          {' '}
          {t(hintKey)}
        </p>
      )}

      {revealed && (
        <div className="sa-ml-lg__message sa-ml-lg__message--info" data-ml-lg-practice-explain>
          <p>{t(challenge.explainKey, challenge.explainParams ?? {})}</p>
          {challenge.answerType !== 'order' && challenge.expected != null && (
            <p>
              <strong>
                {t('tools.logic.practice.answerIs', { value: expectedText(t, challenge) })}
              </strong>
            </p>
          )}
        </div>
      )}

      <div className="sa-ml-lg__actions">
        <button type="button" className="sa-ml-lg__btn sa-ml-lg__btn--primary" onClick={check} data-ml-lg-practice-check>
          {t('tools.logic.practice.check')}
        </button>
        <button
          type="button"
          className="sa-ml-lg__btn"
          onClick={() => { setHints((n) => n + 1); onHint?.(); }}
          disabled={!hintsLeft}
          data-ml-lg-practice-hint-button
        >
          <Lightbulb size={16} aria-hidden="true" />
          {t('tools.logic.practice.hint')}
        </button>
        <button
          type="button"
          className="sa-ml-lg__btn"
          onClick={() => setRevealed(true)}
          data-ml-lg-practice-reveal
        >
          <Eye size={16} aria-hidden="true" />
          {t('tools.logic.practice.reveal')}
        </button>
        {target && (
          <button
            type="button"
            className="sa-ml-lg__btn"
            onClick={() => onShowInLab?.(target)}
            data-ml-lg-practice-show
          >
            <ExternalLink size={16} aria-hidden="true" />
            {t('tools.logic.practice.showInLab')}
          </button>
        )}
        <button type="button" className="sa-ml-lg__btn" onClick={onNext} data-ml-lg-practice-next>
          <RefreshCw size={16} aria-hidden="true" />
          {t('tools.logic.practice.next')}
        </button>
      </div>
    </aside>
  );
}

/**
 * L'énoncé de la question : une formule, une paire P/Q, un argument — et
 * TOUJOURS son domaine quand il en a un. « 1/n > 0 » est vrai sur ℕ* et
 * « 1/x > 0 » dépend de x sur ℝ : sans « n ∈ ℕ* » écrit à côté, les deux
 * questions se ressemblent et l'une des réponses paraît arbitraire (§6).
 */
function ChallengeSubject({ challenge }) {
  return (
    <>
      <SubjectBody challenge={challenge} />
      {challenge.domainLabel && (
        <Notation block data-ml-lg-practice-domain>{challenge.domainLabel}</Notation>
      )}
    </>
  );
}

function SubjectBody({ challenge }) {
  const { t } = useTranslation('mathlab');

  if (challenge.textKey) {
    return (
      <Statement data-ml-lg-practice-subject>{t(challenge.textKey)}</Statement>
    );
  }
  if (challenge.formula) {
    return <Notation block lead data-ml-lg-practice-subject>{challenge.formula}</Notation>;
  }
  if (challenge.pFormula) {
    // ⇔ pour une équivalence, ⇒ pour tout le reste : le connecteur EST la question.
    return (
      <Notation block lead data-ml-lg-practice-subject>
        {`${challenge.pFormula}  ${challenge.connective ?? '⇒'}  ${challenge.qFormula}`}
      </Notation>
    );
  }
  if (challenge.aFormula) {
    return (
      <Notation block lead data-ml-lg-practice-subject>
        {`A : ${challenge.aFormula}   ·   B : ${challenge.bFormula}`}
      </Notation>
    );
  }
  if (challenge.fallacyId) {
    return (
      <Statement data-ml-lg-practice-subject>
        {t(`tools.logic.fallacy.arguments.${challenge.fallacyId}`)}
      </Statement>
    );
  }

  return null;
}

/** §35 — remettre en ordre : on choisit les cartes une à une, on peut défaire. */
function OrderAnswer({ proofId, order, onOrder }) {
  const { t } = useTranslation('mathlab');
  const proof = findPreset(PROOFS, proofId);
  const remaining = proof.steps.filter((step) => !order.includes(step.id));

  return (
    <>
      <ol className="sa-ml-lg__steps" data-ml-lg-practice-order>
        {order.map((stepId, index) => (
          <li key={stepId} className="sa-ml-lg__step">
            <span className="sa-ml-lg__stepIndex">{index + 1}</span>
            <span className="sa-ml-lg__stepText">{t(`tools.logic.proof.proofs.${proofId}.${stepId}`)}</span>
          </li>
        ))}
      </ol>

      <div className="sa-ml-lg__actions">
        {remaining.map((step) => (
          <button
            key={step.id}
            type="button"
            className="sa-ml-lg__btn"
            onClick={() => onOrder([...order, step.id])}
            data-ml-lg-practice-order-pick={step.id}
          >
            {t(`tools.logic.proof.proofs.${proofId}.${step.id}`)}
          </button>
        ))}
        {order.length > 0 && (
          <button type="button" className="sa-ml-lg__btn" onClick={() => onOrder(order.slice(0, -1))}>
            {t('tools.logic.proof.undo')}
          </button>
        )}
      </div>
      <p className="sa-ml-lg__sr">{anyValidOrder(proof).length}</p>
    </>
  );
}

function choiceLabel(t, challenge, choice) {
  if (challenge.kind === 'quantifierNegation') return choice;               // une formule
  if (challenge.kind === 'proofGap') return t(`tools.logic.proof.proofs.${challenge.proofId}.${choice}`);
  if (choice === 'same') return t('tools.logic.practice.sameValue');
  if (choice === 'different') return t('tools.logic.practice.differentValue');
  if (choice === 'yes') return t('tools.logic.practice.yes');
  if (choice === 'no') return t('tools.logic.practice.no');

  return t(`tools.logic.verdicts.${choice}`);
}

function expectedText(t, challenge) {
  if (challenge.answerType === 'choice') return choiceLabel(t, challenge, challenge.expected);

  return String(challenge.expected);
}
