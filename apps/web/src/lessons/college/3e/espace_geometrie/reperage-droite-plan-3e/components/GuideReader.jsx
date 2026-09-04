import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { formatNumber } from './reperageUtils';

/**
 * GuideReader — lire les coordonnées d'un point EN LES CONSTRUISANT.
 *
 * L'élève ne « devine » pas un couple : il amène deux guides, l'un vertical
 * l'autre horizontal, jusqu'à ce qu'ils se croisent sur le point. La lecture
 * est alors la position des deux guides sur les axes — c'est le geste qu'on
 * fait avec une règle sur une carte.
 *
 * Les guides sont commandés par des réglages (− / +) : la précision demandée
 * est mathématique, jamais manuelle.
 */
export default function GuideReader({
  point,
  guide,
  onGuideChange,
  range,
  locked = false,
  ariaLabel,
}) {
  const hit = guide.x === point.x && guide.y === point.y;

  const bump = (axis, delta) => {
    if (locked) return;
    const next = { ...guide, [axis]: guide[axis] + delta };
    const min = axis === 'x' ? range.xMin : range.yMin;
    const max = axis === 'x' ? range.xMax : range.yMax;
    next[axis] = Math.max(min, Math.min(max, next[axis]));
    onGuideChange(next);
  };

  const overlay = (toSvg) => {
    const gx = toSvg(guide.x, range.yMin);
    const gx2 = toSvg(guide.x, range.yMax);
    const gy = toSvg(range.xMin, guide.y);
    const gy2 = toSvg(range.xMax, guide.y);
    const cross = toSvg(guide.x, guide.y);
    return (
      <g>
        <line x1={gx.x} y1={gx.y} x2={gx2.x} y2={gx2.y}
          stroke="#0284c7" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
        <line x1={gy.x} y1={gy.y} x2={gy2.x} y2={gy2.y}
          stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />
        <circle cx={cross.x} cy={cross.y} r={hit ? 12 : 7}
          fill="none" stroke={hit ? '#16a34a' : '#94a3b8'} strokeWidth="3" />
      </g>
    );
  };

  const Ctrl = ({ axis, label, color }) => (
    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
      <span className={`text-xs font-semibold ${color} w-24`}>{label}</span>
      <button type="button" onClick={() => bump(axis, -1)} disabled={locked}
        aria-label={`Déplacer le guide ${label} vers la gauche ou le bas`}
        className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
      <span className="w-10 text-center font-mono font-bold tabular-nums">{formatNumber(guide[axis])}</span>
      <button type="button" onClick={() => bump(axis, 1)} disabled={locked}
        aria-label={`Déplacer le guide ${label} vers la droite ou le haut`}
        className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
    </div>
  );

  return (
    <div className="space-y-3">
      <CoordPlane
        range={range}
        points={[{ id: 'P', name: point.name ?? 'P', x: point.x, y: point.y, color: '#e11d48' }]}
        overlay={overlay}
        caption={false}
        ariaLabel={ariaLabel ?? 'Repère : amène les deux guides sur le point'}
      />
      <div className="flex gap-3 flex-wrap">
        <Ctrl axis="x" label="Guide vertical" color="text-sky-700" />
        <Ctrl axis="y" label="Guide horizontal" color="text-emerald-700" />
      </div>
    </div>
  );
}
