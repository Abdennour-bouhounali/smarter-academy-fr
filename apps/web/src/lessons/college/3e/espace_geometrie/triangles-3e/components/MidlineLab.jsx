import React, { useCallback, useRef, useState } from 'react';
import { midlineOf, VERTEX_NAMES, BOX } from './triangleUtils';

/**
 * MidlineLab — la droite des milieux, conjecturée puis vérifiée.
 *
 * ACTION            l'élève déforme le triangle ; les milieux suivent.
 * CHANGEMENT        le segment [IJ] bouge avec la figure, et les deux mesures
 *                   affichées changent — mais leur rapport, non.
 * OBSERVATION       IJ vaut toujours la moitié de BC, et les chevrons de
 *                   parallélisme ne disparaissent jamais.
 * SENS MATHÉMATIQUE une propriété est vraie pour TOUS les triangles, pas pour
 *                   celui qu'on a sous les yeux : la déformation est la preuve
 *                   expérimentale de la généralité.
 *
 * Les chevrons ne sont dessinés que si `midlineOf().parallel` est vrai : le
 * dessin ne peut pas affirmer un parallélisme qui n'existerait pas.
 */
const HANDLE_R = 22;

export default function MidlineLab({
  points,
  onPointsChange,
  box = BOX,
  disabled = false,
  stamps = [],
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const [settled, setSettled] = useState(true);
  const [focused, setFocused] = useState(null);

  const m = midlineOf(points);
  const [A, B, C] = points;

  const posFromClient = useCallback((cx, cy) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: box.xMin + ((cx - rect.left) / rect.width) * (box.xMax - box.xMin),
      y: box.yMin + ((cy - rect.top) / rect.height) * (box.yMax - box.yMin),
    };
  }, [box.xMin, box.yMin, box.xMax, box.yMax]);

  const clampP = (p) => ({
    x: Math.max(box.xMin + 18, Math.min(box.xMax - 18, p.x)),
    y: Math.max(box.yMin + 18, Math.min(box.yMax - 18, p.y)),
  });

  const move = (i, p) => {
    if (disabled || !p) return;
    onPointsChange?.(points.map((q, k) => (k === i ? clampP(p) : q)));
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    let best = -1;
    let bestD = HANDLE_R + 8;
    points.forEach((q, i) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best < 0) return;
    dragging.current = best;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    move(best, p);
  };
  const onPointerMove = (e) => {
    if (disabled || dragging.current === null) return;
    move(dragging.current, posFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (dragging.current === null) return;
    dragging.current = null;
    setSettled(true);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const onKeyDown = (i) => (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    move(i, { x: points[i].x + d.x, y: points[i].y + d.y });
  };

  /** Chevrons de parallélisme — dessinés seulement si areParallel est vrai. */
  const chevrons = (a, b, k) => {
    if (!m.parallel) return null;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = Math.hypot(dx, dy) || 1;
    const ux = dx / n;
    const uy = dy / n;
    const px = -uy;
    const py = ux;
    return (
      <path key={`ch${k}`}
        d={`M ${mx - ux * 5 + px * 5} ${my - uy * 5 + py * 5} L ${mx + ux * 4} ${my + uy * 4}
            L ${mx - ux * 5 - px * 5} ${my - uy * 5 - py * 5}`}
        fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    );
  };

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[420px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: dragging.current !== null ? 'none' : 'manipulation' }}
        {...(disabled
          ? { role: 'img', 'aria-label': ariaLabel ?? 'Triangle et sa droite des milieux' }
          : { role: 'group', 'aria-label': ariaLabel ?? 'Déforme le triangle : la droite des milieux suit' })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          <polygon points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="#eef2ff" fillOpacity="0.7" stroke="#4338ca" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Le segment des milieux */}
          <line x1={m.I.x} y1={m.I.y} x2={m.J.x} y2={m.J.y}
            stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          {chevrons(m.I, m.J, 'ij')}
          {chevrons(B, C, 'bc')}

          {[[m.I, 'I'], [m.J, 'J']].map(([p, n]) => (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
              <text x={p.x - 12} y={p.y - 8} fontSize="13" fontWeight="700"
                className="font-space" fill="#166534">{n}</text>
            </g>
          ))}

          {settled && (
            <>
              <text x={(m.I.x + m.J.x) / 2} y={(m.I.y + m.J.y) / 2 - 10} textAnchor="middle"
                fontSize="12" className="font-mono font-semibold" fill="#166534">
                IJ = {Math.round(m.ij)}
              </text>
              <text x={(B.x + C.x) / 2} y={(B.y + C.y) / 2 + 20} textAnchor="middle"
                fontSize="12" className="font-mono font-semibold" fill="#4338ca">
                BC = {Math.round(m.bc)}
              </text>
            </>
          )}

          {points.map((p, i) => {
            const cx = (A.x + B.x + C.x) / 3;
            const cy = (A.y + B.y + C.y) / 3;
            const dx = p.x - cx;
            const dy = p.y - cy;
            const n = Math.hypot(dx, dy) || 1;
            return (
              <text key={`n${i}`} x={p.x + (dx / n) * 20} y={p.y + (dy / n) * 20 + 5}
                textAnchor="middle" fontSize="16" fontWeight="700"
                className="font-space" fill="#0f172a">{VERTEX_NAMES[i]}</text>
            );
          })}
        </g>

        {points.map((p, i) => (
          <g key={`h${i}`}>
            <circle cx={p.x} cy={p.y} r="7" fill="#4338ca" stroke="#fff" strokeWidth="2.5"
              style={{ pointerEvents: 'none' }} />
            {!disabled && (
              <circle cx={p.x} cy={p.y} r={HANDLE_R} fill="transparent"
                role="button" tabIndex={0}
                aria-label={`Sommet ${VERTEX_NAMES[i]} — flèches pour le déplacer`}
                onKeyDown={onKeyDown(i)}
                onFocus={() => setFocused(i)} onBlur={() => setFocused(null)}
                style={{ outline: 'none', cursor: 'grab' }} />
            )}
            {focused === i && (
              <circle cx={p.x} cy={p.y} r={HANDLE_R - 4} fill="none" stroke="#3b82f6"
                strokeWidth="2.5" style={{ pointerEvents: 'none' }} />
            )}
          </g>
        ))}
      </svg>

      <p className="text-center text-sm font-mono text-slate-700 tabular-nums" aria-live="polite">
        IJ ÷ BC = {m.ratio === null ? '—' : m.ratio.toFixed(2)}
        {m.parallel && <span className="ml-2 text-emerald-700 font-sans">· (IJ) ∥ (BC)</span>}
      </p>

      {stamps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {stamps.map((s, i) => (
            <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-emerald-50
                                     border border-emerald-200 text-emerald-800 tabular-nums">
              {s.ij} ÷ {s.bc} = {s.ratio}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
