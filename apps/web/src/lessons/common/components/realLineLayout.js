import { roundTo, formatDec } from '@smarter-academy/core';

/**
 * realLineLayout — la géométrie pure derrière RealLine (droite réelle
 * bidirectionnelle partagée par les leçons de 2nde).
 *
 * UNITÉ = PIXEL CSS. Le viewBox de RealLine fait exactement la largeur de
 * son conteneur (mesurée par ResizeObserver), si bien qu'une police de
 * 13 px est vraiment 13 px sur l'écran, sur un téléphone comme sur un
 * grand écran. C'est ce qui rend les étiquettes lisibles à 375 px sans
 * défilement horizontal.
 *
 * Tout ce qui touche à la SÉCURITÉ DE MISE EN PAGE (INTERACTION_PEDAGOGY
 * §17bis) vit ici, testable sans DOM :
 *  - les marges gauche/droite sont dérivées de la plus large étiquette de
 *    graduation réellement dessinée (jamais un pad fixe) ;
 *  - le nombre d'étiquettes de graduation est BORNÉ PAR LA LARGEUR : on
 *    n'étiquette qu'une graduation sur k, k choisi pour que deux étiquettes
 *    voisines ne se touchent jamais ;
 *  - les étiquettes de points/bornes/curseurs sont réparties sur des rangées
 *    (placeLabels) pour ne jamais se chevaucher, puis serrées dans le cadre
 *    (clampCenter).
 *
 * Largeur estimée en fonte mono : 0,62 em par caractère — mesuré sur
 * JetBrains Mono, plus large que la réalité pour « 1 » et « , » (donc sûr).
 */
export const DEFAULT_W = 640;
export const CHAR_EM = 0.62;
export const ARROW = 14; // longueur de la pointe de flèche à chaque bout (px)
export const LABEL_GAP = 8;

export function estimateTextWidth(text, fontSize) {
  return String(text ?? '').length * fontSize * CHAR_EM;
}

/** Graduations de min à max par pas de step (bornes incluses), arrondies. */
export function ticksBetween(min, max, step) {
  if (!(step > 0) || !(max > min)) return [];
  const out = [];
  const n = Math.round((max - min) / step);
  if (n > 400) return [];
  // Arrondi à 10 décimales : un pas de 10^-7 (zoom ×10^6) doit donner des
  // graduations DISTINCTES — roundTo par défaut (6 décimales) les confondrait.
  for (let i = 0; i <= n; i += 1) out.push(roundTo(min + i * step, 10));
  return out;
}

/**
 * Plus petit k tel qu'en étiquetant une graduation sur k, deux étiquettes
 * voisines (de largeur `labelW`) restent séparées d'au moins `gap`.
 */
export function labelEveryFor(tickPx, labelW, gap = LABEL_GAP) {
  if (!(tickPx > 0)) return 1;
  return Math.max(1, Math.ceil((labelW + gap) / tickPx));
}

/**
 * Géométrie horizontale : marges calculées à partir des étiquettes de
 * graduation qui seront dessinées, plus les pointes de flèche.
 */
export function lineGeometry({ min, max, step, labelEvery, format = formatDec, fontSize = 13, W = DEFAULT_W, extraLeft = 0, extraRight = 0 }) {
  const ticks = ticksBetween(min, max, step);
  const widest = ticks.reduce((m, v) => Math.max(m, estimateTextWidth(format(v), fontSize)), 0);
  // Première passe : marges avec la plus large étiquette possible.
  const padL0 = Math.max(ARROW + 10, widest / 2 + 4, extraLeft);
  const padR0 = Math.max(ARROW + 10, widest / 2 + 4, extraRight);
  const axisW0 = Math.max(80, W - padL0 - padR0);
  const tickPx = ticks.length > 1 ? axisW0 / (ticks.length - 1) : axisW0;
  const every = labelEvery ?? labelEveryFor(tickPx, widest);
  const labelled = ticks.filter((_, i) => i % every === 0);
  const first = labelled[0];
  const last = labelled[labelled.length - 1];
  const halfFirst = first === undefined ? 0 : estimateTextWidth(format(first), fontSize) / 2;
  const halfLast = last === undefined ? 0 : estimateTextWidth(format(last), fontSize) / 2;
  const padL = Math.max(ARROW + 10, halfFirst + 4, extraLeft);
  const padR = Math.max(ARROW + 10, halfLast + 4, extraRight);
  const axisW = Math.max(80, W - padL - padR);
  const span = max - min;
  const toX = (v) => padL + ((v - min) / span) * axisW;
  const fromX = (x) => min + ((x - padL) / axisW) * span;
  return { ticks, labelEvery: every, padL, padR, axisW, toX, fromX, W };
}

/** Serre un centre d'étiquette pour que [x − half, x + half] tienne dans [0, W]. */
export function clampCenter(x, half, W = DEFAULT_W, margin = 1) {
  if (x - half < margin) return half + margin;
  if (x + half > W - margin) return W - half - margin;
  return x;
}

/**
 * Répartit des étiquettes { id, x, width } sur des rangées (0, 1, 2…) de
 * sorte que deux étiquettes d'une même rangée ne se chevauchent jamais.
 * Les centres sont d'abord serrés dans le cadre. Une étiquette prend la
 * première rangée libre.
 *
 * @returns {{id, x, width, row}[]}  x = centre serré
 */
export function placeLabels(items, { W = DEFAULT_W, gap = 4 } = {}) {
  const sorted = [...items]
    .map((it) => ({ ...it, x: clampCenter(it.x, it.width / 2, W) }))
    .sort((a, b) => a.x - b.x);
  const rows = []; // rows[r] = bord droit de la dernière étiquette posée sur la rangée r
  const out = [];
  for (const it of sorted) {
    const left = it.x - it.width / 2;
    let r = 0;
    while (rows[r] !== undefined && rows[r] + gap > left) r += 1;
    rows[r] = it.x + it.width / 2;
    out.push({ ...it, row: r });
  }
  return out;
}

/** Vrai si deux boîtes [x±w/2] se chevauchent. */
export function overlaps(a, b, gap = 0) {
  return a.x - a.width / 2 < b.x + b.width / 2 + gap && b.x - b.width / 2 < a.x + a.width / 2 + gap;
}

/** Arrondit une valeur au pas `snap` et la borne dans [min, max]. */
export function snapValue(raw, { min, max, snap }) {
  const s = snap > 0 ? Math.round(raw / snap) * snap : raw;
  return roundTo(Math.min(max, Math.max(min, s)));
}
