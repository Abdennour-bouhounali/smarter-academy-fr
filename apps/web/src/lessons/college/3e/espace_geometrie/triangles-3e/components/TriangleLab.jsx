import React, { useCallback, useRef, useState } from 'react';
import {
  triangleTraits, triangleKind, VERTEX_NAMES, TOL, BOX, sameLength,
} from './triangleUtils';

/**
 * TriangleLab — l'interaction signature de la leçon.
 *
 * ACTION            l'élève déplace un sommet (glisser, ou flèches au clavier).
 * CHANGEMENT        les longueurs, les angles, les marques d'égalité et le NOM
 *                   du triangle se recalculent en direct.
 * OBSERVATION       « pour rester isocèle, il faut que ces deux côtés restent
 *                   égaux » — la propriété se perd sous les doigts.
 * SENS MATHÉMATIQUE le nom d'un triangle est la CONSÉQUENCE de ses longueurs
 *                   et de ses angles, jamais une étiquette collée dessus.
 * FORMALISATION     les propriétés observées deviennent les règles du module 6.
 *
 * RÈGLE ABSOLUE : tout ce qui est dessiné est DÉRIVÉ de `points`.
 * `triangleKind` donne le nom, `triangleTraits` donne les marques. Aucun
 * appelant ne peut demander « affiche isocèle » : il ne peut que bouger les
 * sommets.
 *
 * AIMANTATION (playbook §10.6). Avec une tolérance de 1,5 px, atteindre
 * l'isocèle à la souris relèverait de l'adresse et non de la géométrie.
 * `snapEqualSides` attire le sommet tiré sur le cercle qui rend deux côtés
 * égaux, `snapRightAngle` sur la perpendiculaire — dans un rayon de 10 px.
 */
const HANDLE_R = 22;   // rayon de la zone tactile, ≥ 44 px de diamètre
const SNAP_R = 11;     // rayon d'aimantation

export default function TriangleLab({
  points,
  onPointsChange,
  box = BOX,
  draggable = true,
  lockedIndices = [],
  snapEqualSides = false,
  snapRightAngle = false,
  showName = true,
  showLengths = false,
  showAngles = false,
  showAngleSum = false,
  highlight = null,        // 'sides' | 'angles' | null
  ghost = null,            // sommets d'un triangle fantôme (cible ou correction)
  disabled = false,
  size,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const [focused, setFocused] = useState(null);
  const [settled, setSettled] = useState(true);

  const t = triangleTraits(points);
  const kind = triangleKind(points);
  const L = t.sides;
  const A = t.angles;
  const maxL = Math.max(...L);
  const interactive = !disabled && draggable;

  const posFromClient = useCallback((clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin),
      y: box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin),
    };
  }, [box.xMin, box.yMin, box.xMax, box.yMax]);

  const clamp = (p) => ({
    x: Math.max(box.xMin + 18, Math.min(box.xMax - 18, p.x)),
    y: Math.max(box.yMin + 18, Math.min(box.yMax - 18, p.y)),
  });

  /** Aimante le sommet i sur la position qui rend deux de ses côtés égaux. */
  const snapEqual = (i, p) => {
    const n = points.length;
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const dPrev = Math.hypot(p.x - prev.x, p.y - prev.y);
    const dNext = Math.hypot(p.x - next.x, p.y - next.y);
    if (Math.abs(dPrev - dNext) > SNAP_R) return p;
    // Cible : le point de la médiatrice de [prev, next] le plus proche de p.
    const mx = (prev.x + next.x) / 2;
    const my = (prev.y + next.y) / 2;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-9) return p;
    // Projection de p sur la médiatrice (direction perpendiculaire à [prev,next]).
    const ux = -dy / Math.sqrt(len2);
    const uy = dx / Math.sqrt(len2);
    const s = (p.x - mx) * ux + (p.y - my) * uy;
    return { x: mx + ux * s, y: my + uy * s };
  };

  /** Aimante le sommet i pour que son angle devienne droit. */
  const snapRight = (i, p) => {
    const n = points.length;
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const u = { x: prev.x - p.x, y: prev.y - p.y };
    const v = { x: next.x - p.x, y: next.y - p.y };
    const nu = Math.hypot(u.x, u.y);
    const nv = Math.hypot(v.x, v.y);
    if (nu < 1e-6 || nv < 1e-6) return p;
    const cos = (u.x * v.x + u.y * v.y) / (nu * nv);
    const ang = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    if (Math.abs(ang - 90) > 7) return p;
    // Le lieu des points voyant [prev,next] sous 90° est le cercle de diamètre
    // [prev,next] : on y projette p.
    const cx = (prev.x + next.x) / 2;
    const cy = (prev.y + next.y) / 2;
    const r = Math.hypot(next.x - prev.x, next.y - prev.y) / 2;
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < 1e-6) return p;
    return { x: cx + ((p.x - cx) / d) * r, y: cy + ((p.y - cy) / d) * r };
  };

  const moveVertex = (i, p) => {
    if (!interactive || lockedIndices.includes(i) || !p) return;
    let moved = clamp(p);
    if (snapEqualSides) moved = clamp(snapEqual(i, moved));
    if (snapRightAngle) moved = clamp(snapRight(i, moved));
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
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* déjà relâché */ }
    moveVertex(best, p);
  };

  const onPointerMove = (e) => {
    if (!interactive || dragging.current === null) return;
    moveVertex(dragging.current, posFromClient(e.clientX, e.clientY));
  };

  const endDrag = (e) => {
    if (dragging.current === null) return;
    dragging.current = null;
    setSettled(true); // settle-then-number
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  const onKeyDown = (i) => (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    setSettled(true);
    moveVertex(i, { x: points[i].x + d.x, y: points[i].y + d.y });
  };

  /* ── Marques DÉRIVÉES ─────────────────────────────────────────────── */

  /** Marque d'angle droit : dessinée seulement si l'angle vaut vraiment 90°. */
  const rightMark = (i) => {
    if (Math.abs(A[i] - 90) > TOL.angleDeg) return null;
    const n = points.length;
    const p = points[i];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const u = { x: prev.x - p.x, y: prev.y - p.y };
    const v = { x: next.x - p.x, y: next.y - p.y };
    const nu = Math.hypot(u.x, u.y) || 1;
    const nv = Math.hypot(v.x, v.y) || 1;
    const s = 15;
    const a = { x: p.x + (u.x / nu) * s, y: p.y + (u.y / nu) * s };
    const b = { x: p.x + (v.x / nv) * s, y: p.y + (v.y / nv) * s };
    const c = { x: a.x + b.x - p.x, y: a.y + b.y - p.y };
    return (
      <path key={`rm${i}`} d={`M ${a.x} ${a.y} L ${c.x} ${c.y} L ${b.x} ${b.y}`}
        fill="none" stroke="#dc2626" strokeWidth="2.5" />
    );
  };

  /** Barrettes d'égalité : un seul trait par groupe de côtés de même longueur. */
  const sideTicks = () => {
    const groups = [];
    L.forEach((len, i) => {
      const g = groups.find((grp) => sameLength(L[grp[0]], len, maxL));
      if (g) g.push(i); else groups.push([i]);
    });
    const marks = [];
    groups.forEach((grp, gi) => {
      if (grp.length < 2) return;
      grp.forEach((i) => {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const n = Math.hypot(dx, dy) || 1;
        const px = -dy / n;
        const py = dx / n;
        for (let k = 0; k < gi + 1; k += 1) {
          const off = (k - gi / 2) * 5;
          marks.push(
            <line key={`tk${i}-${k}`}
              x1={mx + px * 6 + (dx / n) * off} y1={my + py * 6 + (dy / n) * off}
              x2={mx - px * 6 + (dx / n) * off} y2={my - py * 6 + (dy / n) * off}
              stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
          );
        }
      });
    });
    return marks;
  };

  /** Arc d'angle à chaque sommet, avec sa mesure quand on la demande. */
  const angleArc = (i) => {
    const n = points.length;
    const p = points[i];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const a1 = Math.atan2(prev.y - p.y, prev.x - p.x);
    const a2 = Math.atan2(next.y - p.y, next.x - p.x);
    const r = 26;
    let delta = a2 - a1;
    while (delta <= -Math.PI) delta += 2 * Math.PI;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    const sweep = delta > 0 ? 1 : 0;
    const s = { x: p.x + r * Math.cos(a1), y: p.y + r * Math.sin(a1) };
    const e = { x: p.x + r * Math.cos(a2), y: p.y + r * Math.sin(a2) };
    const mid = a1 + delta / 2;
    return (
      <g key={`ar${i}`}>
        <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 0 ${sweep} ${e.x} ${e.y}`}
          fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.85" />
        {showAngles && settled && (
          <text x={p.x + (r + 15) * Math.cos(mid)} y={p.y + (r + 15) * Math.sin(mid) + 4}
            textAnchor="middle" fontSize="12" className="font-mono font-semibold" fill="#0369a1">
            {Math.round(A[i])}°
          </text>
        )}
      </g>
    );
  };

  const sideLabel = (i) => {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = Math.hypot(dx, dy) || 1;
    return (
      <text key={`sl${i}`} x={mx - (dy / n) * 18} y={my + (dx / n) * 18 + 4}
        textAnchor="middle" fontSize="12" className="font-mono font-semibold" fill="#6d28d9">
        {settled ? Math.round(L[i]) : '…'}
      </text>
    );
  };

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[420px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ width: size, touchAction: dragging.current !== null ? 'none' : 'manipulation' }}
        {...(interactive
          ? { role: 'group', 'aria-label': ariaLabel ?? `Triangle manipulable : ${kind.label}` }
          : { role: 'img', 'aria-label': ariaLabel ?? kind.label })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Triangle fantôme : une cible ou une correction, jamais la réponse
              posée sur la figure de l'élève. */}
          {ghost && (
            <polygon points={ghost.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5" opacity="0.7" />
          )}

          <polygon
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={highlight === 'sides' ? '#ede9fe' : '#eef2ff'}
            fillOpacity="0.75"
            stroke="#4338ca" strokeWidth="2.5" strokeLinejoin="round"
          />

          {points.map((_, i) => angleArc(i))}
          {points.map((_, i) => rightMark(i))}
          {sideTicks()}
          {showLengths && points.map((_, i) => sideLabel(i))}

          {/* Noms des sommets, poussés vers l'extérieur du triangle */}
          {points.map((p, i) => {
            const cx = (points[0].x + points[1].x + points[2].x) / 3;
            const cy = (points[0].y + points[1].y + points[2].y) / 3;
            const dx = p.x - cx;
            const dy = p.y - cy;
            const n = Math.hypot(dx, dy) || 1;
            return (
              <text key={`vn${i}`} x={p.x + (dx / n) * 20} y={p.y + (dy / n) * 20 + 5}
                textAnchor="middle" fontSize="16" fontWeight="700"
                className="font-space" fill="#0f172a">
                {VERTEX_NAMES[i]}
              </text>
            );
          })}
        </g>

        {/* Zones tactiles : un cercle transparent par sommet mobile */}
        {points.map((p, i) => {
          const locked = lockedIndices.includes(i);
          return (
            <g key={`h${i}`}>
              <circle cx={p.x} cy={p.y} r="7"
                fill={locked ? '#94a3b8' : '#4338ca'} stroke="#fff" strokeWidth="2.5"
                style={{ pointerEvents: 'none' }} />
              {interactive && !locked && (
                <circle
                  cx={p.x} cy={p.y} r={HANDLE_R}
                  fill="transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={`Sommet ${VERTEX_NAMES[i]} — flèches pour le déplacer`}
                  onKeyDown={onKeyDown(i)}
                  onFocus={() => setFocused(i)}
                  onBlur={() => setFocused(null)}
                  style={{ outline: 'none', cursor: 'grab' }}
                />
              )}
              {focused === i && (
                <circle cx={p.x} cy={p.y} r={HANDLE_R - 4} fill="none"
                  stroke="#3b82f6" strokeWidth="2.5" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Le NOM, calculé — la couleur n'est jamais seule porteuse. */}
      {showName && (
        <p className="text-center" aria-live="polite">
          <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
            kind.id === 'quelconque' ? 'bg-slate-100 text-slate-700' : 'bg-violet-100 text-violet-800'
          }`}>
            {kind.label}
          </span>
        </p>
      )}

      {showAngleSum && (
        <p className="text-center text-sm font-mono text-slate-700 tabular-nums" aria-live="polite">
          {A.map((a) => `${Math.round(a)}°`).join('  +  ')}  =  {Math.round(A.reduce((s, a) => s + a, 0))}°
        </p>
      )}
    </div>
  );
}
