import { describe, it, expect } from 'vitest';
import * as P from './proportion.js';

/** §63 « Percentage » : pourcentage d'une quantité, variation, pourcentage inverse. */

describe('§14 — un pourcentage est une fraction de dénominateur 100', () => {
  it('35 % s’écrit 35/100', () => {
    expect(P.percentToFrac(35)).toEqual({ n: 35, d: 100 });
    expect(P.percentToFrac(12.5)).toEqual({ n: 125, d: 1000 });
  });

  it('et se relit depuis une fraction', () => {
    expect(P.fracToPercent({ n: 3, d: 4 })).toBe(75);
    expect(P.fracToPercent({ n: 1, d: 3 })).toBeCloseTo(33.333333, 5);
  });

  it('35 % de 200 vaut 70, EXACTEMENT', () => {
    const result = P.percentageOf(35, 200);
    expect(result.result).toBe(70);
    expect(result.perUnit).toBe(2);
  });

  it('§61 — aucun bruit de flottant : 10 % de 0,3', () => {
    expect(P.percentageOf(10, 0.3).result).toBe(0.03);
    expect(P.percentageOf(20, 1.1).result).toBe(0.22);
  });

  it('§15 — l’échelle montre la proportionnalité d’un coup d’œil', () => {
    const ladder = P.percentageLadder(200);
    expect(ladder.find((s) => s.percent === 10).value).toBe(20);
    expect(ladder.find((s) => s.percent === 25).value).toBe(50);
    expect(ladder.find((s) => s.percent === 50).value).toBe(100);
    expect(ladder.find((s) => s.percent === 100).value).toBe(200);
  });

  it('quel pourcentage 70 fait-il de 200 ? — le sens inverse', () => {
    expect(P.percentageThat(70, 200)).toBe(35);
  });

  it('« 70 est 35 % de quoi ? » → 200 (§14)', () => {
    expect(P.reversePercentage(70, 35)).toBe(200);
    expect(P.reversePercentage(70, 0)).toBeNull();
  });
});

describe('§16 — la variation en pourcentage', () => {
  it('de 200 à 230 : +15 %, une HAUSSE, de coefficient 1,15', () => {
    const change = P.percentageChange(200, 230);
    expect(change.percent).toBe(15);
    expect(change.difference).toBe(30);
    expect(change.direction).toBe('increase');
    expect(change.factor).toBe(1.15);
  });

  it('de 200 à 150 : une BAISSE de 25 %', () => {
    const change = P.percentageChange(200, 150);
    expect(change.percent).toBe(-25);
    expect(change.direction).toBe('decrease');
  });

  it('sans variation, la direction est « aucune » — §16 ne s’appuie pas sur la couleur', () => {
    expect(P.percentageChange(200, 200).direction).toBe('none');
  });

  it('appliquer une variation puis son INVERSE revient au départ', () => {
    const raised = P.applyChange(200, 25);
    expect(raised).toBe(250);
    // +25 % s'annule par −20 %, l'erreur classique que §16 doit montrer.
    expect(P.inverseChange(25)).toBe(-20);
    expect(P.applyChange(raised, P.inverseChange(25))).toBe(200);
  });

  it('une baisse de 100 % ne s’annule pas', () => {
    expect(P.inverseChange(-100)).toBeNull();
  });
});

describe('§17, §18 — la proportionnalité, tranchée EXACTEMENT', () => {
  const rows = (xs, ys) => xs.map((x, i) => ({ x, y: ys[i] }));

  it('le tableau de §17 est proportionnel, de coefficient 3/2', () => {
    const analysis = P.analyzeProportionality(rows([2, 4, 6, 8], [3, 6, 9, 12]));
    expect(analysis.proportional).toBe(true);
    expect(analysis.coefficient).toBe(1.5);
    expect(analysis.coefficientFraction).toEqual({ n: 3, d: 2 });
  });

  it('une seule colonne fausse suffit, et elle est DÉSIGNÉE (§53)', () => {
    const analysis = P.analyzeProportionality(rows([2, 4, 6], [3, 6, 10]));
    expect(analysis.proportional).toBe(false);
    expect(analysis.failures).toEqual([2]);
    expect(analysis.coefficient).toBeNull();
  });

  it('les décimaux ne trompent pas le verdict', () => {
    // 0,1 → 0,3 et 0,2 → 0,6 : proportionnel, bien que 0,3/0,1 ne fasse pas 3 en flottant.
    expect(P.analyzeProportionality(rows([0.1, 0.2, 0.3], [0.3, 0.6, 0.9])).proportional).toBe(true);
  });

  it('une colonne (0, y≠0) interdit la proportionnalité', () => {
    expect(P.analyzeProportionality(rows([0, 2], [5, 3])).proportional).toBe(false);
  });

  it('une colonne (0, 0) ne l’interdit PAS — elle est compatible', () => {
    expect(P.analyzeProportionality(rows([0, 2, 4], [0, 3, 6])).proportional).toBe(true);
  });

  it('chaque rapport y/x est rendu, pour être affiché', () => {
    expect(P.analyzeProportionality(rows([2, 4], [3, 6])).ratios).toEqual([1.5, 1.5]);
  });

  it('la quatrième proportionnelle : si 4 valent 6, 10 valent 15', () => {
    expect(P.fourthProportional(4, 6, 10)).toBe(15);
  });
});

describe('§19 — les rapports', () => {
  it('2 : 3 partage 100 en 40 et 60', () => {
    const share = P.ratioShare(2, 3, 100);
    expect(share.parts).toEqual([40, 60]);
    expect(share.unit).toBe(20);
  });

  it('un rapport se réduit : 4 : 6 est 2 : 3', () => {
    expect(P.ratioShare(4, 6).simplified).toEqual([2, 3]);
  });

  it('chaque part est aussi une fraction du tout', () => {
    expect(P.ratioShare(2, 3).fractions[0]).toEqual({ n: 4, d: 10 });
  });

  it('mettre à l’échelle : 2:3 avec a = 10 donne b = 15', () => {
    expect(P.scaleRatio(2, 3, 10)).toEqual({ a: 10, b: 15 });
    expect(P.scaleRatio(2, 3, null, 15)).toEqual({ a: 10, b: 15 });
  });

  it('deux rapports égaux se reconnaissent au produit en croix', () => {
    expect(P.ratiosEqual(2, 3, 4, 6).equal).toBe(true);
    expect(P.ratiosEqual(2, 3, 4, 7).equal).toBe(false);
  });
});

describe('rien ne jette sur une entrée absurde', () => {
  it.each([
    () => P.percentageOf(NaN, 10),
    () => P.percentageChange(0, 10),
    () => P.analyzeProportionality(null),
    () => P.analyzeProportionality([{ x: 'a', y: null }]),
    () => P.ratioShare(0, 0),
    () => P.percentToFrac(Infinity),
  ])('cas %#', (run) => {
    expect(run).not.toThrow();
  });
});
