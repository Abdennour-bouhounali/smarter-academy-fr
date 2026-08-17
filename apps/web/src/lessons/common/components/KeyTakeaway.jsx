import React from 'react';

/**
 * KeyTakeaway — the "🔑 À retenir" section at the end of a lesson module.
 *
 * Children are plain JSX bullet points.
 *
 * Usage:
 *   <KeyTakeaway color="indigo">
 *     <li>Une fonction associe à chaque <MathText>$x$</MathText> un unique résultat <MathText>$f(x)$</MathText>.</li>
 *     <li>On note la sortie <MathText>$f(x)$</MathText> (lire : « f de x »).</li>
 *   </KeyTakeaway>
 */
export default function KeyTakeaway({ children, color = 'indigo' }) {
  const colorClasses = {
    indigo:  'bg-indigo-50 border-indigo-200 text-indigo-900 [&_li]:text-indigo-800',
    blue:    'bg-blue-50 border-blue-200 text-blue-900 [&_li]:text-blue-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900 [&_li]:text-emerald-800',
    violet:  'bg-violet-50 border-violet-200 text-violet-900 [&_li]:text-violet-800',
    amber:   'bg-amber-50 border-amber-200 text-amber-900 [&_li]:text-amber-800',
    sky:     'bg-sky-50 border-sky-200 text-sky-900 [&_li]:text-sky-800',
    rose:    'bg-rose-50 border-rose-200 text-rose-900 [&_li]:text-rose-800',
    cyan:    'bg-cyan-50 border-cyan-200 text-cyan-900 [&_li]:text-cyan-800',
    purple:  'bg-purple-50 border-purple-200 text-purple-900 [&_li]:text-purple-800',
  };

  const cls = colorClasses[color] ?? colorClasses.indigo;

  return (
    <section className={`border rounded-3xl p-6 ${cls}`}>
      <h3 className="font-space font-bold mb-3 flex items-center gap-2">
        <span aria-hidden="true">🔑</span> À retenir
      </h3>
      <ul className="text-sm space-y-1.5">
        {children}
      </ul>
    </section>
  );
}
