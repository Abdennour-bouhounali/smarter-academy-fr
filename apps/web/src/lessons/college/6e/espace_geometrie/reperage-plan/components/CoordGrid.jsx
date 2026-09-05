import React, { useRef, useState, useCallback } from 'react';
import {
  gridToSvg, svgToGrid, cellCenterToSvg, clampNode, samePoint,
  formatCoords, readCoords, formatCell,
} from './reperageUtils';

/**
 * CoordGrid — le quadrillage repérable de la leçon.
 *
 * RÈGLES D'INGÉNIERIE (playbook §10) appliquées ici :
 *  - Une SEULE zone tactile : un <rect> transparent plein cadre, converti en
 *    nœud par svgToGrid. Le nombre de nœuds interactifs ne dépend donc PAS de
 *    la taille du quadrillage (un 7×6 resterait sous le plafond de 52 même
 *    s'il portait 56 nœuds).
 *  - Tout le décor (traits, graduations, étiquettes, trajet, marqueurs) porte
 *    pointerEvents:'none' : peint après la zone tactile, il l'intercepterait.
 *  - role="img" UNIQUEMENT en mode display. Dès qu'il y a une zone tactile,
 *    le SVG est un role="group" contenant un vrai élément focusable — un
 *    role="img" masquerait ce dernier aux lecteurs d'écran.
 *  - Chemin clavier complet sur le marqueur (flèches, Home/End, PageUp/Down),
 *    en plus du tap : aucune mécanique n'est réservée au pointeur.
 *
 * MODES
 *  display  visuel pur, aucune interaction
 *  place    l'élève pose/déplace le marqueur (tap + glisser + clavier)
 *  read     l'élève tire deux guides pour lire les coordonnées d'un point
 *  cells    repérage par cases (A3) au lieu de nœuds
 */
export default function CoordGrid({
  grid,
  mode = 'display',
  point = null,
  onPointChange,
  target = null,
  ghost = null,
  guides = { vertical: null, horizontal: null },
  onGuideChange,
  trail = null,
  overlay = [],
  labelledNodes = [],
  highlightDiagonal = false,
  selectedCell = null,
  onCellSelect,
  showCoordsBadge = true,
  disabled = false,
  size,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const [focusHint, setFocusHint] = useState(false);
  const interactive = !disabled && (mode === 'place' || mode === 'read' || mode === 'cells');

  const { cols, rows, step } = grid;

  /** Coordonnées client → nœud du quadrillage, via le viewBox. */
  const nodeFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = ((clientX - rect.left) / rect.width) * grid.width;
      const y = ((clientY - rect.top) / rect.height) * grid.height;
      return svgToGrid(grid, x, y);
    },
    [grid]
  );

  const commit = (node) => {
    if (!node) return;
    const next = clampNode(node, grid);
    if (mode === 'cells') {
      // Une case est repérée par son coin bas-gauche ; le dernier rang de
      // nœuds ne porte aucune case, d'où le clamp à cols-1 / rows-1.
      onCellSelect?.({
        colonne: Math.min(next.col, cols - 1),
        ligne: Math.min(next.row, rows - 1),
      });
      return;
    }
    if (mode === 'read') {
      onGuideChange?.({ vertical: next.col, horizontal: next.row });
      return;
    }
    onPointChange?.(next);
  };

  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché — sans conséquence */
    }
    commit(nodeFromClient(e.clientX, e.clientY));
  };

  const handlePointerMove = (e) => {
    if (!interactive || !dragging.current) return;
    commit(nodeFromClient(e.clientX, e.clientY));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
  };

  /** Chemin clavier — l'alternative obligatoire au glisser. */
  const handleKeyDown = (e) => {
    if (!interactive) return;
    const base = mode === 'read'
      ? { col: guides.vertical ?? 0, row: guides.horizontal ?? 0 }
      : mode === 'cells'
        ? { col: selectedCell?.colonne ?? 0, row: selectedCell?.ligne ?? 0 }
        : point ?? { col: 0, row: 0 };
    const moves = {
      ArrowRight: { col: base.col + 1, row: base.row },
      ArrowLeft: { col: base.col - 1, row: base.row },
      ArrowUp: { col: base.col, row: base.row + 1 },
      ArrowDown: { col: base.col, row: base.row - 1 },
      Home: { col: 0, row: base.row },
      End: { col: cols, row: base.row },
      PageUp: { col: base.col, row: rows },
      PageDown: { col: base.col, row: 0 },
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    commit(next);
  };

  const px = (col, row) => gridToSvg(grid, col, row);
  const maxDiag = Math.min(cols, rows);

  const currentLabel = mode === 'read'
    ? (guides.vertical != null && guides.horizontal != null
      ? `guides croisés en ${formatCoords({ col: guides.vertical, row: guides.horizontal })}`
      : 'aucun guide posé')
    : mode === 'cells'
      ? (selectedCell ? `case ${formatCell(selectedCell.colonne, selectedCell.ligne)}` : 'aucune case choisie')
      : point
        ? readCoords(point)
        : 'aucun point posé';

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${grid.width} ${grid.height}`}
        className="w-full max-w-[560px] select-none"
        style={{ width: size, touchAction: mode === 'place' ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? 'Quadrillage repérable' }
          : { role: 'img', 'aria-label': ariaLabel ?? 'Quadrillage' })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* ── Décor : jamais de pointerEvents, il masquerait la zone tactile ── */}
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={px(0, rows).x}
            y={px(0, rows).y}
            width={cols * step}
            height={rows * step}
            fill="#ffffff"
          />

          {highlightDiagonal && (
            <line
              x1={px(0, 0).x} y1={px(0, 0).y} x2={px(maxDiag, maxDiag).x} y2={px(maxDiag, maxDiag).y}
              stroke="#a5b4fc" strokeWidth="2.5" strokeDasharray="6 5"
            />
          )}

          {/* Traits du quadrillage */}
          {Array.from({ length: cols + 1 }, (_, c) => (
            <line
              key={`v${c}`}
              x1={px(c, 0).x} y1={px(c, 0).y} x2={px(c, rows).x} y2={px(c, rows).y}
              stroke="#e2e8f0" strokeWidth="1"
            />
          ))}
          {Array.from({ length: rows + 1 }, (_, r) => (
            <line
              key={`h${r}`}
              x1={px(0, r).x} y1={px(0, r).y} x2={px(cols, r).x} y2={px(cols, r).y}
              stroke="#e2e8f0" strokeWidth="1"
            />
          ))}

          {/* Axes, épais : l'origine est en bas à gauche */}
          <line x1={px(0, 0).x} y1={px(0, 0).y} x2={px(cols, 0).x} y2={px(cols, 0).y} stroke="#0f172a" strokeWidth="2.5" />
          <line x1={px(0, 0).x} y1={px(0, 0).y} x2={px(0, rows).x} y2={px(0, rows).y} stroke="#0f172a" strokeWidth="2.5" />

          {/* Graduations */}
          {Array.from({ length: cols + 1 }, (_, c) => (
            <text
              key={`lx${c}`}
              x={px(c, 0).x} y={px(c, 0).y + 18}
              textAnchor="middle" className="font-mono" fontSize="11" fill="#64748b"
            >
              {c}
            </text>
          ))}
          {Array.from({ length: rows + 1 }, (_, r) => (
            <text
              key={`ly${r}`}
              x={px(0, r).x - 10} y={px(0, r).y + 4}
              textAnchor="end" className="font-mono" fontSize="11" fill="#64748b"
            >
              {r}
            </text>
          ))}

          {/* Étiquettes de cases (mode cells) */}
          {mode === 'cells' && Array.from({ length: cols }, (_, c) =>
            Array.from({ length: rows }, (_, r) => {
              const ctr = cellCenterToSvg(grid, c, r);
              const on = selectedCell && selectedCell.colonne === c && selectedCell.ligne === r;
              return (
                <g key={`cell${c}-${r}`}>
                  {on && (
                    <rect
                      x={ctr.x - step / 2} y={ctr.y - step / 2} width={step} height={step}
                      fill="#c7d2fe" opacity="0.75"
                    />
                  )}
                  <text
                    x={ctr.x} y={ctr.y + 4} textAnchor="middle"
                    className="font-mono" fontSize="10" fill={on ? '#3730a3' : '#cbd5e1'}
                  >
                    {formatCell(c, r)}
                  </text>
                </g>
              );
            })
          )}

          {/* Trajet parcouru */}
          {trail && trail.length > 1 && (
            <polyline
              points={trail.map((n) => { const p = px(n.col, n.row); return `${p.x},${p.y}`; }).join(' ')}
              fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
            />
          )}

          {/* Cible à atteindre — pointillé ambre, la convention maison */}
          {target && (
            <circle
              cx={px(target.col, target.row).x} cy={px(target.col, target.row).y}
              r="13" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4"
            />
          )}

          {/* Guides de lecture */}
          {mode === 'read' && guides.vertical != null && (
            <line
              x1={px(guides.vertical, 0).x} y1={px(guides.vertical, 0).y}
              x2={px(guides.vertical, rows).x} y2={px(guides.vertical, rows).y}
              stroke="#0284c7" strokeWidth="2.5" strokeDasharray="5 4"
            />
          )}
          {mode === 'read' && guides.horizontal != null && (
            <line
              x1={px(0, guides.horizontal).x} y1={px(0, guides.horizontal).y}
              x2={px(cols, guides.horizontal).x} y2={px(cols, guides.horizontal).y}
              stroke="#059669" strokeWidth="2.5" strokeDasharray="5 4"
            />
          )}

          {/* Repères de la carte */}
          {overlay.map((o) => {
            const p = px(o.col, o.row);
            return (
              <g key={`ov-${o.col}-${o.row}-${o.label}`}>
                <circle cx={p.x} cy={p.y} r="4" fill="#0f172a" />
                <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="16">{o.emoji}</text>
                {/* Libellé AU-DESSUS de l'emoji : sous le point, il tombait sur
                    les graduations de l'axe horizontal (collision constatée
                    en revue visuelle). */}
                {o.label && (
                  <text
                    x={o.col === 0 ? p.x + 6 : p.x}
                    y={p.y - 30}
                    textAnchor={o.col === 0 ? 'start' : 'middle'}
                    className="font-mono" fontSize="9" fill="#475569"
                  >
                    {o.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Points nommés */}
          {labelledNodes.map((n) => {
            const p = px(n.col, n.row);
            return (
              <g key={`lb-${n.name}`}>
                <circle cx={p.x} cy={p.y} r="6" fill={n.color ?? '#e11d48'} />
                <text x={p.x + 10} y={p.y - 8} className="font-space" fontSize="14" fontWeight="700" fill="#0f172a">
                  {n.name}
                </text>
              </g>
            );
          })}

          {/* Point fantôme : la vérité révélée après une erreur */}
          {ghost && (() => {
            // Quand le fantôme tombe SUR le point (cas de la diagonale), son
            // étiquette se superposait au marqueur : on la place alors
            // au-dessous, et on n'empile pas deux disques au même endroit.
            const gp = px(ghost.col, ghost.row);
            const overlapping = point && samePoint(point, ghost);
            return (
              <g opacity="0.55">
                {!overlapping && <circle cx={gp.x} cy={gp.y} r="8" fill="#94a3b8" />}
                {ghost.label && (
                  <text
                    x={overlapping ? gp.x : gp.x + 11}
                    y={overlapping ? gp.y + 26 : gp.y - 9}
                    textAnchor={overlapping ? 'middle' : 'start'}
                    className="font-mono" fontSize="11" fill="#475569"
                  >
                    {ghost.label}
                  </text>
                )}
              </g>
            );
          })()}

          {/* Le marqueur de l'élève */}
          {point && (
            <g>
              <circle
                cx={px(point.col, point.row).x} cy={px(point.col, point.row).y}
                r="9" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5"
              />
              {target && samePoint(point, target) && (
                <circle
                  cx={px(point.col, point.row).x} cy={px(point.col, point.row).y}
                  r="15" fill="none" stroke="#10b981" strokeWidth="3"
                />
              )}
            </g>
          )}
        </g>

        {/* ── Zone tactile unique, au-dessus du décor ── */}
        {interactive && (
          <rect
            x="0" y="0" width={grid.width} height={grid.height}
            fill="transparent"
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel ?? 'Quadrillage repérable'}
            aria-valuetext={currentLabel}
            aria-valuemin={0}
            aria-valuemax={cols}
            aria-valuenow={mode === 'read' ? (guides.vertical ?? 0) : (point?.col ?? 0)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocusHint(true)}
            onBlur={() => setFocusHint(false)}
            style={{ outline: 'none' }}
          />
        )}
        {interactive && focusHint && (
          <rect
            x="1" y="1" width={grid.width - 2} height={grid.height - 2}
            fill="none" stroke="#3b82f6" strokeWidth="2" rx="6"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {/* Lecture en toutes lettres — la couleur n'est jamais seule porteuse */}
      {showCoordsBadge && interactive && (
        <p className="text-sm font-mono font-semibold text-slate-700 tabular-nums" aria-live="polite">
          {mode === 'read' && guides.vertical != null && guides.horizontal != null
            ? formatCoords({ col: guides.vertical, row: guides.horizontal })
            : mode === 'cells' && selectedCell
              ? `Case ${formatCell(selectedCell.colonne, selectedCell.ligne)}`
              : point
                ? formatCoords(point)
                : '— touche le quadrillage —'}
        </p>
      )}
    </div>
  );
}
