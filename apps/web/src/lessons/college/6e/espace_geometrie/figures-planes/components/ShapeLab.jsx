import React, { useRef, useState, useCallback } from 'react';
import {
  sidesOf, sideLengths, interiorAngles, centroid, midpoint,
  propertiesOf, PROPERTIES, shapeName, classify, vertexNames, TOL,
} from './figuresUtils';

/**
 * ShapeLab — l'INTERACTION SIGNATURE de la leçon.
 *
 * ACTION          l'élève fait glisser un sommet (ou le déplace aux flèches).
 * TRANSFORMATION  les voyants de propriété s'allument et s'éteignent en
 *                 direct, et le NOM de la figure change tout seul.
 * SENS MATH.      une figure n'est pas un carré parce qu'elle en a l'air :
 *                 elle l'est parce qu'elle vérifie des propriétés — et si on
 *                 les casse, elle cesse de l'être.
 * FEEDBACK        chaque propriété est nommée et cochée séparément ; le nom
 *                 affiché vient de `classify`, jamais d'une étiquette posée.
 * GÉNÉRALISATION  définir une figure, c'est lister les propriétés qu'elle
 *                 doit vérifier.
 *
 * Le dessin est ENTIÈREMENT dérivé des sommets : marques d'angle droit,
 * codage des côtés égaux, nom. Il ne peut donc pas contredire les
 * mathématiques (même règle que RelationFigure dans la leçon précédente).
 */
export default function ShapeLab({
  points,
  onPointsChange,
  box = { xMin: 0, yMin: 0, xMax: 320, yMax: 230 },
  draggable = true,
  lockedIndices = [],
  // 'x' : les sommets ne coulissent qu'horizontalement ; 'y' : que
  // verticalement ; null : libre. Contraindre l'axe rend une construction
  // (allonger un rectangle sans casser ses angles droits) réellement
  // atteignable à la souris — sans elle, le moindre tremblement vertical
  // détruit les angles droits.
  axisLock = null,
  // Quand un côté doit rester droit, déplacer un sommet seul casse
  // forcément les angles. `linkedPairs` fait suivre le partenaire sur l'axe
  // verrouillé : [[0, 3]] signifie « A et D coulissent ensemble ».
  linkedPairs = [],
  // Aimantation : quand un sommet approche d'une position qui rend deux
  // côtés EXACTEMENT égaux, on l'y accroche. Sans cela, la tolérance
  // resserrée (1,5 px, pour que l'affichage arrondi ne mente pas) rendrait
  // l'égalité quasi inatteignable à la souris.
  snapEqualSides = false,
  // Aimantation aux angles droits : le sommet s'accroche à la position qui
  // rend son angle exactement égal à 90°. Indispensable depuis que la
  // tolérance angulaire est passée à 1° — sans elle, construire un rectangle
  // à la souris serait un jeu d'adresse, pas de géométrie.
  snapRightAngle = false,
  showName = true,
  showProperties = true,
  showLengths = false,
  showAngles = false,
  highlightProps = null,
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null); // index du sommet tiré
  const [focused, setFocused] = useState(null);
  const [settled, setSettled] = useState(true);

  const props = propertiesOf(points);
  const name = shapeName(points);
  const kind = classify(points);
  const names = vertexNames(points.length);
  const L = sideLengths(points);
  const A = interiorAngles(points);
  const maxL = Math.max(...L);
  const c = centroid(points);

  const posFromClient = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: box.xMin + ((clientX - rect.left) / rect.width) * (box.xMax - box.xMin),
        y: box.yMin + ((clientY - rect.top) / rect.height) * (box.yMax - box.yMin),
      };
    },
    [box.xMin, box.yMin, box.xMax, box.yMax]
  );

  const clamp = (p) => ({
    x: Math.max(box.xMin + 14, Math.min(box.xMax - 14, p.x)),
    y: Math.max(box.yMin + 14, Math.min(box.yMax - 14, p.y)),
  });

  const moveVertex = (i, p) => {
    if (disabled || !draggable || lockedIndices.includes(i) || !p) return;
    // L'axe verrouillé fige la coordonnée que l'élève ne doit pas toucher :
    // le sommet coulisse le long d'une seule direction.
    const target = {
      x: axisLock === 'y' ? points[i].x : p.x,
      y: axisLock === 'x' ? points[i].y : p.y,
    };
    let moved = clamp(target);
    if (snapEqualSides) moved = snapToEqualSide(points, i, moved);
    if (snapRightAngle) moved = snapToRightAngle(points, i, moved);
    // Le partenaire lié reçoit le MÊME déplacement sur l'axe libre, de sorte
    // que le côté qu'ils portent reste droit — sans quoi construire un
    // rectangle à la souris relèverait de l'exploit.
    const partner = linkedPairs.find((pair) => pair.includes(i))?.find((k) => k !== i);
    const dx = moved.x - points[i].x;
    const dy = moved.y - points[i].y;
    const next = points.map((q, k) => {
      if (k === i) return moved;
      if (k === partner) {
        return clamp({
          x: axisLock === 'y' ? q.x : q.x + dx,
          y: axisLock === 'x' ? q.y : q.y + dy,
        });
      }
      return q;
    });
    onPointsChange?.(next);
  };

  const onPointerDown = (e) => {
    if (disabled || !draggable) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    // Le sommet le plus proche du doigt, dans un rayon raisonnable.
    let best = -1;
    let bestD = 26;
    points.forEach((q, i) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bestD && !lockedIndices.includes(i)) { bestD = d; best = i; }
    });
    if (best < 0) return;
    dragging.current = best;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    moveVertex(best, p);
  };
  const onPointerMove = (e) => {
    if (disabled || dragging.current === null) return;
    moveVertex(dragging.current, posFromClient(e.clientX, e.clientY));
  };
  const endDrag = (e) => {
    if (dragging.current === null) return;
    dragging.current = null;
    setSettled(true); // settle-then-number : les mesures se figent au relâchement
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onKeyDown = (i) => (e) => {
    const map = {
      ArrowRight: { x: 4, y: 0 }, ArrowLeft: { x: -4, y: 0 },
      ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 },
    };
    const d = map[e.key];
    if (!d) return;
    // Même verrou au clavier qu'à la souris : les flèches hors axe ne font rien.
    if ((axisLock === 'x' && d.y !== 0) || (axisLock === 'y' && d.x !== 0)) return;
    e.preventDefault();
    setSettled(true);
    moveVertex(i, { x: points[i].x + d.x, y: points[i].y + d.y });
  };

  /** Marque d'angle droit — dessinée UNIQUEMENT si l'angle vaut vraiment 90°. */
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
    const s = 13;
    const a = { x: p.x + (u.x / nu) * s, y: p.y + (u.y / nu) * s };
    const b = { x: p.x + (v.x / nv) * s, y: p.y + (v.y / nv) * s };
    const c = { x: a.x + b.x - p.x, y: a.y + b.y - p.y };
    return (
      <path
        key={`rm${i}`}
        d={`M ${a.x} ${a.y} L ${c.x} ${c.y} L ${b.x} ${b.y}`}
        fill="none" stroke="#059669" strokeWidth="2"
      />
    );
  };

  /** Codage des côtés égaux : une, deux ou trois barrettes selon le groupe. */
  const sideTicks = () => {
    // Regroupe les côtés par longueur (à la tolérance près) et n'affiche le
    // codage que s'il existe vraiment un groupe de côtés égaux.
    const groups = [];
    L.forEach((len, i) => {
      const g = groups.find((gr) => Math.abs(gr.len - len) <= TOL.lengthRatio * maxL);
      if (g) g.idx.push(i);
      else groups.push({ len, idx: [i] });
    });
    const marked = groups.filter((g) => g.idx.length > 1);
    return marked.flatMap((g, gi) =>
      g.idx.map((i) => {
        const [a, b] = sidesOf(points)[i];
        const m = midpoint(a, b);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const ux = dx / len;
        const uy = dy / len;
        return Array.from({ length: gi + 1 }, (_, k) => {
          const off = (k - gi / 2) * 5;
          return (
            <line
              key={`tick-${i}-${k}`}
              x1={m.x + ux * off - nx * 5} y1={m.y + uy * off - ny * 5}
              x2={m.x + ux * off + nx * 5} y2={m.y + uy * off + ny * 5}
              stroke="#7c3aed" strokeWidth="2"
            />
          );
        });
      })
    );
  };

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`${box.xMin} ${box.yMin} ${box.xMax - box.xMin} ${box.yMax - box.yMin}`}
        className="w-full max-w-[520px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: draggable ? 'none' : 'manipulation' }}
        role="group"
        aria-label={ariaLabel ?? `Figure à ${points.length} côtés : ${name}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Décor : jamais d'interception du pointeur (playbook §10.3) */}
        <g style={{ pointerEvents: 'none' }}>
          <path d={path} fill="#eef2ff" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" />

          {points.map((_, i) => rightMark(i))}
          {sideTicks()}

          {/* Longueurs déportées vers l'EXTÉRIEUR du contour : posées au
              milieu du côté, elles chevauchaient le codage des côtés égaux
              (collision constatée en revue visuelle). */}
          {showLengths &&
            sidesOf(points).map(([a, b], i) => {
              const m = midpoint(a, b);
              const ox = m.x - c.x;
              const oy = m.y - c.y;
              const n = Math.hypot(ox, oy) || 1;
              return (
                <text
                  key={`len${i}`}
                  x={m.x + (ox / n) * 16} y={m.y + (oy / n) * 16 + 3}
                  textAnchor="middle"
                  className="font-mono" fontSize="10" fill="#4338ca"
                >
                  {settled ? Math.round(L[i]) : '…'}
                </text>
              );
            })}

          {showAngles &&
            points.map((p, i) => (
              <text
                key={`ang${i}`}
                x={p.x + (c.x - p.x) * 0.22} y={p.y + (c.y - p.y) * 0.22 + 4}
                textAnchor="middle" className="font-mono" fontSize="10" fill="#059669"
              >
                {settled ? `${Math.round(A[i])}°` : '…'}
              </text>
            ))}

          {/* Sommets peints — la zone tactile est séparée, plus large */}
          {points.map((p, i) => (
            <circle
              key={`v${i}`}
              cx={p.x} cy={p.y} r={focused === i ? 8 : 6}
              fill={lockedIndices.includes(i) ? '#94a3b8' : '#4f46e5'}
              stroke="#fff" strokeWidth="2.5"
            />
          ))}
          {points.map((p, i) => (
            <text
              key={`vn${i}`}
              x={p.x + (p.x - c.x) * 0.17 + 4} y={p.y + (p.y - c.y) * 0.17 - 6}
              className="font-space" fontSize="13" fontWeight="700" fill="#0f172a"
            >
              {names[i]}
            </text>
          ))}
        </g>

        {/* Zones tactiles : une par sommet mobile — au plus 4 nœuds */}
        {draggable &&
          points.map((p, i) =>
            lockedIndices.includes(i) ? null : (
              <circle
                key={`hit${i}`}
                cx={p.x} cy={p.y} r="20" fill="transparent"
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={`Sommet ${names[i]}`}
                aria-valuenow={Math.round(p.x)}
                aria-valuemin={Math.round(box.xMin)}
                aria-valuemax={Math.round(box.xMax)}
                aria-valuetext={`sommet ${names[i]}, figure actuelle : ${name}`}
                onKeyDown={onKeyDown(i)}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused(null)}
                style={{ cursor: disabled ? 'default' : 'grab', outline: 'none' }}
              />
            )
          )}
      </svg>

      {showName && (
        <p className="text-center" aria-live="polite">
          <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
            Cette figure est un
          </span>
          <br />
          <span className="font-space font-extrabold text-lg text-indigo-900">{name}</span>
        </p>
      )}

      {showProperties && (
        <div className="grid sm:grid-cols-2 gap-2">
          {PROPERTIES.filter((p) => !highlightProps || highlightProps.includes(p.id)).map((p) => {
            const on = props[p.id];
            return (
              <div
                key={p.id}
                className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                  on ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <span aria-hidden="true">{on ? '✓' : '○'}</span>
                {p.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Aimante le sommet `i` vers la position la plus proche qui rend l'un de ses
 * deux côtés égal à un autre côté de la figure.
 *
 * Le sommet i porte les côtés [i-1, i] et [i, i+1]. Faire varier i le long du
 * cercle centré sur son voisin change la longueur de ce côté ; on cherche donc
 * le rayon qui l'égale à un côté cible, et on s'y accroche si l'on est déjà
 * proche (≤ 8 px). L'élève sent le sommet « se caler », et les deux nombres
 * affichés deviennent identiques — ce que la leçon appelle « égaux ».
 */
function snapToEqualSide(points, i, p, radius = 8) {
  const n = points.length;
  const prev = points[(i - 1 + n) % n];
  const next = points[(i + 1) % n];
  // Longueurs des côtés que le sommet i NE touche pas — les cibles possibles.
  const targets = [];
  for (let k = 0; k < n; k += 1) {
    const a = points[k];
    const b = points[(k + 1) % n];
    if (k === i || (k + 1) % n === i) continue; // côté porté par i
    targets.push(Math.hypot(b.x - a.x, b.y - a.y));
  }
  if (targets.length === 0) return p;

  let best = p;
  let bestD = radius;
  for (const anchor of [prev, next]) {
    const dx = p.x - anchor.x;
    const dy = p.y - anchor.y;
    const cur = Math.hypot(dx, dy);
    if (cur < 1) continue;
    for (const t of targets) {
      // Le point à distance exactement `t` de l'ancre, dans la même direction.
      const cand = { x: anchor.x + (dx / cur) * t, y: anchor.y + (dy / cur) * t };
      const d = Math.hypot(cand.x - p.x, cand.y - p.y);
      if (d < bestD) { bestD = d; best = cand; }
    }
  }
  return best;
}

/**
 * Aimante le sommet `i` vers la position qui rend DROIT l'un des angles
 * qu'il influence.
 *
 * Le sommet i porte un angle en i, mais il détermine aussi les angles de ses
 * deux voisins. Pour chaque voisin `v` dont l'angle dépend de i, on calcule
 * la position de i qui met à 90° l'angle en v : elle se trouve sur la
 * perpendiculaire, en v, au côté opposé — on y projette i, et on s'accroche
 * si l'on est déjà proche.
 */
function snapToRightAngle(points, i, p, radius = 10) {
  const n = points.length;
  let best = p;
  let bestD = radius;

  // Candidats : mettre à 90° l'angle du voisin précédent, puis du suivant.
  for (const dir of [-1, 1]) {
    const v = (i + dir + n) % n;          // le voisin dont on redresse l'angle
    const other = (v - dir + n) % n;      // son autre voisin, fixe
    const vp = points[v];
    const op = points[other];
    const ax = vp.x - op.x;
    const ay = vp.y - op.y;
    const len = Math.hypot(ax, ay);
    if (len < 1) continue;
    // Direction perpendiculaire au côté [other, v], depuis v.
    const nx = -ay / len;
    const ny = ax / len;
    // Projection de p sur cette perpendiculaire.
    const t = (p.x - vp.x) * nx + (p.y - vp.y) * ny;
    const cand = { x: vp.x + nx * t, y: vp.y + ny * t };
    const dd = Math.hypot(cand.x - p.x, cand.y - p.y);
    if (dd < bestD) { bestD = dd; best = cand; }
  }
  return best;
}
