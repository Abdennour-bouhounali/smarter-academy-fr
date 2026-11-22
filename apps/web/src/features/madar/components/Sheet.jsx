import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Une feuille modale de « مدار » : collée en bas sur téléphone (à portée de
 * pouce), centrée sur ordinateur. Le focus entre dans la feuille ; Échap
 * appelle `onEscape` s'il existe.
 */
export default function Sheet({ labelledBy, onEscape, children, tone = 'default', ...rest }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  useEffect(() => {
    const first = ref.current?.querySelector('[data-autofocus]') ?? ref.current?.querySelector('button');
    first?.focus();
    if (!onEscape) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onEscape(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEscape]);

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-slate-950/40 backdrop-blur-[2px] sm:items-center sm:p-6">
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={reduce ? false : { y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className={`relative max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[32px] p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-white shadow-2xl ring-1 backdrop-blur-xl sm:rounded-[32px] sm:p-6 ${
          tone === 'danger' ? 'bg-gradient-to-b from-rose-950/90 to-slate-950/95 ring-rose-300/20' : 'bg-slate-950/85 ring-white/12'
        }`}
        {...rest}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const primaryBtn = 'flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-6 font-space text-lg font-black text-slate-950 shadow-[0_10px_30px_-10px_rgba(251,146,60,0.8)] transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-50';
export const secondaryBtn = 'flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 font-inter text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50 disabled:opacity-50';
