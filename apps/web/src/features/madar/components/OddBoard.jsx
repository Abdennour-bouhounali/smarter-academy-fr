import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Shield, TrendingDown, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { createOdd, isWarmingUp, multiplierFor, pick, resultOf, step, timeLeft } from '../odd/sim';
import { LIVES, timeLimit } from '../odd/constants';
import { valueTokens } from '../sniper/cards';
import { buzz } from '../engine/audio';
import { formatScore } from '../madarModel';
import MathTokens from './MathTokens';
import { SUB_LETTERS, WarmupChip } from './SniperHud';

/**
 * « الدخيل » — le plateau, en DOM (des cartes à toucher, du texte réel) : 4 ou
 * 5 cartes blanches, toutes égales sauf une. Pas de cible : l'élève doit VOIR
 * ce qu'elles partagent. Après chaque choix, la réponse reste à l'écran —
 * « كلّها = 12 » et ce que vaut « الدخيل » — puis l'énigme suivante arrive.
 *
 *   mode="attract"  le jeu se joue seul derrière l'accueil
 *   mode="play"     la partie de l'élève (graine du serveur, position de départ)
 *
 * Clavier : 1 … 5 touchent la carte de ce rang (dans l'ordre de lecture).
 * La simulation est pure (odd/sim.js) ; ce composant l'avance et la montre.
 */
const OddBoard = forwardRef(function OddBoard({
  mode = 'play', seed, start = 0, paused = false, reduced = false, audio, muted, onToggleMute, onPause, onOver, onTap,
}, ref) {
  const { t } = useTranslation('madar');
  const gameRef = useRef(null);
  const barRef = useRef(null);
  const [, render] = useReducer((x) => x + 1, 0);
  const live = useRef({});
  live.current = { paused, onOver, onTap };
  const play = mode === 'play';

  if (!gameRef.current) gameRef.current = createOdd(seed ?? 1, { start, autopilot: !play });
  useEffect(() => {
    gameRef.current = createOdd(seed ?? 1, { start, autopilot: !play });
    render();
  }, [seed, start, play]);

  useImperativeHandle(ref, () => ({ result: () => resultOf(gameRef.current), game: () => gameRef.current }));

  const sound = (e) => {
    if (!play || !e) return;
    if (e.type === 'hit') { audio?.star(Math.min(5, e.streak)); buzz(8); }
    if (e.type === 'wrong' || e.type === 'timeout') { audio?.shieldBreak(); buzz([30, 30, 30]); }
    if (e.type === 'roundEnd' && e.change === 'up') audio?.multiplier(2);
    if (e.type === 'over') { audio?.crash(); buzz([80, 50, 120]); }
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let reported = false;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const game = gameRef.current;
      if (!game || live.current.paused) return;
      const events = step(game, dt).filter(Boolean);
      events.forEach(sound);
      if (events.length) render();
      if (barRef.current) barRef.current.style.transform = `scaleX(${game.reveal ? 0 : timeLeft(game) / timeLimit(game.i)})`;
      if (game.status === 'over' && play && !reported) {
        reported = true;
        live.current.onOver?.(resultOf(game));
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, audio]);

  const choose = (index) => {
    if (!play || live.current.paused) return;
    audio?.unlock();
    const e = pick(gameRef.current, index);
    if (e) {
      sound(e);
      live.current.onTap?.(e);
      render();
    }
  };

  useEffect(() => {
    if (!play) return undefined;
    const onKey = (e) => {
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= 5) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  const game = gameRef.current;
  const p = game.puzzle;
  const reveal = game.reveal;
  const atX = p.at != null && p.at < 0 ? `−${-p.at}` : p.at;
  const commonLabel = p.mode === 'solution' ? 'odd.reveal.solution' : p.mode === 'at' ? 'odd.reveal.at' : 'odd.reveal.value';
  const mult = multiplierFor(game.streak);
  const iconBtn = 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60';

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#14254a_0%,_#0a0b24_55%,_#05040f_100%)]" data-madar-canvas={`odd-${mode}`}>
      {play && (
        <div className="sticky top-0 z-20 px-3 pt-[max(10px,env(safe-area-inset-top))] sm:px-6" data-madar-hud="odd">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause"><Pause size={20} aria-hidden="true" /></button>
              <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
                {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
              </button>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-space text-3xl font-black tabular-nums text-white sm:text-4xl" dir="ltr" data-score={game.score}>{formatScore(game.score)}</p>
              {mult > 1 && <p className="font-space text-sm font-black text-amber-300" dir="ltr">×{mult}</p>}
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15" role="meter" aria-valuemin={0} aria-valuemax={LIVES} aria-valuenow={game.lives} aria-label={t('sniper.hud.shields')} data-lives={game.lives}>
              {Array.from({ length: LIVES }, (_, i) => <Shield key={i} size={18} aria-hidden="true" className={i < game.lives ? 'fill-cyan-300 text-cyan-200' : 'text-white/25'} />)}
            </div>
          </div>
        </div>
      )}

      <div className={`mx-auto flex max-w-3xl flex-col items-center px-4 pb-10 ${play ? 'pt-3' : 'pt-[38vh] opacity-60 lg:pt-28'}`}>
        <h2 className="text-center font-space text-2xl font-black text-white sm:text-3xl">{t('odd.hud.question')}</h2>
        <p className="mt-1 text-center font-inter text-sm text-white/70">
          {t(p.mode === 'solution' ? 'odd.hud.hintSolution' : p.mode === 'at' ? 'odd.hud.hintAt' : 'odd.hud.hintValue', { x: atX })}
        </p>
        <p className="mt-1.5 font-inter text-xs font-semibold text-white/75" data-odd-level={`${p.level}-${p.sub}`}>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-space text-[11px] font-black text-amber-200">{t('sniper.hud.level', { n: p.level, sub: SUB_LETTERS[p.sub - 1] })}</span>
          <span className="ms-1.5">{t(`sniper.levels.${p.levelId}`)}</span>
        </p>
        {play && isWarmingUp(game) && <div className="text-center"><WarmupChip /></div>}

        <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div ref={barRef} className="h-full origin-right rounded-full bg-gradient-to-l from-amber-300 to-rose-400" style={{ transform: 'scaleX(1)' }} />
        </div>

        <AnimatePresence>
          {game.lastChange && play && (
            <motion.p key={`${game.lastChange.id}-${game.lastChange.kind}`} initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-inter text-sm font-bold ring-1 ${game.lastChange.kind === 'up' ? 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/40' : 'bg-sky-400/15 text-sky-100 ring-sky-300/30'}`}
              role="status" data-level-change={game.lastChange.kind}>
              {game.lastChange.kind === 'up' ? <TrendingUp size={15} aria-hidden="true" /> : <TrendingDown size={15} aria-hidden="true" />}
              {t(game.lastChange.kind === 'up' ? 'sniper.hud.levelUp' : 'sniper.hud.levelDown', { n: game.lastChange.level, sub: SUB_LETTERS[game.lastChange.sub - 1] })}
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="mt-5 flex w-full flex-wrap justify-center gap-3 sm:gap-4" data-odd-cards={p.cards.length} key={p.i}>
          {p.cards.map((c, idx) => {
            const isPicked = reveal?.picked === idx;
            const tone = !reveal ? 'ring-white/40 hover:-translate-y-0.5 hover:ring-amber-300'
              : c.odd ? 'ring-4 ring-amber-400'
                : isPicked ? 'ring-4 ring-rose-500'
                  : 'ring-2 ring-emerald-400/70 opacity-80';
            return (
              <motion.li key={c.id} className="w-[calc(50%-0.4rem)] sm:w-[calc(33.333%-0.75rem)]"
                initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: reduced ? 0 : idx * 0.05 }}>
                <button type="button" onClick={() => choose(idx)} disabled={!play || Boolean(reveal)}
                  className={`relative flex min-h-[112px] w-full flex-col items-center justify-center gap-1 rounded-3xl bg-white px-2 py-4 text-slate-950 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.8)] ring transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:cursor-default ${tone}`}
                  aria-label={`${idx + 1}: ${c.text}`} data-odd-card={idx} data-odd={reveal ? String(c.odd) : undefined}>
                  <span className="absolute start-2.5 top-2 font-space text-[11px] font-black text-slate-400" dir="ltr">{idx + 1}</span>
                  <MathTokens tokens={c.tokens} className="max-w-full font-space text-xl font-black sm:text-2xl" />
                  {reveal && (c.odd || isPicked) && (
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-xs font-bold ${c.odd ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>
                      {c.odd && <span>{t('odd.reveal.odd')}</span>}
                      <MathTokens tokens={['= ', ...valueTokens(c.value)]} className="font-space text-sm" />
                    </span>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-4 min-h-[44px]" aria-live="polite">
          {reveal && (
            <p className={`inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl px-4 py-2 font-inter text-sm font-bold ${reveal.correct ? 'bg-emerald-400/15 text-emerald-100' : 'bg-white/10 text-white/85'}`} data-odd-reveal={reveal.correct ? 'correct' : 'wrong'}>
              {reveal.correct ? t('odd.reveal.correct') : reveal.picked === null ? t('odd.reveal.timeout') : t('odd.reveal.wrong')}
              <span className="text-white/70">·</span>
              <span>{t(commonLabel, { x: atX })}</span>
              <span className="rounded-lg bg-white px-2 py-0.5 text-slate-950"><MathTokens tokens={valueTokens(p.common.value)} className="font-space text-base font-black" /></span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default OddBoard;
