import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Brain, Crosshair, Fuel, Hand, Keyboard, Rocket, ScanSearch, Volume2, VolumeX } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { MATH_GAMES, formatScore, isFreeGame, nextShipGoal, playBlocker } from '../madarModel';
import MathLevelMap from './MathLevelMap';
import CostBadge from './CostBadge';
import AdjustmentNotice from './AdjustmentNotice';
import HeartsRow from './HeartsRow';
import Leaderboard from './Leaderboard';
import LevelMap from './LevelMap';
import Panel from './Panel';
import ShipBay from './ShipBay';
import ShipIcon from './ShipIcon';
import TurretBay from './TurretBay';
import TurretIcon from './TurretIcon';

/**
 * La base de lancement. Derrière elle, le vrai jeu tourne tout seul (pilote
 * automatique) : on voit ce qu'on va faire avant de lire quoi que ce soit.
 *
 * Téléphone (portrait) : le titre, l'orbite visible, puis une colonne —
 * lancer, classement, hangar. Ordinateur : deux colonnes de part et d'autre
 * de l'orbite, qui reste au centre.
 *
 * L'accueil d'UN jeu de « فضاء الألعاب » (le choix du jeu se fait sur la page
 * de la salle, /espace/jeux) : records, classement, collection (vaisseaux,
 * tourelles) ou carte des niveaux (« المستكشف »), ou les six familles
 * d'écritures de « قنّاص القيم » (jeu de mathématiques, GRATUIT : son bouton ne
 * montre pas de coût). Les cœurs et la محطة التزوّد sont communs aux jeux.
 */
export default function Lobby({ state, game = 'orbit', busy, error, muted, onToggleMute, onPlay, onRefuel, onSelectShip, onDismissNotices, hubPath = '/espace/jeux' }) {
  const { t } = useTranslation('madar');
  const reduce = useReducedMotion();
  const isDefense = game === 'defense';
  const isExplorer = game === 'explorer';
  // Un jeu de mathématiques (« قنّاص القيم », « الدخيل ») : sa position dans les 50 niveaux.
  const isSniper = MATH_GAMES.includes(game);
  const math = isSniper ? state[game] : null;
  const free = isFreeGame(state, game);
  const blocker = playBlocker(state, game);
  const goal = isDefense ? nextShipGoal(state.defense?.turrets) : nextShipGoal(state.ships);
  const needsFuel = blocker === 'no_hearts';
  const canRefuel = state.available && state.hearts < state.maxHearts;

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain" data-madar-lobby>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/80 to-transparent px-4 pb-6 pt-[max(12px,env(safe-area-inset-top))] sm:px-8">
        <Link to={hubPath} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/10 px-3 font-inter text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50" data-action="hub">
          <ArrowBack size={16} aria-hidden="true" /> <span>{t('hub.back')}</span>
        </Link>
        <button type="button" onClick={onToggleMute} aria-pressed={muted} aria-label={muted ? t('sound.unmute') : t('sound.mute')}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50">
          {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
        </button>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-4 pb-10 sm:px-8 lg:grid-cols-[minmax(340px,420px)_1fr_minmax(320px,400px)] lg:items-start lg:gap-6">
        {/* ── Colonne de lancement (à droite en RTL) ── */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center lg:text-start">
            <p className="font-inter text-xs font-bold uppercase tracking-widest text-amber-200/80">{t('hub.title')}</p>
            <h1 className="mt-1 bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text font-space text-5xl font-black leading-tight text-transparent drop-shadow-[0_4px_24px_rgba(251,191,36,0.35)] sm:text-6xl">
              {t(`games.${game}.name`)}
            </h1>
            <p className="mx-auto mt-3 max-w-xs font-inter text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0">{t(`games.${game}.tagline`)}</p>
            <p className="mx-auto mt-1 max-w-xs font-inter text-xs text-amber-200/80 lg:mx-0">{t(`games.${game}.skill`)}</p>
          </motion.div>

          {/* L'orbite reste visible sur téléphone : de l'espace avant le panneau. */}
          <div className="h-[30vh] lg:hidden" aria-hidden="true" />

          <AdjustmentNotice adjustments={state.adjustments} onDismiss={onDismissNotices} />

          <Panel className="space-y-4" data-madar-launch>
            <div className="flex items-center justify-between gap-3">
              <div>
                <HeartsRow hearts={state.hearts} max={state.maxHearts} size={26} />
                <p className="mt-1 font-inter text-xs text-white/60">{t('hearts.daily', { n: state.dailyFreeHearts })}</p>
              </div>
              {game === 'mental' ? <Brain size={52} className="text-amber-300" aria-hidden="true" />
                : game === 'odd' ? <ScanSearch size={52} className="text-amber-300" aria-hidden="true" />
                : isSniper ? <Crosshair size={52} className="text-amber-300" aria-hidden="true" />
                : isDefense ? <TurretIcon type="laser" size={52} /> : isExplorer ? <span className="text-5xl" aria-hidden="true">🧑‍🚀</span> : <ShipIcon id={state.ship} size={56} />}
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
              {(isSniper ? [
                ['lobby.best', formatScore(math?.best)],
                ['sniper.lobby.bestLevel', math?.bestLevel ?? 1],
                ['lobby.weekBest', formatScore(math?.weekBest)],
              ] : isExplorer ? [
                ['explorer.stars', `${state.explorer?.totalStars ?? 0}/${state.explorer?.maxStars ?? 36}`],
                ['lobby.best', formatScore(state.explorer?.best)],
                ['lobby.weekBest', formatScore(state.explorer?.weekBest)],
              ] : isDefense ? [
                ['lobby.best', formatScore(state.defense?.best)],
                ['defense.lobby.bestWave', state.defense?.bestWave ?? 0],
                ['lobby.weekBest', formatScore(state.defense?.weekBest)],
              ] : [
                ['lobby.best', formatScore(state.best)],
                ['lobby.weekBest', formatScore(state.weekBest)],
                ['lobby.runsToday', t('lobby.runsTodayValue', { n: state.runsToday, cap: state.dailyRunCap })],
              ]).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-white/[0.06] px-2 py-2.5">
                  <dt className="font-inter text-[11px] text-white/55">{t(key)}</dt>
                  <dd className="mt-0.5 font-space text-lg font-black tabular-nums" dir="ltr">{value}</dd>
                </div>
              ))}
            </dl>

            {blocker && blocker !== 'no_hearts' && (
              <p className="rounded-2xl bg-white/[0.06] p-3 text-center font-inter text-sm text-white/80" role="status">{t(`reasons.${blocker}`, { defaultValue: t('reasons.disabled') })}</p>
            )}

            {isExplorer && !needsFuel ? (
              <>
                {canRefuel && (
                  <button type="button" onClick={onRefuel} disabled={busy}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 font-inter text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                    data-action="refuel">
                    <Fuel size={18} className="text-amber-300" aria-hidden="true" /> {t('lobby.refuel')}
                    <span className="font-normal text-white/60">· {t('lobby.refuelHint')}</span>
                  </button>
                )}
                <p className="flex items-center justify-center gap-1.5 font-inter text-xs text-white/60"><CostBadge className="bg-white/10" /> {t('explorer.map.cost')}</p>
              </>
            ) : needsFuel ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-rose-500/10 p-3 ring-1 ring-rose-300/30">
                  <p className="font-space text-base font-black text-rose-100">{t('lobby.noHeartsTitle')}</p>
                  <p className="mt-0.5 font-inter text-sm text-rose-100/80">{t('lobby.noHeartsBody')}</p>
                </div>
                <motion.button
                  type="button" onClick={onRefuel} disabled={busy}
                  animate={reduce ? undefined : { boxShadow: ['0 0 0 0 rgba(251,191,36,0.0)', '0 0 0 10px rgba(251,191,36,0.18)', '0 0 0 0 rgba(251,191,36,0.0)'] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-6 font-space text-xl font-black text-slate-950 transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-60"
                  data-action="refuel"
                >
                  <Fuel size={24} aria-hidden="true" /> {t('lobby.refuel')}
                </motion.button>
              </div>
            ) : (
              <>
                <motion.button
                  type="button" onClick={onPlay} disabled={Boolean(blocker) || busy}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  className="group relative flex min-h-[68px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 px-6 font-space text-2xl font-black text-slate-950 shadow-[0_10px_40px_-8px_rgba(251,146,60,0.7)] transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  data-action="play"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-700 group-hover:translate-x-full" aria-hidden="true" />
                  <Rocket size={26} aria-hidden="true" className="-scale-x-100" />
                  {t('lobby.play')}
                  {free ? <span className="rounded-full bg-slate-950/15 px-2 py-0.5 font-inter text-xs font-black" data-free>{t('sniper.free')}</span> : <CostBadge />}
                </motion.button>
                {free && <p className="text-center font-inter text-xs text-white/60">{t('sniper.lobby.freeHint')}</p>}
                {canRefuel && (
                  <button type="button" onClick={onRefuel} disabled={busy}
                    className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 font-inter text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50"
                    data-action="refuel">
                    <Fuel size={18} className="text-amber-300" aria-hidden="true" /> {t('lobby.refuel')}
                    <span className="font-normal text-white/60">· {t('lobby.refuelHint')}</span>
                  </button>
                )}
              </>
            )}

            {isExplorer && <LevelMap explorer={state.explorer} disabled={Boolean(blocker) || busy} onPlay={onPlay} />}

            {isSniper && <MathLevelMap progress={math} catalog={game === 'mental' ? 'mental' : 'sniper'} disabled={Boolean(blocker) || busy} onPlay={onPlay} />}

            {error && <p role="alert" className="rounded-2xl bg-rose-500/15 p-3 text-center font-inter text-sm text-rose-100 ring-1 ring-rose-300/30">{error}</p>}

            <p className="flex items-center justify-center gap-2 font-inter text-xs text-white/55">
              <Hand size={14} aria-hidden="true" /> {isSniper ? t(`${game}.coach.tap`) : isExplorer ? t('explorer.controls.hint') : isDefense ? t('defense.coach.tap') : t('lobby.controlsShort')}
              <Keyboard size={14} className="hidden sm:block" aria-hidden="true" />
            </p>
            {isDefense && <p className="text-center font-inter text-[11px] text-white/45">{t('defense.lobby.map')}</p>}

            {goal && !isExplorer && !isSniper && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                {isDefense ? <TurretIcon type={goal.id} size={36} locked /> : <ShipIcon id={goal.id} size={36} locked />}
                <div className="min-w-0 flex-1">
                  <p className="font-inter text-xs font-semibold text-white/80">
                    {isDefense ? t(`defense.turrets.${goal.id}.name`) : t(`ships.names.${goal.id}`)} · {
                      goal.rule.kind === 'best' ? t('ships.ruleBest', { n: formatScore(goal.rule.threshold) })
                        : goal.rule.kind === 'wave' ? t('defense.turrets.ruleWave', { n: goal.rule.threshold })
                          : t('ships.ruleRefuel', { n: goal.rule.threshold })}
                  </p>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <span className="block h-full rounded-full bg-gradient-to-l from-amber-300 to-orange-500" style={{ width: `${goal.ratio * 100}%` }} />
                  </span>
                </div>
                <span className="font-space text-xs font-bold text-white/60" dir="ltr">{formatScore(goal.rule.progress)}{'\u00A0/\u00A0'}{formatScore(goal.rule.threshold)}</span>
              </div>
            )}
          </Panel>
        </div>

        <div className="hidden lg:block" aria-hidden="true" />

        <div className="space-y-4">
          <Leaderboard competition={isSniper ? math?.competition : isExplorer ? state.explorer?.competition : isDefense ? state.defense?.competition : state.competition} classroom={state.scope?.classroom} game={game} />
          {isDefense && <TurretBay turrets={state.defense?.turrets ?? []} />}
          {game === 'orbit' && <ShipBay ships={state.ships} selected={state.ship} onSelect={onSelectShip} busy={busy} />}
        </div>
      </div>
    </div>
  );
}
