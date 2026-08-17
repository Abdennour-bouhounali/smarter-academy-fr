import { describe, it, expect } from 'vitest';
import { validateChoiceAnswer } from './validateChoiceAnswer';

describe('validateChoiceAnswer', () => {
  it('accepts a matching selection', () => {
    expect(validateChoiceAnswer('B', 'B')).toEqual({ isCorrect: true });
  });

  it('rejects a non-matching selection', () => {
    expect(validateChoiceAnswer('A', 'B')).toEqual({ isCorrect: false });
  });

  it('works with numeric/index values, not just strings', () => {
    expect(validateChoiceAnswer(2, 2)).toEqual({ isCorrect: true });
    expect(validateChoiceAnswer(1, 2)).toEqual({ isCorrect: false });
  });
});
