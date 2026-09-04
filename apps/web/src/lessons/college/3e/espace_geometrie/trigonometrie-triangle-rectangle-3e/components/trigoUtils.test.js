import { describe, it, expect } from 'vitest';
import {
  sinDeg, cosDeg, tanDeg, asinDeg, acosDeg, atanDeg,
  ratiosFor, ratiosFromSides, sidesFor, trianglePoints,
  roleOfSides, roleOf, SIDE_NAMES, RATIO_DEF, chooseRatio,
  solveSide, solveAngle, roundTenth, isPlausibleRatio,
  BOX, RAMPES, SIGNATURE,
} from './trigoUtils';

const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('fonctions en degrés', () => {
  it('donne les valeurs remarquables', () => {
    near(sinDeg(30), 0.5, 1e-12);
    near(cosDeg(60), 0.5, 1e-12);
    near(tanDeg(45), 1, 1e-12);
    near(sinDeg(90), 1, 1e-12);
    near(cosDeg(0), 1, 1e-12);
  });

  it('les réciproques ramènent à l’angle de départ', () => {
    for (const a of [10, 25, 37, 60, 80]) {
      near(asinDeg(sinDeg(a)), a, 1e-9);
      near(acosDeg(cosDeg(a)), a, 1e-9);
      near(atanDeg(tanDeg(a)), a, 1e-9);
    }
  });

  it('sin² + cos² = 1 pour tout angle', () => {
    for (const a of [5, 18, 33, 47, 62, 85]) {
      near(sinDeg(a) ** 2 + cosDeg(a) ** 2, 1, 1e-12);
    }
  });
});

describe('L’INVARIANCE — le rapport ne dépend QUE de l’angle', () => {
  it('agrandir le triangle ne change aucun rapport', () => {
    const alpha = SIGNATURE.alpha;
    const attendu = ratiosFor(alpha);
    for (const hyp of SIGNATURE.echelles) {
      const r = ratiosFromSides(sidesFor(alpha, hyp));
      near(r.sin, attendu.sin, 1e-12);
      near(r.cos, attendu.cos, 1e-12);
      near(r.tan, attendu.tan, 1e-12);
    }
  });

  it('les LONGUEURS, elles, changent bien avec l’échelle', () => {
    const a = sidesFor(35, 70);
    const b = sidesFor(35, 160);
    expect(b.opp).toBeGreaterThan(a.opp);
    expect(b.adj).toBeGreaterThan(a.adj);
    // Et dans le même rapport que les hypoténuses.
    near(b.opp / a.opp, 160 / 70, 1e-9);
  });

  it('changer l’ANGLE change les rapports', () => {
    const r1 = ratiosFor(30);
    const r2 = ratiosFor(50);
    expect(Math.abs(r1.sin - r2.sin)).toBeGreaterThan(0.1);
    expect(Math.abs(r1.cos - r2.cos)).toBeGreaterThan(0.1);
  });

  it('les deux rampes donnent des longueurs ENTIÈRES et le MÊME quotient arrondi', () => {
    // Sans cela, l'arrondi afficherait deux quotients différents et le module
    // contredirait ce qu'il fait découvrir.
    const [a, b] = RAMPES;
    const sa = sidesFor(a.alpha, a.hyp);
    const sb = sidesFor(b.alpha, b.hyp);
    for (const v of [sa.opp, sa.adj, sb.opp, sb.adj]) {
      near(v, Math.round(v), 0.02);
    }
    const qa = Math.round(sa.opp) / Math.round(sa.adj);
    const qb = Math.round(sb.opp) / Math.round(sb.adj);
    near(qa, qb, 1e-9);
    near(qa, 0.75, 1e-9);
  });

  it('les deux rampes du déclencheur ont le même angle et des tailles différentes', () => {
    const [a, b] = RAMPES;
    expect(a.alpha).toBe(b.alpha);
    expect(a.hyp).not.toBe(b.hyp);
    const ra = ratiosFromSides(sidesFor(a.alpha, a.hyp));
    const rb = ratiosFromSides(sidesFor(b.alpha, b.hyp));
    near(ra.tan, rb.tan, 1e-12);
  });
});

describe('le triangle dessiné', () => {
  it('respecte la convention : angle droit en B, C au-dessus', () => {
    const { A, B, C } = trianglePoints(35, 120);
    near(A.y, B.y, 1e-9);          // [AB] horizontal
    near(B.x, C.x, 1e-9);          // [BC] vertical
    expect(C.y).toBeLessThan(B.y); // C vers le HAUT de l'écran
  });

  it('les longueurs dessinées correspondent aux longueurs calculées', () => {
    const alpha = 40;
    const hyp = 130;
    const { A, B, C } = trianglePoints(alpha, hyp);
    const d = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);
    const s = sidesFor(alpha, hyp);
    near(d(A, B), s.adj, 1e-9);
    near(d(B, C), s.opp, 1e-9);
    near(d(A, C), hyp, 1e-9);
  });

  it('l’angle en A vaut bien alpha', () => {
    for (const alpha of [15, 35, 55, 75]) {
      const { A, B, C } = trianglePoints(alpha, 120);
      const u = { x: B.x - A.x, y: B.y - A.y };
      const v = { x: C.x - A.x, y: C.y - A.y };
      const c = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
      near((Math.acos(c) * 180) / Math.PI, alpha, 1e-9);
    }
  });

  it('tous les sommets tiennent dans le cadre pour les échelles utilisées', () => {
    for (const hyp of SIGNATURE.echelles) {
      for (const alpha of [15, 35, 55, 75]) {
        const { A, B, C } = trianglePoints(alpha, hyp);
        for (const p of [A, B, C]) {
          expect(p.x).toBeGreaterThanOrEqual(BOX.xMin);
          expect(p.x).toBeLessThanOrEqual(BOX.xMax);
          expect(p.y).toBeGreaterThanOrEqual(BOX.yMin);
          expect(p.y).toBeLessThanOrEqual(BOX.yMax);
        }
      }
    }
  });
});

describe('nommer les côtés — la source d’erreur numéro un', () => {
  it('l’hypoténuse ne change JAMAIS de nom', () => {
    expect(roleOfSides('A').hyp).toBe('AC');
    expect(roleOfSides('C').hyp).toBe('AC');
  });

  it('opposé et adjacent S’ÉCHANGENT quand on change d’angle', () => {
    const a = roleOfSides('A');
    const c = roleOfSides('C');
    expect(a.opp).toBe(c.adj);
    expect(a.adj).toBe(c.opp);
  });

  it('donne le rôle d’un côté donné', () => {
    expect(roleOf('BC', 'A')).toBe('opp');
    expect(roleOf('BC', 'C')).toBe('adj');
    expect(roleOf('AC', 'A')).toBe('hyp');
    expect(roleOf('XY', 'A')).toBeNull();
  });

  it('refuse un sommet qui n’est pas un angle aigu', () => {
    expect(() => roleOfSides('B')).toThrow(/angles aigus/);
  });

  it('chaque rôle a un nom français', () => {
    for (const k of ['opp', 'adj', 'hyp']) expect(SIDE_NAMES[k]).toBeTruthy();
  });
});

describe('choisir le bon rapport', () => {
  it('trouve le rapport qui relie deux côtés — il y en a exactement un', () => {
    expect(chooseRatio('opp', 'hyp')).toBe('sin');
    expect(chooseRatio('hyp', 'opp')).toBe('sin');
    expect(chooseRatio('adj', 'hyp')).toBe('cos');
    expect(chooseRatio('opp', 'adj')).toBe('tan');
  });

  it('couvre les six paires ordonnées de côtés distincts', () => {
    const cotes = ['opp', 'adj', 'hyp'];
    for (const a of cotes) {
      for (const b of cotes) {
        if (a === b) expect(chooseRatio(a, b)).toBeNull();
        else expect(chooseRatio(a, b), `${a}→${b}`).not.toBeNull();
      }
    }
  });

  it('la formule annoncée correspond bien à la paire', () => {
    for (const [k, def] of Object.entries(RATIO_DEF)) {
      expect(def.paire).toHaveLength(2);
      expect(chooseRatio(def.paire[0], def.paire[1])).toBe(k);
    }
  });
});

describe('calculs', () => {
  it('calcule une longueur, dans les deux sens', () => {
    const alpha = 35;
    const hyp = 120;
    const s = sidesFor(alpha, hyp);
    // Connaissant l'hypoténuse, trouver l'opposé.
    near(solveSide({ alphaDeg: alpha, known: 'hyp', knownValue: hyp, wanted: 'opp' }), s.opp, 1e-9);
    // Connaissant l'opposé, remonter à l'hypoténuse.
    near(solveSide({ alphaDeg: alpha, known: 'opp', knownValue: s.opp, wanted: 'hyp' }), hyp, 1e-9);
    // Adjacent depuis l'opposé, via la tangente.
    near(solveSide({ alphaDeg: alpha, known: 'opp', knownValue: s.opp, wanted: 'adj' }), s.adj, 1e-9);
  });

  it('retrouve l’angle à partir d’un rapport', () => {
    near(solveAngle({ ratio: 'cos', value: 0.5 }), 60, 1e-9);
    near(solveAngle({ ratio: 'sin', value: 0.5 }), 30, 1e-9);
    near(solveAngle({ ratio: 'tan', value: 1 }), 45, 1e-9);
  });

  it('refuse un sinus supérieur à 1 — cas impossible', () => {
    expect(solveAngle({ ratio: 'sin', value: 1.4 })).toBeNull();
    expect(solveAngle({ ratio: 'cos', value: 2 })).toBeNull();
    // La tangente, elle, peut dépasser 1.
    expect(solveAngle({ ratio: 'tan', value: 2 })).not.toBeNull();
  });

  it('signale un rapport invraisemblable', () => {
    expect(isPlausibleRatio('sin', 1.4)).toBe(false);
    expect(isPlausibleRatio('cos', 0.8)).toBe(true);
    expect(isPlausibleRatio('tan', 2.5)).toBe(true);
  });

  it('arrondit au dixième', () => {
    expect(roundTenth(6.88)).toBe(6.9);
    expect(roundTenth(6.84)).toBe(6.8);
  });

  it('aller-retour longueur → angle → longueur', () => {
    const s = sidesFor(28, 140);
    const angle = solveAngle({ ratio: 'sin', value: s.opp / s.hyp });
    near(angle, 28, 1e-9);
    near(solveSide({ alphaDeg: angle, known: 'hyp', knownValue: 140, wanted: 'opp' }), s.opp, 1e-9);
  });
});
