import React, { useState } from 'react';
import { formatDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { SETS, smallestSet } from './intervalUtils';

/**
 * SetBoxes — trois boîtes emboîtées ℕ ⊂ ℤ ⊂ ℝ, des nombres à ranger.
 *
 * Activity: ranger chaque nombre dans la PLUS PETITE boîte qui le contient.
 * Mathematical objective: appartenance (∈ / ∉) et inclusion (ℕ ⊂ ℤ ⊂ ℝ) vues
 *   comme des boîtes : ce qui est dans ℕ est aussi dans ℤ et dans ℝ.
 * Student action: toucher un nombre, puis une boîte (deux temps, tactile).
 * Controlled variable: l'affectation nombre → boîte.
 * Mathematical state: `placed` { nombre: 'N' | 'Z' | 'R' } (module).
 * Visual consequence: le nombre se pose dans la boîte ; s'il est mal rangé,
 *   il reste visible en rouge et la bonne boîte est nommée (formatif).
 * Expected observation: −3 n'entre pas dans ℕ mais dans ℤ ; 2,5 n'entre
 *   que dans ℝ ; 0 est dans ℕ.
 * Misconception targeted: « 0 n'est pas un entier naturel », « −3 ∈ ℕ ».
 */
export default function SetBoxes({ numbers, placed, onPlace, disabled = false }) {
  const [selected, setSelected] = useState(null);
  const pool = numbers.filter((n) => placed[n] === undefined);
  const inBox = (id) => numbers.filter((n) => placed[n] === id);

  // Pas de <button> imbriqués (DOM invalide, clics qui remontent) : chaque
  // boîte est un <div> dont l'EN-TÊTE est le bouton « ranger ici ».
  const Box = ({ id, children }) => {
    const s = SETS[id];
    const armed = selected !== null && !disabled;
    return (
      <div className={`rounded-2xl border-2 p-2 sm:p-3 transition-colors ${armed ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-300 bg-white/70'}`}>
        <button
          type="button"
          disabled={!armed}
          onClick={() => { if (selected !== null) { onPlace(selected, id); setSelected(null); } }}
          aria-label={`Ranger dans ${s.symbol} (${s.name})`}
          className={`w-full text-left flex items-center gap-2 rounded-xl px-2 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${armed ? 'bg-indigo-100 hover:bg-indigo-200 cursor-pointer' : 'cursor-default'}`}
        >
          <span className="font-space font-extrabold text-lg text-slate-800">{s.symbol}</span>
          <span className="text-xs text-slate-500">{s.name}</span>
          {armed && <span className="ml-auto text-[11px] font-mono font-bold text-indigo-700">ranger ici</span>}
        </button>
        <div className="flex flex-wrap gap-1.5 min-h-[36px] px-2 pt-1">
          {inBox(id).map((n) => {
            const right = smallestSet(n) === id;
            return (
              <span key={n} className={`px-2.5 py-1 rounded-lg font-mono text-sm font-bold border ${right ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800 line-through'}`}>
                {formatDec(n)}
              </span>
            );
          })}
        </div>
        {children}
      </div>
    );
  };

  const wrong = numbers.filter((n) => placed[n] !== undefined && placed[n] !== smallestSet(n));

  return (
    <div className="space-y-3" role="group" aria-label="Boîtes emboîtées des ensembles de nombres">
      <div className="flex flex-wrap gap-1.5 min-h-[44px]" role="group" aria-label="Nombres à ranger">
        {pool.length === 0 && <span className="text-xs text-slate-400 italic self-center">Tous les nombres sont rangés.</span>}
        {pool.map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            aria-pressed={selected === n}
            aria-label={`Nombre ${formatDec(n)}`}
            onClick={() => setSelected(selected === n ? null : n)}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              selected === n ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
            }`}
          >
            {formatDec(n)}
          </button>
        ))}
      </div>
      {selected !== null && <p className="text-xs text-indigo-700 font-semibold">Touche maintenant la plus petite boîte qui contient {formatDec(selected)}.</p>}

      {/* boîtes emboîtées : ℝ contient ℤ qui contient ℕ */}
      <div className="rounded-3xl border-2 border-slate-300 bg-slate-50 p-2 sm:p-3">
        <Box id="R">
          <div className="mt-2 rounded-2xl border-2 border-slate-300 bg-slate-50 p-2 sm:p-3">
            <Box id="Z">
              <div className="mt-2 rounded-2xl border-2 border-slate-300 bg-slate-50 p-2 sm:p-3">
                <Box id="N" />
              </div>
            </Box>
          </div>
        </Box>
      </div>

      {wrong.length > 0 && (
        <Feedback tone="ko">
          {wrong.map((n) => (
            <span key={n} className="block">
              <strong className="font-mono">{formatDec(n)}</strong> n’est pas dans {SETS[placed[n]].symbol} :{' '}
              {smallestSet(n) === 'N' && 'c’est un entier positif (ou nul), donc il est dans ℕ — et donc aussi dans ℤ et ℝ.'}
              {smallestSet(n) === 'Z' && 'c’est un entier négatif : pas dans ℕ, mais dans ℤ (et donc dans ℝ).'}
              {smallestSet(n) === 'R' && 'ce n’est pas un entier : seule la grande boîte ℝ le contient.'}
            </span>
          ))}
        </Feedback>
      )}
    </div>
  );
}
