import React from 'react';
import { motion } from 'framer-motion';

/**
 * BarModel — schéma en barres (part-tout / comparaison).
 *
 * Rend visible une relation entre quantités : combiner (segments mis bout à
 * bout), comparer (deux barres alignées, l'écart apparaît), ou retirer
 * (segment barré/grisé). C'est un composant d'AFFICHAGE : la construction
 * pas à pas se pilote depuis le module appelant (boutons, compteurs...) qui
 * lui passe la liste de segments à un instant donné.
 *
 * @param {{label, segments: {value, tone, text, removed, unknown}[]}[]} bars
 * @param {number} [maxValue] échelle commune à toutes les barres (auto si absent)
 */
const TONE = {
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
  slate: 'bg-slate-300',
};

export default function BarModel({ bars, maxValue, unit = '' }) {
  const scale = maxValue || Math.max(1, ...bars.map((b) => b.segments.reduce((s, seg) => s + seg.value, 0)));

  return (
    <div className="space-y-3">
      {bars.map((bar, bi) => {
        const total = bar.segments.reduce((s, seg) => s + (seg.removed ? 0 : seg.value), 0);
        return (
          <div key={bar.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
              <span>{bar.label}</span>
              <span className="text-slate-700">
                {total !== null && !bar.hideTotal ? `${total}${unit}` : ''}
              </span>
            </div>
            <div className="flex h-10 sm:h-11 rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-50" role="img" aria-label={`${bar.label} : ${total}${unit}`}>
              {bar.segments.map((seg, si) => {
                const widthPct = Math.max((seg.value / scale) * 100, 4);
                if (seg.unknown) {
                  return (
                    <div
                      key={si}
                      style={{ width: `${widthPct}%` }}
                      className="flex items-center justify-center border-r-2 border-dashed border-slate-400 bg-white/60 last:border-r-0"
                    >
                      <span className="text-slate-400 font-mono font-extrabold text-lg">?</span>
                    </div>
                  );
                }
                return (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ width: `${widthPct}%` }}
                    className={`flex items-center justify-center border-r-2 border-white/70 last:border-r-0 relative ${
                      TONE[seg.tone] || TONE.sky
                    } ${seg.removed ? 'opacity-30' : ''}`}
                  >
                    <span className={`text-[11px] sm:text-xs font-mono font-bold text-white px-1 truncate ${seg.removed ? 'line-through' : ''}`}>
                      {seg.text ?? seg.value}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
