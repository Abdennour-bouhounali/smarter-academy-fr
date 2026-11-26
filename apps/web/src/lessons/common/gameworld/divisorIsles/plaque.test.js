// The plaque (plaque.js): what the calculation gives, and what a typed fraction IS against it — the design's mission
// (3/34 × 85/87 = 255/2 958 = 5/58) with every refusal of its table, then every writing up to 300 against a count.
import { describe, it, expect } from 'vitest';
import { checkWrite, plaqueLines, reducedOf, resultOf, writingOf } from './plaque';
import { verifyClaim } from '../kit/claims';

const W = { calc: { x: 3, y: 34, op: '*', z: 85, w: 87 }, p: 5, q: 58 };
const at = (p, q) => writingOf(W, { p: String(p), q: String(q) }).kind;
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

describe('the plaque — the lighthouse’s product', () => {
  it('3/34 × 85/87 = 255/2 958, irreducible 5/58; the story’s p/q must be that', () => {
    expect(resultOf(W.calc)).toEqual([255, 2958]);
    expect(reducedOf(W.calc)).toEqual([5, 58]);
    expect(checkWrite(W)).toBe(W);
    expect(() => checkWrite({ ...W, p: 85, q: 986 })).toThrow(/is not 5\/58/);
    expect(() => resultOf({ x: 1, y: 0, op: '*', z: 1, w: 2 })).toThrow();
    expect(() => resultOf({ x: 1, y: 2, op: '/', z: 1, w: 2 })).toThrow();
    expect(() => resultOf({ x: 1, y: 10, op: '-', z: 7, w: 10 })).toThrow(/negative/);
    expect(resultOf({ x: 5, y: 6, op: '+', z: 2, w: 39 })).toEqual([207, 234]);
  });

  it('every row of the design: 5/58 ok; 255/2 958, 85/986, 15/174 not reduced; 88/121 (« add across ») not the product', () => {
    expect(at(5, 58)).toBe('ok');
    for (const [p, q] of [
      [255, 2958],
      [85, 986],
      [15, 174],
    ])
      expect(at(p, q)).toBe('notReduced');
    expect(at(88, 121)).toBe('other');
    expect(at(58, 5)).toBe('other');
    expect(writingOf(W, { p: '', q: '58' }).kind).toBe('empty');
    expect(writingOf(W, {}).kind).toBe('empty');
    expect(writingOf(W, { p: '5', q: '0' }).kind).toBe('nan');
    expect(writingOf(W, { p: '5,0', q: '58' }).kind).toBe('nan');
    expect(writingOf(W, { p: ' 2 55', q: '2 958' })).toEqual({ kind: 'notReduced', P: 255, Q: 2958 });
  });

  it('for every writing P/Q up to 300: ok exactly on 5/58, notReduced exactly on its other writings, other elsewhere', () => {
    for (let P = 0; P <= 300; P += 1)
      for (let Q = 1; Q <= 300; Q += 1) {
        const equal = P * 58 === 5 * Q;
        const want = !equal ? 'other' : gcd(P, Q) === 1 ? 'ok' : 'notReduced';
        expect(at(P, Q)).toBe(want);
      }
  });

  it('agrees with the server’s claim `fraction` with `op` on every writing it accepts', () => {
    for (const [p, q] of [
      [5, 58],
      [85, 986],
      [88, 121],
    ]) {
      const claim = { kind: 'fraction', op: '*', x: 3, y: 34, z: 85, w: 87, a: 255, b: 2958, p, q };
      expect(verifyClaim(claim)).toBe(at(p, q) === 'ok');
    }
  });

  it('its one line is a fraction box: slots p over q', () => {
    expect(plaqueLines()).toEqual([{ tokens: [{ frac: { n: { slot: 'p', w: 4 }, d: { slot: 'q', w: 4 } } }] }]);
  });
});
