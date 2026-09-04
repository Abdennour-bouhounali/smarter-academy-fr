import { describe, it, expect } from 'vitest';
import {
  vec, add, scale, dot, cross, norm, dist, midpoint, normalize,
  lineThrough, pointAt, paramOf, projectOnLine, distPointLine, perpDirection,
  perpendicularThrough, parallelThrough, intersect,
  areParallel, arePerpendicular, areCollinear, angleBetweenDeg,
  extentOf, endpointsOf, containsPoint, clipToBox, notationOf, describeObj,
  snapToGrid, nearestNode,
  sidesOf, sideLengths, interiorAngles, isRightAngleAt, rightAngleCount,
  allSidesEqual, oppositeSidesEqual, oppositeSidesParallel, diagonalLengths,
  perimeter, polygonArea, centroid,
  reflectPoint, reflectPoints, isSymmetryAxis,
  angleAtDeg, circleCircleIntersections, pointOnSegmentAt, lengthRatio,
} from './geometry2d';

const P = (x, y) => ({ x, y });
const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
const nearPt = (a, b, eps = 1e-9) => { near(a.x, b.x, eps); near(a.y, b.y, eps); };

/** Jeu de droites pseudo-aléatoire mais déterministe, pour les propriétés. */
function* sampleLines(n = 20) {
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = 0; i < n; i += 1) {
    const a = P(rnd() * 200 - 100, rnd() * 200 - 100);
    let b = P(rnd() * 200 - 100, rnd() * 200 - 100);
    if (dist(a, b) < 1) b = add(a, P(7, 3));
    yield { line: lineThrough(a, b), q: P(rnd() * 200 - 100, rnd() * 200 - 100) };
  }
}

describe('vecteurs', () => {
  it('compose les opérations de base', () => {
    expect(vec(P(1, 2), P(4, 6))).toEqual({ x: 3, y: 4 });
    expect(add(P(1, 2), P(3, 4))).toEqual({ x: 4, y: 6 });
    expect(scale(P(2, -3), 2)).toEqual({ x: 4, y: -6 });
    expect(dot(P(1, 2), P(3, 4))).toBe(11);
    expect(cross(P(1, 0), P(0, 1))).toBe(1);
    expect(norm(P(3, 4))).toBe(5);
    expect(dist(P(1, 1), P(4, 5))).toBe(5);
  });

  it('normalize renvoie un vecteur unitaire, et zéro pour un vecteur nul', () => {
    near(norm(normalize(P(3, 4))), 1);
    expect(normalize(P(0, 0))).toEqual({ x: 0, y: 0 });
  });

  it('midpoint est équidistant des deux extrémités', () => {
    const a = P(2, 3); const b = P(10, 9);
    const m = midpoint(a, b);
    near(dist(a, m), dist(m, b));
    expect(areCollinear(a, m, b)).toBe(true);
  });
});

describe('droites', () => {
  it('lineThrough normalise toujours la direction', () => {
    for (const { line } of sampleLines()) near(norm(line.d), 1, 1e-12);
  });

  it('lineThrough refuse deux points confondus', () => {
    expect(() => lineThrough(P(3, 3), P(3, 3))).toThrow(/confondus/);
  });

  it('projectOnLine est le point de la droite le plus proche', () => {
    for (const { line, q } of sampleLines()) {
      const f = projectOnLine(line, q);
      // Le pied appartient à la droite support…
      near(distPointLine(line, f), 0, 1e-9);
      // …et le segment qF est orthogonal à la droite.
      near(dot(vec(f, q), line.d), 0, 1e-9);
    }
  });

  it('distPointLine égale la distance au projeté — l’invariant |d| = 1', () => {
    for (const { line, q } of sampleLines()) {
      near(distPointLine(line, q), dist(q, projectOnLine(line, q)), 1e-9);
    }
  });

  it('pointAt et paramOf sont réciproques sur la droite', () => {
    for (const { line } of sampleLines()) {
      for (const t of [-13.5, 0, 4.25, 88]) near(paramOf(line, pointAt(line, t)), t, 1e-9);
    }
  });
});

describe('relations', () => {
  it('la perpendiculaire construite est bien perpendiculaire (aller-retour)', () => {
    for (const { line, q } of sampleLines()) {
      const perp = perpendicularThrough(line, q);
      expect(arePerpendicular(line, perp)).toBe(true);
      expect(areParallel(line, perp)).toBe(false);
      // Deux rotations de 90° ramènent à une direction parallèle.
      expect(areParallel(line, perpendicularThrough(perp, q))).toBe(true);
    }
  });

  it('la parallèle construite passe par le point et reste parallèle', () => {
    for (const { line, q } of sampleLines()) {
      const par = parallelThrough(line, q);
      expect(areParallel(line, par)).toBe(true);
      near(distPointLine(par, q), 0, 1e-12);
    }
  });

  it('intersect renvoie null EXACTEMENT quand les droites sont parallèles', () => {
    for (const { line, q } of sampleLines()) {
      const par = parallelThrough(line, q);
      const perp = perpendicularThrough(line, q);
      expect(intersect(line, par) === null).toBe(areParallel(line, par));
      expect(intersect(line, perp) === null).toBe(areParallel(line, perp));
    }
  });

  it('le point d’intersection appartient aux deux droites', () => {
    const l1 = lineThrough(P(0, 0), P(10, 0));
    const l2 = lineThrough(P(3, -5), P(3, 5));
    const i = intersect(l1, l2);
    nearPt(i, P(3, 0), 1e-9);
    near(distPointLine(l1, i), 0, 1e-9);
    near(distPointLine(l2, i), 0, 1e-9);
  });

  it('une droite est parallèle à elle-même et jamais perpendiculaire à elle-même', () => {
    const l = lineThrough(P(1, 1), P(5, 3));
    expect(areParallel(l, l)).toBe(true);
    expect(arePerpendicular(l, l)).toBe(false);
  });

  it('gère les verticales, que la comparaison de pentes casserait', () => {
    const v1 = lineThrough(P(4, 0), P(4, 10));
    const v2 = lineThrough(P(9, -3), P(9, 3));
    const h = lineThrough(P(0, 2), P(6, 2));
    expect(areParallel(v1, v2)).toBe(true);
    expect(intersect(v1, v2)).toBeNull();
    expect(arePerpendicular(v1, h)).toBe(true);
    near(angleBetweenDeg(v1, h), 90, 1e-9);
    near(angleBetweenDeg(v1, v2), 0, 1e-9);
  });

  it('areCollinear est invariant par permutation des trois points', () => {
    const a = P(0, 0); const b = P(2, 1); const c = P(6, 3); const d = P(6, 4);
    for (const [x, y, z] of [[a, b, c], [b, c, a], [c, a, b], [c, b, a]]) {
      expect(areCollinear(x, y, z)).toBe(true);
    }
    for (const [x, y, z] of [[a, b, d], [b, d, a], [d, a, b]]) {
      expect(areCollinear(x, y, z)).toBe(false);
    }
  });

  it('perpDirection tourne de 90° et conserve la norme', () => {
    const d = normalize(P(3, 4));
    const p = perpDirection(d);
    near(dot(d, p), 0, 1e-12);
    near(norm(p), 1, 1e-12);
  });
});

describe('étendue — droite / segment / demi-droite', () => {
  const a = P(0, 0); const b = P(10, 0);
  const seg = { kind: 'segment', a, b };
  const ray = { kind: 'demi-droite', a, b };
  const line = { kind: 'droite', a, b };

  it('extentOf encode la seule différence entre les trois objets', () => {
    expect(extentOf(seg)).toEqual({ fromT: 0, toT: 10 });
    expect(extentOf(ray)).toEqual({ fromT: 0, toT: Infinity });
    expect(extentOf(line)).toEqual({ fromT: -Infinity, toT: Infinity });
  });

  it('endpointsOf est la propriété discriminante : 2, 1, 0', () => {
    expect(endpointsOf(seg)).toHaveLength(2);
    expect(endpointsOf(ray)).toHaveLength(1);
    expect(endpointsOf(ray)[0]).toEqual(a);
    expect(endpointsOf(line)).toHaveLength(0);
  });

  it('containsPoint respecte l’étendue, pas seulement la droite support', () => {
    const inside = P(5, 0); const beyondB = P(20, 0); const behindA = P(-7, 0);
    const off = P(5, 3);
    for (const o of [seg, ray, line]) expect(containsPoint(o, inside)).toBe(true);
    expect(containsPoint(seg, beyondB)).toBe(false);
    expect(containsPoint(ray, beyondB)).toBe(true);
    expect(containsPoint(line, beyondB)).toBe(true);
    expect(containsPoint(seg, behindA)).toBe(false);
    expect(containsPoint(ray, behindA)).toBe(false);
    expect(containsPoint(line, behindA)).toBe(true);
    for (const o of [seg, ray, line]) expect(containsPoint(o, off)).toBe(false);
  });

  it('clipToBox : le segment s’arrête, la demi-droite et la droite sortent', () => {
    const box = { xMin: -50, yMin: -50, xMax: 50, yMax: 50 };
    const cs = clipToBox(seg, box);
    nearPt(cs.from, a); nearPt(cs.to, b);
    expect(cs.openFrom).toBe(false);
    expect(cs.openTo).toBe(false);

    const cr = clipToBox(ray, box);
    nearPt(cr.from, a);
    nearPt(cr.to, P(50, 0));
    expect(cr.openFrom).toBe(false);
    expect(cr.openTo).toBe(true);

    const cl = clipToBox(line, box);
    nearPt(cl.from, P(-50, 0));
    nearPt(cl.to, P(50, 0));
    expect(cl.openFrom).toBe(true);
    expect(cl.openTo).toBe(true);
  });

  it('clipToBox renvoie null quand l’objet ne traverse pas la boîte', () => {
    const far = { xMin: 100, yMin: 100, xMax: 200, yMax: 200 };
    expect(clipToBox(seg, far)).toBeNull();
  });

  it('clipToBox gère une droite oblique et une droite verticale', () => {
    const box = { xMin: 0, yMin: 0, xMax: 10, yMax: 10 };
    const diag = clipToBox({ kind: 'droite', a: P(0, 0), b: P(1, 1) }, box);
    nearPt(diag.from, P(0, 0), 1e-9);
    nearPt(diag.to, P(10, 10), 1e-9);

    const vert = clipToBox({ kind: 'droite', a: P(4, 2), b: P(4, 7) }, box);
    near(vert.from.x, 4, 1e-9);
    near(vert.to.x, 4, 1e-9);
    near(Math.min(vert.from.y, vert.to.y), 0, 1e-9);
    near(Math.max(vert.from.y, vert.to.y), 10, 1e-9);
  });

  it('notationOf et describeObj suivent la convention française', () => {
    expect(notationOf(line)).toBe('(AB)');
    expect(notationOf(seg)).toBe('[AB]');
    expect(notationOf(ray)).toBe('[AB)');
    expect(notationOf(seg, 'M', 'N')).toBe('[MN]');
    expect(describeObj(line)).toBe('la droite (AB)');
    expect(describeObj(seg)).toBe('le segment [AB]');
    expect(describeObj(ray)).toBe('la demi-droite [AB)');
  });

  it('rejette un kind inconnu plutôt que de dessiner n’importe quoi', () => {
    const bad = { kind: 'vecteur', a, b };
    expect(() => extentOf(bad)).toThrow(/kind inconnu/);
    expect(() => endpointsOf(bad)).toThrow(/kind inconnu/);
    expect(() => notationOf(bad)).toThrow(/kind inconnu/);
  });
});

describe('quadrillage', () => {
  it('snapToGrid arrondit au multiple du pas', () => {
    expect(snapToGrid(P(23, 47), 10)).toEqual({ x: 20, y: 50 });
    expect(snapToGrid(P(-4, 6), 10)).toEqual({ x: -0, y: 10 });
  });

  it('nearestNode borne le nœud au quadrillage', () => {
    expect(nearestNode(P(31, 19), 10, 7, 6)).toEqual({ col: 3, row: 2 });
    expect(nearestNode(P(999, 999), 10, 7, 6)).toEqual({ col: 7, row: 6 });
    expect(nearestNode(P(-40, -40), 10, 7, 6)).toEqual({ col: 0, row: 0 });
  });
});

/* ── Polygones & symétrie (ajoutés pour figures-planes / symetrie) ───── */

describe('polygones', () => {
  // Carré de côté 100, coin en (0,0). Repère SVG : y descend.
  const CARRE = [P(0, 0), P(100, 0), P(100, 100), P(0, 100)];
  const RECT = [P(0, 0), P(160, 0), P(160, 80), P(0, 80)];
  const LOSANGE = [P(80, 0), P(160, 60), P(80, 120), P(0, 60)];
  const TRI_RECT = [P(0, 0), P(90, 0), P(0, 120)];
  const QUELCONQUE = [P(0, 0), P(120, 10), P(140, 90), P(20, 70)];

  it('sidesOf boucle bien sur le contour', () => {
    const s = sidesOf(CARRE);
    expect(s).toHaveLength(4);
    expect(s[3][1]).toEqual(CARRE[0]); // le dernier côté revient au départ
  });

  it('sideLengths mesure chaque côté', () => {
    expect(sideLengths(CARRE).map(Math.round)).toEqual([100, 100, 100, 100]);
    expect(sideLengths(RECT).map(Math.round)).toEqual([160, 80, 160, 80]);
  });

  it('interiorAngles : 4 angles droits pour un carré, 90° au bon sommet du triangle', () => {
    interiorAngles(CARRE).forEach((a) => near(a, 90, 1e-6));
    const t = interiorAngles(TRI_RECT);
    near(t[0], 90, 1e-6);        // l'angle droit est en (0,0)
    near(t[0] + t[1] + t[2], 180, 1e-6); // somme des angles d'un triangle
  });

  it('rightAngleCount distingue carré, rectangle, losange et quelconque', () => {
    expect(rightAngleCount(CARRE)).toBe(4);
    expect(rightAngleCount(RECT)).toBe(4);
    expect(rightAngleCount(LOSANGE)).toBe(0);
    expect(rightAngleCount(QUELCONQUE)).toBe(0);
    expect(isRightAngleAt(TRI_RECT, 0)).toBe(true);
    expect(isRightAngleAt(TRI_RECT, 1)).toBe(false);
  });

  it('allSidesEqual sépare carré/losange de rectangle', () => {
    expect(allSidesEqual(CARRE)).toBe(true);
    expect(allSidesEqual(LOSANGE)).toBe(true);
    expect(allSidesEqual(RECT)).toBe(false);
  });

  it('oppositeSidesEqual et oppositeSidesParallel valent pour tout parallélogramme', () => {
    for (const q of [CARRE, RECT, LOSANGE]) {
      expect(oppositeSidesEqual(q)).toBe(true);
      expect(oppositeSidesParallel(q)).toBe(true);
    }
    expect(oppositeSidesParallel(QUELCONQUE)).toBe(false);
  });

  it('LA caractérisation : carré = 4 côtés égaux ET 4 angles droits', () => {
    const estCarre = (q) => allSidesEqual(q) && rightAngleCount(q) === 4;
    expect(estCarre(CARRE)).toBe(true);
    expect(estCarre(RECT)).toBe(false);    // angles droits, mais côtés inégaux
    expect(estCarre(LOSANGE)).toBe(false); // côtés égaux, mais pas d'angle droit
  });

  it('les diagonales d’un rectangle sont égales, pas celles d’un losange quelconque', () => {
    const [d1, d2] = diagonalLengths(RECT);
    near(d1, d2, 1e-6);
    const [e1, e2] = diagonalLengths(LOSANGE);
    expect(Math.abs(e1 - e2)).toBeGreaterThan(1);
  });

  it('perimeter et polygonArea sont cohérents', () => {
    near(perimeter(CARRE), 400, 1e-6);
    near(polygonArea(CARRE), 10000, 1e-6);
    near(polygonArea(RECT), 160 * 80, 1e-6);
    near(polygonArea(TRI_RECT), (90 * 120) / 2, 1e-6); // base × hauteur / 2
  });

  it('centroid tombe au centre d’un carré', () => {
    nearPt(centroid(CARRE), P(50, 50), 1e-9);
  });

  it('déformer un carré lui fait PERDRE ses propriétés — le cœur de la leçon', () => {
    const deforme = [P(0, 0), P(100, 0), P(115, 100), P(0, 100)];
    expect(rightAngleCount(CARRE)).toBe(4);
    expect(rightAngleCount(deforme)).toBeLessThan(4);
    expect(allSidesEqual(deforme)).toBe(false);
  });
});

describe('symétrie axiale', () => {
  const AXE_V = lineThrough(P(100, 0), P(100, 100));   // axe vertical x = 100
  const AXE_OBLIQUE = lineThrough(P(0, 0), P(100, 100));

  it('le symétrique est à la même distance, de l’autre côté', () => {
    const q = P(60, 40);
    const r = reflectPoint(AXE_V, q);
    nearPt(r, P(140, 40), 1e-9);
    near(distPointLine(AXE_V, q), distPointLine(AXE_V, r), 1e-9);
  });

  it('le milieu du segment [q, q′] est sur l’axe, et [qq′] lui est perpendiculaire', () => {
    for (const q of [P(60, 40), P(10, 130), P(180, 20)]) {
      const r = reflectPoint(AXE_OBLIQUE, q);
      near(distPointLine(AXE_OBLIQUE, midpoint(q, r)), 0, 1e-9);
      expect(arePerpendicular(AXE_OBLIQUE, lineThrough(q, r))).toBe(true);
    }
  });

  it('un point SUR l’axe est son propre symétrique', () => {
    const onAxis = P(100, 55);
    nearPt(reflectPoint(AXE_V, onAxis), onAxis, 1e-9);
  });

  it('réfléchir deux fois ramène au point de départ', () => {
    const q = P(37, 91);
    nearPt(reflectPoint(AXE_OBLIQUE, reflectPoint(AXE_OBLIQUE, q)), q, 1e-9);
  });

  it('la symétrie CONSERVE les longueurs et les angles', () => {
    const fig = [P(20, 20), P(80, 30), P(50, 90)];
    const img = reflectPoints(AXE_V, fig);
    sideLengths(fig).forEach((l, i) => near(l, sideLengths(img)[i], 1e-9));
    interiorAngles(fig).forEach((a, i) => near(a, interiorAngles(img)[i], 1e-9));
    near(polygonArea(fig), polygonArea(img), 1e-9);
  });

  it('isSymmetryAxis reconnaît le bon axe et rejette les autres', () => {
    const carre = [P(0, 0), P(100, 0), P(100, 100), P(0, 100)];
    const mediane = lineThrough(P(50, -10), P(50, 110));   // axe de symétrie
    const diagonale = lineThrough(P(0, 0), P(100, 100));    // axe de symétrie
    const oblique = lineThrough(P(0, 0), P(100, 40));       // ne l'est pas
    expect(isSymmetryAxis(mediane, carre)).toBe(true);
    expect(isSymmetryAxis(diagonale, carre)).toBe(true);
    expect(isSymmetryAxis(oblique, carre)).toBe(false);
  });
});

describe('angleAtDeg', () => {
  it('mesure l’angle au sommet, non orienté', () => {
    near(angleAtDeg(P(1, 0), P(0, 0), P(0, 1)), 90, 1e-9);
    near(angleAtDeg(P(0, 1), P(0, 0), P(1, 0)), 90, 1e-9);   // symétrique
    near(angleAtDeg(P(1, 0), P(0, 0), P(-1, 0)), 180, 1e-9); // angle plat
    near(angleAtDeg(P(2, 0), P(0, 0), P(2, 0)), 0, 1e-9);    // angle nul
  });

  it('donne le même nombre si l’on retourne le repère (y vers le haut)', () => {
    const flip = (p) => P(p.x, -p.y);
    const a = P(3, 1); const b = P(0, 0); const c = P(1, 4);
    near(angleAtDeg(a, b, c), angleAtDeg(flip(a), flip(b), flip(c)), 1e-9);
  });

  it('retrouve les angles d’un triangle 3-4-5', () => {
    const A = P(0, 0); const B = P(4, 0); const C = P(0, 3);
    near(angleAtDeg(B, A, C), 90, 1e-9);
    const sum = angleAtDeg(B, A, C) + angleAtDeg(A, B, C) + angleAtDeg(A, C, B);
    near(sum, 180, 1e-9);
  });
});

describe('circleCircleIntersections — la mathématique du compas', () => {
  it('donne deux points quand les cercles se croisent franchement', () => {
    const pts = circleCircleIntersections(P(0, 0), 5, P(6, 0), 5);
    expect(pts).toHaveLength(2);
    for (const p of pts) {
      near(dist(P(0, 0), p), 5, 1e-9);
      near(dist(P(6, 0), p), 5, 1e-9);
    }
  });

  it('donne un seul point quand les cercles sont tangents', () => {
    expect(circleCircleIntersections(P(0, 0), 2, P(5, 0), 3)).toHaveLength(1);
    expect(circleCircleIntersections(P(0, 0), 5, P(2, 0), 3)).toHaveLength(1);
  });

  it('INVARIANT : aucun point ⟺ l’inégalité triangulaire échoue', () => {
    // Un triangle de côtés a, b, c se construit en posant [AB] de longueur c
    // puis en croisant les arcs de rayons b (en A) et a (en B).
    const cases = [
      [3, 4, 5], [3, 4, 6], [5, 5, 5], [2, 3, 4],   // constructibles
      [3, 4, 8], [1, 1, 5], [2, 3, 9], [1, 10, 2],  // impossibles
      [3, 4, 7], [2, 2, 4],                          // cas limites (dégénérés)
    ];
    for (const [a, b, c] of cases) {
      const A = P(0, 0); const B = P(c, 0);
      const pts = circleCircleIntersections(A, b, B, a);
      const inequalityHolds = a + b >= c && a + c >= b && b + c >= a;
      expect(pts.length > 0).toBe(inequalityHolds);
    }
  });

  it('le troisième sommet trouvé respecte les longueurs demandées', () => {
    const A = P(0, 0); const B = P(6, 0);
    const [C] = circleCircleIntersections(A, 4, B, 5);
    near(dist(A, C), 4, 1e-9);
    near(dist(B, C), 5, 1e-9);
  });

  it('renvoie un tableau vide pour deux cercles concentriques', () => {
    expect(circleCircleIntersections(P(2, 2), 3, P(2, 2), 3)).toEqual([]);
  });
});

describe('pointOnSegmentAt & lengthRatio', () => {
  it('interpole le segment et retrouve ses extrémités', () => {
    const a = P(2, 1); const b = P(10, 5);
    nearPt(pointOnSegmentAt(a, b, 0), a);
    nearPt(pointOnSegmentAt(a, b, 1), b);
    nearPt(pointOnSegmentAt(a, b, 0.5), midpoint(a, b));
  });

  it('le paramètre t est exactement le rapport des longueurs', () => {
    const a = P(0, 0); const b = P(8, 6); // longueur 10
    for (const t of [0.25, 0.5, 0.75]) {
      const m = pointOnSegmentAt(a, b, t);
      near(lengthRatio(dist(a, m), dist(a, b)), t, 1e-9);
    }
  });

  it('lengthRatio renvoie null plutôt qu’un infini', () => {
    expect(lengthRatio(5, 0)).toBeNull();
    expect(lengthRatio(0, 0)).toBeNull();
    near(lengthRatio(3, 4), 0.75, 1e-12);
  });
});
