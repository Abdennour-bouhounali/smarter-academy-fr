import { describe, it, expect } from 'vitest';
import {
  SQUARE, INVERSE, ABS, imageOf, antecedentsOf, curvePieces, symmetryOf, variationOn, compareImages, orderAt,
  squareBelowAbs, signOf, domainText, R_STAR, LAB_RANGE, INVERSE_RANGE, SQUARE_RANGE, imageText,
} from './referenceUtils';

describe('images et domaines', () => {
  it('0 n’a pas d’inverse ; les autres images sont exactes', () => {
    expect(imageOf(INVERSE, 0)).toBeNull(); expect(imageOf(INVERSE, 0.25)).toBe(4); expect(imageOf(INVERSE, -2)).toBe(-0.5);
    expect(imageOf(SQUARE, -3)).toBe(9); expect(imageOf(ABS, -3)).toBe(3); expect(imageOf(ABS, 0)).toBe(0);
    expect(domainText(R_STAR)).toContain('ℝ*'); expect(imageText(INVERSE, 0)).toBe('g(0) n’existe pas');
  });
});
describe('antécédents', () => {
  it('carré : deux, un, aucun ; inverse : un ; valeur absolue : deux', () => {
    expect(antecedentsOf(SQUARE, 4, SQUARE_RANGE)).toEqual([-2, 2]);
    expect(antecedentsOf(SQUARE, 0, SQUARE_RANGE)).toEqual([0]);
    expect(antecedentsOf(SQUARE, -1, SQUARE_RANGE)).toEqual([]);
    expect(antecedentsOf(INVERSE, 2, INVERSE_RANGE)).toEqual([0.5]);
    expect(antecedentsOf(INVERSE, 0, INVERSE_RANGE)).toEqual([]);
    expect(antecedentsOf(ABS, 3, LAB_RANGE)).toEqual([-3, 3]);
  });
});
describe('propriétés calculées', () => {
  it('symétries', () => {
    expect(symmetryOf(SQUARE)).toBe('axe'); expect(symmetryOf(ABS)).toBe('axe'); expect(symmetryOf(INVERSE)).toBe('centre');
  });
  it('variations', () => {
    expect(variationOn(SQUARE, -4, 0)).toBe('decroissante'); expect(variationOn(SQUARE, 0, 4)).toBe('croissante'); expect(variationOn(SQUARE, -1, 1)).toBeNull();
    expect(variationOn(INVERSE, 0.5, 4)).toBe('decroissante'); expect(variationOn(INVERSE, -4, -0.5)).toBe('decroissante'); expect(variationOn(INVERSE, -1, 1)).toBeNull();
    expect(variationOn(ABS, -4, 0)).toBe('decroissante'); expect(variationOn(ABS, 0, 4)).toBe('croissante');
  });
  it('comparaisons et pièges', () => {
    expect(compareImages(SQUARE, -3, -2)).toBe('>');     // a < b < 0 ⇒ a² > b²
    expect(compareImages(SQUARE, 2, 3)).toBe('<');
    expect(compareImages(INVERSE, -1, 1)).toBe('<');     // −1 < 1 et 1/(−1) < 1/1 : pas décroissante sur ℝ*
    expect(compareImages(INVERSE, 1, 2)).toBe('>');
    expect(orderAt(0.5)).toEqual(['x²', '|x|', '1/x']);
    expect(orderAt(2)).toEqual(['1/x', '|x|', 'x²']);
    expect(squareBelowAbs(0.5)).toBe(true); expect(squareBelowAbs(2)).toBe(false); expect(squareBelowAbs(-1)).toBe(true);
    expect(signOf(INVERSE, -2)).toBe('−'); expect(signOf(SQUARE, -2)).toBe('+'); expect(signOf(ABS, 0)).toBe('0');
  });
  it('les morceaux de l’hyperbole sont deux, et restent dans le cadre', () => {
    const pcs = curvePieces(INVERSE, INVERSE_RANGE);
    expect(pcs.length).toBe(2);
    expect(pcs.every((pc) => pc.every((p) => p.y >= -4 && p.y <= 4))).toBe(true);
    expect(curvePieces(SQUARE, SQUARE_RANGE).length).toBe(1);
  });
});
