import React from 'react';

/**
 * ConceptCard — a styled box for a definition, property, or key concept.
 *
 * Children are plain JSX. Use inline <MathText> for mathematical notation.
 *
 * Usage:
 *   <ConceptCard label="Définition" color="blue">
 *     <p>
 *       Une fonction <strong>affine</strong> s'écrit <MathText>$f(x)=ax+b$</MathText>.
 *     </p>
 *   </ConceptCard>
 */
export default function ConceptCard({ label, emoji, color = 'blue', children, className = '' }) {
  const colorClasses = {
    blue:    'bg-blue-50 border-blue-200 text-blue-700',
    indigo:  'bg-indigo-50 border-indigo-200 text-indigo-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    violet:  'bg-violet-50 border-violet-200 text-violet-700',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    sky:     'bg-sky-50 border-sky-200 text-sky-700',
    rose:    'bg-rose-50 border-rose-200 text-rose-700',
    purple:  'bg-purple-50 border-purple-200 text-purple-700',
    slate:   'bg-slate-50 border-slate-200 text-slate-700',
  };

  const cls = colorClasses[color] ?? colorClasses.slate;

  return (
    <div className={`border rounded-2xl p-5 space-y-3 ${cls} ${className}`}>
      {label && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 text-xs font-mono font-bold border border-current/20">
          {emoji && <span aria-hidden="true">{emoji}</span>}
          {label}
        </div>
      )}
      <div className="text-sm text-slate-700 space-y-2">
        {children}
      </div>
    </div>
  );
}
