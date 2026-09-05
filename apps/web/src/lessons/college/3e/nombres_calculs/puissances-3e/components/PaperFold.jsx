import React from 'react';
import { formatDec, formatExpanded, pow } from './powerUtils';
import MathText from '../../../../../common/components/MathText';

/**
 * PaperFold — le déclencheur : plier une feuille et compter les épaisseurs.
 *
 * Activity: taper « Plier » ; le nombre d'épaisseurs double à chaque pli.
 * Mathematical objective: rencontrer une multiplication répétée AVANT son nom,
 *   et sentir le besoin d'une écriture courte quand le produit 2×2×2×… devient
 *   illisible.
 * Student action: taper « Plier en deux » / « Déplier ».
 * Controlled variable: le nombre de plis f.
 * Mathematical state: f (un entier). Le nombre d'épaisseurs, les bandes
 *   dessinées et le produit développé en sont DÉRIVÉS (pow(2, f)).
 * Visual consequence: la feuille se coupe en 2^f bandes ; le produit écrit
 *   en toutes lettres s'allonge d'un « × 2 » par pli.
 * Expected observation: l'écriture développée devient vite impraticable — il
 *   faut un nom court pour « 2 multiplié 5 fois par lui-même ».
 * Misconception targeted: « plier 5 fois donne 10 épaisseurs » (2 × 5 au lieu
 *   de 2^5) — le dessin le contredit en montrant 32 bandes.
 * Feedback: le module affiche le compte d'épaisseurs et l'écart à la cible.
 * Formalization: le nom 2^f n'apparaît qu'APRÈS le geste, à l'étape 2.
 * Scaffolding: tap-first ; au-delà de 5 plis les bandes ne sont plus dessinées
 *   une à une mais résumées par un badge « ×N » (cap de densité).
 *
 * Composant CONTRÔLÉ : `folds` appartient au module.
 * Nœuds interactifs : 2 boutons. Les bandes sont décoratives (≤ 32 rects).
 *
 * @param {number} folds
 * @param {(f:number)=>void} [onChange]
 * @param {number} [maxFolds=6]
 * @param {boolean} [showCompact=false] affiche l'écriture 2^f
 * @param {boolean} [frozen=false]
 */
const W = 320;
const H = 120;
const MAX_DRAWN = 32;

export default function PaperFold({ folds, onChange, maxFolds = 6, showCompact = false, frozen = false }) {
  const layers = pow(2, folds);
  const drawn = Math.min(layers, MAX_DRAWN);
  const bandW = W / drawn;

  return (
    <div className="space-y-3" role="group" aria-label="Feuille à plier">
      <div className="w-full flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto max-w-[420px]"
          role="img"
          aria-label={`Feuille pliée ${folds} fois : ${layers} épaisseurs`}
        >
          <g pointerEvents="none">
            <rect x="0" y="10" width={W} height={H - 20} rx="6" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
            {Array.from({ length: drawn }, (_, i) => (
              <rect
                key={i}
                x={i * bandW}
                y={10}
                width={bandW}
                height={H - 20}
                fill={i % 2 === 0 ? '#c7d2fe' : '#e0e7ff'}
                stroke="#6366f1"
                strokeWidth={drawn > 16 ? 0.4 : 1}
              />
            ))}
            <text x={W / 2} y={H - 26} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#3730a3" fontFamily="monospace">
              {formatDec(layers)}
            </text>
            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#4338ca">
              épaisseur{layers > 1 ? 's' : ''}
            </text>
          </g>
        </svg>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Le calcul, écrit en entier</p>
        <p className="font-mono text-sm sm:text-base font-bold text-slate-800 break-words">
          {folds === 0 ? '1 (pas encore plié)' : `${formatExpanded(2, folds).replace(/\\times/g, '×')} = ${formatDec(layers)}`}
        </p>
        {showCompact && folds > 0 && (
          <p className="pt-1">
            <MathText className="text-lg text-indigo-700">{`$2^{${folds}} = ${formatDec(layers)}$`}</MathText>
          </p>
        )}
      </div>

      {!frozen && onChange && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onChange(folds - 1)}
            disabled={folds <= 0}
            aria-label="Déplier une fois"
            className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Déplier
          </button>
          <span className="font-mono text-sm font-extrabold text-slate-700 tabular-nums w-24 text-center">
            {formatDec(folds)} pli{folds > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => onChange(folds + 1)}
            disabled={folds >= maxFolds}
            aria-label="Plier la feuille en deux"
            className="min-h-[44px] px-4 rounded-xl border-2 bg-indigo-600 border-indigo-700 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Plier en deux
          </button>
        </div>
      )}
    </div>
  );
}
