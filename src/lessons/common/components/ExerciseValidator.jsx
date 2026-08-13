import React from 'react';
import AdaptiveFeedback from './AdaptiveFeedback';

/**
 * ExerciseValidator - A generic wrapper to display validation feedback and buttons
 * 
 * @param {Object} props
 * @param {boolean} [props.disabled] - If true, disables the Verify button
 * @param {Function} props.onSubmit - Function to call on Verify
 * @param {Object} props.adaptiveState - The object returned by useAdaptiveExercise
 * @param {string} [props.buttonText="Vérifier"] - Text for the verify button
 * @param {React.ReactNode} props.children - The fields to render
 */
export default function ExerciseValidator({
  disabled,
  onSubmit,
  adaptiveState,
  buttonText = "Vérifier",
  children
}) {
  const {
    status,
    attempts,
    specificFeedback,
    currentGuidance,
    hasMoreHints,
    canViewSolution,
    requestHint,
    viewSolution
  } = adaptiveState;

  const isIdle = status === 'idle';
  const isCorrect = status === 'correct';
  const isSolutionViewed = status === 'solution_viewed';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <div className="space-y-4">
      {/* Inputs area */}
      <div className="flex flex-col gap-4">
        {children}
      </div>

      {/* Action button */}
      {!isCorrect && (
        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {buttonText}
          </button>
        </div>
      )}

      {/* Adaptive Feedback display */}
      <AdaptiveFeedback
        status={status}
        feedback={specificFeedback}
        currentGuidance={currentGuidance}
        onRequestHint={requestHint}
        hasMoreHints={hasMoreHints}
        canViewSolution={canViewSolution}
        onViewSolution={viewSolution}
      />
    </div>
  );
}
