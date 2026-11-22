import { describe, expect, it } from 'vitest';
import { build, createDefense, revive, scoreOf, sell, step, upgrade } from './sim.js';
import { START_CRYSTALS, TURRETS, PLANET_HEALTH, REVIVE_HEALTH, waveStart, upgradeCost } from './constants.js';
import { maxWave, perfectScore } from './bound.js';

const runFor = (game, seconds, onEvent = () => {}) => {
  for (let t = 0; t < seconds && game.status === 'running'; t += 1 / 30) {
    for (const e of step(game, 1 / 30)) onEvent(e);
  }
};

describe('planet defense simulation', () => {
  it('starts waves at their fixed instants', () => {
    const game = createDefense(7);
    const starts = [];
    runFor(game, waveStart(3) + 0.1, (e) => e.type === 'wave' && starts.push([e.wave, game.t]));
    expect(starts.map(([w]) => w)).toEqual([1, 2, 3]);
    starts.forEach(([w, t]) => expect(t).toBeCloseTo(waveStart(w), 1));
  });

  it('is generated from the seed: the same map for the same seed', () => {
    const kinds = (seed) => {
      const g = createDefense(seed);
      const seen = [];
      runFor(g, waveStart(4), () => {});
      for (const e of g.enemies) seen.push([e.kind, e.a.toFixed(5)]);
      return seen;
    };
    expect(kinds(42)).toEqual(kinds(42));
    expect(kinds(42)).not.toEqual(kinds(43));
  });

  it('an undefended planet falls, and the emergency shield brings it back', () => {
    const game = createDefense(3);
    runFor(game, 600);
    expect(game.status).toBe('fallen');
    expect(game.health).toBe(0);
    expect(revive(game)).toBe(true);
    expect(game.health).toBe(REVIVE_HEALTH);
    expect(game.status).toBe('running');
  });

  it('builds, upgrades and sells with crystals', () => {
    const game = createDefense(1);
    expect(build(game, 'i0', 'laser')).toBe(true);
    expect(game.crystals).toBe(START_CRYSTALS - TURRETS.laser.cost);
    expect(build(game, 'i0', 'frost')).toBe(false);
    expect(upgrade(game, 'i0')).toBe(true);
    expect(game.turrets.get('i0').level).toBe(2);
    const before = game.crystals;
    expect(sell(game, 'i0')).toBe(true);
    expect(game.crystals).toBe(before + Math.floor((TURRETS.laser.cost + upgradeCost('laser', 1)) * 0.6));
    expect(build(game, 'nope', 'laser')).toBe(false);
  });

  it('refuses a locked turret', () => {
    const game = createDefense(1, { unlocked: ['laser'] });
    expect(build(game, 'i0', 'rail')).toBe(false);
    expect(build(game, 'i0', 'laser')).toBe(true);
  });

  it('a defended planet holds several waves and scores kills and cleared waves', () => {
    const game = createDefense(11, { autopilot: true });
    const events = [];
    runFor(game, waveStart(6), (e) => events.push(e.type));
    expect(game.wave).toBeGreaterThanOrEqual(5);
    expect(events).toContain('kill');
    expect(events).toContain('waveCleared');
    expect(game.health).toBeGreaterThan(0);
    expect(scoreOf(game)).toBeGreaterThan(0);
  });

  it('never scores beyond the bound the server uses, nor reaches a later wave', () => {
    for (const seed of [1, 2, 99, 2026]) {
      const game = createDefense(seed, { autopilot: true });
      for (let t = 0; t < 420; t += 1 / 30) {
        step(game, 1 / 30);
        if (game.status === 'fallen') revive(game);
      }
      expect(scoreOf(game)).toBeLessThanOrEqual(perfectScore(game.t * 1000));
      expect(game.wave).toBeLessThanOrEqual(maxWave(game.t * 1000));
    }
  });

  it('beam weapons do half damage to shielded ships', () => {
    const game = createDefense(5);
    game.enemies.push({ id: 1, kind: 'shield', r: 0.42, a: 0, spin: 1, hp: 60, maxHp: 60, slow: 0, alive: true, wave: 1 });
    game.enemies.push({ id: 2, kind: 'scout', r: 0.42, a: 0.02, spin: 1, hp: 60, maxHp: 60, slow: 0, alive: true, wave: 1 });
    build(game, 'o0', 'laser');
    game.t = 1; // avant la première vague
    step(game, 0.5);
    const [shield] = game.enemies.filter((e) => e.kind === 'shield');
    expect(game.health).toBe(PLANET_HEALTH);
    expect(shield.hp).toBeGreaterThan(60 - TURRETS.laser.dps[0] * 0.5 * 0.6);
  });
});
