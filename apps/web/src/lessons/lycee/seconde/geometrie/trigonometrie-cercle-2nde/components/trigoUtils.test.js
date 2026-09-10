import { describe, it, expect } from 'vitest';
import { TAU, principal, pointOf, toDegrees, toRadians, REMARKABLE, snapRemarkable, solveCos, solveSin } from './trigoUtils';

describe('enroulement et radian', () => {
  it('un tour complet ramène au point de départ', () => {
    const a = pointOf(0);
    const b = pointOf(TAU);
    expect(b.x).toBeCloseTo(a.x, 12);
    expect(b.y).toBeCloseTo(a.y, 12);
  });

  it('principal ramène dans [0 ; 2π[, y compris pour un réel négatif', () => {
    expect(principal(TAU + 1)).toBeCloseTo(1, 12);
    expect(principal(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(principal(0)).toBe(0);
  });

  it('π radians valent 180 degrés, dans les deux sens', () => {
    expect(toDegrees(Math.PI)).toBeCloseTo(180, 12);
    expect(toRadians(180)).toBeCloseTo(Math.PI, 12);
    expect(toDegrees(Math.PI / 6)).toBeCloseTo(30, 12);
    expect(toRadians(45)).toBeCloseTo(Math.PI / 4, 12);
  });

  it('le point du cercle est toujours à distance 1 de l’origine', () => {
    for (const t of [0, 0.3, 1, 2.7, 4.2, 6]) {
      const p = pointOf(t);
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(1, 12);
    }
  });
});

describe('valeurs remarquables — la table AFFICHÉE dit la vérité de la figure', () => {
  const EXACT = {
    0: [1, 0],
    [Math.PI / 6]: [Math.sqrt(3) / 2, 1 / 2],
    [Math.PI / 4]: [Math.sqrt(2) / 2, Math.sqrt(2) / 2],
    [Math.PI / 3]: [1 / 2, Math.sqrt(3) / 2],
    [Math.PI / 2]: [0, 1],
  };

  it('chaque valeur remarquable a les coordonnées que sa ligne annonce', () => {
    for (const [t, [c, s]] of Object.entries(EXACT)) {
      const p = pointOf(Number(t));
      expect(p.x).toBeCloseTo(c, 12);
      expect(p.y).toBeCloseTo(s, 12);
    }
  });

  it('π/4 est le seul angle du premier quart où cosinus et sinus sont ÉGAUX', () => {
    const p = pointOf(Math.PI / 4);
    expect(p.x).toBeCloseTo(p.y, 12);
    for (const t of [Math.PI / 6, Math.PI / 3]) {
      const q = pointOf(t);
      expect(Math.abs(q.x - q.y)).toBeGreaterThan(0.3);
    }
  });

  it('π/6 et π/3 échangent leurs coordonnées — le piège de la table', () => {
    const a = pointOf(Math.PI / 6);
    const b = pointOf(Math.PI / 3);
    expect(a.x).toBeCloseTo(b.y, 12);
    expect(a.y).toBeCloseTo(b.x, 12);
  });

  it('snapRemarkable reconnaît un angle remarquable et rien d’autre', () => {
    expect(snapRemarkable(Math.PI / 3)?.label).toBe('\\dfrac{\\pi}{3}');
    expect(snapRemarkable(1.1)).toBeNull();
  });

  it('les huit lignes de la table sont rangées par angle croissant', () => {
    const ts = REMARKABLE.map((r) => r.t);
    expect([...ts].sort((a, b) => a - b)).toEqual(ts);
  });
});

describe('cos²t + sin²t = 1 — Pythagore sur un rayon de 1', () => {
  it('vaut 1 pour tout t, remarquable ou non', () => {
    for (const t of [0, 0.7, Math.PI / 6, 2, Math.PI, 4.9, 6.2]) {
      const p = pointOf(t);
      expect(p.x * p.x + p.y * p.y).toBeCloseTo(1, 12);
    }
  });
});

describe('équations — le cercle a DEUX solutions, pas une', () => {
  it('cos t = 1/2 donne π/3 ET 5π/3', () => {
    const s = solveCos(0.5);
    expect(s).toHaveLength(2);
    expect(s[0]).toBeCloseTo(Math.PI / 3, 12);
    expect(s[1]).toBeCloseTo((5 * Math.PI) / 3, 12);
  });

  it('sin t = 1/2 donne π/6 ET 5π/6 — symétrie VERTICALE, pas horizontale', () => {
    const s = solveSin(0.5);
    expect(s).toHaveLength(2);
    expect(s[0]).toBeCloseTo(Math.PI / 6, 12);
    expect(s[1]).toBeCloseTo((5 * Math.PI) / 6, 12);
  });

  it('les deux familles de solutions ne se confondent pas', () => {
    const c = solveCos(0.5).map((t) => t.toFixed(6));
    const s = solveSin(0.5).map((t) => t.toFixed(6));
    expect(c).not.toEqual(s);
  });

  it('les cas limites donnent UNE seule solution', () => {
    expect(solveCos(1)).toHaveLength(1);
    expect(solveCos(-1)).toHaveLength(1);
    expect(solveSin(1)).toHaveLength(1);
  });

  it('hors de [−1 ; 1], aucune solution — le point ne quitte jamais le cercle', () => {
    expect(solveCos(1.5)).toEqual([]);
    expect(solveSin(-2)).toEqual([]);
  });

  it('toute solution rendue vérifie réellement l’équation', () => {
    for (const a of [-0.9, -0.5, 0, 0.3, 0.8]) {
      for (const t of solveCos(a)) expect(Math.cos(t)).toBeCloseTo(a, 12);
      for (const t of solveSin(a)) expect(Math.sin(t)).toBeCloseTo(a, 12);
    }
  });
});
