import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import Stepper from './Stepper';
import { evalLin, formatLin, evalProduct, productZeros, fracValue, evalQuotient, forbiddenValues } from './eqUtils';

/**
 * ProductScanner — un curseur x, chaque facteur dans sa barre, et le
 * produit (ou le quotient) dans la sienne.
 *
 * Activity: balayer x ; voir le produit tomber à 0 exactement quand un
 *   facteur s'annule ; en mode quotient, voir le trou à la valeur interdite.
 * Mathematical objective: A × B = 0 ⇔ A = 0 ou B = 0 ; A/B = 0 ⇔ A = 0 et
 *   B ≠ 0.
 * Student action: curseur / stepper.
 * Controlled variable: x.
 * Mathematical state: x (module) ; tout dérivé.
 * Visual consequence: barres signées (à gauche de l'axe si négatif) ; le
 *   produit passe vert à 0 ; en quotient, « interdit » à la valeur qui
 *   annule le dénominateur.
 */
export default function ProductScanner({ factors, mode = 'product', x, onX, min = -5, max = 5, step = 1, snap = 0.5, showRoots = false, disabled = false }) {
  const values = factors.map((f) => evalLin(f, x));
  const result = mode === 'product' ? evalProduct(factors, x) : evalQuotient(factors[0], factors[1], x);
  const roots = mode === 'product' ? productZeros(factors) : productZeros([factors[0]]);
  const forb = mode === 'quotient' ? forbiddenValues(factors[1]) : [];
  const allVals = [];
  for (let v = min; v <= max; v += snap) { factors.forEach((f) => allVals.push(Math.abs(evalLin(f, v)))); if (mode === 'product') allVals.push(Math.abs(evalProduct(factors, v))); }
  const scaleF = Math.max(1, ...allVals);
  const pct = (v) => `${Math.min(50, (Math.abs(v) / scaleF) * 50)}%`;

  const Bar = ({ label, value, tone, big = false }) => (
    <div className={`grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-2 font-mono ${big ? 'text-base' : 'text-sm'}`}>
      <span className="font-bold text-slate-700 truncate">{label}</span>
      <div className="relative h-6 rounded-lg bg-slate-100 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400" />
        {value !== null && value !== 0 && (
          <div className={`absolute inset-y-0 ${tone}`} style={value > 0 ? { left: '50%', width: pct(value) } : { right: '50%', width: pct(value) }} />
        )}
      </div>
      <span className={`text-right font-extrabold tabular-nums ${value === 0 ? 'text-emerald-700' : value === null ? 'text-rose-700' : 'text-slate-800'}`}>{value === null ? 'interdit' : formatDec(value, { maxDecimals: 2 })}</span>
    </div>
  );

  const points = [];
  if (showRoots) roots.forEach((r, i) => { const v = fracValue(r); if (v >= min && v <= max) points.push({ id: `r${i}`, value: v, label: `x = ${formatDec(v)}`, tone: 'emerald' }); });
  forb.forEach((r, i) => { const v = fracValue(r); if (v >= min && v <= max) points.push({ id: `f${i}`, value: v, label: 'interdit', tone: 'rose', open: true }); });

  return (
    <div className="space-y-3" role="group" aria-label={mode === 'product' ? 'Scanner de produit' : 'Scanner de quotient'}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
        {factors.map((f, i) => <Bar key={i} label={`${mode === 'quotient' ? (i === 0 ? 'num.' : 'dén.') : `facteur ${i + 1}`} : ${formatLin(f)}`} value={values[i]} tone={values[i] === 0 ? 'bg-emerald-500' : i === 0 ? 'bg-indigo-400' : 'bg-amber-400'} />)}
        <div className="border-t border-slate-200 pt-2">
          <Bar label={mode === 'product' ? 'produit' : 'quotient'} value={result} tone={result === 0 ? 'bg-emerald-600' : 'bg-slate-600'} big />
        </div>
        <div className={`inline-block px-3 py-1.5 rounded-lg font-mono font-extrabold ${result === 0 ? 'bg-emerald-600 text-white' : result === null ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`} role="status" aria-live="polite">
          x = {formatDec(x)} : {result === null ? 'division par 0 — valeur interdite' : result === 0 ? `${mode === 'product' ? 'produit' : 'quotient'} nul !` : `${mode === 'product' ? 'produit' : 'quotient'} = ${formatDec(result, { maxDecimals: 2 })}`}
        </div>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine min={min} max={max} step={step} snap={snap} points={points}
          handles={disabled ? [] : [{ id: 'x', value: x, onChange: onX, label: `x = ${formatDec(x)}`, tone: result === 0 ? 'emerald' : result === null ? 'rose' : 'indigo', ariaLabel: 'Curseur x' }]}
          disabled={disabled} ariaLabel={`Axe des x de ${formatDec(min)} à ${formatDec(max)}, curseur en ${formatDec(x)}`} />
      </div>
      {!disabled && <Stepper label="x" value={x} onChange={onX} min={min} max={max} step={snap} />}
    </div>
  );
}
