import React, { useState } from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import { FAMILIES, classify, decimalText, familiesOf } from './realsUtils';

/**
 * FamilySorter — cinq boîtes emboîtées ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ.
 *
 * Activity: pour chaque nombre, TESTER son écriture (« Développer ») puis le
 *   ranger dans la plus petite famille qui le contient.
 * Mathematical objective: la famille se lit sur l'écriture décimale exacte —
 *   s'arrête → décimal ; se répète → rationnel non décimal ; ni l'un ni
 *   l'autre → irrationnel ; et √9 = 3 est un entier.
 * Student action: toucher un nombre (le développement apparaît), puis une
 *   famille.
 * Controlled variable: l'affectation.
 * Mathematical state: `placed` { id: famille } (module) ; classify décide.
 * Visual consequence: le nombre se pose ; barré et expliqué s'il est mal
 *   rangé ; la chaîne d'appartenances (∈ 𝔻, ∈ ℚ, ∈ ℝ) s'écrit.
 * Misconception targeted: « √9 est irrationnel », « 1/3 est décimal »,
 *   « 0,5 n'est pas rationnel ».
 */
export default function FamilySorter({ numbers, placed, onPlace, disabled = false }) {
  const [selected, setSelected] = useState(null);
  const pool = numbers.filter((n) => placed[n.id] === undefined);
  const sel = numbers.find((n) => n.id === selected) ?? null;

  const expansion = (n) => {
    if (n.kind === 'irrational') return { text: `${n.label} = ${n.approx}…`, note: 'ni ne s’arrête, ni ne se répète' };
    const d = decimalText(n.p, n.q, 8);
    if (d.exact) return { text: `${n.label} = ${d.text}`, note: 'l’écriture s’arrête' };
    return { text: `${n.label} = ${d.text}`, note: `se répète (période ${d.period})` };
  };

  const wrong = numbers.filter((n) => placed[n.id] !== undefined && placed[n.id] !== classify(n));

  return (
    <div className="space-y-3" role="group" aria-label="Familles de nombres">
      <div className="flex flex-wrap gap-1.5 min-h-[44px]" role="group" aria-label="Nombres à ranger">
        {pool.length === 0 && <span className="text-xs text-slate-400 italic self-center">Tous les nombres sont rangés.</span>}
        {pool.map((n) => (
          <button
            key={n.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected === n.id}
            aria-label={`Nombre ${n.label}`}
            onClick={() => setSelected(selected === n.id ? null : n.id)}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected === n.id ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>
      {sel && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          <span className="font-mono font-bold">{expansion(sel).text}</span> — {expansion(sel).note}. Touche la plus petite famille qui contient {sel.label}.
        </div>
      )}

      <div className="space-y-1.5">
        {FAMILIES.map((f, i) => {
          const armed = selected !== null && !disabled;
          const items = numbers.filter((n) => placed[n.id] === f.id);
          return (
            <div key={f.id} className={`rounded-2xl border-2 ${armed ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-white'}`} style={{ marginLeft: `${i * 6}px` }}>
              <button
                type="button"
                disabled={!armed}
                onClick={() => { if (selected !== null) { onPlace(selected, f.id); setSelected(null); } }}
                aria-label={`Ranger dans ${f.symbol} (${f.name})`}
                className={`w-full text-left flex items-center gap-2 rounded-xl px-3 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${armed ? 'hover:bg-indigo-100 cursor-pointer' : 'cursor-default'}`}
              >
                <span className="font-space font-extrabold text-lg text-slate-800 w-6">{f.symbol}</span>
                <span className="text-xs text-slate-500">{f.name}{i > 0 ? ` — contient ${FAMILIES[i - 1].symbol}` : ''}</span>
                {armed && <span className="ml-auto text-[11px] font-mono font-bold text-indigo-700">ranger ici</span>}
              </button>
              {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                  {items.map((n) => {
                    const ok = classify(n) === f.id;
                    return (
                      <span key={n.id} className={`px-2.5 py-1 rounded-lg font-mono text-sm font-bold border ${ok ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800 line-through'}`}>
                        {n.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {wrong.length > 0 && (
        <Feedback tone="ko">
          {wrong.map((n) => {
            const fam = FAMILIES.find((f) => f.id === classify(n));
            return (
              <span key={n.id} className="block">
                <strong className="font-mono">{n.label}</strong> : {expansion(n).text} ({expansion(n).note}) → sa plus petite famille est <strong>{fam.symbol}</strong> ; il est donc aussi dans {familiesOf(n).slice(1).map((id) => FAMILIES.find((f) => f.id === id).symbol).join(', ') || '—'}.
              </span>
            );
          })}
        </Feedback>
      )}
    </div>
  );
}
