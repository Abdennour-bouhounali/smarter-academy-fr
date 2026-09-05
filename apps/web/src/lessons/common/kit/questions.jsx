import React, { useState } from 'react';
import { formatFr, parseFr } from '@smarter-academy/core';
import { Feedback, ChoiceGrid, ValidateButton, NumberField, XPBurst } from '../components/LessonUI';
import { useKit } from './ContentModule';

/**
 * Lesson kit — les trois formes de question formative.
 *
 * Politique commune (LESSON_INTEGRATION_GUIDE.md §6), appliquée par
 * construction — impossible à violer depuis un module appelant :
 *  - un tap/une validation = la réponse : révélation immédiate ;
 *  - `onAnswered(isCorrect)` est TOUJOURS appelé, jamais conditionné à la
 *    justesse — l'élève n'est jamais bloqué ;
 *  - en cas d'erreur : sa réponse, la bonne réponse, et le rappel de la
 *    règle (explain) sont affichés — pas de boucle « Réessayer » ;
 *  - son/série/burst branchés via useKit(), sans câblage par module.
 */

/* ── QCM à un choix : le tap EST la réponse ───────────────────────── */
export function TapQuestion({
  prompt,          // ReactNode au-dessus de la grille (optionnel)
  above,           // ReactNode ou (revealed) => ReactNode — visuel (droite graduée, tableau…)
  options,
  correct,
  cols = 2,
  renderOption,    // (opt) => ReactNode — pour des cartes riches
  correctionLabel, // libellé de la bonne réponse si options[correct] n'est pas affichable tel quel
  explain,         // rappel de la règle, affiché juste ou faux
  explainWrong,    // remplace `explain` en cas d'erreur (optionnel)
  xp = 10,
  solved = false,  // revisite : grille figée, pas de re-réponse
  onAnswered,      // (isCorrect, index) => void — inconditionnel
}) {
  const { react } = useKit();
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);
  const isCorrect = pick === correct;

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {typeof above === 'function' ? above(revealed || solved) : above}
      <div className="relative">
        <ChoiceGrid
          options={options}
          selected={pick}
          onSelect={(i) => {
            setPick(i);
            setRevealed(true);
            const ok = i === correct;
            const id = react(ok);
            if (ok) setBurst(id);
            onAnswered?.(ok, i);
          }}
          revealed={revealed || solved}
          correctIndex={correct}
          cols={cols}
          disabled={solved}
          renderOption={renderOption}
        />
        <XPBurst amount={xp} tick={burst} />
      </div>
      {revealed && (
        <Feedback tone={isCorrect ? 'ok' : 'ko'}>
          {!isCorrect && (
            <>
              Bonne réponse : <strong>{correctionLabel ?? options[correct]}</strong>. {' '}
            </>
          )}
          {!isCorrect && explainWrong ? explainWrong : explain}
        </Feedback>
      )}
    </div>
  );
}

/* ── Vérification par lot à taille fixe : N lignes, une correction ── */
/**
 * Chaque ligne propose ses options ; la correction se révèle toute seule au
 * DERNIER choix posé (pas de bouton Vérifier). À la révélation, la bonne
 * option de CHAQUE ligne passe en vert — la correction se voit, elle ne se
 * déduit pas.
 */
export function BatchChoiceQuestion({
  intro,          // ReactNode au-dessus des lignes
  rows,           // [{ id, label, options: [ReactNode], correct, correction? }]
  feedback,       // ({ allRight, nCorrect, total }) => ReactNode — un seul bloc de feedback
  xp = 10,
  solved = false,
  onAnswered,     // (allRight) => void — inconditionnel
}) {
  const { react } = useKit();
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);
  const [burst, setBurst] = useState(0);

  const nCorrect = rows.filter((r) => picks[r.id] === r.correct).length;
  const allRight = nCorrect === rows.length;

  return (
    <div className="space-y-4">
      {intro}
      <div className="space-y-3">
        {rows.map((r) => {
          const pick = picks[r.id];
          const rowRight = checked && pick === r.correct;
          const rowWrong = checked && pick !== undefined && pick !== r.correct;
          return (
            <div
              key={r.id}
              className={`rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 ${
                rowRight ? 'border-emerald-300 bg-emerald-50/50' : rowWrong ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:w-56 shrink-0 text-sm font-semibold text-slate-700">
                {r.label}
              </div>
              <div className="flex gap-1.5 flex-wrap" role="group">
                {r.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    disabled={solved || checked}
                    onClick={() => {
                      if (solved || checked) return;
                      const next = { ...picks, [r.id]: oi };
                      setPicks(next);
                      // Dernier choix posé → correction immédiate, sans bouton.
                      if (rows.every((row) => next[row.id] !== undefined)) {
                        setChecked(true);
                        const allR = rows.every((row) => next[row.id] === row.correct);
                        const id = react(allR);
                        if (allR) setBurst(id);
                        onAnswered?.(allR);
                      }
                    }}
                    aria-pressed={pick === oi}
                    className={`px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      checked
                        ? oi === r.correct
                          ? 'bg-emerald-600 border-emerald-700 text-white'
                          : pick === oi
                          ? 'bg-rose-600 border-rose-700 text-white'
                          : 'bg-white border-slate-200 text-slate-400'
                        : pick === oi
                        ? 'bg-blue-600 border-blue-700 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {rowWrong && r.correction && (
                <span className="w-full text-xs font-mono text-rose-600">{r.correction}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="relative">
        <XPBurst amount={xp} tick={burst} />
      </div>
      {/* `checked` = réponse posée dans cette session (picks réels) ; sinon
          c'est une revisite d'un module déjà complété (picks vides) → on
          affiche le feedback « tout juste ». Ne pas tester `solved` en
          premier : onAnswered étant inconditionnel, il devient vrai dès la
          révélation et masquerait le retour d'erreur. */}
      {(checked || solved) && feedback && (
        <div>{feedback({ allRight: checked ? allRight : true, nCorrect, total: rows.length })}</div>
      )}
    </div>
  );
}

/* ── Saisie numérique : un bouton OK + Entrée, jamais bloquante ──── */
export function NumericQuestion({
  prompt,          // ReactNode
  above,           // ReactNode ou (revealed) => ReactNode
  prefix, suffix,  // ex. prefix="Nombre de milliers :" suffix="cL"
  expected,        // number, ou (n) => boolean
  parse = parseFr,
  display,         // affichage de la bonne réponse (déf. formatFr(expected))
  explain,         // rappel de règle, juste ou faux
  explainFor,      // (n) => ReactNode — feedback ciblé selon l'erreur (pièges)
  width = 'w-32',
  size = 'sm',
  solved = false,
  onAnswered,      // (isCorrect, n) => void — inconditionnel
}) {
  const { react } = useKit();
  const [val, setVal] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const correctDisplay = display ?? (typeof expected === 'number' ? formatFr(expected) : null);

  const check = () => {
    if (val === '') return;
    const n = parse(val);
    const ok = typeof expected === 'function' ? expected(n) : n === expected;
    react(ok);
    setWasCorrect(ok);
    setRevealed(true);
    onAnswered?.(ok, n);
  };

  const done = revealed || solved;

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {typeof above === 'function' ? above(done) : above}
      {!done ? (
        <div className="flex items-center gap-2 flex-wrap">
          {prefix && <span className="text-sm font-mono text-slate-600">{prefix}</span>}
          <NumberField
            value={val}
            onChange={setVal}
            onEnter={check}
            ariaLabel={typeof prompt === 'string' ? prompt : 'Réponse'}
            width={width}
            size={size}
          />
          {suffix && <span className="font-mono text-sm text-slate-500">{suffix}</span>}
          <ValidateButton onClick={check} disabled={!val}>
            OK
          </ValidateButton>
        </div>
      ) : (
        <Feedback tone={revealed && !wasCorrect ? 'ko' : 'ok'}>
          {revealed && !wasCorrect && (
            <>
              Ta réponse : <strong className="font-mono">{val || '—'}</strong>. Bonne réponse :{' '}
            </>
          )}
          <strong className="font-mono">{correctDisplay}</strong>
          {' — '}
          {revealed && !wasCorrect && explainFor ? explainFor(parse(val)) : explain}
        </Feedback>
      )}
    </div>
  );
}
