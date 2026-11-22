import { describe, it, expect } from 'vitest';
import { frac, eq, toNumber } from './linear.js';
import { surd, surdEq, surdNumber } from './trigonometry.js';
import {
  ballPosition, distance3, sphereArea, ballVolume, piLatex, piRound, radiusFromSphereArea, radiusFromBallVolume, cubeRoot,
  archimedes, cube, cuboid, cylinder, cone, pyramid, frustumVolume, sphereSection, sectionDistance, cuboidSection,
  cylinderSection, apexSection, scaleEffect, scaled, ratioFrom, bucketWater, cm3ToLitres, isGreatCircle, roundTo,
} from './space.js';

const F = (n, d = 1) => frac(n, d);

describe('space — la كرة et la جلّة (معارف 1)', () => {
  it('compare OM et R exactement', () => {
    expect(ballPosition([0, 0, 0], 3, [1, 2, 2]).where).toBe('surface');
    expect(ballPosition([0, 0, 0], 3, [1, 1, 1]).where).toBe('inside');
    expect(ballPosition([0, 0, 0], 3, [2, 2, 2]).where).toBe('outside');
    const p = ballPosition([0, 0, 0], 3, [1, 1, 1]);
    expect(p.inBall && !p.onSphere).toBe(true);
    expect(surdEq(p.OM, surd(1, 3))).toBe(true);
    // un point « presque » sur la sphère n'y est pas : la comparaison est exacte
    expect(ballPosition([0, 0, 0], 1, ['0,6', '0,8', '0,0001']).where).toBe('outside');
  });
  it('distance exacte dans l’espace', () => {
    expect(surdEq(distance3([0, 0, 0], [2, 2, 1]), surd(3))).toBe(true);
    expect(surdEq(distance3([1, 0, 0], [0, 1, 1]), surd(1, 3))).toBe(true);
  });
  it('un grand cercle a le rayon de la sphère', () => {
    expect(isGreatCircle(3, 3)).toBe(true);
    expect(isGreatCircle(3, 2)).toBe(false);
  });
});

describe('space — aire et volume (معارف 2)', () => {
  it('exemple du manuel R = 1,4 cm', () => {
    const A = sphereArea('1,4');
    expect(eq(A.k, F(196, 25))).toBe(true);
    expect(roundTo(A.number, 2)).toBe('24,63');
    const V = ballVolume('1,4');
    expect(eq(V.k, F(1372, 375))).toBe(true);
    expect(roundTo(V.number, 3)).toBe('11,494');
  });
  it('écritures en π', () => {
    expect(piLatex(F(32, 3))).toBe('\\frac{32}{3}\\pi');
    expect(piLatex(F(4))).toBe('4\\pi');
    expect(piLatex(F(1))).toBe('\\pi');
    expect(piLatex(F(1, 3))).toBe('\\frac{\\pi}{3}');
    expect(sphereArea(3).latex).toBe('36\\pi');
    expect(ballVolume(3).latex).toBe('36\\pi');
    expect(piRound(F(36), 2)).toBe('113,10');
  });
  it('rayon depuis l’aire ou le volume', () => {
    expect(surdEq(radiusFromSphereArea(36), surd(3))).toBe(true);
    expect(eq(radiusFromBallVolume(36).exact, F(3))).toBe(true);
    expect(radiusFromBallVolume(10).exact).toBeNull();
    expect(eq(cubeRoot(F(27, 125)), F(3, 5))).toBe(true);
  });
  it('Archimède : 𝒜 sphère = aire latérale du cylindre, 𝒱 boule = 2/3 du cylindre', () => {
    const a = archimedes(5);
    expect(eq(a.areaRatio, F(1))).toBe(true);
    expect(eq(a.volumeRatio, F(2, 3))).toBe(true);
  });
});

describe('space — les solides usuels (أستعدّ)', () => {
  it('les huit items', () => {
    expect(eq(cube(2).volume, F(8))).toBe(true);                       // 4 : 6 cm³ est FAUX
    expect(eq(cuboid(2, 3, 4).volume, F(24))).toBe(true);              // 5 : vrai
    expect(cylinder(2, 2).volume.latex).toBe('8\\pi');                 // 6 : 4π est FAUX
    expect(cone(2, 2).volume.latex).toBe('\\frac{8}{3}\\pi');          // 7 : 4π est FAUX
    expect(eq(pyramid(9, 3).volume, F(9))).toBe(true);                 // 8 : vrai
  });
  it('aire totale d’une بلاطة (نشاط 6)', () => {
    const c = cuboid(5, 4, 3);
    expect(eq(c.volume, F(60))).toBe(true);
    expect(eq(c.area, F(94))).toBe(true);
  });
  it('tronc de cône', () => {
    // π/3·3·(4 + 2 + 1) = 7π
    expect(frustumVolume({ R: 2, r: 1, h: 3 }).latex).toBe('7\\pi');
  });
});

describe('space — sections planes (نشاط 2–5، معارف 3، طرائق)', () => {
  it('sphère R = 3 (نشاط 2)', () => {
    expect(sphereSection(3, 0).kind).toBe('great-circle');
    expect(surdEq(sphereSection(3, 0).radius, surd(3))).toBe(true);
    expect(eq(sphereSection(3, '1,25').radius2, F(119, 16))).toBe(true);
    expect(surdEq(sphereSection(3, 2).radius, surd(1, 5))).toBe(true);
    expect(eq(sphereSection(3, '2,8').radius2, F(29, 25))).toBe(true);
    expect(sphereSection(3, 3).kind).toBe('point');
    expect(sphereSection(3, 4).kind).toBe('none');
  });
  it('rayon d’une section (طرائق ص 169) et distance inverse', () => {
    expect(surdEq(sphereSection('2,5', '1,5').radius, surd(2))).toBe(true);
    expect(surdEq(sectionDistance('2,5', 2), surd(F(3, 2)))).toBe(true);
    expect(sectionDistance(2, 3)).toBeNull();
  });
  it('بلاطة قائمة 25 × 20 × 6 (نشاط 3)', () => {
    const face = cuboidSection({ a: 25, b: 20, c: 6 }, { parallelTo: 'face', face: 'bc' });
    expect(eq(face.area, F(120))).toBe(true);
    const edge = cuboidSection({ a: 25, b: 20, c: 6 }, { parallelTo: 'edge', p: 4, q: 3 });
    expect(surdEq(edge.sides[1], surd(5))).toBe(true);
    expect(surdEq(edge.area, surd(30))).toBe(true);
  });
  it('أسطوانة r = 1,7 h = 6 (نشاط 4) et h = 3 r = 2 (دوري الآن ص 169)', () => {
    const s = cylinderSection('1,7', 6, { axisDistance: '0,8' });
    expect(s.kind).toBe('rectangle');
    expect(surdEq(s.sides[0], surd(3))).toBe(true);
    expect(cylinderSection('1,7', 6, { parallelTo: 'base' }).kind).toBe('circle');
    const n = cylinderSection(2, 3, { axisDistance: 1 });
    expect(surdEq(n.sides[0], surd(2, 3))).toBe(true);
    expect(surdEq(n.area, surd(6, 3))).toBe(true);
    expect(cylinderSection(2, 3, { axisDistance: 2 }).kind).toBe('segment');
    expect(cylinderSection(2, 3, { axisDistance: 3 }).kind).toBe('none');
  });
  it('هرم SABCD, AB = 4, SE = 3/4 SA (نشاط 5) ; cône', () => {
    const s = apexSection({ base: [4, 4], ratio: '3/4' });
    expect(s.kind).toBe('square');
    expect(s.sides.every((x) => eq(x, F(3)))).toBe(true);
    const c = apexSection({ radius: 6, ratio: '1/3' });
    expect(surdEq(c.radius, surd(2))).toBe(true);
    expect(c.area.latex).toBe('4\\pi');
  });
});

describe('space — agrandissement / réduction (نشاط 6)', () => {
  it('k = 3/5 sur le pavé 5 × 4 × 3', () => {
    const e = scaleEffect('3/5');
    expect(e.kind).toBe('reduction');
    expect(eq(e.area, F(9, 25)) && eq(e.volume, F(27, 125))).toBe(true);
    expect(eq(scaled(60, '3/5', 3), F(324, 25))).toBe(true);   // 12,96
    expect(eq(scaled(94, '3/5', 2), F(846, 25))).toBe(true);   // 33,84
    expect(toNumber(scaled(60, '3/5', 3))).toBeCloseTo(12.96, 10);
  });
  it('un π-multiple se réduit aussi', () => {
    expect(scaled(ballVolume(5), '2/5', 3).latex).toBe(ballVolume(2).latex);
  });
  it('retrouver k', () => {
    expect(eq(ratioFrom(60, F(324, 25), 3), F(3, 5))).toBe(true);
    expect(eq(ratioFrom(94, F(846, 25), 2), F(3, 5))).toBe(true);
    expect(ratioFrom(2, 5, 3)).toBeNull();
    expect(scaleEffect(2).kind).toBe('enlargement');
    expect(() => scaleEffect(0)).toThrow();
  });
});

describe('space — le seau (تحدّ)', () => {
  it('deux lectures, même méthode (Thalès + k³ = formule du tronc)', () => {
    for (const [H, depth] of [[28, 21], [35, 28]]) { // [35, 28] = la lecture retenue par l'extraction
      const w = bucketWater({ R: 20, r: 15, H, depth });
      const direct = frustumVolume({ R: w.surfaceRadius, r: 15, h: depth });
      expect(eq(w.volume.k, direct.k)).toBe(true);
      // V = V_grand − V_petit
      expect(Math.abs(w.volume.number - (w.bigCone.number - w.smallCone.number))).toBeLessThan(1e-6);
    }
    const w = bucketWater({ R: 20, r: 15, H: 28, depth: 21 });
    expect(eq(w.surfaceRadius, F(75, 4))).toBe(true);
    expect(eq(w.apexBelowBottom, F(84))).toBe(true);
    expect(eq(w.k, F(4, 5))).toBe(true);
    expect(roundTo(w.volume.number / 1000, 2)).toBe('18,86');
    expect(eq(cm3ToLitres(18000), F(18))).toBe(true);
  });
  it('lecture retenue : H = 35, eau 28 cm ⇒ ρ = 19, V = 24388π/3 ≈ 25,54 L', () => {
    const w = bucketWater({ R: 20, r: 15, H: 35, depth: 28 });
    expect(eq(w.surfaceRadius, F(19))).toBe(true);
    expect(eq(w.volume.k, F(24388, 3))).toBe(true);
    expect(roundTo(w.volume.number / 1000, 2)).toBe('25,54');
  });
  it('surds utiles', () => {
    expect(surdNumber(surd(1, 2))).toBeCloseTo(Math.SQRT2, 12);
  });
});
