import { describe, it, expect } from 'vitest';
import * as C from './conicMath.js';

/**
 * Les tests du moteur des coniques (§54).
 *
 * Ils portent sur la MATHÉMATIQUE, pas sur le rendu : chaque valeur attendue
 * est celle qu'un élève calculerait au tableau. Quand une valeur n'est pas
 * ronde, elle est comparée à la formule qui la définit — jamais à un nombre
 * copié d'une exécution précédente, ce qui ne prouverait que la stabilité du
 * bug éventuel.
 */

const circle = (h, k, r) => ({ kind: 'circle', h, k, r });
const parabola = (h, k, a, orientation = 'horizontal') => ({ kind: 'parabola', h, k, a, orientation });
const ellipse = (h, k, a, b) => ({ kind: 'ellipse', h, k, a, b });
const hyperbola = (h, k, a, b, orientation = 'horizontal') => ({ kind: 'hyperbola', h, k, a, b, orientation });

describe('validité et dégénérescence', () => {
  it('accepte les quatre familles bien formées', () => {
    expect(C.isValidConic(circle(0, 0, 3))).toBe(true);
    expect(C.isValidConic(parabola(1, 2, 0.5))).toBe(true);
    expect(C.isValidConic(ellipse(0, 0, 4, 2))).toBe(true);
    expect(C.isValidConic(hyperbola(0, 0, 3, 4))).toBe(true);
  });

  it('refuse les cas dégénérés et dit POURQUOI', () => {
    expect(C.isValidConic(circle(0, 0, 0))).toBe(false);
    expect(C.degeneracyOf(circle(0, 0, 0))).toBe('radius');
    expect(C.degeneracyOf(circle(0, 0, -2))).toBe('radius');
    expect(C.degeneracyOf(parabola(0, 0, 0))).toBe('coefficient');
    expect(C.degeneracyOf(ellipse(0, 0, 0, 3))).toBe('axes');
    expect(C.degeneracyOf({ kind: 'circle', h: NaN, k: 0, r: 1 })).toBe('center');
    expect(C.degeneracyOf(circle(0, 0, 3))).toBeNull();
  });

  it('ne rend jamais de bruit de virgule flottante (§52)', () => {
    expect(C.cleanNumber(0.1 + 0.2)).toBe(0.3);
    expect(C.cleanNumber(-0)).toBe(0);
    expect(Object.is(C.cleanNumber(-0), -0)).toBe(false);
  });
});

describe('le cercle (§8, §9, §10)', () => {
  it('rend d = 2r, C = 2πr, A = πr²', () => {
    const m = C.circleMeasures(circle(1, -2, 3));
    expect(m.radius).toBe(3);
    expect(m.diameter).toBe(6);
    expect(m.circumference).toBeCloseTo(2 * Math.PI * 3, 12);
    expect(m.area).toBeCloseTo(Math.PI * 9, 12);
  });

  it('§9 — quand r double, C double et A quadruple', () => {
    const a = C.circleMeasures(circle(0, 0, 2));
    const b = C.circleMeasures(circle(0, 0, 4));
    expect(b.circumference / a.circumference).toBeCloseTo(2, 12);
    expect(b.area / a.area).toBeCloseTo(4, 12);
  });

  it('§10 — dedans, dessus, dehors', () => {
    const c = circle(2, 3, 5);
    expect(C.pointPosition(c, { x: 2, y: 3 })).toBe('inside');
    expect(C.pointPosition(c, { x: 7, y: 3 })).toBe('on');
    expect(C.pointPosition(c, { x: 2, y: 8 })).toBe('on');
    expect(C.pointPosition(c, { x: 9, y: 3 })).toBe('outside');
  });

  it('le centre est son propre foyer, et son excentricité est nulle', () => {
    const f = C.conicFeatures(circle(1, 1, 2));
    expect(f.center).toEqual({ x: 1, y: 1 });
    expect(f.foci).toEqual([{ x: 1, y: 1 }]);
    expect(f.eccentricity).toBe(0);
  });
});

describe('la parabole (§11 – §14)', () => {
  it('y = x² a son foyer en (0, 1/4) et pour directrice y = −1/4', () => {
    const f = C.parabolaFeatures(parabola(0, 0, 1));
    expect(f.vertex).toEqual({ x: 0, y: 0 });
    expect(f.focus.x).toBeCloseTo(0, 12);
    expect(f.focus.y).toBeCloseTo(0.25, 12);
    expect(f.directrix).toEqual({ kind: 'horizontal', value: -0.25 });
    expect(f.opening).toBe('up');
  });

  it('un coefficient négatif ouvre vers le bas et retourne le foyer', () => {
    const f = C.parabolaFeatures(parabola(0, 0, -1));
    expect(f.focus.y).toBeCloseTo(-0.25, 12);
    expect(f.directrix.value).toBeCloseTo(0.25, 12);
    expect(f.opening).toBe('down');
  });

  it('le sommet suit (h, k), l\'axe de symétrie est x = h', () => {
    const f = C.parabolaFeatures(parabola(3, -2, 2));
    expect(f.vertex).toEqual({ x: 3, y: -2 });
    expect(f.axis).toEqual({ kind: 'vertical', value: 3 });
  });

  it('la parabole horizontale (x = a(y−k)² + h) tourne foyer et directrice', () => {
    const f = C.parabolaFeatures(parabola(0, 0, 1, 'vertical'));
    expect(f.focus.x).toBeCloseTo(0.25, 12);
    expect(f.focus.y).toBeCloseTo(0, 12);
    expect(f.directrix).toEqual({ kind: 'vertical', value: -0.25 });
    expect(f.opening).toBe('right');
  });

  it('§14 — TOUT point de la parabole est équidistant du foyer et de la directrice', () => {
    const p = parabola(1, -1, 0.5);
    for (const t of [-3, -1, 0, 0.7, 2, 5]) {
      const point = C.pointAt(p, t);
      const check = C.parabolaFocalCheck(p, point);
      expect(check.equal).toBe(true);
      expect(check.toFocus).toBeCloseTo(check.toDirectrix, 9);
    }
  });

  it('§14 — un point HORS de la parabole ne l\'est pas', () => {
    const check = C.parabolaFocalCheck(parabola(0, 0, 1), { x: 2, y: 0 });
    expect(check.equal).toBe(false);
  });
});

describe('l\'ellipse (§15 – §17)', () => {
  it('c² = a² − b², et les foyers sont sur le grand axe', () => {
    const f = C.ellipseFeatures(ellipse(0, 0, 5, 3));
    expect(f.c).toBeCloseTo(4, 12); // 25 − 9 = 16
    expect(f.foci).toEqual([{ x: -4, y: 0 }, { x: 4, y: 0 }]);
    expect(f.majorAxis).toBe('horizontal');
    expect(f.eccentricity).toBeCloseTo(0.8, 12);
  });

  it('quand b > a, le grand axe devient VERTICAL sans que a et b s\'échangent', () => {
    const f = C.ellipseFeatures(ellipse(0, 0, 3, 5));
    expect(f.majorAxis).toBe('vertical');
    expect(f.foci).toEqual([{ x: 0, y: -4 }, { x: 0, y: 4 }]);
    expect(f.vertices).toEqual([{ x: 0, y: -5 }, { x: 0, y: 5 }]);
  });

  it('§17 — a = b donne un cercle : e = 0, foyers confondus au centre', () => {
    const f = C.ellipseFeatures(ellipse(2, 1, 3, 3));
    expect(f.isCircle).toBe(true);
    expect(f.eccentricity).toBeCloseTo(0, 12);
    expect(f.foci).toEqual([{ x: 2, y: 1 }, { x: 2, y: 1 }]);
  });

  it('§16 — PF₁ + PF₂ est CONSTANT et vaut 2a, tout le long de la courbe', () => {
    const e = ellipse(1, -2, 5, 3);
    for (const t of [0, 0.4, 1.1, 2.5, 4, 5.9]) {
      const point = C.pointAt(e, t);
      const check = C.ellipseFocalCheck(e, point);
      expect(check.equal).toBe(true);
      expect(check.sum).toBeCloseTo(10, 9); // 2 × 5
    }
  });

  it('§17 — l\'excentricité croît quand l\'ellipse s\'allonge', () => {
    const round = C.ellipseFeatures(ellipse(0, 0, 3, 3)).eccentricity;
    const mild = C.ellipseFeatures(ellipse(0, 0, 4, 3)).eccentricity;
    const stretched = C.ellipseFeatures(ellipse(0, 0, 10, 3)).eccentricity;
    expect(round).toBeLessThan(mild);
    expect(mild).toBeLessThan(stretched);
    expect(stretched).toBeLessThan(1);
  });
});

describe('l\'hyperbole (§18 – §20)', () => {
  it('c² = a² + b², et les asymptotes ont pour pente ±b/a', () => {
    const f = C.hyperbolaFeatures(hyperbola(0, 0, 3, 4));
    expect(f.c).toBeCloseTo(5, 12);
    expect(f.foci).toEqual([{ x: -5, y: 0 }, { x: 5, y: 0 }]);
    expect(f.vertices).toEqual([{ x: -3, y: 0 }, { x: 3, y: 0 }]);
    expect(f.asymptotes[0].slope).toBeCloseTo(4 / 3, 12);
    expect(f.asymptotes[1].slope).toBeCloseTo(-4 / 3, 12);
  });

  it('les asymptotes passent par le CENTRE, où qu\'il soit', () => {
    const f = C.hyperbolaFeatures(hyperbola(2, -1, 2, 2));
    for (const line of f.asymptotes) {
      expect(line.slope * 2 + line.intercept).toBeCloseTo(-1, 12);
    }
  });

  it('l\'orientation verticale met sommets et foyers sur l\'axe des y', () => {
    const f = C.hyperbolaFeatures(hyperbola(0, 0, 3, 4, 'vertical'));
    expect(f.vertices).toEqual([{ x: 0, y: -3 }, { x: 0, y: 3 }]);
    expect(f.foci).toEqual([{ x: 0, y: -5 }, { x: 0, y: 5 }]);
    expect(f.transverse).toBe('vertical');
  });

  it('§19 — |PF₁ − PF₂| est CONSTANT et vaut 2a, sur les deux branches', () => {
    const hyp = hyperbola(1, 1, 3, 4);
    for (const branch of [1, -1]) {
      for (const t of [-1.5, -0.4, 0, 0.9, 2]) {
        const point = C.pointAt(hyp, t, branch);
        const check = C.hyperbolaFocalCheck(hyp, point);
        expect(check.equal).toBe(true);
        expect(check.difference).toBeCloseTo(6, 9); // 2 × 3
      }
    }
  });

  it('§20 — la courbe s\'approche de son asymptote sans la toucher', () => {
    const hyp = hyperbola(0, 0, 2, 3);
    const asymptote = C.hyperbolaFeatures(hyp).asymptotes[0];
    const gapAt = (t) => {
      const p = C.pointAt(hyp, t, 1);

      return Math.abs(p.y - (asymptote.slope * p.x + asymptote.intercept));
    };
    expect(gapAt(3)).toBeLessThan(gapAt(1));
    expect(gapAt(5)).toBeLessThan(gapAt(3));
    expect(gapAt(5)).toBeGreaterThan(0);
  });
});

describe('le paramétrage et la trace (§34)', () => {
  it('tout point de pointAt est SUR la courbe, pour les quatre familles', () => {
    const cases = [circle(1, 2, 3), ellipse(-1, 2, 4, 2), parabola(1, 1, 0.5), hyperbola(0, 0, 2, 3)];
    for (const conic of cases) {
      for (const t of [-1.3, 0, 0.8, 2.2]) {
        expect(C.pointPosition(conic, C.pointAt(conic, t))).toBe('on');
      }
    }
  });

  it('parameterNear ramène un point quelconque SUR la courbe', () => {
    const e = ellipse(0, 0, 5, 3);
    const t = C.parameterNear(e, { x: 9, y: 7 });
    expect(C.pointPosition(e, C.pointAt(e, t))).toBe('on');
  });

  it('parameterNear rend la BRANCHE pour une hyperbole', () => {
    const hyp = hyperbola(0, 0, 2, 3);
    const left = C.parameterNear(hyp, { x: -9, y: 1 });
    expect(left.branch).toBe(-1);
    expect(C.pointAt(hyp, left.t, left.branch).x).toBeLessThan(0);
    const right = C.parameterNear(hyp, { x: 9, y: 1 });
    expect(right.branch).toBe(1);
  });
});

describe('le tracé (§4, §53)', () => {
  it('le cercle et l\'ellipse font UNE polyligne fermée', () => {
    const [ring] = C.conicPolylines(circle(0, 0, 2), { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }, 64);
    expect(ring.length).toBe(65);
    expect(ring[0].x).toBeCloseTo(ring[ring.length - 1].x, 9);
  });

  it('l\'hyperbole fait DEUX branches, jamais reliées', () => {
    const branches = C.conicPolylines(hyperbola(0, 0, 2, 3), { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }, 60);
    expect(branches).toHaveLength(2);
    expect(branches[0].every((p) => p.x >= 0)).toBe(true);
    expect(branches[1].every((p) => p.x <= 0)).toBe(true);
  });

  it('la parabole couvre la fenêtre demandée, pas un domaine fixe', () => {
    const view = { xMin: -30, xMax: 30, yMin: -10, yMax: 10 };
    const [curve] = C.conicPolylines(parabola(0, 0, 0.01), view, 100);
    expect(Math.min(...curve.map((p) => p.x))).toBeLessThanOrEqual(-30);
    expect(Math.max(...curve.map((p) => p.x))).toBeGreaterThanOrEqual(30);
  });

  it('une conique dégénérée ne dessine RIEN plutôt qu\'une figure fausse', () => {
    expect(C.conicPolylines(circle(0, 0, 0), null)).toEqual([]);
  });
});

describe('les transformations (§22)', () => {
  it('translater x² + y² = r² de (h, k) donne (x−h)² + (y−k)² = r²', () => {
    const moved = C.translateConic(circle(0, 0, 4), 2, 3);
    expect(moved).toEqual({ kind: 'circle', h: 2, k: 3, r: 4 });
  });

  it('la réflexion sur un axe déplace le centre et retourne la parabole', () => {
    expect(C.reflectConic(circle(2, 3, 1), 'xAxis')).toMatchObject({ h: 2, k: -3 });
    expect(C.reflectConic(circle(2, 3, 1), 'origin')).toMatchObject({ h: -2, k: -3 });
    const flipped = C.reflectConic(parabola(0, 0, 2), 'xAxis');
    expect(flipped.a).toBe(-2);
    // Réfléchir sur l'axe des y ne change PAS une parabole d'axe vertical.
    expect(C.reflectConic(parabola(0, 0, 2), 'yAxis').a).toBe(2);
  });

  it('un quart de tour échange les rôles des axes', () => {
    const turned = C.rotateConic(ellipse(0, 0, 5, 3), 1);
    expect(turned).toMatchObject({ a: 3, b: 5 });
    expect(C.rotateConic(hyperbola(0, 0, 2, 3), 1).orientation).toBe('vertical');
    expect(C.rotateConic(parabola(0, 0, 1), 1).orientation).toBe('vertical');
  });

  it('quatre quarts de tour rendent la conique de départ', () => {
    const start = ellipse(2, -1, 4, 2);
    expect(C.rotateConic(start, 4)).toEqual(start);
  });

  it('une rotation d\'un angle quelconque est REFUSÉE, jamais approchée (§51)', () => {
    expect(C.rotateConic(ellipse(0, 0, 4, 2), 0.5)).toBeNull();
  });
});

describe('la forme développée (§30)', () => {
  it('x² + y² = 4 centré en (2,3) développe en x² + y² − 4x − 6y + 9 = 0', () => {
    const g = C.toGeneral(circle(2, 3, 2));
    expect(g).toEqual({
      A: 1, B: 0, C: 1, D: -4, E: -6, F: 9,
    });
  });

  it('le développement d\'une parabole garde son coefficient', () => {
    // y = 2(x−1)² − 3  →  2x² − 4x + 2 − 3 − y = 0  →  2x² − 4x − y − 1 = 0
    const g = C.toGeneral(parabola(1, -3, 2));
    expect(g).toMatchObject({
      A: 2, C: 0, D: -4, E: -1, F: -1,
    });
  });

  it('tout point de la courbe ANNULE la forme développée', () => {
    const cases = [circle(1, 2, 3), ellipse(-1, 2, 4, 2), parabola(1, 1, 0.5), hyperbola(1, 0, 2, 3)];
    for (const conic of cases) {
      const g = C.toGeneral(conic);
      const p = C.pointAt(conic, 0.7);
      const value = g.A * p.x * p.x + g.C * p.y * p.y + g.D * p.x + g.E * p.y + g.F;
      expect(Math.abs(value)).toBeLessThan(1e-9);
    }
  });
});

describe('la propriété focale unifiée (§28)', () => {
  it('nomme la propriété de chaque famille', () => {
    expect(C.focalCheck(circle(0, 0, 3), { x: 3, y: 0 }).property).toBe('constant');
    expect(C.focalCheck(parabola(0, 0, 1), { x: 1, y: 1 }).property).toBe('equidistant');
    expect(C.focalCheck(ellipse(0, 0, 5, 3), { x: 5, y: 0 }).property).toBe('sum');
    expect(C.focalCheck(hyperbola(0, 0, 3, 4), { x: 3, y: 0 }).property).toBe('difference');
  });

  it('rend `equal` vrai exactement sur la courbe', () => {
    expect(C.focalCheck(circle(0, 0, 3), { x: 3, y: 0 }).equal).toBe(true);
    expect(C.focalCheck(circle(0, 0, 3), { x: 2, y: 0 }).equal).toBe(false);
  });
});
