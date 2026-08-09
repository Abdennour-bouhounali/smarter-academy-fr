import { useState, useCallback } from 'react';

/**
 * useAdaptiveExercise - A hook for managing progressive guidance and error feedback.
 * 
 * @param {Object} config
 * @param {Function} config.validate - (value) => boolean, returns true if the answer is completely correct.
 * @param {Function} [config.detectError] - (value) => { message: string } | null, returns a specific error message if a known error is detected.
 * @param {Array} config.guidanceSteps - Array of step objects: { level, type, content }. 
 *                                       Types can be 'encouragement', 'hint', 'guided', 'partial', 'solution'.
 * @param {Function} [config.onSuccess] - Callback when the answer is validated as correct.
 */
export function useAdaptiveExercise({ validate, detectError, guidanceSteps, onSuccess }) {
  const [status, setStatus] = useState('idle'); // 'idle', 'error', 'correct'
  const [attempts, setAttempts] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null); // specific error feedback or generic
  const [value, setValue] = useState('');

  const submitAnswer = useCallback((val) => {
    setValue(val);
    if (validate(val)) {
      setStatus('correct');
      setFeedback(null);
      if (onSuccess) onSuccess();
      return true;
    }

    // Incorrect answer
    setStatus('error');
    setAttempts((prev) => prev + 1);

    // Check for specific detectable errors
    if (detectError) {
      const specificError = detectError(val);
      if (specificError) {
        setFeedback(specificError.message);
        return false;
      }
    }

    // If no specific error, we clear specific feedback so the UI shows the current generic hint or encouragement
    setFeedback(null);
    
    // Automatically advance the hint level if we don't have a specific error,
    // or just let them use the "Besoin d'aide" button.
    // According to the prompt: "Pour les plus jeunes, le premier indice peut apparaître automatiquement".
    if (currentStepIndex === -1 && guidanceSteps && guidanceSteps.length > 0) {
      setCurrentStepIndex(0);
    }
    
    return false;
  }, [validate, detectError, onSuccess, guidanceSteps, currentStepIndex]);

  const requestHint = useCallback(() => {
    if (guidanceSteps && currentStepIndex < guidanceSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [guidanceSteps, currentStepIndex]);

  const reset = useCallback(() => {
    setStatus('idle');
    setAttempts(0);
    setCurrentStepIndex(-1);
    setFeedback(null);
    setValue('');
  }, []);

  const getCurrentGuidance = () => {
    if (currentStepIndex >= 0 && guidanceSteps && currentStepIndex < guidanceSteps.length) {
      return guidanceSteps[currentStepIndex];
    }
    return null;
  };

  return {
    value,
    setValue,
    status,
    attempts,
    currentStepIndex,
    feedback, // specific error message
    currentGuidance: getCurrentGuidance(), // the current progressive hint
    submitAnswer,
    requestHint,
    reset,
    hasMoreHints: guidanceSteps ? currentStepIndex < guidanceSteps.length - 1 : false,
    isSolutionRevealed: getCurrentGuidance()?.type === 'solution'
  };
}
