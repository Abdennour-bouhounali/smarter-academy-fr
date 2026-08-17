import { useState } from 'react';
import { useAdaptiveExercise } from './useAdaptiveExercise';

/**
 * useSimpleExercise wraps useAdaptiveExercise for single-field exercises that
 * only need a plain (value, setValue) pair rather than the full multi-field
 * validate({ values }) contract.
 *
 * @param {Object} config
 * @param {Function} config.validator - (value) => { isCorrect: boolean, feedback?: string }
 * @param {Array<string>} [config.hints] - Optional hint strings, wrapped into guidanceSteps.
 * @returns {Object} The useAdaptiveExercise state, plus `value`, `setValue`, and `isCorrect`.
 */
export function useSimpleExercise(config) {
  const [value, setValue] = useState('');

  const adaptiveState = useAdaptiveExercise({
    validate: () => config.validator(value),
    guidanceSteps: (config.hints || []).map(h => ({ type: 'hint', content: h }))
  });

  // Attach value and setValue to the adaptiveState object for convenience
  adaptiveState.value = value;
  adaptiveState.setValue = setValue;
  adaptiveState.isCorrect = adaptiveState.status === 'correct';

  // Also attach a wrapped submit that uses the current value
  const originalSubmit = adaptiveState.submitAnswer;
  adaptiveState.submitAnswer = () => originalSubmit(value);

  return adaptiveState;
}
