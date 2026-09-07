import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { curvePieces, imageOf, variationOn, formatDec } from './variationsUtils';

/**
 * TrailLab — l'interaction SIGNATURE : le randonneur.
 *
 * Activity               un randonneur (point sur la courbe) avance le long du
 *                        profil d'un sentier ; un altimètre lit h(x) ; sous ses
 *                        pas, l'axe des distances se peint : vert quand il monte,
 *                        rose quand il descend ; les sommets et vallées se
 *                        marquent quand il y passe.
 * Mathematical objective quand x augmente, f(x) monte ou descend — par
 *                        intervalles ; les points de retournement séparent les
 *                        intervalles ; le plus haut / plus bas atteint sont des
 *                        valeurs de f — parfois au bord.
 * Student action         glisser le randonneur (guide vertical), ± d'un cran, clavier.
 * Controlled variable    x, la distance parcourue.
 * Mathematical state     { x, visited: x[] } ; sens et altitude CALCULÉS.
 * Expected observation   « ça monte jusqu'à 3 km, ça descend jusqu'à 6, … » ;
 *                        « le point le plus bas est au départ, pas dans la vallée ».
 * Misconception targeted « le minimum est forcément dans un creux » ; « f croît
 *                        veut dire f positive ».
 *
 * Nombres dans le DOM ; la piste peinte est faite de rectangles sans texte.
 */
const COLOR = { croissante: '#059669', decroissante: '#e11d48', constante: '#64748b' };

export default function TrailLab({ f, range, unit, unitY, xStep = 0.5, yStep = 100, value, onChange, visited = [], paintAll = false, showTurns = 'found', disabled = false, frozen = false, axisLabels = { x: 'x', y: 'h' }, xUnit = ' km', yUnit = ' m', labelEvery = null, highlightIntervals = [] }) {
  const locked = disabled || frozen;
  const curves = curvePieces(f, range).map((pc, i) => ({ id: `${f.name}${i}`, points: pc, tone: '#4f46e5', width: 2.5 }));
  const y = imageOf(f, value);
  const dirHere = value + xStep <= f.domain[1] ? variationOn(f, value, value + xStep, 8) : (value - xStep >= f.domain[0] ? variationOn(f, value - xStep, value, 8) : null);
  const points = y !== null ? [{ id: 'hiker', x: value, y, color: COLOR[dirHere] ?? '#4f46e5' }] : [];
  const lo = f.domain[0]; const hi = f.domain[1];
  const cells = paintAll ? Array.from({ length: Math.round((hi - lo) / xStep) }, (_, i) => lo + i * xStep) : visited.filter((v) => v < hi);
  const turns = showTurns === 'all' || paintAll ? f.turns : showTurns === 'found' ? f.turns.filter((t) => visited.includes(t)) : [];
  const seenYs = visited.map((v) => imageOf(f, v)).filter((v) => v !== null);
  const hiSeen = seenYs.length ? Math.max(...seenYs) : null; const loSeen = seenYs.length ? Math.min(...seenYs) : null;
  const overlay = (toSvg) => (
    <g>
      {cells.map((cx) => {
        const d = variationOn(f, cx, Math.min(hi, cx + xStep), 8);
        if (!d) return null;
        const a = toSvg(cx, 0); const b = toSvg(Math.min(hi, cx + xStep), 0);
        return <rect key={`c${cx}`} x={a.x} y={a.y + 3} width={Math.max(0, b.x - a.x)} height={8} fill={COLOR[d]} opacity={0.6} rx={2} />;
      })}
      {turns.map((t) => { const p = toSvg(t, imageOf(f, t)); return <circle key={`t${t}`} cx={p.x} cy={p.y} r={7} fill="none" stroke="#d97706" strokeWidth={3} />; })}
    </g>
  );
  const bump = (d) => !locked && onChange?.(Math.max(lo, Math.min(hi, Math.round((value + d * xStep) / xStep) * xStep)));
  const btn = 'w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="space-y-3">
      <CoordPlane range={range} unit={unit} unitY={unitY} xStep={xStep >= 1 ? xStep : 1} yStep={yStep} labelEvery={labelEvery} curves={curves} points={points} overlay={overlay}
        readGuides={locked ? null : { mode: 'x', value, onChange }} highlightIntervals={highlightIntervals} frozen={frozen} disabled={locked} axisLabels={axisLabels} caption={false}
        ariaLabel={`Profil du sentier : randonneur à ${formatDec(value)}${xUnit}, altitude ${y === null ? 'inconnue' : `${formatDec(y)}${yUnit}`}`} />
      {!locked && (
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer le randonneur">
          <button type="button" className={btn} onClick={() => bump(-1)} disabled={value <= lo} aria-label="Reculer le randonneur">−</button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">{axisLabels.x} = {formatDec(value)}{xUnit}</span>
          <button type="button" className={btn} onClick={() => bump(1)} disabled={value >= hi} aria-label="Avancer le randonneur">+</button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">altimètre : {y === null ? '—' : `${formatDec(y)}${yUnit}`}</span>
        <span className="px-3 py-2 rounded-xl border" data-direction={dirHere ?? 'none'} style={{ backgroundColor: dirHere === 'croissante' ? '#ecfdf5' : dirHere === 'decroissante' ? '#fff1f2' : '#f8fafc', borderColor: COLOR[dirHere] ?? '#e2e8f0', color: dirHere === 'croissante' ? '#065f46' : dirHere === 'decroissante' ? '#9f1239' : '#334155' }}>
          {dirHere === 'croissante' ? '↗ ça monte' : dirHere === 'decroissante' ? '↘ ça descend' : dirHere === 'constante' ? '→ à plat' : '—'}
        </span>
        <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">plus haut : {hiSeen === null ? '—' : `${formatDec(hiSeen)}${yUnit}`} · plus bas : {loSeen === null ? '—' : `${formatDec(loSeen)}${yUnit}`}</span>
      </div>
    </div>
  );
}
