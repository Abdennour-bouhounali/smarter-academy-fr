/**
 * L'AIMANTATION — une seule couche pour tout le bureau de géométrie.
 *
 * Le crayon, le compas, la منقلة et le كوس demandent tous la même chose :
 * « y a-t-il, près d'ici, quelque chose de géométrique sur quoi se poser ? »
 * Ce module répond, par ordre de priorité :
 *
 *   1. un POINT nommé (A, B…)           — c'est ce qu'on vise presque toujours
 *   2. une INTERSECTION                 — là où naît C dans le triangle équilatéral
 *   3. une extrémité, un centre de cercle
 *   4. le nœud de la grille, si la grille est affichée
 *
 * et, pour une direction, horizontale / verticale / parallèle / perpendiculaire
 * à une droite de la scène. Les seuils sont en PIXELS D'ÉCRAN (l'appelant les
 * divise par le zoom) et petits : l'aimant aide, il ne tire pas la main.
 */
import {
  sub, add, scale, dist, len, angleOf, unit, dot, lineAngleGap, projectOnLine, distanceToSegment,
  intersectLines, intersectLineCircle, intersectCircles, angleInSweep, toRadians, normalizeAngle,
} from './geoMath.js';

export const SNAP_PX = 12;
const DIRECTION_TOLERANCE = toRadians(2.5);

/** Un objet de la scène contient-il le point de paramètre t (droite) ? */
const onLinear = (l, t) => (l.kind === 'segment' ? t >= -1e-6 && t <= 1 + 1e-6 : l.kind === 'ray' ? t >= -1e-6 : true);
const onCircle = (c, p) => angleInSweep(angleOf(sub(p, c.c)), c.start, c.sweep);

/**
 * Toutes les cibles d'aimantation d'une scène lue par `readGeoScene`. À
 * calculer UNE fois par version de scène (les intersections sont en n²).
 */
export function collectSnapTargets(scene) {
  const targets = [];
  for (const pt of scene.points.values()) targets.push({ kind: 'point', p: pt.p, id: pt.id, priority: 0 });

  const { linears, circles } = scene;
  for (let i = 0; i < linears.length; i += 1) {
    const l = linears[i];
    if (l.kind === 'segment') {
      if (!l.from) targets.push({ kind: 'endpoint', p: l.a, priority: 2 });
      if (!l.to) targets.push({ kind: 'endpoint', p: l.b, priority: 2 });
    }
    for (let j = i + 1; j < linears.length; j += 1) {
      const m = linears[j];
      const hit = intersectLines(l.a, l.b, m.a, m.b);
      if (hit && onLinear(l, hit.t) && onLinear(m, hit.s)) targets.push({ kind: 'intersection', p: hit.point, priority: 1 });
    }
    for (const c of circles) {
      for (const hit of intersectLineCircle(l.a, l.b, c.c, c.r)) {
        if (onLinear(l, hit.t) && onCircle(c, hit.point)) targets.push({ kind: 'intersection', p: hit.point, priority: 1 });
      }
    }
  }
  for (let i = 0; i < circles.length; i += 1) {
    const c = circles[i];
    if (!c.centerId) targets.push({ kind: 'center', p: c.c, priority: 2 });
    for (let j = i + 1; j < circles.length; j += 1) {
      const d = circles[j];
      for (const p of intersectCircles(c.c, c.r, d.c, d.r)) {
        if (onCircle(c, p) && onCircle(d, p)) targets.push({ kind: 'intersection', p, priority: 1 });
      }
    }
  }

  // Une intersection qui tombe sur un point existant EST ce point.
  const points = targets.filter((t) => t.kind === 'point');

  return targets.filter((t) => t.kind === 'point' || !points.some((pt) => dist(pt.p, t.p) < 0.5));
}

/**
 * Le meilleur aimant près de `p` : la priorité d'abord, la distance ensuite.
 * `grid` (taille en unités de scène) ajoute les nœuds de la grille, en
 * dernier recours.
 *
 * @returns {{point: {x:number,y:number}, kind: string, id?: string} | null}
 */
export function snapPoint(p, targets, tolerance, { grid = 0, exclude = null } = {}) {
  let best = null;
  for (const t of targets) {
    if (exclude && t.id && exclude.has(t.id)) continue;
    const d = dist(p, t.p);
    if (d > tolerance) continue;
    if (!best || t.priority < best.priority || (t.priority === best.priority && d < best.d)) best = { ...t, d };
  }
  if (best) return { point: { ...best.p }, kind: best.kind, id: best.id };
  if (grid > 0) {
    const node = { x: Math.round(p.x / grid) * grid, y: Math.round(p.y / grid) * grid };
    if (dist(p, node) <= tolerance * 0.6) return { point: node, kind: 'grid' };
  }

  return null;
}

/**
 * Le bord d'instrument le plus proche de `p`, s'il est à portée : le crayon
 * se pose alors SUR ce bord, et y reste jusqu'au lever.
 *
 * @param {Array<{id: string, a: object, b: object}>} edges
 */
export function snapToEdge(p, edges, tolerance) {
  let best = null;
  for (const edge of edges) {
    const d = distanceToSegment(p, edge.a, edge.b);
    if (d <= tolerance && (!best || d < best.d)) best = { edge, d };
  }
  if (!best) return null;

  return { edge: best.edge, point: projectOnLine(p, best.edge.a, best.edge.b).point };
}

/**
 * Aimante la DIRECTION d'un trait qui part de `start` : horizontale,
 * verticale, puis parallèle ou perpendiculaire à l'une des droites de la
 * scène. La longueur est conservée — seule la direction est corrigée.
 *
 * @param {Array<{id: string, a: object, b: object}>} lines
 * @returns {{end: object, kind: 'horizontal'|'vertical'|'parallel'|'perpendicular', ref?: object} | null}
 */
export function snapDirection(start, end, lines, tolerance = DIRECTION_TOLERANCE) {
  const v = sub(end, start);
  const l = len(v);
  if (l < 1e-6) return null;
  const angle = angleOf(v);
  const candidates = [
    { kind: 'horizontal', dir: 0 },
    { kind: 'vertical', dir: Math.PI / 2 },
  ];
  for (const line of lines) {
    const dir = angleOf(sub(line.b, line.a));
    candidates.push({ kind: 'parallel', dir, ref: line });
    candidates.push({ kind: 'perpendicular', dir: dir + Math.PI / 2, ref: line });
  }
  let best = null;
  for (const c of candidates) {
    const gap = lineAngleGap(angle, c.dir);
    if (gap <= tolerance && (!best || gap < best.gap - 1e-9)) best = { ...c, gap };
  }
  if (!best) return null;
  // La direction retenue, orientée comme le geste.
  let u = unit(best.dir);
  if (dot(u, v) < 0) u = scale(u, -1);

  return { end: add(start, scale(u, l)), kind: best.kind, ref: best.ref };
}

/**
 * Aimante un ANGLE de rotation (un instrument qu'on tourne) : sur les
 * multiples de `stepDeg` degrés, ou sur les directions données (les droites
 * de la scène), dans la tolérance. Rend l'angle corrigé et ce qui l'a attiré.
 */
export function snapRotation(angle, { stepDeg = 15, directions = [], tolerance = toRadians(2) } = {}) {
  let best = null;
  for (const dir of directions) {
    for (const candidate of [dir, dir + Math.PI]) {
      const gap = Math.abs(normalizeAngle(angle - candidate));
      if (gap <= tolerance && (!best || gap < best.gap)) best = { angle: angle - normalizeAngle(angle - candidate), gap, kind: 'line' };
    }
  }
  if (best) return best;
  if (stepDeg > 0) {
    const step = toRadians(stepDeg);
    const target = Math.round(angle / step) * step;
    if (Math.abs(angle - target) <= tolerance) return { angle: target, gap: Math.abs(angle - target), kind: 'step' };
  }

  return null;
}
