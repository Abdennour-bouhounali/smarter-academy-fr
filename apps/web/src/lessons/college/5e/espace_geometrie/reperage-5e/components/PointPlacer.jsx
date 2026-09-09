import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DOMAINE, formatAbscissa, formatCoords, quadrantOf, describeQuadrant, swap, swapLandsElsewhere } from './reperageUtils';

/**
 * PointPlacer — lire et placer un point dans un repère à quatre quadrants.
 *
 * Le point se GLISSE dans le plan (le repère lui-même est la surface de
 * manipulation : on déplace la figure, jamais un compteur à boutons — voir
 * INTERACTION_PEDAGOGY §16bis et la mémoire `manipulation_interaction_rules`).
 * Les flèches du clavier font le même déplacement, d'une unité.
 *
 * ─── LE FANTÔME : l'enseignement du module 4 ──────────────────────────
 * Avec `ghostSwapped`, le composant affiche EN MÊME TEMPS le point placé et
 * l'endroit où le couple échangé tomberait. Les deux coexistent : c'est la
 * comparaison qui enseigne, pas une correction après coup.
 *
 * Cas honnête — quand x = y, l'échange ne déplace rien. `swapLandsElsewhere`
 * le sait, et le composant DIT que les deux points sont confondus au lieu de
 * dessiner deux pastilles superposées en prétendant qu'elles diffèrent
 * (mémoire `visual_invariant_rule` : un schéma ne contredit jamais la leçon).
 *
 * ─── SÉCURITÉ VISUELLE ────────────────────────────────────────────────
 * L'étiquette d'un point est placée du côté où il reste de la place, calculé
 * depuis sa position dans la fenêtre — jamais un décalage fixe. Le viewBox
 * réserve une marge suffisante pour que l'étiquette d'un point de bord tienne
 * à l'intérieur du cadre.
 */

const PAD = 34;
const CELL = 32;

export default function PointPlacer({
  point,                       // { x, y } — état contrôlé par le module
  onPoint,
  target = null,               // cible à atteindre (anneau ambre)
  ghostSwapped = false,        // afficher le couple échangé
  extraPoints = [],            // [{ id, x, y, label, tone }] — points fixes
  domaine = DOMAINE,
  step = 1,
  showQuadrantBadge = false,
  disabled = false,
  ariaLabel,
}) {
  const uid = useId();
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const { xMin, xMax, yMin, yMax } = domaine;
  const W = (xMax - xMin) * CELL + PAD * 2;
  const H = (yMax - yMin) * CELL + PAD * 2;
  const sx = (n) => PAD + (n - xMin) * CELL;
  const sy = (n) => PAD + (yMax - n) * CELL;

  const interactive = !disabled && Boolean(onPoint);

  const snap = useCallback((v, lo, hi) => {
    const r = Math.round(v / step) * step;
    return Math.max(lo, Math.min(hi, Number(r.toFixed(6))));
  }, [step]);

  const coordFromClient = useCallback((clientX, clientY) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return point;
    const ux = ((clientX - box.left) / box.width) * W;
    const uy = ((clientY - box.top) / box.height) * H;
    return {
      x: snap(xMin + (ux - PAD) / CELL, xMin, xMax),
      y: snap(yMax - (uy - PAD) / CELL, yMin, yMax),
    };
  }, [H, W, point, snap, xMax, xMin, yMax, yMin]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      onPoint?.(coordFromClient(t.clientX, t.clientY));
    };
    const stop = () => setDragging(false);
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
  }, [coordFromClient, dragging, onPoint]);

  const onKeyDown = (e) => {
    if (!interactive) return;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!d) return;
    e.preventDefault();
    onPoint?.({
      x: snap(point.x + d[0], xMin, xMax),
      y: snap(point.y + d[1], yMin, yMax),
    });
  };

  const ticksX = [];
  for (let n = xMin; n <= xMax; n += step) ticksX.push(Number(n.toFixed(6)));
  const ticksY = [];
  for (let n = yMin; n <= yMax; n += step) ticksY.push(Number(n.toFixed(6)));

  // Ne chiffrer qu'une graduation sur k si la place manque — dérivé du pas
  // réel en pixels, jamais supposé.
  const labelEvery = Math.max(1, Math.ceil(22 / (CELL * step)));

  const fantome = ghostSwapped ? swap(point) : null;
  const fantomeVisible = ghostSwapped && swapLandsElsewhere(point);
  const q = quadrantOf(point);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-3 space-y-2">
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full select-none"
          style={{ touchAction: 'manipulation', minWidth: Math.min(W, 300) }}
          role="group"
          aria-label={ariaLabel || 'Repère du plan'}
        >
          {/* ── Décor : quadrillage et graduations, jamais cliquable ── */}
          <g pointerEvents="none">
            {ticksX.map((n) => (
              <line key={`gx${n}`} x1={sx(n)} y1={PAD} x2={sx(n)} y2={H - PAD}
                stroke={n === 0 ? '#94a3b8' : '#eef2f7'} strokeWidth={n === 0 ? 2 : 1} />
            ))}
            {ticksY.map((n) => (
              <line key={`gy${n}`} x1={PAD} y1={sy(n)} x2={W - PAD} y2={sy(n)}
                stroke={n === 0 ? '#94a3b8' : '#eef2f7'} strokeWidth={n === 0 ? 2 : 1} />
            ))}
            <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#334155" strokeWidth="2.5" />
            <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} stroke="#334155" strokeWidth="2.5" />

            {ticksX.filter((n, i) => n !== 0 && i % labelEvery === 0).map((n) => (
              <text key={`tx${n}`} x={sx(n)} y={sy(0) + 15} textAnchor="middle"
                className="fill-slate-500" style={{ fontSize: 12 }}>{formatAbscissa(n)}</text>
            ))}
            {ticksY.filter((n, i) => n !== 0 && i % labelEvery === 0).map((n) => (
              <text key={`ty${n}`} x={sx(0) - 7} y={sy(n) + 4} textAnchor="end"
                className="fill-slate-500" style={{ fontSize: 12 }}>{formatAbscissa(n)}</text>
            ))}
            <text x={sx(0) - 7} y={sy(0) + 15} textAnchor="end" className="fill-slate-600 font-bold"
              style={{ fontSize: 12 }}>O</text>
            <text x={W - PAD + 8} y={sy(0) + 4} className="fill-slate-600 font-bold" style={{ fontSize: 12 }}>x</text>
            <text x={sx(0)} y={PAD - 10} textAnchor="middle" className="fill-slate-600 font-bold" style={{ fontSize: 12 }}>y</text>
          </g>

          {/* ── Cible ── */}
          {target && (
            <circle cx={sx(target.x)} cy={sy(target.y)} r="13" fill="none"
              stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3" pointerEvents="none" />
          )}

          {/* ── Points fixes ── */}
          {extraPoints.map((p) => (
            <g key={p.id} pointerEvents="none">
              <circle cx={sx(p.x)} cy={sy(p.y)} r="6" fill={p.tone || '#0ea5e9'} stroke="#fff" strokeWidth="2" />
              {p.label && (
                <text
                  x={sx(p.x) + (p.x > (xMin + xMax) / 2 ? -10 : 10)}
                  y={sy(p.y) + (p.y > (yMin + yMax) / 2 ? 16 : -9)}
                  textAnchor={p.x > (xMin + xMax) / 2 ? 'end' : 'start'}
                  className="fill-slate-700 font-bold" style={{ fontSize: 12 }}
                >{p.label}</text>
              )}
            </g>
          ))}

          {/* ── Le fantôme : le couple échangé, s'il tombe ailleurs ── */}
          {fantomeVisible && (
            <g pointerEvents="none">
              <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(fantome.x)} y2={sy(fantome.y)}
                stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 4" />
              <circle cx={sx(fantome.x)} cy={sy(fantome.y)} r="9" fill="#fecdd3"
                stroke="#f43f5e" strokeWidth="2.5" />
              <text
                x={sx(fantome.x) + (fantome.x > (xMin + xMax) / 2 ? -13 : 13)}
                y={sy(fantome.y) + (fantome.y > (yMin + yMax) / 2 ? 18 : -11)}
                textAnchor={fantome.x > (xMin + xMax) / 2 ? 'end' : 'start'}
                className="fill-rose-600 font-bold" style={{ fontSize: 12 }}
              >{formatCoords(fantome)}</text>
            </g>
          )}

          {/* ── Guides dérivés du point ── */}
          <g pointerEvents="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8">
            <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(0)} y2={sy(point.y)} />
            <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(point.x)} y2={sy(0)} />
          </g>

          {/* ── Le point : c'est LUI qu'on glisse ── */}
          <g
            role="slider"
            tabIndex={interactive ? 0 : -1}
            aria-label={ariaLabel || 'Point à placer'}
            aria-valuetext={`Point ${formatCoords(point)}, ${describeQuadrant(q)}`}
            aria-valuenow={point.x}
            onKeyDown={onKeyDown}
            onMouseDown={(e) => { if (interactive) { setDragging(true); onPoint?.(coordFromClient(e.clientX, e.clientY)); } }}
            onTouchStart={(e) => { if (interactive) { setDragging(true); onPoint?.(coordFromClient(e.touches[0].clientX, e.touches[0].clientY)); } }}
            style={{ cursor: interactive ? 'grab' : 'default', outline: 'none' }}
            className="focus-visible:[&>circle:last-of-type]:stroke-indigo-500"
          >
            {/* cible tactile large et invisible autour de la pastille */}
            <circle cx={sx(point.x)} cy={sy(point.y)} r="22" fill="transparent" />
            <circle cx={sx(point.x)} cy={sy(point.y)} r="10" fill="#7c3aed" stroke="#fff" strokeWidth="3" />
          </g>
        </svg>
      </div>

      {/* ── La lecture en toutes lettres ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-lg bg-violet-50 px-2.5 py-1 font-mono font-bold text-violet-700">
          {formatCoords(point)}
        </span>
        {showQuadrantBadge && (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
            {describeQuadrant(q)}
          </span>
        )}
        {ghostSwapped && !fantomeVisible && (
          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
            ici les deux nombres sont égaux : l’échange ne déplace rien
          </span>
        )}
      </div>
    </div>
  );
}
