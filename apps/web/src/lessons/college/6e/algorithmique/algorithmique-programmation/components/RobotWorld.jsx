import React from 'react';
import { cellCenter, gridToSvg, describePosition, headingArrow } from './algoUtils';

/**
 * RobotWorld — le potager vu d'en haut. AFFICHAGE PUR.
 *
 * Ne contient AUCUNE logique d'exécution : on lui donne une position (issue
 * d'une image de la trace calculée par algoUtils) et il la dessine. Toute la
 * causalité vit dans le moteur ; ce composant ne fait que la rendre visible.
 *
 * ARIA (playbook §10.4) : ce SVG est purement visuel et ne contient AUCUN
 * <button> — `role="img"` est donc correct ici. Les commandes vivent dans
 * ProgramStrip, en dehors du SVG. L'aria-label énonce la LECTURE de la
 * scène (« ROBI en colonne 2, ligne 1, tourné vers le haut »).
 *
 * §10.3 : tous les éléments décoratifs portent pointerEvents:'none' — aucun
 * n'intercepte de tap (il n'y a pas de zone tactile ici, mais la règle
 * protège des évolutions futures).
 * §10.8 : le robot est déplacé par un `transform` CSS sur un <g>, jamais par
 * un animate={{x,y}} framer-motion (qui viserait des attributs inexistants).
 */

const DECOR = { pointerEvents: 'none' };

export default function RobotWorld({
  world,
  pos,                 // { col, row, heading } — l'image courante
  trail = [],          // [{col,row}] — le chemin réellement parcouru
  collected = [],      // ids de cases déjà ramassées
  blocked = false,     // le robot vient de heurter un mur/obstacle
  ghost = null,        // { col, row } — position visée (aide facultative)
  height,
  label,               // remplace l'aria-label calculé si fourni
  reduced = false,     // useReducedMotion() du module appelant
}) {
  const { width, height: vbHeight, step } = world;
  const robot = cellCenter(world, pos.col, pos.row);
  const r = step * 0.34;

  const trailPoints = trail
    .map((t) => cellCenter(world, t.col, t.row))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div
      className="w-full flex justify-center"
      style={{ touchAction: 'manipulation' }}
    >
      <svg
        viewBox={`0 0 ${width} ${vbHeight}`}
        style={{ maxWidth: '100%', height: height ? `${height}px` : 'auto' }}
        role="img"
        aria-label={label ?? `Potager : ROBI est en ${describePosition(pos)}`}
        className="select-none"
      >
        {/* fond */}
        <rect x="0" y="0" width={width} height={vbHeight} rx="14" fill="#f8fafc" style={DECOR} />

        {/* cases */}
        {Array.from({ length: world.rows }).map((_, row) =>
          Array.from({ length: world.cols }).map((__, col) => {
            const { x, y } = gridToSvg(world, col, row);
            return (
              <rect
                key={`c${col}-${row}`}
                x={x + 1.5}
                y={y + 1.5}
                width={step - 3}
                height={step - 3}
                rx="7"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                style={DECOR}
              />
            );
          })
        )}

        {/* obstacles */}
        {(world.obstacles || []).map((o) => {
          const { x, y } = gridToSvg(world, o.col, o.row);
          return (
            <g key={`o${o.col}-${o.row}`} style={DECOR}>
              <rect x={x + 1.5} y={y + 1.5} width={step - 3} height={step - 3} rx="7" fill="#475569" />
              <text
                x={x + step / 2}
                y={y + step / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={step * 0.5}
              >
                🪨
              </text>
            </g>
          );
        })}

        {/* case cible */}
        {world.target && (() => {
          const { x, y } = gridToSvg(world, world.target.col, world.target.row);
          return (
            <g style={DECOR}>
              <rect
                x={x + 1.5}
                y={y + 1.5}
                width={step - 3}
                height={step - 3}
                rx="7"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text
                x={x + step / 2}
                y={y + step / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={step * 0.5}
              >
                🚩
              </text>
            </g>
          );
        })()}

        {/* objets à ramasser */}
        {(world.items || []).map((it) => {
          const c = cellCenter(world, it.col, it.row);
          const done = collected.includes(`${it.col},${it.row}`);
          return (
            <text
              key={`i${it.col}-${it.row}`}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={step * 0.46}
              opacity={done ? 0.22 : 1}
              style={DECOR}
            >
              {it.emoji || '🥕'}
            </text>
          );
        })}

        {/* case de départ */}
        {(() => {
          const c = cellCenter(world, world.start.col, world.start.row);
          return (
            <circle cx={c.x} cy={c.y} r={step * 0.09} fill="#94a3b8" opacity="0.5" style={DECOR} />
          );
        })()}

        {/* chemin réellement parcouru */}
        {trail.length > 1 && (
          <polyline
            points={trailPoints}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
            style={DECOR}
          />
        )}

        {/* case visée (aide facultative) */}
        {ghost && (() => {
          const { x, y } = gridToSvg(world, ghost.col, ghost.row);
          return (
            <rect
              x={x + 4}
              y={y + 4}
              width={step - 8}
              height={step - 8}
              rx="6"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              style={DECOR}
            />
          );
        })()}

        {/* ROBI — transform CSS (§10.8), jamais animate={{x,y}} sur un <g> */}
        <g
          style={{
            ...DECOR,
            transform: `translate(${robot.x}px, ${robot.y}px)`,
            transition: reduced ? 'none' : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* le cône de direction : la direction se VOIT, pas seulement se lit */}
          <g
            style={{
              transform: `rotate(${pos.heading * 90}deg)`,
              transition: reduced ? 'none' : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <path
              d={`M ${-r * 0.52} ${-r * 0.92} L 0 ${-r * 1.62} L ${r * 0.52} ${-r * 0.92} Z`}
              fill={blocked ? '#f43f5e' : '#6366f1'}
            />
          </g>
          <circle
            r={r}
            fill={blocked ? '#ffe4e6' : '#e0e7ff'}
            stroke={blocked ? '#f43f5e' : '#6366f1'}
            strokeWidth="2.5"
          />
          <text textAnchor="middle" dominantBaseline="central" fontSize={r * 1.15} y={r * 0.04}>
            🤖
          </text>
        </g>

        {/* choc contre un mur : la conséquence est visible, pas seulement écrite */}
        {blocked && (
          <text
            x={robot.x}
            y={robot.y - step * 0.62}
            textAnchor="middle"
            fontSize={step * 0.34}
            style={DECOR}
          >
            💥
          </text>
        )}
      </svg>
    </div>
  );
}

/** Lecture textuelle de la scène — doublon écrit de l'information visuelle. */
export function WorldReadout({ pos, blocked }) {
  return (
    <p className="text-xs font-mono text-slate-600 text-center tabular-nums">
      ROBI : colonne {pos.col}, ligne {pos.row} · regarde {headingArrow(pos.heading)}{' '}
      {blocked && <span className="text-rose-600 font-bold">· bloqué !</span>}
    </p>
  );
}
