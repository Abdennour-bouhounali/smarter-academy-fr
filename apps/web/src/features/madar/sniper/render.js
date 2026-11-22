import { LANES } from './constants';
import { cardY } from './sim';
import { drawMath, mathHeight, measureMath } from './mathDraw';

/**
 * Le rendu de « قنّاص القيم » au canevas 2D — dessiné en code, sans image.
 *
 * Un champ d'astéroïdes qui tombent vers une base au sol ; chaque astéroïde
 * porte une PLAQUE BLANCHE où l'expression s'écrit en noir (les maths se
 * lisent noir sur blanc). Le canon de la base tire vers la carte touchée.
 * Le champ garde une largeur lisible sur un grand écran ; sur un téléphone il
 * prend toute la largeur et le texte se resserre pour tenir dans la plaque.
 *
 * Mêmes règles que les autres jeux : pas de `shadowBlur`, texte en LTR.
 */
const TAU = Math.PI * 2;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Le contour irrégulier d'un astéroïde, toujours le même pour la même carte. */
function rockShape(id) {
  let s = hash(id) || 1;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from({ length: 11 }, (_, i) => ({ a: (i / 11) * TAU, r: 0.82 + rand() * 0.22 }));
}

export function createSniperRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  const L = { top: 0, ground: 0, left: 0, field: 0, plateW: 0, base: 18 };
  let seed = 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = Array.from({ length: 140 }, () => ({ x: rand(), y: rand(), s: 0.5 + rand() * 1.6, v: 0.004 + rand() * 0.02, tw: rand() * TAU }));
  const shapes = new Map();
  const fits = new Map();

  function resize(width, height, ratio) {
    w = width;
    h = height;
    dpr = Math.min(ratio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    L.field = Math.min(w - 16, 820);
    L.left = (w - L.field) / 2;
    L.top = Math.max(150, Math.min(220, h * 0.25));
    L.ground = h - Math.max(64, h * 0.1);
    L.plateW = Math.min((L.field / LANES) * 1.55, 250);
    L.base = Math.max(16, Math.min(26, (L.field / LANES) * 0.2));
    fits.clear();
  }

  const laneX = (lane) => L.left + ((lane + 0.5) * L.field) / LANES;

  /** La taille du texte d'une carte, réduite si l'expression est longue. */
  function fitSize(card) {
    if (fits.has(card.id)) return fits.get(card.id);
    const width = measureMath(ctx, card.tokens, L.base);
    const room = L.plateW - 22;
    const size = width > room ? Math.max(11, (L.base * room) / width) : L.base;
    fits.set(card.id, size);
    return size;
  }

  /** Où est la carte (centre, taille de la plaque) à l'instant t. */
  function cardBox(card, t) {
    const size = fitSize(card);
    const ph = mathHeight(card.tokens, size) + 14;
    const y = L.top + cardY(card, t) * (L.ground - L.top);
    const half = L.plateW / 2;
    const x = Math.min(w - half - 6, Math.max(half + 6, laneX(card.lane)));
    return { x, y, w: L.plateW, h: ph, size };
  }

  /** La carte sous le doigt (la plus proche si deux plaques se touchent). */
  function pick(game, px, py) {
    let best = null;
    let bd = Infinity;
    for (const c of game.cards) {
      if (c.state !== 'falling') continue;
      const b = cardBox(c, game.t);
      const pad = 10;
      if (Math.abs(px - b.x) <= b.w / 2 + pad && Math.abs(py - b.y) <= b.h / 2 + pad + 8) {
        const d = (px - b.x) ** 2 + (py - b.y) ** 2;
        if (d < bd) { bd = d; best = c.id; }
      }
    }
    return best;
  }

  const cannon = () => [w / 2, L.ground + 6];

  function background(time) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b0f2e');
    bg.addColorStop(0.65, '#120a2a');
    bg.addColorStop(1, '#1d0d22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (const st of stars) {
      const y = ((st.y + time * st.v) % 1) * h;
      ctx.globalAlpha = 0.3 + 0.35 * Math.sin(time * 1.3 + st.tw);
      ctx.fillStyle = '#fff';
      ctx.fillRect(st.x * w, y, st.s, st.s);
    }
    ctx.globalAlpha = 1;

    // Les couloirs, à peine visibles.
    ctx.strokeStyle = 'rgba(148,163,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i += 1) {
      const x = L.left + (i * L.field) / LANES;
      ctx.beginPath();
      ctx.moveTo(x, L.top - 30);
      ctx.lineTo(x, L.ground);
      ctx.stroke();
    }
  }

  function ground(time, fx) {
    // La surface de la planète : un grand arc.
    const R = Math.max(w, 600) * 1.4;
    const cy = L.ground + R - 18;
    const g = ctx.createRadialGradient(w / 2, cy, R - 40, w / 2, cy, R);
    g.addColorStop(0, '#3b2a55');
    g.addColorStop(1, '#6d4c8f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, cy, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = fx.groundHit > 0 ? `rgba(248,113,113,${0.4 + fx.groundHit})` : 'rgba(196,181,253,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, cy, R, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    // Le canon : il regarde la dernière cible.
    const [x, y] = cannon();
    const aim = fx.aim ?? -Math.PI / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#c4b5fd';
    ctx.beginPath();
    ctx.arc(0, 0, 22, Math.PI, 0);
    ctx.fill();
    ctx.rotate(aim + Math.PI / 2);
    ctx.fillStyle = '#e9d5ff';
    ctx.fillRect(-5, -38, 10, 30);
    ctx.fillStyle = '#fde68a';
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time * 6);
    ctx.fillRect(-3, -40, 6, 4);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function rock(card, b, time, danger) {
    if (!shapes.has(card.id)) shapes.set(card.id, rockShape(card.id));
    const pts = shapes.get(card.id);
    const rx = b.w * 0.56;
    const ry = b.h * 0.95;
    const spin = Math.sin(time * 0.8 + (hash(card.id) % 10)) * 0.04;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(spin);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = Math.cos(p.a) * rx * p.r;
      const y = Math.sin(p.a) * ry * p.r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -ry, 0, ry);
    g.addColorStop(0, '#8b7d72');
    g.addColorStop(1, '#4a3f3a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = danger ? 3 : 1.5;
    ctx.strokeStyle = danger ? `rgba(251,191,36,${0.55 + 0.45 * Math.sin(time * 10)})` : 'rgba(0,0,0,0.35)';
    ctx.stroke();
    // Deux cratères.
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.arc(-rx * 0.62, -ry * 0.35, ry * 0.12, 0, TAU);
    ctx.arc(rx * 0.66, ry * 0.3, ry * 0.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function plate(x, y, pw, ph, fill = '#ffffff', stroke = 'rgba(15,23,42,0.15)') {
    const r = Math.min(14, ph / 2);
    ctx.beginPath();
    ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function cardPlate(card, b) {
    const pw = b.w - 18;
    plate(b.x, b.y, pw, b.h);
    const width = measureMath(ctx, card.tokens, b.size);
    const hasFrac = card.tokens.some((t) => t && t.frac);
    drawMath(ctx, card.tokens, b.x - width / 2, b.y + b.size * (hasFrac ? 0.3 : 0.36), b.size);
  }

  function effects(fx, reduced) {
    for (const e of fx.effects) {
      const k = e.life / e.max;
      if (e.type === 'laser') {
        const [x, y] = cannon();
        ctx.strokeStyle = `rgba(253,230,138,${k})`;
        ctx.lineWidth = 2 + 4 * k;
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      } else if (e.type === 'burst' || e.type === 'shatter') {
        const n = reduced ? 6 : 14;
        ctx.fillStyle = e.type === 'burst' ? `rgba(253,230,138,${k})` : `rgba(248,113,113,${k})`;
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * TAU + e.seed;
          const d = (1 - k) * e.size;
          ctx.fillRect(e.x + Math.cos(a) * d - 3, e.y + Math.sin(a) * d - 3, 6 * k + 2, 6 * k + 2);
        }
      } else if (e.type === 'ring') {
        ctx.strokeStyle = `rgba(134,239,172,${k})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, (1 - k) * e.size + 10, 0, TAU);
        ctx.stroke();
      }
    }
  }

  function floaters(fx) {
    for (const f of fx.floaters) {
      const k = f.life / f.max;
      const y = f.y - (1 - k) * 40;
      ctx.globalAlpha = Math.min(1, k * 2);
      if (f.tokens) {
        // « = ما تساويه حقًّا » : la vraie valeur d'un piège touché, ou la cible manquée.
        const size = 18;
        const tw = measureMath(ctx, f.tokens, size) + (f.prefix ? 22 : 0);
        const ph = mathHeight(f.tokens, size) + 12;
        plate(f.x, y, tw + 24, ph, f.fill, f.stroke);
        let x = f.x - tw / 2;
        if (f.prefix) {
          drawMath(ctx, [f.prefix], x, y + 6, size, f.color);
          x += 22;
        }
        drawMath(ctx, f.tokens, x, y + size * 0.34, size, f.color);
      } else {
        ctx.save();
        ctx.direction = 'ltr';
        ctx.textAlign = 'center';
        ctx.font = `900 ${f.big ? 30 : 22}px "Space Grotesk", Inter, sans-serif`;
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, y);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  function draw(game, fx, { time, reduced }) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const shake = !reduced && fx.shake > 0.3 ? fx.shake : 0;
    ctx.save();
    if (shake) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    background(time);
    for (const c of game.cards) {
      if (c.state !== 'falling') continue;
      const b = cardBox(c, game.t);
      rock(c, b, time, cardY(c, game.t) > 0.78);
      cardPlate(c, b);
    }
    ground(time, fx);
    effects(fx, reduced);
    floaters(fx);
    ctx.restore();
    if (!reduced && fx.flash > 0.02) {
      ctx.fillStyle = `rgba(248,113,113,${Math.min(0.35, fx.flash)})`;
      ctx.fillRect(0, 0, w, h);
    }
    // Les formes des cartes disparues ne restent pas en mémoire.
    if (shapes.size > 64) {
      const live = new Set(game.cards.map((c) => c.id));
      for (const id of shapes.keys()) if (!live.has(id)) { shapes.delete(id); fits.delete(id); }
    }
  }

  return { resize, draw, pick, cardBox, cannon, layout: () => ({ ...L }) };
}
