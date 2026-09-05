import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

/**
 * GroupBuilder — construire des groupes égaux, un par un.
 *
 * Rend visible la structure « groupes égaux répétés » qui sous-tend une
 * multiplication : on ajoute des groupes de taille fixe et on VOIT le total
 * grandir, plutôt que de partir directement d'un calcul posé.
 *
 * @param {number} perGroup   taille fixe d'un groupe
 * @param {number} groups     nombre de groupes actuellement construits (contrôlé par le parent)
 * @param {(n:number)=>void} onChange
 * @param {number} [max]      nombre maximal de groupes autorisés
 */
export default function GroupBuilder({ perGroup, groups, onChange, max = 12, tone = 'violet', unit = '', disabled = false, icon = null }) {
  const TONE = {
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-400', text: 'text-violet-700' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-400', text: 'text-sky-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', text: 'text-amber-700' },
  };
  const t = TONE[tone] || TONE.violet;
  const total = groups * perGroup;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[88px]">
        {Array.from({ length: groups }, (_, gi) => (
          <motion.div
            key={gi}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex flex-col items-center gap-1 ${t.bg} border-2 ${t.border} rounded-xl p-2 min-w-[3rem]`}
          >
            <div className="flex flex-wrap justify-center gap-0.5 max-w-[72px]">
              {Array.from({ length: Math.min(perGroup, 12) }, (_, oi) => (
                icon ? (
                  <span key={oi} className="text-xl leading-none" aria-hidden="true">{icon}</span>
                ) : (
                  <span key={oi} className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                )
              ))}
            </div>
            <span className={`text-[10px] font-mono font-bold ${t.text}`}>{perGroup}{unit.trim() ? ` ${unit.trim()}` : ''}</span>
          </motion.div>
        ))}
        {groups === 0 && <span className="text-xs text-slate-400 italic self-center">Ajoute un premier groupe.</span>}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, groups - 1))}
          disabled={disabled || groups === 0}
          aria-label="Retirer un groupe"
          className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Minus className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="text-center">
          <div className="font-mono font-extrabold text-lg text-slate-800 tabular-nums" aria-live="polite">
            {groups} groupe{groups > 1 ? 's' : ''} de {perGroup}
          </div>
          <div className="text-xs font-mono text-slate-500">= {total}{unit}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, groups + 1))}
          disabled={disabled || groups >= max}
          aria-label="Ajouter un groupe"
          className="w-11 h-11 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
