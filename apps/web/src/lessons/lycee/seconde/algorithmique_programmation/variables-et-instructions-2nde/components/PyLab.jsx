import React, { useState } from 'react';
import { pyRun, makeRng } from './pyRun';

/**
 * PyLab — LA manipulation signature du chapitre (INTERACTION_PEDAGOGY §6bis).
 *
 * Activité :
 *  - objectif : rendre l'exécution VISIBLE. Un programme n'est pas un texte à
 *    lire, c'est une machine qui transforme des variables et produit une sortie ;
 *  - action de l'élève : modifier le code et l'exécuter ;
 *  - variable contrôlée : le code lui-même ;
 *  - conséquence immédiate : la sortie ET l'état final des variables changent.
 *
 * Le programme est réellement interprété (components/pyRun.js) : aucune sortie
 * n'est écrite à la main, donc l'affichage ne peut pas mentir sur ce que le
 * code fait. Le hasard est injecté par graine, pour être rejouable.
 *
 * Jamais gelé après validation : l'élève peut continuer à essayer.
 */
export default function PyLab({
  initial,
  onRun,                 // ({output, env, error, source}) => void
  readOnly = false,
  showEnv = true,
  seed = 2026,
  height = 'h-44',
  label = 'Éditeur Python',
}) {
  const [source, setSource] = useState(initial);
  const [result, setResult] = useState(null);

  const run = () => {
    const r = pyRun(source, { rng: makeRng(seed) });
    setResult(r);
    onRun?.({ ...r, source });
  };

  const reset = () => { setSource(initial); setResult(null); };

  const lines = source.split('\n').length;

  return (
    <div role="group" aria-label={label} className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800 text-slate-100">
        <span className="font-mono text-xs">🐍 programme.py</span>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              type="button" onClick={reset}
              className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              réinitialiser
            </button>
          )}
          <button
            type="button" onClick={run}
            aria-label="Exécuter le programme"
            className="text-[11px] font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            ▶ Exécuter
          </button>
        </div>
      </div>

      <div className="flex">
        <div aria-hidden="true" className="select-none py-2 px-2 bg-slate-100 text-slate-400 font-mono text-xs leading-6 text-right">
          {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          aria-label={readOnly ? 'Programme (lecture seule)' : 'Code du programme, modifiable'}
          className={`flex-1 ${height} p-2 font-mono text-sm leading-6 resize-y outline-none ${readOnly ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-800'} focus-visible:ring-2 focus-visible:ring-sky-400`}
        />
      </div>

      {result && (
        <div className="border-t-2 border-slate-200">
          <div className="px-3 py-2 bg-slate-900 text-slate-100 font-mono text-sm min-h-[2.5rem]" data-testid="py-output">
            <div className="text-[10px] uppercase text-slate-400 mb-1">sortie</div>
            {result.error ? (
              <div className="text-rose-300">
                ⚠ ligne {result.error.line} : {result.error.message}
              </div>
            ) : result.output.length ? (
              result.output.map((l, i) => <div key={i}>{l || ' '}</div>)
            ) : (
              <div className="text-slate-500 italic">(le programme n’affiche rien)</div>
            )}
          </div>

          {showEnv && !result.error && Object.keys(result.env).length > 0 && (
            <div className="px-3 py-2 bg-sky-50 border-t border-sky-100" data-testid="py-env">
              <div className="text-[10px] uppercase font-bold text-sky-600 mb-1">variables à la fin</div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {Object.entries(result.env).map(([k, v]) => (
                  <span key={k} className="px-2 py-1 rounded-lg bg-white border border-sky-200 text-sky-900">
                    {k} = {typeof v === 'string' ? `"${v}"` : String(v === true ? 'True' : v === false ? 'False' : v)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
