import { describe, it, expect } from 'vitest';
import { getNextIncompleteModule } from './getNextIncompleteModule';

describe('getNextIncompleteModule', () => {
  it('returns the first gap in the completed set', () => {
    expect(getNextIncompleteModule(new Set([1, 2, 4]), 5)).toBe(3);
  });

  it('returns 1 when nothing is completed', () => {
    expect(getNextIncompleteModule(new Set(), 5)).toBe(1);
  });

  it('returns 1 when everything is completed (caller decides what "done" means)', () => {
    expect(getNextIncompleteModule(new Set([1, 2, 3]), 3)).toBe(1);
  });

  it('takes the real module count from the caller — no fabricated default', () => {
    // With totalModules required, a 5-module lesson and a 9-module lesson
    // resume differently for the same completed set.
    const completed = new Set([1, 2, 3, 4, 5]);
    expect(getNextIncompleteModule(completed, 9)).toBe(6);
    expect(getNextIncompleteModule(completed, 5)).toBe(1);
  });
});
