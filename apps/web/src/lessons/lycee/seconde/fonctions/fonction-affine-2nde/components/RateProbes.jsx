import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { formatDec, rateBetween } from './affineUtils';

/**
 * RateProbes — deux instants sur une courbe (affine ou non), et le quotient
 * (y₂ − y₁)/(x₂ − x₁) calculé en direct.
 *
 * Mathematical objective pour une fonction affine, ce quotient ne dépend
 *                        pas des deux instants : c'est a. Pour une autre
 *                        fonction, il change.
 * Student action         déplacer x₁ et x₂ (boutons ±), lire le taux.
 * Nombres dans le DOM ; l'escalier entre les deux points est dessiné en segments.
 */
function Probe({ label, value, onChange, min, max, step, color, disabled }) {
  const clamp = (v) => Math.max(min, Math.min(max, Math.round(v / step) * step));
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))} aria-label={`Diminuer ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
      <span className="px-3 py-1.5 rounded-lg text-white font-mono font-bold tabular-nums" style={{ backgroundColor: color }}>{formatDec(value)}</span>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))} aria-label={`Augmenter ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
    </div>
  );
}
export default function RateProbes({ fn, range, unit = 30, unitY = null, xStep = 1, yStep = 1, x1, x2, onChange, step = 1, disabled = false, name = 'f', variable = 'x', affineLine = null, extraCurves = [] }) {
  const y1 = fn(x1); const y2 = fn(x2);
  const r = rateBetween({ x: x1, y: y1 }, { x: x2, y: y2 });
  const curves = [...(affineLine ? [] : [{ id: 'c', points: Array.from({ length: 121 }, (_, i) => { const x = range.xMin + (range.xMax - range.xMin) * i / 120; return { x, y: fn(x) }; }).filter((p) => p.y >= range.yMin && p.y <= range.yMax), tone: 'indigo', width: 2.5 }]), ...extraCurves];
  const segs = x1 !== x2 ? [
    { id: 'run', from: { x: x1, y: y1 }, to: { x: x2, y: y1 }, color: '#059669', dashed: true, width: 2 },
    { id: 'rise', from: { x: x2, y: y1 }, to: { x: x2, y: y2 }, color: '#e11d48', dashed: true, width: 2 },
  ] : [];
  return (
    <div className="space-y-3">
      <CoordPlane range={range} unit={unit} unitY={unitY} xStep={xStep} yStep={yStep} functions={affineLine ? [{ id: 'f', a: affineLine.a, b: affineLine.b, tone: 'sky' }] : []} curves={curves}
        points={[{ id: 'p1', x: x1, y: y1, color: '#0284c7' }, { id: 'p2', x: x2, y: y2, color: '#d97706' }]} segments={segs} caption={false}
        axisLabels={{ x: variable, y: name }} ariaLabel={`Deux instants : ${variable}₁ = ${formatDec(x1)}, ${variable}₂ = ${formatDec(x2)}`} />
      {!disabled && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Probe label={`${variable}₁`} value={x1} onChange={(v) => onChange({ x1: v, x2 })} min={range.xMin} max={range.xMax} step={step} color="#0284c7" disabled={disabled} />
          <Probe label={`${variable}₂`} value={x2} onChange={(v) => onChange({ x1, x2: v })} min={range.xMin} max={range.xMax} step={step} color="#d97706" disabled={disabled} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">{name}({formatDec(x1)}) = {formatDec(y1)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">{name}({formatDec(x2)}) = {formatDec(y2)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white" data-rate={r ?? 'none'}>
          {r === null ? `${variable}₁ = ${variable}₂ : pas de taux` : `(${formatDec(y2)} − ${formatDec(y1)}) ÷ (${formatDec(x2)} − ${formatDec(x1)}) = ${formatDec(r)}`}
        </span>
      </div>
    </div>
  );
}
