import { describe, it, expect } from 'vitest';
import { floorHeight, floorHeightFor, towerGeometry, towerWidth, LEVELS } from './geometry';

describe('elevator-reel — la géométrie de la tour', () => {
  it('écran de jeu : les 19 niveaux tiennent dans la hauteur donnée (20 … 44 px), la tour fait 40 % de l’écran, la cabine grandit', () => {
    for (const avail of [560, 640, 800, 900]) expect(towerGeometry({ width: 400, fh: floorHeightFor(avail) }).H).toBeLessThanOrEqual(avail);
    expect(floorHeightFor(300)).toBe(20);
    expect(floorHeightFor(2000)).toBe(44);
    expect(towerWidth(1000, true, true)).toBe(400);
    expect(towerWidth(600, true, true)).toBe(340);
    expect(towerWidth(2000, true, true)).toBe(560);
    expect(towerWidth(1000, true)).toBe(280); // dans la page : inchangé
    expect(towerGeometry({ width: 560, fh: 30 }).shaftW).toBe(110);
    expect(towerGeometry({ width: 280, fh: 30 }).shaftW).toBe(70);
  });
  it('étage ≥ 20 px, ≤ 30 px, croît avec l’écran', () => {
    expect(floorHeight(768)).toBe(20);
    expect(floorHeight(1080)).toBe(30);
    for (let h = 500; h < 1400; h += 50) expect(floorHeight(h)).toBeGreaterThanOrEqual(20);
    expect(floorHeight(900)).toBeGreaterThanOrEqual(floorHeight(800));
  });
  it('les niveaux sont ordonnés de haut en bas et se touchent ; la cabine est centrée sur son niveau', () => {
    for (const [width, fh] of [[132, 20], [150, 22], [280, 30]]) {
      const g = towerGeometry({ width, fh });
      for (let f = -9; f < 9; f += 1) expect(g.edge(f) - g.edge(f + 1)).toBe(fh);
      expect(g.y(0)).toBe(g.edge(0) + fh / 2);
      expect(g.y(-9) + fh / 2 + 12).toBe(g.H);
      expect(g.y(3.5)).toBeCloseTo((g.y(3) + g.y(4)) / 2, 9);
      // le puits et la colonne des flèches tiennent dans la tour, à droite des étiquettes
      expect(g.shaftX).toBeGreaterThan(g.bodyX + 20);
      expect(g.arrowX + 8).toBeLessThanOrEqual(width);
      expect(g.H).toBe(g.top + LEVELS * fh + 12);
    }
  });
  it('la largeur de la tour', () => {
    expect(towerWidth(414, false)).toBe(160);
    expect(towerWidth(300, false)).toBe(132);
    expect(towerWidth(900, true)).toBe(280);
  });
});
