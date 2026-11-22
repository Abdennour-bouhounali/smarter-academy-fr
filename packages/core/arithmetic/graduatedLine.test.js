import { describe, it, expect } from 'vitest';
import * as G from './graduatedLine.js';

describe('graduatedLine — abscisses en dixièmes', () => {
  it('côté, distance, symétrique', () => {
    expect(G.sideOf(-30)).toBe('west');
    expect(G.sideOf(27)).toBe('east');
    expect(G.sideOf(0)).toBe('origin');
    expect(G.distance(-15)).toBe(15);
    expect(G.symmetric(-30)).toBe(30);
    expect(G.symmetric(25)).toBe(-25);
    expect(Object.is(G.symmetric(0), 0)).toBe(true);
    expect(G.areSymmetric(-30, 30)).toBe(true);
    expect(G.areSymmetric(-30, -30)).toBe(false);
    for (const t of [-40, -15, 0, 27]) expect(G.symmetric(G.symmetric(t))).toBe(t);
  });
  it('l\'encadrement : −1,5 est entre −2 et −1 (pas entre −1 et 0) ; 2,7 entre 2 et 3 ; un tick n\'a pas d\'encadrement', () => {
    expect(G.boundsOf(-15)).toEqual([-2, -1]);
    expect(G.boundsOf(27)).toEqual([2, 3]);
    expect(G.boundsOf(-4)).toEqual([-1, 0]);
    expect(G.boundsOf(-20)).toBeNull();
    expect(G.boundsOf(0)).toBeNull();
    expect(G.truncUnit(-15)).toBe(-1); // la fausse « partie entière »
    expect(G.floorUnit(-15)).toBe(-2);
    expect(G.floorUnit(-4)).toBe(-1);
  });
  it('l\'origine retrouvée par deux graduations écrites', () => {
    expect(G.originIndex({ i: 2, v: -3 }, 1)).toBe(5);
    expect(G.originIndex({ i: 8, v: 3 }, 1)).toBe(5);
    expect(G.marksAgree([{ i: 2, v: -3 }, { i: 8, v: 3 }], 1)).toBe(true);
    expect(G.originIndex({ i: 2, v: -8 }, 2)).toBe(6);
    expect(G.originIndex({ i: 5, v: -2 }, 2)).toBe(6);
    expect(G.marksAgree([{ i: 2, v: -8 }, { i: 5, v: -2 }], 2)).toBe(true);
    expect(G.marksAgree([{ i: 2, v: -3 }, { i: 7, v: 3 }], 1)).toBe(false);
    expect(() => G.originIndex({ i: 1, v: 3 }, 2)).toThrow();
    expect(G.valueAt(8, 5, 1)).toBe(3);
    expect(G.valueAt(0, 5, 1)).toBe(-5);
    expect(G.valueAt(2, 6, 2)).toBe(-8);
  });
  it('écriture : signe moins typographique, virgule, jamais de + ni de −0', () => {
    expect(G.fmt(-15)).toBe('−1,5');
    expect(G.fmt(27)).toBe('2,7');
    expect(G.fmt(30)).toBe('3');
    expect(G.fmt(-30)).toBe('−3');
    expect(G.fmt(0)).toBe('0');
    expect(G.fmt(-0)).toBe('0');
    expect(G.fmt(-4)).toBe('−0,4');
    expect(G.tex(-15)).toBe('-1{,}5');
    expect(G.tex(27)).toBe('2{,}7');
    expect(G.fromUnits(-1.5)).toBe(-15);
    expect(G.fromUnits(2.7)).toBe(27);
    expect(() => G.fromUnits(1.25)).toThrow();
  });
});
