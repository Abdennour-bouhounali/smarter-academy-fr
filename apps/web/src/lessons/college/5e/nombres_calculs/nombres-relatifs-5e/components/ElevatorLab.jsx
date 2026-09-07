import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { fmt, IMMEUBLE } from './relatifs';

/**
 * ElevatorLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève fait MONTER et DESCENDRE une cabine dans un immeuble qui continue
 * sous le sol. Le sol est le zéro, matérialisé par une ligne épaisse : c'est
 * en la traversant que le nombre change de côté, et que le signe apparaît
 * comme une information de position et non comme une opération.
 *
 * Cause → effet immédiat : chaque geste (glisser la cabine, flèche, clavier)
 * redéplace la cabine ET réécrit l'étage affiché, depuis le même état. Aucun
 * bouton « Valider » entre l'action et sa conséquence.
 *
 * Sécurité visuelle (§17bis) : la géométrie est CALCULÉE à partir de la plage
 * d'étages. Les libellés d'étage vivent dans le DOM, à gauche de la cage, dans
 * leur propre colonne — jamais en <text> SVG par-dessus le dessin —, si bien
 * qu'aucun texte ne peut chevaucher la cabine quelle que soit sa position.
 * La cage se dimensionne pour la plage demandée, pas pour un cas par défaut.
 */

const FLOOR_H = 44;      // hauteur d'un étage, en px
const CAGE_W = 92;       // largeur de la cage
const PAD_Y = 10;

export default function ElevatorLab({
  value,                        // étage courant (nombre relatif)
  onChange,                     // (etage) => void
  min = IMMEUBLE.min,
  max = IMMEUBLE.max,
  target = null,                // étage à atteindre (anneau ambre), ou null
  reperes = IMMEUBLE.reperes,   // { [etage]: libellé }
  disabled = false,
  showSign = true,              // afficher l'écriture relative de l'étage
  ariaLabel,
}) {
  const uid = useId();
  const cageRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const floors = [];
  for (let f = max; f >= min; f--) floors.push(f);

  const height = floors.length * FLOOR_H + PAD_Y * 2;
  // y du CENTRE de l'étage f. Dérivé de la plage : rien n'est codé en dur.
  const yOf = (f) => PAD_Y + (max - f) * FLOOR_H + FLOOR_H / 2;

  const clamp = useCallback((f) => Math.max(min, Math.min(max, f)), [min, max]);

  const move = useCallback(
    (f) => {
      if (disabled) return;
      const next = clamp(Math.round(f));
      if (next !== value) onChange?.(next);
    },
    [clamp, disabled, onChange, value],
  );

  /** Convertit une position écran en étage, pour le glisser. */
  const floorFromClientY = useCallback(
    (clientY) => {
      const box = cageRef.current?.getBoundingClientRect();
      if (!box) return value;
      const ratio = (clientY - box.top) / box.height;
      return max - (ratio * height - PAD_Y) / FLOOR_H + 0.5;
    },
    [height, max, value],
  );

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      move(floorFromClientY(y));
    };
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, floorFromClientY, move]);

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowUp') { e.preventDefault(); move(value + 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(value - 1); }
    if (e.key === 'Home') { e.preventDefault(); move(max); }
    if (e.key === 'End') { e.preventDefault(); move(min); }
  };

  const yCab = yOf(value);
  const ySol = yOf(0);
  const atTarget = target !== null && value === target;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-stretch gap-2 sm:gap-3">
        {/* Colonne des libellés — dans le DOM, jamais par-dessus le dessin. */}
        <ul className="shrink-0 w-[104px] sm:w-[190px]" style={{ paddingTop: PAD_Y }}>
          {floors.map((f) => (
            <li
              key={f}
              style={{ height: FLOOR_H }}
              className="flex items-center justify-end pr-1 text-right leading-tight"
            >
              <span
                className={[
                  'text-xs sm:text-sm truncate',
                  f === value ? 'font-black text-indigo-700' : 'text-slate-500',
                  f === 0 ? 'font-bold text-slate-800' : '',
                ].join(' ')}
                title={reperes?.[f] || `Étage ${fmt(f)}`}
              >
                {reperes?.[f] || `Étage ${fmt(f)}`}
              </span>
            </li>
          ))}
        </ul>

        {/* La cage — dessin pur, aucun texte dedans. */}
        <svg
          ref={cageRef}
          viewBox={`0 0 ${CAGE_W} ${height}`}
          width={CAGE_W}
          height={height}
          className="shrink-0 touch-none select-none"
          style={{ maxHeight: height }}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`Étage ${fmt(value)}`}
          aria-label={ariaLabel || 'Cage d’ascenseur — flèches haut et bas pour changer d’étage'}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          onMouseDown={(e) => { if (!disabled) { setDragging(true); move(floorFromClientY(e.clientY)); } }}
          onTouchStart={(e) => { if (!disabled) { setDragging(true); move(floorFromClientY(e.touches[0].clientY)); } }}
        >
          <defs>
            <linearGradient id={`${uid}-cab`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Paliers */}
          {floors.map((f) => (
            <line
              key={f}
              x1="6" x2={CAGE_W - 6}
              y1={yOf(f) + FLOOR_H / 2} y2={yOf(f) + FLOOR_H / 2}
              stroke="#e2e8f0" strokeWidth="1"
            />
          ))}

          {/* Le sol : la ligne du zéro, épaisse — le repère de toute la leçon. */}
          <line
            x1="0" x2={CAGE_W} y1={ySol + FLOOR_H / 2} y2={ySol + FLOOR_H / 2}
            stroke="#0f172a" strokeWidth="3"
          />

          {/* Rails */}
          <line x1="14" x2="14" y1={PAD_Y} y2={height - PAD_Y} stroke="#cbd5e1" strokeWidth="2" />
          <line x1={CAGE_W - 14} x2={CAGE_W - 14} y1={PAD_Y} y2={height - PAD_Y} stroke="#cbd5e1" strokeWidth="2" />

          {/* Cible */}
          {target !== null && (
            <rect
              x="18" y={yOf(target) - FLOOR_H / 2 + 4}
              width={CAGE_W - 36} height={FLOOR_H - 8}
              rx="8" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4"
            />
          )}

          {/* La cabine */}
          <g style={{ transition: dragging ? 'none' : 'transform 180ms ease-out' }}
             transform={`translate(0 ${yCab - height / 2})`}>
            <rect
              x="20" y={height / 2 - FLOOR_H / 2 + 5}
              width={CAGE_W - 40} height={FLOOR_H - 10}
              rx="7"
              fill={`url(#${uid}-cab)`}
              stroke={atTarget ? '#f59e0b' : '#3730a3'}
              strokeWidth={atTarget ? 3 : 2}
            />
            <line
              x1={CAGE_W / 2} x2={CAGE_W / 2}
              y1={height / 2 - FLOOR_H / 2 + 9} y2={height / 2 + FLOOR_H / 2 - 9}
              stroke="#c7d2fe" strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Commandes + lecture de l'étage : hors du dessin, taille tactile. */}
        <div className="flex flex-col items-center justify-center gap-2 grow min-w-0">
          <button
            type="button" disabled={disabled || value >= max}
            onClick={() => move(value + 1)}
            aria-label="Monter d’un étage"
            className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-slate-300 bg-white text-lg font-black text-slate-700 disabled:opacity-40 hover:border-indigo-400"
          >
            ▲
          </button>

          <div className="text-center px-1">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Étage</div>
            <div className={`text-3xl sm:text-4xl font-black tabular-nums ${value < 0 ? 'text-rose-600' : value > 0 ? 'text-indigo-700' : 'text-slate-800'}`}>
              {showSign ? fmt(value) : Math.abs(value)}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[110px]">
              {value === 0 ? 'le sol' : value > 0 ? 'au-dessus du sol' : 'sous le sol'}
            </div>
          </div>

          <button
            type="button" disabled={disabled || value <= min}
            onClick={() => move(value - 1)}
            aria-label="Descendre d’un étage"
            className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-slate-300 bg-white text-lg font-black text-slate-700 disabled:opacity-40 hover:border-indigo-400"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
