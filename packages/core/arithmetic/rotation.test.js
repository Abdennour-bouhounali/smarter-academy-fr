import { describe, it, expect } from 'vitest';
import * as R from './rotation.js';
import { point } from './vectors.js';
import { surdText } from './trigonometry.js';
import { fracText } from './linear.js';

const close = (p, x, y) => { expect(p.x).toBeCloseTo(x, 9); expect(p.y).toBeCloseTo(y, 9); };
const txt = (p) => `${fracText(p.x)};${fracText(p.y)}`;

describe('le دوران : image exacte (quarts de tour) et approchée', () => {
  const O = point(1, 1);
  it('90° direct : (x ; y) − O tourne en (−y ; x)', () => {
    expect(txt(R.rotate(point(4, 2), O, 90, 'direct'))).toBe('0;4');
    expect(txt(R.rotate(point(4, 2), O, 90, 'indirect'))).toBe('2;-2');
  });
  it('180° = التناظر المركزي, 270° direct = 90° indirect, 360° = identité', () => {
    expect(txt(R.rotate(point(4, 2), O, 180))).toBe('-2;0');
    expect(txt(R.rotate(point(4, 2), O, 270, 'direct'))).toBe(txt(R.rotate(point(4, 2), O, 90, 'indirect')));
    expect(txt(R.rotate(point('1/2', 3), O, 360))).toBe('1/2;3');
  });
  it('refuse un angle non multiple de 90° en exact', () => {
    expect(() => R.rotate(point(1, 0), O, 70)).toThrow();
    close(R.rotateApprox({ x: 1, y: 0 }, { x: 0, y: 0 }, 60), 0.5, Math.sqrt(3) / 2);
    close(R.rotateApprox({ x: 1, y: 0 }, { x: 0, y: 0 }, 60, 'indirect'), 0.5, -Math.sqrt(3) / 2);
  });
  it('rotateAll garde l\'exact quand il le peut', () => {
    const [a, b] = R.rotateAll([point(2, 0), point(0, 3)], point(0, 0), 90);
    expect(txt(a)).toBe('0;2'); expect(txt(b)).toBe('-3;0');
  });
});

describe('imageCheck : les trois conditions du manuel', () => {
  const O = { x: 0, y: 0 }; const M = { x: 4, y: 0 };
  it('accepte l\'image juste', () => {
    expect(R.imageCheck(O, M, R.rotateApprox(M, O, 70), 70, 'direct').ok).toBe(true);
    expect(R.imageCheck(point(0, 0), point(3, 1), R.rotate(point(3, 1), point(0, 0), 90), 90).ok).toBe(true);
  });
  it('dit lequel manque : distance, angle, sens', () => {
    const tooFar = R.imageCheck(O, M, R.rotateApprox({ x: 5, y: 0 }, O, 70), 70);
    expect(tooFar).toMatchObject({ ok: false, length: false, angle: true, sense: true });
    const wrongAngle = R.imageCheck(O, M, R.rotateApprox(M, O, 50), 70);
    expect(wrongAngle).toMatchObject({ ok: false, length: true, angle: false });
    expect(wrongAngle.measured.angle).toBeCloseTo(50, 6);
    const wrongSense = R.imageCheck(O, M, R.rotateApprox(M, O, 70, 'indirect'), 70, 'direct');
    expect(wrongSense).toMatchObject({ ok: false, length: true, angle: true, sense: false });
    expect(wrongSense.measured.direction).toBe('indirect');
  });
  it('180° : les deux sens se valent', () => {
    expect(R.imageCheck(O, M, { x: -4, y: 0 }, 180, 'indirect')).toMatchObject({ ok: true, sense: null });
  });
  it('findRotation retrouve (α, sens) ou null', () => {
    expect(R.findRotation(O, M, { x: 0, y: 4 })).toMatchObject({ direction: 'direct' });
    expect(R.findRotation(O, M, { x: 0, y: 4 }).alpha).toBeCloseTo(90, 9);
    expect(R.findRotation(O, M, { x: 0, y: -4 }).direction).toBe('indirect');
    expect(R.findRotation(O, M, { x: 0, y: 5 })).toBeNull();
  });
});

describe('angles inscrits et au centre', () => {
  it('محيطية = نصف المركزية (exact)', () => {
    expect(fracText(R.inscribedFromCentral(120))).toBe('60');
    expect(fracText(R.inscribedFromCentral(75))).toBe('75/2');
    expect(fracText(R.centralFromInscribed(35))).toBe('70');
  });
  it('arcAngles : M sur le grand arc → central < 180 ; M sur le petit arc → central rentrant', () => {
    const O = { x: 0, y: 0 };
    const A = R.pointOnCircle(O, 5, 0); const B = R.pointOnCircle(O, 5, 100);
    const big = R.arcAngles(O, A, B, R.pointOnCircle(O, 5, 230));
    expect(big.sameCircle).toBe(true);
    expect(big.central).toBeCloseTo(100, 6); expect(big.inscribed).toBeCloseTo(50, 6);
    const small = R.arcAngles(O, A, B, R.pointOnCircle(O, 5, 50));
    expect(small.reflex).toBe(true);
    expect(small.central).toBeCloseTo(260, 6); expect(small.inscribed).toBeCloseTo(130, 6);
  });
  it('deux angles inscrits sur le même arc sont égaux ; un diamètre donne 90°', () => {
    const O = { x: 0, y: 0 };
    const A = R.pointOnCircle(O, 3, 200); const B = R.pointOnCircle(O, 3, 320);
    const M = R.pointOnCircle(O, 3, 40); const N = R.pointOnCircle(O, 3, 130);
    expect(R.sameArc(A, B, M, N)).toBe(true);
    expect(R.angleAt(A, M, B)).toBeCloseTo(R.angleAt(A, N, B), 9);
    expect(R.angleAt(R.pointOnCircle(O, 3, 0), M, R.pointOnCircle(O, 3, 180))).toBeCloseTo(90, 9);
  });
});

describe('propriétés du دوران (khawas-dawaran) : angle de deux droites, aire, centre', () => {
  it('une droite et son image font l\'angle de rotation replié dans [0 ; 90]', () => {
    const O = point(0, 0); const A = point(4, -2); const C = point(-1, 2);
    const B = R.rotate(A, O, 90); const D = R.rotate(C, O, 90);
    expect(txt(B)).toBe('2;4'); expect(txt(D)).toBe('-2;-1');
    expect(R.lineAngle(A, C, B, D)).toBeCloseTo(90, 9);           // طرائق p. 155 : (BD) ⊥ (AC)
    const A6 = R.rotateApprox({ x: 4, y: -2 }, { x: 0, y: 0 }, 60); const C6 = R.rotateApprox({ x: -1, y: 2 }, { x: 0, y: 0 }, 60);
    expect(R.lineAngle(A, C, A6, C6)).toBeCloseTo(60, 9);
    expect(R.lineAngle(A, C, R.rotate(A, O, 180), R.rotate(C, O, 180))).toBeCloseTo(0, 9); // 180° : parallèles
    expect([0, 60, 90, 120, 180, 270, -60, 300].map(R.lineAngleOfTurn)).toEqual([0, 60, 90, 60, 0, 90, 60, 60]);
  });
  it('polygonArea : exacte, et conservée par le دوران', () => {
    const tri = [point(1, 0), point(4, 0), point(2, 2)];
    expect(fracText(R.polygonArea(tri))).toBe('3');
    expect(fracText(R.polygonArea(R.rotateAll(tri, point(0, 0), 90, 'indirect')))).toBe('3');
    expect(R.polygonArea(tri.map((p) => R.rotateApprox(p, { x: 0, y: 0 }, 60)))).toBeCloseTo(3, 9);
    expect(fracText(R.polygonArea([point(0, 0), point(4, -2), point(-1, 2)]))).toBe('3');
  });
  it('rotationCenter : intersection des médiatrices (تمرين 18 p. 161 : O(1,5 ; 1,5) et W(2 ; 4))', () => {
    expect(txt(R.rotationCenter(point(0, 1), point(2, 0), point(1, 0), point(3, 1)))).toBe('3/2;3/2');
    // M ↦ M′ et N ↦ N′ sont deux pas horizontaux : leurs médiatrices (x = 2) sont CONFONDUES — il faut P ↦ P′
    expect(R.rotationCenter(point(1, 3), point(3, 3), point(0, 2), point(4, 2))).toBeNull();
    expect(txt(R.rotationCenter(point(1, 3), point(3, 3), point(2, 2), point(4, 4)))).toBe('2;4');
    expect(R.findRotation({ x: 2, y: 4 }, { x: 2, y: 2 }, { x: 4, y: 4 })).toMatchObject({ direction: 'direct' });
    expect(R.rotationCenter(point(0, 0), point(2, 0), point(0, 1), point(2, 1))).toBeNull(); // une translation : médiatrices parallèles
    expect(txt(R.rotationCenter(point(5, 5), point(5, 5), point(1, 0), point(9, 0)))).toBe('5;5');
    expect(R.onBisector(point(1, 3), point(3, 3), point(2, 4))).toBe(true);
    expect(R.onBisector(point(1, 3), point(3, 3), point(1, 4))).toBe(false);
  });
});

describe('polygones réguliers', () => {
  it('angles au centre, intérieurs, sommes', () => {
    expect([3, 4, 5, 6, 8, 10, 12].map((n) => fracText(R.centralAngle(n)))).toEqual(['120', '90', '72', '60', '45', '36', '30']);
    expect([3, 4, 5, 6, 8].map((n) => fracText(R.interiorAngle(n)))).toEqual(['60', '90', '108', '120', '135']);
    expect(fracText(R.angleSum(5))).toBe('540');
    expect(fracText(R.centralAngle(7))).toBe('360/7');
    expect(fracText(R.inscribedSideAngle(5))).toBe('36');
  });
  it('sidesFromCentral / sidesFromInterior refusent ce qui n\'existe pas', () => {
    expect(R.sidesFromCentral(72)).toBe(5);
    expect(R.sidesFromCentral(50)).toBeNull();
    expect(R.sidesFromCentral(180)).toBeNull();
    expect(R.sidesFromInterior(135)).toBe(8);
    expect(R.sidesFromInterior(100)).toBeNull();
  });
  it('côté, rayon, apothème exacts pour 3, 4, 6 ; approchés sinon', () => {
    expect(surdText(R.sideFromRadius(6, 4).exact)).toBe('4');
    expect(surdText(R.sideFromRadius(4, 3).exact)).toBe('3√2');
    expect(surdText(R.sideFromRadius(3, 2).exact)).toBe('2√3');
    expect(R.sideFromRadius(3, 2).number).toBeCloseTo(2 * Math.sqrt(3), 9);
    expect(R.sideFromRadius(5, 8).exact).toBeNull();
    expect(R.sideFromRadius(5, 8).number).toBeCloseTo(16 * Math.sin(Math.PI / 5), 9);
    expect(surdText(R.radiusFromSide(3, 6).exact)).toBe('2√3');
    expect(surdText(R.radiusFromSide(4, 4).exact)).toBe('2√2');
    expect(surdText(R.apothem(6, 2).exact)).toBe('√3');
    expect(surdText(R.apothem(3, 4).exact)).toBe('2');
    expect(surdText(R.perimeter(6, 5).exact)).toBe('30');
    expect(R.area(4, 1).number).toBeCloseTo(2, 9);
    expect(surdText(R.area(6, 2).exact)).toBe('6√3');
  });
  it('les sommets sont les images successives par le دوران (O, 360°/n)', () => {
    const O = { x: 1, y: -1 };
    const V = R.regularVertices(O, 3, 5);
    for (let k = 0; k < 5; k += 1) {
      const next = R.rotateApprox(V[k], O, 72);
      close(next, V[(k + 1) % 5].x, V[(k + 1) % 5].y);
      expect(Math.hypot(V[k].x - V[(k + 1) % 5].x, V[k].y - V[(k + 1) % 5].y)).toBeCloseTo(R.chord(5, 3), 9);
    }
  });
  it('l\'étoile à cinq branches : pointes à 10 cm → rayon ≈ 8,51 cm, pointe de 36°', () => {
    const r = R.radiusForChord(5, 10);
    expect(r).toBeCloseTo(8.5065, 3);
    const s = R.star(5, r);
    expect(s.tip).toBeCloseTo(10, 9);
    expect(s.stroke).toBeCloseTo(16.1803, 3);
    expect(s.tipAngle).toBe(36);
  });
  it('les lampadaires (wadiya-idmajiya-dawaran) : corde, arc, écarts égaux, tour fermé par le دوران', () => {
    expect(R.chordOfArc(3, 60)).toBeCloseTo(3, 9);
    expect(R.chordOfArc(2, 90)).toBeCloseTo(2 * Math.SQRT2, 9);
    expect(R.chordOfArc(5, 45)).toBeCloseTo(10 * Math.sin(Math.PI / 8), 9);
    expect(R.arcLength(3, 60)).toBeCloseTo(Math.PI, 9);
    // six poteaux tous les 60° : égaux ; un poteau décalé d'un degré : refusé, cordes extrêmes lues
    expect(R.circleGaps([90, 150, 210, 270, 330, 30], 3).equal).toBe(true);
    const off = R.circleGaps([90, 150, 211, 270, 330, 30], 3);
    expect(off.equal).toBe(false);
    expect(off.max).toBeCloseTo(R.chordOfArc(3, 61), 9);
    expect(off.min).toBeCloseTo(R.chordOfArc(3, 59), 9);
    expect(off.order).toEqual([5, 0, 1, 2, 3, 4]);
    expect(R.circleGaps([0, 0, 180, 270], 2).equal).toBe(false);
    expect(R.circleGaps([-90, 0, 90, 180], 2).equal).toBe(true);
    // le tour se referme seulement si n·α = 360°
    expect(R.ringByRotation(6, 60)).toMatchObject({ closes: true, overshoot: null, closing: 60 });
    expect(R.ringByRotation(6, 55)).toMatchObject({ closes: false, overshoot: null, closing: 85 });
    expect(R.ringByRotation(6, 75)).toMatchObject({ closes: false, overshoot: 5, closing: null });
    expect(R.ringByRotation(6, 120).overshoot).toBe(3);
    expect(R.ringByRotation(4, 90).closes).toBe(true);
    expect(R.ringByRotation(8, 45).offsets).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);
    expect(R.ringByRotation(7, '360/7').closes).toBe(true);
  });
  it('degLatex', () => {
    expect(R.degLatex(72)).toBe('72^\\circ');
    expect(R.degLatex('360/7')).toBe('\\dfrac{360}{7}^\\circ');
  });
});

describe('un sommet hors du cercle (zawiya-muhitiya : lab inscribed-angle, exercice 12)', () => {
  const O = { x: 0, y: 0 };
  it('circlePosition et secondIntersection', () => {
    expect(R.circlePosition(O, 2, { x: 0, y: 1 })).toBe('inside');
    expect(R.circlePosition(O, 2, R.pointOnCircle(O, 2, 37))).toBe('on');
    expect(R.circlePosition(O, 2, { x: 3, y: 0 })).toBe('outside');
    close(R.secondIntersection(O, { x: -2, y: 0 }, { x: 0, y: 0 }), 2, 0);
  });
  it('exercice 12 : M = (AB) ∩ (CD) ; CMB = (COB + AOD) / 2 = 60°', () => {
    const B = { x: -2, y: 0 }; const D = { x: 2, y: 0 };
    const C = R.pointOnCircle(O, 2, 120); const A = R.pointOnCircle(O, 2, 60);
    const M = { x: 0, y: 2 / Math.sqrt(3) };
    const v = R.vertexAngle(O, C, B, M);
    expect(v).toMatchObject({ position: 'inside', rule: 'half-sum' });
    close(v.A2, D.x, D.y); close(v.B2, A.x, A.y);
    expect(v.far).toBeCloseTo(60, 6); expect(v.near).toBeCloseTo(60, 6);
    expect(v.angle).toBeCloseTo((v.far + v.near) / 2, 6);
  });
  it('balayage : intérieur = demi-somme (plus grand), extérieur = demi-différence (plus petit), sur le cercle = moitié', () => {
    const A = R.pointOnCircle(O, 5, 140); const B = R.pointOnCircle(O, 5, 40);
    for (let t = 150; t <= 390; t += 12) {
      const on = R.vertexAngle(O, A, B, R.pointOnCircle(O, 5, t));
      expect(on.rule).toBe('inscribed');
      expect(on.angle).toBeCloseTo(50, 6);
      for (const rho of [0.3, 0.55, 0.8, 0.95]) {
        const v = R.vertexAngle(O, A, B, R.pointOnCircle(O, 5 * rho, t));
        expect(v.rule, `${t} ${rho}`).toBe('half-sum');
        expect(v.angle, `${t} ${rho}`).toBeCloseTo((v.far + v.near) / 2, 6);
        expect(v.angle).toBeGreaterThan(50);
      }
      for (const rho of [1.05, 1.3, 1.6]) {
        const v = R.vertexAngle(O, A, B, R.pointOnCircle(O, 5 * rho, t));
        expect(v.rule, `${t} ${rho}`).toBe('half-difference');
        expect(v.angle, `${t} ${rho}`).toBeCloseTo((v.far - v.near) / 2, 6);
        expect(v.angle).toBeLessThan(50);
      }
    }
  });
});
