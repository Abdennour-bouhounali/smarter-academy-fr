/**
 * Graphiques — 6e · modèle mathématique unique.
 *
 * PRINCIPE ARCHITECTURAL (CLAUDE.md §7-8, playbook §4) : le tableau et le
 * graphique NE SONT PAS deux états. Il n'existe qu'une seule donnée —
 *
 *   Series = { categories: string[], values: number[], unit, label }
 *
 * — et le graphique comme le tableau en sont deux RENDUS. Modifier une
 * valeur modifie la série ; les deux représentations se redessinent
 * ensemble parce qu'elles lisent le même tableau de nombres. C'est
 * exactement ce que la leçon veut faire ressentir : « ce sont deux façons
 * de montrer la même chose ».
 *
 * L'échelle est elle aussi dérivée (jamais saisie à la main) : `niceMax`
 * arrondit le maximum vers le haut à une graduation lisible, et
 * `valueToY`/`yToValue` sont réciproques — la lecture d'une hauteur et le
 * placement d'une barre utilisent le MÊME couple de fonctions, donc ne
 * peuvent pas diverger.
 *
 * CONVENTION SVG : l'axe des ordonnées est inversé (y augmente vers le bas
 * en SVG). Toute conversion passe par valueToY/yToValue — aucun calcul de
 * hauteur en dur dans les composants.
 */
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/** Construit une série en vérifiant que catégories et valeurs se correspondent. */
export function makeSeries({ categories, values, unit = null, label = '' }) {
  if (categories.length !== values.length) {
    throw new Error(`makeSeries: ${values.length} valeurs pour ${categories.length} catégories`);
  }
  return { categories, values, unit, label };
}

/** Valeur d'une catégorie (par index), null si absente. */
export function valueAt(s, i) {
  const v = s.values[i];
  return v === undefined ? null : v;
}

/** Renvoie une COPIE de la série avec une valeur modifiée (immuable). */
export function withValue(s, i, value) {
  return { ...s, values: s.values.map((v, k) => (k === i ? value : v)) };
}

/** Formate une valeur avec l'unité de la série. */
export function formatValue(s, v) {
  if (v === null || v === undefined) return '?';
  return s.unit ? `${formatDec(v)} ${s.unit}` : formatDec(v);
}

/** Maximum brut de la série (0 si vide). */
export function rawMax(s) {
  const vals = s.values.filter((v) => v !== null && v !== undefined);
  return vals.length ? Math.max(...vals) : 0;
}

/**
 * Plafond d'axe « lisible » : le premier multiple de `step` strictement
 * au-dessus du maximum. L'axe ne dépend donc jamais d'un nombre écrit à la
 * main dans un module, et la plus haute barre ne touche jamais le plafond.
 *
 * `floor` fixe une hauteur d'axe MINIMALE. Il est indispensable dès qu'une
 * série est construite à partir de zéro : sans lui, l'axe se recalculerait à
 * chaque ajustement (0 → plafond 5, donc une barre ne pourrait jamais
 * dépasser 5) et la valeur cible deviendrait inatteignable — c'est la
 * classe de bug « target hors de la grille tappable » (playbook §10.6).
 */
export function niceMax(s, step = 5, floor = 0) {
  const m = Math.max(rawMax(s), floor);
  if (m <= 0) return step;
  const up = Math.ceil(m / step) * step;
  return up === m && floor <= m - step ? m + step : Math.max(up, floor);
}

/** Les graduations de l'axe vertical, de 0 à niceMax. */
export function axisTicks(s, step = 5, floor = 0) {
  const max = niceMax(s, step, floor);
  const out = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}

/** Valeur → ordonnée SVG (axe inversé : 0 en bas). */
export function valueToY(value, max, plotTop, plotBottom) {
  const clamped = Math.max(0, Math.min(value, max));
  return roundTo(plotBottom - (clamped / max) * (plotBottom - plotTop), 3);
}

/** Ordonnée SVG → valeur (réciproque exacte de valueToY). */
export function yToValue(y, max, plotTop, plotBottom) {
  const ratio = (plotBottom - y) / (plotBottom - plotTop);
  return roundTo(Math.max(0, Math.min(1, ratio)) * max, 6);
}

/** Arrondit une valeur au pas tappable le plus proche (accrochage). */
export function snapValue(value, step, max) {
  const snapped = Math.round(value / step) * step;
  return Math.max(0, Math.min(snapped, max));
}

/** Index de la plus grande / plus petite valeur. */
export function maxIndex(s) {
  let best = 0;
  s.values.forEach((v, i) => { if (v > s.values[best]) best = i; });
  return best;
}
export function minIndex(s) {
  let best = 0;
  s.values.forEach((v, i) => { if (v < s.values[best]) best = i; });
  return best;
}

/**
 * Sens de variation entre deux catégories consécutives :
 * 'hausse' | 'baisse' | 'stable'. C'est la lecture « ça monte / ça descend »
 * que la leçon fait découvrir sur une courbe.
 */
export function variation(s, i) {
  if (i <= 0 || i >= s.values.length) return null;
  const d = roundTo(s.values[i] - s.values[i - 1]);
  return { delta: d, direction: d > 0 ? 'hausse' : d < 0 ? 'baisse' : 'stable' };
}

/** Toutes les variations consécutives de la série. */
export function allVariations(s) {
  return s.values.slice(1).map((_, k) => variation(s, k + 1));
}

/** Somme des valeurs (pour les diagrammes circulaires et les totaux). */
export function total(s) {
  return roundTo(s.values.reduce((a, v) => a + (v ?? 0), 0));
}

/**
 * Parts d'un diagramme circulaire, en degrés, dérivées du total.
 * Le dernier secteur absorbe l'arrondi pour que la somme fasse exactement
 * 360° — un camembert ne doit jamais laisser un trou.
 */
export function pieSlices(s) {
  const t = total(s);
  if (t <= 0) return [];
  let acc = 0;
  return s.categories.map((c, i) => {
    const isLast = i === s.categories.length - 1;
    const sweep = isLast ? roundTo(360 - acc, 3) : roundTo((s.values[i] / t) * 360, 3);
    const start = acc;
    acc = roundTo(acc + sweep, 3);
    return { category: c, value: s.values[i], startAngle: start, sweep, endAngle: acc };
  });
}

/** Point du cercle (rayon r, centre cx/cy) à l'angle donné, 0° = midi, sens horaire. */
export function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: roundTo(cx + r * Math.cos(rad), 3), y: roundTo(cy + r * Math.sin(rad), 3) };
}

/** Chemin SVG d'un secteur de camembert. */
export function slicePath(cx, cy, r, startAngle, sweep) {
  const a = polarPoint(cx, cy, r, startAngle);
  const b = polarPoint(cx, cy, r, startAngle + sweep);
  const large = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}
