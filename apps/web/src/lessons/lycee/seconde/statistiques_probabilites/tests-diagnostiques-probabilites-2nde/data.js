/**
 * Données de la leçon « Tests diagnostiques ».
 *
 * AVERTISSEMENT PÉDAGOGIQUE : tous les nombres sont FICTIFS et choisis pour
 * la démonstration mathématique. La leçon modélise un test, elle ne donne
 * aucun conseil médical et ne décrit aucune maladie réelle.
 *
 * Le scénario de référence (prévalence 1 %, sensibilité 99 %, spécificité
 * 95 % sur 10 000 personnes) est le cas d'école du paradoxe des faux
 * positifs, et ses effectifs tombent tous juste :
 *
 *        atteints (100)        sains (9 900)
 *   +    99 vrais positifs     495 faux positifs     → 594 positifs
 *   −     1 faux négatif     9 405 vrais négatifs    → 9 406 négatifs
 *
 * Un test positif ne correspond à une personne atteinte que 99 fois sur
 * 594, soit 16,7 % — alors que le test est « juste à 99 % ». Les 495 faux
 * positifs viennent de ce que 5 % d'une population ÉNORME (9 900) pèsent
 * bien plus que 99 % d'une population minuscule (100).
 *
 * Vérifié par data.test.js, qui contrôle aussi que les curseurs du module 4
 * font réellement varier la VPP de 2 % à plus de 90 %.
 */
import { diagnosticCounts, diagnosticIndicators } from '../../../../common/stats';

export const POPULATION = 10000;

/** Le scénario de référence, celui des modules 1 à 4. */
export const REFERENCE = {
  prevalence: 0.01,
  sensitivity: 0.99,
  specificity: 0.95,
};

/** Les quatre effectifs du scénario courant. */
export function counts({ prevalence, sensitivity, specificity } = REFERENCE) {
  return diagnosticCounts({ population: POPULATION, prevalence, sensitivity, specificity });
}

/** Effectifs + indicateurs (sensibilité, spécificité, VPP, VPN). */
export function scenario(params = REFERENCE) {
  const c = counts(params);
  return { ...c, ...diagnosticIndicators(c) };
}

/** Les quatre catégories, pour PopulationBar. Les atteints d'abord : leur
 *  petit nombre doit sauter aux yeux face à la masse des sains. */
export function populationGroups(params = REFERENCE) {
  const c = counts(params);
  return [
    { id: 'vp', count: c.truePositive, color: '#dc2626', label: 'atteints, test positif (vrais positifs)' },
    { id: 'fn', count: c.falseNegative, color: '#fca5a5', label: 'atteints, test négatif (faux négatifs)' },
    { id: 'fp', count: c.falsePositive, color: '#f59e0b', label: 'sains, test positif (faux positifs)' },
    { id: 'vn', count: c.trueNegative, color: '#cbd5e1', label: 'sains, test négatif (vrais négatifs)' },
  ];
}

/** Les bornes des curseurs du module 4. */
export const SLIDERS = {
  prevalence: { min: 0.001, max: 0.4, step: 0.001, label: 'Prévalence' },
  sensitivity: { min: 0.8, max: 1, step: 0.005, label: 'Sensibilité' },
  specificity: { min: 0.8, max: 1, step: 0.005, label: 'Spécificité' },
};

/**
 * Module 5 — quatre affirmations à trancher. Chacune vise une erreur
 * précise, et la dernière est VRAIE : sans elle, l'élève apprendrait
 * seulement à répondre « faux » à tout.
 */
export const AFFIRMATIONS = [
  {
    id: 'a1',
    claim: '« Ce test est fiable à 99 %. Donc si mon test est positif, j’ai 99 % de risque d’être atteint. »',
    correct: false,
    verdict: 'Faux — inversion du conditionnement',
    explain:
      'Les 99 % sont la sensibilité, P(test + | atteint) : une qualité du test mesurée SUR LES PERSONNES ATTEINTES. La question posée est l’inverse, P(atteint | test +), qui se calcule parmi les 594 positifs et vaut 99/594 ≈ 17 %.',
    lp: 'seconde_tests-diagnostiques-probabilites-2nde_P10',
  },
  {
    id: 'a2',
    claim: '« Il y a beaucoup plus de faux positifs que de vrais positifs : le test est mal conçu. »',
    correct: false,
    verdict: 'Faux — c’est la rareté de la maladie, pas le test',
    explain:
      'Le test est excellent : il détecte 99 % des atteints et disculpe 95 % des sains. Mais 5 % de 9 900 personnes saines (495) dépassent forcément 99 % de 100 personnes atteintes (99). Le nombre de faux positifs dépend surtout de la PRÉVALENCE.',
    lp: 'seconde_tests-diagnostiques-probabilites-2nde_P11',
  },
  {
    id: 'a3',
    claim: '« Un test négatif ne prouve rien, puisqu’il existe des faux négatifs. »',
    correct: false,
    verdict: 'Faux — le négatif est ici très informatif',
    explain:
      'Sur 9 406 personnes testées négatives, une seule est atteinte : la probabilité d’être sain sachant le test négatif vaut 9 405/9 406, soit plus de 99,9 %. Quand la maladie est rare, un négatif est bien plus fiable qu’un positif.',
    lp: 'seconde_tests-diagnostiques-probabilites-2nde_P9',
  },
  {
    id: 'a4',
    claim: '« Le même test appliqué à un groupe à risque, où 40 % des personnes sont atteintes, rend un résultat positif beaucoup plus inquiétant. »',
    correct: true,
    verdict: 'Vrai — la prévalence change tout',
    explain:
      'Avec une prévalence de 40 %, on obtient 3 960 vrais positifs contre 300 faux positifs : un test positif correspond alors à une personne atteinte dans 93 % des cas. Le test n’a pas changé — la population testée, si.',
    lp: 'seconde_tests-diagnostiques-probabilites-2nde_P11',
  },
];
