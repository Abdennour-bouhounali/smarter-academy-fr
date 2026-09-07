import React from 'react';
import useDragDrop from '../../../../../common/manip6e/useDragDrop';

/**
 * ShapeComposer — découper et recomposer une figure, EN LA FAISANT GLISSER.
 *
 * Demande utilisateur du 2026-09-07 : « make them a drag and drop ». Déplacer
 * un morceau de surface, ce n'est pas remplir un formulaire en deux clics —
 * c'est le prendre et le poser ailleurs. Le geste dit la mathématique :
 * la pièce se DÉPLACE, elle ne change ni de forme ni d'aire en route.
 *
 * Le geste est délégué à `useDragDrop` (pointeur via `setPointerCapture` +
 * `elementFromPoint`, donc au doigt comme à la souris), et le chemin en deux
 * temps reste intact : activer une pièce la prend (`aria-pressed`), activer un
 * emplacement l'y pose — c'est le chemin clavier / lecteur d'écran, il ne
 * disparaît jamais.
 *
 * `zoneProps` ne fait que MARQUER l'emplacement pour `elementFromPoint` ; les
 * gestionnaires clic/clavier sont posés explicitement en plus.
 *
 * Affichage contrôlé pur — le module possède positions et correction ; la
 * sélection courante vit dans le hook (`dd.held`), et le module la reçoit par
 * `onPieceTap` pour ses propres affichages.
 */
const COLORS = {
  rose: { fill: '#fda4af', stroke: '#e11d48' },
  sky: { fill: '#7dd3fc', stroke: '#0284c7' },
  amber: { fill: '#fcd34d', stroke: '#d97706' },
};

export default function ShapeComposer({
  pieces, // [{ id, cells: [{ r, c }], color }]
  positions, // { [pieceId]: { r, c } } — offset de la pièce sur la grille
  slots = null, // [{ id, r, c, w, h }] — cibles fantômes (on y fait glisser une pièce)
  onPieceTap,
  onSlotTap,
  gridRows,
  gridCols,
  cellSize = 32,
  showAreaBadges = false,
  ariaLabel = 'Atelier de découpage',
}) {
  const W = gridCols * cellSize;
  const H = gridRows * cellSize;

  const dd = useDragDrop({
    onDrop: (pieceId, slotId) => onSlotTap?.(slotId, pieceId),
  });
  const selectedPieceId = dd.held;
  // Le module veut savoir quelle pièce est en main (pour sa consigne) sans
  // dupliquer l'état : on le lui répercute quand — et seulement quand — la
  // main change. `onPieceTap` est un setState stable côté appelant.
  const lastHeld = React.useRef(null);
  React.useEffect(() => {
    if (lastHeld.current === dd.held) return;
    lastHeld.current = dd.held;
    onPieceTap?.(dd.held);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dd.held]);

  const heldPiece = pieces.find((p) => p.id === dd.held);

  return (
    <div className="w-full overflow-x-auto">
      {/* La pièce transportée suit le doigt ; `pointer-events-none` pour
          qu'elle ne masque jamais l'emplacement visé sous le pointeur. */}
      {dd.ghost && heldPiece && (
        <svg
          aria-hidden="true"
          className="fixed z-50 pointer-events-none"
          style={{ left: dd.ghost.x + 12, top: dd.ghost.y + 12 }}
          width={(Math.max(...heldPiece.cells.map((c) => c.c)) + 1) * cellSize}
          height={(Math.max(...heldPiece.cells.map((c) => c.r)) + 1) * cellSize}
        >
          {heldPiece.cells.map((cell, i) => {
            const col = COLORS[heldPiece.color] ?? COLORS.rose;
            return (
              <rect
                key={i}
                x={cell.c * cellSize + 1}
                y={cell.r * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth={2.5}
                opacity={0.85}
              />
            );
          })}
        </svg>
      )}

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

        {/* Emplacements d'accueil */}
        {slots?.map((s) => {
          const hot = dd.hoverZone === s.id;
          return (
            <rect
              key={s.id}
              {...dd.zoneProps(s.id)}
              x={s.c * cellSize + 2}
              y={s.r * cellSize + 2}
              width={s.w * cellSize - 4}
              height={s.h * cellSize - 4}
              rx={6}
              fill={hot ? '#bae6fd' : selectedPieceId ? '#f0f9ff' : 'transparent'}
              stroke={hot ? '#0284c7' : '#94a3b8'}
              strokeWidth={hot ? 3 : 2}
              strokeDasharray="6 4"
              style={{ cursor: selectedPieceId ? 'pointer' : 'default' }}
              onClick={() => dd.dropHere(s.id)}
              role="button"
              tabIndex={0}
              aria-label={`Emplacement ${s.id}${selectedPieceId ? ' — pose ici la pièce en main' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dd.dropHere(s.id); }
              }}
            />
          );
        })}

        {/* Pièces */}
        {pieces.map((p) => {
          const pos = positions[p.id] ?? { r: 0, c: 0 };
          const col = COLORS[p.color] ?? COLORS.rose;
          const selected = selectedPieceId === p.id;
          const src = dd.sourceProps(p.id);
          return (
            // Translation en transform CSS : framer-motion mappe x/y d'un
            // <g> SVG sur des ATTRIBUTS x/y qui n'existent pas — la pièce
            // ne bougerait jamais. Le transform CSS s'applique bien aux
            // éléments SVG et se transitionne proprement.
            <g
              key={p.id}
              {...src}
              style={{
                ...src.style,
                cursor: 'grab',
                transform: `translate(${pos.c * cellSize}px, ${pos.r * cellSize}px) scale(${selected ? 1.04 : 1})`,
                // Pas de transition PENDANT le glissement : la pièce doit
                // atterrir sous le doigt, pas le rattraper un tiers de
                // seconde plus tard.
                transition: dd.ghost ? 'none' : 'transform 0.35s ease',
              }}
              role="button"
              tabIndex={0}
              aria-label={`Pièce de ${p.cells.length} carreaux${selected ? ', en main' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); src.onClick?.(); }
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
              {/* Zone tactile pleine : sans elle, un appui dans l'interstice
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
