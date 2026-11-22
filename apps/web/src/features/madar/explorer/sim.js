import LEVELS from '../../../../../api/resources/games/explorer/levels.json';

/**
 * « L’explorateur » — le jeu de plates-formes de « Espace jeux ». Une simulation
 * PURE (aucun DOM, aucune horloge), à pas fixe.
 *
 * Les cartes, la physique et le barème viennent du fichier COMMUN avec l'API
 * (apps/api/resources/games/explorer/levels.json) : le serveur borne le score
 * par le maximum du niveau et refuse un « terminé » plus rapide que la carte ne
 * le permet. Repère : x vers l'avant du niveau (le rendu le dessine de GAUCHE
 * à DROITE : on avance vers la droite), y vers le bas, une tuile = 1.
 *
 *   createExplorer(n)        le niveau n
 *   step(game, dt, input)    input = { forward, back, jump } ; renvoie les événements
 *   revive(game)             reprise à la dernière balise
 *   scoreOf(game), resultOf(game)
 */
export const PHYSICS = LEVELS.physics;
export const SCORING = LEVELS.scoring;
export const LEVEL_COUNT = LEVELS.levels.length;
export const H = 14;

/**
 * Le clavier → les commandes de `step`. Le palier avance vers la DROITE de
 * l'écran (la page se lit de gauche à droite) : → ou D fait avancer, ← ou A
 * fait reculer. Choix verrouillé par `render.test.js`.
 */
export const INPUT_KEYS = Object.freeze({
  ArrowRight: 'forward', d: 'forward', D: 'forward',
  ArrowLeft: 'back', a: 'back', A: 'back',
  ' ': 'jump', ArrowUp: 'jump', w: 'jump', W: 'jump',
});
const STEP = 1 / 120;

const SOLID = new Set(['#', 'B', '?', 'U', 'P', 'S']);

export function levelData(n) {
  return LEVELS.levels.find((l) => l.n === n) ?? null;
}

const ENEMY = {
  e: { kind: 'slime', w: 0.8, h: 0.62, speed: 1.6, stompable: true },
  k: { kind: 'crawler', w: 0.86, h: 0.62, speed: 2.1, stompable: false },
  f: { kind: 'drone', w: 0.86, h: 0.55, speed: 0, stompable: true },
};

export function createExplorer(n) {
  const level = levelData(n);
  if (!level) throw new Error(`unknown level ${n}`);
  const grid = level.rows.map((r) => r.split(''));
  const width = grid[0].length;
  const crystals = [];
  const enemies = [];
  let start = { x: 1, y: 10 };
  let goal = null;
  const checkpoints = [];
  let blocks = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid[y][x];
      if (ch === '@') { start = { x, y }; grid[y][x] = '.'; }
      else if (ch === 'c') { crystals.push({ x: x + 0.5, y: y + 0.5, taken: false }); grid[y][x] = '.'; }
      else if (ch === 'C') { checkpoints.push({ x, y, reached: false }); grid[y][x] = '.'; }
      else if (ch === 'G') { goal = { x, y }; grid[y][x] = '.'; }
      else if (ENEMY[ch]) {
        const def = ENEMY[ch];
        enemies.push({ ...def, x: x + (1 - def.w) / 2, y: y + 1 - def.h, vx: -def.speed, vy: 0, baseX: x, baseY: y, phase: x * 0.7, alive: true });
        grid[y][x] = '.';
      } else if (ch === '?') blocks += 1;
    }
  }
  const p = PHYSICS;
  return {
    n, world: level.world, grid, width, time: level.time, timeLeft: level.time,
    crystals, enemies, checkpoints, goal, totalCrystals: crystals.length + blocks,
    player: { x: start.x + (1 - p.playerW) / 2, y: start.y + 1 - p.playerH, vx: 0, vy: 0, onGround: false, facing: 1, coyote: 0, buffer: 0, cut: false, shield: false, invuln: 0, runPhase: 0 },
    respawn: { x: start.x + (1 - p.playerW) / 2, y: start.y + 1 - p.playerH },
    status: 'running', cause: null, t: 0,
    pts: { crystal: 0, block: 0, enemy: 0, power: 0, complete: 0, time: 0 },
    collected: 0, kills: 0, jumpWasDown: false,
  };
}

export function scoreOf(g) {
  const s = g.pts;
  return s.crystal + s.block + s.enemy + s.power + s.complete + s.time;
}

export function resultOf(g) {
  return { score: scoreOf(g), crystals: g.collected, totalCrystals: g.totalCrystals, kills: g.kills, completed: g.status === 'won', level: g.n };
}

const tileAt = (g, x, y) => (y < 0 ? '.' : y >= H || x < 0 || x >= g.width ? (y >= H ? '.' : '#') : g.grid[y][x]);
const solidAt = (g, x, y) => SOLID.has(tileAt(g, x, y));

/** Les tuiles couvertes par une boîte. */
function cells(box) {
  const out = [];
  for (let y = Math.floor(box.y); y <= Math.floor(box.y + box.h - 1e-6); y++) {
    for (let x = Math.floor(box.x); x <= Math.floor(box.x + box.w - 1e-6); x++) out.push([x, y]);
  }
  return out;
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function step(g, dt, input = {}) {
  const events = [];
  let remaining = Math.min(dt, 0.1);
  while (remaining > 1e-9 && g.status === 'running') {
    const s = Math.min(STEP, remaining);
    remaining -= s;
    tick(g, s, input, events);
  }
  return events;
}

function hurt(g, events, cause) {
  const pl = g.player;
  if (pl.invuln > 0) return;
  if (pl.shield) {
    pl.shield = false;
    pl.invuln = 1.5;
    events.push({ type: 'shieldBreak' });
    return;
  }
  die(g, events, cause);
}

function die(g, events, cause) {
  g.status = 'dead';
  g.cause = cause;
  events.push({ type: 'death', cause, x: g.player.x, y: g.player.y });
}

function tick(g, s, input, events) {
  const p = PHYSICS;
  const pl = g.player;
  g.t += s;
  g.timeLeft -= s;
  if (g.timeLeft <= 0) { g.timeLeft = 0; die(g, events, 'time'); return; }
  pl.invuln = Math.max(0, pl.invuln - s);

  // ── Horizontal ──
  const dir = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
  if (dir !== 0) {
    pl.facing = dir;
    pl.vx += Math.sign(dir * p.runSpeed - pl.vx) * Math.min(Math.abs(dir * p.runSpeed - pl.vx), p.accel * s);
  } else {
    pl.vx -= Math.sign(pl.vx) * Math.min(Math.abs(pl.vx), p.friction * s);
  }
  pl.runPhase += Math.abs(pl.vx) * s * 1.6;

  // ── Saut : tampon, temps de grâce, hauteur variable ──
  const pressed = input.jump && !g.jumpWasDown;
  g.jumpWasDown = Boolean(input.jump);
  pl.buffer = pressed ? p.jumpBuffer : Math.max(0, pl.buffer - s);
  pl.coyote = pl.onGround ? p.coyote : Math.max(0, pl.coyote - s);
  if (pl.buffer > 0 && pl.coyote > 0) {
    pl.vy = -p.jumpVelocity;
    pl.buffer = 0;
    pl.coyote = 0;
    pl.cut = false;
    pl.onGround = false;
    events.push({ type: 'jump' });
  }
  if (!input.jump && pl.vy < 0 && !pl.cut) {
    pl.vy *= p.jumpCut;
    pl.cut = true;
  }
  pl.vy = Math.min(p.maxFall, pl.vy + p.gravity * s);

  // ── Déplacement X puis Y, collisions tuiles ──
  pl.x += pl.vx * s;
  if (pl.x < 0) { pl.x = 0; pl.vx = 0; }
  if (pl.x + p.playerW > g.width) { pl.x = g.width - p.playerW; pl.vx = 0; }
  const box = () => ({ x: pl.x, y: pl.y, w: p.playerW, h: p.playerH });
  for (const [cx, cy] of cells(box())) {
    if (!solidAt(g, cx, cy)) continue;
    if (pl.vx > 0) pl.x = cx - p.playerW - 1e-4;
    else if (pl.vx < 0) pl.x = cx + 1 + 1e-4;
    pl.vx = 0;
  }

  const prevBottom = pl.y + p.playerH;
  pl.y += pl.vy * s;
  pl.onGround = false;
  for (const [cx, cy] of cells(box())) {
    const ch = tileAt(g, cx, cy);
    const solid = SOLID.has(ch);
    const oneWay = ch === '=' && pl.vy > 0 && prevBottom <= cy + 0.02;
    if (!solid && !oneWay) continue;
    if (pl.vy > 0) {
      pl.y = cy - p.playerH;
      if (ch === 'S') {
        pl.vy = -p.springVelocity;
        pl.cut = true;
        events.push({ type: 'spring', x: cx, y: cy });
      } else {
        pl.vy = 0;
        pl.onGround = true;
      }
    } else if (pl.vy < 0 && solid) {
      pl.y = cy + 1;
      pl.vy = 0;
      if (ch === '?') {
        g.grid[cy][cx] = 'U';
        g.pts.block += SCORING.block;
        g.collected += 1;
        events.push({ type: 'block', x: cx, y: cy, points: SCORING.block });
      } else if (ch === 'P') {
        g.grid[cy][cx] = 'U';
        g.pts.power += SCORING.power;
        pl.shield = true;
        events.push({ type: 'power', x: cx, y: cy, points: SCORING.power });
      } else {
        events.push({ type: 'bump', x: cx, y: cy });
      }
    }
  }

  // ── Dangers ──
  if (pl.y > H + 1) { die(g, events, 'fall'); return; }
  for (const [cx, cy] of cells(box())) {
    const ch = tileAt(g, cx, cy);
    if (ch === '~') { die(g, events, 'lava'); return; }
    // Les pics n'occupent que le bas de leur case.
    if (ch === '^' && pl.y + p.playerH > cy + 0.45) { hurt(g, events, 'spikes'); if (g.status !== 'running') return; }
  }

  // ── Ramassage, balises, arrivée ──
  const b = box();
  for (const c of g.crystals) {
    if (!c.taken && Math.abs(c.x - (b.x + b.w / 2)) < 0.6 && Math.abs(c.y - (b.y + b.h / 2)) < 0.7) {
      c.taken = true;
      g.collected += 1;
      g.pts.crystal += SCORING.crystal;
      events.push({ type: 'crystal', x: c.x, y: c.y, points: SCORING.crystal });
    }
  }
  for (const cp of g.checkpoints) {
    if (!cp.reached && b.x + b.w / 2 >= cp.x + 0.5) {
      cp.reached = true;
      g.respawn = { x: cp.x + (1 - p.playerW) / 2, y: cp.y + 1 - p.playerH };
      events.push({ type: 'checkpoint', x: cp.x, y: cp.y });
    }
  }
  if (g.goal && overlap(b, { x: g.goal.x, y: g.goal.y - 1.5, w: 1, h: 2.5 })) {
    g.status = 'won';
    g.pts.complete = SCORING.completeBase + SCORING.completePerLevel * g.n;
    g.pts.time = Math.floor(g.timeLeft) * SCORING.timeBonusPerSecond;
    events.push({ type: 'won', time: g.pts.time });
    return;
  }

  // ── Ennemis ──
  for (const e of g.enemies) {
    if (!e.alive) continue;
    if (Math.abs(e.x - pl.x) > 30) continue;
    if (e.kind === 'drone') {
      const tt = g.t * 1.8 + e.phase;
      e.x = e.baseX + Math.sin(tt * 0.5) * 1.5;
      e.y = e.baseY + Math.sin(tt) * 1.2;
    } else {
      e.vy = Math.min(PHYSICS.maxFall, e.vy + PHYSICS.gravity * s);
      e.y += e.vy * s;
      const foot = Math.floor(e.y + e.h);
      if (solidAt(g, Math.floor(e.x + e.w / 2), foot)) { e.y = foot - e.h; e.vy = 0; }
      if (e.y > H + 2) { e.alive = false; continue; }
      const nx = e.x + e.vx * s;
      const front = e.vx < 0 ? Math.floor(nx) : Math.floor(nx + e.w);
      const wall = solidAt(g, front, Math.floor(e.y + e.h / 2));
      const ledge = e.vy === 0 && !solidAt(g, front, Math.floor(e.y + e.h + 0.1)) && tileAt(g, front, Math.floor(e.y + e.h + 0.1)) !== '=';
      if (wall || ledge) e.vx = -e.vx;
      else e.x = nx;
    }
    if (!overlap(b, e)) continue;
    const fromAbove = pl.vy > 0 && b.y + b.h - e.y < 0.45;
    if (fromAbove && e.stompable) {
      e.alive = false;
      g.kills += 1;
      g.pts.enemy += SCORING.enemy;
      pl.vy = -PHYSICS.stompBounce;
      pl.cut = true;
      events.push({ type: 'stomp', x: e.x + e.w / 2, y: e.y, points: SCORING.enemy, kind: e.kind });
    } else {
      hurt(g, events, e.kind);
      if (g.status !== 'running') return;
    }
  }
}

/** Reprise à la dernière balise atteinte : deux secondes d'invulnérabilité, au moins 30 s sur le chrono. */
export function revive(g) {
  if (g.status !== 'dead') return false;
  const pl = g.player;
  pl.x = g.respawn.x;
  pl.y = g.respawn.y;
  pl.vx = 0;
  pl.vy = 0;
  pl.invuln = 2;
  pl.shield = false;
  g.timeLeft = Math.max(g.timeLeft, 30);
  g.status = 'running';
  g.cause = null;
  return true;
}

/** La progression dans le niveau (0 → 1), pour la barre du HUD. */
export function progressOf(g) {
  if (!g.goal) return 0;
  return Math.max(0, Math.min(1, g.player.x / g.goal.x));
}
