import { useState } from 'react';
import { motion } from 'framer-motion';

// The only classification archetype in the v1 6e bank is "useful vs not
// useful information" (see problemes.resolution's prb-01) — bin labels are
// hardcoded rather than sent by the backend. If a future grade needs a
// different classification shape, the public question DTO gains bin
// metadata then; not built speculatively now.
const BINS = [
  { id: 'useful', label: 'Utile' },
  { id: 'not_useful', label: 'Pas utile' },
];

/**
 * Tap-to-select, tap-a-bin — the same interaction as the lesson-side
 * InfoSorter, but NOT a reuse of it: InfoSorter's `items` prop bakes in
 * each card's correct bin (`useful: boolean`) and validates client-side,
 * which would hand a diagnostic student the answer key in the page's own
 * props. This component never receives correctness — it only captures and
 * reports the student's assignments.
 */
export default function ClassificationQuestion({ question, onChange, disabled }) {
  const [assignments, setAssignments] = useState({});
  const [selected, setSelected] = useState(null);

  const pool = question.items.filter((it) => !assignments[it.id]);
  const inBin = (binId) => question.items.filter((it) => assignments[it.id] === binId);

  const assign = (binId) => {
    if (selected === null || disabled) return;
    const next = { ...assignments, [selected]: binId };
    setAssignments(next);
    setSelected(null);
    const complete = question.items.every((it) => next[it.id]);
    onChange(complete ? { assignments: next } : null);
  };

  const unassign = (id) => {
    if (disabled) return;
    const next = { ...assignments };
    delete next[id];
    setAssignments(next);
    onChange(null);
  };

  return (
    <div className={`space-y-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      {pool.length > 0 && (
        <div>
          <div className="text-[11px] font-mono-jetbrains font-bold text-slate-400 uppercase tracking-wider mb-2">
            Touche une information, puis un bac
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map((it) => (
              <motion.button
                key={it.id}
                layout
                type="button"
                onClick={() => setSelected(it.id)}
                aria-pressed={selected === it.id}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left max-w-[260px] transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selected === it.id
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {it.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BINS.map((bin) => (
          <div
            key={bin.id}
            role="button"
            tabIndex={0}
            onClick={() => assign(bin.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') assign(bin.id);
            }}
            className={`rounded-2xl border-2 border-dashed p-3 min-h-[100px] space-y-1.5 transition-colors ${
              selected !== null ? 'border-blue-400 bg-blue-50/50 cursor-pointer' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-mono-jetbrains font-bold text-slate-500 uppercase tracking-wider">{bin.label}</div>
            {inBin(bin.id).map((it) => (
              <motion.button
                key={it.id}
                type="button"
                layout
                onClick={(e) => {
                  e.stopPropagation();
                  unassign(it.id);
                }}
                className="w-full text-left px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-sm text-slate-700 hover:opacity-80 transition-colors"
              >
                {it.text}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
