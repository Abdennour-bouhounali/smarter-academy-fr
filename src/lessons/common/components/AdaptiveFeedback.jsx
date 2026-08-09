import React from 'react';
import MathText from './MathText';

/**
 * AdaptiveFeedback Component
 * Displays the current feedback (error message or progressive guidance)
 * 
 * @param {Object} props
 * @param {string} props.status - 'idle', 'error', 'correct'
 * @param {string|null} props.feedback - specific error message
 * @param {Object|null} props.currentGuidance - The current hint step { type, content }
 * @param {Function} props.onRequestHint - Callback when the student clicks "Besoin d'aide ?"
 * @param {boolean} props.hasMoreHints - Whether there are more hints available
 */
export default function AdaptiveFeedback({ status, feedback, currentGuidance, onRequestHint, hasMoreHints }) {
  if (status === 'idle' && !feedback && !currentGuidance) {
    return null;
  }

  if (status === 'correct') {
    return (
      <div className="flex gap-3 items-start p-4 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 mt-4" role="status">
        <span className="shrink-0 font-bold" aria-hidden="true">✓</span>
        <span>Excellent ! C'est la bonne réponse.</span>
      </div>
    );
  }

  // Determine what message to show
  let content = null;
  let type = 'hint'; // 'hint', 'error', 'solution'

  if (feedback) {
    // Show specific error feedback if available
    type = 'error';
    content = feedback;
  } else if (currentGuidance) {
    // Show current progressive hint
    type = currentGuidance.type === 'solution' ? 'solution' : 'hint';
    content = currentGuidance.content;
  }

  if (!content) return null;

  const styles = {
    error: {
      wrapper: 'bg-rose-50 border border-rose-200 text-rose-800',
      icon: '❌',
    },
    hint: {
      wrapper: 'bg-amber-50 border border-amber-200 text-amber-800',
      icon: '💡',
    },
    solution: {
      wrapper: 'bg-blue-50 border border-blue-200 text-blue-800',
      icon: '📘',
    }
  };

  const currentStyle = styles[type] || styles.hint;

  // Function to render content that might contain markdown-like math $...$
  const renderContent = (text) => {
    // If it's a string containing $, use MathText
    if (typeof text === 'string' && text.includes('$')) {
       return <MathText>{text}</MathText>;
    }
    return text;
  };

  return (
    <div className={`mt-4 p-4 rounded-xl text-sm border ${currentStyle.wrapper}`} role={type === 'error' ? 'alert' : 'status'}>
      <div className="flex gap-3 items-start">
        <span className="shrink-0 font-bold" aria-hidden="true">{currentStyle.icon}</span>
        <div className="flex-1">
          {type === 'solution' && <div className="font-bold mb-2">Solution guidée</div>}
          <div className="leading-relaxed">
            {renderContent(content)}
          </div>
        </div>
      </div>
      
      {hasMoreHints && type !== 'solution' && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onRequestHint}
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            💡 Besoin d'aide ?
          </button>
        </div>
      )}
    </div>
  );
}
