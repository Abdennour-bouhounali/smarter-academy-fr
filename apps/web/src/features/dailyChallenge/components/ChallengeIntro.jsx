import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, History, Info, Play, Trophy } from 'lucide-react';
import ArenaPanel from './ArenaPanel';
import StreakDisplay from './StreakDisplay';
import Leaderboard from './Leaderboard';
import { reasonKey } from '../challengeModel';

/**
 * L'écran d'avant : ce qui attend l'élève (nombre de questions, durée,
 * points possibles), sa série, son cumul, son meilleur jour, sa place si
 * l'enseignant l'a ouverte — et UN bouton.
 */
export default function ChallengeIntro({ today, onStart, onSeeResult, busy }) {
  const { t } = useTranslation('challenge');
  const reduce = useReducedMotion();
  const challenge = today.challenge;
  const attempt = today.attempt;
  const finished = attempt && attempt.status !== 'in_progress';
  const inProgress = attempt?.status === 'in_progress';
  const myRank = today.competition?.myRank;

  const enter = (delay) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay } });

  return (
    <div className="space-y-4" data-challenge-intro>
      <ArenaPanel className="p-5 sm:p-8" data-tour="challenge.mission">
        <motion.div {...enter(0)} className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-inter text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            <Flame size={14} aria-hidden="true" /> {t('brand')}
          </span>
          <span className="font-inter text-xs text-slate-500">
            {today.scope?.classroom ? t('intro.classScope', { name: today.scope.classroom.name }) : t('intro.personal')}
          </span>
        </motion.div>

        <motion.div {...enter(0.05)} className="mt-6 text-center">
          <p className="font-inter text-sm text-slate-500">{t('intro.missionLabel')}</p>
          <h1 className="mt-1 font-space text-3xl font-black leading-tight text-slate-900 sm:text-5xl">{t('intro.mission')}</h1>
          <p className="mx-auto mt-2 max-w-md font-inter text-sm text-slate-600">{t('intro.missionHint')}</p>
        </motion.div>

        {today.available && challenge && (
          <motion.dl {...enter(0.1)} className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 p-3">
              <dt className="sr-only">{t('intro.questions', { count: challenge.questionCount })}</dt>
              <dd className="font-space text-2xl font-black text-slate-900 sm:text-3xl" dir="ltr" aria-hidden="true">{challenge.questionCount}</dd>
              <dd className="font-inter text-[11px] text-slate-500" aria-hidden="true">{t('intro.questionsLabel')}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <dt className="sr-only">{t('intro.minutes', { count: challenge.estimatedMinutes })}</dt>
              <dd className="font-space text-2xl font-black text-slate-900 sm:text-3xl" dir="ltr" aria-hidden="true">~{challenge.estimatedMinutes}</dd>
              <dd className="font-inter text-[11px] text-slate-500" aria-hidden="true">{t('intro.minutesLabel')}</dd>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 ring-1 ring-amber-200">
              <dt className="sr-only">{t('intro.possibleLabel')}</dt>
              <dd className="font-space text-2xl font-black text-amber-700 sm:text-3xl" dir="ltr">+{challenge.maxPossible}</dd>
              <dd className="font-inter text-[11px] text-amber-800/80">{t('intro.possibleLabel')}</dd>
            </div>
          </motion.dl>
        )}

        <motion.div {...enter(0.15)} className="mt-7 flex flex-col items-center gap-2">
          {!today.available && !finished && (
            <p role="status" className="max-w-md rounded-2xl bg-slate-50 px-4 py-3 text-center font-inter text-sm text-slate-700" data-unavailable={today.reason}>
              {t(`reasons.${reasonKey(today.reason)}`, today.window ?? {})}
            </p>
          )}
          {finished ? (
            <>
              <p className="font-space text-lg font-bold text-slate-900">✓ {t('intro.done')}</p>
              <p className="font-inter text-sm text-slate-500">{t('intro.doneHint')}</p>
              <button type="button" onClick={onSeeResult} disabled={busy}
                className="mt-2 inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-nav-accent px-7 font-space text-base font-black text-white transition hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 disabled:opacity-60">
                <Trophy size={18} aria-hidden="true" /> {t('intro.seeResult')}
              </button>
            </>
          ) : today.available && (
            <motion.button
              type="button"
              onClick={onStart}
              disabled={busy}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-[60px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 px-8 font-space text-lg font-black text-slate-950 shadow-lg shadow-orange-500/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-60"
              data-start
            >
              <Play size={20} aria-hidden="true" /> {inProgress ? t('intro.resume') : t('intro.start')}
            </motion.button>
          )}
          {today.available && challenge && !finished && (
            <p className="font-inter text-xs text-slate-500">{t('intro.windowMinutes', { minutes: challenge.attemptWindowMinutes })}</p>
          )}
        </motion.div>
      </ArenaPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <ArenaPanel className="p-5" data-tour="challenge.score">
          <StreakDisplay streak={today.streak} />
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <dt className="font-inter text-[11px] text-slate-500">{t('intro.cumulative')}</dt>
              <dd className="font-space text-xl font-black" dir="ltr" data-cumulative>{today.cumulativeScore.toLocaleString('fr-FR')}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <dt className="font-inter text-[11px] text-slate-500">{t('intro.best')}</dt>
              <dd className="font-space text-xl font-black" dir="ltr">{today.personalBest.toLocaleString('fr-FR')}</dd>
            </div>
            {myRank && (
              <div className="rounded-2xl bg-slate-50 p-3">
                <dt className="font-inter text-[11px] text-slate-500">{t('intro.classPosition')}</dt>
                <dd className="font-space text-xl font-black" dir="ltr">#{myRank.rank}</dd>
              </div>
            )}
          </dl>
        </ArenaPanel>

        {today.competition?.enabled ? (
          <ArenaPanel className="p-1"><Leaderboard competition={today.competition} /></ArenaPanel>
        ) : (
          <ArenaPanel className="p-5">
            <details className="group">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 font-space font-bold text-slate-900">
                <Info size={16} aria-hidden="true" className="text-slate-500" /> {t('intro.rules')}
              </summary>
              {challenge && <p className="mt-2 font-inter text-sm leading-relaxed text-slate-600">{t('intro.rulesBody', { base: challenge.basePoints, speed: challenge.maxSpeedBonus })}</p>}
            </details>
          </ArenaPanel>
        )}
      </div>

      <div className="text-center">
        <Link data-tour="challenge.history" to="/espace/defi/historique" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 font-inter text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent">
          <History size={16} aria-hidden="true" /> {t('intro.history')}
        </Link>
      </div>
    </div>
  );
}
