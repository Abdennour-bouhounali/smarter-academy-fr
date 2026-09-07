import React from 'react';
import { formatDec, roundTo } from '@smarter-academy/core';

/** Stepper −/+ (chemin tactile et clavier des curseurs de la leçon). */
export default function Stepper({ label, value, onChange, min, max, step = 1, tone = 'indigo', disabled = false, unit = '' }) {
  const TONE = { indigo: 'bg-indigo-600', amber: 'bg-amber-600', emerald: 'bg-emerald-600', rose: 'bg-rose-600' };
  const clamp = (v) => Math.max(min, Math.min(max, roundTo(v)));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))} aria-label={`Diminuer ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
      <span className={`px-3 py-1.5 rounded-lg text-white font-mono font-bold tabular-nums ${TONE[tone] ?? TONE.indigo}`}>{formatDec(value)}{unit}</span>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))} aria-label={`Augmenter ${label}`} className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
    </div>
  );
}
