import { describe, it, expect } from 'vitest';
import { coefficient, globalCoefficient, globalRate } from '../../../../../common/stats';

/**
 * Ce que ces tests protègent : la PROMESSE pédagogique de la leçon, « les taux
 * ne s'additionnent jamais ». Elle n'a de valeur que si la faute visée donne un
 * résultat VISIBLEMENT différent de la bonne réponse.
 *
 * L'épreuve ev-e5 posait +2 %, +3 %, −1 % : produit 1,04009, somme des taux
 * 1,0400. À quatre décimales les deux réponses étaient IDENTIQUES — l'élève qui
 * additionnait cochait la bonne case, et la question ne mesurait rien.
 * (docs/audits/2DE_LEARNING_POINT_AUDIT.md, défaut A1-5.)
 */
describe('évolutions successives — la faute doit être distinguable', () => {
  // `globalCoefficient` attend des taux DÉCIMAUX (0,5 pour +50 %), pas des
  // pourcentages : c'est la convention de lessons/common/stats/percentUtils.
  const naiveSum = (rates) => 1 + rates.reduce((a, r) => a + r, 0);

  it('la chaîne de ev-e5 sépare nettement le produit de la somme des taux', () => {
    const rates = [0.5, 0.4, -0.2];
    const k = globalCoefficient(rates);
    expect(k).toBeCloseTo(1.68, 10);
    expect(naiveSum(rates)).toBeCloseTo(1.70, 10);
    // l'écart doit rester lisible sur les deux décimales affichées à l'élève
    expect(Math.abs(k - naiveSum(rates))).toBeGreaterThan(0.01);
  });

  it('la chaîne du module 1 (+20 % puis −20 %) ne revient PAS au point de départ', () => {
    const k = globalCoefficient([0.2, -0.2]);
    expect(k).toBeCloseTo(0.96, 10);
    expect(k).toBeLessThan(1);
  });

  it('une hausse de 25 % s’annule par −20 %, jamais par −25 %', () => {
    expect(coefficient(0.25) * coefficient(-0.2)).toBeCloseTo(1, 10);
    expect(coefficient(0.25) * coefficient(-0.25)).toBeCloseTo(0.9375, 10);
  });

  it('le taux global se lit sur le coefficient global', () => {
    expect(globalRate([0.5, 0.4, -0.2])).toBeCloseTo(0.68, 8);
    expect(globalRate([0.25, -0.2])).toBeCloseTo(0, 8);
  });
});
