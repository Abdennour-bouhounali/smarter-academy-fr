import React, { useCallback, useRef } from 'react';

/**
 * ReferenceRuler — l'élève fait glisser une longueur de référence connue
 * (ex. 1 m) le long d'un axe pour la comparer visuellement à un objet
 * fixe (silhouette simple). Aucune graduation : la comparaison est
 * purement visuelle, comme le geste réel de « poser sa règle à côté ».
 *
 * Même technique de glisser que NumberLine (pointer events sur le <svg>
 * racine, capture optionnelle, alternative clavier).
 */

const W = 1000;
const H = 220;
const AXIS_Y = 170;
const PX_PER_M = 140; // échelle fixe de la scène

export default function ReferenceRuler({
  targetLabel = 'La porte',
  targetHeightM = 2,
  referenceLengthM = 1,
  referenceLabel = '1 m de référence',
  position,
  onPositionChange,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const dragOffset = useRef(0);

  const targetX = 260;
  const targetH = targetHeightM * PX_PER_M;
  const refW = referenceLengthM * PX_PER_M;
  const pos = position ?? 550;

  const xFromClientX = useCallback((clientX) => {
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return ratio * W;
  }, []);

  const clamp = (x) => Math.min(W - 40, Math.max(targetX + 90, x));

  const handlePointerDown = (e) => {
    if (disabled) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    dragOffset.current = xFromClientX(e.clientX) - pos;
  };
  const handlePointerMove = (e) => {
    if (!dragging.current || disabled) return;
    onPositionChange?.(clamp(xFromClientX(e.clientX) - dragOffset.current));
  };
  const endDrag = (e) => {
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); onPositionChange?.(clamp(pos + 10)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onPositionChange?.(clamp(pos - 10)); }
  };

  return (
    <div className="w-full space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label={`${targetLabel}, avec une référence de ${referenceLengthM} m à faire glisser`}
        style={{ touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <line x1={0} y1={AXIS_Y} x2={W} y2={AXIS_Y} stroke="#cbd5e1" strokeWidth="2" />

        {/* Silhouette fixe (porte) */}
        <g>
          <rect x={targetX} y={AXIS_Y - targetH} width={90} height={targetH} rx={4} fill="none" stroke="#1e293b" strokeWidth="4" />
          <circle cx={targetX + 78} cy={AXIS_Y - targetH / 2} r={4} fill="#1e293b" />
          <text x={targetX + 45} y={AXIS_Y - targetH - 12} textAnchor="middle" style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 700 }} className="fill-slate-700">
            {targetLabel}
          </text>
        </g>

        {/* Référence glissable */}
        <g
          transform={`translate(${pos}, 0)`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={referenceLabel}
          aria-valuemin={targetX + 90}
          aria-valuemax={W - 40}
          aria-valuenow={pos}
          style={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
        >
          <rect x={-6} y={AXIS_Y - refW} width={12} height={refW} rx={4} fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
          <text x={0} y={AXIS_Y - refW - 12} textAnchor="middle" style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700 }} className="fill-amber-700">
            {referenceLabel}
          </text>
        </g>
      </svg>
      <p className="text-center text-sm text-slate-600">
        Fais glisser la référence à côté de {targetLabel.toLowerCase()} : combien de fois se répète-t-elle ?
      </p>
    </div>
  );
}
