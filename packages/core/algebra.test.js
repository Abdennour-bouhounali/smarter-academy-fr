import { describe, it, expect } from 'vitest';
import {
  evaluateAffineFunction, formatAffine, slopeBetween,
  affineFromTwoPoints, intersectionOfAffine, isLinearAffine,
} from './algebra.js';

describe('evaluateAffineFunction', () => {
  it('calcule a·x + b', () => {
    expect(evaluateAffineFunction(2, 1, 3)).toBe(7);
    expect(evaluateAffineFunction(-1.5, 4, 2)).toBe(1);
  });
});

describe('formatAffine', () => {
  it('efface le coefficient 1 et écrit le moins typographique', () => {
    expect(formatAffine(1, 0)).toBe('f(x) = x');
    expect(formatAffine(-1, 0)).toBe('f(x) = −x');
  });

  it('un coefficient nul laisse la seule ordonnée à l’origine', () => {
    expect(formatAffine(0, 3)).toBe('f(x) = 3');
    expect(formatAffine(0, 0)).toBe('f(x) = 0');
  });

  it('une ordonnée à l’origine nulle laisse le seul terme en x', () => {
    expect(formatAffine(3, 0)).toBe('f(x) = 3x');
  });

  it('un b négatif devient une soustraction, jamais « + −3 »', () => {
    expect(formatAffine(2, -3)).toBe('f(x) = 2x − 3');
    expect(formatAffine(2, -3)).not.toContain('+');
  });

  it('les décimaux s’écrivent à la française pour KaTeX', () => {
    expect(formatAffine(0.5, 1.5)).toBe('f(x) = 0{,}5x + 1{,}5');
  });

  it('n’utilise jamais le tiret ASCII', () => {
    expect(formatAffine(-2, -7)).not.toContain('-');
  });

  it('accepte une autre variable et un autre nom', () => {
    expect(formatAffine(5, 24, { variable: 'n', name: 'g' })).toBe('g(n) = 5n + 24');
    expect(formatAffine(3, 1, { withName: false })).toBe('3x + 1');
  });
});

describe('slopeBetween et affineFromTwoPoints', () => {
  it('retrouve la fonction passant par deux points', () => {
    expect(affineFromTwoPoints({ x: 0, y: 3 }, { x: 2, y: 7 })).toEqual({ a: 2, b: 3 });
    expect(affineFromTwoPoints({ x: -1, y: 5 }, { x: 3, y: -3 })).toEqual({ a: -2, b: 3 });
  });

  it('deux points de même abscisse ne définissent aucune fonction', () => {
    expect(slopeBetween({ x: 2, y: 1 }, { x: 2, y: 9 })).toBeNull();
    expect(affineFromTwoPoints({ x: 2, y: 1 }, { x: 2, y: 9 })).toBeNull();
  });

  it('les points retrouvés vérifient bien la fonction', () => {
    const p = { x: 1, y: 2.5 };
    const q = { x: 4, y: 8.5 };
    const f = affineFromTwoPoints(p, q);
    expect(evaluateAffineFunction(f.a, f.b, p.x)).toBeCloseTo(p.y, 9);
    expect(evaluateAffineFunction(f.a, f.b, q.x)).toBeCloseTo(q.y, 9);
  });
});

describe('intersectionOfAffine', () => {
  it('les deux forfaits se croisent au prix égal', () => {
    // 9n contre 24 + 5n → n = 6, prix 54 €
    expect(intersectionOfAffine({ a: 9, b: 0 }, { a: 5, b: 24 })).toEqual({ x: 6, y: 54 });
  });

  it('même coefficient et b différents : parallèles', () => {
    expect(intersectionOfAffine({ a: 2, b: 1 }, { a: 2, b: 5 })).toEqual({ parallel: true });
  });

  it('même coefficient et même b : la même droite', () => {
    expect(intersectionOfAffine({ a: 2, b: 1 }, { a: 2, b: 1 })).toEqual({ same: true });
  });
});

describe('isLinearAffine', () => {
  it('linéaire veut dire passant par l’origine', () => {
    expect(isLinearAffine({ a: 3, b: 0 })).toBe(true);
    expect(isLinearAffine({ a: 3, b: 0.4 })).toBe(false);
  });
});
