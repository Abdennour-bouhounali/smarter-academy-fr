import { describe, it, expect } from 'vitest';
import {
  INITIAL_ADAPTIVE_STATE,
  applyValidationResult,
  requestNextHint,
  revealSolution,
  getCurrentGuidance,
  hasMoreHints,
  canViewSolution,
} from './adaptiveExerciseState';

const HINT_STEPS = [
  { type: 'hint', content: 'first hint' },
  { type: 'hint', content: 'second hint' },
  { type: 'solution', content: 'the solution' },
];

describe('applyValidationResult', () => {
  it('marks status correct and clears feedback on a correct answer', () => {
    const next = applyValidationResult(INITIAL_ADAPTIVE_STATE, { isCorrect: true }, HINT_STEPS);
    expect(next.status).toBe('correct');
    expect(next.specificFeedback).toBeNull();
    expect(next.fieldStatuses).toEqual({ global: true });
  });

  it('marks status incorrect and increments attempts on a wrong answer', () => {
    const next = applyValidationResult(INITIAL_ADAPTIVE_STATE, { isCorrect: false }, HINT_STEPS);
    expect(next.status).toBe('incorrect');
    expect(next.attempts).toBe(1);
  });

  it('auto-advances to the first hint when there is no specific feedback and none shown yet', () => {
    const next = applyValidationResult(INITIAL_ADAPTIVE_STATE, { isCorrect: false }, HINT_STEPS);
    expect(next.hintLevel).toBe(1);
  });

  it('does not auto-advance the hint level when specific feedback is provided', () => {
    const next = applyValidationResult(INITIAL_ADAPTIVE_STATE, { isCorrect: false, feedback: 'nope' }, HINT_STEPS);
    expect(next.hintLevel).toBe(0);
    expect(next.specificFeedback).toBe('nope');
  });

  it('does not re-advance the hint level past what the student already saw', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, hintLevel: 2 };
    const next = applyValidationResult(state, { isCorrect: false }, HINT_STEPS);
    expect(next.hintLevel).toBe(2);
  });

  it('merges per-field statuses for multi-field exercises', () => {
    const next = applyValidationResult(
      INITIAL_ADAPTIVE_STATE,
      { isCorrect: false, fields: { a: true, b: false } },
      HINT_STEPS
    );
    expect(next.fieldStatuses).toEqual({ a: true, b: false });
  });

  it('accumulates attempts across repeated wrong answers', () => {
    let state = INITIAL_ADAPTIVE_STATE;
    state = applyValidationResult(state, { isCorrect: false }, HINT_STEPS);
    state = applyValidationResult(state, { isCorrect: false }, HINT_STEPS);
    expect(state.attempts).toBe(2);
  });
});

describe('requestNextHint', () => {
  it('advances the hint level by one', () => {
    const next = requestNextHint(INITIAL_ADAPTIVE_STATE, HINT_STEPS);
    expect(next.hintLevel).toBe(1);
  });

  it('does not advance past the number of guidance steps', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, hintLevel: HINT_STEPS.length };
    const next = requestNextHint(state, HINT_STEPS);
    expect(next.hintLevel).toBe(HINT_STEPS.length);
  });
});

describe('revealSolution', () => {
  it('sets status to solution_viewed and hintLevel to the last step', () => {
    const next = revealSolution(INITIAL_ADAPTIVE_STATE, HINT_STEPS);
    expect(next.status).toBe('solution_viewed');
    expect(next.hintLevel).toBe(HINT_STEPS.length);
  });
});

describe('getCurrentGuidance', () => {
  it('returns null when no hint has been requested', () => {
    expect(getCurrentGuidance(INITIAL_ADAPTIVE_STATE, HINT_STEPS)).toBeNull();
  });

  it('returns the guidance step matching the current hint level', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, hintLevel: 2 };
    expect(getCurrentGuidance(state, HINT_STEPS)).toEqual(HINT_STEPS[1]);
  });
});

describe('hasMoreHints', () => {
  it('is true when more non-solution hints remain', () => {
    expect(hasMoreHints(INITIAL_ADAPTIVE_STATE, HINT_STEPS)).toBe(true);
  });

  it('is false once only the solution step remains', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, hintLevel: 2 };
    expect(hasMoreHints(state, HINT_STEPS)).toBe(false);
  });
});

describe('canViewSolution', () => {
  it('is false before any hint has been requested', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, status: 'incorrect' };
    expect(canViewSolution(state, HINT_STEPS)).toBe(false);
  });

  it('is true once a hint has been shown and the last step is a solution', () => {
    const state = { ...INITIAL_ADAPTIVE_STATE, status: 'incorrect', hintLevel: 1 };
    expect(canViewSolution(state, HINT_STEPS)).toBe(true);
  });

  it('is false when the guidance steps have no solution step', () => {
    const noSolution = [{ type: 'hint', content: 'x' }];
    const state = { ...INITIAL_ADAPTIVE_STATE, status: 'incorrect', hintLevel: 1 };
    expect(canViewSolution(state, noSolution)).toBe(false);
  });
});
