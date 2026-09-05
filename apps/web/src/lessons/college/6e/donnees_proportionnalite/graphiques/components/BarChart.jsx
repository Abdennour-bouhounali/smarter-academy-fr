import React, { useRef, useState } from 'react';
import {
  niceMax, axisTicks, valueToY, yToValue, snapValue, formatValue, maxIndex, minIndex,
} from './chartUtils';

/**
 * BarChart — diagramme en bâtons, unique rendu graphique de la leçon.
 *
 * MODES
 *  - 'display' : image pure. Le SVG porte role="img" et un aria-label qui
 *    ÉNONCE toutes les valeurs (le graphique est alors lisible sans le voir).
 *  - 'read'    : l'élève tape une barre pour la désigner (lecture de valeur).
 *  - 'edit'    : l'élève règle la hauteur d'une barre — au doigt, à la
 *    souris ou au clavier. C'est la moitié « graphique » de la manipulation
 *    signature du module 3.
 *
 * RECETTE DE POINTAGE (playbook §10.2, reprise de NumberLine/CoordGrid) :
 * les handlers sont posés sur la RACINE <svg> (les enfants peints avalent le
 * pointerdown) ; la valeur vient du ratio getBoundingClientRect() converti
 * en coordonnées viewBox puis passé par yToValue ; setPointerCapture est
 * enveloppé dans un try/catch ; touchAction n'est neutralisé que pendant un
 * vrai glissement. Toute décoration porte pointerEvents:'none'.
 *
 * DENSITÉ : une barre = un nœud interactif. Les séries de la leçon comptent
 * au plus 7 catégories — très en deçà du plafond de ~52.
 */
const VB = { w: 340, h: 240 };
const PLOT = { left: 42, right: 12, top: 18, bottom: 196 };

const TONES = {
  sky: { bar: '#0284c7', barSoft: '#bae6fd', sel: '#0369a1' },
  indigo: { bar: '#4f46e5', barSoft: '#c7d2fe', sel: '#4338ca' },
  emerald: { bar: '#059669', barSoft: '#a7f3d0', sel: '#047857' },
  violet: { bar: '#7c3aed', barSoft: '#ddd6fe', sel: '#6d28d9' },
  amber: { bar: '#d97706', barSoft: '#fde68a', sel: '#b45309' },
  rose: { bar: '#e11d48', barSoft: '#fecdd3', sel: '#be123c' },
};

export default function BarChart({
  series,
  mode = 'display',            // 'display' | 'read' | 'edit'
  step = 5,                    // pas des graduations de l'axe
  editStep = 1,                // pas d'accrochage en mode edit
  selected = null,             // index de la barre sélectionnée
  onSelect = null,             // (i) => void — mode 'read'
  onChange = null,             // (i, value) => void — mode 'edit'
  editableIndex = null,        // en mode edit : la seule barre réglable (null = toutes)
  target = null,               // { index, value } — hauteur cible en pointillés
  highlightMax = false,
  highlightMin = false,
  tone = 'sky',
  axisLabel = '',
  title = '',
  disabled = false,
  zeroBased = true,            // false = axe tronqué (module « le graphique qui ment »)
  baseValue = 0,               // valeur du bas de l'axe si zeroBased = false
  axisFloor = 0,               // hauteur d'axe minimale : fige l'échelle pendant une construction
}) {
  const t = TONES[tone] ?? TONES.sky;
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const top = niceMax(series, step, axisFloor);
  const base = zeroBased ? 0 : baseValue;
  const span = top - base;
  const ticks = zeroBased
    ? axisTicks(series, step, axisFloor)
    : Array.from({ length: Math.floor(span / step) + 1 }, (_, k) => base + k * step);

  // Conversion valeur <-> y, tenant compte d'une base éventuellement non nulle.
  const toY = (v) => valueToY(v - base, span, PLOT.top, PLOT.bottom);
  const fromY = (y) => base + yToValue(y, span, PLOT.top, PLOT.bottom);

  const n = series.categories.length;
  const slot = (VB.w - PLOT.left - PLOT.right) / n;
  const barW = Math.min(34, slot * 0.6);
  const barX = (i) => PLOT.left + slot * i + (slot - barW) / 2;

  const iMax = maxIndex(series);
  const iMin = minIndex(series);

  const interactive = !disabled && (mode === 'read' || mode === 'edit');
  const editable = (i) => mode === 'edit' && (editableIndex === null || editableIndex === i);

  /** Index de la colonne sous une abscisse viewBox. */
  const columnAt = (x) => {
    const k = Math.floor((x - PLOT.left) / slot);
    return k >= 0 && k < n ? k : null;
  };

  /** Coordonnées viewBox à partir d'un évènement pointeur. */
  const toViewBox = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * VB.w,
      y: ((e.clientY - rect.top) / rect.height) * VB.h,
    };
  };

  const applyEdit = (i, y) => {
    const raw = fromY(y);
    const snapped = snapValue(raw, editStep, top);
    if (snapped !== series.values[i]) onChange?.(i, snapped);
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    const p = toViewBox(e);
    if (!p) return;
    const i = columnAt(p.x);
    if (i === null) return;

    if (mode === 'read') {
      onSelect?.(i);
      return;
    }
    if (!editable(i)) return;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* capture facultative */ }
    setDragging(i);
    applyEdit(i, p.y);
  };

  const handlePointerMove = (e) => {
    if (dragging === null) return;
    const p = toViewBox(e);
    if (p) applyEdit(dragging, p.y);
  };

  const endDrag = () => setDragging(null);

  const handleKey = (e, i) => {
    if (mode === 'read') {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(i); }
      return;
    }
    if (!editable(i)) return;
    const v = series.values[i];
    let next = null;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = Math.min(v + editStep, top);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(v - editStep, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = top;
    if (next !== null) { e.preventDefault(); onChange?.(i, next); }
  };

  const readAll = series.categories
    .map((c, i) => `${c} : ${formatValue(series, series.values[i])}`)
    .join(', ');

  const svgProps = interactive
    ? { role: 'group', 'aria-label': `${title || 'Diagramme en bâtons'}. ${readAll}` }
    : { role: 'img', 'aria-label': `${title || 'Diagramme en bâtons'}. ${readAll}` };

  return (
    <div className="w-full">
      {title && <p className="text-center text-sm font-semibold text-slate-700 mb-1">{title}</p>}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full max-w-md mx-auto block"
        style={{ touchAction: dragging !== null ? 'none' : 'manipulation' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        {...svgProps}
      >
        {/* Graduations et axes — décor, jamais tappable. */}
        <g pointerEvents="none">
          {ticks.map((v) => {
            const y = toY(v);
            return (
              <g key={v}>
                <line x1={PLOT.left} y1={y} x2={VB.w - PLOT.right} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={PLOT.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                  {v}
                </text>
              </g>
            );
          })}
          <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
          <line x1={PLOT.left} y1={PLOT.bottom} x2={VB.w - PLOT.right} y2={PLOT.bottom} stroke="#334155" strokeWidth="1.5" />
          {axisLabel && (
            <text x={4} y={12} fontSize="10" fill="#475569" fontFamily="monospace">
              {axisLabel}
            </text>
          )}
          {!zeroBased && (
            <text x={PLOT.left - 6} y={PLOT.bottom + 16} textAnchor="end" fontSize="9" fill="#e11d48">
              ⚠
            </text>
          )}
        </g>

        {/* Hauteur cible (pointillés ambre). */}
        {target && (
          <g pointerEvents="none">
            <line
              x1={PLOT.left}
              y1={toY(target.value)}
              x2={VB.w - PLOT.right}
              y2={toY(target.value)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </g>
        )}

        {/* Les barres. */}
        {series.categories.map((cat, i) => {
          const v = series.values[i];
          const y = toY(v);
          const h = Math.max(0, PLOT.bottom - y);
          const isSel = selected === i;
          const isMax = highlightMax && i === iMax;
          const isMin = highlightMin && i === iMin;
          const canEdit = editable(i);
          const fill = isSel ? t.sel : isMax ? '#dc2626' : isMin ? '#0891b2' : t.bar;

          return (
            <g key={cat}>
              <rect
                x={barX(i)}
                y={y}
                width={barW}
                height={h}
                rx="3"
                fill={fill}
                opacity={mode === 'edit' && !canEdit ? 0.45 : 1}
                pointerEvents="none"
              />
              {/* Poignée de réglage : visible et large, en mode edit. */}
              {canEdit && (
                <rect
                  x={barX(i) - 4}
                  y={y - 4}
                  width={barW + 8}
                  height={8}
                  rx="4"
                  fill={t.sel}
                  pointerEvents="none"
                />
              )}
              {/* Zone tactile : pleine hauteur de colonne, ≥ 44 px de large. */}
              {interactive && (
                <rect
                  x={PLOT.left + slot * i}
                  y={PLOT.top}
                  width={slot}
                  height={PLOT.bottom - PLOT.top}
                  fill="transparent"
                  role="button"
                  tabIndex={canEdit || mode === 'read' ? 0 : -1}
                  aria-label={
                    mode === 'edit'
                      ? `Régler ${cat}, actuellement ${formatValue(series, v)}`
                      : `${cat} : ${formatValue(series, v)}`
                  }
                  onKeyDown={(e) => handleKey(e, i)}
                  style={{ cursor: canEdit ? 'ns-resize' : mode === 'read' ? 'pointer' : 'default', outline: 'none' }}
                />
              )}
              {/* Étiquette de catégorie. */}
              <text
                x={barX(i) + barW / 2}
                y={PLOT.bottom + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                pointerEvents="none"
              >
                {cat}
              </text>
              {/* Valeur au sommet, seulement quand elle est demandée. */}
              {(isSel || isMax || isMin || canEdit) && (
                <text
                  x={barX(i) + barW / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#0f172a"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
