import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Medal from './Medal';

/**
 * Le compteur de médailles (or / argent / bronze) — dans le bandeau de la
 * feuille d'examen et sur la page des niveaux. Un compteur qui change « saute ».
 */
export default function MedalTray({ counts, size = 18, className = '', label = null }) {
  const { t } = useTranslation('student');
  if (!counts) return null;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} title={t('practice.medals.trayLabel', counts)} aria-label={t('practice.medals.trayLabel', counts)} data-medal-tray>
      {label && <span className="text-xs font-semibold text-slate-600">{label}</span>}
      {['gold', 'silver', 'bronze'].map((m) => (
        <span key={m} className="inline-flex items-center gap-0.5" data-medal-count={m}>
          <Medal medal={m} size={size} />
          <motion.bdi
            key={counts[m]}
            dir="ltr"
            initial={{ scale: 1.6, color: '#1f5c4c' }}
            animate={{ scale: 1, color: '#0f172a' }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="text-sm font-bold tabular-nums"
          >
            {counts[m] ?? 0}
          </motion.bdi>
        </span>
      ))}
    </span>
  );
}
