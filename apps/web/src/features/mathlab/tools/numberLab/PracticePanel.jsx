import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, Eye, RefreshCw, Check, X } from 'lucide-react';
import NumberLineStage from './NumberLineStage.jsx';
import {
  generateChallenge, checkAnswer, nextHint, explainError, revealAnswer,
} from './practice.js';
import FractionShape from './FractionShape.jsx';
import { frameValues, formatNumber } from './numberValue.js';
import {
  factorPairs, divisors, multiples, gcd, lcm, isPrime, divisibilityBy, roundingDetail,
} from './numberTheory.js';

/**
 * §48 à §53 — TAWAQQA' → IKSHIF → TAHAQQAQ.
 *
 * Trois règles tenues par la structure même du panneau :
 *
 * 1. **Rien ne bloque.** Il n'y a pas d'état « verrouillé ». Après une erreur
 *    l'élève peut réessayer, demander un indice, révéler, ou changer de
 *    question — et le laboratoire derrière reste manipulable (§54).
 * 2. **L'erreur MONTRE (§53).** Le verdict faux ne dit pas « faux » : il pose
 *    les valeurs sur une droite et POSE UNE QUESTION (« Lequel est le plus
 *    à droite ? »). C'est `explainError` qui décide quoi montrer ; l'écran obéit.
 * 3. **Les indices vont du général au précis (§52).** Le premier dit la
 *    méthode, le dernier approche du résultat — et la réponse elle-même n'est
 *    donnée que si on la demande.
 *
 * §49 : quand la question se prête au geste, on RÉPOND EN GLISSANT — placer
 * 3/4 sur la droite, pousser un curseur à 35 %. Pas de champ texte là où le
 * doigt dit mieux.
 */
export default function PracticePanel({ level, stats, onLevelChange, onAttempt, compact }) {
  const { t } = useTranslation('mathlab');
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [dragValue, setDragValue] = useState(0.5);
  const [selection, setSelection] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealed, setRevealed] = useState(null);

  const nextQuestion = useCallback(() => {
    const next = generateChallenge(Date.now() % 1000000 + Math.floor(Math.random() * 1000), level);
    setChallenge(next);
    setAnswer('');
    setSelection([]);
    setVerdict(null);
    setHintsUsed(0);
    setRevealed(null);
    setDragValue(next.answerType === 'slider' ? 50 : 0.5);
  }, [level]);

  useEffect(() => { nextQuestion(); }, [nextQuestion]);

  const submit = useCallback(() => {
    if (!challenge || verdict?.correct) return;
    const given = challenge.answerType === 'drag' || challenge.answerType === 'slider'
      ? dragValue
      : (challenge.answerType === 'set' ? selection : answer);
    const result = checkAnswer(challenge, given);
    setVerdict(result);
    onAttempt?.({ solved: result.correct, hint: false });
  }, [challenge, answer, dragValue, selection, verdict, onAttempt]);

  const askHint = useCallback(() => {
    const hint = nextHint(challenge, hintsUsed);
    if (!hint) return;
    setHintsUsed((n) => n + 1);
    onAttempt?.({ solved: false, hint: true, countAttempt: false });
  }, [challenge, hintsUsed, onAttempt]);

  if (!challenge) return null;

  const explanation = verdict && !verdict.correct ? explainError(challenge, verdict) : null;
  const hints = (challenge.hintKeys ?? []).slice(0, hintsUsed);
  const showReveal = revealed || (verdict && !verdict.correct && explanation?.reveal);

  return (
    <section className="sa-ml-nb__practice">
      <header className="sa-ml-nb__practice-head">
        <div>
          <h3 className="sa-ml-nb__heading">{t('tools.numberLab.practice.title')}</h3>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.practice.intro')}</p>
        </div>
        <div className="sa-ml-nb__practice-meta">
          <label className="sa-ml-nb__field">
            <span className="sa-ml-nb__label">{t('tools.numberLab.practice.level')}</span>
            <select
              className="sa-ml-nb__select"
              value={level}
              onChange={(event) => onLevelChange(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} — {t(`tools.numberLab.practice.levels.${n}`)}</option>
              ))}
            </select>
          </label>
          <output className="sa-ml-nb__score">
            {t('tools.numberLab.practice.score', { solved: stats.solved, attempts: stats.attempts })}
          </output>
        </div>
      </header>
      <p className="sa-ml-nb__muted">{t('tools.numberLab.practice.levelHint')}</p>

      <div className="sa-ml-nb__question-card">
        <p className="sa-ml-nb__question">{t(challenge.promptKey, challenge.promptParams ?? {})}</p>

        {/* La réponse : au doigt quand c'est possible (§49). */}
        {challenge.answerType === 'choice' && (
          <ul className="sa-ml-nb__choices">
            {challenge.choices.map((choice, index) => (
              <li key={choice}>
                <button
                  type="button"
                  className={`sa-ml-nb__choice${answer === choice ? ' is-picked' : ''}`}
                  onClick={() => setAnswer(choice)}
                  aria-pressed={answer === choice}
                >
                  {challenge.choiceLabels?.[index] ?? t(`tools.numberLab.divisibility.${choice}`, choice)}
                </button>
              </li>
            ))}
          </ul>
        )}

        {(challenge.answerType === 'number' || challenge.answerType === 'fraction') && (
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="sa-ml-nb__input sa-ml-nb__input--answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder={t('tools.numberLab.practice.answerPlaceholder')}
            aria-label={t('tools.numberLab.practice.answerLabel')}
          />
        )}

        {/* §49 : placer un nombre EN LE GLISSANT. */}
        {challenge.answerType === 'drag' && (
          <>
            <p className="sa-ml-nb__muted">{t('tools.numberLab.practice.dragToAnswer')}</p>
            <NumberLineStage
              view={{ center: 1, span: 2.4 }}
              points={[{ value: dragValue, tone: 'primary' }]}
              onDragPoint={(_, value) => setDragValue(value)}
              subdivisions={challenge.target?.d ?? 4}
              snapTo={{ snapDenominator: (challenge.target?.d ?? 4) * 2, tolerance: 0.5 }}
              height={compact ? 130 : 150}
            />
          </>
        )}

        {/* §50 : régler le curseur à 35 % exactement. */}
        {challenge.answerType === 'slider' && (
          <div className="sa-ml-nb__slider-row">
            <input
              type="range"
              className="sa-ml-nb__slider"
              min={0} max={100} step={1}
              value={dragValue}
              onChange={(event) => setDragValue(Number(event.target.value))}
              aria-label={t('tools.numberLab.practice.sliderToAnswer')}
              aria-valuetext={`${dragValue} %`}
            />
            <output className="sa-ml-nb__slider-value">{dragValue} %</output>
          </div>
        )}

        {/* §50 : l'ensemble des couples. */}
        {challenge.answerType === 'set' && (
          <>
            <p className="sa-ml-nb__muted">{t('tools.numberLab.practice.selectPairs')}</p>
            <ul className="sa-ml-nb__chiplist" dir="ltr">
              {candidatePairs(challenge.value).map((pair) => (
                <li key={pair}>
                  <button
                    type="button"
                    className={`sa-ml-nb__chip${selection.includes(pair) ? ' is-current' : ''}`}
                    onClick={() => setSelection((list) => (
                      list.includes(pair) ? list.filter((p) => p !== pair) : [...list, pair]
                    ))}
                    aria-pressed={selection.includes(pair)}
                  >
                    {pair}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="sa-ml-nb__practice-actions">
          <button type="button" className="sa-ml-nb__button" onClick={submit} disabled={verdict?.correct}>
            <Check size={15} aria-hidden="true" />
            {t('tools.numberLab.practice.check')}
          </button>
          <button
            type="button"
            className="sa-ml-nb__button sa-ml-nb__button--ghost"
            onClick={askHint}
            disabled={hintsUsed >= (challenge.hintKeys?.length ?? 0)}
          >
            <Lightbulb size={15} aria-hidden="true" />
            {t('tools.numberLab.practice.hint')}
          </button>
          <button
            type="button"
            className="sa-ml-nb__button sa-ml-nb__button--ghost"
            onClick={() => setRevealed(revealAnswer(challenge))}
          >
            <Eye size={15} aria-hidden="true" />
            {t('tools.numberLab.practice.revealAnswer')}
          </button>
          <button type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost" onClick={nextQuestion}>
            <RefreshCw size={15} aria-hidden="true" />
            {t('tools.numberLab.practice.next')}
          </button>
        </div>

        {/* §52 : les indices, un par un. */}
        {hints.length > 0 && (
          <ul className="sa-ml-nb__hints">
            {hints.map((key) => (
              <li key={key}>
                <Lightbulb size={13} aria-hidden="true" />
                {t(key, challenge.promptParams ?? {})}
              </li>
            ))}
          </ul>
        )}

        {/* Le verdict — et ce qu'il MONTRE. */}
        {verdict && (
          <div
            className={`sa-ml-nb__verdict-box${verdict.correct ? ' is-correct' : ' is-incorrect'}`}
            role="status"
            aria-live="polite"
          >
            <p className="sa-ml-nb__verdict-line">
              {verdict.correct
                ? <><Check size={16} aria-hidden="true" />{t('tools.numberLab.practice.correct')}</>
                : <><X size={16} aria-hidden="true" />
                  {verdict.unreadable
                    ? t('tools.numberLab.practice.unreadable')
                    : (verdict.near ? t('tools.numberLab.practice.near') : t('tools.numberLab.practice.incorrect'))}
                </>}
            </p>

            {verdict.kind === 'factorPairs' && !verdict.correct && (
              <p className="sa-ml-nb__muted">
                {t('tools.numberLab.practice.pairsFound', {
                  found: verdict.found ?? 0, total: challenge.expectedCount,
                })}
                {verdict.wrong?.length > 0 && ` — ${t('tools.numberLab.practice.wrongPair', { pair: verdict.wrong[0] })}`}
              </p>
            )}

            {/* §53 : la QUESTION que pose la révélation. */}
            {explanation?.askKey && <p className="sa-ml-nb__question">{t(explanation.askKey)}</p>}
          </div>
        )}

        {/* §53 : le dessin qui explique — jamais un simple « faux ». */}
        {showReveal && (
          <RevealStage
            reveal={revealed?.reveal ?? explanation?.reveal}
            challenge={challenge}
            compact={compact}
          />
        )}

        {/* L'explication complète, quand l'élève a répondu ou révélé. */}
        {(revealed || (verdict && !verdict.correct && hintsUsed >= (challenge.hintKeys?.length ?? 0))) && (
          <p className="sa-ml-nb__callout">
            {t(challenge.explainKey, challenge.explainParams ?? {})}
          </p>
        )}
        {revealed && (
          <p className="sa-ml-nb__result-line" dir="ltr">
            {t('tools.numberLab.practice.answerIs', { value: revealed.text })}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * §53 — CE QUE L'ERREUR MONTRE.
 *
 * `reveal` vient du défi lui-même (`practice.js`), donc l'écran ne décide
 * rien : il dessine ce que le module a demandé. Pour une comparaison ratée,
 * c'est les deux nombres sur la même droite — et la réponse devient évidente
 * avant qu'on l'ait dite.
 */
function RevealStage({ reveal, challenge, compact }) {
  const { t } = useTranslation('mathlab');
  if (!reveal) return null;

  if (reveal.mode === 'line' && Array.isArray(reveal.values)) {
    const view = frameValues([0, ...reveal.values], { minSpan: 1.5 });

    return (
      <div className="sa-ml-nb__reveal">
        <NumberLineStage
          view={view}
          points={reveal.values.map((value, index) => ({
            value,
            frac: reveal.fractions?.[index],
            tone: index === 0 ? 'primary' : 'secondary',
            draggable: false,
          }))}
          subdivisions={reveal.denominator ?? null}
          height={compact ? 130 : 150}
        />
      </div>
    );
  }

  if (reveal.mode === 'factors' && reveal.value) {
    return (
      <div className="sa-ml-nb__reveal">
        <ul className="sa-ml-nb__chiplist" dir="ltr">
          {factorPairs(reveal.value).map(([a, b]) => (
            <li key={`${a}x${b}`}><span className="sa-ml-nb__chip is-current">{a} × {b}</span></li>
          ))}
        </ul>
      </div>
    );
  }

  // §27, §30 : les deux listes, et l'élément commun MIS EN ÉVIDENCE. C'est
  // la rencontre qu'il faut voir, pas le résultat qu'il faut lire.
  if (reveal.mode === 'gcdLcm' && reveal.a && reveal.b) {
    const isLcm = challenge.kind === 'lcmChallenge';
    const target = isLcm ? lcm(reveal.a, reveal.b) : gcd(reveal.a, reveal.b);
    const rows = isLcm
      ? [multiples(reveal.a, 10), multiples(reveal.b, 10)]
      : [divisors(reveal.a), divisors(reveal.b)];

    return (
      <div className="sa-ml-nb__reveal">
        {rows.map((list, index) => (
          <div key={index} className="sa-ml-nb__multiple-row">
            <span className="sa-ml-nb__bar-label" dir="ltr">{index === 0 ? reveal.a : reveal.b}</span>
            <ul className="sa-ml-nb__chiplist" dir="ltr">
              {list.slice(0, 16).map((value) => (
                <li key={value}>
                  <span className={`sa-ml-nb__chip${value === target ? ' is-current' : ''}`}>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  // §22 : les candidats, et lequel résiste à toute division.
  if (reveal.mode === 'primes' && Array.isArray(reveal.highlight)) {
    return (
      <div className="sa-ml-nb__reveal">
        <ul className="sa-ml-nb__chiplist" dir="ltr">
          {reveal.highlight.map((value) => (
            <li key={value}>
              <span className={`sa-ml-nb__chip${isPrime(Number(value)) ? ' is-current' : ''}`}>
                {value}
                {!isPrime(Number(value)) && <small> = {smallestSplit(Number(value))}</small>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // §9 : les deux fractions DESSINÉES — l'équivalence se voit.
  if (reveal.mode === 'fractions' && reveal.left && reveal.right) {
    return (
      <div className="sa-ml-nb__reveal sa-ml-nb__shapes-row">
        <FractionShape frac={reveal.left} model="bar" tone="primary" width={280} />
        <FractionShape frac={reveal.right} model="bar" tone="result" width={280} />
      </div>
    );
  }

  // §14 : la grille de cent, remplie de la bonne quantité.
  if (reveal.mode === 'percent' && Number.isFinite(reveal.percent)) {
    const filled = Math.max(0, Math.min(100, Math.round(reveal.percent)));

    return (
      <div className="sa-ml-nb__reveal">
        <figure className="sa-ml-nb__grid100">
          <svg viewBox="0 0 220 220" width="100%" height={170} role="img"
            aria-label={t('tools.numberLab.percent.gridLabel', { filled })}
          >
            {Array.from({ length: 100 }, (_, index) => (
              <rect
                key={index}
                x={8 + (index % 10) * 20.4}
                y={8 + Math.floor(index / 10) * 20.4}
                width={18} height={18} rx={2}
                className={`sa-ml-nb__cell${index < filled ? ' is-filled' : ''}`}
              />
            ))}
          </svg>
        </figure>
      </div>
    );
  }

  // §20 : le critère appliqué à CE nombre, avec ses chiffres.
  if (reveal.mode === 'divisibility' && reveal.value) {
    const by = challenge.promptParams?.by;
    const detail = by ? divisibilityBy(reveal.value, by) : null;

    return detail ? (
      <div className="sa-ml-nb__reveal">
        <p className="sa-ml-nb__formula" dir="ltr">
          {detail.evidenceText ?? reveal.value}
          {detail.evidence !== null ? ` = ${detail.evidence}` : ''}
        </p>
        <p className="sa-ml-nb__formula" dir="ltr">
          {detail.divisible
            ? t('tools.numberLab.divisibility.divisionLine', { value: reveal.value, by, quotient: detail.quotient })
            : t('tools.numberLab.divisibility.divisionRest', {
              value: reveal.value, by, quotient: detail.quotient, remainder: detail.remainder,
            })}
        </p>
      </div>
    ) : null;
  }

  // §32 : les deux voisins et le milieu, sur la droite.
  if (reveal.mode === 'rounding' && Number.isFinite(reveal.value)) {
    const detail = roundingDetail(reveal.value, reveal.power ?? 0);
    if (!detail) return null;

    return (
      <div className="sa-ml-nb__reveal">
        <NumberLineStage
          view={{ center: (detail.lower + detail.upper) / 2, span: (detail.upper - detail.lower) * 2.4 }}
          points={[{ value: reveal.value, tone: 'primary', draggable: false }]}
          marks={[
            { value: detail.lower, tone: 'neutral', label: formatNumber(detail.lower, 6) },
            { value: detail.midpoint, tone: 'midpoint', label: formatNumber(detail.midpoint, 6) },
            { value: detail.upper, tone: 'neutral', label: formatNumber(detail.upper, 6) },
          ]}
          height={compact ? 130 : 150}
        />
      </div>
    );
  }

  return (
    <p className="sa-ml-nb__muted">{t('tools.numberLab.practice.lookAtScreen')}</p>
  );
}

/** Le plus petit produit non trivial — pourquoi un nombre n'est PAS premier. */
function smallestSplit(n) {
  for (let i = 2; i * i <= n; i += 1) if (n % i === 0) return `${i} × ${n / i}`;

  return String(n);
}

/** Les couples PROPOSÉS : les vrais, plus quelques leurres plausibles. */
function candidatePairs(value) {
  if (!value) return [];
  const real = factorPairs(value).map(([a, b]) => `${a}×${b}`);
  const decoys = [];
  for (let a = 2; a <= Math.min(12, value) && decoys.length < 5; a += 1) {
    const b = Math.round(value / a) + 1;
    const key = a <= b ? `${a}×${b}` : `${b}×${a}`;
    if (a * b !== value && !real.includes(key) && !decoys.includes(key)) decoys.push(key);
  }

  return [...real, ...decoys].sort((x, y) => Number(x.split('×')[0]) - Number(y.split('×')[0]));
}
