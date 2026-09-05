import React, { useRef, useState, useCallback } from 'react';
import GeoFigure from './GeoFigure';
import {
  isAligned, alignmentGap, isMidpoint, midpointGap, dist, midpoint,
} from './droitesUtils';

/**
 * PointsOnLine — un point mobile sur (ou près de) une droite.
 *
 * ACTION          l'élève déplace le point M (glisser ou flèches).
 * TRANSFORMATION  deux jauges chiffrent en direct l'écart à la droite
 *                 (mode 'align') ou l'écart entre AM et MB (mode 'midpoint').
 * SENS MATH.      « ça a l'air aligné » n'est pas « c'est aligné » ; le
 *                 milieu n'est pas « au milieu à l'œil », c'est l'égalité
 *                 exacte de deux longueurs.
 *
 * Les jauges sont du DOM (pas du SVG) : elles peuvent donc s'animer par
 * transform CSS sans tomber dans le piège framer-motion/SVG (§10.8).
 * Les nombres ne bougent qu'au relâchement — « settle-then-number » (§10.11).
 */
export default function PointsOnLine({
  a,
  b,
  m,
  onMChange,
  mode = 'align', // 'align' | 'midpoint'
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 180 },
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [settled, setSettled] = useState(true);

  const pointFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin),
        y: box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin),
      };
    },
    [box.xMin, box.yMin, box.xMax, box.yMax]
  );

  const clampToBox = (p) => ({
    x: Math.max(box.xMin + 8, Math.min(box.xMax - 8, p.x)),
    y: Math.max(box.yMin + 8, Math.min(box.yMax - 8, p.y)),
  });

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    const p = pointFromClient(e.clientX, e.clientY);
    if (p) onMChange(clampToBox(p));
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    const p = pointFromClient(e.clientX, e.clientY);
    if (p) onMChange(clampToBox(p));
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setSettled(true);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onKeyDown = (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    setSettled(true);
    onMChange(clampToBox({ x: m.x + d.x, y: m.y + d.y }));
  };

  const gap = mode === 'midpoint' ? midpointGap(a, b, m) : alignmentGap(a, b, m);
  const ok = mode === 'midpoint' ? isMidpoint(a, b, m) : isAligned(a, b, m);
  const am = dist(a, m);
  const mb = dist(m, b);

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Déplace le point M'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          <GeoFigureInline a={a} b={b} m={m} mode={mode} ok={ok} box={box} />
        </g>

        {/* Poignée large et transparente — invisible mais tapable/focusable */}
        <circle
          cx={m.x} cy={m.y} r="20"
          fill="transparent"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Point M"
          aria-valuetext={
            mode === 'midpoint'
              ? `AM ${Math.round(am)}, MB ${Math.round(mb)}`
              : `écart à la droite ${Math.round(gap)}`
          }
          aria-valuenow={Math.round(gap)}
          aria-valuemin={0}
          aria-valuemax={999}
          onKeyDown={onKeyDown}
          style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
        />
      </svg>

      {/* Lecture chiffrée, figée pendant le glisser (settle-then-number) */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {mode === 'midpoint' ? (
          <>
            <Gauge label="AM" value={settled ? Math.round(am) : null} tone="indigo" />
            <Gauge label="MB" value={settled ? Math.round(mb) : null} tone="cyan" />
            <Gauge label="écart" value={settled ? Math.round(gap) : null} tone={ok ? 'emerald' : 'rose'} />
          </>
        ) : (
          <Gauge
            label="distance de M à la droite"
            value={settled ? Math.round(gap) : null}
            tone={ok ? 'emerald' : 'rose'}
          />
        )}
      </div>
    </div>
  );
}

const TONES = {
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  cyan: 'border-cyan-300 bg-cyan-50 text-cyan-900',
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  rose: 'border-rose-300 bg-rose-50 text-rose-900',
};

function Gauge({ label, value, tone }) {
  return (
    <div className={`rounded-xl border-2 px-3.5 py-2 text-center ${TONES[tone]}`}>
      <div className="text-[10px] font-mono uppercase tracking-wide opacity-70">{label}</div>
      <div className="font-mono font-extrabold text-base tabular-nums" aria-live="polite">
        {value === null ? '…' : value}
      </div>
    </div>
  );
}

/** Le dessin, séparé pour rester lisible ; purement décoratif. */
function GeoFigureInline({ a, b, m, mode, ok, box }) {
  return (
    <>
      {/* La droite support, prolongée jusqu'aux bords */}
      <line
        x1={box.xMin} y1={a.y + ((box.xMin - a.x) * (b.y - a.y)) / (b.x - a.x || 1)}
        x2={box.xMax} y2={a.y + ((box.xMax - a.x) * (b.y - a.y)) / (b.x - a.x || 1)}
        stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 4"
      />
      {/* Le segment [AB] */}
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />

      {mode === 'midpoint' && (
        <>
          <line x1={a.x} y1={a.y} x2={m.x} y2={m.y} stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" opacity="0.45" />
          <line x1={m.x} y1={m.y} x2={b.x} y2={b.y} stroke="#0891b2" strokeWidth="5" strokeLinecap="round" opacity="0.45" />
        </>
      )}

      {mode === 'align' && !ok && (
        // Le trait de rappel : la distance de M à la droite, rendue visible.
        <line
          x1={m.x} y1={m.y}
          x2={m.x} y2={a.y + ((m.x - a.x) * (b.y - a.y)) / (b.x - a.x || 1)}
          stroke="#e11d48" strokeWidth="2" strokeDasharray="3 3"
        />
      )}

      <circle cx={a.x} cy={a.y} r="5.5" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
      <circle cx={b.x} cy={b.y} r="5.5" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
      <text x={a.x + 9} y={a.y - 9} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a">A</text>
      <text x={b.x + 9} y={b.y - 9} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a">B</text>

      <circle cx={m.x} cy={m.y} r="7" fill={ok ? '#059669' : '#e11d48'} stroke="#fff" strokeWidth="2.5" />
      <text x={m.x + 10} y={m.y + 18} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a">M</text>
    </>
  );
}
