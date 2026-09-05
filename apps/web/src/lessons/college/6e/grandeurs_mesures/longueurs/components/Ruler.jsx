import React, { useCallback, useRef } from 'react';

/**
 * Ruler — règle graduée interactive (mesure d'un objet, lecture, double
 * graduation). Construite sur le même principe que NumberLine (viewBox
 * fixe, échelle recalculée), mais adaptée à la mesure d'un objet dont les
 * deux bords ne sont pas forcément alignés sur le zéro : c'est justement
 * le piège que le Module 02 fait vivre à l'élève.
 *
 * mode="display"      → simple support visuel (aucune interaction)
 * mode="read"         → l'élève tape une graduation pour lire une position
 * mode="place-object" → l'élève fait glisser l'objet le long de la règle
 *                        (translation rigide : sa longueur ne change pas)
 *
 * Prop `object` : { start, end, label } — dessine une réglette au-dessus
 * de la règle, avec des repères pointillés vers les graduations qu'elle
 * touche. Les valeurs ne sont jamais affichées en clair : l'élève doit
 * les lire lui-même sur la règle.
 *
 * Prop `secondary` : { step, labelEvery, unit } — ajoute une deuxième
 * rangée de graduations sous l'axe, sur le MÊME segment physique, pour
 * montrer qu'une longueur unique porte plusieurs étiquettes selon
 * l'unité choisie (Module 03).
 */

const W = 1000;
const PAD_L = 44;
const PAD_R = 44;
const AXIS_W = W - PAD_L - PAD_R;

export default function Ruler({
  min = 0,
  max,
  minorStep = null,
  labelEvery = 1,
  unit = 'cm',
  height = 150,
  object = null,
  mode = 'display',
  onTickClick,
  selectedValue = null,
  selectedValues = null,
  readStep = 1,
  secondary = null,
  ariaLabel = 'Règle graduée',
  disabled = false,
  objectDraggable = false,
  onObjectChange,
}) {
  const svgRef = useRef(null);
  const span = max - min;
  const axisY = secondary ? height - 78 : height - 46;

  const toX = useCallback((v) => PAD_L + ((v - min) / span) * AXIS_W, [min, span]);

  /* ── Glisser l'objet (mode="place-object") ────────────────────────── */
  const canDrag = mode === 'place-object' && objectDraggable && !disabled && object;
  const dragging = useRef(false);
  const dragOffset = useRef(0);

  const valueFromClientX = useCallback(
    (clientX) => {
      const rect = svgRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const x = ratio * W;
      return min + ((x - PAD_L) / AXIS_W) * span;
    },
    [min, span]
  );

  const moveObjectTo = (rawStart) => {
    if (!object) return;
    const objLen = object.end - object.start;
    const snapped = Math.round(rawStart / readStep) * readStep;
    const clampedStart = Math.min(max - objLen, Math.max(min, snapped));
    onObjectChange?.({ start: clampedStart, end: clampedStart + objLen });
  };

  const handleObjectPointerDown = (e) => {
    if (!canDrag) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    dragOffset.current = valueFromClientX(e.clientX) - object.start;
    e.stopPropagation();
  };

  const handleObjectPointerMove = (e) => {
    if (!dragging.current || !canDrag) return;
    moveObjectTo(valueFromClientX(e.clientX) - dragOffset.current);
  };

  const endObjectDrag = (e) => {
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const majorTicks = [];
  for (let v = min; v <= max + 1e-9; v += 1) majorTicks.push(Math.round(v * 1000) / 1000);

  const minorTicks = [];
  if (minorStep) {
    for (let v = min; v <= max + 1e-9; v += minorStep) {
      const rounded = Math.round(v * 1000) / 1000;
      if (Math.abs(rounded - Math.round(rounded)) > 1e-6) minorTicks.push(rounded);
    }
  }

  const handleTick = (v) => {
    if (disabled || mode !== 'read') return;
    onTickClick?.(v);
  };

  const objX1 = object ? toX(object.start) : null;
  const objX2 = object ? toX(object.end) : null;

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className={`w-full select-none ${mode === 'read' || mode === 'place-object' ? 'touch-none' : ''}`}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={canDrag ? handleObjectPointerMove : undefined}
        onPointerUp={canDrag ? endObjectDrag : undefined}
        onPointerCancel={canDrag ? endObjectDrag : undefined}
      >
        {/* Réglette mesurée */}
        {object && (
          <g>
            <line x1={objX1} y1={axisY - 40} x2={objX1} y2={axisY + 6} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
            <line x1={objX2} y1={axisY - 40} x2={objX2} y2={axisY + 6} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
            <rect
              x={Math.min(objX1, objX2)}
              y={axisY - 40}
              width={Math.abs(objX2 - objX1)}
              height={18}
              rx={4}
              fill={object.color || '#f97316'}
              opacity={0.85}
              style={canDrag ? { cursor: 'grab', touchAction: 'none' } : undefined}
              onPointerDown={canDrag ? handleObjectPointerDown : undefined}
              role={canDrag ? 'slider' : undefined}
              tabIndex={canDrag ? 0 : undefined}
              aria-label={canDrag ? "Objet à faire glisser sur la règle" : undefined}
              aria-valuemin={canDrag ? min : undefined}
              aria-valuemax={canDrag ? max : undefined}
              aria-valuenow={canDrag ? object.start : undefined}
              onKeyDown={canDrag ? (e) => {
                const objLen = object.end - object.start;
                if (e.key === 'ArrowRight') { e.preventDefault(); moveObjectTo(object.start + readStep); }
                else if (e.key === 'ArrowLeft') { e.preventDefault(); moveObjectTo(object.start - readStep); }
                else if (e.key === 'Home') { e.preventDefault(); moveObjectTo(min); }
                else if (e.key === 'End') { e.preventDefault(); moveObjectTo(max - objLen); }
              } : undefined}
            />
            {object.label && (
              <text
                x={(objX1 + objX2) / 2}
                y={axisY - 48}
                textAnchor="middle"
                className="fill-slate-600"
                style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700 }}
              >
                {object.label}
              </text>
            )}
          </g>
        )}

        {/* Axe principal */}
        <line x1={PAD_L} y1={axisY} x2={W - PAD_R} y2={axisY} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        {/* Graduations mineures */}
        {minorTicks.map((v) => (
          <line key={`mi-${v}`} x1={toX(v)} y1={axisY - 8} x2={toX(v)} y2={axisY} stroke="#94a3b8" strokeWidth="1.5" />
        ))}

        {/* Graduations majeures + zone tactile en mode lecture */}
        {majorTicks.map((v) => {
          const isLabeled = Math.round((v - min) / labelEvery) * labelEvery + min === v;
          const isSelected = mode === 'read' && (selectedValues ? selectedValues.includes(v) : selectedValue === v);
          return (
            <g key={`ma-${v}`}>
              {mode === 'read' && (
                <rect
                  x={toX(v) - (AXIS_W / span) * (readStep / 2)}
                  y={axisY - 34}
                  width={(AXIS_W / span) * readStep}
                  height={40}
                  fill="transparent"
                  style={{ cursor: disabled ? 'default' : 'pointer' }}
                  onClick={() => handleTick(v)}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-label={`Graduation ${v} ${unit}`}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTick(v); }
                  }}
                />
              )}
              {/* pointer-events:none — ces éléments décoratifs sont peints APRÈS
                  le rect de capture ci-dessus : sans ça, ils interceptent le clic
                  destiné à onTickClick (même piège que dans NumberLine.jsx). */}
              <line
                x1={toX(v)}
                y1={axisY - (isLabeled ? 20 : 12)}
                x2={toX(v)}
                y2={axisY}
                stroke={isSelected ? '#2563eb' : '#1e293b'}
                strokeWidth={isLabeled ? 2.5 : 2}
                style={{ pointerEvents: 'none' }}
              />
              {isSelected && <circle cx={toX(v)} cy={axisY - 20} r={7} fill="#2563eb" style={{ pointerEvents: 'none' }} />}
              {isLabeled && (
                <text
                  x={toX(v)}
                  y={axisY + 22}
                  textAnchor="middle"
                  className={isSelected ? 'fill-blue-600' : 'fill-slate-500'}
                  style={{ fontSize: 17, fontFamily: 'monospace', fontWeight: isSelected ? 700 : 500, pointerEvents: 'none' }}
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}

        <text x={W - PAD_R + 8} y={axisY + 6} className="fill-slate-400" style={{ fontSize: 15, fontFamily: 'monospace' }}>
          {unit}
        </text>

        {/* Deuxième rangée de graduations : même segment physique, autre unité.
            secondary = { scale, step, labelEvery, unit } où `scale` est le
            nombre d'unités secondaires pour 1 unité primaire (ex. 10 pour
            cm → mm). Une graduation secondaire d'indice i vaut i*step dans
            l'unité secondaire, et se place à la position physique
            (i*step/scale) dans le repère primaire (min supposé = 0). */}
        {secondary && (
          <g>
            <line x1={PAD_L} y1={height - 24} x2={W - PAD_R} y2={height - 24} stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
            {(() => {
              const n = Math.floor((span * secondary.scale) / secondary.step + 1e-9);
              const ticks2 = [];
              for (let i = 0; i <= n; i += 1) {
                const secVal = Math.round(i * secondary.step * 1000) / 1000;
                const physical = min + secVal / secondary.scale;
                const labeled = i % secondary.labelEvery === 0;
                ticks2.push(
                  <g key={`s2-${i}`}>
                    <line x1={toX(physical)} y1={height - 24} x2={toX(physical)} y2={height - 24 - (labeled ? 14 : 8)} stroke="#0d9488" strokeWidth={labeled ? 2 : 1.2} />
                    {labeled && (
                      <text x={toX(physical)} y={height - 2} textAnchor="middle" className="fill-teal-700" style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>
                        {secVal}
                      </text>
                    )}
                  </g>
                );
              }
              return ticks2;
            })()}
            <text x={W - PAD_R + 8} y={height - 20} className="fill-teal-600" style={{ fontSize: 14, fontFamily: 'monospace' }}>
              {secondary.unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
