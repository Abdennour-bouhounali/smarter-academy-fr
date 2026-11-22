import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Medal from './Medal';
import { MEDAL_POINTS } from '../exam/medals';

/**
 * LA CÉLÉBRATION d'une médaille (propriétaire, 2026-10-06) : la médaille entre
 * en tournant, un reflet la traverse, l'or fait jaillir des confettis ; un mot
 * dit POURQUOI (« دون إرشاد وفي الوقت ») et ce qu'elle rapporte (+3). Elle ne
 * bloque rien (`pointer-events: none`) et s'efface seule. Annoncée une fois
 * (`aria-live`), sans animation en mouvement réduit.
 *
 * `award` = { id, medal, reason } — `id` change à chaque médaille.
 */
const CONFETTI = ['#f5c518', '#006233', '#d21034', '#1f5c4c', '#fde68a', '#ffffff'];

export default function MedalCelebration({ award, onDone }) {
  const { t } = useTranslation('student');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!award) return undefined;
    const id = window.setTimeout(() => onDone?.(), reduced ? 1800 : 2600);
    return () => window.clearTimeout(id);
  }, [award, onDone, reduced]);

  const bits = useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.2;
    const dist = 90 + (i % 5) * 18;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 20, rot: (i * 47) % 360, color: CONFETTI[i % CONFETTI.length], round: i % 2 === 0 };
  }), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex justify-center" aria-live="polite" data-medal-celebration>
      <AnimatePresence>
        {award && (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative flex items-center gap-4 rounded-2xl bg-white/95 px-5 py-3 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-200 backdrop-blur"
            data-award={award.medal}
          >
            {award.medal === 'gold' && !reduced && (
              <span className="absolute start-10 top-1/2" aria-hidden="true">
                {bits.map((b, i) => (
                  <motion.span
                    key={i}
                    className={`absolute block h-2 w-2 ${b.round ? 'rounded-full' : 'rounded-[2px]'}`}
                    style={{ backgroundColor: b.color }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
                    animate={{ x: b.x, y: b.y + 40, opacity: 0, rotate: b.rot, scale: 1 }}
                    transition={{ duration: 1.3, ease: 'easeOut', delay: 0.25 }}
                  />
                ))}
              </span>
            )}
            <motion.span
              initial={reduced ? false : { rotateY: 540, scale: 0.3 }}
              animate={{ rotateY: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
            >
              <Medal medal={award.medal} size={58} shine title={t(`practice.medals.name.${award.medal}`)} />
            </motion.span>
            <span className="space-y-0.5">
              <span className="block text-lg font-bold text-slate-900">{t(`practice.medals.won.${award.medal}`)}</span>
              <span className="block text-sm text-slate-600">{t(`practice.medals.reason.${award.reason}`)}</span>
              <motion.span
                className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200"
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 15 }}
              >
                <bdi dir="ltr">+{MEDAL_POINTS[award.medal]}</bdi> {t('practice.medals.points')}
              </motion.span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
