/**
 * La géométrie PURE de « حبل الأعداد » (`number-line-pegs`, thème `clothesline`). Rien ici ne juge : le verdict est dans `logic/numberLinePegs.js`.
 * Repère de conception : 470 × 134 (le حبل, ses deux poteaux, ses étiquettes aux entiers) ; les cartes sont du DOM posé par-dessus, en pixels d'écran
 * (≥ 44 px de haut), à l'abscisse `x × scale`.
 */
export const W = 470;
export const SVG_H = 134;
export const ROPE_Y = 84;
export const PAD = 34;
export const CARD_W = 60;
export const CARD_H = 46;
export const CHIP_H = 22;
export const ROW_PITCH = CARD_H + CHIP_H + 20;
export const STACK_DX = 7;
const STACK_DY = 4;

/** L'abscisse (unités de conception) d'une valeur `v` (flottant, pour le DESSIN) sur le حبل gradué de lo à hi. */
export const xOfValue = (v, [lo, hi]) => PAD + ((v - lo) / (hi - lo)) * (W - 2 * PAD);
/** Et la valeur lue à l'abscisse x (inverse), pour le geste. */
export const valueOfX = (x, [lo, hi]) => lo + ((x - PAD) / (W - 2 * PAD)) * (hi - lo);
/** Les pixels d'écran par UNITÉ. */
export const unitPx = (range, scale) => ((W - 2 * PAD) / (range[1] - range[0])) * scale;

/**
 * La disposition des cartes (pixels d'écran) : chaque carte a une abscisse centrale `px`. Les cartes de MÊME abscisse forment une PILE (décalée en escalier) ; les
 * piles et cartes seules sont rangées sur 1 à 3 rangées, la première rangée où elles ne se chevauchent pas. Retourne `{ [id]: { row, dx, dy, stack, index, count } }` et `rows`.
 */
export function layoutCards(items, { cardW = CARD_W, gap = 6, maxRows = 4 } = {}) {
  const groups = [];
  [...items].sort((a, b) => a.px - b.px || String(a.id).localeCompare(String(b.id))).forEach((it) => {
    const g = groups.find((x) => Math.abs(x.px - it.px) < 1);
    if (g) g.items.push(it); else groups.push({ px: it.px, items: [it] });
  });
  const out = {};
  const rowEnds = [];
  groups.forEach((g) => {
    const w = cardW + STACK_DX * (g.items.length - 1);
    const left = g.px - cardW / 2;
    let row = rowEnds.findIndex((end) => left >= end + gap);
    if (row < 0) row = rowEnds.length < maxRows ? rowEnds.length : rowEnds.indexOf(Math.min(...rowEnds));
    rowEnds[row] = left + w;
    g.items.forEach((it, i) => { out[it.id] = { row, dx: i * STACK_DX, dy: i * STACK_DY, stack: g.items.length > 1, index: i, count: g.items.length }; });
  });
  return { cards: out, rows: Math.max(1, rowEnds.length) };
}

/** Les graduations : les entiers de lo à hi. */
export const integersOf = ([lo, hi]) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
