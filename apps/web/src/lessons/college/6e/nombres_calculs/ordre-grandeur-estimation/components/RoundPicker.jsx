import React, { useState } from 'react';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { formatFr, friendlyNeighbours } from './estimationUtils';

/**
 * RoundPicker — « vers quel nombre ami arrondir ? »
 *
 * Le nombre exact est affiché comme repère fixe sur une droite graduée
 * courte ; l'élève choisit, par un simple tap (jamais un glisser fragile
 * sur mobile), lequel des deux nombres amis voisins est le plus proche.
 * La droite rend visible la distance, plutôt que de la faire deviner.
 */
export default function RoundPicker({ value, step, onSolved, solved, label }) {
  const { lower, upper, nearest } = friendlyNeighbours(value, step);
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);

  const isRight = pick === nearest;

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={lower}
          max={upper}
          step={upper - lower}
          labelEvery={1}
          height={150}
          format={formatFr}
          markers={[{ value, label: formatFr(value), color: '#7c3aed' }]}
          ariaLabel={`${formatFr(value)} entre ${formatFr(lower)} et ${formatFr(upper)}`}
        />
      </div>

      <p className="text-sm text-center font-semibold text-slate-700">
        {label || `${formatFr(value)} est plus proche de quel nombre ami ?`}
      </p>

      <div className="flex gap-2 justify-center">
        {[lower, upper].map((candidate) => (
          <button
            key={candidate}
            type="button"
            disabled={solved}
            onClick={() => {
              setChecked(false);
              setPick(candidate);
            }}
            aria-pressed={pick === candidate}
            className={`px-6 py-3 rounded-xl border-2 font-mono font-extrabold text-lg tabular-nums min-h-[52px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              solved && candidate === nearest
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : pick === candidate
                ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
          >
            {formatFr(candidate)}
          </button>
        ))}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
            disabled={pick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="hint">
          Regarde la distance sur la droite : {formatFr(value)} est à {Math.abs(value - lower)} de{' '}
          {formatFr(lower)}, et à {Math.abs(upper - value)} de {formatFr(upper)}.
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          {formatFr(value)} → {formatFr(nearest)} : c'est le nombre ami le plus proche, facile à calculer
          mentalement.
        </Feedback>
      )}
    </div>
  );
}
