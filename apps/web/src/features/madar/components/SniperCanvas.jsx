import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createSniper, isWarmingUp, multiplierFor, resultOf, step, tap } from '../sniper/sim';
import { createSniperRenderer } from '../sniper/render';
import { valueTokens } from '../sniper/cards';
import { levelOfPos, subOfPos } from '../sniper/levels';
import { buzz } from '../engine/audio';

/**
 * Le canevas de « قنّاص القيم » : la boucle, le toucher, le rendu. Le jeu est
 * une simulation pure (sniper/sim.js) ; ce composant l'avance, la dessine et
 * traduit ses événements en sons, éclats, vibrations — et en RETOUR LISIBLE :
 * un piège touché montre ce qu'il valait vraiment, une carte égale qui tombe
 * montre « = » la cible. Le jeu ne dit jamais la règle ; il montre la valeur.
 *
 *   mode="attract"  la partie se joue seule derrière l'accueil
 *   mode="play"     la partie de l'élève, sur les cibles de la semaine (graine du serveur)
 *
 * `statsRef` reçoit à chaque image ce que l'affichage lit (cible, score,
 * boucliers, série, manche).
 */
const SniperCanvas = forwardRef(function SniperCanvas({
  mode = 'play', seed, start = 0, paused = false, reduced = false, audio, statsRef, onOver, onTap,
}, ref) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rendererRef = useRef(null);
  const fxRef = useRef(null);
  const live = useRef({});
  live.current = { paused, reduced, onOver, onTap };

  const freshFx = () => ({ effects: [], floaters: [], shake: 0, flash: 0, groundHit: 0, aim: -Math.PI / 2 });

  useEffect(() => {
    gameRef.current = createSniper(seed ?? 1, { autopilot: mode === 'attract', start });
    fxRef.current = freshFx();
  }, [seed, mode, start]);

  useImperativeHandle(ref, () => ({
    result: () => (gameRef.current ? resultOf(gameRef.current) : null),
    game: () => gameRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const renderer = createSniperRenderer(canvas);
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
    let overReported = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const real = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      time += real;
      const game = gameRef.current;
      const fx = fxRef.current;
      if (!game || !fx) return;
      const { paused: isPaused, reduced: isReduced } = live.current;

      if (!isPaused) {
        // Les cartes sont lues AVANT le pas : celles qui touchent le sol gardent leur position.
        const boxes = new Map(game.cards.map((c) => [c.id, renderer.cardBox(c, game.t)]));
        for (const e of step(game, real)) handle(e, fx, isReduced, boxes, renderer, game);
        if (game.status === 'over' && !overReported && mode === 'play') {
          overReported = true;
          live.current.onOver?.(resultOf(game));
        }
      }
      for (const e of fx.effects) e.life -= real;
      fx.effects = fx.effects.filter((e) => e.life > 0);
      for (const f of fx.floaters) f.life -= real;
      fx.floaters = fx.floaters.filter((f) => f.life > 0);
      fx.shake *= Math.pow(0.001, real);
      fx.flash *= Math.pow(0.01, real);
      fx.groundHit = Math.max(0, fx.groundHit - real * 2);

      renderer.draw(game, fx, { time, reduced: isReduced });
      if (statsRef) {
        const r = game.round;
        statsRef.current = {
          score: game.score,
          lives: game.lives,
          streak: game.streak,
          mult: multiplierFor(game.streak),
          round: game.roundIndex + 1,
          level: game.round?.level ?? levelOfPos(game.pos),
          sub: game.round?.sub ?? subOfPos(game.pos),
          mode: game.round?.mode ?? 'value',
          at: game.round?.at ?? null,
          position: game.pos,
          change: game.lastChange ?? null,
          warming: isWarmingUp(game),
          levelId: r?.levelId ?? null,
          target: r?.target ?? null,
          targetKey: r ? `${r.k}:${r.target.key}` : null,
          status: game.status,
        };
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, audio, statsRef]);

  function handle(e, fx, isReduced, boxes, renderer, game) {
    const play = mode === 'play';
    switch (e.type) {
      case 'hit': {
        const c = game.cards.find((x) => x.id === e.id);
        const b = boxes.get(e.id) ?? (c ? renderer.cardBox(c, game.t) : null);
        if (!b) break;
        const [cx, cy] = renderer.cannon();
        fx.aim = Math.atan2(b.y - cy, b.x - cx);
        fx.effects.push({ type: 'laser', x: b.x, y: b.y, life: 0.16, max: 0.16 });
        fx.effects.push({ type: 'burst', x: b.x, y: b.y, size: 60, seed: Math.random() * 6, life: 0.45, max: 0.45 });
        if (play) {
          fx.floaters.push({ x: b.x, y: b.y - 20, text: e.mult > 1 ? `+${e.points} ×${e.mult}` : `+${e.points}`, color: '#fde68a', life: 0.8, max: 0.8, big: e.mult > 1 });
          audio?.star(Math.min(5, e.streak));
          if (e.streak > 0 && e.streak % 5 === 0) audio?.multiplier(e.mult);
          buzz(8);
        }
        break;
      }
      case 'wrong': {
        const c = game.cards.find((x) => x.id === e.id);
        const b = boxes.get(e.id) ?? (c ? renderer.cardBox(c, game.t) : null);
        if (!b) break;
        fx.effects.push({ type: 'shatter', x: b.x, y: b.y, size: 50, seed: Math.random() * 6, life: 0.5, max: 0.5 });
        // Ce que le piège valait vraiment : voir, pas lire une règle.
        fx.floaters.push({ x: b.x, y: b.y, tokens: valueTokens(e.value), prefix: '=', color: '#7f1d1d', fill: '#fee2e2', stroke: 'rgba(220,38,38,0.6)', life: 1.6, max: 1.6 });
        if (!isReduced) { fx.shake = 10; fx.flash = 0.18; }
        audio?.shieldBreak();
        buzz([30, 30, 30]);
        break;
      }
      case 'missed': {
        const b = boxes.get(e.id);
        if (!b) break;
        fx.groundHit = 1;
        // La carte égale qui est tombée : elle reste un instant, marquée « = ».
        fx.floaters.push({ x: b.x, y: Math.min(b.y, renderer.layout().ground - 30), tokens: e.tokens, prefix: '=', color: '#14532d', fill: '#dcfce7', stroke: 'rgba(22,163,74,0.7)', life: 1.6, max: 1.6 });
        if (play) {
          if (!isReduced) { fx.shake = 14; fx.flash = 0.2; }
          audio?.shieldBreak();
          buzz(40);
        }
        break;
      }
      case 'roundEnd':
        // Le niveau a changé : l'affichage l'annonce (« ارتقيت » / « نتمرّن قليلًا »).
        if (e.change !== 'same') game.lastChange = { kind: e.change, level: e.level, sub: e.sub, id: e.k };
        if (play && e.change === 'up') audio?.multiplier(2);
        if (play && e.perfect) {
          const { field } = renderer.layout();
          fx.effects.push({ type: 'ring', x: renderer.cannon()[0], y: renderer.cannon()[1] - 20, size: field * 0.25, life: 0.9, max: 0.9 });
          fx.floaters.push({ x: renderer.cannon()[0], y: renderer.layout().ground - 60, text: `+${e.bonus} ✓`, color: '#86efac', life: 1.4, max: 1.4, big: true });
          audio?.multiplier(3);
        }
        break;
      case 'round':
        if (play && e.k > 0) audio?.flip(1);
        break;
      case 'over':
        if (play) {
          fx.shake = 20;
          fx.flash = 0.45;
          audio?.crash();
          buzz([80, 50, 120]);
        }
        break;
      default:
    }
  }

  const onPointerDown = (ev) => {
    if (mode !== 'play' || ev.button > 0 || live.current.paused) return;
    const game = gameRef.current;
    const renderer = rendererRef.current;
    const host = hostRef.current;
    if (!game || !renderer || !host) return;
    audio?.unlock();
    const rect = host.getBoundingClientRect();
    const id = renderer.pick(game, ev.clientX - rect.left, ev.clientY - rect.top);
    if (!id) return;
    const c = game.cards.find((x) => x.id === id);
    const box = c ? renderer.cardBox(c, game.t) : null;
    const e = tap(game, id);
    if (e) {
      handle(e, fxRef.current, live.current.reduced, new Map(box ? [[id, box]] : []), renderer, game);
      live.current.onTap?.(e);
    }
  };

  return (
    <div ref={hostRef} className="absolute inset-0 touch-none select-none" onPointerDown={onPointerDown} data-madar-canvas={`sniper-${mode}`}>
      {/* Le canevas en LTR : les expressions s'écrivent de gauche à droite (la page est en RTL). */}
      <canvas ref={canvasRef} dir="ltr" className="block h-full w-full" aria-hidden="true" />
    </div>
  );
});

export default SniperCanvas;
