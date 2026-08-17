import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

/**
 * CalcChain — chaîne de calcul visuelle pour un raisonnement à plusieurs
 * étapes.
 *
 * Chaque maillon doit être NOMMÉ (ce qu'il représente), pas seulement
 * calculé : un enchaînement de nombres sans étiquette n'est pas accepté
 * comme un raisonnement complet dans cette leçon.
 *
 * @param {{label, expr, value, tone}[]} steps  n'affiche que les steps fournis
 *   (le module contrôle la révélation progressive en tronquant le tableau)
 */
const TONE = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', chip: 'bg-indigo-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', chip: 'bg-emerald-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', chip: 'bg-amber-600' },
};

export default function CalcChain({ steps, finalTone = 'emerald' }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const t = TONE[step.tone || (isLast ? finalTone : 'indigo')] || TONE.indigo;
        return (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full max-w-sm rounded-2xl border-2 p-3 text-center ${t.bg} ${t.border}`}
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {step.label}
              </div>
              {step.expr && <div className="font-mono text-sm text-slate-600 mt-0.5">{step.expr}</div>}
              <div className={`font-mono font-extrabold text-xl mt-1 ${t.text}`}>{step.value}</div>
            </motion.div>
            {!isLast && <ArrowDown className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
