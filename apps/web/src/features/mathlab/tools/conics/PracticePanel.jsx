import { memo, useEffect, useState } from 'react';
import {
  GraduationCap, Lightbulb, ArrowRight, Check, X, LogOut,
} from 'lucide-react';
import * as C from './conicMath.js';
import {
  hintAt, hintCount, parseNumberInput, parsePointInput,
} from './practice.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * L'ENTRAÎNEMENT (§36 – §42) — prédire, révéler, vérifier.
 *
 * ── Ce panneau ne BLOQUE jamais ──────────────────────────────────────────
 * C'est la règle du مختبر, tenue par la trigonométrie, les suites et les
 * تحويلات avant lui : une réponse fausse ne ferme aucune porte. Elle montre
 * la bonne réponse, la géométrie se met en évidence sur le plan (le parent
 * s'en charge via `revealFor`), et le bouton « السؤال التالي » reste là.
 * §42 est explicite : l'élève doit pouvoir quitter l'entraînement à tout
 * moment et retrouver son plan intact — d'où « الخروج من التدرّب », toujours
 * visible.
 *
 * ── Les indices ne donnent pas la réponse (§40) ──────────────────────────
 * Ils se dévoilent un par un et s'arrêtent avant la conclusion : le dernier
 * livre une donnée intermédiaire (`c = 4`), jamais le point cherché.
 */

function PracticePanel({
  mode, challenge, verdict, hintIndex, practice, onStart, onNext, onAnswer, onHint, onLeave, t,
}) {
  const [pointDraft, setPointDraft] = useState({ x: '', y: '' });
  const [numberDraft, setNumberDraft] = useState('');
  // Une saisie illisible (champ vide, « abc ») ne reçoit AUCUN verdict : ni
  // juste ni fausse, on dit seulement qu'on ne l'a pas lue.
  const [unreadable, setUnreadable] = useState(false);

  // Une nouvelle question vide les champs — sinon la réponse précédente reste.
  useEffect(() => {
    setPointDraft({ x: '', y: '' });
    setNumberDraft('');
    setUnreadable(false);
  }, [challenge]);

  if (mode !== 'practice' || !challenge) {
    return (
      <div className="sa-ml-cn__practicestart">
        <GraduationCap size={28} aria-hidden="true" />
        <h3 className="sa-ml-cn__h3">{t('tools.conics.practice.title')}</h3>
        <p className="sa-ml-cn__note">{t('tools.conics.practice.intro')}</p>
        <button type="button" className="sa-ml-btn sa-ml-btn--primary" onClick={onStart} data-ml-cn-practice-start>
          <span>{t('tools.conics.practice.start')}</span>
        </button>
        {practice.attempts > 0 && (
          <p className="sa-ml-cn__score" data-ml-cn-score>
            {t('tools.conics.practice.score', { solved: practice.solved, attempts: practice.attempts })}
          </p>
        )}
      </div>
    );
  }

  const hint = hintIndex >= 0 ? hintAt(challenge, hintIndex) : null;
  const canHint = hintIndex + 1 < hintCount(challenge) && !verdict;

  return (
    <div className="sa-ml-cn__practice" data-ml-cn-practice={challenge.kind}>
      <div className="sa-ml-cn__practicehead">
        <span className="sa-ml-cn__score" data-ml-cn-score>
          {t('tools.conics.practice.score', { solved: practice.solved, attempts: practice.attempts })}
        </span>
        <button type="button" className="sa-ml-btn sa-ml-btn--ghost sa-ml-cn__small" onClick={onLeave} data-ml-cn-practice-leave>
          <LogOut size={14} aria-hidden="true" />
          <span>{t('tools.conics.practice.leave')}</span>
        </button>
      </div>

      {/* L'ÉNONCÉ : la question, et l'équation dont elle parle */}
      <p className="sa-ml-cn__question" data-ml-cn-question>
        {t(`tools.conics.practice.prompts.${challenge.prompt}`, {
          target: challenge.extra?.target,
          parameter: challenge.extra?.parameter,
        })}
      </p>
      <p className="sa-ml-cn__equationline" dir="ltr" data-ml-cn-practice-equation>{challenge.equation}</p>

      {/* LA RÉPONSE — une forme par type de question */}
      {!verdict && challenge.answerKind === 'point' && (
        <form
          className="sa-ml-cn__answerform"
          onSubmit={(event) => {
            event.preventDefault();
            const point = parsePointInput(pointDraft);
            setUnreadable(!point);
            if (point) onAnswer(point);
          }}
        >
          <div className="sa-ml-cn__pointinputs" dir="ltr">
            <span aria-hidden="true">(</span>
            <input
              type="text"
              inputMode="decimal"
              className="sa-ml-cn__answerinput"
              value={pointDraft.x}
              onChange={(event) => { setUnreadable(false); setPointDraft((d) => ({ ...d, x: event.target.value })); }}
              aria-label={t('tools.conics.practice.abscissa')}
              data-ml-cn-answer="x"
            />
            <span aria-hidden="true">;</span>
            <input
              type="text"
              inputMode="decimal"
              className="sa-ml-cn__answerinput"
              value={pointDraft.y}
              onChange={(event) => { setUnreadable(false); setPointDraft((d) => ({ ...d, y: event.target.value })); }}
              aria-label={t('tools.conics.practice.ordinate')}
              data-ml-cn-answer="y"
            />
            <span aria-hidden="true">)</span>
          </div>
          <button type="submit" className="sa-ml-btn sa-ml-btn--primary" data-ml-cn-answer-submit>
            {t('tools.conics.practice.check')}
          </button>
        </form>
      )}

      {!verdict && challenge.answerKind === 'number' && (
        <form
          className="sa-ml-cn__answerform"
          onSubmit={(event) => {
            event.preventDefault();
            const value = parseNumberInput(numberDraft);
            setUnreadable(!Number.isFinite(value));
            if (Number.isFinite(value)) onAnswer(value);
          }}
        >
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="sa-ml-cn__answerinput"
            value={numberDraft}
            onChange={(event) => { setUnreadable(false); setNumberDraft(event.target.value); }}
            aria-label={t('tools.conics.practice.value')}
            data-ml-cn-answer="value"
          />
          <button type="submit" className="sa-ml-btn sa-ml-btn--primary" data-ml-cn-answer-submit>
            {t('tools.conics.practice.check')}
          </button>
        </form>
      )}

      {!verdict && unreadable && (challenge.answerKind === 'point' || challenge.answerKind === 'number') && (
        <p className="sa-ml-cn__error" role="status" data-ml-cn-unreadable>
          {t('tools.conics.practice.unreadable')}
        </p>
      )}

      {!verdict && (challenge.answerKind === 'choice' || challenge.answerKind === 'count') && (
        <div className="sa-ml-cn__choices" role="group" aria-label={t('tools.conics.practice.choices')}>
          {challenge.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="sa-ml-cn__choice"
              onClick={() => onAnswer(choiceValue(challenge, choice))}
              data-ml-cn-choice={choice.id}
            >
              <ChoiceLabel challenge={challenge} choice={choice} t={t} />
            </button>
          ))}
        </div>
      )}

      {/* §40 — L'INDICE, dévoilé à la demande */}
      {hint && (
        <p className="sa-ml-cn__hintbox" data-ml-cn-hint={hint.key}>
          <Lightbulb size={15} aria-hidden="true" />
          <span>{t(`tools.conics.practice.hints.${hint.key}`, hint.params)}</span>
        </p>
      )}

      {/* §36 — LE VERDICT, avec la bonne réponse, et jamais un blocage */}
      {verdict && (
        <div className={`sa-ml-cn__verdictbox${verdict.correct ? ' sa-ml-cn__verdictbox--ok' : ''}`} role="status" data-ml-cn-verdict={verdict.correct ? 'correct' : 'incorrect'}>
          {verdict.correct ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
          <div>
            <p>{t(verdict.correct ? 'tools.conics.practice.correct' : 'tools.conics.practice.incorrect')}</p>
            {!verdict.correct && (
              <p className="sa-ml-cn__expected" dir="ltr" data-ml-cn-expected>
                {expectedText(challenge, verdict.expected, t)}
              </p>
            )}
            <p className="sa-ml-cn__note">{t('tools.conics.practice.lookAtPlane')}</p>
          </div>
        </div>
      )}

      <div className="sa-ml-cn__practicefoot">
        {canHint && (
          <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={onHint} data-ml-cn-hint-btn>
            <Lightbulb size={15} aria-hidden="true" />
            <span>{t('tools.conics.practice.hint')}</span>
          </button>
        )}
        <button type="button" className="sa-ml-btn sa-ml-btn--ghost" onClick={() => onNext()} data-ml-cn-next>
          <ArrowRight size={15} aria-hidden="true" />
          <span>{t('tools.conics.practice.next')}</span>
        </button>
      </div>
    </div>
  );
}

export default memo(PracticePanel);

/** Ce qu'un choix VAUT, selon la famille de question. */
function choiceValue(challenge, choice) {
  if (challenge.answerKind === 'count') return choice.value;
  if (challenge.kind === 'matchGraph') return choice.id;
  if (challenge.kind === 'asymptote') return { slope: choice.slope };
  if (challenge.kind === 'pointPosition') return choice.value;

  return choice.point ?? choice.value ?? choice.id;
}

/**
 * L'ÉTIQUETTE d'un choix.
 *
 * §37 demande de montrer des GRAPHES : les choix de `matchGraph` sont donc
 * de vraies vignettes dessinées depuis la conique, pas des équations
 * réécrites — sinon la question « quel graphe correspond » n'aurait plus
 * rien de graphique.
 */
function ChoiceLabel({ challenge, choice, t }) {
  if (challenge.kind === 'matchGraph') {
    return <MiniGraph conic={choice.conic} />;
  }
  if (challenge.answerKind === 'count') {
    return <span dir="ltr" className="sa-ml-cn__mono">{choice.value}</span>;
  }
  if (challenge.kind === 'pointPosition') {
    return <span>{t(`tools.conics.probe.position.${choice.value}`)}</span>;
  }
  if (challenge.kind === 'asymptote') {
    return <span dir="ltr" className="sa-ml-cn__mono">{`y = ${formatValue(choice.slope)}x`}</span>;
  }

  return (
    <span dir="ltr" className="sa-ml-cn__mono">
      {choice.point ? `(${formatValue(choice.point.x)} ; ${formatValue(choice.point.y)})` : ''}
    </span>
  );
}

/**
 * §37 — UNE VIGNETTE : la conique dessinée en petit, avec ses axes.
 *
 * Elle réutilise `conicPolylines` — le même code que le grand plan, donc la
 * même courbe. Une vignette qui mentirait sur la forme rendrait la question
 * impossible.
 */
function MiniGraph({ conic }) {
  const SIZE = 84;
  const SPAN = 12; // de −6 à +6
  const viewport = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
  const toPixel = (p) => [
    ((p.x - viewport.xMin) / SPAN) * SIZE,
    ((viewport.yMax - p.y) / SPAN) * SIZE,
  ];
  const polylines = C.conicPolylines(conic, viewport, 96);

  return (
    <svg className="sa-ml-cn__mini" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-hidden="true" focusable="false">
      <line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} className="sa-ml-cn__miniaxis" />
      <line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} className="sa-ml-cn__miniaxis" />
      {polylines.map((points, index) => (
        <path
          key={index}
          className="sa-ml-cn__minicurve"
          d={points.reduce((d, point, i) => {
            const [px, py] = toPixel(point);
            if (!Number.isFinite(px) || !Number.isFinite(py)) return d;

            return `${d}${i === 0 || d === '' ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
          }, '')}
          fill="none"
        />
      ))}
    </svg>
  );
}

/** La bonne réponse, écrite dans la forme de la question. */
function expectedText(challenge, expected, t) {
  if (challenge.answerKind === 'count') return String(expected);
  if (challenge.kind === 'pointPosition') return t(`tools.conics.probe.position.${expected}`);
  if (challenge.kind === 'asymptote') return `y = ${formatValue(expected.slope)}x`;
  if (challenge.kind === 'matchGraph') return t('tools.conics.practice.seeHighlight');
  if (C.isPoint(expected)) return `(${formatValue(expected.x)} ; ${formatValue(expected.y)})`;

  return formatValue(expected);
}
