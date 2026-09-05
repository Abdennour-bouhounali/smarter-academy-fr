import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import Stepper from './Stepper';
import { multiplesBetween, lcm, gcd } from './arithUtils';

/**
 * RhythmLine — deux rythmes sur la même ligne du temps.
 *
 * Activity: régler deux périodes ; voir les deux séries de marques ; trouver
 *   le premier rendez-vous commun.
 * Mathematical objective: les rendez-vous communs sont les multiples
 *   communs ; le premier est le PPCM (et il n'est pas toujours le produit).
 * Student action: steppers a et b.
 * Controlled variable: a, b.
 * Mathematical state: a, b (module) ; marques, PPCM, PGCD DÉRIVÉS.
 * Visual consequence: deux séries de points sur la droite, le premier point
 *   commun mis en évidence ; la liste des rendez-vous.
 * Expected observation: pour 12 et 18 le premier rendez-vous est 36, pas
 *   216 ; pour 6 et 10, c'est 30, pas 60.
 */
export default function RhythmLine({ a, b, onA, onB, hi = 72, disabled = false, showAnswer = true }) {
  const ma = multiplesBetween(a, 1, hi); const mb = multiplesBetween(b, 1, hi);
  const l = lcm(a, b);
  const points = [];
  ma.forEach((v) => points.push({ id: `a${v}`, value: v, label: mb.includes(v) ? undefined : undefined, tone: 'indigo' }));
  mb.forEach((v) => { if (!ma.includes(v)) points.push({ id: `b${v}`, value: v, tone: 'amber' }); });
  if (showAnswer && l <= hi) points.push({ id: 'lcm', value: l, label: `${formatDec(l)} min`, tone: 'emerald' });
  return (
    <div className="space-y-3" role="group" aria-label="Deux rythmes">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Stepper label="bus A" value={a} onChange={onA} min={2} max={20} step={1} disabled={disabled} unit=" min" />
        <Stepper label="bus B" value={b} onChange={onB} min={2} max={20} step={1} tone="amber" disabled={disabled} unit=" min" />
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine min={0} max={hi} step={Math.max(1, Math.round(hi / 24))} labelEvery={4} points={points} ariaLabel={`Ligne du temps de 0 à ${hi} minutes, passages des deux bus`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-sm">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2"><span className="block text-[11px] font-bold uppercase text-indigo-600">bus A toutes les {a} min</span><span className="text-slate-800 break-words">{ma.slice(0, 10).join(' · ')}{ma.length > 10 ? ' …' : ''}</span></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"><span className="block text-[11px] font-bold uppercase text-amber-700">bus B toutes les {b} min</span><span className="text-slate-800 break-words">{mb.slice(0, 10).join(' · ')}{mb.length > 10 ? ' …' : ''}</span></div>
      </div>
      {showAnswer && (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 font-mono text-sm text-emerald-900" role="status">
          Premier rendez-vous : <strong>{formatDec(l)} min</strong>{l !== a * b && <> — et non {formatDec(a * b)} : {a} et {b} partagent le facteur {formatDec(gcd(a, b))}</>}. Les suivants : {multiplesBetween(l, l + 1, hi).map(formatDec).join(' · ') || '(au-delà du cadre)'}.
        </div>
      )}
    </div>
  );
}
