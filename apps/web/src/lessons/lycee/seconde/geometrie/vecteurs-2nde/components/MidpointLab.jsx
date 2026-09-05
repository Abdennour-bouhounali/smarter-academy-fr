import React from 'react';
import VectorScene, { SCENE_COLORS, VecName } from './VectorScene';
import Stepper from './Stepper';
import { RANGE, vec, equal, formatVec, formatNum, midpoint, inRange } from './vecteurUtils';

/**
 * MidpointLab — placer I pour que AI = IB.
 *
 * ACTION            l'élève déplace I (glisser au demi-carreau, steppers).
 * CHANGEMENT        deux flèches AI et IB se redessinent, leurs coordonnées
 *                   aussi.
 * OBSERVATION       elles ne sont égales qu'en un seul point ; ses
 *                   coordonnées sont la moyenne de celles de A et de B.
 * SENS MATHÉMATIQUE I milieu de [AB] ⟺ AI = IB ⟺ xI = (xA + xB)/2, idem en y.
 */
export default function MidpointLab({ A, B, I, onI, range = RANGE, disabled = false, ariaLabel }) {
  const AI = vec(A, I);
  const IB = vec(I, B);
  const ok = equal(AI, IB);
  const M = midpoint(A, B);
  const setI = (p) => { if (!disabled && inRange(p, range)) onI?.(p); };

  return (
    <div className="space-y-3">
      <VectorScene
        range={range}
        step={0.5}
        points={[
          { id: 'A', name: 'A', x: A.x, y: A.y, color: '#4f46e5' },
          { id: 'B', name: 'B', x: B.x, y: B.y, color: '#059669' },
          { id: 'I', name: 'I', x: I.x, y: I.y, color: ok ? '#d97706' : '#e11d48' },
        ]}
        arrows={[
          { id: 'ai', from: A, to: I, color: SCENE_COLORS.main, name: 'AI' },
          { id: 'ib', from: I, to: B, color: ok ? SCENE_COLORS.main : SCENE_COLORS.second, name: 'IB' },
        ]}
        draggableId={disabled ? null : 'I'}
        onPointChange={setI}
        disabled={disabled}
        ariaLabel={ariaLabel ?? `Repère — I en ${formatVec(I)}`}
      />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stepper label="I — x" value={I.x} onChange={(x) => setI({ ...I, x })} min={range.xMin} max={range.xMax} step={0.5} tone="amber" disabled={disabled} />
        <Stepper label="I — y" value={I.y} onChange={(y) => setI({ ...I, y })} min={range.yMin} max={range.yMax} step={0.5} tone="amber" disabled={disabled} />
      </div>
      <p className="text-sm flex flex-wrap items-center gap-2" aria-live="polite">
        <span className="px-3 py-1 rounded-lg bg-violet-100 text-violet-900 font-mono font-bold tabular-nums"><VecName>AI</VecName> {formatVec(AI)}</span>
        <span className={`px-3 py-1 rounded-lg font-mono font-bold tabular-nums ${ok ? 'bg-violet-100 text-violet-900' : 'bg-emerald-100 text-emerald-900'}`}><VecName>IB</VecName> {formatVec(IB)}</span>
        <span className="text-slate-600">{ok ? 'égaux : I est le milieu' : `écart (${formatNum(IB.x - AI.x)} ; ${formatNum(IB.y - AI.y)})`}</span>
      </p>
      {ok && (
        <p className="text-sm text-slate-700">
          I ({formatNum(M.x)} ; {formatNum(M.y)}) : ({formatNum(A.x)} + {formatNum(B.x)}) ÷ 2 = {formatNum(M.x)} et ({formatNum(A.y)} + {formatNum(B.y)}) ÷ 2 = {formatNum(M.y)}.
        </p>
      )}
    </div>
  );
}
