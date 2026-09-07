/**
 * Données de la leçon « Statistiques à une variable ».
 *
 * Les séries sont fixées ici plutôt que dans les modules : elles servent à
 * plusieurs modules (la 2de A ouvre la leçon, revient au module 3 et à la
 * comparaison finale), et surtout les corrections des questions citent des
 * valeurs numériques qui doivent rester cohérentes d'un module à l'autre.
 *
 * Toutes les valeurs annoncées dans les énoncés sont vérifiées par
 * data.test.js — aucun nombre de correction n'est écrit « de mémoire ».
 */

/** 2de A — temps de trajet (min), n = 20. Série de référence de la leçon. */
export const TRAJETS_A = [5, 8, 10, 10, 12, 12, 15, 15, 15, 18, 18, 20, 20, 22, 25, 25, 28, 30, 35, 40];

/** 2de B — même moyenne que A ou presque, mais beaucoup plus resserrée. */
export const TRAJETS_B = [14, 15, 15, 16, 17, 17, 18, 18, 18, 19, 19, 19, 20, 20, 21, 22, 22, 23, 24, 25];

/** La série A à laquelle on ajoute un élève qui habite très loin (module 5). */
export const ELEVE_LOINTAIN = 120;

/** Deux ateliers du module 6 : même médiane, dispersions opposées. */
export const ATELIER_X = [12, 14, 15, 16, 16, 17, 18, 19, 20, 21];
export const ATELIER_Y = [2, 5, 9, 14, 16, 17, 24, 28, 33, 38];
