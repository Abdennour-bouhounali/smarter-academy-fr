import {
  SCHEDULE, PLANET_R, SPAWN_R, PLANET_HEALTH, START_CRYSTALS, REVIVE_HEALTH, REVIVE_CLEAR_R, REVIVE_GRACE, STEP,
  SLOTS, ENEMIES, TURRETS, TURRET_ORDER, upgradeCost, sellValue, spawnWindow, waveStart, enemiesIn, hpScale,
} from './constants.js';
import { createRng } from '../engine/rng.js';

/**
 * « دفاع الكوكب » — une simulation PURE (aucun DOM, aucune horloge).
 *
 * Des vaisseaux ennemis arrivent du bord en spirale vers la planète. L'élève
 * pose des tourelles sur des emplacements autour d'elle, les améliore ou les
 * revend, avec les cristaux gagnés en abattant. Une vague commence à un
 * instant FIXE (waveStart) ; la partie s'arrête quand la planète n'a plus de
 * santé.
 *
 *   createDefense(seed)          la partie (la graine du serveur = la carte de la semaine)
 *   step(game, dt)               avance ; renvoie les événements (sons, éclats)
 *   build(game, slotId, type)    pose une tourelle (si les cristaux suffisent)
 *   upgrade(game, slotId)        niveau suivant
 *   sell(game, slotId)           revend (60 % de l'investi)
 *   revive(game)                 bouclier d'urgence : santé rendue, ennemis proches détruits
 *   scoreOf(game)                le score entier annoncé au serveur
 *
 * Score : points des ennemis abattus + wavePoints × k quand la vague k est
 * TERMINÉE (la suivante commence et la planète tient). Rien d'autre.
 */

let ids = 0;
const nextId = () => ++ids;

export function createDefense(seed, { unlocked = TURRET_ORDER, autopilot = false } = {}) {
  const game = {
    seed,
    rng: createRng(seed),
    autopilot,
    unlocked: new Set(unlocked),
    t: 0,
    wave: 0,
    waveSpawns: [],
    health: PLANET_HEALTH,
    crystals: START_CRYSTALS,
    killPts: 0,
    wavePts: 0,
    kills: 0,
    enemies: [],
    turrets: new Map(),
    status: 'running',
    invulnUntil: 0,
    entries: [],
    nextEntries: entryAngles(createRng(seed ^ 0x9e3779b9), 1),
  };
  return game;
}

export function scoreOf(game) {
  return Math.floor(game.killPts + game.wavePts);
}

/** Les angles d'entrée d'une vague (2, puis 3 à partir de la vague 6), tirés de la graine. */
function entryAngles(rng, k) {
  const count = k >= 6 ? 3 : 2;
  const base = rng.next() * Math.PI * 2;
  return Array.from({ length: count }, (_, i) => ({
    a: base + (i * Math.PI * 2) / count + rng.range(-0.4, 0.4),
    spin: rng.chance(0.5) ? 1 : -1,
  }));
}

function composition(rng, k) {
  const n = enemiesIn(k);
  const kinds = ['scout'];
  if (k >= 3) kinds.push('swarm', 'swarm');
  if (k >= 4) kinds.push('tank');
  if (k >= 6) kinds.push('shield');
  if (k >= 9) kinds.push('tank', 'shield');
  const list = Array.from({ length: n }, () => rng.pick(kinds));
  if (k % SCHEDULE.bossEvery === 0) list.splice(Math.floor(n / 2), 0, 'boss');
  return list;
}

function startWave(game, k, events) {
  game.wave = k;
  game.entries = game.nextEntries;
  game.nextEntries = entryAngles(game.rng, k + 1);
  const kinds = composition(game.rng, k);
  const window = spawnWindow(k);
  const t0 = waveStart(k);
  game.waveSpawns = kinds.map((kind, i) => ({
    at: t0 + (i * window) / kinds.length,
    kind,
    entry: game.entries[i % game.entries.length],
    jitter: game.rng.range(-0.18, 0.18),
  }));
  events.push({ type: 'wave', wave: k, boss: kinds.includes('boss') });
}

function spawn(game, s) {
  const def = ENEMIES[s.kind];
  const hp = Math.round(def.hp * hpScale(game.wave));
  game.enemies.push({
    id: nextId(), kind: s.kind, r: SPAWN_R, a: s.entry.a + s.jitter, spin: s.entry.spin,
    hp, maxHp: hp, slow: 0, alive: true, wave: game.wave,
  });
}

const pos = (e) => [Math.cos(e.a) * e.r, Math.sin(e.a) * e.r];
const dist2 = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;

function damage(game, e, amount, beam, events) {
  if (!e.alive) return;
  const resist = beam ? (ENEMIES[e.kind].beamResist ?? 1) : 1;
  e.hp -= amount * resist;
  if (e.hp <= 0) {
    e.alive = false;
    const def = ENEMIES[e.kind];
    game.killPts += def.points;
    game.crystals += def.crystals;
    game.kills += 1;
    const [x, y] = pos(e);
    events.push({ type: 'kill', kind: e.kind, x, y, points: def.points, crystals: def.crystals });
  }
}

/**
 * La cible : celle déjà VERROUILLÉE si elle vit et reste en portée (sinon le
 * faisceau papillonne d'un ennemi à l'autre et n'en abat aucun), sinon
 * l'ennemi en portée le plus avancé vers la planète.
 */
function firstInRange(game, t, range) {
  if (t.lock) {
    const locked = game.enemies.find((e) => e.id === t.lock && e.alive);
    if (locked) {
      const [x, y] = pos(locked);
      if (dist2(x, y, t.x, t.y) <= range * range) return locked;
    }
    t.lock = null;
  }
  let best = null;
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const [x, y] = pos(e);
    if (dist2(x, y, t.x, t.y) > range * range) continue;
    if (!best || e.r < best.r) best = e;
  }
  t.lock = best?.id ?? null;
  return best;
}

export function step(game, dt) {
  const events = [];
  let remaining = Math.min(dt, 0.25);
  while (remaining > 1e-9 && game.status === 'running') {
    const s = Math.min(STEP, remaining);
    remaining -= s;
    tick(game, s, events);
  }
  return events;
}

function tick(game, s, events) {
  game.t += s;

  // ── Calendrier : la vague suivante commence à son instant fixe ──
  const next = game.wave + 1;
  if (game.t >= waveStart(next)) {
    if (game.wave > 0) {
      game.wavePts += SCHEDULE.wavePoints * game.wave;
      const bonus = 20 + 5 * game.wave;
      game.crystals += bonus;
      events.push({ type: 'waveCleared', wave: game.wave, points: SCHEDULE.wavePoints * game.wave, crystals: bonus });
    }
    startWave(game, next, events);
  }
  while (game.waveSpawns.length && game.waveSpawns[0].at <= game.t) {
    const sp = game.waveSpawns.shift();
    spawn(game, sp);
    if (sp.kind === 'boss') events.push({ type: 'boss' });
  }

  // ── Ralentissement (givre) : le plus fort l'emporte ──
  for (const e of game.enemies) e.slow = 0;
  for (const t of game.turrets.values()) {
    if (t.type !== 'frost') continue;
    const def = TURRETS.frost;
    const range = def.range[t.level - 1];
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const [x, y] = pos(e);
      if (dist2(x, y, t.x, t.y) <= range * range) e.slow = Math.max(e.slow, def.slow[t.level - 1]);
    }
  }

  // ── Mouvement ──
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const def = ENEMIES[e.kind];
    const k = 1 - e.slow;
    e.r -= def.vr * k * s;
    e.a += def.w * e.spin * k * s * (1 + (SPAWN_R - e.r) * 0.6);
    if (e.r <= PLANET_R + def.size * 0.5) {
      e.alive = false;
      if (game.t >= game.invulnUntil) {
        game.health = Math.max(0, game.health - def.damage);
        events.push({ type: 'planetHit', damage: def.damage, kind: e.kind });
      }
    }
  }

  // ── Tourelles ──
  for (const t of game.turrets.values()) {
    const def = TURRETS[t.type];
    const L = t.level - 1;
    const range = def.range[L];
    t.cooldown = Math.max(0, (t.cooldown ?? 0) - s);
    if (t.type === 'laser' || t.type === 'frost') {
      const target = firstInRange(game, t, range);
      t.target = target?.id ?? null;
      if (target) {
        t.aim = Math.atan2(pos(target)[1] - t.y, pos(target)[0] - t.x);
        damage(game, target, def.dps[L] * s, Boolean(def.beam), events);
      }
    } else if (t.type === 'pulse') {
      if (t.cooldown <= 0 && game.enemies.some((e) => e.alive && dist2(...pos(e), t.x, t.y) <= range * range)) {
        t.cooldown = def.every[L];
        for (const e of game.enemies) if (e.alive && dist2(...pos(e), t.x, t.y) <= range * range) damage(game, e, def.damage[L], false, events);
        events.push({ type: 'pulse', x: t.x, y: t.y, range });
      }
    } else if (t.type === 'rail') {
      if (t.cooldown <= 0) {
        // Le rail vise le plus robuste en portée.
        let target = null;
        for (const e of game.enemies) {
          if (!e.alive || dist2(...pos(e), t.x, t.y) > range * range) continue;
          if (!target || e.hp > target.hp) target = e;
        }
        if (target) {
          t.cooldown = def.every[L];
          const [x, y] = pos(target);
          t.aim = Math.atan2(y - t.y, x - t.x);
          damage(game, target, def.damage[L], false, events);
          events.push({ type: 'rail', x1: t.x, y1: t.y, x2: x, y2: y });
        }
      }
    } else if (t.type === 'tesla') {
      if (t.cooldown <= 0) {
        const first = firstInRange(game, t, range);
        if (first) {
          t.cooldown = def.every[L];
          const chain = [first];
          while (chain.length < def.chain[L]) {
            const last = chain[chain.length - 1];
            const [lx, ly] = pos(last);
            let near = null;
            let nd = 0.18 * 0.18;
            for (const e of game.enemies) {
              if (!e.alive || chain.includes(e)) continue;
              const d = dist2(...pos(e), lx, ly);
              if (d < nd) { nd = d; near = e; }
            }
            if (!near) break;
            chain.push(near);
          }
          const points = [[t.x, t.y], ...chain.map(pos)];
          for (const e of chain) damage(game, e, def.damage[L], true, events);
          events.push({ type: 'tesla', points });
        }
      }
    }
  }

  game.enemies = game.enemies.filter((e) => e.alive);

  if (game.autopilot) pilot(game);

  if (game.health <= 0) {
    game.status = 'fallen';
    events.push({ type: 'fallen' });
  }
}

// ── Gestes de l'élève ─────────────────────────────────────────────────────

function slotById(id) {
  return SLOTS.find((s) => s.id === id) ?? null;
}

function canBuild(game, slotId, type) {
  return game.status === 'running' && Boolean(slotById(slotId)) && !game.turrets.has(slotId)
    && game.unlocked.has(type) && game.crystals >= TURRETS[type].cost;
}

export function build(game, slotId, type) {
  if (!canBuild(game, slotId, type)) return false;
  const slot = slotById(slotId);
  game.crystals -= TURRETS[type].cost;
  game.turrets.set(slotId, { id: slotId, type, level: 1, x: slot.x, y: slot.y, invested: TURRETS[type].cost, cooldown: 0, aim: slot.a + Math.PI });
  return true;
}

export function upgrade(game, slotId) {
  const t = game.turrets.get(slotId);
  if (!t || game.status !== 'running') return false;
  const cost = upgradeCost(t.type, t.level);
  if (cost === null || game.crystals < cost) return false;
  game.crystals -= cost;
  t.level += 1;
  t.invested += cost;
  return true;
}

export function sell(game, slotId) {
  const t = game.turrets.get(slotId);
  if (!t || game.status !== 'running') return false;
  game.crystals += sellValue(t);
  game.turrets.delete(slotId);
  return true;
}

/** Le bouclier d'urgence : santé rendue, les ennemis proches détruits (sans points), deux secondes de répit. */
export function revive(game) {
  if (game.status !== 'fallen') return false;
  game.health = REVIVE_HEALTH;
  game.enemies = game.enemies.filter((e) => e.r > REVIVE_CLEAR_R);
  game.invulnUntil = game.t + REVIVE_GRACE;
  game.status = 'running';
  return true;
}

// ── Pilote automatique (écran d'accueil, tests) ───────────────────────────

const BOT_PLAN = ['i0', 'i3', 'o1', 'o5', 'i1', 'i4', 'o3', 'o7', 'i2', 'i5', 'o0', 'o2', 'o4', 'o6'];
const BOT_TYPES = ['laser', 'laser', 'frost', 'pulse', 'laser', 'rail', 'tesla', 'pulse'];

function pilot(game) {
  const free = BOT_PLAN.find((id) => !game.turrets.has(id));
  if (free) {
    const index = BOT_PLAN.indexOf(free);
    const type = BOT_TYPES[index % BOT_TYPES.length];
    const usable = game.unlocked.has(type) ? type : 'laser';
    if (build(game, free, usable)) return;
  }
  for (const id of BOT_PLAN) {
    const t = game.turrets.get(id);
    if (t && t.level < 3 && upgrade(game, id)) return;
  }
}

/** Le temps avant la prochaine vague (s), pour l'affichage. */
export function nextWaveIn(game) {
  return Math.max(0, waveStart(game.wave + 1) - game.t);
}

export { pos as enemyPos };
