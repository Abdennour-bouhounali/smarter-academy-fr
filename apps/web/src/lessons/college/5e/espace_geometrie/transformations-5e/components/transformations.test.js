import { describe, it, expect } from 'vitest';
import {
  rotate, rotatePartial, symCentral, symCentralPts, estCentreDeSymetrie,
  centreDe, FIGURES_CENTRE, aireOrientee, estRetournee, symAxial, DRAPEAU, placer,
} from './transformations';

const P = (x, y) => ({ x, y });
const close = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('le périmètre est exécutable', () => {
  it('accepte le demi-tour', () => {
    expect(rotate(P(4, 0), P(0, 0), 180)).toEqual(P(-4, 0));
    expect(rotate(P(4, 0), P(0, 0), -180)).toEqual(P(-4, 0));
  });

  it('REFUSE toute autre rotation — c’est de la 4e', () => {
    expect(() => rotate(P(1, 0), P(0, 0), 90)).toThrow(/5e/);
    expect(() => rotate(P(1, 0), P(0, 0), 45)).toThrow(/4e/);
    expect(() => rotate(P(1, 0), P(0, 0), 0)).toThrow();
  });
});

describe('l’animation du demi-tour', () => {
  it('à 0° la figure n’a pas bougé', () => {
    const p = P(30, 10);
    const r = rotatePartial(p, P(0, 0), 0);
    close(r.x, p.x); close(r.y, p.y);
  });

  it('à 180° elle est exactement sur la symétrique — l’animation ne triche pas', () => {
    const c = P(12, -5);
    for (const p of [P(0, 0), P(40, 90), P(-30, 7)]) {
      const r = rotatePartial(p, c, 180);
      const s = symCentral(p, c);
      close(r.x, s.x, 1e-9); close(r.y, s.y, 1e-9);
    }
  });

  it('à mi-parcours (90°) elle n’y est PAS — sinon l’animation serait un mensonge', () => {
    const r = rotatePartial(P(10, 0), P(0, 0), 90);
    expect(Math.hypot(r.x - (-10), r.y - 0)).toBeGreaterThan(1);
  });

  it('garde la distance au centre tout au long du tour', () => {
    const c = P(5, 5); const p = P(45, 25);
    const d0 = Math.hypot(p.x - c.x, p.y - c.y);
    for (const a of [0, 30, 60, 90, 120, 150, 180]) {
      const r = rotatePartial(p, c, a);
      close(Math.hypot(r.x - c.x, r.y - c.y), d0, 1e-9);
    }
  });
});

describe('le centre de symétrie d’une figure', () => {
  it('classe les quatre figures du module 5 — la donnée est vérifiée, pas déclarée', () => {
    for (const f of FIGURES_CENTRE) {
      const c = centreDe(f.pts);
      expect(estCentreDeSymetrie(f.pts, c)).toBe(f.aCentre);
    }
  });

  it('un parallélogramme revient sur lui-même autour du croisement de ses diagonales', () => {
    const p = FIGURES_CENTRE.find((f) => f.id === 'parallelogramme');
    expect(estCentreDeSymetrie(p.pts, centreDe(p.pts))).toBe(true);
  });

  it('aucun autre point ne convient pour cette figure', () => {
    const p = FIGURES_CENTRE.find((f) => f.id === 'rectangle');
    const c = centreDe(p.pts);
    for (const off of [P(20, 0), P(0, 15), P(-25, 25)]) {
      expect(estCentreDeSymetrie(p.pts, P(c.x + off.x, c.y + off.y))).toBe(false);
    }
  });

  it('le triangle équilatéral n’a PAS de centre de symétrie, malgré ses axes', () => {
    // Le piège de la leçon : « très symétrique » ne veut pas dire
    // « a un centre de symétrie ».
    const t = FIGURES_CENTRE.find((f) => f.id === 'triangle');
    expect(estCentreDeSymetrie(t.pts, centreDe(t.pts))).toBe(false);
  });
});

describe('demi-tour contre pliage — le test du module 6', () => {
  const fig = placer(DRAPEAU, P(200, 200));

  it('le demi-tour NE retourne PAS la figure', () => {
    expect(estRetournee(fig, symCentralPts(fig, P(300, 250)))).toBe(false);
  });

  it('le pliage, lui, la retourne — c’est la différence observable', () => {
    const plie = fig.map((p) => symAxial(p, P(400, 0), P(400, 400)));
    expect(estRetournee(fig, plie)).toBe(true);
  });

  it('les deux conservent l’aire : ce n’est donc pas l’aire qui les distingue', () => {
    const plie = fig.map((p) => symAxial(p, P(400, 0), P(400, 400)));
    const a = Math.abs(aireOrientee(fig));
    close(Math.abs(aireOrientee(symCentralPts(fig, P(300, 250)))), a, 1e-6);
    close(Math.abs(aireOrientee(plie)), a, 1e-6);
  });
});
