import { describe, it, expect } from 'vitest';
import { withContext } from './exerciseParts';

describe('withContext — the first part\'s statement travels with the later parts (player, « no back-and-forth »)', () => {
  it('gives the statement of part 1 to the parts that have none, and leaves part 1 and the parts with their own as they are', () => {
    const parts = [{ id: 'a', statement: 'S' }, { id: 'b' }, { id: 'c', statement: 'T' }];
    const out = withContext(parts);
    expect(out[0]).toBe(parts[0]);
    expect(out[1]).toEqual({ id: 'b', context: 'S' });
    expect(out[2]).toBe(parts[2]);
  });
  it('does nothing for a single exercise or parts without any statement', () => {
    const one = [{ id: 'a', statement: 'S' }];
    expect(withContext(one)).toBe(one);
    const none = [{ id: 'a' }, { id: 'b' }];
    expect(withContext(none)).toBe(none);
  });
});
