import { describe, it, expect } from 'vitest';
import { validateScientificNotation } from './validateScientificNotation';

const EXPECTED = { coefficient: 4.5, exponent: 4 };

describe('validateScientificNotation', () => {
  it('accepts the correct coefficient and exponent', () => {
    const result = validateScientificNotation('4,5', '4', EXPECTED);
    expect(result).toEqual({ isCorrect: true, fields: { coef: true, exp: true }, reason: null });
  });

  it('accepts a dot instead of a comma for the coefficient', () => {
    expect(validateScientificNotation('4.5', '4', EXPECTED).isCorrect).toBe(true);
  });

  it('flags a non-numeric coefficient', () => {
    const result = validateScientificNotation('abc', '4', EXPECTED);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe('coef_not_numeric');
    expect(result.fields).toEqual({ coef: false, exp: true });
  });

  it('flags a coefficient that is too large (>= 10)', () => {
    expect(validateScientificNotation('45', '3', EXPECTED).reason).toBe('coef_too_large');
  });

  it('flags a coefficient that is too small (< 1)', () => {
    expect(validateScientificNotation('0,45', '5', EXPECTED).reason).toBe('coef_too_small');
  });

  it('flags a coefficient in valid range but not the expected value', () => {
    expect(validateScientificNotation('3,2', '4', EXPECTED).reason).toBe('coef_wrong');
  });

  it('only checks the exponent once the coefficient is correct', () => {
    const result = validateScientificNotation('4,5', 'x', EXPECTED);
    expect(result.reason).toBe('exp_not_numeric');
    expect(result.fields).toEqual({ coef: true, exp: false });
  });

  it('flags a numeric but wrong exponent', () => {
    expect(validateScientificNotation('4,5', '3', EXPECTED).reason).toBe('exp_wrong');
  });
});
