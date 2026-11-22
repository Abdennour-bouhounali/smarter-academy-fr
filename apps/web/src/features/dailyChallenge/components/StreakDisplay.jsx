import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { STREAK_DAY_SYMBOL } from '../challengeModel';

const DAY_STYLE = {
  completed: 'bg-amber-400 text-slate-950 border-amber-300',
  missed: 'bg-rose-50 text-rose-600 border-rose-300 border-dashed',
  today: 'bg-white text-nav-accent border-nav-accent ring-2 ring-amber-300',
  rest: 'bg-slate-100 text-slate-500 border-transparent',
  none: 'bg-white text-slate-500 border-slate-200',
};

/**
 * « سلسلتك » : la flamme, le nombre de jours, et la frise des derniers jours
 * de défi. Chaque état a son SYMBOLE (✓ ✕ ● – ○) et son nom lu à voix
 * haute : la couleur n'est jamais la seule information.
 */
export default function StreakDisplay({ streak, compact = false }) {
  const { t } = useTranslation('challenge');
  if (!streak) return null;
  const days = compact ? streak.days.slice(-7) : streak.days;

  return (
    <section aria-label={t('streak.title')} data-streak>
      <div className="flex items-center gap-3">
        <span className={`grid place-items-center rounded-2xl ${streak.current > 0 ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950' : 'bg-slate-100 text-slate-500'} ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}>
          <Flame size={compact ? 20 : 24} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-inter text-[11px] uppercase tracking-wide text-slate-500">{t('streak.title')}</p>
          <p className={`font-space font-black text-slate-900 ${compact ? 'text-lg' : 'text-2xl'}`} data-streak-current={streak.current}>
            {streak.current > 0 ? t('streak.days', { count: streak.current }) : t('streak.startToday')}
          </p>
        </div>
        {!compact && streak.best > 0 && (
          <p className="ms-auto font-inter text-xs text-slate-500">{t('streak.best', { count: streak.best })}</p>
        )}
      </div>

      {/* La frise occupe toute la largeur : 7 jours sur téléphone, 14 dès sm.
          Ordre de la page (RTL) : le plus ancien à droite, aujourd'hui à gauche. */}
      <ol className="mt-3 flex justify-between gap-1" aria-label={t('streak.calendar')}>
        {days.map((d, i) => (
          <li key={d.date} className={`${!compact && i < days.length - 7 ? 'hidden sm:flex' : 'flex'} min-w-0 flex-col items-center gap-1`}>
            <span className="font-inter text-[10px] text-slate-500" aria-hidden="true">{t(`streak.weekday.${d.weekday}`)}</span>
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-bold lg:h-8 lg:w-8 lg:text-sm ${DAY_STYLE[d.state] ?? DAY_STYLE.none}`}
              aria-label={`${d.date}: ${t(`streak.state.${d.state}`)}`}
              data-day-state={d.state}
            >
              {STREAK_DAY_SYMBOL[d.state] ?? '○'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
