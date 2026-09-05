import { describe, it, expect } from 'vitest';
import {
  lin, evalLin, addLin, subLin, scaleLin, solveLinear, isEquivalentEquation,
  productZeros, evalProduct, balanceStep, balanceTilt, isIsolated, isSolution,
  formatLin, formatEquation, formatProduct, formatSolutionSet, formatSubstituted,
} from './equationUtils';

describe('formes linéaires', () => {
  it('évalue, additionne, soustrait, multiplie', () => {
    expect(evalLin(lin(3, -6), 2)).toBe(0);
    expect(evalLin(lin(2, 4), -2)).toBe(0);
    expect(addLin(lin(2, 3), lin(1, -7))).toEqual(lin(3, -4));
    expect(subLin(lin(2, 3), lin(1, 7))).toEqual(lin(1, -4));
    expect(scaleLin(lin(1, 2), 3)).toEqual(lin(3, 6));
  });
});

describe('solveLinear', () => {
  it('trouve la solution unique de 3x − 6 = 0 et de 2x + 3 = x + 7', () => {
    expect(solveLinear({ left: lin(3, -6), right: lin(0, 0) })).toEqual({ kind: 'unique', x: 2 });
    expect(solveLinear({ left: lin(2, 3), right: lin(1, 7) })).toEqual({ kind: 'unique', x: 4 });
  });
  it('détecte 0 solution (x + 1 = x + 2) et toutes (2(x+1) = 2x + 2)', () => {
    expect(solveLinear({ left: lin(1, 1), right: lin(1, 2) })).toEqual({ kind: 'none' });
    expect(solveLinear({ left: { k: 2, inner: lin(1, 1) }, right: lin(2, 2) })).toEqual({ kind: 'all' });
  });
  it('donne une solution décimale : 2x − 5 = 0 → 2,5', () => {
    expect(solveLinear({ left: lin(2, -5), right: lin(0, 0) })).toEqual({ kind: 'unique', x: 2.5 });
  });
});

describe('isEquivalentEquation / isSolution', () => {
  it('x + 3 = 7 ≡ x = 4, mais pas ≡ x = 7', () => {
    const e = { left: lin(1, 3), right: lin(0, 7) };
    expect(isEquivalentEquation(e, { left: lin(1, 0), right: lin(0, 4) })).toBe(true);
    expect(isEquivalentEquation(e, { left: lin(1, 0), right: lin(0, 7) })).toBe(false);
    expect(isSolution(e, 4)).toBe(true);
    expect(isSolution(e, 7)).toBe(false);
  });
});

describe('produit nul', () => {
  it('productZeros((x − 3)(2x + 4)) = [−2, 3] et evalProduct y vaut 0', () => {
    const f1 = lin(1, -3);
    const f2 = lin(2, 4);
    expect(productZeros(f1, f2)).toEqual([-2, 3]);
    expect(evalProduct(f1, f2, 3)).toBe(0);
    expect(evalProduct(f1, f2, -2)).toBe(0);
    expect(evalProduct(f1, f2, 0)).toBe(-12);
    expect(evalProduct(f1, f2, 2.5)).toBe(-4.5);
  });
  it('ne renvoie pas de doublon et ignore un facteur constant', () => {
    expect(productZeros(lin(1, -4), lin(2, -8))).toEqual([4]);
    expect(productZeros(lin(0, 5), lin(1, 1))).toEqual([-1]);
    expect(productZeros(lin(1, 0), lin(1, -4))).toEqual([0, 4]);
  });
  it('le produit ne vaut 0 que sur les zéros (balayage −5…5 pas 0,5)', () => {
    const f1 = lin(1, -3);
    const f2 = lin(2, 4);
    const zeros = [];
    for (let x = -5; x <= 5; x += 0.5) if (evalProduct(f1, f2, x) === 0) zeros.push(x);
    expect(zeros).toEqual(productZeros(f1, f2));
  });
});

describe('balanceStep', () => {
  it('retire des deux côtés et partage : 2x + 3 = x + 7 → x = 4', () => {
    let eq = { left: lin(2, 3), right: lin(1, 7) };
    eq = balanceStep(eq, { type: 'addx', k: -1 });
    expect(eq).toEqual({ left: lin(1, 3), right: lin(0, 7) });
    eq = balanceStep(eq, { type: 'add', n: -3 });
    expect(eq).toEqual({ left: lin(1, 0), right: lin(0, 4) });
    expect(isIsolated(eq)).toBe(true);
    expect(solveLinear(eq).x).toBe(4);
  });
  it('développe 3(x + 2) = 15 puis résout', () => {
    let eq = { left: { k: 3, inner: lin(1, 2) }, right: lin(0, 15) };
    // avant développement, retirer ne touche pas le paquet
    expect(balanceStep(eq, { type: 'add', n: -1 }).left).toEqual(eq.left);
    eq = balanceStep(eq, { type: 'expand' });
    expect(eq.left).toEqual(lin(3, 6));
    eq = balanceStep(eq, { type: 'add', n: -6 });
    eq = balanceStep(eq, { type: 'div', n: 3 });
    expect(eq).toEqual({ left: lin(1, 0), right: lin(0, 3) });
  });
  it('une action d’un seul côté casse l’équivalence et fait pencher la balance', () => {
    const start = { left: lin(1, 3), right: lin(0, 7) };
    const xStar = solveLinear(start).x;
    const oneSided = balanceStep(start, { type: 'add', n: -3 }, 'left');
    expect(oneSided).toEqual({ left: lin(1, 0), right: lin(0, 7) });
    expect(isEquivalentEquation(start, oneSided)).toBe(false);
    expect(balanceTilt(oneSided, xStar)).toBe(1); // 4 à gauche, 7 à droite : penche à droite
    const both = balanceStep(start, { type: 'add', n: -3 }, 'both');
    expect(balanceTilt(both, xStar)).toBe(0);
    expect(isEquivalentEquation(start, both)).toBe(true);
  });
});

describe('formatage LaTeX', () => {
  it('formatLin gère 1x, −1x, 0 et les constantes', () => {
    expect(formatLin(lin(1, -3))).toBe('x -3');
    expect(formatLin(lin(2, 4))).toBe('2x +4');
    expect(formatLin(lin(-1, 0))).toBe('-x');
    expect(formatLin(lin(0, 0))).toBe('0');
    expect(formatLin(lin(0, 15))).toBe('15');
    expect(formatLin(lin(2.5, 0))).toBe('2{,}5x');
  });
  it('formatEquation, formatProduct et formatSolutionSet', () => {
    expect(formatEquation({ left: { k: 3, inner: lin(1, 2) }, right: lin(0, 15) })).toBe('3(x +2) = 15');
    expect(formatProduct(lin(1, -3), lin(2, 4))).toBe('(x -3)(2x +4)');
    expect(formatProduct(lin(1, 0), lin(1, -4))).toBe('x(x -4)');
    // formatDec rend le moins typographique français (U+2212), pas le tiret ASCII.
    expect(formatSolutionSet([-2, 3])).toBe('\\{\\,−2\\,;\\,3\\,\\}');
    expect(formatSubstituted(lin(2, 4), 3)).toBe('2 \\times 3 + 4');
    expect(formatSubstituted(lin(1, -3), -2)).toBe('(−2) - 3');
  });
});
