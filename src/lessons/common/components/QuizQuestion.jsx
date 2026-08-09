import React, { useState } from 'react';
import FeedbackBox from './FeedbackBox';

/**
 * QuizQuestion — reusable multiple-choice question for lesson modules.
 *
 * Handles its own answer state. onCorrect/onWrong callbacks let the parent
 * award XP or update progression.
 *
 * question   — ReactNode: the question text (use MathText inline for math)
 * choices    — Array<{ label: ReactNode, correct: boolean }>
 * successFeedback — ReactNode: shown on correct answer
 * errorFeedback   — ReactNode: shown on wrong answer
 * onCorrect  — () => void: called once on first correct answer
 * onWrong    — () => void: called on each wrong answer (optional)
 * layout     — 'grid' | 'stack' (default: 'grid')
 *
 * Usage:
 *   <QuizQuestion
 *     question={<p>Quelle est l'image de <MathText>$3$</MathText> par <MathText>$f(x)=2x+1$</MathText> ?</p>}
 *     choices={[
 *       { label: <MathText>$7$</MathText>, correct: true },
 *       { label: <MathText>$5$</MathText>, correct: false },
 *       { label: <MathText>$8$</MathText>, correct: false },
 *     ]}
 *     successFeedback={<><strong>Exact !</strong> <MathText>{"$f(3) = 2\\times 3+1=7$"}</MathText>.</>}
 *     errorFeedback={<>Remplacez <MathText>$x$</MathText> par <MathText>$3$</MathText> dans la formule.</>}
 *     onCorrect={() => awardXP({ moduleId: 'L01', exerciseId: 'L01-Q1', amount: 50 })}
 *   />
 */
export default function QuizQuestion({
  question,
  choices = [],
  successFeedback,
  errorFeedback,
  onCorrect,
  onWrong,
  layout = 'grid',
}) {
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleChoice = (choice, index) => {
    if (status === 'success') return; // locked after correct answer

    setSelectedIndex(index);

    if (choice.correct) {
      setStatus('success');
      if (onCorrect) onCorrect();
    } else {
      setStatus('error');
      if (onWrong) onWrong();
    }
  };

  const gridClass = layout === 'stack'
    ? 'flex flex-col gap-2'
    : 'grid grid-cols-2 sm:grid-cols-3 gap-3';

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="text-sm text-slate-700">
        {question}
      </div>

      {/* Choices */}
      <div className={gridClass}>
        {choices.map((choice, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = choice.correct;

          let btnClass = 'p-3 rounded-xl border font-mono font-bold text-sm text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ';

          if (status === null) {
            btnClass += 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800';
          } else if (isCorrect) {
            btnClass += 'border-emerald-400 bg-emerald-50 text-emerald-800';
          } else if (isSelected && !isCorrect) {
            btnClass += 'border-rose-400 bg-rose-50 text-rose-800';
          } else {
            btnClass += 'border-slate-100 bg-white text-slate-400';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleChoice(choice, i)}
              disabled={status === 'success'}
              className={btnClass}
              aria-pressed={isSelected}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {status === 'success' && successFeedback && (
        <FeedbackBox type="success">{successFeedback}</FeedbackBox>
      )}
      {status === 'error' && errorFeedback && (
        <FeedbackBox type="error">{errorFeedback}</FeedbackBox>
      )}
    </div>
  );
}
