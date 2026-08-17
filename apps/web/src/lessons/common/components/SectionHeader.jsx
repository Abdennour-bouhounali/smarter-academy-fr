import React from 'react';

/**
 * SectionHeader — numbered section header used throughout lesson modules.
 *
 * Usage:
 *   <SectionHeader number={1} title="La machine mathématique" color="blue" />
 */
export default function SectionHeader({ number, title, color = 'blue' }) {
  const colorClasses = {
    blue:    'bg-blue-100 text-blue-700',
    indigo:  'bg-indigo-100 text-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    violet:  'bg-violet-100 text-violet-700',
    amber:   'bg-amber-100 text-amber-700',
    sky:     'bg-sky-100 text-sky-700',
    rose:    'bg-rose-100 text-rose-700',
    cyan:    'bg-cyan-100 text-cyan-700',
    purple:  'bg-purple-100 text-purple-700',
    slate:   'bg-slate-100 text-slate-600',
  };
  const badge = colorClasses[color] ?? colorClasses.slate;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-8 h-8 rounded-full font-mono text-sm font-bold flex items-center justify-center shrink-0 ${badge}`}
        aria-hidden="true"
      >
        {number}
      </span>
      <h2 className="text-xl font-space font-bold text-slate-900">{title}</h2>
    </div>
  );
}
