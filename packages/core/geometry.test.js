import { describe, it, expect } from 'vitest';
import { computeHypotenuse, computePythagoreanLeg } from './geometry';

describe('computeHypotenuse', () => {
  it('computes the hypotenuse of a 3-4-5 triangle', () => {
    expect(computeHypotenuse(3, 4)).toBe(5);
  });

  it('is symmetric in its two arguments', () => {
    expect(computeHypotenuse(6, 8)).toBe(computeHypotenuse(8, 6));
  });
});

describe('computePythagoreanLeg', () => {
  it('computes the missing leg of a 3-4-5 triangle', () => {
    expect(computePythagoreanLeg(5, 3)).toBe(4);
    expect(computePythagoreanLeg(5, 4)).toBe(3);
  });

  it('is the inverse of computeHypotenuse', () => {
    const hyp = computeHypotenuse(6, 8);
    expect(computePythagoreanLeg(hyp, 6)).toBeCloseTo(8);
  });
});
