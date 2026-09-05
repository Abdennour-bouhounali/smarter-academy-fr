import React, { useRef, useCallback, useState } from 'react';
import { clipToBox } from '../../../../../common/utils/geometry2d';
import {
  reflectPoint, reflectPoints, projectOnLine, distPointLine, dist, midpoint,
} from './symetrieUtils';

/**
 * MirrorLab — l'INTERACTION SIGNATURE de la leçon.
 *
 * ACTION          l'élève déplace un point M (ou une figure entière).
 * TRANSFORMATION  son image M′ se déplace en miroir, EN DIRECT ; le trait
 *                 [MM′], son milieu sur l'axe et le codage d'égalité des
 *                 distances suivent.
 * SENS MATH.      l'image n'est pas « posée à côté » : elle est CALCULÉE par
 *                 `reflectPoint`, donc elle ne peut jamais mentir.
 * FEEDBACK        les deux distances à l'axe sont affichées et toujours
 *                 égales ; la marque d'angle droit au pied du trait montre la
 *                 perpendicularité.
 * GÉNÉRALISATION  deux conditions, jamais une seule : perpendiculaire À
 *                 l'axe, et à égale distance DE l'axe.
 *
 * Quand `candidate` est fourni, c'est l'élève qui place l'image : on dessine
 * alors SA proposition (ambre) et non la vraie image, jusqu'à ce qu'il
 * trouve. Le composant ne triche donc jamais en montrant la réponse.
 */
export default function MirrorLab({
  axis,
  points = [],
  onPointChange,
  candidate = null,
  onCandidateChange,
  draggableIndex = 0,
  showImage = true,
  showDistances = true,
  showConnector = true,
  polygon = false,
  ghostImage = null,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 220 },
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const [settled, setSettled] = useState(true);

  const images = reflectPoints(axis, points);
  // La cible du glisser : soit un point de la figure, soit la proposition.
  const target = candidate ? 'candidate' : 'point';

  const posFromClient = useCallback(
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

  const clamp = (p) => ({
    x: Math.max(box.xMin + 10, Math.min(box.xMax - 10, p.x)),
    y: Math.max(box.yMin + 10, Math.min(box.yMax - 10, p.y)),
  });

  const move = (p) => {
    if (disabled || !p) return;
    const q = clamp(p);
    if (target === 'candidate') onCandidateChange?.(q);
    else onPointChange?.(draggableIndex, q);
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    move(posFromClient(e.clientX, e.clientY));
  };
  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    move(posFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = null;
    setSettled(true); // settle-then-number
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const handle = target === 'candidate' ? candidate : points[draggableIndex];
  const onKeyDown = (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d || !handle) return;
    e.preventDefault();
    setSettled(true);
    move({ x: handle.x + d.x, y: handle.y + d.y });
  };

  // L'axe, découpé à la boîte visible.
  const axSeg = clipToBox(
    { kind: 'droite', a: axis.p, b: { x: axis.p.x + axis.d.x * 50, y: axis.p.y + axis.d.y * 50 } },
    box
  );

  /** Le trait [M M′] + son milieu sur l'axe + la marque d'angle droit. */
  const connector = (M, Mp, key) => {
    const foot = projectOnLine(axis, M);
    const s = 9;
    const u = axis.d;
    const nrm = { x: -u.y, y: u.x };
    const side = Math.sign((M.x - foot.x) * nrm.x + (M.y - foot.y) * nrm.y) || 1;
    return (
      <g key={key}>
        <line x1={M.x} y1={M.y} x2={Mp.x} y2={Mp.y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* Marque d'angle droit au pied : le trait EST perpendiculaire */}
        <path
          d={`M ${foot.x + u.x * s} ${foot.y + u.y * s}
              L ${foot.x + u.x * s + nrm.x * s * side} ${foot.y + u.y * s + nrm.y * s * side}
              L ${foot.x + nrm.x * s * side} ${foot.y + nrm.y * s * side}`}
          fill="none" stroke="#059669" strokeWidth="1.8"
        />
        <circle cx={foot.x} cy={foot.y} r="3" fill="#059669" />
      </g>
    );
  };

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: 'none' }}
        role="group"
        aria-label={ariaLabel ?? 'Miroir : déplace le point et observe son image'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* L'axe — un vrai miroir, tracé en pointillé épais */}
          {axSeg && (
            <>
              <line
                x1={axSeg.from.x} y1={axSeg.from.y} x2={axSeg.to.x} y2={axSeg.to.y}
                stroke="#6366f1" strokeWidth="3" strokeDasharray="9 6"
              />
              <text
                x={axSeg.to.x - 8} y={axSeg.to.y - 8}
                className="font-space" fontSize="12" fontWeight="700" fill="#6366f1"
              >
                (d)
              </text>
            </>
          )}

          {/* La figure d'origine */}
          {polygon && points.length > 2 && (
            <path
              d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'}
              fill="#eef2ff" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round"
            />
          )}
          {polygon && showImage && images.length > 2 && (
            <path
              d={images.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'}
              fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round"
            />
          )}

          {/* Les traits de correspondance */}
          {showConnector && showImage && points.map((p, i) => connector(p, images[i], `c${i}`))}

          {/* Fantôme : la vraie image, révélée après coup */}
          {ghostImage && (
            <g opacity="0.5">
              <circle cx={ghostImage.x} cy={ghostImage.y} r="7" fill="#059669" />
              <text x={ghostImage.x + 10} y={ghostImage.y - 8} className="font-space" fontSize="12" fill="#047857">
                M′
              </text>
            </g>
          )}

          {/* Les points d'origine, puis leurs images */}
          {points.map((p, i) => (
            <g key={`p${i}`}>
              <circle cx={p.x} cy={p.y} r="6.5" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
              <text x={p.x - 16} y={p.y - 9} className="font-space" fontSize="13" fontWeight="700" fill="#0f172a">
                {points.length === 1 ? 'M' : String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}
          {showImage && images.map((p, i) => (
            <g key={`i${i}`}>
              <circle cx={p.x} cy={p.y} r="6.5" fill="#059669" stroke="#fff" strokeWidth="2" />
              <text x={p.x + 10} y={p.y - 9} className="font-space" fontSize="13" fontWeight="700" fill="#047857">
                {points.length === 1 ? 'M′' : `${String.fromCharCode(65 + i)}′`}
              </text>
            </g>
          ))}

          {/* La proposition de l'élève, en ambre — jamais confondue avec l'image */}
          {candidate && (
            <g>
              <circle cx={candidate.x} cy={candidate.y} r="8" fill="#f59e0b" stroke="#fff" strokeWidth="2.5" />
              <text x={candidate.x + 11} y={candidate.y + 5} className="font-space" fontSize="12" fontWeight="700" fill="#b45309">
                ton point
              </text>
            </g>
          )}
        </g>

        {/* Poignée : large, transparente, focusable */}
        {handle && !disabled && (
          <circle
            cx={handle.x} cy={handle.y} r="22" fill="transparent"
            role="slider"
            tabIndex={0}
            aria-label={target === 'candidate' ? 'Ton point à placer' : 'Point M'}
            aria-valuenow={Math.round(distPointLine(axis, handle))}
            aria-valuemin={0}
            aria-valuemax={999}
            aria-valuetext={`à ${Math.round(distPointLine(axis, handle))} de l’axe`}
            onKeyDown={onKeyDown}
            style={{ cursor: 'grab', outline: 'none' }}
          />
        )}
      </svg>

      {/* Les deux distances — toujours égales quand l'image est la vraie */}
      {showDistances && points.length === 1 && showImage && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Gauge label="M → axe" value={settled ? Math.round(distPointLine(axis, points[0])) : null} tone="indigo" />
          <span className="font-mono font-bold text-slate-400" aria-hidden="true">=</span>
          <Gauge label="axe → M′" value={settled ? Math.round(distPointLine(axis, images[0])) : null} tone="emerald" />
        </div>
      )}
    </div>
  );
}

const TONES = {
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-300 bg-amber-50 text-amber-900',
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
