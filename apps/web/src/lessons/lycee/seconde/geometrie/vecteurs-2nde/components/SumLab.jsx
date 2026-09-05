import React from 'react';
import VectorScene, { SCENE_COLORS, VecName } from './VectorScene';
import Stepper from './Stepper';
import { RANGE, add, inRange, formatNum, formatVec } from './vecteurUtils';

/**
 * SumLab — deux flèches bout à bout.
 *
 * ACTION            l'élève règle le SECOND déplacement v (steppers, ou glisser
 *                   son extrémité) ; u est figé.
 * CHANGEMENT        v part de l'extrémité de u ; la flèche « trajet direct »
 *                   (origine de u → extrémité de v) se redessine.
 * OBSERVATION       le trajet direct est la somme : ses coordonnées sont
 *                   3 + (−1) et 1 + 3. Si v = −u, le trajet direct est nul.
 * SENS MATHÉMATIQUE u + v est le déplacement « u puis v » ; coordonnées
 *                   ajoutées terme à terme ; relation de Chasles.
 *
 * `showSum` retarde l'apparition de la flèche somme (prédiction d'abord) ;
 * `parallelogram` dessine aussi « v puis u » en fantôme (commutativité).
 */
export default function SumLab({
  origin,
  u,
  v,
  onV,
  range = RANGE,
  names = { u: 'u', v: 'v', sum: 'u + v', origin: 'A', mid: 'B', end: 'C' },
  showSum = true,
  parallelogram = false,
  showTable = true,
  disabled = false,
  ariaLabel,
}) {
  const P = add(origin, u);
  const Q = add(P, v);
  const sum = add(u, v);

  const bounds = (axis) => {
    const lo = axis === 'x' ? range.xMin : range.yMin;
    const hi = axis === 'x' ? range.xMax : range.yMax;
    return { min: lo - P[axis], max: hi - P[axis] };
  };
  const setV = (next) => {
    if (disabled || !inRange(add(P, next), range)) return;
    onV?.(next);
  };

  const points = [
    { id: 'A', name: names.origin, x: origin.x, y: origin.y, color: '#4f46e5' },
    { id: 'B', name: names.mid, x: P.x, y: P.y, color: '#7c3aed' },
    { id: 'C', name: names.end, x: Q.x, y: Q.y, color: '#059669' },
  ];
  const arrows = [
    { id: 'u', from: origin, to: P, color: SCENE_COLORS.main, name: names.u },
    { id: 'v', from: P, to: Q, color: SCENE_COLORS.second, name: names.v },
    ...(parallelogram ? [
      { id: 'v2', from: origin, to: add(origin, v), ghost: true, name: names.v },
      { id: 'u2', from: add(origin, v), to: Q, ghost: true, name: names.u },
    ] : []),
    ...(showSum ? [{ id: 'sum', from: origin, to: Q, color: SCENE_COLORS.sum, name: names.sum, width: 3.5 }] : []),
  ];

  const bx = bounds('x');
  const by = bounds('y');

  return (
    <div className="space-y-3">
      <VectorScene
        range={range}
        points={points}
        arrows={arrows}
        draggableId={disabled ? null : 'C'}
        onPointChange={(p) => setV({ x: p.x - P.x, y: p.y - P.y })}
        disabled={disabled}
        ariaLabel={ariaLabel ?? `Repère — ${names.u} puis ${names.v}`}
      />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Stepper label={`${names.v} — horizontal`} value={v.x} onChange={(x) => setV({ ...v, x })} min={bx.min} max={bx.max} tone="emerald" disabled={disabled} />
        <Stepper label={`${names.v} — vertical`} value={v.y} onChange={(y) => setV({ ...v, y })} min={by.min} max={by.max} tone="emerald" disabled={disabled} />
      </div>
      {showTable && (
        <div className="overflow-x-auto">
          <table className="text-sm font-mono tabular-nums border-separate border-spacing-y-1" aria-live="polite">
            <tbody>
              <tr><td className="pr-3 font-bold text-violet-800"><VecName>{names.u}</VecName></td><td className="px-3 py-1 rounded-lg bg-violet-100 text-violet-900 font-bold">{formatVec(u)}</td></tr>
              <tr><td className="pr-3 font-bold text-emerald-800"><VecName>{names.v}</VecName></td><td className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold">{formatVec(v)}</td></tr>
              {showSum && (
                <tr>
                  <td className="pr-3 font-bold text-amber-800"><VecName>{names.u}</VecName> + <VecName>{names.v}</VecName></td>
                  <td className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold">
                    ({formatNum(u.x)} + ({formatNum(v.x)}) ; {formatNum(u.y)} + ({formatNum(v.y)})) = {formatVec(sum)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
