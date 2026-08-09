import React from 'react';

/**
 * ExampleBox — a styled box for worked examples.
 *
 * Children are plain JSX. Use inline <MathText> for mathematical notation.
 *
 * Usage:
 *   <ExampleBox title="Exemple : calculer f(3)">
 *     <p>Avec <MathText>$f(x) = 2x + 1$</MathText> et <MathText>$x = 3$</MathText> :</p>
 *     <p className="font-mono font-bold"><MathText>$f(3) = 2 \times 3 + 1 = 7$</MathText></p>
 *   </ExampleBox>
 */
export default function ExampleBox({ title, children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 ${className}`}>
      {title && (
        <p className="font-bold text-slate-800 text-sm">{title}</p>
      )}
      <div className="text-sm text-slate-700 space-y-2">
        {children}
      </div>
    </div>
  );
}
