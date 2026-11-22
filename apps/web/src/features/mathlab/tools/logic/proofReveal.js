/**
 * LES DÉROULÉS d'une preuve — purs, sans React (exigence 2026-09-30).
 *
 * Une preuve modèle ne s'affiche jamais d'un bloc dans le مختبر المنطق :
 *
 *   - l'ARBRE d'une preuve directe (`ProofArea › ProofTree`) se découvre
 *     rang par rang — un pas = un rang du graphe (`proofLayers`), le dernier
 *     rang est la conclusion. Ce que l'élève a déjà POSÉ reste visible : c'est
 *     sa construction, pas une solution qu'on lui donne ;
 *   - un EXEMPLE de récurrence (`InductionArea`, « أمثلة تنجح وأمثلة تفشل »)
 *     se lit dans l'ordre du raisonnement : la حالة الأولى, puis le انتقال,
 *     puis la خلاصة (l'escalier et l'explication). La conclusion est le
 *     dernier pas.
 *
 * Le composant n'affiche que les pas révélés : un pas futur n'est pas dans le DOM.
 */

import { proofLayers } from './proofMath.js';

/** Les rangs de l'arbre, dans l'ordre du déroulé (sans rang vide). */
export function treeReveal(proof) {
  return proofLayers(proof).filter((layer) => layer.length > 0);
}

/**
 * Les rangs à dessiner : les `revealed` premiers en entier, et, au-delà,
 * les seules étapes déjà posées par l'élève. Un rang sans rien à montrer
 * n'est pas rendu.
 *
 * @returns {{ index: number, steps: object[] }[]}
 */
export function visibleTreeRanks(layers, { revealed = 0, placed = [] } = {}) {
  const posed = new Set(placed);

  return layers
    .map((layer, index) => ({
      index,
      steps: index < revealed ? layer : layer.filter((step) => posed.has(step.id)),
    }))
    .filter((rank) => rank.steps.length > 0);
}

/**
 * Les trois temps d'un exemple de récurrence : الحالة الأولى → الانتقال → الخلاصة.
 *
 * @param {{ baseHolds: boolean, stepHolds: boolean, works: boolean }} item  un `INDUCTION_CASES`
 * @returns {{ kind: 'base'|'heredity'|'conclusion', holds: boolean }[]}
 */
export function inductionCaseSteps(item) {
  if (!item) return [];

  return [
    { kind: 'base', holds: Boolean(item.baseHolds) },
    { kind: 'heredity', holds: Boolean(item.stepHolds) },
    { kind: 'conclusion', holds: Boolean(item.works) },
  ];
}
