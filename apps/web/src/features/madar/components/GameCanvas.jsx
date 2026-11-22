import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createWorld, flip, revive, scoreOf, step } from '../engine/world';
import { createRenderer } from '../engine/render';
import { createFx, resetFx, updateFx, burst, floater } from '../engine/fx';
import { buzz } from '../engine/audio';
import { LANE_R } from '../engine/constants';

/**
 * Le canevas de « مدار » : la boucle (requestAnimationFrame), l'entrée et le
 * rendu. Le monde est une simulation pure (engine/world.js) ; ce composant ne
 * fait que l'avancer, le dessiner et traduire ses événements en sons, éclats
 * et vibrations.
 *
 *   mode="attract"  le jeu tourne seul (pilote automatique) derrière l'accueil
 *   mode="play"     la partie de l'élève, graine du serveur
 *
 * Un seul geste : toucher l'écran, cliquer, ou Espace / ↑ / ↓ — changer
 * d'orbite. `statsRef` reçoit à chaque image ce que l'affichage tête haute lit
 * (sans re-rendre la page soixante fois par seconde).
 */
const GameCanvas = forwardRef(function GameCanvas({
  mode = 'play', seed, shipId, paused = false, reduced = false, audio, statsRef, onCrash, onFlip,
}, ref) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const fxRef = useRef(createFx());
  const rendererRef = useRef(null);
  const pausedRef = useRef(paused);
  const shipRef = useRef(shipId);
  const reducedRef = useRef(reduced);
  const crashRef = useRef(onCrash);
  const flipRef = useRef(onFlip);
  pausedRef.current = paused;
  shipRef.current = shipId;
  reducedRef.current = reduced;
  crashRef.current = onCrash;
  flipRef.current = onFlip;

  // Le monde : recréé quand la graine change (une nouvelle partie).
  useEffect(() => {
    worldRef.current = createWorld(seed ?? 1, { autopilot: mode === 'attract' });
    resetFx(fxRef.current);
  }, [seed, mode]);

  const doFlip = () => {
    const world = worldRef.current;
    if (mode !== 'play' || pausedRef.current || !world || !flip(world)) return;
    audio?.flip(world.lane);
    buzz(8);
    flipRef.current?.();
  };

  useImperativeHandle(ref, () => ({
    flip: doFlip,
    revive() {
      const world = worldRef.current;
      if (world && revive(world)) resetFx(fxRef.current);
    },
    result() {
      const world = worldRef.current;
      return world ? { score: scoreOf(world), stars: world.stars, nearMisses: world.nearMisses, bestCombo: world.bestCombo, sector: world.sector } : null;
    },
  }));

  // La boucle.
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const renderer = createRenderer(canvas);
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
    let crashedReported = false;
    let time = 0;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      time += dt;
      const world = worldRef.current;
      if (!world) return;
      const fx = fxRef.current;
      const reducedNow = reducedRef.current;

      if (!pausedRef.current) {
        const events = step(world, dt);
        for (const e of events) handleEvent(e, world, fx, renderer, reducedNow);
        if (world.status === 'crashed') {
          if (mode === 'attract') {
            revive(world);
          } else if (!crashedReported) {
            crashedReported = true;
            crashRef.current?.({ score: scoreOf(world), stars: world.stars, nearMisses: world.nearMisses, bestCombo: world.bestCombo, sector: world.sector });
          }
        } else {
          crashedReported = false;
        }
        updateFx(fx, world, dt, { reduced: reducedNow });
      } else if (world.status === 'crashed') {
        // Le crash fige la partie, pas l'explosion : éclats, secousse et éclair finissent de s'éteindre.
        updateFx(fx, world, dt, { reduced: reducedNow });
      }
      renderer.draw(world, fx, { shipId: shipRef.current, time, reduced: reducedNow });
      if (statsRef) {
        statsRef.current = {
          score: scoreOf(world),
          stars: world.stars,
          combo: world.combo,
          multiplier: world.multiplier,
          sector: world.sector,
          shield: world.shield,
          status: world.status,
        };
      }
    };

    function handleEvent(e, world, fx, r, reducedNow) {
      const [sx, sy] = r.project(world, world.theta, world.r);
      const R = r.radius;
      switch (e.type) {
        case 'star': {
          const [x, y] = r.project(world, world.theta, LANE_R[e.lane]);
          burst(fx, x, y, { count: 10, speed: R * 0.9, size: R * 0.05, sprite: 'gold', life: 0.45, reduced: reducedNow });
          floater(fx, x, y - R * 0.12, `+${e.points}`, '#fde68a');
          audio?.star(e.combo);
          break;
        }
        case 'multiplier':
          floater(fx, sx, sy - R * 0.3, `×${e.multiplier}`, '#f0abfc', true);
          audio?.multiplier(e.multiplier);
          buzz(15);
          break;
        case 'near':
          floater(fx, sx, sy - R * 0.22, `+${e.points}`, '#67e8f9');
          burst(fx, sx, sy, { count: 6, speed: R * 1.4, size: R * 0.035, sprite: 'cyan', life: 0.3, reduced: reducedNow });
          audio?.near();
          break;
        case 'shield':
          burst(fx, sx, sy, { count: 12, speed: R * 0.8, size: R * 0.05, sprite: 'cyan', life: 0.5, reduced: reducedNow });
          audio?.shield();
          break;
        case 'shieldBreak':
          burst(fx, sx, sy, { count: 22, speed: R * 1.6, size: R * 0.06, sprite: 'cyan', life: 0.6, reduced: reducedNow });
          fx.shake = R * 0.05;
          fx.flash = 0.25;
          fx.flashColor = 'rgba(165,243,252,1)';
          audio?.shieldBreak();
          buzz([20, 30, 20]);
          break;
        case 'cometHop':
          audio?.comet();
          break;
        case 'sector':
          if (mode === 'play') {
            fx.flash = 0.35;
            fx.flashColor = 'rgba(255,255,255,1)';
            audio?.sector();
          }
          break;
        case 'crash':
          if (mode === 'play') {
            burst(fx, sx, sy, { count: 40, speed: R * 2.2, size: R * 0.09, sprite: 'orange', life: 0.9, reduced: reducedNow });
            burst(fx, sx, sy, { count: 18, speed: R * 1.2, size: R * 0.07, sprite: 'white', life: 0.6, reduced: reducedNow });
            fx.shake = R * 0.12;
            fx.flash = 0.5;
            fx.flashColor = 'rgba(248,113,113,1)';
            audio?.crash();
            buzz([60, 40, 90]);
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

  // Clavier : Espace / ↑ / ↓ / W / S. (Le toucher est sur l'hôte.)
  useEffect(() => {
    if (mode !== 'play') return undefined;
    const onKey = (e) => {
      if (e.repeat) return;
      if ([' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
        const tag = e.target?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        doFlip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 touch-none select-none"
      onPointerDown={(e) => {
        if (mode !== 'play' || e.button > 0) return;
        audio?.unlock();
        doFlip();
      }}
      data-madar-canvas={mode}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
});

export default GameCanvas;
