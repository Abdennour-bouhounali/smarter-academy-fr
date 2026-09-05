import React from 'react';

/**
 * ProblemText — l'énoncé découpé en FRAGMENTS, pour que « la question » et
 * « la donnée qui a servi » deviennent des objets qu'on peut désigner.
 *
 * Deux modes :
 *  - `mode="source"` (défaut) : affichage seul ; les fragments dont l'id est
 *    dans `highlighted` s'allument dans la couleur de la carte qui vient
 *    d'être touchée dans le Traducteur. Aucune interaction.
 *  - `mode="question"` : chaque fragment devient un <button> — l'élève touche
 *    la phrase qui pose la question.
 *
 * Composant CONTRÔLÉ : `highlighted` (Set d'ids) et `onTapFragment` sont
 * possédés par le module. Aucun état interne, aucune logique de progression.
 *
 * Densité mobile (spec C8) : les énoncés font ≤ 45 mots, chaque fragment
 * garde `min-h-[44px]` en mode question et un `leading-relaxed` en mode
 * source pour ne jamais dépasser 4 lignes sur 375 px.
 *
 * @param {{id:string, text:string, isQuestion?:boolean}[]} fragments
 * @param {Set<string>} [highlighted]
 * @param {'source'|'question'} [mode]
 * @param {(id:string)=>void} [onTapFragment]
 * @param {string|null} [tapped]      fragment déjà touché (mode question)
 * @param {boolean} [revealed]        montre la bonne phrase (mode question)
 * @param {string} [title]
 */
const TONE = {
  emerald: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400',
  indigo: 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-400',
  amber: 'bg-amber-100 text-amber-900 ring-1 ring-amber-400',
  rose: 'bg-rose-100 text-rose-900 ring-1 ring-rose-400',
  sky: 'bg-sky-100 text-sky-900 ring-1 ring-sky-400',
};

export default function ProblemText({
  fragments,
  highlighted,
  highlightTone = 'emerald',
  mode = 'source',
  onTapFragment,
  tapped = null,
  revealed = false,
  title,
  disabled = false,
}) {
  const isLit = (f) => highlighted?.has(f.id);

  if (mode === 'question') {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
        {title && (
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{title}</p>
        )}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Phrases de l’énoncé">
          {fragments.map((f) => {
            const picked = tapped === f.id;
            const showRight = revealed && f.isQuestion;
            const showWrong = revealed && picked && !f.isQuestion;
            const tone = showRight
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
              : showWrong
              ? 'border-rose-400 bg-rose-50 text-rose-900'
              : picked
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400';
            return (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                onClick={() => onTapFragment?.(f.id)}
                aria-pressed={picked}
                aria-label={`Phrase : ${f.text}`}
                className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm text-left leading-snug transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
              >
                {showRight && <span aria-hidden="true" className="mr-1">✔</span>}
                {f.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-1.5">
      {title && (
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{title}</p>
      )}
      <p className="text-sm text-slate-700 leading-relaxed">
        {fragments.map((f) => (
          <React.Fragment key={f.id}>
            <span
              className={`rounded px-1 py-0.5 transition-colors ${
                isLit(f) ? TONE[highlightTone] || TONE.emerald : f.isQuestion ? 'font-bold text-slate-900' : ''
              }`}
            >
              {f.text}
            </span>{' '}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
