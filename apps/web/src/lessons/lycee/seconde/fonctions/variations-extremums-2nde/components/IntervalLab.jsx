import React from 'react';
import TrailLab from './TrailLab';
import { maxOn, minOn, formatDec } from './variationsUtils';

/**
 * IntervalLab — un extremum SUR UN INTERVALLE.
 *
 * Activity               deux bornes a < b (boutons ±) délimitent une bande
 *                        sur le profil ; le maximum et le minimum de f sur
 *                        [a ; b] sont calculés et affichés, avec l'endroit
 *                        où ils sont atteints.
 * Expected observation   « le maximum sur [5 ; 10] n'est pas celui sur
 *                        [0 ; 10] » ; « un minimum peut être au bord ».
 */
function Bound({ label, value, onChange, min, max, step, color, disabled }) {
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
export default function IntervalLab({ f, range, unit, unitY, a, b, onChange, step = 0.5, disabled = false, xUnit = '', yUnit = '' }) {
  const mx = maxOn(f, a, b); const mn = minOn(f, a, b);
  return (
    <div className="space-y-3">
      <TrailLab f={f} range={range} unit={unit} unitY={unitY} xStep={step} value={a} paintAll showTurns="all" frozen xUnit={xUnit} yUnit={yUnit} highlightIntervals={[{ from: a, to: b, tone: 'amber' }]} />
      {!disabled && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Bound label="a" value={a} onChange={(v) => onChange({ a: Math.min(v, b - step), b })} min={f.domain[0]} max={f.domain[1] - step} step={step} color="#0284c7" disabled={disabled} />
          <Bound label="b" value={b} onChange={(v) => onChange({ a, b: Math.max(v, a + step) })} min={f.domain[0] + step} max={f.domain[1]} step={step} color="#d97706" disabled={disabled} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite" data-interval={`${a};${b}`}>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">sur [{formatDec(a)} ; {formatDec(b)}]</span>
        {mx && <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900" data-max={mx.value}>maximum {formatDec(mx.value)}{yUnit}, atteint en {mx.at.map((x) => `${formatDec(x)}${xUnit}`).join(' et ')}</span>}
        {mn && <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900" data-min={mn.value}>minimum {formatDec(mn.value)}{yUnit}, atteint en {mn.at.map((x) => `${formatDec(x)}${xUnit}`).join(' et ')}</span>}
      </div>
    </div>
  );
}
