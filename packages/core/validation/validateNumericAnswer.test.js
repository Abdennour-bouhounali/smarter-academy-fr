import { describe, it, expect } from 'vitest';
import { validateNumericAnswer } from './validateNumericAnswer';

describe('validateNumericAnswer', () => {
  it('accepts an exact numeric match', () => {
    expect(validateNumericAnswer('5', 5)).toEqual({ isCorrect: true });
  });

  it('accepts French comma-decimal notation within tolerance', () => {
    expect(validateNumericAnswer('5,83', 5.830951895), ).toEqual({ isCorrect: true });
  });

  it('accepts an algebraically-equivalent expression via the compareMathExpressions fallback', () => {
    expect(validateNumericAnswer('1/2', 0.5)).toEqual({ isCorrect: true });
  });

  it('rejects a value outside tolerance', () => {
    expect(validateNumericAnswer('5', 5.5)).toEqual({ isCorrect: false });
  });

  it('rejects malformed input without throwing', () => {
    expect(validateNumericAnswer('abc', 5)).toEqual({ isCorrect: false });
  });

  it('respects a custom tolerance', () => {
    expect(validateNumericAnswer('5.4', 5, { tolerance: 0.5 })).toEqual({ isCorrect: true });
    expect(validateNumericAnswer('5.4', 5, { tolerance: 0.1 })).toEqual({ isCorrect: false });
  });

  it('can disable the algebraic-equivalence fallback', () => {
    expect(validateNumericAnswer('1/2', 0.5, { allowAlgebraic: false }).isCorrect).toBe(false);
  });
});
