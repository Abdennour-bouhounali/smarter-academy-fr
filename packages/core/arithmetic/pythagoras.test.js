import { describe, it, expect } from 'vitest';
import * as P from './pythagoras.js';
import { frac, eq } from './linear.js';

/* Les nombres sont ceux du manuel 3AM, unité 11 (pp. 167–177), et ceux du labo pythagoras-tanks. */
describe('pythagoras — carrés, côtés, racines, nature', () => {
  it('carrés exacts de décimaux', () => {
    expect(P.decText(P.square('3,7'))).toBe('13,69');
    expect(P.decText(P.hypotenuseSquare('3,2', '2,4'))).toBe('16');
    expect(P.decText(P.hypotenuseSquare(3, 4))).toBe('25');
  });

  it('côté inconnu : hypoténuse en ajoutant, côté de l’angle droit en soustrayant', () => {
    expect(P.sideFrom({ legs: ['5', '12'] }).text).toBe('13');
    expect(P.sideFrom({ legs: ['0,7', '2,4'] }).text).toBe('2,5');
    expect(P.sideFrom({ legs: ['3,6', '7,7'] }).text).toBe('8,5');
    expect(P.sideFrom({ hyp: '7,3', leg: '5,5' }).text).toBe('4,8');
    expect(P.sideFrom({ hyp: '9,7', leg: '6,5' }).text).toBe('7,2');
    const s21 = P.sideFrom({ hyp: '5', leg: '2' });
    expect(P.decText(s21.square)).toBe('21');
    expect(s21.exact).toBeNull();
    expect(s21.text).toBe('√21');
    expect(s21.rounded(2)).toBe('4,58');
    expect(P.sideFrom({ hyp: '2', leg: '3' })).toBeNull();
    expect(P.sideFrom({ legs: [2, 3] }).text).toBe('√13');
  });

  it('racines arrondies au plus proche, tronquées, et l’écran de la calculatrice', () => {
    expect(P.roundedSqrt(frac(13), 2)).toBe('3,61');
    expect(P.truncatedSqrt(frac(13), 2)).toBe('3,60');
    expect(P.roundedSqrt(frac(13), 1)).toBe('3,6');
    expect(P.roundedSqrt(frac(18), 1)).toBe('4,2');
    expect(P.roundedSqrt(frac(12), 1)).toBe('3,5');
    expect(P.roundedSqrt(frac(575, 100), 1)).toBe('2,4');
    expect(P.roundedSqrt(frac(26), 3)).toBe('5,099');
    expect(P.screenSqrt(frac(21))).toBe('4,582575695');
    expect(P.screenSqrt(frac(13))).toBe('3,605551275');
    expect(P.screenSqrt(frac(169))).toBe('13');
    expect(P.roundedFrac(frac(13, 1), 2)).toBe('13,00');
    // balayage : l'arrondi entier coïncide avec Math.round sur √n pour n ≤ 2000 (aucun cas limite à ,5 exact)
    for (let n = 1; n <= 2000; n += 1) {
      expect(P.roundedSqrt(frac(n), 2), String(n)).toBe((Math.round(Math.sqrt(n) * 100) / 100).toFixed(2).replace('.', ','));
    }
  });

  it('nature : la contraposée (non rectangle) et les cas « presque »', () => {
    const kjl = P.nature('5,7', '7,6', '9,4');
    expect(kjl.right).toBe(false);
    expect(kjl.kind).toBe('acute');
    expect(P.decText(kjl.square)).toBe('88,36');
    expect(P.decText(kjl.sum)).toBe('90,25');
    expect(P.nature('3,5', '5,5', '6,5')).toMatchObject({ right: false, kind: 'acute' });
    expect(P.nature(4, 5, 7)).toMatchObject({ right: false, kind: 'obtuse' });
    expect(P.nature('6,3', '6,1', '8,7').right).toBe(false);
    expect(P.nature(70, 24, 74).right).toBe(true);
    expect(P.nature('4,2', '5,6', 7).right).toBe(true);
    expect(eq(P.nature(5, 7, 9).square, frac(81))).toBe(true);
    expect(P.isTriangle(5, 12, 17)).toBe(false);
    expect(P.isTriangle(5, 12, 16)).toBe(true);
  });

  it('versement : exact à 90° seulement, débordement si aigu, vide si obtus', () => {
    expect(P.angleVerdict(90)).toBe('exact');
    for (let d = 30; d <= 150; d += 1) {
      const v = P.angleVerdict(d);
      const cap = P.capAtAngle(3, 4, d);
      if (d < 90) { expect(v).toBe('over'); expect(cap).toBeLessThan(25); }
      if (d > 90) { expect(v).toBe('gap'); expect(cap).toBeGreaterThan(25); }
    }
    expect(P.capAtAngle(3, 4, 90)).toBe(25);
    expect(P.pourVerdict(0)).toBe('exact');
  });
});
