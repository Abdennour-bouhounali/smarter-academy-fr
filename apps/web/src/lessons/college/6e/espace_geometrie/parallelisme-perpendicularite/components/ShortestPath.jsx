import React, { useRef, useCallback, useState } from 'react';
import { clipToBox } from '../../../../../common/utils/geometry2d';
import { dirOf, footOf, distanceTo, pointOn, toLine } from './relationsUtils';
import { paramOf, projectOnLine, dist } from '../../../../../common/utils/geometry2d';

/**
 * ShortestPath — choisir un point d'arrivée sur la route, et voir la longueur.
 *
 * ACTION          l'élève fait glisser le point d'arrivée H le long de la
 *                 route et « garde » sa meilleure tentative.
 * TRANSFORMATION  la longueur du trajet M→H s'affiche ; le record est suivi.
 * SENS MATH.      parmi tous les trajets d'un point à une droite, le plus
 *                 court est celui qui arrive PERPENDICULAIREMENT.
 * FEEDBACK        quand H atteint le pied de la perpendiculaire, le carré
 *                 d'angle droit apparaît — la conclusion se dessine seule.
 * GÉNÉRALISATION  « distance d'un point à une droite » = cette longueur-là,
 *                 pas n'importe laquelle.
 */
export default function ShortestPath({
  line,
  from,
  t,
  onTChange,
  best,
  onKeep,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 },
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [settled, setSettled] = useState(true);

  const H = pointOn(line, t);
  const len = dist(from, H);
  const foot = footOf(line, from);
  const minLen = distanceTo(line, from);
  const isPerp = Math.abs(len - minLen) < 1.5;

  const tFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin);
      const y = box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin);
      const l = toLine(line);
      return paramOf(l, projectOnLine(l, { x, y }));
    },
    [box.xMin, box.yMin, box.xMax, box.yMax, line]
  );

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true; setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    const nt = tFromClient(e.clientX, e.clientY);
    if (nt !== null) onTChange(nt);
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    const nt = tFromClient(e.clientX, e.clientY);
    if (nt !== null) onTChange(nt);
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false; setSettled(true);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const onKeyDown = (e) => {
    const map = { ArrowRight: 10, ArrowLeft: -10, ArrowUp: 10, ArrowDown: -10 };
    if (!(e.key in map)) return;
    e.preventDefault(); setSettled(true);
    onTChange(t + map[e.key]);
  };

  const dir = dirOf(line.angleDeg);
  const seg = clipToBox(
    { kind: 'droite', a: line.p, b: { x: line.p.x + dir.x * 50, y: line.p.y + dir.y * 50 } },
    box
  );
  const n = { x: -dir.y, y: dir.x };
  const s = 12;

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Choisis le point d’arrivée sur la route'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          {seg && (
            <line
              x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
              stroke="#475569" strokeWidth="7" strokeLinecap="round"
            />
          )}
          {seg && (
            <line
              x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
              stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 8"
            />
          )}

          {/* Le trajet choisi */}
          <line
            x1={from.x} y1={from.y} x2={H.x} y2={H.y}
            stroke={isPerp ? '#059669' : '#f59e0b'} strokeWidth="3" strokeLinecap="round"
          />

          {/* La marque d'angle droit n'apparaît QUE si le trajet est perpendiculaire */}
          {isPerp && (
            <path
              d={`M ${foot.x + dir.x * s} ${foot.y + dir.y * s}
                  L ${foot.x + dir.x * s - n.x * s} ${foot.y + dir.y * s - n.y * s}
                  L ${foot.x - n.x * s} ${foot.y - n.y * s}`}
              fill="none" stroke="#059669" strokeWidth="2.5"
            />
          )}

          <circle cx={from.x} cy={from.y} r="6" fill="#e11d48" stroke="#fff" strokeWidth="2" />
          <text x={from.x + 10} y={from.y - 8} className="font-space" fontSize="13" fontWeight="700" fill="#0f172a">M</text>
          <circle cx={H.x} cy={H.y} r="6.5" fill={isPerp ? '#059669' : '#f59e0b'} stroke="#fff" strokeWidth="2.5" />
          <text x={H.x + 10} y={H.y + 18} className="font-space" fontSize="13" fontWeight="700" fill="#0f172a">H</text>
        </g>

        <circle
          cx={H.x} cy={H.y} r="22" fill="transparent"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Point d’arrivée sur la route"
          aria-valuenow={Math.round(len)}
          aria-valuemin={Math.round(minLen)}
          aria-valuemax={999}
          aria-valuetext={`trajet de ${Math.round(len)}${isPerp ? ', perpendiculaire à la route' : ''}`}
          onKeyDown={onKeyDown}
          style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
        />
      </svg>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <div className={`rounded-xl border-2 px-4 py-2 text-center ${isPerp ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
          <div className="text-[10px] font-mono uppercase tracking-wide opacity-70">Ton trajet</div>
          <div className="font-mono font-extrabold text-lg tabular-nums" aria-live="polite">
            {settled ? Math.round(len) : '…'}
          </div>
        </div>
        {best != null && (
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">Ton record</div>
            <div className="font-mono font-extrabold text-lg text-slate-700 tabular-nums">{Math.round(best)}</div>
          </div>
        )}
        {onKeep && (
          <button
            type="button" onClick={() => onKeep(len)} disabled={disabled}
            className="min-h-[44px] px-4 rounded-xl border-2 border-cyan-600 bg-cyan-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Garder ce trajet
          </button>
        )}
      </div>

      <p className={`text-center text-sm font-semibold ${isPerp ? 'text-emerald-700' : 'text-slate-600'}`} aria-live="polite">
        {isPerp
          ? '✓ Le carré d’angle droit apparaît : ce trajet arrive perpendiculairement à la route. C’est le plus court.'
          : 'Continue de déplacer H : peux-tu faire plus court ?'}
      </p>
    </div>
  );
}
