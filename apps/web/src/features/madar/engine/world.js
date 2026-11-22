import {
  PHYSICS, LANE_R, SHIP_HALF, FLIP_S, HIT_BAND, SPAWN_AHEAD, SECTOR_RAD, COMBO_STEP,
  NEAR_MISS_WINDOW, REVIVE_GRACE, STEP,
} from './constants.js';
import { createRng } from './rng.js';

/**
 * Le monde de « مدار » — une simulation PURE, sans DOM ni horloge.
 *
 * Le vaisseau tourne autour d'une planète sur l'un de deux couloirs
 * (intérieur 0, extérieur 1). Un seul geste : changer de couloir. Les
 * obstacles sont posés en coordonnées angulaires « déroulées » (θ croît sans
 * fin) ; le rendu les replie sur le cercle.
 *
 *   createWorld(seed)  le monde, généré depuis la graine du serveur
 *   step(world, dt)    avance le temps ; renvoie les événements (son, éclats)
 *   flip(world)        change de couloir
 *   revive(world)      reprend après un crash (dégage la route devant)
 *   scoreOf(world)     le score entier annoncé au serveur
 *
 * La vitesse ne dépend que du temps de jeu ; le temps réel mesuré par le
 * serveur est toujours plus long (pauses, reprises), d'où une borne sûre.
 */

let ids = 0;
const nextId = () => ++ids;

export function createWorld(seed, { autopilot = false } = {}) {
  const world = {
    seed,
    rng: createRng(seed),
    autopilot,
    t: 0,
    theta: 0,
    omega: PHYSICS.omegaStart,
    lane: 1,
    fromLane: 1,
    flipT: 1,
    r: LANE_R[1],
    lastFlipAt: -10,
    leftLane: null,
    obstacles: [],
    pickups: [],
    nextSpawnAt: 2.2,
    lastStarAt: -Infinity,
    distancePts: 0,
    starPts: 0,
    nearPts: 0,
    stars: 0,
    nearMisses: 0,
    combo: 0,
    multiplier: 1,
    bestCombo: 0,
    shield: false,
    shieldPickups: 0,
    invulnUntil: 0,
    status: 'running',
    sector: 0,
    level: 0,
  };
  spawnUntil(world);
  return world;
}

export function scoreOf(world) {
  return Math.floor(world.distancePts + world.starPts + world.nearPts);
}

const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2);

function radiusOf(world) {
  return LANE_R[world.fromLane] + (LANE_R[world.lane] - LANE_R[world.fromLane]) * ease(world.flipT);
}

/** Change de couloir. Pendant un changement, repart vers l'autre (demi-tour fluide). */
export function flip(world) {
  if (world.status !== 'running') return false;
  const leaving = world.lane;
  if (world.flipT < 1) {
    world.fromLane = world.lane;
    world.lane = 1 - world.lane;
    world.flipT = 1 - world.flipT;
  } else {
    world.fromLane = world.lane;
    world.lane = 1 - world.lane;
    world.flipT = 0;
  }
  world.leftLane = leaving;
  world.lastFlipAt = world.t;
  return true;
}

/**
 * Reprendre après un crash : la route devant est dégagée sur ~1,8 rad, deux
 * secondes d'invulnérabilité (le vaisseau clignote), la série d'étoiles repart
 * de zéro. La vitesse, elle, reste : on reprend où l'on était.
 */
export function revive(world) {
  if (world.status !== 'crashed') return false;
  const clearTo = world.theta + 1.8;
  world.obstacles = world.obstacles.filter((o) => o.start > clearTo || o.end < world.theta - 0.2);
  world.status = 'running';
  world.invulnUntil = world.t + REVIVE_GRACE;
  world.combo = 0;
  world.multiplier = 1;
  world.nextSpawnAt = Math.max(world.nextSpawnAt, clearTo);
  return true;
}

/** Avance la simulation de `dt` secondes (pas fixes). Renvoie les événements. */
export function step(world, dt) {
  const events = [];
  let remaining = Math.min(dt, 0.25);
  while (remaining > 1e-9 && world.status === 'running') {
    const s = Math.min(STEP, remaining);
    remaining -= s;
    tick(world, s, events);
  }
  return events;
}

function tick(world, s, events) {
  world.t += s;
  world.omega = Math.min(PHYSICS.omegaMax, PHYSICS.omegaStart + PHYSICS.omegaAccel * world.t);
  const dTheta = world.omega * s;
  world.theta += dTheta;
  world.distancePts += dTheta * PHYSICS.pointsPerRad;
  if (world.flipT < 1) world.flipT = Math.min(1, world.flipT + s / FLIP_S);
  world.r = radiusOf(world);

  const sector = Math.floor(world.theta / SECTOR_RAD);
  if (sector > world.sector) {
    world.sector = sector;
    events.push({ type: 'sector', sector });
  }
  world.level = Math.min(12, Math.floor(world.theta / (SECTOR_RAD / 2)));

  spawnUntil(world);
  if (world.autopilot) pilot(world);

  // ── Ramassage ──
  for (const p of world.pickups) {
    if (p.taken || p.missed) continue;
    const d = world.theta - p.at;
    if (Math.abs(d) <= 0.06 && Math.abs(world.r - LANE_R[p.lane]) < HIT_BAND + 0.05) {
      p.taken = true;
      p.takenAt = world.t;
      if (p.kind === 'star') {
        world.stars += 1;
        world.combo += 1;
        world.bestCombo = Math.max(world.bestCombo, world.combo);
        const multiplier = Math.min(PHYSICS.maxMultiplier, 1 + Math.floor(world.combo / COMBO_STEP));
        if (multiplier > world.multiplier) events.push({ type: 'multiplier', multiplier });
        world.multiplier = multiplier;
        world.starPts += PHYSICS.starPoints * world.multiplier;
        events.push({ type: 'star', lane: p.lane, combo: world.combo, multiplier: world.multiplier, points: PHYSICS.starPoints * world.multiplier });
      } else if (p.kind === 'shield') {
        world.shield = true;
        events.push({ type: 'shield' });
      }
    } else if (d > 0.06) {
      p.missed = true;
      if (p.kind === 'star' && world.combo > 0) {
        if (world.combo >= COMBO_STEP) events.push({ type: 'comboLost', combo: world.combo });
        world.combo = 0;
        world.multiplier = 1;
      }
    }
  }

  // ── Obstacles ──
  for (const o of world.obstacles) {
    if (o.kind === 'comet' && !o.hopped && o.start - world.theta <= o.hopAt) {
      o.hopped = true;
      o.fromLane = o.lane;
      o.lane = 1 - o.lane;
      o.hopStartT = world.t;
      events.push({ type: 'cometHop' });
    }
    if (o.hit || o.passed) continue;
    const inArc = world.theta >= o.start - SHIP_HALF && world.theta <= o.end + SHIP_HALF;
    if (inArc && !o.entered) {
      o.entered = true;
      o.near = world.leftLane === o.lane && world.t - world.lastFlipAt <= NEAR_MISS_WINDOW;
    }
    if (inArc && Math.abs(world.r - LANE_R[o.lane]) < HIT_BAND && world.t >= world.invulnUntil) {
      o.hit = true;
      if (world.shield) {
        world.shield = false;
        world.invulnUntil = world.t + 1;
        events.push({ type: 'shieldBreak', lane: o.lane });
      } else {
        world.status = 'crashed';
        world.combo = 0;
        world.multiplier = 1;
        events.push({ type: 'crash', lane: o.lane });
        return;
      }
    }
    if (world.theta > o.end + SHIP_HALF) {
      o.passed = true;
      if (o.near && !o.hit) {
        world.nearPts += PHYSICS.nearMissPoints;
        world.nearMisses += 1;
        events.push({ type: 'near', points: PHYSICS.nearMissPoints });
      }
    }
  }

  // ── Ménage : ce qui est loin derrière ──
  if (world.obstacles.length > 40 || world.pickups.length > 60) {
    const behind = world.theta - 1.2;
    world.obstacles = world.obstacles.filter((o) => o.end > behind);
    world.pickups = world.pickups.filter((p) => p.at > behind);
  }
}

// ── Génération ───────────────────────────────────────────────────────────

function spawnUntil(world) {
  while (world.nextSpawnAt < world.theta + SPAWN_AHEAD) {
    const end = spawnPattern(world, world.nextSpawnAt);
    world.nextSpawnAt = end + gapAfter(world);
  }
}

/** L'écart entre deux obstacles : jamais sous `obstacleMinGapRad` (borne du serveur). */
function gapAfter(world) {
  const base = Math.max(PHYSICS.obstacleMinGapRad, 1.55 - 0.07 * world.level);
  return base * world.rng.range(1, 1.3);
}

function addStar(world, lane, at) {
  if (at - world.lastStarAt < PHYSICS.starMinGapRad) return;
  world.lastStarAt = at;
  world.pickups.push({ id: nextId(), kind: 'star', lane, at });
}

function addRock(world, lane, at, width, kind = 'rock') {
  const rng = world.rng;
  const o = {
    id: nextId(),
    kind,
    lane,
    fromLane: lane,
    start: at,
    end: at + width,
    shape: Array.from({ length: 9 }, () => rng.range(0.72, 1)),
    spin: rng.range(-2, 2),
  };
  world.obstacles.push(o);
  return o;
}

const PATTERNS = [
  { id: 'single', weight: () => 3 },
  { id: 'zigzag', weight: (l) => 1.6 + l * 0.25 },
  { id: 'wall', weight: (l) => (l >= 1 ? 1.4 : 0.6) },
  { id: 'double', weight: (l) => (l >= 1 ? 1.1 : 0) },
  { id: 'comet', weight: (l) => (l >= 3 ? 1 + l * 0.1 : 0) },
  { id: 'trail', weight: () => 1 },
];

function choosePattern(world) {
  const weights = PATTERNS.map((p) => p.weight(world.level));
  let x = world.rng.next() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < PATTERNS.length; i++) {
    x -= weights[i];
    if (x <= 0) return PATTERNS[i].id;
  }
  return 'single';
}

/** Pose un motif à partir de `at` ; renvoie l'angle où il finit. */
function spawnPattern(world, at) {
  const { rng } = world;
  const lane = rng.int(0, 1);
  const rockW = () => rng.range(0.13, 0.19);
  const gap = Math.max(PHYSICS.obstacleMinGapRad, 1.3 - 0.06 * world.level);
  let end = at;

  // Un bouclier, de temps en temps, au début d'un motif.
  if (!world.shield && world.shieldPickups < 1 + Math.floor(world.level / 3) && world.level >= 1 && rng.chance(0.06)) {
    world.shieldPickups += 1;
    world.pickups.push({ id: nextId(), kind: 'shield', lane: rng.int(0, 1), at: at - 0.45 });
  }

  switch (choosePattern(world)) {
    case 'zigzag': {
      const n = 2 + Math.min(3, Math.floor(world.level / 2)) + rng.int(0, 1);
      let l = lane;
      let a = at;
      for (let i = 0; i < n; i++) {
        const o = addRock(world, l, a, rockW());
        addStar(world, 1 - l, (o.start + o.end) / 2);
        end = o.end;
        a = o.end + gap * rng.range(1, 1.15);
        l = 1 - l;
      }
      break;
    }
    case 'wall': {
      const width = rng.range(0.5, Math.min(1.3, 0.65 + 0.08 * world.level));
      const o = addRock(world, lane, at, width, 'wall');
      for (let a = at + 0.1; a < o.end; a += PHYSICS.starMinGapRad + 0.02) addStar(world, 1 - lane, a);
      end = o.end;
      break;
    }
    case 'double': {
      const a = addRock(world, lane, at, rockW());
      const b = addRock(world, lane, a.end + gap * rng.range(1, 1.1), rockW());
      addStar(world, 1 - lane, (a.end + b.start) / 2);
      end = b.end;
      break;
    }
    case 'comet': {
      const o = addRock(world, lane, at, rockW(), 'comet');
      o.hopAt = rng.range(0.95, 1.25);
      end = o.end;
      break;
    }
    case 'trail': {
      // Une respiration : des étoiles qui changent de couloir, sans obstacle.
      let l = lane;
      for (let i = 0; i < 8; i++) {
        if (i % 3 === 0 && i > 0) l = 1 - l;
        addStar(world, l, at + i * (PHYSICS.starMinGapRad + 0.03));
      }
      end = at + 8 * (PHYSICS.starMinGapRad + 0.03) - gap * 0.6;
      break;
    }
    default: {
      const o = addRock(world, lane, at, rockW());
      addStar(world, 1 - lane, o.start - 0.2);
      addStar(world, 1 - lane, o.end + 0.2);
      end = o.end;
    }
  }
  return end;
}

// ── Pilote automatique (écran d'accueil, tests) ──────────────────────────

/** Le couloir est-il libre sur [a, b] ? */
function laneFree(world, lane, a, b) {
  return !world.obstacles.some((o) => !o.passed && o.lane === lane && o.end + SHIP_HALF > a && o.start - SHIP_HALF < b);
}

function pilot(world) {
  if (world.flipT < 1) return;
  const look = 0.32 + world.omega * 0.16;
  const a = world.theta;
  const b = world.theta + look;
  if (!laneFree(world, world.lane, a, b) && laneFree(world, 1 - world.lane, a, b + 0.15)) {
    flip(world);
    return;
  }
  // Aller chercher une étoile proche si l'autre couloir est sûr.
  const star = world.pickups.find((p) => p.kind !== 'shield' && !p.taken && !p.missed && p.at > a + 0.25 && p.at < a + 0.6);
  if (star && star.lane !== world.lane && laneFree(world, star.lane, a, star.at + 0.3)) flip(world);
}
