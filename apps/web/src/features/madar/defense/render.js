import { ENEMIES, PLANET_HEALTH, PLANET_R, SCHEDULE, SLOTS, SPAWN_R, TURRETS, enemiesIn } from './constants.js';
import { enemyPos, nextWaveIn } from './sim.js';

/**
 * Le rendu de « دفاع الكوكب » au canevas 2D — dessiné en code, sans image.
 *
 * Le plateau est un disque centré : la planète au milieu, deux anneaux
 * d'emplacements, le bord d'où viennent les ennemis. Il tient à l'écran en
 * portrait (téléphone) comme en paysage (ordinateur) : l'échelle suit le plus
 * petit côté. Avant chaque vague, des chevrons qui pulsent montrent D'OÙ elle
 * viendra — le joueur peut placer ses tourelles en conséquence.
 *
 * Mêmes règles que le rendu de l'orbite : pas de `shadowBlur`, halos en
 * sprites additifs, texte du canevas en LTR (« +5 »).
 */
const TAU = Math.PI * 2;

function glow(color, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function createDefenseRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let S = 100;
  let cx = 0;
  let cy = 0;
  let seed = 98765;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = Array.from({ length: 180 }, () => ({ a: rand() * TAU, d: Math.sqrt(rand()) * 1.6, s: 0.5 + rand() * 1.4, tw: rand() * TAU }));
  const sprites = {};
  const sprite = (color) => (sprites[color] ??= glow(color));

  function resize(width, height, ratio) {
    w = width;
    h = height;
    dpr = Math.min(ratio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // L'anneau extérieur et sa portée tiennent à l'écran ; le bord d'apparition peut déborder.
    S = Math.max(80, Math.min(w / 2 / 0.92, (h - 150) / 2 / 0.92));
    cx = w / 2;
    cy = h / 2 + Math.min(28, h * 0.03);
  }

  const P = (x, y) => [cx + x * S, cy + y * S];

  function background(time, game) {
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(w, h) * 0.6);
    bg.addColorStop(0, '#0e1a3a');
    bg.addColorStop(0.6, '#070b1f');
    bg.addColorStop(1, '#03040c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const rot = time * 0.004;
    for (const st of stars) {
      const [x, y] = P(Math.cos(st.a + rot) * st.d, Math.sin(st.a + rot) * st.d);
      if (x < 0 || x > w || y < 0 || y > h) continue;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time * 1.4 + st.tw);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, st.s, st.s);
    }
    ctx.globalAlpha = 1;

    // Le bord d'où viennent les ennemis.
    ctx.beginPath();
    ctx.arc(cx, cy, SPAWN_R * 0.97 * S, 0, TAU);
    ctx.setLineDash([S * 0.02, S * 0.04]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(248,113,113,0.18)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Les anneaux des emplacements.
    for (const r of [0.42, 0.72]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * S, 0, TAU);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(148,163,255,0.12)';
      ctx.stroke();
    }

    // D'où viendra la prochaine vague : chevrons pendant la respiration.
    const soon = nextWaveIn(game);
    if (game.status === 'running' && soon <= SCHEDULE.breather + 0.5) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 8);
      for (const e of game.nextEntries) {
        for (let i = 0; i < 3; i++) {
          const r = 1.02 - i * 0.07;
          const [x, y] = P(Math.cos(e.a) * r, Math.sin(e.a) * r);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(e.a + Math.PI);
          ctx.globalAlpha = (0.35 + 0.5 * pulse) * (1 - i * 0.25);
          ctx.beginPath();
          ctx.moveTo(S * 0.03, 0);
          ctx.lineTo(-S * 0.02, -S * 0.035);
          ctx.moveTo(S * 0.03, 0);
          ctx.lineTo(-S * 0.02, S * 0.035);
          ctx.lineWidth = Math.max(2, S * 0.012);
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#fca5a5';
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function planet(game, time, fx) {
    const R = PLANET_R * S;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(sprite('rgba(96,165,250,0.55)'), cx - R * 2.2, cy - R * 2.2, R * 4.4, R * 4.4);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, '#bfe8ff');
    body.addColorStop(0.55, '#2f8fdc');
    body.addColorStop(1, '#0b3a6b');
    ctx.fillStyle = body;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.fillStyle = 'rgba(63,191,127,0.85)';
    for (let i = 0; i < 4; i++) {
      const a = time * 0.15 + i * 1.6;
      if (Math.cos(a) < -0.2) continue;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * R * 0.5, cy + Math.sin(i * 2.2) * R * 0.45, R * 0.25 * Math.max(0.2, Math.cos(a) + 0.3), R * 0.17, i, 0, TAU);
      ctx.fill();
    }
    const shade = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.2, cx, cy, R * 1.2);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = shade;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    if (fx.planetHit > 0) {
      ctx.fillStyle = `rgba(248,113,113,${Math.min(0.6, fx.planetHit)})`;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    }
    ctx.restore();

    // La santé : un anneau autour de la planète.
    const ratio = game.health / PLANET_HEALTH;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.28, -Math.PI / 2, -Math.PI / 2 + TAU * ratio);
    ctx.lineWidth = Math.max(3, S * 0.018);
    ctx.lineCap = 'round';
    ctx.strokeStyle = ratio > 0.5 ? '#34d399' : ratio > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.stroke();

    if (game.t < game.invulnUntil) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6 + Math.sin(time * 10) * 2, 0, TAU);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(165,243,252,0.8)';
      ctx.stroke();
    }
  }

  function slots(game, ui, time) {
    const cheapest = Math.min(...[...game.unlocked].map((t) => TURRETS[t].cost));
    for (const s of SLOTS) {
      const [x, y] = P(s.x, s.y);
      const r = S * 0.06;
      const turret = game.turrets.get(s.id);
      const selected = ui.selected === s.id;
      if (!turret) {
        const affordable = game.crystals >= cheapest;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = selected ? 2.5 : 1.5;
        ctx.strokeStyle = selected ? '#fde68a' : affordable ? `rgba(253,230,138,${0.45 + 0.25 * Math.sin(time * 3)})` : 'rgba(148,163,184,0.35)';
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = selected ? '#fde68a' : 'rgba(226,232,240,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.4, y);
        ctx.lineTo(x + r * 0.4, y);
        ctx.moveTo(x, y - r * 0.4);
        ctx.lineTo(x, y + r * 0.4);
        ctx.stroke();
      }
      if (selected) {
        ctx.beginPath();
        ctx.arc(x, y, r * 1.45 + Math.sin(time * 6) * 2, 0, TAU);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(253,230,138,0.8)';
        ctx.stroke();
      }
    }
  }

  function turrets(game, ui, time) {
    for (const t of game.turrets.values()) {
      const def = TURRETS[t.type];
      const [x, y] = P(t.x, t.y);
      const r = S * 0.055;
      const range = def.range[t.level - 1] * S;
      if (ui.selected === t.id || ui.preview?.slot === t.id) {
        ctx.beginPath();
        ctx.arc(x, y, range, 0, TAU);
        ctx.fillStyle = `${def.color}14`;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `${def.color}88`;
        ctx.stroke();
      }
      if (t.type === 'frost') {
        ctx.beginPath();
        ctx.arc(x, y, range, 0, TAU);
        ctx.fillStyle = `rgba(103,232,249,${0.05 + 0.03 * Math.sin(time * 2)})`;
        ctx.fill();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite(`${hexToRgba(def.color, 0.7)}`), x - r * 1.8, y - r * 1.8, r * 3.6, r * 3.6);
      ctx.restore();
      // Socle hexagonal.
      ctx.beginPath();
      for (let i = 0; i < 6; i++) ctx.lineTo(x + Math.cos((i / 6) * TAU) * r, y + Math.sin((i / 6) * TAU) * r);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = def.color;
      ctx.stroke();
      // Tête orientée vers la cible.
      const aim = t.type === 'pulse' ? time * 2 : t.type === 'tesla' ? -time * 3 : t.aim ?? 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(aim);
      ctx.fillStyle = def.color;
      if (t.type === 'pulse' || t.type === 'tesla') {
        for (let i = 0; i < (t.type === 'tesla' ? 3 : 4); i++) {
          ctx.rotate(TAU / (t.type === 'tesla' ? 3 : 4));
          ctx.fillRect(r * 0.2, -r * 0.12, r * 0.55, r * 0.24);
        }
      } else {
        ctx.fillRect(0, -r * (t.type === 'rail' ? 0.12 : 0.18), r * (t.type === 'rail' ? 1.25 : 0.95), r * (t.type === 'rail' ? 0.24 : 0.36));
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, TAU);
      ctx.fill();
      ctx.restore();
      // Niveau : des pastilles.
      for (let i = 0; i < t.level; i++) {
        ctx.beginPath();
        ctx.arc(x - r * 0.5 + i * r * 0.5, y + r * 1.25, Math.max(2, r * 0.13), 0, TAU);
        ctx.fillStyle = '#fde68a';
        ctx.fill();
      }
    }
  }

  function enemies(game, time) {
    for (const e of game.enemies) {
      const def = ENEMIES[e.kind];
      const [ex, ey] = enemyPos(e);
      const [x, y] = P(ex, ey);
      const size = def.size * S;
      // Direction du mouvement : vers l'intérieur, en spirale.
      const heading = Math.atan2(-ey, -ex) + e.spin * 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite(hexToRgba(def.color, e.slow > 0 ? 0.35 : 0.55)), x - size * 1.8, y - size * 1.8, size * 3.6, size * 3.6);
      ctx.restore();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(heading);
      ctx.fillStyle = e.slow > 0 ? '#a5f3fc' : def.color;
      ctx.strokeStyle = 'rgba(15,23,42,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (e.kind === 'scout') {
        ctx.moveTo(size, 0); ctx.lineTo(-size * 0.8, size * 0.7); ctx.lineTo(-size * 0.4, 0); ctx.lineTo(-size * 0.8, -size * 0.7);
      } else if (e.kind === 'swarm') {
        ctx.moveTo(size, 0); ctx.lineTo(0, size * 0.7); ctx.lineTo(-size, 0); ctx.lineTo(0, -size * 0.7);
      } else if (e.kind === 'tank') {
        for (let i = 0; i < 6; i++) ctx.lineTo(Math.cos((i / 6) * TAU) * size, Math.sin((i / 6) * TAU) * size);
      } else if (e.kind === 'shield') {
        ctx.arc(0, 0, size * 0.75, 0, TAU);
      } else {
        ctx.ellipse(0, 0, size, size * 0.55, 0, 0, TAU);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (e.kind === 'shield') {
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.05, 0, TAU);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(125,211,252,${0.6 + 0.3 * Math.sin(time * 6)})`;
        ctx.stroke();
      }
      if (e.kind === 'boss') {
        ctx.fillStyle = '#fee2e2';
        ctx.beginPath();
        ctx.ellipse(size * 0.15, 0, size * 0.35, size * 0.25, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      if (e.hp < e.maxHp) {
        const bw = Math.max(16, size * 2);
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.fillRect(x - bw / 2, y - size - 7, bw, 4);
        ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#4ade80' : '#f87171';
        ctx.fillRect(x - bw / 2, y - size - 7, bw * Math.max(0, e.hp / e.maxHp), 4);
      }
    }
  }

  function beams(game) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const t of game.turrets.values()) {
      if (t.type !== 'laser' || !t.target) continue;
      const target = game.enemies.find((e) => e.id === t.target);
      if (!target) continue;
      const [x1, y1] = P(t.x, t.y);
      const [x2, y2] = P(...enemyPos(target));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = Math.max(2, S * (0.008 + 0.003 * t.level));
      ctx.strokeStyle = 'rgba(244,114,182,0.85)';
      ctx.stroke();
    }
    ctx.restore();
  }

  function effects(fx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const e of fx.effects) {
      const k = e.life / e.max;
      ctx.globalAlpha = Math.max(0, k);
      if (e.type === 'rail') {
        const [x1, y1] = P(e.x1, e.y1);
        const [x2, y2] = P(e.x2, e.y2);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.lineWidth = Math.max(2, S * 0.014) * k; ctx.strokeStyle = '#d9f99d'; ctx.stroke();
      } else if (e.type === 'tesla') {
        ctx.beginPath();
        e.points.forEach(([px, py], i) => {
          const [x, y] = P(px, py);
          if (i === 0) ctx.moveTo(x, y);
          else {
            const [ox, oy] = P(...e.points[i - 1]);
            const mx = (ox + x) / 2 + (Math.random() - 0.5) * S * 0.04;
            const my = (oy + y) / 2 + (Math.random() - 0.5) * S * 0.04;
            ctx.lineTo(mx, my);
            ctx.lineTo(x, y);
          }
        });
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#c4b5fd'; ctx.stroke();
      } else if (e.type === 'pulse') {
        const [x, y] = P(e.x, e.y);
        ctx.beginPath(); ctx.arc(x, y, e.range * S * (1.1 - k * 0.6), 0, TAU);
        ctx.lineWidth = 3 * k + 1; ctx.strokeStyle = '#fdba74'; ctx.stroke();
      } else if (e.type === 'burst') {
        const [x, y] = P(e.x, e.y);
        const r = e.size * S * (1.6 - k);
        ctx.drawImage(sprite(hexToRgba(e.color, 0.9)), x - r, y - r, r * 2, r * 2);
      }
    }
    ctx.restore();
    ctx.save();
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of fx.floaters) {
      const k = f.life / f.max;
      const [x, y] = P(f.x, f.y);
      ctx.globalAlpha = Math.min(1, k * 1.5);
      ctx.font = `900 ${Math.round(S * (f.big ? 0.07 : 0.05))}px "Space Grotesk", "Inter", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(2,6,23,0.8)';
      ctx.strokeText(f.text, x, y - (1 - k) * S * 0.1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, x, y - (1 - k) * S * 0.1);
    }
    ctx.restore();
  }

  function draw(game, fx, ui, { time, reduced }) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!reduced && fx.shake > 0.1) ctx.translate((Math.random() - 0.5) * fx.shake, (Math.random() - 0.5) * fx.shake);
    background(time, game);
    slots(game, ui, time);
    planet(game, time, fx);
    turrets(game, ui, time);
    enemies(game, time);
    beams(game);
    effects(fx);
    if (!reduced && fx.flash > 0.02) {
      ctx.globalAlpha = fx.flash;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-20, -20, w + 40, h + 40);
      ctx.globalAlpha = 1;
    }
  }

  /** Coordonnées écran → plateau (pour le toucher). */
  function unproject(px, py) {
    return [(px - cx) / S, (py - cy) / S];
  }

  return { resize, draw, unproject, project: P, get scale() { return S; } };
}

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Ce qu'une vague apporte, pour la bannière (« 10 ennemis · boss »). */
export function waveInfo(k) {
  return { enemies: enemiesIn(k), boss: k % SCHEDULE.bossEvery === 0 };
}
