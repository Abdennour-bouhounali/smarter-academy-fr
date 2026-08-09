import React from 'react';

/**
 * FeedbackBox — displays exercise feedback (success, error, or hint).
 *
 * Children are plain JSX. Use <strong>, <em>, and inline <MathText> as needed.
 * Do NOT pass raw LaTeX or Markdown strings as children.
 *
 * Usage:
 *   <FeedbackBox type="success">
 *     <strong>Exact !</strong> On obtient <MathText>$f(3)=7$</MathText>.
 *   </FeedbackBox>
 *
 *   <FeedbackBox type="error">
 *     Remplacez <MathText>$x$</MathText> par <MathText>$2$</MathText> dans la formule.
 *   </FeedbackBox>
 *
 *   <FeedbackBox type="hint">
 *     Indice : résolvez <MathText>$4x - 3 = 9$</MathText>.
 *   </FeedbackBox>
 */
export default function FeedbackBox({ type = 'hint', children, className = '' }) {
  const styles = {
    success: {
      wrapper: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
      icon: '✓',
    },
    error: {
      wrapper: 'bg-rose-50 border border-rose-200 text-rose-800',
      icon: '✗',
    },
    hint: {
      wrapper: 'bg-amber-50 border border-amber-200 text-amber-800',
      icon: '💡',
    },
  };

  const { wrapper, icon } = styles[type] ?? styles.hint;

  return (
    <div
      className={`flex gap-3 items-start p-4 rounded-xl text-sm ${wrapper} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className="shrink-0 font-bold" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
