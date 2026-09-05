/**
 * Le tournoi inter-classes de la 6e B — le jeu de données unique qui
 * traverse toute la leçon (module 1 en vrac → module 3 rangé → module 5
 * comparé → synthèse du boss figée).
 *
 * Les chiffres sont choisis pour que la lecture reste franche :
 *  - Inès gagne au TOTAL (37) sans gagner aucune épreuve : le tableau
 *    contredit l'intuition « le meilleur est celui qu'on a vu gagner » ;
 *  - Tom gagne le relais (15) — la meilleure CASE n'est pas la meilleure
 *    ligne, c'est le piège travaillé au module 5 ;
 *  - aucune égalité de total, donc aucun classement ambigu.
 */
import { makeTable } from './tableUtils';

export const ROW_HEADER = 'Élève';
export const EPREUVES = ['Course', 'Saut', 'Relais', 'Précision'];
export const ELEVES = ['Léa', 'Tom', 'Inès', 'Hugo'];

export const SCORES = [
  [12, 8, 9, 7],   // Léa   = 36
  [7, 6, 15, 6],   // Tom   = 34
  [9, 10, 8, 10],  // Inès  = 37  ← meilleur total
  [10, 5, 7, 9],   // Hugo  = 31
];

/** Le tableau complet du tournoi. */
export const TOURNOI = makeTable({
  rowHeader: ROW_HEADER,
  colHeaders: EPREUVES,
  rowLabels: ELEVES,
  values: SCORES,
  unit: 'pts',
});

/** Le même tableau, vide — point de départ de la manipulation signature. */
export const TOURNOI_VIDE = makeTable({
  rowHeader: ROW_HEADER,
  colHeaders: EPREUVES,
  rowLabels: ELEVES,
  values: SCORES.map((row) => row.map(() => null)),
  unit: 'pts',
});

/** Les faits « en vrac » correspondants, dans un ordre volontairement mêlé. */
export const FAITS_VRAC = [
  { id: 'f1', row: 'Tom', col: 'Relais', value: 15, label: 'Tom, relais : 15 pts' },
  { id: 'f2', row: 'Léa', col: 'Course', value: 12, label: 'Léa, course : 12 pts' },
  { id: 'f3', row: 'Inès', col: 'Précision', value: 10, label: 'Inès, précision : 10 pts' },
  { id: 'f4', row: 'Hugo', col: 'Saut', value: 5, label: 'Hugo, saut : 5 pts' },
  { id: 'f5', row: 'Léa', col: 'Relais', value: 9, label: 'Léa, relais : 9 pts' },
  { id: 'f6', row: 'Inès', col: 'Saut', value: 10, label: 'Inès, saut : 10 pts' },
];

/**
 * Un sous-tableau 4×2 utilisé pour la manipulation signature : remplir 16
 * cases lasserait bien avant l'« aha ». Huit croisements suffisent à faire
 * vivre le geste, et le plafond de densité reste très large.
 */
export const TOURNOI_DEBUT = makeTable({
  rowHeader: ROW_HEADER,
  colHeaders: ['Course', 'Relais'],
  rowLabels: ELEVES,
  values: [[null, null], [null, null], [null, null], [null, null]],
  unit: 'pts',
});

export const FAITS_DEBUT = [
  { id: 'd1', row: 'Tom', col: 'Relais', value: 15, label: 'Tom, relais : 15 pts' },
  { id: 'd2', row: 'Léa', col: 'Course', value: 12, label: 'Léa, course : 12 pts' },
  { id: 'd3', row: 'Hugo', col: 'Relais', value: 7, label: 'Hugo, relais : 7 pts' },
  { id: 'd4', row: 'Inès', col: 'Course', value: 9, label: 'Inès, course : 9 pts' },
  { id: 'd5', row: 'Léa', col: 'Relais', value: 9, label: 'Léa, relais : 9 pts' },
  { id: 'd6', row: 'Tom', col: 'Course', value: 7, label: 'Tom, course : 7 pts' },
  { id: 'd7', row: 'Inès', col: 'Relais', value: 8, label: 'Inès, relais : 8 pts' },
  { id: 'd8', row: 'Hugo', col: 'Course', value: 10, label: 'Hugo, course : 10 pts' },
];
