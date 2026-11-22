import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Delete, Flame, Pause, Rocket, Shield, TrendingDown, TrendingUp, Volume2, VolumeX, Zap } from 'lucide-react';
import { createMental, isWarmingUp, multiplierFor, press, resultOf, step, timeLeft } from '../mental/sim';
import { LIVES, PLANET_EVERY, timeLimit } from '../mental/constants';
import { SECTORS } from '../engine/constants';
import { buzz } from '../engine/audio';
import { formatScore } from '../madarModel';
import MathTokens from './MathTokens';
import { SUB_LETTERS, WarmupChip } from './SniperHud';

/**
 * « الحساب الذهني » — le plateau, en DOM : un problème, des cases pour la
 * réponse, un pavé numérique (téléphone) et le clavier (ordinateur). La
 * réponse part seule quand les cases sont pleines : le jeu va VITE.
 *
 * Ce qui le rend amusant, sans jamais dire une règle :
 *   - une FUSÉE qui monte d'une marche à chaque bonne réponse et traverse les
 *     planètes (une nouvelle toutes les PLANET_EVERY) ;
 *   - les étoiles défilent plus vite quand la série monte ; « 🔥 ×n » ;
 *   - un bonus de vitesse « ⚡ » ; un anneau de temps autour du problème ;
 *   - une faute secoue la carte et montre la bonne réponse, le temps de la lire.
 *
 *   mode="attract"  le jeu se joue seul derrière l'accueil
 *   mode="play"     la partie de l'élève (graine du serveur, position de départ)
 */
const MentalBoard = forwardRef(function MentalBoard({
  mode = 'play', seed, start = 0, paused = false, reduced = false, audio, muted, onToggleMute, onPause, onOver, onTap,
}, ref) {
  const { t } = useTranslation('madar');
  const play = mode === 'play';
  const gameRef = useRef(null);
  const ringRef = useRef(null);
  const [, render] = useReducer((x) => x + 1, 0);
  const [pop, setPop] = useState(null);
  const [banner, setBanner] = useState(null);
  const live = useRef({});
  live.current = { paused, onOver, onTap };

  if (!gameRef.current) gameRef.current = createMental(seed ?? 1, { start, autopilot: !play });
  useEffect(() => {
    gameRef.current = createMental(seed ?? 1, { start, autopilot: !play });
    render();
  }, [seed, start, play]);

  useImperativeHandle(ref, () => ({ result: () => resultOf(gameRef.current), game: () => gameRef.current }));

  const react = (e) => {
    if (!e || !play) return;
    if (e.type === 'typed') audio?.flip(0);
    if (e.type === 'hit') {
      audio?.star(Math.min(5, e.streak));
      buzz(8);
      setPop({ id: Date.now(), points: e.points, speed: e.speed, mult: e.mult });
      if (e.planet) {
        audio?.multiplier(3);
        setBanner({ id: Date.now(), kind: 'planet', planet: SECTORS[Math.min(SECTORS.length - 1, e.planet)].id });
      } else if (e.streak > 0 && e.streak % 5 === 0) {
        audio?.multiplier(Math.min(4, e.mult));
        setBanner({ id: Date.now(), kind: 'streak', n: e.streak });
      }
    }
    if (e.type === 'wrong' || e.type === 'timeout') { audio?.shieldBreak(); buzz([30, 30, 30]); }
    if (e.type === 'roundEnd' && e.change !== 'same') {
      const c = gameRef.current.lastChange;
      if (c) setBanner({ id: Date.now(), kind: c.kind, level: c.level, sub: c.sub });
      if (e.change === 'up') audio?.multiplier(2);
    }
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
      events.forEach(react);
      if (events.length) render();
      if (ringRef.current) {
        const k = game.feedback ? 0 : timeLeft(game) / timeLimit(game.i);
        ringRef.current.style.background = `conic-gradient(${k > 0.3 ? '#fbbf24' : '#f43f5e'} ${k * 360}deg, rgba(255,255,255,0.08) 0deg)`;
      }
      if (game.status === 'over' && play && !reported) {
        reported = true;
        live.current.onOver?.(resultOf(game));
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, audio]);

  const key = (k) => {
    if (!play || live.current.paused) return;
    audio?.unlock();
    const e = press(gameRef.current, k);
    if (e) {
      react(e);
      if (e.type !== 'typed') live.current.onTap?.(e);
      render();
    }
  };

  useEffect(() => {
    if (!play) return undefined;
    const onKey = (e) => {
      if (/^[0-9]$/.test(e.key)) key(e.key);
      else if (e.key === 'Backspace') key('back');
      else if (e.key === 'Enter') key('enter');
      else if (e.key === '-' || e.key === '−') key('−');
      else if (e.key === ',' || e.key === '.') key(',');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  useEffect(() => {
    if (!pop) return undefined;
    const id = setTimeout(() => setPop(null), 900);
    return () => clearTimeout(id);
  }, [pop]);
  useEffect(() => {
    if (!banner) return undefined;
    const id = setTimeout(() => setBanner(null), 2200);
    return () => clearTimeout(id);
  }, [banner]);

  const game = gameRef.current;
  const p = game.problem;
  const fb = game.feedback;
  const mult = multiplierFor(game.streak);
  const planet = Math.floor(game.hits / PLANET_EVERY);
  const nextPlanet = SECTORS[Math.min(SECTORS.length - 1, planet + 1)];
  const climb = (game.hits % PLANET_EVERY) / PLANET_EVERY;
  const slots = [...p.answerText];
  const needsSign = p.domain === 'relatives' || p.answerText.startsWith('−');
  const needsComma = p.domain === 'decimals' || p.answerText.includes(',');
  // Les étoiles accélèrent avec la série (durée de défilement plus courte).
  const starSpeed = reduced ? 0 : Math.max(3, 18 - game.streak * 1.5);
  const iconBtn = 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60';
  const keyBtn = 'grid h-14 place-items-center rounded-2xl bg-white/10 font-space text-2xl font-black text-white ring-1 ring-white/15 transition active:scale-95 hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 sm:h-16';

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#2a1458_0%,_#0b0720_55%,_#04030c_100%)]" data-madar-canvas={`mental-${mode}`}>
      <style>{'@keyframes mental-stars{from{background-position:0 0,0 0}to{background-position:0 600px,0 300px}}'}</style>
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(1.5px 1.5px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 120px 80px,#c7d2fe,transparent)',
          backgroundSize: '180px 200px, 140px 150px',
          animation: starSpeed ? `mental-stars ${starSpeed}s linear infinite` : 'none',
        }} />

      {/* La fusée et son ascension vers la prochaine planète (côté début, en RTL). */}
      <div className="pointer-events-none absolute bottom-6 start-3 top-28 z-10 flex w-12 flex-col items-center sm:start-8 sm:w-16" aria-hidden="true">
        <span className="h-9 w-9 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.25)] sm:h-12 sm:w-12" style={{ background: `radial-gradient(circle at 35% 30%, ${nextPlanet.planet[0]}, ${nextPlanet.planet[1]} 55%, ${nextPlanet.planet[2]})` }} />
        <span className="mt-1 whitespace-nowrap font-inter text-[10px] font-bold text-white/70">{t(`sectors.${nextPlanet.id}`)}</span>
        <div className="relative mt-2 w-1.5 flex-1 rounded-full bg-white/10">
          <div className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-amber-400 to-rose-400 transition-all duration-500" style={{ height: `${climb * 100}%` }} />
          <motion.span className="absolute -start-3 grid h-8 w-8 place-items-center text-amber-200 sm:-start-4 sm:h-10 sm:w-10"
            animate={{ bottom: `calc(${climb * 100}% - 16px)` }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <Rocket size={26} className="-rotate-45" />
          </motion.span>
        </div>
      </div>

      <div className={`relative z-20 mx-auto flex h-full max-w-xl flex-col px-4 pb-[max(12px,env(safe-area-inset-bottom))] ps-16 sm:ps-24 ${play ? '' : 'pointer-events-none opacity-60'}`}>
        {play && (
          <div className="flex items-start justify-between gap-2 pt-[max(10px,env(safe-area-inset-top))]" data-madar-hud="mental">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onPause} className={iconBtn} aria-label={t('hud.pause')} data-action="pause"><Pause size={20} aria-hidden="true" /></button>
              <button type="button" onClick={onToggleMute} className={iconBtn} aria-label={muted ? t('sound.unmute') : t('sound.mute')} aria-pressed={muted}>
                {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
              </button>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-space text-3xl font-black tabular-nums text-white sm:text-4xl" dir="ltr" data-score={game.score}>{formatScore(game.score)}</p>
              {game.streak >= 3 && (
                <motion.p key={game.streak} initial={reduced ? false : { scale: 1.4 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1 font-space text-sm font-black text-orange-300" dir="ltr" data-streak={game.streak}>
                  <Flame size={14} aria-hidden="true" /> {game.streak} · ×{mult}
                </motion.p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15" role="meter" aria-valuemin={0} aria-valuemax={LIVES} aria-valuenow={game.lives} aria-label={t('sniper.hud.shields')} data-lives={game.lives}>
              {Array.from({ length: LIVES }, (_, i) => <Shield key={i} size={18} aria-hidden="true" className={i < game.lives ? 'fill-cyan-300 text-cyan-200' : 'text-white/25'} />)}
            </div>
          </div>
        )}

        <p className="mt-2 text-center font-inter text-xs font-semibold text-white/75" data-mental-level={`${p.level}-${p.sub}`}>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-space text-[11px] font-black text-amber-200">{t('sniper.hud.level', { n: p.level, sub: SUB_LETTERS[p.sub - 1] })}</span>
          <span className="ms-1.5">{t(`mental.levels.${p.levelId}`)}</span>
        </p>
        {play && isWarmingUp(game) && <div className="text-center"><WarmupChip /></div>}

        <div className="relative mt-3 flex flex-1 flex-col items-center justify-center">
          <AnimatePresence>
            {banner && (
              <motion.p key={banner.id} initial={reduced ? false : { opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className={`absolute top-0 z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-inter text-sm font-black ring-1 ${banner.kind === 'down' ? 'bg-sky-400/20 text-sky-100 ring-sky-300/40' : 'bg-amber-300/20 text-amber-100 ring-amber-300/50'}`}
                role="status" data-mental-banner={banner.kind}>
                {banner.kind === 'planet' && <>🪐 {t('mental.hud.planet', { planet: t(`sectors.${banner.planet}`) })}</>}
                {banner.kind === 'streak' && <><Zap size={15} aria-hidden="true" /> {t('mental.hud.streak', { n: banner.n })}</>}
                {banner.kind === 'up' && <><TrendingUp size={15} aria-hidden="true" /> {t('sniper.hud.levelUp', { n: banner.level, sub: SUB_LETTERS[banner.sub - 1] })}</>}
                {banner.kind === 'down' && <><TrendingDown size={15} aria-hidden="true" /> {t('sniper.hud.levelDown', { n: banner.level, sub: SUB_LETTERS[banner.sub - 1] })}</>}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Le problème dans son anneau de temps. */}
          <div ref={ringRef} className="rounded-[34px] p-[5px]" data-mental-problem={p.i}>
            <motion.div key={`${p.i}-${fb ? (fb.correct ? 'ok' : 'ko') : 'ask'}`}
              initial={reduced ? false : fb && !fb.correct ? { x: 0 } : { scale: 0.92, opacity: 0 }}
              animate={fb && !fb.correct && !reduced ? { x: [0, -10, 10, -6, 6, 0] } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`min-w-[15rem] rounded-[30px] px-6 py-5 text-center text-slate-950 sm:min-w-[20rem] ${fb ? (fb.correct ? 'bg-emerald-100' : 'bg-rose-100') : 'bg-white'}`}>
              <MathTokens tokens={p.tokens} className="font-space text-4xl font-black sm:text-5xl" />
              {fb && !fb.correct && (
                <p className="mt-2 font-inter text-sm font-bold text-rose-900" data-mental-correction>
                  {fb.typed === null ? t('mental.hud.timeout') : t('mental.hud.wrong')} <MathTokens tokens={[`= ${p.answerText}`]} className="font-space text-lg text-emerald-800" />
                </p>
              )}
            </motion.div>
          </div>

          <AnimatePresence>
            {pop && (
              <motion.p key={pop.id} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -40 }} exit={{ opacity: 0 }}
                className="pointer-events-none absolute end-4 top-1/3 font-space text-2xl font-black text-amber-200 drop-shadow" dir="ltr">
                +{pop.points}{pop.speed > 0 && <span className="ms-1 text-base text-cyan-200">⚡{pop.speed}</span>}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Les cases de la réponse. */}
          <div className="mt-5 flex gap-2" dir="ltr" aria-live="polite" aria-label={t('mental.hud.answer')} data-mental-slots={slots.length}>
            {slots.map((ch, i) => {
              const typed = (fb?.typed ?? game.typed)[i];
              const tone = fb ? (fb.correct ? 'bg-emerald-300 text-emerald-950' : 'bg-rose-300 text-rose-950') : typed ? 'bg-white text-slate-950' : 'bg-white/10 text-white';
              return (
                <span key={`${p.i}-${i}`} className={`grid h-14 w-11 place-items-center rounded-2xl font-space text-3xl font-black ring-2 ring-white/20 transition sm:h-16 sm:w-12 ${tone}`}>
                  {typed ?? (ch === ',' || ch === '−' ? <span className="text-white/30">{ch}</span> : '')}
                </span>
              );
            })}
          </div>
        </div>

        {/* Le pavé : pour le pouce sur téléphone, cliquable sur ordinateur (le clavier marche aussi). */}
        <div className="mx-auto mt-4 grid w-full max-w-sm grid-cols-3 gap-2" dir="ltr" data-mental-keypad>
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((k) => (
            <button key={k} type="button" className={keyBtn} onClick={() => key(k)} disabled={!play} data-key={k}>{k}</button>
          ))}
          {needsSign ? <button type="button" className={keyBtn} onClick={() => key('−')} disabled={!play} data-key="minus">−</button>
            : needsComma ? <button type="button" className={keyBtn} onClick={() => key(',')} disabled={!play} data-key="comma">,</button>
              : <span />}
          <button type="button" className={keyBtn} onClick={() => key('0')} disabled={!play} data-key="0">0</button>
          <button type="button" className={keyBtn} onClick={() => key('back')} disabled={!play} aria-label={t('mental.hud.erase')} data-key="back"><Delete size={24} aria-hidden="true" /></button>
          {needsSign && needsComma && (
            <button type="button" className={`${keyBtn} col-span-3 h-11 text-xl sm:h-12`} onClick={() => key(',')} disabled={!play} data-key="comma">,</button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MentalBoard;
