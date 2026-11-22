import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Deliberately not "Question 7/15" — the diagnostic is variable-length, so
 * a literal count would either be meaningless or, worse, imply a fixed
 * target that keeps moving. This grows with every answered question but
 * caps short of 100% until the engine actually signals completion, which
 * then snaps the bar to full — an honest "still going" signal rather than
 * a precise (and unknowable) fraction.
 */
export default function DiagnosticProgress({ askedCount, complete = false }) {
  const { t } = useTranslation('student');
  const progress = complete ? 1 : Math.min(0.92, askedCount / 18);

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="font-mono-jetbrains text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
        {t('diagnostic.inProgress')}
      </p>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#3B5BDB' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
