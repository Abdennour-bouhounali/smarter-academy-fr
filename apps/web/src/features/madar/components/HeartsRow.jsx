import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { heartSlots } from '../madarModel';

/** Les cœurs : pleins, vides, et celui qui vient d'être gagné bat une fois. */
export default function HeartsRow({ hearts, max, size = 22, pulseIndex = null, className = '' }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  return (
    <div className={`flex items-center gap-1 ${className}`} role="img" aria-label={t('hearts.count', { n: hearts, max })} data-hearts={hearts}>
      {heartSlots(hearts, max).map((full, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          aria-hidden="true"
          initial={false}
          animate={i === pulseIndex && !reduce ? { scale: [1, 1.5, 0.9, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <path
            d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21z"
            fill={full ? '#fb7185' : 'rgba(255,255,255,0.08)'}
            stroke={full ? '#fecdd3' : 'rgba(255,255,255,0.28)'}
            strokeWidth="1.4"
          />
          {full && <path d="M7 8.2c.6-1 1.6-1.5 2.5-1.4" stroke="#fff1f2" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />}
        </motion.svg>
      ))}
    </div>
  );
}
