import React, { useState } from 'react';
import MathText from '../../../../../common/components/MathText';
import { Feedback } from '../../../../../common/components/LessonUI';
import { useKit } from '../../../../../common/kit';

/**
 * FactorFinder — trouver le facteur commun d'une somme.
 *
 * Activity: lire une somme de produits, toucher le facteur que TOUS les
 *   termes partagent ; l'écriture factorisée apparaît, puis se réduit.
 * Mathematical objective: factoriser = écrire k × (…) où k est commun à
 *   chaque terme — un nombre, un monôme, ou un binôme entier (x + 1).
 * Student action: toucher une puce.
 * Controlled variable: le facteur candidat.
 * Mathematical state: { picked } (module) ; les verdicts sont des DONNÉES
 *   pré-calculées du module (chaque candidat porte `ok`, `why`).
 * Visual consequence: le facteur commun se surligne dans chaque terme ; la
 *   forme factorisée s'écrit ; un mauvais choix explique pourquoi (pas
 *   commun / pas le plus grand), jusqu'à 3 essais puis révélation.
 * Misconception targeted: « on ne sort que le nombre », « (x + 1) n'est pas
 *   un facteur car il y a un + dedans ».
 */
export default function FactorFinder({ task, onDone, solved = false }) {
  const { react } = useKit();
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState(solved ? 'ok' : 'idle');
  const [lastPick, setLastPick] = useState(null);
  const good = task.candidates.find((c) => c.ok);
  const pick = (c) => {
    if (state === 'ok' || state === 'revealed') return;
    setLastPick(c);
    react(c.ok);
    if (c.ok) { setState('ok'); onDone?.(true); return; }
    const n = attempts + 1; setAttempts(n);
    if (n >= 3) { setState('revealed'); onDone?.(false); } else setState('wrong');
  };
  const done = state === 'ok' || state === 'revealed';
  return (
    <div className="space-y-3" role="group" aria-label="Facteur commun">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center">
        <MathText className="text-xl text-slate-800">{`$${task.expression}$`}</MathText>
      </div>
      <p className="text-sm text-slate-600">{task.prompt}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Facteurs candidats">
        {task.candidates.map((c) => (
          <button key={c.id} type="button" disabled={done} onClick={() => pick(c)} aria-label={`Facteur ${c.plain}`}
            className={`min-h-[44px] px-4 rounded-xl border-2 font-mono font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              done && c.ok ? 'bg-emerald-600 border-emerald-700 text-white' : lastPick?.id === c.id && !c.ok ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
            } disabled:cursor-default`}>
            <MathText>{`$${c.label}$`}</MathText>
          </button>
        ))}
      </div>
      {state === 'wrong' && lastPick && <Feedback tone="ko">{lastPick.why}</Feedback>}
      {done && (
        <div className="space-y-2">
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center space-y-1">
            <MathText className="text-lg text-emerald-900">{`$${task.expression} = ${task.factoredRaw}$`}</MathText>
            {task.factored && <MathText className="text-lg font-bold text-emerald-900">{`$= ${task.factored}$`}</MathText>}
          </div>
          <Feedback tone={state === 'ok' ? 'ok' : 'ko'}>{state === 'revealed' ? <>Pas grave, on te le montre : le facteur commun est <MathText>{`$${good.label}$`}</MathText>. </> : null}{good.why}</Feedback>
        </div>
      )}
    </div>
  );
}
