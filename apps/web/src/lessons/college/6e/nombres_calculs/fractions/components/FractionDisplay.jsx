import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TONE_TEXT = {
  rose: 'text-rose-600', emerald: 'text-emerald-600', blue: 'text-blue-600',
  amber: 'text-amber-600', indigo: 'text-indigo-600', violet: 'text-violet-600',
};
const TONE_RING = {
  rose: 'ring-rose-300 bg-rose-50', emerald: 'ring-emerald-300 bg-emerald-50',
  blue: 'ring-blue-300 bg-blue-50', amber: 'ring-amber-300 bg-amber-50',
  indigo: 'ring-indigo-300 bg-indigo-50', violet: 'ring-violet-300 bg-violet-50',
};

/**
 * FractionDisplay — the big, physical-looking "n over d" visual that every
 * module updates live as the student manipulates the pizza. Never rendered
 * as inert text: a numerator/denominator change always replays a small
 * count-up animation so the student's action and the symbol change read as
 * cause and effect.
 *
 * highlight: 'numerator' | 'denominator' | null — rings + labels the
 * relevant number so a module can ask "que raconte ce nombre ?" without
 * introducing new UI each time.
 */
export default function FractionDisplay({
  numerator,
  denominator,
  tone = 'rose',
  size = 'lg',
  highlight = null,
  captionTop,
  captionBottom,
  className = '',
}) {
  const numSize = size === 'xl' ? 'text-6xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  const barWidth = size === 'xl' ? 'w-24' : size === 'lg' ? 'w-20' : 'w-12';

  return (
    <div className={`flex flex-col items-center ${className}`} role="text" aria-label={`fraction ${numerator} sur ${denominator}`}>
      {captionTop && <div className="text-[11px] font-mono text-slate-400 mb-1">{captionTop}</div>}
      <div className="flex flex-col items-center font-mono font-extrabold tabular-nums">
        <NumberBox value={numerator} tone={tone} sizeClass={numSize} active={highlight === 'numerator'} label="numérateur — parts sélectionnées" />
        <div className={`${barWidth} h-1.5 rounded-full bg-slate-800 my-1`} aria-hidden="true" />
        <NumberBox value={denominator} tone={tone} sizeClass={numSize} active={highlight === 'denominator'} label="dénominateur — total de parts égales" />
      </div>
      {captionBottom && <div className="text-[11px] font-mono text-slate-400 mt-1 text-center max-w-[10rem]">{captionBottom}</div>}
    </div>
  );
}

function NumberBox({ value, tone, sizeClass, active, label }) {
  const textTone = TONE_TEXT[tone] || TONE_TEXT.rose;
  const ringTone = TONE_RING[tone] || TONE_RING.rose;
  return (
    <div
      className={`px-3 rounded-xl transition-all ${active ? `ring-4 ${ringTone}` : ''}`}
      aria-label={label}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.85 }}
          transition={{ duration: 0.28 }}
          className={`block ${sizeClass} leading-none ${textTone}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
