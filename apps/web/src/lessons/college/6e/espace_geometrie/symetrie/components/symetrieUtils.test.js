import { describe, it, expect } from 'vitest';
import {
  checkSymmetric, symmetricHint, symmetryAxesOf, countSymmetryAxes,
  conservationReport, CONSERVEES, NON_CONSERVEES, TOL,
  lineThrough, reflectPoint, distPointLine, dist, midpoint,
} from './symetrieUtils';

const P = (x, y) => ({ x, y });
const AXE_V = lineThrough(P(150, 0), P(150, 200));      // vertical x = 150
const AXE_OBL = lineThrough(P(40, 40), P(160, 160));    // oblique

describe('les DEUX conditions du symétrique', () => {
  it('accepte le vrai symétrique', () => {
    const M = P(90, 70);
    const r = checkSymmetric(AXE_V, M, reflectPoint(AXE_V, M));
    expect(r.ok).toBe(true);
    expect(r.perpendiculaire).toBe(true);
    expect(r.distanceEgale).toBe(true);
    expect(symmetricHint(r)).toMatch(/exactement le symétrique/);
  });

  it('refuse un point à la BONNE distance mais mal placé (pas perpendiculaire)', () => {
    const M = P(90, 70);
    // Même distance à l'axe, mais décalé verticalement : (MM') n'est plus ⊥.
    const faux = P(210, 140);
    const r = checkSymmetric(AXE_V, M, faux);
    expect(r.ok).toBe(false);
    expect(r.distanceEgale).toBe(true);   // la distance, elle, est bonne
    expect(r.perpendiculaire).toBe(false);
    expect(symmetricHint(r)).toMatch(/perpendiculaire/);
  });

  it('refuse un point BIEN aligné mais à la mauvaise distance', () => {
    const M = P(90, 70);
    const trop = P(240, 70);   // aligné horizontalement, mais trop loin
    const r = checkSymmetric(AXE_V, M, trop);
    expect(r.ok).toBe(false);
    expect(r.perpendiculaire).toBe(true);
    expect(r.distanceEgale).toBe(false);
    expect(symmetricHint(r)).toMatch(/trop loin/);
  });

  it('nomme « trop près » quand l’élève sous-estime la distance', () => {
    const M = P(60, 70);
    const r = checkSymmetric(AXE_V, M, P(180, 70));
    expect(r.ok).toBe(false);
    expect(symmetricHint(r)).toMatch(/trop près/);
  });

  it('refuse un point resté du MÊME côté de l’axe', () => {
    const M = P(90, 70);
    const r = checkSymmetric(AXE_V, M, P(92, 70));
    expect(r.ok).toBe(false);
  });

  it('fonctionne sur un axe oblique, pas seulement vertical', () => {
    const M = P(140, 60);
    const img = reflectPoint(AXE_OBL, M);
    expect(checkSymmetric(AXE_OBL, M, img).ok).toBe(true);
    // Le milieu [M M'] tombe sur l'axe, et (MM') lui est perpendiculaire.
    expect(distPointLine(AXE_OBL, midpoint(M, img))).toBeLessThan(1e-6);
  });

  it('la cible renvoyée EST le symétrique — jamais une valeur inventée', () => {
    const M = P(75, 120);
    const r = checkSymmetric(AXE_V, M, P(0, 0));
    expect(dist(r.cible, reflectPoint(AXE_V, M))).toBeLessThan(1e-9);
  });
});

describe('axes de symétrie d’une figure', () => {
  const CARRE = [P(50, 50), P(150, 50), P(150, 150), P(50, 150)];
  const RECT = [P(30, 60), P(190, 60), P(190, 140), P(30, 140)];
  const EQUI = [P(100, 30), P(160, 134), P(40, 134)];
  const QUELCONQUE = [P(30, 40), P(170, 55), P(150, 150), P(45, 130)];

  it('le carré a 4 axes, le rectangle 2', () => {
    expect(countSymmetryAxes(CARRE)).toBe(4);
    expect(countSymmetryAxes(RECT)).toBe(2);
  });

  it('le triangle équilatéral en a 3', () => {
    expect(countSymmetryAxes(EQUI, 6)).toBe(3);
  });

  it('une figure quelconque n’en a aucun', () => {
    expect(countSymmetryAxes(QUELCONQUE)).toBe(0);
  });

  it('chaque axe trouvé est réellement un axe de symétrie', () => {
    for (const axis of symmetryAxesOf(CARRE)) {
      for (const p of CARRE) {
        const img = reflectPoint(axis, p);
        expect(CARRE.some((q) => dist(q, img) <= 4)).toBe(true);
      }
    }
  });
});

describe('ce que la symétrie conserve', () => {
  const FIG = [P(60, 40), P(120, 55), P(95, 130)];

  it('conserve longueurs, angles, périmètre et aire', () => {
    for (const axis of [AXE_V, AXE_OBL]) {
      const r = conservationReport(FIG, axis);
      expect(r.longueurs).toBe(true);
      expect(r.angles).toBe(true);
      expect(r.perimetre).toBe(true);
      expect(r.aire).toBe(true);
    }
  });

  it('déplace bien la figure (la position, elle, change)', () => {
    const r = conservationReport(FIG, AXE_V);
    expect(r.image.every((q, i) => dist(q, FIG[i]) > 1)).toBe(true);
  });

  it('les listes de la fiche sont exploitables', () => {
    expect(CONSERVEES.length).toBeGreaterThanOrEqual(4);
    expect(NON_CONSERVEES.length).toBeGreaterThanOrEqual(1);
    for (const c of [...CONSERVEES, ...NON_CONSERVEES]) expect(c.label).toBeTruthy();
  });
});
