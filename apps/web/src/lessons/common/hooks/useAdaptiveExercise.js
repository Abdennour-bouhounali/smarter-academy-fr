import { useState, useCallback } from 'react';
import {
  INITIAL_ADAPTIVE_STATE,
  applyValidationResult,
  requestNextHint,
  revealSolution,
  getCurrentGuidance,
  hasMoreHints as computeHasMoreHints,
  canViewSolution as computeCanViewSolution,
} from '@smarter-academy/core';

/**
 * useAdaptiveExercise - A hook for managing progressive guidance, specific error feedback, and multiple field validation.
 *
 * The actual state-transition rules live in @smarter-academy/core
 * (exercise/adaptiveExerciseState.js) as plain, React-free functions — this
 * hook is just the useState/useCallback wiring around them, so the same
 * rules are usable by a future non-web client without depending on React DOM.
 *
 * @param {Object} config
 * @param {Function} config.validate - (values) => { isCorrect: boolean, fields?: { [key]: boolean }, feedback?: string }
 * @param {Array} config.guidanceSteps - Array of step objects: { type: 'hint' | 'solution', content: ReactNode }.
 * @param {Function} [config.onSuccess] - Callback when the answer is completely correct.
 */
export function useAdaptiveExercise({ validate, guidanceSteps = [], onSuccess }) {
  const [state, setState] = useState(INITIAL_ADAPTIVE_STATE);

  const submitAnswer = useCallback((values) => {
    const result = validate(values);
    setState(prev => applyValidationResult(prev, result, guidanceSteps));
    if (result.isCorrect && onSuccess) onSuccess();
    return result.isCorrect;
  }, [validate, guidanceSteps, onSuccess]);

  const requestHint = useCallback(() => {
    setState(prev => requestNextHint(prev, guidanceSteps));
  }, [guidanceSteps]);

  const viewSolution = useCallback(() => {
    setState(prev => revealSolution(prev, guidanceSteps));
  }, [guidanceSteps]);

  const reset = useCallback(() => {
    setState(INITIAL_ADAPTIVE_STATE);
  }, []);

  return {
    status: state.status,
    attempts: state.attempts,
    fieldStatuses: state.fieldStatuses,
    specificFeedback: state.specificFeedback,
    currentGuidance: getCurrentGuidance(state, guidanceSteps),
    hasMoreHints: computeHasMoreHints(state, guidanceSteps),
    canViewSolution: computeCanViewSolution(state, guidanceSteps),
    submitAnswer,
    requestHint,
    viewSolution,
    reset,
  };
}
