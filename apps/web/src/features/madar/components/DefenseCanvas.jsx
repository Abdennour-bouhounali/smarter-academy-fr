import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { build, createDefense, nextWaveIn, revive, scoreOf, sell, step, upgrade } from '../defense/sim';
import { createDefenseRenderer } from '../defense/render';
import { SLOTS } from '../defense/constants';
import { buzz } from '../engine/audio';

/** Le rayon de toucher d'un emplacement (unités du plateau) : ≥ 44 px au téléphone. */
const HIT_R = 0.11;
/** Le menu de construction ouvert, le temps ralentit : on réfléchit sans subir. */
const SLOW_MO = 0.3;

/**
 * Le canevas de « دفاع الكوكب » : la boucle, le toucher, le rendu. Le monde
 * est une simulation pure (defense/sim.js) ; ce composant l'avance, la
 * dessine, et traduit ses événements en sons, éclats et vibrations.
 *
 *   mode="attract"  la partie se joue seule (pilote automatique) derrière l'accueil
 *   mode="play"     la partie de l'élève, sur la carte de la semaine (graine du serveur)
 *
 * Toucher un emplacement → `onSelect(slotId)` (la page ouvre le menu) ;
 * toucher ailleurs → `onSelect(null)`. `statsRef` reçoit à chaque image ce
 * que l'affichage lit (vague, santé, cristaux, score, prochaine vague).
 */
const DefenseCanvas = forwardRef(function DefenseCanvas({
  mode = 'play', seed, unlocked, paused = false, reduced = false, selected = null, audio, statsRef, onFall, onSelect,
}, ref) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rendererRef = useRef(null);
  const fxRef = useRef({ effects: [], floaters: [], shake: 0, flash: 0, planetHit: 0 });
  const live = useRef({});
  live.current = { paused, reduced, selected, onFall, onSelect };

  useEffect(() => {
    gameRef.current = createDefense(seed ?? 1, { unlocked: mode === 'attract' ? undefined : unlocked, autopilot: mode === 'attract' });
    fxRef.current = { effects: [], floaters: [], shake: 0, flash: 0, planetHit: 0 };
    // `unlocked` ne recrée pas la partie : il est lu à la création, puis mis à jour ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, mode]);

  useEffect(() => {
    if (gameRef.current && unlocked && mode === 'play') gameRef.current.unlocked = new Set(unlocked);
  }, [unlocked, mode]);

  useImperativeHandle(ref, () => ({
    build(slotId, type) {
      const ok = build(gameRef.current, slotId, type);
      if (ok) { audio?.shield(); buzz(10); }
      return ok;
    },
    upgrade(slotId) {
      const ok = upgrade(gameRef.current, slotId);
      if (ok) { audio?.multiplier(2); buzz(10); }
      return ok;
    },
    sell(slotId) {
      const ok = sell(gameRef.current, slotId);
      if (ok) audio?.flip(0);
      return ok;
    },
    revive() {
      const game = gameRef.current;
      if (game && revive(game)) {
        fxRef.current.effects.push({ type: 'pulse', x: 0, y: 0, range: 0.55, life: 0.8, max: 0.8 });
      }
    },
    game: () => gameRef.current,
    result() {
      const g = gameRef.current;
      return g ? { score: scoreOf(g), kills: g.kills, wave: g.wave, waveReached: g.wave, health: g.health, turrets: g.turrets.size } : null;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const renderer = createDefenseRenderer(canvas);
    rendererRef.current = renderer;
    const fit = () => {
      const rect = host.getBoundingClientRect();
      renderer.resize(Math.max(1, rect.width), Math.max(1, rect.height), window.devicePixelRatio || 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let fallReported = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const real = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      time += real;
      const game = gameRef.current;
      if (!game) return;
      const fx = fxRef.current;
      const { paused: isPaused, reduced: isReduced, selected: sel } = live.current;

      if (!isPaused) {
        const dt = mode === 'play' && sel ? real * SLOW_MO : real;
        for (const e of step(game, dt)) handle(e, fx, isReduced);
        if (game.status === 'fallen') {
          if (mode === 'attract') {
            revive(game);
          } else if (!fallReported) {
            fallReported = true;
            live.current.onFall?.({ score: scoreOf(game), kills: game.kills, wave: game.wave, health: 0 });
          }
        } else {
          fallReported = false;
        }
      }
      for (const e of fx.effects) e.life -= real;
      fx.effects = fx.effects.filter((e) => e.life > 0);
      for (const f of fx.floaters) f.life -= real;
      fx.floaters = fx.floaters.filter((f) => f.life > 0);
      fx.shake *= Math.pow(0.001, real);
      fx.flash *= Math.pow(0.01, real);
      fx.planetHit = Math.max(0, fx.planetHit - real * 2);

      renderer.draw(game, fx, { selected: sel }, { time, reduced: isReduced });
      if (statsRef) {
        statsRef.current = {
          score: scoreOf(game), wave: game.wave, health: game.health, crystals: game.crystals,
          nextIn: nextWaveIn(game), kills: game.kills, status: game.status,
        };
      }
    };

    function handle(e, fx, isReduced) {
      const play = mode === 'play';
      switch (e.type) {
        case 'kill':
          fx.effects.push({ type: 'burst', x: e.x, y: e.y, size: e.kind === 'boss' ? 0.25 : 0.08, color: '#fde68a', life: 0.35, max: 0.35 });
          if (play) {
            fx.floaters.push({ x: e.x, y: e.y, text: `+${e.points}`, color: '#fde68a', life: 0.7, max: 0.7, big: e.kind === 'boss' });
            audio?.star(1 + (e.points % 5));
          }
          break;
        case 'rail':
          fx.effects.push({ ...e, life: 0.25, max: 0.25 });
          if (play) audio?.flip(1);
          break;
        case 'tesla':
          fx.effects.push({ ...e, life: 0.18, max: 0.18 });
          break;
        case 'pulse':
          fx.effects.push({ ...e, life: 0.45, max: 0.45 });
          break;
        case 'planetHit':
          fx.planetHit = 0.8;
          if (play && !isReduced) { fx.shake = Math.min(18, 4 + e.damage * 2); fx.flash = 0.12; }
          if (play) { audio?.shieldBreak(); buzz(25); }
          break;
        case 'waveCleared':
          if (play) {
            fx.floaters.push({ x: 0, y: -0.3, text: `+${e.points}`, color: '#86efac', life: 1.2, max: 1.2, big: true });
            audio?.multiplier(3);
          }
          break;
        case 'boss':
          if (play) { audio?.comet(); buzz([30, 40, 30]); }
          break;
        case 'fallen':
          if (play) {
            fx.shake = 22;
            fx.flash = 0.5;
            audio?.crash();
            buzz([80, 50, 120]);
          }
          break;
        default:
      }
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode, audio, statsRef]);

  const pick = (clientX, clientY) => {
    const renderer = rendererRef.current;
    const host = hostRef.current;
    if (!renderer || !host) return;
    const rect = host.getBoundingClientRect();
    const [x, y] = renderer.unproject(clientX - rect.left, clientY - rect.top);
    let best = null;
    let bd = HIT_R * HIT_R;
    for (const s of SLOTS) {
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d < bd) { bd = d; best = s.id; }
    }
    live.current.onSelect?.(best);
    if (best) audio?.flip(0);
  };

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 touch-none select-none"
      onPointerDown={(e) => {
        if (mode !== 'play' || e.button > 0 || live.current.paused) return;
        audio?.unlock();
        pick(e.clientX, e.clientY);
      }}
      data-madar-canvas={`defense-${mode}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
});

export default DefenseCanvas;
