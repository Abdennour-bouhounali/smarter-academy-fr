import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Eye, RefreshCw, X, Check } from 'lucide-react';
import { checkAnswer } from './practice.js';
import { formatDegrees } from './trigFormat.js';

/**
 * L'ENTRAÎNEMENT « prédire → révéler → vérifier » (§25).
 *
 * Le panneau tient une conversation en trois temps :
 *   1. **prédire** — la question, un champ, et la possibilité de ne pas
 *      répondre du tout ;
 *   2. **révéler** — le cercle s'amène à l'angle, et l'explication
 *      GÉOMÉTRIQUE s'écrit ;
 *   3. **vérifier** — le verdict, puis une autre question si on veut.
 *
 * ── Ce que le panneau ne fait JAMAIS ─────────────────────────────────────
 * Il ne bloque pas. « révéler » est toujours accessible, y compris sans
 * avoir répondu ; une réponse fausse laisse le champ ouvert et le bouton
 * « réessayer » à côté ; « فتح » ferme l'entraînement à tout instant et rend
 * le cercle intact. §25 : « never permanently block the student ».
 *
 * Il ne gamifie pas non plus (§45) : un compteur « 3 / 7 », pas de série,
 * pas de médaille, pas de son.
 *
 * Le dessin RESTE manipulable derrière ce panneau : l'élève peut tourner le
 * point pour chercher sa réponse, ce qui est exactement l'intention de §48
 * (« Observe → Manipulate → Predict → Reveal → Verify »).
 */
export default function PracticePanel({
  practice, onAnswer, onSubmit, onReveal, onHint, onNext, onClose,
}) {
  const { t } = useTranslation('mathlab');
  const { challenge, phase, answer, attempts, hintsUsed, solved, seen } = practice;
  const inputRef = useRef(null);
  const [multi, setMulti] = useState([]);
  const [signs, setSigns] = useState({});

  // Une nouvelle question remet les réponses composées à zéro.
  useEffect(() => {
    setMulti([]);
    setSigns({});
    if (challenge?.answerType === 'number') inputRef.current?.focus();
  }, [challenge]);

  const verdict = phase === 'verify' || phase === 'reveal'
    ? checkAnswer(challenge, composed(challenge, answer, multi, signs))
    : null;

  const submit = useCallback(() => {
    onSubmit?.(composed(challenge, answer, multi, signs));
  }, [challenge, answer, multi, signs, onSubmit]);

  if (!challenge) return null;

  const hint = hintsUsed > 0 ? challenge.hintKeys[Math.min(hintsUsed - 1, challenge.hintKeys.length - 1)] : null;

  return (
    <aside className="sa-ml-trig__practice" role="region" aria-label={t('tools.trigonometry.practiceHeading')} data-ml-trig-practice>
      <header className="sa-ml-trig__practice-head">
        <h3 className="sa-ml-trig__practice-title">{t('tools.trigonometry.practiceHeading')}</h3>
        <span className="sa-ml-trig__practice-score" data-ml-trig-practice-score>
          {t('tools.trigonometry.practiceScore', { solved, seen })}
        </span>
        <button
          type="button"
          className="sa-ml-trig__btn sa-ml-trig__btn--icon"
          onClick={onClose}
          aria-label={t('tools.trigonometry.practiceClose')}
          title={t('tools.trigonometry.practiceClose')}
          data-ml-trig-practice-close
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <p className="sa-ml-trig__question" data-ml-trig-question>
        {t(challenge.promptKey, challenge.promptParams)}
      </p>

      {/* ── La réponse, selon la forme de la question ─────────────────── */}
      {challenge.answerType === 'number' && (
        <label className="sa-ml-trig__field">
          <span className="sa-ml-trig__sr">{t('tools.trigonometry.yourPrediction')}</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            className="sa-ml-trig__input sa-ml-trig__input--answer"
            dir="ltr"
            value={answer}
            placeholder={t('tools.trigonometry.answerPlaceholder')}
            onChange={(event) => onAnswer?.(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
            disabled={phase === 'reveal'}
            data-ml-trig-answer
          />
        </label>
      )}

      {challenge.answerType === 'choice' && (
        <div className="sa-ml-trig__chips" role="group">
          {challenge.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`sa-ml-trig__chip${answer === choice ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => onAnswer?.(choice)}
              aria-pressed={answer === choice}
              data-ml-trig-choice={choice}
            >
              {t(`tools.trigonometry.practice.choices.${choice}`)}
            </button>
          ))}
        </div>
      )}

      {challenge.answerType === 'multi' && (
        <div className="sa-ml-trig__chips" role="group">
          {challenge.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`sa-ml-trig__chip${multi.includes(choice) ? ' sa-ml-trig__chip--active' : ''}`}
              onClick={() => setMulti((current) => (current.includes(choice)
                ? current.filter((v) => v !== choice)
                : [...current, choice]))}
              aria-pressed={multi.includes(choice)}
              data-ml-trig-choice={choice}
            >
              {t(`tools.trigonometry.quadrants.q${choice}`)}
            </button>
          ))}
        </div>
      )}

      {challenge.answerType === 'signs' && (
        <div className="sa-ml-trig__signpicker" role="group">
          {['sin', 'cos', 'tan'].map((ratio) => (
            <div key={ratio} className="sa-ml-trig__signpick">
              <span className="sa-ml-trig__signpick-name" dir="ltr">{ratio}</span>
              {[1, -1].map((sign) => (
                <button
                  key={sign}
                  type="button"
                  className={`sa-ml-trig__chip${signs[ratio] === sign ? ' sa-ml-trig__chip--active' : ''}`}
                  onClick={() => setSigns((current) => ({ ...current, [ratio]: sign }))}
                  aria-pressed={signs[ratio] === sign}
                  aria-label={`${ratio} ${sign > 0 ? '+' : '−'}`}
                  data-ml-trig-signpick={`${ratio}${sign > 0 ? '+' : '-'}`}
                >
                  {sign > 0 ? '+' : '−'}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── L'indice, à la demande (§25) ──────────────────────────────── */}
      {hint && (
        <p className="sa-ml-trig__hintline" role="status" data-ml-trig-hint>
          <Lightbulb size={15} aria-hidden="true" />
          {t(hint, challenge.hintParams)}
        </p>
      )}

      {/* ── Le verdict : jamais un verrou ─────────────────────────────── */}
      {verdict && (
        <p
          className={`sa-ml-trig__verdict sa-ml-trig__verdict--${verdict.correct ? 'ok' : verdict.readable ? 'no' : 'unreadable'}`}
          role="status"
          data-ml-trig-verdict={verdict.correct ? 'correct' : verdict.readable ? 'incorrect' : 'unreadable'}
        >
          {/* §37 : jamais la couleur seule — une icône ET un mot. */}
          {verdict.correct ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
          {t(verdict.correct
            ? 'tools.trigonometry.practice.correct'
            : verdict.readable
              ? 'tools.trigonometry.practice.incorrect'
              : 'tools.trigonometry.practice.unreadable')}
        </p>
      )}

      {/* ── L'explication GÉOMÉTRIQUE, à la révélation (§25) ──────────── */}
      {phase === 'reveal' && (
        <div className="sa-ml-trig__explain" data-ml-trig-explain>
          <p className="sa-ml-trig__explain-answer" dir="ltr">
            {challenge.expectedText ?? t(`tools.trigonometry.practice.choices.${challenge.expected}`)}
          </p>
          <p className="sa-ml-trig__explain-text">
            {t(challenge.explainKey, challenge.explainParams)}
          </p>
          {Number.isFinite(challenge.angle) && (
            <p className="sa-ml-trig__note">
              {t('tools.trigonometry.practice.lookAtCircle', { angle: formatDegrees(challenge.angle, 0) })}
            </p>
          )}
        </div>
      )}

      {/* ── Les actions : toutes disponibles, toujours ────────────────── */}
      <div className="sa-ml-trig__practice-actions">
        {phase !== 'reveal' && (
          <button
            type="button"
            className="sa-ml-trig__btn sa-ml-trig__btn--primary"
            onClick={submit}
            data-ml-trig-check
          >
            {t('tools.trigonometry.practice.check')}
          </button>
        )}
        <button
          type="button"
          className="sa-ml-trig__btn"
          onClick={onHint}
          disabled={hintsUsed >= challenge.hintKeys.length}
          data-ml-trig-hint-btn
        >
          <Lightbulb size={15} aria-hidden="true" />
          {t('tools.trigonometry.practice.hint')}
        </button>
        <button
          type="button"
          className="sa-ml-trig__btn"
          onClick={onReveal}
          data-ml-trig-reveal
        >
          <Eye size={15} aria-hidden="true" />
          {t('tools.trigonometry.practice.reveal')}
        </button>
        <button
          type="button"
          className="sa-ml-trig__btn"
          onClick={onNext}
          data-ml-trig-next
        >
          <RefreshCw size={15} aria-hidden="true" />
          {t('tools.trigonometry.practice.next')}
        </button>
      </div>

      {attempts > 0 && phase !== 'reveal' && (
        <p className="sa-ml-trig__note">{t('tools.trigonometry.practice.retryFreely')}</p>
      )}
    </aside>
  );
}

/** La réponse composée, selon la forme attendue. */
function composed(challenge, answer, multi, signs) {
  if (!challenge) return answer;
  if (challenge.answerType === 'multi') return multi;
  if (challenge.answerType === 'signs') return signs;

  return answer;
}
