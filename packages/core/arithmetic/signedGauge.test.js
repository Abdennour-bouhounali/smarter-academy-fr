import { describe, it, expect } from 'vitest';
import * as G from './signedGauge.js';

describe('signedGauge — le relatif lu sur une jauge', () => {
  it('le signe et la distance sont deux lectures différentes du même niveau', () => {
    expect(G.sideOf(-3)).toBe('below');
    expect(G.sideOf(3)).toBe('above');
    expect(G.sideOf(0)).toBe('zero');
    expect(G.distance(-3)).toBe(3);
    expect(G.distance(3)).toBe(3);
    expect(G.distance(0)).toBe(0);
  });
  it('l\'opposé : même distance, côté contraire ; 0 est son propre opposé', () => {
    expect(G.opposite(-4)).toBe(4);
    expect(G.opposite(4)).toBe(-4);
    expect(G.opposite(0)).toBe(0);
    expect(Object.is(G.opposite(0), 0)).toBe(true);
    expect(G.areOpposite(-4, 4)).toBe(true);
    expect(G.areOpposite(0, 0)).toBe(true);
    expect(G.areOpposite(-4, -4)).toBe(false);
    for (const v of [-8, -3, 0, 5, 40]) expect(G.opposite(G.opposite(v))).toBe(v);
  });
  it('text : jamais de signe + ni de −0', () => {
    expect(G.text(-3)).toBe('-3');
    expect(G.text(3)).toBe('3');
    expect(G.text(0)).toBe('0');
    expect(G.text(-0)).toBe('0');
  });
  it('fromSideDistance', () => {
    expect(G.fromSideDistance('below', 3)).toBe(-3);
    expect(G.fromSideDistance('above', 3)).toBe(3);
    expect(G.fromSideDistance('below', 0)).toBe(0);
    expect(() => G.fromSideDistance('left', 1)).toThrow();
    expect(() => G.fromSideDistance('above', -1)).toThrow();
  });
  it('une jauge : pas, bornes, graduations', () => {
    const g = G.gauge({ step: 10, min: -50, max: 50 });
    expect(G.gradOf(g, -40)).toBe(-4);
    expect(G.valueOf(g, 3)).toBe(30);
    expect(G.clampGrad(g, 9)).toBe(5);
    expect(G.clampGrad(g, -9)).toBe(-5);
    expect(() => G.gradOf(g, -45)).toThrow();
    expect(() => G.gauge({ step: 10, min: -55, max: 50 })).toThrow();
    expect(() => G.gauge({ step: 0, min: -5, max: 5 })).toThrow();
  });
  it('le plus froid n\'est pas le plus loin du zéro : [5, −2, −3, 0, 2]', () => {
    const w = [5, -2, -3, 0, 2];
    expect(G.lowest(w)).toEqual({ at: 2, value: -3 });
    expect(G.farthest(w)).toEqual({ at: 0, value: 5 });
  });
  it('à la distance d du zéro il y a deux nombres, sauf d = 0', () => {
    expect(G.atDistance(6)).toEqual([-6, 6]);
    expect(G.atDistance(0)).toEqual([0]);
  });
  it('classify : 0 est à la fois positif et négatif ; les paires opposées', () => {
    const c = G.classify([-8, 5, 12, 0, -1, 4, -4]);
    expect(c.positives).toEqual([5, 12, 0, 4]);
    expect(c.negatives).toEqual([-8, 0, -1, -4]);
    expect(c.pairs).toEqual([[4, -4]]);
  });
});
