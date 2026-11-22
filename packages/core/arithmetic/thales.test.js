import { describe, it, expect } from 'vitest';
import { fracText, frac } from './linear.js';
import {
  ratio, thalesRatios, fourthProportional, crossEqual, scale, imageLengths, areaFactor,
  converse, parallelPartner, divisionFractions, ratioPoint, signedPosition, constructedLength, reportFor,
  heightFromShadow, cylinderInCone, thalesText, thalesLatex, rounded,
} from './thales.js';

const T = (p) => fracText(p);

describe('thales — خاصية طالس (unité 9, docs/sources/4am/unit9/extraction.json)', () => {
  it('نشاط 1 الحالة الأولى : AC′ = 56/15 et B′C′ = 244/75', () => {
    const k = ratio('3,2', 6);
    expect(T(k)).toBe('8/15');
    expect(T(fourthProportional(6, 7, '3,2'))).toBe('56/15');
    expect(T(fourthProportional(6, '6,1', '3,2'))).toBe('244/75');
    expect(rounded(fourthProportional(6, 7, '3,2'), 2)).toBe('3,73');
  });
  it('نشاط 1 الحالة الثانية : k = 1/2, AC′ = 2,25, B′C′ = 1,5', () => {
    const { k, kind } = scale('3,2', '1,6');
    expect(T(k)).toBe('1/2');
    expect(kind).toBe('reduction');
    expect(imageLengths(k, ['4,5', 3]).map((x) => thalesText(x))).toEqual(['2,25', '1,5']);
  });
  it('معارف ملاحظة 1 : AM/AB = 2/3 ≠ AN/AC = 1/2', () => {
    const r = thalesRatios({ AM: 2, AB: 3, AN: 1, AC: 2 });
    expect(r.equal).toBe(false);
    expect(T(r.AB)).toBe('2/3');
  });
  it('أستعدّ 1 et 4 ; طرائق حساب أطوال (DN = 2,5) ; دوري الآن ص 107 (EW = 3,15)', () => {
    expect(T(fourthProportional(3, 4, '1,5'))).toBe('2');
    expect(T(fourthProportional(6, 9, 8))).toBe('12');
    expect(thalesText(fourthProportional(2, 1, 5))).toBe('2,5');
    expect(thalesText(fourthProportional('3,75', '2,25', '5,25'))).toBe('3,15');
  });
  it('أوظّف 2, 4, 5, 6, 8, 9', () => {
    expect(T(fourthProportional(9, 10, '4,5'))).toBe('5');
    expect(T(fourthProportional(3, 5, 2))).toBe('10/3');
    expect(rounded(fourthProportional(3, 5, 4), 1)).toBe('6,7');
    expect(scale('1,3', '3,9').kind).toBe('enlargement');
    expect(T(scale(12, 8).k)).toBe('2/3');
    expect(T(fourthProportional(9, 15, 6))).toBe('10');
    expect(thalesText(fourthProportional(2, '3,3', '4,5'))).toBe('7,425');
  });
  it('طرائق ص 109 : produits en croix 6,3 = 6,3 et 16 ≠ 16,1', () => {
    expect(crossEqual('3,5', '1,5', '4,2', '1,8')).toBe(true);
    expect(crossEqual('3,2', '4,6', '3,5', 5)).toBe(false);
  });
  it('تعميق 21 : l’aire est multipliée par k²', () => {
    expect(T(areaFactor(frac(2, 3)))).toBe('4/9');
  });
});

describe('thales — الخاصية العكسية : rapports ET ordre', () => {
  it('نشاط 2 : les trois figures (1/3)', () => {
    expect(converse({ b: 3, bp: -1, c: 3, cp: -1 }).parallel).toBe(true);   // الشكل 1
    expect(converse({ b: 3, bp: 1, c: 3, cp: 1 }).parallel).toBe(true);     // الشكل 2
    const f3 = converse({ b: 3, bp: 1, c: 3, cp: -1 });                      // الشكل 3
    expect(f3).toMatchObject({ ratiosEqual: true, sameOrder: false, parallel: false, reason: 'order' });
  });
  it('rapports différents : reason = ratios', () => {
    expect(converse({ b: 4, bp: 3, c: 5, cp: 4 }).reason).toBe('ratios');  // أوظّف 7
  });
  it('مثال ص 108 et أوظّف 10–15', () => {
    expect(converse({ b: '2,4', bp: -3, c: 4, cp: -5 }).parallel).toBe(true);
    expect(converse({ b: 3, bp: -2, c: 6, cp: -4 }).parallel).toBe(true);
    expect(converse({ b: 36, bp: 16, c: 45, cp: 20 }).parallel).toBe(true);
    expect(converse({ b: 10, bp: 2, c: 15, cp: 3 }).parallel).toBe(true);
  });
  it('parallelPartner donne le C′ du parallèle', () => {
    expect(T(parallelPartner({ b: 6, bp: '3,2', c: 7 }))).toBe('56/15');
    expect(T(parallelPartner({ b: 3, bp: -1, c: 6 }))).toBe('-2');
  });
});

describe('thales — partages et constructions', () => {
  it('partage en n parts égales', () => {
    expect(divisionFractions(3).map(T)).toEqual(['1/3', '2/3']);
    expect(() => divisionFractions(1)).toThrow();
  });
  it('MA/MB = 3/2 ⇒ AM/AB = 3/5 ; CA/CB = 2/5 ⇒ 2/7 ou −2/3 ; PM/PN = 11/7', () => {
    expect(T(ratioPoint(3, 2))).toBe('3/5');
    expect(T(ratioPoint(2, 5))).toBe('2/7');
    expect(T(ratioPoint(2, 5, false))).toBe('-2/3');
    expect(T(ratioPoint(11, 7))).toBe('11/18');
    expect(T(ratioPoint(11, 7, false))).toBe('11/4');
    expect(T(signedPosition(frac(4, 9), false))).toBe('-4/9');
  });
  it('3/7 = 2/AB ⇒ AB = 14/3 ; reportFor', () => {
    expect(T(constructedLength(3, 7, 2))).toBe('14/3');
    expect(reportFor(frac(14, 3))).toMatchObject({ a: 3, b: 14, c: 1 });
  });
});

describe('thales — أدمج تعلّماتي', () => {
  it('تحدّ : la minaret mesure 7,25 m', () => {
    expect(thalesText(heightFromShadow({ stick: 1, stickAt: 10, tip: '11,6' }))).toBe('7,25');
  });
  it('الوضعية : r = h = 4,5 et V = 729/8 π', () => {
    const c = cylinderInCone({ H: 18, R: 6 });
    expect(thalesText(c.equalHR.r)).toBe('4,5');
    expect(T(c.equalHR.volumeOverPi)).toBe('729/8');
    expect(T(c.radiusFor(9))).toBe('3');
    expect(T(c.heightFor(3))).toBe('9');
    expect(T(c.volumeOverPi(3, 9))).toBe('81');
  });
  it('écritures', () => {
    expect(thalesLatex(frac(56, 15))).toBe('\\dfrac{56}{15}');
    expect(thalesLatex(frac(9, 2))).toBe('4{,}5');
  });
});
