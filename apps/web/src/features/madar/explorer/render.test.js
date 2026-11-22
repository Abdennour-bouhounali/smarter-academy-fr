import { describe, it, expect } from 'vitest';
import { screenX } from './render.js';
import { INPUT_KEYS } from './sim.js';

// The direction of « L'explorateur » is the READING direction, not a rule of the game: the Arabic product ran its
// levels right to left (← moved forward); the French one runs them left to right. The maps, the physics and the
// server's checks are in level coordinates and do not change (docs/architecture/MADAR_GAME.md §15).
describe('explorer — the level runs left to right', () => {
  it('a point further into the level is drawn further to the right', () => {
    const T = 32;
    expect(screenX(10, 4, T)).toBe(6 * T);
    expect(screenX(11, 4, T)).toBeGreaterThan(screenX(10, 4, T));
    expect(screenX(4, 4, T)).toBe(0);
  });

  it('→ and D move forward, ← and A move back, Space, ↑ and W jump', () => {
    expect(INPUT_KEYS.ArrowRight).toBe('forward');
    expect(INPUT_KEYS.d).toBe('forward');
    expect(INPUT_KEYS.D).toBe('forward');
    expect(INPUT_KEYS.ArrowLeft).toBe('back');
    expect(INPUT_KEYS.a).toBe('back');
    expect(INPUT_KEYS.A).toBe('back');
    for (const k of [' ', 'ArrowUp', 'w', 'W']) expect(INPUT_KEYS[k]).toBe('jump');
  });
});
