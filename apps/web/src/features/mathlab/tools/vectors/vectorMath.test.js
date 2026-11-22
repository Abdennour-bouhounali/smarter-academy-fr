import { describe, it, expect } from 'vitest';
import * as V from './vectorMath.js';

/**
 * La mathématique des أشعة. Chaque cas du cahier des charges (§39) est ici,
 * plus les pièges que le moteur traite exprès : la droite verticale, le
 * شعاع nul, la colinéarité de trois points confondus, et la tolérance
 * RELATIVE des relations.
 */

const P = (x, y) => ({ x, y });

describe('composantes d’un شعاع (§39)', () => {
  it('⃗AB = B − A : A(2,3), B(6,5) → (4,2)', () => {
    expect(V.fromPoints(P(2, 3), P(6, 5))).toEqual({ x: 4, y: 2 });
  });

  it('⃗BA est l’opposé de ⃗AB', () => {
    expect(V.fromPoints(P(6, 5), P(2, 3))).toEqual({ x: -4, y: -2 });
  });

  it('⃗AA est le شعاع nul', () => {
    expect(V.isZero(V.fromPoints(P(2, 3), P(2, 3)))).toBe(true);
  });
});

describe('norme (§39)', () => {
  it('u = (3,4) → ‖u‖ = 5', () => {
    expect(V.norm(P(3, 4))).toBe(5);
  });

  it('‖u‖ ne dépend pas du sens', () => {
    expect(V.norm(P(-3, -4))).toBe(5);
  });

  it('le شعاع nul a une norme nulle', () => {
    expect(V.norm(V.ZERO)).toBe(0);
  });
});

describe('addition (§39)', () => {
  it('u = (3,2), v = (1,4) → u + v = (4,6)', () => {
    expect(V.add(P(3, 2), P(1, 4))).toEqual({ x: 4, y: 6 });
  });

  it('est commutative — c’est ce que le parallélogramme MONTRE (§12)', () => {
    expect(V.add(P(3, 2), P(1, 4))).toEqual(V.add(P(1, 4), P(3, 2)));
  });
});

describe('soustraction (§39)', () => {
  it('u = (3,2), v = (1,4) → u − v = (2,−2)', () => {
    expect(V.subtract(P(3, 2), P(1, 4))).toEqual({ x: 2, y: -2 });
  });

  it('u − v est bien u + (−v) — la construction de §13', () => {
    const u = P(3, 2);
    const v = P(1, 4);
    expect(V.subtract(u, v)).toEqual(V.add(u, V.negate(v)));
  });
});

describe('multiplication par un nombre (§39)', () => {
  it('u = (2,3), k = −2 → ku = (−4,−6)', () => {
    expect(V.scale(P(2, 3), -2)).toEqual({ x: -4, y: -6 });
  });

  it('k = 0 rend le شعاع nul — ce n’est pas une erreur, c’est le sens (§14)', () => {
    expect(V.scale(P(2, 3), 0)).toEqual({ x: 0, y: 0 });
  });

  it('|k| > 1 allonge, 0 < |k| < 1 raccourcit', () => {
    expect(V.norm(V.scale(P(3, 4), 2))).toBe(10);
    expect(V.norm(V.scale(P(3, 4), 0.5))).toBe(2.5);
  });

  it('k < 0 renverse le sens : la direction tourne de 180°', () => {
    expect(V.direction(P(1, 0))).toBe(0);
    expect(V.direction(V.scale(P(1, 0), -1))).toBe(180);
  });
});

describe('milieu (§39)', () => {
  it('A(0,0), B(4,6) → M = (2,3)', () => {
    expect(V.midpoint(P(0, 0), P(4, 6))).toEqual({ x: 2, y: 3 });
  });

  it('accepte les coordonnées impaires : le milieu est un demi', () => {
    expect(V.midpoint(P(0, 0), P(3, 1))).toEqual({ x: 1.5, y: 0.5 });
  });
});

describe('distance (§39)', () => {
  it('A(0,0), B(3,4) → AB = 5', () => {
    expect(V.distance(P(0, 0), P(3, 4))).toBe(5);
  });

  it('est symétrique', () => {
    expect(V.distance(P(1, 7), P(4, 3))).toBe(V.distance(P(4, 3), P(1, 7)));
  });
});

describe('انسحاب / translation (§39)', () => {
  it('A(2,3) par u = (4,−1) → A′(6,2)', () => {
    expect(V.translatePoint(P(2, 3), P(4, -1))).toEqual({ x: 6, y: 2 });
  });

  it('⃗AA′ est exactement le شعاع de l’انسحاب — la définition du manuel', () => {
    const a = P(2, 3);
    const u = P(4, -1);
    expect(V.fromPoints(a, V.translatePoint(a, u))).toEqual(u);
  });

  it('conserve les longueurs : un triangle translaté est le même triangle (§17)', () => {
    const u = P(-3, 5);
    const [a, b] = [P(0, 0), P(3, 4)];
    expect(V.distance(V.translatePoint(a, u), V.translatePoint(b, u))).toBe(V.distance(a, b));
  });
});

describe('produit scalaire (§39)', () => {
  it('u = (2,3), v = (4,1) → u · v = 11', () => {
    expect(V.dot(P(2, 3), P(4, 1))).toBe(11);
  });

  it('u = (1,0), v = (0,1) → produit scalaire nul', () => {
    expect(V.dot(P(1, 0), P(0, 1))).toBe(0);
  });
});

describe('perpendicularité (§39, §24)', () => {
  it('(1,0) ⟂ (0,1)', () => {
    expect(V.arePerpendicular(P(1, 0), P(0, 1))).toBe(true);
  });

  it('(3,4) ⟂ (−4,3) : le quart de tour', () => {
    expect(V.arePerpendicular(P(3, 4), P(-4, 3))).toBe(true);
  });

  it('deux أشعة quelconques ne le sont pas', () => {
    expect(V.arePerpendicular(P(2, 3), P(4, 1))).toBe(false);
  });

  it('le شعاع nul n’est perpendiculaire à rien — on ne dessine pas un angle droit sur un point', () => {
    expect(V.arePerpendicular(V.ZERO, P(0, 1))).toBe(false);
  });
});

describe('pente (§39, §20)', () => {
  it('A(2,1), B(2,5) → droite VERTICALE, jamais un nombre', () => {
    const m = V.slope(P(2, 1), P(2, 5));
    expect(m.vertical).toBe(true);
    expect(m.value).toBeNull();
    expect(Number.isFinite(m.value)).toBe(false);
  });

  it('A(0,0), B(2,4) → m = 2', () => {
    expect(V.slope(P(0, 0), P(2, 4)).value).toBe(2);
  });

  it('une droite horizontale a une pente nulle, ce n’est pas « indéfini »', () => {
    const m = V.slope(P(-3, 4), P(5, 4));
    expect(m.value).toBe(0);
    expect(m.vertical).toBe(false);
    expect(m.undefined).toBe(false);
  });

  it('deux points confondus ne définissent aucune droite', () => {
    expect(V.slope(P(2, 2), P(2, 2)).undefined).toBe(true);
  });
});

describe('parallélisme (§21)', () => {
  it('u = (2,4) et v = (1,2) sont parallèles, et v = ½ u', () => {
    const u = P(2, 4);
    const v = P(1, 2);
    expect(V.areParallel(u, v)).toBe(true);
    expect(V.collinearFactor(u, v)).toBe(0.5);
  });

  it('reconnaît le sens opposé : v = −2u reste parallèle', () => {
    expect(V.areParallel(P(1, 2), P(-2, -4))).toBe(true);
    expect(V.collinearFactor(P(1, 2), P(-2, -4))).toBe(-2);
  });

  it('refuse deux أشعة non colinéaires', () => {
    expect(V.areParallel(P(1, 2), P(2, 1))).toBe(false);
    expect(V.collinearFactor(P(1, 2), P(2, 1))).toBeNull();
  });

  it('exclut le شعاع nul par défaut : « parallèle à tout » n’apprend rien', () => {
    expect(V.areParallel(V.ZERO, P(1, 2))).toBe(false);
    expect(V.areParallel(V.ZERO, P(1, 2), { strict: false })).toBe(true);
  });

  it('la tolérance est RELATIVE : de grands أشعة colinéaires le restent', () => {
    expect(V.areParallel(P(1e6, 2e6), P(5e5, 1e6))).toBe(true);
  });

  it('la tolérance est RELATIVE : de petits أشعة non colinéaires ne deviennent pas parallèles', () => {
    expect(V.areParallel(P(1e-6, 0), P(0, 1e-6))).toBe(false);
  });

  it('k se calcule sur la plus grande composante — (1e-12, 5) ne fait pas exploser le facteur', () => {
    expect(V.collinearFactor(P(0, 5), P(0, 15))).toBe(3);
  });
});

describe('alignement de trois points (§22)', () => {
  it('A(0,0), B(1,1), C(3,3) sont alignés', () => {
    expect(V.areCollinear(P(0, 0), P(1, 1), P(3, 3))).toEqual({ collinear: true, degenerate: false });
  });

  it('A(0,0), B(1,1), C(3,4) ne le sont pas', () => {
    expect(V.areCollinear(P(0, 0), P(1, 1), P(3, 4)).collinear).toBe(false);
  });

  it('trois points d’une VERTICALE sont alignés — le déterminant ne divise pas', () => {
    expect(V.areCollinear(P(2, -1), P(2, 3), P(2, 9))).toEqual({ collinear: true, degenerate: false });
  });

  it('deux points confondus : vrai, mais signalé comme dégénéré', () => {
    expect(V.areCollinear(P(1, 1), P(1, 1), P(5, 2))).toEqual({ collinear: true, degenerate: true });
    // B et C confondus (A distinct) : dégénéré aussi — audit 2026-09-24.
    expect(V.areCollinear(P(0, 0), P(2, 3), P(2, 3))).toEqual({ collinear: true, degenerate: true });
  });
});

describe('direction (§10)', () => {
  it('u = (3,4) → θ ≈ 53,13°', () => {
    expect(V.direction(P(3, 4))).toBeCloseTo(53.13, 2);
  });

  it('u = (1,2) → θ ≈ 63,43°', () => {
    expect(V.direction(P(1, 2))).toBeCloseTo(63.43, 2);
  });

  it('est normalisée dans [0, 360[ — jamais un angle négatif', () => {
    expect(V.direction(P(0, -1))).toBe(270);
    expect(V.direction(P(-1, -1))).toBeCloseTo(225, 9);
  });

  it('les quatre directions des axes', () => {
    expect(V.direction(P(1, 0))).toBe(0);
    expect(V.direction(P(0, 1))).toBe(90);
    expect(V.direction(P(-1, 0))).toBe(180);
  });

  it('le شعاع nul n’a PAS de direction — NaN, jamais 0°', () => {
    expect(Number.isNaN(V.direction(V.ZERO))).toBe(true);
  });
});

describe('norme exacte (§9 : « exact mathematical notation »)', () => {
  it('‖(3,4)‖ s’écrit 5, pas 5,00', () => {
    expect(V.exactNorm(P(3, 4))).toMatchObject({ exact: true, integer: 5 });
  });

  it('‖(1,2)‖ s’écrit √5', () => {
    expect(V.exactNorm(P(1, 2))).toMatchObject({ exact: true, integer: null, coefficient: 1, radicand: 5 });
  });

  it('‖(2,4)‖ = √20 se simplifie en 2√5', () => {
    expect(V.exactNorm(P(2, 4))).toMatchObject({ exact: true, coefficient: 2, radicand: 5 });
  });

  it('‖(0,0)‖ = 0', () => {
    expect(V.exactNorm(V.ZERO)).toMatchObject({ exact: true, integer: 0 });
  });

  it('des composantes décimales n’ont pas de forme exacte lisible', () => {
    const n = V.exactNorm(P(1.5, 2.5));
    expect(n.exact).toBe(false);
    expect(n.value).toBeCloseTo(Math.hypot(1.5, 2.5), 9);
  });
});

describe('robustesse : rien n’explose sur une entrée illisible', () => {
  it('rend null plutôt qu’un NaN silencieux', () => {
    expect(V.fromPoints(null, P(1, 1))).toBeNull();
    expect(V.add(P(1, 1), undefined)).toBeNull();
    expect(V.scale(P(1, 1), Infinity)).toBeNull();
    expect(V.makeVector(NaN, 2)).toBeNull();
  });

  it('les mesures d’une entrée illisible sont NaN, pas 0', () => {
    expect(Number.isNaN(V.norm(null))).toBe(true);
    expect(Number.isNaN(V.dot(P(1, 1), null))).toBe(true);
  });
});
