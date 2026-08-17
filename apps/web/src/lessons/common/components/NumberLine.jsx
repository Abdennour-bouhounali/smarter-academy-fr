import React, { useCallback, useRef } from 'react';
import { formatFr, roundTo } from '@smarter-academy/core';

/**
 * NumberLine — demi-droite graduée interactive (souris, tactile, clavier).
 *
 * Fonctionne pour les entiers comme pour les décimaux : passer `format`
 * (par ex. formatDec) change l'affichage des graduations sans toucher au reste.
 *
 * Trois usages :
 *   mode="static" → simple support visuel (encadrement, repères)
 *   mode="read"   → l'élève clique une graduation pour identifier un nombre
 *   mode="place"  → l'élève fait glisser un curseur pour placer un nombre
 *
 * En mode "place", la valeur du curseur reste masquée tant que l'élève n'a pas
 * validé : l'objectif est d'estimer une GRANDEUR, pas de lire un compteur.
 */

const W = 1000;
const PAD_L = 46;
const PAD_R = 56;
const AXIS_W = W - PAD_L - PAD_R;

export default function NumberLine({
  min,
  max,
  step,
  labelEvery = 1,
  height = 170,
  mode = 'static',
  value,
  onChange,
  snap,
  revealValue = true,
  onTickClick,
  selectedValue = null,
  markers = [],
  ghost = null,
  disabled = false,
  format = formatFr,
  ariaLabel = 'Demi-droite graduée',
  edgesOnly = false,
}) {
  const svgRef = useRef(null);
  const axisY = height - 62;
  const span = max - min;
  const snapStep = snap || step;

  const toX = useCallback((v) => PAD_L + ((v - min) / span) * AXIS_W, [min, span]);

  const ticks = [];
  const tickCount = Math.round(span / step);
  if (tickCount <= 250) {
    for (let i = 0; i <= tickCount; i += 1) ticks.push(roundTo(min + i * step));
  }

  /* ── Interaction « placer » ───────────────────────────────────────── */
  const valueFromClientX = useCallback(
    (clientX) => {
      const rect = svgRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width; // le viewBox fait 1000 de large
      const x = ratio * W;
      const raw = min + ((x - PAD_L) / AXIS_W) * span;
      const snapped = Math.round(raw / snapStep) * snapStep;
      return roundTo(Math.min(max, Math.max(min, snapped)));
    },
    [min, max, span, snapStep]
  );

  const dragging = useRef(false);

  const handlePointerDown = (e) => {
    if (disabled || mode !== 'place') return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onChange?.(valueFromClientX(e.clientX));
  };

  const handlePointerMove = (e) => {
    if (!dragging.current || disabled || mode !== 'place') return;
    onChange?.(valueFromClientX(e.clientX));
  };

  const endDrag = (e) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const handleKeyDown = (e) => {
    if (disabled || mode !== 'place') return;
    const big = snapStep * 10;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = (value ?? min) + snapStep;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = (value ?? min) - snapStep;
    else if (e.key === 'PageUp') next = (value ?? min) + big;
    else if (e.key === 'PageDown') next = (value ?? min) - big;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    if (next !== null) {
      e.preventDefault();
      onChange?.(Math.min(max, Math.max(min, next)));
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className="w-full h-auto min-w-[340px] select-none"
        role="img"
        aria-label={ariaLabel}
        style={{ touchAction: mode === 'place' ? 'none' : 'auto' }}
      >
        {/* Zone de capture des gestes (mode « placer ») */}
        {mode === 'place' && !disabled && (
          <rect
            x="0"
            y="0"
            width={W}
            height={height}
            fill="transparent"
            className="cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        )}

        {/* Axe + flèche : la demi-droite continue vers les grands nombres */}
        <line x1={PAD_L - 26} y1={axisY} x2={W - 24} y2={axisY} stroke="#334155" strokeWidth="4" strokeLinecap="round" />
        <polygon points={`${W - 26},${axisY - 8} ${W - 8},${axisY} ${W - 26},${axisY + 8}`} fill="#334155" />

        {/* Graduations */}
        {ticks.map((v, i) => {
          const x = toX(v);
          const labelled = i % labelEvery === 0;
          const isSelected = selectedValue !== null && Math.abs(selectedValue - v) < step / 2;
          const clickable = mode === 'read' && !disabled;

          return (
            <g key={v}>
              {clickable && (
                <rect
                  x={x - Math.max(14, AXIS_W / tickCount / 2)}
                  y={axisY - 46}
                  width={Math.max(28, AXIS_W / tickCount)}
                  height="92"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => onTickClick?.(v)}
                  role="button"
                  aria-label={`Graduation ${format(v)}`}
                />
              )}
              <line
                x1={x}
                y1={axisY - (labelled ? 14 : 7)}
                x2={x}
                y2={axisY + (labelled ? 14 : 7)}
                stroke={isSelected ? '#2563eb' : '#64748b'}
                strokeWidth={isSelected ? 5 : labelled ? 3 : 2}
              />
              {/* label : uniquement si labelled ET (pas edgesOnly OU c'est le premier/dernier tick) */}
              {labelled && (!edgesOnly || i === 0 || i === ticks.length - 1) && (
                <text
                  x={x}
                  y={axisY + 38}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight={isSelected ? '800' : '600'}
                  fill={isSelected ? '#2563eb' : '#475569'}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {format(v)}
                </text>
              )}
              {isSelected && mode === 'read' && (
                <circle cx={x} cy={axisY} r="9" fill="#2563eb" stroke="#fff" strokeWidth="3" />
              )}
            </g>
          );
        })}

        {/* Repères fixes */}
        {markers.map((m, i) => {
          const x = toX(m.value);
          const color = m.color || '#7c3aed';
          return (
            <g key={`${m.value}-${i}`}>
              <line x1={x} y1={axisY - 40} x2={x} y2={axisY} stroke={color} strokeWidth="3" strokeDasharray="5 4" />
              <circle cx={x} cy={axisY} r="8" fill={color} stroke="#fff" strokeWidth="3" />
              {m.label && (
                <text
                  x={x}
                  y={axisY - 50}
                  textAnchor="middle"
                  fontSize="23"
                  fontWeight="800"
                  fill={color}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {m.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Position exacte révélée après validation */}
        {ghost && (
          <g>
            <line
              x1={toX(ghost.value)}
              y1={axisY - 34}
              x2={toX(ghost.value)}
              y2={axisY + 20}
              stroke="#059669"
              strokeWidth="4"
            />
            <text
              x={toX(ghost.value)}
              y={axisY - 42}
              textAnchor="middle"
              fontSize="23"
              fontWeight="800"
              fill="#059669"
              fontFamily="'JetBrains Mono', monospace"
            >
              {ghost.label ?? format(ghost.value)}
            </text>
          </g>
        )}

        {/* Curseur déplaçable */}
        {mode === 'place' && value !== null && value !== undefined && (
          <g
            transform={`translate(${toX(value)}, 0)`}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-label="Curseur : place le nombre"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={revealValue ? format(value) : 'position non validée'}
            onKeyDown={handleKeyDown}
            className="cursor-grab focus:outline-none"
            style={{ touchAction: 'none' }}
          >
            <polygon
              points={`0,${axisY - 4} -14,${axisY - 30} 14,${axisY - 30}`}
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="2"
            />
            <rect x="-40" y={axisY - 74} width="80" height="40" rx="10" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
            <text
              x="0"
              y={axisY - 47}
              textAnchor="middle"
              fontSize="24"
              fontWeight="800"
              fill="#fff"
              fontFamily="'JetBrains Mono', monospace"
            >
              {revealValue ? format(value) : '?'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
