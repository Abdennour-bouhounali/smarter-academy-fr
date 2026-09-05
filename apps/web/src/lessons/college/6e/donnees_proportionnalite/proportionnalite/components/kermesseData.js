/**
 * La kermesse du collège — situations de référence de la leçon.
 *
 * Chaque situation porte une RÈGLE (proportionUtils), jamais une liste de
 * valeurs figées : les tableaux, les prédictions et les corrections en
 * découlent. Le mélange proportionnel / non proportionnel est délibéré et
 * chaque cas non proportionnel a une CAUSE que l'élève peut nommer :
 *
 *  · CREPES        proportionnelle, k = 3 — le cas de référence.
 *  · BARQUE        affine (5 € de location + 2 €/personne) : la part fixe
 *    ne double jamais. C'est LE contre-exemple canonique du programme.
 *  · AGE           non linéaire : « dans 3 ans » n'est pas « 3 fois plus ».
 *    Détruit l'idée que « qui augmente ensemble » = proportionnel.
 *  · TAILLE_AGE    croissance réelle : monte, mais pas proportionnellement.
 *  · JUS           proportionnelle, k = 0,5 — coefficient décimal simple.
 *  · DISTANCE      proportionnelle, k = 12 (vitesse constante).
 */
import { proportionalRule, affineRule, customRule } from './proportionUtils';

export const CREPES = {
  id: 'crepes',
  title: 'Le stand de crêpes',
  context: 'Chaque crêpe coûte le même prix, quel que soit le nombre commandé.',
  rule: proportionalRule(3),
  base: 1,
  unit: '€',
  xLabel: 'crêpes',
  yLabel: 'prix',
};

export const BARQUE = {
  id: 'barque',
  title: 'La barque du lac',
  context: 'On paie 5 € pour louer la barque, puis 2 € par personne qui monte à bord.',
  rule: affineRule(2, 5),
  base: 1,
  unit: '€',
  xLabel: 'personnes',
  yLabel: 'prix',
};

export const AGE = {
  id: 'age',
  title: "L'âge de Lina",
  context: 'Lina a 10 ans aujourd’hui. On regarde son âge dans quelques années.',
  rule: affineRule(1, 10),
  base: 1,
  unit: 'ans',
  xLabel: 'années écoulées',
  yLabel: 'âge',
};

export const JUS = {
  id: 'jus',
  title: 'Le jus de fruits',
  context: 'Le jus est vendu au litre, toujours au même tarif.',
  rule: proportionalRule(0.5),
  base: 2,
  unit: '€',
  xLabel: 'litres',
  yLabel: 'prix',
};

export const DISTANCE = {
  id: 'distance',
  title: 'La course de relais',
  context: 'Les coureurs gardent une allure régulière : 12 km chaque heure.',
  rule: proportionalRule(12),
  base: 1,
  unit: 'km',
  xLabel: 'heures',
  yLabel: 'distance',
};

/**
 * La taille de Tom mesurée à 2, 4, 6, 8 ans : elle augmente, mais pas
 * proportionnellement. `base: 2` fait que le banc d'essai teste « 2 ans →
 * 4 ans », un vrai doublement d'âge, et met en évidence que la taille ne
 * double pas du tout (86 → 104, et non 172).
 */
const TAILLES_PAR_AGE = { 2: 86, 4: 104, 6: 117, 8: 128 };

export const TAILLE = {
  id: 'taille',
  title: 'La taille de Tom',
  context: 'On a mesuré Tom tous les deux ans. Il grandit — mais sa taille suit-elle son âge ?',
  rule: customRule((x) => TAILLES_PAR_AGE[Math.round(x)] ?? Math.round(72 + 7 * x), 'croissance'),
  base: 2,
  unit: 'cm',
  xLabel: 'ans',
  yLabel: 'taille',
};

/** Les situations du banc d'essai, dans l'ordre pédagogique. */
export const BANC_ESSAI = [CREPES, BARQUE, AGE];
