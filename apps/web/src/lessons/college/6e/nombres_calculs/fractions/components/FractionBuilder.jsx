import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { texFrac } from './fractionUtils';

/**
 * FractionBuilder — saisie structurée d'une fraction.
 *
 * Jamais de champ texte libre : le numérateur se règle par compteur, le
 * dénominateur se choisit parmi des valeurs proposées (ou reste fixe, quand
 * le partage est déjà visible ailleurs à l'écran). C'est le pendant, pour
 * cette leçon, du sélecteur de fraction décimale utilisé dans la leçon
 * Nombres décimaux — même logique d'interaction, dénominateurs différents.
 *
 * @param {number} targetNum
 * @param {number} targetDen
 * @param {number[]} [denOptions]  dénominateurs proposés ; si absent, le
 *   dénominateur est fixe et affiché tel quel (non modifiable).
 * @param {number}  [maxNum]       borne supérieure du compteur numérateur
 * @param {string}  [hint]
 * @param {(n:number,d:number)=>string} [wrongHint] indice dépendant de la saisie fautive
 */
export default function FractionBuilder({
  targetNum,
  targetDen,
  denOptions = null,
  maxNum = 12,
  hint,
  wrongHint,
  onSolved,
  solved,
  successNote,
}) {
  const [num, setNum] = useState(0);
  const [den, setDen] = useState(denOptions ? null : targetDen);
  const [checked, setChecked] = useState(false);

  const isRight = num === targetNum && den === targetDen;

  const bump = (delta) => {
    setChecked(false);
    setNum((n) => Math.max(0, Math.min(maxNum, n + delta)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {/* Numérateur */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Numérateur
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => bump(-1)}
              disabled={solved}
              aria-label="Diminuer le numérateur"
              className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="font-mono font-extrabold text-2xl tabular-nums w-12 text-center" aria-live="polite">
              {num}
            </span>
            <button
              type="button"
              onClick={() => bump(1)}
              disabled={solved}
              aria-label="Augmenter le numérateur"
              className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="h-1 w-16 bg-slate-800 rounded-full my-2" aria-hidden="true" />

        {/* Dénominateur */}
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Dénominateur
          </div>
          {denOptions ? (
            <div className="flex gap-1.5 flex-wrap justify-center max-w-[220px]">
              {denOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setChecked(false);
                    setDen(d);
                  }}
                  disabled={solved}
                  aria-pressed={den === d}
                  className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    den === d
                      ? 'bg-blue-600 border-blue-700 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-slate-100 border-2 border-slate-200 font-mono font-bold text-lg text-slate-700">
              {den}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-2xl text-slate-800 min-h-[44px] flex items-center justify-center">
        {(num > 0 || den) && <MathText>{`$${texFrac(num, den || '?')}$`}</MathText>}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
            disabled={den === null}
          >
            Valider ma fraction
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="hint">
          {wrongHint ? wrongHint(num, den) : hint || "Compte à nouveau les parts, puis compare au partage total."}
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          {successNote || (
            <>
              <MathText>{`$${texFrac(targetNum, targetDen)}$`}</MathText> : {targetNum} part
              {targetNum > 1 ? 's' : ''} sur {targetDen}.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}
