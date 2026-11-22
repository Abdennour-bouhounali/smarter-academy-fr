import { motion, useReducedMotion } from 'framer-motion';
import MathText from '../../components/MathText';

/**
 * Une TRANSFORMATION mathématique : « avant → (opération) → après », LTR,
 * l'« après » entrant quand il apparaît. C'est la trace symbolique d'un geste
 * que l'élève vient de faire (÷ 4, − 140, …) — elle SUIT l'action, ne la
 * précède jamais (§21 du brief).
 */
export default function MathTransformation({ fromTex, opLabel, toTex, tone = 'ok', size = 'md', note, className = '' }) {
  const reduce = useReducedMotion();
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  const T = tone === 'result' ? 'border-amber-300 bg-amber-50' : tone === 'active' ? 'border-blue-300 bg-blue-50' : tone === 'muted' ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50/70';
  return (
    <div className={`rounded-2xl border-2 px-3 py-2 ${T} ${className}`}>
      <div dir="ltr" className={`flex flex-wrap items-center justify-center gap-3 font-mono ${text}`}>
        <MathText>{`$${fromTex}$`}</MathText>
        <span className="flex flex-col items-center text-slate-500">
          <span className="text-xs font-bold" dir="ltr">{opLabel}</span>
          <span aria-hidden="true">⟶</span>
        </span>
        {toTex !== undefined && toTex !== null ? (
          <motion.span initial={reduce ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
            <MathText>{`$${toTex}$`}</MathText>
          </motion.span>
        ) : <span className="text-slate-300">?</span>}
      </div>
      {note && <p className="mt-1 text-center text-xs text-slate-600">{note}</p>}
    </div>
  );
}
