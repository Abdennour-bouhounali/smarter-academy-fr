import React, { useState } from 'react';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { useKit } from '../../../../../common/kit';

/**
 * ProofOrder — remettre les lignes d'une démonstration dans l'ordre
 * (tap-first : toucher une ligne l'ajoute, toucher une ligne placée la
 * retire). Formatif : à la vérification, on désigne la PREMIÈRE ligne mal
 * placée ; deux essais, puis l'ordre correct est révélé et l'étape se termine.
 *
 * @param {{id, text}[]} lines   dans l'ordre CORRECT ; `order` donne l'ordre d'affichage
 * @param {string[]} order       ids dans l'ordre proposé au départ (mélange fixe)
 */
export default function ProofOrder({ lines, order, onDone, solved = false }) {
  const { react } = useKit();
  const [placed, setPlaced] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState(solved ? 'ok' : 'idle');
  const [breakAt, setBreakAt] = useState(null);
  const byId = (id) => lines.find((l) => l.id === id);
  const pool = order.filter((id) => !placed.includes(id));
  const done = state === 'ok' || state === 'revealed';
  const check = () => {
    const idx = placed.findIndex((id, i) => lines[i].id !== id);
    const ok = idx === -1 && placed.length === lines.length;
    react(ok);
    if (ok) { setState('ok'); onDone?.(true); return; }
    const n = attempts + 1; setAttempts(n); setBreakAt(idx === -1 ? placed.length : idx);
    if (n >= 2) { setState('revealed'); setPlaced(lines.map((l) => l.id)); onDone?.(false); } else setState('wrong');
  };
  return (
    <div className="space-y-3" role="group" aria-label="Démonstration à remettre en ordre">
      {!done && (
        <div className="flex flex-wrap gap-2 min-h-[44px]" aria-label="Lignes disponibles">
          {pool.map((id) => (
            <button key={id} type="button" onClick={() => { setPlaced([...placed, id]); setState('idle'); }} aria-label={`Placer : ${byId(id).plain}`} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-sm font-medium text-slate-800 hover:border-indigo-400 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <MathText>{byId(id).text}</MathText>
            </button>
          ))}
        </div>
      )}
      <ol className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-2 space-y-1.5 min-h-[56px]">
        {placed.length === 0 && <li className="text-xs text-slate-400 italic px-2 py-2">Touche la première ligne de la démonstration.</li>}
        {placed.map((id, i) => (
          <li key={id}>
            <button type="button" disabled={done} onClick={() => { setPlaced(placed.filter((p) => p !== id)); setState('idle'); }} aria-label={`Retirer : ${byId(id).plain}`}
              className={`w-full text-left min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : state === 'wrong' && i === breakAt ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-white border-slate-200 text-slate-800'}`}>
              <span className="font-mono font-bold text-slate-400 mr-2">{i + 1}.</span><MathText>{byId(id).text}</MathText>
            </button>
          </li>
        ))}
      </ol>
      {state === 'wrong' && <Feedback tone="ko">L’ordre casse à la ligne {breakAt + 1} : chaque ligne doit découler de la précédente. Retire des lignes et réessaie.</Feedback>}
      {state === 'revealed' && <Feedback tone="ko">Pas grave, voici l’ordre : chaque égalité découle de la précédente, jusqu’à la conclusion.</Feedback>}
      {state === 'ok' && <Feedback tone="ok">Démonstration en ordre : de l’hypothèse à la conclusion, chaque ligne découle de la précédente — c’est valable pour TOUT x.</Feedback>}
      {!done && <ValidateButton onClick={check} disabled={placed.length !== lines.length} tone="indigo">Vérifier l’ordre</ValidateButton>}
    </div>
  );
}
