import { describe, it, expect } from 'vitest';
import {
  proportionalRule, affineRule, constantRule, applyRule, ratioAt, ratiosAllEqual, doublingHolds,
  additivityHolds, buildRows, rowsAreProportional, rowsCoefficient, coefficient, fourthProportional,
  strategiesFor, strategiesAgree, percentMultiplier, applyPercent, chainPercents, rateOfMultiplier,
  percentOf, scaleFactors, scaleFigure, scaleSides, ratioOfLengths, distance, speed, duration, mass,
  realDistanceCm, cmToKm, magnitudeOk, directionOk, isNiceAnswer, agree,
} from './propUtils';
import { RECETTE, quantityFor, SITUATIONS } from './situationsData';

describe('règles et rapports', () => {
  it('une règle proportionnelle a des rapports constants, une affine non, une constante non plus', () => {
    const p = proportionalRule(150);
    const a = affineRule(2, 5);
    const c = constantRule(25);
    expect(applyRule(p, 7)).toBe(1050);
    expect(ratiosAllEqual(p, [1, 2, 7, 12])).toBe(true);
    expect(ratiosAllEqual(a, [1, 2, 5])).toBe(false);
    expect(ratiosAllEqual(c, [1, 2, 5])).toBe(false);
    expect(doublingHolds(p, 3)).toBe(true);
    expect(doublingHolds(a, 3)).toBe(false);
    expect(additivityHolds(p, 2, 5)).toBe(true);
    expect(additivityHolds(a, 2, 5)).toBe(false);
    expect(ratioAt(p, 0)).toBeNull();
    expect(coefficient(p)).toBe(150);
    expect(coefficient(a)).toBeNull();
  });

  it('un tableau brut est reconnu proportionnel ou non, et son coefficient est exact', () => {
    expect(rowsAreProportional([{ x: 100, y: 6.5 }, { x: 250, y: 16.25 }, { x: 40, y: 2.6 }])).toBe(true);
    expect(rowsCoefficient([{ x: 100, y: 6.5 }, { x: 250, y: 16.25 }])).toBe(0.065);
    expect(rowsAreProportional([{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 5, y: 20 }])).toBe(false);
    expect(rowsCoefficient([{ x: 1, y: 12 }, { x: 2, y: 14 }])).toBeNull();
    expect(buildRows(proportionalRule(0.5), [2, 4])).toEqual([{ x: 2, y: 1 }, { x: 4, y: 2 }]);
  });
});

describe('la recette', () => {
  it('chaque ingrédient est proportionnel au nombre de personnes, le temps de cuisson non', () => {
    const farine = RECETTE.ingredients.find((i) => i.id === 'farine');
    expect(quantityFor(farine, 2)).toBe(300);
    expect(quantityFor(farine, 7)).toBe(1050);
    expect(quantityFor(farine, 1)).toBe(150);
    expect(applyRule(RECETTE.fixed.rule, 7)).toBe(25);
    expect(applyRule(RECETTE.fixed.rule, 2)).toBe(25);
    for (const ing of RECETTE.ingredients) expect(ratiosAllEqual(ing.rule, [1, 2, 7, 12])).toBe(true);
  });

  it('les quantités à 12 personnes restent des nombres « propres »', () => {
    for (const ing of RECETTE.ingredients) for (let n = 1; n <= 12; n += 1) expect(isNiceAnswer(quantityFor(ing, n))).toBe(true);
  });
});

describe('les chemins vers la case vide', () => {
  it('unité, coefficient et produit en croix sont toujours proposés et concordent', () => {
    const s = strategiesFor(3, 7.5, 5, { xUnit: 'kg', yUnit: '€' });
    const ids = s.map((x) => x.id);
    expect(ids).toContain('unite');
    expect(ids).toContain('coefficient');
    expect(ids).toContain('croix');
    expect(ids).not.toContain('facteur');       // 5/3 n'est pas un facteur lisible
    s.forEach((x) => expect(x.result).toBe(12.5));
    expect(strategiesAgree(3, 7.5, 5)).toBe(true);
    expect(fourthProportional(3, 7.5, 5)).toBe(12.5);
  });

  it('le facteur entre colonnes apparaît pour ×3 et ×3,5', () => {
    expect(strategiesFor(4, 22, 12).find((x) => x.id === 'facteur').result).toBe(66);
    expect(strategiesFor(2, 300, 7).find((x) => x.id === 'facteur').label).toContain('3,5');
    expect(strategiesFor(2, 300, 7).every((x) => x.result === 1050)).toBe(true);
  });
});

describe('pourcentages', () => {
  it('+20 % → ×1,2, −25 % → ×0,75, et l’aller-retour ne revient pas au départ', () => {
    expect(percentMultiplier(20)).toBe(1.2);
    expect(percentMultiplier(-25)).toBe(0.75);
    expect(applyPercent(50, 20)).toBe(60);
    expect(applyPercent(80, -25)).toBe(60);
    const c = chainPercents(50, [20, -20]);
    expect(c.steps).toEqual([50, 60, 48]);
    expect(c.multiplier).toBe(0.96);
    expect(rateOfMultiplier(0.96)).toBe(-4);
    expect(percentOf(300, 20)).toBe(60);
    expect(directionOk(80, 60, -25)).toBe(true);
    expect(directionOk(80, 100, -25)).toBe(false);
  });
});

describe('agrandissement, Thalès', () => {
  it('k pour les longueurs, k² pour l’aire, k³ pour le volume', () => {
    expect(scaleFactors(2)).toEqual({ length: 2, area: 4, volume: 8 });
    expect(scaleFactors(0.5)).toEqual({ length: 0.5, area: 0.25, volume: 0.125 });
    const f = scaleFigure({ w: 4, h: 2, d: 3 }, 2);
    expect(f).toEqual({ w: 8, h: 4, perimeter: 24, area: 32, d: 6, volume: 192 });
    expect(scaleFigure({ w: 4, h: 2 }, 3).area).toBe(72);
    expect(scaleFigure({ w: 4, h: 2 }, 1.5).area).toBe(18);
  });

  it('un triangle agrandi garde des rapports de côtés constants', () => {
    expect(scaleSides([3, 4, 5], 2.5)).toEqual([7.5, 10, 12.5]);
    expect(ratioOfLengths(3, 7.5)).toBe(2.5);
    expect(ratioOfLengths(4, 10)).toBe(2.5);
    expect(ratioOfLengths(0, 5)).toBeNull();
  });
});

describe('sciences et cohérence', () => {
  it('vitesse, masse volumique, échelle', () => {
    expect(distance(90, 2.5)).toBe(225);
    expect(speed(315, 3.5)).toBe(90);
    expect(duration(405, 90)).toBe(4.5);
    expect(duration(10, 0)).toBeNull();
    expect(mass(7.8, 25)).toBe(195);
    expect(realDistanceCm(4, 25000)).toBe(100000);
    expect(cmToKm(realDistanceCm(7, 25000))).toBe(1.75);
  });

  it('un ordre de grandeur absurde est détecté ; les situations de la leçon sont cohérentes', () => {
    expect(magnitudeOk(270, 270)).toBe(true);
    expect(magnitudeOk(2700, 270)).toBe(false);
    expect(magnitudeOk(-5, 10)).toBe(false);
    for (const s of Object.values(SITUATIONS)) {
      const rows = buildRows(s.rule, s.xs);
      expect(rowsAreProportional(rows)).toBe(s.rule.kind === 'proportional');
    }
    expect(agree(1, 'personnes')).toBe('personne');
    expect(agree(7, 'personnes')).toBe('personnes');
  });
});
