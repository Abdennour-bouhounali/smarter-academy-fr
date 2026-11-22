import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, RotateCcw, Pencil, Check } from 'lucide-react';
import { ChevronForward } from '../../../../components/common/DirectionalIcons.jsx';
import { Notation } from './LogicPieces.jsx';
import InductionStairs from './InductionStairs.jsx';
import { formatNumber } from './logicFormat.js';
import {
  INDUCTION_EXERCISES, findExercise, builderVariablesOf, alternativesOf,
} from './inductionExercises.js';
import {
  buildContext, compileProposition, evaluateProposition, valueAt, RELATIONS,
} from './inductionModel.js';
import { buildChain, checkOrder, proofVerdict } from './inductionStep.js';
import {
  setRecurrenceExercise, setRecurrenceProposition, recordRecurrenceVerdict,
  setRecurrenceCursor, setRecurrencePhase, placeRecurrenceLink,
  resetRecurrence, resetRecurrenceProof, propositionChanged,
} from './logicState.js';

/**
 * L'ESCALIER DES PROPOSITIONS — « je ne regarde pas le brahan, je le MONTE ».
 *
 *   lire l'énoncé → voir les suites → tester P(0) → P(1) → … → observer
 *   → « ceci n'est pas un brahan » → construire l'hérédité
 *
 * ── Deux activités, et leur frontière est la leçon (§2, §25) ────────────
 * `phase: 'test'` est de l'EXPÉRIMENTATION numérique : on calcule P(k) pour
 * des k concrets. `phase: 'prove'` est la démonstration. L'écran ne laisse
 * jamais croire que la première fait la seconde — six marches vertes donnent
 * « expérimental », jamais « démontré », et c'est précisément à ce moment-là que la
 * question « qu'est-ce qui nous permettrait de passer d'une marche à la suivante ? » apparaît (§41).
 *
 * ── Ce que l'écran ne calcule pas lui-même ──────────────────────────────
 * Rien. Toute la mathématique est dans `inductionModel.js` et
 * `inductionStep.js` ; ce composant ne fait que lire un modèle mémoïsé et
 * l'afficher (MATH_LAB §48). Il ne connaît ni le nom `u`, ni le nombre de
 * suites : il lit ce que l'exercice déclare (§10, §31).
 */
export default function RecurrenceClimb({ data, onChange, announce }) {
  const { t } = useTranslation('mathlab');
  const state = data.recurrence;
  const exercise = findExercise(state.exerciseId);

  // La proposition affichée : celle de l'élève s'il en a écrit une, sinon
  // celle de l'exercice (§19 — l'énoncé officiel n'est pas à redéfinir).
  const proposition = useMemo(() => ({
    left: state.left || exercise.proposition.left,
    relation: state.relation || exercise.proposition.relation,
    right: state.right || exercise.proposition.right,
  }), [state.left, state.relation, state.right, exercise]);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(proposition);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => { setDraft(proposition); }, [proposition]);
  useEffect(() => { setLastResult(null); }, [state.exerciseId]);

  /** Le CONTEXTE de l'exercice : ses suites compilées, une fois. */
  const context = useMemo(() => {
    const built = buildContext(exercise.sequences);

    return built.ok ? built.context : null;
  }, [exercise]);

  /** La proposition compilée contre ce contexte. */
  const compiled = useMemo(
    () => (context ? compileProposition(proposition, context) : null),
    [context, proposition],
  );

  /** Le moteur a-t-il su lire ce que l'élève a écrit ? */
  const readable = Boolean(compiled?.ok);

  /**
   * Les marches : une par rang, à partir du rang de base de l'exercice.
   *
   * Une proposition que le moteur n'a pas su lire n'est PAS écrite sur les
   * marches : « zzz + > 1000000 » sur cinq marches donne l'impression qu'on
   * teste quelque chose. On garde P(k), on retire la prétention (§17).
   */
  const steps = useMemo(() => Array.from({ length: exercise.stepCount }, (_, i) => {
    const n = exercise.baseIndex + i;

    return {
      n,
      title: `P(${n})`,
      claim: readable ? claimText(proposition, n) : null,
      status: state.statuses[i] ?? 'untested',
    };
  }), [exercise, proposition, state.statuses, readable]);

  const cursor = Math.min(state.cursor, steps.length - 1);
  const currentStep = steps[cursor];
  const summary = useMemo(() => ({
    correct: steps.filter((s) => s.status === 'correct').length,
    incorrect: steps.filter((s) => s.status === 'incorrect').length,
    untested: steps.filter((s) => s.status === 'untested').length,
  }), [steps]);

  // §25 — toutes vertes : c'est EXPÉRIMENTAL, jamais « prouvé ».
  const allGreen = summary.untested === 0 && summary.incorrect === 0;
  const broken = summary.incorrect > 0;

  /** §4, §20 — tester UNE marche, celle du curseur. Le moteur CALCULE. */
  const test = useCallback(() => {
    if (!compiled?.ok || !currentStep || !context) return;
    const result = evaluateProposition(compiled, context, currentStep.n);
    const status = result.ok ? (result.holds ? 'correct' : 'incorrect') : 'incorrect';
    onChange((current) => recordRecurrenceVerdict(current, cursor, status));
    setLastResult({ ...result, n: currentStep.n, at: Date.now() });
    announce?.(t(
      status === 'correct'
        ? 'tools.logic.induction.recurrence.announceCorrect'
        : 'tools.logic.induction.recurrence.announceIncorrect',
      { n: currentStep.n },
    ));
  }, [compiled, context, currentStep, cursor, onChange, announce, t]);

  const goNext = useCallback(() => {
    const next = steps.findIndex((step, i) => i > cursor && step.status === 'untested');
    onChange((current) => setRecurrenceCursor(current, next >= 0 ? next : Math.min(cursor + 1, steps.length - 1)));
    setLastResult(null);
  }, [steps, cursor, onChange]);

  const selectStep = useCallback((index) => {
    onChange((current) => setRecurrenceCursor(current, index));
    setLastResult(null);
  }, [onChange]);

  /** §24 — valider une proposition réécrite. Le reset est ANNONCÉ. */
  const commitDraft = useCallback(() => {
    const changed = propositionChanged(proposition, draft);
    onChange((current) => setRecurrenceProposition(current, draft));
    setEditing(false);
    setLastResult(null);
    if (changed) announce?.(t('tools.logic.induction.recurrence.changedAnnounce'));
  }, [draft, proposition, onChange, announce, t]);

  const variables = useMemo(() => builderVariablesOf(exercise), [exercise]);
  const alternatives = useMemo(() => alternativesOf(exercise), [exercise]);

  return (
    <>
      {/* ── L'ÉNONCÉ : les suites, puis ce qu'il faut démontrer (§19, §34) ── */}
      <section className="sa-ml-lg__card" data-ml-lg-rec-statement>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.recurrence.heading')}</h3>

        <label className="sa-ml-lg__field">
          <span className="sa-ml-lg__label">{t('tools.logic.induction.recurrence.chooseExercise')}</span>
          <select
            className="sa-ml-lg__select"
            value={state.exerciseId}
            onChange={(event) => {
              onChange((current) => setRecurrenceExercise(current, event.target.value));
              setLastResult(null);
            }}
            data-ml-lg-rec-exercise
          >
            {INDUCTION_EXERCISES.map((item) => (
              <option key={item.id} value={item.id}>
                {t(`tools.logic.induction.exercises.${item.id}.name`)}
              </option>
            ))}
          </select>
        </label>

        {/* Les DÉFINITIONS des suites — l'élève doit les voir pour comprendre
            ce que l'escalier calcule (§34 étape 2). */}
        <ul className="sa-ml-lg__defs" data-ml-lg-rec-definitions>
          {exercise.sequences.map((sequence) => (
            <li key={sequence.name} data-ml-lg-rec-definition={sequence.name}>
              <Notation>{definitionText(sequence)}</Notation>
            </li>
          ))}
        </ul>

        {/* ── LA PROPOSITION ──────────────────────────────────────────── */}
        <div className="sa-ml-lg__propose" data-ml-lg-rec-proposition>
          <span className="sa-ml-lg__label">{t('tools.logic.induction.recurrence.toProve')}</span>

          {!editing && (
            <>
              <Notation
                className="sa-ml-lg__math--lead"
                data-ml-lg-rec-text
                data-ml-lg-rec-readable={String(readable)}
              >
                {propositionText(proposition)}
              </Notation>
              <button
                type="button"
                className="sa-ml-lg__btn"
                onClick={() => setEditing(true)}
                data-ml-lg-rec-edit
              >
                <Pencil size={14} aria-hidden="true" />
                {t('tools.logic.induction.recurrence.tryAnother')}
              </button>
            </>
          )}

          {/* §8, §16, §18 — le CONSTRUCTEUR : membre gauche, relation, membre
              droit. Trois champs, parce que la proposition a trois parties —
              et non une chaîne opaque à analyser. */}
          {editing && (
            <div className="sa-ml-lg__builder" data-ml-lg-rec-builder>
              <input
                className="sa-ml-lg__input sa-ml-lg__input--term"
                dir="ltr"
                value={draft.left}
                onChange={(event) => setDraft((d) => ({ ...d, left: event.target.value }))}
                aria-label={t('tools.logic.induction.recurrence.leftSide')}
                data-ml-lg-rec-left
              />
              <select
                className="sa-ml-lg__select sa-ml-lg__select--relation"
                dir="ltr"
                value={draft.relation}
                onChange={(event) => setDraft((d) => ({ ...d, relation: event.target.value }))}
                aria-label={t('tools.logic.induction.recurrence.relation')}
                data-ml-lg-rec-relation
              >
                {RELATIONS.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
              <input
                className="sa-ml-lg__input sa-ml-lg__input--term"
                dir="ltr"
                value={draft.right}
                onChange={(event) => setDraft((d) => ({ ...d, right: event.target.value }))}
                aria-label={t('tools.logic.induction.recurrence.rightSide')}
                data-ml-lg-rec-right
              />
              <button
                type="button"
                className="sa-ml-lg__btn sa-ml-lg__btn--primary"
                onClick={commitDraft}
                data-ml-lg-rec-commit
              >
                <Check size={14} aria-hidden="true" />
                {t('tools.logic.induction.recurrence.useIt')}
              </button>
            </div>
          )}

          {/* §31 — les jetons offerts sont CEUX DE L'EXERCICE. */}
          {editing && (
            <div className="sa-ml-lg__builder" data-ml-lg-rec-tokens>
              <span className="sa-ml-lg__note">{t('tools.logic.induction.recurrence.available')}</span>
              {variables.map((variable) => (
                <button
                  key={variable.name}
                  type="button"
                  className="sa-ml-lg__btn sa-ml-lg__btn--token"
                  dir="ltr"
                  onClick={() => setDraft((d) => ({ ...d, left: `${d.left}${variable.token}` }))}
                  data-ml-lg-rec-token={variable.name}
                >
                  {variable.token}
                </button>
              ))}
            </div>
          )}

          {/* §19 — d'autres propositions à explorer, toutes valides. */}
          {editing && alternatives.length > 0 && (
            <div className="sa-ml-lg__builder" data-ml-lg-rec-alternatives>
              {alternatives.map((alternative, i) => (
                <button
                  key={i}
                  type="button"
                  className="sa-ml-lg__btn sa-ml-lg__btn--token"
                  dir="ltr"
                  onClick={() => setDraft(alternative)}
                  data-ml-lg-rec-alternative={i}
                >
                  {propositionText(alternative)}
                </button>
              ))}
            </div>
          )}

          {/* §17 — un refus se dit en français, avec un exemple qui MARCHE.
              Jamais « SyntaxError », jamais « NaN ». */}
          {compiled && !compiled.ok && (
            <p className="sa-ml-lg__message sa-ml-lg__message--warn" role="status" data-ml-lg-rec-error={compiled.error.code}>
              {t(`tools.logic.induction.recurrence.errors.${compiled.error.code}`, {
                symbol: compiled.error.symbol ?? '',
                defaultValue: t('tools.logic.induction.recurrence.errors.syntax'),
              })}
              {' '}
              <Notation>{propositionText(exercise.proposition)}</Notation>
            </p>
          )}
        </div>
      </section>

      {/* ── L'ESCALIER ────────────────────────────────────────────────── */}
      <section className="sa-ml-lg__card" data-ml-lg-rec-stairs>
        <InductionStairs
          name="recurrence"
          steps={steps}
          currentIndex={cursor}
          onSelectStep={selectStep}
          caption={t('tools.logic.induction.recurrence.stairsCaption', {
            correct: summary.correct,
            total: steps.length,
          })}
        />

        <p className="sa-ml-lg__chips" data-ml-lg-rec-counts>
          <span data-ml-lg-rec-correct>{t('tools.logic.induction.climb.correctCount', { count: summary.correct })}</span>
          {' · '}
          <span data-ml-lg-rec-incorrect>{t('tools.logic.induction.climb.incorrectCount', { count: summary.incorrect })}</span>
          {' · '}
          <span data-ml-lg-rec-untested>{t('tools.logic.induction.climb.untestedCount', { count: summary.untested })}</span>
        </p>

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--primary"
            onClick={test}
            disabled={!compiled?.ok}
            data-ml-lg-rec-test
          >
            <Play size={15} aria-hidden="true" />
            {t('tools.logic.induction.recurrence.test', { n: currentStep?.n ?? 0 })}
          </button>
          <button
            type="button"
            className="sa-ml-lg__btn"
            onClick={goNext}
            disabled={cursor >= steps.length - 1}
            data-ml-lg-rec-next
          >
            <ChevronForward size={15} aria-hidden="true" />
            {t('tools.logic.induction.climb.next')}
          </button>
          <button
            type="button"
            className="sa-ml-lg__btn"
            onClick={() => { onChange(resetRecurrence); setLastResult(null); }}
            data-ml-lg-rec-reset
          >
            <RotateCcw size={15} aria-hidden="true" />
            {t('tools.logic.induction.climb.restart')}
          </button>
        </div>
      </section>

      {/* ── LE PANNEAU DE RÉSULTAT (§5, §6, §22, §23) ─────────────────── */}
      <ResultPanel
        result={lastResult}
        proposition={proposition}
        context={context}
        exercise={exercise}
        t={t}
      />

      {/* ── §25 — TESTER N'EST PAS PROUVER ───────────────────────────── */}
      {allGreen && (
        <section className="sa-ml-lg__card sa-ml-lg__card--accent" data-ml-lg-rec-notproof>
          <p data-ml-lg-rec-observed>
            {t('tools.logic.induction.recurrence.observed', { count: steps.length })}
          </p>
          <p className="sa-ml-lg__question" data-ml-lg-rec-notenough>
            {t('tools.logic.induction.recurrence.notEnough')}
          </p>
          <p>{t('tools.logic.induction.recurrence.question')}</p>
          {state.phase === 'test' && (
            <button
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--primary"
              onClick={() => onChange((current) => setRecurrencePhase(current, 'prove'))}
              data-ml-lg-rec-toprove
            >
              {t('tools.logic.induction.recurrence.buildProof')}
            </button>
          )}
        </section>
      )}

      {broken && (
        <section className="sa-ml-lg__card sa-ml-lg__card--warn" data-ml-lg-rec-broken>
          <p>{t('tools.logic.induction.recurrence.counterexample')}</p>
          {exercise.failsBelow !== undefined && (
            <p data-ml-lg-rec-failsbelow>
              {t('tools.logic.induction.recurrence.failsBelow', { n: exercise.failsBelow })}
            </p>
          )}
        </section>
      )}

      {/* ── L'HÉRÉDITÉ (§26, §27, §28) ────────────────────────────────── */}
      {state.phase === 'prove' && (
        <HeredityBuilder
          exercise={exercise}
          placed={state.placed}
          allGreen={allGreen}
          onChange={onChange}
          announce={announce}
          t={t}
        />
      )}
    </>
  );
}

/* ── Le panneau de résultat ────────────────────────────────────────────── */

/**
 * §5, §6, §22, §23 — ce qui rend l'écran pédagogique plutôt que binaire.
 *
 * On ne montre pas « ✓ Correct ». On montre la proposition à ce rang, les
 * valeurs des suites dont elle dépend, la comparaison, et la conclusion.
 * Un rouge doit rendre le contre-exemple VISIBLE.
 */
function ResultPanel({ result, proposition, context, exercise, t }) {
  if (!result) {
    return (
      <section className="sa-ml-lg__card" data-ml-lg-rec-result="idle">
        <p className="sa-ml-lg__note">{t('tools.logic.induction.recurrence.readyToTest')}</p>
      </section>
    );
  }

  if (!result.ok) {
    return (
      <section className="sa-ml-lg__card" data-ml-lg-rec-result="failed">
        <p role="status">
          {t(`tools.logic.induction.recurrence.errors.${result.reason}`, {
            defaultValue: t('tools.logic.induction.recurrence.errors.undefined'),
          })}
        </p>
      </section>
    );
  }

  const { n, holds, left, right } = result;
  // Les suites dont ce rang dépend, avec leur valeur — c'est « le calcul »
  // de §6 et de §22.
  const parts = exercise.sequences
    .map((sequence) => ({ name: sequence.name, resolved: valueAt(context, sequence.name, n) }))
    .filter((part) => part.resolved.ok);

  return (
    <section
      className={`sa-ml-lg__card sa-ml-lg__card--${holds ? 'ok' : 'warn'}`}
      data-ml-lg-rec-result={holds ? 'correct' : 'incorrect'}
      data-ml-lg-rec-result-n={n}
    >
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.climb.currentHeading')}</h3>

      <p><Notation>{`n = ${n}`}</Notation></p>

      <p>{t('tools.logic.induction.recurrence.testing')}</p>
      <p><Notation data-ml-lg-rec-claim>{claimText(proposition, n)}</Notation></p>

      {parts.length > 0 && (
        <>
          <p>{t('tools.logic.induction.recurrence.values')}</p>
          <ul className="sa-ml-lg__defs" data-ml-lg-rec-values>
            {parts.map((part) => (
              <li key={part.name} data-ml-lg-rec-value={part.name}>
                <Notation>
                  {`${part.name}${subscript(n)} = ${formatNumber(part.resolved.value, 4)}`}
                </Notation>
              </li>
            ))}
          </ul>
        </>
      )}

      <p>{t('tools.logic.induction.recurrence.therefore')}</p>
      <p>
        <Notation data-ml-lg-rec-comparison>
          {`${formatNumber(left, 4)} ${proposition.relation} ${formatNumber(right, 4)}`}
        </Notation>
      </p>

      <p className="sa-ml-lg__question" data-ml-lg-rec-verdict={holds ? 'true' : 'false'}>
        {holds
          ? `✓ ${t('tools.logic.induction.status.correct')}`
          : `✕ ${t('tools.logic.induction.status.incorrect')}`}
      </p>
    </section>
  );
}

/* ── L'hérédité ────────────────────────────────────────────────────────── */

/**
 * §26-§29 — l'élève ORDONNE les étapes du passage de P(n) à P(n+1).
 *
 * Chaque maillon a été vérifié numériquement au chargement (`buildChain`) ;
 * ce qui reste à l'élève est le raisonnement — quelle transformation suit
 * laquelle. L'écran ne fabrique aucune algèbre : il n'en est pas capable et
 * ne le prétend pas (§29).
 */
function HeredityBuilder({ exercise, placed, allGreen, onChange, announce, t }) {
  const built = useMemo(
    () => buildChain(exercise.chain, exercise.sequences),
    [exercise],
  );
  const chain = built.ok ? built.chain : [];
  const order = useMemo(() => checkOrder(chain, placed), [chain, placed]);
  const remaining = chain.filter((link) => !placed.includes(link.id));
  const verdict = proofVerdict({ baseHolds: allGreen, stepComplete: order.ok });

  return (
    <section className="sa-ml-lg__card" data-ml-lg-rec-heredity>
      <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.induction.recurrence.heredityHeading')}</h3>
      <p>{t('tools.logic.induction.recurrence.heredityIntro')}</p>

      {/* Ce qui est posé, dans l'ordre. */}
      <ol className="sa-ml-lg__chain" data-ml-lg-rec-placed>
        {placed.map((id, i) => {
          const wrong = order.firstWrong === i;

          return (
            <li
              key={id}
              className={wrong ? 'is-wrong' : undefined}
              data-ml-lg-rec-link={id}
              data-ml-lg-rec-link-wrong={String(wrong)}
            >
              <Notation>{t(`tools.logic.induction.exercises.${exercise.id}.steps.${id}`)}</Notation>
            </li>
          );
        })}
      </ol>

      {/* Ce qui reste à poser. */}
      {remaining.length > 0 && (
        <div className="sa-ml-lg__builder" data-ml-lg-rec-remaining>
          {remaining.map((link) => (
            <button
              key={link.id}
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--token"
              onClick={() => {
                onChange((current) => placeRecurrenceLink(current, link.id));
                announce?.(t('tools.logic.induction.recurrence.placed'));
              }}
              data-ml-lg-rec-place={link.id}
            >
              <Notation>{t(`tools.logic.induction.exercises.${exercise.id}.steps.${link.id}`)}</Notation>
            </button>
          ))}
        </div>
      )}

      <div className="sa-ml-lg__actions">
        <button
          type="button"
          className="sa-ml-lg__btn"
          onClick={() => onChange(resetRecurrenceProof)}
          data-ml-lg-rec-resetproof
        >
          <RotateCcw size={15} aria-hidden="true" />
          {t('tools.logic.induction.climb.restart')}
        </button>
      </div>

      {/* §25 — le verdict FINAL, qui ne dit « démontré » qu'avec les deux pieds. */}
      <p className="sa-ml-lg__question" role="status" data-ml-lg-rec-proofverdict={verdict}>
        {t(`tools.logic.induction.recurrence.verdict.${verdict}`)}
      </p>
    </section>
  );
}

/* ── La notation ───────────────────────────────────────────────────────── */

/** `uₙ < 3` — la proposition telle qu'elle s'écrit. */
function propositionText(proposition) {
  return `${proposition.left} ${proposition.relation} ${proposition.right}`;
}

/**
 * `u₂ < 3` — la proposition INSTANCIÉE à un rang (§21).
 *
 * On remplace l'indice `ₙ` par le chiffre en indice : c'est ce que l'élève
 * écrit dans son cahier, et c'est ce qui rend la marche lisible.
 */
function claimText(proposition, n) {
  const at = (side) => String(side ?? '').replace(/ₙ/g, subscript(n));

  return `${at(proposition.left)} ${proposition.relation} ${at(proposition.right)}`;
}

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

/** Un entier en chiffres indices : 12 → ₁₂. */
function subscript(n) {
  const value = Math.abs(Math.floor(n));

  return String(value).split('').map((d) => SUBSCRIPTS[Number(d)]).join('');
}

/** La définition d'une suite, telle qu'elle se lit au tableau (§37). */
function definitionText(sequence) {
  const { name } = sequence;
  if (sequence.kind === 'derived') return `${name}ₙ = ${pretty(sequence.rule)}`;
  if (sequence.kind === 'explicit') return `${name}ₙ = ${pretty(sequence.rule)}`;

  return `${name}${subscript(sequence.startIndex ?? 0)} = ${pretty(sequence.initial)}   ·   ${name}ₙ₊₁ = ${pretty(sequence.rule)}`;
}

/**
 * La règle interne (`3/4*u - 1/2`) redevient de la NOTATION (`¾uₙ − ½`).
 *
 * L'élève ne doit jamais lire `*`, ni `3/4`, ni `u` tout court : il lit
 * `¾uₙ`. C'est §15 — l'écriture reste mathématique, et elle doit être la
 * MÊME partout : le nom de l'exercice (dans `mathlab.json`) écrit déjà `⅓`,
 * et la définition affichée juste en dessous écrivait `1/3`. Deux notations
 * pour une seule suite, sur un même écran, sont une erreur de lecture.
 */
const VULGAR = Object.freeze({
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
  '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
  '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
});

function pretty(rule) {
  let text = String(rule ?? '').replace(/\*/g, '');

  // Les fractions simples deviennent leur caractère unique. On ne le fait
  // QUE pour celles qui en ont un : `7/9` reste `7/9`, ce qui se lit très
  // bien, plutôt qu'une composition bricolée qui se lirait mal.
  for (const [fraction, glyph] of Object.entries(VULGAR)) {
    text = text.split(fraction).join(glyph);
  }

  return text
    .replace(/(?<![A-Za-z])([uvwt])(?![A-Za-z₀-₉ₙ])/g, '$1ₙ')
    .replace(/-/g, '−');
}
