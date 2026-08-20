import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Lock, Crown } from 'lucide-react';
import { isLessonUnlocked } from '@smarter-academy/core';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';

/**
 * The single lesson-tile renderer shared by the public /courses catalogue
 * and the student area (Mes cours, Explorer) — one place for the
 * available/premium-locked/coming-soon visual states instead of three
 * near-identical inline copies drifting apart.
 *
 * Premium gating goes through `isLessonUnlocked` (packages/core/lessonAccess.js)
 * rather than a local `tier !== 'premium'` check, so that once a real
 * `isPremiumUser` signal exists (subscription entitlement), only the call
 * site here needs to change — not the card markup or the three-state logic.
 *
 * Wrapped in forwardRef: callers render this directly inside
 * <AnimatePresence>, which attaches a ref to measure exit animations —
 * a plain function component can't accept that ref.
 */
const LessonCard = forwardRef(function LessonCard({ lesson, onClick }, ref) {
  const isAvailable = lesson.status === 'available';
  // No subscription/entitlement system exists yet — every student is
  // `isPremiumUser: false` until one is built (see lessonAccess.js).
  const isUnlocked = isLessonUnlocked(lesson, { isPremiumUser: false });
  const { progressPercent } = isAvailable
    ? getLessonProgress(lesson.id, getTotalModules(lesson.id))
    : { progressPercent: 0 };

  if (isAvailable && !isUnlocked) {
    return (
      <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="h-full">
        <Link
          to="/tarifs"
          className="group relative bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-200 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between h-full overflow-hidden"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform origin-bottom-left">{lesson.icon}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-mono-jetbrains text-[10px] font-bold">
                <Crown size={10} />
                Premium
              </span>
            </div>
            <h4 className="font-space font-bold text-slate-800 text-lg mb-2">{lesson.title}</h4>
            <p className="font-inter text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{lesson.description}</p>
          </div>
          <div className="pt-4 border-t border-amber-100 flex items-center justify-between mt-auto">
            <span className="flex items-center gap-1 text-xs font-mono-jetbrains text-slate-500"><Clock size={14} /> {lesson.duration}</span>
            <span className="font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-600">Voir les tarifs →</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (isAvailable) {
    return (
      <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="h-full">
        <Link
          to={lesson.path}
          onClick={onClick}
          className="group relative bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between h-full overflow-hidden"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-3xl group-hover:scale-110 transition-transform origin-bottom-left">{lesson.icon}</span>
              {progressPercent > 0 ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-jetbrains text-[10px] font-bold ${progressPercent >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {progressPercent >= 100 ? '✓ ' : ''}{progressPercent}%
                </span>
              ) : lesson.isNew ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono-jetbrains text-[10px] font-bold">NOUVEAU</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-space font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{lesson.title}</h4>
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" title="Gratuit" />
            </div>
            <p className="font-inter text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{lesson.description}</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
            <span className="flex items-center gap-1 text-xs font-mono-jetbrains text-slate-500"><Clock size={14} /> {lesson.duration}</span>
            <span className={`font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1 ${progressPercent >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {progressPercent >= 100 ? 'Terminé' : progressPercent > 0 ? 'Continuer' : 'Commencer'} →
            </span>
          </div>
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
              <div className={`h-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-slate-50/50 rounded-2xl border border-slate-200/50 p-5 flex flex-col justify-between opacity-75 h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-3xl grayscale opacity-50">{lesson.icon}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/50 text-slate-500 font-mono-jetbrains text-[10px] font-semibold">
            <Lock size={10} />
            Bientôt
          </span>
        </div>
        <h4 className="font-space font-bold text-slate-700 text-lg mb-2">{lesson.title}</h4>
        <p className="font-inter text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">{lesson.description}</p>
      </div>
      <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-mono-jetbrains text-slate-400 mt-auto">
        <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
        <span className="font-medium">En préparation</span>
      </div>
    </motion.div>
  );
});

export default LessonCard;
