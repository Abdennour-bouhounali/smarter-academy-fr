import { describe, it, expect } from 'vitest';
import {
  proportion, nestedProportion, evolutionRate, coefficient, rateFromCoefficient,
  applyRate, globalCoefficient, globalRate, reciprocalCoefficient, reciprocalRate,
  initialValue, percentagePointDifference, relativeChange,
} from './percentUtils';

describe('proportions', () => {
  it('partie / tout, null si le tout est nul', () => {
    expect(proportion(3, 12)).toBeCloseTo(0.25, 10);
    expect(proportion(1, 0)).toBeNull();
  });

  it('proportions emboîtées : on multiplie, on n’additionne pas', () => {
    // 60 % de l'ensemble, dont 25 % → 15 % de l'ENSEMBLE
    expect(nestedProportion(0.6, 0.25)).toBeCloseTo(0.15, 10);
    expect(nestedProportion(0.6, 0.25)).not.toBeCloseTo(0.85, 5);
  });

  it('un pourcentage de pourcentage est plus petit que chacun des deux', () => {
    const r = nestedProportion(0.4, 0.7);
    expect(r).toBeLessThan(0.4);
    expect(r).toBeLessThan(0.7);
  });
});

describe('évolutions et coefficients', () => {
  it('taux d’évolution relatif à la valeur de DÉPART', () => {
    expect(evolutionRate(200, 250)).toBeCloseTo(0.25, 10);
    expect(evolutionRate(250, 200)).toBeCloseTo(-0.2, 10); // et non −0,25
    expect(evolutionRate(0, 5)).toBeNull();
  });

  it('coefficient ↔ taux', () => {
    expect(coefficient(0.2)).toBeCloseTo(1.2, 10);
    expect(coefficient(-0.2)).toBeCloseTo(0.8, 10);
    expect(rateFromCoefficient(1.35)).toBeCloseTo(0.35, 10);
    expect(rateFromCoefficient(0.91)).toBeCloseTo(-0.09, 10);
  });

  it('appliquer un taux', () => {
    expect(applyRate(100, 0.2)).toBeCloseTo(120, 10);
    expect(applyRate(120, -0.2)).toBeCloseTo(96, 10);
  });
});

describe('évolutions successives', () => {
  it('+20 % puis −20 % ne revient PAS au départ', () => {
    expect(globalCoefficient([0.2, -0.2])).toBeCloseTo(0.96, 10);
    expect(globalRate([0.2, -0.2])).toBeCloseTo(-0.04, 10);
    expect(applyRate(applyRate(100, 0.2), -0.2)).toBeCloseTo(96, 10);
  });

  it('les taux ne s’additionnent pas', () => {
    // +10 % puis +10 % = +21 %, pas +20 %
    expect(globalRate([0.1, 0.1])).toBeCloseTo(0.21, 10);
    expect(globalRate([0.1, 0.1])).not.toBeCloseTo(0.2, 5);
  });

  it('l’ordre des évolutions successives ne change pas le résultat global', () => {
    expect(globalCoefficient([0.3, -0.15, 0.05])).toBeCloseTo(globalCoefficient([0.05, 0.3, -0.15]), 10);
  });

  it('une suite vide laisse la valeur inchangée', () => {
    expect(globalCoefficient([])).toBe(1);
    expect(globalRate([])).toBe(0);
  });

  it('deux baisses successives ne peuvent pas dépasser −100 %', () => {
    expect(globalRate([-0.5, -0.5])).toBeCloseTo(-0.75, 10);
    expect(globalRate([-0.5, -0.5])).toBeGreaterThan(-1);
  });
});

describe('évolutions réciproques', () => {
  it('le coefficient réciproque est l’INVERSE, pas l’opposé', () => {
    expect(reciprocalCoefficient(1.25)).toBeCloseTo(0.8, 10);
    expect(reciprocalCoefficient(0)).toBeNull();
  });

  it('après +25 % il faut −20 % pour revenir au départ', () => {
    expect(reciprocalRate(0.25)).toBeCloseTo(-0.2, 10);
    expect(reciprocalRate(0.25)).not.toBeCloseTo(-0.25, 5);
  });

  it('appliquer un taux puis son réciproque redonne exactement la valeur initiale', () => {
    for (const t of [0.2, -0.35, 0.07, 1.5]) {
      expect(applyRate(applyRate(480, t), reciprocalRate(t))).toBeCloseTo(480, 8);
    }
  });

  it('retrouver la valeur initiale à partir de la finale et du coefficient', () => {
    expect(initialValue(96, 0.96)).toBeCloseTo(100, 10);
    expect(initialValue(120, 1.2)).toBeCloseTo(100, 10);
    expect(initialValue(10, 0)).toBeNull();
  });
});

describe('points de pourcentage vs pourcentage', () => {
  it('20 % → 25 % : +5 POINTS et +25 %', () => {
    expect(percentagePointDifference(0.2, 0.25)).toBeCloseTo(0.05, 10);
    expect(relativeChange(0.2, 0.25)).toBeCloseTo(0.25, 10);
  });

  it('les deux lectures ne coïncident que si la valeur de départ vaut 100 %', () => {
    expect(percentagePointDifference(1, 1.3)).toBeCloseTo(relativeChange(1, 1.3), 10);
    expect(percentagePointDifference(0.5, 0.6)).not.toBeCloseTo(relativeChange(0.5, 0.6), 5);
  });
});
