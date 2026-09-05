/**
 * functionUtils — la mathématique de la leçon « Fonctions », sans aucun pixel.
 *
 * UNE RÈGLE est un objet, jamais une liste de valeurs :
 *   { kind: 'affine', a, b }          f(x) = ax + b   (linéaire quand b = 0)
 *   { kind: 'square' }                f(x) = x²
 *   { kind: 'custom', fn, label }     tout le reste (fil rouge : le taxi)
 *
 * POURQUOI UNE RÈGLE ET PAS DES VALEURS : une machine se reconnaît à ce
 * qu'elle fait POUR TOUT x, pas aux quatre nombres qu'on lui a vu produire.
 * Un élève qui n'a que des valeurs peut croire que « 1→3, 2→6 » est n'importe
 * quoi ; c'est la règle qui décide, et c'est elle que la leçon manipule.
 *
 * DISSYMÉTRIE IMAGE / ANTÉCÉDENT — le cœur de la leçon :
 *   `imageOf`      renvoie UN nombre (ou null hors domaine).
 *   `antecedentsOf` renvoie UNE LISTE, éventuellement vide, parfois à deux
 *                   éléments (x² = 4 → −2 et 2).
 * Ne jamais faire renvoyer un seul antécédent à `antecedentsOf` : la leçon
 * existe précisément pour que l'élève voie qu'il peut y en avoir plusieurs.
 */

import { roundTo, formatDec, texDec, formatAffine } from '@smarter-academy/core';

/** f(x) = ax + b. */
export const affine = (a, b = 0) => ({ kind: 'affine', a, b });
/** f(x) = x². Présente dès le module 2 : c'est elle qui donne DEUX antécédents. */
export const square = () => ({ kind: 'square' });
/** Une règle quelconque, décrite par son étiquette. */
export const custom = (fn, label) => ({ kind: 'custom', fn, label });

/** Image de x par la règle — UN nombre, ou null si la règle ne s'applique pas. */
export function imageOf(rule, x) {
  if (!rule || !Number.isFinite(x)) return null;
  switch (rule.kind) {
    case 'affine': return roundTo(rule.a * x + rule.b, 6);
    case 'square': return roundTo(x * x, 6);
    case 'custom': {
      const y = rule.fn(x);
      return Number.isFinite(y) ? roundTo(y, 6) : null;
    }
    default: return null;
  }
}

/**
 * TOUS les antécédents de y — toujours une liste, triée.
 *   affine, a ≠ 0 : un seul, (y − b) / a
 *   affine, a = 0 : aucun, ou une infinité (signalée par `Infinity` en tête)
 *   carré         : deux (±√y), un (0), ou aucun (y < 0)
 *   custom        : cherchés parmi les candidats fournis
 */
export function antecedentsOf(rule, y, candidates = null) {
  if (!rule || !Number.isFinite(y)) return [];
  switch (rule.kind) {
    case 'affine': {
      if (roundTo(rule.a, 9) === 0) return roundTo(rule.b, 9) === y ? [Infinity] : [];
      return [roundTo((y - rule.b) / rule.a, 6)];
    }
    case 'square': {
      const ry = roundTo(y, 9);
      if (ry < 0) return [];
      if (ry === 0) return [0];
      const r = roundTo(Math.sqrt(ry), 6);
      return [-r, r];
    }
    case 'custom': {
      const pool = candidates ?? [];
      return pool.filter((x) => roundTo(imageOf(rule, x) ?? NaN, 6) === roundTo(y, 6)).sort((p, q) => p - q);
    }
    default: return [];
  }
}

/** Tableau de valeurs : [{x, y}] — la machine rangée en deux lignes. */
export function tableOf(rule, xs) {
  return xs.map((x) => ({ x: roundTo(x, 6), y: imageOf(rule, x) }));
}

/** Linéaire : de la forme ax, donc passant par l'origine. */
export function isLinear(rule) {
  return rule?.kind === 'affine' && roundTo(rule.b, 9) === 0 && roundTo(rule.a, 9) !== 0;
}

/** Affine : de la forme ax + b (les linéaires en font partie). */
export function isAffine(rule) {
  return rule?.kind === 'affine';
}

/**
 * Le nom que le graphique donne à la règle.
 * Attention : une fonction linéaire EST affine. `classify` renvoie le nom le
 * plus précis — 'lineaire' l'emporte donc sur 'affine'.
 */
export function classify(rule) {
  if (isLinear(rule)) return 'lineaire';
  if (isAffine(rule) && roundTo(rule.a, 9) === 0) return 'constante';
  if (isAffine(rule)) return 'affine';
  return 'ni-lun-ni-lautre';
}

/**
 * Points alignés ? — le test graphique de « affine ».
 * Trois points suffisent à trahir une parabole.
 */
export function pointsAreAligned(points, eps = 1e-6) {
  if (points.length < 3) return true;
  const [p, q] = points;
  const dx = q.x - p.x;
  if (Math.abs(dx) < eps) return false;
  const a = (q.y - p.y) / dx;
  return points.every((r) => Math.abs(r.y - (p.y + a * (r.x - p.x))) < 1e-6);
}

/** La droite passe-t-elle par l'origine ? — le test graphique de « linéaire ». */
export function passesThroughOrigin(rule) {
  return roundTo(imageOf(rule, 0) ?? NaN, 9) === 0;
}

/**
 * Retrouve la règle affine derrière un tableau de valeurs.
 * Renvoie null quand les points ne sont PAS alignés — le tableau ne cache
 * alors aucune fonction affine, et le dire est la bonne réponse.
 */
export function ruleFromTable(rows) {
  const pts = rows.filter((r) => Number.isFinite(r.x) && Number.isFinite(r.y));
  if (pts.length < 2) return null;
  if (!pointsAreAligned(pts)) return null;
  const [p, q] = pts;
  const dx = q.x - p.x;
  if (roundTo(dx, 9) === 0) return null;
  const a = roundTo((q.y - p.y) / dx, 6);
  return affine(a, roundTo(p.y - a * p.x, 6));
}

/** Écriture LaTeX de la règle, pour <MathText>. */
export function formatRule(rule, opts = {}) {
  const { variable = 'x', name = 'f', withName = true } = opts;
  if (!rule) return '';
  if (rule.kind === 'affine') return formatAffine(rule.a, rule.b, { variable, name, withName });
  const head = withName ? `${name}(${variable}) = ` : '';
  if (rule.kind === 'square') return `${head}${variable}^{2}`;
  return `${head}${rule.label ?? '?'}`;
}

/** « f(3) = 7 », prêt pour <MathText>. */
export function formatImage(rule, x, opts = {}) {
  const { name = 'f' } = opts;
  const y = imageOf(rule, x);
  return `${name}(${texDec(x)}) = ${y === null ? '?' : texDec(y)}`;
}

/** Lecture en toutes lettres, pour un aria-label ou une correction. */
export function describeImage(rule, x, opts = {}) {
  const { name = 'f' } = opts;
  const y = imageOf(rule, x);
  if (y === null) return `${name} n'a pas d'image en ${formatDec(x)}`;
  return `l'image de ${formatDec(x)} par ${name} est ${formatDec(y)}`;
}

/* ───────────────────────── Cadre d'un repère adapté aux couples ──────────
 * Le module 1 laisse l'élève entrer N'IMPORTE QUEL nombre dans la machine :
 * le repère qui montre ses couples ne peut donc pas avoir une étendue fixe.
 * `planeFor` calcule une étendue, un pas de graduation et des unités en pixels
 * tels que : les deux axes contiennent 0 (CoordPlane les trace en 0), aucun
 * point ne tombe sur le bord du cadre, et le nombre de graduations reste
 * borné (≈ maxTicks + 2) quelle que soit la grandeur des nombres — sinon une
 * entrée de 1 000 fabriquerait deux mille traits (règle d'affichage §17bis).
 */
const NICE_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

/** Le plus petit pas « rond » qui tient l'étendue en au plus maxTicks graduations. */
export function niceStep(span, maxTicks = 10) {
  for (const s of NICE_STEPS) if (span / s <= maxTicks) return s;
  return NICE_STEPS[NICE_STEPS.length - 1];
}

/** Étend [lo, hi] à la graduation voisine, en laissant toujours un cran de marge. */
function extend(lo, hi, step) {
  let a = Math.floor(lo / step) * step;
  if (a === lo && a !== 0) a -= step;
  let b = Math.ceil(hi / step) * step;
  if (b === hi && b !== 0) b += step;
  if (b <= a) b = a + step;
  return [roundTo(a, 6), roundTo(b, 6)];
}

/**
 * → { range, xStep, yStep, unit, unitY } pour <CoordPlane>.
 * `width`/`height` sont les dimensions visées du cadre en pixels ; les unités
 * en sont déduites, si bien qu'un repère de −1 000 à 1 000 occupe la même
 * place qu'un repère de −3 à 5.
 */
export function planeFor(points, { maxTicks = 10, width = 300, height = 240 } = {}) {
  const xs = points.map((p) => p.x).filter(Number.isFinite);
  const ys = points.map((p) => p.y).filter(Number.isFinite);
  const xLo = Math.min(0, ...xs);
  const xHi = Math.max(0, ...xs);
  const yLo = Math.min(0, ...ys);
  const yHi = Math.max(0, ...ys);
  const xStep = niceStep(Math.max(xHi - xLo, 1), maxTicks);
  const yStep = niceStep(Math.max(yHi - yLo, 1), maxTicks);
  const [xMin, xMax] = extend(xLo, xHi, xStep);
  const [yMin, yMax] = extend(yLo, yHi, yStep);
  return {
    range: { xMin, xMax, yMin, yMax },
    xStep,
    yStep,
    unit: roundTo(width / (xMax - xMin), 6),
    unitY: roundTo(height / (yMax - yMin), 6),
  };
}
