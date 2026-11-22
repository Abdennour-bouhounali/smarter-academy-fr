import { describe, it, expect } from 'vitest';
import * as G from './graphs3.js';
import * as Lin from './linear.js';

const t = (v) => G.text(v);
const P = (x, y) => G.pt(x, y);
describe('graphs3 — le graphique d’une situation de proportionnalité', () => {
  it('les trois boutiques : proportionnelle, alignée sans O, brisée', () => {
    const xs = [2, 6, 12, 14];
    expect(G.pointsOf({ a: '5' }, xs).map((p) => t(p.y))).toEqual(['10', '30', '60', '70']);
    expect(G.pointsOf({ a: '2,5', b: '10' }, xs).map((p) => t(p.y))).toEqual(['15', '25', '40', '45']);
    expect(G.pointsOf({ a: '5', k: 8, a2: '2' }, xs).map((p) => t(p.y))).toEqual(['10', '30', '48', '52']);
    expect(G.classify(G.pointsOf({ a: '5' }, xs))).toBe('prop');
    expect(G.classify(G.pointsOf({ a: '2,5', b: '10' }, xs))).toBe('aligned');
    expect(G.classify(G.pointsOf({ a: '5', k: 8, a2: '2' }, xs))).toBe('bent');
  });
  it('la droite par deux points et le test exact', () => {
    const l = G.lineThrough(P(2, 15), P(14, 45));
    expect(t(l.a)).toBe('2,5'); expect(t(l.b)).toBe('10');
    expect(G.onLine(l, P(6, 25))).toBe(true);
    expect(G.onLine(l, P(6, 26))).toBe(false);
    expect(G.onLine(l, G.ORIGIN)).toBe(false);
    expect(G.lineThrough(P(2, 1), P(2, 5))).toBeNull();
  });
  it('le coefficient, la valeur et l’abscisse', () => {
    expect(t(G.coefficient(G.pointsOf({ a: '1,5' }, [2, 4, 6, 8])))).toBe('1,5');
    expect(G.coefficient(G.pointsOf({ a: '2', b: '1' }, [1, 2, 3]))).toBeNull();
    expect(t(G.valueAt('1,5', 7))).toBe('10,5');
    expect(t(G.abscissaAt('1,5', 15))).toBe('10');
  });
  it('un seul point faux casse l’alignement (exactitude, pas d’arrondi)', () => {
    const pts = [P(1, '0,3'), P(3, '0,9'), P(7, '2,1')];
    expect(G.classify(pts)).toBe('prop');
    expect(G.classify([P(1, '0,3'), P(3, '0,9'), P(7, '2,2')])).toBe('bent');
  });
  it('hits : quels nœuds sont sur la droite', () => {
    const pins = G.pointsOf({ a: '5' }, [2, 6]);
    const nodes = [G.ORIGIN, ...pins];
    expect(G.hits(nodes, G.ORIGIN, pins[0])).toEqual([true, true, true]);
    const off = G.pointsOf({ a: '2,5', b: '10' }, [2, 6]);
    expect(G.hits([G.ORIGIN, ...off], off[0], off[1])).toEqual([false, true, true]);
  });
  it('cadre et saisie', () => {
    const f = G.frameFor(G.pointsOf({ a: '5' }, [2, 6, 12, 14]));
    expect(f.xMax).toBeGreaterThanOrEqual(14); expect(f.yMax).toBeGreaterThanOrEqual(70);
    expect(Lin.toNumber(G.parsePrice('2,5'))).toBe(2.5);
    expect(G.parsePrice('abc')).toBeNull();
    expect(G.parsePrice('123')).toBeNull();
  });
});
