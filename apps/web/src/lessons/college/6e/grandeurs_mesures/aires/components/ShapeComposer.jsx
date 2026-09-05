import React from 'react';

/**
 * ShapeComposer — découper et recomposer une figure, au tap.
 *
 * Tap une pièce (elle se sélectionne, pulsation), puis tap un emplacement
 * fantôme : le module met à jour `positions` et framer-motion anime le
 * déplacement (layout). Aucun glisser fragile : tap-d'abord, comme
 * OrderingGame/InfoSorter. Affichage contrôlé pur — le module possède
 * sélection, positions et correction.
 */
const COLORS = {
  rose: { fill: '#fda4af', stroke: '#e11d48' },
  sky: { fill: '#7dd3fc', stroke: '#0284c7' },
  amber: { fill: '#fcd34d', stroke: '#d97706' },
};

export default function ShapeComposer({
  pieces, // [{ id, cells: [{ r, c }], color }]
  positions, // { [pieceId]: { r, c } } — offset de la pièce sur la grille
  slots = null, // [{ id, r, c, w, h }] — cibles fantômes (tap pour y poser la pièce sélectionnée)
  selectedPieceId = null,
  onPieceTap,
  onSlotTap,
  gridRows,
  gridCols,
  cellSize = 32,
  showAreaBadges = false,
  disabled = false,
  ariaLabel = 'Atelier de découpage',
}) {
  const W = gridCols * cellSize;
  const H = gridRows * cellSize;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md mx-auto select-none"
        role="group"
        aria-label={ariaLabel}
        style={{ minWidth: Math.min(W, 320) }}
      >
        {/* Quadrillage de fond */}
        {Array.from({ length: gridRows + 1 }).map((_, r) => (
          <line key={`h${r}`} x1={0} y1={r * cellSize} x2={W} y2={r * cellSize} stroke="#e2e8f0" strokeWidth="1" style={{ pointerEvents: 'none' }} />
        ))}
        {Array.from({ length: gridCols + 1 }).map((_, c) => (
          <line key={`v${c}`} x1={c * cellSize} y1={0} x2={c * cellSize} y2={H} stroke="#e2e8f0" strokeWidth="1" style={{ pointerEvents: 'none' }} />
        ))}

        {/* Emplacements fantômes */}
        {slots?.map((s) => (
          <rect
            key={s.id}
            x={s.c * cellSize + 2}
            y={s.r * cellSize + 2}
            width={s.w * cellSize - 4}
            height={s.h * cellSize - 4}
            rx={6}
            fill={selectedPieceId ? '#f0f9ff' : 'transparent'}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="6 4"
            style={{ cursor: disabled || !selectedPieceId ? 'default' : 'pointer' }}
            onClick={() => !disabled && selectedPieceId && onSlotTap?.(s.id)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Emplacement ${s.id}${selectedPieceId ? ' — tape pour y poser la pièce sélectionnée' : ''}`}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && selectedPieceId) { e.preventDefault(); !disabled && onSlotTap?.(s.id); }
            }}
          />
        ))}

        {/* Pièces */}
        {pieces.map((p) => {
          const pos = positions[p.id] ?? { r: 0, c: 0 };
          const col = COLORS[p.color] ?? COLORS.rose;
          const selected = selectedPieceId === p.id;
          return (
            // Translation en transform CSS : framer-motion mappe x/y d'un
            // <g> SVG sur des ATTRIBUTS x/y qui n'existent pas — la pièce
            // ne bougerait jamais. Le transform CSS s'applique bien aux
            // éléments SVG et se transitionne proprement.
            <g
              key={p.id}
              style={{
                cursor: disabled ? 'default' : 'pointer',
                transform: `translate(${pos.c * cellSize}px, ${pos.r * cellSize}px) scale(${selected ? 1.04 : 1})`,
                transition: 'transform 0.35s ease',
              }}
              onClick={() => !disabled && onPieceTap?.(p.id)}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Pièce de ${p.cells.length} carreaux${selected ? ', sélectionnée' : ''}`}
              aria-pressed={selected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && onPieceTap?.(p.id); }
              }}
            >
              {p.cells.map((cell, i) => (
                <rect
                  key={i}
                  x={cell.c * cellSize + 1}
                  y={cell.r * cellSize + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={col.fill}
                  stroke={col.stroke}
                  strokeWidth={selected ? 2.5 : 1.5}
                  opacity={0.92}
                />
              ))}
              {/* Zone tactile pleine : sans elle, un tap dans l'interstice
                  entre deux carreaux de la pièce tombe dans le vide. */}
              <rect
                x={Math.min(...p.cells.map((c) => c.c)) * cellSize}
                y={Math.min(...p.cells.map((c) => c.r)) * cellSize}
                width={(Math.max(...p.cells.map((c) => c.c)) - Math.min(...p.cells.map((c) => c.c)) + 1) * cellSize}
                height={(Math.max(...p.cells.map((c) => c.r)) - Math.min(...p.cells.map((c) => c.r)) + 1) * cellSize}
                fill="transparent"
              />
              {showAreaBadges && (
                <text
                  x={(p.cells[0].c + 0.5) * cellSize}
                  y={(p.cells[0].r + 0.5) * cellSize + 4}
                  textAnchor="middle"
                  style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}
                  fill="#1e293b"
                >
                  {p.cells.length}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
