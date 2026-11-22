import { describe, it, expect, vi } from 'vitest';
import { normalizeRect, isMeaningfulRect, drawMarks, regionInBody, MARK_COLOR, MAX_EXPORT_WIDTH, IGNORE_ATTRIBUTE } from './screenshot';

describe('screenshot — les cadres de la zone fautive', () => {
  it('normalise un cadre tracé dans n’importe quel sens', () => {
    const expected = { x: 10, y: 20, width: 30, height: 40 };
    expect(normalizeRect({ x: 10, y: 20 }, { x: 40, y: 60 })).toEqual(expected);
    // De droite à gauche (le geste naturel en RTL) et de bas en haut.
    expect(normalizeRect({ x: 40, y: 60 }, { x: 10, y: 20 })).toEqual(expected);
    expect(normalizeRect({ x: 40, y: 20 }, { x: 10, y: 60 })).toEqual(expected);
  });

  it('un clic n’est pas une sélection', () => {
    expect(isMeaningfulRect({ x: 0, y: 0, width: 2, height: 2 })).toBe(false);
    expect(isMeaningfulRect({ x: 0, y: 0, width: 50, height: 3 })).toBe(false);
    expect(isMeaningfulRect({ x: 0, y: 0, width: 6, height: 6 })).toBe(true);
  });

  it('dessine chaque cadre en rouge, à l’échelle de l’export', () => {
    const ctx = { save: vi.fn(), restore: vi.fn(), strokeRect: vi.fn(), strokeStyle: null, lineWidth: 0 };
    drawMarks(ctx, [{ x: 100, y: 50, width: 200, height: 80 }, { x: 0, y: 0, width: 10, height: 10 }], 0.5);
    expect(ctx.strokeStyle).toBe(MARK_COLOR);
    expect(ctx.strokeRect).toHaveBeenCalledTimes(2);
    expect(ctx.strokeRect).toHaveBeenNthCalledWith(1, 50, 25, 100, 40);
    // Le trait reste visible même réduit.
    expect(ctx.lineWidth).toBeGreaterThanOrEqual(3);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('aucun cadre : rien n’est tracé', () => {
    const ctx = { save: vi.fn(), restore: vi.fn(), strokeRect: vi.fn() };
    drawMarks(ctx, []);
    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  it('borne la taille de l’image envoyée et nomme l’attribut d’exclusion', () => {
    expect(MAX_EXPORT_WIDTH).toBeLessThanOrEqual(2000);
    expect(IGNORE_ATTRIBUTE).toBe('data-report-ignore');
  });
});

describe('regionInBody — la région de la fenêtre dans le repère de la page', () => {
  it('sans défilement, la région est inchangée', () => {
    expect(regionInBody({ x: 10, y: 20, width: 100, height: 50 }, { left: 0, top: 0 }))
      .toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('après un défilement de 1200 px, la région descend d’autant dans la page', () => {
    // getBoundingClientRect() du corps est négatif une fois la page défilée.
    expect(regionInBody({ x: 10, y: 20, width: 100, height: 50 }, { left: 0, top: -1200 }))
      .toEqual({ x: 10, y: 1220, width: 100, height: 50 });
  });

  it('ne sort jamais du haut ou du bord de la page', () => {
    expect(regionInBody({ x: 0, y: 0, width: 10, height: 10 }, { left: 40, top: 30 }))
      .toMatchObject({ x: 0, y: 0 });
  });
});
