/**
 * Les situations de la leçon — DÉCLARÉES COMME RÈGLES (propUtils.js).
 *
 * Aucun tableau de valeurs n'est écrit à la main : chaque nombre affiché par
 * la leçon est calculé par `apply`. Un contre-exemple se comporte donc comme
 * un contre-exemple à TOUTES les entrées, y compris celles auxquelles
 * l'auteur n'a pas pensé (INTERACTION_PEDAGOGY §6ter.2).
 *
 * Fil narratif : la fête de fin d'année du collège.
 */
import { proportional, withBase, flat } from './propUtils';

/* ── Module 1 — le doseur : les deux situations qui montent ensemble ── */

/**
 * Le sirop. 15 cL par verre : proportionnelle.
 * k = 0,15 L par verre — un coefficient décimal, pour que « le coefficient »
 * ne soit pas confondu avec « un entier commode ».
 */
export const SIROP = proportional({
  id: 'sirop',
  k: 0.15,
  emoji: '🥤',
  label: 'Sirop à préparer',
  inputLabel: 'verres',
  inputLabelOne: 'verre',
  outputLabel: 'L de sirop',
  unit: 'L',
  decimals: 2,
  maxInput: 12,
  story: 'Chaque verre reçoit la même dose de sirop.',
});

/**
 * L'entrée à la piscine avec la carte du collège : 20 € de carte, puis 2 €
 * l'entrée. Elle MONTE quand on monte — c'est ce qui la rend trompeuse — mais
 * elle ne double pas quand on double.
 *
 * Le mot « affine » n'apparaît jamais devant l'élève : frontière de niveau.
 */
export const PISCINE = withBase({
  id: 'piscine',
  base: 20,
  k: 2,
  emoji: '🏊',
  label: 'Piscine (carte + entrées)',
  inputLabel: 'entrées',
  inputLabelOne: 'entrée',
  outputLabel: '€ dépensés',
  unit: '€',
  decimals: 2,
  money: true,
  maxInput: 12,
  story: 'La carte coûte 20 € une fois pour toutes, puis chaque entrée coûte 2 €.',
});

/* ── Module 3 — le banc d'essai : reconnaître, pas deviner ── */

/** Des croissants à 1,20 € pièce : proportionnelle. */
export const CROISSANTS = proportional({
  id: 'croissants',
  k: 1.2,
  emoji: '🥐',
  label: 'Croissants',
  inputLabel: 'croissants',
  inputLabelOne: 'croissant',
  outputLabel: '€',
  unit: '€',
  money: true,
  maxInput: 12,
  story: 'Chaque croissant coûte le même prix.',
});

/** L'âge : ajouter, ce n'est pas multiplier. Le contre-exemple le plus net. */
export const AGE = withBase({
  id: 'age',
  base: 12,
  k: 1,
  emoji: '🎂',
  label: 'Ton âge dans n années',
  inputLabel: 'années',
  inputLabelOne: 'année',
  outputLabel: 'ans',
  unit: 'ans',
  maxInput: 12,
  story: 'Tu as 12 ans aujourd’hui.',
});

/** Le car : un prix fixe partagé — il ne dépend pas du nombre de passagers. */
export const CAR = flat({
  id: 'car',
  value: 240,
  emoji: '🚌',
  label: 'Location du car',
  inputLabel: 'passagers',
  inputLabelOne: 'passager',
  outputLabel: '€',
  unit: '€',
  money: true,
  maxInput: 12,
  story: 'Le car est loué pour la journée, quel que soit le nombre de passagers.',
});

/** Le tissu des costumes : proportionnelle, coefficient non entier. */
export const TISSU = proportional({
  id: 'tissu',
  k: 2.5,
  emoji: '🧵',
  label: 'Tissu pour les costumes',
  inputLabel: 'costumes',
  inputLabelOne: 'costume',
  outputLabel: 'm de tissu',
  unit: 'm',
  maxInput: 12,
  story: 'Chaque costume demande la même longueur de tissu.',
});

/** Toutes les situations du banc d'essai du module 1, étape 3. */
export const BANC = [CROISSANTS, CAR, AGE, TISSU];
