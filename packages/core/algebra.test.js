import { describe, it, expect } from 'vitest';
import { evaluateAffineFunction } from './algebra';

describe('evaluateAffineFunction', () => {
  it('evaluates f(x) = 2x + 1 at x = 3', () => {
    expect(evaluateAffineFunction(2, 1, 3)).toBe(7);
  });

  it('behaves as a linear function when b is 0', () => {
    expect(evaluateAffineFunction(3, 0, 4)).toBe(12);
  });

  it('handles a negative slope', () => {
    expect(evaluateAffineFunction(-2, 5, 3)).toBe(-1);
  });

  it('handles x = 0 (returns the intercept)', () => {
    expect(evaluateAffineFunction(7, 4, 0)).toBe(4);
  });
});
