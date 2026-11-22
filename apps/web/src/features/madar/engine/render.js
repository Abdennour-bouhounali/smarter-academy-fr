import { LANE_R, SPAWN_AHEAD, sectorAt } from './constants.js';
import { shipById } from './ships.js';

/**
 * Le rendu de « مدار » au canevas 2D — dessiné en code, paramétré par l'état
 * du monde, sans aucune image.
 *
 * Caméra : le vaisseau reste EN BAS de l'orbite, à portée de pouce ; c'est le
 * monde qui tourne. Un angle du monde α s'affiche en  s = α − θ + π/2  (le bas
 * de l'écran est π/2, l'axe y descend) : ce qui arrive vient de la GAUCHE et
 * descend vers le vaisseau — le sens de lecture de l'arabe.
 *
 * Coûts : pas de `shadowBlur` (ruineux sur téléphone) ; les halos sont des
 * sprites pré-rendus posés en mode additif ; le fond (nébuleuse) est rendu
 * une fois par secteur dans un canevas hors écran.
 */

const TAU = Math.PI * 2;

function glowSprite(color, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color.replace(/[\d.]+\)$/, '0.35)'));
  grad.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function makeStarfield(rng, count, spread) {
  return Array.from({ length: count }, () => ({
    a: rng() * TAU,
    d: Math.sqrt(rng()) * spread,
    size: 0.4 + rng() * 1.3,
    tw: rng() * TAU,
    hue: rng() < 0.15 ? 200 + rng() * 60 : 0,
  }));
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  let R = 100;
  let cx = 0;
  let cy = 0;
  let seedRand = 1234567;
  const rand = () => {
    seedRand = (seedRand * 16807) % 2147483647;
    return (seedRand - 1) / 2147483646;
  };
  const layers = [makeStarfield(rand, 140, 1), makeStarfield(rand, 70, 1), makeStarfield(rand, 28, 1)];
  const sprites = {
    gold: glowSprite('rgba(253, 224, 71, 1)'),
    cyan: glowSprite('rgba(103, 232, 249, 1)'),
    red: glowSprite('rgba(248, 113, 113, 1)'),
    white: glowSprite('rgba(255, 255, 255, 1)'),
    orange: glowSprite('rgba(251, 146, 60, 1)'),
  };
  const shipGlow = new Map();
  let nebula = null;
  let nebulaSector = -1;
  let hue = sectorAt(0).hue;

  function resize(width, height, ratio) {
    w = width;
    h = height;
    dpr = Math.min(ratio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // L'orbite tient dans l'écran avec les deux couloirs et le vaisseau, en
    // portrait (téléphone) comme en paysage (ordinateur).
    R = Math.max(60, Math.min(w * 0.36, h * 0.34));
    cx = w / 2;
    cy = h / 2 + Math.min(h * 0.03, 24);
    nebulaSector = -1;
  }

  function buildNebula(sector) {
    const s = sectorAt(sector);
    const c = document.createElement('canvas');
    const size = Math.ceil(Math.hypot(w, h));
    c.width = c.height = Math.max(64, Math.round(size * 0.5));
    const g = c.getContext('2d');
    const k = c.width;
    const blobs = [
      [0.3, 0.35, 0.55, s.hue, 0.22],
      [0.72, 0.62, 0.5, (s.hue + 40) % 360, 0.16],
      [0.5, 0.85, 0.45, (s.hue + 300) % 360, 0.12],
      [0.18, 0.78, 0.3, (s.hue + 180) % 360, 0.08],
    ];
    for (const [x, y, r, hh, a] of blobs) {
      const grad = g.createRadialGradient(x * k, y * k, 0, x * k, y * k, r * k);
      grad.addColorStop(0, `hsla(${hh}, 85%, 60%, ${a})`);
      grad.addColorStop(1, `hsla(${hh}, 85%, 40%, 0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, k, k);
    }
    nebula = c;
    nebulaSector = sector;
  }

  const screenAngle = (alpha, theta) => alpha - theta + Math.PI / 2;
  const polar = (s, r) => [cx + Math.cos(s) * r * R, cy + Math.sin(s) * r * R];

  function drawBackground(world, time) {
    const target = sectorAt(world.sector).hue;
    const diff = ((target - hue + 540) % 360) - 180;
    hue = (hue + diff * 0.02 + 360) % 360;

    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(w, h) * 0.65);
    bg.addColorStop(0, `hsl(${hue}, 45%, 12%)`);
    bg.addColorStop(0.55, `hsl(${(hue + 20) % 360}, 50%, 6%)`);
    bg.addColorStop(1, 'hsl(240, 40%, 3%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (nebulaSector !== world.sector) buildNebula(world.sector);
    const size = Math.hypot(w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-world.theta * 0.015);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(nebula, -size / 2, -size / 2, size, size);
    ctx.restore();

    // Trois couches d'étoiles qui tournent à des vitesses différentes : la profondeur.
    const spread = Math.hypot(w, h) * 0.6;
    const speeds = [0.04, 0.09, 0.17];
    ctx.save();
    for (let l = 0; l < layers.length; l++) {
      const rot = -world.theta * speeds[l];
      for (const st of layers[l]) {
        const a = st.a + rot;
        const x = cx + Math.cos(a) * st.d * spread;
        const y = cy + Math.sin(a) * st.d * spread;
        if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;
        const twinkle = 0.55 + 0.45 * Math.sin(time * (1.5 + l) + st.tw);
        ctx.globalAlpha = (0.35 + l * 0.25) * twinkle;
        ctx.fillStyle = st.hue ? `hsl(${st.hue}, 90%, 85%)` : '#fff';
        const s = st.size * (1 + l * 0.45);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
    ctx.restore();
  }

  function drawPlanet(world, time) {
    const s = sectorAt(world.sector);
    const P = R * 0.42;
    const [c0, c1, c2] = s.planet;

    // Halo d'atmosphère.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(cx, cy, P * 0.9, cx, cy, P * 1.55);
    halo.addColorStop(0, `${c1}55`);
    halo.addColorStop(1, `${c1}00`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, P * 1.55, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (s.ring) drawRing(P, c1, true);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, P, 0, TAU);
    ctx.clip();
    const body = ctx.createRadialGradient(cx - P * 0.35, cy - P * 0.4, P * 0.1, cx, cy, P * 1.05);
    body.addColorStop(0, c0);
    body.addColorStop(0.55, c1);
    body.addColorStop(1, c2);
    ctx.fillStyle = body;
    ctx.fillRect(cx - P, cy - P, P * 2, P * 2);

    // La surface tourne lentement : bandes, continents ou cratères.
    const spin = world.theta * 0.12 + time * 0.03;
    if (s.bands || s.id === 'saturn') {
      for (let i = -4; i <= 4; i++) {
        ctx.fillStyle = i % 2 ? `${c2}33` : `${c0}22`;
        const y = cy + i * P * 0.22 + Math.sin(spin + i) * P * 0.03;
        ctx.fillRect(cx - P, y, P * 2, P * 0.12);
      }
    } else if (s.land) {
      ctx.fillStyle = `${s.land}cc`;
      for (let i = 0; i < 5; i++) {
        const a = spin * 1.6 + i * 1.3;
        const x = cx + Math.cos(a) * P * 0.55;
        const y = cy + Math.sin(i * 2.1) * P * 0.45;
        if (Math.cos(a) < -0.2) continue;
        ctx.beginPath();
        ctx.ellipse(x, y, P * (0.22 + (i % 3) * 0.06) * Math.max(0.2, Math.cos(a) + 0.2), P * 0.16, i, 0, TAU);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = `${c2}40`;
      for (let i = 0; i < 6; i++) {
        const a = spin * 1.4 + i * 1.05;
        if (Math.cos(a) < -0.1) continue;
        const x = cx + Math.cos(a) * P * 0.7;
        const y = cy + Math.sin(i * 2.4) * P * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, P * (0.06 + (i % 3) * 0.04) * (0.4 + Math.cos(a) * 0.6), 0, TAU);
        ctx.fill();
      }
    }
    // Le terminateur : l'ombre côté opposé à la lumière.
    const shade = ctx.createRadialGradient(cx - P * 0.45, cy - P * 0.5, P * 0.2, cx, cy, P * 1.25);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(0.7, 'rgba(0,0,0,0.25)');
    shade.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = shade;
    ctx.fillRect(cx - P, cy - P, P * 2, P * 2);
    ctx.restore();

    if (s.ring) drawRing(P, c1, false);
  }

  function drawRing(P, color, back) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.35);
    ctx.scale(1, 0.28);
    ctx.beginPath();
    if (back) ctx.arc(0, 0, P * 1.7, Math.PI, TAU);
    else ctx.arc(0, 0, P * 1.7, 0, Math.PI);
    ctx.lineWidth = P * 0.22;
    ctx.strokeStyle = `${color}88`;
    ctx.stroke();
    ctx.lineWidth = P * 0.06;
    ctx.strokeStyle = `${color}cc`;
    ctx.stroke();
    ctx.restore();
  }

  function drawLanes(world) {
    ctx.save();
    for (let l = 0; l < 2; l++) {
      const r = LANE_R[l] * R;
      const active = world.lane === l;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.lineWidth = Math.max(1.5, R * 0.012);
      ctx.strokeStyle = `hsla(${hue}, 80%, 75%, ${active ? 0.28 : 0.12})`;
      ctx.stroke();
      // Le mouvement : des tirets qui défilent avec le monde.
      ctx.setLineDash([R * 0.02, R * 0.09]);
      ctx.lineDashOffset = -world.theta * r;
      ctx.lineWidth = Math.max(1, R * 0.008);
      ctx.strokeStyle = `rgba(255,255,255,${active ? 0.35 : 0.14})`;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function fadeAhead(delta) {
    if (delta > SPAWN_AHEAD - 0.6) return Math.max(0, (SPAWN_AHEAD - delta) / 0.6);
    return 1;
  }

  function drawRock(x, y, radius, shape, rot, palette) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    shape.forEach((k, i) => {
      const a = (i / shape.length) * TAU;
      const px = Math.cos(a) * radius * k;
      const py = Math.sin(a) * radius * k;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    const g = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.1, 0, 0, radius * 1.1);
    g.addColorStop(0, palette[0]);
    g.addColorStop(0.6, palette[1]);
    g.addColorStop(1, palette[2]);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.strokeStyle = 'rgba(255, 140, 120, 0.55)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(radius * 0.25, radius * 0.1, radius * 0.18, 0, TAU);
    ctx.arc(-radius * 0.2, radius * 0.35, radius * 0.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  const ROCK = ['#c9b8a8', '#7a6658', '#2f2520'];
  const COMET = ['#ffe1c2', '#e2774a', '#5e2410'];

  function drawObstacles(world, time) {
    for (const o of world.obstacles) {
      if (o.hit) continue;
      const delta = o.start - world.theta;
      if (delta > SPAWN_AHEAD + 0.1 || o.end < world.theta - 1.2) continue;
      const alpha = fadeAhead(delta);
      let laneR = LANE_R[o.lane];
      if (o.kind === 'comet' && o.hopped) {
        const k = Math.min(1, (world.t - o.hopStartT) / 0.22);
        laneR = LANE_R[o.fromLane] + (LANE_R[o.lane] - LANE_R[o.fromLane]) * k;
      }
      ctx.save();
      ctx.globalAlpha = alpha;

      if (o.kind === 'wall') {
        const s0 = screenAngle(o.start, world.theta);
        const s1 = screenAngle(o.end, world.theta);
        // Lueur rouge dessous : « ne passe pas ici ».
        ctx.beginPath();
        ctx.arc(cx, cy, laneR * R, s0, s1);
        ctx.lineCap = 'round';
        ctx.lineWidth = R * 0.15;
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.18)';
        ctx.stroke();
        const n = Math.max(3, Math.round((o.end - o.start) / 0.07));
        for (let i = 0; i <= n; i++) {
          const a = o.start + ((o.end - o.start) * i) / n;
          const [x, y] = polar(screenAngle(a, world.theta), laneR + Math.sin(i * 2.7) * 0.02);
          const k = o.shape[i % o.shape.length];
          drawRock(x, y, R * 0.045 * (0.75 + k * 0.5), o.shape, i + time * o.spin * 0.3, ROCK);
        }
      } else {
        const mid = (o.start + o.end) / 2;
        const s = screenAngle(mid, world.theta);
        const [x, y] = polar(s, laneR);
        const radius = ((o.end - o.start) * laneR * R) / 2 + R * 0.012;
        if (o.kind === 'comet') {
          // La traîne, puis — avant le saut — l'avertissement sur l'autre couloir.
          const tail = ctx.createLinearGradient(x, y, ...polar(s + 0.35, laneR));
          tail.addColorStop(0, 'rgba(251, 146, 60, 0.75)');
          tail.addColorStop(1, 'rgba(251, 146, 60, 0)');
          ctx.beginPath();
          ctx.arc(cx, cy, laneR * R, s, s + 0.35);
          ctx.lineWidth = radius * 1.4;
          ctx.lineCap = 'round';
          ctx.strokeStyle = tail;
          ctx.stroke();
          if (!o.hopped && delta < o.hopAt + 0.9) {
            const pulse = 0.45 + 0.45 * Math.sin(time * 18);
            ctx.save();
            ctx.globalAlpha = alpha * pulse;
            ctx.setLineDash([R * 0.03, R * 0.025]);
            ctx.beginPath();
            ctx.arc(cx, cy, LANE_R[1 - o.lane] * R, s - 0.12, s + 0.12);
            ctx.lineWidth = R * 0.05;
            ctx.strokeStyle = '#f87171';
            ctx.stroke();
            ctx.restore();
          }
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(sprites.orange, x - radius * 2, y - radius * 2, radius * 4, radius * 4);
          ctx.globalCompositeOperation = 'source-over';
        }
        drawRock(x, y, radius, o.shape, time * o.spin, o.kind === 'comet' ? COMET : ROCK);
      }
      ctx.restore();
    }
  }

  function drawStar(x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? size * 0.45 : size;
      const a = (i / 10) * TAU - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -size, 0, size);
    g.addColorStop(0, '#fff7c2');
    g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function drawPickups(world, time) {
    for (const p of world.pickups) {
      if (p.taken) continue;
      const delta = p.at - world.theta;
      if (delta > SPAWN_AHEAD + 0.1 || delta < -0.8) continue;
      const alpha = fadeAhead(delta) * (p.missed ? 0.35 : 1);
      const [x, y] = polar(screenAngle(p.at, world.theta), LANE_R[p.lane]);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'shield') {
        const pulse = 1 + 0.1 * Math.sin(time * 6);
        const r = R * 0.06 * pulse;
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(sprites.cyan, x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) ctx.lineTo(x + Math.cos((i / 6) * TAU + time) * r, y + Math.sin((i / 6) * TAU + time) * r);
        ctx.closePath();
        ctx.fillStyle = 'rgba(165, 243, 252, 0.35)';
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, R * 0.01);
        ctx.strokeStyle = '#a5f3fc';
        ctx.stroke();
      } else {
        const size = R * 0.042 * (1 + 0.08 * Math.sin(time * 5 + p.at));
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(sprites.gold, x - size * 2.4, y - size * 2.4, size * 4.8, size * 4.8);
        ctx.globalCompositeOperation = 'source-over';
        drawStar(x, y, size, time * 1.5 + p.at);
      }
      ctx.restore();
    }
  }

  function drawTrail(world, fx, ship) {
    const pts = fx.trail;
    if (pts.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const k = i / pts.length;
      const [x0, y0] = polar(screenAngle(a.theta, world.theta), a.r);
      const [x1, y1] = polar(screenAngle(b.theta, world.theta), b.r);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineWidth = R * (ship.longTrail ? 0.05 : 0.035) * k;
      ctx.strokeStyle = ship.colors.trail === 'rainbow'
        ? `hsla(${(i * 12 + world.t * 120) % 360}, 95%, 65%, ${k * 0.8})`
        : hexA(ship.colors.trail, k * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  function glowFor(color) {
    if (!shipGlow.has(color)) shipGlow.set(color, glowSprite(hexToRgba(color, 1)));
    return shipGlow.get(color);
  }

  function drawShip(world, fx, ship, time) {
    const s = Math.PI / 2;
    const [x, y] = polar(s, world.r);
    const size = R * 0.085;
    const flipping = world.flipT < 1 ? Math.sin(Math.PI * world.flipT) : 0;
    const dir = world.lane === 1 ? 1 : -1;
    const tilt = dir * flipping * 0.45;
    const angle = s + Math.PI / 2 + tilt; // nez dans le sens du mouvement (vers la gauche en bas)
    const invuln = world.t < world.invulnUntil;
    if (invuln && Math.floor(time * 14) % 2 === 0) return [x, y];

    ctx.save();
    ctx.translate(x, y);
    ctx.globalCompositeOperation = 'lighter';
    const glow = glowFor(ship.colors.accent);
    ctx.drawImage(glow, -size * 2.2, -size * 2.2, size * 4.4, size * 4.4);
    ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(angle);

    // La flamme : vacille, s'allonge avec la vitesse.
    const flick = 0.75 + 0.25 * Math.sin(time * 40) + 0.1 * Math.sin(time * 23);
    const len = size * (0.7 + world.omega * 0.18) * flick;
    const flame = ctx.createLinearGradient(-size * 0.75, 0, -size * 0.75 - len, 0);
    flame.addColorStop(0, ship.colors.flame[0]);
    flame.addColorStop(0.4, ship.colors.flame[1]);
    flame.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(-size * 0.72, -size * 0.2);
    ctx.quadraticCurveTo(-size * 0.75 - len * 0.6, 0, -size * 0.72, size * 0.2);
    ctx.lineTo(-size * 0.75 - len, 0);
    ctx.closePath();
    ctx.fillStyle = flame;
    ctx.fill();

    ctx.beginPath();
    ship.hull.forEach(([hx, hy], i) => (i === 0 ? ctx.moveTo(hx * size, hy * size) : ctx.lineTo(hx * size, hy * size)));
    ctx.closePath();
    const body = ctx.createLinearGradient(0, -size, 0, size);
    body.addColorStop(0, '#ffffff');
    body.addColorStop(0.5, ship.colors.body);
    body.addColorStop(1, ship.colors.accent);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, size * 0.07);
    ctx.strokeStyle = ship.colors.accent;
    ctx.stroke();
    const [kx, ky, kw, kh] = ship.cockpit;
    ctx.beginPath();
    ctx.ellipse(kx * size, ky * size, kw * size, kh * size, 0, 0, TAU);
    const glass = ctx.createLinearGradient(0, -kh * size, 0, kh * size);
    glass.addColorStop(0, '#ffffff');
    glass.addColorStop(1, ship.colors.cockpit);
    ctx.fillStyle = glass;
    ctx.fill();
    ctx.restore();

    if (world.shield) {
      const r = size * 1.55;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprites.cyan, x - r * 1.4, y - r * 1.4, r * 2.8, r * 2.8);
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.lineWidth = Math.max(1.5, size * 0.08);
      ctx.strokeStyle = `rgba(165, 243, 252, ${0.55 + 0.3 * Math.sin(time * 8)})`;
      ctx.stroke();
      ctx.restore();
    }
    return [x, y];
  }

  function drawParticles(fx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of fx.particles) {
      const k = p.life / p.max;
      ctx.globalAlpha = Math.max(0, k);
      const r = p.size * (0.4 + k * 0.6);
      ctx.drawImage(sprites[p.sprite] ?? sprites.white, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.restore();
    ctx.save();
    // Le canevas hérite du `dir="rtl"` de la page : « +3 » s'afficherait « 3+ ».
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of fx.floaters) {
      const k = f.life / f.max;
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.font = `900 ${Math.round(R * (0.085 + (f.big ? 0.04 : 0)))}px "Space Grotesk", "Inter", sans-serif`;
      ctx.lineWidth = Math.max(2, R * 0.014);
      ctx.strokeStyle = 'rgba(15, 10, 40, 0.75)';
      ctx.strokeText(f.text, f.x, f.y - (1 - k) * R * 0.25);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - (1 - k) * R * 0.25);
    }
    ctx.restore();
  }

  /**
   * Une image. `fx` porte ce qui n'est pas du monde : traînée, particules,
   * secousse, éclair. Renvoie la position écran du vaisseau (pour les éclats).
   */
  function draw(world, fx, { shipId, time, reduced }) {
    const ship = shipById(shipId);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let ox = 0;
    let oy = 0;
    if (!reduced && fx.shake > 0.05) {
      ox = (Math.random() - 0.5) * fx.shake;
      oy = (Math.random() - 0.5) * fx.shake;
    }
    ctx.translate(ox, oy);
    drawBackground(world, time);
    drawPlanet(world, time);
    drawLanes(world);
    drawPickups(world, time);
    drawObstacles(world, time);
    drawTrail(world, fx, ship);
    const pos = world.status === 'crashed' ? polar(Math.PI / 2, world.r) : drawShip(world, fx, ship, time);
    drawParticles(fx);
    if (!reduced && fx.flash > 0.01) {
      ctx.fillStyle = fx.flashColor ?? 'rgba(255,255,255,1)';
      ctx.globalAlpha = fx.flash;
      ctx.fillRect(-20, -20, w + 40, h + 40);
      ctx.globalAlpha = 1;
    }
    // Vignette : le regard au centre.
    const v = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.35, cx, cy, Math.hypot(w, h) * 0.6);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(-20, -20, w + 40, h + 40);
    return pos;
  }

  /** Position écran d'un objet du monde (pour poser un éclat là où l'étoile a été prise). */
  function project(world, alpha, laneR) {
    return polar(screenAngle(alpha, world.theta), laneR);
  }

  return { resize, draw, project, get radius() { return R; } };
}

function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function hexA(hex, a) {
  return hexToRgba(hex, a.toFixed(3));
}
