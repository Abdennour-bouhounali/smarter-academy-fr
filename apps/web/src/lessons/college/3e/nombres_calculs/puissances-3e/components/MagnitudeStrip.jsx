import React from 'react';
import { formatDec, orderOfMagnitude, formatPower } from './powerUtils';

/**
 * MagnitudeStrip — la bande des ordres de grandeur (échelle logarithmique).
 *
 * Activity: placer un nombre sur une bande graduée en puissances de 10 en
 *   tapant la graduation qui correspond à son ordre de grandeur.
 * Mathematical objective: l'ordre de grandeur d'un nombre est l'exposant de
 *   10 de son écriture scientifique ; deux nombres se comparent d'abord par
 *   là.
 * Student action: taper une graduation (une puissance de 10).
 * Controlled variable: l'exposant choisi.
 * Mathematical state: `picked` (un entier), possédé par le module ; la bonne
 *   réponse vient de orderOfMagnitude(value).
 * Visual consequence: la graduation choisie se remplit ; quand elle est
 *   correcte, le nombre vient s'y poser.
 * Expected observation: entre deux graduations voisines, il y a un facteur
 *   10 — pas une différence de 10.
 * Misconception targeted: comparer les mantisses avant les exposants
 *   (« 9 × 10³ > 2 × 10⁵ parce que 9 > 2 »).
 * Feedback: le module dit de combien de rangs on s'est trompé.
 * Scaffolding: graduations tap-first, ≤ 13 boutons (cap de densité).
 *
 * Composant CONTRÔLÉ : `picked` appartient au module.
 * Nœuds interactifs : (maxExp − minExp + 1) ≤ 13 boutons.
 *
 * @param {number} value        le nombre à situer
 * @param {number|null} picked  l'exposant tapé par l'élève
 * @param {(n:number)=>void} [onPick]
 * @param {number} [minExp=-6] @param {number} [maxExp=6]
 * @param {boolean} [revealed=false] montre la bonne graduation
 * @param {string} [label]
 */
export default function MagnitudeStrip({
  value,
  picked = null,
  onPick,
  minExp = -6,
  maxExp = 6,
  revealed = false,
  label,
}) {
  const answer = orderOfMagnitude(value);
  const exps = [];
  for (let e = minExp; e <= maxExp; e += 1) exps.push(e);

  return (
    <div className="space-y-2" role="group" aria-label={label || 'Bande des ordres de grandeur'}>
      <div className="w-full overflow-x-auto">
        <div className="flex items-end justify-start sm:justify-center gap-1 min-w-max px-1 pb-1">
          {exps.map((e) => {
            const isPicked = picked === e;
            const isAnswer = e === answer;
            const showRight = revealed && isAnswer;
            const showWrong = revealed && isPicked && !isAnswer;
            return (
              <button
                key={e}
                type="button"
                onClick={onPick ? () => onPick(e) : undefined}
                disabled={!onPick}
                aria-pressed={isPicked}
                aria-label={`10 puissance ${e}`}
                className={`min-w-[46px] min-h-[52px] rounded-lg border-2 flex flex-col items-center justify-end px-1 pb-1 font-mono text-[11px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  showRight
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : showWrong
                    ? 'bg-rose-500 border-rose-700 text-white'
                    : isPicked
                    ? 'bg-violet-600 border-violet-700 text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-violet-500 disabled:hover:border-slate-300'
                }`}
                style={{ height: `${28 + Math.abs(e) * 2}px` }}
              >
                <span aria-hidden="true">10</span>
                <span className="text-[10px] -mt-1" aria-hidden="true">
                  {e < 0 ? `−${Math.abs(e)}` : e}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">
        D’une graduation à la voisine, on multiplie (ou on divise) par 10 — jamais on n’ajoute 10.
      </p>
      <p className="sr-only">
        Le nombre {formatDec(value, { maxDecimals: 12 })} a pour ordre de grandeur {formatPower(10, answer)}.
      </p>
    </div>
  );
}
