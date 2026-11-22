import { describe, it, expect } from 'vitest';
import {
  volumeOf, surfaceAreaOf, slantHeight, faceAreaOf, faceKinds, measuresOf, substitutedFormulas, latexNumber, FORMULAS,
} from './geometryCalculations.js';

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

describe('volume et aire des solides', () => {
  it('cube a = 2 : V = 8, A = 24', () => {
    expect(volumeOf('cube', { side: 2 })).toBe(8);
    expect(surfaceAreaOf('cube', { side: 2 })).toBe(24);
  });

  it('pavé 2 × 3 × 4 : V = 24, A = 52', () => {
    const d = { length: 2, width: 3, height: 4 };
    expect(volumeOf('cuboid', d)).toBe(24);
    expect(surfaceAreaOf('cuboid', d)).toBe(52);
  });

  it('sphère r = 2 : V = 32π/3, A = 16π', () => {
    expect(close(volumeOf('sphere', { radius: 2 }), (32 * Math.PI) / 3)).toBe(true);
    expect(close(surfaceAreaOf('sphere', { radius: 2 }), 16 * Math.PI)).toBe(true);
    expect(volumeOf('sphere', { radius: 2 })).toBeCloseTo(33.5103, 3);
    expect(surfaceAreaOf('sphere', { radius: 2 })).toBeCloseTo(50.2655, 3);
  });

  it('cylindre r = 2, h = 5 : V = 20π, A = 28π', () => {
    const d = { radius: 2, height: 5 };
    expect(close(volumeOf('cylinder', d), 20 * Math.PI)).toBe(true);
    expect(close(surfaceAreaOf('cylinder', d), 8 * Math.PI + 20 * Math.PI)).toBe(true);
  });

  it('cône r = 3, h = 4 : l = 5, V = 12π, A = 9π + 15π = 24π', () => {
    const d = { radius: 3, height: 4 };
    expect(slantHeight(3, 4)).toBe(5);
    expect(close(volumeOf('cone', d), 12 * Math.PI)).toBe(true);
    expect(close(surfaceAreaOf('cone', d), 24 * Math.PI)).toBe(true);
    expect(measuresOf('cone', d).slant).toBe(5);
  });

  it('ne confond pas rayon, hauteur et apothème : l dépend des deux', () => {
    expect(slantHeight(1, 1)).toBeCloseTo(Math.SQRT2, 12);
    expect(surfaceAreaOf('cone', { radius: 1, height: 1 })).toBeCloseTo(Math.PI + Math.PI * Math.SQRT2, 12);
  });

  it('un solide inconnu ne calcule rien', () => {
    expect(Number.isNaN(volumeOf('torus', {}))).toBe(true);
    expect(Number.isNaN(surfaceAreaOf('torus', {}))).toBe(true);
    expect(measuresOf('cube', { side: 3 }).slant).toBeNull();
  });
});

describe('les faces', () => {
  it('le pavé a six faces dont les aires se somment à A', () => {
    const d = { length: 2, width: 3, height: 4 };
    const total = faceKinds('cuboid').reduce((sum, _, i) => sum + faceAreaOf('cuboid', d, i), 0);
    expect(total).toBe(surfaceAreaOf('cuboid', d));
    expect(faceAreaOf('cuboid', d, 2)).toBe(6); // le dessus : L × l
    expect(faceAreaOf('cuboid', d, 0)).toBe(12); // une face en x : l × h
  });

  it('le cylindre : latérale + deux disques = A ; le cône : latérale + base = A ; la sphère : une surface', () => {
    const c = { radius: 2, height: 5 };
    expect(faceAreaOf('cylinder', c, 0) + faceAreaOf('cylinder', c, 1) + faceAreaOf('cylinder', c, 2)).toBeCloseTo(surfaceAreaOf('cylinder', c), 12);
    const k = { radius: 3, height: 4 };
    expect(faceKinds('cone')[1]).toBeNull(); // pas de disque du haut
    expect(faceAreaOf('cone', k, 0) + faceAreaOf('cone', k, 2)).toBeCloseTo(surfaceAreaOf('cone', k), 12);
    expect(Number.isNaN(faceAreaOf('cone', k, 1))).toBe(true);
    expect(faceAreaOf('sphere', { radius: 2 }, 0)).toBeCloseTo(16 * Math.PI, 12);
    expect(Number.isNaN(faceAreaOf('cube', { side: 1 }, 6))).toBe(true);
  });
});

describe('les formules', () => {
  it('existent pour chaque solide, et le cône a son apothème', () => {
    for (const shape of ['cube', 'cuboid', 'sphere', 'cylinder', 'cone']) {
      expect(FORMULAS[shape].volume).toMatch(/^V = /);
      expect(FORMULAS[shape].surface).toMatch(/^A = /);
    }
    expect(FORMULAS.cone.slant).toBe('l = \\sqrt{r^2 + h^2}');
  });

  it('substituent les dimensions avec la virgule décimale', () => {
    expect(latexNumber(2.5)).toBe('2{,}5');
    expect(latexNumber(3)).toBe('3');
    expect(latexNumber(NaN)).toBe('?');
    expect(substitutedFormulas('cuboid', { length: 4, width: 2, height: 3 }).volume).toBe('V = 4 \\times 2 \\times 3');
    expect(substitutedFormulas('cone', { radius: 3, height: 4 }).surface).toBe('A = \\pi \\times 3^2 + \\pi \\times 3 \\times 5');
    expect(substitutedFormulas('cube', { side: 1.5 }).volume).toBe('V = 1{,}5^3');
  });
});
