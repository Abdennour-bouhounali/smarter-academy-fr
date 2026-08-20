import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Lightbulb, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * The scripted, deterministic "tutor is speaking" narrator — never an LLM at
 * runtime. A module decides what to say (its own local step/mission content,
 * same as every module already keeps a MISSIONS/QUESTIONS/STEPS array) and
 * hands the string to <TutorGuide>; this component only renders it. Distinct
 * from <Feedback> (a one-off alert row) by design: TutorGuide reads as a
 * persistent guide character (avatar + speech-bubble tail) so the "someone
 * is walking you through this" feeling stays consistent across every lesson
 * world, tone-colored but never color-only (icon + text always both carry
 * the meaning).
 */
const TONES = {
  instruct: {
    bubble: 'bg-slate-800 text-slate-50 border-slate-800',
    avatar: 'bg-slate-800 text-slate-50',
    Icon: Compass,
    prefix: 'Le guide',
  },
  hint: {
    bubble: 'bg-amber-50 text-amber-900 border-amber-300',
    avatar: 'bg-amber-500 text-white',
    Icon: Lightbulb,
    prefix: 'Indice',
  },
  success: {
    bubble: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    avatar: 'bg-emerald-500 text-white',
    Icon: CheckCircle2,
    prefix: 'Bien joué',
  },
  error: {
    bubble: 'bg-rose-50 text-rose-900 border-rose-300',
    avatar: 'bg-rose-500 text-white',
    Icon: RotateCcw,
    prefix: 'Regarde encore',
  },
};

export default function TutorGuide({ tone = 'instruct', children, className = '' }) {
  const t = TONES[tone] || TONES.instruct;
  const { Icon } = t;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      className={`relative flex items-start gap-3 pl-1 ${className}`}
    >
      <span
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${t.avatar}`}
        aria-hidden="true"
      >
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <div className={`relative flex-1 rounded-2xl rounded-tl-sm border px-4 py-3 text-sm leading-relaxed ${t.bubble}`}>
        <span className="sr-only">{t.prefix} : </span>
        {children}
      </div>
    </motion.div>
  );
}
