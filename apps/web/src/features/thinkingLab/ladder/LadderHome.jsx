import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Gamepad2, Lock, Mountain } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { stateLines } from '../thinkingModel';
import { SoundToggle } from '../ThinkingParts';

/**
 * Écran 1 « Mon échelle » : le prochain numéro, les défis ouverts (au plus 3) avec leur état EN MOTS,
 * le chemin de pierres, et — quand un défi attend son jour — des activités légères (l'incubation
 * est plus forte avec une activité peu exigeante, plan §6.3). L'élève ne voit que des numéros.
 */
const STONE = {
  solved: 'bg-emerald-500 text-white ring-emerald-600',
  learned: 'bg-sky-500 text-white ring-sky-600',
  trying: 'bg-amber-100 text-amber-900 ring-amber-400',
  postponed: 'bg-slate-100 text-slate-600 ring-slate-300',
  open: 'bg-white text-nav-accent ring-indigo-300',
  locked: 'bg-slate-50 text-slate-300 ring-slate-200',
};

function Lines({ state }) {
  const { t } = useTranslation('thinking');
  return (
    <p className="font-inter text-sm text-slate-600">
      {stateLines(state).map((l) => t(l.key, l.params)).join(' · ')}
    </p>
  );
}

export default function LadderHome({ home }) {
  const { t } = useTranslation('thinking');
  const reduce = useReducedMotion();
  const enter = (delay) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay } });
  const full = home.openCount >= home.maxOpen;
  const waiting = home.open.filter((o) => o.state.unlockAt && !o.state.canReplay);

  return (
    <div className="space-y-6" data-thinking-ladder>
      <motion.header {...enter(0)} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-nav-accent-soft px-3 py-1 font-inter text-xs font-bold text-nav-accent ring-1 ring-indigo-200">
            <Brain size={14} aria-hidden="true" /> {t('brand')}
          </p>
          <h1 className="mt-3 font-space text-3xl font-black text-slate-900">{t('ladderName')}</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm leading-7 text-slate-600">{t('ladder.intro')}</p>
          <p className="mt-1 font-inter text-xs text-slate-500">
            {t('ladder.totals', { solved: home.totals.solved, alone: home.totals.solvedAlone, learned: home.totals.learned })}
          </p>
        </div>
        <SoundToggle />
      </motion.header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <motion.section {...enter(0.05)} className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg" aria-labelledby="tl-next">
          <h2 id="tl-next" className="font-inter text-sm font-bold text-indigo-100">{t('ladder.next')}</h2>
          {home.next ? (
            <>
              <p className="mt-2 font-space text-6xl font-black" dir="ltr">
                {home.next.summit && <Mountain className="me-2 inline" size={40} aria-label={t('summit')} />}
                {home.next.number}
              </p>
              {full ? (
                <p className="mt-4 rounded-2xl bg-white/15 px-4 py-3 font-inter text-sm">{t('ladder.full', { max: home.maxOpen })}</p>
              ) : (
                <Link to={`/espace/enigmes/${home.next.id}`} data-start-next
                  className="mt-5 inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-white px-6 font-space text-base font-black text-nav-accent transition hover:bg-nav-accent-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                  {t('ladder.start', { number: home.next.number })} <ArrowForward size={18} aria-hidden="true" />
                </Link>
              )}
            </>
          ) : (
            <p className="mt-3 font-inter text-sm">{t('ladder.noneOpen')}</p>
          )}
        </motion.section>

        <motion.section {...enter(0.1)} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="tl-open">
          <div className="flex items-baseline justify-between">
            <h2 id="tl-open" className="font-space text-lg font-black text-slate-900">{t('ladder.openTitle')}</h2>
            <span className="font-inter text-xs text-slate-500">{t('ladder.openCount', { count: home.openCount, max: home.maxOpen })}</span>
          </div>
          {home.open.length === 0 ? (
            <p className="mt-3 font-inter text-sm text-slate-500">{t('ladder.noneOpen')}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {home.open.map((o) => (
                <li key={o.id}>
                  <Link to={`/espace/enigmes/${o.id}`} data-open-challenge={o.number}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 transition hover:bg-amber-50 hover:ring-amber-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                    <div className="min-w-0">
                      <p className="font-space text-xl font-black text-slate-900" dir="ltr">{o.summit ? '▲ ' : ''}{o.number}</p>
                      <Lines state={o.state} />
                    </div>
                    <span className="shrink-0 font-inter text-sm font-bold text-nav-accent">{t('ladder.resume')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {waiting.length > 0 && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200" data-waiting>
              <h3 className="font-inter text-sm font-bold text-amber-900">{t('ladder.waitingTitle')}</h3>
              <p className="mt-1 font-inter text-xs text-amber-900/80">{t('ladder.waitingHint')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link to="/espace/jeux" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-inter text-xs font-bold text-amber-800 ring-1 ring-amber-300">
                  <Gamepad2 size={14} aria-hidden="true" /> {t('ladder.waitingGames')}
                </Link>
                {home.next && !full && (
                  <Link to={`/espace/enigmes/${home.next.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-inter text-xs font-bold text-amber-800 ring-1 ring-amber-300">
                    {t('ladder.waitingEasier')}
                  </Link>
                )}
              </div>
            </div>
          )}
        </motion.section>
      </div>

      <motion.section {...enter(0.15)} className="rounded-3xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="tl-trail">
        <h2 id="tl-trail" className="font-space text-lg font-black text-slate-900">{t('ladder.trail')}</h2>
        <p className="mt-1 font-inter text-xs text-slate-500">{t('ladder.trailHint')}</p>
        <ol className="mt-4 flex flex-wrap gap-2.5" data-trail>
          {home.trail.map((s) => {
            const clickable = s.status !== 'locked';
            const stone = (
              <span className={`flex items-center justify-center rounded-full font-space font-black ring-2 ${STONE[s.status]} ${s.summit ? 'h-14 w-14 text-base' : 'h-11 w-11 text-sm'}`}>
                {s.status === 'locked' ? <Lock size={14} aria-hidden="true" /> : s.number}
              </span>
            );
            return (
              <li key={s.id} title={`${s.number} · ${t(`ladder.status.${s.status}`)}`} data-stone={s.status}>
                {clickable ? (
                  <Link to={`/espace/enigmes/${s.id}`} aria-label={`${t('challengeNumber', { number: s.number })} · ${t(`ladder.status.${s.status}`)}`}
                    className="block rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">{stone}</Link>
                ) : (
                  <span aria-label={t('ladder.status.locked')}>{stone}</span>
                )}
              </li>
            );
          })}
        </ol>
        <ul className="mt-4 flex flex-wrap gap-3 font-inter text-xs text-slate-600">
          {['solved', 'learned', 'trying', 'open', 'locked'].map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-3 w-3 rounded-full ring-2 ${STONE[k]}`} aria-hidden="true" /> {t(`ladder.status.${k}`)}
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
