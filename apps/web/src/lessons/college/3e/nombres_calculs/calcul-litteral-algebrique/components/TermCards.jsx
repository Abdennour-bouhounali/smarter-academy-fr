import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { areLike, atomicFactors, formatTerms } from './litteralUtils';

/**
 * TermCards — la bande de cartes-termes, tap-first (INTERACTION_PEDAGOGY §24).
 * Adapté de `6e/algorithmique/.../components/ProgramStrip.jsx` : liste de
 * cartes, aucun glisser-déposer, tout au doigt ET au clavier.
 *
 * Activity: toucher les termes d'une expression, puis les facteurs d'un
 *   terme, puis empiler deux cartes semblables.
 * Mathematical objective: séparer physiquement « ce qu'on additionne » (les
 *   termes) de « ce qu'on multiplie » (les facteurs), et faire de « termes
 *   semblables » une PROPRIÉTÉ DE FORME : deux tuiles différentes ne
 *   s'empilent pas.
 * Student action: taper une carte (select), taper une sous-partie (facteur),
 *   ou taper deux cartes à empiler (merge / common-factor).
 * Controlled variable: `selected` (indices) et, en mode merge, la paire en
 *   cours.
 * Mathematical state: `terms` (Term[]) — possédé par le module ; le refus de
 *   fusion vient de `areLike`, pas d'un tableau de bonnes réponses.
 * Visual consequence: la carte sélectionnée s'entoure ; deux cartes
 *   semblables glissent l'une vers l'autre (transform CSS ≤ 400 ms) ; une
 *   paire non semblable rebondit et affiche la RAISON en forme de tuile.
 * Expected observation: 3x et 2x s'empilent (mêmes tuiles), 3x et 2 non.
 * Misconception targeted: « 3x + 2 = 5x » (#1) et « 3x + 2x = 5x² » (#2).
 * Feedback: le refus est une phrase de tuiles (« une tuile x et une tuile 1
 *   n'ont pas la même forme »), jamais un « faux » nu ; le module rend le
 *   <Feedback>, le composant remonte l'événement via `onRefuse`.
 * Formalization: les mots « terme », « facteur », « termes semblables » sont
 *   nommés APRÈS les gestes.
 * Scaffolding: `revealAll` allume la bonne sélection ; les cartes restent
 *   actives pendant le retour.
 * Transfer: le mode 'common-factor' rejoue le même geste pour la
 *   factorisation (module 6).
 *
 * Composant CONTRÔLÉ : aucun état de progression ici.
 *
 * Nœuds interactifs : ≤ 6 cartes + ≤ 4 sous-parties = 10.
 *
 * @param {Term[]} terms
 * @param {'select-terms'|'select-factors'|'merge'|'common-factor'} mode
 * @param {number[]|Set<number>} selected      indices (ou clés de facteur)
 * @param {(i:number)=>void} [onSelect]
 * @param {(i:number, j:number)=>void} [onMerge]        merge : paire semblable
 * @param {(i:number, j:number)=>void} [onRefuse]       merge : paire refusée
 * @param {(termIdx:number, factor:string, k:number)=>void} [onFactorTap]
 * @param {Set<string>} [factorSelected]  clés `${termIdx}:${k}` déjà touchées
 * @param {number|null} [pending]  index de la première carte d'une paire
 * @param {boolean} [disabled] @param {boolean} [revealAll]
 * @param {number[]} [expected]  indices attendus (revealAll uniquement)
 */
const CARD_BASE =
  'relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-2.5 min-h-[56px] min-w-[64px] font-mono text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const degTone = (deg, on) => {
  if (!on) return 'border-slate-300 bg-white text-slate-700 hover:border-blue-400';
  if (deg === 2) return 'border-indigo-600 bg-indigo-100 text-indigo-900';
  if (deg === 1) return 'border-emerald-600 bg-emerald-100 text-emerald-900';
  return 'border-amber-600 bg-amber-100 text-amber-900';
};

export default function TermCards({
  terms,
  mode = 'select-terms',
  selected = [],
  onSelect,
  onMerge,
  onRefuse,
  onFactorTap,
  factorSelected,
  pending = null,
  disabled = false,
  revealAll = false,
  expected = [],
  title,
  hint,
}) {
  const selSet = new Set(selected);
  const facSet = factorSelected instanceof Set ? factorSelected : new Set(factorSelected || []);
  const isOn = (i) => (revealAll ? expected.includes(i) : selSet.has(i));

  const handleCard = (i) => {
    if (disabled) return;
    if (mode === 'merge') {
      if (pending === null) { onSelect?.(i); return; }
      if (pending === i) { onSelect?.(i); return; }   // dé-sélection
      if (areLike(terms[pending], terms[i])) onMerge?.(pending, i);
      else onRefuse?.(pending, i);
      return;
    }
    onSelect?.(i);
  };

  const label = (t) => formatTerms([t]);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2.5" role="group" aria-label={title || "Cartes de l'expression"}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
          {title || 'L’expression, carte par carte'}
        </span>
        {hint && !disabled && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>

      {/* L'expression complète, en lecture — la carte est le terme signé */}
      <p className="text-center text-lg text-slate-800">
        <MathText>{`$${formatTerms(terms, { latex: true })}$`}</MathText>
      </p>

      <div className="flex gap-2 flex-wrap justify-center" role="group" aria-label="Termes">
        {terms.map((t, i) => {
          const on = isOn(i);
          const isPending = mode === 'merge' && pending === i;
          const factors = mode === 'select-factors' || mode === 'common-factor' ? atomicFactors(t) : null;
          return (
            <div key={`${i}-${t.coef}-${t.deg}`} className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleCard(i)}
                aria-pressed={on || isPending}
                aria-label={`Terme ${label(t)}${on ? ', sélectionné' : ''}`}
                className={`${CARD_BASE} ${degTone(t.deg, on)} ${
                  isPending ? 'ring-4 ring-blue-300 -translate-y-1' : ''
                } disabled:opacity-50`}
                style={{ transitionDuration: '250ms' }}
              >
                <span className="text-base">{label(t)}</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {t.deg === 2 ? 'tuile x²' : t.deg === 1 ? 'tuile x' : 'tuile 1'}
                </span>
              </button>

              {/* Sous-parties : les facteurs du terme (modes facteur) */}
              {factors && (
                <div className="flex gap-1 flex-wrap justify-center max-w-[150px]" role="group" aria-label={`Facteurs de ${label(t)}`}>
                  {factors.map((f, k) => {
                    const key = `${i}:${k}`;
                    const fOn = facSet.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => onFactorTap?.(i, f, k)}
                        aria-pressed={fOn}
                        aria-label={`Facteur ${f} de ${label(t)}`}
                        className={`min-h-[44px] min-w-[44px] px-2 rounded-lg border-2 font-mono text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          fOn
                            ? 'border-violet-600 bg-violet-100 text-violet-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-400'
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode === 'merge' && (
        <p className="text-center text-xs text-slate-500">
          {pending === null
            ? 'Touche une carte, puis une seconde pour tenter de les empiler.'
            : `Carte ${label(terms[pending])} en main — touche celle avec laquelle l’empiler.`}
        </p>
      )}
    </div>
  );
}
