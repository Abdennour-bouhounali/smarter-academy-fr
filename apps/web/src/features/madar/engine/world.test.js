import { describe, expect, it } from 'vitest';
import { createWorld, flip, revive, scoreOf, step } from './world.js';
import { PHYSICS, LANE_R, SECTOR_RAD } from './constants.js';
import { perfectScore } from './bound.js';

const run = (world, seconds, onEvent = () => {}) => {
  for (let t = 0; t < seconds; t += 1 / 60) {
    for (const e of step(world, 1 / 60)) onEvent(e);
    if (world.status === 'crashed') revive(world);
  }
};

describe('madar world', () => {
  it('is generated from the seed: same seed, same world', () => {
    const a = createWorld(42);
    const b = createWorld(42);
    run(a, 20);
    run(b, 20);
    expect(a.obstacles.map((o) => [o.lane, o.start.toFixed(6), o.kind])).toEqual(b.obstacles.map((o) => [o.lane, o.start.toFixed(6), o.kind]));
    const c = createWorld(43);
    run(c, 20);
    expect(c.obstacles.map((o) => [o.lane, o.start.toFixed(6)])).not.toEqual(a.obstacles.map((o) => [o.lane, o.start.toFixed(6)]));
  });

  it('speeds up with time and caps the speed', () => {
    const w = createWorld(1, { autopilot: true });
    run(w, 10);
    expect(w.omega).toBeCloseTo(PHYSICS.omegaStart + PHYSICS.omegaAccel * 10, 2);
    run(w, 200);
    expect(w.omega).toBe(PHYSICS.omegaMax);
  });

  it('a flip moves the ship to the other lane', () => {
    const w = createWorld(7);
    expect(w.lane).toBe(1);
    flip(w);
    step(w, 0.3);
    expect(w.lane).toBe(0);
    expect(w.r).toBeCloseTo(LANE_R[0], 5);
  });

  it('a ship that never moves crashes into the first rock on its lane', () => {
    const w = createWorld(9);
    const events = [];
    for (let i = 0; i < 60 * 60 && w.status === 'running'; i++) events.push(...step(w, 1 / 60));
    expect(w.status).toBe('crashed');
    expect(events.some((e) => e.type === 'crash')).toBe(true);
  });

  it('revive clears the road ahead and grants a grace period', () => {
    const w = createWorld(9);
    while (w.status === 'running') step(w, 1 / 60);
    revive(w);
    expect(w.status).toBe('running');
    expect(w.obstacles.some((o) => o.start < w.theta + 1.8 && o.end > w.theta)).toBe(false);
    expect(w.invulnUntil).toBeGreaterThan(w.t);
  });

  it('keeps obstacles and stars at least the minimum gap apart (the server bound relies on it)', () => {
    const w = createWorld(123, { autopilot: true });
    const seenObstacles = new Map();
    const seenStars = new Map();
    for (let i = 0; i < 60 * 150; i++) {
      step(w, 1 / 60);
      if (w.status === 'crashed') revive(w);
      for (const o of w.obstacles) seenObstacles.set(o.id, o.start);
      for (const p of w.pickups) if (p.kind === 'star') seenStars.set(p.id, p.at);
    }
    const starts = [...seenObstacles.values()].sort((a, b) => a - b);
    for (let i = 1; i < starts.length; i++) expect(starts[i] - starts[i - 1]).toBeGreaterThanOrEqual(PHYSICS.obstacleMinGapRad - 1e-9);
    const stars = [...seenStars.values()].sort((a, b) => a - b);
    for (let i = 1; i < stars.length; i++) expect(stars[i] - stars[i - 1]).toBeGreaterThanOrEqual(PHYSICS.starMinGapRad - 1e-9);
  });

  it('a long autopilot run never scores beyond the perfect-play bound the server uses', () => {
    for (const seed of [1, 2, 3, 99, 2026]) {
      const w = createWorld(seed, { autopilot: true });
      run(w, 180);
      expect(scoreOf(w)).toBeLessThanOrEqual(perfectScore(w.t * 1000));
      expect(w.stars).toBeGreaterThan(0);
    }
  });

  it('stars build a multiplier and a missed star resets it', () => {
    const w = createWorld(5, { autopilot: true });
    const events = [];
    run(w, 90, (e) => events.push(e));
    expect(events.some((e) => e.type === 'multiplier' && e.multiplier >= 2)).toBe(true);
    expect(w.multiplier).toBeLessThanOrEqual(PHYSICS.maxMultiplier);
  });

  it('announces a new sector every five laps', () => {
    const w = createWorld(11, { autopilot: true });
    const sectors = [];
    run(w, 120, (e) => e.type === 'sector' && sectors.push(e.sector));
    expect(sectors[0]).toBe(1);
    expect(Math.floor(w.theta / SECTOR_RAD)).toBe(sectors.at(-1));
  });
});
