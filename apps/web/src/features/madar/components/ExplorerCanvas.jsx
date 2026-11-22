import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createExplorer, progressOf, resultOf, revive, scoreOf, step } from '../explorer/sim';
import { createExplorerRenderer } from '../explorer/render';
import { botInput } from '../explorer/bot';
import { buzz } from '../engine/audio';

/** La hauteur réservée en bas aux commandes tactiles (px), quand elles sont affichées. */
const TOUCH_RESERVE = 150;

/**
 * Le canevas de « المستكشف » : la boucle, le clavier, le rendu. Les commandes
 * tactiles (TouchControls) écrivent dans `touchRef` par la poignée impérative.
 *
 *   mode="attract"  un pilote automatique parcourt le niveau derrière la carte des niveaux
 *   mode="play"     la partie de l'élève (le niveau choisi)
 *
 * Clavier, dans le sens du niveau (de droite à gauche) : ← ou A avance,
 * → ou D recule, Espace / ↑ / W saute (garder appuyé saute plus haut).
 */
const ExplorerCanvas = forwardRef(function ExplorerCanvas({
  mode = 'play', level = 1, paused = false, reduced = false, touch = false, audio, statsRef, onDeath, onWin,
}, ref) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keys = useRef({ forward: false, back: false, jump: false });
  const touchInput = useRef({ forward: false, back: false, jump: false });
  const fxRef = useRef({ particles: [], floaters: [], shake: 0 });
  const live = useRef({});
  live.current = { paused, reduced, onDeath, onWin, touch };

  useEffect(() => {
    gameRef.current = createExplorer(level);
    fxRef.current = { particles: [], floaters: [], shake: 0 };
  }, [level, mode]);

  useImperativeHandle(ref, () => ({
    setTouch(part, down) { touchInput.current = { ...touchInput.current, [part]: down }; },
    revive() { if (gameRef.current) revive(gameRef.current); },
    result() { return gameRef.current ? resultOf(gameRef.current) : null; },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const renderer = createExplorerRenderer(canvas);
    const fit = () => {
      const rect = host.getBoundingClientRect();
      renderer.resize(Math.max(1, rect.width), Math.max(1, rect.height), window.devicePixelRatio || 1, live.current.touch ? TOUCH_RESERVE : 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let reported = null;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      time += dt;
      const g = gameRef.current;
      if (!g) return;
      const fx = fxRef.current;
      if (!live.current.paused) {
        const input = mode === 'attract' ? botInput(g) : {
          forward: keys.current.forward || touchInput.current.forward,
          back: keys.current.back || touchInput.current.back,
          jump: keys.current.jump || touchInput.current.jump,
        };
        for (const e of step(g, dt, input)) handle(e, fx);
        if (g.status === 'dead') {
          if (mode === 'attract') {
            revive(g);
          } else if (reported !== g.t) {
            reported = g.t;
            live.current.onDeath?.(resultOf(g), g.cause);
          }
        } else if (g.status === 'won' && mode === 'play' && reported !== 'won') {
          reported = 'won';
          live.current.onWin?.(resultOf(g));
        } else if (g.status === 'won' && mode === 'attract') {
          gameRef.current = createExplorer(g.n);
        }
      }
      for (const p of fx.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 9 * dt; }
      fx.particles = fx.particles.filter((p) => p.life > 0);
      for (const f of fx.floaters) f.life -= dt;
      fx.floaters = fx.floaters.filter((f) => f.life > 0);
      fx.shake *= Math.pow(0.002, dt);
      renderer.draw(g, fx, { time, dt, reduced: live.current.reduced });
      if (statsRef) {
        statsRef.current = {
          score: scoreOf(g), crystals: g.collected, totalCrystals: g.totalCrystals, timeLeft: g.timeLeft,
          progress: progressOf(g), shield: g.player.shield, status: g.status, level: g.n, world: g.world,
        };
      }
    };

    function burst(fx, x, y, color, n = 10) {
      const count = live.current.reduced ? Math.ceil(n / 3) : n;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        fx.particles.push({ x, y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4 - 3, life: 0.5, max: 0.5, color });
      }
    }

    function handle(e, fx) {
      const play = mode === 'play';
      switch (e.type) {
        case 'crystal':
          burst(fx, e.x, e.y, '#67e8f9', 6);
          if (play) { fx.floaters.push({ x: e.x, y: e.y - 0.4, text: `+${e.points}`, color: '#a5f3fc', life: 0.6, max: 0.6 }); audio?.star(1 + (Math.floor(e.x) % 6)); }
          break;
        case 'block':
          burst(fx, e.x + 0.5, e.y, '#fde68a', 8);
          if (play) { fx.floaters.push({ x: e.x + 0.5, y: e.y - 0.6, text: `+${e.points}`, color: '#fde68a', life: 0.7, max: 0.7 }); audio?.star(4); buzz(8); }
          break;
        case 'power':
          burst(fx, e.x + 0.5, e.y, '#a5f3fc', 14);
          if (play) { audio?.shield(); buzz(15); }
          break;
        case 'stomp':
          burst(fx, e.x, e.y, '#bbf7d0', 10);
          if (play) { fx.floaters.push({ x: e.x, y: e.y - 0.6, text: `+${e.points}`, color: '#86efac', life: 0.7, max: 0.7 }); audio?.near(); buzz(12); }
          break;
        case 'jump':
          if (play) audio?.flip(1);
          break;
        case 'spring':
          if (play) { audio?.multiplier(2); buzz(10); }
          break;
        case 'bump':
          if (play) audio?.flip(0);
          break;
        case 'checkpoint':
          if (play) { audio?.heart(); fx.floaters.push({ x: e.x + 0.5, y: e.y - 1.5, text: '✓', color: '#34d399', life: 1, max: 1 }); }
          break;
        case 'shieldBreak':
          if (play) { audio?.shieldBreak(); buzz([20, 30, 20]); fx.shake = 8; }
          break;
        case 'death':
          burst(fx, e.x + 0.4, e.y + 0.4, '#f8fafc', 20);
          if (play) { audio?.crash(); buzz([60, 40, 90]); fx.shake = 14; }
          break;
        case 'won':
          if (play) { audio?.record(); buzz([20, 40, 20, 40, 60]); }
          break;
        default:
      }
    }

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [mode, audio, statsRef, touch]);

  useEffect(() => {
    if (mode !== 'play') return undefined;
    // Le niveau avance vers la GAUCHE de l'écran.
    const map = { ArrowLeft: 'forward', a: 'forward', A: 'forward', ArrowRight: 'back', d: 'back', D: 'back', ' ': 'jump', ArrowUp: 'jump', w: 'jump', W: 'jump' };
    const set = (down) => (e) => {
      const part = map[e.key];
      if (!part) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (tag === 'BUTTON' && e.key === ' ') return;
      e.preventDefault();
      keys.current = { ...keys.current, [part]: down };
    };
    const onDown = set(true);
    const onUp = set(false);
    const clear = () => { keys.current = { forward: false, back: false, jump: false }; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clear);
    };
  }, [mode]);

  return (
    <div ref={hostRef} className="absolute inset-0 touch-none select-none" data-madar-canvas={`explorer-${mode}`}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
});

export default ExplorerCanvas;
