/**
 * cartesian — la mathématique des courbes dans un repère, sans aucun pixel.
 *
 * `CoordPlane` reçoit une étendue (`range`) et dessine ; il ne sait pas
 * échantillonner une fonction, ni lire une image, ni trouver un antécédent.
 * Ces opérations sont ici, pures et testables, et NE CONNAISSENT QUE des
 * coordonnées d'élève (y vers le haut).
 *
 * UNE COURBE est une polyligne : `[{x, y}, …]` triée par x croissant. Une
 * fonction affine, une parabole et une série de mesures deviennent toutes des
 * courbes — c'est ce qui permet à « lecture graphique » de traiter une courbe
 * quelconque avec les mêmes outils que « fonctions affines ».
 *
 * IMAGE vs ANTÉCÉDENT — la dissymétrie est l'objet même de la leçon :
 * `imageAt` renvoie UN nombre (ou null), `antecedentsOf` renvoie UNE LISTE
 * (souvent vide, parfois à deux éléments). Ne jamais « simplifier »
 * antecedentsOf en renvoyant la première valeur.
 */

import { roundTo } from '@smarter-academy/core';

/** Échantillonne une fonction sur l'étendue, en n+1 points. */
export function sampleFunction(fn, range, n = 80) {
  const { xMin, xMax } = range;
  const step = (xMax - xMin) / n;
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const x = roundTo(xMin + i * step, 9);
    const y = fn(x);
    if (Number.isFinite(y)) pts.push({ x, y });
  }
  return pts;
}

/**
 * Coupe un segment au cadre du repère (Liang-Barsky).
 * Renvoie `null` quand le segment ne traverse pas le cadre — c'est ce qui
 * empêche une droite y = 5x de sortir du viewBox et d'être rognée au tiers.
 */
export function clipSegmentToRange(range, p, q) {
  const { xMin, xMax, yMin, yMax } = range;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  let t0 = 0;
  let t1 = 1;

  const edge = (num, den) => {
    if (Math.abs(den) < 1e-12) return num <= 0; // parallèle : dedans ssi num ≤ 0
    const t = num / den;
    if (den > 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
    return true;
  };

  // Chaque bord : p + t·d doit rester du bon côté.
  if (!edge(xMin - p.x, dx)) return null;
  if (!edge(p.x - xMax, -dx)) return null;
  if (!edge(yMin - p.y, dy)) return null;
  if (!edge(p.y - yMax, -dy)) return null;

  return {
    from: { x: roundTo(p.x + t0 * dx, 9), y: roundTo(p.y + t0 * dy, 9) },
    to: { x: roundTo(p.x + t1 * dx, 9), y: roundTo(p.y + t1 * dy, 9) },
  };
}

/** Le segment visible d'une fonction affine dans le repère (ou null). */
export function clipAffineToRange(range, a, b) {
  const p = { x: range.xMin, y: a * range.xMin + b };
  const q = { x: range.xMax, y: a * range.xMax + b };
  return clipSegmentToRange(range, p, q);
}

/**
 * Image de x sur une courbe, par interpolation linéaire entre les deux
 * points encadrants. Renvoie null hors du domaine échantillonné.
 */
export function imageAt(curve, x) {
  if (!Array.isArray(curve) || curve.length === 0) return null;
  if (x < curve[0].x || x > curve[curve.length - 1].x) return null;
  for (let i = 0; i < curve.length - 1; i += 1) {
    const p = curve[i];
    const q = curve[i + 1];
    if (x >= p.x && x <= q.x) {
      if (q.x === p.x) return roundTo(p.y, 6);
      const t = (x - p.x) / (q.x - p.x);
      return roundTo(p.y + t * (q.y - p.y), 6);
    }
  }
  return null;
}

/**
 * TOUS les antécédents de y : chaque traversée du niveau y par la courbe.
 * Une parabole en donne deux, un extremum un seul, un niveau non atteint zéro.
 */
export function antecedentsOf(curve, y) {
  const out = [];
  if (!Array.isArray(curve) || curve.length === 0) return out;

  const push = (x) => {
    const r = roundTo(x, 6);
    if (!out.some((v) => Math.abs(v - r) < 1e-6)) out.push(r);
  };

  if (Math.abs(curve[0].y - y) < 1e-9) push(curve[0].x);

  for (let i = 0; i < curve.length - 1; i += 1) {
    const p = curve[i];
    const q = curve[i + 1];
    const dp = p.y - y;
    const dq = q.y - y;
    if (Math.abs(dq) < 1e-9) {
      push(q.x);
    } else if (dp * dq < 0) {
      push(p.x + ((y - p.y) / (q.y - p.y)) * (q.x - p.x));
    }
  }
  return out.sort((a, b) => a - b);
}

/** Le point le plus haut (`kind: 'max'`) ou le plus bas de la courbe. */
export function extremum(curve, kind = 'max') {
  if (!Array.isArray(curve) || curve.length === 0) return null;
  return curve.reduce((best, p) =>
    (kind === 'max' ? p.y > best.y : p.y < best.y) ? p : best
  , curve[0]);
}

/**
 * Découpe la courbe en intervalles de monotonie.
 * → [{ from, to, direction: 'croissante' | 'decroissante' | 'constante' }]
 */
export function variationIntervals(curve, eps = 1e-9) {
  if (!Array.isArray(curve) || curve.length < 2) return [];
  const dirOf = (p, q) => {
    const d = q.y - p.y;
    if (d > eps) return 'croissante';
    if (d < -eps) return 'decroissante';
    return 'constante';
  };

  const out = [];
  let start = curve[0];
  let dir = dirOf(curve[0], curve[1]);

  for (let i = 1; i < curve.length - 1; i += 1) {
    const next = dirOf(curve[i], curve[i + 1]);
    if (next !== dir) {
      out.push({ from: roundTo(start.x, 6), to: roundTo(curve[i].x, 6), direction: dir });
      start = curve[i];
      dir = next;
    }
  }
  out.push({ from: roundTo(start.x, 6), to: roundTo(curve[curve.length - 1].x, 6), direction: dir });
  return out;
}

/** Points d'intersection de deux courbes échantillonnées sur les mêmes x. */
export function curveIntersections(c1, c2) {
  const out = [];
  const n = Math.min(c1.length, c2.length);
  for (let i = 0; i < n - 1; i += 1) {
    const d1 = c1[i].y - c2[i].y;
    const d2 = c1[i + 1].y - c2[i + 1].y;
    if (Math.abs(d1) < 1e-9) {
      out.push({ x: roundTo(c1[i].x, 6), y: roundTo(c1[i].y, 6) });
    } else if (d1 * d2 < 0) {
      const t = d1 / (d1 - d2);
      const x = c1[i].x + t * (c1[i + 1].x - c1[i].x);
      const y = c1[i].y + t * (c1[i + 1].y - c1[i].y);
      out.push({ x: roundTo(x, 6), y: roundTo(y, 6) });
    }
  }
  return out;
}

/**
 * Lecture graphique : une réponse est juste « à la tolérance près ».
 * Lire 3,2 quand la courbe vaut 3 est une lecture correcte ; l'exiger au
 * millième transformerait la leçon en concours de précision manuelle.
 */
export function readWithTolerance(actual, answer, tol = 0.5) {
  if (!Number.isFinite(answer) || !Number.isFinite(actual)) return false;
  return Math.abs(actual - answer) <= tol + 1e-9;
}

/**
 * Étendue « ronde » contenant toutes les valeurs, alignée sur le pas.
 * Garantit min < max même quand toutes les valeurs sont égales.
 */
export function niceRange(values, step = 1) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return { min: 0, max: step };
  const lo = Math.floor(Math.min(...finite) / step) * step;
  const hi = Math.ceil(Math.max(...finite) / step) * step;
  return lo === hi ? { min: roundTo(lo, 6), max: roundTo(lo + step, 6) }
                   : { min: roundTo(lo, 6), max: roundTo(hi, 6) };
}

/** Le point est-il dans le cadre ? */
export function inRange(range, p) {
  return p.x >= range.xMin && p.x <= range.xMax && p.y >= range.yMin && p.y <= range.yMax;
}
