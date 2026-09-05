import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, formatPower, pow, expand } from './powerUtils';

/**
 * PowerExplorer — l'explorateur libre base / exposant (repris du module 1
 * de la leçon d'origine, converti en composant contrôlé tap-first).
 *
 * Activity: choisir une base et un exposant, et voir la multiplication
 *   répétée correspondante s'écrire, puis sa valeur.
 * Mathematical objective: séparer nettement les deux rôles — la base est le
 *   nombre RÉPÉTÉ, l'exposant est le NOMBRE DE FOIS.
 * Student action: taper une puce de base, pousser −/+ sur l'exposant (le
 *   curseur reste disponible en secours).
 * Controlled variable: (base, n).
 * Mathematical state: `{ base, n }` ; les facteurs et la valeur sont dérivés
 *   par expand / pow.
 * Visual consequence: la ligne de facteurs s'allonge d'un facteur par cran ;
 *   à n = 0 elle est vide et la valeur affiche 1 ; à n < 0 elle bascule en
 *   fraction.
 * Expected observation: échanger base et exposant ne donne pas la même chose
 *   (2^5 = 32 mais 5^2 = 25).
 * Misconception targeted: « 2^3 = 6 » (exposant confondu avec un facteur) et
 *   « a^n = n^a ».
 * Feedback: la valeur et le produit développé sont toujours visibles côte à
 *   côte — l'écart entre 2×3 et 2^3 se lit directement.
 * Scaffolding: puces de bases (tap) + stepper d'exposant ; le curseur range
 *   est secondaire et doublé par le stepper.
 *
 * Composant CONTRÔLÉ : `base` et `n` appartiennent au module.
 * Nœuds interactifs : 6 puces de base + 2 boutons + 1 curseur = 9.
 *
 * @param {number} base @param {number} n
 * @param {(b:number)=>void} [onBaseChange]
 * @param {(n:number)=>void} [onExpChange]
 * @param {number[]} [bases=[2,3,5,7,10]]
 * @param {number} [minN=-2] @param {number} [maxN=6]
 * @param {boolean} [frozen=false]
 */
export default function PowerExplorer({
  base,
  n,
  onBaseChange,
  onExpChange,
  bases = [2, 3, 5, 7, 10],
  minN = -2,
  maxN = 6,
  frozen = false,
}) {
  const factors = expand(base, Math.abs(n));
  const value = pow(base, n);

  return (
    <div className="space-y-3" role="group" aria-label="Explorateur de puissances">
      {!frozen && onBaseChange && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-wide font-bold text-slate-500 text-center">
            La base — le nombre qu’on répète
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {bases.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onBaseChange(b)}
                aria-pressed={base === b}
                aria-label={`Base ${b}`}
                className={`min-w-[52px] min-h-[44px] rounded-xl border-2 font-mono text-lg font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  base === b
                    ? 'bg-sky-600 border-sky-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── La lecture : facteurs puis valeur ────────────────────────── */}
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-center space-y-2">
        <MathText className="text-2xl text-slate-800">{`$${formatPower(base, n)}$`}</MathText>
        <div className="text-sm font-mono text-slate-700 break-words">
          {n > 0 && `${factors.join(' × ')} = ${formatDec(value, { maxDecimals: 6 })}`}
          {n === 0 && 'aucun facteur — une multiplication vide vaut 1'}
          {n < 0 && (
            <>
              1 ÷ ({factors.join(' × ')}) = {formatDec(value, { maxDecimals: 6 })}
            </>
          )}
        </div>
        <p className="text-xs text-sky-800">
          {n > 0
            ? `${base} apparaît ${formatDec(n)} fois dans la multiplication.`
            : n === 0
            ? 'Exposant 0 : la tour est vide, le résultat vaut 1.'
            : `Exposant négatif : on divise ${formatDec(Math.abs(n))} fois par ${base}.`}
        </p>
      </div>

      {!frozen && onExpChange && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide font-bold text-slate-500 text-center">
            L’exposant — le nombre de fois
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onExpChange(n - 1)}
              disabled={n <= minN}
              aria-label="Diminuer l’exposant de 1"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-sky-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              −
            </button>
            <span className="font-mono text-lg font-extrabold text-slate-800 tabular-nums w-16 text-center">
              {formatDec(n)}
            </span>
            <button
              type="button"
              onClick={() => onExpChange(n + 1)}
              disabled={n >= maxN}
              aria-label="Augmenter l’exposant de 1"
              className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-sky-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              +
            </button>
          </div>
          {/* Curseur secondaire — le stepper ci-dessus reste le chemin principal. */}
          <input
            type="range"
            min={minN}
            max={maxN}
            step="1"
            value={n}
            onChange={(e) => onExpChange(Number(e.target.value))}
            aria-label={`Exposant, actuellement ${n}`}
            className="w-full max-w-md mx-auto block h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>
      )}
    </div>
  );
}
