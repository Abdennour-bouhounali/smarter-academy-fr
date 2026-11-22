import { describe, it, expect } from 'vitest';
import { boardGeometry, PILL_ROOM } from './geometry';

describe('sign-machine — géométrie du tableau', () => {
  for (const width of [300, 420, 560, 760]) for (const scaleMax of [12, 16]) {
    it(`largeur ${width}, échelle ${scaleMax} : colonnes régulières, barres à l'échelle, pilules dans le cadre`, () => {
      const g = boardGeometry({ width, scaleMax });
      // les neuf colonnes sont dans le cadre, à pas constant, de gauche (−4) à droite (4)
      expect(g.x(-4) - g.colW / 2).toBeCloseTo(g.padX);
      expect(g.x(4) + g.colW / 2).toBeCloseTo(g.W - g.padX);
      for (let b = -4; b < 4; b += 1) expect(g.x(b + 1) - g.x(b)).toBeCloseTo(g.colW);
      // la barre est proportionnelle au produit, la plus grande touche la marge des pilules
      expect(g.yOf(0)).toBe(g.y0);
      expect(g.yOf(scaleMax)).toBeCloseTo(PILL_ROOM);
      expect(g.yOf(-scaleMax)).toBeCloseTo(g.boardBottom - PILL_ROOM);
      expect(g.y0 - g.yOf(6)).toBeCloseTo(2 * (g.y0 - g.yOf(3)));
      expect(g.yOf(-5) - g.y0).toBeCloseTo(g.y0 - g.yOf(5));
      // le rail est sous le tableau et dans le dessin
      expect(g.railY - 19).toBeGreaterThan(g.boardBottom); // le bouton du curseur ne mord pas sur le tableau
      expect(g.barW + g.gapW).toBeCloseTo(g.colW);
      expect(g.H).toBeGreaterThan(g.railY + 20);
      // une abscisse retrouve sa colonne
      for (let b = -4; b <= 4; b += 1) expect(g.bAt(g.x(b) + g.colW * 0.3)).toBe(b);
      expect(g.bAt(-50)).toBe(-4);
      expect(g.bAt(g.W + 50)).toBe(4);
    });
  }
});
