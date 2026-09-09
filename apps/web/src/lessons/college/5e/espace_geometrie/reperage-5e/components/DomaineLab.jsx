import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DOMAINE, LIEUX, formatAbscissa, formatCoords, sharingAbscissa } from './reperageUtils';

/**
 * DomaineLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * La carte du domaine skiable, et SOUS elle une seule règle graduée
 * horizontale. L'élève ne dispose que d'un curseur : il ne peut donner qu'UN
 * nombre. Quand ce nombre tombe sur une colonne qui porte deux lieux, les
 * DEUX s'allument — et c'est le manque qui ouvre la leçon.
 *
 * Le geste ne « révise » pas l'abscisse, il montre son insuffisance : c'est
 * ce qui distingue ce module de la leçon voisine `nombres-relatifs-5e`, où le
 * même axe sert à construire le signe (voir lesson.config.js).
 *
 * ─── LES DEUX MODES ───────────────────────────────────────────────────
 *   axis="x"   un seul curseur horizontal — la colonne s'allume (modules 1)
 *   axis="xy"  deux curseurs séparés, un par axe — le point est unique (M2)
 *
 * Un curseur commande exactement UN déplacement (INTERACTION_PEDAGOGY §8) :
 * en mode « xy » l'élève bouge l'abscisse OU l'ordonnée, jamais les deux d'un
 * même geste, si bien que le rôle de chaque nombre reste lisible.
 *
 * ─── SÉCURITÉ VISUELLE (§17bis) ───────────────────────────────────────
 * Les noms de lieux vivent dans une couche HTML positionnée en pourcentage,
 * jamais en <text> SVG par-dessus le dessin : ils ne peuvent donc pas
 * chevaucher les graduations, et ils restent à taille de police lisible quelle
 * que soit la largeur. Leur ancrage bascule (au-dessus / en dessous, à gauche /
 * à droite) selon la place réellement disponible, calculée depuis la position
 * du lieu — jamais un décalage fixe qui « marche » au cas par défaut.
 */

const PAD = 30;               // marge autour du quadrillage, en unités SVG
const CELL = 34;              // pixels par unité

export default function DomaineLab({
  axis = 'x',                 // 'x' | 'xy'
  x, y = null,
  onX, onY = null,
  lieux = LIEUX,
  domaine = DOMAINE,
  showHalo = true,            // allumer la colonne partagée (le manque du M1)
  highlightIds = null,        // forcer la mise en avant de certains lieux
  disabled = false,
  ariaLabel,
}) {
  const uid = useId();
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);   // 'x' | 'y' | null

  const { xMin, xMax, yMin, yMax } = domaine;
  const cols = xMax - xMin;
  const rows = yMax - yMin;
  const W = cols * CELL + PAD * 2;
  const H = rows * CELL + PAD * 2;

  const sx = (n) => PAD + (n - xMin) * CELL;
  const sy = (n) => PAD + (yMax - n) * CELL;          // y vers le haut : inversion ICI, une seule fois

  const interactive = !disabled && Boolean(onX);

  const clampX = useCallback((n) => Math.max(xMin, Math.min(xMax, Math.round(n))), [xMin, xMax]);
  const clampY = useCallback((n) => Math.max(yMin, Math.min(yMax, Math.round(n))), [yMin, yMax]);

  /** Coordonnées student-space depuis un point écran (recette NumberLine). */
  const coordFromClient = useCallback((clientX, clientY) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return { x: x ?? 0, y: y ?? 0 };
    const ux = ((clientX - box.left) / box.width) * W;
    const uy = ((clientY - box.top) / box.height) * H;
    return {
      x: xMin + (ux - PAD) / CELL,
      y: yMax - (uy - PAD) / CELL,
    };
  }, [H, W, x, xMin, y, yMax]);

  useEffect(() => {
    if (!drag) return undefined;
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const c = coordFromClient(t.clientX, t.clientY);
      if (drag === 'x') onX?.(clampX(c.x));
      else onY?.(clampY(c.y));
    };
    const stop = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [clampX, clampY, coordFromClient, drag, onX, onY]);

  const partages = showHalo && axis === 'x' ? sharingAbscissa(x, lieux) : [];
  const halo = new Set(partages.map((l) => l.id));
  const forced = highlightIds ? new Set(highlightIds) : null;

  // En mode « xy », le lieu exactement sous le point (s'il existe).
  const pointe = axis === 'xy' ? lieux.find((l) => l.x === x && l.y === y) : null;

  const onKeyDown = (which) => (e) => {
    if (!interactive) return;
    const set = which === 'x' ? onX : onY;
    const cur = which === 'x' ? x : y;
    const clamp = which === 'x' ? clampX : clampY;
    const lo = which === 'x' ? xMin : yMin;
    const hi = which === 'x' ? xMax : yMax;
    const dec = which === 'x' ? 'ArrowLeft' : 'ArrowDown';
    const inc = which === 'x' ? 'ArrowRight' : 'ArrowUp';
    if (e.key === dec) { e.preventDefault(); set?.(clamp(cur - 1)); }
    if (e.key === inc) { e.preventDefault(); set?.(clamp(cur + 1)); }
    if (e.key === 'Home') { e.preventDefault(); set?.(lo); }
    if (e.key === 'End') { e.preventDefault(); set?.(hi); }
  };

  const ticksX = [];
  for (let n = xMin; n <= xMax; n++) ticksX.push(n);
  const ticksY = [];
  for (let n = yMin; n <= yMax; n++) ticksY.push(n);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3 space-y-2">
      <div className="relative overflow-x-auto">
        <div className="relative" style={{ minWidth: Math.min(W, 420) }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full select-none"
            style={{ touchAction: 'manipulation' }}
            role="group"
            aria-label={ariaLabel || 'Carte du domaine skiable'}
          >
            {/* ── Quadrillage : décor, jamais cliquable ── */}
            <g pointerEvents="none">
              {ticksX.map((n) => (
                <line key={`gx${n}`} x1={sx(n)} y1={PAD} x2={sx(n)} y2={H - PAD}
                  stroke={n === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={n === 0 ? 2 : 1} />
              ))}
              {ticksY.map((n) => (
                <line key={`gy${n}`} x1={PAD} y1={sy(n)} x2={W - PAD} y2={sy(n)}
                  stroke={n === 0 ? '#94a3b8' : '#e2e8f0'} strokeWidth={n === 0 ? 2 : 1} />
              ))}
            </g>

            {/* ── La colonne qui s'allume : le manque du module 1 ── */}
            {axis === 'x' && (
              <rect
                x={sx(x) - CELL / 2} y={PAD} width={CELL} height={H - PAD * 2}
                fill={partages.length >= 2 ? '#fca5a5' : '#a5b4fc'}
                opacity={0.28} pointerEvents="none"
              />
            )}

            {/* ── Guides dérivés du point, en mode repère ── */}
            {axis === 'xy' && y !== null && (
              <g pointerEvents="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 3">
                <line x1={sx(x)} y1={sy(y)} x2={sx(0)} y2={sy(y)} />
                <line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(0)} />
              </g>
            )}

            {/* ── Les axes ── */}
            <g pointerEvents="none">
              <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#334155" strokeWidth="2.5" />
              <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} stroke="#334155" strokeWidth="2.5" />
            </g>

            {/* ── Les lieux ── */}
            {lieux.map((l) => {
              const on = forced ? forced.has(l.id) : halo.has(l.id);
              return (
                <g key={l.id} pointerEvents="none">
                  <circle
                    cx={sx(l.x)} cy={sy(l.y)} r={on ? 9 : 6}
                    fill={on ? '#dc2626' : '#475569'}
                    stroke="#fff" strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* ── Le point courant, en mode repère ── */}
            {axis === 'xy' && y !== null && (
              <circle cx={sx(x)} cy={sy(y)} r="10" fill="#7c3aed" stroke="#fff" strokeWidth="3"
                pointerEvents="none" />
            )}

            {/* ── Poignée d'abscisse : sous l'axe horizontal, toujours saisissable ── */}
            <g
              role="slider"
              tabIndex={interactive ? 0 : -1}
              aria-label="Abscisse"
              aria-valuemin={xMin} aria-valuemax={xMax} aria-valuenow={x}
              aria-valuetext={`Abscisse ${formatAbscissa(x)}`}
              onKeyDown={onKeyDown('x')}
              onMouseDown={(e) => { if (interactive) { setDrag('x'); onX?.(clampX(coordFromClient(e.clientX, e.clientY).x)); } }}
              onTouchStart={(e) => { if (interactive) { setDrag('x'); onX?.(clampX(coordFromClient(e.touches[0].clientX, e.touches[0].clientY).x)); } }}
              style={{ cursor: interactive ? 'ew-resize' : 'default', outline: 'none' }}
              className="focus-visible:[&>circle]:stroke-indigo-500"
            >
              {/* zone tactile large, invisible — ≥ 44 px au doigt */}
              <rect x={PAD} y={H - PAD + 2} width={W - PAD * 2} height={26} fill="transparent" />
              <circle cx={sx(x)} cy={H - PAD + 15} r="11" fill="#4f46e5" stroke="#fff" strokeWidth="3" />
            </g>

            {/* ── Poignée d'ordonnée, seulement en mode repère ── */}
            {axis === 'xy' && y !== null && (
              <g
                role="slider"
                tabIndex={interactive ? 0 : -1}
                aria-label="Ordonnée"
                aria-valuemin={yMin} aria-valuemax={yMax} aria-valuenow={y}
                aria-valuetext={`Ordonnée ${formatAbscissa(y)}`}
                onKeyDown={onKeyDown('y')}
                onMouseDown={(e) => { if (interactive) { setDrag('y'); onY?.(clampY(coordFromClient(e.clientX, e.clientY).y)); } }}
                onTouchStart={(e) => { if (interactive) { setDrag('y'); onY?.(clampY(coordFromClient(e.touches[0].clientX, e.touches[0].clientY).y)); } }}
                style={{ cursor: interactive ? 'ns-resize' : 'default', outline: 'none' }}
                className="focus-visible:[&>circle]:stroke-violet-500"
              >
                <rect x={2} y={PAD} width={26} height={H - PAD * 2} fill="transparent" />
                <circle cx={15} cy={sy(y)} r="11" fill="#7c3aed" stroke="#fff" strokeWidth="3" />
              </g>
            )}
          </svg>

          {/* ── Étiquettes des lieux : couche HTML, jamais du <text> SVG ──
              Ancrage choisi d'après la place disponible autour du lieu, si
              bien qu'aucun nom ne sort du cadre ni ne couvre une graduation. */}
          <div className="absolute inset-0 pointer-events-none">
            {lieux.map((l) => {
              const on = forced ? forced.has(l.id) : halo.has(l.id);
              const left = (sx(l.x) / W) * 100;
              const top = (sy(l.y) / H) * 100;
              const versLaDroite = l.x <= (xMin + xMax) / 2;
              const versLeBas = l.y >= (yMin + yMax) / 2;
              return (
                <span
                  key={l.id}
                  className={`absolute whitespace-nowrap rounded px-1 text-xs font-semibold ${
                    on ? 'bg-rose-600 text-white' : 'bg-white/85 text-slate-600'
                  }`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: `translate(${versLaDroite ? '10px' : '-100%'}, ${versLaDroite ? '' : ''}${versLeBas ? '8px' : '-24px'})`,
                    marginLeft: versLaDroite ? 0 : '-10px',
                  }}
                >
                  {l.emoji} {l.nom}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── La lecture, en toutes lettres : jamais la couleur seule ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {axis === 'x' ? (
          <>
            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono font-bold text-indigo-700">
              abscisse = {formatAbscissa(x)}
            </span>
            <span className="text-slate-600">
              {partages.length === 0 && 'aucun lieu sur cette colonne'}
              {partages.length === 1 && `un seul lieu : ${partages[0].nom}`}
              {partages.length >= 2 && (
                <strong className="text-rose-700">
                  {partages.length} lieux à la fois : {partages.map((l) => l.nom).join(' et ')}
                </strong>
              )}
            </span>
          </>
        ) : (
          <>
            <span className="rounded-lg bg-violet-50 px-2.5 py-1 font-mono font-bold text-violet-700">
              {formatCoords({ x, y })}
            </span>
            <span className="text-slate-600">
              {pointe ? `un seul lieu : ${pointe.nom}` : 'un seul endroit du domaine'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
