/**
 * trajetData — les séries de la leçon.
 *
 * CHOISIES POUR CE QU'ELLES RENDENT VISIBLE :
 *  - TRAJETS : douze temps de trajet, moyenne 16,67 min et médiane 15 min
 *    DIFFÉRENTES — sans quoi la leçon entière tomberait à plat. Une valeur
 *    extrême (35) tire déjà la moyenne au-dessus de la médiane.
 *  - EQUILIBRE : six valeurs de moyenne EXACTEMENT 15, pour que le point
 *    d'équilibre tombe sur une graduation et soit atteignable au pas de 5.
 *  - CLASSE_A / CLASSE_B : même moyenne et même médiane, étendues très
 *    différentes. C'est l'argument du module 6 : deux séries que la moyenne ne
 *    distingue pas du tout.
 *  - NOTES : la série du labo, où ajouter une valeur doit amener la moyenne
 *    à une cible ronde.
 */

/** Les douze trajets de la classe, en minutes. */
export const TRAJETS = [5, 8, 10, 10, 12, 15, 15, 15, 20, 25, 30, 35];

/** Six valeurs dont la moyenne vaut exactement 15. */
export const EQUILIBRE = [5, 10, 15, 15, 20, 25];

/** Deux classes de même moyenne (15) et même médiane (15). */
export const CLASSE_A = [13, 14, 15, 15, 16, 17];   // étendue 4
export const CLASSE_B = [5, 8, 15, 15, 22, 25];     // étendue 20

/** La série du labo : cinq notes, à compléter pour viser une moyenne. */
export const NOTES = [8, 12, 14, 16, 20];

/** L'axe commun des modules sur les trajets. */
export const AXE = { min: 0, max: 40, step: 5 };
