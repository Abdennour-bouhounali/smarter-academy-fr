import React from 'react';
import LineScene from './LineScene';
import Stepper from './Stepper';
import { pointAt, formatPoint, formatVec, RANGE } from './lineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * LineWalker — marcher sur la droite (module 2).
 *
 * Activity: depuis A, avancer de t pas de u ; le point M = A + t·u apparaît,
 *   avec ses deux marches (t·u_x à l'horizontale, t·u_y à la verticale).
 * Student action: stepper t (−4…4), aussi au clavier.
 * Controlled variable: t.
 * Mathematical state: { A, u, t } ; les t déjà visités laissent une trace.
 * Visual consequence: M glisse SUR la droite, jamais à côté ; l'escalier
 *   montre la même montée pour la même avancée.
 * Expected observation (aha): chaque pas ajoute u_x à x et u_y à y ; le
 *   rapport « montée / avancée » ne change jamais — c'est la pente.
 * Misconception targeted: pente = avancée / montée ; « un point de la droite
 *   est n'importe où ».
 */
const sgn = (v) => `${v < 0 ? '−' : '+'}${formatDec(Math.abs(v))}`;

export default function LineWalker({ line, t, onT, visited = [], min = -4, max = 4, disabled = false, showStairs = true, ariaLabel }) {
  const { A, u } = line;
  const M = pointAt(A, u, t);
  const corner = { x: M.x, y: A.y };
  const isA = t === 0;
  const isTip = t === 1;
  const trail = visited.filter((v) => v !== t && v !== 0 && v !== 1).map((v) => ({ id: `t${v}`, ...pointAt(A, u, v), color: '#94a3b8' }));
  const points = [...trail, ...(!isA && !isTip ? [{ id: 'M', name: 'M', ...M, color: '#0284c7' }] : [])];
  const segments = showStairs && t !== 0 ? [
    { id: 'sx', from: A, to: corner, color: '#059669', width: 2.5, dashed: true },
    { id: 'sy', from: corner, to: M, color: '#e11d48', width: 2.5, dashed: true },
  ] : [];
  const labels = showStairs && t !== 0 ? [
    ...(u.x !== 0 ? [{ id: 'dx', text: sgn(t * u.x), kind: 'arrow', from: A, to: corner, size: 12, color: '#047857' }] : []),
    ...(u.y !== 0 ? [{ id: 'dy', text: sgn(t * u.y), kind: 'arrow', from: corner, to: M, size: 12, color: '#be123c' }] : []),
  ] : [];
  return (
    <div className="space-y-3">
      <LineScene line={line} showArrow points={points} segments={segments} labels={labels} ariaLabel={ariaLabel ?? `Droite passant par A ${formatPoint(A)} de direction u ${formatVec(u)} ; M en ${formatPoint(M)}`} />
      <Stepper label="t" value={t} onChange={onT} min={min} max={max} step={1} tone="indigo" disabled={disabled} />
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-mono font-bold tabular-nums text-sky-900" aria-live="polite">
        M = A + {formatDec(t)}·u = ({formatDec(A.x)} {sgn(t * u.x)} ; {formatDec(A.y)} {sgn(t * u.y)}) = {formatPoint(M)}
        {isA && <span className="block text-xs font-sans font-semibold text-sky-700">t = 0 : M est en A.</span>}
        {isTip && <span className="block text-xs font-sans font-semibold text-sky-700">t = 1 : M est à la pointe de la flèche.</span>}
      </div>
    </div>
  );
}
