import { H, PHYSICS } from './sim.js';

/**
 * Le rendu de « المستكشف » au canevas 2D — tout est dessiné en code.
 *
 * Le niveau se lit de DROITE à GAUCHE (le sens de l'arabe) : l'avant du
 * niveau (x croissant) est dessiné vers la gauche de l'écran. La caméra garde
 * l'astronaute au tiers droit, pour voir ce qui vient.
 *
 * La taille d'une tuile suit l'écran : au téléphone (portrait), la hauteur du
 * niveau tient au-dessus des commandes tactiles ; à l'ordinateur, ~26 tuiles
 * sont visibles. Pas de `shadowBlur` ; texte du canevas en LTR.
 */
const THEMES = {
  moon: { sky: ['#0b1026', '#1d2547'], ground: '#8b93a7', groundDark: '#4b5268', top: '#cbd5e1', accent: '#a5b4fc', planet: '#334155' },
  mars: { sky: ['#2a0e0b', '#5c2316'], ground: '#b4532a', groundDark: '#6b2a14', top: '#fdba74', accent: '#fb923c', planet: '#7c2d12' },
  nebula: { sky: ['#140a2e', '#3b1a6b'], ground: '#6d4bc2', groundDark: '#33206b', top: '#d8b4fe', accent: '#f0abfc', planet: '#581c87' },
};

export function createExplorerRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let T = 32;
  let top = 0;
  let camX = 0;
  let reserveBottom = 0;
  let seed = 4242;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 120 }, () => ({ x: rand(), y: rand() * 0.7, s: 0.6 + rand() * 1.4, tw: rand() * 6 }));
  const hills = Array.from({ length: 24 }, (_, i) => ({ x: i * 0.11 + rand() * 0.05, r: 0.08 + rand() * 0.1 }));

  function resize(width, height, ratio, bottomReserve = 0) {
    w = width;
    h = height;
    reserveBottom = bottomReserve;
    dpr = Math.min(ratio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const avail = h - reserveBottom - 64;
    T = Math.max(18, Math.min(avail / H, w / 11));
    top = 64 + Math.max(0, (avail - T * H) / 2);
  }

  /** Écran ← monde, en miroir : x croissant vers la gauche. */
  const sx = (x) => w - (x - camX) * T;
  const sy = (y) => top + y * T;

  function follow(g, dt) {
    const visible = w / T;
    const target = g.player.x + PHYSICS.playerW / 2 - visible * 0.32;
    const clamped = Math.max(0, Math.min(g.width - visible, target));
    camX += (clamped - camX) * Math.min(1, dt * 8);
    if (Math.abs(clamped - camX) > visible) camX = clamped;
  }

  function background(g, time, theme) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, theme.sky[0]);
    sky.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    for (const st of stars) {
      const x = ((st.x * w + camX * T * 0.05) % w + w) % w;
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(time * 1.3 + st.tw);
      ctx.fillStyle = '#fff';
      ctx.fillRect(w - x, st.y * h, st.s, st.s);
    }
    ctx.globalAlpha = 1;
    // Une grande planète au loin, presque immobile.
    const px = w * 0.25 + camX * T * 0.02;
    const grad = ctx.createRadialGradient(w - px, h * 0.2, 4, w - px, h * 0.2, h * 0.22);
    grad.addColorStop(0, theme.accent);
    grad.addColorStop(1, theme.planet);
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w - px, h * 0.2, h * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Collines lointaines (parallaxe).
    ctx.fillStyle = `${theme.groundDark}aa`;
    const base = sy(H - 2);
    for (const hl of hills) {
      const x = ((hl.x * w * 2 + camX * T * 0.3) % (w * 2.2)) - w * 0.1;
      ctx.beginPath();
      ctx.arc(w - x, base, hl.r * h, Math.PI, 0);
      ctx.fill();
    }
  }

  function tiles(g, time, theme) {
    const x0 = Math.max(0, Math.floor(camX) - 1);
    const x1 = Math.min(g.width - 1, Math.ceil(camX + w / T) + 1);
    for (let y = 0; y < H; y++) {
      for (let x = x0; x <= x1; x++) {
        const ch = g.grid[y][x];
        if (ch === '.') continue;
        const X = sx(x + 1);
        const Y = sy(y);
        if (ch === '#') {
          ctx.fillStyle = theme.ground;
          ctx.fillRect(X, Y, T + 0.5, T + 0.5);
          ctx.fillStyle = theme.groundDark;
          if ((x * 7 + y * 3) % 5 === 0) { ctx.beginPath(); ctx.arc(X + T * 0.35, Y + T * 0.6, T * 0.12, 0, 6.3); ctx.fill(); }
          if (y === 0 || g.grid[y - 1][x] !== '#') {
            ctx.fillStyle = theme.top;
            ctx.fillRect(X, Y, T + 0.5, T * 0.18);
          }
        } else if (ch === 'B') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(X + 1, Y + 1, T - 2, T - 2);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(X + 2, Y + 2, T - 4, T - 4);
          ctx.fillStyle = '#cbd5e1';
          for (const [a, b] of [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) ctx.fillRect(X + T * a - 1.5, Y + T * b - 1.5, 3, 3);
        } else if (ch === '?' || ch === 'P' || ch === 'U') {
          const used = ch === 'U';
          const color = used ? '#334155' : ch === 'P' ? '#0891b2' : '#7c3aed';
          ctx.fillStyle = color;
          ctx.fillRect(X + 1, Y + 1, T - 2, T - 2);
          ctx.strokeStyle = used ? '#475569' : '#fde68a';
          ctx.lineWidth = 2;
          ctx.strokeRect(X + 2, Y + 2, T - 4, T - 4);
          if (!used) {
            const pulse = 0.75 + 0.25 * Math.sin(time * 4 + x);
            ctx.fillStyle = ch === 'P' ? `rgba(165,243,252,${pulse})` : `rgba(253,230,138,${pulse})`;
            if (ch === 'P') {
              ctx.beginPath();
              ctx.moveTo(X + T / 2, Y + T * 0.22);
              ctx.lineTo(X + T * 0.75, Y + T * 0.35);
              ctx.lineTo(X + T * 0.68, Y + T * 0.72);
              ctx.lineTo(X + T / 2, Y + T * 0.82);
              ctx.lineTo(X + T * 0.32, Y + T * 0.72);
              ctx.lineTo(X + T * 0.25, Y + T * 0.35);
              ctx.fill();
            } else {
              diamond(X + T / 2, Y + T / 2, T * 0.28);
            }
          }
        } else if (ch === '=') {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(X, Y, T + 0.5, T * 0.22);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(X, Y, T + 0.5, T * 0.07);
        } else if (ch === 'S') {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = Math.max(2, T * 0.08);
          ctx.beginPath();
          for (let i = 0; i <= 4; i++) ctx.lineTo(X + T * (i % 2 ? 0.8 : 0.2), Y + T * (0.4 + i * 0.13));
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(X + T * 0.1, Y + T * 0.32, T * 0.8, T * 0.12);
        } else if (ch === '^') {
          ctx.fillStyle = '#e2e8f0';
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(X + T * (i / 3), Y + T);
            ctx.lineTo(X + T * (i / 3 + 1 / 6), Y + T * 0.45);
            ctx.lineTo(X + T * ((i + 1) / 3), Y + T);
            ctx.fill();
          }
        } else if (ch === '~') {
          const lava = ctx.createLinearGradient(0, Y, 0, Y + T);
          lava.addColorStop(0, '#fde047');
          lava.addColorStop(0.4, '#f97316');
          lava.addColorStop(1, '#b91c1c');
          ctx.fillStyle = lava;
          const wave = y === 0 || g.grid[y - 1][x] !== '~' ? Math.sin(time * 3 + x) * T * 0.08 : 0;
          ctx.fillRect(X, Y + T * 0.15 + wave, T + 0.5, T * 0.85 - wave);
        }
      }
    }
  }

  function diamond(cx, cy, r) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.7, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.7, cy);
    ctx.closePath();
    ctx.fill();
  }

  function items(g, time) {
    for (const c of g.crystals) {
      if (c.taken) continue;
      const X = sx(c.x);
      if (X < -T || X > w + T) continue;
      const bob = Math.sin(time * 3 + c.x) * T * 0.08;
      ctx.fillStyle = '#67e8f9';
      diamond(X, sy(c.y) + bob, T * 0.28);
      ctx.fillStyle = '#ecfeff';
      diamond(X - T * 0.05, sy(c.y) + bob - T * 0.06, T * 0.1);
    }
    for (const cp of g.checkpoints) {
      const X = sx(cp.x + 0.5);
      const Y = sy(cp.y + 1);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(X, Y);
      ctx.lineTo(X, Y - T * 1.6);
      ctx.stroke();
      ctx.fillStyle = cp.reached ? '#34d399' : '#64748b';
      ctx.beginPath();
      ctx.arc(X, Y - T * 1.7, T * (cp.reached ? 0.22 + 0.04 * Math.sin(time * 6) : 0.18), 0, 6.3);
      ctx.fill();
    }
    if (g.goal) {
      // La fusée : 3 tuiles de haut, la flamme quand on l'atteint.
      const X = sx(g.goal.x + 0.5);
      const Y = sy(g.goal.y + 1);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(X, Y - T * 3);
      ctx.quadraticCurveTo(X + T * 0.6, Y - T * 2.2, X + T * 0.45, Y - T * 0.5);
      ctx.lineTo(X - T * 0.45, Y - T * 0.5);
      ctx.quadraticCurveTo(X - T * 0.6, Y - T * 2.2, X, Y - T * 3);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(X - T * 0.75, Y - T * 1.1, T * 0.35, T * 0.6);
      ctx.fillRect(X + T * 0.4, Y - T * 1.1, T * 0.35, T * 0.6);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(X, Y - T * 2.1, T * 0.2, 0, 6.3);
      ctx.fill();
      if (g.status === 'won') {
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.moveTo(X - T * 0.3, Y - T * 0.5);
        ctx.lineTo(X, Y + T * (0.6 + 0.3 * Math.sin(time * 30)));
        ctx.lineTo(X + T * 0.3, Y - T * 0.5);
        ctx.fill();
      }
    }
  }

  function enemies(g, time) {
    for (const e of g.enemies) {
      if (!e.alive) continue;
      const X = sx(e.x + e.w);
      const Y = sy(e.y);
      const ew = e.w * T;
      const eh = e.h * T;
      if (X > w + T || X + ew < -T) continue;
      if (e.kind === 'slime') {
        const squish = 1 + 0.08 * Math.sin(time * 8 + e.x);
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(X + ew / 2, Y + eh * 0.6, ew / 2 * squish, eh * 0.5 / squish, 0, Math.PI, 0);
        ctx.lineTo(X + ew, Y + eh);
        ctx.lineTo(X, Y + eh);
        ctx.fill();
        eyes(X + ew / 2, Y + eh * 0.45, ew);
      } else if (e.kind === 'crawler') {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.ellipse(X + ew / 2, Y + eh * 0.65, ew / 2, eh * 0.38, 0, 0, 6.3);
        ctx.fill();
        ctx.fillStyle = '#f5d0fe';
        for (let i = 0; i < 4; i++) {
          const bx = X + ew * (0.15 + i * 0.23);
          ctx.beginPath();
          ctx.moveTo(bx - ew * 0.08, Y + eh * 0.35);
          ctx.lineTo(bx, Y);
          ctx.lineTo(bx + ew * 0.08, Y + eh * 0.35);
          ctx.fill();
        }
        eyes(X + ew / 2, Y + eh * 0.62, ew * 0.8);
      } else {
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.ellipse(X + ew / 2, Y + eh * 0.6, ew / 2, eh * 0.35, 0, 0, 6.3);
        ctx.fill();
        ctx.fillStyle = '#fecaca';
        ctx.beginPath();
        ctx.ellipse(X + ew / 2, Y + eh * 0.4, ew * 0.22, eh * 0.25, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        const spin = Math.sin(time * 40) * ew * 0.4;
        ctx.beginPath();
        ctx.moveTo(X + ew / 2 - spin, Y + eh * 0.1);
        ctx.lineTo(X + ew / 2 + spin, Y + eh * 0.1);
        ctx.stroke();
      }
    }
  }

  function eyes(cx, cy, size) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - size * 0.15, cy, size * 0.11, 0, 6.3);
    ctx.arc(cx + size * 0.15, cy, size * 0.11, 0, 6.3);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - size * 0.18, cy, size * 0.05, 0, 6.3);
    ctx.arc(cx + size * 0.12, cy, size * 0.05, 0, 6.3);
    ctx.fill();
  }

  function player(g, time) {
    const pl = g.player;
    if (g.status === 'dead') return;
    if (pl.invuln > 0 && Math.floor(time * 14) % 2 === 0) return;
    const pw = PHYSICS.playerW * T;
    const ph = PHYSICS.playerH * T;
    const X = sx(pl.x + PHYSICS.playerW);
    const Y = sy(pl.y);
    ctx.save();
    ctx.translate(X + pw / 2, Y + ph / 2);
    // Le personnage regarde vers l'avant du niveau : la gauche de l'écran.
    if (pl.facing > 0) ctx.scale(-1, 1);
    const run = pl.onGround && Math.abs(pl.vx) > 0.5 ? Math.sin(pl.runPhase * 3) : 0;
    // Jambes.
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-pw * 0.28 + run * pw * 0.12, ph * 0.18, pw * 0.22, ph * 0.32);
    ctx.fillRect(pw * 0.06 - run * pw * 0.12, ph * 0.18, pw * 0.22, ph * 0.32);
    // Sac à dos.
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-pw * 0.5, -ph * 0.1, pw * 0.22, ph * 0.36);
    // Corps.
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-pw * 0.32, -ph * 0.12, pw * 0.66, ph * 0.42, pw * 0.12);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-pw * 0.1, -ph * 0.02, pw * 0.22, ph * 0.08);
    // Casque et visière.
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -ph * 0.28, pw * 0.36, 0, 6.3);
    ctx.fill();
    const visor = ctx.createLinearGradient(-pw * 0.2, -ph * 0.4, pw * 0.3, -ph * 0.15);
    visor.addColorStop(0, '#fde68a');
    visor.addColorStop(1, '#f59e0b');
    ctx.fillStyle = visor;
    ctx.beginPath();
    ctx.ellipse(pw * 0.08, -ph * 0.28, pw * 0.22, pw * 0.16, 0, 0, 6.3);
    ctx.fill();
    ctx.restore();
    if (pl.shield) {
      ctx.strokeStyle = `rgba(103,232,249,${0.6 + 0.3 * Math.sin(time * 8)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(X + pw / 2, Y + ph / 2, Math.max(pw, ph) * 0.8, 0, 6.3);
      ctx.stroke();
    }
  }

  function effects(fx) {
    ctx.save();
    for (const p of fx.particles) {
      const k = p.life / p.max;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = p.color;
      ctx.fillRect(sx(p.x) - 2, sy(p.y) - 2, 4, 4);
    }
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    for (const f of fx.floaters) {
      const k = f.life / f.max;
      ctx.globalAlpha = Math.min(1, k * 1.5);
      ctx.font = `900 ${Math.round(T * 0.5)}px "Space Grotesk", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(2,6,23,0.85)';
      ctx.strokeText(f.text, sx(f.x), sy(f.y) - (1 - k) * T);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, sx(f.x), sy(f.y) - (1 - k) * T);
    }
    ctx.restore();
  }

  function draw(g, fx, { time, dt, reduced }) {
    const theme = THEMES[g.world] ?? THEMES.moon;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    follow(g, dt);
    if (!reduced && fx.shake > 0.2) ctx.translate((Math.random() - 0.5) * fx.shake, (Math.random() - 0.5) * fx.shake);
    background(g, time, theme);
    tiles(g, time, theme);
    items(g, time);
    enemies(g, time);
    player(g, time);
    effects(fx);
  }

  return { resize, draw, get tile() { return T; } };
}
