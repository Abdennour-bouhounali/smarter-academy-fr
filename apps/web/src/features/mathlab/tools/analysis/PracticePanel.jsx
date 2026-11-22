import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, RefreshCw, Check, Eye } from 'lucide-react';
import MathField from './MathField.jsx';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { generateChallenge, checkAnswer, PREDICTIONS } from './practice.js';

/**
 * L'ENTRAÎNEMENT et la PRÉDICTION (§28, §30, §31, §43).
 *
 * Trois règles tiennent ce composant, et elles sont toutes des interdits :
 *
 * 1. **Rien ne bloque.** Une réponse fausse affiche l'explication et laisse
 *    tout ouvert : le graphe reste manipulable derrière, le champ reste
 *    éditable, « أعد المحاولة » est toujours là. Il n'existe aucun état
 *    « verrouillé » dans ce fichier — donc il ne peut pas en arriver un (§43).
 * 2. **Aucun indice ne donne la réponse** (§31). Les trois indices viennent
 *    du défi lui-même, du plus général au plus précis, et le troisième
 *    montre encore une méthode, pas un nombre.
 * 3. **La prédiction n'est jamais notée.** §28 : « Do not punish wrong
 *    predictions. » On dit ce qui s'est passé, on ne compte pas le point.
 *
 * L'état de la question courante n'est PAS persisté (§42) : un élève qui
 * rouvre son document retrouve son laboratoire, pas un défi à moitié fait.
 */
export default function PracticePanel({ data, onApplyFocus, onResult, initialChallenge = null }) {
  const { t } = useTranslation('mathlab');
  // `initialChallenge` ne sert qu'aux tests (rendu statique sans effet).
  const [challenge, setChallenge] = useState(initialChallenge);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [level, setLevel] = useState('programme');

  const nextChallenge = useCallback((nextLevel = level) => {
    const generated = generateChallenge(Date.now() + Math.floor(Math.random() * 100000), { level: nextLevel });
    setChallenge(generated);
    setAnswer('');
    setVerdict(null);
    setHintIndex(-1);
  }, [level]);

  // Le premier défi n'est engendré qu'à l'ouverture de l'onglet.
  useEffect(() => {
    if (!challenge) nextChallenge();
  }, [challenge, nextChallenge]);

  const submit = () => {
    if (!challenge) return;
    const result = checkAnswer(challenge, answer);
    setVerdict(result);
    // Le score ne compte qu'une RÉPONSE, jamais une prédiction.
    if (result.reason !== 'empty' && result.reason !== 'unparsed') onResult?.(result.correct);
  };

  const showOnGraph = () => {
    if (challenge?.focus) onApplyFocus(challenge.focus, challenge.source);
  };

  if (!challenge) return null;

  const hints = challenge.hintKeys ?? [];
  const canHint = hintIndex < hints.length - 1;

  return (
    <div className="sa-ml-an__practice" data-ml-an-practice={challenge.kind}>
      <div className="sa-ml-an__segmented" role="group" aria-label={t('tools.analysis.practice.title')}>
        {['programme', 'all'].map((value) => (
          <button
            key={value}
            type="button"
            className={`sa-ml-an__seg${level === value ? ' is-active' : ''}`}
            onClick={() => { setLevel(value); nextChallenge(value); }}
            aria-pressed={level === value}
            data-ml-an-level={value}
          >
            {t(`tools.analysis.practice.level${value === 'programme' ? 'Programme' : 'All'}`)}
          </button>
        ))}
      </div>

      <p className="sa-ml-an__question" data-ml-an-question>
        {t(challenge.promptKey, challenge.promptParams)}
      </p>
      {/* La source est du LaTeX (`\\frac{x^2-4}{x-2}`) : elle se REND, elle ne
          s'affiche pas brute — l'élève lisait « \\frac{x^2-4}{x-2} ». */}
      <p className="sa-ml-an__math sa-ml-an__math--strong" dir="ltr" data-ml-an-source>
        <MathText>{`$f(x) = ${challenge.source}$`}</MathText>
      </p>

      <button type="button" className="sa-ml-an__action" onClick={showOnGraph} data-ml-an-show>
        <Eye size={16} aria-hidden="true" />
        <span>{t('tools.analysis.practice.showOnGraph')}</span>
      </button>

      {challenge.answerType === 'choice' ? (
        <div className="sa-ml-an__chips">
          {challenge.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`sa-ml-an__chip${answer === choice ? ' is-active' : ''}`}
              onClick={() => setAnswer(choice)}
              aria-pressed={answer === choice}
              data-ml-an-choice={choice}
            >
              {t(`tools.analysis.practice.choices.${choice}`)}
            </button>
          ))}
        </div>
      ) : (
        <div className="sa-ml-an__field">
          <span className="sa-ml-an__fieldlabel">{t('tools.analysis.practice.answer')}</span>
          {/* Une réponse est souvent une FRACTION (« ½ ») ou un négatif : le
              champ mathématique l'écrit comme au cahier, et son clavier met
              la fraction et le moins sous le pouce. */}
          <MathField
            value={answer}
            onCommit={setAnswer}
            ariaLabel={t('tools.analysis.practice.answer')}
            keyboard="answer"
            testId="answer"
          />
        </div>
      )}

      <div className="sa-ml-an__actions">
        <button type="button" className="sa-ml-an__action sa-ml-an__action--primary" onClick={submit} data-ml-an-check>
          <Check size={16} aria-hidden="true" />
          <span>{t('tools.analysis.practice.check')}</span>
        </button>
        <button
          type="button"
          className="sa-ml-an__action"
          onClick={() => setHintIndex((index) => Math.min(index + 1, hints.length - 1))}
          disabled={!canHint}
          data-ml-an-hint
        >
          <Lightbulb size={16} aria-hidden="true" />
          <span>{hintIndex < 0 ? t('tools.analysis.practice.hint') : t('tools.analysis.practice.nextHint')}</span>
        </button>
        <button type="button" className="sa-ml-an__action" onClick={() => nextChallenge()} data-ml-an-new>
          <RefreshCw size={16} aria-hidden="true" />
          <span>{t('tools.analysis.practice.newChallenge')}</span>
        </button>
      </div>

      {/* §31 : les indices se dévoilent UN par UN, et aucun ne dit la réponse. */}
      {hintIndex >= 0 && (
        <ol className="sa-ml-an__hints" data-ml-an-hints={hintIndex + 1}>
          {hints.slice(0, hintIndex + 1).map((key) => (
            <li key={key} className="sa-ml-an__hintitem">{t(key)}</li>
          ))}
        </ol>
      )}
      {hintIndex >= hints.length - 1 && hints.length > 0 && (
        <p className="sa-ml-an__note">{t('tools.analysis.practice.noMoreHints')}</p>
      )}

      {verdict && (
        <div
          className={`sa-ml-an__verdict${verdict.correct ? ' sa-ml-an__verdict--ok' : ' sa-ml-an__verdict--warn'}`}
          role="status"
          data-ml-an-verdict={verdict.correct ? 'correct' : 'incorrect'}
        >
          {verdict.reason === 'empty' && t('tools.analysis.practice.empty')}
          {verdict.reason === 'unparsed' && t('tools.analysis.practice.unparsed')}
          {!verdict.reason && (verdict.correct
            ? t('tools.analysis.practice.correct')
            : t('tools.analysis.practice.incorrect'))}
          {/* §29 : on ne dit pas « faux », on MONTRE le calcul vrai. */}
          {!verdict.reason && !verdict.correct && challenge.explainKey && (
            <p className="sa-ml-an__explain" dir="auto" data-ml-an-explain>
              {t(challenge.explainKey, challenge.explainParams)}
            </p>
          )}
          {!verdict.reason && !verdict.correct && (
            <p className="sa-ml-an__note">{t('tools.analysis.practice.keepExploring')}</p>
          )}
        </div>
      )}

      <p className="sa-ml-an__score" data-ml-an-score>
        {t('tools.analysis.practice.score', { solved: data.practice.solved, seen: data.practice.seen })}
      </p>

      <PredictionBlock lab={data.lab} t={t} onApplyFocus={onApplyFocus} />
    </div>
  );
}

/**
 * La PRÉDICTION (§28) : on demande avant de montrer, et on ne punit jamais.
 *
 * Elle est séparée du défi parce qu'elle n'a pas le même statut : un défi se
 * corrige et compte au score, une prédiction s'observe. Mélanger les deux
 * ferait de « je me suis trompé en devinant » une faute — exactement ce que
 * §28 interdit.
 */
function PredictionBlock({ lab, t, onApplyFocus }) {
  const available = PREDICTIONS.filter((prediction) => prediction.lab === lab);
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const prediction = available[0] ?? null;

  useEffect(() => {
    setChoice(null);
    setRevealed(false);
  }, [lab]);

  if (!prediction) return null;

  return (
    <section className="sa-ml-an__prediction" data-ml-an-prediction={prediction.id}>
      <h4 className="sa-ml-an__subtitle">{t('tools.analysis.predict.title')}</h4>
      <p className="sa-ml-an__question">{t(`tools.analysis.predict.${prediction.id}`)}</p>
      {/* La prédiction porte sur SA fonction : sa réponse est calculée sur
          cette scène, pas sur celle que l'élève a tapée (practice.js). */}
      <p className="sa-ml-an__math" dir="ltr" data-ml-an-predict-source>
        <MathText>{`$f(x) = ${prediction.source}$`}</MathText>
      </p>
      <button
        type="button"
        className="sa-ml-an__action"
        onClick={() => onApplyFocus?.(prediction.setup, prediction.source)}
        data-ml-an-predict-setup
      >
        <Eye size={16} aria-hidden="true" />
        <span>{t('tools.analysis.practice.showOnGraph')}</span>
      </button>
      <div className="sa-ml-an__chips">
        {prediction.choices.map((value) => (
          <button
            key={value}
            type="button"
            className={`sa-ml-an__chip${choice === value ? ' is-active' : ''}`}
            onClick={() => { setChoice(value); setRevealed(false); }}
            aria-pressed={choice === value}
            data-ml-an-predict-choice={value}
          >
            {t(`tools.analysis.predict.choices.${value}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="sa-ml-an__action"
        onClick={() => {
          setRevealed(true);
          // Révéler, c'est FAIRE le geste : la scène passe à son état « après ».
          onApplyFocus?.(prediction.after ?? prediction.setup, prediction.source);
        }}
        disabled={!choice}
        data-ml-an-reveal
      >
        <Eye size={16} aria-hidden="true" />
        <span>{t('tools.analysis.predict.reveal')}</span>
      </button>
      {revealed && (
        <div className="sa-ml-an__verdict" role="status" data-ml-an-predict-result={choice === prediction.expected ? 'match' : 'differ'}>
          <p>
            {choice === prediction.expected
              ? t('tools.analysis.predict.correct')
              : t('tools.analysis.predict.incorrect')}
          </p>
          {/* Aucune sanction : une prédiction fausse est un bon départ. */}
          <p className="sa-ml-an__note">{t('tools.analysis.predict.noBlame')}</p>
        </div>
      )}
    </section>
  );
}
