import { describe, it, expect } from 'vitest';
import { TEMP, CUBIC, G2, P4, Q4, BENEFICE, Q6, signAt, signTable, solveSign, setText, affine, combineSigns, productOf, curvePieces, Q4_RANGE, affineText, imageOf } from './signeUtils';

describe('signe en un point', () => {
  it('température : gel avant 6 h et après 18 h', () => {
    expect(signAt(TEMP, 3)).toBe('−'); expect(signAt(TEMP, 12)).toBe('+'); expect(signAt(TEMP, 6)).toBe('0'); expect(signAt(TEMP, 18)).toBe('0'); expect(signAt(TEMP, 22)).toBe('−');
    expect(signAt(TEMP, 30)).toBeNull();
  });
  it('la cubique alterne − + − +', () => {
    expect([-4, 0, 2, 5].map((x) => signAt(CUBIC, x))).toEqual(['−', '+', '−', '+']);
    expect(signAt(CUBIC, 1)).toBe('0');
  });
});
describe('tableaux de signes', () => {
  it('cubique sur [−4 ; 5]', () => {
    const t = signTable(CUBIC);
    expect(t.bounds).toEqual([-4, -3, 1, 4, 5]);
    expect(t.cells.map((c) => c.sign)).toEqual(['−', '+', '−', '+']);
    expect(t.marks.map((m) => m.kind)).toEqual(['zero', 'zero', 'zero']);
  });
  it('affine : signe de a à droite du zéro', () => {
    const t = signTable(affine(2, -3));
    expect(t.bounds).toEqual([null, 1.5, null]);
    expect(t.cells.map((c) => c.sign)).toEqual(['−', '+']);
    const u = signTable(affine(-3, 6));
    expect(u.bounds[1]).toBe(2); expect(u.cells.map((c) => c.sign)).toEqual(['+', '−']);
    expect(signTable(affine(0, 4)).cells.map((c) => c.sign)).toEqual(['+']);
  });
  it('produit et quotient', () => {
    expect(signTable(P4).bounds).toEqual([null, -3, 1, null]);
    expect(signTable(P4).cells.map((c) => c.sign)).toEqual(['+', '−', '+']);
    const q = signTable(Q4);
    expect(q.bounds).toEqual([null, -2, 1, null]);
    expect(q.cells.map((c) => c.sign)).toEqual(['+', '−', '+']);
    expect(q.marks).toEqual([{ x: -2, kind: 'zero' }, { x: 1, kind: 'forbidden' }]);
    expect(imageOf(Q4, 1)).toBeNull();
    expect(combineSigns(['−', '−'])).toBe('+'); expect(combineSigns(['+', '0'])).toBe('0'); expect(combineSigns(['+', '0'], { quotient: true })).toBeNull();
  });
});
describe('résolution', () => {
  it('P(x) > 0, P(x) ≤ 0, P(x) = 0', () => {
    expect(setText(solveSign(P4, '>'))).toBe(']−∞ ; −3[ ∪ ]1 ; +∞[');
    expect(setText(solveSign(P4, '<='))).toBe('[−3 ; 1]');
    expect(setText(solveSign(P4, '='))).toBe('{−3 ; 1}');
  });
  it('Q(x) ≥ 0 exclut la valeur interdite', () => {
    expect(setText(solveSign(Q4, '>='))).toBe(']−∞ ; −2] ∪ ]1 ; +∞[');
    expect(setText(solveSign(Q6, '<'))).toBe(']−1 ; 3[');
  });
  it('gel et bénéfice', () => {
    expect(setText(solveSign(TEMP, '<'))).toBe('[0 ; 6[ ∪ ]18 ; 24]');
    expect(setText(solveSign(BENEFICE, '>'))).toBe(']20 ; 80[');
    expect(setText(solveSign(G2, '<'))).toBe(']−1 ; 2[');
  });
  it('les morceaux du quotient évitent la valeur interdite', () => {
    const pcs = curvePieces(Q4, Q4_RANGE);
    expect(pcs.length).toBeGreaterThanOrEqual(2);
    expect(pcs.every((pc) => pc.every((p) => Math.abs(p.x - 1) > 1e-5))).toBe(true);
  });
  it('écritures', () => {
    expect(affineText(2, -3)).toBe('2x − 3'); expect(affineText(-1, 0)).toBe('−x'); expect(affineText(0, 4)).toBe('4'); expect(affineText(1, 2)).toBe('x + 2');
    expect(productOf(affine(1, -1), affine(1, 3)).zeros).toEqual([-3, 1]);
  });
});
