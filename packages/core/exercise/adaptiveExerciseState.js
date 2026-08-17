/**
 * Pure state-transition rules behind the "adaptive exercise" pattern used
 * throughout the lesson modules: submit an answer, get progressive hints on
 * failure, eventually reveal a solution. Extracted from
 * apps/web/src/lessons/common/hooks/useAdaptiveExercise.js, which is now a
 * thin useState/useCallback wrapper around these functions.
 *
 * State shape: { status, attempts, hintLevel, fieldStatuses, specificFeedback }
 *   status: 'idle' | 'incorrect' | 'correct' | 'solution_viewed'
 *   hintLevel: 0 means no generic hint shown yet
 *
 * guidanceSteps: Array<{ type: 'hint' | 'solution', content: * }>, supplied
 * by the caller — a future React Native client would pass the same shape.
 */

export const INITIAL_ADAPTIVE_STATE = {
  status: 'idle',
  attempts: 0,
  hintLevel: 0,
  fieldStatuses: {},
  specificFeedback: null,
};

/**
 * Applies a validate() result (the Exercise Result contract — see
 * docs/architecture/EXERCISE_CONTRACT.md) to the current state.
 * @param {typeof INITIAL_ADAPTIVE_STATE} state
 * @param {{isCorrect: boolean, fields?: object, feedback?: string}} result
 * @param {Array} guidanceSteps
 */
export function applyValidationResult(state, result, guidanceSteps) {
  const fieldStatuses = result.fields
    ? { ...state.fieldStatuses, ...result.fields }
    : { global: result.isCorrect };

  if (result.isCorrect) {
    return { ...state, status: 'correct', fieldStatuses, specificFeedback: null };
  }

  const attempts = state.attempts + 1;

  if (result.feedback) {
    return { ...state, status: 'incorrect', attempts, fieldStatuses, specificFeedback: result.feedback };
  }

  // Auto-advance to the first hint if there's no specific feedback and none shown yet.
  const hintLevel = state.hintLevel === 0 && guidanceSteps.length > 0 ? 1 : state.hintLevel;
  return { ...state, status: 'incorrect', attempts, fieldStatuses, specificFeedback: null, hintLevel };
}

export function requestNextHint(state, guidanceSteps) {
  if (state.hintLevel < guidanceSteps.length) {
    return { ...state, hintLevel: state.hintLevel + 1 };
  }
  return state;
}

export function revealSolution(state, guidanceSteps) {
  return { ...state, status: 'solution_viewed', hintLevel: guidanceSteps.length };
}

export function getCurrentGuidance(state, guidanceSteps) {
  return state.hintLevel > 0 && state.hintLevel <= guidanceSteps.length
    ? guidanceSteps[state.hintLevel - 1]
    : null;
}

export function hasMoreHints(state, guidanceSteps) {
  return state.hintLevel < guidanceSteps.length && guidanceSteps[state.hintLevel]?.type !== 'solution';
}

export function canViewSolution(state, guidanceSteps) {
  return (
    guidanceSteps.length > 0 &&
    state.status === 'incorrect' &&
    state.hintLevel > 0 &&
    guidanceSteps[guidanceSteps.length - 1].type === 'solution' &&
    state.status !== 'solution_viewed'
  );
}
