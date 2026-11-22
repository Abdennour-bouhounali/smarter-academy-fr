import { motion, useReducedMotion } from 'framer-motion';

const TONES = {
  a: 'bg-blue-500', b: 'bg-violet-500', diff: 'bg-amber-400', rem: 'bg-amber-400', unit: 'bg-emerald-500', ghost: 'bg-slate-200', pgcd: 'bg-rose-500',
};

/**
 * Une GRANDEUR dessinée en longueur, à l'échelle : `value / scale` de la
 * largeur disponible. Deux barres à la même échelle rendent une soustraction
 * ou une division VISIBLES avant tout calcul. `segments` découpe la barre
 * (les copies du diviseur, le reste) ; chaque segment porte son étiquette.
 *
 * La largeur est animée en `scaleX` via framer-motion (une transformation,
 * pas un reflow), désactivée sous prefers-reduced-motion.
 */
export default function QuantityBar({ value, scale, tone = 'a', label, segments, height = 'h-9', className = '', children }) {
  const reduce = useReducedMotion();
  const pct = scale > 0 ? Math.max(0, Math.min(100, (value / scale) * 100)) : 0;
  return (
    <div className={`w-full ${className}`} dir="ltr">
      <div className={`relative w-full ${height} overflow-visible rounded-lg bg-slate-100`}>
        <motion.div
          className={`absolute inset-y-0 left-0 origin-left rounded-lg ${TONES[tone] ?? TONES.a}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
        >
          {segments && (
            <div className="absolute inset-0 flex">
              {segments.map((s, i) => (
                <div key={i} style={{ width: `${(s.value / value) * 100}%` }} className={`relative h-full border-r-2 border-white/80 last:border-r-0 ${s.tone ? TONES[s.tone] : ''} ${i === 0 ? 'rounded-l-lg' : ''} ${i === segments.length - 1 ? 'rounded-r-lg' : ''}`}>
                  {s.label && <span className="absolute inset-0 flex items-center justify-center truncate px-1 font-mono text-[11px] font-bold text-white">{s.label}</span>}
                </div>
              ))}
            </div>
          )}
          {!segments && label && <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-extrabold text-white drop-shadow">{label}</span>}
        </motion.div>
        {children}
      </div>
    </div>
  );
}
