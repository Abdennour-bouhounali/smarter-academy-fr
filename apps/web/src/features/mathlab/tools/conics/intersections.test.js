import { describe, it, expect } from 'vitest';
import * as I from './intersections.js';
import * as C from './conicMath.js';

/**
 * Les tests des intersections (§54 « intersections », §25 – §27, §35).
 *
 * L'exigence centrale est le NOMBRE de points : §26 fait naître « sécante »,
 * « tangente » et « aucun point » de ce nombre, et il doit donc être exact
 * aux cas limites — pas seulement au milieu de chaque situation.
 */

const circle = (h, k, r) => ({ kind: 'circle', h, k, r });
const parabola = (h, k, a, orientation = 'horizontal') => ({ kind: 'parabola', h, k, a, orientation });
const ellipse = (h, k, a, b) => ({ kind: 'ellipse', h, k, a, b });
const hyperbola = (h, k, a, b, orientation = 'horizontal') => ({ kind: 'hyperbola', h, k, a, b, orientation });

/** Chaque point rendu est-il VRAIMENT sur les deux objets ? */
const onConic = (conic, point) => Math.abs(C.substitute(conic, point)) < 1e-6;
const onLine = (line, point) => (line.vertical
  ? Math.abs(point.x - line.x) < 1e-9
  : Math.abs(line.slope * point.x + line.intercept - point.y) < 1e-9);

describe('le trinôme et son discriminant (§26)', () => {
  it('Δ > 0 : deux racines ; Δ = 0 : une ; Δ < 0 : aucune', () => {
    expect(I.solveQuadratic(1, 0, -4).roots).toEqual([-2, 2]);
    expect(I.solveQuadratic(1, 0, -4).classification).toBe('secant');
    expect(I.solveQuadratic(1, -2, 1).roots).toEqual([1]);
    expect(I.solveQuadratic(1, -2, 1).classification).toBe('tangent');
    expect(I.solveQuadratic(1, 0, 4).roots).toEqual([]);
    expect(I.solveQuadratic(1, 0, 4).classification).toBe('none');
  });

  it('reste PRÉCIS quand b est grand devant √Δ (§52)', () => {
    // x² + 1e8·x + 1 = 0 : la formule scolaire perd la petite racine.
    const { roots } = I.solveQuadratic(1, 1e8, 1);
    expect(roots).toHaveLength(2);
    const small = roots.find((r) => Math.abs(r) < 1);
    expect(small).toBeCloseTo(-1e-8, 15);
  });

  it('traite le degré 1 déguisé sans rendre « aucune solution »', () => {
    const solved = I.solveQuadratic(0, 2, -4);
    expect(solved.roots).toEqual([2]);
    expect(solved.degenerate).toBe(true);
  });
});

describe('droite ∩ cercle (§25, §26, §27)', () => {
  const unit = circle(0, 0, 2);

  it('sécante : deux points, tangente : un, dehors : aucun', () => {
    expect(I.lineConicIntersection(unit, I.makeLine(0, 0)).count).toBe(2);
    expect(I.lineConicIntersection(unit, I.makeLine(0, 2)).count).toBe(1);
    expect(I.lineConicIntersection(unit, I.makeLine(0, 5)).count).toBe(0);
  });

  it('nomme la situation', () => {
    expect(I.lineConicIntersection(unit, I.makeLine(0, 0)).classification).toBe('secant');
    expect(I.lineConicIntersection(unit, I.makeLine(0, 2)).classification).toBe('tangent');
    expect(I.lineConicIntersection(unit, I.makeLine(0, 5)).classification).toBe('none');
  });

  it('les points rendus sont sur le cercle ET sur la droite', () => {
    const line = I.makeLine(0.5, -1);
    const { points } = I.lineConicIntersection(circle(1, 2, 3), line);
    expect(points).toHaveLength(2);
    for (const p of points) {
      expect(onConic(circle(1, 2, 3), p)).toBe(true);
      expect(onLine(line, p)).toBe(true);
    }
  });

  it('la tangente est bien à distance r du centre', () => {
    const c = circle(2, -1, 3);
    const tangent = I.makeLine(1, -1 - 2 - 3 * Math.SQRT2); // y = x + p ajusté
    const d = I.distancePointLine({ x: 2, y: -1 }, tangent);
    expect(d).toBeCloseTo(3, 9);
    expect(I.lineConicIntersection(c, tangent).count).toBe(1);
  });

  it('la droite VERTICALE n\'est pas un cas particulier oublié', () => {
    expect(I.lineConicIntersection(unit, I.makeVerticalLine(0)).count).toBe(2);
    expect(I.lineConicIntersection(unit, I.makeVerticalLine(2)).count).toBe(1);
    expect(I.lineConicIntersection(unit, I.makeVerticalLine(3)).count).toBe(0);
  });

  it('§27 — la transition sécante → tangente → rien est CONTINUE', () => {
    const counts = [1.5, 1.9, 2, 2.1, 2.5].map((p) => I.lineConicIntersection(unit, I.makeLine(0, p)).count);
    expect(counts).toEqual([2, 2, 1, 0, 0]);
  });
});

describe('droite ∩ parabole, ellipse, hyperbole', () => {
  it('parabole : la droite parallèle à l\'axe coupe UNE seule fois', () => {
    const p = parabola(0, 0, 1);
    expect(I.lineConicIntersection(p, I.makeVerticalLine(3)).count).toBe(1);
    // y = 1 coupe y = x² en deux points (±1).
    const two = I.lineConicIntersection(p, I.makeLine(0, 1));
    expect(two.count).toBe(2);
    expect(two.points.map((q) => q.x).sort((a, b) => a - b)).toEqual([-1, 1]);
  });

  it('parabole : la tangente au sommet touche une fois', () => {
    expect(I.lineConicIntersection(parabola(0, 0, 1), I.makeLine(0, 0)).count).toBe(1);
    expect(I.lineConicIntersection(parabola(0, 0, 1), I.makeLine(0, -1)).count).toBe(0);
  });

  it('ellipse : les points rendus sont sur la courbe', () => {
    const e = ellipse(1, -1, 4, 2);
    const line = I.makeLine(0.3, 0.5);
    const { points, count } = I.lineConicIntersection(e, line);
    expect(count).toBe(2);
    for (const p of points) expect(onConic(e, p)).toBe(true);
  });

  it('hyperbole : une droite peut couper une branche, ou les deux', () => {
    const hyp = hyperbola(0, 0, 2, 3);
    const both = I.lineConicIntersection(hyp, I.makeLine(0, 0.5));
    expect(both.count).toBe(2);
    expect(both.points.some((p) => p.x > 0)).toBe(true);
    expect(both.points.some((p) => p.x < 0)).toBe(true);
    for (const p of both.points) expect(onConic(hyp, p)).toBe(true);
  });

  it('hyperbole : une droite PARALLÈLE à une asymptote ne coupe qu\'une fois', () => {
    const hyp = hyperbola(0, 0, 2, 3);
    const slope = 3 / 2; // exactement la pente de l'asymptote
    const result = I.lineConicIntersection(hyp, I.makeLine(slope, 2));
    expect(result.count).toBe(1);
  });

  it('une asymptote elle-même ne rencontre JAMAIS la courbe', () => {
    const hyp = hyperbola(0, 0, 2, 3);
    const [asymptote] = C.hyperbolaFeatures(hyp).asymptotes;
    expect(I.lineConicIntersection(hyp, I.makeLine(asymptote.slope, asymptote.intercept)).count).toBe(0);
  });
});

describe('cercle ∩ cercle (§25)', () => {
  it('deux points quand les cercles se chevauchent', () => {
    const r = I.circleCircleIntersection(circle(0, 0, 3), circle(4, 0, 3));
    expect(r.count).toBe(2);
    expect(r.points[0].x).toBeCloseTo(2, 9);
    expect(Math.abs(r.points[0].y)).toBeCloseTo(Math.sqrt(5), 9);
  });

  it('un point quand ils sont tangents (extérieurement et intérieurement)', () => {
    expect(I.circleCircleIntersection(circle(0, 0, 2), circle(5, 0, 3)).count).toBe(1);
    expect(I.circleCircleIntersection(circle(0, 0, 5), circle(2, 0, 3)).count).toBe(1);
  });

  it('aucun point quand ils sont disjoints ou l\'un dans l\'autre', () => {
    expect(I.circleCircleIntersection(circle(0, 0, 1), circle(9, 0, 2)).count).toBe(0);
    expect(I.circleCircleIntersection(circle(0, 0, 9), circle(1, 0, 2)).count).toBe(0);
  });

  it('deux cercles CONFONDUS ne rendent pas « deux points »', () => {
    const r = I.circleCircleIntersection(circle(1, 1, 3), circle(1, 1, 3));
    expect(r.count).toBe(0);
    expect(r.classification).toBe('identical');
  });

  it('les points rendus sont sur les DEUX cercles', () => {
    const a = circle(-1, 2, 4);
    const b = circle(2, 1, 3);
    for (const p of I.circleCircleIntersection(a, b).points) {
      expect(onConic(a, p)).toBe(true);
      expect(onConic(b, p)).toBe(true);
    }
  });
});

describe('la porte unique `intersect` (§25)', () => {
  it('accepte les deux ordres d\'arguments', () => {
    const c = circle(0, 0, 2);
    const line = I.makeLine(0, 0);
    expect(I.intersect(c, line).count).toBe(2);
    expect(I.intersect(line, c).count).toBe(2);
  });

  it('dit HONNÊTEMENT ce qu\'elle ne sait pas faire', () => {
    const r = I.intersect(ellipse(0, 0, 3, 2), parabola(0, 0, 1));
    expect(r.supported).toBe(false);
    expect(r.count).toBe(0);
  });
});

describe('les mesures et la découpe (§33)', () => {
  it('la distance d\'un point à une droite, y compris verticale', () => {
    expect(I.distancePointLine({ x: 0, y: 0 }, I.makeLine(0, 5))).toBeCloseTo(5, 12);
    expect(I.distancePointLine({ x: 0, y: 0 }, I.makeVerticalLine(-3))).toBeCloseTo(3, 12);
    // y = x, distance de (1,0) : 1/√2
    expect(I.distancePointLine({ x: 1, y: 0 }, I.makeLine(1, 0))).toBeCloseTo(Math.SQRT1_2, 12);
  });

  it('la droite est coupée à la fenêtre, un peu au-delà', () => {
    const view = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    const [a, b] = I.lineSegmentIn(I.makeLine(1, 0), view);
    expect(a.x).toBeLessThan(-5);
    expect(b.x).toBeGreaterThan(5);
    const [c, d] = I.lineSegmentIn(I.makeVerticalLine(2), view);
    expect(c.x).toBe(2);
    expect(d.y).toBeGreaterThan(5);
  });
});

describe('les lieux géométriques (§35)', () => {
  it('« à distance constante d\'un point » EST un cercle', () => {
    const locus = I.locusOf({ kind: 'fixedDistance', focus: { x: 2, y: -1 }, distance: 3 });
    expect(locus).toEqual({ kind: 'circle', h: 2, k: -1, r: 3 });
  });

  it('« équidistant d\'un point et d\'une droite » EST une parabole', () => {
    const locus = I.locusOf({
      kind: 'equidistant',
      focus: { x: 0, y: 1 },
      directrix: { kind: 'horizontal', value: -1 },
    });
    expect(locus).toMatchObject({ kind: 'parabola', h: 0, k: 0 });
    expect(locus.a).toBeCloseTo(0.25, 12);
    // Et le foyer de cette parabole est bien celui dont on est parti.
    const f = C.parabolaFeatures(locus);
    expect(f.focus.y).toBeCloseTo(1, 9);
    expect(f.directrix.value).toBeCloseTo(-1, 9);
  });

  it('un foyer SUR la directrice ne donne pas de parabole', () => {
    expect(I.locusOf({
      kind: 'equidistant', focus: { x: 0, y: 0 }, directrix: { kind: 'horizontal', value: 0 },
    })).toBeNull();
  });

  it('une distance nulle ou négative ne donne pas de cercle', () => {
    expect(I.locusOf({ kind: 'fixedDistance', focus: { x: 0, y: 0 }, distance: 0 })).toBeNull();
  });
});
