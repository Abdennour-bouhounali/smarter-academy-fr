import React from 'react';
import MathText from './MathText';

/**
 * AdaptiveFeedback Component
 * Displays the current feedback (error message or progressive guidance)
 *
 * @param {Object} props
 * @param {string} props.status - 'idle', 'incorrect', 'correct', 'solution_viewed'
 * @param {string|null} props.feedback - specific error message
 * @param {Object|null} props.currentGuidance - The current hint step { type, content }
 * @param {Function} props.onRequestHint - Callback when the student clicks "Besoin d'aide ?"
 * @param {boolean} props.hasMoreHints - Whether there are more hints available
 * @param {boolean} props.canViewSolution - Whether the "Voir la solution" button should be displayed
 * @param {Function} props.onViewSolution - Callback when the student clicks "Voir la solution"
 */
export default function AdaptiveFeedback({ 
  status, 
  feedback, 
  currentGuidance, 
  onRequestHint, 
  hasMoreHints,
  canViewSolution,
  onViewSolution
}) {
  if (status === 'idle' && !feedback && !currentGuidance) {
    return null;
  }

  if (status === 'correct') {
    return (
      <div className="flex gap-3 items-start p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 mt-4" role="status">
        <span className="shrink-0 font-bold" aria-hidden="true">✓</span>
        <span>Excellent ! C'est la bonne réponse. Tu peux continuer.</span>
      </div>
    );
  }

  if (status === 'solution_viewed' && currentGuidance?.type === 'solution') {
    // Show the solution inline, or delegate to a bigger component. Let's show inline for now.
    return (
      <div className="mt-4 p-5 rounded-xl border border-blue-200 bg-blue-50">
        <div className="flex gap-3 items-start">
          <span className="shrink-0 font-bold" aria-hidden="true">📘</span>
          <div className="flex-1">
            <div className="font-bold mb-2 text-blue-800">Solution guidée</div>
            <div className="leading-relaxed text-blue-800">
              {renderContent(currentGuidance.content)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine what message to show
  let content = null;
  let type = 'hint'; // 'hint', 'error'

  if (feedback) {
    type = 'error';
    content = feedback;
  } else if (currentGuidance) {
    type = 'hint';
    content = currentGuidance.content;
  }

  if (!content && type !== 'error') return null; // If status is incorrect but no content, fallback

  const styles = {
    error: {
      wrapper: 'bg-rose-50 border border-rose-200 text-rose-800',
      icon: '❌',
    },
    hint: {
      wrapper: 'bg-amber-50 border border-amber-200 text-amber-800',
      icon: '💡',
    }
  };

  const currentStyle = styles[type] || styles.error;
  const displayContent = content || "Ce n'est pas correct.";

  return (
    <div className={`mt-4 p-4 rounded-xl text-sm border ${currentStyle.wrapper}`} role={type === 'error' ? 'alert' : 'status'}>
      <div className="flex gap-3 items-start">
        <span className="shrink-0 font-bold" aria-hidden="true">{currentStyle.icon}</span>
        <div className="flex-1 leading-relaxed">
          {renderContent(displayContent)}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {hasMoreHints && (
          <button
            type="button"
            onClick={onRequestHint}
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            💡 Besoin d'aide ?
          </button>
        )}
        {canViewSolution && (
          <button
            type="button"
            onClick={onViewSolution}
            className="text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            📘 Voir la solution
          </button>
        )}
      </div>
    </div>
  );
}

// Function to render content that might contain markdown-like math $...$
function renderContent(text) {
  if (typeof text === 'string' && text.includes('$')) {
     return <MathText>{text}</MathText>;
  }
  // if it's an array of steps (for solution), we map it
  if (Array.isArray(text)) {
    return (
      <ol className="space-y-3 mt-2">
        {text.map((step, index) => (
          <li key={index} className="flex gap-2">
            <span className="font-bold">{index + 1}.</span> 
            <span>{typeof step === 'string' && step.includes('$') ? <MathText>{step}</MathText> : step}</span>
          </li>
        ))}
      </ol>
    );
  }
  return text;
}
