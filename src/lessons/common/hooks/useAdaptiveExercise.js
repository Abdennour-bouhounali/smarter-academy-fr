import { useState, useCallback } from 'react';

/**
 * useAdaptiveExercise - A hook for managing progressive guidance, specific error feedback, and multiple field validation.
 * 
 * @param {Object} config
 * @param {Function} config.validate - (values) => { isCorrect: boolean, fields?: { [key]: boolean }, feedback?: string }
 * @param {Array} config.guidanceSteps - Array of step objects: { type: 'hint' | 'solution', content: ReactNode }.
 * @param {Function} [config.onSuccess] - Callback when the answer is completely correct.
 */
export function useAdaptiveExercise({ validate, guidanceSteps = [], onSuccess }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'incorrect' | 'correct' | 'solution_viewed'
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0); // 0 means no generic hint shown yet
  const [fieldStatuses, setFieldStatuses] = useState({}); // { fieldName: boolean (true=correct, false=incorrect) }
  const [specificFeedback, setSpecificFeedback] = useState(null); // specific error message if any

  const submitAnswer = useCallback((values) => {
    const result = validate(values);
    
    if (result.fields) {
      setFieldStatuses(prev => ({
        ...prev,
        ...result.fields
      }));
    } else {
      // If no fields object provided, assume single global field
      setFieldStatuses({ global: result.isCorrect });
    }

    if (result.isCorrect) {
      setStatus('correct');
      setSpecificFeedback(null);
      if (onSuccess) onSuccess();
      return true;
    }

    // Incorrect answer
    setStatus('incorrect');
    setAttempts(prev => prev + 1);

    if (result.feedback) {
      setSpecificFeedback(result.feedback);
    } else {
      setSpecificFeedback(null);
      // Auto-advance hint if there is no specific feedback and we are at level 0
      if (hintLevel === 0 && guidanceSteps.length > 0) {
        setHintLevel(1);
      }
    }

    return false;
  }, [validate, onSuccess, hintLevel, guidanceSteps.length]);

  const requestHint = useCallback(() => {
    if (hintLevel < guidanceSteps.length) {
      setHintLevel(prev => prev + 1);
    }
  }, [hintLevel, guidanceSteps.length]);

  const viewSolution = useCallback(() => {
    setStatus('solution_viewed');
    setHintLevel(guidanceSteps.length); // Assuming last step is solution
  }, [guidanceSteps.length]);

  const reset = useCallback(() => {
    setStatus('idle');
    setAttempts(0);
    setHintLevel(0);
    setFieldStatuses({});
    setSpecificFeedback(null);
  }, []);

  const currentGuidance = hintLevel > 0 && hintLevel <= guidanceSteps.length 
    ? guidanceSteps[hintLevel - 1] 
    : null;

  return {
    status,
    attempts,
    fieldStatuses,
    specificFeedback,
    currentGuidance,
    hasMoreHints: hintLevel < guidanceSteps.length && guidanceSteps[hintLevel]?.type !== 'solution',
    canViewSolution: guidanceSteps.length > 0 && status === 'incorrect' && hintLevel > 0 && guidanceSteps[guidanceSteps.length - 1].type === 'solution' && status !== 'solution_viewed',
    submitAnswer,
    requestHint,
    viewSolution,
    reset,
  };
}
