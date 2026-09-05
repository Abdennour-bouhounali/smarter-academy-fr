import { describe, it, expect } from 'vitest';
import {
  texLin, niceFraction, lin, evalLin, formatLin, solveLinearEq, solveLinearIneq, relationAt, applyBothSides, applyOneSide, sameSolutions,
  isSolvedForm, checkSolution, evalProduct, productZeros, forbiddenValues, quotientSolutions, evalQuotient, notation, opAfter, fraction, formatFrac,
} from './eqUtils';

describe('linear forms', () => {
  it('formats with French signs', () => {
    expect(formatLin(lin(2, 5))).toBe('2x + 5');
    expect(formatLin(lin(-3, 4))).toBe('−3x + 4');
    expect(formatLin(lin(0, 13))).toBe('13');
    expect(formatLin(lin(1, 0))).toBe('x');
    expect(formatLin(lin(-1, -1))).toBe('−x − 1');
    expect(formatLin(lin(0.5, -2))).toBe('0,5x − 2');
  });
  it('evaluates', () => { expect(evalLin(lin(2, 5), 4)).toBe(13); expect(evalLin(lin(-3, 4), 2)).toBe(-2); });
});

describe('texLin — exact fractions on screen', () => {
  it('renders 2,333333333 as 7/3 and keeps decimals otherwise', () => {
    expect(niceFraction(2.333333333)).toEqual({ num: 7, den: 3 });
    expect(niceFraction(0.5)).toEqual({ num: 1, den: 2 });
    expect(niceFraction(Math.SQRT2)).toBe(null);
    expect(texLin(lin(0, 2.333333333))).toBe('\\frac{7}{3}');
    expect(texLin(lin(1, -2.5))).toBe('x - \\frac{5}{2}');
    expect(texLin(lin(2, 5))).toBe('2x + 5');
  });
});

describe('solveLinearEq — the two plans', () => {
  it('5 + 2x = 13 → x = 4', () => { expect(solveLinearEq(lin(2, 5), lin(0, 13))).toEqual({ kind: 'one', x: { num: 4, den: 1 } }); });
  it('7x + 2 = 4x + 9 → x = 7/3, exact', () => {
    const s = solveLinearEq(lin(7, 2), lin(4, 9));
    expect(s.x).toEqual({ num: 7, den: 3 }); expect(formatFrac(s.x)).toBe('7/3');
  });
  it('parallel plans never meet; identical ones always do', () => {
    expect(solveLinearEq(lin(2, 3), lin(2, 5)).kind).toBe('none');
    expect(solveLinearEq(lin(2, 2), lin(2, 2)).kind).toBe('all');
  });
  it('checkSolution substitutes', () => {
    expect(checkSolution(lin(2, 5), lin(0, 13), 4)).toEqual({ left: 13, right: 13, ok: true });
    expect(checkSolution(lin(2, 5), lin(0, 13), 3).ok).toBe(false);
  });
});

describe('solveLinearIneq — the sign flips on a negative divisor', () => {
  it('5 + 2x < 13 → ]−∞ ; 4[', () => { expect(notation(solveLinearIneq(lin(2, 5), lin(0, 13), '<'))).toBe(']−∞ ; 4['); });
  it('−3x + 4 ≤ 10 → x ≥ −2 → [−2 ; +∞[', () => { expect(notation(solveLinearIneq(lin(-3, 4), lin(0, 10), '≤'))).toBe('[−2 ; +∞['); });
  it('x + 1 > x → ℝ ; x > x + 1 → ∅', () => {
    expect(notation(solveLinearIneq(lin(1, 1), lin(1, 0), '>'))).toBe('ℝ');
    expect(notation(solveLinearIneq(lin(1, 0), lin(1, 1), '>'))).toBe('∅');
  });
  it('opAfter flips for negatives only', () => { expect(opAfter('≤', -2)).toBe('≥'); expect(opAfter('<', 3)).toBe('<'); });
  it('relationAt reads the scanner', () => {
    expect(relationAt(lin(2, 5), lin(0, 13), 2)).toBe('<'); expect(relationAt(lin(2, 5), lin(0, 13), 4)).toBe('='); expect(relationAt(lin(2, 5), lin(0, 13), 6)).toBe('>');
  });
});

describe('transformations', () => {
  const eq = { L: lin(2, 5), R: lin(0, 13) };
  it('both sides keep the solutions; one side breaks them', () => {
    const e1 = applyBothSides(eq, { type: 'add', k: -5 });
    expect(e1).toEqual({ L: lin(2, 0), R: lin(0, 8) });
    expect(sameSolutions(eq, e1)).toBe(true);
    const e2 = applyBothSides(e1, { type: 'div', k: 2 });
    expect(isSolvedForm(e2)).toBe(true); expect(e2.R.b).toBe(4);
    const bad = applyOneSide(eq, { type: 'add', k: -5 }, 'L');
    expect(sameSolutions(eq, bad)).toBe(false);
  });
  it('7x + 2 = 4x + 9 keeps its solutions through ÷ 3 (non-integer coefficients)', () => {
    let e = { L: lin(7, 2), R: lin(4, 9) };
    const start = e;
    e = applyBothSides(e, { type: 'addx', k: -4 }); e = applyBothSides(e, { type: 'add', k: -2 }); e = applyBothSides(e, { type: 'div', k: 3 });
    expect(isSolvedForm(e)).toBe(true); expect(sameSolutions(start, e)).toBe(true);
  });
  it('3x − 4 = x + 6 : −x, +4, ÷2 → x = 5', () => {
    let e = { L: lin(3, -4), R: lin(1, 6) };
    e = applyBothSides(e, { type: 'addx', k: -1 }); e = applyBothSides(e, { type: 'add', k: 4 }); e = applyBothSides(e, { type: 'div', k: 2 });
    expect(e).toEqual({ L: lin(1, 0), R: lin(0, 5) });
  });
});

describe('product and quotient', () => {
  const F = [lin(1, -2), lin(2, 6)];
  it('(x − 2)(2x + 6) vanishes exactly at 2 and −3', () => {
    expect(productZeros(F).map((f) => f.num / f.den)).toEqual([-3, 2]);
    expect(evalProduct(F, 2)).toBe(0); expect(evalProduct(F, -3)).toBe(0); expect(evalProduct(F, 0)).toBe(-12);
  });
  it('(x − 3)/(x + 1): forbidden −1, solution 3; (x − 2)/(x − 2) = 0 has none', () => {
    expect(forbiddenValues(lin(1, 1))).toEqual([{ num: -1, den: 1 }]);
    expect(quotientSolutions(lin(1, -3), lin(1, 1))).toEqual([{ num: 3, den: 1 }]);
    expect(quotientSolutions(lin(1, -2), lin(1, -2))).toEqual([]);
    expect(evalQuotient(lin(1, -3), lin(1, 1), -1)).toBe(null);
    expect(evalQuotient(lin(1, -3), lin(1, 1), 3)).toBe(0);
  });
  it('fractions reduce', () => { expect(fraction(6, -4)).toEqual({ num: -3, den: 2 }); });
});
