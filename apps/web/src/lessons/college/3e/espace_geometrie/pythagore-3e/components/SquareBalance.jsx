import React, { useCallback, useRef, useState } from 'react';
import {
  squaresOf, balanceOf, rightVertexIndex, isRightTriangle, sideLengths,
  interiorAngles, centroid, VERTEX_NAMES, TOL, BOX,
} from './pythagoreUtils';

/**
 * SquareBalance — l'interaction signature de la leçon.
 *
 * ACTION            l'élève déplace le sommet de l'angle droit (ou un autre).
 * CHANGEMENT        les trois carrés se redessinent, et leurs AIRES MESURÉES
 *                   s'affichent ; la balance penche ou s'équilibre.
 * OBSERVATION       l'équilibre se produit exactement quand la marque d'angle
 *                   droit apparaît.
 * SENS MATHÉMATIQUE a² + b² = c² n'est pas une formule à retenir : c'est une
 *                   égalité d'AIRES, vraie précisément dans le cas rectangle.
 * FORMALISATION     l'écriture symbolique arrive au module 4, après cela.
 *
 * RÈGLE ABSOLUE : rien n'est étiqueté. Les aires viennent de `polygonArea`
 * appliqué aux carrés réellement tracés, la marque d'angle droit de
 * `interiorAngles`. Le dessin ne peut donc pas contredire le verdict.
 *
 * AIMANTATION : `snapRight` attire le sommet sur le cercle de diamètre opposé
 * (le lieu des points voyant le côté sous 90°), sans quoi tomber pile sur
 * l'angle droit relèverait de l'adresse.
 */
const HANDLE_R = 22;
const SNAP_DEG = 7;

export default function SquareBalance({
  points,
  onPointsChange,
  box = BOX,
  draggable = true,
  lockedIndices = [],
  snapRight = true,
  keepRightAt = null,   // indice du sommet dont l'angle droit doit être préservé
  showAreas = true,
  showBalance = true,
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const [settled, setSettled] = useState(true);
  const [focused, setFocused] = useState(null);

  const { squares, areas } = squaresOf(points);
  const bal = balanceOf(points);
  const rightV = rightVertexIndex(points);
  const angles = interiorAngles(points);
  const L = sideLengths(points);
  const interactive = !disabled && draggable;

  const posFromClient = useCallback((cx, cy) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: box.xMin + ((cx - rect.left) / rect.width) * (box.xMax - box.xMin),
      y: box.yMin + ((cy - rect.top) / rect.height) * (box.yMax - box.yMin),
    };
  }, [box.xMin, box.yMin, box.xMax, box.yMax]);

  /* Le sommet doit rester assez loin des bords pour que SES carrés restent
     visibles : ils s'étendent d'une longueur de côté vers l'extérieur. */
  const clampP = (p) => ({
    x: Math.max(box.xMin + 60, Math.min(box.xMax - 60, p.x)),
    y: Math.max(box.yMin + 60, Math.min(box.yMax - 60, p.y)),
  });

  /**
   * Aimante le sommet déplacé pour PRÉSERVER l'angle droit de la figure.
   *
   * Attention au piège : l'angle droit n'est pas forcément au sommet qu'on
   * déplace. Quand l'élève bouge C alors que l'angle droit est en A, il faut
   * corriger la position de C pour que l'angle EN A reste droit — sinon la
   * figure perd son angle droit dès le premier pixel et l'élève ne peut plus
   * relever une seule mesure. (Défaut constaté en e2e : deuxième relevé
   * impossible.)
   *
   * `keepRightAt` désigne le sommet dont l'angle doit rester droit. On projette
   * le point déplacé sur la perpendiculaire issue de ce sommet.
   */
  const snapToRight = (i, p) => {
    const n = points.length;
    // Le sommet dont on veut préserver l'angle droit : celui qui l'a déjà,
    // sinon le sommet déplacé lui-même (cas « rendre droit »).
    const anchor = keepRightAt !== null && keepRightAt !== i ? keepRightAt : i;

    if (anchor === i) {
      // On aimante l'angle DU sommet déplacé : lieu = cercle de diamètre
      // [prev, next] (théorème de l'angle inscrit).
      const prev = points[(i - 1 + n) % n];
      const next = points[(i + 1) % n];
      const u = { x: prev.x - p.x, y: prev.y - p.y };
      const v = { x: next.x - p.x, y: next.y - p.y };
      const nu = Math.hypot(u.x, u.y);
      const nv = Math.hypot(v.x, v.y);
      if (nu < 1e-6 || nv < 1e-6) return p;
      const cos = (u.x * v.x + u.y * v.y) / (nu * nv);
      const ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
      if (Math.abs(ang - 90) > SNAP_DEG) return p;
      const cx = (prev.x + next.x) / 2;
      const cy = (prev.y + next.y) / 2;
      const r = Math.hypot(next.x - prev.x, next.y - prev.y) / 2;
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < 1e-6) return p;
      return { x: cx + ((p.x - cx) / d) * r, y: cy + ((p.y - cy) / d) * r };
    }

    // L'angle droit est ailleurs : le sommet déplacé doit rester sur la
    // perpendiculaire, en l'ancre, au côté qui joint l'ancre au troisième
    // sommet. On y projette p — la distance à l'ancre est donc libre, mais
    // la direction est contrainte.
    const other = [0, 1, 2].find((k) => k !== i && k !== anchor);
    const A = points[anchor];
    const O = points[other];
    const ax = O.x - A.x;
    const ay = O.y - A.y;
    const len = Math.hypot(ax, ay);
    if (len < 1e-6) return p;
    // Direction perpendiculaire à [A, other], unitaire.
    const px = -ay / len;
    const py = ax / len;
    // Projection de (p − A) sur cette direction.
    const t = (p.x - A.x) * px + (p.y - A.y) * py;
    if (Math.abs(t) < 12) return p;   // trop près de l'ancre : figure dégénérée
    return { x: A.x + px * t, y: A.y + py * t };
  };

  const move = (i, p) => {
    if (!interactive || lockedIndices.includes(i) || !p) return;
    let moved = clampP(p);
    if (snapRight) moved = clampP(snapToRight(i, moved));
    onPointsChange?.(points.map((q, k) => (k === i ? moved : q)));
  };

  const onPointerDown = (e) => {
    if (!interactive) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    let best = -1;
    let bestD = HANDLE_R + 8;
    points.forEach((q, i) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bestD && !lockedIndices.includes(i)) { bestD = d; best = i; }
    });
    if (best < 0) return;
    dragging.current = best;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    move(best, p);
  };
  const onPointerMove = (e) => {
    if (!interactive || dragging.current === null) return;
    move(dragging.current, posFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (dragging.current === null) return;
    dragging.current = null;
    setSettled(true);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const onKeyDown = (i) => (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    move(i, { x: points[i].x + d.x, y: points[i].y + d.y });
  };

  /* Le cadre doit englober les carrés, qui débordent largement du triangle. */
  const all = [...points, ...squares.flat()];
  const pad = 16;
  const minX = Math.min(...all.map((p) => p.x)) - pad;
  const maxX = Math.max(...all.map((p) => p.x)) + pad;
  const minY = Math.min(...all.map((p) => p.y)) - pad;
  const maxY = Math.max(...all.map((p) => p.y)) + pad;

  const SQ_STYLE = [
    { fill: '#dbeafe', stroke: '#2563eb' },
    { fill: '#fce7f3', stroke: '#db2777' },
    { fill: '#dcfce7', stroke: '#16a34a' },
  ];

  /** Marque d'angle droit — dessinée seulement si l'angle vaut vraiment 90°. */
  const rightMark = () => {
    if (rightV === null) return null;
    const p = points[rightV];
    const prev = points[(rightV + 2) % 3];
    const next = points[(rightV + 1) % 3];
    const u = { x: prev.x - p.x, y: prev.y - p.y };
    const v = { x: next.x - p.x, y: next.y - p.y };
    const nu = Math.hypot(u.x, u.y) || 1;
    const nv = Math.hypot(v.x, v.y) || 1;
    const s = 15;
    const a = { x: p.x + (u.x / nu) * s, y: p.y + (u.y / nu) * s };
    const b = { x: p.x + (v.x / nv) * s, y: p.y + (v.y / nv) * s };
    const c = { x: a.x + b.x - p.x, y: a.y + b.y - p.y };
    return (
      <path d={`M ${a.x} ${a.y} L ${c.x} ${c.y} L ${b.x} ${b.y}`}
        fill="none" stroke="#dc2626" strokeWidth="2.5" />
    );
  };

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="w-full max-w-[460px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: dragging.current !== null ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? 'Triangle et les trois carrés construits sur ses côtés' }
          : { role: 'img', 'aria-label': ariaLabel ?? 'Triangle et les carrés de ses côtés' })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          {squares.map((sq, i) => (
            <g key={`sq${i}`}>
              <polygon points={sq.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={SQ_STYLE[i].fill} fillOpacity="0.85"
                stroke={SQ_STYLE[i].stroke} strokeWidth="2" strokeLinejoin="round" />
              {showAreas && settled && (
                <text
                  x={centroid(sq).x} y={centroid(sq).y + 5}
                  textAnchor="middle" fontSize="13"
                  className="font-mono font-bold" fill={SQ_STYLE[i].stroke}
                >
                  {Math.round(areas[i] / 100) / 1}
                </text>
              )}
            </g>
          ))}

          <polygon points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="#e2e8f0" fillOpacity="0.95" stroke="#0f172a" strokeWidth="2.5"
            strokeLinejoin="round" />
          {rightMark()}

          {points.map((p, i) => {
            const c = centroid(points);
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            const n = Math.hypot(dx, dy) || 1;
            return (
              <text key={`vn${i}`} x={p.x + (dx / n) * 17} y={p.y + (dy / n) * 17 + 5}
                textAnchor="middle" fontSize="15" fontWeight="700"
                className="font-space" fill="#0f172a">{VERTEX_NAMES[i]}</text>
            );
          })}
        </g>

        {points.map((p, i) => {
          const locked = lockedIndices.includes(i);
          return (
            <g key={`h${i}`}>
              <circle cx={p.x} cy={p.y} r="6"
                fill={locked ? '#94a3b8' : '#0f172a'} stroke="#fff" strokeWidth="2"
                style={{ pointerEvents: 'none' }} />
              {interactive && !locked && (
                <circle cx={p.x} cy={p.y} r={HANDLE_R} fill="transparent"
                  role="button" tabIndex={0}
                  aria-label={`Sommet ${VERTEX_NAMES[i]} — flèches pour le déplacer`}
                  onKeyDown={onKeyDown(i)}
                  onFocus={() => setFocused(i)} onBlur={() => setFocused(null)}
                  style={{ outline: 'none', cursor: 'grab' }} />
              )}
              {focused === i && (
                <circle cx={p.x} cy={p.y} r={HANDLE_R - 4} fill="none" stroke="#3b82f6"
                  strokeWidth="2.5" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          );
        })}
      </svg>

      {/* La balance : deux plateaux, des nombres MESURÉS. */}
      {showBalance && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="flex items-stretch gap-2">
            <div className={`flex-1 rounded-xl border-2 p-2 text-center ${
              bal.level ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className="text-xs text-slate-600">Les deux petits carrés</p>
              <p className="text-lg font-mono font-bold tabular-nums text-slate-800">
                {settled ? Math.round(bal.sumOthers / 100) : '…'}
              </p>
            </div>
            <div className="flex items-center px-1">
              <span className={`text-2xl font-bold ${bal.level ? 'text-emerald-600' : 'text-rose-600'}`}>
                {bal.level ? '=' : (bal.tilt === 'petits' ? '>' : '<')}
              </span>
            </div>
            <div className={`flex-1 rounded-xl border-2 p-2 text-center ${
              bal.level ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className="text-xs text-slate-600">Le grand carré</p>
              <p className="text-lg font-mono font-bold tabular-nums text-slate-800">
                {settled ? Math.round(bal.big / 100) : '…'}
              </p>
            </div>
          </div>
          <p className="text-center text-sm">
            <span className={`inline-block px-3 py-1 rounded-lg font-semibold ${
              bal.level ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {bal.level
                ? 'La balance est à l’équilibre — et l’angle est droit'
                : `La balance penche du côté ${bal.tilt === 'petits' ? 'des deux petits carrés' : 'du grand carré'}`}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
