/**
 * Tableaux — 6e · modèle mathématique unique.
 *
 * ÉTAT CANONIQUE (une seule source de vérité pour toutes les
 * représentations de la leçon) :
 *
 *   TableModel = {
 *     rowHeader: string,          // en-tête de la colonne des lignes (« Élève »)
 *     colHeaders: string[],       // en-têtes de colonnes (« Lundi », « Mardi »…)
 *     rowLabels: string[],        // étiquettes de lignes
 *     unit: string|null,          // unité commune des cellules (« € », « km »…)
 *     values: number[][],         // values[r][c] — null = cellule vide
 *   }
 *
 * Tout le reste — totaux, comparaisons, phrases de lecture, verdicts — se
 * DÉRIVE de cet objet. Aucune valeur affichée n'est stockée deux fois : la
 * liste « en vrac » du module 1 et le tableau du module 3 sont deux vues du
 * même `values`.
 *
 * Une cellule ne veut rien dire hors de son croisement : `cellMeaning`
 * fabrique la phrase de lecture (ligne × colonne × unité) qui est LE test de
 * compréhension de la leçon. C'est aussi ce qui alimente les aria-labels.
 */
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/** Construit un modèle de tableau en vérifiant la cohérence des dimensions. */
export function makeTable({ rowHeader, colHeaders, rowLabels, values, unit = null }) {
  if (values.length !== rowLabels.length) {
    throw new Error(`makeTable: ${values.length} lignes de valeurs pour ${rowLabels.length} étiquettes`);
  }
  values.forEach((row, r) => {
    if (row.length !== colHeaders.length) {
      throw new Error(`makeTable: ligne ${r} a ${row.length} cellules pour ${colHeaders.length} colonnes`);
    }
  });
  return { rowHeader, colHeaders, rowLabels, values, unit };
}

/** Nombre de lignes / colonnes de données (hors en-têtes). */
export const rowCount = (t) => t.rowLabels.length;
export const colCount = (t) => t.colHeaders.length;

/** Valeur d'une cellule, ou null si elle est vide. */
export function cellValue(t, r, c) {
  const v = t.values?.[r]?.[c];
  return v === undefined ? null : v;
}

/** Formate une valeur avec l'unité du tableau (null → « ? »). */
export function formatCell(t, v) {
  if (v === null || v === undefined) return '?';
  return t.unit ? `${formatDec(v)} ${t.unit}` : formatDec(v);
}

/**
 * LA phrase de lecture d'une cellule : ce que le nombre représente.
 * « 12 € : ce que Léa a dépensé le mardi. »
 */
export function cellMeaning(t, r, c) {
  const v = cellValue(t, r, c);
  return {
    row: t.rowLabels[r],
    col: t.colHeaders[c],
    value: v,
    text: `${formatCell(t, v)} — ${t.rowLabels[r]}, ${t.colHeaders[c]}`,
  };
}

/** aria-label d'une cellule : lecture complète du croisement. */
export function cellAriaLabel(t, r, c) {
  const v = cellValue(t, r, c);
  const read = v === null ? 'cellule vide' : formatCell(t, v);
  return `${t.rowLabels[r]}, ${t.colHeaders[c]} : ${read}`;
}

/** Somme d'une ligne — ignore les cellules vides. */
export function rowTotal(t, r) {
  return roundTo(t.values[r].reduce((s, v) => s + (v ?? 0), 0));
}

/** Somme d'une colonne — ignore les cellules vides. */
export function colTotal(t, c) {
  return roundTo(t.values.reduce((s, row) => s + (row[c] ?? 0), 0));
}

/** Indices des lignes triées selon leur total (ordre décroissant par défaut). */
export function rowsRankedByTotal(t, direction = 'desc') {
  const idx = t.rowLabels.map((_, r) => r);
  const sign = direction === 'asc' ? 1 : -1;
  return idx.sort((a, b) => sign * (rowTotal(t, a) - rowTotal(t, b)));
}

/** La ligne au plus grand total (index). */
export const bestRow = (t) => rowsRankedByTotal(t, 'desc')[0];
/** La colonne au plus grand total (index). */
export function bestCol(t) {
  let best = 0;
  for (let c = 1; c < colCount(t); c += 1) if (colTotal(t, c) > colTotal(t, best)) best = c;
  return best;
}

/** Toutes les cellules encore vides, dans l'ordre de lecture. */
export function missingCells(t) {
  const out = [];
  for (let r = 0; r < rowCount(t); r += 1) {
    for (let c = 0; c < colCount(t); c += 1) if (cellValue(t, r, c) === null) out.push({ r, c });
  }
  return out;
}

/** Retourne une COPIE du tableau avec une cellule renseignée (immuable). */
export function withCell(t, r, c, value) {
  const values = t.values.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row));
  return { ...t, values };
}

/**
 * Range un fait brut (« Léa, mardi, 12 ») dans le tableau : renvoie la
 * position attendue, ou null si le fait ne correspond à aucun croisement.
 * C'est le moteur de la manipulation signature (ranger l'information).
 */
export function placeFact(t, fact) {
  const r = t.rowLabels.indexOf(fact.row);
  const c = t.colHeaders.indexOf(fact.col);
  if (r === -1 || c === -1) return null;
  return { r, c };
}

/** Le tableau est-il entièrement rempli ? */
export const isComplete = (t) => missingCells(t).length === 0;
