import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { progressDots } from '../challengeModel';

const STYLE = {
  correct: 'bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 border-transparent',
  partial: 'bg-sky-100 text-sky-800 border-sky-300',
  wrong: 'bg-rose-50 text-rose-600 border-rose-300',
  current: 'bg-nav-accent text-white border-nav-accent shadow-[0_0_0_4px_rgba(79,70,229,0.15)]',
  pending: 'bg-white text-slate-500 border-slate-300',
};

/**
 * Les pastilles de la séance : une par question, qui s'allument en flamme
 * quand la réponse est juste. Le symbole porte l'état, pas la couleur seule.
 */
export default function ChallengeProgress({ total, answered, current }) {
  const { t } = useTranslation('challenge');
  const dots = progressDots(total, answered, current);

  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label={t('session.progress')}>
      {dots.map((d) => (
        <motion.li
          key={d.position}
          layout
          initial={false}
          animate={{ scale: d.state === 'current' ? 1.08 : 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border text-xs sm:text-sm font-bold ${STYLE[d.state]}`}
          aria-label={`${d.position}: ${t(`session.state.${d.state}`)}`}
          aria-current={d.state === 'current' ? 'step' : undefined}
          data-dot-state={d.state}
        >
          {d.state === 'correct' ? '🔥' : d.symbol}
        </motion.li>
      ))}
    </ol>
  );
}
