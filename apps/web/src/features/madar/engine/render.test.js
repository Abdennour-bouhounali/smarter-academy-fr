import { describe, it, expect } from 'vitest';
import { mirrorX, projectPoint } from './render.js';

// The direction of « Saut d'orbite » is the READING direction, not a rule of the game: the Arabic product brought
// what comes from the left; the French one, read left to right, brings it from the RIGHT, the ship's nose pointing
// right. This test pins that choice (docs/architecture/MADAR_GAME.md §2).
describe('orbit camera — the world comes from the right', () => {
  const frame = { cx: 200, cy: 150, R: 100 };

  it('the ship sits at the bottom of the orbit', () => {
    const [x, y] = projectPoint(1, 1, 0.8, frame);
    expect(x).toBeCloseTo(200);
    expect(y).toBeCloseTo(150 + 80);
  });

  it('an obstacle AHEAD of the ship is drawn on the right, and slides down to it as the ship advances', () => {
    const ahead = 1.4;
    const [x0, y0] = projectPoint(ahead, 1, 0.8, frame);
    const [x1, y1] = projectPoint(ahead, 1.3, 0.8, frame);
    expect(x0).toBeGreaterThan(200);
    expect(x1).toBeGreaterThan(200);
    expect(x1).toBeLessThan(x0);
    expect(y1).toBeGreaterThan(y0);
  });

  it('what the ship has passed is on the left', () => {
    const [x] = projectPoint(0.6, 1, 0.8, frame);
    expect(x).toBeLessThan(200);
  });

  it('mirrors about the vertical axis of the orbit', () => {
    expect(mirrorX(260, 200)).toBe(140);
    expect(mirrorX(200, 200)).toBe(200);
  });
});
