import { describe, it, expect } from 'vitest';
import {
  DEFAULT_VIEWPORT, MIN_SPAN, fitViewportToAspect, resizeViewport, panViewport, zoomViewport,
  pixelToMath, mathToPixel, normalizeViewport, isValidViewport, sameViewport,
} from './viewport.js';
import { gridStepFor } from './gridStep.js';
import { formatValue, formatAxisLabel, decimalsFor } from './grapherFormat.js';

describe('fenêtre', () => {
  it('épouse la boîte sans déformer le plan (repère orthonormé)', () => {
    const wide = fitViewportToAspect(DEFAULT_VIEWPORT, 1000, 500);
    expect((wide.xMax - wide.xMin) / (wide.yMax - wide.yMin)).toBeCloseTo(2);
    expect(wide.yMin).toBe(-6);
    const tall = fitViewportToAspect(DEFAULT_VIEWPORT, 400, 800);
    expect((tall.xMax - tall.xMin) / (tall.yMax - tall.yMin)).toBeCloseTo(0.5);
    expect(tall.xMin).toBe(-8);
  });

  it('au redimensionnement, garde l’étendue en x', () => {
    const view = resizeViewport({ xMin: -4, xMax: 4, yMin: -1, yMax: 1 }, 800, 400);
    expect(view).toEqual({ xMin: -4, xMax: 4, yMin: -2, yMax: 2 });
  });

  it('glisse et zoome autour d’un point fixe', () => {
    expect(panViewport(DEFAULT_VIEWPORT, 1, -2)).toEqual({ xMin: -7, xMax: 9, yMin: -8, yMax: 4 });
    const zoomed = zoomViewport(DEFAULT_VIEWPORT, 0.5, [8, 6]);
    expect(zoomed).toEqual({ xMin: 0, xMax: 8, yMin: 0, yMax: 6 });
    const out = zoomViewport(DEFAULT_VIEWPORT, 2);
    expect(out).toEqual({ xMin: -16, xMax: 16, yMin: -12, yMax: 12 });
  });

  it('borne le zoom', () => {
    let view = { ...DEFAULT_VIEWPORT };
    for (let i = 0; i < 100; i += 1) view = zoomViewport(view, 0.5);
    expect(view.xMax - view.xMin).toBeGreaterThanOrEqual(MIN_SPAN - 1e-12);
    for (let i = 0; i < 100; i += 1) view = zoomViewport(view, 4);
    expect(isValidViewport(view)).toBe(true);
    expect(zoomViewport(DEFAULT_VIEWPORT, NaN)).toEqual(DEFAULT_VIEWPORT);
  });

  it('convertit pixels ↔ plan', () => {
    const view = { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };
    expect(pixelToMath(view, 800, 600, 400, 300)).toEqual([0, 0]);
    expect(pixelToMath(view, 800, 600, 800, 0)).toEqual([8, 6]);
    expect(mathToPixel(view, 800, 600, 8, 6)).toEqual([800, 0]);
    expect(mathToPixel(view, 800, 600, -8, -6)).toEqual([0, 600]);
  });

  it('refuse une fenêtre enregistrée aberrante', () => {
    expect(normalizeViewport(null)).toEqual(DEFAULT_VIEWPORT);
    expect(normalizeViewport({ xMin: 1, xMax: 1, yMin: 0, yMax: 1 })).toEqual(DEFAULT_VIEWPORT);
    expect(normalizeViewport({ xMin: 'a', xMax: 1, yMin: 0, yMax: 1 })).toEqual(DEFAULT_VIEWPORT);
    expect(normalizeViewport({ xMin: -1, xMax: 1, yMin: -1, yMax: 1, extra: true })).toEqual({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 });
    expect(sameViewport(DEFAULT_VIEWPORT, { ...DEFAULT_VIEWPORT })).toBe(true);
    expect(sameViewport(DEFAULT_VIEWPORT, panViewport(DEFAULT_VIEWPORT, 1e-6, 0))).toBe(false);
  });
});

describe('grille et format', () => {
  it('choisit un pas 1-2-5 lisible', () => {
    expect(gridStepFor(60)).toEqual({ step: 1, subdivisions: 5 });
    expect(gridStepFor(30)).toEqual({ step: 2, subdivisions: 4 });
    expect(gridStepFor(12)).toEqual({ step: 5, subdivisions: 5 });
    expect(gridStepFor(5)).toEqual({ step: 20, subdivisions: 4 });
    expect(gridStepFor(300)).toEqual({ step: 0.2, subdivisions: 4 });
    expect(gridStepFor(1000)).toEqual({ step: 0.1, subdivisions: 5 });
    expect(gridStepFor(0)).toEqual({ step: 1, subdivisions: 5 });
  });

  it('formate à l’algérienne : virgule, vrai moins', () => {
    expect(formatValue(2.345)).toBe('2,35');
    expect(formatValue(-4)).toBe('−4');
    expect(formatValue(-0.001)).toBe('0');
    expect(formatValue(NaN)).toBe('—');
    expect(formatValue(Infinity)).toBe('—');
    expect(formatAxisLabel(0.30000000000000004)).toBe('0,3');
    expect(formatAxisLabel(-2)).toBe('−2');
    expect(decimalsFor(0.02)).toBe(3);
    expect(decimalsFor(1)).toBe(1);
    expect(decimalsFor(50)).toBe(0);
  });
});
