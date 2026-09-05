import React, { useCallback, useRef } from 'react';

import { polarToXY, angleFromPointer, arcPath, formatDeg } from './angleUtils';

/**
 * AngleFigure — deux demi-droites, un sommet, un arc : l'ouverture.
 *
 * `rayLengths` est volontairement variable : la longueur des côtés ne doit
 * JAMAIS changer la mesure de l'angle, et le seul moyen de le faire sentir
 * est de montrer le même angle avec des côtés très différents.
 *
 * interactive=true → l'élève ouvre/ferme l'angle en faisant glisser le
 * côté mobile (pointer events sur le svg racine, aimantés à 5°), avec des
 * boutons ±10° intégrés comme alternative sans glisser.
 *
 * Convention : `deg` = ouverture depuis le côté fixe ; `rotation` = angle
 * du côté fixe depuis l'horizontale droite, sens anti-horaire.
 */
const S = 220;
const C = S / 2;

export default function AngleFigure({
  deg,
  rotation = 0,
  rayLengths = [90, 90],
  showArc = true,
  arcLabel = null, // null → pas d'étiquette ; '?' ou une mesure
  labels = null, // ['A','B','C'] : B = sommet
  tone = 'sky',
  interactive = false,
  onChange,
  size = 220,
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const active = interactive && !disabled;

  const colors = {
    sky: { ray: '#0284c7', arc: '#0ea5e9', fill: '#e0f2fe' },
    violet: { ray: '#7c3aed', arc: '#8b5cf6', fill: '#ede9fe' },
    emerald: { ray: '#059669', arc: '#10b981', fill: '#d1fae5' },
  }[tone] ?? { ray: '#0284c7', arc: '#0ea5e9', fill: '#e0f2fe' };

  const fixedEnd = polarToXY(C, C, rayLengths[0], rotation);
  const mobileEnd = polarToXY(C, C, rayLengths[1], rotation + deg);
  const arcR = Math.min(38, Math.min(...rayLengths) * 0.42);

  const degFromPointer = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * S;
      const y = ((clientY - rect.top) / rect.height) * S;
      const abs = angleFromPointer(C, C, x, y);
      const rel = (abs - rotation + 360) % 360;
      // On borne à 5°..175° : un angle nul ou rentrant n'a pas de sens ici.
      const snapped = Math.round(rel / 5) * 5;
      return Math.min(175, Math.max(5, snapped));
    },
    [rotation]
  );

  const handlePointerDown = (e) => {
    if (!active) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    onChange?.(degFromPointer(e.clientX, e.clientY));
  };
  const handlePointerMove = (e) => {
    if (!dragging.current || !active) return;
    onChange?.(degFromPointer(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const bump = (d) => {
    if (!active) return;
    onChange?.(Math.min(175, Math.max(5, deg + d)));
  };

  return (
    <div className="w-full max-w-[260px] mx-auto space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${S} ${S}`}
        className="w-full select-none"
        role={active ? 'slider' : 'img'}
        aria-label={ariaLabel ?? (active ? `Ouvre l'angle — actuellement ${formatDeg(deg)}` : `Angle de ${formatDeg(deg)}`)}
        aria-valuenow={active ? deg : undefined}
        aria-valuemin={active ? 5 : undefined}
        aria-valuemax={active ? 175 : undefined}
        aria-valuetext={active ? formatDeg(deg) : undefined}
        style={{ touchAction: active ? 'none' : 'auto', width: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Secteur + arc : décor, jamais cliquable */}
        <g style={{ pointerEvents: 'none' }}>
          {showArc && (
            <>
              <path
                d={`M ${C} ${C} L ${polarToXY(C, C, arcR, rotation).x} ${polarToXY(C, C, arcR, rotation).y} ${arcPath(C, C, arcR, rotation, rotation + deg)} Z`}
                fill={colors.fill}
                opacity={0.9}
              />
              <path d={arcPath(C, C, arcR, rotation, rotation + deg)} fill="none" stroke={colors.arc} strokeWidth="2.5" />
            </>
          )}
          {/* Côtés (demi-droites) */}
          <line x1={C} y1={C} x2={fixedEnd.x} y2={fixedEnd.y} stroke={colors.ray} strokeWidth="4" strokeLinecap="round" />
          <line x1={C} y1={C} x2={mobileEnd.x} y2={mobileEnd.y} stroke={colors.ray} strokeWidth="4" strokeLinecap="round" />
          <circle cx={C} cy={C} r={4.5} fill="#1e293b" />
          {active && <circle cx={mobileEnd.x} cy={mobileEnd.y} r={9} fill={colors.arc} opacity={0.35} />}

          {arcLabel !== null && (
            <text
              x={polarToXY(C, C, arcR + 20, rotation + deg / 2).x}
              y={polarToXY(C, C, arcR + 20, rotation + deg / 2).y + 5}
              textAnchor="middle"
              style={{ fontSize: 15, fontFamily: 'monospace', fontWeight: 800 }}
              className="fill-slate-700"
            >
              {arcLabel}
            </text>
          )}

          {labels && (
            <>
              <text x={fixedEnd.x} y={fixedEnd.y - 8} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700 }} className="fill-slate-600">{labels[0]}</text>
              <text x={C - 14} y={C + 16} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700 }} className="fill-slate-800">{labels[1]}</text>
              <text x={mobileEnd.x} y={mobileEnd.y - 8} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700 }} className="fill-slate-600">{labels[2]}</text>
            </>
          )}
        </g>
      </svg>

      {active && (
        <div className="flex justify-center gap-2" role="group" aria-label="Ouvrir ou fermer sans glisser">
          <button type="button" onClick={() => bump(-10)} className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            − 10°
          </button>
          <button type="button" onClick={() => bump(10)} className="px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            + 10°
          </button>
        </div>
      )}
    </div>
  );
}
