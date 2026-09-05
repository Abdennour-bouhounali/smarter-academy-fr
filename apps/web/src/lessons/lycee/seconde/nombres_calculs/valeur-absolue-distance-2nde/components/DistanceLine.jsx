import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { distance } from './absUtils';

/**
 * DistanceLine — un point mobile x, un repère a (0 par défaut), la barre de
 * distance entre eux (manipulation signature, module 1 ; réutilisée en M3
 * avec deux points mobiles).
 *
 * Activity: déplacer le bateau x le long de la côte et lire sa distance au
 *   phare (a = 0), ou l'écart entre deux bateaux (a mobile).
 * Mathematical objective: la distance est une LONGUEUR, jamais négative ;
 *   x et −x sont à la même distance de 0 ; |b − a| = |a − b| ; une
 *   translation des deux points ne change pas leur écart.
 * Student action: glisser/clavier sur x (et a) ; le module ajoute des
 *   boutons ±.
 * Controlled variable: x (et a).
 * Mathematical state: x, a (module) ; distance dérivée.
 * Visual consequence: la barre (bande d'intervalle) s'étire entre a et x,
 *   sa longueur s'écrit au-dessus ; un jumeau fantôme (−x) apparaît si
 *   `showTwin`.
 * Expected observation: à −5 comme à 5 la barre mesure 5 ; la longueur ne
 *   dépend pas du sens.
 * Misconception targeted: « une distance peut être négative », « −5 est
 *   plus loin que 5 ».
 */
export default function DistanceLine({
  x, onX, a = 0, onA, min = -10, max = 10, step = 1, snap = 0.5,
  showTwin = false, unit = '', labelX = 'x', labelA = null, disabled = false, ariaLabel = 'Côte graduée',
}) {
  const d = distance(a, x);
  const lo = Math.min(a, x);
  const hi = Math.max(a, x);
  const handles = [];
  if (!disabled && onX) handles.push({ id: 'x', value: x, onChange: onX, label: `${labelX} = ${formatDec(x)}`, tone: 'indigo', ariaLabel: `Position de ${labelX}` });
  if (!disabled && onA) handles.push({ id: 'a', value: a, onChange: onA, label: `${labelA ?? 'a'} = ${formatDec(a)}`, tone: 'amber', ariaLabel: `Position de ${labelA ?? 'a'}` });
  const points = [];
  if (!onA) points.push({ id: 'a', value: a, label: labelA ?? (a === 0 ? 'phare' : formatDec(a)), tone: 'amber' });
  if (showTwin && x !== 0) points.push({ id: 'twin', value: -x, label: `${formatDec(-x)}`, tone: 'slate', open: true });
  if (disabled) {
    points.push({ id: 'xs', value: x, label: `${labelX} = ${formatDec(x)}`, tone: 'indigo' });
    if (onA) points.push({ id: 'as', value: a, label: `${labelA ?? 'a'} = ${formatDec(a)}`, tone: 'amber' });
  }
  return (
    <div className="space-y-2" role="group" aria-label={ariaLabel}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine
          min={min} max={max} step={step} snap={snap}
          intervals={d > 0 ? [{ id: 'd', from: lo, to: hi, tone: 'emerald', label: `distance ${formatDec(d)}${unit ? ` ${unit}` : ''}` }] : []}
          points={points}
          handles={handles}
          disabled={disabled}
          ariaLabel={`${ariaLabel} : ${labelX} en ${formatDec(x)}, distance ${formatDec(d)}`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold">{labelX} = {formatDec(x)}{unit && ` ${unit}`}</span>
        {onA && <span className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold">{labelA ?? 'a'} = {formatDec(a)}{unit && ` ${unit}`}</span>}
        <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold" role="status">distance : {formatDec(d)}{unit && ` ${unit}`}</span>
      </div>
    </div>
  );
}
