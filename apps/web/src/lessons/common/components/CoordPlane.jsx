import React, { useRef, useState, useCallback } from 'react';

/**
 * CoordPlane — le repère orthogonal du collège, quatre quadrants.
 *
 * Complète `NumberLine` (une dimension) et `CoordGrid` (6e : premier
 * quadrant, cases et nœuds). Ici les coordonnées sont RELATIVES : c'est ce
 * qui distingue le repérage de 3e de celui de 6e, et c'est aussi ce dont les
 * vecteurs ont besoin.
 *
 * RÈGLES D'INGÉNIERIE (playbook §10), les mêmes que CoordGrid :
 *  - Une SEULE zone tactile : un <rect> transparent plein cadre converti en
 *    coordonnées par `svgToCoord`. Le nombre de nœuds interactifs ne dépend
 *    donc pas de la taille du repère.
 *  - Tout le décor porte pointerEvents:'none' — peint après la zone tactile,
 *    il l'intercepterait.
 *  - role="group" dès qu'il y a une zone tactile (un role="img" masquerait
 *    l'élément focusable aux lecteurs d'écran).
 *  - Chemin clavier complet (flèches, Home/End, PageUp/PageDown) : aucune
 *    mécanique n'est réservée au pointeur.
 *
 * CE QUI EST DESSINÉ EST DÉRIVÉ DES DONNÉES. Le composant ne reçoit aucun
 * drapeau de style décidant qu'un segment « est » une longueur ou qu'une
 * flèche « est » un vecteur : il reçoit des points et des couples de points,
 * et la leçon garde la responsabilité du sens.
 *
 * REPÈRE : y mathématique vers le HAUT. La conversion vers le y SVG (vers le
 * bas) se fait ici et NULLE PART AILLEURS — les leçons manipulent toujours
 * des coordonnées d'élève.
 */

const PAD = 30;

/** Fabrique le transformateur coordonnées ⇄ SVG pour une étendue donnée. */
export function planeGeometry(range, unit = 34) {
  const { xMin, xMax, yMin, yMax } = range;
  const width = (xMax - xMin) * unit + 2 * PAD;
  const height = (yMax - yMin) * unit + 2 * PAD;
  const toSvg = (x, y) => ({
    x: PAD + (x - xMin) * unit,
    y: PAD + (yMax - y) * unit,
  });
  const toCoord = (sx, sy) => ({
    x: (sx - PAD) / unit + xMin,
    y: yMax - (sy - PAD) / unit,
  });
  return { width, height, unit, toSvg, toCoord, range };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Arrondit au pas de la grille et borne au cadre. */
export function snapCoord(p, range, step = 1) {
  return {
    x: clamp(Math.round(p.x / step) * step, range.xMin, range.xMax),
    y: clamp(Math.round(p.y / step) * step, range.yMin, range.yMax),
  };
}

/** Écriture française d'un couple de coordonnées : (3 ; −2). */
export function formatCoords(p, decimals = 0) {
  const fmt = (v) => {
    const r = decimals > 0 ? v.toFixed(decimals).replace('.', ',') : String(Math.round(v));
    return r.replace('-', '−'); // moins typographique
  };
  return `(${fmt(p.x)} ; ${fmt(p.y)})`;
}

export default function CoordPlane({
  range = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  unit = 34,
  step = 1,
  points = [],
  onPointChange,
  draggableId = null,
  segments = [],
  polygons = [],
  arrows = [],
  guides = null,
  ghost = null,
  target = null,
  overlay = null,
  showGrid = true,
  axisLabels = { x: 'x', y: 'y' },
  disabled = false,
  size,
  ariaLabel,
  caption = true,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [focused, setFocused] = useState(false);
  const [settled, setSettled] = useState(true);

  const geo = planeGeometry(range, unit);
  const { toSvg, toCoord, width, height } = geo;
  const interactive = !disabled && !!draggableId && typeof onPointChange === 'function';
  const active = points.find((p) => p.id === draggableId) ?? null;

  const coordFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const sx = ((clientX - rect.left) / rect.width) * width;
      const sy = ((clientY - rect.top) / rect.height) * height;
      return snapCoord(toCoord(sx, sy), range, step);
    },
    [width, height, toCoord, range, step]
  );

  const commit = (p) => {
    if (!p || !interactive) return;
    onPointChange(p);
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragging.current = true;
    setSettled(false);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché — sans conséquence */
    }
    commit(coordFromClient(e.clientX, e.clientY));
  };

  const handlePointerMove = (e) => {
    if (!interactive || !dragging.current) return;
    commit(coordFromClient(e.clientX, e.clientY));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setSettled(true);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
  };

  /** L'alternative obligatoire au glisser. */
  const handleKeyDown = (e) => {
    if (!interactive || !active) return;
    const moves = {
      ArrowRight: { x: active.x + step, y: active.y },
      ArrowLeft: { x: active.x - step, y: active.y },
      ArrowUp: { x: active.x, y: active.y + step },
      ArrowDown: { x: active.x, y: active.y - step },
      Home: { x: range.xMin, y: active.y },
      End: { x: range.xMax, y: active.y },
      PageUp: { x: active.x, y: range.yMax },
      PageDown: { x: active.x, y: range.yMin },
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    commit(snapCoord(next, range, step));
  };

  const gridLines = [];
  if (showGrid) {
    for (let x = Math.ceil(range.xMin); x <= range.xMax; x += 1) {
      const a = toSvg(x, range.yMin);
      const b = toSvg(x, range.yMax);
      gridLines.push(
        <line key={`gx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />
      );
    }
    for (let y = Math.ceil(range.yMin); y <= range.yMax; y += 1) {
      const a = toSvg(range.xMin, y);
      const b = toSvg(range.xMax, y);
      gridLines.push(
        <line key={`gy${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />
      );
    }
  }

  const O = toSvg(0, 0);
  const xEnd = toSvg(range.xMax, 0);
  const yEnd = toSvg(0, range.yMax);

  const label = active
    ? `${active.name ?? 'point'} en ${formatCoords(active)}`
    : 'aucun point mobile';

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[460px] select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ width: size, touchAction: dragging.current ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? 'Repère du plan' }
          : { role: 'img', 'aria-label': ariaLabel ?? 'Repère du plan' })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <marker id="cp-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
          </marker>
          <marker id="cp-arrow-ghost" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* ── Décor : jamais de pointerEvents ── */}
        <g style={{ pointerEvents: 'none' }}>
          {gridLines}

          {/* Axes, avec flèches et noms */}
          <line x1={toSvg(range.xMin, 0).x} y1={O.y} x2={xEnd.x} y2={O.y}
            stroke="#0f172a" strokeWidth="2" markerEnd="url(#cp-arrow)" opacity="0.85" />
          <line x1={O.x} y1={toSvg(0, range.yMin).y} x2={yEnd.x} y2={yEnd.y}
            stroke="#0f172a" strokeWidth="2" markerEnd="url(#cp-arrow)" opacity="0.85" />
          {/* Les noms d'axes vivent dans la marge : posés près de la flèche,
              ils chevauchaient la pointe ET la dernière graduation (défaut vu
              en revue visuelle). */}
          <text x={xEnd.x + 14} y={O.y + 5} textAnchor="middle" fontSize="13"
            className="font-mono" fill="#475569">{axisLabels.x}</text>
          <text x={O.x} y={yEnd.y - 12} textAnchor="middle" fontSize="13"
            className="font-mono" fill="#475569">{axisLabels.y}</text>
          <text x={O.x - 8} y={O.y + 16} textAnchor="end" fontSize="12"
            className="font-mono" fill="#64748b">O</text>

          {/* Graduations : un nombre sur deux quand le repère est dense */}
          {Array.from({ length: Math.floor(range.xMax - range.xMin) + 1 }, (_, i) => {
            const x = Math.ceil(range.xMin) + i;
            if (x === 0 || x > range.xMax) return null;
            const dense = range.xMax - range.xMin > 12;
            const p = toSvg(x, 0);
            return (
              <g key={`tx${x}`}>
                <line x1={p.x} y1={p.y - 4} x2={p.x} y2={p.y + 4} stroke="#0f172a" strokeWidth="1.5" />
                {(!dense || x % 2 === 0) && (
                  <text x={p.x} y={p.y + 17} textAnchor="middle" fontSize="10"
                    className="font-mono tabular-nums" fill="#64748b">
                    {String(x).replace('-', '−')}
                  </text>
                )}
              </g>
            );
          })}
          {Array.from({ length: Math.floor(range.yMax - range.yMin) + 1 }, (_, i) => {
            const y = Math.ceil(range.yMin) + i;
            if (y === 0 || y > range.yMax) return null;
            const dense = range.yMax - range.yMin > 12;
            const p = toSvg(0, y);
            return (
              <g key={`ty${y}`}>
                <line x1={p.x - 4} y1={p.y} x2={p.x + 4} y2={p.y} stroke="#0f172a" strokeWidth="1.5" />
                {(!dense || y % 2 === 0) && (
                  <text x={p.x - 8} y={p.y + 4} textAnchor="end" fontSize="10"
                    className="font-mono tabular-nums" fill="#64748b">
                    {String(y).replace('-', '−')}
                  </text>
                )}
              </g>
            );
          })}

          {/* Polygones */}
          {polygons.map((poly) => (
            <polygon
              key={poly.id}
              points={poly.points.map((p) => { const s = toSvg(p.x, p.y); return `${s.x},${s.y}`; }).join(' ')}
              fill={poly.fill ?? '#c7d2fe'}
              fillOpacity={poly.fillOpacity ?? 0.35}
              stroke={poly.stroke ?? '#4f46e5'}
              strokeWidth={poly.strokeWidth ?? 2}
              strokeDasharray={poly.dashed ? '6 5' : undefined}
              strokeLinejoin="round"
            />
          ))}

          {/* Segments, avec étiquette de longueur si la leçon en fournit une */}
          {segments.map((s) => {
            const a = toSvg(s.from.x, s.from.y);
            const b = toSvg(s.to.x, s.to.y);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            return (
              <g key={s.id}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={s.color ?? '#0284c7'} strokeWidth={s.width ?? 2.5}
                  strokeDasharray={s.dashed ? '6 5' : undefined} strokeLinecap="round" />
                {s.label && settled && (
                  <text x={mid.x} y={mid.y - 7} textAnchor="middle" fontSize="12"
                    className="font-mono font-semibold tabular-nums" fill={s.color ?? '#0369a1'}>
                    {s.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Flèches — une leçon les utilise pour les vecteurs, une autre pour
              un déplacement : le composant ne tranche pas. */}
          {arrows.map((a) => {
            const from = toSvg(a.from.x, a.from.y);
            const to = toSvg(a.to.x, a.to.y);
            const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
            const ghosted = a.ghost === true;
            return (
              <g key={a.id}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={ghosted ? '#94a3b8' : (a.color ?? '#7c3aed')}
                  strokeWidth={a.width ?? 3}
                  strokeDasharray={a.dashed ? '6 5' : undefined}
                  strokeLinecap="round"
                  markerEnd={ghosted ? 'url(#cp-arrow-ghost)' : 'url(#cp-arrow)'}
                  opacity={ghosted ? 0.6 : 1}
                />
                {a.label && (
                  <text x={mid.x + 8} y={mid.y - 8} fontSize="13"
                    className="font-semibold" fill={ghosted ? '#64748b' : (a.color ?? '#6d28d9')}>
                    {a.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Guides de lecture — les deux projections d'un point */}
          {guides && (() => {
            const p = toSvg(guides.x, guides.y);
            const ax = toSvg(guides.x, 0);
            const ay = toSvg(0, guides.y);
            return (
              <g>
                <line x1={p.x} y1={p.y} x2={ax.x} y2={ax.y}
                  stroke="#0284c7" strokeWidth="2" strokeDasharray="5 4" />
                <line x1={p.x} y1={p.y} x2={ay.x} y2={ay.y}
                  stroke="#059669" strokeWidth="2" strokeDasharray="5 4" />
                <circle cx={ax.x} cy={ax.y} r="4" fill="#0284c7" />
                <circle cx={ay.x} cy={ay.y} r="4" fill="#059669" />
              </g>
            );
          })()}

          {/* Cible : pointillé ambre, la convention maison */}
          {target && (() => {
            const p = toSvg(target.x, target.y);
            return <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#f59e0b"
              strokeWidth="2.5" strokeDasharray="4 4" />;
          })()}

          {/* Fantôme : la vérité révélée, ou l'erreur montrée */}
          {ghost && (() => {
            const p = toSvg(ghost.x, ghost.y);
            return (
              <g opacity="0.6">
                <circle cx={p.x} cy={p.y} r="7" fill="#94a3b8" />
                {ghost.label && (
                  <text x={p.x + 10} y={p.y - 9} fontSize="11"
                    className="font-mono" fill="#475569">{ghost.label}</text>
                )}
              </g>
            );
          })()}

          {/* Points */}
          {points.map((p) => {
            const s = toSvg(p.x, p.y);
            const isActive = p.id === draggableId;
            return (
              <g key={p.id}>
                <circle
                  cx={s.x} cy={s.y} r={isActive ? 8 : 6}
                  fill={p.color ?? (isActive ? '#4f46e5' : '#e11d48')}
                  stroke="#ffffff" strokeWidth="2"
                />
                {p.name && (
                  <text x={s.x + 10} y={s.y - 9} fontSize="14" fontWeight="700"
                    className="font-space" fill="#0f172a">{p.name}</text>
                )}
              </g>
            );
          })}

          {overlay?.(toSvg, geo)}
        </g>

        {/* ── Zone tactile unique, au-dessus du décor ── */}
        {interactive && (
          <rect
            x="0" y="0" width={width} height={height}
            fill="transparent"
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel ?? 'Repère du plan — déplace le point'}
            aria-valuetext={label}
            aria-valuemin={range.xMin}
            aria-valuemax={range.xMax}
            aria-valuenow={active?.x ?? 0}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ outline: 'none' }}
          />
        )}
        {interactive && focused && (
          <rect x="1" y="1" width={width - 2} height={height - 2}
            fill="none" stroke="#3b82f6" strokeWidth="2" rx="8"
            style={{ pointerEvents: 'none' }} />
        )}
      </svg>

      {/* La couleur n'est jamais seule porteuse d'information. */}
      {caption && interactive && active && (
        <p className="text-sm font-mono font-semibold text-slate-700 tabular-nums" aria-live="polite">
          {active.name ? `${active.name} ` : ''}{formatCoords(active)}
        </p>
      )}
    </div>
  );
}
