import { describe, it, expect } from 'vitest';
import {
  vecFromPoints, det, areCollinear, collinearityRatio, compareDirections, pointsAligned, linesParallel,
  yForAlignment, detExpression, detText, railEndpoints, fitRange, formatVec, parseSigned, scaleVec,
} from './colinUtils';

describe('colinéarité et alignement — modèle', () => {
  it('det(u, v) = x y′ − y x′, exact sur les entiers et les demis', () => {
    expect(det({ x: 2, y: 1 }, { x: 6, y: 3 })).toBe(0);
    expect(det({ x: 3, y: 5 }, { x: 2, y: 4 })).toBe(2);
    expect(det({ x: 2, y: -3 }, { x: -1.5, y: 1 })).toBe(-2.5);
    expect(det({ x: 3, y: 1 }, { x: 4, y: 1 })).toBe(-1);
  });
  it('colinéaires ⟺ det = 0 ; le vecteur nul est colinéaire à tout vecteur', () => {
    expect(areCollinear({ x: 2, y: 1 }, { x: -6, y: -3 })).toBe(true);
    expect(areCollinear({ x: 2, y: 1 }, { x: 4, y: 3 })).toBe(false);
    expect(areCollinear({ x: 4, y: 0 }, { x: 6, y: 0 })).toBe(true);
    expect(areCollinear({ x: 0, y: 0 }, { x: 5, y: -2 })).toBe(true);
  });
  it('k tel que v = k·u, y compris pour une coordonnée nulle', () => {
    expect(collinearityRatio({ x: 2, y: 1 }, { x: -6, y: -3 })).toBe(-3);
    expect(collinearityRatio({ x: 2, y: -3 }, { x: -5, y: 7.5 })).toBe(-2.5);
    expect(collinearityRatio({ x: 4, y: 0 }, { x: 6, y: 0 })).toBe(1.5);
    expect(collinearityRatio({ x: 0, y: 3 }, { x: 0, y: -1.5 })).toBe(-0.5);
    expect(collinearityRatio({ x: 2, y: 1 }, { x: 4, y: 3 })).toBeNull();
    expect(collinearityRatio({ x: 0, y: 0 }, { x: 4, y: 3 })).toBeNull();
    expect(scaleVec({ x: 2, y: 1 }, -1.5)).toEqual({ x: -3, y: -1.5 });
  });
  it('direction, sens et longueur sont jugés séparément', () => {
    const u = { x: 2, y: 1 };
    expect(compareDirections(u, { x: 4, y: 2 })).toMatchObject({ direction: true, sens: 'meme', longueur: false, k: 2 });
    expect(compareDirections(u, { x: -2, y: -1 })).toMatchObject({ direction: true, sens: 'contraire', longueur: true, k: -1 });
    expect(compareDirections(u, { x: 1, y: 2 })).toMatchObject({ direction: false, sens: null, longueur: true, k: null });
    expect(compareDirections(u, { x: 0, y: 0 }).direction).toBeNull();
  });
  it('alignés ⟺ AB et AC colinéaires — des deux côtés de A, et le presque-aligné est refusé', () => {
    const A = { x: -3, y: -1 }; const B = { x: 1, y: 1 };
    for (const C of [{ x: -5, y: -2 }, { x: -1, y: 0 }, { x: 3, y: 2 }, { x: 5, y: 3 }]) expect(pointsAligned(A, B, C), formatVec(C)).toBe(true);
    expect(pointsAligned(A, B, { x: 5, y: 4 })).toBe(false);
    expect(pointsAligned({ x: 0, y: 1 }, { x: 2, y: 2 }, { x: 5, y: 4 })).toBe(false);
  });
  it('(AB) ∥ (CD) ⟺ AB et CD colinéaires, même de sens contraire', () => {
    expect(linesParallel({ x: -4, y: -2 }, { x: -1, y: 0 }, { x: 3, y: 1 }, { x: -3, y: -3 })).toBe(true);
    expect(linesParallel({ x: -4, y: -2 }, { x: -3, y: -3 }, { x: -1, y: 0 }, { x: 3, y: 1 })).toBe(false);
    expect(linesParallel({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(false);
  });
  it('résout det(AB, AC) = 0 en y', () => {
    expect(yForAlignment({ x: 0, y: 0 }, { x: 2, y: 3 }, 6)).toBe(9);
    expect(yForAlignment({ x: -4, y: -3 }, { x: -1, y: -1 }, 5)).toBe(3);
    expect(yForAlignment({ x: 1, y: 0 }, { x: 1, y: 4 }, 3)).toBeNull();
    expect(vecFromPoints({ x: 1, y: 2 }, { x: 4, y: -1 })).toEqual({ x: 3, y: -3 });
  });
  it('écrit le déterminant à la française, négatifs parenthésés', () => {
    expect(detExpression({ x: 2, y: 1 }, { x: 6, y: 3 })).toBe('2 × 3 − 1 × 6');
    expect(detText({ x: 2, y: 1 }, { x: 6, y: 3 })).toBe('2 × 3 − 1 × 6 = 6 − 6 = 0');
    expect(detText({ x: 3, y: -1 }, { x: 9, y: -4 })).toBe('3 × (−4) − (−1) × 9 = −12 − (−9) = −3');
    expect(formatVec({ x: -1.5, y: 2 })).toBe('(−1,5 ; 2)');
    expect(parseSigned('−2,5')).toBe(-2.5);
  });
  it('le rail est coupé au cadre, dans toutes les directions', () => {
    const R = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
    const O = { x: 0, y: 0 };
    const eps = 1e-9;
    for (let dx = -6; dx <= 6; dx += 1) for (let dy = -6; dy <= 6; dy += 1) {
      if (dx === 0 && dy === 0) { expect(railEndpoints(O, { x: 0, y: 0 }, R)).toBeNull(); continue; }
      const r = railEndpoints(O, { x: dx, y: dy }, R);
      for (const p of [r.from, r.to]) {
        expect(p.x).toBeGreaterThanOrEqual(R.xMin - eps); expect(p.x).toBeLessThanOrEqual(R.xMax + eps);
        expect(p.y).toBeGreaterThanOrEqual(R.yMin - eps); expect(p.y).toBeLessThanOrEqual(R.yMax + eps);
        // Le point est sur le rail : det(d, P) = 0.
        expect(Math.abs(dx * p.y - dy * p.x)).toBeLessThan(1e-6);
      }
      // Et il touche bien un bord de chaque côté.
      const onEdge = (p) => Math.abs(Math.abs(p.x) - 6) < eps || Math.abs(Math.abs(p.y) - 6) < eps;
      expect(onEdge(r.from) && onEdge(r.to)).toBe(true);
    }
  });
  it('le cadre contient la figure et l’origine, jamais moins que ±min', () => {
    expect(fitRange([{ x: 2, y: 1 }, { x: 3, y: 3 }])).toEqual({ xMin: -4, xMax: 4, yMin: -4, yMax: 4 });
    expect(fitRange([{ x: 7, y: -8 }], { min: 5 })).toEqual({ xMin: -5, xMax: 8, yMin: -9, yMax: 5 });
  });
});
