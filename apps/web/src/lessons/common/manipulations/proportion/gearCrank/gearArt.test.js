import { describe, it, expect } from 'vitest';
import * as A from './gearArt';

describe('gear-crank — le dessin est honnête', () => {
  it('un engrenage de n dents a exactement n dents dessinées, de pas constant', () => {
    for (const n of [12, 24, 30, 32, 42, 52]) {
      const teeth = A.gearTeeth(n);
      expect(teeth, `n = ${n}`).toHaveLength(n);
      const { d, r } = A.gearPath(n);
      expect((d.match(/M/g) ?? []).length).toBe(1);
      expect(d.split('L').length - 1).toBe(n * 4 - 1);               // 4 sommets par dent
      // la distance entre les sommets de deux dents voisines (sur le cercle primitif) est le PAS
      const chord = 2 * r * Math.sin(Math.PI / n);
      expect(Math.abs(chord - A.PITCH) / A.PITCH).toBeLessThan(n < 14 ? 0.03 : 0.01);
    }
  });

  it('le plateau de 24 dents est plus petit que celui de 52, au même pas', () => {
    expect(A.pitchRadius(24)).toBeLessThan(A.pitchRadius(52));
    expect(A.pitchRadius(48) / A.pitchRadius(24)).toBeCloseTo(2, 6);
  });

  it('la chaîne se ferme sur un nombre entier de maillons et avance d\'un pas par dent', () => {
    const r1 = A.pitchRadius(24); const r2 = A.pitchRadius(32);
    const g = A.chainGeometry({ x: 162, y: 180 }, r1, { x: 76, y: 166 }, r2);
    expect(g.links * g.pEff).toBeCloseTo(g.length, 6);
    expect(Math.abs(g.pEff - A.PITCH) / A.PITCH).toBeLessThan(0.05);
    expect(g.d.startsWith('M')).toBe(true);
    expect(A.chainOffset(0, g)).toBeCloseTo(0, 9);
    expect(A.chainOffset(1, g)).toBeCloseTo(-g.pEff, 9);
    expect(Math.abs(A.chainOffset(g.links, g))).toBeLessThan(1e-6);   // `links` pas = un tour complet de chaîne : le motif revient
  });

  it('l\'anneau se remplit de la fraction demandée', () => {
    expect(A.arcPath(0, 0, 10, 0)).toBe('');
    expect(A.arcPath(0, 0, 10, 1)).toContain('Z');
    expect(A.arcPath(0, 0, 10, 0.25)).toContain('10 0');
  });
});
