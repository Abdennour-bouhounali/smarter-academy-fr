import { describe, it, expect } from 'vitest';
import { evaluateRow, buildRows, agreeingXs, allAgree } from './valueTableUtils';

const A = { id: 'a', label: '3x + 2', fn: (x) => 3 * x + 2 };
const B = { id: 'b', label: '5x', fn: (x) => 5 * x };
const C = { id: 'c', label: '4n + 4', fn: (n) => 4 * n + 4 };
const D = { id: 'd', label: '(n + 2)² − n²', fn: (n) => (n + 2) ** 2 - n ** 2 };

describe('valueTableUtils', () => {
  it('evaluates one row and detects agreement', () => {
    expect(evaluateRow([A, B], 1)).toEqual({ x: 1, values: [5, 5], allEqual: true });
    expect(evaluateRow([A, B], 2)).toEqual({ x: 2, values: [8, 10], allEqual: false });
  });
  it('a single agreeing value is not equivalence', () => {
    expect(allAgree([A, B], [1])).toBe(true);
    expect(allAgree([A, B], [1, 2])).toBe(false);
    expect(agreeingXs([A, B], [0, 1, 2, 3])).toEqual([1]);
  });
  it('equivalent writings agree everywhere', () => {
    expect(allAgree([C, D], [0, 1, 2, 3, 5, 10, -1])).toBe(true);
    expect(buildRows([C, D], [2])[0].values).toEqual([12, 12]);
  });
  it('rounds float artefacts so 0,1 + 0,2 style values compare equal', () => {
    const E = { id: 'e', label: '0,1 + 0,2', fn: () => 0.1 + 0.2 };
    const F = { id: 'f', label: '0,3', fn: () => 0.3 };
    expect(evaluateRow([E, F], 0).allEqual).toBe(true);
  });
  it('handles decimals and negatives in x', () => {
    const G = { id: 'g', label: '4x + 8', fn: (x) => 4 * x + 8 };
    const H = { id: 'h', label: '62', fn: () => 62 };
    expect(agreeingXs([G, H], [10, 12, 13.5, 14])).toEqual([13.5]);
    expect(evaluateRow([A], -1).values).toEqual([-1]);
  });
});
