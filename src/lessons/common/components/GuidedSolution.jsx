import React from 'react';
import { RotateCcw } from 'lucide-react';
import MathText from './MathText';

/**
 * GuidedSolution Component
 * Displays the complete guided solution step by step when the student has exhausted all hints,
 * and provides a retry button with a new exercise.
 *
 * @param {Object} props
 * @param {Array<string|React.ReactNode>} props.steps - The steps of the solution. If a step contains `$`, it will be parsed by MathText.
 * @param {Function} props.onRetry - Callback to generate a new exercise and reset state.
 */
export default function GuidedSolution({ steps, onRetry }) {
  const renderContent = (text) => {
    if (typeof text === 'string' && text.includes('$')) {
       return <MathText>{text}</MathText>;
    }
    return text;
  };

  return (
    <div className="mt-6 p-5 rounded-xl border-2 border-blue-200 bg-blue-50">
      <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
        <span>📘</span> Solution guidée
      </h3>
      
      <ol className="space-y-3 mb-6 pl-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3 text-slate-700">
            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800 font-bold text-xs mt-0.5">
              {index + 1}
            </span>
            <div className="leading-relaxed">
              {renderContent(step)}
            </div>
          </li>
        ))}
      </ol>

      <div className="pt-4 border-t border-blue-200">
        <p className="text-sm font-semibold text-blue-800 mb-3">
          Tu as vu la méthode. Maintenant, essaie avec un nouvel exemple !
        </p>
        <button
          onClick={onRetry}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw size={18} />
          Nouvel exercice
        </button>
      </div>
    </div>
  );
}
