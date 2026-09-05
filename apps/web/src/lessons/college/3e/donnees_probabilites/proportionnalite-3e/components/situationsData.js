/**
 * La grande tablée — situations de référence de la leçon.
 *
 * Chaque situation porte une RÈGLE (propUtils), jamais une liste de valeurs
 * figées : tableaux, prédictions et corrections en découlent, et les tests
 * vérifient que chaque règle est bien ce qu'elle prétend être.
 */
import { proportionalRule, affineRule, constantRule, applyRule, roundTo } from './propUtils';

/** La recette de crêpes, pour 2 personnes. */
export const RECETTE = {
  base: 2,
  maxPeople: 12,
  ingredients: [
    { id: 'farine', label: 'farine', emoji: '🌾', unit: 'g', per: 150, rule: proportionalRule(150) },
    { id: 'oeufs', label: 'œufs', emoji: '🥚', unit: '', per: 2, rule: proportionalRule(2) },
    { id: 'lait', label: 'lait', emoji: '🥛', unit: 'cL', per: 25, rule: proportionalRule(25) },
    { id: 'sucre', label: 'sucre', emoji: '🍬', unit: 'g', per: 15, rule: proportionalRule(15) },
  ],
  fixed: { id: 'cuisson', label: 'temps de cuisson', emoji: '⏱️', unit: 'min', rule: constantRule(25) },
};

/** La quantité d'un ingrédient pour n personnes — toujours via la règle. */
export const quantityFor = (ing, n) => applyRule(ing.rule, n);

/** Les situations des modules 2, 3, 6 et du boss. */
export const SITUATIONS = {
  essence: {
    id: 'essence', title: 'La consommation de la voiture',
    context: 'La voiture consomme toujours la même quantité d’essence par kilomètre.',
    rule: proportionalRule(0.065), xs: [100, 250, 40], xLabel: 'distance', xUnit: 'km', yLabel: 'essence', yUnit: 'L',
  },
  tomates: {
    id: 'tomates', title: 'Les tomates du marché',
    context: 'Les tomates sont vendues au kilo, toujours au même prix.',
    rule: proportionalRule(2.5), xs: [3, 1, 5], xLabel: 'masse', xUnit: 'kg', yLabel: 'prix', yUnit: '€',
  },
  abonnement: {
    id: 'abonnement', title: 'L’abonnement vidéo',
    context: 'On paie 10 € d’abonnement par mois, puis 2 € par film loué.',
    rule: affineRule(2, 10), xs: [1, 2, 5], xLabel: 'films', xUnit: '', yLabel: 'prix', yUnit: '€',
  },
  cahiers: {
    id: 'cahiers', title: 'Les cahiers',
    context: 'Un lot de 12 cahiers identiques coûte 30 €.',
    rule: proportionalRule(2.5), xs: [12, 7], xLabel: 'cahiers', xUnit: '', yLabel: 'prix', yUnit: '€',
  },
  vitesse: {
    id: 'vitesse', title: 'Le train régional',
    context: 'Le train roule à vitesse constante.',
    rule: proportionalRule(90), xs: [1, 2, 3.5], xLabel: 'temps', xUnit: 'h', yLabel: 'distance', yUnit: 'km',
  },
  fer: {
    id: 'fer', title: 'Le fer',
    context: 'La masse d’un morceau de fer est proportionnelle à son volume : 7,8 g par cm³.',
    rule: proportionalRule(7.8), xs: [10, 25, 50], xLabel: 'volume', xUnit: 'cm³', yLabel: 'masse', yUnit: 'g',
  },
  alu: {
    id: 'alu', title: 'L’aluminium',
    context: '2,7 g par cm³.',
    rule: proportionalRule(2.7), xs: [10, 25, 50], xLabel: 'volume', xUnit: 'cm³', yLabel: 'masse', yUnit: 'g',
  },
};

/** Les lignes d'un tableau pour une situation, éventuellement avec des cases cachées. */
export function tableFor(situation, hidden = []) {
  return situation.xs.map((x) => ({ x, y: hidden.includes(x) ? null : applyRule(situation.rule, x) }));
}

/** Arrondi d'affichage partagé. */
export const nice = (v) => roundTo(v, 2);
