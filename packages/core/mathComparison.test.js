import { describe, it, expect } from 'vitest';
import { compareMathExpressions } from './mathComparison';

describe('compareMathExpressions', () => {
  it('treats an equivalent fraction and decimal as equal', () => {
    expect(compareMathExpressions('1/2', '0.5')).toBe(true);
  });

  it('treats a reordered algebraic expression as equal', () => {
    expect(compareMathExpressions('x^2+5x', 'x^2 + 5*x')).toBe(true);
  });

  it('treats two empty expressions as equal', () => {
    expect(compareMathExpressions('', '')).toBe(true);
  });

  it('treats an expression against an empty one as unequal', () => {
    expect(compareMathExpressions('x', '')).toBe(false);
  });

  it('rejects genuinely different values', () => {
    expect(compareMathExpressions('4', '5')).toBe(false);
  });
});
