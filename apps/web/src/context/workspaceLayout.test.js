import { describe, it, expect } from 'vitest';
import {
  columnWidthFor,
  priorFitsViewport,
  RAIL_WIDTH,
  MA_CARTE_MIN_WIDTH,
  MA_CARTE_MAX_WIDTH,
  MA_CARTE_MAX_WIDE,
  MIN_CONTENT_WIDTH,
} from './WorkspaceLayoutContext';

// The column mode of « Ma carte »: a FIXED width, the best for the screen, beside the 80 px rail (which does not fold).
describe('column width (fixed, best for the screen)', () => {
  it('matches the documented table', () => {
    expect(RAIL_WIDTH).toBe(80);
    expect(columnWidthFor(1024)).toBe(378);
    expect(columnWidthFor(1280)).toBe(480);
    expect(columnWidthFor(1440)).toBe(480);
    expect(columnWidthFor(1920)).toBe(560);
  });

  it('never leaves the lesson under MIN_CONTENT_WIDTH, never exceeds its cap, and stays readable', () => {
    for (let vw = 1024; vw <= 2560; vw += 16) {
      const w = columnWidthFor(vw);
      expect(vw - RAIL_WIDTH - w, `${vw}`).toBeGreaterThanOrEqual(MIN_CONTENT_WIDTH);
      expect(w).toBeLessThanOrEqual(vw >= 1600 ? MA_CARTE_MAX_WIDE : MA_CARTE_MAX_WIDTH);
      expect(w).toBeGreaterThanOrEqual(MA_CARTE_MIN_WIDTH);
    }
  });

  it('column mode exists from the lg breakpoint', () => {
    expect(priorFitsViewport(1023)).toBe(false);
    expect(priorFitsViewport(1024)).toBe(true);
  });
});
