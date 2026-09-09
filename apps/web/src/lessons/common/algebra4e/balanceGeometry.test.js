import { describe, it, expect } from 'vitest';
import {
  balanceGeometry, tiltFor, W, H, MAX_TILT, PIVOT_X, PIVOT_Y,
} from './balanceGeometry';

/**
 * L'invariant visuel de la balance, BALAYÉ et non échantillonné (§17bis :
 * « sweep the range, don't sample it »). Un écart peut valoir n'importe quoi
 * — l'élève peut construire 1000x = 1 — et aucune de ces valeurs ne doit
 * faire sortir un plateau du cadre.
 */
const SWEEP = [];
for (let d = -200; d <= 200; d += 0.25) SWEEP.push(d);
// Les extrêmes que la compression doit absorber.
SWEEP.push(-1e6, -5000, -0.001, 0, 0.001, 5000, 1e6);

describe('inclinaison', () => {
  it('est nulle exactement à l’équilibre', () => {
    expect(tiltFor(0)).toBe(0);
    expect(balanceGeometry(0).level).toBe(true);
  });

  it('se voit dès le plus petit écart réel', () => {
    // Un écart de 1 doit produire une inclinaison perceptible (> 1°),
    // sinon la balance ment : elle a l'air droite alors qu'elle ne l'est pas.
    expect(Math.abs(tiltFor(1))).toBeGreaterThan(1);
    expect(balanceGeometry(1).level).toBe(false);
    expect(balanceGeometry(-1).level).toBe(false);
  });

  it('reste bornée pour tout écart, si grand soit-il', () => {
    for (const d of SWEEP) {
      expect(Math.abs(tiltFor(d)), `écart ${d}`).toBeLessThanOrEqual(MAX_TILT + 1e-9);
    }
  });

  it('fait descendre le plateau le plus lourd', () => {
    // Écart positif = membre gauche plus lourd = plateau gauche plus BAS
    // (y croissant vers le bas dans un viewBox SVG).
    const g = balanceGeometry(5);
    expect(g.leftEnd.y).toBeGreaterThan(g.rightEnd.y);
    const h = balanceGeometry(-5);
    expect(h.leftEnd.y).toBeLessThan(h.rightEnd.y);
  });

  it('est monotone : plus l’écart est grand, plus ça penche', () => {
    for (let d = 0.25; d < 60; d += 0.25) {
      expect(Math.abs(tiltFor(d + 0.25))).toBeGreaterThanOrEqual(Math.abs(tiltFor(d)) - 1e-12);
    }
  });

  it('est symétrique', () => {
    for (const d of [0.5, 3, 17, 400]) {
      expect(tiltFor(-d)).toBeCloseTo(-tiltFor(d), 12);
    }
  });
});

describe('invariant de mise en page — aucun état ne sort du cadre', () => {
  it('garde les deux plateaux entièrement dans le viewBox', () => {
    for (const d of SWEEP) {
      const { leftPan, rightPan } = balanceGeometry(d);
      for (const [name, pan] of [['gauche', leftPan], ['droite', rightPan]]) {
        expect(pan.x0, `plateau ${name}, écart ${d}`).toBeGreaterThanOrEqual(0);
        expect(pan.x1, `plateau ${name}, écart ${d}`).toBeLessThanOrEqual(W);
        expect(pan.y0, `plateau ${name}, écart ${d}`).toBeGreaterThanOrEqual(0);
        expect(pan.y1, `plateau ${name}, écart ${d}`).toBeLessThanOrEqual(H);
      }
    }
  });

  it('garde les extrémités du fléau dans le cadre', () => {
    for (const d of SWEEP) {
      const { leftEnd, rightEnd } = balanceGeometry(d);
      for (const [name, p] of [['gauche', leftEnd], ['droite', rightEnd]]) {
        expect(p.x, `bras ${name}, écart ${d}`).toBeGreaterThanOrEqual(0);
        expect(p.x, `bras ${name}, écart ${d}`).toBeLessThanOrEqual(W);
        expect(p.y, `bras ${name}, écart ${d}`).toBeGreaterThanOrEqual(0);
        expect(p.y, `bras ${name}, écart ${d}`).toBeLessThanOrEqual(H);
      }
    }
  });

  it('ne laisse jamais les deux plateaux se chevaucher', () => {
    for (const d of SWEEP) {
      const { leftPan, rightPan } = balanceGeometry(d);
      expect(leftPan.x1, `écart ${d}`).toBeLessThan(rightPan.x0);
    }
  });

  it('ne laisse jamais un plateau recouvrir la colonne centrale', () => {
    for (const d of SWEEP) {
      const { leftPan, rightPan } = balanceGeometry(d);
      expect(leftPan.x1, `écart ${d}`).toBeLessThan(PIVOT_X);
      expect(rightPan.x0, `écart ${d}`).toBeGreaterThan(PIVOT_X);
    }
  });

  it('garde les plateaux sous le pivot — jamais au-dessus du fléau', () => {
    for (const d of SWEEP) {
      const { leftPan, rightPan } = balanceGeometry(d);
      expect(leftPan.y0, `écart ${d}`).toBeGreaterThan(PIVOT_Y);
      expect(rightPan.y0, `écart ${d}`).toBeGreaterThan(PIVOT_Y);
    }
  });

  it('traite une valeur non finie comme un équilibre plutôt que de casser', () => {
    for (const bad of [NaN, Infinity, -Infinity, undefined]) {
      expect(tiltFor(bad)).toBe(0);
      const g = balanceGeometry(bad);
      expect(Number.isFinite(g.leftEnd.x)).toBe(true);
      expect(Number.isFinite(g.rightEnd.y)).toBe(true);
    }
  });
});
