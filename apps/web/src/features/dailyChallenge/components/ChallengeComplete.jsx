import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, BarChart3, Dumbbell, Flame, History, RotateCcw, Zap } from 'lucide-react';
import ArenaPanel from './ArenaPanel';
import ScoreCounter from './ScoreCounter';
import StreakDisplay from './StreakDisplay';
import Leaderboard from './Leaderboard';
import { formatSeconds, rankMovement, scoreParts } from '../challengeModel';
import MathLabel from '../../../lessons/common/components/MathLabel';

const PART_ICON = { accuracy: BarChart3, speed: Zap, streak: Flame, penalty: RotateCcw };

/**
 * L'écran de fin — le plus soigné : le total qui monte, sa décomposition,
 * la justesse, le temps moyen, la série, la place (si l'enseignant l'a
 * ouverte) et UN mouvement de rang seulement s'il a eu lieu, et vers le
 * haut (on ne met personne en scène qui recule). Puis ce qui suit : revoir
 * ses erreurs, une pratique ciblée proposée à partir de la réponse la plus
 * fragile du jour.
 */
export default function ChallengeComplete({ completion }) {
  const { t } = useTranslation('challenge');
  const reduce = useReducedMotion();
  const { attempt, streak, competition, insights } = completion;
  const movement = rankMovement(attempt.rankBefore, attempt.rankAfter);
  const mistakes = attempt.correctCount < attempt.answeredCount || attempt.answeredCount < attempt.questionCount;
  const step = (i) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.35 + i * 0.12, duration: 0.35 } });

  return (
    <div className="space-y-4" data-challenge-complete>
      <ArenaPanel className="p-6 text-center sm:p-10">
        <motion.p initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 font-space text-sm font-black text-amber-700 ring-1 ring-amber-200">
          <Flame size={16} aria-hidden="true" /> {attempt.status === 'expired' ? t('complete.expiredTitle') : t('complete.title')}
        </motion.p>

        <h1 className="mt-5 text-slate-900">
          <ScoreCounter value={attempt.score.total} className="block font-space text-6xl font-black leading-none sm:text-7xl" />
          <span className="mt-1 block font-inter text-sm text-slate-500">{t('complete.points')}</span>
        </h1>

        <motion.ul {...step(0)} className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2" data-score-parts>
          {scoreParts(attempt.score).map((p) => {
            const Icon = PART_ICON[p.key];
            return (
              <li key={p.key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono-jetbrains text-sm font-bold ${p.value < 0 ? 'bg-slate-50 text-slate-500' : 'bg-slate-100 text-slate-900'}`}>
                <Icon size={14} aria-hidden="true" className={p.key === 'streak' ? 'text-amber-500' : p.key === 'speed' ? 'text-cyan-600' : ''} />
                <span dir="ltr">{p.value > 0 ? `+${p.value}` : p.value}</span> {t(`complete.parts.${p.key}`)}
              </li>
            );
          })}
        </motion.ul>

        <motion.dl {...step(1)} className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="font-inter text-[11px] text-slate-500">✓</dt>
            <dd className="font-space text-xl font-black text-slate-900" data-correct-of><span dir="ltr">{attempt.correctCount}{'\u00A0/\u00A0'}{attempt.questionCount}</span> {t('complete.correct')}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="font-inter text-[11px] text-slate-500">⚡ {t('complete.averageTime')}</dt>
            <dd className="font-space text-xl font-black text-slate-900" dir="ltr">{t('complete.seconds', { value: formatSeconds(attempt.averageResponseTimeMs) })}</dd>
          </div>
        </motion.dl>

        {competition?.myRank && (
          <motion.div {...step(2)} className="mx-auto mt-5 max-w-xs rounded-3xl bg-slate-50 p-4" data-class-position>
            <p className="font-inter text-xs text-slate-500">{t('complete.classPosition')}</p>
            <p className="font-space text-5xl font-black text-slate-900" dir="ltr">#{competition.myRank.rank}</p>
            {movement?.direction === 'up' && (
              <motion.p initial={reduce ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduce ? 0 : 1, type: 'spring' }}
                className="mt-1 inline-flex items-center gap-1 font-inter text-sm font-bold text-emerald-600" data-moved-up={movement.places}>
                <ArrowUp size={16} aria-hidden="true" /> {t('complete.movedUp', { count: movement.places })}
              </motion.p>
            )}
          </motion.div>
        )}
      </ArenaPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <ArenaPanel className="p-5"><StreakDisplay streak={streak} /><p className="mt-3 font-inter text-xs text-slate-500">{t('complete.comeBack')}</p></ArenaPanel>
        {competition?.showTop3 ? <ArenaPanel className="p-1"><Leaderboard competition={competition} /></ArenaPanel> : (
          <Insights insights={insights} />
        )}
      </div>
      {competition?.showTop3 && <Insights insights={insights} />}

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
        <Link to={`/espace/defi/${attempt.id}`} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-nav-accent px-6 font-space font-black text-white hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300" data-review-link>
          <RotateCcw size={18} aria-hidden="true" /> {mistakes ? t('complete.reviewMistakes') : t('complete.review')}
        </Link>
        <Link to="/espace/progression" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-6 font-space font-bold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          <BarChart3 size={18} aria-hidden="true" /> {t('complete.viewProgress')}
        </Link>
        <Link to="/espace/defi/historique" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 font-inter font-semibold text-slate-600 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          <History size={18} aria-hidden="true" /> {t('complete.history')}
        </Link>
      </div>
    </div>
  );
}

function Insights({ insights }) {
  const { t } = useTranslation('challenge');
  if (!insights) return null;
  const { weakest = [], slowCorrect = [], suggestion } = insights;

  return (
    <section className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200" aria-labelledby="dc-insights" data-insights>
      <h2 id="dc-insights" className="font-space text-base font-bold text-slate-900">{t('complete.insightsTitle')}</h2>
      {weakest.length === 0 && slowCorrect.length === 0 && <p className="mt-2 font-inter text-sm text-slate-600">{t('complete.allGood')}</p>}
      {weakest[0] && (
        <p className="mt-3 font-inter text-sm text-slate-700"><span className="font-semibold text-rose-700">{t('complete.weakest')}: </span><MathLabel>{weakest[0].title}</MathLabel></p>
      )}
      {slowCorrect[0] && (
        <p className="mt-1 font-inter text-sm text-slate-700"><span className="font-semibold text-amber-700">{t('complete.slowCorrect')}: </span>{slowCorrect.map((p, i) => <span key={p.code ?? i}>{i > 0 && ' · '}<MathLabel>{p.title}</MathLabel></span>)}</p>
      )}
      {suggestion?.lessonCode && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-nav-accent-soft p-3">
          <p className="min-w-0 flex-1 font-inter text-sm text-indigo-900">{t('complete.suggestion', { title: suggestion.learningPointTitle })}</p>
          <Link to={`/espace/pratique/${suggestion.lessonCode}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-nav-accent px-4 font-inter text-sm font-bold text-white hover:bg-[#3350c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" data-practice-suggestion>
            <Dumbbell size={16} aria-hidden="true" /> {t('complete.practiceNow')}
          </Link>
        </div>
      )}
    </section>
  );
}
