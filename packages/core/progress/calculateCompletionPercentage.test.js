import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage } from './calculateCompletionPercentage';

describe('calculateCompletionPercentage', () => {
  it('computes a straightforward percentage', () => {
    expect(calculateCompletionPercentage(['1', '2', '3'], 6)).toBe(50);
  });

  it('normalizes mixed-format module ids and de-duplicates them', () => {
    // "3" and "L03-4e" both refer to module 3 and must count once, not twice.
    expect(calculateCompletionPercentage(['1', '3', 'L03-4e'], 4)).toBe(50);
  });

  // Edge cases explicitly required: never produce NaN or Infinity.
  it('returns 0 for zero total modules instead of Infinity/NaN', () => {
    expect(calculateCompletionPercentage(['1', '2'], 0)).toBe(0);
  });

  it('returns 0 for missing totalModules', () => {
    expect(calculateCompletionPercentage(['1'], undefined)).toBe(0);
  });

  it('returns 0 for an empty completed list', () => {
    expect(calculateCompletionPercentage([], 10)).toBe(0);
  });

  it('returns 0 when completedModuleIds is missing or not an array', () => {
    expect(calculateCompletionPercentage(undefined, 10)).toBe(0);
    expect(calculateCompletionPercentage(null, 10)).toBe(0);
  });

  it('caps at 100 even if more completed ids are recorded than totalModules', () => {
    expect(calculateCompletionPercentage(['1', '2', '3', '4'], 2)).toBe(100);
  });

  it('ignores ids that do not contain a parseable module number', () => {
    expect(calculateCompletionPercentage(['1', 'oops', '2'], 4)).toBe(50);
  });

  it('reaches exactly 100 when every module is completed', () => {
    expect(calculateCompletionPercentage(['1', '2', '3'], 3)).toBe(100);
  });
});
