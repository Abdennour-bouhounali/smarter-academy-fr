import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight } from 'lucide-react';

/**
 * Tap-to-place sequencing — the same touch-first interaction as the
 * lesson-side OrderingGame (tap a card to place it, tap a placed card to
 * remove it; no drag, per that component's own documented reasoning about
 * mobile usability). Deliberately NOT a reuse of OrderingGame itself: that
 * component bakes the correct order in as a `value` per item and validates
 * client-side — appropriate for ungraded lesson practice, wrong for a
 * server-graded diagnostic item (see docs/architecture/DIAGNOSTIC_6E.md).
 * This one only ever captures and reports the built sequence.
 */
export default function OrderingQuestion({ question, onChange, disabled }) {
  const [placed, setPlaced] = useState([]);

  const remaining = question.items.filter((it) => !placed.includes(it.id));
  const byId = (id) => question.items.find((it) => it.id === id);

  const place = (id) => {
    if (disabled) return;
    const next = [...placed, id];
    setPlaced(next);
    onChange(next.length === question.items.length ? { sequence: next } : null);
  };

  const remove = (id) => {
    if (disabled) return;
    const next = placed.filter((x) => x !== id);
    setPlaced(next);
    onChange(null);
  };

  const reset = () => {
    setPlaced([]);
    onChange(null);
  };

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-mono-jetbrains font-bold text-slate-400 uppercase tracking-wider mb-2">
            Cartes à ranger
          </div>
          <div className="flex flex-wrap gap-2 min-h-[56px]">
            {remaining.length === 0 && (
              <span className="text-xs text-slate-400 italic self-center">Toutes les cartes sont placées.</span>
            )}
            {remaining.map((it) => (
              <motion.button
                key={it.id}
                layout
                type="button"
                onClick={() => place(it.id)}
                className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[48px] font-mono-jetbrains font-extrabold text-slate-800 text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`Placer ${it.label}`}
              >
                {it.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono-jetbrains font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ton rangement
          </div>
          <div className="flex flex-wrap items-center gap-1.5 min-h-[64px] p-3 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
            {placed.length === 0 && (
              <span className="text-xs text-slate-400 italic">Touche une carte ci-dessus pour commencer.</span>
            )}
            {placed.map((id, i) => (
              <span key={id} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />}
                <motion.button
                  layout
                  type="button"
                  onClick={() => remove(id)}
                  className="px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white font-mono-jetbrains font-extrabold text-sm sm:text-base text-slate-800 hover:border-slate-400 transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`Retirer ${byId(id).label}`}
                >
                  {byId(id).label}
                </motion.button>
              </span>
            ))}
          </div>
        </div>

        {placed.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-400 font-mono-jetbrains text-xs font-bold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RotateCcw className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" /> Recommencer
          </button>
        )}
      </div>
    </div>
  );
}
