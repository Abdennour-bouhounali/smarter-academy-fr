import { useState } from 'react';
import { useAdaptiveExercise as useAdaptiveExerciseOriginal } from '../../../../../common/hooks/useAdaptiveExercise';

/**
 * useSimpleExercise wraps useAdaptiveExercise to:
 * 1. Store a simple 'value' state (string).
 * 2. Return an object compatible with the old syntax hallucinated by the agent.
 */
export function useSimpleExercise(config) {
  const [value, setValue] = useState('');
  
  const adaptiveState = useAdaptiveExerciseOriginal({
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
